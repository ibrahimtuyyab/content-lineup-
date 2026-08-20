// Editorial diagrams — the artwork that carries the pages the product screens
// do not reach: about, contact, FAQ, pricing, security and integrations.
//
// These are siblings of src/lib/screens.mjs, not app renderings. A screen shows
// what the product looks like; a diagram here shows how something *works*, and
// each one is drawn to explain the single claim its section is making.
//
// They are inlined into the page rather than referenced as <img>, for one
// reason: an SVG inside an <img> is a closed document that page CSS cannot
// reach, and the self-drawing stroke animation is the whole point. Every stroke
// meant to animate carries pathLength="1", so one CSS rule animates a 40px
// connector and a 700px spine at exactly the same rate.
import { C, SANS, SERIF, MONO } from './screens.mjs';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ atoms */

const t = (x, y, str, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.mono ? MONO : o.serif ? SERIF : SANS}" font-size="${
    o.size || 12
  }" font-weight="${o.weight || 400}" fill="${o.fill || C.ink}"${
    o.anchor ? ` text-anchor="${o.anchor}"` : ''
  }${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}>${esc(str)}</text>`;

const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 10}" fill="${o.fill || C.white}"${
    o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''
  }${o.opacity ? ` opacity="${o.opacity}"` : ''}/>`;

/** A stroke that draws itself when the figure scrolls into view. */
const draw = (d, o = {}) =>
  `<path class="art-draw" pathLength="1" d="${d}" fill="none" stroke="${o.stroke || C.rule}" stroke-width="${
    o.sw || 1.5
  }" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` data-dash="${o.dash}"` : ''} style="--art-i:${
    o.i || 0
  }"/>`;

/** A node that fades up in sequence with the strokes. */
const node = (inner, i = 0) => `<g class="art-pop" style="--art-i:${i}">${inner}</g>`;

const label = (x, y, str, o = {}) =>
  t(x, y, str.toUpperCase(), { size: 8.5, weight: 700, fill: o.fill || C.faint, spacing: 0.8, ...o });

const pill = (x, y, text, tone = 'accent') => {
  const map = {
    accent: [C.accentSoft, C.accentStrong],
    green: [C.greenSoft, C.green],
    sched: [C.schedSoft, C.sched],
    amber: [C.amberSoft, C.amber],
    cream: [C.cream, C.muted],
  };
  const [bg, fg] = map[tone] || map.accent;
  const w = text.length * 6.2 + 20;
  return rect(x, y, w, 22, { r: 11, fill: bg }) + t(x + 10, y + 15, text, { size: 10.5, weight: 600, fill: fg, mono: true });
};

/**
 * The figure wrapper. `viewBox` drives the aspect ratio; the SVG scales to the
 * column it sits in, so nothing here is sized in page pixels.
 */
const figure = (id, title, vb, inner, o = {}) => `
<figure class="art reveal ${o.cls || ''}" data-art="${id}">
  <div class="art-frame">
    <div class="art-canvas" tabindex="0" role="group" aria-label="${esc(title)} — scrollable diagram">
      <svg viewBox="${vb}" role="img" aria-labelledby="art-${id}-t" font-family="${SANS}" preserveAspectRatio="xMidYMid meet">
        <title id="art-${id}-t">${esc(title)}</title>
        ${inner}
      </svg>
    </div>
  </div>
  ${o.caption ? `<figcaption>${o.caption}</figcaption>` : ''}
</figure>`;

/* ============================================================ 01 — FAQ
   The five-stage spine. The FAQ answers questions about a workflow, so the
   workflow itself belongs on the page the questions are asked on. */
