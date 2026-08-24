// Render/parse symmetry check for the admin's content forms.
//
//   node tools/test-admin-form.mjs
//
// Renders every content block's default into a form, simulates a browser
// submitting that form with nothing touched, parses the submission back, and
// diffs it against what went in. A form that cannot survive being submitted
// unchanged would quietly rewrite the site's content on the first save, which
// is the one failure mode of a shape-derived form that nothing else would
// catch — so this is the test that has to exist.
import { BLOCKS, effective } from '../src/data/content-blocks.mjs';
import { renderField, parseField } from '../admin/form.mjs';
import { enumsFor } from '../admin/validate.mjs';

/* ------------------------------------------------- a browser, approximately */

const unescape = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');

/**
 * Collect what a browser would submit for this HTML, in document order:
 * every input with a name, textarea contents, and the selected option of each
 * select. Unchecked checkboxes send nothing, which is the whole reason the
 * boolean fields carry a hidden input alongside them.
 */
function submit(html) {
  const params = new URLSearchParams();
  const tag = /<(input|textarea|select)\b([^>]*)>/gi;
  let m;
  while ((m = tag.exec(html))) {
    const [, kind, attrs] = m;
    const name = /name="([^"]*)"/.exec(attrs)?.[1];
    if (!name) continue;

    if (kind.toLowerCase() === 'input') {
      const type = (/type="([^"]*)"/.exec(attrs)?.[1] || 'text').toLowerCase();
      if ((type === 'checkbox' || type === 'radio') && !/\bchecked\b/.test(attrs)) continue;
      params.append(unescape(name), unescape(/value="([^"]*)"/.exec(attrs)?.[1] ?? ''));
      continue;
    }

    if (kind.toLowerCase() === 'textarea') {
      const close = html.indexOf('</textarea>', tag.lastIndex);
      params.append(unescape(name), unescape(html.slice(tag.lastIndex, close)));
      tag.lastIndex = close;
      continue;
    }

    // select: the selected option, or the first one if none is marked.
    const close = html.indexOf('</select>', tag.lastIndex);
    const body = html.slice(tag.lastIndex, close);
    const chosen =
      /<option value="([^"]*)"[^>]*\bselected\b/.exec(body)?.[1] ?? /<option value="([^"]*)"/.exec(body)?.[1] ?? '';
    params.append(unescape(name), unescape(chosen));
    tag.lastIndex = close;
  }
  return params;
}

/* ----------------------------------------------------------------- diffing */

/**
 * Differences that matter, described by path.
 *
 * Two are expected and allowed, because they are what the form is for rather
 * than a fault in it:
 *   - a boolean that only some items of a list carry comes back `false` on the
 *     items that omitted it, since the form offers the checkbox on every item
 *   - a list of plain strings drops empty entries, since a blank line in a
 *     textarea is how you delete one
 */
function diff(a, b, path = '', out = []) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const kept = a.filter((x) => !(typeof x === 'string' && !x.trim()));
    if (kept.length !== b.length) out.push(`${path}: length ${kept.length} -> ${b.length}`);
    kept.forEach((x, i) => diff(x, b[i], `${path}[${i}]`, out));
    return out;
  }
  const objA = a !== null && typeof a === 'object';
  const objB = b !== null && typeof b === 'object';
  if (objA && objB) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a) && b[k] === false) continue; // checkbox offered where the default omitted it
      diff(a[k], b[k], path ? `${path}.${k}` : k, out);
    }
    return out;
  }
  const norm = (v) => (typeof v === 'string' ? v.trim() : v);
  if (norm(a) !== norm(b)) {
    out.push(`${path}: ${JSON.stringify(norm(a))?.slice(0, 70)} -> ${JSON.stringify(norm(b))?.slice(0, 70)}`);
  }
  return out;
}

/* -------------------------------------------------------------------- run */

const live = effective({});
let failed = 0;

for (const b of BLOCKS) {
  const html = renderField(b.default, 'v', b.default, { enums: enumsFor(b.key, live) });
  const back = parseField(submit(html), 'v', b.default);
  const diffs = diff(b.default, back);

  const size = `${(html.length / 1024).toFixed(0)}K form`.padStart(9);
  if (!diffs.length) {
    console.log(`  ok    ${b.key.padEnd(19)} ${size}`);
  } else {
    failed++;
    console.log(`  FAIL  ${b.key.padEnd(19)} ${size}  ${diffs.length} difference(s)`);
    for (const d of diffs.slice(0, 8)) console.log(`          ${d}`);
    if (diffs.length > 8) console.log(`          … ${diffs.length - 8} more`);
  }
}

console.log(
  failed
    ? `\n${failed} of ${BLOCKS.length} blocks do not survive a round trip.\n`
    : `\nAll ${BLOCKS.length} blocks survive a round trip unchanged.\n`
);
process.exit(failed ? 1 : 0);
