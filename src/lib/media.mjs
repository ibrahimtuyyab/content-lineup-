// Post media for the channel previews.
//
// HOW TO DROP IN A REAL PHOTO
// ---------------------------
//   1. Put the file in public/media/ named after the key below, in as many
//      formats as you have:  summer-ac.avif  summer-ac.webp  summer-ac.jpg
//      A .jpg (or .png) is the minimum; avif/webp are emitted only if present.
//   2. Rebuild. That is the whole change — no markup or CSS to touch.
//
// Until a raster file exists the inline illustration below is used, so the
// previews are never empty and the layout never shifts when the swap happens.
// Everything stays self-hosted: no third-party image CDN, no external request,
// no licence to track.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const PUBLIC = resolve(import.meta.dirname, '..', '..', 'public');
const FORMATS = [
  ['avif', 'image/avif'],
  ['webp', 'image/webp'],
];
const FALLBACKS = ['jpg', 'jpeg', 'png'];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Does a real photo exist for this key yet? */
export const hasPhoto = (key) =>
  FALLBACKS.some((e) => existsSync(join(PUBLIC, 'media', `${key}.${e}`)));

/**
 * The stand-in illustration. Topical rather than abstract — an outdoor
 * condenser unit on a summer wall, drawn in the site's own cream/terracotta so
 * it reads as art direction rather than as a missing asset.
 * `u` makes the gradient ids unique when several previews share a page.
 */
const illustration = (u) => `
<svg class="pv-illus" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
  <defs>
    <linearGradient id="sky-${u}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#f7dcc4"/><stop offset="0.6" stop-color="#f2ece2"/><stop offset="1" stop-color="#e9f1ef"/>
    </linearGradient>
    <linearGradient id="wall-${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <rect width="400" height="400" fill="url(#sky-${u})"/>
  <circle cx="316" cy="72" r="42" fill="#fff" opacity="0.6"/>
  <circle cx="316" cy="72" r="26" fill="#f4d4ba" opacity="0.85"/>

  <!-- house wall + siding -->
  <path d="M0 132 L188 60 L400 132 V400 H0Z" fill="url(#wall-${u})"/>
  <g stroke="#c2410c" stroke-opacity="0.1" stroke-width="2">
    <path d="M0 176h400M0 212h400M0 248h400M0 284h400"/>
  </g>

  <!-- airflow -->
  <g stroke="#0f766e" stroke-opacity="0.3" stroke-width="4" stroke-linecap="round" fill="none">
    <path d="M262 214c18-12 18 12 36 0"/>
    <path d="M262 238c18-12 18 12 36 0"/>
    <path d="M262 262c18-12 18 12 36 0"/>
  </g>

  <!-- condenser unit -->
  <rect x="96" y="196" width="150" height="130" rx="14" fill="#fff"/>
  <rect x="96" y="196" width="150" height="130" rx="14" fill="none" stroke="#9a3412" stroke-opacity="0.22" stroke-width="3"/>
  <rect x="108" y="208" width="126" height="24" rx="8" fill="#efeae1"/>
  <circle cx="171" cy="278" r="38" fill="#faf8f4" stroke="#9a3412" stroke-opacity="0.2" stroke-width="3"/>
  <g fill="#c2410c" opacity="0.5">
    <path d="M171 246c9 12 9 20 0 26-9-6-9-14 0-26Z"/>
    <path d="M203 278c-12 9-20 9-26 0 6-9 14-9 26 0Z"/>
    <path d="M171 310c-9-12-9-20 0-26 9 6 9 14 0 26Z"/>
    <path d="M139 278c12-9 20-9 26 0-6 9-14 9-26 0Z"/>
  </g>
  <circle cx="171" cy="278" r="7" fill="#9a3412" opacity="0.65"/>

  <!-- ground -->
  <path d="M0 344h400v56H0Z" fill="#0f766e" opacity="0.07"/>
  <path d="M0 344c70-14 120 10 200-4s130 8 200-6v66H0Z" fill="#c2410c" opacity="0.06"/>
</svg>`;

/**
 * Media for one channel preview.
 * @param {object} o
 * @param {string} o.key    file stem in public/media/, e.g. "summer-ac"
 * @param {string} o.alt    real alt text — describes the picture, not the keyword
 * @param {string} [o.cls]  extra class on the wrapper
 * @param {boolean} [o.eager] skip lazy-loading (only for above-the-fold media)
 */
export const postMedia = ({ key, alt, cls = '', eager = false }) => {
  if (!hasPhoto(key)) {
    return `<div class="pv-photo ${cls}" role="img" aria-label="${esc(alt)}">${illustration(key)}</div>`;
  }
  const sources = FORMATS.filter(([ext]) => existsSync(join(PUBLIC, 'media', `${key}.${ext}`)))
    .map(([ext, type]) => `<source srcset="/media/${key}.${ext}" type="${type}">`)
    .join('');
  const fallback = FALLBACKS.find((e) => existsSync(join(PUBLIC, 'media', `${key}.${e}`)));
  return `
<div class="pv-photo ${cls}">
  <picture>
    ${sources}
    <img src="/media/${key}.${fallback}" alt="${esc(alt)}" width="1200" height="1200"
         ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>
</div>`;
};
