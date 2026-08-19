// Full-page screenshots with real device emulation (Windows headless clamps
// --window-size, so CLI screenshots lie about mobile widths — this does not).
//
//   node tools/shots.mjs [baseUrl]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8080';
const OUT = resolve(import.meta.dirname, '..', '.shots');
const PORT = 9334;

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const bin = CANDIDATES.find((p) => existsSync(p));
if (!bin) throw new Error('No Chromium build found');

// [file, path, width, height, fullPage, scrollY]
const SHOTS = [
  ['social-home', '/', 1440, 1250, false, 'SOCIAL'],
  ['social-mobile', '/', 390, 1400, false, 'SOCIAL'],
];

const profile = mkdtempSync(join(tmpdir(), 'cl-shots-'));
const chrome = spawn(
  bin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
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
  throw new Error('no devtools endpoint');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = [];
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(m.error.message)) : resolve(m.result);
      } else if (m.method) this.handlers.forEach((h) => h(m));
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  on(h) {
    this.handlers.push(h);
  }
}

const connect = (url) =>
  new Promise((res, rej) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => res(new CDP(ws)));
    ws.addEventListener('error', rej);
  });

mkdirSync(OUT, { recursive: true });

try {
  const cdp = await connect(await endpoint());
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);

  for (const [name, path, w, h, full, scrollY = 0] of SHOTS) {
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 },
      sessionId
    );
    await cdp.send('Page.navigate', { url: BASE + path }, sessionId);
    await new Promise((res) => {
      cdp.on((m) => m.method === 'Page.loadEventFired' && res());
      setTimeout(res, 8000);
    });
    // Scroll through so IntersectionObserver reveals fire, then return to top.
    await cdp.send(
      'Runtime.evaluate',
      {
        expression: `(async () => {
          const step = innerHeight * 0.8;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
          }
          const target = ${JSON.stringify(String(scrollY))};
          if (target === 'SOCIAL') {
            const el = document.getElementById('social');
            if (el) el.scrollIntoView({ block: 'start' });
          } else if (target === 'FEATSOCIAL') {
            const h = [...document.querySelectorAll('h2,h3')].find(x => /Auto-share on publish/i.test(x.textContent));
            if (h) h.scrollIntoView({ block: 'start' });
          } else {
            scrollTo(0, Number(target) || 0);
          }
          await new Promise(r => setTimeout(r, 1500));
        })()`,
        awaitPromise: true,
      },
      sessionId
    );

    const { data } = await cdp.send(
      'Page.captureScreenshot',
      { format: 'png', captureBeyondViewport: !!full, ...(full ? {} : {}) },
      sessionId
    );
    const file = join(OUT, name + '.png');
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log(`  ${name.padEnd(20)} ${w}x${h}${full ? ' (full page)' : ''}`);
  }

  await cdp.send('Target.closeTarget', { targetId });
  cdp.ws.close();
} finally {
  chrome.kill();
  setTimeout(() => {
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {}
  }, 800).unref();
}
console.log(`\nScreenshots in ${OUT}`);
