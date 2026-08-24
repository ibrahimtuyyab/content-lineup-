// Shape-derived forms for the site content blocks.
//
// The blocks in src/data/content-blocks.mjs are irregular: some are flat lists
// of cards, one is a 15-row comparison grid whose cells carry their own notes,
// one is a table of table rows. Hand-writing a form per block would be a few
// hundred lines that go stale the moment a field is added to the content.
//
// So the form is derived from the block's *default* value instead. The default
// ships in the repository and is therefore always available, always current,
// and already the exact shape the templates expect — which means a field added
// to src/data/site.defaults.mjs appears in the admin with no work here at all.
//
// The same shape drives parsing on the way back in, so a value can only come
// out of a form in the shape it went in as. Arrays are the exception, since
// their length is what the Add and Remove buttons change: every array in the
// form carries a hidden length alongside it, and parsing trusts that rather
// than the default's length.
//
// Rendering and parsing must stay symmetrical. If you change one, change the
// other: every branch of renderField has a matching branch in parseField.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------------------------------------------------------------- vocabulary */

/**
 * Field names as they read to someone editing the site rather than to someone
 * reading the source. Only the ones a plain de-camel-casing gets wrong or
 * leaves cryptic — everything else falls through to humanize() below.
 */
const LABELS = {
  a: 'Answer',
  alt: 'Alt text (for screen readers)',
  best: 'Best for',
  blurb: 'Blurb',
  body: 'Body',
  bullets: 'Bullets (one per line)',
  campaigns: 'Campaigns',
  caption: 'Caption',
  caveat: 'The catch',
  cols: 'Column widths',
  columns: 'Columns',
  cta: 'Call to action',
  ctaLabel: 'Button label',
  dates: 'Suggested dates (one per line)',
  desc: 'Description',
  detail: 'Detail',
  dimension: 'Dimension',
  fair: 'Where the alternatives win',
  foot: 'Footer line',
  glyph: 'Icon',
  head: 'Header row',
  home: 'Also show on the homepage',
  hooks: 'Hooks (one per line)',
  href: 'Link',
  id: 'ID',
  initials: 'Initials',
  instructions: 'Instructions',
  kicker: 'Kicker',
  kind: 'Kind',
  lines: 'Lines (one per line)',
  meta: 'Meta line',
  metaTitle: 'Meta title',
  n: 'Step number',
  notes: 'Notes (one per column)',
  outcome: 'Outcome',
  outputs: 'Outputs',
  pillar: 'Pillar page',
  points: 'Points (one per line)',
  presets: 'Presets',
  preview: 'Preview',
  q: 'Question',
  result: 'Result',
  reviewer: 'Reviewer',
  rows: 'Rows',
  screen: 'Product screen',
  short: 'Short line',
  slugs: 'Post slugs (one per line)',
  soon: 'Coming soon (labelled as roadmap)',
  src: 'Script URL',
  stage: 'Stage',
  summary: 'Summary',
  tagline: 'Tagline',
  tone: 'Tone',
  total: 'Total',
  unit: 'Unit',
  values: 'Values (one per column)',
  verb: 'Verb',
};

