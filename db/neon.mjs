// Neon (Postgres) data layer.
//
// Talks to Neon's HTTP SQL endpoint with plain fetch rather than the
// @neondatabase/serverless driver — same protocol, no dependency, and it works
// unchanged in a Vercel build, an edge runtime, or a local terminal.
//
// The connection string comes from DATABASE_URL / POSTGRES_URL, which Vercel
// injects automatically for a connected Neon store.
import { NEON_URL, hasNeon } from './env.mjs';

/** Split a postgres:// URL into the pieces the HTTP endpoint needs. */
function parseConn(conn) {
  const u = new URL(conn);
  // Pooled hosts (…-pooler.…) work for HTTP too, but the direct host is what
  // Neon's SQL-over-HTTP endpoint expects, so normalise to it.
  const host = u.hostname.replace('-pooler.', '.');
  return {
    host,
    endpoint: `https://${host}/sql`,
    database: u.pathname.replace(/^\//, ''),
    user: decodeURIComponent(u.username || ''),
  };
}

let _conn = null;
const conn = () => {
  if (!hasNeon) {
    throw new Error(
      'No Neon connection string.\n' +
        '  Add DATABASE_URL=postgresql://… to .env\n' +
        '  (Vercel → your project → Storage → Neon → .env.local snippet,\n' +
        '   or run: vercel env pull .env.local)'
    );
  }
  if (!_conn) _conn = parseConn(NEON_URL);
  return _conn;
};

/**
 * Run one SQL statement.
 * @param {string} text   SQL with $1, $2 … placeholders
 * @param {any[]}  params values for those placeholders
 * @returns {Promise<object[]>} rows as objects
 */
export async function sql(text, params = []) {
  const c = conn();
  let res;
  try {
    res = await fetch(c.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_URL,
        // Ask for objects rather than positional arrays.
        'Neon-Array-Mode': 'false',
      },
      body: JSON.stringify({ query: text, params }),
    });
  } catch (err) {
    throw new Error(`Cannot reach Neon at ${c.host} — ${err.message}`);
  }

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw;
    try {
      const j = JSON.parse(raw);
      detail = [j.message, j.detail, j.hint].filter(Boolean).join(' · ') || raw;
    } catch {}
    if (/relation .* does not exist/i.test(detail)) {
      throw new Error(
        `Neon has no such table yet. Apply the schema first:\n  npm run neon:setup\n\n${detail}`
      );
    }
    throw new Error(`Neon query failed (${res.status}): ${detail}`);
  }

  const out = JSON.parse(raw);
  return out.rows || [];
}

