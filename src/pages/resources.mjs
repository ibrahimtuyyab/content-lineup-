import {
  page,
  esc,
  icon,
  btn,
  abs,
  sectionHead,
  eyebrow,
  finalCta,
  faqAccordion,
  faqSchema,
  breadcrumbs,
  breadcrumbSchema,
} from '../lib/html.mjs';
import { related } from '../lib/article.mjs';
import { posts, categories, byCategory, relatedTo } from '../data/content.mjs';
import { site, cta, topicClusters } from '../data/site.mjs';

const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const postCard = (p) => `
<a class="post-card" href="${p.path}" data-category="${p.category}">
  <div class="post-thumb">
    <img src="/screens/${p.thumb}.svg" alt="" width="1240" height="780" loading="lazy" decoding="async">
  </div>
  <div class="post-body">
    <div class="post-meta">
      <span>${esc(p.categoryLabel)}</span><span>&middot;</span>
      <span>${p.readMins} min</span><span>&middot;</span>
      <time datetime="${p.published}">${fmtDate(p.published)}</time>
    </div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.excerpt)}</p>
    <span class="post-more">Read it ${icon('arrow')}</span>
  </div>
</a>`;

const clusterBand = () => {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  return `
<section class="sec sec-paper" id="topics">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Topics',
      title: 'What we write about',
      lead:
        'Six clusters, each tied to a part of the workflow. Every one links through to the product page that answers the same question in practice.',
    })}
    <div class="cluster-grid reveal-stagger">
      ${topicClusters
        .map((c) => {
          const items = c.slugs.map((sl) => bySlug.get(sl)).filter(Boolean);
          return `
      <article class="cluster" id="topic-${c.id}">
        <h3>${esc(c.label)}</h3>
        <p class="cluster-blurb">${esc(c.blurb)}</p>
        ${
          items.length
            ? `<ul class="cluster-list">${items
                .map(
                  (post) =>
                    `<li><a href="${post.path}">${esc(post.title)}</a><span>${post.readMins} min</span></li>`
                )
                .join('')}</ul>`
            : ''
        }
        <a class="cluster-pillar" href="${c.pillar.href}">${esc(c.pillar.label)} ${icon('arrow')}</a>
      </article>`;
        })
        .join('')}
    </div>
  </div>
</section>`;
};

/* ==========================================================================
   /resources — filterable hub
   ========================================================================== */
export function resourcesHub() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
  ];

  const lead = posts[0];

  const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="page-hero-inner">
      ${breadcrumbs(crumbs)}
      ${eyebrow('Resources')}
      <h1>Guides on content marketing, social media automation and SEO.</h1>
      <p class="lead">
        ${posts.length} in-depth pieces on getting content published consistently — content calendars,
        social media scheduling, keyword research and tool comparisons. Real workflows, real costs, real
        before-and-after figures, and the honest version of what AI writing does and does not do.
      </p>
      <div class="cta-row" style="margin-top:24px">
        <a class="btn btn-secondary" href="#topics">Browse by topic ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="/feed.xml">RSS feed</a>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div id="post-filters" class="filter-bar reveal" role="group" aria-label="Filter resources by category">
      ${categories
        .map(
          (c) => `<button class="filter-btn" type="button" data-filter="${c.id}" aria-pressed="${
            c.id === 'all'
          }">${esc(c.label)}${
            c.id === 'all' ? '' : ` <span class="mono">${byCategory(c.id).length}</span>`
          }</button>`
        )
        .join('')}
    </div>

    <h2 class="sr-only">All resources</h2>
    <div class="post-grid reveal-stagger">
      ${posts.map(postCard).join('')}
    </div>
    <p class="no-results" id="no-results" hidden>Nothing in that category yet — try another filter.</p>
  </div>
</section>

<section class="sec sec-paper">
  <div class="wrap">
    <div class="shot-split reveal">
      <div class="shot-split-text">
        ${eyebrow('Start here', 'sched')}
        <h3>${esc(lead.title)}</h3>
        <p class="lead">${esc(lead.excerpt)}</p>
        <div class="cta-row" style="margin-top:22px">
          ${btn('Read it', lead.path, 'primary', true)}
        </div>
      </div>
      <div class="shot">
        <div class="shot-bar"><i></i><i></i><i></i><span>${esc(lead.categoryLabel.toLowerCase())} &middot; ${
    lead.readMins
  } min read</span></div>
        <img src="/screens/${lead.thumb}.svg" alt="" width="1240" height="780" loading="lazy" decoding="async">
      </div>
    </div>
  </div>
</section>

${clusterBand()}

