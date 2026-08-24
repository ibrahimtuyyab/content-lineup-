// Rendering primitives: escaping, layout shell, SEO head, JSON-LD, chrome, components.
import { site, nav, footerNav, cta, analytics } from '../data/site.mjs';
import { adminLink, LOGIN_PATH } from './admin-link.mjs';
import { assets } from './assets.mjs';

/**
 * Where the header Log in button goes.
 *
 * The product app on the published site, which is what that button is for: a
 * visitor clicking Log in wants their ContentLineup account, not a sign-in form
 * for this site's own editor. On a build made with --admin-link there is an
 * editor mounted at /admin on this same origin, so Log in goes to /login — one
 * page offering both doors.
 */
const loginHref = adminLink ? LOGIN_PATH : cta.login.href;

// --- escaping ---------------------------------------------------------------
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Escape for a JSON-LD <script> block: only the sequence that could break out.
const jsonld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

export const abs = (path = '/') => (path.startsWith('http') ? path : site.origin + path);

// --- icons ------------------------------------------------------------------
const ICONS = {
  ai: '<path d="M12 3v3m0 12v3M3 12h3m12 0h3M6.3 6.3l2.1 2.1m7.2 7.2 2.1 2.1m0-11.4-2.1 2.1m-7.2 7.2-2.1 2.1"/><circle cx="12" cy="12" r="3.2"/>',
  image: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m3.5 17 4.8-4.4a2 2 0 0 1 2.7 0l6.5 6"/>',
  export: '<path d="M12 15V3m0 0L8.2 6.8M12 3l3.8 3.8"/><path d="M4.5 14v4.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V14"/>',
  api: '<path d="m8 17-5-5 5-5m8 10 5-5-5-5m-2-3-4 16"/>',
  sheet: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 15h17M9.5 4v16"/>',
  team: '<circle cx="9" cy="8.5" r="3.2"/><path d="M2.8 20a6.3 6.3 0 0 1 12.4 0"/><path d="M16.2 5.6a3.2 3.2 0 0 1 0 5.9m1.1 2.2A5.6 5.6 0 0 1 21.5 19"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16.5v-4m4 4v-8m4 8v-6"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2.1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4m8-4v4"/>',
  pen: '<path d="M16.5 3.9a2.3 2.3 0 0 1 3.3 3.3L8.4 18.6 4 20l1.4-4.4Z"/><path d="m14.6 5.8 3.3 3.3"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.1 7 9.3 4.1-1.2 7-5 7-9.3V5.8Z"/><path d="m9.2 12 2 2 3.6-4"/>',
  check: '<path d="m5 12.6 4.4 4.4L19 7.4"/>',
  cross: '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
  dash: '<path d="M6 12h12"/>',
  bolt: '<path d="M13.2 3 5.5 13.4h5.4L10 21l7.7-10.4h-5.4Z"/>',
  arrow: '<path d="M5 12h13m0 0-5-5m5 5-5 5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
  spark: '<path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18.1l-1.8-5.5L4.7 10.8 10.2 9Z"/>',
  layers: '<path d="m12 3.5 8.5 4.3L12 12.1 3.5 7.8Z"/><path d="m3.5 12.2 8.5 4.3 8.5-4.3"/><path d="m3.5 16.4 8.5 4.3 8.5-4.3"/>',
  search: '<circle cx="11" cy="11" r="6.4"/><path d="m15.8 15.8 4.2 4.2"/>',
  // Channel marks, drawn in the same stroke style as the rest of the set.
  linkedin:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="2.6"/><path d="M8.1 10.6v6.1M8.1 7.5v.6"/><path d="M12 16.7v-6.1m0 2.6a2.5 2.5 0 0 1 4.9.7v2.8"/>',
  facebook:
    '<circle cx="12" cy="12" r="8.6"/><path d="M14.6 8.6h-1.2a1.7 1.7 0 0 0-1.7 1.7v10.2"/><path d="M9.7 13h4.5"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.8"/><circle cx="12" cy="12" r="3.5"/><path d="M16.7 7.3h.01"/>',
  share:
    '<circle cx="17.5" cy="6" r="2.6"/><circle cx="6.5" cy="12" r="2.6"/><circle cx="17.5" cy="18" r="2.6"/><path d="m8.8 10.8 6.4-3.5m0 9.4-6.4-3.5"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8M12 3.4c2.2 2.4 3.4 5.4 3.4 8.6S14.2 18.2 12 20.6c-2.2-2.4-3.4-5.4-3.4-8.6S9.8 5.8 12 3.4Z"/>',

  // Engagement glyphs for the channel previews. Deliberately generic shapes —
  // a heart is a heart — so a post mockup reads as the right platform through
  // layout and icon vocabulary without reproducing anyone's logo or wordmark.
  heart:
    '<path d="M12 20.3s-7.4-4.6-7.4-9.6a4.2 4.2 0 0 1 7.4-2.7 4.2 4.2 0 0 1 7.4 2.7c0 5-7.4 9.6-7.4 9.6Z"/>',
  bubble:
    '<path d="M20.5 11.6c0 4.1-3.8 7.4-8.5 7.4a9.7 9.7 0 0 1-2.9-.44L4.5 20l1.2-3.4a7 7 0 0 1-2.2-5c0-4.1 3.8-7.4 8.5-7.4s8.5 3.3 8.5 7.4Z"/>',
  send: '<path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8Z"/>',
  bookmark: '<path d="M6.4 3.6h11.2v17l-5.6-4-5.6 4Z"/>',
  repost:
    '<path d="M4.5 9.2V7.6a2.6 2.6 0 0 1 2.6-2.6h9.3M16.4 2.2 19.5 5l-3.1 2.8"/><path d="M19.5 14.8v1.6a2.6 2.6 0 0 1-2.6 2.6H7.6M7.6 21.8 4.5 19l3.1-2.8"/>',
  thumb:
    '<path d="M6.6 10.4h-2a1.4 1.4 0 0 0-1.4 1.4v6.6a1.4 1.4 0 0 0 1.4 1.4h2Z"/><path d="M6.6 10.4 10.4 3a2.4 2.4 0 0 1 2.4 2.4V9h5.3a2 2 0 0 1 2 2.4l-1.3 6.4a2 2 0 0 1-2 1.6H6.6Z"/>',
  dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
};