const workflowSpine = () => {
  const stages = [
    ['Idea', 'captured', C.accent],
    ['Generate', 'or write it', C.accent],
    ['Calendar', 'dated', C.sched],
    ['Approve', 'signed off', C.amber],
    ['Publish', 'live', C.green],
  ];
  const W = 900;
  const M = 90;
  const y = 116;
  const gate = 3; // Approve — the stage whose label is the gate itself
  const gap = (W - M * 2) / (stages.length - 1);

  let s = '';
  s += label(20, 34, 'one idea, five stages');
  // The spine draws first, left to right, then each stop pops in behind it.
  s += draw(`M ${M} ${y} H ${M + gap * 4}`, { stroke: C.rule, sw: 2, i: 0 });

  stages.forEach(([name, sub, tone], i) => {
    const x = M + gap * i;
    s += node(
      `<circle cx="${x}" cy="${y}" r="17" fill="${C.white}" stroke="${tone}" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y}" r="6" fill="${tone}"/>` +
        t(x, y - 34, name, { size: 15, weight: 600, serif: true, anchor: 'middle' }) +
        // The gate stage gets a pill instead of a caption, so the connector
        // below has clear space to run through.
        (i === gate ? '' : t(x, y + 42, sub, { size: 10.5, fill: C.subtle, anchor: 'middle', mono: true })),
      i + 1
    );
  });

  // The gate: nothing passes Approve without a person.
  const gx = M + gap * gate;
  s += draw(`M ${gx} ${y + 20} V ${y + 40}`, { stroke: C.amber, sw: 1.5, i: 6 });
  s += node(
    rect(gx - 68, y + 40, 136, 26, { r: 13, fill: C.amberSoft }) +
      t(gx, y + 57, 'a person says yes', { size: 10.5, weight: 600, fill: C.amber, anchor: 'middle' }),
    6
  );

  return figure(
    'workflow-spine',
    'The five stages an idea moves through: captured, generated or written, dated on the calendar, approved by a person, then published.',
    `0 0 ${W} ${y + 90}`,
    s
  );
};

/* ==================================================== 02 — Integrations
   One idea, written once, arriving in the right shape on each channel. */
const channelFlow = () => {
  const rows = [
    ['LinkedIn', 'company page · 812 chars', 'Live', 'green'],
    ['Facebook', 'page post · link preview', 'Live', 'green'],
    ['Instagram', 'feed post · no link in caption', 'Live', 'green'],
    ['Your blog', 'markdown, HTML, webhook, API', 'Live', 'green'],
    ['WordPress', 'native connector', 'Coming soon', 'cream'],
    ['Payload CMS', 'native connector', 'Coming soon', 'cream'],
  ];
  const W = 900;
  const rowH = 54;
  const top = 44;
  const rx = 372;
  const rw = 470;
  const srcY = top + (rows.length * rowH) / 2 - 12;

  let s = '';

  // Source card
  s += node(
    rect(40, srcY - 40, 250, 108, { r: 14, fill: C.white, stroke: C.rule }) +
      label(60, srcY - 18, 'the idea') +
      t(60, srcY + 6, 'Summer AC', { size: 17, weight: 600, serif: true }) +
      t(60, srcY + 26, 'maintenance tips', { size: 17, weight: 600, serif: true }) +
      pill(60, srcY + 38, 'Northgate Air', 'accent'),
    0
  );

  rows.forEach(([name, sub, status, tone], i) => {
    const y = top + i * rowH;
    const midY = y + rowH / 2 - 4;
    // A curve from the source card out to each channel row.
    s += draw(`M 296 ${srcY + 4} C ${330} ${srcY + 4}, ${336} ${midY}, ${rx - 8} ${midY}`, {
      stroke: tone === 'green' ? C.peach : C.ruleSoft,
      sw: 1.5,
      i: i + 1,
    });
    s += node(
      rect(rx, y, rw, rowH - 10, { r: 10, fill: C.white, stroke: C.rule }) +
        t(rx + 18, midY - 2, name, { size: 12.5, weight: 600 }) +
        t(rx + 18, midY + 13, sub, { size: 10, fill: C.subtle }) +
        pill(rx + rw - (status.length * 6.2 + 20) - 16, midY - 12, status, tone),
      i + 1
    );
  });

  return figure(
    'channel-flow',
    'One captured idea fanning out to LinkedIn, Facebook, Instagram and your blog, all live, with WordPress and Payload CMS connectors marked coming soon.',
    `0 0 ${W} ${top + rows.length * rowH + 20}`,
    s
  );
};

/* ======================================================== 03 — Security
   What actually happens to a key between pasting it and using it. */
