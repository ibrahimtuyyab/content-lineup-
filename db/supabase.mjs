// Supabase data layer.
//
// Talks to PostgREST over plain fetch — the supabase-js client is a convenience
// wrapper around the same HTTP API, and skipping it keeps the project free of
// dependencies. Every function returns the same shapes the SQLite layer did, so
// the page renderers were unaffected by the move.
import { SUPABASE_URL, keyFor, requireSupabase } from './env.mjs';

const SELECT_POST = [
  '*',
  'category:categories(slug,label,singular)',
  'author:authors(slug,name)',
  'post_keywords(keyword,position)',
  'post_faqs(question,answer,position)',
].join(',');

/**
 * One PostgREST request.
 * @param {string} path   e.g. "posts?slug=eq.foo"
 * @param {object} opts   { method, body, mode, prefer, headers }
 */
export async function rest(path, opts = {}) {
  requireSupabase();
  const { method = 'GET', body, mode = 'read', prefer, headers = {} } = opts;
  const key = keyFor(mode);
  const url = `${SUPABASE_URL}/rest/v1/${path}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Cannot reach Supabase at ${SUPABASE_URL} — ${err.message}`);
  }

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = [j.message, j.details, j.hint].filter(Boolean).join(' · ');
    } catch {}
    if (res.status === 404 && /relation .* does not exist|Could not find the table/i.test(detail)) {
      throw new Error(
        `Supabase has no such table yet. Apply the schema first:\n` +
          `  npm run db:schema        (prints the SQL to paste into the SQL Editor)\n` +
          `Original error: ${detail}`
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Supabase rejected the key (${res.status}). ${detail}\n` +
          `Reads use the anon key; writes need SUPABASE_SERVICE_ROLE_KEY.`
      );
    }
    throw new Error(`Supabase ${method} ${path} failed (${res.status}): ${detail}`);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* -------------------------------------------------------------------------
   Shaping
   ------------------------------------------------------------------------- */
const byPos = (a, b) => (a.position ?? 0) - (b.position ?? 0);

/** Map a PostgREST row onto the shape the site renderers expect. */
export const shape = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    path: `/resources/${row.category?.slug}/${row.slug}`,
    category: row.category?.slug,
    categoryLabel: row.category?.singular,
    categoryPlural: row.category?.label,
    title: row.title,
    metaTitle: row.meta_title,
    description: row.description,
    excerpt: row.excerpt,
    body: row.body,
    bodyFormat: row.body_format,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: (row.post_keywords || []).sort(byPos).map((k) => k.keyword),
    thumb: row.thumb_screen,
    readMins: row.read_mins,
    featured: !!row.featured,
    status: row.status,
    published: (row.published_at || '').slice(0, 10),
    modified: (row.modified_at || row.published_at || '').slice(0, 10),
    author: row.author?.name,
    authorSlug: row.author?.slug,
    listItems: row.list_items || null,
    faqs: (row.post_faqs || []).length
      ? (row.post_faqs || []).sort(byPos).map((f) => ({ q: f.question, a: f.answer }))
      : null,
    notes: row.notes,
  };
};

/* -------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */

/**
 * Posts the site should build.
 *
 * With the anon key this needs no filter at all — the RLS policy already
 * restricts the result to published posts and scheduled ones whose date has
 * passed. The explicit filter is here so the same call behaves identically
 * when someone runs it with the service key, which bypasses RLS.
 */
export async function livePosts() {
  const today = new Date().toISOString().slice(0, 10);
  const filter = `or=(status.eq.published,and(status.eq.scheduled,published_at.lte.${today}))`;
  const rows = await rest(`posts?select=${SELECT_POST}&${filter}&order=published_at.desc,id.desc`);
  return rows.map(shape);
}

/** Every post regardless of status — service key only (RLS hides drafts otherwise). */
export async function allPosts() {
  const rows = await rest(`posts?select=${SELECT_POST}&order=published_at.desc,id.desc`, {
    mode: 'write',
  });
  return rows.map(shape);
}

export async function postBySlug(slug, mode = 'write') {
  const rows = await rest(`posts?select=${SELECT_POST}&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
    mode,
  });
  return shape(rows[0]);
}

export async function scheduledPosts() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await rest(
    `posts?select=${SELECT_POST}&status=eq.scheduled&published_at=gt.${today}&order=published_at.asc`,
    { mode: 'write' }
  );
  return rows.map(shape);
}

export const allCategories = () => rest('categories?select=*&order=sort.asc,label.asc');
export const allAuthors = () => rest('authors?select=*&order=name.asc');

export async function stats() {
  const posts = await allPosts();
  const [faqs, keywords, revisions, cats, authors] = await Promise.all([
    count('post_faqs'),
    count('post_keywords'),
    count('post_revisions'),
    count('categories'),
    count('authors'),
  ]);
  return {
    posts: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    categories: cats,
    authors,
    faqs,
    keywords,
    revisions,
  };
}