/** 'metaTitle' -> 'Meta title', 'annualPerMonth' -> 'Annual per month'. */
export const humanize = (key) => {
  if (LABELS[key]) return LABELS[key];
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/* ---------------------------------------------------------------- path tokens */

/** 'v[0].links[3]' -> ['v', 0, 'links', 3] */
export const tokens = (path) => {
  const out = [];
  for (const part of String(path).split('.')) {
    const m = /^([^[]*)((\[\d+\])*)$/.exec(part);
    if (!m) continue;
    if (m[1]) out.push(m[1]);
    for (const idx of m[2].match(/\d+/g) || []) out.push(Number(idx));
  }
  return out;
};

const getIn = (root, path) => path.reduce((acc, k) => (acc == null ? acc : acc[k]), root);

/** Is this path an item of a list rather than a named field? */
const isItem = (path) => typeof tokens(path).at(-1) === 'number';

/**
 * What to call the thing at this path.
 *
 * The root of a block has no field name of its own — it is the block — so it
 * borrows the block's label rather than rendering the internal name of the form
 * root. List items are numbered by the row they are in.
 */
const fieldLabel = (path, opts = {}) => {
  if (path === 'v') return opts.rootLabel || 'Entries';
  const key = tokens(path).at(-1);
  return typeof key === 'number' ? `#${key + 1}` : humanize(key);
};

/* -------------------------------------------------------------------- shapes */

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Which of an object template's fields only some of the values carried.
 *
 * Hung off the template itself so it travels with it through the recursion,
 * and non-enumerable so every Object.keys/entries walk below stays unaware of
 * it. Parsing needs it to tell "left empty" from "not applicable here" — see
 * the object branch of parseField().
 */
const OPTIONAL = Symbol('optionalFields');

/** Shared empty set, for templates that were not built by unionShape. */
const EMPTY_SET = new Set();

/**
 * The shape of a set of sibling values, as the union of all of them.
 *
 * A union rather than just the first one, and a *deep* union rather than a
 * union of top-level keys. Both matter for real content here:
 *
 *   - `home: true` sits on the handful of FAQs that also appear on the
 *     homepage. Taking the first item as the template would make that flag
 *     uneditable on every FAQ that does not already have it.
 *   - the channel demo's four outputs have differently shaped `preview`
 *     objects — one carries a link card, the others do not. A shallow union
 *     would render the first output's preview shape for all four and drop the
 *     link card on save, which is data loss rather than an inconvenience.
 *
 * Fields that not every value carries are recorded as optional, because the
 * form has to offer them everywhere while still letting them stay absent.
 */
function unionShape(values) {
  const vals = (values || []).filter((v) => v !== undefined && v !== null);
  if (!vals.length) return '';

  const objs = vals.filter(isObj);
  if (objs.length) {
    const keys = [];
    for (const o of objs) for (const k of Object.keys(o)) if (!keys.includes(k)) keys.push(k);
    const out = {};
    const optional = new Set();
    for (const k of keys) {
      out[k] = unionShape(objs.map((o) => o[k]));
      if (!objs.every((o) => k in o)) optional.add(k);
    }
    Object.defineProperty(out, OPTIONAL, { value: optional, enumerable: false });
    return out;
  }

  const arrs = vals.filter(Array.isArray);
  if (arrs.length) {
    const elems = arrs.flat();
    return elems.length ? [unionShape(elems)] : [];
  }

  return vals[0];
}

/** The shape of one item of an array template. */
const itemTemplate = (arr) => (Array.isArray(arr) && arr.length ? unionShape(arr) : '');

/**
 * Is this value indistinguishable from "not filled in"?
 *
 * Only ever asked of a field that some of the content does not carry at all,
 * which is what makes treating 0 and false as empty safe: for an optional
 * field, absent and false are the same state — an FAQ that is not on the
 * homepage does not carry `home: false`, it carries nothing.
 */
const isEmptyValue = (v) => {
  if (v === '' || v === null || v === undefined || v === false || v === 0) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (isObj(v)) return Object.values(v).every(isEmptyValue);
  return false;
};

/** An empty instance of a shape — what Add inserts. */
export const blankFrom = (template) => {
  if (Array.isArray(template)) return [];
  if (isObj(template)) return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, blankFrom(v)]));
  if (typeof template === 'number') return 0;
  if (typeof template === 'boolean') return false;
  return '';
};

/** A one-line description of a block's value, for the list view. */
export const summarize = (value) => {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (isObj(value)) {
    const n = Object.keys(value).length;
    return `${n} field${n === 1 ? '' : 's'}`;
  }
  return String(value ?? '');
};

/* ------------------------------------------------------------------ rendering */

const scalarField = (value, path, template, opts) => {
  const name = esc(path);
  const key = tokens(path).at(-1);
  const label = fieldLabel(path, opts);
  const enums = opts.enums?.[key];

  if (typeof template === 'boolean') {
    // The hidden input is how an unchecked box is told apart from a field that
    // was never on the form: both send nothing on their own.
    return `<label class="check"><input type="hidden" name="${name}" value="0">
      <input type="checkbox" name="${name}" value="1"${value ? ' checked' : ''}> ${esc(label)}</label>`;
  }

  if (enums) {
    const options = enums
      .map((o) => `<option value="${esc(o)}"${String(value) === String(o) ? ' selected' : ''}>${esc(o)}</option>`)
      .join('');
    const unknown =
      value && !enums.some((o) => String(o) === String(value))
        ? `<option value="${esc(value)}" selected>${esc(value)} — not a known value</option>`
        : '';
    return `<label>${esc(label)}</label><select name="${name}">${unknown}${options}</select>`;
  }

  if (typeof template === 'number') {
    return `<label>${esc(label)}</label><input type="number" step="any" name="${name}" value="${esc(value ?? 0)}">`;
  }

  const text = value == null ? '' : String(value);
  if (text.length > 88 || text.includes('\n')) {
    const rows = Math.min(14, Math.max(3, Math.ceil(text.length / 78) + text.split('\n').length));
    return `<label>${esc(label)}<span class="count">${text.length}</span></label>
      <textarea name="${name}" rows="${rows}">${esc(text)}</textarea>`;
  }
  return `<label>${esc(label)}</label><input type="text" name="${name}" value="${esc(text)}">`;
};

