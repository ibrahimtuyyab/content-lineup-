// The site's view of the content database.
//
// Source of truth is Supabase. Because a static build must not fall over when a
// network hiccups, there are two fallbacks, in order:
//
//   1. Supabase          — the live content
//   2. data/content-cache.json — written on every successful fetch
//   3. data/content.db   — the local SQLite mirror, if one is present
//
// Top-level await means page modules can keep importing `posts` synchronously;
// the module graph waits for the fetch before any renderer runs.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { hasSupabase, SUPABASE_URL, hasNeon, neonHost } from '../../db/env.mjs';
import { renderBody } from '../../db/render.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CACHE = join(ROOT, 'data', 'content-cache.json');
const SQLITE = join(ROOT, 'data', 'content.db');

const readCache = () => {
  if (!existsSync(CACHE)) return null;
  try {
    const { posts, categories, fetchedAt } = JSON.parse(readFileSync(CACHE, 'utf8'));
    return posts?.length ? { posts, categories, fetchedAt } : null;
  } catch {
    return null;
  }
};

const writeCache = (posts, categories) => {
  try {
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), categories, posts }, null, 2));
  } catch (err) {
    console.warn(`Could not write content cache: ${err.message}`);
  }
};

async function load() {
  // 1. Neon — the production database once DATABASE_URL is set, which Vercel
  //    injects automatically for a connected Neon store.
  if (hasNeon) {
    try {
      const neon = await import('../../db/neon.mjs');
      const [posts, cats] = await Promise.all([neon.livePosts(), neon.allCategories()]);
      writeCache(posts, cats);
      console.log(`Content: ${posts.length} posts from Neon (${neonHost()})`);
      return { posts, cats };
    } catch (err) {
      console.warn(`\nNeon unavailable: ${err.message.split('\n')[0]}`);
      // fall through to the sources below
    }
  }

  // 2. Supabase
  if (hasSupabase) {
    try {
      const sb = await import('../../db/supabase.mjs');
      const [posts, cats] = await Promise.all([sb.livePosts(), sb.allCategories()]);
      if (!posts.length) {
        console.warn(
          'Supabase returned no live posts. If you expect content, check that posts are\n' +
            "  published (not draft) — the anon key can only read live posts by design."
        );
      }
      writeCache(posts, cats);
      console.log(`Content: ${posts.length} posts from Supabase (${new URL(SUPABASE_URL).host})`);
      return { posts, cats };
    } catch (err) {
      console.warn(`\nSupabase unavailable: ${err.message}`);

      const cached = readCache();
      if (cached) {
        console.warn(`  Falling back to the cache written at ${cached.fetchedAt}\n`);
        return { posts: cached.posts, cats: cached.categories };
      }

      if (existsSync(SQLITE)) {
        const local = await import('../../db/db.mjs');
        if (local.isInitialised()) {
          console.warn('  Falling back to the local SQLite mirror\n');
          return { posts: local.livePosts(), cats: local.allCategories() };
        }
      }

      throw new Error(
        `Supabase fetch failed, and there is no cache or local mirror to fall back on.\n${err.message}`
      );
    }
  }

  // 2. Local SQLite mirror — used before Supabase credentials are configured.
  if (existsSync(SQLITE)) {
    const local = await import('../../db/db.mjs');
    const posts = local.livePosts();
    const cats = local.allCategories();
    console.log(`Content: ${posts.length} posts from the local SQLite mirror (Supabase not configured)`);
    return { posts, cats };
  }

  // 3. Cache only.
  const cached = readCache();
  if (cached) {
    console.warn(`Content: using cache from ${cached.fetchedAt} (no database configured)`);
    return { posts: cached.posts, cats: cached.categories };
  }

  throw new Error(
    'No content source available.\n' +
      '  Configure Supabase:  cp .env.example .env  and fill in your project URL and keys\n' +
      '  Then:                npm run db:push'
  );
}

const { posts: rawPosts, cats } = await load();

/** Live posts, newest first, with bodies fully rendered. */
export const posts = rawPosts.map((p) => ({ ...p, body: renderBody(p) }));

/** Filter buttons on the resources hub. Only categories that have posts appear. */
export const categories = [
  { id: 'all', label: 'All resources' },
  ...(cats || [])
    .filter((c) => posts.some((p) => p.category === c.slug))
    .map((c) => ({ id: c.slug, label: c.label })),
];

export const byCategory = (id) => (id === 'all' ? posts : posts.filter((p) => p.category === id));
export const featured = posts.filter((p) => p.featured);
export const bySlug = (slug) => posts.find((p) => p.slug === slug);

/** Sibling posts for the foot of an article — same category first. */
export const relatedTo = (post, n = 3) =>
  posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category) - (a.category === post.category))
    .slice(0, n);
