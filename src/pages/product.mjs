import {
  page,
  abs,
  esc,
  icon,
  btn,
  sectionHead,
  eyebrow,
  finalCta,
  soonChip,
  faqAccordion,
  faqSchema,
  softwareSchema,
  breadcrumbs,
  breadcrumbSchema,
} from '../lib/html.mjs';
import { relatedFor } from '../data/links.mjs';
import {
  relatedLinks,
  shot,
  shotSplit,
  comparisonTable,
  planCards,
  integrationsFull,
  keyModesSection,
  publishingQueue,
} from '../lib/blocks.mjs';
import {
  site,
  cta,
  features,
  steps,
  plans,
  pricingFaqs,
  screens,
  screenOrder,
  integrations,
  comparison,
  workflowCompare,
} from '../data/site.mjs';
import { posts } from '../data/content.mjs';

const pageHero = ({ kicker, title, lead, crumbs, extra = '' }) => `
<section class="page-hero">
  <div class="wrap">
    <div class="page-hero-inner">
      ${crumbs ? breadcrumbs(crumbs) : ''}
      ${kicker ? eyebrow(kicker) : ''}
      <h1>${title}</h1>
      <p class="lead">${lead}</p>
      ${extra}
    </div>
  </div>
</section>`;

/* ==========================================================================
   /features
   ========================================================================== */
export function featuresPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
  ];
  const body = `
${pageHero({
  crumbs,
  kicker: 'Features',
  title: 'Everything between “I should write about that” and “it is live.”',
  lead:
    'ContentLineup is one workflow, not a writing tool plus an image tool plus a scheduler. Below is every feature, what it actually does, and the screen it lives on — including the three still labelled Coming Soon.',
  extra: `<div class="cta-row" style="margin-top:26px">${btn(
    cta.primary.label,
    cta.primary.href,
    'primary',
    true
  )}${btn('See pricing', '/pricing', 'secondary')}</div>`,
})}

<section class="sec">
  <div class="wrap">
    ${features
      .filter((f) => !f.soon)
      .map((f, i) =>
        shotSplit({
          id: f.screen,
          kicker: `Feature ${String(i + 1).padStart(2, '0')}`,
          title: f.name,
          body: f.body,
          bullets: f.bullets,
          flip: i % 2 === 1,
        })
      )
      .join('')}
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Roadmap',
      title: 'Three features we have not shipped yet.',
      lead:
        'These are labelled Coming Soon everywhere on this site, and they stay labelled that way until they work. If one of them is the reason you are evaluating ContentLineup, that is worth knowing now rather than after signing up.',
    })}
    <div class="grid g-3 reveal-stagger">
      ${features
        .filter((f) => f.soon)
        .map(
          (f) => `
      <article class="card">
        <div class="card-head">
          <span class="card-icon ${f.kind === 'schedule' ? 'sched' : ''}">${icon(
            f.kind === 'schedule' ? 'calendar' : 'pen'
          )}</span>
          ${soonChip()}
        </div>
        <h3>${esc(f.name)}</h3>
        <p>${esc(f.body)}</p>
        <ul class="check-list" style="margin-top:16px">
          ${f.bullets.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}
        </ul>
      </article>`
        )
        .join('')}
    </div>
    <p class="compare-note reveal">
      Current status on each is published in the
      <a href="/resources/product-updates/product-update-august-2026" style="color:var(--accent)">August 2026 product update</a>.
    </p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'The workspace',
      title: 'Every screen in the app.',
      lead:
        'Plans, Ideas, Calendar, List, Approvals, Library, Strategy, and Settings. One sidebar, one queue, no context switching.',
    })}
    <div class="grid g-2 reveal-stagger">
      ${screenOrder.map((id) => shot(id)).join('')}
    </div>
  </div>
</section>

${relatedLinks(relatedFor['features'].title, relatedFor['features'].links)}
${keyModesSection()}
${finalCta()}`;

  return page({
    path: '/features',
    ogImage: '/og/features.png',
    title: 'Features — AI Writing, Images & Scheduling | ContentLineup',
    description:
      'Outline-first AI drafts, auto-matched images with alt text, generated SEO meta, per-post scheduling, chat-style revisions, and managed or BYO API keys.',
    body,
    schema: [softwareSchema(plans), breadcrumbSchema(crumbs, '/features')],
  });
}