/** An array of plain values, edited as one line per item. */
const linesField = (value, path, opts) => {
  const key = tokens(path).at(-1);
  const label = fieldLabel(path, opts);
  const items = Array.isArray(value) ? value : [];
  const text = items.join('\n');
  const hint = LABELS[key] ? '' : '<div class="hint">One per line.</div>';
  // Sized for the lines as they wrap, not as they are stored: the comparison
  // matrix keeps a sentence per column in one of these, and counting entries
  // alone gives a four-row box holding twelve rows of text.
  const wrapped = items.reduce((n, s) => n + Math.max(1, Math.ceil(String(s).length / 52)), 0);
  return `<label>${esc(label)}<span class="count">${items.length}</span></label>
    <textarea name="${esc(path)}" rows="${Math.min(16, Math.max(2, wrapped + 1))}">${esc(
      text
    )}</textarea>${hint}`;
};

/**
 * A repeatable list of structured items.
 *
 * The buttons do not carry any state of their own: each one names the action
 * and the path it applies to, and the server re-parses the whole form before
 * applying it. That is why adding an item never loses an edit made to a
 * different item first.
 */
const repeatField = (value, path, template, opts) => {
  const items = Array.isArray(value) ? value : [];
  const elem = itemTemplate(Array.isArray(template) && template.length ? template : items);
  const label = fieldLabel(path, opts);
  const noun = opts.noun || 'item';

  const body = items
    .map((item, i) => {
      const title = itemTitle(item, i);
      return `<div class="rep-item">
        <div class="rep-head">
          <span class="rep-n">${i + 1}</span>
          <span class="rep-title">${esc(title)}</span>
          <span class="rep-btns">
            <button class="btn ghost xs" name="__action" value="up:${esc(path)}[${i}]"${
        i === 0 ? ' disabled' : ''
      } title="Move up">↑</button>
            <button class="btn ghost xs" name="__action" value="down:${esc(path)}[${i}]"${
        i === items.length - 1 ? ' disabled' : ''
      } title="Move down">↓</button>
            <button class="btn danger xs" name="__action" value="del:${esc(path)}[${i}]" title="Remove">Remove</button>
          </span>
        </div>
        ${renderField(item, `${path}[${i}]`, elem, opts)}
      </div>`;
    })
    .join('');

  return `<div class="rep">
    <div class="rep-bar"><strong>${esc(label)}</strong>
      <span class="mono">${items.length}</span>
      <button class="btn ghost sm" name="__action" value="add:${esc(path)}">Add ${esc(noun)}</button>
    </div>
    <input type="hidden" name="__len:${esc(path)}" value="${items.length}">
    ${body || `<p class="hint">Empty. Press <strong>Add ${esc(noun)}</strong> to start.</p>`}
  </div>`;
};

/** The most identifying string on an item, for the collapsed header. */
const itemTitle = (item, i) => {
  if (!isObj(item)) return Array.isArray(item) ? `${item.length} values` : String(item ?? '');
  for (const k of ['title', 'name', 'label', 'q', 'dimension', 'tool', 'question', 'id', 'href', 'slug']) {
    if (item[k]) return String(item[k]).slice(0, 90);
  }
  const first = Object.values(item).find((v) => typeof v === 'string' && v);
  return first ? String(first).slice(0, 90) : `Item ${i + 1}`;
};

/**
 * Render one value at one path.
 * @param value    the current value
 * @param path     form-name prefix, e.g. 'v[2].links'
 * @param template the same position in the block's default value
 * @param opts     { enums: { fieldName: [allowed values] }, noun }
 */
