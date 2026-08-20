// Generates 1200x630 PNG Open Graph cards.
//
// Social platforms do not render SVG in og:image, so these must be raster.
// We rasterise with whatever Chromium build is on the machine; the output PNGs
// live in public/og/ and are committed, so `npm run build` never needs a browser.
//
//   node tools/make-og.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { posts } from '../src/data/content.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'public', 'og');
const TMP = join(tmpdir(), 'cl-og');

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chromium build found — skipping OG generation. Existing PNGs are left in place.');
  process.exit(0);
}

const b64 = (p) => readFileSync(join(ROOT, 'public', p)).toString('base64');
const INTER = b64('fonts/inter-latin.woff2');
const FRAUNCES = b64('fonts/fraunces-latin.woff2');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = ({ kicker, title, sub, tone = 'accent' }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${INTER}) format('woff2');font-weight:100 900}
@font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${FRAUNCES}) format('woff2');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fafaf7;font-family:Inter,sans-serif;
  display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px;position:relative;overflow:hidden}
body::before{content:'';position:absolute;width:640px;height:640px;border-radius:50%;top:-330px;right:-160px;
  background:radial-gradient(circle,${
    tone === 'sched' ? 'rgba(15,118,110,.22)' : 'rgba(244,212,186,.95)'
  },transparent 68%);filter:blur(50px)}
body::after{content:'';position:absolute;inset:0;
  background-image:linear-gradient(#e7e5e0 1px,transparent 1px);background-size:100% 42px;opacity:.34;
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent)}
.top,.mid,.bot{position:relative;z-index:2}
.brand{display:flex;align-items:center;gap:14px}
.brand svg{height:34px;width:auto}
.kicker{display:inline-flex;align-items:center;gap:10px;font-size:17px;font-weight:600;letter-spacing:.12em;
  text-transform:uppercase;color:${tone === 'sched' ? '#0f766e' : '#c2410c'};
  font-family:ui-monospace,Consolas,monospace;margin-bottom:26px}