export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${
    ICONS[name] || ICONS.spark
  }</svg>`;

// --- brand mark -------------------------------------------------------------
export const logoMark = (cls = '') => `
<svg class="logo ${cls}" viewBox="0 0 800 160" fill="none" role="img" aria-label="ContentLineup">
  <g transform="translate(16 32)">
    <g stroke="currentColor" stroke-width="12" stroke-linecap="round">
      <line x1="0" y1="16" x2="40" y2="16"/><line x1="52" y1="16" x2="78" y2="16"/>
      <line x1="0" y1="48" x2="52" y2="48"/><line x1="64" y1="48" x2="92" y2="48"/>
      <line x1="0" y1="80" x2="32" y2="80"/><line x1="44" y1="80" x2="70" y2="80"/>
    </g>
    <path d="M 104 16 L 160 48 L 104 80 L 116 48 Z" fill="var(--accent)"/>
  </g>
  <g font-family="Fraunces, 'Times New Roman', Georgia, serif" font-weight="600">
    <text x="210" y="104" font-size="80" fill="currentColor" letter-spacing="-2">Content<tspan fill="var(--accent)">Lineup</tspan></text>
  </g>
</svg>`;

// --- structured data --------------------------------------------------------
export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': site.origin + '/#organization',
  name: site.name,
  legalName: site.legalName,
  url: site.origin,
  logo: { '@type': 'ImageObject', url: abs('/logo.svg'), width: 800, height: 160 },
  description: site.description,
  email: site.email,
  foundingDate: site.founded,
  parentOrganization: { '@type': 'Organization', name: site.parent.name, url: site.parent.url },
  sameAs: site.social,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: site.email,
    availableLanguage: ['English'],
  },
});

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': site.origin + '/#website',
  url: site.origin,
  name: site.name,
  description: site.description,
  publisher: { '@id': site.origin + '/#organization' },
  inLanguage: 'en-US',
});

export const softwareSchema = (plans) => ({
  '@type': 'SoftwareApplication',
  '@id': site.origin + '/#software',
  name: site.name,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Content Marketing Software',
  operatingSystem: 'Web browser',
  url: site.origin,
  description: site.description,
  featureList: [
    'Content idea board with keyword tagging',
    'Campaigns grouping content by launch, season or quarter',
    'AI drafting with outline-first structure, or manual writing',
    'Brand voice applied per account',
    'Shared content calendar across blog and social channels',
    'Approval workflow with client review links',
    'Multiple brand and client accounts from one login',
    'Automatic publishing to LinkedIn, Facebook and Instagram',
    'Publishing log with timestamps and live URLs',
    'Markdown, HTML and spreadsheet export',
  ],
  publisher: { '@id': site.origin + '/#organization' },
  // Both billing periods are listed: an annual price that only exists behind a
  // JS toggle is invisible to the crawlers that read these offers.
  offers: plans.flatMap((p) => [
    {
      '@type': 'Offer',
      name: p.annual ? `${p.name} (monthly)` : p.name,
      price: p.numeric,
      priceCurrency: 'USD',
      url: abs('/pricing'),
      availability: 'https://schema.org/InStock',
      description: p.summary,
    },
    ...(p.annual
      ? [
          {
            '@type': 'Offer',
            name: `${p.name} (annual)`,
            price: p.annual.numeric,
            priceCurrency: 'USD',
            url: abs('/pricing'),
            availability: 'https://schema.org/InStock',
            description: `${p.summary} Billed yearly — ${p.annual.saving}.`,
          },
        ]
      : []),
  ]),
});

/**
 * The WebPage node every page gets. It is what links the page to the site, the
 * publisher and its primary image, and it gives crawlers a single node to hang
 * dates and breadcrumbs off.
 */
export const webPageSchema = ({ path, title, description, image, crumbs, article, speakable }) => {
  const node = {
    '@type': 'WebPage',
    '@id': abs(path) + '#webpage',
    url: abs(path),
    name: title,
    description,
    isPartOf: { '@id': site.origin + '/#website' },
    about: { '@id': site.origin + '/#organization' },
    inLanguage: 'en-US',
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(image), width: 1200, height: 630 },
  };
  if (crumbs) node.breadcrumb = { '@id': abs(path) + '#breadcrumb' };
  if (article) {
    node.datePublished = article.published;
    node.dateModified = article.modified;
  }
  // Tell voice and answer engines which parts of the page are worth reading out.
  if (speakable) {
    node.speakable = { '@type': 'SpeakableSpecification', cssSelector: speakable };
  }
  return node;
};

export const faqSchema = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const breadcrumbSchema = (crumbs, path) => ({
  '@type': 'BreadcrumbList',
  ...(path ? { '@id': abs(path) + '#breadcrumb' } : {}),
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: abs(c.href),
  })),
});

// --- ambient background -----------------------------------------------------
/**
 * The drifting dots from the hero, reusable anywhere.
 *
 * Deliberately NOT applied to article bodies or long-form prose. An animated
 * background behind text you are actually reading is both a readability problem
 * and the single most recognisable "generated template" tell — so this lives on
 * page heroes, dark bands and closing CTAs, where there is space for it and it
 * makes the page feel like part of the same site.
 *
 * Offsets come from index trigonometry rather than Math.random(): build.mjs
 * content-hashes the HTML for cache-busting, and random values would bust every
 * cache on every build.
 *
 * @param {number} count how many dots — density per placement
 * @param {string} cls   'ambient' variants dial opacity down from the hero
 */
/**
 * The drifting background dots.
 *
 * Every dot carries its own start position, drift vector, size, duration,
 * phase offset and peak opacity, so no two move together and the field never
 * resolves into a pattern you can read.
 *
 * The values come from a seeded PRNG rather than Math.random(). build.mjs
 * hashes the HTML for cache-busting, so true randomness would mint a new hash
 * on every build for no reason — this way the same seed always produces the
 * same markup, while the arrangement stays unpredictable to the eye, which is
 * the part that actually matters. Give each page its own seed and each page
 * gets its own field.
 *
 * @param {number} count how many dots
 * @param {string} cls   placement variant — `is-hero` (homepage) or `is-page`
 * @param {number} seed  any integer; same seed → same layout
 */
/** Stable per-page seed, so every route gets its own arrangement. */
export const seedFromPath = (s = '/') => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const ambientDots = (count = 12, cls = 'is-ambient', seed = 1) => {
  // mulberry32 — small, fast, and well distributed enough that the eye reads
  // the result as scattered rather than gridded.
  let t = Math.imul(seed || 1, 0x9e3779b9) >>> 0;
  const rnd = () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const between = (lo, hi) => lo + rnd() * (hi - lo);

  const dots = Array.from({ length: count }, () => {
    const x = between(1, 99).toFixed(1);
    const y = between(3, 95).toFixed(1);
    // A free angle rather than separate x/y offsets, so the drift is not
    // biased along either axis.
    const angle = rnd() * Math.PI * 2;
    const dist = between(28, 104);
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist * 0.7);
    const r = between(4.5, 10.5).toFixed(1);
    const dur = between(13, 32);
    // Delay spans a whole cycle, so the dots are already spread across every
    // phase on the first frame instead of starting together.
    const delay = between(0, dur).toFixed(1);
    const o = between(0.26, 0.62).toFixed(2);
    return (
      `<span style="--x:${x}%;--y:${y}%;--dx:${dx}px;--dy:${dy}px;` +
      `--r:${r}px;--dur:${dur.toFixed(1)}s;--d:-${delay}s;--o:${o}"></span>`
    );
  }).join('');
  return `<div class="hero-dots ${cls}" aria-hidden="true">${dots}</div>`;
};