export function renderField(value, path, template, opts = {}) {
  if (Array.isArray(template)) {
    const elem = itemTemplate(template.length ? template : Array.isArray(value) ? value : []);
    // A list of plain values is a textarea; a list of structures is repeatable.
    return isObj(elem) || Array.isArray(elem)
      ? repeatField(value, path, template, opts)
      : linesField(value, path, opts);
  }

  if (isObj(template)) {
    // Keys the value carries but the default does not are still shown, so an
    // override written against an older default is never silently truncated.
    const keys = [...new Set([...Object.keys(template), ...Object.keys(isObj(value) ? value : {})])];
    const inner = keys
      .map((k) => {
        const child = renderField(value?.[k], `${path}.${k}`, template[k], opts);
        const nested = Array.isArray(template[k]) && isObj(itemTemplate(template[k]));
        return nested || isObj(template[k]) ? child : `<div class="f">${child}</div>`;
      })
      .join('');
    // The root object is not boxed; nested ones are, so the nesting is visible.
    return path === 'v' || isItem(path)
      ? `<div class="fields">${inner}</div>`
      : `<fieldset><legend>${esc(fieldLabel(path, opts))}</legend>
           <div class="fields">${inner}</div></fieldset>`;
  }

  return `<div class="f">${scalarField(value, path, template, opts)}</div>`;
}

/* -------------------------------------------------------------------- parsing */

/**
 * Read one value back out of a submitted form.
 *
 * Mirrors renderField branch for branch. Arrays read their length from the
 * hidden field the form carries rather than from the template, because the
 * Add and Remove buttons are exactly the case where the two differ.
 */
export function parseField(params, path, template) {
  if (Array.isArray(template)) {
    const elem = itemTemplate(template);
    if (!isObj(elem) && !Array.isArray(elem)) {
      const raw = params.get(path);
      if (raw == null) return [];
      return raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const len = Number(params.get(`__len:${path}`));
    if (!Number.isFinite(len) || len <= 0) return [];
    return Array.from({ length: len }, (_, i) => parseField(params, `${path}[${i}]`, elem));
  }

  if (isObj(template)) {
    // A field the content does not universally carry is offered on every item,
    // so leaving it empty has to mean "still absent here" rather than "present
    // and blank" — otherwise saving a form nobody touched would add an empty
    // field to every item in the list.
    const optional = template[OPTIONAL] || EMPTY_SET;
    const out = {};
    for (const k of Object.keys(template)) {
      const parsed = parseField(params, `${path}.${k}`, template[k]);
      if (optional.has(k) && isEmptyValue(parsed)) continue;
      out[k] = parsed;
    }
    return out;
  }

  if (typeof template === 'boolean') {
    // Hidden '0' then, if checked, '1'. The last value submitted wins.
    return params.getAll(path).at(-1) === '1';
  }

  const raw = params.get(path);
  if (typeof template === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (raw == null) return template ?? '';
  const text = raw.replace(/\r\n/g, '\n').trim();
  // A field whose default is null is optional: empty means absent, not ''.
  return template === null && text === '' ? null : text;
}

/* -------------------------------------------------------------------- actions */

/**
 * Apply one Add / Remove / Move to a parsed value.
 *
 * Returns a description of what happened, so the caller can say so rather than
 * leaving the page looking like nothing did. Mutates `value` in place — it is
 * a value that was just parsed out of a form and is owned by the caller.
 */
export function applyAction(value, template, action) {
  const [verb, rawPath] = String(action).split(':');
  if (!verb || !rawPath) return null;

  const path = tokens(rawPath).slice(1); // drop the 'v' root
  const label = (p) => humanize(p.filter((t) => typeof t === 'string').at(-1) || 'item');

  if (verb === 'add') {
    const arr = getIn(value, path);
    if (!Array.isArray(arr)) return null;
    const tmpl = getIn({ v: template }, ['v', ...path]);
    const elem = itemTemplate(Array.isArray(tmpl) && tmpl.length ? tmpl : arr);
    arr.push(blankFrom(elem));
    return `Added an empty entry to ${label(path).toLowerCase()} — not saved yet.`;
  }

  const i = path.at(-1);
  if (typeof i !== 'number') return null;
  const arr = getIn(value, path.slice(0, -1));
  if (!Array.isArray(arr) || i < 0 || i >= arr.length) return null;

  if (verb === 'del') {
    arr.splice(i, 1);
    return `Removed entry ${i + 1} — not saved yet.`;
  }
  if (verb === 'up' && i > 0) {
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    return `Moved entry ${i + 1} up — not saved yet.`;
  }
  if (verb === 'down' && i < arr.length - 1) {
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    return `Moved entry ${i + 1} down — not saved yet.`;
  }
  return null;
}
