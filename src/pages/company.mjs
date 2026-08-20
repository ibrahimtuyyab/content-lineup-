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
import { relatedLinks, shot } from '../lib/blocks.mjs';
import { art } from '../lib/art.mjs';
import { relatedFor } from '../data/links.mjs';
import { site, cta, trustPoints, faqGroups, allFaqs } from '../data/site.mjs';

const hero = ({ kicker, title, lead, crumbs, extra = '' }) => `
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
   /security
   ========================================================================== */
export function securityPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Security & Trust', href: '/security' },
  ];

  const faqs = [
    {
      q: 'What exactly happens to my API key when I save it?',
      a: 'It is encrypted with AES-256 before it is written to storage. The plaintext exists only in memory, only for as long as it takes to sign a request to your chosen provider. After you save it, the interface will never display it again — only its last four characters — and it is excluded from logs, exports, backups you can download, and support tooling.',
    },
    {
      q: 'Do my BYO-key requests pass through your servers?',
      a: 'The request is assembled and dispatched by our service, but it runs against your provider account and your quota alone, and is never pooled or batched with another customer\'s traffic. Your key is never used to serve anyone else\'s generation. If you would rather no third party ever assembled the request, the honest answer is that no hosted tool can offer that — that is a self-hosted requirement.',
    },
    {
      q: 'Can your staff read my drafts?',
      a: 'Not by default. Support staff cannot read workspace content unless you explicitly grant access for a specific issue, and that grant expires. Production database access is limited to the engineers who need it, gated behind SSO with multi-factor authentication, and logged.',
    },
    {
      q: 'Do you train models on my content?',
      a: 'No. We do not train models on your briefs, drafts, or published articles, and generation requests go to providers under API terms that exclude training on API traffic.',
    },
    {
      q: 'What happens to my data if I delete my account?',
      a: 'Workspace content is removed from live systems within 30 days and rotates out of encrypted backups within 90. Export everything first — Markdown, HTML, and a spreadsheet of the whole content plan — because deletion is not reversible after that window.',
    },
    {
      q: 'Are you SOC 2 or ISO 27001 certified?',
      a: 'Not currently. We would rather say so plainly than imply otherwise. The practices on this page are what we do; the formal audit is not something we have completed. If a certification is a procurement requirement for you, tell us and we will be straight about the timeline.',
    },
  ];

  const body = `
${hero({
  kicker: 'Security & trust',
  title: 'You are handing us an API key. Here is exactly what happens to it.',
  lead:
    'This page exists because ContentLineup stores credentials and content, and asking people to trust that without explaining it is not reasonable. Where we do not do something, that is stated rather than omitted.',
  crumbs,
})}