/** Run several statements in one transaction. */
export async function tx(statements) {
  const c = conn();
  const res = await fetch(c.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_URL,
      'Neon-Array-Mode': 'false',
      'Neon-Batch-Isolation-Level': 'ReadCommitted',
    },
    body: JSON.stringify({ queries: statements.map(([query, params = []]) => ({ query, params })) }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Neon transaction failed (${res.status}): ${raw}`);
  const out = JSON.parse(raw);
  return Array.isArray(out) ? out.map((r) => r.rows || []) : [out.rows || []];
}

/** Connectivity + schema check. */
export async function ping() {
  const rows = await sql('select 1 as ok');
  return rows[0]?.ok === 1 || rows[0]?.ok === '1';
}

export async function whoami() {
  const [row] = await sql(
    'select current_database() as db, current_user as usr, version() as version'
  );
  return row;
}

/* -------------------------------------------------------------------------
   Shaping — identical output shape to the SQLite and Supabase layers
   ------------------------------------------------------------------------- */
const shape = (row, keywords = [], faqs = []) => ({
  id: row.id,
  slug: row.slug,
  path: row.path,
  category: row.category_slug,
  categoryLabel: row.category_singular,
  categoryPlural: row.category_label,
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
  published: String(row.published_at || '').slice(0, 10),
  modified: String(row.modified_at || row.published_at || '').slice(0, 10),
  author: row.author_name,
  authorSlug: row.author_slug,
  listItems: row.list_items || null,
  faqs: faqs.length ? faqs : null,
  notes: row.notes,
});

/** Attach keywords and FAQs to a set of posts in two extra queries, not 2N. */
async function withChildren(rows) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [kw, fq] = await Promise.all([
    sql('select post_id, keyword from post_keywords where post_id = any($1) order by position, id', [ids]),
    sql(
      'select post_id, question, answer from post_faqs where post_id = any($1) order by position, id',
      [ids]
    ),
  ]);
  const byPost = (list) =>
    list.reduce((m, r) => ((m[r.post_id] ||= []).push(r), m), Object.create(null));
  const kwMap = byPost(kw);
  const fqMap = byPost(fq);
  return rows.map((r) =>
    shape(
      r,
      (kwMap[r.id] || []).map((x) => x.keyword),
      (fqMap[r.id] || []).map((x) => ({ q: x.question, a: x.answer }))
    )
  );
}

/* -------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */
export const livePosts = async () =>
  withChildren(await sql('select * from live_posts order by published_at desc nulls last, id desc'));

export const allPosts = async () =>
  withChildren(await sql('select * from v_posts order by published_at desc nulls last, id desc'));

export const postBySlug = async (slug) => {
  const rows = await withChildren(await sql('select * from v_posts where slug = $1', [slug]));
  return rows[0] || null;
};

export const scheduledPosts = async () =>
  withChildren(
    await sql(
      `select * from v_posts
        where status = 'scheduled' and published_at > current_date
        order by published_at`
    )
  );

export const allCategories = () => sql('select * from categories order by sort, label');
export const allAuthors = () => sql('select * from authors order by name');

export async function stats() {
  const [row] = await sql(`
    select
      (select count(*) from posts)                              as posts,
      (select count(*) from posts where status = 'published')   as published,
      (select count(*) from posts where status = 'scheduled')   as scheduled,
      (select count(*) from posts where status = 'draft')       as drafts,
      (select count(*) from categories)                         as categories,
      (select count(*) from authors)                            as authors,
      (select count(*) from post_faqs)                          as faqs,
      (select count(*) from post_keywords)                      as keywords,
      (select count(*) from post_revisions)                     as revisions
  `);
  // Postgres counts arrive as strings over HTTP; normalise to numbers.
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));
}

/* -------------------------------------------------------------------------
   Writes
   ------------------------------------------------------------------------- */
export async function upsertAuthor({ slug, name, email = null, bio = null, url = null }) {
  const [row] = await sql(
    `insert into authors (slug, name, email, bio, url) values ($1,$2,$3,$4,$5)
     on conflict (slug) do update set name = excluded.name, email = excluded.email,
       bio = excluded.bio, url = excluded.url
     returning *`,
    [slug, name, email, bio, url]
  );
  return row;
}

export async function upsertCategory({ slug, label, singular, sort = 0 }) {
  const [row] = await sql(
    `insert into categories (slug, label, singular, sort) values ($1,$2,$3,$4)
     on conflict (slug) do update set label = excluded.label,
       singular = excluded.singular, sort = excluded.sort
     returning *`,
    [slug, label, singular, sort]
  );
  return row;
}

export async function savePost(input) {
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
  } = input;

  const [cat] = await sql('select id from categories where slug = $1', [category]);
  if (!cat) {
    const known = (await allCategories()).map((c) => c.slug).join(', ');
    throw new Error(`Unknown category "${category}". Known: ${known}`);
  }
  const [author] = await sql('select id from authors where slug = $1', [authorSlug]);
  if (!author) throw new Error(`Unknown author "${authorSlug}".`);

  const [saved] = await sql(
    `insert into posts (slug, category_id, author_id, title, meta_title, description, excerpt,
        body, body_format, primary_keyword, thumb_screen, read_mins, featured, status,
        published_at, modified_at, list_items, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     on conflict (slug) do update set
       category_id = excluded.category_id, author_id = excluded.author_id,
       title = excluded.title, meta_title = excluded.meta_title,
       description = excluded.description, excerpt = excluded.excerpt,
       body = excluded.body, body_format = excluded.body_format,
       primary_keyword = excluded.primary_keyword, thumb_screen = excluded.thumb_screen,
       read_mins = excluded.read_mins, featured = excluded.featured,
       status = excluded.status, published_at = excluded.published_at,
       modified_at = excluded.modified_at, list_items = excluded.list_items,
       notes = excluded.notes
     returning id`,
    [
      slug, cat.id, author.id, title, metaTitle, description, excerpt, body, bodyFormat,
      primaryKeyword, thumb, readMins, !!featured, status, published || null,
      modified || published || null, listItems?.length ? JSON.stringify(listItems) : null, notes,
    ]
  );

  await sql('delete from post_keywords where post_id = $1', [saved.id]);
  const kws = (secondaryKeywords || []).filter(Boolean);
  if (kws.length) {
    await sql(
      `insert into post_keywords (post_id, keyword, position)
       select $1, kw, ord - 1 from unnest($2::text[]) with ordinality as t(kw, ord)`,
      [saved.id, kws]
    );
  }

  await sql('delete from post_faqs where post_id = $1', [saved.id]);
  const items = (faqs || []).filter((f) => f && f.q && f.a);
  if (items.length) {
    await sql(
      `insert into post_faqs (post_id, question, answer, position)
       select $1, q, a, ord - 1
       from unnest($2::text[], $3::text[]) with ordinality as t(q, a, ord)`,
      [saved.id, items.map((f) => f.q), items.map((f) => f.a)]
    );
  }

  return postBySlug(slug);
}

/* ==========================================================================
   Pricing plans

   Rows come back in the shape src/data/site.mjs already uses, so the renderers
   do not have to learn a second vocabulary: snake_case columns are mapped to
   the camelCase the templates read, and the four annual_* columns collapse
   back into the single `annual` object (or null).
   ========================================================================== */

/** One v_plans row -> the object the pricing templates expect. */
const planRow = (r) => ({
  id: r.slug,
  name: r.name,
  sort: r.sort,
  price: r.price,
  period: r.period,
  numeric: r.numeric_price,
  annual: r.annual_price
    ? {
        price: r.annual_price,
        numeric: r.annual_numeric,
        perMonth: r.annual_per_month,
        saving: r.annual_saving,
      }
    : null,
  kicker: r.kicker,
  outcome: r.outcome,
  summary: r.summary,
  ctaLabel: r.cta_label,
  featured: r.featured,
  // v_plans aggregates the bullets, so a plan is one row and one round trip.
  includes: Array.isArray(r.includes) ? r.includes : JSON.parse(r.includes || '[]'),
  limits: r.limits,
  updatedAt: r.updated_at,
});

export const allPlans = async () => (await sql('select * from v_plans order by sort, id')).map(planRow);

export const planBySlug = async (slug) => {
  const rows = await sql('select * from v_plans where slug = $1', [slug]);
  return rows.length ? planRow(rows[0]) : null;
};

/**
 * Insert or update one plan and replace its bullet list.
 *
 * The bullets are deleted and re-inserted rather than diffed: the list is nine
 * rows long and its order is meaningful, so a rewrite is both simpler and
 * cheaper than working out which line moved where.
 */
export async function savePlan(p) {
  const slug = String(p.id || p.slug || '').trim();
  if (!slug) throw new Error('A plan needs a slug.');
  const annual = p.annual || null;

  // Only one plan may be featured, and the database enforces it with a partial
  // unique index. Clear the flag elsewhere first, or the upsert below trips it.
  if (p.featured) await sql('update plans set featured = false where slug <> $1', [slug]);

  const [row] = await sql(
    `insert into plans (
       slug, name, sort, price, period, numeric_price,
       annual_price, annual_numeric, annual_per_month, annual_saving,
       kicker, outcome, summary, cta_label, featured, limits
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     on conflict (slug) do update set
       name             = excluded.name,
       sort             = excluded.sort,
       price            = excluded.price,
       period           = excluded.period,
       numeric_price    = excluded.numeric_price,
       annual_price     = excluded.annual_price,
       annual_numeric   = excluded.annual_numeric,
       annual_per_month = excluded.annual_per_month,
       annual_saving    = excluded.annual_saving,
       kicker           = excluded.kicker,
       outcome          = excluded.outcome,
       summary          = excluded.summary,
       cta_label        = excluded.cta_label,
       featured         = excluded.featured,
       limits           = excluded.limits
     returning id`,
    [
      slug,
      p.name,
      Number(p.sort) || 0,
      p.price,
      p.period || '/month',
      String(p.numeric ?? '0'),
      annual?.price ?? null,
      annual ? String(annual.numeric ?? '') : null,
      annual?.perMonth ?? null,
      annual?.saving ?? null,
      p.kicker,
      p.outcome,
      p.summary,
      p.ctaLabel || p.cta?.label || 'Start free',
      !!p.featured,
      p.limits,
    ]
  );

  const includes = (p.includes || []).map((s) => String(s).trim()).filter(Boolean);
  await tx([
    ['delete from plan_includes where plan_id = $1', [row.id]],
    ...includes.map((label, i) => [
      'insert into plan_includes (plan_id, label, sort) values ($1, $2, $3)',
      [row.id, label, i],
    ]),
  ]);
  return slug;
}

export async function deletePlan(slug) {
  // plan_includes is on delete cascade, so the bullets go with it.
  await sql('delete from plans where slug = $1', [slug]);
  return true;
}

export async function setPlanFeatured(slug) {
  await tx([
    ['update plans set featured = false where slug <> $1', [slug]],
    ['update plans set featured = true where slug = $1', [slug]],
  ]);
  return true;
}

export async function setStatus(slug, status, publishedAt) {
  const rows = await sql(
    `update posts set status = $2, published_at = coalesce($3, published_at)
     where slug = $1 returning id`,
    [slug, status, publishedAt || null]
  );
  if (!rows.length) throw new Error(`No post with slug "${slug}".`);
  return postBySlug(slug);
}

export async function deletePost(slug) {
  const rows = await sql('delete from posts where slug = $1 returning id', [slug]);
  return rows.length > 0;
}

export const revisions = async (slug) =>
  sql(
    `select r.id, r.title, r.note, r.created_at
       from post_revisions r join posts p on p.id = r.post_id
      where p.slug = $1 order by r.created_at desc`,
    [slug]
  );

export async function restoreRevision(slug, revisionId) {
  const rows = await sql(
    `update posts p set title = r.title, body = r.body
       from post_revisions r
      where r.id = $2 and r.post_id = p.id and p.slug = $1
      returning p.id`,
    [slug, revisionId]
  );
  if (!rows.length) throw new Error(`No revision ${revisionId} for "${slug}".`);
  return postBySlug(slug);
}

/* ==========================================================================
   Site content blocks

   The marketing pages' content: nav, footer, features, channels, stages,
   audiences, integrations, FAQs, the comparison matrix, trust points, topic
   clusters, site config and the cross-page related links.

   A block is a whole JSON document keyed by the name the templates import it
   under, so `allBlocks()` is one round trip for the entire site. An absent key
   means "the repository default applies" — see src/data/overrides.mjs —
   deleting a row is a reset, not a deletion of content.
   ========================================================================== */

/**
 * jsonb comes back parsed over the HTTP endpoint, but a string is returned for
 * some column/driver combinations. Accept either rather than depending on it.
 */
const parseValue = (v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};

/** Every override, as { key: value }. One query, whole site. */
export async function allBlocks() {
  const rows = await sql('select key, value from content_blocks');
  return Object.fromEntries(rows.map((r) => [r.key, parseValue(r.value)]));
}

/** Overrides with their metadata, for the admin's list view. */
export const blockRows = () =>
  sql('select key, note, updated_at from content_blocks order by key');

export async function blockByKey(key) {
  const rows = await sql('select key, value, note, updated_at from content_blocks where key = $1', [key]);
  if (!rows.length) return null;
  return { ...rows[0], value: parseValue(rows[0].value) };
}

export async function saveBlock(key, value, note = null) {
  if (!key) throw new Error('A content block needs a key.');
  if (value === undefined) throw new Error(`No value given for content block "${key}".`);
  await sql(
    `insert into content_blocks (key, value, note) values ($1, $2::jsonb, $3)
     on conflict (key) do update set value = excluded.value, note = excluded.note`,
    [key, JSON.stringify(value), note]
  );
  return key;
}

/** Reset: drop the override so the repository default applies again. */
export async function deleteBlock(key) {
  const rows = await sql('delete from content_blocks where key = $1 returning key', [key]);
  return rows.length > 0;
}

/* ==========================================================================
   Authors and categories

   Both are referenced by posts with `on delete restrict`, so a delete that
   would orphan a post is refused by the database. That error is turned into a
   sentence someone can act on rather than passed through raw.
   ========================================================================== */

export async function deleteAuthor(slug) {
  const [used] = await sql(
    'select count(*) as c from posts p join authors a on a.id = p.author_id where a.slug = $1',
    [slug]
  );
  if (Number(used.c) > 0) {
    throw new Error(
      `"${slug}" is the author of ${used.c} post${used.c === '1' ? '' : 's'}. ` +
        'Reassign them before deleting the author.'
    );
  }
  const rows = await sql('delete from authors where slug = $1 returning id', [slug]);
  return rows.length > 0;
}

export async function deleteCategory(slug) {
  const [used] = await sql(
    'select count(*) as c from posts p join categories c on c.id = p.category_id where c.slug = $1',
    [slug]
  );
  if (Number(used.c) > 0) {
    throw new Error(
      `${used.c} post${used.c === '1' ? '' : 's'} are in "${slug}". ` +
        'Move them to another category before deleting it.'
    );
  }
  const rows = await sql('delete from categories where slug = $1 returning id', [slug]);
  return rows.length > 0;
}

export const authorBySlug = async (slug) => {
  const rows = await sql('select * from authors where slug = $1', [slug]);
  return rows[0] || null;
};

export const categoryBySlug = async (slug) => {
  const rows = await sql('select * from categories where slug = $1', [slug]);
  return rows[0] || null;
};

/** Post counts per author and per category, for the admin's list views. */
export const authorUsage = async () =>
  Object.fromEntries(
    (
      await sql(`select a.slug, count(p.id) as c from authors a
                   left join posts p on p.author_id = a.id group by a.slug`)
    ).map((r) => [r.slug, Number(r.c)])
  );

export const categoryUsage = async () =>
  Object.fromEntries(
    (
      await sql(`select c.slug, count(p.id) as c from categories c
                   left join posts p on p.category_id = c.id group by c.slug`)
    ).map((r) => [r.slug, Number(r.c)])
  );
