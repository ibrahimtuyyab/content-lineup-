-- ContentLineup content database — Supabase / Postgres.
--
-- Paste this whole file into the Supabase SQL Editor and run it, or apply it
-- with:  npm run db:push -- --schema
--
-- Safe to re-run: every object is created IF NOT EXISTS or replaced.
--
-- Row Level Security is where the publishing rule actually lives. The anon key
-- can only ever read posts that are genuinely live, so a draft cannot leak even
-- if the key does.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.authors (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,
  name        text        not null,
  email       text,
  bio         text,
  url         text,
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,   -- 'guides' → /resources/guides/…
  label       text        not null,          -- 'Guides' → filter button
  singular    text        not null,          -- 'Guide'  → card chip
  sort        integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- status mirrors the product's own queue:
--   draft      → never built
--   scheduled  → built once published_at has passed
--   published  → always built
create table if not exists public.posts (
  id               bigint generated always as identity primary key,
  slug             text        not null unique,
  category_id      bigint      not null references public.categories(id) on delete restrict,
  author_id        bigint      not null references public.authors(id)    on delete restrict,

  title            text        not null,
  meta_title       text        not null,
  description      text        not null,
  excerpt          text        not null,

  body             text        not null,
  body_format      text        not null default 'html'
                     check (body_format in ('html', 'markdown')),

  primary_keyword  text,
  thumb_screen     text        not null default 'list',
  read_mins        integer     not null default 5,
  featured         boolean     not null default false,

  status           text        not null default 'draft'
                     check (status in ('draft', 'scheduled', 'published')),
  published_at     date,
  modified_at      date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  list_items       jsonb,
  notes            text
);

create index if not exists idx_posts_status   on public.posts (status, published_at desc);
create index if not exists idx_posts_category on public.posts (category_id);
create index if not exists idx_posts_featured on public.posts (featured) where featured;

create table if not exists public.post_keywords (
  id       bigint generated always as identity primary key,
  post_id  bigint  not null references public.posts(id) on delete cascade,
  keyword  text    not null,
  position integer not null default 0,
  unique (post_id, keyword)
);

create index if not exists idx_keywords_post on public.post_keywords (post_id, position);

create table if not exists public.post_faqs (
  id       bigint generated always as identity primary key,
  post_id  bigint  not null references public.posts(id) on delete cascade,
  question text    not null,
  answer   text    not null,
  position integer not null default 0
);

create index if not exists idx_faqs_post on public.post_faqs (post_id, position);

create table if not exists public.post_revisions (
  id         bigint generated always as identity primary key,
  post_id    bigint      not null references public.posts(id) on delete cascade,
  title      text        not null,
  body       text        not null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_revisions_post on public.post_revisions (post_id, created_at desc);

-- Additive column migrations, for projects created before a field existed.
alter table public.posts add column if not exists list_items jsonb;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Keep updated_at honest without the application having to remember.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- Snapshot the previous body before it is overwritten, so an edit is never
-- lossy no matter which client made it — admin UI, CLI, or the Supabase table
-- editor. Doing this in the database rather than the app means history cannot
-- be bypassed.
create or replace function public.snapshot_post_revision()
returns trigger
language plpgsql
as $$
begin
  if (old.body is distinct from new.body) or (old.title is distinct from new.title) then
    insert into public.post_revisions (post_id, title, body, note)
    values (old.id, old.title, old.body, 'Auto-snapshot before update');
  end if;
  return new;
end;
$$;

drop trigger if exists posts_snapshot_revision on public.posts;
create trigger posts_snapshot_revision
  before update on public.posts
  for each row execute function public.snapshot_post_revision();

-- ---------------------------------------------------------------------------
-- View the site builds from
-- ---------------------------------------------------------------------------
-- Dropped rather than replaced: "create or replace view" refuses to run if the
-- column list ever changes, which would make this script non-re-runnable.
drop view if exists public.v_posts;
create view public.v_posts
with (security_invoker = true) as
select
  p.*,
  c.slug     as category_slug,
  c.label    as category_label,
  c.singular as category_singular,
  a.name     as author_name,
  a.slug     as author_slug,
  '/resources/' || c.slug || '/' || p.slug as path
from public.posts p
join public.categories c on c.id = p.category_id
join public.authors    a on a.id = p.author_id;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The publishing rule is enforced here, not in application code: the anon key
-- can only read posts that are actually live. Writes require the service role,
-- which must never leave your machine or your CI secrets.
-- ---------------------------------------------------------------------------
alter table public.authors        enable row level security;
alter table public.categories     enable row level security;
alter table public.posts          enable row level security;
alter table public.post_keywords  enable row level security;
alter table public.post_faqs      enable row level security;
alter table public.post_revisions enable row level security;

-- Live posts only.
drop policy if exists "anon reads live posts" on public.posts;
create policy "anon reads live posts"
  on public.posts for select
  to anon, authenticated
  using (
    status = 'published'
    or (status = 'scheduled' and published_at is not null and published_at <= current_date)
  );

-- Child rows follow their parent's visibility.
drop policy if exists "anon reads keywords of live posts" on public.post_keywords;
create policy "anon reads keywords of live posts"
  on public.post_keywords for select
  to anon, authenticated
  using (exists (
    select 1 from public.posts p
    where p.id = post_id
      and (p.status = 'published'
        or (p.status = 'scheduled' and p.published_at is not null and p.published_at <= current_date))
  ));

drop policy if exists "anon reads faqs of live posts" on public.post_faqs;
create policy "anon reads faqs of live posts"
  on public.post_faqs for select
  to anon, authenticated
  using (exists (
    select 1 from public.posts p
    where p.id = post_id
      and (p.status = 'published'
        or (p.status = 'scheduled' and p.published_at is not null and p.published_at <= current_date))
  ));

-- Reference data is public; it carries nothing sensitive.
drop policy if exists "anon reads categories" on public.categories;
create policy "anon reads categories"
  on public.categories for select to anon, authenticated using (true);

drop policy if exists "anon reads authors" on public.authors;
create policy "anon reads authors"
  on public.authors for select to anon, authenticated using (true);

-- Revisions are editorial history — no anon policy, so they are service-role only.

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
insert into public.categories (slug, label, singular, sort) values
  ('guides',          'Guides',          'Guide',          1),
  ('case-studies',    'Case studies',    'Case study',     2),
  ('comparisons',     'Comparisons',     'Comparison',     3),
  ('product-updates', 'Product updates', 'Product update', 4)
on conflict (slug) do update
  set label = excluded.label, singular = excluded.singular, sort = excluded.sort;
