// Local admin UI for the content database.
//
//   node admin/server.mjs     → http://127.0.0.1:8081   (on its own)
//   npm run admin
//   npm start                 → http://localhost:8080/admin  (mounted on the site)
//
// Exports `handler` so serve.mjs can mount it under /admin and serve the
// marketing site and the editor from one port. Mounted, ADMIN_BASE carries the
// prefix — see paths.mjs, which is the only place that knows about it.
//
// Bound to loopback, and behind a login: see admin/auth.mjs. Loopback is what
// keeps the network out; the login is what keeps a browser tab left open on a
// shared machine from being an open door to the site's content.
//
// It is still an authoring tool rather than a deployed service — do not expose
// the port. The published site is the static output in dist/; this never
// serves that.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  allPlans,
  planBySlug,
  savePlan,
  deletePlan,
  setPlanFeatured,
  allBlocks,
  blockByKey,
  saveBlock,
  deleteBlock,
  upsertAuthor,
  upsertCategory,
  deleteAuthor,
  deleteCategory,
  authorBySlug,
  categoryBySlug,
  authorUsage,
  categoryUsage,
} from '../db/store.mjs';
import { renderBody } from '../db/render.mjs';
import { screens, site } from '../src/data/site.mjs';
import { BLOCKS, blockDef, effective } from '../src/data/content-blocks.mjs';
import { parseField, applyAction } from './form.mjs';
import { validateBlock } from './validate.mjs';
import {
  contentIndexView,
  blockEditView,
  referenceView,
  authorEditView,
  categoryEditView,
} from './content-views.mjs';
import { createAuth, loginView, safeNext, lockedFor } from './auth.mjs';
import { BASE as B, u, strip } from './paths.mjs';
import { LOGIN_PATH } from '../src/lib/admin-link.mjs';
import { onVercel, deployHook, isSecureRequest } from './platform.mjs';

// The repo root, one level up now that this lives in admin/. It is what the
// font handler resolves against and the working directory the build runs in.
const ROOT = resolve(import.meta.dirname, '..');
const PORT = Number(process.env.ADMIN_PORT) || 8081;

/** True when this file was started directly, rather than imported to be mounted. */
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

try {
  await ready();
} catch (err) {
  const msg = `Cannot reach the content store (${driver} → ${target}).\n${err.message}`;
  // Run directly, an unreachable store means there is nothing to do: say so
  // and stop. Mounted inside the site server it is not fatal — the marketing
  // pages are static files that never touch the database — so throw, and let
  // the caller keep serving them with /admin reporting the problem.
  if (isMain) {
    console.error(msg);
    process.exit(1);
  }
  throw new Error(msg);
}

/**
 * Content type for a file served from public/.
 *
 * A fixed font/woff2 was fine while fonts were the only thing here, but it is
 * the kind of shortcut that turns into a mystery the first time someone points
 * the admin at a logo and the browser refuses to draw it.
 */
const ASSET_TYPES = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.css': 'text/css; charset=utf-8',
};
const assetType = (file) => ASSET_TYPES[extname(file).toLowerCase()] || 'application/octet-stream';

/**
 * Where the admin's own fonts come from.
 *
 * Mounted, the site is on the same origin and already serves /fonts/ out of
 * dist — so the admin borrows them and the /_asset/ route is never touched.
 * That is what makes the deployed admin work: a serverless function ships the
 * code it can be seen to import, not a public/ directory read at a path built
 * at runtime, so reading the font off disk there would 404.
 *
 * Standalone there is no site next to it, and /_asset/ serves them from public/.
 */
const FONTS = B ? '/fonts' : '/_asset/fonts';

const auth = createAuth();

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
@font-face{font-family:'Inter';src:url('${FONTS}/inter-latin.woff2') format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:'Fraunces';src:url('${FONTS}/fraunces-latin.woff2') format('woff2');font-weight:100 900;font-display:swap}
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

