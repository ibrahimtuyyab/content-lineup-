// Content database access layer.
//
// Uses Node's built-in node:sqlite (Node 22.5+), so the project still installs
// nothing. DatabaseSync is synchronous, which is exactly what a static build
// wants — no async plumbing through the page renderers.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
export const DB_PATH = process.env.CONTENT_DB || join(ROOT, 'data', 'content.db');
const SCHEMA_PATH = join(ROOT, 'db', 'schema.sql');

let _db = null;

/** Open (and lazily create) the database. */
export function db() {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  _db = new DatabaseSync(DB_PATH);
  _db.exec('PRAGMA foreign_keys = ON');
  return _db;
}

/** Apply schema.sql. Safe to run repeatedly — every statement is IF NOT EXISTS. */
export function migrate() {
  db().exec(readFileSync(SCHEMA_PATH, 'utf8'));
  return db().prepare(`SELECT value FROM meta WHERE key = 'schema_version'`).get()?.value;
}

/** SQLite lacks "add column if not exists"; check the table info first. */
export function addMissingColumns() {
  const wanted = [{ table: 'posts', name: 'list_items', ddl: 'TEXT' }];
  const added = [];
  for (const col of wanted) {
    const cols = db().prepare(`PRAGMA table_info(${col.table})`).all();
    if (!cols.length) continue;
    if (!cols.some((c) => c.name === col.name)) {
      db().exec(`ALTER TABLE ${col.table} ADD COLUMN ${col.name} ${col.ddl}`);
      added.push(`${col.table}.${col.name}`);
    }
  }
  return added;
}

