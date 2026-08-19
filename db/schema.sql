-- ContentLineup content database.
--
-- One SQLite file (data/content.db) holds every article, its author, category,
-- keywords and FAQ block. The static build reads from here, so adding a post to
-- this database is all it takes for it to appear on the site, in the category
-- filter, the sitemap, the RSS feed and the related-posts logic.
--
-- Applied by: node db/migrate.mjs

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------------
-- Authors
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS authors (
  id          INTEGER PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  email       TEXT,
  bio         TEXT,
  url         TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- --------------------------------------------------------------------------
-- Categories — drive the /resources/<slug>/ URL segment and the hub filter
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,   -- 'guides'      → /resources/guides/…
  label       TEXT    NOT NULL,          -- 'Guides'      → filter button
  singular    TEXT    NOT NULL,          -- 'Guide'       → the chip on a card
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- --------------------------------------------------------------------------
-- Posts
--
-- status mirrors the product's own queue so the site behaves the way the
-- marketing copy claims:
--   draft      → never built
--   scheduled  → built once published_at has passed
--   published  → always built
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id               INTEGER PRIMARY KEY,
  slug             TEXT    NOT NULL UNIQUE,
  category_id      INTEGER NOT NULL REFERENCES categories(id),
  author_id        INTEGER NOT NULL REFERENCES authors(id),

  title            TEXT    NOT NULL,           -- the <h1>
  meta_title       TEXT    NOT NULL,           -- the <title>
  description      TEXT    NOT NULL,           -- meta description, aim 70–165 chars
  excerpt          TEXT    NOT NULL,           -- card blurb + article standfirst

  body             TEXT    NOT NULL,           -- HTML, may contain shortcodes
  body_format      TEXT    NOT NULL DEFAULT 'html'
                     CHECK (body_format IN ('html', 'markdown')),

  primary_keyword  TEXT,
  thumb_screen     TEXT    NOT NULL DEFAULT 'list',  -- id from src/lib/screens.mjs
  read_mins        INTEGER NOT NULL DEFAULT 5,
  featured         INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),

  status           TEXT    NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'scheduled', 'published')),
  published_at     TEXT,                       -- YYYY-MM-DD (or ISO datetime)
  modified_at      TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),

  list_items       TEXT,                       -- JSON array for ItemList schema on list articles
  notes            TEXT                        -- internal, never rendered
);

CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured  ON posts(featured) WHERE featured = 1;

-- Keep updated_at honest without the application having to remember.
CREATE TRIGGER IF NOT EXISTS posts_touch_updated_at
AFTER UPDATE ON posts
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE posts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- --------------------------------------------------------------------------
-- Secondary target keywords (the primary one lives on posts)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_keywords (
  id       INTEGER PRIMARY KEY,
  post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  keyword  TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE (post_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_keywords_post ON post_keywords(post_id, position);

-- --------------------------------------------------------------------------
-- Per-post FAQ block — rendered as an accordion and as FAQPage schema
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_faqs (
  id       INTEGER PRIMARY KEY,
  post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT    NOT NULL,
  answer   TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_faqs_post ON post_faqs(post_id, position);

-- --------------------------------------------------------------------------
-- Revision history — every body change is kept, so an edit is never lossy
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_revisions (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  note       TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_revisions_post ON post_revisions(post_id, created_at DESC);

-- --------------------------------------------------------------------------
-- Schema version, so migrate.mjs is safe to re-run
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO meta (key, value) VALUES ('schema_version', '1')
  ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------------------------------
-- Convenience view: everything the build needs for one post, flattened
-- --------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS v_posts AS
SELECT
  p.*,
  c.slug     AS category_slug,
  c.label    AS category_label,
  c.singular AS category_singular,
  a.name     AS author_name,
  a.slug     AS author_slug,
  '/resources/' || c.slug || '/' || p.slug AS path
FROM posts p
JOIN categories c ON c.id = p.category_id
JOIN authors    a ON a.id = p.author_id;