// --- analytics --------------------------------------------------------------
/**
 * Cookieless analytics + the queue stub that makes `plausible(...)` safe to call
 * before the script has loaded. Both tags are `defer`, so neither blocks render,
 * and nothing here sets a cookie — no consent banner required.
 *
 * The stub is what lets app.js fire CTA events on a click that also navigates
 * away: the call is queued synchronously and flushed when the script arrives.
 */
const analyticsTag = () => {
  if (!analytics.enabled || !analytics.domain) return '';
  return `<script defer data-domain="${esc(analytics.domain)}" src="${esc(analytics.src)}"></script>
<script>window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}</script>`;
};

// --- chrome -----------------------------------------------------------------
const header = (path) => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-head" id="site-head">
  <div class="wrap head-inner">
    <a class="brand" href="/" aria-label="ContentLineup home">${logoMark()}</a>
    <nav class="nav-main" aria-label="Primary">
      <ul>
        ${nav
          .map(
            (n) =>
              `<li><a href="${n.href}"${
                path === n.href || (n.href !== '/' && path.startsWith(n.href)) ? ' aria-current="page"' : ''
              }>${esc(n.label)}</a></li>`
          )
          .join('')}
      </ul>
    </nav>
    <div class="head-cta">
      <a class="btn btn-ghost head-login" href="${loginHref}" data-cta="header-login">${esc(cta.login.label)}</a>
      <a class="btn btn-primary head-start" href="${cta.primary.href}" data-cta="header">${esc(
        cta.primary.label
      )} ${icon('arrow')}</a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-mobile" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav-mobile" id="nav-mobile" hidden>
    <nav aria-label="Mobile">
      <ul>
        ${nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
        <li><a href="/how-it-works">How it works</a></li>
        <li><a href="/why-contentlineup">Why ContentLineup</a></li>
        <li><a href="/security">Security &amp; Trust</a></li>
        <li><a href="/faq">FAQ</a></li>
      </ul>
    </nav>
    <div class="nav-mobile-cta">
      <a class="btn btn-ghost btn-block" href="${loginHref}" data-cta="mobile-nav-login">${esc(cta.login.label)}</a>
      <a class="btn btn-primary btn-block" href="${cta.primary.href}" data-cta="mobile-nav">${esc(
        cta.primary.label
      )} ${icon('arrow')}</a>
    </div>
  </div>
</header>`;

const footer = () => `
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <a href="/" aria-label="ContentLineup home">${logoMark()}</a>
        <p>${esc(site.tagline)}</p>
        <p class="foot-desc">The content operating system for marketing teams: ideas, AI or manual drafting, a shared content calendar, approvals, and automatic publishing to your blog and social channels.</p>
        <a class="btn btn-primary" href="${cta.primary.href}" data-cta="footer">${esc(cta.primary.label)} ${icon('arrow')}</a>
      </div>
      <div class="foot-links">
        ${footerNav
          .map(
            (col) => `<div class="foot-col">
          <h2>${esc(col.title)}</h2>
          <ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
        </div>`
          )
          .join('')}
      </div>
    </div>
    <div class="foot-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(site.name)}. A <a href="${site.parent.url}" rel="noopener">${esc(
  site.parent.name
)}</a> product.</p>
      <p class="foot-contact"><a href="mailto:${site.email}">${esc(site.email)}</a> &middot; <a href="/security">Security &amp; Trust</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></p>
    </div>
  </div>