/* ==========================================================================
   /how-it-works
   ========================================================================== */
export function howItWorksPage() {
  const faqs = [
    {
      q: 'How long does the whole process take for one article?',
      a: 'About twelve minutes of your time: two minutes to brief the topic, roughly eight to review and revise the draft, and two to set the publish date. Generation, image matching, alt text, and the SEO fields happen in between without you.',
    },
    {
      q: 'Do I have to review every article before it publishes?',
      a: 'You do not have to, but we would recommend it — no AI tool produces a publish-ready expert article with zero human input. If a client or an editor needs to sign off, the approval gate makes review a required step rather than an optional one.',
    },
    {
      q: 'What happens if I am offline when a post is scheduled?',
      a: 'Nothing changes. Publishing runs on our infrastructure, not in your browser. Being offline, asleep, or on holiday has no effect on the queue.',
    },
  ];

  const body = `
${pageHero({
  kicker: 'How it works',
  title: 'Four steps. Then it runs without you.',
  lead:
    'The whole workflow, screen by screen — from a one-line brief to an article that publishes itself on a Thursday morning while you are doing something else.',
  crumbs: [
    { label: 'Home', href: '/' },
    { label: 'How it works', href: '/how-it-works' },
  ],
})}

<section class="sec">
  <div class="wrap">
    ${steps
      .map((s, i) =>
        shotSplit({
          id: s.screen,
          anchor: 'step-' + s.n,
          kicker: `Step ${s.n}`,
          title: s.title,
          body: s.body,
          bullets: s.detail,
          flip: i % 2 === 1,
        })
      )
      .join('')}
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    ${sectionHead({
      kicker: 'What it saves',
      title: 'Five hours of assembly, or twelve minutes of judgement.',
      lead:
        'The work does not disappear — the mechanical part of it does. What is left is the part that needs you: deciding the angle, and checking the things a model cannot know.',
      align: 'center',
    })}
    <div class="compare-two reveal">
      <div class="compare-col bad">
        <h3>${esc(workflowCompare.manual.title)}</h3>
        <div class="compare-total"><b>${esc(workflowCompare.manual.total)}</b><span>${esc(
    workflowCompare.manual.unit
  )}</span></div>
        <ul class="compare-rows">
          ${workflowCompare.manual.rows
            .map((r) => `<li><span>${esc(r.label)}</span><span class="t">${esc(r.time)}</span></li>`)
            .join('')}
        </ul>
      </div>
      <div class="compare-vs">versus</div>
      <div class="compare-col good">
        <h3>${esc(workflowCompare.automated.title)}</h3>
        <div class="compare-total"><b>${esc(workflowCompare.automated.total)}</b><span>${esc(
    workflowCompare.automated.unit
  )}</span></div>
        <ul class="compare-rows">
          ${workflowCompare.automated.rows
            .map(
              (r) =>
                `<li><span>${esc(r.label)}</span><span class="t ${
                  r.time === 'automatic' ? 'auto' : ''
                }">${esc(r.time)}</span></li>`
            )
            .join('')}
        </ul>
      </div>
    </div>
    <p class="compare-note reveal">${esc(workflowCompare.note)}</p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="shot-split reveal">
      <div class="shot-split-text">
        ${eyebrow('The result', 'sched')}
        <h3>A queue that publishes whether or not you show up</h3>
        <p class="lead">
          Once articles are scheduled, the queue is the product. Each one carries its own timestamp,
          moves Draft &rarr; Scheduled &rarr; Published on its own, and does it from our servers —
          so a holiday, a busy quarter, or a laptop that never gets opened changes nothing.
        </p>
        <div class="cta-row" style="margin-top:24px">
          ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
        </div>
      </div>
      ${publishingQueue()}
    </div>
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({ kicker: 'FAQ', title: 'Questions about the workflow' })}
    ${faqAccordion(faqs, 'hiw')}
  </div>
</section>

${relatedLinks(relatedFor['how-it-works'].title, relatedFor['how-it-works'].links)}

