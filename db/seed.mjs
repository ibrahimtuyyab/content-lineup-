// Import the launch articles into the content database.
//
//   node db/seed.mjs
//
// Idempotent: posts are upserted by slug, so re-running refreshes them rather
// than duplicating. The source modules in db/seed-content/ are the original
// import payload only — after seeding, the database is the source of truth and
// the site never reads those files again.
import { migrate, upsertAuthor, upsertCategory, savePost, stats } from './db.mjs';
import { seedPosts } from './seed-content/index.mjs';
import { site } from '../src/data/site.mjs';

migrate();

/* --- authors ------------------------------------------------------------- */
upsertAuthor({
  slug: 'iqbal-hussain',
  name: 'Iqbal Hussain',
  email: site.email,
  bio: 'Builds ContentLineup at Teczon Labs. Writes about getting content published consistently.',
  url: site.origin + '/about',
});

/* --- categories ---------------------------------------------------------- */
const CATEGORIES = [
  { slug: 'guides', label: 'Guides', singular: 'Guide', sort: 1 },
  { slug: 'case-studies', label: 'Case studies', singular: 'Case study', sort: 2 },
  { slug: 'comparisons', label: 'Comparisons', singular: 'Comparison', sort: 3 },
  { slug: 'product-updates', label: 'Product updates', singular: 'Product update', sort: 4 },
];
CATEGORIES.forEach(upsertCategory);

/* --- posts --------------------------------------------------------------- */
// Bodies are stored as the finished HTML the modules already produced, so the
// rendered site is byte-identical to the pre-database build.
let created = 0;
for (const p of seedPosts) {
  savePost({
    slug: p.slug,
    category: p.category,
    authorSlug: 'iqbal-hussain',
    title: p.title,
    metaTitle: p.metaTitle,
    description: p.description,
    excerpt: p.excerpt,
    body: p.body.trim(),
    bodyFormat: 'html',
    primaryKeyword: p.primaryKeyword || null,
    secondaryKeywords: p.secondaryKeywords || [],
    thumb: p.thumb,
    readMins: p.readMins,
    featured: !!p.featured,
    status: 'published',
    published: p.published,
    modified: p.modified,
    faqs: p.faqs || [],
    revisionNote: 'Seeded from launch content',
  });
  created++;
  console.log(`  ${p.category.padEnd(16)} ${p.slug}`);
}

const s = stats();
console.log(
  `\nSeeded ${created} posts · ${s.categories} categories · ${s.authors} author · ` +
    `${s.faqs} FAQ entries · ${s.keywords} secondary keywords`
);
console.log('Next: npm run build');
