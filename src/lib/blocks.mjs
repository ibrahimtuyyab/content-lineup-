// Reusable page sections, shared between the homepage and the deeper pages.
import {
  esc,
  icon,
  btn,
  sectionHead,
  eyebrow,
  ctaRow,
  soonChip,
  faqAccordion,
} from './html.mjs';
import { screenSrc } from './screens.mjs';
import {
  steps,
  features,
  socialPlatforms,
  keyModes,
  niches,
  integrations,
  integrationGroups,
  comparison,
  plans,
  workflowCompare,
  screens,
  cta,
  site,
} from '../data/site.mjs';

const kindIcon = { write: 'pen', schedule: 'calendar', ai: 'spark', trust: 'shield' };

/* ---------------------------------------------------------------------------
   Hero publishing queue
--------------------------------------------------------------------------- */
const QUEUE_ROWS = [
  { name: 'Winter HVAC maintenance checklist', kw: 'hvac winter checklist', when: 'Sep 02 · 09:00', state: 'published' },
  { name: 'How often should you service an HVAC system?', kw: 'hvac service frequency', when: 'Sep 05 · 09:00', state: 'scheduled' },
  { name: 'Heat pump vs furnace in a dry climate', kw: 'heat pump vs furnace', when: 'Sep 09 · 09:00', state: 'scheduled' },
  { name: 'What a full system tune-up includes', kw: 'hvac tune up cost', when: 'Sep 12 · 09:00', state: 'draft' },
  { name: 'Signs your ducts are leaking air', kw: 'leaking air ducts', when: 'Sep 16 · 09:00', state: 'draft' },
];

// Recycled briefs for the hero animation: "title::target keyword", so the
// keyword line stays consistent with the headline when a row cycles back to Draft.
const QUEUE_POOL = [
  'Autumn filter replacement guide::when to change hvac filter',
  'Smart thermostat payback period::smart thermostat savings',
  'Why your upstairs never cools properly::upstairs too hot',
  'Choosing an air filter MERV rating::merv rating explained',
  'Refrigerant leak warning signs::refrigerant leak signs',
  'Is your system too big for the house?::oversized hvac system',
];

export const publishingQueue = () => `
<div class="queue" id="queue" data-pool="${esc(QUEUE_POOL.join('|'))}" role="img"
     aria-label="An animated publishing queue showing five articles moving through Draft, Scheduled and Published states.">
  <div class="queue-head">
    <span class="queue-title">${icon('calendar')} Publishing queue</span>
    <span class="queue-clock"><span class="dot"></span><span id="queue-clock">09:00 local</span></span>
  </div>
  <div class="queue-rows">
    ${QUEUE_ROWS.map(
      (r) => `
    <div class="q-row" data-state="${r.state}">
      <div class="q-main">
        <div class="q-name">${esc(r.name)}</div>
        <div class="q-meta"><span class="q-kw">${esc(r.kw)}</span><span>·</span><span>${esc(r.when)}</span></div>
      </div>
      <span class="q-state"><span class="tick"></span><span class="q-state-label">${
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
   Manual vs automated workflow
--------------------------------------------------------------------------- */
const compareCol = (data, tone) => `
<div class="compare-col ${tone}">
  <h3>${esc(data.title)}</h3>
  <div class="compare-total">
    <b>${esc(data.total)}</b><span>${esc(data.unit)}</span>
  </div>
  <ul class="compare-rows">
    ${data.rows
      .map(
        (r) =>
          `<li><span>${esc(r.label)}</span><span class="t ${
            r.time === 'automatic' ? 'auto' : ''
          }">${esc(r.time)}</span></li>`
      )
      .join('')}
  </ul>
</div>`;

export const workflowSection = () => `
<section class="sec sec-paper" id="workflow">
  <div class="wrap">
    ${sectionHead({
      kicker: 'The problem',
      title: 'Publishing one article is a six-step job.<br>It should be one.',
      lead:
        'Nothing about writing a blog post is hard on its own. It is the stack of small steps — research, draft, edit, images, alt text, meta, slug, remembering to hit publish — that quietly eats a working day per article, and why most content calendars die in month three.',
    })}
    <div class="compare-two reveal">
      ${compareCol(workflowCompare.manual, 'bad')}
      <div class="compare-vs">versus</div>
      ${compareCol(workflowCompare.automated, 'good')}
    </div>
    <p class="compare-note reveal">${esc(workflowCompare.note)}</p>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   How it works
