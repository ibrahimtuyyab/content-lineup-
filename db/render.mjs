// Turns a stored post body into the HTML the site renders.
//
// Two layers, both optional:
//   1. Markdown  — when body_format = 'markdown'. A deliberately small subset:
//      headings, paragraphs, lists, tables, blockquotes, code, links, emphasis.
//   2. Shortcodes — the recurring article components, so a post written in the
//      database gets the same answer boxes, screenshots and CTAs as the launch
//      articles without anyone hand-writing the markup.
//
// The launch articles were seeded as finished HTML with no shortcodes, so they
// pass through both layers untouched.
import { answer, takeaways, figure, dataTable, articleCta, quote, toc } from '../src/lib/article.mjs';
import { screens } from '../src/data/site.mjs';

/* -------------------------------------------------------------------------
   Shortcodes
   ------------------------------------------------------------------------- */
/** Parse `key="value"` pairs from a shortcode tag. */
function attrs(raw = '') {
  const out = {};
  for (const m of raw.matchAll(/(\w+)\s*=\s*"([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

/** Split a shortcode body into trimmed, non-empty lines. */
const lines = (s) =>
  s
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s?/, '').trim())
    .filter(Boolean);

/**
 * Supported shortcodes:
 *
 *   [answer]The direct answer paragraph.[/answer]
 *   [takeaways]
 *   - First point
 *   - Second point
 *   [/takeaways]
 *   [figure screen="list" caption="Optional override."]
 *   [quote cite="Name, Role"]The pull quote.[/quote]
 *   [cta title="Optional" body="Optional"]
 *   [toc]
 *   [table caption="Optional"]
 *   Header A | Header B
 *   Cell 1   | Cell 2
 *   [/table]
 */
export function expandShortcodes(html, { markdown = false } = {}) {
  // Text inside a shortcode: escape and format it when the body is markdown,
  // unless the author wrote raw HTML in there deliberately.
  const txt = markdown ? (v) => (/</.test(v) ? inline(v) : inline(escHtml(v))) : (v) => v;
  let out = html;

  out = out.replace(/\[answer\]([\s\S]*?)\[\/answer\]/g, (_m, body) => {
    const inner = body.trim();
    return answer(inner.startsWith('<') ? inner : `<p>${txt(inner)}</p>`);
  });

  out = out.replace(/\[takeaways\]([\s\S]*?)\[\/takeaways\]/g, (_m, body) =>
    takeaways(lines(body).map(txt))
  );

  out = out.replace(/\[quote(?:\s+([^\]]*))?\]([\s\S]*?)\[\/quote\]/g, (_m, raw, body) =>
    quote(txt(body.trim()), attrs(raw).cite)
  );

  out = out.replace(/\[figure\s+([^\]]*)\]/g, (_m, raw) => {
    const a = attrs(raw);
    const id = a.screen || a.id;
    if (!screens[id]) {
      throw new Error(
        `[figure] references unknown screen "${id}". Valid: ${Object.keys(screens).join(', ')}`
      );
    }
    return figure(id, a.caption);
  });

  out = out.replace(/\[cta(?:\s+([^\]]*))?\]/g, (_m, raw) => {
    const a = attrs(raw);
    return a.title || a.body ? articleCta(a.title, a.body) : articleCta();
  });

  out = out.replace(/\[table(?:\s+([^\]]*))?\]([\s\S]*?)\[\/table\]/g, (_m, raw, body) => {
    const rows = lines(body).map((l) => l.split('|').map((c) => txt(c.trim())));
    if (!rows.length) return '';
    const [header, ...rest] = rows;
    return dataTable(header, rest, attrs(raw).caption);
  });

  // [toc] builds itself from the H2s already present in the body.
  out = out.replace(/\[toc\]/g, () => {
    const items = [];
    for (const m of out.matchAll(/<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)) {
      items.push({ id: m[1], label: m[2].replace(/<[^>]+>/g, '').trim() });
    }
    return items.length ? toc(items) : '';
  });

  return out;
}

/* -------------------------------------------------------------------------
   Minimal Markdown
   ------------------------------------------------------------------------- */
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

/** Inline spans: code, bold, italic, links. Applied to already-escaped text. */
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((\S+?)\)/g, '<a href="$2">$1</a>');
}

/**
 * Markdown subset → HTML. Blank-line separated blocks; shortcode lines are
 * passed through untouched so they can be expanded afterwards.
 */
export function renderMarkdown(md) {
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
  const html = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    // Raw HTML or a shortcode — leave alone.
    if (/^</.test(block) || /^\[[a-z]/.test(block)) {
      html.push(block);
      continue;
    }

    // Heading
    const h = block.match(/^(#{2,4})\s+(.*)$/);
    if (h && !block.includes('\n')) {
      const level = h[1].length;
      const text = inline(escHtml(h[2].trim()));
      html.push(`<h${level} id="${slugify(h[2])}">${text}</h${level}>`);
      continue;
    }

    // Blockquote
    if (block.split('\n').every((l) => l.startsWith('>'))) {
      const text = block
        .split('\n')
        .map((l) => l.replace(/^>\s?/, ''))
        .join(' ');
      html.push(`<blockquote>${inline(escHtml(text))}</blockquote>`);
      continue;
    }

    // Pipe table
    if (block.includes('|') && block.split('\n').length >= 2) {
      const rows = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.includes('|') && !/^\|?[\s:|-]+\|?$/.test(l))
        .map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => inline(escHtml(c.trim()))));
      if (rows.length >= 2) {
        const [head, ...body] = rows;
        html.push(dataTable(head, body));
        continue;
      }
    }

    // Ordered list
    if (block.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
      const items = block
        .split('\n')
        .map((l) => `<li>${inline(escHtml(l.replace(/^\s*\d+\.\s/, '')))}</li>`)
        .join('');
      html.push(`<ol>${items}</ol>`);
      continue;
    }

    // Unordered list
    if (block.split('\n').every((l) => /^[-*]\s/.test(l.trim()))) {
      const items = block
        .split('\n')
        .map((l) => `<li>${inline(escHtml(l.replace(/^\s*[-*]\s/, '')))}</li>`)
        .join('');
      html.push(`<ul>${items}</ul>`);
      continue;
    }

    // Paragraph
    html.push(`<p>${inline(escHtml(block.replace(/\n/g, ' ')))}</p>`);
  }

  return html.join('\n\n');
}

/** Full pipeline for one post record. */
export function renderBody(post) {
  const markdown = post.bodyFormat === 'markdown';
  const stage1 = markdown ? renderMarkdown(post.body) : post.body;
  return expandShortcodes(stage1, { markdown });
}