</footer>`;

// --- page shell -------------------------------------------------------------
/**
 * @param {object} o
 * @param {string} o.path        canonical path, e.g. "/pricing"
 * @param {string} o.title       full <title>
 * @param {string} o.description meta description
 * @param {string} o.body        page HTML
 * @param {object[]} [o.schema]  extra JSON-LD nodes
 * @param {string} [o.ogType]
 * @param {string} [o.bodyClass]
 * @param {object} [o.article]   { published, modified, author, image }
 */
export function page(o) {
  const url = abs(o.path);
  const ogImage = abs(o.ogImage || '/og/default.png');
  const extra = o.schema || [];
  const hasCrumbs = extra.some((n) => n['@type'] === 'BreadcrumbList');
  const graph = [
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      path: o.path,
      title: o.ogTitle || o.title,
      description: o.description,
      image: o.ogImage || '/og/default.png',
      crumbs: hasCrumbs,
      article: o.article,
      speakable: o.speakable,
    }),
    ...extra,
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${url}">
${
  o.noindex
    ? '<meta name="robots" content="noindex, nofollow">'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'
}
<meta name="theme-color" content="#fafaf7">
<meta name="color-scheme" content="light">
<meta name="author" content="${esc(site.name)}">
<meta name="generator" content="ContentLineup Static">

<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(o.ogTitle || o.title)}">
<meta property="og:image:type" content="image/png">
<meta property="og:locale" content="${site.locale}">
${
  o.article
    ? `<meta property="article:published_time" content="${o.article.published}">
