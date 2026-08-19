import {
  page,
  esc,
  icon,
  btn,
  sectionHead,
  eyebrow,
  finalCta,
  breadcrumbs,
  breadcrumbSchema,
} from '../lib/html.mjs';
import { relatedLinks, shot } from '../lib/blocks.mjs';
import { relatedFor } from '../data/links.mjs';
import { niches, cta } from '../data/site.mjs';

const SCREEN_FOR = {
  affiliate: 'library',
  agencies: 'approvals',
  local: 'plans',
  saas: 'strategy',
  owners: 'ideas',
  'real-estate': 'calendar',
  ecommerce: 'library',
  coaches: 'list',
};

export default function madeForPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Made For', href: '/made-for' },
  ];

  const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="page-hero-inner">
      ${breadcrumbs(crumbs)}
      ${eyebrow('Made for')}
      <h1>Built for the people who have to publish anyway.</h1>
      <p class="lead">
        Eight kinds of business, eight versions of the same problem: the content is worth doing, and it is
        always the thing that gets dropped. Find yours below — each one has the specific failure mode,
        what changes, and an example of what ContentLineup would actually write for you.
      </p>
      <div class="cta-row" style="margin-top:26px">
        ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
        ${btn('See pricing', '/pricing', 'secondary')}
      </div>
    </div>
  </div>
</section>

<section class="sec-tight sec-paper">
  <div class="wrap">
    <nav aria-label="Jump to an audience">
      <ul class="filter-bar reveal" style="margin-bottom:0">
        ${niches.map((n) => `<li><a class="filter-btn" href="#${n.id}">${esc(n.label)}</a></li>`).join('')}
      </ul>
    </nav>
  </div>
</section>

${niches
  .map(
    (n, i) => `
<section class="sec ${i % 2 === 1 ? 'sec-paper' : ''}" id="${n.id}">
  <div class="wrap">
    <div class="shot-split ${i % 2 === 1 ? 'flip' : ''} reveal">
      <div class="shot-split-text">
        ${eyebrow(n.label, i % 2 === 1 ? 'sched' : '')}
        <h2 style="font-size:clamp(1.5rem,2.8vw,2.1rem);margin-bottom:18px">${esc(n.headline)}</h2>
        <div class="niche-pair">
          <h3>The problem</h3>
          <p>${esc(n.problem)}</p>
        </div>
        <div class="niche-pair sched">
          <h3>With ContentLineup</h3>
          <p>${esc(n.solution)}</p>
        </div>
        <div class="metrics" style="margin-top:24px;grid-template-columns:repeat(2,minmax(0,1fr))">
          ${n.stats
            .map(
              (s, si) =>
                `<div class="metric ${si === 1 ? 'sched' : ''}"><b>${esc(s.value)}</b><span>${esc(
                  s.label
                )}</span></div>`
            )
            .join('')}
        </div>
        ${
          n.guide
            ? `<div class="cta-row" style="margin-top:22px">${btn(
                'Read the full guide for this audience',
                n.guide,
                'secondary',
                true
              )}</div>`
            : ''
        }
      </div>
      <div>
        <div class="niche-example" style="margin-bottom:16px">
          <b>What it writes for you</b>${esc(n.example)}
        </div>
        ${shot(SCREEN_FOR[n.id] || 'list')}
      </div>
    </div>
  </div>
</section>`
  )
  .join('')}

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Not on the list?',
      title: 'The pattern is the same wherever publishing is a side job.',
      lead:
        'If your content problem is "we know what to write and it never gets written", the workflow applies whether you sell HVAC servicing, legal advice, or dog food. Brief in batches, review in short slices, and let the queue publish.',
      align: 'center',
    })}
    <div class="cta-row center reveal">
      ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
      ${btn('Talk to us first', '/contact', 'secondary')}
    </div>
  </div>
</section>

${relatedLinks(relatedFor['made-for'].title, relatedFor['made-for'].links)}

${finalCta()}`;

  return page({
    path: '/made-for',
    ogImage: '/og/made-for.png',
    title: 'Made For — Agencies, Local, SaaS & More | ContentLineup',
    description:
      'Built for affiliate sites, agencies, local business, SaaS, real estate, e-commerce and coaches — the problem each one has, and what gets published.',
    body,
    schema: [breadcrumbSchema(crumbs, '/made-for')],
  });
}
