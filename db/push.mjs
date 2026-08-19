// Push local content into Supabase.
//
//   npm run db:schema        print the SQL to apply (or --apply if you have a direct DB URL)
//   npm run db:push          upsert authors, categories and every post
//   npm run db:push -- --dry show what would be pushed, change nothing
//
// Source of truth for the push is the local SQLite mirror if it exists,
// otherwise the launch content modules — so this works both for migrating an
// existing database and for populating a brand-new Supabase project.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SUPABASE_URL, SERVICE_KEY, requireSupabase } from './env.mjs';
import * as sb from './supabase.mjs';
import { site } from '../src/data/site.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const SQLITE = join(ROOT, 'data', 'content.db');
const dry = process.argv.includes('--dry');

/* ------------------------------------------------------------------ source */
async function readSource() {
  if (existsSync(SQLITE)) {
    const lite = await import('./db.mjs');
    if (lite.isInitialised()) {
      const posts = lite.allPosts();
      return {
        from: 'data/content.db',
        authors: lite.allAuthors(),
        categories: lite.allCategories(),
        posts,
      };
    }
  }
  const { seedPosts } = await import('./seed-content/index.mjs');
  return {
    from: 'db/seed-content/',
    authors: [
      {
        slug: 'iqbal-hussain',
        name: 'Iqbal Hussain',
        email: site.email,
        bio: 'Builds ContentLineup at Teczon Labs. Writes about getting content published consistently.',
        url: site.origin + '/about',
      },
    ],
    categories: [
      { slug: 'guides', label: 'Guides', singular: 'Guide', sort: 1 },
      { slug: 'case-studies', label: 'Case studies', singular: 'Case study', sort: 2 },
      { slug: 'comparisons', label: 'Comparisons', singular: 'Comparison', sort: 3 },
      { slug: 'product-updates', label: 'Product updates', singular: 'Product update', sort: 4 },
    ],
    posts: seedPosts.map((p) => ({
      ...p,
      authorSlug: 'iqbal-hussain',
      bodyFormat: 'html',
      status: 'published',
      body: p.body.trim(),
    })),
  };
}

/* -------------------------------------------------------------------- main */
const fail = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

// A dry run only reads local content, so it needs no credentials at all.
if (!dry) {
  try {
    requireSupabase();
  } catch (err) {
    fail(err.message);
  }
  if (!SERVICE_KEY) {
    fail(
      'Pushing needs the service_role key.\n' +
        'Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase dashboard → Settings → API).'
    );
  }
}

const src = await readSource();
console.log(`Source: ${src.from}`);
console.log(`Target: ${SUPABASE_URL ? new URL(SUPABASE_URL).host : '(not configured)'}`);
console.log(
  `        ${src.posts.length} posts · ${src.categories.length} categories · ${src.authors.length} author(s)\n`
);

if (dry) {
  for (const p of src.posts) {
    console.log(`  would push  ${String(p.status).padEnd(10)} ${p.category.padEnd(16)} ${p.slug}`);
  }
  console.log('\nDry run — nothing was written.');
  process.exit(0);
}

// Fail early and clearly if the schema has not been applied yet.
try {
  await sb.ping();
} catch (err) {
  console.error(
    `\nCannot read from Supabase yet.\n${err.message}\n\n` +
      `Apply the schema first — run:  npm run db:schema\n` +
      `then paste the output into the Supabase SQL Editor and run it.`
  );
  process.exit(1);
}

console.log('Authors and categories…');
for (const a of src.authors) {
  await sb.upsertAuthor({ slug: a.slug, name: a.name, email: a.email, bio: a.bio, url: a.url });
  console.log(`  author    ${a.slug}`);
}
for (const c of src.categories) {
  await sb.upsertCategory({ slug: c.slug, label: c.label, singular: c.singular, sort: c.sort });
  console.log(`  category  ${c.slug}`);
}

console.log('\nPosts…');
let ok = 0;
const failed = [];
for (const p of src.posts) {
  try {
    await sb.savePost({
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
      notes: p.notes || null,
    });
    ok++;
    console.log(`  ✓ ${String(p.status).padEnd(10)} ${p.slug}`);
  } catch (err) {
    failed.push({ slug: p.slug, error: err.message });
    console.log(`  ✗ ${p.slug} — ${err.message}`);
  }
}

const after = await sb.stats();
console.log(
  `\nPushed ${ok}/${src.posts.length} posts.\n` +
    `Supabase now holds ${after.posts} posts (${after.published} published, ` +
    `${after.scheduled} scheduled, ${after.drafts} draft), ${after.faqs} FAQ entries, ` +
    `${after.keywords} keywords.`
);

if (failed.length) {
  console.log(`\n${failed.length} failed:`);
  failed.forEach((f) => console.log(`  ${f.slug}: ${f.error}`));
  process.exit(1);
}

console.log('\nNext: npm run build');
