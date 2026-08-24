// ContentLineup static site generator — zero dependencies.
//   node build.mjs        → writes ./dist
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

import { setAssets } from './src/lib/assets.mjs';

import { site, screenOrder, channels, comingSoon, stages } from './src/data/site.mjs';
import { plans } from './src/data/pricing.mjs';
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
  { path: '/how-it-works', render: howItWorksPage, priority: '0.9', changefreq: 'monthly', image: '/og/how-it-works.png' },
  { path: '/made-for', render: madeForPage, priority: '0.9', changefreq: 'monthly', image: '/og/made-for.png' },
  { path: '/integrations', render: integrationsPage, priority: '0.8', changefreq: 'monthly', image: '/og/integrations.png' },
  { path: '/pricing', render: pricingPage, priority: '0.9', changefreq: 'monthly', image: '/og/pricing.png' },
  { path: '/why-contentlineup', render: whyPage, priority: '0.8', changefreq: 'monthly', image: '/og/why.png' },
  { path: '/compare/contentlineup-vs-buffer', render: vsBufferPage, priority: '0.7', changefreq: 'monthly' },
  { path: '/resources', render: resourcesHub, priority: '0.8', changefreq: 'weekly', image: '/og/resources.png' },
  { path: '/security', render: securityPage, priority: '0.7', changefreq: 'yearly', image: '/og/security.png' },
  { path: '/faq', render: faqPage, priority: '0.7', changefreq: 'monthly' },
  { path: '/about', render: aboutPage, priority: '0.6', changefreq: 'yearly', image: '/og/about.png' },
  { path: '/contact', render: contactPage, priority: '0.6', changefreq: 'yearly', image: '/og/contact.png' },
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

// 3. css + js — content-hashed, so the host can cache them for a year with
//    `immutable` and a repeat visitor spends no round-trip revalidating them.
//    A deploy that changes either file changes its URL, so there is no stale
//    window to manage and no cache to purge.
const fingerprint = (contents) => createHash('sha256').update(contents).digest('hex').slice(0, 10);

const cssBody = minifyCss(readFileSync(join(ROOT, 'src', 'styles.css'), 'utf8'));
const jsBody = readFileSync(join(ROOT, 'src', 'app.js'), 'utf8');

const cssName = `styles.${fingerprint(cssBody)}.css`;
const jsName = `app.${fingerprint(jsBody)}.js`;

const cssSize = write(cssName, cssBody);
const jsSize = write(jsName, jsBody);

// Must happen before any page renders: the shell reads these when it builds <head>.
setAssets({ css: '/' + cssName, js: '/' + jsName });

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

${site.name} is a content operating system for marketing teams. One workflow takes
a content idea all the way to a published post:

  Idea → Generate → Calendar → Approve → Publish

You capture ideas on a board, group them into campaigns, draft them with AI or write
them yourself, place them on a shared content calendar, route them to a named
reviewer (or a client, through a review link), and let them publish automatically to
your connected channels. Every brand or client you run is its own account, with its
own brand voice, channels, reviewers and calendar, under one login.

## Key facts

- Positioning: content operating system / content calendar + social media automation.
  Not only an AI blog writer — the AI is optional and the workflow works without it.
- Pricing: ${plans
    .map((p) => `${p.name} ${p.price}${p.period}${p.annual ? ` (or ${p.annual.price}/year — ${p.annual.saving})` : ''}`)
    .join('; ')}
- The free plan includes the whole workflow for one brand at five posts a month.
  Paid plans add included AI generation, more accounts and seats, and the approval workflow.
- Channels live today: ${channels.filter((c) => c.status === 'live').map((c) => c.name).join(', ')}.
- Channels in development (NOT shipped): ${channels.filter((c) => c.status === 'soon').map((c) => c.name).join(', ')}.
- Blog publishing today works through Markdown/HTML export, publishing webhooks and a REST API.
- Not supported at all: X, TikTok, YouTube, Pinterest, social inbox, social analytics.
- Other roadmap items (not yet shipped): ${comingSoon.map((f) => f.name).join(', ')}.
- AI generation runs on a managed key included in paid plans, or your own OpenAI or
  Gemini key. Keys are encrypted at rest (AES-256) and never displayed after saving.
- Content is exportable as Markdown, HTML and spreadsheet. No lock-in; cancelled
  accounts keep read and export access.

## The five stages

${stages.map((st) => `${st.n}. ${st.verb} — ${st.title}: ${st.short}`).join('\n')}

## Product pages

${[
  ['/features', 'Every feature, filed under the stage of the workflow it belongs to'],
  ['/how-it-works', 'The five-stage workflow from idea to published post'],
  ['/pricing', 'Plans, what is included, and what AI generation costs'],
  ['/integrations', 'Social channels, AI providers, images, exports and the API'],
  ['/made-for', 'Business owners, marketing teams, agencies and six more audiences'],
  ['/why-contentlineup', 'Comparison against AI writers and legacy schedulers'],
  ['/compare/contentlineup-vs-buffer', 'Head-to-head with Buffer, including where Buffer wins'],
  ['/security', 'How API keys and content are handled'],
  ['/faq', 'Full FAQ, starting with the questions people ask before signing up'],
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
for (const [name, size] of [[cssName, cssSize], [jsName, jsSize]]) {
  const gz = kb(gzipSync(readFileSync(join(DIST, name))).length);
  console.log(`  ${name.padEnd(58)} ${kb(size).padStart(9)}  (${gz} gzip)`);
}
console.log(
  `\n${rendered.length + 1} HTML pages · ${allFiles.length} files · ${kb(totalBytes)} total in dist/\n`
);
