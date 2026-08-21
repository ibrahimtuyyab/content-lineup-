// Renders the eight ContentLineup app screens as self-contained SVG.
//
// NOTE FOR MAINTAINERS: these are high-fidelity renderings of the real dashboard,
// generated at build time so the marketing site has no binary image dependency.
// To swap in true PNG captures, drop files at public/screens/<id>.png and set
// SCREEN_EXT = 'png' below — every reference across the site is driven from
// screenSrc(), so nothing else needs editing.
export const SCREEN_EXT = 'svg';
export const screenSrc = (id) => `/screens/${id}.${SCREEN_EXT}`;

const W = 1240;
const H = 780;
const SIDEBAR = 196;
const TOPBAR = 56;

// Exported so src/lib/art.mjs draws from the same palette — two sets of
// hand-copied hex values would drift apart on the first brand tweak.
export const C = {
  ink: '#0a0a0a',
  paper: '#fafaf7',
  white: '#ffffff',
  rule: '#e7e5e0',
  ruleSoft: '#f0eee9',
  muted: '#4b4b4b',
  subtle: '#6b6b6b',
  faint: '#9a978f',
  accent: '#c2410c',
  accentSoft: '#fef1e8',
  accentStrong: '#9a3412',
  peach: '#f4d4ba',
  cream: '#efeae1',
  sched: '#0f766e',
  schedSoft: '#e6f2f0',
  amber: '#b45309',
  amberSoft: '#fdf3e3',
  green: '#15803d',
  greenSoft: '#e9f5ec',
};

export const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const t = (x, y, str, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.mono ? MONO : o.serif ? SERIF : SANS}" font-size="${
    o.size || 12
  }" font-weight="${o.weight || 400}" fill="${o.fill || C.ink}" ${
    o.anchor ? `text-anchor="${o.anchor}"` : ''
  } ${o.spacing ? `letter-spacing="${o.spacing}"` : ''}>${esc(str)}</text>`;

const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 6}" fill="${o.fill || C.white}" ${
    o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''
  } ${o.opacity ? `opacity="${o.opacity}"` : ''}/>`;

const line = (x1, y1, x2, y2, stroke = C.ruleSoft) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1"/>`;

/** Coloured status pill. */
/**
 * Status pill — the single most-repeated component on the site, and the one
 * that has to be identical between the SVG app screens and the HTML lists on
 * the marketing pages. Both are now: coloured dot, uppercase mono label,
 * fully-rounded soft-tinted background. The CSS twin lives at `.state` in
 * styles.css; the colour map here mirrors --*-soft / --* exactly.
 */
const pill = (x, y, label, tone) => {
  const map = {
    draft: [C.cream, C.muted],
    scheduled: [C.schedSoft, C.sched],
    published: [C.greenSoft, C.green],
    review: [C.amberSoft, C.amber],
    accent: [C.accentSoft, C.accentStrong],
    idea: [C.accentSoft, C.accentStrong],
  };
  const [bg, fg] = map[tone] || map.draft;
  const text = String(label).toUpperCase();
  // 5.05px per uppercase mono char at 9.5px, + dot + padding.
  const w = text.length * 5.35 + 30;
  return (
    rect(x, y, w, 20, { r: 10, fill: bg }) +
    `<circle cx="${x + 11}" cy="${y + 10}" r="2.5" fill="${fg}"/>` +
    t(x + 18, y + 13.6, text, { size: 9.5, weight: 700, fill: fg, mono: true, spacing: 0.5 })
  );
};

/** Small avatar disc with initials. */
const avatar = (x, y, initials, tone = C.cream, fg = C.muted, r = 11) =>
  `<circle cx="${x + r}" cy="${y + r}" r="${r}" fill="${tone}"/>` +
  t(x + r, y + r + 3.6, initials, { size: 9.5, weight: 700, fill: fg, anchor: 'middle' });

/** Simple stroke glyph set for the sidebar. */
export const GLYPH = {
  plans: '<path d="M3 3.5h11M3 8h11M3 12.5h7"/>',
  ideas: '<path d="M8.5 2.5a4.5 4.5 0 0 0-2.6 8.2v1.6h5.2v-1.6A4.5 4.5 0 0 0 8.5 2.5Z"/><path d="M6.6 14.4h3.8"/>',
  calendar: '<rect x="2.5" y="3.5" width="12" height="11" rx="2"/><path d="M2.5 7h12M6 2v3m5-3v3"/>',
  list: '<path d="M2.5 4h12M2.5 8.5h12M2.5 13h12"/><circle cx="0.9" cy="4" r="0.9" fill="currentColor" stroke="none"/>',
  approvals: '<path d="M3 8.6 6.4 12 14 4.4"/>',
  social:
    '<circle cx="12.6" cy="4.2" r="1.9"/><circle cx="4.4" cy="8.5" r="1.9"/><circle cx="12.6" cy="12.8" r="1.9"/><path d="m6.1 7.6 4.8-2.5m0 6.5L6.1 9.2"/>',
  library: '<path d="M3 3h3.6v11H3zM7.8 3h3.6v11H7.8z"/><path d="m12.6 3.6 2.4.6-2.2 10.2"/>',
  strategy: '<path d="M2.5 14V2.5M2.5 14H15"/><path d="M5.5 11V8m3 3V5m3 6V7"/>',
  campaigns: '<path d="M3 6.5v4h2.5l6 3.2V3.3l-6 3.2Z"/><path d="M13.5 6.6a2.6 2.6 0 0 1 0 3.8"/>',
  publishing: '<path d="M8.5 2.4v8.2m0-8.2L5.6 5.3m2.9-2.9 2.9 2.9"/><path d="M2.6 10.4v3.2h11.8v-3.2"/>',
  accounts: '<circle cx="6" cy="6.4" r="2.5"/><path d="M1.8 14a4.3 4.3 0 0 1 8.4 0"/><path d="M11.4 4.2a2.5 2.5 0 0 1 0 4.5m.8 1.7A4.3 4.3 0 0 1 15.2 14"/>',
  editor: '<path d="M11.6 2.3a1.7 1.7 0 0 1 2.4 2.4L6 12.7 2.8 13.6l.9-3.2Z"/><path d="m10.2 3.7 2.4 2.4"/>',
  settings: '<circle cx="8.5" cy="8.5" r="2.6"/><path d="M8.5 1.6v2m0 9.8v2M15.4 8.5h-2m-9.8 0h-2M13.4 3.6 12 5m-7 7-1.4 1.4m9.8 0L12 12M5 5 3.6 3.6"/>',
};

export const NAV = [
  ['plans', 'Plans'],
  ['ideas', 'Ideas'],
  ['campaigns', 'Campaigns'],
  ['calendar', 'Calendar'],
  ['list', 'Content'],
  ['approvals', 'Approvals'],
  ['social', 'Social'],
  ['publishing', 'Publishing'],
  ['library', 'Library'],
  ['strategy', 'Strategy'],
  ['settings', 'Settings'],
];

// Screens that are a detail view rather than a top-level nav item still light
// up the section of the sidebar they belong to.
const NAV_ALIAS = { editor: 'list', accounts: 'plans' };

/**
 * The workspace shown in the sidebar switcher. Screens pass a different one so
 * the site never looks like a product with a single customer in it.
 */
const WS = {
  northgate: { initials: 'NA', name: 'Northgate Air', sub: 'HVAC · 9 people', user: ['IM', 'Iman Marsh', 'Owner'] },
  bloom: { initials: 'BS', name: 'Bloom Studio', sub: 'Florist · 4 people', user: ['PN', 'Priya Nandra', 'Owner'] },
  harbor: { initials: 'HD', name: 'Harbor Dental', sub: 'Practice · 12 people', user: ['AR', 'Alia Rahim', 'Principal'] },
  lumen: { initials: 'LA', name: 'Lumen Analytics', sub: 'B2B SaaS · 30 people', user: ['MD', 'Marco Deniz', 'Head of Marketing'] },
  meridian: { initials: 'MC', name: 'All accounts', sub: 'Meridian Collective', user: ['SK', 'Sana Kaur', 'Account director'] },
};

function sidebar(active, ws = WS.northgate) {
  let s = rect(0, 0, SIDEBAR, H, { r: 0, fill: C.white });
  s += line(SIDEBAR, 0, SIDEBAR, H, C.rule);

  // brand
  s += `<g transform="translate(20 22) scale(0.145)">
    <g stroke="${C.ink}" stroke-width="12" stroke-linecap="round">
      <line x1="0" y1="16" x2="40" y2="16"/><line x1="52" y1="16" x2="78" y2="16"/>
      <line x1="0" y1="48" x2="52" y2="48"/><line x1="64" y1="48" x2="92" y2="48"/>
      <line x1="0" y1="80" x2="32" y2="80"/><line x1="44" y1="80" x2="70" y2="80"/>
    </g>
    <path d="M 104 16 L 160 48 L 104 80 L 116 48 Z" fill="${C.accent}"/>
  </g>`;
  s += t(56, 38, 'ContentLineup', { size: 14.5, weight: 600, serif: true, spacing: -0.3 });

  // workspace switcher
  s += rect(16, 60, SIDEBAR - 32, 42, { r: 8, fill: C.paper, stroke: C.rule });
  s += avatar(24, 71, ws.initials, C.accentSoft, C.accentStrong, 10);
  s += t(50, 78, ws.name, { size: 11, weight: 600 });
  s += t(50, 91, ws.sub, { size: 9.5, fill: C.faint, mono: true });
  s += `<path d="M${SIDEBAR - 30} 78 l4 4 4-4" stroke="${C.faint}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

  s += t(20, 130, 'WORKSPACE', { size: 9, weight: 700, fill: C.faint, spacing: 0.8 });

  const activeNav = NAV_ALIAS[active] || active;
  let y = 144;
  for (const [id, label] of NAV) {
    const on = id === activeNav;
    if (on) s += rect(10, y, SIDEBAR - 20, 34, { r: 8, fill: C.accentSoft });
    if (on) s += rect(10, y + 8, 3, 18, { r: 2, fill: C.accent });
    s += `<g transform="translate(24 ${y + 9})" stroke="${on ? C.accent : C.subtle}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">${
      GLYPH[id]
    }</g>`;
    s += t(50, y + 22, label, { size: 12.5, weight: on ? 600 : 450, fill: on ? C.accentStrong : C.muted });
    y += 34;
  }

  // queue health card
  s += rect(14, H - 132, SIDEBAR - 28, 84, { r: 10, fill: C.paper, stroke: C.rule });
  s += t(26, H - 112, 'QUEUE HEALTH', { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
  s += t(26, H - 92, '18 days', { size: 17, weight: 600, serif: true, fill: C.sched });
  s += t(26, H - 78, 'of scheduled runway', { size: 9.5, fill: C.subtle });
  s += rect(26, H - 68, SIDEBAR - 52, 5, { r: 3, fill: C.cream });
  s += rect(26, H - 68, (SIDEBAR - 52) * 0.72, 5, { r: 3, fill: C.sched });

  s += avatar(16, H - 38, ws.user[0], C.cream, C.muted, 12);
  s += t(46, H - 22, ws.user[1], { size: 11, weight: 600 });
  s += t(46, H - 10, ws.user[2], { size: 9.5, fill: C.faint });
  return s;
}

function topbar(title, subtitle, action) {
  let s = rect(SIDEBAR, 0, W - SIDEBAR, TOPBAR, { r: 0, fill: C.white });
  s += line(SIDEBAR, TOPBAR, W, TOPBAR, C.rule);
  s += t(SIDEBAR + 28, 27, title, { size: 15, weight: 600, serif: true, spacing: -0.2 });
  s += t(SIDEBAR + 28, 43, subtitle, { size: 10.5, fill: C.faint });

  // search
  const sx = W - 430;
  s += rect(sx, 15, 190, 27, { r: 7, fill: C.paper, stroke: C.rule });
  s += `<g transform="translate(${sx + 9} ${23}) scale(0.62)" stroke="${C.faint}" stroke-width="2.2" fill="none" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="m12.5 12.5 4 4"/></g>`;
  s += t(sx + 30, 33, 'Search articles…', { size: 10.5, fill: C.faint });

  if (action) {
    const aw = action.length * 6.6 + 34;
    s += rect(W - 28 - aw, 14, aw, 29, { r: 7, fill: C.accent });
    s += t(W - 28 - aw + 14, 33, action, { size: 11.5, weight: 600, fill: C.white });
    s += `<path d="M${W - 28 - aw + aw - 22} 28.5 h9 m0 0 -3.4 -3.4 m3.4 3.4 -3.4 3.4" stroke="${
      C.white
    }" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return s;
}

