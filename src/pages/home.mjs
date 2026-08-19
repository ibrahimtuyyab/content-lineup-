import { page, esc, icon, btn, sectionHead, eyebrow, finalCta, faqSchema, softwareSchema } from '../lib/html.mjs';
import {
  publishingQueue,
  workflowSection,
  stepsSection,
  featuresSection,
  keyModesSection,
  nicheTabs,
  socialSection,
  integrationsSection,
  pricingSummary,
  faqSection,
  trustStrip,
} from '../lib/blocks.mjs';
import { site, cta, homeFaqs, plans } from '../data/site.mjs';
import { posts, featured } from '../data/content.mjs';

const heroSection = () => `
<section class="hero">
  <div class="hero-bg" data-parallax="0.05"></div>
  <div class="hero-rules" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-text reveal">
      ${eyebrow('AI writing + real scheduling')}
      <h1>Write it today.<br>Publish it <em>next Thursday</em> at 9&nbsp;AM.</h1>
      <p class="lead">
        ContentLineup writes SEO-ready articles with AI, matches images to every section with alt text,
        and publishes each post on the exact date and time you choose — then shares it to LinkedIn,
        Facebook and Instagram automatically. Brief it once, schedule a month, walk away.
      </p>
      <div class="cta-row hero-cta">
        ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
        ${btn('See how it works', '/how-it-works', 'secondary')}
      </div>
      <div class="hero-note">
        <span>${icon('check')}Free forever on your own API key</span>
        <span>${icon('check')}No card required</span>
        <span>${icon('check')}Shares to LinkedIn, Facebook &amp; Instagram</span>
      </div>
    </div>
    <div class="reveal">
      ${publishingQueue()}
    </div>
  </div>
</section>`;

const proofSection = () => {
  const cs = posts.find((p) => p.category === 'case-studies');
  return `
<section class="sec sec-ink" id="proof">
  <div class="wrap">
    <div class="proof">
      <div class="reveal">
        ${eyebrow('Case study')}
        <p class="proof-quote">
          &ldquo;I knew exactly what to write. I had the list. What I did not have was a Tuesday evening
          where nothing else was on fire — which turns out to be the only input the old process actually needed.&rdquo;
        </p>
        <div class="proof-by">
          <span class="proof-av">IM</span>
          <div>
            <b>Iman Marsh</b>
            <span>Owner, Northgate Air &middot; 9-person HVAC company</span>
          </div>
        </div>
        <div class="cta-row" style="margin-top:26px">
          <a class="btn btn-light" href="${cs.path}">Read the full case study ${icon('arrow')}</a>
        </div>
      </div>
      <div class="metrics reveal-stagger">
        <div class="metric"><b>2 &rarr; 8</b><span>posts per year to posts per month</span></div>
        <div class="metric sched"><b>47 min</b><span>total human time per week</span></div>
        <div class="metric"><b>+1,237%</b><span>organic impressions in 6 months</span></div>
        <div class="metric sched"><b>3 &rarr; 19</b><span>organic enquiries per month</span></div>
      </div>
    </div>
  </div>
</section>`;
};

const resourcesPreview = () => `
<section class="sec" id="resources">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Resources',
      title: 'Practical guides, not content marketing about content marketing.',
      lead:
        'Real workflows, real numbers, and the honest version of what AI writing can and cannot do.',
    })}
    <div class="post-grid reveal-stagger">
      ${featured
        .slice(0, 3)
        .map(
          (p) => `
      <a class="post-card" href="${p.path}">
        <div class="post-thumb">
          <img src="/screens/${p.thumb}.svg" alt="" width="1240" height="780" loading="lazy" decoding="async">
        </div>
        <div class="post-body">
          <div class="post-meta"><span>${esc(p.categoryLabel)}</span><span>&middot;</span><span>${
            p.readMins
          } min read</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt)}</p>
          <span class="post-more">Read it ${icon('arrow')}</span>
        </div>
      </a>`
        )
        .join('')}
    </div>
    <div class="cta-row reveal" style="margin-top:32px">
      ${btn('All resources', '/resources', 'secondary', true)}
    </div>
  </div>
</section>`;

export default function home() {
  const body = `
${heroSection()}
${trustStrip()}
${workflowSection()}
${stepsSection()}
${featuresSection()}
${keyModesSection()}
${socialSection()}
${nicheTabs()}
${integrationsSection()}
${proofSection()}
${resourcesPreview()}
${pricingSummary()}
${faqSection(homeFaqs)}
${finalCta()}`;

  return page({
    path: '/',
    title: 'ContentLineup — AI Articles That Publish Themselves',
    ogTitle: 'ContentLineup — write it today, publish it next Thursday',
    description:
      'AI writes your SEO-ready article, publishes it on the date you pick, and shares it to LinkedIn, Facebook and Instagram. Free on your own OpenAI or Gemini key.',
    body,
    schema: [softwareSchema(plans), faqSchema(homeFaqs)],
  });
}
