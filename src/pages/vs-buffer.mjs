// /compare/contentlineup-vs-buffer
//
// Kept in its own module because it is the one page where the two products
// genuinely overlap, and the comparison has to stay scrupulously fair: we do
// three channels, Buffer does a dozen plus an inbox and analytics we lack.
import {
  page,
  esc,
  icon,
  btn,
  sectionHead,
  eyebrow,
  finalCta,
  faqAccordion,
  faqSchema,
  breadcrumbs,
  breadcrumbSchema,
} from '../lib/html.mjs';
import { shot, shotSplit } from '../lib/blocks.mjs';
import { socialPlatforms } from '../data/site.mjs';

const ICON_FOR = { yes: 'check', no: 'cross', partial: 'dash', soon: 'clock' };

const cell = (verdict, note, us = false) => `
<td class="${us ? 'us' : ''}">
  <span class="cmp-val ${verdict}">${icon(ICON_FOR[verdict])}<span>${esc(note)}</span></span>
</td>`;

export default function vsBufferPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Compare', href: '/why-contentlineup' },
    { label: 'ContentLineup vs Buffer', href: '/compare/contentlineup-vs-buffer' },
  ];

  const faqs = [
    {
      q: 'Is ContentLineup a Buffer alternative?',
      a: 'For LinkedIn, Facebook and Instagram, yes — ContentLineup schedules and publishes to all three, and also writes and publishes the long-form articles Buffer has no concept of. For anything beyond those three networks it is not a replacement: Buffer covers many more platforms and has a social inbox and analytics we do not offer.',
    },
    {
      q: 'Which social platforms does ContentLineup support?',
      a: 'Three: LinkedIn, Facebook and Instagram. That is a deliberate choice rather than a roadmap gap — we would rather do the channels our customers actually use properly than list a dozen we cannot maintain. If you need X, TikTok, YouTube, Pinterest or Threads, Buffer covers them and we do not.',
    },
    {
      q: 'Can Buffer publish blog posts?',
      a: 'No. Buffer publishes to social media channels. It does not write long-form articles and does not publish to your website, so it cannot replace the article side of ContentLineup.',
    },
    {
      q: 'Should I run both?',
      a: 'Plenty of teams do, and it is a sensible setup if your social presence is broad. Run ContentLineup for articles plus the three channels it publishes to, and Buffer for the networks it covers that we do not. Nothing about the two conflicts.',
    },
    {
      q: 'Which is cheaper?',
      a: 'They price on different axes, so it depends on shape. Buffer charges per connected channel, which climbs as you add networks and clients. ContentLineup is $0/month on your own AI key with no article cap, or $29/month managed, and the three social channels are included on every plan rather than priced per channel.',
    },
  ];

  const rows = [
    ['Writes the long-form article', 'yes', 'Outline-first drafts from a one-line brief', 'no', 'You write the post; Buffer schedules it'],
    ['Publishes articles to your site', 'yes', 'Per-article publish date and time', 'no', 'Social channels only'],
    ['LinkedIn', 'yes', 'Personal profile or company page', 'yes', 'Supported, with more post types than we offer'],
    ['Facebook', 'yes', 'Pages, link and image posts', 'yes', 'Supported, including Groups'],
    ['Instagram', 'yes', 'Business/Creator feed posts', 'yes', 'Supported, including Stories and Reels'],
    ['Other networks', 'no', 'Three channels only, by design', 'yes', 'X, TikTok, YouTube, Pinterest, Threads, Bluesky and more'],
    ['Social inbox / replies', 'no', 'Not offered at all', 'yes', 'Comment and message management'],
    ['Social analytics', 'soon', 'Search Console and GA4 in development; no social analytics yet', 'yes', 'Mature per-post and per-channel reporting'],
    ['Auto-share when an article publishes', 'yes', 'Written per channel, image attached, fires on publish', 'no', 'No article to trigger from'],
    ['Images matched with alt text', 'yes', 'Featured plus inline, matched per section', 'partial', 'You attach media yourself'],
    ['SEO meta, slug, keyword check', 'yes', 'Generated and length-checked per article', 'no', 'Not applicable to social posts'],
    ['Approval workflow', 'yes', 'Covers articles and social posts', 'yes', 'Available on higher tiers'],
    ['Free tier', 'yes', '$0/mo forever on your own AI key, uncapped', 'yes', 'Free tier with channel and post limits'],
  ];

  const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="page-hero-inner">
      ${breadcrumbs(crumbs)}
      ${eyebrow('Comparison')}
      <h1>ContentLineup vs Buffer</h1>
      <p class="lead">
        These now overlap on three channels — LinkedIn, Facebook and Instagram — so this is a real
        comparison rather than a polite one. The short version: Buffer is broader at social,
        ContentLineup is the only one of the two that writes and publishes the article in the first place.
      </p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="answer-box reveal" style="max-width:52rem">
      <b>Short answer</b>
      <p><strong>Choose Buffer</strong> if social media is the whole job: it covers far more networks than
      our three, and has a social inbox and analytics we do not offer.
      <strong>Choose ContentLineup</strong> if the job is content marketing — articles that rank, published
      on a schedule, with LinkedIn, Facebook and Instagram distribution attached to them automatically.
      If your blog has not been updated in eight months while your social queue is full, Buffer is not the
      tool that is failing you.</p>
    </div>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    ${sectionHead({ kicker: 'Side by side', title: 'Where each one wins' })}
    <div class="table-scroll reveal">
      <table class="cmp">
        <caption class="sr-only">ContentLineup compared with Buffer across articles and social channels</caption>
        <thead>
          <tr>
            <th scope="col">Capability</th>
            <th scope="col" class="us">ContentLineup</th>
            <th scope="col">Buffer</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              ([dim, av, an, bv, bn]) => `
          <tr>
            <th scope="row" class="dim">${esc(dim)}</th>
            ${cell(av, an, true)}
            ${cell(bv, bn)}
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="cmp-fair reveal">
      <b>Where Buffer wins outright</b>
      Channel breadth and social depth. Buffer publishes to networks we have no plans to add, and it has a
      social inbox, community management and per-channel analytics that ContentLineup simply does not have.
      If you need to run X, TikTok or Pinterest, or reply to comments from your scheduling tool, Buffer does
      that and we do not. Its calendar is also more mature than ours — ours is still on the roadmap.
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'The three we do',
      title: 'Depth on three channels, not a logo wall',
      lead:
        'We support LinkedIn, Facebook and Instagram properly rather than listing a dozen networks at surface level. Each post is written for its channel, not the same text pushed three ways.',
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
        <p class="social-detail">${esc(p.detail)}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${shotSplit({
      id: 'social',
      kicker: 'The overlap',
      title: 'One queue for the article and the posts about it',
      body:
        'The difference is not that one schedules and the other does not — both do. It is what is in the queue. In Buffer it is a post you already wrote. In ContentLineup it is the article, its images, its SEO fields, and the LinkedIn, Facebook and Instagram posts generated from it, all moving through the same states on the same timeline.',
      bullets: [
        'Articles and social posts in one Draft → Scheduled → Published queue',
        'Auto-share fires the moment the article goes live',
        'Standalone social posts scheduled independently when you want them',
        'One approval gate covering both',
      ],
    })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ kicker: 'FAQ', title: 'ContentLineup vs Buffer questions' })}
    ${faqAccordion(faqs, 'vsb')}
    <div class="cta-row reveal" style="margin-top:26px">
      ${btn('Read the full Buffer alternatives guide', '/resources/comparisons/best-buffer-alternatives-2026', 'secondary', true)}
    </div>
  </div>
</section>

${finalCta({
  title: 'Write it, publish it, and let the channels know.',
  lead:
    'One queue from a one-line brief to a live article with its LinkedIn, Facebook and Instagram posts already out. Free forever on your own OpenAI or Gemini key.',
})}`;

  return page({
    path: '/compare/contentlineup-vs-buffer',
    ogImage: '/og/why.png',
    title: 'ContentLineup vs Buffer — articles plus social, or social only',
    description:
      'ContentLineup writes and publishes articles and posts to LinkedIn, Facebook and Instagram. Buffer covers far more networks, with an inbox and analytics we lack.',
    body,
    schema: [faqSchema(faqs), breadcrumbSchema(crumbs, '/compare/contentlineup-vs-buffer')],
  });
}
