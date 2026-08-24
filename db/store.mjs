// Store selector.
//
// Supabase when it is configured *and* usable, the local SQLite mirror
// otherwise. Both are exposed through one async API so the CLI and the admin UI
// do not care which they are talking to — which is also what makes the
// migration painless, and what keeps them working mid-migration.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hasSupabase, SUPABASE_URL, hasNeon, neonHost } from './env.mjs';

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
    // See the note above planless(): the mirror holds content, not pricing.
    ...planless('the local SQLite mirror'),
    ...blockless('the local SQLite mirror'),
    ...undeletable('the local SQLite mirror'),
  };
};

/**
 * The plan half of the API for a store that does not carry pricing.
 *
 * allPlans returning [] is not an error — it is how the build is told to use
 * the defaults in src/data/site.mjs. Writes throw, because silently dropping an
 * edit someone just typed into the admin would be worse than refusing it.
 */
const planless = (what) => ({
  allPlans: async () => [],
  planBySlug: async () => null,
  savePlan: async () => {
    throw new Error(
      `Pricing plans are stored in Postgres, and this session is using ${what}.\n` +
        '  Set DATABASE_URL in .env, then: npm run neon:setup && npm run plans:push'
    );
  },
  deletePlan: async () => {
    throw new Error(`Pricing plans are stored in Postgres, and this session is using ${what}.`);
  },
  setPlanFeatured: async () => {
    throw new Error(`Pricing plans are stored in Postgres, and this session is using ${what}.`);
  },
});

/**
 * The site-content half of the API for a store that does not carry it.
 *
 * Same reasoning as planless(): reading returns nothing, which the build reads
 * as "use the defaults that ship in src/data/*.defaults.mjs", while a write
 * throws rather than silently discarding something someone just typed.
 */
const blockless = (what) => ({
  allBlocks: async () => ({}),
  blockRows: async () => [],
  blockByKey: async () => null,
  saveBlock: async () => {
    throw new Error(
      `Site content blocks are stored in Postgres, and this session is using ${what}.
` +
        '  Set DATABASE_URL in .env, then: npm run neon:setup'
    );
  },
  deleteBlock: async () => {
    throw new Error(`Site content blocks are stored in Postgres, and this session is using ${what}.`);
  },
});

/**
 * Author and category reads that only the Postgres layer implements, plus the
 * deletes. The reads degrade to empty rather than throwing, so the admin can
 * still list what the other stores do expose.
 */
const undeletable = (what) => ({
  deleteAuthor: async () => {
    throw new Error(`Deleting authors needs Postgres; this session is using ${what}.`);
  },
  deleteCategory: async () => {
    throw new Error(`Deleting categories needs Postgres; this session is using ${what}.`);
  },
  authorBySlug: async () => null,
  categoryBySlug: async () => null,
  authorUsage: async () => ({}),
  categoryUsage: async () => ({}),
});

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
  // The Supabase adapter has no pricing tables; Neon is where plans live.
  ...planless('Supabase'),
  ...blockless('Supabase'),
  ...undeletable('Supabase'),
  stats: sb.stats,
});

const neonStore = (n) => ({
  ready: () => n.ping(),
  allPosts: n.allPosts,
  livePosts: n.livePosts,
  postBySlug: n.postBySlug,
  scheduledPosts: n.scheduledPosts,
  savePost: n.savePost,
  setStatus: n.setStatus,
  deletePost: n.deletePost,
  revisions: n.revisions,
  restoreRevision: n.restoreRevision,
  allCategories: n.allCategories,
  allAuthors: n.allAuthors,
  upsertAuthor: n.upsertAuthor,
  upsertCategory: n.upsertCategory,
  stats: n.stats,
  allPlans: n.allPlans,
  planBySlug: n.planBySlug,
  savePlan: n.savePlan,
  deletePlan: n.deletePlan,
  setPlanFeatured: n.setPlanFeatured,
  allBlocks: n.allBlocks,
  blockRows: n.blockRows,
  blockByKey: n.blockByKey,
  saveBlock: n.saveBlock,
  deleteBlock: n.deleteBlock,
  deleteAuthor: n.deleteAuthor,
  deleteCategory: n.deleteCategory,
  authorBySlug: n.authorBySlug,
  categoryBySlug: n.categoryBySlug,
  authorUsage: n.authorUsage,
  categoryUsage: n.categoryUsage,
});

let api;
let _driver = 'sqlite';
let _target = 'data/content.db';
let _note = '';

if (hasNeon) {
  const n = await import('./neon.mjs');
  try {
    await n.ping();
    api = neonStore(n);
    _driver = 'neon';
    _target = neonHost();
  } catch (err) {
    if (!existsSync(MIRROR)) throw err;
    api = await sqliteStore();
    _note =
      'Neon is configured but not ready yet — using the local mirror instead.\n' +
      `  ${err.message.split('\n')[0]}\n` +
      '  Apply the schema and migrate:  npm run neon:setup';
    console.warn('\n' + _note + '\n');
  }
} else if (hasSupabase) {
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
  allPlans,
  planBySlug,
  savePlan,
  deletePlan,
  setPlanFeatured,
  allBlocks,
  blockRows,
  blockByKey,
  saveBlock,
  deleteBlock,
  deleteAuthor,
  deleteCategory,
  authorBySlug,
  categoryBySlug,
  authorUsage,
  categoryUsage,
} = api;
