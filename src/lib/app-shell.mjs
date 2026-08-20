// The app chrome, in HTML.
//
// src/lib/screens.mjs draws the same sidebar and top bar in SVG for the static
// product screenshots. This is the HTML twin, for the parts of the marketing
// site that are *interactive* rather than a picture — currently the per-account
// campaign browser on the homepage.
//
// It imports NAV and GLYPH straight from screens.mjs rather than restating
// them, so the two can never drift: add a nav item to the app screens and it
// appears here too, with the same label and the same icon.
import { esc } from './html.mjs';
import { NAV, GLYPH } from './screens.mjs';

const navIcon = (id) =>
  `<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
    GLYPH[id] || GLYPH.list
  }</svg>`;

/**
 * @param {object} o
 * @param {string} o.active     nav id to highlight, e.g. 'list'
 * @param {string} o.title      top-bar title
 * @param {string} o.subtitle   top-bar subtitle
 * @param {string} o.action     primary button label
 * @param {string} o.workspace  workspace name in the switcher
 * @param {string} o.initials   workspace initials
 * @param {string} o.kind       workspace sub-label
 * @param {string} o.body       the screen content
 * @param {string} [o.aside]    optional extra content in the sidebar footer
 */
export const appShell = ({
  active = 'list',
  title,
  subtitle,
  action,
  workspace,
  initials,
  kind,
  body,
  aside = '',
}) => `
<div class="app-win">
  <aside class="app-side">
    <div class="app-brand" aria-hidden="true">
      <span class="app-brand-mark"></span>ContentLineup
    </div>
    <div class="app-ws">
      <span class="app-ws-av">${esc(initials)}</span>
      <span class="app-ws-txt"><b>${esc(workspace)}</b><span>${esc(kind)}</span></span>
    </div>
    <p class="app-navlabel">Workspace</p>
    <nav class="app-nav" aria-label="Product navigation (illustrative)">
      ${NAV.map(
        ([id, label]) =>
          `<span class="app-navitem${id === active ? ' is-on' : ''}">${navIcon(id)}${esc(label)}</span>`
      ).join('')}
    </nav>
    ${aside}
  </aside>
  <div class="app-main">
    <header class="app-top">
      <div class="app-top-txt">
        <b>${esc(title)}</b>
        <span>${esc(subtitle)}</span>
      </div>
      <span class="app-search" aria-hidden="true">
        <svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7.5" cy="7.5" r="5"/><path d="m11.4 11.4 3.4 3.4"/></svg>
        Search articles…
      </span>
      <span class="app-action">${esc(action)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13m0 0-5-5m5 5-5 5"/></svg>
      </span>
    </header>
    <div class="app-body">${body}</div>
  </div>
</div>`;