const frame = (id, title, inner, ws) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    title
  )}" font-family="${SANS}">
<title>${esc(title)}</title>
<rect width="${W}" height="${H}" fill="${C.paper}"/>
${sidebar(id, ws)}
${inner}
</svg>`;

const CX = SIDEBAR + 28; // content left edge
const CW = W - SIDEBAR - 56; // content width

/** Stat tiles row. */
function stats(y, items) {
  const gap = 14;
  const w = (CW - gap * (items.length - 1)) / items.length;
  return items
    .map((it, i) => {
      const x = CX + i * (w + gap);
      return (
        rect(x, y, w, 74, { r: 10, fill: C.white, stroke: C.rule }) +
        t(x + 16, y + 22, it.label.toUpperCase(), { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 }) +
        t(x + 16, y + 48, it.value, { size: 22, weight: 600, serif: true, fill: it.tone || C.ink }) +
        t(x + 16, y + 63, it.sub, { size: 9.5, fill: C.subtle, mono: !!it.mono })
      );
    })
    .join('');
}

/** Generic table. cols: [{label,w,align}] rows: [[cell,...]] where cell is
 *  string | {pill,tone} | {mono} | {muted} | {avatar} */
function table(y, cols, rows, opts = {}) {
  let s = rect(CX, y, CW, 38 + rows.length * 44, { r: 10, fill: C.white, stroke: C.rule });
  let x = CX + 18;
  const xs = [];
  for (const c of cols) {
    xs.push(x);
    s += t(x, y + 24, c.label.toUpperCase(), { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
    x += c.w;
  }
  s += line(CX, y + 38, CX + CW, y + 38, C.rule);

  rows.forEach((row, ri) => {
    const ry = y + 38 + ri * 44;
    if (ri) s += line(CX + 18, ry, CX + CW - 18, ry, C.ruleSoft);
    if (opts.highlight === ri) s += rect(CX + 1, ry + 1, CW - 2, 42, { r: 0, fill: C.accentSoft, opacity: 0.5 });
    row.forEach((cell, ci) => {
      const cx = xs[ci];
      const cy = ry + 27;
      if (cell == null) return;
      if (typeof cell === 'string') {
        s += t(cx, cy, cell, { size: 12, weight: ci === 0 ? 550 : 400, fill: ci === 0 ? C.ink : C.muted });
      } else if (cell.pill) {
        s += pill(cx, ry + 12, cell.pill, cell.tone);
      } else if (cell.mono) {
        s += t(cx, cy, cell.mono, { size: 11, mono: true, fill: cell.tone || C.subtle });
      } else if (cell.avatar) {
        s += avatar(cx, ry + 10, cell.avatar, C.cream, C.muted, 11);
        if (cell.name) s += t(cx + 30, cy, cell.name, { size: 11.5, fill: C.muted });
      } else if (cell.sub) {
        s += t(cx, ry + 21, cell.main, { size: 12, weight: 550 });
        s += t(cx, ry + 34, cell.sub, { size: 9.5, fill: C.faint, mono: true });
      }
    });
  });
  return s;
}

// ---------------------------------------------------------------------------
// PLANS
// ---------------------------------------------------------------------------
const plans = () => {
  let s = topbar('Plans', 'Q3 content plan · Northgate Air · 24 briefs', 'New brief');
  s += stats(TOPBAR + 26, [
    { label: 'Briefs in plan', value: '24', sub: '6 added this week' },
    { label: 'Scheduled', value: '11', sub: 'through 30 Sep', tone: C.sched },
    { label: 'Published', value: '38', sub: 'all time', tone: C.green },
    { label: 'Avg. review time', value: '7m', sub: 'per article', mono: true },
  ]);
  s += t(CX, TOPBAR + 138, 'Content plan', { size: 14, weight: 600, serif: true });
  s += t(CX + CW, TOPBAR + 138, 'Filter: All owners  ·  Sort: Publish date', {
    size: 10.5,
    fill: C.faint,
    anchor: 'end',
  });
  s += table(
    TOPBAR + 152,
    [
      { label: 'Brief', w: 330 },
      { label: 'Target keyword', w: 230 },
      { label: 'Owner', w: 140 },
      { label: 'Publish', w: 130 },
      { label: 'Status', w: 100 },
    ],
    [
      [
        { main: 'Winter HVAC maintenance checklist', sub: '1,650 words · FAQ block' },
        { mono: 'hvac winter checklist' },
        { avatar: 'IM', name: 'Iman' },
        { mono: 'Sep 02 · 09:00', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'How often should you service an HVAC system?', sub: '1,420 words · direct answer' },
        { mono: 'hvac service frequency' },
        { avatar: 'IM', name: 'Iman' },
        { mono: 'Sep 05 · 09:00', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'Heat pump vs furnace in a dry climate', sub: '1,780 words · comparison table' },
        { mono: 'heat pump vs furnace' },
        { avatar: 'DR', name: 'Dana' },
        { mono: 'Sep 09 · 09:00' },
        { pill: 'In review', tone: 'review' },
      ],
      [
        { main: 'What a full system tune-up actually includes', sub: '1,310 words · scope table' },
        { mono: 'hvac tune up cost' },
        { avatar: 'DR', name: 'Dana' },
        { mono: 'Sep 12 · 09:00' },
        { pill: 'Draft', tone: 'draft' },
      ],
      [
        { main: 'Signs your ducts are leaking conditioned air', sub: '1,540 words · FAQ block' },
        { mono: 'leaking air ducts signs' },
        { avatar: 'IM', name: 'Iman' },
        { mono: 'Sep 16 · 09:00' },
        { pill: 'Draft', tone: 'draft' },
      ],
      [
        { main: 'Autumn filter replacement guide', sub: '1,120 words · seasonal' },
        { mono: 'when to change hvac filter' },
        { avatar: 'DR', name: 'Dana' },
        { mono: 'Sep 19 · 09:00' },
        { pill: 'Draft', tone: 'draft' },
      ],
    ],
    { highlight: 0 }
  );
  return frame('plans', 'ContentLineup — Plans', s);
};

// ---------------------------------------------------------------------------
// IDEAS
// ---------------------------------------------------------------------------
const ideas = () => {
  let s = topbar('Ideas', 'Topic backlog · 31 captured · 9 ready to brief', 'Capture idea');

  const colTitles = [
    ['Captured', 12, C.faint],
    ['Ready to brief', 9, C.accent],
    ['Promoted', 10, C.sched],
  ];
  const cards = [
    [
      ['Ductless mini-split running costs', 'mini split running cost', '1.2k/mo'],
      ['Why a system short-cycles', 'hvac short cycling', '880/mo'],
      ['Smart thermostat payback period', 'smart thermostat savings', '2.4k/mo'],
      ['Indoor air quality after wildfire smoke', 'wildfire smoke air filter', '3.1k/mo'],
    ],
    [
      ['Heat pump vs furnace in a dry climate', 'heat pump vs furnace', '9.9k/mo'],
      ['What a full tune-up includes', 'hvac tune up cost', '4.4k/mo'],
      ['Signs your ducts are leaking', 'leaking air ducts signs', '2.7k/mo'],
    ],
    [
      ['Winter maintenance checklist', 'hvac winter checklist', '5.4k/mo'],
      ['Service frequency explained', 'hvac service frequency', '6.6k/mo'],
      ['Autumn filter replacement guide', 'when to change hvac filter', '8.1k/mo'],
    ],
  ];

  const colW = (CW - 28) / 3;
  colTitles.forEach(([title, count, tone], ci) => {
    const x = CX + ci * (colW + 14);
    const y = TOPBAR + 26;
    s += rect(x, y, colW, H - y - 30, { r: 10, fill: C.white, stroke: C.rule });
    s += `<circle cx="${x + 20}" cy="${y + 21}" r="4" fill="${tone}"/>`;
    s += t(x + 32, y + 25, title, { size: 12.5, weight: 600 });
    s += t(x + colW - 18, y + 25, String(count), { size: 11, mono: true, fill: C.faint, anchor: 'end' });
    s += line(x, y + 38, x + colW, y + 38, C.ruleSoft);

    let cy = y + 52;
    for (const [name, kw, vol] of cards[ci]) {
      s += rect(x + 12, cy, colW - 24, 92, { r: 8, fill: C.paper, stroke: C.rule });
      // wrap title to two lines at ~30 chars
      const words = name.split(' ');
      let l1 = '';
      let l2 = '';
      for (const w of words) (l1.length + w.length < 30 ? (l1 += (l1 ? ' ' : '') + w) : (l2 += (l2 ? ' ' : '') + w));
      s += t(x + 26, cy + 24, l1, { size: 12, weight: 550 });
      if (l2) s += t(x + 26, cy + 39, l2, { size: 12, weight: 550 });
      s += t(x + 26, cy + (l2 ? 57 : 44), kw, { size: 10, mono: true, fill: C.accentStrong });
      s += rect(x + 24, cy + 66, 62, 18, { r: 9, fill: C.accentSoft });
      s += t(x + 32, cy + 79, vol, { size: 9.5, mono: true, weight: 600, fill: C.accentStrong });
      if (ci === 2) s += pill(x + 94, cy + 66, 'Briefed', 'scheduled');
      if (ci === 1) s += pill(x + 94, cy + 66, 'Ready', 'review');
      cy += 104;
    }
    if (ci === 1) {
      s += rect(x + 12, cy, colW - 24, 44, { r: 8, fill: C.white, stroke: C.rule });
      s += t(x + colW / 2, cy + 27, '+  Bulk brief from spreadsheet', {
        size: 11,
        weight: 550,
        fill: C.accent,
        anchor: 'middle',
      });
    }
  });
  return frame('ideas', 'ContentLineup — Ideas', s);
};

// ---------------------------------------------------------------------------
// CALENDAR
// ---------------------------------------------------------------------------
const calendar = () => {
  let s = topbar('Calendar', 'September 2026 · 11 scheduled · 2 empty weeks flagged', 'Schedule post');

  const y0 = TOPBAR + 26;
  s += rect(CX, y0, CW, 40, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 18, y0 + 25, 'September 2026', { size: 14, weight: 600, serif: true });
  s += t(CX + 160, y0 + 25, '‹    ›', { size: 13, fill: C.faint });
  // The legend borrows the status pill's vocabulary — same dot, same uppercase
  // mono label, same colours — so a state reads identically here, in the pills
  // on the other screens, and in the HTML lists on the marketing pages.
  ['Draft', 'Scheduled', 'Published'].forEach((l, i) => {
    const lx = CX + CW - 340 + i * 112;
    const [dot, fg] = [
      [C.muted, C.muted],
      [C.sched, C.sched],
      [C.green, C.green],
    ][i];
    s += `<circle cx="${lx}" cy="${y0 + 20}" r="2.5" fill="${dot}"/>`;
    s += t(lx + 9, y0 + 23.6, l.toUpperCase(), {
      size: 9.5,
      weight: 700,
      fill: fg,
      mono: true,
      spacing: 0.5,
    });
  });

  const gy = y0 + 52;
  const cellW = CW / 7;
  const cellH = 118;
  ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach((d, i) => {
    s += t(CX + i * cellW + 12, gy - 8, d, { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
  });

  const events = {
    2: [['Winter HVAC checklist', 'scheduled', '09:00']],
    5: [['Service frequency', 'scheduled', '09:00']],
    9: [['Heat pump vs furnace', 'review', '09:00']],
    12: [['Full tune-up scope', 'draft', '09:00']],
    16: [['Duct leak signs', 'scheduled', '09:00']],
    19: [['Autumn filter guide', 'scheduled', '09:00']],
    23: [['Smart thermostat ROI', 'scheduled', '09:00']],
    26: [['Air quality guide', 'scheduled', '09:00']],
    30: [['Q4 kickoff post', 'draft', '09:00']],
  };

  s += rect(CX, gy, CW, cellH * 5, { r: 10, fill: C.white, stroke: C.rule });
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const day = r * 7 + c - 1; // Sep 2026 starts Tuesday
      const x = CX + c * cellW;
      const y = gy + r * cellH;
      if (c) s += line(x, y + 4, x, y + cellH - 4, C.ruleSoft);
      if (r) s += line(x, y, x + cellW, y, C.ruleSoft);
      if (day < 1 || day > 30) continue;
      const isWeekend = c > 4;
      if (isWeekend) s += rect(x + 1, y + 1, cellW - 2, cellH - 2, { r: 0, fill: C.paper, opacity: 0.7 });
      s += t(x + 12, y + 20, String(day), {
        size: 11,
        mono: true,
        weight: day === 2 ? 700 : 400,
        fill: day === 2 ? C.accent : C.faint,
      });
      const ev = events[day];
      if (!ev) continue;
      let ey = y + 30;
      for (const [name, tone, time] of ev) {
        const bg = { scheduled: C.schedSoft, draft: C.cream, review: C.amberSoft }[tone];
        const fg = { scheduled: C.sched, draft: C.muted, review: C.amber }[tone];
        s += rect(x + 8, ey, cellW - 16, 52, { r: 6, fill: bg });
        s += rect(x + 8, ey, 3, 52, { r: 2, fill: fg });
        const words = name.split(' ');
        let l1 = '';
        let l2 = '';
        for (const w of words) (l1.length + w.length < 17 ? (l1 += (l1 ? ' ' : '') + w) : (l2 += (l2 ? ' ' : '') + w));
        s += t(x + 17, ey + 16, l1, { size: 9.8, weight: 600, fill: fg });
        if (l2) s += t(x + 17, ey + 28, l2, { size: 9.8, weight: 600, fill: fg });
        s += t(x + 17, ey + (l2 ? 43 : 32), time, { size: 9, mono: true, fill: fg, opacity: 0.7 });
        ey += 56;
      }
    }
  }
  // empty-week flag
  s += rect(CX + 12, gy + cellH * 5 + 14, CW - 24, 40, { r: 8, fill: C.amberSoft });
  s += t(CX + 30, gy + cellH * 5 + 39, '⚠  Week of 21 Sep has one scheduled post. Queue runway drops below 14 days on 28 Sep.', {
    size: 11,
    weight: 500,
    fill: C.amber,
  });
  return frame('calendar', 'ContentLineup — Calendar', s);
};

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
const list = () => {
  let s = topbar('Content', 'All articles · 49 total · 11 scheduled', 'New article');

  const y0 = TOPBAR + 24;
  const tabs = ['All  49', 'Draft  8', 'Scheduled  11', 'Published  30'];
  let tx = CX;
  tabs.forEach((tab, i) => {
    const w = tab.length * 6.6 + 26;
    s += rect(tx, y0, w, 30, { r: 8, fill: i === 0 ? C.ink : C.white, stroke: i === 0 ? C.ink : C.rule });
    s += t(tx + 13, y0 + 20, tab, { size: 11.5, weight: 550, fill: i === 0 ? C.white : C.muted });
    tx += w + 8;
  });
  s += t(CX + CW, y0 + 20, 'Timezone: America/Phoenix', { size: 10.5, mono: true, fill: C.faint, anchor: 'end' });

  s += table(
    y0 + 46,
    [
      { label: 'Article', w: 400 },
      { label: 'Images', w: 110 },
      { label: 'SEO', w: 110 },
      { label: 'Publish at', w: 180 },
      { label: 'State', w: 130 },
    ],
    [
      [
        { main: 'Winter HVAC maintenance checklist', sub: '1,650 words · updated 2h ago' },
        { mono: '1 + 3' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-09-02 09:00', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'How often should you service an HVAC system?', sub: '1,420 words · updated yesterday' },
        { mono: '1 + 2' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-09-05 09:00', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'Heat pump vs furnace in a dry climate', sub: '1,780 words · awaiting Dana' },
        { mono: '1 + 4' },
        { pill: '1 warning', tone: 'review' },
        { mono: '2026-09-09 09:00' },
        { pill: 'In review', tone: 'review' },
      ],
      [
        { main: 'What a full system tune-up actually includes', sub: '1,310 words · draft' },
        { mono: '1 + 2' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-09-12 09:00' },
        { pill: 'Draft', tone: 'draft' },
      ],
      [
        { main: 'Summer efficiency guide for older systems', sub: '1,490 words · live' },
        { mono: '1 + 3' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-08-14 09:00', tone: C.green },
        { pill: 'Published', tone: 'published' },
      ],
      [
        { main: 'Why your upstairs never cools properly', sub: '1,560 words · live' },
        { mono: '1 + 3' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-08-07 09:00', tone: C.green },
        { pill: 'Published', tone: 'published' },
      ],
      [
        { main: 'Choosing an air filter MERV rating', sub: '1,240 words · live' },
        { mono: '1 + 2' },
        { pill: 'Ready', tone: 'published' },
        { mono: '2026-07-31 09:00', tone: C.green },
        { pill: 'Published', tone: 'published' },
      ],
    ]
  );
  return frame('list', 'ContentLineup — List', s);
};

// ---------------------------------------------------------------------------
// APPROVALS
// ---------------------------------------------------------------------------
const approvals = () => {
  let s = topbar('Approvals', '3 drafts waiting · reviewer: Dana Reyes', 'Share review link');

  const y0 = TOPBAR + 26;
  const leftW = 380;

  // queue list
  s += rect(CX, y0, leftW, H - y0 - 30, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 18, y0 + 26, 'Waiting for review', { size: 12.5, weight: 600 });
  s += line(CX, y0 + 40, CX + leftW, y0 + 40, C.ruleSoft);
  const queue = [
    ['Heat pump vs furnace in a dry climate', 'Submitted 2h ago · Iman', true],
    ['Signs your ducts are leaking air', 'Submitted yesterday · Iman', false],
    ['Autumn filter replacement guide', 'Submitted 2 days ago · Dana', false],
  ];
  let qy = y0 + 52;
  queue.forEach(([name, meta, active]) => {
    if (active) {
      s += rect(CX + 8, qy, leftW - 16, 74, { r: 8, fill: C.accentSoft });
      s += rect(CX + 8, qy + 14, 3, 46, { r: 2, fill: C.accent });
    }
    const words = name.split(' ');
    let l1 = '';
    let l2 = '';
    for (const w of words) (l1.length + w.length < 34 ? (l1 += (l1 ? ' ' : '') + w) : (l2 += (l2 ? ' ' : '') + w));
    s += t(CX + 26, qy + 26, l1, { size: 12, weight: 600, fill: active ? C.accentStrong : C.ink });
    if (l2) s += t(CX + 26, qy + 41, l2, { size: 12, weight: 600, fill: active ? C.accentStrong : C.ink });
    s += t(CX + 26, qy + (l2 ? 58 : 44), meta, { size: 10, fill: C.faint, mono: true });
    qy += 84;
  });

  // review pane
  const px = CX + leftW + 16;
  const pw = CW - leftW - 16;
  s += rect(px, y0, pw, H - y0 - 30, { r: 10, fill: C.white, stroke: C.rule });
  s += t(px + 22, y0 + 30, 'Heat pump vs furnace in a dry climate', { size: 14.5, weight: 600, serif: true });
  s += t(px + 22, y0 + 48, '1,780 words · 6 sections · 1 featured + 4 inline images', {
    size: 10.5,
    fill: C.faint,
    mono: true,
  });
  s += line(px, y0 + 62, px + pw, y0 + 62, C.ruleSoft);

  // document preview
  const dx = px + 22;
  let dy = y0 + 86;
  s += t(dx, dy, 'H2  Which actually costs less to run?', { size: 11.5, weight: 600, fill: C.accentStrong });
  dy += 18;
  for (const w of [0.96, 0.92, 0.99, 0.62]) {
    s += rect(dx, dy, (pw - 44) * w, 7, { r: 4, fill: C.cream });
    dy += 14;
  }
  dy += 8;
  s += rect(dx, dy, pw - 44, 76, { r: 8, fill: C.paper, stroke: C.rule });
  s += t(dx + 14, dy + 20, 'Comparison table · 4 rows', { size: 10, mono: true, fill: C.faint });
  for (let i = 0; i < 3; i++) {
    s += rect(dx + 14, dy + 30 + i * 14, (pw - 72) * 0.9, 6, { r: 3, fill: C.cream });
  }
  dy += 92;
  s += t(dx, dy, 'H3  What changes in a dry climate', { size: 11.5, weight: 600, fill: C.accentStrong });
  dy += 18;
  for (const w of [0.94, 0.88]) {
    s += rect(dx, dy, (pw - 44) * w, 7, { r: 4, fill: C.cream });
    dy += 14;
  }

  // revision chat
  const chy = H - 224;
  s += line(px, chy - 14, px + pw, chy - 14, C.ruleSoft);
  s += t(px + 22, chy + 4, 'REVISION REQUESTS', { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
  s += rect(px + 22, chy + 14, pw - 44, 44, { r: 8, fill: C.paper, stroke: C.rule });
  s += avatar(px + 32, chy + 25, 'DR', C.cream, C.muted, 10);
  s += t(px + 58, chy + 33, 'Make the opening two sentences shorter.', { size: 11, fill: C.muted });
  s += t(px + 58, chy + 47, 'Applied to section 1 · 4 min ago', { size: 9.5, mono: true, fill: C.faint });

  s += rect(px + 22, chy + 68, pw - 44, 44, { r: 8, fill: C.paper, stroke: C.rule });
  s += avatar(px + 32, chy + 79, 'DR', C.cream, C.muted, 10);
  s += t(px + 58, chy + 87, 'Add a comparison table for running costs.', { size: 11, fill: C.muted });
  s += t(px + 58, chy + 101, 'Applied to section 3 · 2 min ago', { size: 9.5, mono: true, fill: C.faint });

  s += rect(px + 22, chy + 124, pw - 44, 36, { r: 8, fill: C.white, stroke: C.rule });
  s += t(px + 36, chy + 147, 'Ask for a change in plain language…', { size: 11, fill: C.faint });

  // actions
  s += rect(px + 22, H - 66, 148, 34, { r: 8, fill: C.accent });
  s += t(px + 96, H - 44, 'Approve & schedule', { size: 11.5, weight: 600, fill: C.white, anchor: 'middle' });
  s += rect(px + 180, H - 66, 128, 34, { r: 8, fill: C.white, stroke: C.rule });
  s += t(px + 244, H - 44, 'Request changes', { size: 11.5, weight: 550, fill: C.muted, anchor: 'middle' });
  s += t(px + pw - 22, H - 44, 'Publishes 2026-09-09 09:00', { size: 10.5, mono: true, fill: C.sched, anchor: 'end' });

  return frame('approvals', 'ContentLineup — Approvals', s);
};

// ---------------------------------------------------------------------------
// LIBRARY
// ---------------------------------------------------------------------------
const library = () => {
  let s = topbar('Library', '49 articles · 147 images · everything exportable', 'Export all');

  const y0 = TOPBAR + 24;
  s += rect(CX, y0, CW, 44, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 18, y0 + 28, 'Filter:', { size: 11, fill: C.faint });
  ['All time', 'Published', 'With images', 'Has FAQ block'].forEach((f, i) => {
    const x = CX + 66 + i * 108;
    s += rect(x, y0 + 11, f.length * 6.3 + 22, 22, { r: 11, fill: i === 0 ? C.accentSoft : C.paper, stroke: i === 0 ? 'none' : C.rule });
    s += t(x + 11, y0 + 26, f, { size: 10.5, weight: 500, fill: i === 0 ? C.accentStrong : C.subtle });
  });
  s += t(CX + CW - 18, y0 + 28, 'Export: Markdown · HTML · Spreadsheet', {
    size: 10.5,
    mono: true,
    fill: C.accent,
    anchor: 'end',
  });

  const items = [
    ['Winter HVAC maintenance checklist', '2026-09-02', 'Scheduled', 'scheduled', 4],
    ['Summer efficiency for older systems', '2026-08-14', 'Published', 'published', 4],
    ['Why your upstairs never cools', '2026-08-07', 'Published', 'published', 3],
    ['Choosing an air filter MERV rating', '2026-07-31', 'Published', 'published', 3],
    ['Thermostat settings that save money', '2026-07-24', 'Published', 'published', 4],
    ['Is your system too big for the house?', '2026-07-17', 'Published', 'published', 3],
    ['Refrigerant leak warning signs', '2026-07-10', 'Published', 'published', 4],
    ['Annual maintenance plan comparison', '2026-07-03', 'Published', 'published', 5],
  ];
  const cols = 4;
  const cardW = (CW - 3 * 16) / cols;
  items.forEach((it, i) => {
    const [name, date, label, tone, imgs] = it;
    const x = CX + (i % cols) * (cardW + 16);
    const y = y0 + 62 + Math.floor(i / cols) * 268;
    s += rect(x, y, cardW, 250, { r: 10, fill: C.white, stroke: C.rule });
    // thumbnail
    const hues = [C.peach, C.cream, C.schedSoft, C.accentSoft, C.greenSoft, C.amberSoft, C.peach, C.cream];
    s += `<clipPath id="cl${i}"><rect x="${x + 1}" y="${y + 1}" width="${cardW - 2}" height="118" rx="9"/></clipPath>`;
    s += `<g clip-path="url(#cl${i})">`;
    s += rect(x + 1, y + 1, cardW - 2, 118, { r: 9, fill: hues[i % hues.length] });
    s += `<circle cx="${x + cardW - 40}" cy="${y + 34}" r="26" fill="${C.white}" opacity="0.5"/>`;
    s += `<path d="M${x} ${y + 100} l${cardW * 0.3} -34 l${cardW * 0.22} 20 l${cardW * 0.28} -30 l${
      cardW * 0.3
    } 44 Z" fill="${C.ink}" opacity="0.12"/>`;
    s += `</g>`;
    s += rect(x + 10, y + 96, 60, 18, { r: 9, fill: C.white, opacity: 0.9 });
    s += t(x + 20, y + 109, `${imgs} images`, { size: 9, mono: true, fill: C.muted });

    const words = name.split(' ');
    let l1 = '';
    let l2 = '';
    for (const w of words) (l1.length + w.length < 26 ? (l1 += (l1 ? ' ' : '') + w) : (l2 += (l2 ? ' ' : '') + w));
    s += t(x + 16, y + 145, l1, { size: 12.5, weight: 600 });
    if (l2) s += t(x + 16, y + 161, l2, { size: 12.5, weight: 600 });
    s += t(x + 16, y + 186, date, { size: 10.5, mono: true, fill: C.faint });
    s += pill(x + 16, y + 198, label, tone);
    s += line(x + 16, y + 228, x + cardW - 16, y + 228, C.ruleSoft);
    s += t(x + 16, y + 243, 'Export  ·  Duplicate  ·  History', { size: 10, fill: C.accent });
  });
  return frame('library', 'ContentLineup — Library', s);
};