${finalCta()}`;

  return page({
    path: '/resources',
    ogImage: '/og/resources.png',
    title: 'Resources — content marketing, social automation & SEO guides',
    description:
      'Guides on content calendars, social media automation, keyword research and blog optimisation, plus a case study with six months of real numbers.',
    body,
    schema: [
      breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href),
      {
        '@type': 'CollectionPage',
        '@id': abs('/resources') + '#collection',
        name: 'ContentLineup Resources',
        url: abs('/resources'),
        description:
          'Guides, case studies, comparisons and product updates on publishing content consistently.',
        isPartOf: { '@id': site.origin + '/#website' },
        hasPart: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: abs(p.path),
          datePublished: p.published,
          dateModified: p.modified,
          author: { '@type': 'Person', name: p.author },
        })),
      },
    ],
  });
}

/* ==========================================================================
   Article template
   ========================================================================== */
export function articlePage(p) {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    { label: p.categoryLabel + 's', href: '/resources#' + p.category },
    { label: p.title, href: p.path },
  ];

  const rel = relatedTo(p, 3).map((r) => ({
    href: r.path,
    tag: r.categoryLabel,
    title: r.title,
    blurb: r.excerpt.slice(0, 118) + (r.excerpt.length > 118 ? '…' : ''),
  }));

  const faqBlock = p.faqs
    ? `
<h2 id="faq">Frequently asked questions</h2>
${faqAccordion(p.faqs, 'a-' + p.slug)}`
    : '';

  const body = `
<article>
  <header class="article-head">
    <div class="wrap">
      <div class="measure">
        ${breadcrumbs(crumbs)}
        <span class="chip chip-accent">${esc(p.categoryLabel)}</span>
        <h1 style="margin-top:16px">${esc(p.title)}</h1>
        <p class="lead">${esc(p.excerpt)}</p>
        <div class="article-meta">
          <span>By ${esc(p.author)}</span>
          <span>Published <time datetime="${p.published}">${fmtDate(p.published)}</time></span>
          ${
            p.modified !== p.published
              ? `<span>Updated <time datetime="${p.modified}">${fmtDate(p.modified)}</time></span>`
              : ''
          }
          <span>${p.readMins} min read</span>
        </div>
      </div>
    </div>
  </header>

  <div class="wrap">
    <div class="article-body">
      ${p.body}
      ${faqBlock}
    </div>

    <div class="measure">
      ${related(rel)}
    </div>
  </div>
</article>

${finalCta({
  title: 'Stop deciding whether today is a publishing day.',
  lead:
    'Brief it once, review it in a few minutes, and let the queue publish on the date you picked. Free forever on your own OpenAI or Gemini key.',
})}`;

  const schema = [
    {
      '@type': p.category === 'case-studies' ? 'Article' : 'BlogPosting',
      '@id': abs(p.path) + '#article',
      headline: p.metaTitle.length <= 110 ? p.metaTitle : p.title,
      alternativeHeadline: p.title,
      description: p.description,
      url: abs(p.path),
      mainEntityOfPage: { '@type': 'WebPage', '@id': abs(p.path) },
      datePublished: p.published,
      dateModified: p.modified,
      author: { '@type': 'Person', name: p.author, url: abs('/about') },
      publisher: { '@id': site.origin + '/#organization' },
      image: {
        '@type': 'ImageObject',
        url: abs('/og/' + p.slug + '.png'),
        width: 1200,
        height: 630,
      },
      articleSection: p.categoryLabel,
      keywords: [p.primaryKeyword, ...(p.secondaryKeywords || [])].join(', '),
      wordCount: Math.round(p.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length),
      inLanguage: 'en-US',
      isAccessibleForFree: true,
    },
    breadcrumbSchema(crumbs, crumbs[crumbs.length - 1].href),
  ];

  if (p.faqs) schema.push(faqSchema(p.faqs));

  // A ranked list article is an ItemList — the shape that earns rich results and
  // gives answer engines the ordering explicitly rather than by inference.
  if (p.listItems?.length) {
    schema.push({
      '@type': 'ItemList',
      '@id': abs(p.path) + '#itemlist',
      name: p.title,
      numberOfItems: p.listItems.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: p.listItems.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        description: it.description,
        ...(it.url ? { url: it.url } : {}),
      })),
    });
  }

  return page({
    path: p.path,
    title: p.metaTitle,
    ogTitle: p.title,
    description: p.description,
    ogType: 'article',
    ogImage: '/og/' + p.slug + '.png',
    article: { published: p.published, modified: p.modified, author: p.author },
    speakable: ['.answer-box', '.article-head h1', '.key-takeaways'],
    body,
    schema,
  });
}