${finalCta()}`;

  return page({
    path: '/how-it-works',
    title: 'How It Works — Brief to Scheduled Post | ContentLineup',
    description:
      'Describe the topic, AI writes the structured article, images are matched with alt text, and the post publishes on the date and time you pick.',
    body,
    schema: [
      {
        '@type': 'HowTo',
        '@id': site.origin + '/how-it-works#howto',
        name: 'How to publish an SEO-ready article on a schedule with ContentLineup',
        description:
          'Describe the topic, let AI write the structured article, get images matched automatically, and set the date it publishes and shares itself.',
        totalTime: 'PT12M',
        supply: [{ '@type': 'HowToSupply', name: 'A topic and a target keyword' }],
        tool: [{ '@type': 'HowToTool', name: 'ContentLineup' }],
        step: steps.map((st, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: st.title,
          text: st.body,
          url: site.origin + '/how-it-works#step-' + st.n,
          image: abs('/screens/' + st.screen + '.svg'),
        })),
      },
      faqSchema(faqs),
      breadcrumbSchema(
        [
          { label: 'Home', href: '/' },
          { label: 'How it works', href: '/how-it-works' },
        ],
        '/how-it-works'
      ),
    ],
  });
}

/* ==========================================================================
   /integrations
   ========================================================================== */
export function integrationsPage() {
  const live = integrations.filter((i) => i.status === 'live').length;
  const soon = integrations.filter((i) => i.status === 'soon').length;

  const body = `
${pageHero({
  kicker: 'Integrations',
  title: 'Connects to the model you choose, and lets your content leave freely.',
  lead: `${live} integrations live today and ${soon} in development. Two of them are AI providers you can bring your own key for; several of the rest exist specifically so nothing you make here is trapped.`,
  crumbs: [
    { label: 'Home', href: '/' },
    { label: 'Integrations', href: '/integrations' },
  ],
})}

<section class="sec">
  <div class="wrap">
    ${integrationsFull()}
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    <div class="shot-split reveal">
      <div class="shot-split-text">
        ${eyebrow('Exports')}
        <h3>The integrations that matter most are the exits</h3>
        <p class="lead">
          Markdown, HTML, and a spreadsheet of the entire content plan. Images download with the articles.
          There is no proprietary format, no export fee, and a cancelled account keeps read and export access
          to everything it made.
        </p>
        <ul class="check-list">
          <li>${icon('check')}<span>Any article as clean Markdown or publish-ready HTML</span></li>
          <li>${icon('check')}<span>The whole content plan as a spreadsheet — topics, keywords, dates, statuses</span></li>
          <li>${icon('check')}<span>Publishing webhooks and a REST API for your own systems</span></li>
          <li>${icon('check')}<span>Copyright in everything generated stays with you</span></li>
        </ul>
        <div class="cta-row" style="margin-top:24px">
          ${btn('How we handle your data', '/security', 'secondary', true)}
        </div>
      </div>
      ${shot('settings')}
    </div>
  </div>
</section>

${relatedLinks(relatedFor['integrations'].title, relatedFor['integrations'].links)}

${finalCta()}`;

  return page({
    path: '/integrations',
    title: 'Integrations — OpenAI, Gemini & Exports | ContentLineup',
    description:
      'Connect OpenAI or Gemini (or use our managed key), match images from Unsplash, and export to Markdown, HTML, spreadsheets, webhooks and a REST API.',
    body,
    schema: [
      breadcrumbSchema(
        [
          { label: 'Home', href: '/' },
          { label: 'Integrations', href: '/integrations' },
        ],
        '/integrations'
      ),
    ],
  });
}

/* ==========================================================================
   /pricing
   ========================================================================== */
export function pricingPage() {
  const body = `
${pageHero({
  kicker: 'Pricing',
  title: 'Free on your own key. $29 if you would rather not have one.',
  lead:
    'There is no feature gate between the free plan and the paid ones. What you are choosing is whose API key signs the request — and therefore who gets the bill for the tokens.',
  crumbs: [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
  ],
})}

