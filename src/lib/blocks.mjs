// Reusable page sections, shared between the homepage and the deeper pages.
import {
  esc,
  icon,
  btn,
  sectionHead,
  eyebrow,
  soonChip,
  faqAccordion,
} from './html.mjs';
import { screenSrc } from './screens.mjs';
import {
  keyModes,
  integrations,
  integrationGroups,
  comparison,
  plans,
  screens,
  allFaqs,
} from '../data/site.mjs';

/* ---------------------------------------------------------------------------
   Hero publishing queue
--------------------------------------------------------------------------- */
const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const QUEUE_ROWS = [
  { name: 'Summer AC maintenance tips', kw: 'Northgate Air', when: 'Sep 02 · 09:00', state: 'published' },
  { name: 'How to choose a wedding florist', kw: 'Bloom Studio', when: 'Sep 03 · 08:00', state: 'scheduled' },
  { name: 'Onboarding: 3 weeks to 3 days', kw: 'Lumen Analytics', when: 'Sep 04 · 09:00', state: 'scheduled' },
  { name: 'Are dental implants worth it?', kw: 'Harbor Dental', when: 'Sep 05 · 09:00', state: 'draft' },
  { name: 'Retainer margin post', kw: 'Meridian Collective', when: 'Sep 09 · 09:00', state: 'draft' },
];

// Recycled briefs for the animation: "title::account", so the second line stays
// consistent with the headline when a row cycles back to Draft.
const QUEUE_POOL = [
  'Filter checklist carousel::Northgate Air',
  'Seasonal stem guide::Bloom Studio',
  'Implant myths, answered::Harbor Dental',
  'Customer story: Ridgeway::Lumen Analytics',
  'What a full tune-up includes::Northgate Air',
  'Behind the arch — build video::Bloom Studio',
];

export const publishingQueue = () => `
<div class="queue" id="queue" data-pool="${esc(QUEUE_POOL.join('|'))}" role="img"
     aria-label="An animated publishing queue showing five articles moving through Draft, Scheduled and Published states.">
  <div class="queue-head">
    <span class="queue-title">${icon('calendar')} Publishing queue</span>
  </div>
  <div class="queue-rows">
    ${QUEUE_ROWS.map(
      (r) => `
    <div class="q-row" data-state="${r.state}">
      <span class="brand-av" aria-hidden="true">${esc(initials(r.kw))}</span>
      <div class="q-main">
        <div class="q-name">${esc(r.name)}</div>
        <div class="q-meta"><span class="q-kw">${esc(r.kw)}</span><span>·</span><span>${esc(r.when)}</span></div>
      </div>
      <span class="state state-${r.state}"><span class="tick"></span><span class="q-state-label">${
        r.state.charAt(0).toUpperCase() + r.state.slice(1)
      }</span></span>
    </div>`
    ).join('')}
  </div>
  <div class="queue-foot">
    <span>Queue runs on our servers, not your browser.</span>
    <span class="queue-progress"><span id="queue-bar" style="width:20%"></span></span>
  </div>
</div>`;

/* ---------------------------------------------------------------------------
   Managed vs BYO key
--------------------------------------------------------------------------- */
export const keyModesSection = () => `
<section class="sec" id="keys">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Managed key or your own',
      title: 'Two ways to pay for the AI. Pick either, switch whenever.',
      lead:
        'The generation pipeline is identical in both modes. The only thing that changes is whose API key signs the request — and therefore who gets the bill.',
    })}
    <div class="keys-two reveal-stagger">
      ${keyModes
        .map(
          (k) => `
      <article class="key-card ${k.id}">
        <span class="chip ${k.id === 'managed' ? 'chip-accent' : 'chip-sched'}">${esc(k.kicker)}</span>
        <h3>${esc(k.label)}</h3>
        <p class="key-summary">${esc(k.summary)}</p>
        <ul class="key-points">
          ${k.points.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}
        </ul>
        <p class="key-best"><strong>${esc(k.best)}</strong></p>
        <p class="key-caveat">${esc(k.caveat)}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   Integrations
