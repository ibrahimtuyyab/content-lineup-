// Markup helpers used inside long-form article bodies.
// Kept deliberately small: articles are authored as template literals, and these
// wrap the recurring structures (answer box, data table, screenshot, CTA).
import { esc, icon, btn } from './html.mjs';
import { screenSrc } from './screens.mjs';
import { screens, cta } from '../data/site.mjs';

/** Direct-answer block placed near the top — the shape AI answer engines quote. */
export const answer = (html) => `<div class="answer-box"><b>Short answer</b>${html}</div>`;

export const takeaways = (items) => `
<div class="key-takeaways">
  <h2>Key takeaways</h2>
  <ul>${items.map((i) => `<li>${icon('check')}<span>${i}</span></li>`).join('')}</ul>
</div>`;

export const toc = (items) => `
<nav class="toc" aria-label="On this page">
  <b>On this page</b>
  <ol>${items.map((i) => `<li><a href="#${i.id}">${esc(i.label)}</a></li>`).join('')}</ol>
</nav>`;

/** Embedded product screenshot with its standard caption. */
export const figure = (id, caption) => {
  const s = screens[id];
  return `
<figure class="wide">
  <div class="shot">
    <div class="shot-bar"><i></i><i></i><i></i><span>app.contentlineup.com / ${esc(s.title.toLowerCase())}</span></div>
    <img src="${screenSrc(id)}" alt="${esc(s.alt)}" width="1240" height="780" loading="lazy" decoding="async">
  </div>
  <figcaption>${caption || esc(s.caption)}</figcaption>
</figure>`;
};

/** Data table. cols: string[], rows: string[][] */
export const dataTable = (cols, rows, caption) => `
<div class="table-scroll">
  <table class="data">
    ${caption ? `<caption class="sr-only">${esc(caption)}</caption>` : ''}
    <thead><tr>${cols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
  </table>
</div>`;

export const quote = (text, who) =>
  `<blockquote>${text}${who ? `<cite>— ${esc(who)}</cite>` : ''}</blockquote>`;

/** Closing conversion block. Every article ends with one. */
export const articleCta = (
  title = 'Queue your first article tonight',
  body = 'ContentLineup writes the draft, matches the images, fills in the SEO fields, and publishes it on the date you pick. Start free on your own OpenAI or Gemini key, or use the managed key and skip the setup.'
) => `
<div class="article-cta">
  <h2>${esc(title)}</h2>
  <p>${esc(body)}</p>
  <div class="cta-row">
    <a class="btn btn-light" href="${cta.primary.href}">${esc(cta.primary.label)} ${icon('arrow')}</a>
    <a class="btn btn-outline-light" href="/pricing">See pricing</a>
  </div>
</div>`;

export const related = (links) => `
<aside class="related">
  <h2 style="font-size:1.25rem;margin-bottom:16px">Keep reading</h2>
  <div class="grid g-3">
    ${links
      .map(
        (l) => `<a class="card" href="${l.href}">
      <span class="chip">${esc(l.tag)}</span>
      <h3 style="margin-top:12px;font-size:1.05rem">${esc(l.title)}</h3>
      <p>${esc(l.blurb)}</p>
    </a>`
      )
      .join('')}
  </div>
</aside>`;