<section class="sec">
  <div class="wrap">
    <h2 class="sr-only">Plans and pricing</h2>
    ${planCards()}
    <p class="compare-note reveal" style="text-align:center;margin-inline:auto">
      All plans include every feature. Paid plans are monthly, cancel in one click, and keep read and export
      access to your library afterwards.
    </p>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Which one',
      title: 'How to pick in thirty seconds',
      lead: 'The decision is almost always about volume and whether you want to manage a provider account.',
    })}
    <div class="table-scroll reveal">
      <table class="cmp">
        <thead>
          <tr>
            <th scope="col">If this is you</th>
            <th scope="col" class="us">Pick</th>
            <th scope="col">Because</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="dim">You have never used an AI API and do not want to start</th>
            <td class="us"><strong>Managed key — $29</strong></td>
            <td>Nothing to configure. Sign up and write.</td>
          </tr>
          <tr>
            <th scope="row" class="dim">You already have an OpenAI or Gemini key</th>
            <td class="us"><strong>Bring your own key — $0</strong></td>
            <td>Every feature, no article cap, you pay your provider at cost.</td>
          </tr>
          <tr>
            <th scope="row" class="dim">You publish more than about 40 articles a month</th>
            <td class="us"><strong>Bring your own key — $0</strong></td>
            <td>Per-token pricing beats a flat allowance at that volume.</td>
          </tr>
          <tr>
            <th scope="row" class="dim">You run content for several clients</th>
            <td class="us"><strong>Agency — $89</strong></td>
            <td>Unlimited workspaces, 15 seats, per-client voice and approvals.</td>
          </tr>
          <tr>
            <th scope="row" class="dim">You want to try it before deciding anything</th>
            <td class="us"><strong>Bring your own key — $0</strong></td>
            <td>Free forever, no card. Switch to managed later if you prefer.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'What BYO actually costs',
      title: 'A worked example on your own key',
      lead:
        'The most common question about the free plan is what the provider bill looks like. Here is a real shape of it, using the Northgate Air case study numbers.',
    })}
    <div class="grid g-3 reveal-stagger">
      <article class="card">
        <span class="card-icon">${icon('pen')}</span>
        <h3>8 articles / month</h3>
        <p>Around <strong>$3.10–$4.40</strong> a month in OpenAI API usage, including revisions. That is the actual bill from the case study, on a mid-tier model at 1,400–1,800 words per article.</p>
      </article>
      <article class="card">
        <span class="card-icon sched">${icon('layers')}</span>
        <h3>40 articles / month</h3>
        <p>Roughly <strong>$16–$22</strong> in provider usage — still under the $29 managed plan, which is why higher-volume teams tend to bring their own key.</p>
      </article>
      <article class="card">
        <span class="card-icon trust">${icon('shield')}</span>
        <h3>Spend control</h3>
        <p>You set hard spend limits in your provider dashboard, so there is no scenario where a runaway job produces a surprise bill. We never see or hold your provider balance.</p>
      </article>
    </div>
    <p class="compare-note reveal">
      Figures are estimates based on current mid-tier model pricing and typical article lengths. Your exact cost depends
      on the model you choose and how much you regenerate — your provider dashboard is the authority.
    </p>
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Billing FAQ',
      title: 'Pricing and billing questions',
      lead: 'The awkward ones included. General product questions live on the <a href="/faq" style="color:var(--accent)">FAQ page</a>.',
    })}
    ${faqAccordion(pricingFaqs, 'pricing-faq')}
  </div>
</section>

${relatedLinks(relatedFor['pricing'].title, relatedFor['pricing'].links)}

${finalCta({
  title: 'Start on the free plan. Move up only if you need to.',
  lead:
    'The bring-your-own-key plan is not a trial — it is free, uncapped, and has every feature. Upgrade only when not having a provider account is worth $29 to you.',
})}`;

  return page({
    path: '/pricing',
    ogImage: '/og/pricing.png',
    title: 'Pricing — free on your own API key, $29 managed | ContentLineup',
    description:
      '$0/month forever on your own OpenAI or Gemini key with no article cap. $29/month managed, $89/month for agencies. Every feature on every plan.',
    body,
    schema: [
      softwareSchema(plans),
      faqSchema(pricingFaqs),
      breadcrumbSchema(
        [
          { label: 'Home', href: '/' },
          { label: 'Pricing', href: '/pricing' },
        ],
        '/pricing'
      ),
    ],
  });
}

/* ==========================================================================
   /why-contentlineup
   ========================================================================== */
export function whyPage() {
  const faqs = [
    {
      q: 'Is ContentLineup better than using ChatGPT directly?',
      a: 'For drafting a single piece of text, no — a general assistant is more flexible. For publishing articles on a schedule, yes, because the drafting is the part that was never the bottleneck. ContentLineup adds the outline-first structure, the section-matched images with alt text, the SEO fields, and the scheduled publish that a chat interface has no concept of.',
    },
    {
      q: 'Can I not just use a scheduler with an AI writing tool?',
      a: 'You can, and plenty of people do. The cost is the seam between them: you copy a draft out of one tool, source images somewhere else, write meta fields by hand, paste the result into a scheduler, and then write the social posts about it separately. That handoff is where the fifteen spare minutes go, and it is the specific thing ContentLineup removes — the article and its LinkedIn, Facebook and Instagram posts come out of the same queue.',
    },
    {
      q: 'What is ContentLineup genuinely worse at?',
      a: 'Breadth of social. We publish to LinkedIn, Facebook and Instagram and nothing else — no X, TikTok, YouTube or Pinterest — and we have no social inbox and no social analytics, where dedicated tools have all three. Our drag-and-drop calendar is also still on the roadmap while theirs have had years of polish. If any of that is central to your week, use a tool built for it, alongside or instead of us.',
    },
  ];

  const body = `
