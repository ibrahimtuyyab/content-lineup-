// Push the pricing plans in src/data/site.mjs into the database.
//
//   node db/plans-push.mjs          → write any plan that is missing or changed
//   node db/plans-push.mjs --force  → rewrite every plan from the file
//
// This is the one-way trip from code to database. After the first push the
// database is the source of truth and the admin is how you edit it; the array
// in src/data/site.mjs stays behind as the build's fallback, for the case where
// the database is unreachable at build time.
import { plans as filePlans } from '../src/data/site.mjs';
import { driver, target, ready, allPlans, savePlan } from './store.mjs';

const force = process.argv.includes('--force');

try {
  await ready();
} catch (err) {
  console.error(`Cannot reach the store (${driver} → ${target}).\n${err.message}`);
  process.exit(1);
}

console.log(`Target: ${driver} → ${target}\n`);

const existing = new Map((await allPlans()).map((p) => [p.id, p]));

/** Everything the database stores, in a form two plans can be compared by. */
const fingerprint = (p) =>
  JSON.stringify([
    p.name,
    p.price,
    p.period,
    String(p.numeric),
    p.annual
      ? [p.annual.price, String(p.annual.numeric), p.annual.perMonth, p.annual.saving]
      : null,
    p.kicker,
    p.outcome,
    p.summary,
    p.ctaLabel || p.cta?.label || 'Start free',
    !!p.featured,
    p.includes,
    p.limits,
  ]);

let written = 0;
let skipped = 0;

for (const [i, plan] of filePlans.entries()) {
  const was = existing.get(plan.id);
  const unchanged = was && fingerprint(was) === fingerprint(plan);

  if (unchanged && !force) {
    console.log(`  · ${plan.id.padEnd(10)} unchanged`);
    skipped++;
    continue;
  }
  try {
    await savePlan({ ...plan, sort: i });
    console.log(`  ${was ? '~' : '+'} ${plan.id.padEnd(10)} ${was ? 'updated' : 'created'}  ${plan.name} · ${plan.price}`);
    written++;
  } catch (err) {
    console.error(`  x ${plan.id.padEnd(10)} ${err.message.split('\n')[0]}`);
    process.exitCode = 1;
  }
}

const after = await allPlans();
console.log(`\n${written} written, ${skipped} unchanged · ${after.length} plans in the database`);
const featured = after.filter((p) => p.featured).map((p) => p.id);
console.log(`featured: ${featured.length ? featured.join(', ') : 'none'}`);