<meta property="article:modified_time" content="${o.article.modified}">
<meta property="article:author" content="${esc(o.article.author)}">`
    : ''
}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${site.twitter}">
<meta name="twitter:title" content="${esc(o.ogTitle || o.title)}">
<meta name="twitter:description" content="${esc(o.description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="twitter:image:alt" content="${esc(o.ogTitle || o.title)}">

<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon.svg">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} — Resources" href="/feed.xml">
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script type="application/ld+json">${jsonld({ '@context': 'https://schema.org', '@graph': graph })}</script>
${analyticsTag()}
<script src="${assets.js}" defer></script>
<noscript><style>.reveal,.reveal-stagger>*{opacity:1!important;transform:none!important}</style></noscript>
</head>
<body class="${o.bodyClass || ''}">
${ambientDots(64, 'is-page-bg', seedFromPath(o.path || '/'))}
<div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
${header(o.path)}
<main id="main">
${o.body}
</main>
${footer()}
<div class="sticky-cta" id="sticky-cta" hidden>
  <div class="sticky-cta-inner">
    <p><b>Every idea, lined up and published.</b><span>Free plan &middot; no card required</span></p>
    <a class="btn btn-primary" href="${cta.primary.href}" data-cta="sticky-mobile">${esc(cta.primary.label)}</a>
  </div>
</div>
</body>
</html>`;
}

