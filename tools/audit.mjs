// Headless audit over the running site: real device emulation, horizontal-overflow
// detection, console errors, heading hierarchy, alt text, and load timing.
//
//   node serve.mjs &
//   node tools/audit.mjs [baseUrl]
//
// Drives Chrome over the DevTools Protocol using Node's built-in WebSocket —
// no puppeteer, no install.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8080';
const PORT = 9333;

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const bin = CANDIDATES.find((p) => existsSync(p));
if (!bin) {
  console.error('No Chromium build found.');
  process.exit(1);
}

const PAGES = [
  '/',
  '/features',
  '/how-it-works',
  '/made-for',
  '/integrations',
  '/pricing',
  '/why-contentlineup',
  '/compare/contentlineup-vs-buffer',
  '/resources',
  '/security',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/resources/guides/how-to-schedule-content-so-it-publishes-itself',
  '/resources/comparisons/best-buffer-alternatives-2026',
  '/resources/case-studies/northgate-air-hvac-content-case-study',
  '/resources/guides/real-estate-content-marketing-guide',
  '/resources/guides/how-to-get-cited-by-ai-search-engines',
  '/resources/product-updates/product-update-august-2026',
  '/resources/guides/how-to-brief-an-article-in-sixty-seconds',
  '/404.html',
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, dsf: 3, mobile: true },
  { name: 'tablet', width: 820, height: 1180, dsf: 2, mobile: true },
  { name: 'desktop', width: 1440, height: 900, dsf: 1, mobile: false },
];

const profile = mkdtempSync(join(tmpdir(), 'cl-audit-'));
const chrome = spawn(
  bin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--disable-extensions',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await r.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(250);
    }
  }
  throw new Error('Chrome did not expose a debugging endpoint');
}

/* --- minimal CDP client ---------------------------------------------------- */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg));
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  on(fn) {
    this.listeners.push(fn);
  }
}

const connect = (url) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => resolve(new CDP(ws)));
    ws.addEventListener('error', reject);
  });