<section class="sec">
  <div class="wrap">
    <h2 class="sr-only">How we handle your data</h2>
    <div style="margin-bottom:44px">
      ${art('key-handling')}
    </div>
    <div class="trust-grid reveal-stagger">
      ${trustPoints
        .map(
          (t) => `
      <article class="trust-item">
        ${icon('shield')}
        <div>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.body)}</p>
        </div>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    <div class="shot-split reveal">
      <div class="shot-split-text">
        ${eyebrow('The key itself')}
        <h3>Write-only, by design</h3>
        <p class="lead">
          After you save a personal key, the interface shows you four characters of it and nothing else, forever.
          There is no reveal button, because a reveal button is a feature that only ever helps an attacker —
          the legitimate use case is "replace it", which does not require reading the old one.
        </p>
        <ul class="check-list">
          <li>${icon('check')}<span>AES-256 encryption at rest, decrypted in memory only to sign a provider request</span></li>
          <li>${icon('check')}<span>Never written to application logs or error reports</span></li>
          <li>${icon('check')}<span>Never included in any export you or we can produce</span></li>
          <li>${icon('check')}<span>Set per workspace, so a client key never touches another client's work</span></li>
          <li>${icon('check')}<span>Revoke at your provider at any time — we hold no other credential for you</span></li>
        </ul>
      </div>
      ${shot('settings')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Ownership',
      title: 'The content is yours, and leaving is a supported action.',
      lead:
        'Lock-in is a business model we have deliberately not adopted. The practical test of that claim is what happens when you cancel, so here is the answer in advance.',
    })}
    <div class="grid g-3 reveal-stagger">
      <article class="card">
        <span class="card-icon trust">${icon('export')}</span>
        <h3>Export any time</h3>
        <p>Articles as Markdown or HTML with their images. The whole content plan — topics, keywords, owners, dates, statuses — as a spreadsheet. No export fee, no ticket to raise.</p>
      </article>
      <article class="card">
        <span class="card-icon trust">${icon('shield')}</span>
        <h3>Copyright stays with you</h3>
        <p>We claim no licence to publish, resell, or showcase anything you generate. Published posts are unaffected by your account status.</p>
      </article>
      <article class="card">
        <span class="card-icon trust">${icon('lock')}</span>
        <h3>Cancelling is not deletion</h3>
        <p>A cancelled account keeps read and export access to the library. Your archive does not switch off because a card expired.</p>
      </article>
    </div>
  </div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Practices',
      title: 'Infrastructure and access',
    })}
    <div class="prose reveal" style="max-width:52rem">
      <h3>Encryption</h3>
      <p>TLS 1.2 or higher on every connection to the app and API, with HSTS enforced. Data encrypted at rest, including database volumes and backups. Provider calls leave over TLS.</p>
      <h3>Access control</h3>
      <p>Production access is limited to engineers who need it, requires SSO with multi-factor authentication, and is logged. There is no shared administrative account. Support tooling cannot read workspace content without an explicit, expiring grant from you.</p>
      <h3>Isolation</h3>
      <p>Workspaces are isolated at the data layer. A member of one workspace cannot enumerate or read another, even within the same account — which is what makes the per-client agency setup safe to use.</p>
      <h3>Backups and recovery</h3>
      <p>Automated daily encrypted backups with point-in-time recovery. Deleted articles move to a recoverable state before purge, so a misclick is not permanent.</p>
      <h3>Hosting</h3>
      <p>Managed cloud infrastructure in the United States. Sub-processors are limited to our hosting provider, the AI provider you select, and the image source — we do not resell or share your data with anyone else.</p>
      <h3>Reporting a vulnerability</h3>
      <p>Email <a href="mailto:${site.email}">${esc(site.email)}</a> with the subject line "Security". We will acknowledge within two business days. We do not currently run a paid bounty programme, and we will not threaten anyone who reports something in good faith.</p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ kicker: 'FAQ', title: 'Security questions, answered directly' })}
    ${faqAccordion(faqs, 'sec-faq')}
  </div>
</section>

${relatedLinks(relatedFor['security'].title, relatedFor['security'].links)}

${finalCta({
  title: 'Start without a key at all, if you would rather.',
  lead:
    'The managed key means there is no credential of yours for us to hold in the first place. Switch to your own whenever you want the cost control.',
})}`;

  return page({
    path: '/security',
    ogImage: '/og/security.png',
    title: 'Security & Trust — Your Keys and Content | ContentLineup',
    description:
      'How we store API keys (AES-256, write-only), why BYO-key requests are never pooled, and what happens to your content if you leave.',
    body,
    schema: [faqSchema(faqs), breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

/* ==========================================================================
   /faq
   ========================================================================== */
export function faqPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'FAQ', href: '/faq' },
  ];

  const body = `
${hero({
  kicker: 'FAQ',
  title: `${allFaqs.length} questions, answered properly.`,
  lead:
    'Grouped by what you are actually trying to work out. Where the honest answer is a caveat rather than a benefit, it is written as a caveat.',
  crumbs,
})}

<section class="sec-tight">
  <div class="wrap">
    ${art('workflow-spine')}
  </div>
</section>

${faqGroups
  .map(
    (g, i) => `
<section class="sec ${i % 2 === 1 ? 'sec-paper' : ''}" id="${g.title.toLowerCase().replace(/[^a-z]+/g, '-')}">
  <div class="wrap">
    ${sectionHead({ title: g.title })}
    ${faqAccordion(g.items, 'g' + i)}
  </div>
</section>`
  )
  .join('')}

<section class="sec sec-cream">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Still stuck?',
      title: 'Ask us the thing that is not on this page.',
      lead: 'A real person answers, usually the same day.',
      align: 'center',
    })}
    <div class="cta-row center reveal">
      ${btn('Email us', 'mailto:' + site.email, 'secondary')}
      ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
    </div>
  </div>
</section>`;

  return page({
    path: '/faq',
    ogImage: '/og/security.png',
    title: 'FAQ — Keys, Privacy, Scheduling & Billing | ContentLineup',
    description:
      'Managed vs bring-your-own API keys, how keys are stored, content ownership, scheduling, cancellation, and what happens if you leave.',
    body,
    schema: [faqSchema(allFaqs), breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

/* ==========================================================================
   /about
   ========================================================================== */
export function aboutPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ];

  const body = `
${hero({
  kicker: 'About',
  title: 'We built the thing that was missing between the draft and the publish.',
  lead:
    'ContentLineup is made by Teczon Labs. It exists because AI made writing a draft cheap and did nothing at all about the six steps that come after it.',
  crumbs,
})}

<section class="sec">
  <div class="wrap">
    <div class="prose reveal">
      <h2>The problem we kept watching</h2>
      <p>Every small business we worked with had the same content story. A burst of enthusiasm, four or five posts, then eighteen months of silence — and a blog whose most recent entry made the company look closed.</p>
      <p>The diagnosis was always "we ran out of time", but that was never quite it. What they ran out of was <em>contiguous</em> time. Writing 1,500 words needs a three-hour block. Sourcing an image, writing alt text, and filling in a meta description needs fifteen unclaimed minutes on the specific Tuesday the post was meant to go out. A busy business reliably has neither.</p>
      <h2>What we decided to build</h2>
      <p>Not another AI writer. There are plenty, and they are good at the part that stopped being the bottleneck. What was missing was everything downstream: structure that holds, images matched to sections with alt text written, the SEO fields filled in, and — the part nobody automates — a publish that happens on a date without a person being present.</p>
      <p>So ContentLineup is one queue from brief to published article, and the queue runs on our servers. That last detail is the whole product. If publishing depends on your laptop being open, it is not automated; it is delegated to your presence.</p>
      <h2>Two things we decided early</h2>
      <p><strong>Bring-your-own-key stays free.</strong> Charging a subscription for software while a customer also pays their own AI provider felt like being paid twice for one job. The free plan is uncapped and has every feature. The managed key is what you pay for, and what you get is not having to have a provider account.</p>
      <p><strong>No lock-in, tested by cancellation.</strong> Everything exports in open formats, and a cancelled account keeps read and export access to its library. The test of a no-lock-in claim is what happens when someone leaves, so we answered that in advance rather than in a support ticket.</p>
      <h2>Where we are honest about the gaps</h2>
      <p>Three features on this site are labelled Coming Soon — the editorial calendar, recurring publish slots, and bulk briefs. They stay labelled that way until they work, and their real status is published in the <a href="/resources/product-updates/product-update-august-2026">product updates</a>. We are also not SOC 2 certified, which is stated plainly on the <a href="/security">security page</a> rather than left for procurement to discover.</p>
      <h2>Who makes it</h2>
      <p>ContentLineup is a product of <a href="${site.parent.url}" rel="noopener">${esc(
    site.parent.name
  )}</a>, a small software studio. Small enough that when you email <a href="mailto:${site.email}">${esc(
    site.email
  )}</a>, the person who replies is the person who can change the product.</p>
    </div>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    ${sectionHead({
      kicker: 'How we work',
      title: 'Three rules that decide what ships.',
      lead: 'They are the reason this site labels things Coming Soon instead of quietly shipping a demo of them.',
    })}
    ${art('how-we-work')}
  </div>
</section>

${finalCta()}`;

  return page({
    path: '/about',
    ogImage: '/og/about.png',
    title: 'About ContentLineup — why we built it | Teczon Labs',
    description:
      'Why we built a publishing queue rather than another AI writer, why the bring-your-own-key plan stays free, and where the gaps are.',
    body,
    schema: [breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

/* ==========================================================================
   /contact
   ========================================================================== */
export function contactPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' },
  ];

  const body = `
${hero({
  kicker: 'Contact',
  title: 'Email reaches a person, not a queue.',
  lead:
    'We are a small team, which means no ticket system and no chatbot — but also that the reply usually comes the same day and comes from someone who can act on it.',
  crumbs,
})}

<section class="sec">
  <div class="wrap">
    <h2 class="sr-only">Ways to reach us</h2>
    <div class="contact-grid reveal-stagger">
      <article class="contact-card">
        <span class="card-icon">${icon('spark')}</span>
        <h3>Support</h3>
        <p>Something not working, a billing question, or you are stuck partway through setting up a workspace.</p>
        <a href="mailto:${site.email}?subject=Support">${esc(site.email)}</a>
      </article>
      <article class="contact-card">
        <span class="card-icon sched">${icon('pen')}</span>
        <h3>Feedback &amp; feature requests</h3>
        <p>The roadmap is mostly built from these. Tell us what is missing and what you would use it for.</p>
        <a href="mailto:${site.email}?subject=Feedback">${esc(site.email)}</a>
      </article>
      <article class="contact-card">
        <span class="card-icon trust">${icon('lock')}</span>
        <h3>Security</h3>
        <p>Reporting a vulnerability. Use the subject line "Security" — acknowledged within two business days.</p>
        <a href="mailto:${site.email}?subject=Security">${esc(site.email)}</a>
      </article>
      <article class="contact-card">
        <span class="card-icon">${icon('team')}</span>
        <h3>Agencies &amp; volume</h3>
        <p>Running content for many clients, or need something the Agency plan does not cover? Say what you need.</p>
        <a href="mailto:${site.email}?subject=Agency">${esc(site.email)}</a>
      </article>
    </div>

    <div style="margin-top:44px">
      ${art('support-panel')}
    </div>

    <div class="prose reveal" style="margin-top:48px">
      <h2>Before you email about pricing</h2>
      <p>The two most common questions have answers already: the bring-your-own-key plan is genuinely free forever with no article cap, and switching between the managed key and your own is a toggle in Settings that does not affect existing content. The rest is on the <a href="/pricing">pricing page</a>.</p>
      <h2>Company</h2>
      <p>${esc(site.legalName)} &middot; a product of <a href="${site.parent.url}" rel="noopener">${esc(
    site.parent.name
  )}</a>.</p>
    </div>
  </div>
</section>

${finalCta()}`;

  return page({
    path: '/contact',
    ogImage: '/og/contact.png',
    title: 'Contact ContentLineup — support, feedback and security',
    description:
      'Get in touch with the ContentLineup team about support, billing, feature requests, security disclosures, or agency and volume requirements.',
    body,
    schema: [breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

/* ==========================================================================
   Legal pages
   ========================================================================== */
const LEGAL_UPDATED = '18 August 2026';

export function privacyPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];

  const body = `
${hero({
  kicker: 'Legal',
  title: 'Privacy Policy',
  lead: 'What we collect, why, how long we keep it, and what you can ask us to do about it.',
  crumbs,
})}

<section class="sec">
  <div class="wrap">
    <div class="prose reveal">
      <p class="updated">Last updated: ${LEGAL_UPDATED}</p>

      <h2>Who we are</h2>
      <p>${esc(site.legalName)} ("ContentLineup", "we") operates contentlineup.com and the application at app.contentlineup.com. Contact: <a href="mailto:${
        site.email
      }">${esc(site.email)}</a>.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data</strong> — name, email address, and authentication credentials.</li>
        <li><strong>Workspace content</strong> — the briefs, drafts, articles, images, and schedules you create.</li>
        <li><strong>Provider credentials</strong> — if you bring your own key, the encrypted API key you supply.</li>
        <li><strong>Billing data</strong> — handled by our payment processor. We do not store full card numbers.</li>
        <li><strong>Usage data</strong> — logs, error reports, and aggregate feature usage, used to operate and improve the service.</li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not train AI models on your briefs, drafts, or published content.</li>
        <li>We do not sell your personal data, and we do not share it with advertisers.</li>
        <li>We do not include your API keys in any export, log, or support view.</li>
      </ul>

      <h2>Why we process it</h2>
      <p>To provide the service you signed up for (contract), to keep it secure and functioning (legitimate interests), to bill you (contract), and to meet legal obligations such as tax records.</p>

      <h2>Sub-processors</h2>
      <p>We use a small number of third parties: a managed cloud hosting provider, a payment processor, an email delivery provider, and the AI provider you select (OpenAI or Google Gemini, or ours if you use the managed key). Images are sourced from Unsplash. Generation requests to AI providers are made under API terms that exclude training on API traffic.</p>

      <h2>How long we keep it</h2>
      <p>Workspace content is retained while your account is active. After deletion, content is removed from live systems within 30 days and rotates out of encrypted backups within 90. Billing records are kept as long as tax law requires.</p>

      <h2>Your rights</h2>
      <p>Depending on where you live, you may have the right to access, correct, export, or delete your personal data, to object to certain processing, and to complain to a supervisory authority. You can export your content at any time from Settings without asking us. For anything else, email <a href="mailto:${
        site.email
      }">${esc(site.email)}</a> and we will respond within 30 days.</p>

      <h2>Cookies</h2>
      <p>This marketing site sets no tracking or advertising cookies. The application sets a session cookie required to keep you logged in, plus a preference cookie. We do not run third-party advertising trackers.</p>

      <h2>International transfers</h2>
      <p>Our infrastructure is hosted in the United States. If you access the service from elsewhere, your data is transferred there under appropriate safeguards.</p>

      <h2>Changes</h2>
      <p>If we make a material change to this policy we will email account holders before it takes effect. The date at the top of this page always reflects the current version.</p>
    </div>
  </div>
</section>`;

  return page({
    path: '/privacy',
    title: 'Privacy Policy | ContentLineup',
    description:
      'What ContentLineup collects, why, how long it is kept, who our sub-processors are, and how to exercise your data rights.',
    body,
    schema: [breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

export function termsPage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const body = `
${hero({
  kicker: 'Legal',
  title: 'Terms of Service',
  lead: 'The agreement between you and ContentLineup, in plain language wherever plain language is possible.',
  crumbs,
})}

<section class="sec">
  <div class="wrap">
    <div class="prose reveal">
      <p class="updated">Last updated: ${LEGAL_UPDATED}</p>

      <h2>1. The agreement</h2>
      <p>These terms govern your use of ContentLineup, operated by ${esc(
        site.legalName
      )}. By creating an account you agree to them. If you are agreeing on behalf of a company, you confirm you have authority to do so.</p>

      <h2>2. Your account</h2>
      <p>You are responsible for keeping your credentials secure and for activity under your account. Tell us promptly at <a href="mailto:${
        site.email
      }">${esc(site.email)}</a> if you believe it has been compromised.</p>

      <h2>3. Plans and billing</h2>
      <p>Paid plans are billed monthly or yearly in advance, at your choice, and renew automatically on the same period until cancelled. Cancellation takes effect at the end of the current billing period; you keep access until then. Managed-key plans include a monthly article allowance which resets on your billing date and does not roll over. If you exceed it, generation pauses for the remainder of the period — scheduled and published content is unaffected.</p>
      <p>The bring-your-own-key plan is free. You are responsible for your own AI provider costs, and we have no visibility of or control over that bill.</p>

      <h2>4. Refunds</h2>
      <p>If something goes materially wrong in your first month on a paid plan, email us and we will refund it.</p>

      <h2>5. Your content</h2>
      <p>You retain all rights to the briefs you write and the articles you generate. We claim no licence to publish, resell, or showcase your content. We do not train models on it. You grant us only the narrow permission needed to store, process, and display it back to you in order to run the service.</p>

      <h2>6. Acceptable use</h2>
      <p>Do not use ContentLineup to generate or publish content that is unlawful, that infringes someone else's rights, that impersonates a real person or organisation, or that is designed to deceive — including fabricated reviews, fake news, or medical, legal, or financial advice presented as coming from a qualified professional when it is not. Do not attempt to circumvent article allowances, resell access, or interfere with the service's operation.</p>

      <h2>7. AI-generated output</h2>
      <p>Output is generated by third-party AI models and can be inaccurate. <strong>You are responsible for reviewing anything you publish.</strong> This matters particularly in regulated fields — legal, medical, financial, and licensed trades — where publishing something incorrect has consequences we cannot absorb on your behalf. We provide an approval workflow precisely so review can be a required step.</p>
      <p>We make no warranty that generated output is original, accurate, or suitable for a given purpose, and no warranty regarding the availability or output quality of a third-party AI provider.</p>

      <h2>8. Availability</h2>
      <p>We aim for high availability and do not currently offer a contractual uptime SLA. Scheduled publishing runs on our infrastructure; in the event of an outage, queued articles publish when service is restored.</p>

      <h2>9. Suspension and termination</h2>
      <p>You may cancel at any time from the billing screen. We may suspend or terminate an account that breaches these terms, that is not paid for, or that puts the service or other customers at risk — with notice where circumstances allow. On termination you keep read and export access to your existing library.</p>

      <h2>10. Liability</h2>
      <p>To the maximum extent permitted by law, our total liability arising out of or relating to the service is limited to the amount you paid us in the twelve months before the claim. We are not liable for indirect or consequential loss, including lost profits, lost revenue, or loss of data beyond our backup obligations. Nothing here limits liability that cannot be limited by law.</p>

      <h2>11. Changes to these terms</h2>
      <p>We may update these terms. Material changes are emailed to account holders before taking effect, and continued use afterwards constitutes acceptance.</p>

      <h2>12. Contact</h2>
      <p>Questions about these terms: <a href="mailto:${site.email}">${esc(site.email)}</a>.</p>
    </div>
  </div>
</section>`;

  return page({
    path: '/terms',
    title: 'Terms of Service | ContentLineup',
    description:
      'ContentLineup terms of service: plans and billing, content ownership, acceptable use, responsibility for reviewing AI-generated output, and liability.',
    body,
    schema: [breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href)],
  });
}

/* ==========================================================================
   404
   ========================================================================== */
export function notFoundPage() {
  const body = `
<section class="wrap nf">
  <p class="nf-code">ERROR 404</p>
  <h1>That page is not in the queue.</h1>
  <p class="lead" style="margin:18px auto 30px">
    The link is broken or the page has moved. The useful places are below.
  </p>
  <div class="cta-row center">
    ${btn('Back to home', '/', 'primary', true)}
    ${btn('Browse resources', '/resources', 'secondary')}
  </div>
</section>`;

  return page({
    path: '/404',
    title: 'Page not found | ContentLineup',
    description:
      'That page is not in the queue. Head back to the homepage, or browse the guides, case studies and comparisons in Resources.',
    body,
  });
}