/** Exact row count via the Content-Range header, without pulling the rows. */
async function count(table) {
  requireSupabase();
  const key = keyFor('write');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    method: 'HEAD',
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
  });
  const range = res.headers.get('content-range') || '';
  return Number(range.split('/')[1]) || 0;
}

/* -------------------------------------------------------------------------
   Writes — all service-role
   ------------------------------------------------------------------------- */
export async function upsertAuthor({ slug, name, email = null, bio = null, url = null }) {
  const [row] = await rest('authors?on_conflict=slug', {
    method: 'POST',
    mode: 'write',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: [{ slug, name, email, bio, url }],
  });
  return row;
}

export async function upsertCategory({ slug, label, singular, sort = 0 }) {
  const [row] = await rest('categories?on_conflict=slug', {
    method: 'POST',
    mode: 'write',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: [{ slug, label, singular, sort }],
  });
  return row;
}

const idOf = async (table, slug) => {
  const rows = await rest(`${table}?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
    mode: 'write',
  });
  return rows[0]?.id;
};

/**
 * Insert or update a post by slug, replacing its keywords and FAQs wholesale.
 * Revision history is handled by a database trigger, so it cannot be bypassed.
 */
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

  const categoryId = await idOf('categories', category);
  if (!categoryId) {
    const known = (await allCategories()).map((c) => c.slug).join(', ');
    throw new Error(`Unknown category "${category}". Known: ${known}`);
  }
  const authorId = await idOf('authors', authorSlug);
  if (!authorId) throw new Error(`Unknown author "${authorSlug}".`);

  const row = {
    slug,
    category_id: categoryId,
    author_id: authorId,
    title,
    meta_title: metaTitle,
    description,
    excerpt,
    body,
    body_format: bodyFormat,
    primary_keyword: primaryKeyword,
    thumb_screen: thumb,
    read_mins: readMins,
    featured: !!featured,
    status,
    published_at: published || null,
    modified_at: modified || published || null,
    list_items: listItems?.length ? listItems : null,
    notes,
  };

  const [saved] = await rest('posts?on_conflict=slug', {
    method: 'POST',
    mode: 'write',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: [row],
  });

  // Children are replaced rather than diffed — callers pass the full desired state.
  await rest(`post_keywords?post_id=eq.${saved.id}`, { method: 'DELETE', mode: 'write' });
  const kws = (secondaryKeywords || []).filter(Boolean);
  if (kws.length) {
    await rest('post_keywords', {
      method: 'POST',
      mode: 'write',
      body: kws.map((keyword, position) => ({ post_id: saved.id, keyword, position })),
    });
  }

  await rest(`post_faqs?post_id=eq.${saved.id}`, { method: 'DELETE', mode: 'write' });
  const items = (faqs || []).filter((f) => f && f.q && f.a);
  if (items.length) {
    await rest('post_faqs', {
      method: 'POST',
      mode: 'write',
      body: items.map((f, position) => ({
        post_id: saved.id,
        question: f.q,
        answer: f.a,
        position,
      })),
    });
  }

  return postBySlug(slug);
}

export async function setStatus(slug, status, publishedAt) {
  const patch = { status };
  if (publishedAt) patch.published_at = publishedAt;
  const rows = await rest(`posts?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    mode: 'write',
    prefer: 'return=representation',
    body: patch,
  });
  if (!rows?.length) throw new Error(`No post with slug "${slug}".`);
  return postBySlug(slug);
}

export async function deletePost(slug) {
  const rows = await rest(`posts?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    mode: 'write',
    prefer: 'return=representation',
  });
  return !!rows?.length;
}

export async function revisions(slug) {
  const id = await idOf('posts', slug);
  if (!id) return [];
  return rest(
    `post_revisions?select=id,title,note,created_at&post_id=eq.${id}&order=created_at.desc`,
    { mode: 'write' }
  );
}

export async function restoreRevision(slug, revisionId) {
  const id = await idOf('posts', slug);
  if (!id) throw new Error(`No post with slug "${slug}".`);
  const [rev] = await rest(`post_revisions?select=*&id=eq.${revisionId}&post_id=eq.${id}&limit=1`, {
    mode: 'write',
  });
  if (!rev) throw new Error(`No revision ${revisionId} for "${slug}".`);
  await rest(`posts?id=eq.${id}`, {
    method: 'PATCH',
    mode: 'write',
    body: { title: rev.title, body: rev.body },
  });
  return postBySlug(slug);
}

/** Cheap connectivity + schema check used by the CLI and the build. */
export async function ping() {
  const rows = await rest('categories?select=slug&limit=1');
  return Array.isArray(rows);
}