${pageHero({
  kicker: 'Why ContentLineup',
  title: 'The case for one workflow — and where the alternatives are genuinely better.',
  lead:
    'A fair comparison against generic AI writing tools and legacy scheduling tools. We have included the rows where we lose, because a comparison table that wins every row is not a comparison table.',
  crumbs: [
    { label: 'Home', href: '/' },
    { label: 'Why ContentLineup', href: '/why-contentlineup' },
  ],
})}

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'The argument',
      title: 'Drafting was never the bottleneck.',
      lead:
        'AI made writing a draft cheap. It did not touch the six other steps between a draft and a published post — the images, the alt text, the meta fields, the schedule, and telling anyone it exists. Those steps are where content calendars actually die. A tool that only writes has solved the part that stopped being hard.',
    })}
    <div class="grid g-3 reveal-stagger">
      <article class="card">
        <span class="card-icon">${icon('pen')}</span>
        <h3>Generic AI writing tools</h3>
        <p>Produce text. Then you source images, write alt text, write meta fields, check the keyword made it into the body, and paste the whole thing somewhere else — every single time.</p>
      </article>
      <article class="card">
        <span class="card-icon sched">${icon('calendar')}</span>
        <h3>Legacy scheduling tools</h3>
        <p>Publish reliably across many networks, with an inbox and analytics we do not match. But they assume the content already exists — and for most teams the content not existing is the actual problem.</p>
      </article>
      <article class="card">
        <span class="card-icon trust">${icon('layers')}</span>
        <h3>ContentLineup</h3>
        <p>One queue from brief to published post <em>and</em> the posts about it: structure, images, alt text, meta, slug, keyword check, a per-article publish timestamp, and auto-share to LinkedIn, Facebook and Instagram.</p>
      </article>
    </div>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Head to head',
      title: 'The full comparison',
      lead: 'Eleven dimensions, including the three where we are on the roadmap rather than shipped.',
    })}
    ${comparisonTable()}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Grounded in the actual product',
      title: 'What the unified workflow looks like',
      lead:
        'Every claim in the table above corresponds to a screen. These are the ones that carry the argument.',
    })}
    <div class="grid g-2 reveal-stagger">
      ${shot('list')}
      ${shot('approvals')}
      ${shot('strategy')}
      ${shot('settings')}
    </div>
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({ kicker: 'FAQ', title: 'The fair questions' })}
    ${faqAccordion(faqs, 'why-faq')}
    <div class="cta-row reveal" style="margin-top:26px">
      ${btn('Compare against Buffer specifically', '/compare/contentlineup-vs-buffer', 'secondary', true)}
    </div>
  </div>
</section>

${relatedLinks(relatedFor['why-contentlineup'].title, relatedFor['why-contentlineup'].links)}

${finalCta({
  title: 'One tool, one queue, one place the work lives.',
  lead:
    'Try it against whatever you use now. The free plan is uncapped, so the comparison can be a real one rather than a demo.',
})}`;

  return page({
    path: '/why-contentlineup',
    ogImage: '/og/why.png',
    title: 'Why ContentLineup — vs generic AI writers and legacy schedulers',
    description:
      'An honest comparison against generic AI writing tools and legacy schedulers across eleven dimensions — including the rows where they win.',
    body,
    schema: [
      faqSchema(faqs),
      breadcrumbSchema(
        [
          { label: 'Home', href: '/' },
          { label: 'Why ContentLineup', href: '/why-contentlineup' },
        ],
        '/why-contentlineup'
      ),
    ],
  });
}

/* ==========================================================================
   /compare/contentlineup-vs-buffer
   ========================================================================== */
