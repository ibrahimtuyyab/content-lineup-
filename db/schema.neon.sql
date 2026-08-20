-- ContentLineup content database — Neon / Postgres.
--
-- Applied by:  npm run neon:setup
--
-- Differences from the Supabase schema: no Row Level Security and no anon role.
-- Neon is reached with a single connection string used server-side at build
-- time, so there is no untrusted client to defend against — the publishing rule
-- lives in the query instead (see live_posts below), not in a policy.
--
-- Safe to re-run: every object is IF NOT EXISTS, replaced, or dropped first.

create table if not exists authors (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,
  name        text        not null,
  email       text,
  bio         text,
  url         text,
  created_at  timestamptz not null default now()
);

create table if not exists categories (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,
  label       text        not null,
  singular    text        not null,
  sort        integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- status mirrors the product's own queue:
--   draft      -> never built
--   scheduled  -> built once published_at has passed
--   published  -> always built
create table if not exists posts (
  id               bigint generated always as identity primary key,
  slug             text        not null unique,
  category_id      bigint      not null references categories(id) on delete restrict,
  author_id        bigint      not null references authors(id)    on delete restrict,

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

create index if not exists idx_posts_status   on posts (status, published_at desc);
create index if not exists idx_posts_category on posts (category_id);
create index if not exists idx_posts_featured on posts (featured) where featured;

create table if not exists post_keywords (
  id       bigint generated always as identity primary key,
  post_id  bigint  not null references posts(id) on delete cascade,
  keyword  text    not null,
  position integer not null default 0,
  unique (post_id, keyword)
);

create index if not exists idx_keywords_post on post_keywords (post_id, position);

create table if not exists post_faqs (
  id       bigint generated always as identity primary key,
  post_id  bigint  not null references posts(id) on delete cascade,
  question text    not null,
  answer   text    not null,
  position integer not null default 0
);

create index if not exists idx_faqs_post on post_faqs (post_id, position);

create table if not exists post_revisions (
  id         bigint generated always as identity primary key,
  post_id    bigint      not null references posts(id) on delete cascade,
  title      text        not null,
  body       text        not null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_revisions_post on post_revisions (post_id, created_at desc);

-- Additive migrations, for databases created before a field existed.
alter table posts add column if not exists list_items jsonb;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on posts;
create trigger posts_touch_updated_at
  before update on posts
  for each row execute function touch_updated_at();

-- History is captured in the database so it cannot be bypassed by whichever
-- client made the edit.
create or replace function snapshot_post_revision()
returns trigger language plpgsql as $$
begin
  if (old.body is distinct from new.body) or (old.title is distinct from new.title) then
    insert into post_revisions (post_id, title, body, note)
    values (old.id, old.title, old.body, 'Auto-snapshot before update');
  end if;
  return new;
end;
$$;

drop trigger if exists posts_snapshot_revision on posts;
create trigger posts_snapshot_revision
  before update on posts
  for each row execute function snapshot_post_revision();

-- ---------------------------------------------------------------------------
-- Views the build reads from
-- ---------------------------------------------------------------------------
drop view if exists v_posts;
create view v_posts as
select
  p.*,
  c.slug     as category_slug,
  c.label    as category_label,
  c.singular as category_singular,
  a.name     as author_name,
  a.slug     as author_slug,
  '/resources/' || c.slug || '/' || p.slug as path
from posts p
join categories c on c.id = p.category_id
join authors    a on a.id = p.author_id;

-- The publishing rule, expressed once. On Supabase this is an RLS policy; here
-- it is a view, so the build cannot accidentally publish a draft either way.
drop view if exists live_posts;
create view live_posts as
select * from v_posts
where status = 'published'
   or (status = 'scheduled' and published_at is not null and published_at <= current_date);

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
insert into categories (slug, label, singular, sort) values
  ('guides',          'Guides',          'Guide',          1),
  ('case-studies',    'Case studies',    'Case study',     2),
  ('comparisons',     'Comparisons',     'Comparison',     3),
  ('product-updates', 'Product updates', 'Product update', 4)
on conflict (slug) do update
  set label = excluded.label, singular = excluded.singular, sort = excluded.sort;
