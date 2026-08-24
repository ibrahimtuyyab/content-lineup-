// The site's view of the pricing plans.
//
// Source of truth is the `plans` table in Neon, edited through the admin at
// `npm run admin`. A static build must not fall over when the network hiccups
// and must never publish an empty pricing page, so there are two fallbacks:
//
//   1. Neon                      — the live plans
//   2. data/pricing-cache.json   — written on every successful fetch
//   3. src/data/site.mjs         — the array the plans were seeded from
//
// The last one is the reason this file can never fail: the defaults ship in the
// repository, so a build with no database at all still renders real pricing.
//
// Top-level await means page modules keep importing `plans` synchronously; the
// module graph waits for the fetch before any renderer runs — the same shape as
// src/data/content.mjs.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { hasNeon, neonHost } from '../../db/env.mjs';
import { site, plans as defaultPlans } from './site.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CACHE = join(ROOT, 'data', 'pricing-cache.json');

const readCache = () => {
  if (!existsSync(CACHE)) return null;
  try {
    const { plans, fetchedAt } = JSON.parse(readFileSync(CACHE, 'utf8'));
    return plans?.length ? { plans, fetchedAt } : null;
  } catch {
    return null;
  }
};

const writeCache = (plans) => {
  try {
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), plans }, null, 2));
  } catch (err) {
    console.warn(`Could not write pricing cache: ${err.message}`);
  }
};

/**
 * Put a database row into the shape the templates read.
 *
 * The CTA href is not stored per plan — every plan points at the same signup
 * URL, so it comes from site config here rather than being repeated in three
 * rows that could drift apart.
 */
const shape = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  period: p.period,
  numeric: p.numeric,
  annual: p.annual,
  kicker: p.kicker,
  outcome: p.outcome,
  summary: p.summary,
  cta: { label: p.ctaLabel || p.cta?.label || 'Start free', href: site.app.signup },
  featured: !!p.featured,
  includes: p.includes || [],
  limits: p.limits,
});

async function load() {
  if (hasNeon) {
    try {
      const neon = await import('../../db/neon.mjs');
      const rows = await neon.allPlans();
      if (rows.length) {
        writeCache(rows);
        console.log(`Pricing: ${rows.length} plans from Neon (${neonHost()})`);
        return rows;
      }
      // A reachable but empty table is a setup state, not a failure: the site
      // still needs prices, so fall through rather than shipping a blank page.
      console.warn('Pricing: the plans table is empty — using the defaults in src/data/site.mjs');
      console.warn('  Seed it with: npm run plans:push');
    } catch (err) {
      console.warn(`Pricing: Neon unavailable (${err.message.split('\n')[0]})`);
      const cached = readCache();
      if (cached) {
        console.warn(`  Falling back to the cache written at ${cached.fetchedAt}`);
        return cached.plans;
      }
    }
  }

  const cached = readCache();
  if (cached) {
    console.warn(`Pricing: using cache from ${cached.fetchedAt} (no database configured)`);
    return cached.plans;
  }

  console.log(`Pricing: ${defaultPlans.length} plans from src/data/site.mjs (no database configured)`);
  return defaultPlans;
}

/** The plans the site renders, cheapest first. */
export const plans = (await load()).map(shape);
