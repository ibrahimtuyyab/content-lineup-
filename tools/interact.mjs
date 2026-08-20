// Drives the homepage interactions in a real browser and reports what happened.
//
//   node tools/interact.mjs [baseUrl]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8080';
const OUT = resolve(import.meta.dirname, '..', '.shots', 'inspect');
const PORT = 9338;

const bin = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
if (!bin) throw new Error('No Chromium build found');

const profile = mkdtempSync(join(tmpdir(), 'cl-int-'));
const chrome = spawn(
  bin,
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'],
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
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = [];
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
    return new Promise((res, rej) => { this.pending.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params, sessionId })); });
  }
  on(h) { this.handlers.push(h); }
}
const connect = (url) => new Promise((res, rej) => { const ws = new WebSocket(url); ws.addEventListener('open', () => res(new CDP(ws))); ws.addEventListener('error', rej); });

mkdirSync(OUT, { recursive: true });

try {
  const cdp = await connect(await endpoint());
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Log.enable', {}, sessionId);
  const errors = [];
  cdp.on((m) => {
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
    if (m.method === 'Runtime.exceptionThrown') errors.push(String(m.params.exceptionDetails.text));
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await cdp.send('Page.navigate', { url: BASE + '/' }, sessionId);
  await new Promise((res) => { cdp.on((m) => m.method === 'Page.loadEventFired' && res()); setTimeout(res, 10000); });
  await sleep(600);

  const run = async (label, expr) => {
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sessionId);
    if (exceptionDetails) { console.log(`  ✗ ${label}: ${exceptionDetails.text}`); return; }
    console.log(`  ${result.value && String(result.value).startsWith('FAIL') ? '✗' : '✓'} ${label}: ${result.value}`);
  };

  console.log('\nHomepage interactions @ 1440px\n');

  await run('lineup animates', `(async () => {
    const l = document.getElementById('lineup');
    l.scrollIntoView({block:'center'});
    const snap = () => [...l.querySelectorAll('.lu-col')].map(c => c.querySelector('.lu-slot').children.length).join(',');
    const before = snap();
    await new Promise(r => setTimeout(r, 4500));
    const after = snap();
    return before === after ? 'FAIL cards did not move (' + before + ')' : before + ' -> ' + after;
  })()`);

  await run('idea demo preset', `(async () => {
    const b = document.querySelectorAll('.idemo-preset')[2];
    b.scrollIntoView({block:'center'});
    const before = document.querySelector('[data-out="title"]').textContent;
    b.click();
    await new Promise(r => setTimeout(r, 500));
    const after = document.querySelector('[data-out="title"]').textContent;
    return before === after ? 'FAIL title unchanged' : 'title -> "' + after.slice(0,44) + '..."';
  })()`);

  await run('idea demo free text', `(async () => {
    const i = document.getElementById('idea-demo-input');
    i.value = 'winter roof inspection checklist';
    document.getElementById('idea-demo-form').dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
    await new Promise(r => setTimeout(r, 500));
    return '"' + document.querySelector('[data-out="title"]').textContent + '"';
  })()`);

  await run('channel tabs', `(async () => {
    const t = document.getElementById('ch-instagram');
    t.scrollIntoView({block:'center'});
    t.click();
    await new Promise(r => setTimeout(r, 350));
    const p = document.getElementById('chp-instagram');
    return p.hidden ? 'FAIL panel still hidden' : 'instagram panel shown, aria-selected=' + t.getAttribute('aria-selected');
  })()`);

  await run('account tabs', `(async () => {
    const t = document.getElementById('acct-lumen');
    t.scrollIntoView({block:'center'});
    t.click();
    await new Promise(r => setTimeout(r, 300));
    const p = document.getElementById('acctp-lumen');
    return p.hidden ? 'FAIL panel still hidden' : 'lumen panel shown';
  })()`);

  await run('AI revision demo', `(async () => {
    const btn = document.querySelector('.aidemo-btn[data-ins="0"]');
    btn.scrollIntoView({block:'center'});
    const before = document.getElementById('ai-demo-text').textContent;
    btn.click();
    await new Promise(r => setTimeout(r, 900));
    const after = document.getElementById('ai-demo-text').textContent;
    if (before === after) return 'FAIL text unchanged';
    document.querySelector('.aidemo-reset').click();
    await new Promise(r => setTimeout(r, 900));
    const undone = document.getElementById('ai-demo-text').textContent;
    return 'rewrote (' + before.length + ' -> ' + after.length + ' chars), undo ' + (undone === before ? 'restored' : 'FAILED');
  })()`);

  await run('tour follows scroll', `(async () => {
    const seen = [];
    for (const id of ['idea','generate','calendar','approve','publish']) {
      document.getElementById('stage-' + id).scrollIntoView({block:'center'});
      await new Promise(r => setTimeout(r, 1300));
      const on = document.querySelector('.tour-shot.is-on');
      seen.push(on ? on.dataset.shot : 'none');
    }
    return seen.join(' -> ');
  })()`);

  await run('tour rail navigates', `(async () => {
    const pip = document.querySelector('.tour-pip[data-pip="approve"]');
    pip.click();
    await new Promise(r => setTimeout(r, 900));
    const on = document.querySelector('.tour-shot.is-on');
    return on ? 'active shot = ' + on.dataset.shot : 'FAIL none active';
  })()`);

  await run('counters settle on real numbers', `(async () => {
    document.getElementById('proof').scrollIntoView({block:'center'});
    await new Promise(r => setTimeout(r, 1800));
    return [...document.querySelectorAll('[data-count]')].map(e => e.textContent).join(' | ');
  })()`);

  await run('FAQ accordion', `(async () => {
    const d = document.querySelectorAll('.faq-item')[1];
    d.scrollIntoView({block:'center'});
    d.querySelector('summary').click();
    await new Promise(r => setTimeout(r, 350));
    return d.open ? 'opened "' + d.querySelector('h3').textContent + '"' : 'FAIL did not open';
  })()`);

  await run('keyboard tab nav', `(async () => {
    const first = document.getElementById('ch-blog');
    first.focus(); first.click();
    first.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
    await new Promise(r => setTimeout(r, 250));
    return 'focus moved to ' + (document.activeElement.id || 'nothing');
  })()`);

  // Reduced-motion sanity: the board must still render a sensible static state.
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  await cdp.send('Page.navigate', { url: BASE + '/' }, sessionId);
  await new Promise((res) => { cdp.on((m) => m.method === 'Page.loadEventFired' && res()); setTimeout(res, 8000); });
  await sleep(1500);
  await run('reduced motion: board static + content visible', `(async () => {
    const l = document.getElementById('lineup');
    const snap = () => [...l.querySelectorAll('.lu-col')].map(c => c.querySelector('.lu-slot').children.length).join(',');
    const before = snap();
    await new Promise(r => setTimeout(r, 3000));
    const hidden = [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity === '0').length;
    return snap() === before ? 'static (' + before + '), ' + hidden + ' hidden reveals' : 'FAIL still animating';
  })()`);

  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(join(OUT, 'reduced-motion.png'), Buffer.from(data, 'base64'));

  console.log(errors.length ? '\n  console errors:\n    ' + [...new Set(errors)].join('\n    ') : '\n  no console errors');

  await cdp.send('Target.closeTarget', { targetId });
  cdp.ws.close();
} finally {
  chrome.kill();
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {} }, 800).unref();
}