const keyHandling = () => {
  const W = 900;
  const M = 22; // side margin
  const y = 76;
  const steps = [
    ['You paste it', 'over TLS', C.ink],
    ['Encrypted', 'AES-256, at rest', C.accent],
    ['Decrypted in memory', 'only to sign one request', C.sched],
    ['Your provider', 'called directly', C.green],
  ];
  const gap = 52;
  // Solve the width from the frame rather than hand-tuning it, so a fifth step
  // could be added without the last card falling off the right edge.
  const bw = (W - M * 2 - gap * (steps.length - 1)) / steps.length;

  let s = '';
  steps.forEach(([name, sub, tone], i) => {
    const x = M + i * (bw + gap);
    s += node(
      rect(x, y - 44, bw, 90, { r: 14, fill: C.white, stroke: i === 1 ? C.peach : C.rule, sw: i === 1 ? 1.5 : 1 }) +
        `<circle cx="${x + 26}" cy="${y - 18}" r="13" fill="${i === 1 ? C.accentSoft : C.paper}"/>` +
        t(x + 26, y - 14, String(i + 1), { size: 11, weight: 700, fill: tone, anchor: 'middle', mono: true }) +
        t(x + 16, y + 12, name, { size: 12.5, weight: 600 }) +
        t(x + 16, y + 30, sub, { size: 10, fill: C.subtle }),
      i
    );
    if (i < steps.length - 1) {
      const ax = x + bw;
      s += draw(`M ${ax + 12} ${y} H ${ax + gap - 14} m -7 -5 l 7 5 l -7 5`, { stroke: C.faint, sw: 1.5, i: i + 1 });
    }
  });

  // The three things that never happen, stated as flatly as the steps above.
  const nevers = ['never written to a log', 'never shown again after saving', 'never pooled between accounts'];
  s += draw(`M ${M} ${y + 74} H ${W - M}`, { stroke: C.ruleSoft, sw: 1, i: 4 });
  const nw = (W - M * 2) / 3;
  nevers.forEach((n, i) => {
    const x = M + i * nw;
    s += node(
      `<path d="M ${x} ${y + 104} l 5 5 l 9 -11" fill="none" stroke="${C.green}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
        t(x + 24, y + 109, n, { size: 11.5, fill: C.muted }),
      i + 5
    );
  });

  return figure(
    'key-handling',
    'The life of an API key: pasted over TLS, encrypted with AES-256 at rest, decrypted in memory only to sign a single request, then sent to your provider — never logged, never shown again, never pooled.',
    `0 0 ${W} ${y + 132}`,
    s
  );
};

/* ========================================================= 04 — Pricing
   Where the money actually goes, at the volume the plans are priced for. */
const valueMeter = () => {
  const W = 900;
  const rows = [
    ['Writing it by hand', '4h 40m', 'per article', 1, C.cream, C.muted],
    ['With ContentLineup', '12m', 'per article', 0.043, C.accentSoft, C.accentStrong],
  ];
  const barX = 300;
  const barW = 520;

  let s = '';
  s += label(40, 34, 'time per 1,500-word article');

  rows.forEach(([name, big, sub, frac, bg, fg], i) => {
    const y = 58 + i * 88;
    s += node(
      t(40, y + 26, name, { size: 13, weight: 600 }) + t(40, y + 44, sub, { size: 10.5, fill: C.subtle, mono: true }),
      i
    );
    s += rect(barX, y + 6, barW, 44, { r: 10, fill: C.paper, stroke: C.ruleSoft });
    // The fill is the measurement — it grows from nothing when the figure lands.
    s += `<g class="art-bar" style="--art-i:${i + 1};--art-w:${frac}">
      <rect x="${barX}" y="${y + 6}" width="${barW}" height="44" rx="10" fill="${bg}"/>
    </g>`;
    // A bar too short to hold its own label gets the label just outside it —
    // the 12m bar is 22px wide, and text centred in it would sit on the track.
    const inside = frac * barW > 90;
    s += node(
      t(inside ? barX + 16 : barX + frac * barW + 14, y + 34, big, {
        size: 20,
        weight: 600,
        serif: true,
        fill: fg,
      }),
      i + 2
    );
  });

  s += draw(`M 40 246 H ${W - 40}`, { stroke: C.ruleSoft, sw: 1, i: 3 });
  s += node(
    t(40, 272, 'The plans are priced against the gap, not the word count.', {
      size: 12,
      fill: C.muted,
    }),
    4
  );
  s += node(pill(W - 236, 256, '40 posts / month on Team', 'sched'), 4);

  return figure(
    'value-meter',
    'A bar chart comparing 4 hours 40 minutes to write an article by hand against 12 minutes with ContentLineup.',
    `0 0 ${W} 296`,
    s,
    { caption: 'Our own benchmark across 40 articles of 1,400–1,800 words, measured against a solo marketer writing the same briefs by hand. Review time varies with how much you edit.' }
  );
};

/* =========================================================== 05 — About
   How the product gets decided, which is the only thing an about page on a
   two-person product has that a reader cannot get anywhere else. */
const howWeWork = () => {
  const W = 900;
  const cards = [
    ['Ship the workflow, not the demo', 'A feature lands when it survives a real content month, not when it screenshots well.', C.accent],
    ['Say what is not built', 'Roadmap items are labelled coming soon on this site, in the docs and in the app.', C.sched],
    ['No lock-in as a feature', 'Markdown, HTML and spreadsheet export exist so leaving is cheap. That keeps us honest.', C.green],
  ];
  const cw = 276;
  const gap = 16;

  let s = '';
  s += draw(`M 20 44 H ${W - 20}`, { stroke: C.ruleSoft, sw: 1, i: 0 });
  s += label(20, 30, 'how we decide what to build');

  cards.forEach(([title, body, tone], i) => {
    const x = 20 + i * (cw + gap);
    const words = body.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > 34) {
        lines.push(line.trim());
        line = w;
      } else line += ' ' + w;
    }
    lines.push(line.trim());

    s += node(
      rect(x, 66, cw, 168, { r: 14, fill: C.white, stroke: C.rule }) +
        `<rect x="${x}" y="66" width="${cw}" height="4" rx="2" fill="${tone}"/>` +
        t(x + 20, 104, String(i + 1).padStart(2, '0'), { size: 10.5, weight: 700, fill: tone, mono: true }) +
        title
          .split(', ')
          .map((seg, k) => t(x + 20, 134 + k * 22, seg + (k === 0 && title.includes(', ') ? ',' : ''), { size: 15, weight: 600, serif: true }))
          .join('') +
        lines.map((l, k) => t(x + 20, 178 + k * 16, l, { size: 10.8, fill: C.subtle })).join(''),
      i + 1
    );
  });

  return figure(
    'how-we-work',
    'Three working principles: ship the workflow rather than the demo, say plainly what is not built, and treat export and no lock-in as a feature.',
    `0 0 ${W} 252`,
    s
  );
};

/* ========================================================= 06 — Contact
   What happens after you send the message, which is the only thing a contact
   page is actually asked. */
const supportPanel = () => {
  const W = 900;
  // Every timing here restates a commitment already made in the page copy —
  // a diagram that invents a faster SLA than the paragraph beside it is worse
  // than no diagram.
  const lanes = [
    ['Support', 'not working, billing, or stuck in setup', 'usually same day', 'accent'],
    ['Security', 'subject line “Security” — triaged first', '2 business days', 'sched'],
    ['Feedback', 'the roadmap is mostly built from these', 'read by the builder', 'green'],
    ['Agencies & volume', 'past what the Agency plan covers', 'answered directly', 'amber'],
  ];

  let s = '';
  s += label(20, 30, 'what happens after you send it');
  s += draw(`M 20 44 H ${W - 20}`, { stroke: C.ruleSoft, sw: 1, i: 0 });

  lanes.forEach(([name, detail, timing, tone], i) => {
    const y = 62 + i * 58;
    const pw = timing.length * 6.2 + 20;
    s += node(
      rect(20, y, W - 40, 48, { r: 12, fill: C.white, stroke: C.rule }) +
        `<circle cx="46" cy="${y + 24}" r="6" fill="${
          { accent: C.accent, sched: C.sched, green: C.green, amber: C.amber }[tone]
        }"/>` +
        t(70, y + 21, name, { size: 12.5, weight: 600 }) +
        t(70, y + 37, detail, { size: 10.5, fill: C.subtle }) +
        pill(W - 40 - pw, y + 13, timing, tone),
      i + 1
    );
  });

  s += node(
    t(20, 320, 'One inbox, read by a person. There is no tier-one script to get past.', {
      size: 12,
      fill: C.muted,
    }),
    5
  );

  return figure(
    'support-panel',
    'Four contact lanes — support usually answered the same day, security disclosures acknowledged within two business days, feedback read by the person who builds the product, and agency questions answered directly.',
    `0 0 ${W} 340`,
    s
  );
};

/* ------------------------------------------------------------------ export */
export const artworks = {
  'workflow-spine': workflowSpine,
  'channel-flow': channelFlow,
  'key-handling': keyHandling,
  'value-meter': valueMeter,
  'how-we-work': howWeWork,
  'support-panel': supportPanel,
};

export const art = (id) => {
  const render = artworks[id];
  if (!render) throw new Error(`Unknown artwork: ${id}`);
  return render();
};