// ---------------------------------------------------------------------------
// STRATEGY
// ---------------------------------------------------------------------------
const strategy = () => {
  let s = topbar('Strategy', 'Keyword coverage · 62 tracked · 9 gaps', 'Add keyword');

  s += stats(TOPBAR + 26, [
    { label: 'Keywords tracked', value: '62', sub: 'across 4 clusters' },
    { label: 'Covered', value: '48', sub: '77% of tracked', tone: C.green },
    { label: 'Open gaps', value: '9', sub: 'no article yet', tone: C.accent },
    { label: 'Cannibalising', value: '5', sub: '2 drafts, same query', tone: C.amber },
  ]);

  const y0 = TOPBAR + 138;
  const leftW = CW * 0.56;

  // coverage by cluster
  s += rect(CX, y0, leftW, 300, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 18, y0 + 26, 'Coverage by cluster', { size: 12.5, weight: 600 });
  s += line(CX, y0 + 40, CX + leftW, y0 + 40, C.ruleSoft);
  const clusters = [
    ['Maintenance & servicing', 0.92, '23 / 25'],
    ['Buying & replacement', 0.74, '14 / 19'],
    ['Efficiency & bills', 0.61, '8 / 13'],
    ['Air quality', 0.6, '3 / 5'],
  ];
  clusters.forEach(([name, pct, ratio], i) => {
    const y = y0 + 66 + i * 58;
    s += t(CX + 18, y, name, { size: 12, weight: 500 });
    s += t(CX + leftW - 18, y, ratio, { size: 11, mono: true, fill: C.faint, anchor: 'end' });
    s += rect(CX + 18, y + 10, leftW - 36, 8, { r: 4, fill: C.cream });
    s += rect(CX + 18, y + 10, (leftW - 36) * pct, 8, { r: 4, fill: pct > 0.8 ? C.green : pct > 0.65 ? C.sched : C.amber });
  });

  // gaps
  const gx = CX + leftW + 16;
  const gw = CW - leftW - 16;
  s += rect(gx, y0, gw, 300, { r: 10, fill: C.white, stroke: C.rule });
  s += t(gx + 18, y0 + 26, 'Open gaps — highest volume first', { size: 12.5, weight: 600 });
  s += line(gx, y0 + 40, gx + gw, y0 + 40, C.ruleSoft);
  const gaps = [
    ['hvac replacement cost 2026', '12.1k', 'high'],
    ['heat pump tax credit', '9.4k', 'high'],
    ['furnace making banging noise', '6.8k', 'med'],
    ['best time of year to replace hvac', '4.2k', 'med'],
    ['hvac maintenance plan worth it', '3.3k', 'med'],
  ];
  gaps.forEach(([kw, vol, pri], i) => {
    const y = y0 + 62 + i * 46;
    s += t(gx + 18, y + 18, kw, { size: 11, mono: true, fill: C.ink });
    s += t(gx + gw - 100, y + 18, vol + '/mo', { size: 10.5, mono: true, fill: C.faint, anchor: 'end' });
    s += pill(gx + gw - 88, y + 5, pri === 'high' ? 'Brief now' : 'Queue', pri === 'high' ? 'accent' : 'draft');
    if (i < gaps.length - 1) s += line(gx + 18, y + 34, gx + gw - 18, y + 34, C.ruleSoft);
  });

  // keyword coverage table
  s += table(
    y0 + 316,
    [
      { label: 'Target keyword', w: 300 },
      { label: 'Volume', w: 110 },
      { label: 'Covered by', w: 330 },
      { label: 'In body', w: 120 },
      { label: 'Status', w: 120 },
    ],
    [
      [
        { mono: 'hvac winter checklist' },
        { mono: '5.4k/mo' },
        'Winter HVAC maintenance checklist',
        { mono: '9 uses', tone: C.green },
        { pill: 'Covered', tone: 'published' },
      ],
      [
        { mono: 'hvac service frequency' },
        { mono: '6.6k/mo' },
        'How often should you service an HVAC…',
        { mono: '7 uses', tone: C.green },
        { pill: 'Covered', tone: 'published' },
      ],
      [
        { mono: 'heat pump vs furnace' },
        { mono: '9.9k/mo' },
        'Heat pump vs furnace in a dry climate',
        { mono: '4 uses', tone: C.amber },
        { pill: 'In review', tone: 'review' },
      ],
      [
        { mono: 'hvac replacement cost 2026' },
        { mono: '12.1k/mo' },
        '— no article yet —',
        { mono: '0 uses', tone: C.accent },
        { pill: 'Gap', tone: 'accent' },
      ],
    ]
  );
  return frame('strategy', 'ContentLineup — Strategy', s);
};