/* ---- site content editor ---- */
.head{display:flex;align-items:flex-end;gap:16px;justify-content:space-between;margin:26px 0 12px}
.head h1,.head h2{margin:0}
.head+table{margin-top:0}
.pill.edited{background:var(--accent-soft);color:var(--accent);margin-left:6px}
td.cell{max-width:520px;font-size:12.5px;color:var(--sub);white-space:normal}
.card.warn{border-color:#f0dcc0;background:var(--amber-soft)}
.card.warn strong{color:var(--amber)}
.btn.xs{padding:3px 8px;font-size:12px;border-radius:7px;line-height:1.4}
.btn:disabled{opacity:.35;cursor:default}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.fields>.f>label{margin-bottom:6px}
.fields>fieldset,.fields>.rep{grid-column:1/-1}
.f{min-width:0}
fieldset{border:1px solid var(--rule);border-radius:10px;padding:14px 16px 16px;margin:0;background:#fcfbf8}
legend{font:650 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--sub);padding:0 6px}
label.check{display:flex;align-items:center;gap:8px;font:550 13px var(--sans);color:var(--ink);
margin:22px 0 0;cursor:pointer}
label.check input[type=checkbox]{width:16px;height:16px;margin:0;accent-color:var(--accent)}
.rep{border:1px solid var(--rule);border-radius:12px;background:var(--paper2);margin:4px 0 2px}
.rep-bar{display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid var(--rule);
background:#f5f4f0;border-radius:12px 12px 0 0}
.rep-bar strong{font-family:var(--serif);font-size:15px}
.rep-bar .mono{margin-right:auto}
.rep-item{border-bottom:1px solid #f0eee9;padding:0 14px 16px}
.rep-item:last-child{border-bottom:0;border-radius:0 0 12px 12px}
.rep-head{display:flex;align-items:center;gap:10px;padding:11px 0 12px;position:sticky;top:57px;
background:var(--paper2);z-index:2}
.rep-n{font:650 10.5px var(--mono);background:var(--cream);color:var(--sub);border-radius:99px;
padding:3px 8px;flex:none}
.rep-title{font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rep-btns{margin-left:auto;display:flex;gap:6px;flex:none}
.rep .rep{background:#fcfbf8}
textarea.code{font-size:12.5px;line-height:1.55;tab-size:2}
.sticky{position:sticky;bottom:0;display:flex;align-items:center;gap:12px;padding:14px 0;
background:linear-gradient(to top,var(--paper) 62%,rgba(250,250,247,0));margin-top:8px}
.sticky .hint{margin:0}
.blockform>.fields,.blockform>.rep{margin-bottom:8px}
.errs{margin:0;padding-left:20px}
.login{max-width:380px;margin:6vh auto 0}
.login h1{margin-bottom:6px}
.login form{background:var(--paper2);border:1px solid var(--rule);border-radius:12px;padding:22px}
.login label{margin-top:14px}
.login label:first-child{margin-top:0}
.login .btn{width:100%;justify-content:center;margin-top:20px}
.login .hint{text-align:center;margin-top:16px}
.errs li{margin-bottom:4px}
@media(max-width:860px){form.grid{grid-template-columns:1fr}.faqrow{grid-template-columns:1fr}
.fields{grid-template-columns:1fr}.head{flex-direction:column;align-items:flex-start}}
`;

/**
 * The page chrome.
 *
 * `bare` drops the navigation, for the one page that is reachable without a
 * session: offering Posts, Pricing and Rebuild to someone who is not signed in
 * is a row of buttons that can only bounce them back to where they already are.
 */
const layout = (title, body, flash = '', bare = false) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · ContentLineup admin</title>
<style>${CSS}</style></head><body>
<header><div class="bar">
  <span class="brand">Content<b>Lineup</b></span>
  <span class="tag">Content database</span>
  ${
    bare
      ? ''
      : `<div class="right">
    <a class="btn ghost sm" href="${B}/">Posts</a>
    <a class="btn ghost sm" href="${B}/plans">Pricing</a>
    <a class="btn ghost sm" href="${B}/content">Site content</a>
    <a class="btn ghost sm" href="${B}/reference">Authors</a>
    <a class="btn sm" href="${B}/new">New post</a>
    <form method="post" action="${B}/build" style="display:inline"><button class="btn ghost sm">Rebuild site</button></form>
    ${auth.enabled ? `<form method="post" action="${B}/logout" style="display:inline"><button class="btn ghost sm" title="Sign out">Sign out</button></form>` : ''}
  </div>`
  }
</div></header>
<main>${flash}${body}</main>
</body></html>`;

/* -------------------------------------------------------------------- views */
function indexView({ posts, s }, flash) {
  const rows = posts
    .map(
      (p) => `<tr>
    <td>
      <a href="${B}/edit/${esc(p.slug)}"><strong>${esc(p.title)}</strong></a>
      ${p.featured ? '<span class="star" title="Featured on the homepage">★</span>' : ''}
      <div class="mono">${esc(p.path)}</div>
    </td>
    <td>${esc(p.categoryLabel)}</td>
    <td><span class="pill ${p.status}">${p.status}</span></td>
    <td class="mono">${esc(p.published || '—')}</td>
    <td class="mono">${p.readMins} min</td>
    <td class="mono actions">
      <a class="btn ghost sm" href="${B}/edit/${esc(p.slug)}">Edit</a>
      ${
        p.status === 'published'
          ? `<a class="btn ghost sm" href="http://localhost:8080${esc(p.path)}" target="_blank" rel="noopener">View</a>`
          : `<form method="post" action="${B}/status"><input type="hidden" name="slug" value="${esc(
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

    <form method="post" action="${B}/save" class="grid">
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
        <a class="btn ghost" href="${B}/">Cancel</a>
        ${
          isNew
            ? ''
            : `<span style="flex:1"></span>
        <button class="btn danger" type="submit" formaction="${B}/delete" formnovalidate
          onclick="return confirm('Delete this post and its revisions? This cannot be undone.')">Delete post</button>`
        }
      </div>
    </form>`,
    flash
  );
}

/* --------------------------------------------------------------- data loads */
/* ================================================================== pricing */

/** Bullets are edited as one-per-line: a plan has nine of them and their order
    matters, and nine text inputs is a worse way to move line six above line two
    than simply editing a list. */
const linesToList = (s) =>
  String(s || '')
    .split('\n')
    .map((l) => l.replace(/^\s*[-*·]\s*/, '').trim())
    .filter(Boolean);

function plansView(plans, flash) {
  const rows = plans
    .map(
      (p) => `<tr>
    <td>
      <a href="${B}/plans/edit/${esc(p.id)}"><strong>${esc(p.name)}</strong></a>
      ${p.featured ? '<span class="star" title="Highlighted as most popular">★</span>' : ''}
      <div class="mono">${esc(p.id)}</div>
    </td>
    <td><strong>${esc(p.price)}</strong><span class="mono">${esc(p.period)}</span></td>
    <td class="mono">${p.annual ? esc(p.annual.price) + ' · ' + esc(p.annual.perMonth) + '/mo' : '—'}</td>
    <td>${esc(p.kicker)}</td>
    <td class="mono">${p.includes.length} bullet${p.includes.length === 1 ? '' : 's'}</td>
    <td class="actions">
      <a class="btn ghost sm" href="${B}/plans/edit/${esc(p.id)}">Edit</a>
      ${
        p.featured
          ? ''
          : `<form method="post" action="${B}/plans/feature"><input type="hidden" name="slug" value="${esc(
              p.id
            )}"><button class="btn ghost sm">Make featured</button></form>`
      }
    </td>
  </tr>`
    )
    .join('');

  const body = `
  <h1>Pricing</h1>
  <p class="sub">These three rows are what the homepage and /pricing render. Changing a price here
    changes it everywhere it appears, on the next rebuild.</p>
  <div class="stats">
    <div class="stat"><b>${plans.length}</b><span>plans</span></div>
    <div class="stat"><b>${plans.filter((p) => p.annual).length}</b><span>with annual</span></div>
    <div class="stat"><b>${plans.reduce((n, p) => n + p.includes.length, 0)}</b><span>bullets</span></div>
  </div>
  <table>
    <thead><tr><th>Plan</th><th>Monthly</th><th>Annual</th><th>Kicker</th><th>Includes</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">No plans yet. Seed them with <span class="mono">npm run plans:push</span>.</td></tr>'}</tbody>
  </table>
  <p class="hint">Order is set by the <span class="mono">sort</span> field on each plan. After saving,
    use <strong>Rebuild site</strong> to publish the change into <span class="mono">dist/</span>.</p>`;
  return layout('Pricing', body, flash);
}

function planEditView(plan, flash) {
  const p =
    plan || {
      id: '',
      name: '',
      sort: 0,
      price: '',
      period: '/month',
      numeric: '',
      annual: null,
      kicker: '',
      outcome: '',
      summary: '',
      ctaLabel: 'Start free',
      featured: false,
      includes: [],
      limits: '',
    };
  const a = p.annual || { price: '', numeric: '', perMonth: '', saving: '' };
  const isNew = !plan;

  const body = `
  <h1>${isNew ? 'New plan' : esc(p.name)}</h1>
  <p class="sub">${
    isNew
      ? 'A plan needs a slug that will not change — it is what the database and the CTA tracking key off.'
      : 'Slug <span class="mono">' + esc(p.id) + '</span>'
  }</p>
  <form class="grid" method="post" action="${B}/plans/save">
    <input type="hidden" name="original" value="${esc(p.id)}">

    <div>
      <label>Slug</label>
      <input name="slug" value="${esc(p.id)}" ${isNew ? '' : 'readonly'} required>
      <div class="hint">Lowercase, no spaces. Used by the analytics CTA id.</div>
    </div>
    <div>
      <label>Name</label>
      <input name="name" value="${esc(p.name)}" required>
    </div>

    <div>
      <label>Monthly price</label>
      <input name="price" value="${esc(p.price)}" placeholder="$29" required>
      <div class="hint">Shown as typed, currency symbol and all.</div>
    </div>
    <div>
      <label>Period</label>
      <input name="period" value="${esc(p.period)}" placeholder="/month" required>
    </div>

    <div>
      <label>Numeric price</label>
      <input name="numeric" value="${esc(p.numeric)}" placeholder="29" required>
      <div class="hint">Digits only — this is the figure in the JSON-LD offer, where a real number is required.</div>
    </div>
    <div>
      <label>Sort</label>
      <input name="sort" type="number" value="${esc(String(p.sort ?? 0))}">
      <div class="hint">Low to high, left to right.</div>
    </div>

    <div class="full"><h2>Annual billing</h2>
      <div class="hint">Leave the annual price empty for a plan with no yearly option — the other three
        are then ignored. The database rejects a half-filled annual price.</div>
    </div>
    <div>
      <label>Annual price</label>
      <input name="annualPrice" value="${esc(a.price)}" placeholder="$290">
    </div>
    <div>
      <label>Annual numeric</label>
      <input name="annualNumeric" value="${esc(a.numeric)}" placeholder="290">
    </div>
    <div>
      <label>Shown per month</label>
      <input name="annualPerMonth" value="${esc(a.perMonth)}" placeholder="$24">
    </div>
    <div>
      <label>Saving label</label>
      <input name="annualSaving" value="${esc(a.saving)}" placeholder="2 months free">
    </div>

    <div class="full"><h2>Copy</h2></div>
    <div>
      <label>Kicker</label>
      <input name="kicker" value="${esc(p.kicker)}" placeholder="Most popular" required>
      <div class="hint">The badge above the card.</div>
    </div>
    <div>
      <label>CTA label</label>
      <input name="ctaLabel" value="${esc(p.ctaLabel || 'Start free')}" required>
      <div class="hint">The link target is the signup URL from site config, the same for every plan.</div>
    </div>
    <div class="full">
      <label>Outcome</label>
      <input name="outcome" value="${esc(p.outcome)}" required>
      <div class="hint">The serif line on the homepage card. One sentence, in the customer's terms.</div>
    </div>
    <div class="full">
      <label>Summary</label>
      <textarea name="summary" rows="3" required>${esc(p.summary)}</textarea>
      <div class="hint">The paragraph on /pricing. Keeping the three summaries a similar length is what
        keeps the three CTA buttons on one line.</div>
    </div>
    <div class="full">
      <label>Includes <span class="count">${p.includes.length} lines</span></label>
      <textarea name="includes" rows="10">${esc((p.includes || []).join('\n'))}</textarea>
      <div class="hint">One bullet per line, in the order they should appear. The homepage shows the
        first five; /pricing shows all of them.</div>
    </div>
    <div class="full">
      <label>Limits</label>
      <textarea name="limits" rows="2" required>${esc(p.limits)}</textarea>
      <div class="hint">The dashed footer line on /pricing.</div>
    </div>

    <div class="full">
      <label><input type="checkbox" name="featured" value="1" style="width:auto;margin-right:8px"${
        p.featured ? ' checked' : ''
      }>Highlight this plan as most popular</label>
      <div class="hint">Only one plan can carry it; ticking this clears it from whichever plan has it now.</div>
    </div>

    <div class="full actions">
      <button class="btn">Save plan</button>
      <a class="btn ghost" href="${B}/plans">Cancel</a>
      ${
        isNew
          ? ''
          : `<form method="post" action="${B}/plans/delete" onsubmit="return confirm('Delete ${esc(
              p.name
            )}? This cannot be undone.')" style="margin-left:auto"><input type="hidden" name="slug" value="${esc(
              p.id
            )}"><button class="btn danger">Delete</button></form>`
      }
    </div>
  </form>`;
  return layout(isNew ? 'New plan' : p.name, body, flash);
}

const loadIndex = async () => ({ posts: await allPosts(), s: await stats() });
const loadEdit = async (post) => ({
  post,
  cats: await allCategories(),
  authors: await allAuthors(),
});

/* ------------------------------------------------------------------ helpers */
/**
 * The submitted form.
 *
 * Reads the request stream, except where something upstream has already read it
 * for us: a serverless runtime commonly parses the body and hands it over as
 * `req.body`, and the stream behind it is then finished. Waiting on 'end' there
 * returns an empty form rather than the one that was filled in, and every save
 * silently loses its content — so the parsed body wins when it is present.
 */
const readBody = (req) => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return Promise.resolve(new URLSearchParams(req.body));
    if (Buffer.isBuffer(req.body)) return Promise.resolve(new URLSearchParams(req.body.toString('utf8')));
    if (typeof req.body === 'object') {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(req.body)) {
        for (const one of Array.isArray(v) ? v : [v]) params.append(k, String(one));
      }
      return Promise.resolve(params);
    }
  }
  return new Promise((res, rej) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 5e6) req.destroy();
    });
    req.on('end', () => res(new URLSearchParams(data)));
    req.on('error', rej);
  });
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);

const send = (res, status, html) => {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  // A HEAD gets the headers and the status and no body, by definition. The
  // request is reachable from the response in Node, so every call site below
  // stays a plain send() and none of them has to think about it.
  if (res.req?.method === 'HEAD') return res.end();
  res.end(html);
};

const redirect = (res, to) => {
  // Callers pass a path as the admin's own routes name it; the mount prefix is
  // added here so no caller has to remember it.
  res.writeHead(303, { Location: u(to) });
  res.end();
};

const flashOk = (msg) => `<div class="flash ok">${esc(msg)}</div>`;
const flashErr = (msg) => `<div class="flash err">${esc(msg)}</div>`;

/** A list of problems, as one block rather than one flash per line. */
const flashList = (kind, title, items) =>
  `<div class="flash ${kind}"><strong>${esc(title)}</strong>
     <ul class="errs">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`;

/**
 * The content register with the current overrides laid over it.
 *
 * Read per request rather than once at startup: a cross-block check — is this
 * integration group one that exists? — has to see an edit made a minute ago,
 * and the module-level snapshot in content-blocks.mjs was taken when the admin
 * booted.
 */
const loadContent = async () => {
  const overrides = await allBlocks();
  return { overrides, live: effective(overrides) };
};

/** Everything the block editor needs to render one key. */
const loadBlock = async (key, json) => {
  const def = blockDef(key);
  if (!def) return null;
  const { overrides, live } = await loadContent();
  const row = key in overrides ? await blockByKey(key) : null;
  return {
    def,
    live,
    json,
    value: live[key],
    isEdited: key in overrides,
    updatedAt: row?.updated_at || null,
  };
};

/* ------------------------------------------------------------------- server */
/**
 * One request. Exported so it can be mounted inside another server; the
 * routes below are matched on the path with any mount prefix removed, so
 * nothing here cares which of the two it is running in.
 */
export const handler = async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  // Routes are matched on the path as the admin names it, with any mount
  // prefix removed — so mounting it under /admin changes no route below.
  const path = strip(url.pathname);

  // HEAD asks for exactly what GET would return, minus the body, so it is
  // matched as GET and send() drops the body. Left as its own method, HEAD
  // matched no route at all, fell through to the sign-in redirect, and then
  // did the same on the login page it was sent to — a redirect loop that any
  // link checker or uptime probe hits on its first request.
  const method = req.method === 'HEAD' ? 'GET' : req.method;

  try {
    // Fonts, so the admin matches the brand without a network request. Left
    // outside the guard so the login page is not typeset in a fallback font.
    if (path.startsWith('/_asset/')) {
      const dir = join(ROOT, 'public');
      const file = join(dir, path.replace('/_asset/', ''));
      // resolve() collapses any ..; anything that climbs out of public/ is not
      // ours to serve. join(dir, '') would equal dir, so compare against dir +
      // separator rather than dir, or '/publicfoo' would pass this check.
      if (!resolve(file).startsWith(dir + sep)) return send(res, 403, 'Not allowed');

      // Read before writing the header, not after. The other order sends a 200
      // and then throws on a missing file, and the error handler below cannot
      // send anything once the header has gone — which took the whole process
      // down with it, on an unauthenticated request for any name that happened
      // not to exist.
      let body;
      try {
        body = readFileSync(file);
      } catch {
        return send(res, 404, 'Not found');
      }
      res.writeHead(200, { 'Content-Type': assetType(file), 'Cache-Control': 'max-age=86400' });
      return res.end(req.method === 'HEAD' ? undefined : body);
    }

    /* ----------------------------------------------------------------- login */
    if (method === 'GET' && path === '/login') {
      if (!auth.enabled || auth.isLoggedIn(req)) return redirect(res, '/');
      return send(res, 200, loginView(layout, { next: url.searchParams.get('next') || '/' }));
    }

    if (method === 'POST' && path === '/login') {
      const f = await readBody(req);
      const username = f.get('username');

      // Submitted from the site's own /login, which is one form for two
      // different sign-ins. A username that is not the admin's belongs to a
      // ContentLineup customer, so send them to the product's sign-in page —
      // and note what does NOT happen to the password they typed: the app is a
      // separate service this site cannot authenticate against, so it is
      // dropped here, unread. Never stored, never logged, never forwarded.
      // Only when mounted: /login is a page of the site, so it exists exactly
      // when the site is serving this admin. Standalone there is nothing to
      // send anyone back to, and this stays the plain admin login it was.
      const fromSite = f.get('from') === 'site' && !!B;
      if (fromSite && auth.enabled && !auth.isUser(username)) {
        res.writeHead(303, { Location: site.app.login });
        return res.end();
      }

      const result = auth.login(username, f.get('password'), { secure: isSecureRequest(req) });
      if (!result.ok) {
        // Back to whichever form was used, so a typo is corrected where it was
        // made. The site's page reads the reason off the fragment (CSS :target,
        // no JavaScript); the admin's own form renders it directly.
        if (fromSite) {
          res.writeHead(303, { Location: `${LOGIN_PATH}#${lockedFor() ? 'locked' : 'error'}` });
          return res.end();
        }
        // 401, not 200: a failed sign-in is a failed sign-in, and saying so in
        // the status keeps anything scripted against this honest.
        return send(res, 401, loginView(layout, { error: result.error, next: f.get('next') }));
      }
      // Only ever redirect to a path on this admin. An open redirect here would
      // turn the login into a way of laundering a link to somewhere else.
      res.writeHead(303, { Location: u(safeNext(f.get('next'))), 'Set-Cookie': result.cookie });
      return res.end();
    }

    if (method === 'POST' && path === '/logout') {
      res.writeHead(303, {
        Location: u('/login'),
        'Set-Cookie': auth.logoutCookie({ secure: isSecureRequest(req) }),
      });
      return res.end();
    }

    // Everything past this point needs a session.
    if (auth.enabled && !auth.isLoggedIn(req)) {
      // GET and HEAD are the two methods that only ask for a page, so both get
      // sent to the login. HEAD used to fall through to the 401 below, which
      // meant every link checker and uptime probe reported the admin as broken
      // rather than as protected.
      const reading = method === 'GET' || method === 'HEAD';
      if (!reading) {
        // A POST from a stale tab: send it to the login rather than silently
        // dropping it, so it is obvious the session expired.
        return send(res, 401, loginView(layout, { error: 'Your session expired. Sign in again.', next: '/' }));
      }
      return redirect(res, `/login?next=${encodeURIComponent(path + url.search)}`);
    }

    /* ------------------------------------------------------------- pricing */
    if (method === 'GET' && path === '/plans') {
      const f = url.searchParams.get('ok')
        ? flashOk(url.searchParams.get('ok'))
        : url.searchParams.get('err')
        ? flashErr(url.searchParams.get('err'))
        : '';
      return send(res, 200, plansView(await allPlans(), f));
    }

    if (method === 'GET' && path === '/plans/new') {
      return send(res, 200, planEditView(null, ''));
    }

    if (method === 'GET' && path.startsWith('/plans/edit/')) {
      const plan = await planBySlug(decodeURIComponent(path.slice(12)));
      if (!plan)
        return send(res, 404, layout('Not found', `<h1>No such plan</h1><p><a href="${B}/plans">Back</a></p>`));
      const f = url.searchParams.get('ok') ? flashOk(url.searchParams.get('ok')) : '';
      return send(res, 200, planEditView(plan, f));
    }

    if (method === 'POST' && path === '/plans/save') {
      const f = await readBody(req);
      const slug = slugify(f.get('slug') || '');
      if (!slug) throw new Error('A plan needs a slug.');

      // The four annual fields travel together — the table has a check
      // constraint saying so, and a half-filled annual price would be rejected
      // there with a much less helpful message than this one.
      const annualPrice = (f.get('annualPrice') || '').trim();
      const annual = annualPrice
        ? {
            price: annualPrice,
            numeric: (f.get('annualNumeric') || '').trim(),
            perMonth: (f.get('annualPerMonth') || '').trim(),
            saving: (f.get('annualSaving') || '').trim(),
          }
        : null;
      if (annual && !(annual.numeric && annual.perMonth && annual.saving)) {
        throw new Error(
          'An annual price needs all four fields: price, numeric, shown-per-month and saving label.'
        );
      }

      const includes = linesToList(f.get('includes'));
      if (!includes.length) throw new Error('A plan needs at least one bullet in Includes.');

      await savePlan({
        id: slug,
        name: (f.get('name') || '').trim(),
        sort: Number(f.get('sort')) || 0,
        price: (f.get('price') || '').trim(),
        period: (f.get('period') || '/month').trim(),
        numeric: (f.get('numeric') || '0').trim(),
        annual,
        kicker: (f.get('kicker') || '').trim(),
        outcome: (f.get('outcome') || '').trim(),
        summary: (f.get('summary') || '').trim(),
        ctaLabel: (f.get('ctaLabel') || 'Start free').trim(),
        featured: f.get('featured') === '1',
        includes,
        limits: (f.get('limits') || '').trim(),
      });
      return redirect(res, `/plans/edit/${encodeURIComponent(slug)}?ok=${encodeURIComponent('Saved. Rebuild to publish it.')}`);
    }

    if (method === 'POST' && path === '/plans/feature') {
      const f = await readBody(req);
      await setPlanFeatured((f.get('slug') || '').trim());
      return redirect(res, `/plans?ok=${encodeURIComponent('Highlight moved. Rebuild to publish it.')}`);
    }

    if (method === 'POST' && path === '/plans/delete') {
      const f = await readBody(req);
      await deletePlan((f.get('slug') || '').trim());
      return redirect(res, `/plans?ok=${encodeURIComponent('Plan deleted.')}`);
    }

    /* -------------------------------------------------------- site content */
    if (method === 'GET' && path === '/content') {
      const { overrides, live } = await loadContent();
      const known = new Set(BLOCKS.map((b) => b.key));
      const f = url.searchParams.get('ok')
        ? flashOk(url.searchParams.get('ok'))
        : url.searchParams.get('err')
        ? flashErr(url.searchParams.get('err'))
        : '';
      return send(
        res,
        200,
        contentIndexView(
          layout,
          {
            live,
            edited: new Set(Object.keys(overrides).filter((k) => known.has(k))),
            orphans: Object.keys(overrides).filter((k) => !known.has(k)),
            counts: {
              faqs: (live.faqGroups || []).reduce((n, g) => n + (g.items?.length || 0), 0),
              features: (live.features || []).length,
            },
          },
          f
        )
      );
    }

    if (method === 'GET' && path.startsWith('/content/')) {
      const key = decodeURIComponent(path.slice('/content/'.length));
      const ctx = await loadBlock(key, url.searchParams.get('json') === '1');
      if (!ctx) {
        return send(
          res,
          404,
          layout(
            'Not found',
            `<h1>No content block called "${esc(key)}"</h1>
             <p><a href="${B}/content">Back to site content</a></p>`
          )
        );
      }
      const warn = url.searchParams.get('warn');
      const f = url.searchParams.get('ok')
        ? flashOk(url.searchParams.get('ok')) +
          (warn ? flashList('err', 'Saved, but worth a look:', warn.split('\n')) : '')
        : '';
      return send(res, 200, blockEditView(layout, ctx, f));
    }

    if (method === 'POST' && path === '/content/save') {
      const f = await readBody(req);
      const key = f.get('key');
      const def = blockDef(key);
      if (!def) throw new Error(`No content block called "${key}".`);
      const json = f.get('mode') === 'json';
      const { overrides, live } = await loadContent();
      const isEdited = key in overrides;

      let value;
      if (json) {
        try {
          value = JSON.parse(f.get('json') || '');
        } catch (err) {
          // Hand back what was typed, not the stored value: a syntax error two
          // hundred lines into an edit is not a reason to lose the edit.
          return send(
            res,
            400,
            blockEditView(
              layout,
              { def, live, json: true, value: f.get('json'), isEdited, updatedAt: null },
              flashErr(`That is not valid JSON, so nothing was saved: ${err.message}`)
            )
          );
        }
      } else {
        value = parseField(f, 'v', def.default);
      }

      // Add / Remove / Move. Applied to the form as submitted and handed back
      // unsaved, so the button never writes anything and never loses an edit
      // made to another entry first.
      const action = f.get('__action');
      if (action) {
        const said = applyAction(value, def.default, action);
        return send(
          res,
          200,
          blockEditView(
            layout,
            {
              def,
              live: effective({ ...overrides, [key]: value }),
              json,
              value,
              isEdited,
              updatedAt: null,
            },
            said ? flashOk(said) : flashErr('That change could not be applied.')
          )
        );
      }

      // Validated against the content as it would be *after* this save, so a
      // cross-block rule reads the new value rather than the stored one.
      const { errors, warnings } = validateBlock(key, value, effective({ ...overrides, [key]: value }));
      if (errors.length) {
        return send(
          res,
          400,
          blockEditView(
            layout,
            { def, live, json, value, isEdited, updatedAt: null },
            flashList('err', `Not saved — ${errors.length} problem${errors.length === 1 ? '' : 's'}:`, errors)
          )
        );
      }

      await saveBlock(key, value, 'Edited in admin');
      const q = new URLSearchParams({ ok: 'Saved. Rebuild to publish it.' });
      if (warnings.length) q.set('warn', warnings.join('\n'));
      return redirect(res, `/content/${encodeURIComponent(key)}?${q}`);
    }

    if (method === 'POST' && path === '/content/reset') {
      const f = await readBody(req);
      const key = f.get('key');
      const existed = await deleteBlock(key);
      return redirect(
        res,
        `/content?ok=${encodeURIComponent(
          existed
            ? `${key} is back to the content that ships in the repository. Rebuild to publish it.`
            : `${key} had no edits to discard.`
        )}`
      );
    }

    /* ----------------------------------------------------- reference data */
    if (method === 'GET' && path === '/reference') {
      const f = url.searchParams.get('ok')
        ? flashOk(url.searchParams.get('ok'))
        : url.searchParams.get('err')
        ? flashErr(url.searchParams.get('err'))
        : '';
      const [authors, cats, authorUse, catUse] = await Promise.all([
        allAuthors(),
        allCategories(),
        authorUsage(),
        categoryUsage(),
      ]);
      return send(res, 200, referenceView(layout, { authors, cats, authorUse, catUse }, f));
    }

    if (method === 'GET' && path === '/authors/new') {
      return send(res, 200, authorEditView(layout, null, ''));
    }

    if (method === 'GET' && path.startsWith('/authors/')) {
      const author = await authorBySlug(decodeURIComponent(path.slice('/authors/'.length)));
      if (!author) {
        return send(res, 404, layout('Not found', `<h1>No such author</h1><p><a href="${B}/reference">Back</a></p>`));
      }
      return send(res, 200, authorEditView(layout, author, ''));
    }

    if (method === 'POST' && path === '/authors/save') {
      const f = await readBody(req);
      const name = (f.get('name') || '').trim();
      if (!name) throw new Error('An author needs a name.');
      const slug = slugify(f.get('slug') || name);
      if (!slug) throw new Error('An author needs a slug.');

      // A slug change is a different author as far as posts are concerned, and
      // upserting the new one would leave the posts pointing at the old row.
      const original = (f.get('original_slug') || '').trim();
      if (original && original !== slug) {
        throw new Error(
          `An author's slug cannot be changed here: posts reference "${original}" and would be left ` +
            'pointing at the old record. Create the new author, move the posts across, then delete the old one.'
        );
      }

      await upsertAuthor({
        slug,
        name,
        email: (f.get('email') || '').trim() || null,
        bio: (f.get('bio') || '').trim() || null,
        url: (f.get('url') || '').trim() || null,
      });
      return redirect(res, `/reference?ok=${encodeURIComponent(`Saved ${name}.`)}`);
    }

    if (method === 'POST' && path === '/authors/delete') {
      const f = await readBody(req);
      const slug = (f.get('slug') || '').trim();
      await deleteAuthor(slug);
      return redirect(res, `/reference?ok=${encodeURIComponent(`Deleted ${slug}.`)}`);
    }

    if (method === 'GET' && path === '/categories/new') {
      return send(res, 200, categoryEditView(layout, null, ''));
    }

    if (method === 'GET' && path.startsWith('/categories/')) {
      const cat = await categoryBySlug(decodeURIComponent(path.slice('/categories/'.length)));
      if (!cat) {
        return send(res, 404, layout('Not found', `<h1>No such category</h1><p><a href="${B}/reference">Back</a></p>`));
      }
      return send(res, 200, categoryEditView(layout, cat, ''));
    }

    if (method === 'POST' && path === '/categories/save') {
      const f = await readBody(req);
      const label = (f.get('label') || '').trim();
      const singular = (f.get('singular') || '').trim();
      if (!label || !singular) throw new Error('A category needs both a plural label and a singular one.');
      const slug = slugify(f.get('slug') || label);
      if (!slug) throw new Error('A category needs a slug.');

      // The slug is in the URL of every post in the category, so renaming one
      // that holds posts silently breaks those links.
      const original = (f.get('original_slug') || '').trim();
      if (original && original !== slug) {
        const use = (await categoryUsage())[original] || 0;
        if (use) {
          throw new Error(
            `"${original}" holds ${use} post${use === 1 ? '' : 's'}, and the slug is part of their URLs. ` +
              'Renaming it would break those links with nothing redirecting them.'
          );
        }
        await deleteCategory(original);
      }

      await upsertCategory({ slug, label, singular, sort: Number(f.get('sort')) || 0 });
      return redirect(res, `/reference?ok=${encodeURIComponent(`Saved ${label}.`)}`);
    }

    if (method === 'POST' && path === '/categories/delete') {
      const f = await readBody(req);
      const slug = (f.get('slug') || '').trim();
      await deleteCategory(slug);
      return redirect(res, `/reference?ok=${encodeURIComponent(`Deleted ${slug}.`)}`);
    }

    if (method === 'GET' && path === '/') {
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

    if (method === 'GET' && path === '/new') {
      return send(res, 200, editView(await loadEdit(null), ''));
    }

    if (method === 'GET' && path.startsWith('/edit/')) {
      const post = await postBySlug(decodeURIComponent(path.slice(6)));
      if (!post) return send(res, 404, layout('Not found', `<h1>No such post</h1><p><a href="${B}/">Back</a></p>`));
      const f = url.searchParams.get('ok') ? flashOk(url.searchParams.get('ok')) : '';
      return send(res, 200, editView(await loadEdit(post), f));
    }

    if (method === 'POST' && path === '/save') {
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

    if (method === 'POST' && path === '/status') {
      const f = await readBody(req);
      await setStatus(f.get('slug'), f.get('status'), new Date().toISOString().slice(0, 10));
      return redirect(res, `/?ok=${encodeURIComponent('Status updated. Rebuild the site to apply it.')}`);
    }

    if (method === 'POST' && path === '/delete') {
      const f = await readBody(req);
      const slug = f.get('original_slug');
      await deletePost(slug);
      return redirect(res, `/?ok=${encodeURIComponent(`Deleted ${slug}.`)}`);
    }

    if (method === 'POST' && path === '/build') {
      // Deployed, there is no build to run: the filesystem is read-only, the
      // source is not there, and the pages are already on a CDN. What republishes
      // an edit is a new deployment, so the button asks for one.
      if (onVercel) {
        if (!deployHook) {
          return redirect(
            res,
            `/?err=${encodeURIComponent(
              'Saved — but this deployment has no way to republish itself. Add a deploy hook ' +
                '(Vercel → Settings → Git → Deploy Hooks) as VERCEL_DEPLOY_HOOK_URL, or redeploy by hand.'
            )}`
          );
        }
        try {
          const hooked = await fetch(deployHook, { method: 'POST' });
          if (!hooked.ok) throw new Error(`the hook answered ${hooked.status}`);
          return redirect(
            res,
            `/?ok=${encodeURIComponent(
              'Rebuild requested. Vercel is deploying; the change is live once it finishes, usually a minute or two.'
            )}`
          );
        } catch (err) {
          return redirect(res, `/?err=${encodeURIComponent(`Could not ask Vercel to rebuild: ${err.message}`)}`);
        }
      }

      const out = await new Promise((done) => {
        // Mounted inside the site server, the site being rebuilt is one that
        // is served with the admin attached — so it keeps the link to it.
        // Without this, pressing Rebuild removed the only way back here.
        const args = ['build.mjs', ...(B ? ['--admin-link'] : [])];
        const child = spawn(process.execPath, args, { cwd: ROOT });
        let buf = '';
        child.stdout.on('data', (d) => (buf += d));
        child.stderr.on('data', (d) => (buf += d));
        child.on('close', (code) => done((code ? `Build failed (exit ${code})\n` : '') + buf.trim()));
      });
      lastBuild = out.split('\n').slice(-4).join('\n');
      return redirect(res, '/');
    }

    send(res, 404, layout('Not found', `<h1>Not found</h1><p><a href="${B}/">Back to posts</a></p>`));
  } catch (err) {
    // A handler that already started the response cannot be given a new one:
    // writeHead would throw again, and this is the last catch there is, so that
    // second throw would end the process rather than the request.
    if (res.headersSent) {
      console.error(`${req.method} ${path} failed after the response started: ${err.message}`);
      return res.end();
    }
    try {
      send(res, 400, indexView(await loadIndex(), flashErr(err.message)));
    } catch {
      send(res, 500, layout('Error', `<h1>Error</h1><p>${esc(err.message)}</p>`));
    }
  }
};

/** The banner, shared by both ways of starting it. */
export const describeAuth = () =>
  auth.enabled
    ? `Login:                ${auth.user}` +
      (auth.ephemeralSecret
        ? '\n\nADMIN_SESSION_SECRET is not set, so restarting signs you out.\n' +
          'Set one with: npm run admin:password'
        : '')
    : `Login:                off (${auth.reason})\n` +
      '                      Turn it on with: npm run admin:password';

/**
 * Is a login configured?
 *
 * Exported so the serverless entry can refuse to serve without one. Locally an
 * unconfigured login means 'no login'; on a public URL it would mean 'no lock'.
 */
export const authEnabled = () => auth.enabled;

export const describeStore = () => `${driver} → ${target}`;

// Loopback only. The login guards the machine; the binding guards the network,
// and it has to stay that way — this speaks plain http.
const server = isMain && createServer(handler);
if (isMain)
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`\nContentLineup admin:  http://127.0.0.1:${PORT}`);
    console.log(`Store:                ${describeStore()}`);
    console.log(describeAuth());
    console.log(`\nLoopback only — do not expose this port.\n`);
  });

if (isMain) {
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => server.close(() => process.exit(0)));
  }
}