--------------------------------------------------------------------------- */
export const stepsSection = ({ heading = true } = {}) => `
<section class="sec" id="how-it-works">
  <div class="wrap">
    ${
      heading
        ? sectionHead({
            kicker: 'How it works',
            title: 'Four steps, then it runs without you.',
            lead:
              'Describe the topic, review the draft, and pick a date. Everything between those points — structure, images, alt text, meta, slug, and the publish itself — happens on its own.',
          })
        : ''
    }
    <div class="steps reveal-stagger">
      ${steps
        .map(
          (s) => `
      <article class="step">
        <span class="step-n">STEP ${s.n}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </article>`
        )
        .join('')}
    </div>
    <div class="cta-row reveal" style="margin-top:32px">
      ${btn('See the full walkthrough', '/how-it-works', 'secondary', true)}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   Features grid
--------------------------------------------------------------------------- */
export const featuresSection = () => `
<section class="sec sec-cream" id="features">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Features',
      title: 'Everything the job needs, in one queue.',
      lead:
        'The writing, the images, the SEO fields, and the schedule are one workflow — not four tools with copy-paste between them. Three more are on the roadmap and labelled honestly below.',
    })}
    <div class="grid g-3 reveal-stagger">
      ${features
        .map(
          (f) => `
      <article class="card feat">
        <div class="card-head">
          <span class="card-icon ${f.kind === 'schedule' ? 'sched' : f.kind === 'trust' ? 'trust' : ''}">${icon(
            kindIcon[f.kind] || 'spark'
          )}</span>
          ${f.soon ? soonChip() : ''}
        </div>
        <h3>${esc(f.name)}</h3>
        <p>${esc(f.short)}</p>
      </article>`
        )
        .join('')}
    </div>
    <div class="cta-row reveal" style="margin-top:32px">
      ${btn('Every feature in detail', '/features', 'secondary', true)}
    </div>
  </div>
</section>`;

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
   Made For tabs
--------------------------------------------------------------------------- */
export const nicheTabs = () => `
<section class="sec sec-paper" id="made-for">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Made for',
      title: 'Built for the people who have to publish anyway.',
      lead:
        'The problem looks different depending on who you are. Pick the one that sounds like your week.',
    })}
    <div data-tabs class="reveal">
      <div class="tabs-bar" role="tablist" aria-label="Audience">
        ${niches
          .map(
            (n, i) => `
        <button class="tab-btn" role="tab" id="tab-${n.id}" aria-controls="panel-${n.id}"
                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(n.label)}</button>`
          )
          .join('')}
      </div>
      <div class="tab-panels">
        ${niches
          .map(
            (n, i) => `
        <div class="tab-panel" role="tabpanel" id="panel-${n.id}" aria-labelledby="tab-${n.id}" ${
              i === 0 ? '' : 'hidden'
            }>
          <div class="niche-body">
            <div>
              <h3>${esc(n.headline)}</h3>
              <div class="niche-pair">
                <h4>The problem</h4>
                <p>${esc(n.problem)}</p>
              </div>
              <div class="niche-pair sched">
                <h4>With ContentLineup</h4>
                <p>${esc(n.solution)}</p>
              </div>
            </div>
            <div class="niche-side">
              ${n.stats
                .map((s) => `<div class="niche-stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)
                .join('')}
              <div class="niche-example"><b>What it writes</b>${esc(n.example)}</div>
            </div>
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
    <div class="cta-row reveal" style="margin-top:28px">
      ${btn('Read the full breakdown', '/made-for', 'secondary', true)}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   Social distribution
--------------------------------------------------------------------------- */
export const socialSection = () => `
<section class="sec sec-paper" id="social">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Social distribution',
      title: 'Publishing an article is half the job. The other half is telling people.',
      lead:
        'ContentLineup posts to LinkedIn, Facebook and Instagram from the same queue that publishes your articles — automatically when a post goes live, or on its own schedule when you just want to post something.',
    })}

    <div class="grid g-3 reveal-stagger">
      ${socialPlatforms
        .map(
          (p) => `
      <article class="card social-card">
        <div class="card-head">
          <span class="card-icon social ${p.id}">${icon(p.id)}</span>
          <span class="chip chip-live">Live</span>
        </div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <p class="social-best"><strong>Best for:</strong> ${esc(p.best)}</p>
        <p class="social-detail">${esc(p.detail)}</p>
      </article>`
        )
        .join('')}
    </div>

    <div class="shot-split reveal" style="margin-top:clamp(36px,5vw,60px)">
      <div class="shot-split-text">
        ${eyebrow('Two ways to post', 'sched')}
        <h3 class="block-title">Auto-share on publish, or write a post on its own</h3>
        <p class="lead">
          Turn auto-share on and every article that goes live takes its promo posts with it —
          written per channel, not the same headline pasted three times. Or open the composer
          and schedule a standalone post for Tuesday morning. Both run through the same
          Draft &rarr; Scheduled &rarr; Published queue, with the same approval gate.
        </p>
        <ul class="check-list">
          <li>${icon('check')}<span>A post written for each channel, with the featured image attached</span></li>
          <li>${icon('check')}<span>Standalone posts scheduled to the minute, article or no article</span></li>
          <li>${icon('check')}<span>Review before anything goes out — the approval gate covers social too</span></li>
          <li>${icon('check')}<span>Switch off any channel per post without touching the others</span></li>
        </ul>
        <div class="cta-row" style="margin-top:24px">
          ${btn('See all integrations', '/integrations', 'secondary', true)}
        </div>
      </div>
      ${shot('social')}
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

export const integrationsSection = () => `
<section class="sec" id="integrations">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Integrations',
      title: 'Connects to the model you want and the places your content goes.',
      lead:
        'Two AI providers, an image source, and a set of clean exits for your content. Nothing here is a lock-in point.',
    })}
    <div class="grid g-3 reveal-stagger">
      ${integrations.filter((i) => i.status === 'live').slice(0, 9).map(integrationCard).join('')}
    </div>
    <div class="cta-row reveal" style="margin-top:32px">
      ${btn('All integrations', '/integrations', 'secondary', true)}
    </div>
  </div>