// ---------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------
const settings = () => {
  let s = topbar('Settings', 'Northgate Air workspace · you are the Owner', 'Save changes');

  const y0 = TOPBAR + 24;
  const tabs = ['General', 'Team', 'API keys', 'Export', 'Billing'];
  let tx = CX;
  tabs.forEach((tab, i) => {
    const w = tab.length * 7 + 26;
    s += t(tx + 13, y0 + 20, tab, { size: 12, weight: i === 2 ? 600 : 450, fill: i === 2 ? C.ink : C.subtle });
    if (i === 2) s += rect(tx + 13, y0 + 28, w - 26, 2, { r: 1, fill: C.accent });
    tx += w + 6;
  });
  s += line(CX, y0 + 30, CX + CW, y0 + 30, C.rule);

  const leftW = CW * 0.58;
  let y = y0 + 50;

  // --- API key card ---
  s += rect(CX, y, leftW, 250, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 20, y + 28, 'AI provider key', { size: 13, weight: 600, serif: true });
  s += t(CX + 20, y + 46, 'Choose who pays for generation. Switch any time.', { size: 10.5, fill: C.faint });

  // option: managed (selected)
  s += rect(CX + 20, y + 60, leftW - 40, 62, { r: 8, fill: C.accentSoft, stroke: C.accent });
  s += `<circle cx="${CX + 42}" cy="${y + 91}" r="8" fill="none" stroke="${C.accent}" stroke-width="1.6"/>`;
  s += `<circle cx="${CX + 42}" cy="${y + 91}" r="4" fill="${C.accent}"/>`;
  s += t(CX + 60, y + 84, 'Use the managed ContentLineup key', { size: 12, weight: 600, fill: C.accentStrong });
  s += t(CX + 60, y + 100, 'Included in your plan · 40 articles/mo · 12 used', {
    size: 10,
    mono: true,
    fill: C.accentStrong,
  });
  s += pill(CX + leftW - 106, y + 72, 'Active', 'accent');

  // option: personal key
  s += rect(CX + 20, y + 132, leftW - 40, 96, { r: 8, fill: C.white, stroke: C.rule });
  s += `<circle cx="${CX + 42}" cy="${y + 158}" r="8" fill="none" stroke="${C.faint}" stroke-width="1.6"/>`;
  s += t(CX + 60, y + 152, 'Use a personal API key (BYO)', { size: 12, weight: 600 });
  s += t(CX + 60, y + 167, 'Your OpenAI or Gemini key. No article cap. Billed by your provider.', {
    size: 10,
    fill: C.faint,
  });
  s += rect(CX + 60, y + 178, leftW - 200, 30, { r: 7, fill: C.paper, stroke: C.rule });
  s += `<g transform="translate(${CX + 72} ${y + 186}) scale(0.6)" stroke="${C.faint}" stroke-width="2.4" fill="none" stroke-linecap="round"><rect x="2" y="9" width="18" height="12" rx="2.5"/><path d="M6 9V6.5a5 5 0 0 1 10 0V9"/></g>`;
  s += t(CX + 92, y + 197, 'sk-••••••••••••••••••••••••••••3f8a', { size: 10.5, mono: true, fill: C.subtle });
  s += rect(CX + leftW - 132, y + 178, 72, 30, { r: 7, fill: C.ink });
  s += t(CX + leftW - 96, y + 197, 'Save key', { size: 10.5, weight: 600, fill: C.white, anchor: 'middle' });
  s += t(CX + 60, y + 220, 'Encrypted at rest. Shown only by its last four characters after saving.', {
    size: 9.5,
    fill: C.faint,
  });

  // --- export card ---
  y += 266;
  s += rect(CX, y, leftW, 152, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 20, y + 28, 'Export your content plan', { size: 13, weight: 600, serif: true });
  s += t(CX + 20, y + 46, 'Nothing here is locked in. Take it all, any time.', { size: 10.5, fill: C.faint });
  const exports = [
    ['Content plan  →  .xlsx', 'Topics, keywords, owners, publish dates, statuses'],
    ['All articles  →  .md / .html', '49 articles with images and alt text'],
  ];
  exports.forEach(([label, sub], i) => {
    const ey = y + 62 + i * 42;
    s += rect(CX + 20, ey, leftW - 40, 36, { r: 7, fill: C.paper, stroke: C.rule });
    s += `<g transform="translate(${CX + 34} ${ey + 10})" stroke="${C.sched}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V1M8 11 5 8m3 3 3-3"/><path d="M2 12v2.5h12V12"/></g>`;
    s += t(CX + 56, ey + 16, label, { size: 11.5, weight: 550, mono: true });
    s += t(CX + 56, ey + 29, sub, { size: 9.5, fill: C.faint });
    s += t(CX + leftW - 34, ey + 23, 'Download', { size: 10.5, weight: 600, fill: C.accent, anchor: 'end' });
  });

  // --- team card ---
  const rx = CX + leftW + 16;
  const rw = CW - leftW - 16;
  s += rect(rx, y0 + 50, rw, 300, { r: 10, fill: C.white, stroke: C.rule });
  s += t(rx + 20, y0 + 78, 'Team members', { size: 13, weight: 600, serif: true });
  s += t(rx + 20, y0 + 96, '3 of 3 seats used on your plan', { size: 10.5, fill: C.faint });
  s += rect(rx + rw - 130, y0 + 64, 110, 30, { r: 7, fill: C.ink });
  s += t(rx + rw - 75, y0 + 83, '+  Invite member', { size: 10.5, weight: 600, fill: C.white, anchor: 'middle' });

  const team = [
    ['IM', 'Iman Marsh', 'iman@northgateair.com', 'Owner'],
    ['DR', 'Dana Reyes', 'dana@northgateair.com', 'Editor'],
    ['SP', 'Sam Pryce', 'sam@northgateair.com', 'Reviewer'],
  ];
  team.forEach(([ini, name, mail, role], i) => {
    const ty = y0 + 112 + i * 62;
    s += line(rx + 20, ty, rx + rw - 20, ty, C.ruleSoft);
    s += avatar(rx + 20, ty + 14, ini, i === 0 ? C.accentSoft : C.cream, i === 0 ? C.accentStrong : C.muted, 14);
    s += t(rx + 60, ty + 26, name, { size: 12, weight: 600 });
    s += t(rx + 60, ty + 41, mail, { size: 10, mono: true, fill: C.faint });
    s += pill(rx + rw - 96, ty + 18, role, i === 0 ? 'accent' : 'draft');
  });

  s += rect(rx + 20, y0 + 300, rw - 40, 38, { r: 8, fill: C.paper, stroke: C.rule });
  s += t(rx + 36, y0 + 324, 'Pending: alex@northgateair.com · invite sent 2 days ago', {
    size: 10,
    mono: true,
    fill: C.faint,
  });

  // --- danger / ownership card ---
  s += rect(rx, y0 + 366, rw, 210, { r: 10, fill: C.white, stroke: C.rule });
  s += t(rx + 20, y0 + 394, 'Data & ownership', { size: 13, weight: 600, serif: true });
  const owns = [
    'You own copyright in every generated article',
    'We do not train models on your content',
    'Cancelling keeps read + export access',
    'Keys are never included in exports',
  ];
  owns.forEach((o, i) => {
    const oy = y0 + 418 + i * 30;
    s += `<g transform="translate(${rx + 22} ${oy}) scale(0.62)" stroke="${C.green}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m2 8.5 4 4 8-9"/></g>`;
    s += t(rx + 44, oy + 11, o, { size: 11, fill: C.muted });
  });
  s += t(rx + 22, y0 + 552, 'Full detail on the Security & Trust page', { size: 10, fill: C.accent });

  return frame('settings', 'ContentLineup — Settings', s);
};

