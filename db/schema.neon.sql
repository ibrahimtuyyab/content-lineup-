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
-- live_posts is built on v_posts, so it has to go first: dropping a view that
-- another view selects from fails outright, which is what stopped this file
-- being re-runnable even though it is written to be.
drop view if exists live_posts;
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
create view live_posts as
select * from v_posts
where status = 'published'
   or (status = 'scheduled' and published_at is not null and published_at <= current_date);

-- ---------------------------------------------------------------------------
-- Pricing plans
--
-- The three plans were hardcoded in src/data/site.mjs, which meant a price
-- change was a code change and a redeploy. They live here instead; the build
-- reads them the same way it reads posts, and falls back to the array in
-- src/data/site.mjs if this table is empty or unreachable.
--
-- What is deliberately NOT stored: the CTA href. Every plan points at the same
-- signup URL, which comes from site.app.signup — one config value, not three
-- copies of it in a database.
-- ---------------------------------------------------------------------------
create table if not exists plans (
  id                bigint generated always as identity primary key,
  slug              text        not null unique,
  name              text        not null,
  sort              integer     not null default 0,

  -- Prices are text, not numeric: '$0' and '/month' are display strings, and
  -- the site never does arithmetic on them. numeric_price carries the bare
  -- number for JSON-LD, where a real figure is required.
  price             text        not null,
  period            text        not null default '/month',
  numeric_price     text        not null default '0',

  -- All four are null together on a plan with no annual option.
  annual_price      text,
  annual_numeric    text,
  annual_per_month  text,
  annual_saving     text,

  kicker            text        not null,
  outcome           text        not null,
  summary           text        not null,
  cta_label         text        not null default 'Start free',
  featured          boolean     not null default false,
  limits            text        not null,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint plans_annual_all_or_nothing check (
    (annual_price is null and annual_numeric is null
      and annual_per_month is null and annual_saving is null)
    or
    (annual_price is not null and annual_numeric is not null
      and annual_per_month is not null and annual_saving is not null)
  )
);

-- One row per bullet in the "what you get" list. A child table rather than a
-- text[] so the admin can reorder and edit single lines.
create table if not exists plan_includes (
  id       bigint generated always as identity primary key,
  plan_id  bigint  not null references plans(id) on delete cascade,
  label    text    not null,
  sort     integer not null default 0
);

create index if not exists plan_includes_plan_idx on plan_includes (plan_id, sort);

-- Exactly one plan may carry the highlight. Enforced here rather than in the
-- admin, so a second featured plan cannot be introduced by any other writer.
create unique index if not exists plans_one_featured
  on plans ((featured)) where featured;

-- touch_updated_at() is already defined above for posts and does exactly this,
-- so plans borrows it rather than declaring a second copy.
drop trigger if exists plans_touch_updated_at on plans;
create trigger plans_touch_updated_at
  before update on plans
  for each row execute function touch_updated_at();

-- The shape the build wants: one row per plan with its bullets already
-- gathered, so reading the pricing table is a single round trip.
drop view if exists v_plans;
create view v_plans as
select
  p.*,
  coalesce(
    (select json_agg(i.label order by i.sort, i.id)
       from plan_includes i
      where i.plan_id = p.id),
    '[]'::json
  ) as includes
from plans p;

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

-- ---------------------------------------------------------------------------
-- Site content blocks
--
-- Everything on the marketing pages that is not a post and not a plan: the
-- nav, the footer, the feature list, the channels, the workflow stages, the
-- audiences, the integrations, the FAQ groups, the comparison matrix, the
-- trust points, the topic clusters, the site config and the cross-page related
-- links. All of it used to be hardcoded in src/data/site.mjs and
-- src/data/links.mjs, which meant a wording fix was a code change.
--
-- One table with a jsonb value rather than a table per content type. The
-- shapes here are deeply nested and irregular — the comparison matrix is a
-- 15-row grid of three-column cells with per-cell notes — so modelling each
-- one relationally would be a dozen tables and a migration every time a
-- section gains a field, for content that is read as a whole document and
-- never queried by its parts.
--
-- A missing row is not a missing value: it means "use the default that ships
-- in the repository". So the defaults stay in src/data/*.defaults.mjs and are
-- the reason a build with no database still renders the real site. Deleting a
-- row is how the admin's "reset to default" works.
create table if not exists content_blocks (
  key         text        primary key,
  value       jsonb       not null,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists content_blocks_touch_updated_at on content_blocks;
create trigger content_blocks_touch_updated_at
  before update on content_blocks
  for each row execute function touch_updated_at();