</section>`;

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
export const planCards = () => `
<div class="plans reveal-stagger">
  ${plans
    .map(
      (p) => `
  <article class="plan ${p.featured ? 'featured' : ''}">
    <span class="plan-kicker">${esc(p.kicker)}</span>
    <h3>${esc(p.name)}</h3>
    <div class="plan-price"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
    <p class="plan-sum">${esc(p.summary)}</p>
    <a class="btn ${p.featured ? 'btn-primary' : 'btn-secondary'}" href="${p.cta.href}">${esc(p.cta.label)}</a>
    <ul class="plan-inc">
      ${p.includes.map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}
    </ul>
    <p class="plan-limits"><strong>Limits:</strong> ${esc(p.limits)}</p>
  </article>`
    )
    .join('')}
</div>`;

export const pricingSummary = () => `
<section class="sec sec-cream" id="pricing">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Pricing',
      title: 'Free on your own key. $29 if you would rather not have one.',
      lead:
        'There is no feature gate between the free plan and the paid ones. What you pay for is whose API key does the generating, and how many articles a month that covers.',
      align: 'center',
    })}
    <div class="grid g-3 reveal-stagger">
      ${plans
        .map(
          (p) => `
      <article class="card">
        <div class="card-head">
          <h3>${esc(p.name)}</h3>
          <span class="chip ${p.featured ? 'chip-accent' : ''}">${esc(p.kicker)}</span>
        </div>
        <div class="plan-price" style="margin:14px 0 10px"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
        <p>${esc(p.summary)}</p>
      </article>`
        )
        .join('')}
    </div>
    <div class="cta-row center reveal" style="margin-top:32px">
      ${btn('Compare plans in full', '/pricing', 'secondary', true)}
      ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   Trust strip
--------------------------------------------------------------------------- */
export const trustStrip = () => `
<section class="sec-tight sec-paper">
  <div class="wrap">
    <h2 class="sr-only">Why teams trust ContentLineup</h2>
    <div class="grid g-4 reveal-stagger">
      ${[
        ['lock', 'Keys encrypted at rest', 'AES-256, write-only, never shown again after saving.'],
        ['export', 'No lock-in', 'Markdown, HTML, and spreadsheet export. Always.'],
        ['shield', 'Your content, your copyright', 'We do not train models on anything you write here.'],
        ['share', 'Publishes and shares itself', 'Article goes live, LinkedIn, Facebook and Instagram follow.'],
      ]
        .map(
          ([g, t, d]) => `
      <div class="trust-item">
        ${icon(g)}
        <div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`;

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
export const faqSection = (items, { title, lead, kicker = 'FAQ', link = true } = {}) => `
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
            'Read all 24 questions',
            '/faq',
            'secondary',
            true
          )}</div>`
        : ''
    }
  </div>
</section>`;
