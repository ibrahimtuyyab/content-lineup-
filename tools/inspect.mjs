// Section-by-section screenshots for design review.
//
//   node tools/inspect.mjs [baseUrl] [width] [selector,selector,...]
//
// Captures one viewport-sized PNG per selector into .shots/inspect/, plus
// reports any horizontal overflow and console errors it saw along the way.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8080';
const PATHNAME = process.argv[3] || '/';
const WIDTH = Number(process.argv[4] || 1440);
const HEIGHT = Number(process.argv[5] || 900);
const SELECTORS = (process.argv[6] || '').split(',').filter(Boolean);
const TAG = process.argv[7] || 'd';

const OUT = resolve(import.meta.dirname, '..', '.shots', 'inspect');
const PORT = 9336;

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
];
const bin = CANDIDATES.find((p) => existsSync(p));
if (!bin) throw new Error('No Chromium build found');

const profile = mkdtempSync(join(tmpdir(), 'cl-inspect-'));
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
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Log.enable', {}, sessionId);

  const problems = [];
  cdp.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') {
      problems.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      problems.push('CONSOLE: ' + m.params.entry.text);
    }
  });

  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 700 },
    sessionId
  );
  await cdp.send('Page.navigate', { url: BASE + PATHNAME }, sessionId);
  await new Promise((res) => {
    cdp.on((m) => m.method === 'Page.loadEventFired' && res());
    setTimeout(res, 10000);
  });

  // Walk the page so reveal observers fire.
  await cdp.send(
    'Runtime.evaluate',
    {
      expression: `(async () => {
        const step = innerHeight * 0.7;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y); await new Promise(r => setTimeout(r, 90));
        }
        scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 500));
      })()`,
      awaitPromise: true,
    },
    sessionId
  );

  // Overflow report.
  const { result } = await cdp.send(
    'Runtime.evaluate',
    {
      expression: `JSON.stringify({
        docW: document.documentElement.scrollWidth,
        winW: innerWidth,
        wide: [...document.querySelectorAll('body *')]
          .filter(el => el.getBoundingClientRect().right > innerWidth + 2 && getComputedStyle(el).position !== 'fixed')
          .slice(0, 12)
          .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,3).join('.') : '') + ' → ' + Math.round(el.getBoundingClientRect().right))
      })`,
      returnByValue: true,
    },
    sessionId
  );
  const overflow = JSON.parse(result.value);
  console.log(`\n${PATHNAME} @ ${WIDTH}px — document ${overflow.docW}px / viewport ${overflow.winW}px`);
  if (overflow.wide.length) {
    console.log('  OVERFLOWING:');
    overflow.wide.forEach((w) => console.log('    ' + w));
  } else {
    console.log('  no horizontal overflow');
  }

  for (const sel of SELECTORS) {
    await cdp.send(
      'Runtime.evaluate',
      {
        expression: `(async () => {
          const el = document.querySelector('${sel}');
          if (el) { const r = el.getBoundingClientRect(); scrollTo(0, Math.max(0, scrollY + r.top - 8)); }
          await new Promise(r => setTimeout(r, 700));
        })()`,
        awaitPromise: true,
      },
      sessionId
    );
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const name = TAG + '-' + sel.replace(/[^a-z0-9]+/gi, '') + '.png';
    writeFileSync(join(OUT, name), Buffer.from(data, 'base64'));
    console.log('  shot ' + name);
  }

  if (problems.length) {
    console.log('\n  PAGE ERRORS:');
    [...new Set(problems)].forEach((p) => console.log('    ' + p));
  } else {
    console.log('  no console errors');
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