.kicker i{width:9px;height:9px;border-radius:50%;background:currentColor}
h1{font-family:Fraunces,Georgia,serif;font-weight:600;letter-spacing:-.03em;line-height:1.08;
  font-size:${title.length > 78 ? 54 : title.length > 52 ? 62 : 72}px;color:#0a0a0a;max-width:1010px}
p{margin-top:24px;font-size:25px;line-height:1.45;color:#4b4b4b;max-width:900px}
.bot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e7e5e0;padding-top:26px}
.bot span{font-size:21px;color:#6b6b6b}
.pill{padding:9px 20px;border-radius:999px;background:#0a0a0a;color:#fdfdfb;font-size:19px;font-weight:600}
</style></head><body>
<div class="top"><div class="brand">
<svg viewBox="0 0 800 160" fill="none"><g transform="translate(16 32)">
<g stroke="#0A0A0A" stroke-width="12" stroke-linecap="round">
<line x1="0" y1="16" x2="40" y2="16"/><line x1="52" y1="16" x2="78" y2="16"/>
<line x1="0" y1="48" x2="52" y2="48"/><line x1="64" y1="48" x2="92" y2="48"/>
<line x1="0" y1="80" x2="32" y2="80"/><line x1="44" y1="80" x2="70" y2="80"/></g>
<path d="M 104 16 L 160 48 L 104 80 L 116 48 Z" fill="#C2410C"/></g>
<g font-family="Fraunces, Georgia, serif" font-weight="600">
<text x="210" y="104" font-size="80" fill="#0A0A0A" letter-spacing="-2">Content<tspan fill="#C2410C">Lineup</tspan></text>
</g></svg></div></div>
<div class="mid">
  <div class="kicker"><i></i>${esc(kicker)}</div>
  <h1>${esc(title)}</h1>
  ${sub ? `<p>${esc(sub)}</p>` : ''}
</div>
<div class="bot"><span>contentlineup.com</span><span class="pill">Start free →</span></div>
</body></html>`;

const targets = [
  {
    id: 'default',
    kicker: 'Content operating system',
    title: 'Every idea, lined up and published.',
    sub: 'Capture ideas, draft with AI or write manually, plan them on one calendar, approve, and publish to your channels on schedule.',
  },
  {
    id: 'features',
    kicker: 'Features',
    title: 'Idea → Generate → Calendar → Approve → Publish',
    sub: 'An idea board, campaigns, AI or manual drafting, a shared calendar, approvals, and automatic publishing.',
  },
  {
    id: 'pricing',
    kicker: 'Pricing',
    title: 'Start free. Pay when it saves you a day a week.',
    sub: 'The whole workflow free, with unlimited posts and brands. $29/month adds AI writing and approvals.',
    tone: 'sched',
  },
  {
    id: 'why',
    kicker: 'Comparison',
    title: 'Content doesn’t fail at the writing.',
    sub: 'It fails between the idea and the publish button — and that is the part ContentLineup owns.',
  },
  {
    id: 'security',
    kicker: 'Security & trust',
    title: 'You are handing us an API key. Here is exactly what happens to it.',
    sub: 'AES-256 at rest, write-only, never pooled, never in an export.',
    tone: 'sched',
  },
  {
    id: 'made-for',
    kicker: 'Who it’s for',
    title: 'Built for the people who have to publish anyway.',
    sub: 'Business owners, marketing teams and agencies — plus six more versions of the same problem.',
  },
  {
    id: 'resources',
    kicker: 'Resources',
    title: 'Guides on content marketing, social automation and SEO.',
    sub: 'Content calendars, social scheduling, keyword research and honest tool comparisons.',
    tone: 'sched',
  },
  {
    id: 'how-it-works',
    kicker: 'How it works',
    title: 'Idea → Generate → Calendar → Approve → Publish.',
    sub: 'Five steps, one tool. The whole workflow from a note to a live post.',
    tone: 'sched',
  },
  {
    id: 'integrations',
    kicker: 'Integrations',
    title: 'Publishes where your audience already is.',
    sub: 'LinkedIn, Facebook and Instagram live today. WordPress and Payload CMS in development.',
  },
  {
    id: 'about',
    kicker: 'About',
    title: 'We built the thing that was missing between the draft and the publish.',
    sub: 'A product of Teczon Labs. Bring-your-own-key stays free, and leaving is a supported action.',
    tone: 'sched',
  },
  {
    id: 'contact',
    kicker: 'Contact',
    title: 'Email reaches a person, not a queue.',
    sub: 'Support usually same day. Security disclosures acknowledged within two business days.',
  },
  ...posts.map((p) => ({
    id: p.slug,
    kicker: p.categoryLabel,
    title: p.title,
    sub: p.excerpt.length > 150 ? p.excerpt.slice(0, 147) + '…' : p.excerpt,
    tone: p.category === 'case-studies' || p.category === 'product-updates' ? 'sched' : 'accent',
  })),
];

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

console.log(`Rasterising ${targets.length} OG cards with ${browser.split(/[\\/]/).pop()}…`);

for (const t of targets) {
  const html = join(TMP, `${t.id}.html`);
  const png = join(OUT, `${t.id}.png`);
  writeFileSync(html, card(t));
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--default-background-color=FAFAF7',
      '--virtual-time-budget=3000',
      '--window-size=1200,630',
      `--screenshot=${png}`,
      `file:///${html.replace(/\\/g, '/')}`,
    ],
    { stdio: 'ignore', timeout: 60000 }
  );
  const size = existsSync(png) ? (readFileSync(png).length / 1024).toFixed(0) + 'KB' : 'FAILED';
  console.log('  ', t.id.padEnd(46), size);
}

rmSync(TMP, { recursive: true, force: true });
console.log('OG cards written to public/og/');
