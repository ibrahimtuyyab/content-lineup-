// Local admin UI for the content database.
//
//   node admin.mjs            → http://127.0.0.1:8081
//
// Deliberately bound to loopback only and with no authentication: it is a local
// authoring tool, not a deployed service. Do not expose it to a network.
// The published site is the static output in dist/ — this never serves that.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  driver,
  target,
  ready,
  allPosts,
  postBySlug,
  savePost,
  setStatus,
  deletePost,
  allCategories,
  allAuthors,
  stats,
} from './db/store.mjs';
import { renderBody } from './db/render.mjs';
import { screens } from './src/data/site.mjs';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.ADMIN_PORT) || 8081;

try {
  await ready();
} catch (err) {
  console.error(`Cannot reach the content store (${driver} → ${target}).\n${err.message}`);
  process.exit(1);
}

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let lastBuild = null;

/* ------------------------------------------------------------------ layout */
const CSS = `
:root{--ink:#0a0a0a;--muted:#4b0b0b00;--paper:#fafaf7;--paper2:#fdfdfb;--rule:#e7e5e0;--sub:#6b6b6b;
--accent:#c2410c;--accent-soft:#fef1e8;--sched:#0f766e;--sched-soft:#e6f2f0;--green:#15803d;--green-soft:#e9f5ec;
--amber:#b45309;--amber-soft:#fdf3e3;--cream:#efeae1;
--sans:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;--serif:'Fraunces',Georgia,serif;
--mono:ui-monospace,Consolas,Menlo,monospace}
@font-face{font-family:'Inter';src:url('/_asset/fonts/inter-latin.woff2') format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:'Fraunces';src:url('/_asset/fonts/fraunces-latin.woff2') format('woff2');font-weight:100 900;font-display:swap}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 var(--sans)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
header{position:sticky;top:0;z-index:5;background:rgba(250,250,247,.9);backdrop-filter:blur(12px);
border-bottom:1px solid var(--rule)}
.bar{max-width:1180px;margin:auto;padding:14px 22px;display:flex;align-items:center;gap:18px}
.brand{font-family:var(--serif);font-weight:600;font-size:18px;letter-spacing:-.02em}
.brand b{color:var(--accent);font-weight:600}
.tag{font:600 10px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;background:var(--cream);
color:var(--sub);padding:5px 9px;border-radius:99px}
.bar .right{margin-left:auto;display:flex;gap:10px;align-items:center}
main{max-width:1180px;margin:auto;padding:26px 22px 70px}
h1{font-family:var(--serif);font-size:28px;letter-spacing:-.025em;margin:0 0 6px}
h2{font-family:var(--serif);font-size:19px;letter-spacing:-.02em;margin:26px 0 12px}
.sub{color:var(--sub);margin:0 0 22px}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:9px;border:1px solid transparent;
background:var(--accent);color:#fff;font:550 14px var(--sans);cursor:pointer;transition:.18s}
.btn:hover{background:#9a3412;text-decoration:none}
.btn.ghost{background:var(--paper2);color:var(--ink);border-color:var(--rule)}
.btn.ghost:hover{background:#fff;border-color:var(--ink)}
.btn.danger{background:#fff;color:#b91c1c;border-color:#f0d5d5}
.btn.danger:hover{background:#fef2f2}
.btn.sm{padding:6px 12px;font-size:13px}
table{width:100%;border-collapse:collapse;background:var(--paper2);border:1px solid var(--rule);border-radius:12px;
overflow:hidden}
th,td{padding:12px 14px;text-align:left;border-bottom:1px solid #f0eee9;vertical-align:middle}
th{background:#f5f4f0;font:650 12px var(--sans);color:var(--sub)}
tr:last-child td{border-bottom:0}
tr:hover td{background:#faf9f6}
.pill{display:inline-block;padding:3px 10px;border-radius:99px;font:600 10.5px var(--mono);
letter-spacing:.04em;text-transform:uppercase}
.pill.published{background:var(--green-soft);color:var(--green)}
.pill.scheduled{background:var(--sched-soft);color:var(--sched)}
.pill.draft{background:var(--cream);color:var(--sub)}
.mono{font-family:var(--mono);font-size:12.5px;color:var(--sub)}
td.mono{white-space:nowrap}
td.actions{white-space:nowrap;flex-wrap:nowrap;text-align:right}
td.actions form{display:inline}
textarea[name=excerpt]{font-family:var(--sans);font-size:14px}
.star{color:var(--accent)}
form.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
label{display:block;font:600 12px var(--sans);color:var(--sub);margin-bottom:6px;letter-spacing:.01em}
input,select,textarea{width:100%;padding:10px 12px;border:1px solid var(--rule);border-radius:9px;
background:var(--paper2);font:14px var(--sans);color:var(--ink)}
textarea{font-family:var(--mono);font-size:13px;line-height:1.65;resize:vertical}
input:focus,select:focus,textarea:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
.full{grid-column:1/-1}
.hint{font-size:12px;color:var(--sub);margin-top:5px}
.hint.warn{color:var(--amber)}
.count{float:right;font-family:var(--mono);font-size:11px;color:var(--sub)}
.card{background:var(--paper2);border:1px solid var(--rule);border-radius:12px;padding:20px;margin-bottom:18px}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px}
.stat{background:var(--paper2);border:1px solid var(--rule);border-radius:10px;padding:12px 16px;min-width:96px}
.stat b{display:block;font-family:var(--serif);font-size:22px;line-height:1}
.stat span{font-size:12px;color:var(--sub)}
.flash{padding:12px 16px;border-radius:10px;margin-bottom:18px;font-size:14px}
.flash.ok{background:var(--green-soft);color:var(--green)}
.flash.err{background:#fef2f2;color:#b91c1c}
.flash pre{margin:8px 0 0;font-size:12px;white-space:pre-wrap;font-family:var(--mono)}
.faqrow{display:grid;grid-template-columns:1fr 1.6fr auto;gap:10px;margin-bottom:10px;align-items:start}
.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
td.actions{display:table-cell}
details.help{margin-top:10px}
details.help summary{cursor:pointer;font-size:12.5px;color:var(--accent)}
details.help pre{background:var(--cream);padding:12px;border-radius:8px;font-size:12px;overflow-x:auto}
@media(max-width:860px){form.grid{grid-template-columns:1fr}.faqrow{grid-template-columns:1fr}}
`;

