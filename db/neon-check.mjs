// Verify the Neon database: connectivity, schema, contents, and agreement with
// whatever the site would build from.
//
//   npm run neon:check
import { hasNeon, neonHost } from './env.mjs';
import * as neon from './neon.mjs';

if (!hasNeon) {
  console.error(
    '\nNo Neon connection string. Add DATABASE_URL to .env, or run:\n' +
      '  vercel env pull .env.local\n'
  );
  process.exit(1);
}

console.log(`Neon: ${neonHost()}\n`);

try {
  const who = await neon.whoami();
  console.log(`  database  ${who.db}`);
  console.log(`  user      ${who.usr}`);
  console.log(`  server    ${String(who.version).split(' on ')[0]}\n`);
} catch (err) {
  console.error(`Cannot connect: ${err.message}\n`);
  process.exit(1);
}

// Tables and views the build depends on.
const expected = [
  'authors',
  'categories',
  'posts',
  'post_keywords',
  'post_faqs',
  'post_revisions',
  'v_posts',
  'live_posts',
];
const present = (
  await neon.sql(
    `select table_name from information_schema.tables
      where table_schema = 'public' and table_name = any($1)`,
    [expected]
  )
).map((r) => r.table_name);

let missing = 0;
console.log('Schema:');
for (const t of expected) {
  const ok = present.includes(t);
  if (!ok) missing++;
  console.log(`  ${ok ? '✓' : '✗'} ${t}`);
}

if (missing) {
  console.error(`\n${missing} objects missing. Run: npm run neon:setup\n`);
  process.exit(1);
}

const s = await neon.stats();
console.log('\nContents:');
for (const [k, v] of Object.entries(s)) console.log(`  ${k.padEnd(12)} ${v}`);

const live = await neon.livePosts();
console.log(`\nThe site would build ${live.length} posts from Neon:`);
for (const p of live) {
  console.log(
    `  ${(p.published || '—').padEnd(11)} ${String(p.category).padEnd(16)} ${p.slug}` +
      `  (${p.faqs?.length || 0} faqs, ${p.secondaryKeywords.length} kw)`
  );
}

// Content integrity — a post that renders empty is worse than one that errors.
const problems = live.filter((p) => !p.body || !p.title || !p.category);
if (problems.length) {
  console.error(`\n✗ ${problems.length} posts have missing body/title/category`);
  process.exit(1);
}

console.log('\n✓ Neon is ready. `npm run build` will read from it.');
