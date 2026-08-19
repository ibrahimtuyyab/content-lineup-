// Store selector.
//
// Supabase when it is configured *and* usable, the local SQLite mirror
// otherwise. Both are exposed through one async API so the CLI and the admin UI
// do not care which they are talking to — which is also what makes the
// migration painless, and what keeps them working mid-migration.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hasSupabase, SUPABASE_URL } from './env.mjs';

const MIRROR = join(resolve(import.meta.dirname, '..'), 'data', 'content.db');

const sqliteStore = async () => {
  const lite = await import('./db.mjs');
  const wrap = (fn) => async (...args) => fn(...args);
  return {
    ready: async () => {
      if (!lite.isInitialised()) throw new Error(`No content at ${MIRROR}. Run: npm run mirror:seed`);
      return true;
    },
    allPosts: wrap(lite.allPosts),
    livePosts: wrap(lite.livePosts),
    postBySlug: wrap(lite.postBySlug),
    scheduledPosts: wrap(lite.scheduledPosts),
    savePost: wrap(lite.savePost),
    setStatus: wrap(lite.setStatus),
    deletePost: wrap(lite.deletePost),
    revisions: wrap(lite.revisions),
    restoreRevision: wrap(lite.restoreRevision),
    allCategories: wrap(lite.allCategories),
    allAuthors: wrap(lite.allAuthors),
    upsertAuthor: wrap(lite.upsertAuthor),
    upsertCategory: wrap(lite.upsertCategory),
    stats: wrap(lite.stats),
  };
};

const supabaseStore = (sb) => ({
  ready: () => sb.ping(),
  allPosts: sb.allPosts,
  livePosts: sb.livePosts,
  postBySlug: (slug) => sb.postBySlug(slug),
  scheduledPosts: sb.scheduledPosts,
  savePost: sb.savePost,
  setStatus: sb.setStatus,
  deletePost: sb.deletePost,
  revisions: sb.revisions,
  restoreRevision: sb.restoreRevision,
  allCategories: sb.allCategories,
  allAuthors: sb.allAuthors,
  upsertAuthor: sb.upsertAuthor,
  upsertCategory: sb.upsertCategory,
  stats: sb.stats,
});

let api;
let _driver = 'sqlite';
let _target = 'data/content.db';
let _note = '';

if (hasSupabase) {
  const sb = await import('./supabase.mjs');
  try {
    // Probe once at startup. Configured-but-not-ready is a normal state during
    // setup, and it should not take the tooling down when a mirror exists.
    await sb.ping();
    api = supabaseStore(sb);
    _driver = 'supabase';
    _target = new URL(SUPABASE_URL).host;
  } catch (err) {
    if (!existsSync(MIRROR)) {
      throw new Error(
        `Supabase is configured but not usable, and there is no local mirror to fall back on.\n${err.message}`
      );
    }
    api = await sqliteStore();
    _note =
      `Supabase is configured but not ready yet — using the local mirror instead.\n` +
      `  ${err.message.split('\n')[0]}\n` +
      `  Apply the schema (npm run db:copy), then: npm run db:push`;
    console.warn('\n' + _note + '\n');
  }
} else {
  api = await sqliteStore();
}

export const driver = _driver;
export const target = _target;
export const note = _note;

export const {
  ready,
  allPosts,
  livePosts,
  postBySlug,
  scheduledPosts,
  savePost,
  setStatus,
  deletePost,
  revisions,
  restoreRevision,
  allCategories,
  allAuthors,
  upsertAuthor,
  upsertCategory,
  stats,
} = api;