const layout = (title, body, flash = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · ContentLineup admin</title>
<style>${CSS}</style></head><body>
<header><div class="bar">
  <span class="brand">Content<b>Lineup</b></span>
  <span class="tag">Content database</span>
  <div class="right">
    <a class="btn ghost sm" href="/">All posts</a>
    <a class="btn sm" href="/new">New post</a>
    <form method="post" action="/build" style="display:inline"><button class="btn ghost sm">Rebuild site</button></form>
  </div>
</div></header>
<main>${flash}${body}</main>
</body></html>`;

/* -------------------------------------------------------------------- views */
function indexView({ posts, s }, flash) {
  const rows = posts
    .map(
      (p) => `<tr>
    <td>
      <a href="/edit/${esc(p.slug)}"><strong>${esc(p.title)}</strong></a>
      ${p.featured ? '<span class="star" title="Featured on the homepage">★</span>' : ''}
      <div class="mono">${esc(p.path)}</div>
    </td>
    <td>${esc(p.categoryLabel)}</td>
    <td><span class="pill ${p.status}">${p.status}</span></td>
    <td class="mono">${esc(p.published || '—')}</td>
    <td class="mono">${p.readMins} min</td>
    <td class="mono actions">
      <a class="btn ghost sm" href="/edit/${esc(p.slug)}">Edit</a>
      ${
        p.status === 'published'
          ? `<a class="btn ghost sm" href="http://localhost:8080${esc(p.path)}" target="_blank" rel="noopener">View</a>`
          : `<form method="post" action="/status"><input type="hidden" name="slug" value="${esc(
              p.slug
            )}"><input type="hidden" name="status" value="published"><button class="btn sm">Publish</button></form>`
      }
    </td>
  </tr>`
    )
    .join('');

  return layout(
    'All posts',
    `<h1>Content database</h1>
    <p class="sub">${esc(driver)} · ${esc(target)}</p>
    <div class="stats">
      <div class="stat"><b>${s.posts}</b><span>posts</span></div>
      <div class="stat"><b>${s.published}</b><span>published</span></div>
      <div class="stat"><b>${s.scheduled}</b><span>scheduled</span></div>
      <div class="stat"><b>${s.drafts}</b><span>drafts</span></div>
      <div class="stat"><b>${s.faqs}</b><span>FAQ entries</span></div>
      <div class="stat"><b>${s.revisions}</b><span>revisions</span></div>
    </div>
    <table>
      <thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Publish date</th><th>Read</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6">No posts yet.</td></tr>'}</tbody>
    </table>
    <p class="hint">Changes are saved to the database immediately. Press <strong>Rebuild site</strong> to regenerate <code>dist/</code>.</p>`,
    flash
  );
}

function editView({ post, cats, authors }, flash) {
  const isNew = !post;
  const p = post || {
    slug: '',
    title: '',
    metaTitle: '',
    description: '',
    excerpt: '',
    body: '',
    bodyFormat: 'markdown',
    category: cats[0]?.slug,
    authorSlug: authors[0]?.slug,
    primaryKeyword: '',
    secondaryKeywords: [],
    thumb: 'list',
    readMins: 8,
    featured: false,
    status: 'draft',
    published: new Date().toISOString().slice(0, 10),
    faqs: [],
  };

  const faqRows = [...(p.faqs || []), { q: '', a: '' }, { q: '', a: '' }]
    .map(
      (f) => `<div class="faqrow">
      <input name="faq_q" value="${esc(f.q)}" placeholder="Question">
      <input name="faq_a" value="${esc(f.a)}" placeholder="Answer (2–4 sentences)">
    </div>`
    )
    .join('');

  return layout(
    isNew ? 'New post' : p.title,
    `<h1>${isNew ? 'New post' : 'Edit post'}</h1>
    <p class="sub">${isNew ? 'Saved as a draft until you publish it.' : esc(p.path)}</p>

    <form method="post" action="/save" class="grid">
      <input type="hidden" name="original_slug" value="${esc(p.slug)}">

      <div class="full">
        <label>Title <span class="count">the &lt;h1&gt;</span></label>
        <input name="title" value="${esc(p.title)}" required maxlength="120">
      </div>

      <div>
        <label>URL slug</label>
        <input name="slug" value="${esc(p.slug)}" placeholder="left blank = generated from the title"
               pattern="[a-z0-9-]*" title="lowercase letters, numbers and hyphens">
        <p class="hint">/resources/&lt;category&gt;/&lt;slug&gt;</p>
      </div>

      <div>
        <label>Category</label>
        <select name="category">
          ${cats.map((c) => `<option value="${esc(c.slug)}"${c.slug === p.category ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}
        </select>
      </div>

      <div class="full">
        <label>Meta title <span class="count">aim ≤ 65 characters</span></label>
        <input name="metaTitle" value="${esc(p.metaTitle)}" maxlength="90">
      </div>

      <div class="full">
        <label>Meta description <span class="count">aim 70–165 characters</span></label>
        <input name="description" value="${esc(p.description)}" maxlength="200">
      </div>

      <div class="full">
        <label>Excerpt <span class="count">card blurb + article standfirst</span></label>
        <textarea name="excerpt" rows="2">${esc(p.excerpt)}</textarea>
      </div>

      <div>
        <label>Primary keyword</label>
        <input name="primaryKeyword" value="${esc(p.primaryKeyword || '')}">
      </div>

      <div>
        <label>Secondary keywords <span class="count">comma separated</span></label>
        <input name="secondaryKeywords" value="${esc((p.secondaryKeywords || []).join(', '))}">
      </div>

      <div>
        <label>Thumbnail screen</label>
        <select name="thumb">
          ${Object.keys(screens)
            .map((k) => `<option value="${k}"${k === p.thumb ? ' selected' : ''}>${esc(screens[k].title)}</option>`)
            .join('')}
        </select>
      </div>

      <div>
        <label>Author</label>
        <select name="authorSlug">
          ${authors.map((a) => `<option value="${esc(a.slug)}"${a.slug === p.authorSlug ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div>
        <label>Read time (minutes)</label>
        <input name="readMins" type="number" min="1" max="60" value="${p.readMins}">
      </div>

      <div>
        <label>Body format</label>
        <select name="bodyFormat">
          <option value="markdown"${p.bodyFormat === 'markdown' ? ' selected' : ''}>Markdown + shortcodes</option>
          <option value="html"${p.bodyFormat === 'html' ? ' selected' : ''}>Raw HTML</option>
        </select>
      </div>

      <div>
        <label>Status</label>
        <select name="status">
          ${['draft', 'scheduled', 'published']
            .map((s) => `<option value="${s}"${s === p.status ? ' selected' : ''}>${s}</option>`)
            .join('')}
        </select>
        <p class="hint">Scheduled posts appear on the first build on or after their date.</p>
      </div>

      <div>
        <label>Publish date</label>
        <input name="published" type="date" value="${esc((p.published || '').slice(0, 10))}">
      </div>

      <div class="full">
        <label><input type="checkbox" name="featured" value="1"${p.featured ? ' checked' : ''}
          style="width:auto;margin-right:8px"> Feature on the homepage</label>
      </div>

      <div class="full">
        <label>Body</label>
        <textarea name="body" rows="26" required>${esc(p.body)}</textarea>
        <details class="help">
          <summary>Shortcodes you can use</summary>
<pre>[answer]The direct answer, 2–3 sentences.[/answer]

[toc]                                    builds itself from the H2s

## A heading                             markdown headings get IDs automatically

[figure screen="list" caption="Optional caption."]
   screens: ${Object.keys(screens).join(', ')}

[table caption="Optional"]
Header A | Header B
Cell 1   | Cell 2
[/table]

[quote cite="Name, Role"]The pull quote.[/quote]

[takeaways]
- First point
- Second point
[/takeaways]

[cta title="Optional heading" body="Optional paragraph."]</pre>
        </details>
      </div>

      <div class="full">
        <h2>FAQ block <span class="count" style="float:none;margin-left:8px">renders as an accordion and as FAQPage schema</span></h2>
        ${faqRows}
        <p class="hint">Leave a row blank to skip it. Save and reopen to add more rows.</p>
      </div>

      <div class="full actions" style="margin-top:8px">
        <button class="btn" type="submit">Save</button>
        <a class="btn ghost" href="/">Cancel</a>
        ${
          isNew
            ? ''
            : `<span style="flex:1"></span>
        <button class="btn danger" type="submit" formaction="/delete" formnovalidate
          onclick="return confirm('Delete this post and its revisions? This cannot be undone.')">Delete post</button>`
        }
      </div>
    </form>`,
    flash
  );
}

/* --------------------------------------------------------------- data loads */
const loadIndex = async () => ({ posts: await allPosts(), s: await stats() });
const loadEdit = async (post) => ({
  post,
  cats: await allCategories(),
  authors: await allAuthors(),
});

/* ------------------------------------------------------------------ helpers */
const readBody = (req) =>
  new Promise((res, rej) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 5e6) req.destroy();
    });
    req.on('end', () => res(new URLSearchParams(data)));
    req.on('error', rej);
  });

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);

const send = (res, status, html) => {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
};

const redirect = (res, to) => {
  res.writeHead(303, { Location: to });
  res.end();
};

const flashOk = (msg) => `<div class="flash ok">${esc(msg)}</div>`;
const flashErr = (msg) => `<div class="flash err">${esc(msg)}</div>`;

/* ------------------------------------------------------------------- server */
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  try {
    // Fonts, so the admin matches the brand without a network request.
    if (path.startsWith('/_asset/')) {
      const file = join(ROOT, 'public', path.replace('/_asset/', ''));
      if (!resolve(file).startsWith(join(ROOT, 'public'))) return send(res, 403, 'no');
      res.writeHead(200, { 'Content-Type': 'font/woff2', 'Cache-Control': 'max-age=86400' });
      return res.end(readFileSync(file));
    }

    if (req.method === 'GET' && path === '/') {
      const f = url.searchParams.get('ok')
        ? flashOk(url.searchParams.get('ok'))
        : url.searchParams.get('err')
        ? flashErr(url.searchParams.get('err'))
        : lastBuild
        ? ((m) => ((lastBuild = null), m))(
            flashOk('Site rebuilt — dist/ is up to date.') +
              `<div class="flash ok"><pre>${esc(lastBuild)}</pre></div>`
          )
        : '';
      return send(res, 200, indexView(await loadIndex(), f));
    }

    if (req.method === 'GET' && path === '/new') {
      return send(res, 200, editView(await loadEdit(null), ''));
    }

    if (req.method === 'GET' && path.startsWith('/edit/')) {
      const post = await postBySlug(decodeURIComponent(path.slice(6)));
      if (!post) return send(res, 404, layout('Not found', '<h1>No such post</h1><p><a href="/">Back</a></p>'));
      const f = url.searchParams.get('ok') ? flashOk(url.searchParams.get('ok')) : '';
      return send(res, 200, editView(await loadEdit(post), f));
    }

    if (req.method === 'POST' && path === '/save') {
      const f = await readBody(req);
      const title = (f.get('title') || '').trim();
      const slug = slugify(f.get('slug') || title);
      if (!slug) throw new Error('A title or slug is required.');

      const qs = f.getAll('faq_q');
      const as = f.getAll('faq_a');
      const faqs = qs
        .map((q, i) => ({ q: q.trim(), a: (as[i] || '').trim() }))
        .filter((x) => x.q && x.a);

      const body = f.get('body') || '';
      const bodyFormat = f.get('bodyFormat') === 'html' ? 'html' : 'markdown';
      // Validate shortcodes before writing, so a typo cannot break the build.
      renderBody({ body, bodyFormat });

      const post = {
        slug,
        category: f.get('category'),
        authorSlug: f.get('authorSlug'),
        title,
        metaTitle: (f.get('metaTitle') || title).trim(),
        description: (f.get('description') || '').trim(),
        excerpt: (f.get('excerpt') || '').trim(),
        body,
        bodyFormat,
        primaryKeyword: (f.get('primaryKeyword') || '').trim() || null,
        secondaryKeywords: (f.get('secondaryKeywords') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        thumb: f.get('thumb') || 'list',
        readMins: Number(f.get('readMins')) || 8,
        featured: f.get('featured') === '1',
        status: f.get('status') || 'draft',
        published: f.get('published') || null,
        modified: new Date().toISOString().slice(0, 10),
        faqs,
        revisionNote: 'Edited in admin',
      };

      const original = f.get('original_slug');
      if (original && original !== slug) await deletePost(original);
      await savePost(post);
      return redirect(res, `/edit/${slug}?ok=${encodeURIComponent('Saved. Rebuild the site to publish the change.')}`);
    }

    if (req.method === 'POST' && path === '/status') {
      const f = await readBody(req);
      await setStatus(f.get('slug'), f.get('status'), new Date().toISOString().slice(0, 10));
      return redirect(res, `/?ok=${encodeURIComponent('Status updated. Rebuild the site to apply it.')}`);
    }

    if (req.method === 'POST' && path === '/delete') {
      const f = await readBody(req);
      const slug = f.get('original_slug');
      await deletePost(slug);
      return redirect(res, `/?ok=${encodeURIComponent(`Deleted ${slug}.`)}`);
    }

    if (req.method === 'POST' && path === '/build') {
      const out = await new Promise((done) => {
        const child = spawn(process.execPath, ['build.mjs'], { cwd: ROOT });
        let buf = '';
        child.stdout.on('data', (d) => (buf += d));
        child.stderr.on('data', (d) => (buf += d));
        child.on('close', (code) => done((code ? `Build failed (exit ${code})\n` : '') + buf.trim()));
      });
      lastBuild = out.split('\n').slice(-4).join('\n');
      return redirect(res, '/');
    }

    send(res, 404, layout('Not found', '<h1>Not found</h1><p><a href="/">Back to posts</a></p>'));
  } catch (err) {
    try {
      send(res, 400, indexView(await loadIndex(), flashErr(err.message)));
    } catch {
      send(res, 500, layout('Error', `<h1>Error</h1><p>${esc(err.message)}</p>`));
    }
  }
});

// Loopback only — this tool has no authentication by design.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nContentLineup admin:  http://127.0.0.1:${PORT}`);
  console.log(`Store:                ${driver} → ${target}`);
  console.log(`\nLocal only, no auth — do not expose this port.\n`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