// ---------------------------------------------------------------------------
// SOCIAL
// ---------------------------------------------------------------------------
const social = () => {
  let s = topbar('Social', '3 channels connected · 9 posts queued this week', 'New social post');

  const y0 = TOPBAR + 26;

  // --- connected channels -------------------------------------------------
  const chW = (CW - 28) / 3;
  const channels = [
    ['LinkedIn', '@northgate-air', 'Company page', C.sched, 4],
    ['Facebook', 'Northgate Air', 'Page', C.accent, 3],
    ['Instagram', '@northgateair', 'Business account', C.amber, 2],
  ];
  channels.forEach(([name, handle, kind, tone, queued], i) => {
    const x = CX + i * (chW + 14);
    s += rect(x, y0, chW, 92, { r: 10, fill: C.white, stroke: C.rule });
    s += rect(x + 16, y0 + 18, 34, 34, { r: 9, fill: tone });
    // Channel initial, standing in for the brand mark.
    s += t(x + 33, y0 + 41, name[0], { size: 17, weight: 700, fill: C.white, anchor: 'middle' });
    s += t(x + 60, y0 + 32, name, { size: 13, weight: 600 });
    s += t(x + 60, y0 + 47, handle, { size: 10, mono: true, fill: C.faint });
    s += `<circle cx="${x + chW - 26}" cy="${y0 + 26}" r="4" fill="${C.green}"/>`;
    s += t(x + chW - 36, y0 + 30, 'Connected', { size: 9.5, weight: 600, fill: C.green, anchor: 'end' });
    s += line(x + 16, y0 + 64, x + chW - 16, y0 + 64, C.ruleSoft);
    s += t(x + 16, y0 + 81, kind, { size: 9.5, fill: C.subtle });
    s += t(x + chW - 16, y0 + 81, `${queued} queued`, { size: 9.5, mono: true, fill: C.sched, anchor: 'end' });
  });

  // --- auto-share toggle row ----------------------------------------------
  const ay = y0 + 106;
  s += rect(CX, ay, CW, 52, { r: 10, fill: C.accentSoft });
  s += `<g transform="translate(${CX + 20} ${ay + 17})" stroke="${C.accent}" stroke-width="1.6" fill="none" stroke-linecap="round"><circle cx="13" cy="3" r="2.4"/><circle cx="3" cy="9" r="2.4"/><circle cx="13" cy="15" r="2.4"/><path d="m5.1 7.8 5.8-3.2m0 9L5.1 10.4"/></g>`;
  s += t(CX + 52, ay + 24, 'Auto-share on publish', { size: 12.5, weight: 600, fill: C.accentStrong });
  s += t(CX + 52, ay + 39, 'When an article publishes, a post goes to every connected channel.', {
    size: 10.5,
    fill: C.accentStrong,
  });
  // Toggle, switched on.
  s += rect(CX + CW - 74, ay + 15, 42, 22, { r: 11, fill: C.accent });
  s += `<circle cx="${CX + CW - 43}" cy="${ay + 26}" r="8" fill="${C.white}"/>`;

  // --- social queue --------------------------------------------------------
  s += t(CX, ay + 84, 'Social queue', { size: 14, weight: 600, serif: true });
  s += t(CX + CW, ay + 84, 'Filter: All channels', { size: 10.5, fill: C.faint, anchor: 'end' });

  s += table(
    ay + 98,
    [
      { label: 'Post', w: 372 },
      { label: 'Channel', w: 150 },
      { label: 'Source', w: 220 },
      { label: 'Publish at', w: 168 },
      { label: 'State', w: 110 },
    ],
    [
      [
        { main: 'How often should you service an HVAC…', sub: 'Auto-share · 1 image' },
        { mono: 'LinkedIn', tone: C.sched },
        'Article auto-share',
        { mono: '2026-09-05 09:00', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'Winter checklist — free download', sub: 'Standalone · 1 image' },
        { mono: 'Facebook', tone: C.accent },
        'Composer',
        { mono: '2026-09-05 12:30', tone: C.sched },
        { pill: 'Scheduled', tone: 'scheduled' },
      ],
      [
        { main: 'Before / after: duct sealing job', sub: 'Standalone · feed post' },
        { mono: 'Instagram', tone: C.amber },
        'Composer',
        { mono: '2026-09-06 17:00' },
        { pill: 'In review', tone: 'review' },
      ],
      [
        { main: 'Heat pump vs furnace in a dry climate', sub: 'Auto-share · 1 image' },
        { mono: 'LinkedIn', tone: C.sched },
        'Article auto-share',
        { mono: '2026-09-09 09:00' },
        { pill: 'Draft', tone: 'draft' },
      ],
      [
        { main: 'Winter HVAC maintenance checklist', sub: 'Auto-share · 1 image' },
        { mono: 'Facebook', tone: C.accent },
        'Article auto-share',
        { mono: '2026-09-02 09:00', tone: C.green },
        { pill: 'Published', tone: 'published' },
      ],
      [
        { main: 'Winter HVAC maintenance checklist', sub: 'Auto-share · feed post' },
        { mono: 'Instagram', tone: C.amber },
        'Article auto-share',
        { mono: '2026-09-02 09:00', tone: C.green },
        { pill: 'Published', tone: 'published' },
      ],
    ],
    { highlight: 0 }
  );

  return frame('social', 'ContentLineup — Social', s);
};