export const isInitialised = () =>
  existsSync(DB_PATH) &&
  !!db().prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='posts'`).get();

export const close = () => {
  if (_db) _db.close();
  _db = null;
};

/* -------------------------------------------------------------------------
   Reference data
   ------------------------------------------------------------------------- */
export const allCategories = () =>
  db().prepare(`SELECT * FROM categories ORDER BY sort, label`).all();

export const categoryBySlug = (slug) =>
  db().prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug);

export const allAuthors = () => db().prepare(`SELECT * FROM authors ORDER BY name`).all();

export const authorBySlug = (slug) =>
  db().prepare(`SELECT * FROM authors WHERE slug = ?`).get(slug);

export function upsertAuthor({ slug, name, email = null, bio = null, url = null }) {
  db()
    .prepare(
      `INSERT INTO authors (slug, name, email, bio, url) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (slug) DO UPDATE SET name = excluded.name, email = excluded.email,
         bio = excluded.bio, url = excluded.url`
    )
    .run(slug, name, email, bio, url);
  return authorBySlug(slug);
}

export function upsertCategory({ slug, label, singular, sort = 0 }) {
  db()
    .prepare(
      `INSERT INTO categories (slug, label, singular, sort) VALUES (?, ?, ?, ?)
       ON CONFLICT (slug) DO UPDATE SET label = excluded.label,
         singular = excluded.singular, sort = excluded.sort`
    )
    .run(slug, label, singular, sort);
  return categoryBySlug(slug);
}

/* -------------------------------------------------------------------------
   Posts
   ------------------------------------------------------------------------- */
const hydrate = (row) => {
  if (!row) return null;
  const keywords = db()
    .prepare(`SELECT keyword FROM post_keywords WHERE post_id = ? ORDER BY position, id`)
    .all(row.id)
    .map((r) => r.keyword);
  const faqs = db()
    .prepare(`SELECT question AS q, answer AS a FROM post_faqs WHERE post_id = ? ORDER BY position, id`)
    .all(row.id);

  return {
    // Shape matches what the page renderers already expect, so nothing
    // downstream had to change when content moved into the database.
    id: row.id,
    slug: row.slug,
    path: row.path,
    category: row.category_slug,
    categoryLabel: row.category_singular,
    title: row.title,
    metaTitle: row.meta_title,
    description: row.description,
    excerpt: row.excerpt,
    body: row.body,
    bodyFormat: row.body_format,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: keywords,
    thumb: row.thumb_screen,
    readMins: row.read_mins,
    featured: !!row.featured,
    status: row.status,
    published: (row.published_at || '').slice(0, 10),
    modified: (row.modified_at || row.published_at || '').slice(0, 10),
    author: row.author_name,
    authorSlug: row.author_slug,
    faqs: faqs.length ? faqs : null,
    listItems: row.list_items ? JSON.parse(row.list_items) : null,
    notes: row.notes,
  };
};

/** Posts the site should build: published, plus scheduled ones whose time has come. */
export function livePosts({ now = new Date().toISOString().slice(0, 10) } = {}) {
  return db()
    .prepare(
      `SELECT * FROM v_posts
        WHERE status = 'published'
           OR (status = 'scheduled' AND published_at IS NOT NULL AND date(published_at) <= date(?))
        ORDER BY date(published_at) DESC, id DESC`
    )
    .all(now)
    .map(hydrate);
}

/** Every post regardless of status — for the CLI and admin views. */
export const allPosts = () =>
  db()
    .prepare(`SELECT * FROM v_posts ORDER BY date(published_at) DESC, id DESC`)
    .all()
    .map(hydrate);

export const postBySlug = (slug) =>
  hydrate(db().prepare(`SELECT * FROM v_posts WHERE slug = ?`).get(slug));

export const postById = (id) => hydrate(db().prepare(`SELECT * FROM v_posts WHERE id = ?`).get(id));

/** Posts still waiting on a future date — the site's own publishing queue. */
export const scheduledPosts = () =>
  db()
    .prepare(
      `SELECT * FROM v_posts
        WHERE status = 'scheduled' AND date(published_at) > date('now')
        ORDER BY date(published_at)`
    )
    .all()
    .map(hydrate);

/**
 * Insert or update a post by slug. Child rows (keywords, FAQs) are replaced
 * wholesale, which keeps callers simple — pass the full desired state.
 */
export function savePost(input) {
  const d = db();
  const {
    slug,
    category,
    authorSlug = 'iqbal-hussain',
    title,
    metaTitle,
    description,
    excerpt,
    body,
    bodyFormat = 'html',
    primaryKeyword = null,
    secondaryKeywords = [],
    thumb = 'list',
    readMins = 5,
    featured = false,
    status = 'draft',
    published = null,
    modified = null,
    faqs = [],
    listItems = null,
    notes = null,
    revisionNote = null,
  } = input;
  const listJson = listItems?.length ? JSON.stringify(listItems) : null;

  const cat = categoryBySlug(category);
  if (!cat) throw new Error(`Unknown category "${category}". Known: ${allCategories().map((c) => c.slug).join(', ')}`);
  const author = authorBySlug(authorSlug);
  if (!author) throw new Error(`Unknown author "${authorSlug}".`);

  const existing = d.prepare(`SELECT id, body, title FROM posts WHERE slug = ?`).get(slug);

  d.exec('BEGIN');
  try {
    let id;
    if (existing) {
      // Keep the previous body before overwriting it.
      if (existing.body !== body || existing.title !== title) {
        d.prepare(`INSERT INTO post_revisions (post_id, title, body, note) VALUES (?, ?, ?, ?)`).run(
          existing.id,
          existing.title,
          existing.body,
          revisionNote
        );
      }
      d.prepare(
        `UPDATE posts SET category_id = ?, author_id = ?, title = ?, meta_title = ?,
           description = ?, excerpt = ?, body = ?, body_format = ?, primary_keyword = ?,
           thumb_screen = ?, read_mins = ?, featured = ?, status = ?, published_at = ?,
           modified_at = ?, list_items = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        cat.id, author.id, title, metaTitle, description, excerpt, body, bodyFormat,
        primaryKeyword, thumb, readMins, featured ? 1 : 0, status, published,
        modified || published, listJson, notes, existing.id
      );
      id = existing.id;
    } else {
      d.prepare(
        `INSERT INTO posts (slug, category_id, author_id, title, meta_title, description,
           excerpt, body, body_format, primary_keyword, thumb_screen, read_mins, featured,
           status, published_at, modified_at, list_items, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
        slug, cat.id, author.id, title, metaTitle, description, excerpt, body, bodyFormat,
        primaryKeyword, thumb, readMins, featured ? 1 : 0, status, published,
        modified || published, listJson, notes
      );
      id = d.prepare(`SELECT id FROM posts WHERE slug = ?`).get(slug).id;
    }

    d.prepare(`DELETE FROM post_keywords WHERE post_id = ?`).run(id);
    const kw = d.prepare(`INSERT INTO post_keywords (post_id, keyword, position) VALUES (?, ?, ?)`);
    secondaryKeywords.filter(Boolean).forEach((k, i) => kw.run(id, k, i));

    d.prepare(`DELETE FROM post_faqs WHERE post_id = ?`).run(id);
    const fq = d.prepare(`INSERT INTO post_faqs (post_id, question, answer, position) VALUES (?, ?, ?, ?)`);
    (faqs || []).filter((f) => f && f.q && f.a).forEach((f, i) => fq.run(id, f.q, f.a, i));

    d.exec('COMMIT');
    return postById(id);
  } catch (err) {
    d.exec('ROLLBACK');
    throw err;
  }
}

export function setStatus(slug, status, publishedAt) {
  const post = db().prepare(`SELECT id FROM posts WHERE slug = ?`).get(slug);
  if (!post) throw new Error(`No post with slug "${slug}".`);
  db()
    .prepare(`UPDATE posts SET status = ?, published_at = COALESCE(?, published_at) WHERE id = ?`)
    .run(status, publishedAt || null, post.id);
  return postById(post.id);
}

export function deletePost(slug) {
  const info = db().prepare(`DELETE FROM posts WHERE slug = ?`).run(slug);
  return info.changes > 0;
}

export const revisions = (slug) => {
  const post = db().prepare(`SELECT id FROM posts WHERE slug = ?`).get(slug);
  if (!post) return [];
  return db()
    .prepare(`SELECT id, title, note, created_at, length(body) AS bytes
              FROM post_revisions WHERE post_id = ? ORDER BY created_at DESC`)
    .all(post.id);
};

export function restoreRevision(slug, revisionId) {
  const post = db().prepare(`SELECT id FROM posts WHERE slug = ?`).get(slug);
  if (!post) throw new Error(`No post with slug "${slug}".`);
  const rev = db().prepare(`SELECT * FROM post_revisions WHERE id = ? AND post_id = ?`).get(revisionId, post.id);
  if (!rev) throw new Error(`No revision ${revisionId} for "${slug}".`);
  db()
    .prepare(`UPDATE posts SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(rev.title, rev.body, post.id);
  return postById(post.id);
}

export function stats() {
  const d = db();
  return {
    posts: d.prepare(`SELECT COUNT(*) n FROM posts`).get().n,
    published: d.prepare(`SELECT COUNT(*) n FROM posts WHERE status='published'`).get().n,
    scheduled: d.prepare(`SELECT COUNT(*) n FROM posts WHERE status='scheduled'`).get().n,
    drafts: d.prepare(`SELECT COUNT(*) n FROM posts WHERE status='draft'`).get().n,
    categories: d.prepare(`SELECT COUNT(*) n FROM categories`).get().n,
    authors: d.prepare(`SELECT COUNT(*) n FROM authors`).get().n,
    faqs: d.prepare(`SELECT COUNT(*) n FROM post_faqs`).get().n,
    keywords: d.prepare(`SELECT COUNT(*) n FROM post_keywords`).get().n,
    revisions: d.prepare(`SELECT COUNT(*) n FROM post_revisions`).get().n,
  };
}
