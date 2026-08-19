// A small front-matter format for moving posts between files and the database.
//
// Deliberately not a full YAML implementation — it supports exactly the shapes
// a post needs, and fails loudly on anything else rather than guessing.
//
//   ---
//   title: How to Schedule Content
//   category: guides
//   secondaryKeywords: content calendar, batch briefs
//   featured: true
//   faqs:
//     - q: How far ahead should I schedule?
//       a: Two to four weeks.
//   ---
//   Body starts here.

const LIST_FIELDS = new Set(['secondaryKeywords']);
const BOOL_FIELDS = new Set(['featured']);
const NUM_FIELDS = new Set(['readMins']);

const unquote = (v) => v.replace(/^["'](.*)["']$/s, '$1');

export function parse(text) {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('No front-matter block found. The file must start with a --- fenced header.');

  const [, head, body] = m;
  const data = { faqs: [] };
  const lines = head.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // FAQ list block
    if (/^faqs:\s*$/.test(line)) {
      i++;
      let current = null;
      for (; i < lines.length; i++) {
        const l = lines[i];
        if (!/^\s/.test(l) && l.trim()) {
          i--;
          break;
        }
        const q = l.match(/^\s*-\s*q:\s*(.*)$/);
        const a = l.match(/^\s*a:\s*(.*)$/);
        if (q) {
          current = { q: unquote(q[1].trim()), a: '' };
          data.faqs.push(current);
        } else if (a && current) {
          current.a = unquote(a[1].trim());
        } else if (current && l.trim()) {
          // Continuation line for a wrapped answer.
          current.a += ' ' + l.trim();
        }
      }
      continue;
    }

    const kv = line.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (!kv) throw new Error(`Cannot parse front-matter line: ${line}`);
    const key = kv[1];
    const raw = unquote(kv[2].trim());

    if (LIST_FIELDS.has(key)) data[key] = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
    else if (BOOL_FIELDS.has(key)) data[key] = /^(true|yes|1)$/i.test(raw);
    else if (NUM_FIELDS.has(key)) data[key] = Number(raw) || 0;
    else data[key] = raw;
  }

  return { data, body: body.trim() };
}

export function stringify(post) {
  const esc = (v) => (/[:#]|^\s|\s$/.test(String(v)) ? `"${String(v).replace(/"/g, '\\"')}"` : v);
  const out = ['---'];
  const put = (k, v) => v !== null && v !== undefined && v !== '' && out.push(`${k}: ${esc(v)}`);

  put('title', post.title);
  put('metaTitle', post.metaTitle);
  put('description', post.description);
  put('excerpt', post.excerpt);
  put('category', post.category);
  put('author', post.authorSlug);
  put('primaryKeyword', post.primaryKeyword);
  if (post.secondaryKeywords?.length) put('secondaryKeywords', post.secondaryKeywords.join(', '));
  put('thumb', post.thumb);
  put('readMins', post.readMins);
  put('featured', post.featured ? 'true' : 'false');
  put('status', post.status);
  put('published', post.published);
  put('modified', post.modified);
  put('format', post.bodyFormat);

  if (post.faqs?.length) {
    out.push('faqs:');
    for (const f of post.faqs) {
      out.push(`  - q: ${esc(f.q)}`);
      out.push(`    a: ${esc(f.a)}`);
    }
  }

  out.push('---', '', post.body.trim(), '');
  return out.join('\n');
}

/** Map parsed front-matter onto the shape savePost() expects. */
export function toPost(data, body, slug) {
  const required = ['title', 'category'];
  for (const key of required) {
    if (!data[key]) throw new Error(`Front-matter is missing required field "${key}".`);
  }
  return {
    slug,
    category: data.category,
    authorSlug: data.author || 'iqbal-hussain',
    title: data.title,
    metaTitle: data.metaTitle || data.title,
    description: data.description || data.excerpt || '',
    excerpt: data.excerpt || data.description || '',
    body,
    bodyFormat: data.format === 'markdown' ? 'markdown' : 'html',
    primaryKeyword: data.primaryKeyword || null,
    secondaryKeywords: data.secondaryKeywords || [],
    thumb: data.thumb || 'list',
    readMins: data.readMins || Math.max(1, Math.round(body.split(/\s+/).length / 220)),
    featured: !!data.featured,
    status: data.status || 'draft',
    published: data.published || null,
    modified: data.modified || data.published || null,
    faqs: data.faqs || [],
  };
}