// ---------------------------------------------------------------------------
// CAMPAIGNS — content grouped by launch, season or quarter, across accounts
// ---------------------------------------------------------------------------
const campaigns = () => {
  let s = topbar('Campaigns', 'Meridian Collective · 6 accounts · 9 active campaigns', 'New campaign');

  s += stats(TOPBAR + 26, [
    { label: 'Active campaigns', value: '9', sub: 'across 6 accounts' },
    { label: 'In flight', value: '41', sub: 'ideas, drafts and posts' },
    { label: 'Awaiting approval', value: '7', sub: '3 with clients', tone: C.amber },
    { label: 'Published this quarter', value: '86', sub: 'blog + social', tone: C.green },
  ]);

  s += t(CX, TOPBAR + 138, 'Campaigns', { size: 14, weight: 600, serif: true });
  s += t(CX + CW, TOPBAR + 138, 'Filter: All accounts  ·  Sort: Next publish', {
    size: 10.5,
    fill: C.faint,
    anchor: 'end',
  });

  const rows = [
    ['Summer cooling season', 'NA', 'Northgate Air', 'May – Aug', 0.78, '14 / 18', 'Sep 02 · 09:00', 'On track', 'published'],
    ['Wedding season 2026', 'BS', 'Bloom Studio', 'Feb – Sep', 0.62, '13 / 21', 'Sep 03 · 08:00', 'On track', 'published'],
    ['Q3 product launch', 'LA', 'Lumen Analytics', 'Jul – Sep', 0.41, '7 / 17', 'Sep 04 · 09:00', 'Needs drafts', 'review'],
    ['Implants awareness', 'HD', 'Harbor Dental', 'Q3', 0.85, '11 / 13', 'Sep 05 · 09:00', 'On track', 'published'],
    ['Autumn maintenance plans', 'NA', 'Northgate Air', 'Sep – Nov', 0.22, '4 / 18', 'Sep 09 · 09:00', 'Behind', 'accent'],
    ['Always-on thought leadership', 'LA', 'Lumen Analytics', 'Rolling', 0.55, '22 / 40', 'Sep 10 · 08:00', 'On track', 'published'],
  ];

  const y0 = TOPBAR + 152;
  s += rect(CX, y0, CW, 38 + rows.length * 62, { r: 10, fill: C.white, stroke: C.rule });
  const colX = [CX + 18, CX + 330, CX + 470, CX + 700, CX + 862];
  ['Campaign', 'Account', 'Progress', 'Next publish', 'Status'].forEach((c, i) => {
    s += t(colX[i], y0 + 24, c.toUpperCase(), { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
  });
  s += line(CX, y0 + 38, CX + CW, y0 + 38, C.rule);

  rows.forEach(([name, ini, account, window, pct, ratio, next, status, tone], i) => {
    const ry = y0 + 38 + i * 62;
    if (i) s += line(CX + 18, ry, CX + CW - 18, ry, C.ruleSoft);
    if (i === 0) s += rect(CX + 1, ry + 1, CW - 2, 60, { r: 0, fill: C.accentSoft, opacity: 0.45 });
    s += t(colX[0], ry + 27, name, { size: 12.5, weight: 550 });
    s += t(colX[0], ry + 43, window, { size: 9.5, mono: true, fill: C.faint });
    s += avatar(colX[1], ry + 19, ini, i % 2 ? C.schedSoft : C.accentSoft, i % 2 ? C.sched : C.accentStrong, 11);
    s += t(colX[1] + 30, ry + 31, account, { size: 11, fill: C.muted });
    s += rect(colX[2], ry + 24, 190, 8, { r: 4, fill: C.cream });
    s += rect(colX[2], ry + 24, 190 * pct, 8, { r: 4, fill: pct > 0.7 ? C.green : pct > 0.4 ? C.sched : C.amber });
    s += t(colX[2], ry + 46, ratio + ' pieces done', { size: 9.5, mono: true, fill: C.faint });
    s += t(colX[3], ry + 31, next, { size: 11, mono: true, fill: C.sched });
    s += pill(colX[4], ry + 20, status, tone);
  });

  const fy = y0 + 38 + rows.length * 62 + 18;
  const stagesRow = [
    ['Ideas captured', '31', C.faint],
    ['Drafting', '12', C.muted],
    ['Awaiting approval', '7', C.amber],
    ['Scheduled', '18', C.sched],
    ['Published this quarter', '86', C.green],
  ];
  const sw = (CW - 4 * 14) / 5;
  stagesRow.forEach(([label, value, tone], i) => {
    const x = CX + i * (sw + 14);
    s += rect(x, fy, sw, 70, { r: 10, fill: C.white, stroke: C.rule });
    s += rect(x, fy, 3, 70, { r: 2, fill: tone });
    s += t(x + 18, fy + 30, value, { size: 21, weight: 600, serif: true, fill: tone });
    s += t(x + 18, fy + 50, label, { size: 10, fill: C.subtle });
    if (i < 4) {
      s += `<path d="M${x + sw + 3} ${fy + 35} h7 m0 0 -2.8 -2.8 m2.8 2.8 -2.8 2.8" stroke="${C.faint}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });

  return frame('campaigns', 'ContentLineup — Campaigns', s, WS.meridian);
};

// ---------------------------------------------------------------------------
// ACCOUNTS — every brand and client in one view
// ---------------------------------------------------------------------------
const accounts = () => {
  let s = topbar('Accounts', 'Meridian Collective · 5 brands · one login', 'Add account');

  const items = [
    ['NA', 'Northgate Air', 'HVAC · Phoenix, AZ', ['LinkedIn', 'Facebook', 'Instagram'], '6', '2', 'Sep 02 · 09:00', C.accentSoft, C.accentStrong],
    ['BS', 'Bloom Studio', 'Florist · Portland, OR', ['Instagram', 'Facebook'], '5', '1', 'Sep 03 · 08:00', C.schedSoft, C.sched],
    ['HD', 'Harbor Dental', 'Dental practice · Boston, MA', ['Facebook', 'LinkedIn'], '4', '0', 'Sep 05 · 09:00', C.greenSoft, C.green],
    ['LA', 'Lumen Analytics', 'B2B SaaS · remote', ['LinkedIn'], '9', '3', 'Sep 04 · 09:00', C.cream, C.muted],
    ['MC', 'Meridian house brand', 'Agency · own marketing', ['LinkedIn', 'Instagram'], '3', '1', 'Sep 11 · 10:00', C.amberSoft, C.amber],
  ];

  const y0 = TOPBAR + 26;
  const cols = 3;
  const cardW = (CW - 2 * 16) / cols;
  const cardH = 290;

  items.forEach((it, i) => {
    const [ini, name, kind, chans, sched, waiting, next, bg, fg] = it;
    const x = CX + (i % cols) * (cardW + 16);
    const y = y0 + Math.floor(i / cols) * (cardH + 16);
    s += rect(x, y, cardW, cardH, { r: 12, fill: C.white, stroke: C.rule });
    s += avatar(x + 18, y + 18, ini, bg, fg, 17);
    s += t(x + 62, y + 34, name, { size: 13.5, weight: 600, serif: true });
    s += t(x + 62, y + 49, kind, { size: 10, fill: C.faint });
    s += line(x + 18, y + 70, x + cardW - 18, y + 70, C.ruleSoft);

    s += t(x + 18, y + 90, 'CHANNELS', { size: 8, weight: 700, fill: C.faint, spacing: 0.7 });
    let chx = x + 18;
    chans.forEach((c) => {
      const w = c.length * 5.9 + 18;
      s += rect(chx, y + 98, w, 20, { r: 10, fill: C.paper, stroke: C.rule });
      s += t(chx + 9, y + 112, c, { size: 9.5, weight: 500, fill: C.subtle });
      chx += w + 6;
    });

    s += t(x + 18, y + 142, sched, { size: 20, weight: 600, serif: true, fill: C.sched });
    s += t(x + 18, y + 157, 'scheduled', { size: 9.5, fill: C.faint });
    s += t(x + 108, y + 142, waiting, { size: 20, weight: 600, serif: true, fill: waiting === '0' ? C.faint : C.amber });
    s += t(x + 108, y + 157, 'awaiting approval', { size: 9.5, fill: C.faint });

    s += rect(x + 18, y + 172, cardW - 36, 28, { r: 7, fill: C.paper });
    s += t(x + 30, y + 190, 'Next out  ' + next, { size: 10, mono: true, fill: C.sched });

    s += t(x + 18, y + 220, 'NEXT UP', { size: 8, weight: 700, fill: C.faint, spacing: 0.7 });
    const upcoming = [
      [['Summer AC maintenance tips', 'Blog · Tue'], ['Filter checklist carousel', 'Instagram · Thu']],
      [['Choosing a wedding florist', 'Blog · Wed'], ['Behind the arch', 'Instagram · Fri']],
      [['Are implants worth it?', 'Blog · Mon'], ['Implant myths, answered', 'Facebook · Wed']],
      [['Onboarding: 3 weeks to 3 days', 'Blog · Thu'], ['Launch announcement', 'LinkedIn · Mon']],
      [['How we brief 12 clients', 'Blog · Fri'], ['Retainer margin post', 'LinkedIn · Tue']],
    ][i];
    upcoming.forEach(([title, when], k) => {
      const uy = y + 232 + k * 24;
      s += `<circle cx="${x + 22}" cy="${uy + 8}" r="3" fill="${k ? C.faint : C.sched}"/>`;
      const short = title.length > 26 ? title.slice(0, 25) + '…' : title;
      s += t(x + 32, uy + 11, short, { size: 10.5, fill: C.muted });
      s += t(x + cardW - 18, uy + 11, when, { size: 9.5, mono: true, fill: C.faint, anchor: 'end' });
    });
  });

  // cross-account week strip
  const sy = y0 + 2 * (cardH + 16);
  s += rect(CX + 2 * (cardW + 16), y0 + cardH + 16, cardW, cardH, { r: 12, fill: C.accentSoft });
  s += t(CX + 2 * (cardW + 16) + 20, y0 + cardH + 48, 'This week, everywhere', {
    size: 13.5,
    weight: 600,
    serif: true,
    fill: C.accentStrong,
  });
  const week = [
    ['Mon', '2 posts', 'Harbor Dental, Lumen'],
    ['Tue', '3 posts', 'Northgate Air ×2, Bloom'],
    ['Wed', '1 post', 'Bloom Studio'],
    ['Thu', '3 posts', 'Lumen ×2, Northgate Air'],
    ['Fri', '2 posts', 'Bloom Studio, Meridian'],
    ['Sat', '1 post', 'Northgate Air'],
  ];
  week.forEach(([d, n, who], i) => {
    const wy = y0 + cardH + 68 + i * 32;
    s += t(CX + 2 * (cardW + 16) + 20, wy + 14, d, { size: 10.5, weight: 700, mono: true, fill: C.accentStrong });
    s += t(CX + 2 * (cardW + 16) + 58, wy + 14, n, { size: 10.5, weight: 600, fill: C.accentStrong });
    s += t(CX + 2 * (cardW + 16) + 116, wy + 14, who, { size: 10, fill: C.accentStrong, opacity: 0.8 });
  });
  s += t(CX + 2 * (cardW + 16) + 20, y0 + cardH + 200, 'Open the shared calendar →', {
    size: 10.5,
    weight: 600,
    fill: C.accentStrong,
  });

  s += rect(CX, sy, CW, 44, { r: 10, fill: C.white, stroke: C.rule });
  s += t(CX + 18, sy + 28, 'Accounts are isolated at the data layer — a member of one cannot read another.', {
    size: 11,
    fill: C.subtle,
  });
  s += t(CX + CW - 18, sy + 28, 'Up to 25 accounts on Agency', {
    size: 10.5,
    weight: 600,
    fill: C.sched,
    anchor: 'end',
  });

  return frame('accounts', 'ContentLineup — Accounts', s, WS.meridian);
};

// ---------------------------------------------------------------------------
// EDITOR — write it yourself, or ask the AI; revisions are a conversation
// ---------------------------------------------------------------------------
const editor = () => {
  let s = topbar('Editor', 'Bloom Studio · Wedding season 2026 · draft', 'Save & schedule');

  const y0 = TOPBAR + 22;
  const docW = CW * 0.615;
  const px = CX + docW + 16;
  const pw = CW - docW - 16;

  /* ---- mode toggle: AI or manual, and the AI is not compulsory ----
     Type through this whole screen is sized for the tour frame, which shows the
     full 1240px board inside ~664px — a 0.54 fit scale. Everything here is set
     roughly 1.4x its natural size so it survives that reduction; the containers
     are sized to the enlarged text rather than the other way round. */
  s += rect(CX, y0, docW, 44, { r: 10, fill: C.white, stroke: C.rule });
  s += rect(CX + 8, y0 + 8, 156, 30, { r: 7, fill: C.accent });
  s += t(CX + 86, y0 + 28, 'Generate with AI', { size: 14.5, weight: 700, fill: C.white, anchor: 'middle' });
  s += t(CX + 250, y0 + 28, 'Write manually', { size: 14.5, weight: 600, fill: C.subtle, anchor: 'middle' });
  s += t(CX + docW - 16, y0 + 28, 'Draft · autosaved 12s ago', { size: 12, mono: true, fill: C.faint, anchor: 'end' });

  /* ---- the document ---- */
  const dy0 = y0 + 56;
  s += rect(CX, dy0, docW, H - dy0 - 26, { r: 10, fill: C.white, stroke: C.rule });
  const dx = CX + 26;
  const dw = docW - 52;

  s += t(dx, dy0 + 40, 'How to Choose a Wedding Florist:', { size: 23, weight: 700, serif: true, spacing: -0.4 });
  s += t(dx, dy0 + 70, '9 Questions to Ask First', { size: 23, weight: 700, serif: true, spacing: -0.4 });
  s += t(dx, dy0 + 96, 'choosing a wedding florist  ·  1,480 words  ·  6 sections', {
    size: 12,
    weight: 500,
    mono: true,
    fill: C.accentStrong,
  });
  s += line(CX, dy0 + 112, CX + docW, dy0 + 112, C.ruleSoft);

  // the section currently being revised
  s += rect(dx - 12, dy0 + 124, dw + 24, 108, { r: 8, fill: C.accentSoft, opacity: 0.55 });
  s += rect(dx - 12, dy0 + 124, 3, 108, { r: 2, fill: C.accent });
  s += t(dx, dy0 + 148, 'Introduction', { size: 12, weight: 700, mono: true, fill: C.accentStrong, spacing: 0.6 });
  s += t(dx, dy0 + 172, 'Most couples book a florist before they know what to ask.', {
    size: 15.5,
    weight: 650,
  });
  s += t(dx, dy0 + 194, 'These nine questions decide whether the flowers survive the day —', { size: 15.5, weight: 550, fill: C.muted });
  s += t(dx, dy0 + 216, 'and whether the quote you signed is the one you pay.', { size: 15.5, weight: 550, fill: C.muted });

  // rest of the document, rendered as structure
  let by = dy0 + 254;
  const para = (widths) => {
    for (const w of widths) {
      s += rect(dx, by, dw * w, 8, { r: 4, fill: C.cream });
      by += 16;
    }
    by += 10;
  };
  s += t(dx, by, 'H2   What does “full service” actually include?', { size: 15, weight: 700, fill: C.ink });
  by += 24;
  para([0.97, 0.93, 0.99, 0.55]);

  // an inline image with its generated alt text
  s += rect(dx, by, dw, 78, { r: 8, fill: C.peach });
  s += `<path d="M${dx} ${by + 58} l${dw * 0.26} -23 l${dw * 0.2} 13 l${dw * 0.24} -19 l${dw * 0.3} 29 Z" fill="${C.ink}" opacity="0.12"/>`;
  s += `<circle cx="${dx + dw - 46}" cy="${by + 24}" r="15" fill="${C.white}" opacity="0.55"/>`;
  s += rect(dx + 10, by + 52, 200, 22, { r: 11, fill: C.white, opacity: 0.92 });
  s += t(dx + 22, by + 67, 'alt text written · 1 of 4', { size: 11, weight: 500, mono: true, fill: C.muted });
  // Clear of the image, not tucked against it — the heading below is the start
  // of a new section, so it needs the gap to read as one.
  by += 106;

  s += t(dx, by, 'H2   Nine questions to ask at the first meeting', { size: 15, weight: 700, fill: C.ink });
  by += 24;
  para([0.95, 0.88]);

  s += rect(dx, by, dw, 94, { r: 8, fill: C.paper, stroke: C.rule });
  s += t(dx + 16, by + 24, 'FAQ BLOCK · 4 questions', { size: 11, weight: 700, mono: true, fill: C.faint, spacing: 0.6 });
  ['H3  How far ahead should we book?', 'H3  What happens if a flower is out of season?'].forEach((q, k) => {
    s += t(dx + 16, by + 50 + k * 22, q, { size: 13, weight: 650, fill: C.subtle });
  });

  /* ---- AI assist rail ---- */
  s += rect(px, y0, pw, H - y0 - 26, { r: 10, fill: C.white, stroke: C.rule });
  s += t(px + 20, y0 + 32, 'AI assist', { size: 16.5, weight: 700, serif: true });
  s += t(px + 20, y0 + 54, 'Scoped to the selected section', { size: 12.5, weight: 500, fill: C.faint });
  s += pill(px + pw - 92, y0 + 14, 'Optional', 'draft');
  s += line(px, y0 + 70, px + pw, y0 + 70, C.ruleSoft);

  s += t(px + 20, y0 + 96, 'SELECTED', { size: 10.5, weight: 700, fill: C.faint, spacing: 0.7 });
  s += rect(px + 20, y0 + 104, pw - 40, 38, { r: 7, fill: C.accentSoft });
  s += t(px + 32, y0 + 128, 'Introduction', { size: 14, weight: 700, fill: C.accentStrong });

  s += t(px + 20, y0 + 172, 'ASK FOR A CHANGE', { size: 10.5, weight: 700, fill: C.faint, spacing: 0.7 });
  const asks = ['Make the introduction shorter.', 'Open with the direct answer.', 'Add a comparison table.', 'Rewrite for a first-time buyer.'];
  asks.forEach((a, i) => {
    const ay = y0 + 182 + i * 42;
    s += rect(px + 20, ay, pw - 40, 36, { r: 7, fill: i === 0 ? C.ink : C.paper, stroke: i === 0 ? 'none' : C.rule });
    s += t(px + 32, ay + 23, a, { size: 13.5, weight: i === 0 ? 700 : 550, fill: i === 0 ? C.white : C.subtle });
  });

  s += rect(px + 20, y0 + 356, pw - 40, 42, { r: 7, fill: C.white, stroke: C.rule });
  s += t(px + 32, y0 + 383, 'Or type an instruction…', { size: 13, weight: 500, fill: C.faint });

  s += t(px + 20, y0 + 428, 'APPLIED', { size: 10.5, weight: 700, fill: C.faint, spacing: 0.7 });
  const applied = [
    ['Make the introduction shorter.', 'Introduction · just now'],
    ['Add a supplier cost table.', 'Section 3 · 6 min ago'],
    ['Use “stems” not “florals”.', 'Whole draft · 14 min ago'],
  ];
  applied.forEach(([txt, meta], i) => {
    const ay = y0 + 438 + i * 56;
    s += rect(px + 20, ay, pw - 40, 48, { r: 7, fill: C.paper, stroke: C.rule });
    s += `<g transform="translate(${px + 32} ${ay + 15}) scale(0.78)" stroke="${C.green}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m2 8.5 4 4 8-9"/></g>`;
    s += t(px + 58, ay + 21, txt, { size: 13, weight: 650, fill: C.muted });
    s += t(px + 58, ay + 38, meta, { size: 11, weight: 500, mono: true, fill: C.faint });
  });

  s += line(px, H - 96, px + pw, H - 96, C.ruleSoft);
  s += t(px + 20, H - 74, 'Every version is kept. Roll back any time.', { size: 12.5, weight: 500, fill: C.faint });
  s += rect(px + 20, H - 66, pw - 40, 38, { r: 8, fill: C.accent });
  s += t(px + pw / 2, H - 41, 'Send for approval', { size: 14.5, weight: 700, fill: C.white, anchor: 'middle' });

  return frame('editor', 'ContentLineup — Editor', s, WS.bloom);
};

// ---------------------------------------------------------------------------
// PUBLISHING — the log of what went out, where, and when
// ---------------------------------------------------------------------------
const publishing = () => {
  let s = topbar('Publishing', 'Live log · all accounts · last 30 days', 'Export log');

  s += stats(TOPBAR + 26, [
    { label: 'Published, 30 days', value: '86', sub: 'blog + social', tone: C.green },
    { label: 'Channels connected', value: '11', sub: 'across 5 accounts' },
    { label: 'Needs attention', value: '1', sub: 'expired token', tone: C.accent },
    { label: 'On time', value: '100%', sub: 'of scheduled slots', tone: C.sched, mono: true },
  ]);

  const y0 = TOPBAR + 138;
  s += t(CX, y0, 'Publishing log', { size: 14, weight: 600, serif: true });
  s += t(CX + CW, y0, 'Timezone: America/Phoenix  ·  newest first', {
    size: 10.5,
    mono: true,
    fill: C.faint,
    anchor: 'end',
  });

  const rows = [
    ['2026-09-05 09:00', 'How often should you service an HVAC system?', 'Northgate Air', 'Blog', 'Published', 'published', 'northgateair.com/blog/hvac-service…'],
    ['2026-09-05 09:00', 'How often should you service an HVAC…', 'Northgate Air', 'LinkedIn', 'Published', 'published', 'linkedin.com/company/northgate-air…'],
    ['2026-09-05 09:00', 'How often should you service an HVAC…', 'Northgate Air', 'Facebook', 'Published', 'published', 'facebook.com/northgateair/posts…'],
    ['2026-09-04 09:00', 'Onboarding: three weeks to three days', 'Lumen Analytics', 'LinkedIn', 'Published', 'published', 'linkedin.com/company/lumen…'],
    ['2026-09-03 08:00', 'Seasonal stem guide — September', 'Bloom Studio', 'Instagram', 'Retry sent', 'review', 'token refreshed · retried 08:04'],
    ['2026-09-02 09:00', 'Winter HVAC maintenance checklist', 'Northgate Air', 'Blog', 'Published', 'published', 'northgateair.com/blog/winter-check…'],
    ['2026-09-01 10:00', 'Are dental implants worth it?', 'Harbor Dental', 'Facebook', 'Published', 'published', 'facebook.com/harbordental/posts…'],
  ];

  const ty = y0 + 16;
  s += rect(CX, ty, CW, 38 + rows.length * 46, { r: 10, fill: C.white, stroke: C.rule });
  const colX = [CX + 18, CX + 176, CX + 500, CX + 640, CX + 760, CX + 880];
  ['Published at', 'Content', 'Account', 'Channel', 'Result', 'Where it landed'].forEach((c, i) => {
    s += t(colX[i], ty + 24, c.toUpperCase(), { size: 8.5, weight: 700, fill: C.faint, spacing: 0.7 });
  });
  s += line(CX, ty + 38, CX + CW, ty + 38, C.rule);

  rows.forEach(([when, title, account, channel, result, tone, url], i) => {
    const ry = ty + 38 + i * 46;
    if (i) s += line(CX + 18, ry, CX + CW - 18, ry, C.ruleSoft);
    if (tone === 'review') s += rect(CX + 1, ry + 1, CW - 2, 44, { r: 0, fill: C.amberSoft, opacity: 0.55 });
    s += t(colX[0], ry + 28, when, { size: 10.5, mono: true, fill: tone === 'review' ? C.amber : C.sched });
    const short = title.length > 42 ? title.slice(0, 41) + '…' : title;
    s += t(colX[1], ry + 28, short, { size: 11.5, weight: 550 });
    s += t(colX[2], ry + 28, account, { size: 11, fill: C.muted });
    s += t(colX[3], ry + 28, channel, { size: 11, mono: true, fill: C.subtle });
    s += pill(colX[4], ry + 18, result, tone);
    s += t(colX[5], ry + 28, url, { size: 10, mono: true, fill: tone === 'review' ? C.amber : C.accent });
  });

  const fy = ty + 38 + rows.length * 46 + 16;
  s += rect(CX, fy, CW, 46, { r: 10, fill: C.schedSoft });
  s += t(CX + 20, fy + 21, 'Coming soon: WordPress and Payload CMS publishing', {
    size: 11.5,
    weight: 600,
    fill: C.sched,
  });
  s += t(CX + 20, fy + 36, 'Live today: LinkedIn, Facebook, Instagram, publishing webhooks and the REST API.', {
    size: 10,
    fill: C.sched,
  });

  const cy = fy + 60;
  s += t(CX, cy, 'By channel, last 30 days', { size: 12.5, weight: 600 });
  const chans = [
    ['LinkedIn', 31, 0.86, C.sched],
    ['Facebook', 24, 0.67, C.accent],
    ['Instagram', 19, 0.53, C.amber],
    ['Blog (export / API)', 12, 0.33, C.green],
  ];
  const bw = (CW - 3 * 14) / 4;
  chans.forEach(([name, n, pct, tone], i) => {
    const x = CX + i * (bw + 14);
    s += rect(x, cy + 12, bw, 62, { r: 10, fill: C.white, stroke: C.rule });
    s += t(x + 16, cy + 34, name, { size: 11, weight: 550 });
    s += t(x + bw - 16, cy + 34, String(n), { size: 12, weight: 600, mono: true, fill: tone, anchor: 'end' });
    s += rect(x + 16, cy + 46, bw - 32, 7, { r: 4, fill: C.cream });
    s += rect(x + 16, cy + 46, (bw - 32) * pct, 7, { r: 4, fill: tone });
    s += t(x + 16, cy + 66, 'posts published', { size: 9, fill: C.faint });
  });

  return frame('publishing', 'ContentLineup — Publishing log', s, WS.meridian);
};

export const renderers = {
  ideas,
  campaigns,
  editor,
  calendar,
  approvals,
  publishing,
  accounts,
  plans,
  list,
  social,
  library,
  strategy,
  settings,
};
export const renderScreen = (id) => renderers[id]();