// --- shared components ------------------------------------------------------
export const wrap = (inner, cls = '') => `<div class="wrap ${cls}">${inner}</div>`;

export const eyebrow = (text, kind = '') =>
  `<p class="eyebrow ${kind}"><span class="eyebrow-dot"></span>${esc(text)}</p>`;

export const sectionHead = ({ kicker, title, lead, align = '' }) => `
<div class="sec-head ${align} reveal">
  ${kicker ? eyebrow(kicker) : ''}
  <h2>${title}</h2>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
</div>`;

/**
 * @param {string} [track] value for data-cta — the label this button reports to
 *   analytics. Name it for where it sits on the page ("hero", "pricing-team"),
 *   because the question it has to answer is which placement converts.
 */
export const btn = (label, href, variant = 'primary', withArrow = false, track = '') =>
  `<a class="btn btn-${variant}" href="${href}"${track ? ` data-cta="${esc(track)}"` : ''}>${esc(label)}${
    withArrow ? ' ' + icon('arrow') : ''
  }</a>`;

export const ctaRow = (extra = '', track = 'inline') => `
<div class="cta-row">
  ${btn(cta.primary.label, cta.primary.href, 'primary', true, track)}
  ${extra || btn(cta.secondary.label, cta.secondary.href, 'secondary', false, track + '-secondary')}
</div>`;

export const soonChip = () => `<span class="chip chip-soon">Coming soon</span>`;

export const breadcrumbs = (crumbs) => `
<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    ${crumbs
      .map((c, i) =>
        i === crumbs.length - 1
          ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
          : `<li><a href="${c.href}">${esc(c.label)}</a></li>`
      )
      .join('')}
  </ol>
</nav>`;

/** Big closing CTA band used at the bottom of most pages. */
export const finalCta = ({
  title = 'Your next 30 days of content, lined up this afternoon.',
  lead = 'Capture the ideas you already have, draft them with AI or write them yourself, drop them on the calendar and approve the month in one sitting.',
  note = 'Free plan, no card required &middot; Approve before anything goes live &middot; Export everything, always',
  secondary = 'tour',
} = {}) => {
  const alt =
    secondary === 'demo'
      ? btn(cta.demo.label, cta.demo.href, 'outline-light', false, 'final-demo')
      : secondary === 'none'
        ? ''
        : btn(cta.tour.label, '/how-it-works', 'outline-light', false, 'final-tour');
  return `
<section class="final-cta">
  <div class="wrap">
    <div class="final-cta-inner reveal">
      <div class="final-cta-glow" aria-hidden="true"></div>
      <h2>${title}</h2>
      <p class="lead">${lead}</p>
      <div class="cta-row center">
        ${btn(cta.primary.label, cta.primary.href, 'primary', true, 'final')}
        ${alt}
      </div>
      <p class="fine">${note}</p>
    </div>
  </div>
</section>`;
};

/** Renders an FAQ accordion + returns markup only; caller adds FAQPage schema. */
export const faqAccordion = (items, idPrefix = 'faq') => `
<div class="faq-list">
  ${items
    .map(
      (f, i) => `
  <details class="faq-item reveal" id="${idPrefix}-${i}" ${i === 0 ? 'open' : ''}>
    <summary>
      <h3>${esc(f.q)}</h3>
      <span class="faq-mark" aria-hidden="true"></span>
    </summary>
    <div class="faq-body"><div class="faq-body-inner"><p>${esc(f.a)}</p></div></div>
  </details>`
    )
    .join('')}
</div>`;