/* --- in-page probe ---------------------------------------------------------- */
const PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const over = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1.5 || r.left < -1.5) {
      const cs = getComputedStyle(el);
      // Ignore elements that intentionally scroll or clip their own overflow.
      let p = el.parentElement, contained = false;
      while (p) {
        const pcs = getComputedStyle(p);
        if (pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden') { contained = true; break; }
        p = p.parentElement;
      }
      if (contained) return;
      over.push({
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,3).join('.') : ''),
        right: Math.round(r.right), left: Math.round(r.left), width: Math.round(r.width)
      });
    }
  });

  const h1s = [...document.querySelectorAll('h1')];
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
  let skips = [];
  for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i-1] > 1) skips.push(heads[i-1] + '->' + heads[i]);

  const imgs = [...document.querySelectorAll('img')];
  const noAlt = imgs.filter(i => i.getAttribute('alt') === null).length;
  const noDims = imgs.filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length;

  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => {
    try { JSON.parse(s.textContent); return 'ok'; } catch (e) { return 'INVALID: ' + e.message; }
  });

  const links = [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href'));

  return {
    docScrollW: document.documentElement.scrollWidth,
    vw,
    overflow: over.slice(0, 6),
    h1Count: h1s.length,
    h1Text: h1s[0] ? h1s[0].textContent.trim().slice(0, 70) : null,
    headingSkips: skips,
    imgCount: imgs.length,
    noAlt, noDims,
    jsonld: ld,
    title: document.title,
    titleLen: document.title.length,
    descLen: (document.querySelector('meta[name=description]')||{}).content?.length || 0,
    canonical: (document.querySelector('link[rel=canonical]')||{}).href || null,
    links: [...new Set(links)]
  };
})()`;

/* --- run -------------------------------------------------------------------- */
const results = [];
const consoleErrors = [];
const allLinks = new Set();
let failures = 0;

try {
  const ws = await connect(await endpoint());
  const { targetId } = await ws.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await ws.send('Target.attachToTarget', { targetId, flatten: true });

  await ws.send('Page.enable', {}, sessionId);
  await ws.send('Runtime.enable', {}, sessionId);
  await ws.send('Log.enable', {}, sessionId);

  let currentLabel = '';
  ws.on((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(`${currentLabel}: ${msg.params.exceptionDetails.text}`);
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      const t = msg.params.entry.text;
      if (!/favicon/i.test(t)) consoleErrors.push(`${currentLabel}: ${t}`);
    }
  });

  for (const vp of VIEWPORTS) {
    await ws.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dsf,
        mobile: vp.mobile,
      },
      sessionId
    );

    for (const path of PAGES) {
      currentLabel = `${vp.name} ${path}`;
      const t0 = Date.now();
      await ws.send('Page.navigate', { url: BASE + path }, sessionId);
      // Wait for load, then a beat for IntersectionObserver reveals.
      await new Promise((resolve) => {
        const done = (msg) => {
          if (msg.method === 'Page.loadEventFired') resolve();
        };
        ws.on(done);
        setTimeout(resolve, 8000);
      });
      await sleep(350);
      const loadMs = Date.now() - t0;

      const { result } = await ws.send(
        'Runtime.evaluate',
        { expression: PROBE, returnByValue: true, awaitPromise: false },
        sessionId
      );
      const r = result.value;
      r.links?.forEach((l) => allLinks.add(l));
      results.push({ vp: vp.name, path, loadMs, ...r });
    }
  }

  await ws.send('Target.closeTarget', { targetId });
  ws.ws.close();
} finally {
  chrome.kill();
  // Chrome releases the profile lock asynchronously; cleanup is best-effort.
  setTimeout(() => {
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {}
  }, 800).unref();
}

/* --- report ------------------------------------------------------------------ */
const bad = (msg) => {
  failures++;
  console.log('  ✗ ' + msg);
};

console.log('\n=== Horizontal overflow ===');
let anyOverflow = false;
for (const r of results) {
  if (r.docScrollW > r.vw + 1) {
    anyOverflow = true;
    bad(
      `${r.vp.padEnd(8)} ${r.path} — scrollWidth ${r.docScrollW} > viewport ${r.vw}` +
        (r.overflow.length ? `\n      culprits: ${r.overflow.map((o) => `${o.sel} (right ${o.right})`).join(', ')}` : '')
    );
  }
}
if (!anyOverflow) console.log('  ✓ No page scrolls horizontally at 390 / 820 / 1440');

console.log('\n=== Headings & images (desktop pass) ===');
for (const r of results.filter((x) => x.vp === 'desktop')) {
  if (r.h1Count !== 1) bad(`${r.path} — ${r.h1Count} <h1> elements`);
  if (r.headingSkips.length) bad(`${r.path} — heading level skips: ${r.headingSkips.join(', ')}`);
  if (r.noAlt) bad(`${r.path} — ${r.noAlt} <img> without an alt attribute`);
  if (r.noDims) bad(`${r.path} — ${r.noDims} <img> without width/height`);
}
console.log(`  checked ${results.filter((x) => x.vp === 'desktop').length} pages`);

console.log('\n=== Metadata ===');
for (const r of results.filter((x) => x.vp === 'desktop')) {
  if (!r.canonical) bad(`${r.path} — no canonical`);
  if (r.titleLen > 65) console.log(`  ! ${r.path} — title ${r.titleLen} chars (>65 may truncate)`);
  if (r.descLen < 70 || r.descLen > 165)
    console.log(`  ! ${r.path} — meta description ${r.descLen} chars (aim 70–165)`);
  const invalid = r.jsonld.filter((s) => s !== 'ok');
  if (invalid.length) bad(`${r.path} — ${invalid.join('; ')}`);
}

console.log('\n=== Console errors ===');
if (consoleErrors.length) consoleErrors.slice(0, 20).forEach((e) => bad(e));
else console.log('  ✓ none');

console.log('\n=== Internal links ===');
const missing = [];
for (const href of [...allLinks].sort()) {
  const url = BASE + href;
  const res = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!res || res.status >= 400) missing.push(`${href} → ${res ? res.status : 'ERR'}`);
}
if (missing.length) missing.forEach((m) => bad(m));
else console.log(`  ✓ all ${allLinks.size} internal links resolve`);

console.log('\n=== Load time (desktop, local) ===');
const times = results.filter((r) => r.vp === 'desktop').map((r) => r.loadMs);
console.log(
  `  min ${Math.min(...times)}ms · median ${times.sort((a, b) => a - b)[Math.floor(times.length / 2)]}ms · max ${Math.max(
    ...times
  )}ms`
);

console.log(`\n${failures === 0 ? '✓ PASS' : '✗ ' + failures + ' issue(s)'}\n`);
process.exit(failures ? 1 : 0);