--------------------------------------------------------------------------- */
export const integrationCard = (i) => `
<article class="intg">
  <span class="intg-icon">${icon(i.glyph)}</span>
  <div>
    <h3>${esc(i.name)} ${i.status === 'soon' ? soonChip() : ''}</h3>
    <p>${esc(i.desc)}</p>
  </div>
</article>`;

export const integrationsFull = () => `
${integrationGroups
  .map((g) => {
    const items = integrations.filter((i) => i.group === g);
    if (!items.length) return '';
    return `
  <h2 class="group-title reveal">${esc(g)}</h2>
  <div class="grid g-3 reveal-stagger">${items.map(integrationCard).join('')}</div>`;
  })
  .join('')}`;

/* ---------------------------------------------------------------------------
   Product screenshot blocks
--------------------------------------------------------------------------- */
export const shot = (id, { lazy = true } = {}) => {
  const s = screens[id];
  return `
<figure class="shot">
  <div class="shot-bar"><i></i><i></i><i></i><span>app.contentlineup.com / ${esc(s.title.toLowerCase())}</span></div>
  <img src="${screenSrc(id)}" alt="${esc(s.alt)}" width="1240" height="780" ${
    lazy ? 'loading="lazy" decoding="async"' : 'fetchpriority="high" decoding="async"'
  }>
  <figcaption class="shot-cap"><b>${esc(s.title)} — </b>${esc(s.caption)}</figcaption>
</figure>`;
};

