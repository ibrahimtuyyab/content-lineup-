// ContentLineup static site generator — zero dependencies.
//   node build.mjs        → writes ./dist
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

import { site, screenOrder, plans, socialPlatforms, comingSoon } from './src/data/site.mjs';
import { renderScreen, SCREEN_EXT } from './src/lib/screens.mjs';
import { posts } from './src/data/content.mjs';
import home from './src/pages/home.mjs';
import madeForPage from './src/pages/audience.mjs';
import {
  featuresPage,
  howItWorksPage,
  integrationsPage,
  pricingPage,
  whyPage,
} from './src/pages/product.mjs';
import vsBufferPage from './src/pages/vs-buffer.mjs';
import {
  securityPage,
  faqPage,
  aboutPage,
  contactPage,
  privacyPage,
  termsPage,
  notFoundPage,
} from './src/pages/company.mjs';
import { resourcesHub, articlePage } from './src/pages/resources.mjs';

const ROOT = resolve(import.meta.dirname);
const DIST = join(ROOT, 'dist');

/* ------------------------------------------------------------------ routes */
// changefreq/priority feed sitemap.xml; `lastmod` defaults to the build date.
const routes = [
  { path: '/', render: home, priority: '1.0', changefreq: 'weekly' },
  { path: '/features', render: featuresPage, priority: '0.9', changefreq: 'monthly', image: '/og/features.png' },
  { path: '/how-it-works', render: howItWorksPage, priority: '0.9', changefreq: 'monthly' },
  { path: '/made-for', render: madeForPage, priority: '0.9', changefreq: 'monthly', image: '/og/made-for.png' },
  { path: '/integrations', render: integrationsPage, priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing', render: pricingPage, priority: '0.9', changefreq: 'monthly', image: '/og/pricing.png' },
  { path: '/why-contentlineup', render: whyPage, priority: '0.8', changefreq: 'monthly', image: '/og/why.png' },
  { path: '/compare/contentlineup-vs-buffer', render: vsBufferPage, priority: '0.7', changefreq: 'monthly' },
  { path: '/resources', render: resourcesHub, priority: '0.8', changefreq: 'weekly', image: '/og/resources.png' },
  { path: '/security', render: securityPage, priority: '0.7', changefreq: 'yearly', image: '/og/security.png' },
  { path: '/faq', render: faqPage, priority: '0.7', changefreq: 'monthly' },
  { path: '/about', render: aboutPage, priority: '0.6', changefreq: 'yearly' },
  { path: '/contact', render: contactPage, priority: '0.6', changefreq: 'yearly' },
  { path: '/privacy', render: privacyPage, priority: '0.3', changefreq: 'yearly', noSitemapDate: true },
  { path: '/terms', render: termsPage, priority: '0.3', changefreq: 'yearly', noSitemapDate: true },
  ...posts.map((p) => ({
    path: p.path,
    render: () => articlePage(p),
    priority: p.featured ? '0.8' : '0.7',
    changefreq: 'monthly',
    lastmod: p.modified,
    image: '/og/' + p.slug + '.png',
    imageTitle: p.title,
  })),
];

/* -------------------------------------------------------------- minifiers */
// Conservative: strips comments and indentation only. No token-level rewriting,
// so there is nothing here that can silently change behaviour.
const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

const minifyHtml = (html) =>
  html
    .split('\n')
    .map((l) => l.replace(/^\s+/, ''))
    .filter((l) => l.length)
    .join('\n');

/* ------------------------------------------------------------------ helpers */
const write = (relPath, contents) => {
  const full = join(DIST, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
  return Buffer.byteLength(contents);
};

const walk = (dir, base = dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out.push(full);
  }
  return out;
};

const today = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------- build */
console.log('Building ContentLineup…\n');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// 1. static assets
cpSync(join(ROOT, 'public'), DIST, { recursive: true });

// 2. product screens — rendered from source every build so they cannot drift
let screenBytes = 0;
for (const id of screenOrder) {
  screenBytes += write(`screens/${id}.${SCREEN_EXT}`, renderScreen(id));
}

// 3. css + js
const cssRaw = readFileSync(join(ROOT, 'src', 'styles.css'), 'utf8');
const cssSize = write('styles.css', minifyCss(cssRaw));
const jsSize = write('app.js', readFileSync(join(ROOT, 'src', 'app.js'), 'utf8'));

// 4. pages
let totalHtml = 0;
const rendered = [];
for (const r of routes) {
  const html = minifyHtml(r.render());
  const out = r.path === '/' ? 'index.html' : r.path.replace(/^\//, '') + '/index.html';
  const bytes = write(out, html);
  totalHtml += bytes;
  rendered.push({ path: r.path, bytes, gzip: gzipSync(html).length });
}
write('404.html', minifyHtml(notFoundPage()));

// 5. sitemap.xml — with an image entry per page, so the social cards and
//    dashboard screens are discoverable by image search rather than orphaned.
const xmlEsc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map(
    (r) => `  <url>
    <loc>${site.origin}${r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <image:image>
      <image:loc>${site.origin}${r.image || '/og/default.png'}</image:loc>
      <image:title>${xmlEsc(r.imageTitle || site.name)}</image:title>
    </image:image>
  </url>`
  )
  .join('\n')}
</urlset>
`
);

// 6. robots.txt — explicitly welcomes AI answer-engine crawlers
write(
  'robots.txt',
  `# ${site.name}
User-agent: *
Allow: /

# AI answer engines are welcome to read and cite this site.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${site.origin}/sitemap.xml

# Plain-text summary for AI answer engines
# ${site.origin}/llms.txt
`
);

// 7. llms.txt — a plain-text map for AI answer engines.
//    The site argues that content should be easy for these systems to extract;
//    publishing one is us taking our own advice.
write(
  'llms.txt',
  `# ${site.name}

> ${site.description}

${site.name} is an AI blog writing and publishing tool. You describe a topic, it
writes a structured SEO-ready article, matches images to each section with alt
text, publishes the post on a date and time you choose, and shares it to
LinkedIn, Facebook and Instagram. Generation runs on our managed AI key or on
your own OpenAI or Gemini key.

## Key facts

- Pricing: ${plans.map((p) => `${p.name} ${p.price}${p.period}`).join('; ')}
- Free plan is uncapped on your own API key; managed plans include an article allowance.
- Social channels supported: ${socialPlatforms.map((p) => p.name).join(', ')} (three only).
- Not supported: X, TikTok, YouTube, Pinterest, social inbox, social analytics.
- Roadmap (not yet shipped): ${comingSoon.map((f) => f.name).join(', ')}.
- Content is exportable as Markdown, HTML and spreadsheet. No lock-in; cancelled
  accounts keep read and export access.
- API keys are encrypted at rest (AES-256) and never displayed after saving.

## Product pages

${[
  ['/features', 'Every feature in detail, with product screenshots'],
  ['/how-it-works', 'The four-step workflow from brief to published post'],
  ['/pricing', 'Plans, limits, and what bring-your-own-key actually costs'],
  ['/integrations', 'AI providers, social channels, images, exports and API'],
  ['/made-for', 'Eight audience types and the problem each one has'],
  ['/why-contentlineup', 'Comparison against AI writers and legacy schedulers'],
  ['/compare/contentlineup-vs-buffer', 'Head-to-head with Buffer, including where Buffer wins'],
  ['/security', 'How API keys and content are handled'],
  ['/faq', 'Full FAQ'],
]
  .map(([p, d]) => `- [${p}](${site.origin}${p}): ${d}`)
  .join('\n')}

## Articles

${posts
  .map((p) => `- [${p.title}](${site.origin}${p.path}): ${p.excerpt}`)
  .join('\n')}

## Feeds

- [Sitemap](${site.origin}/sitemap.xml)
- [RSS](${site.origin}/feed.xml)

## Contact

${site.email}
`
);

// 8. RSS feed for the resources hub
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${site.name} — Resources</title>
  <link>${site.origin}/resources</link>
  <description>Guides, case studies and comparisons on publishing content consistently.</description>
  <language>en-us</language>
  <atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml"/>
${posts
  .map(
    (p) => `  <item>
    <title>${p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
    <link>${site.origin}${p.path}</link>
    <guid isPermaLink="true">${site.origin}${p.path}</guid>
    <pubDate>${new Date(p.published + 'T09:00:00Z').toUTCString()}</pubDate>
    <category>${p.categoryLabel}</category>
    <description>${p.excerpt.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</description>
  </item>`
  )
  .join('\n')}
</channel>
</rss>
`;
write('feed.xml', rss);

/* ------------------------------------------------------------------ report */
const allFiles = walk(DIST);
const totalBytes = allFiles.reduce((n, f) => n + statSync(f).size, 0);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

console.log('Pages');
for (const r of rendered.sort((a, b) => b.bytes - a.bytes)) {
  console.log(`  ${r.path.padEnd(58)} ${kb(r.bytes).padStart(9)}  (${kb(r.gzip)} gzip)`);
}
console.log(`\nAssets`);
console.log(`  styles.css${' '.repeat(48)} ${kb(cssSize).padStart(9)}  (${kb(gzipSync(readFileSync(join(DIST, 'styles.css'))).length)} gzip)`);
console.log(`  app.js${' '.repeat(52)} ${kb(jsSize).padStart(9)}  (${kb(gzipSync(readFileSync(join(DIST, 'app.js'))).length)} gzip)`);
console.log(
  `\n${rendered.length + 1} HTML pages · ${allFiles.length} files · ${kb(totalBytes)} total in dist/\n`
);
