// Apply the Neon schema and migrate all content into it.
//
//   npm run neon:setup            schema + migrate, from the best available source
//   npm run neon:setup -- --dry   show what would happen, change nothing
//   npm run neon:setup -- --from sqlite|supabase
//
// Source precedence when --from is not given: Supabase if it is configured and
// reachable, otherwise the local SQLite mirror. Both hold the same content; the
// point is to migrate from whichever is currently authoritative.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hasNeon, neonHost, hasSupabase } from './env.mjs';
import * as neon from './neon.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const fromFlag = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;

const fail = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

if (!hasNeon && !dry) {
  fail(
    'No Neon connection string found.\n\n' +
      'Add it to .env as DATABASE_URL, e.g.\n' +
      '  DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require\n\n' +
      'Get it from: Vercel -> your project -> Storage -> Neon -> .env.local snippet\n' +
      'Or run:      vercel env pull .env.local'
  );
}

/* ---------------------------------------------------------------- SQL split */
/**
 * Split a schema file into individual statements.
 *
 * Neon's HTTP endpoint runs one statement per request, so the file cannot be
 * sent whole. Splitting on ";" alone would break the plpgsql function bodies,
 * which contain semicolons inside $$ ... $$ — so dollar-quoted blocks are
 * tracked and skipped over.
 */
export function splitStatements(sql) {
  const out = [];
  let buf = '';
  let i = 0;
  let dollarTag = null;

  while (i < sql.length) {
    const ch = sql[i];

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        buf += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      buf += ch;
      i++;
      continue;
    }

    // Line comment
    if (ch === '-' && sql[i + 1] === '-') {
      const nl = sql.indexOf('\n', i);
      i = nl === -1 ? sql.length : nl + 1;
      buf += '\n';
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      const end = (() => {
        let j = i + 1;
        while (j < sql.length) {
          if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
          else if (sql[j] === "'") return j;
          else j++;
        }
        return sql.length;
      })();
      buf += sql.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    // Opening dollar quote, e.g. $$ or $tag$
    const dq = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
    if (dq) {
      dollarTag = dq[0];
      buf += dollarTag;
      i += dollarTag.length;
      continue;
    }

    if (ch === ';') {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
      i++;
      continue;
    }

    buf += ch;
    i++;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}

/* ------------------------------------------------------------------ source */
async function readSource() {
  const wantSupabase = fromFlag === 'supabase' || (!fromFlag && hasSupabase);

  if (wantSupabase) {
    try {
      const sb = await import('./supabase.mjs');
      await sb.ping();
      return {
        name: 'Supabase',
        posts: await sb.allPosts(),
        categories: await sb.allCategories(),
        authors: await sb.allAuthors(),
      };
    } catch (err) {
      if (fromFlag === 'supabase') fail(`Cannot read from Supabase: ${err.message}`);
      console.warn(`Supabase unreadable (${err.message.split('\n')[0]}) — falling back to SQLite.`);
    }
  }

  const lite = await import('./db.mjs');
  if (!lite.isInitialised()) fail('No SQLite mirror to migrate from either.');
  return {
    name: 'SQLite mirror (data/content.db)',
    posts: lite.allPosts(),
    categories: lite.allCategories(),
    authors: lite.allAuthors(),
  };
}

/* -------------------------------------------------------------------- main */
const src = await readSource();

console.log(`Source: ${src.name}`);
console.log(`Target: ${dry && !hasNeon ? '(no Neon configured — dry run)' : 'Neon ' + neonHost()}`);
console.log(
  `        ${src.posts.length} posts · ${src.categories.length} categories · ${src.authors.length} author(s)\n`
);

if (dry) {
  for (const p of src.posts) {
    console.log(
      `  would migrate  ${String(p.status).padEnd(10)} ${String(p.category).padEnd(16)} ${p.slug}` +
        `  (${p.faqs?.length || 0} faqs, ${p.secondaryKeywords.length} keywords)`
    );
  }
  console.log('\nDry run — nothing was written.');
  process.exit(0);
}

// 1. Schema
const schema = readFileSync(join(ROOT, 'db', 'schema.neon.sql'), 'utf8');
const statements = splitStatements(schema);
console.log(`Applying schema (${statements.length} statements)…`);

let applied = 0;
for (const [i, stmt] of statements.entries()) {
  try {
    await neon.sql(stmt);
    applied++;
  } catch (err) {
    fail(`Statement ${i + 1} failed:\n\n${stmt.slice(0, 300)}\n\n${err.message}`);
  }
}
console.log(`  ✓ ${applied} statements applied`);

const who = await neon.whoami();
console.log(`  database: ${who.db} · user: ${who.usr}`);

// 2. Reference data
console.log('\nAuthors and categories…');
for (const a of src.authors) {
  await neon.upsertAuthor({ slug: a.slug, name: a.name, email: a.email, bio: a.bio, url: a.url });
  console.log(`  author    ${a.slug}`);
}
for (const c of src.categories) {
  await neon.upsertCategory({ slug: c.slug, label: c.label, singular: c.singular, sort: c.sort });
  console.log(`  category  ${c.slug}`);
}

// 3. Posts
console.log('\nPosts…');
let ok = 0;
const failed = [];
for (const p of src.posts) {
  try {
    await neon.savePost({
      slug: p.slug,
      category: p.category,
      authorSlug: p.authorSlug || 'iqbal-hussain',
      title: p.title,
      metaTitle: p.metaTitle,
      description: p.description,
      excerpt: p.excerpt,
      body: p.body,
      bodyFormat: p.bodyFormat || 'html',
      primaryKeyword: p.primaryKeyword || null,
      secondaryKeywords: p.secondaryKeywords || [],
      thumb: p.thumb,
      readMins: p.readMins,
      featured: !!p.featured,
      status: p.status || 'published',
      published: p.published || null,
      modified: p.modified || p.published || null,
      faqs: p.faqs || [],
      listItems: p.listItems || null,
      notes: p.notes || null,
    });
    ok++;
    console.log(`  ✓ ${String(p.status).padEnd(10)} ${p.slug}`);
  } catch (err) {
    failed.push({ slug: p.slug, error: err.message });
    console.log(`  ✗ ${p.slug} — ${err.message.split('\n')[0]}`);
  }
}

// 4. Verify by comparing what arrived against what was sent
console.log('\nVerifying…');
const after = await neon.stats();
const expectedFaqs = src.posts.reduce((n, p) => n + (p.faqs?.length || 0), 0);
const expectedKeywords = src.posts.reduce((n, p) => n + p.secondaryKeywords.length, 0);

const checks = [
  ['posts', after.posts, src.posts.length],
  ['published', after.published, src.posts.filter((p) => p.status === 'published').length],
  ['categories', after.categories, src.categories.length],
  ['authors', after.authors, src.authors.length],
  ['faq entries', after.faqs, expectedFaqs],
  ['keywords', after.keywords, expectedKeywords],
];

let mismatch = 0;
for (const [label, got, want] of checks) {
  const good = got === want;
  if (!good) mismatch++;
  console.log(`  ${good ? '✓' : '✗'} ${label.padEnd(13)} ${got} (expected ${want})`);
}

if (failed.length || mismatch) {
  console.log(`\n${failed.length} posts failed, ${mismatch} count mismatches.`);
  failed.forEach((f) => console.log(`  ${f.slug}: ${f.error}`));
  process.exit(1);
}

console.log(`\nMigrated ${ok} posts to Neon successfully.`);
console.log('\nNext:');
console.log('  npm run build      # builds from Neon now');
console.log('  Set DATABASE_URL in Vercel so production builds read from Neon too');