/** Screenshot beside explanatory copy. */
export const shotSplit = ({
  id,
  kicker,
  title,
  body,
  bullets = [],
  flip = false,
  chip = '',
  level = 2,
  anchor = '',
}) => `
<div class="shot-split ${flip ? 'flip' : ''} feature-block reveal"${anchor ? ` id="${anchor}"` : ''}>
  <div class="shot-split-text">
    ${kicker ? eyebrow(kicker) : ''}
    <h${level} class="block-title">${esc(title)} ${chip}</h${level}>
    <p class="lead">${esc(body)}</p>
    ${
      bullets.length
        ? `<ul class="check-list">${bullets.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>`
        : ''
    }
  </div>
  ${shot(id)}
</div>`;

/* ---------------------------------------------------------------------------
   Comparison table
--------------------------------------------------------------------------- */
const CMP_ICON = { yes: 'check', no: 'cross', partial: 'dash', soon: 'clock', note: 'bolt' };
const CMP_LABEL = { yes: 'Yes', no: 'No', partial: 'Partly', soon: 'Coming soon', note: '' };

export const comparisonTable = () => `
<div class="table-scroll reveal">
  <table class="cmp">
    <caption class="sr-only">ContentLineup compared with generic AI writing tools and legacy scheduling tools</caption>
    <thead>
      <tr>
        <th scope="col">Capability</th>
        ${comparison.columns
          .map((c, i) => `<th scope="col" class="${i === 0 ? 'us' : ''}">${esc(c)}</th>`)
          .join('')}
      </tr>
    </thead>
    <tbody>
      ${comparison.rows
        .map(
          (r) => `
      <tr>
        <th scope="row" class="dim">${esc(r.dimension)}<small>${esc(r.detail)}</small></th>
        ${r.values
          .map(
            (v, i) => `
        <td class="${i === 0 ? 'us' : ''}">
          <span class="cmp-val ${v}">${v === 'note' ? '' : icon(CMP_ICON[v])}<span>${
              v === 'note' ? '' : `<strong>${CMP_LABEL[v]}</strong> — `
            }${esc(r.notes[i])}</span></span>
        </td>`
          )
          .join('')}
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</div>
<div class="cmp-fair reveal">
  <b>Where the others win</b>
  ${esc(comparison.fair)}
</div>`;

/* ---------------------------------------------------------------------------
   Pricing
--------------------------------------------------------------------------- */
/**
 * Monthly/annual switch. State lives in one place — `data-billing` on <html> —
 * so a page can show several price grids and they all move together, and CSS
 * does the swapping. With JS off the toggle simply never fires and the monthly
 * price stands, with the annual price still readable in the note underneath.
 */
export const billingToggle = () => `
<div class="bill-switch reveal">
  <div class="bill-toggle" role="group" aria-label="Billing period">
    <button type="button" class="bill-opt is-on" data-billing-set="monthly" aria-pressed="true">Monthly</button>
    <button type="button" class="bill-opt" data-billing-set="annual" aria-pressed="false">
      Annual <span class="bill-save">2 months free</span>
    </button>
  </div>
</div>`;

/** The price figure for one plan, in both billing modes. */
export const planPrice = (p) =>
  p.annual
    ? `<div class="plan-price">
    <span class="price-when for-monthly"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></span>
    <span class="price-when for-annual"><b>${esc(p.annual.perMonth)}</b><span>${esc(p.period)}</span></span>
  </div>
  <p class="bill-note for-monthly">or ${esc(p.annual.price)} a year &mdash; ${esc(p.annual.saving)}</p>
  <p class="bill-note for-annual">${esc(p.annual.price)} billed yearly &middot; ${esc(p.annual.saving)}</p>`
    : `<div class="plan-price"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
  <p class="bill-note">Free on either billing period.</p>`;

export const planCards = () => `
${billingToggle()}
<div class="plans reveal-stagger">
  ${plans
    .map(
      (p) => `
  <article class="plan ${p.featured ? 'featured' : ''}">
    <span class="plan-kicker">${esc(p.kicker)}</span>
    <h3>${esc(p.name)}</h3>
    ${planPrice(p)}
    <p class="plan-sum">${esc(p.summary)}</p>
    <a class="btn ${p.featured ? 'btn-primary' : 'btn-secondary'}" href="${p.cta.href}" data-cta="pricing-${
        p.id
      }">${esc(p.cta.label)}</a>
    <ul class="plan-inc">
      ${p.includes.map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}
    </ul>
    <p class="plan-limits"><strong>Limits:</strong> ${esc(p.limits)}</p>
  </article>`
    )
    .join('')}
</div>`;

/* ---------------------------------------------------------------------------
   Contextual internal links
--------------------------------------------------------------------------- */
/**
 * A "keep reading" band for marketing pages. Purely editorial — every link is
 * one a reader on this page might actually want next, not a link farm.
 */
export const relatedLinks = (title, links) => `
<section class="sec-tight sec-paper">
  <div class="wrap">
    <h2 class="group-title reveal">${esc(title)}</h2>
    <div class="grid g-3 reveal-stagger">
      ${links
        .map(
          (l) => `
      <a class="card link-card" href="${l.href}">
        <span class="chip">${esc(l.tag)}</span>
        <h3>${esc(l.title)}</h3>
        <p>${esc(l.blurb)}</p>
        <span class="post-more">Read it ${icon('arrow')}</span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   FAQ section wrapper
--------------------------------------------------------------------------- */
export const faqSection = (items, { title, lead, kicker = 'FAQ', link = true, after = '' } = {}) => `
<section class="sec" id="faq">
  <div class="wrap">
    ${sectionHead({
      kicker,
      title: title || 'Questions people ask before signing up',
      lead: lead || 'The short answers. The longer ones live on the FAQ page.',
    })}
    ${faqAccordion(items)}
    ${
      link
        ? `<div class="cta-row reveal" style="margin-top:26px">${btn(
            `Read all ${allFaqs.length} questions`,
            '/faq',
            'secondary',
            true
          )}</div>`
        : ''
    }
    ${after}
  </div>
</section>`;
