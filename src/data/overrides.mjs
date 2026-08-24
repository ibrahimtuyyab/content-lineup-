// Site content overrides — the loader half.
//
// Everything on the marketing pages that is not a post and not a plan lives in
// src/data/site.defaults.mjs and src/data/links.defaults.mjs. Those files are
// the shipped content and they are never edited by the admin. What the admin
// writes instead is an override row in the `content_blocks` table, keyed by the
// name the templates import the value under.
//
// The same three-tier fallback the rest of the site uses, for the same reason —
// a static build must not fall over when a network hiccups:
//
//   1. Neon                    — the live overrides
//   2. data/site-cache.json    — written on every successful fetch
//   3. no overrides at all     — the defaults in the repository apply
//
// The third tier is why this file can never fail. A clone with no .env, no
// database and no cache still builds the real site, because the content is in
// the repository and the database only carries the edits made to it.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { hasNeon, neonHost } from '../../db/env.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CACHE = join(ROOT, 'data', 'site-cache.json');

const readCache = () => {
  if (!existsSync(CACHE)) return null;
  try {
    const { blocks, fetchedAt } = JSON.parse(readFileSync(CACHE, 'utf8'));
    return blocks && typeof blocks === 'object' ? { blocks, fetchedAt } : null;
  } catch {
    return null;
  }
};

const writeCache = (blocks) => {
  try {
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), blocks }, null, 2));
  } catch (err) {
    console.warn(`Could not write the site content cache: ${err.message}`);
  }
};

async function load() {
  if (hasNeon) {
    try {
      const neon = await import('../../db/neon.mjs');
      const blocks = await neon.allBlocks();
      writeCache(blocks);
      const n = Object.keys(blocks).length;
      if (n) console.log(`Site content: ${n} edited block${n === 1 ? '' : 's'} from Neon (${neonHost()})`);
      return blocks;
    } catch (err) {
      console.warn(`Site content: Neon unavailable (${err.message.split('\n')[0]})`);
      const cached = readCache();
      if (cached) {
        console.warn(`  Falling back to the cache written at ${cached.fetchedAt}`);
        return cached.blocks;
      }
      console.warn('  Using the defaults in src/data/site.defaults.mjs');
      return {};
    }
  }

  const cached = readCache();
  if (cached) return cached.blocks;
  return {};
}

/** Raw override documents, as { key: value }. Absent key = no override. */
export const overrides = await load();

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Lay an override over a default.
 *
 * Objects merge key by key; arrays and scalars replace wholesale. The asymmetry
 * is deliberate. An array is an ordered list whose whole point is the order and
 * the length, so merging one item-by-item would make deleting the last item
 * impossible. An object is a bag of named fields, and merging it means a field
 * added to the defaults later still appears on a page whose override was
 * written before that field existed — instead of silently vanishing from the
 * site because an old row does not mention it.
 */
export const merge = (base, over) => {
  if (over === undefined) return base;
  if (isPlainObject(base) && isPlainObject(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over;
};
