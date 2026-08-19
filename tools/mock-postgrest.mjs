// A small PostgREST test double.
//
//   node tools/mock-postgrest.mjs [port]
//
// Serves the local SQLite content over the same HTTP shapes Supabase exposes,
// so the Supabase client, the build, the CLI and the admin UI can all be
// exercised end to end before any real credentials exist. It implements only
// the subset db/supabase.mjs actually uses — it is a test fixture, not a
// PostgREST reimplementation.
import { createServer } from 'node:http';
import {
  allPosts,
  postBySlug,
  allCategories,
  allAuthors,
  savePost,
  setStatus,
  deletePost,
  isInitialised,
} from '../db/db.mjs';

const PORT = Number(process.argv[2]) || 54321;

if (!isInitialised()) {
  console.error('No local SQLite content to serve. Run: npm run mirror:init && npm run mirror:seed');
  process.exit(1);
}

// Mirror the row shape PostgREST returns for the embedded select the client uses.
const rowFor = (p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  meta_title: p.metaTitle,
  description: p.description,
  excerpt: p.excerpt,
  body: p.body,
  body_format: p.bodyFormat,
  primary_keyword: p.primaryKeyword,
  thumb_screen: p.thumb,
  read_mins: p.readMins,
  featured: p.featured,
  status: p.status,
  published_at: p.published || null,
  modified_at: p.modified || null,
  notes: p.notes,
  category: { slug: p.category, label: p.categoryLabel + 's', singular: p.categoryLabel },
  author: { slug: p.authorSlug || 'iqbal-hussain', name: p.author },
  post_keywords: (p.secondaryKeywords || []).map((keyword, position) => ({ keyword, position })),
  post_faqs: (p.faqs || []).map((f, position) => ({ question: f.q, answer: f.a, position })),
});

const json = (res, status, body) => {
  const payload = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => {
      try {
        resolve(d ? JSON.parse(d) : null);
      } catch {
        resolve(null);
      }
    });
  });

/** Very small subset of PostgREST filter syntax: col=eq.value / col=lte.value. */
const eqValue = (params, col) => {
  const raw = params.get(col);
  if (!raw) return null;
  const [, value] = raw.split(/^(eq|lte|gt|gte|lt)\./);
  return raw.includes('.') ? raw.slice(raw.indexOf('.') + 1) : raw;
};

const server = createServer(async (req, res) => {
  if (!req.headers.apikey) return json(res, 401, { message: 'No API key found in request' });

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const [, , , table] = url.pathname.split('/'); // /rest/v1/<table>
  const p = url.searchParams;
  const isService = String(req.headers.apikey).includes('service');

  try {
    if (req.method === 'HEAD') {
      const counts = {
        post_faqs: allPosts().reduce((n, x) => n + (x.faqs?.length || 0), 0),
        post_keywords: allPosts().reduce((n, x) => n + x.secondaryKeywords.length, 0),
        post_revisions: 0,
        categories: allCategories().length,
        authors: allAuthors().length,
      };
      res.writeHead(200, { 'Content-Range': `0-0/${counts[table] ?? 0}` });
      return res.end();
    }

    if (table === 'categories' && req.method === 'GET') return json(res, 200, allCategories());
    if (table === 'authors' && req.method === 'GET') return json(res, 200, allAuthors());

    if (table === 'posts' && req.method === 'GET') {
      let rows = allPosts();
      const slug = eqValue(p, 'slug');
      if (slug) rows = rows.filter((x) => x.slug === slug);

      // Emulate the RLS rule: the anon key only ever sees live posts.
      if (!isService) {
        const today = new Date().toISOString().slice(0, 10);
        rows = rows.filter(
          (x) => x.status === 'published' || (x.status === 'scheduled' && x.published && x.published <= today)
        );
      }
      if (p.get('status') === 'eq.scheduled') rows = rows.filter((x) => x.status === 'scheduled');
      const gt = p.get('published_at');
      if (gt?.startsWith('gt.')) rows = rows.filter((x) => x.published > gt.slice(3));

      return json(res, 200, rows.map(rowFor));
    }

    if (table === 'posts' && req.method === 'POST') {
      const [row] = await readBody(req);
      const cats = allCategories();
      const cat = cats.find((c) => c.id === row.category_id);
      const saved = savePost({
        slug: row.slug,
        category: cat.slug,
        authorSlug: 'iqbal-hussain',
        title: row.title,
        metaTitle: row.meta_title,
        description: row.description,
        excerpt: row.excerpt,
        body: row.body,
        bodyFormat: row.body_format,
        primaryKeyword: row.primary_keyword,
        thumb: row.thumb_screen,
        readMins: row.read_mins,
        featured: row.featured,
        status: row.status,
        published: row.published_at,
        modified: row.modified_at,
        notes: row.notes,
        secondaryKeywords: [],
        faqs: [],
      });
      return json(res, 201, [{ id: saved.id, slug: saved.slug }]);
    }

    if (table === 'posts' && req.method === 'PATCH') {
      const slug = eqValue(p, 'slug');
      const patch = await readBody(req);
      const saved = setStatus(slug, patch.status, patch.published_at);
      return json(res, 200, [rowFor(saved)]);
    }

    if (table === 'posts' && req.method === 'DELETE') {
      const slug = eqValue(p, 'slug');
      const existed = deletePost(slug);
      return json(res, 200, existed ? [{ slug }] : []);
    }

    // Child tables: the client replaces them wholesale via the parent save above,
    // so accepting and discarding is faithful enough for the read paths we test.
    if (['post_keywords', 'post_faqs'].includes(table)) {
      if (req.method === 'DELETE') return json(res, 200, []);
      if (req.method === 'POST') {
        await readBody(req);
        return json(res, 201, []);
      }
      return json(res, 200, []);
    }

    if (table === 'post_revisions') return json(res, 200, []);

    return json(res, 404, { message: `Could not find the table 'public.${table}'` });
  } catch (err) {
    return json(res, 400, { message: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock PostgREST on http://127.0.0.1:${PORT}`);
  console.log('Point SUPABASE_URL at it to exercise the Supabase path without a real project.\n');
});
