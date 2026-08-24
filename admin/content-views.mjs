// The admin's site-content and reference-data pages.
//
// Split out of admin.mjs because the form engine, the validators and the block
// register are all only used here — admin.mjs stays the server, the chrome and
// the post and plan editors it always was.
//
// Every view takes the layout function from admin.mjs rather than importing it,
// so there is exactly one definition of the page chrome and no import cycle.
import { BLOCKS, GROUPS } from '../src/data/content-blocks.mjs';
import { renderField, summarize, humanize } from './form.mjs';
import { enumsFor, SCREEN_IDS } from './validate.mjs';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------ content index */

/**
 * Every editable block, grouped as the register groups them.
 *
 * `edited` is the set of keys with an override row. Marking them matters: it is
 * the only way to tell content that was changed here from content that is still
 * whatever shipped in the repository, and therefore the only way to know what a
 * "reset to default" would actually undo.
 */
export function contentIndexView(layout, { live, edited, orphans, counts }, flash) {
  const sections = GROUPS.map(([group, blurb]) => {
    const rows = BLOCKS.filter((b) => b.group === group)
      .map((b) => {
        const isEdited = edited.has(b.key);
        return `<tr>
        <td>
          <a href="/content/${esc(b.key)}"><strong>${esc(b.label)}</strong></a>
          ${isEdited ? '<span class="pill edited">edited</span>' : ''}
          <div class="mono">${esc(b.key)}</div>
        </td>
        <td class="hint cell">${esc(b.hint)}</td>
        <td class="mono">${esc(summarize(live[b.key]))}</td>
        <td class="mono actions">
          <a class="btn ghost sm" href="/content/${esc(b.key)}">Edit</a>
          ${
            isEdited
              ? `<form method="post" action="/content/reset" onsubmit="return confirm('Discard the edits to ${esc(
                  b.label
                )} and go back to what ships in the repository?')">
                   <input type="hidden" name="key" value="${esc(b.key)}">
                   <button class="btn danger sm">Reset</button></form>`
              : ''
          }
        </td>
      </tr>`;
      })
      .join('');

    return `<h2>${esc(group)}</h2>
      <p class="sub">${esc(blurb)}</p>
      <table><thead><tr>
        <th>Block</th><th>What it is</th><th>Size</th><th></th>
      </tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');

  const orphanNote = orphans.length
    ? `<div class="card warn">
         <strong>${orphans.length} stored edit${orphans.length === 1 ? '' : 's'} no longer apply.</strong>
         <p class="hint">These keys have a row in <code>content_blocks</code> but are not in the register any
         more, so nothing reads them. They are listed here rather than ignored, because an edit that is
         saved and has no effect is worse than one that was never made.</p>
         <div class="actions">${orphans
           .map(
             (k) => `<form method="post" action="/content/reset">
               <input type="hidden" name="key" value="${esc(k)}">
               <button class="btn danger sm">Delete ${esc(k)}</button></form>`
           )
           .join('')}</div>
       </div>`
    : '';

  return layout(
    'Site content',
    `<h1>Site content</h1>
     <p class="sub">Everything on the marketing pages that is not a post and not a plan.</p>
     <div class="stats">
       <div class="stat"><b>${BLOCKS.length}</b><span>blocks</span></div>
       <div class="stat"><b>${edited.size}</b><span>edited here</span></div>
       <div class="stat"><b>${BLOCKS.length - edited.size}</b><span>as shipped</span></div>
       <div class="stat"><b>${counts.faqs}</b><span>FAQs</span></div>
       <div class="stat"><b>${counts.features}</b><span>features</span></div>
     </div>
     ${orphanNote}
     <div class="card">
       <p class="hint" style="margin:0">Unedited blocks come from <code>src/data/site.defaults.mjs</code>,
       which ships in the repository — so a clone with no database still builds the real site. Saving here
       stores an override in the <code>content_blocks</code> table; <strong>Reset</strong> deletes it and the
       shipped content applies again. Either way the change reaches the site on the next
       <strong>Rebuild</strong>.</p>
     </div>
     ${sections}`,
    flash
  );
}

/* ----------------------------------------------------------- block editor */

export function blockEditView(layout, { def, value, live, isEdited, json, updatedAt }, flash) {
  const body = json
    ? jsonEditor(def, value)
    : renderField(value, 'v', def.default, {
        enums: enumsFor(def.key, live),
        noun: 'entry',
        rootLabel: def.label,
      });

  const mapHint =
    !json && !Array.isArray(def.default) && isObj(def.default) && isMap(def.default)
      ? `<p class="hint warn">This block is keyed by name (${Object.keys(def.default)
          .slice(0, 3)
          .map(esc)
          .join(', ')}…). The fields of each entry are editable here; to add or remove an entry, switch to
          <strong>JSON</strong>.</p>`
      : '';

  return layout(
    def.label,
    `<div class="head">
       <div>
         <h1>${esc(def.label)}</h1>
         <p class="sub"><code>${esc(def.key)}</code> · ${esc(def.group)} ·
           ${isEdited ? `edited${updatedAt ? ' ' + esc(String(updatedAt).slice(0, 10)) : ''}` : 'as shipped'}</p>
       </div>
       <div class="actions">
         <a class="btn ghost sm" href="/content">All content</a>
         <a class="btn ghost sm" href="/content/${esc(def.key)}${json ? '' : '?json=1'}">${
           json ? 'Form view' : 'Edit as JSON'
         }</a>
       </div>
     </div>
     <div class="card"><p class="hint" style="margin:0">${esc(def.hint)}</p></div>
     ${mapHint}
     ${screenHelp(def.key)}
     <form method="post" action="/content/save" class="blockform">
       <input type="hidden" name="key" value="${esc(def.key)}">
       <input type="hidden" name="mode" value="${json ? 'json' : 'form'}">
       ${body}
       <div class="sticky">
         <button class="btn">Save</button>
         <a class="btn ghost" href="/content">Cancel</a>
         ${
           isEdited
             ? `<button class="btn danger" formaction="/content/reset"
                  onclick="return confirm('Discard these edits and go back to what ships in the repository?')"
                  >Reset to shipped content</button>`
             : ''
         }
         <span class="hint">Saved straight to the database. Rebuild to publish it.</span>
       </div>
     </form>`,
    flash
  );
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Does this object look like a map of same-shaped entries rather than a record? */
const isMap = (v) => {
  const vals = Object.values(v);
  return vals.length > 2 && vals.every(isObj);
};

const jsonEditor = (def, value) => {
  const text = JSON.stringify(value, null, 2);
  return `<label>JSON<span class="count">${text.split('\n').length} lines</span></label>
    <textarea name="json" rows="${Math.min(46, text.split('\n').length + 2)}" spellcheck="false"
      class="code">${esc(text)}</textarea>
    <p class="hint">The whole block, as stored. Invalid JSON is refused rather than saved, and the same
    checks run as on the form.</p>
    <details class="help"><summary>What ships in the repository</summary>
      <pre>${esc(JSON.stringify(def.default, null, 2))}</pre></details>`;
};

/** The renderable screen ids, shown where a screen id is what you type. */
const screenHelp = (key) =>
  ['screenOrder', 'tourScreens', 'screens'].includes(key)
    ? `<details class="help"><summary>Screens that have a renderer</summary>
         <pre>${esc(SCREEN_IDS.join('\n'))}</pre>
         <p class="hint">Drawn by <code>src/lib/screens.mjs</code>. A screen id outside this list has no
         image, so the build order is refused if it names one.</p></details>`
    : '';

/* -------------------------------------------------------- reference data */

/**
 * Authors and categories.
 *
 * Both are real tables with posts pointing at them, so unlike a content block
 * these cannot simply be reset — a delete that would orphan a post is refused
 * by the database, and the post count is shown here so it is obvious why.
 */
export function referenceView(layout, { authors, cats, authorUse, catUse }, flash) {
  const authorRows = authors
    .map(
      (a) => `<tr>
      <td><strong>${esc(a.name)}</strong><div class="mono">${esc(a.slug)}</div></td>
      <td class="mono">${esc(a.email || '—')}</td>
      <td class="hint cell">${esc(a.bio || '')}</td>
      <td class="mono">${authorUse[a.slug] || 0}</td>
      <td class="mono actions">
        <a class="btn ghost sm" href="/authors/${esc(a.slug)}">Edit</a>
        ${
          authorUse[a.slug]
            ? ''
            : `<form method="post" action="/authors/delete" onsubmit="return confirm('Delete ${esc(
                a.name
              )}?')">
                 <input type="hidden" name="slug" value="${esc(a.slug)}">
                 <button class="btn danger sm">Delete</button></form>`
        }
      </td></tr>`
    )
    .join('');

  const catRows = cats
    .map(
      (c) => `<tr>
      <td><strong>${esc(c.label)}</strong><div class="mono">/resources/${esc(c.slug)}</div></td>
      <td>${esc(c.singular)}</td>
      <td class="mono">${c.sort}</td>
      <td class="mono">${catUse[c.slug] || 0}</td>
      <td class="mono actions">
        <a class="btn ghost sm" href="/categories/${esc(c.slug)}">Edit</a>
        ${
          catUse[c.slug]
            ? ''
            : `<form method="post" action="/categories/delete" onsubmit="return confirm('Delete ${esc(
                c.label
              )}?')">
                 <input type="hidden" name="slug" value="${esc(c.slug)}">
                 <button class="btn danger sm">Delete</button></form>`
        }
      </td></tr>`
    )
    .join('');

  return layout(
    'Authors and categories',
    `<h1>Authors and categories</h1>
     <p class="sub">What posts are filed under and attributed to.</p>

     <div class="head"><h2>Authors</h2>
       <a class="btn sm" href="/authors/new">New author</a></div>
     <table><thead><tr><th>Author</th><th>Email</th><th>Bio</th><th>Posts</th><th></th></tr></thead>
       <tbody>${authorRows || '<tr><td colspan="5">No authors yet.</td></tr>'}</tbody></table>

     <div class="head"><h2>Categories</h2>
       <a class="btn sm" href="/categories/new">New category</a></div>
     <table><thead><tr><th>Category</th><th>Singular</th><th>Sort</th><th>Posts</th><th></th></tr></thead>
       <tbody>${catRows || '<tr><td colspan="5">No categories yet.</td></tr>'}</tbody></table>
     <p class="hint">A category or author still used by a post has no Delete button: posts reference them
     with <code>on delete restrict</code>, so the database would refuse it anyway. Move those posts first.</p>`,
    flash
  );
}

export function authorEditView(layout, author, flash) {
  const a = author || { slug: '', name: '', email: '', bio: '', url: '' };
  const isNew = !author;
  return layout(
    isNew ? 'New author' : a.name,
    `<h1>${isNew ? 'New author' : esc(a.name)}</h1>
     <p class="sub">Bylines on the resources articles, and the <code>author</code> in each article's
     structured data.</p>
     <form method="post" action="/authors/save" class="grid">
       <input type="hidden" name="original_slug" value="${esc(a.slug)}">
       <div><label>Name</label><input name="name" value="${esc(a.name)}" required></div>
       <div><label>Slug</label><input name="slug" value="${esc(a.slug)}"
         placeholder="left blank, made from the name"></div>
       <div><label>Email</label><input name="email" type="email" value="${esc(a.email || '')}"></div>
       <div><label>URL</label><input name="url" value="${esc(a.url || '')}"
         placeholder="https://…"></div>
       <div class="full"><label>Bio</label><textarea name="bio" rows="4">${esc(a.bio || '')}</textarea>
         <div class="hint">One or two sentences. Shown at the foot of each article they wrote.</div></div>
       <div class="full actions">
         <button class="btn">Save author</button>
         <a class="btn ghost" href="/reference">Cancel</a>
       </div>
     </form>`,
    flash
  );
}

export function categoryEditView(layout, cat, flash) {
  const c = cat || { slug: '', label: '', singular: '', sort: 0 };
  const isNew = !cat;
  return layout(
    isNew ? 'New category' : c.label,
    `<h1>${isNew ? 'New category' : esc(c.label)}</h1>
     <p class="sub">The slug is part of every article URL in the category, so changing it on a category
     that already has posts changes those URLs.</p>
     <form method="post" action="/categories/save" class="grid">
       <input type="hidden" name="original_slug" value="${esc(c.slug)}">
       <div><label>Label (plural)</label><input name="label" value="${esc(c.label)}" required
         placeholder="Case studies"></div>
       <div><label>Singular</label><input name="singular" value="${esc(c.singular)}" required
         placeholder="Case study"></div>
       <div><label>Slug</label><input name="slug" value="${esc(c.slug)}"
         placeholder="case-studies"></div>
       <div><label>Sort</label><input name="sort" type="number" value="${Number(c.sort) || 0}">
         <div class="hint">Low numbers first, in the resources filter bar.</div></div>
       <div class="full actions">
         <button class="btn">Save category</button>
         <a class="btn ghost" href="/reference">Cancel</a>
       </div>
     </form>`,
    flash
  );
}

/** Field labels are wanted by admin.mjs for its own forms too. */
export { humanize };
