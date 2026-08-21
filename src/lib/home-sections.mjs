// The homepage, section by section.
//
// The whole page argues one thing: ContentLineup is where an idea becomes a
// published post — Idea → Generate → Calendar → Approve → Publish — rather than
// an AI writer bolted onto a scheduler. Every section below is one beat of that
// argument, and no two sections use the same layout.
import { esc, icon, btn, sectionHead, eyebrow, soonChip } from './html.mjs';
import { billingToggle } from './blocks.mjs';
import { postMedia } from './media.mjs';
import { appShell } from './app-shell.mjs';
import { screenSrc } from './screens.mjs';
import {
  site,
  cta,
  stages,
  channels,
  scatteredStack,
  channelDemo,
  ideaDemo,
  aiDemo,
  accountTree,
  homeNiches,
  plans,
  screens,
  workflowCompare,
} from '../data/site.mjs';

/* ==========================================================================
   01 — Hero + the lineup board
   ========================================================================== */

// Demo content deliberately spans five different businesses, so the product
// never looks like it only works for one HVAC company.
const LINEUP_CARDS = [
  { t: 'Summer AC maintenance tips', b: 'Northgate Air', i: 'NA', c: 'blog', tone: 'a' },
  { t: 'How to choose a wedding florist', b: 'Bloom Studio', i: 'BS', c: 'blog', tone: 'b' },
  { t: 'Filter checklist carousel', b: 'Northgate Air', i: 'NA', c: 'instagram', tone: 'a' },
  { t: 'Are dental implants worth it?', b: 'Harbor Dental', i: 'HD', c: 'blog', tone: 'c' },
  { t: 'Onboarding: 3 weeks to 3 days', b: 'Lumen Analytics', i: 'LA', c: 'blog', tone: 'd' },
  { t: 'Behind the arch — build video', b: 'Bloom Studio', i: 'BS', c: 'instagram', tone: 'b' },
  { t: 'Q3 launch announcement', b: 'Lumen Analytics', i: 'LA', c: 'linkedin', tone: 'd' },
  { t: 'Implant myths, answered', b: 'Harbor Dental', i: 'HD', c: 'facebook', tone: 'c' },
  { t: 'What a full tune-up includes', b: 'Northgate Air', i: 'NA', c: 'blog', tone: 'a' },
  { t: 'Seasonal stem guide', b: 'Bloom Studio', i: 'BS', c: 'blog', tone: 'b' },
  { t: 'Retainer margin post', b: 'Meridian Collective', i: 'MC', c: 'linkedin', tone: 'e' },
  { t: 'Customer story: Ridgeway', b: 'Lumen Analytics', i: 'LA', c: 'blog', tone: 'd' },
];

const LINEUP_COLS = [
  { id: 'idea', label: 'Ideas', cards: [0, 10, 11] },
  { id: 'draft', label: 'Drafts', cards: [1, 8] },
  { id: 'calendar', label: 'Calendar', cards: [2, 9] },
  { id: 'approved', label: 'Approved', cards: [3, 6] },
  { id: 'published', label: 'Published', cards: [4, 7, 5] },
];

const CHANNEL_LABEL = { blog: 'Blog', linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram' };

/** Channel label → glyph, so every list on the site marks a channel the same way. */
export const CHANNEL_ICON = {
  Blog: 'pen',
  LinkedIn: 'linkedin',
  Facebook: 'facebook',
  Instagram: 'instagram',
  Review: 'check',
  Multi: 'layers',
};

const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const lineupCard = (n, { published = false } = {}) => `
<article class="lu-card tone-${n.tone}" data-channel="${n.c}">
  <div class="lu-card-top">
    <span class="lu-brand"><span class="lu-av">${esc(n.i)}</span>${esc(n.b)}</span>
    <span class="lu-ch">${icon(n.c === 'blog' ? 'pen' : n.c)}<span>${esc(CHANNEL_LABEL[n.c])}</span></span>
  </div>
  <p class="lu-title">${esc(n.t)}</p>
  <div class="lu-card-foot"${published ? '' : ' hidden'}>
    <span class="lu-live">${icon('check')}Live</span>
  </div>
</article>`;

export const lineupBoard = () => `
<div class="lineup" id="lineup"
     data-pool='${esc(JSON.stringify(LINEUP_CARDS))}'
     role="img"
     aria-label="The ContentLineup board: content cards for five different businesses moving through Ideas, Drafts, Calendar, Approved and Published, then going live on LinkedIn, Facebook, Instagram and the blog.">
  <div class="lineup-head">
    <span class="lineup-brand">${icon('layers')}<b>The lineup</b><span>5 accounts</span></span>
  </div>
  <div class="lineup-cols">
    ${LINEUP_COLS.map(
      (col) => `
    <section class="lu-col" data-stage="${col.id}">
      <header class="lu-col-head">
        <span class="lu-dot"></span>
        <span class="lu-col-label">${esc(col.label)}</span>
        <b class="lu-count">${col.cards.length}</b>
      </header>
      <div class="lu-slot">
        ${col.cards.map((i) => lineupCard(LINEUP_CARDS[i], { published: col.id === 'published' })).join('')}
      </div>
    </section>`
    ).join('')}
  </div>
  <div class="lineup-foot">
    <span class="lineup-foot-label">Goes live on</span>
    <span class="lineup-chips">
      ${['linkedin', 'facebook', 'instagram']
        .map((id) => `<span class="lu-chip">${icon(id)}${esc(CHANNEL_LABEL[id])}</span>`)
        .join('')}
      <span class="lu-chip"><span class="lu-chip-mark">B</span>Your blog</span>
    </span>
  </div>
</div>`;

/**
 * The drifting dots behind the hero — the headline's "lined up" idea, animated.
 *
 * Each dot is positioned at its place *on the line*, then offset from it by
 * (--sx, --sy). The animation drives that offset back to zero and out again, so
 * the cluster gathers into a queue, holds, and scatters. Only transform and
 * opacity move, so this composites on the GPU and never triggers layout.
 *
 * The offsets are a fixed table rather than Math.random(): build.mjs hashes the
 * CSS and HTML for cache-busting, and random values would produce a new hash on
 * every build for no reason.
 */
export const heroSection = () => `
<section class="hero">
  <div class="hero-bg" data-parallax="0.03"></div>
  <div class="hero-rules" aria-hidden="true"></div>
  <div class="wrap hero-center">
    <div class="hero-text">
      ${eyebrow('Content operating system')}
      <h1>Every idea, <em>lined up</em> and published.</h1>
      <p class="lead">
        Write your posts with AI or by hand. Put them on one calendar. Get them approved.
        Then they go live on their own &mdash; to your blog, LinkedIn, Facebook and Instagram.
        <span class="lead-tail">One place for every brand you look after.</span>
      </p>
      <div class="cta-row hero-cta">
        ${btn(cta.primary.label, cta.primary.href, 'primary', true, 'hero')}
        <a class="btn btn-secondary" href="#tour" data-cta="hero-tour">${esc(cta.tour.label)} ${icon('arrow')}</a>
      </div>
      <ul class="hero-note">
        <li>${icon('check')}No credit card required</li>
        <li>${icon('check')}Approve before anything goes live</li>
        <li>${icon('check')}Set up in minutes</li>
      </ul>
    </div>
  </div>
  <div class="wrap hero-stage">
    ${lineupBoard()}
  </div>
</section>`;

/* ==========================================================================
   02 — Publishes to
   ========================================================================== */
export const channelBand = () => `
<section class="band" id="publishes-to" aria-labelledby="band-h">
  <div class="wrap">
    <div class="band-inner">
      <div class="band-lede">
        <h2 id="band-h">Publish once.<br>It lands everywhere.</h2>
        <p>Connect your channels once. Schedule a post to one of them and tick the others to go out at the same time &mdash; one date, one approval, every account. Each channel still gets copy written for it, not the same text pasted three times.</p>
      </div>
      <ul class="band-list">
        ${channels
          .map(
            (c) => `
        <li class="band-item ${c.status}">
          <span class="band-mark ${c.id}" aria-hidden="true">${icon(
            c.id === 'wordpress' ? 'globe' : c.id === 'payload' ? 'layers' : c.id
          )}</span>
          <span class="band-name">${esc(c.name)}</span>
        </li>`
          )
          .join('')}
      </ul>
    </div>
    <a class="band-link" href="/integrations">All integrations ${icon('arrow')}</a>
  </div>
</section>`;

/* ==========================================================================
   03 — The problem
   ========================================================================== */
export const problemSection = () => `
<section class="sec sec-cream" id="problem">
  <div class="wrap">
    ${sectionHead({
      kicker: 'The problem',
      title: 'AI writes the post. You approve it.<br>It publishes itself.',
      lead:
        'That is the whole job. No copying a draft into a CMS, no setting the same post up on four channels, no diary reminder to hit publish on Thursday. You read it, you say yes, and the rest happens on the date you picked.',
    })}

    <div class="chain reveal">
      <div class="chain-side chain-before">
        <h3>How it usually works</h3>
        <ol class="chain-list">
          ${scatteredStack
            .map(
              (s, i) => `
          <li>
            <span class="chain-n">${i + 1}</span>
            <span class="chain-tool">${esc(s.tool)}</span>
            <span class="chain-job">${esc(s.job)}</span>
          </li>`
            )
            .join('')}
        </ol>
        <p class="chain-verdict">Five tools, four handoffs, nobody sure what is going out on Thursday.</p>
      </div>

      <div class="chain-arrow" aria-hidden="true">${icon('arrow')}</div>

      <div class="chain-side chain-after">
        <h3>One ContentLineup workflow</h3>
        <ol class="chain-flow">
          ${stages
            .map(
              (s) => `
          <li><span class="chain-step">${esc(s.verb)}</span></li>`
            )
            .join('')}
        </ol>
        <p class="chain-verdict good">One place. One calendar. One person can see the whole thing.</p>
        <div class="chain-time">
          <div class="ct ct-bad">
            <b>${esc(workflowCompare.manual.total)}</b>
            <span>Doing it by hand, ${esc(workflowCompare.manual.unit)}</span>
          </div>
          <div class="ct ct-good">
            <b>${esc(workflowCompare.automated.total)}</b>
            <span>With ContentLineup, ${esc(workflowCompare.automated.unit)}</span>
          </div>
        </div>
        <p class="chain-note">${esc(workflowCompare.note)}</p>
      </div>
    </div>
  </div>
</section>`;

/* ==========================================================================
   04 — The tour: Idea → Generate → Calendar → Approve → Publish
   ========================================================================== */
const ideaDemoBlock = () => `
<div class="idemo" id="idea-demo" data-presets='${esc(JSON.stringify(ideaDemo.presets))}'>
  <div class="idemo-head">
    <span class="idemo-label">Try it: type an idea</span>
    <span class="idemo-tag">Demo</span>
  </div>
  <form class="idemo-form" id="idea-demo-form" autocomplete="off">
    <label class="sr-only" for="idea-demo-input">Type a content idea</label>
    <input class="idemo-input" id="idea-demo-input" type="text" name="idea"
           placeholder="${esc(ideaDemo.placeholder)}" value="${esc(ideaDemo.presets[0].idea)}">
    <button class="btn btn-primary idemo-go" type="submit">Line it up ${icon('arrow')}</button>
  </form>
  <div class="idemo-presets">
    ${ideaDemo.presets
      .map(
        (p, i) =>
          `<button class="idemo-preset" type="button" data-preset="${i}"${
            i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"'
          }>${esc(p.account)}</button>`
      )
      .join('')}
  </div>
  <div class="idemo-out" id="idea-demo-out" aria-live="polite">
    <div class="idemo-row">
      <span class="idemo-k">Blog title</span>
      <p class="idemo-v" data-out="title">${esc(ideaDemo.presets[0].title)}</p>
    </div>
    <div class="idemo-row">
      <span class="idemo-k">Social hooks</span>
      <ul class="idemo-hooks" data-out="hooks">
        ${ideaDemo.presets[0].hooks.map((h) => `<li>${esc(h)}</li>`).join('')}
      </ul>
    </div>
    <div class="idemo-row">
      <span class="idemo-k">Suggested slots</span>
      <div class="idemo-dates" data-out="dates">
        ${ideaDemo.presets[0].dates.map((d) => `<span class="idemo-date">${esc(d)}</span>`).join('')}
      </div>
    </div>
  </div>
  <p class="idemo-fine">A preview of what the first screen gives you back. Real drafts are generated in the app.</p>
</div>`;

export const tourSection = () => `
<section class="sec tour" id="tour">
  <div class="wrap">
    ${sectionHead({
      kicker: 'How it works',
      title: 'Idea &rarr; Generate &rarr; Calendar &rarr; Approve &rarr; Publish',
      lead:
        'Five steps, one tool. Scroll through them and watch the real product screens change as you go.',
    })}

    <div class="tour-grid" id="tour-grid">
      <div class="tour-stage">
        <div class="tour-sticky">
          <div class="tour-frame reveal reveal-late">
            <div class="shot-bar">
              <i></i><i></i><i></i>
              <span id="tour-url">app.contentlineup.com / ideas</span>
            </div>
            <div class="tour-shots">
              ${stages
                .map(
                  (s, i) => `
              <img class="tour-shot${i === 0 ? ' is-on' : ''}" data-shot="${s.id}"
                   src="${screenSrc(s.screen)}" alt="${esc(screens[s.screen].alt)}"
                   width="1240" height="780" ${
                     i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'
                   } decoding="async">`
                )
                .join('')}
            </div>
          </div>
          <ol class="tour-rail" aria-hidden="true">
            ${stages
              .map(
                (s, i) =>
                  `<li class="tour-pip${i === 0 ? ' is-on' : ''}" data-pip="${s.id}"><span></span>${esc(
                    s.verb
                  )}</li>`
              )
              .join('')}
          </ol>
        </div>
      </div>

      <ol class="tour-steps">
        ${stages
          .map(
            (s, i) => `
        <li class="tour-step${i === 0 ? ' is-on' : ''}" data-step="${s.id}" id="stage-${s.id}">
          <span class="tour-n">${esc(s.n)}</span>
          <h3>${esc(s.title)}</h3>
          <p class="tour-short">${esc(s.short)}</p>
          <p>${esc(s.body)}</p>
          <ul class="check-list">
            ${s.detail.map((d) => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('')}
          </ul>
          <div class="tour-step-shot reveal reveal-late">
            <div class="tour-frame">
              <div class="shot-bar"><i></i><i></i><i></i><span>app.contentlineup.com / ${esc(s.screen)}</span></div>
              <img src="${screenSrc(s.screen)}" alt="${esc(screens[s.screen].alt)}"
                   width="1240" height="780" loading="lazy" decoding="async">
            </div>
          </div>
          ${s.id === 'idea' ? ideaDemoBlock() : ''}
        </li>`
          )
          .join('')}
      </ol>
    </div>

    <div class="cta-row reveal tour-cta">
      ${btn(cta.primary.label, cta.primary.href, 'primary', true)}
      ${btn('See the full walkthrough', '/how-it-works', 'secondary')}
    </div>
  </div>
</section>`;

/* ==========================================================================
   05 — Teams & campaigns
   ========================================================================== */
const STATE_LABEL = { draft: 'Draft', review: 'In review', scheduled: 'Scheduled', published: 'Published' };

export const teamsSection = () => `
<section class="sec sec-paper" id="teams">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Teams, brands & campaigns',
      title: 'One calendar for every client.',
      lead:
        'Brand &rarr; Campaign &rarr; Post &rarr; Approval. Every brand keeps its own voice, its own channels and its own reviewer. You switch between them from one login.',
    })}

    ${appShell({
      active: 'list',
      title: 'Content',
      subtitle: 'All accounts · 5 brands · 12 campaigns',
      action: 'New article',
      workspace: 'All accounts',
      initials: 'MC',
      kind: 'Meridian Collective',
      body: `
    <div class="tree reveal" data-tabs>
      <div class="tree-accounts" role="tablist" aria-label="Accounts" aria-orientation="vertical">
        ${accountTree
          .map(
            (a, i) => `
        <button class="tree-acct" role="tab" id="acct-${a.id}" aria-controls="acctp-${a.id}"
                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
          <span class="tree-av tone-${a.tone}">${esc(a.initials)}</span>
          <span class="tree-acct-txt">
            <b>${esc(a.name)}</b>
            <span>${esc(a.kind)}</span>
          </span>
        </button>`
          )
          .join('')}
        <p class="tree-more">5 accounts on Team, 25 on Agency.</p>
      </div>

      <div class="tree-panels">
        ${accountTree
          .map(
            (a, i) => `
        <div class="tree-panel" role="tabpanel" id="acctp-${a.id}" aria-labelledby="acct-${a.id}"${
              i === 0 ? '' : ' hidden'
            }>
          <div class="tree-panel-head">
            <div>
              <span class="tree-crumb">Account</span>
              <h3>${esc(a.name)}</h3>
            </div>
            <p class="tree-reviewer">${icon('check')}Approves: <b>${esc(a.reviewer)}</b></p>
          </div>
          ${a.campaigns
            .map(
              (c) => `
          <div class="tree-campaign">
            <div class="tree-camp-head">
              <span class="tree-crumb">Campaign</span>
              <b>${esc(c.name)}</b>
              <span class="tree-window">${esc(c.window)}</span>
            </div>
            <ul class="tree-items">
              ${c.items
                .map(
                  (it) => `
              <li class="tree-item">
                <span class="brand-av" aria-hidden="true">${esc(a.initials)}</span>
                <span class="tree-item-title">${esc(it.title)}</span>
                <span class="chan">${icon(CHANNEL_ICON[it.channel] || 'pen')}<span>${esc(it.channel)}</span></span>
                <span class="state state-${it.state}"><span class="tick"></span>${esc(
                  STATE_LABEL[it.state] || it.state
                )}</span>
              </li>`
                )
                .join('')}
            </ul>
          </div>`
            )
            .join('')}
        </div>`
          )
          .join('')}
      </div>
    </div>`,
    })}

    <div class="cta-row reveal" style="margin-top:30px">
      ${btn('See team features', '/features#approvals', 'secondary', true)}
    </div>
  </div>
</section>`;

/* ==========================================================================
   06 — One idea, every channel
   ========================================================================== */
/* --------------------------------------------------------------------------
   Channel previews
   --------------------------------------------------------------------------
   Four post mockups that each read as their own platform through layout and
   icon vocabulary alone. No platform logo, wordmark or brand colour appears
   inside a card — the tab above it already says which channel this is, and
   reproducing someone's mark inside a product screenshot is not ours to do.

   Everything shares one shell (white card, same radius, border, shadow and
   initials avatar) so the four feel like one set; only the internals differ.
-------------------------------------------------------------------------- */

/** The action row every social card ends with. */
const pvActions = (items) => `
<div class="pv-actions">
  ${items
    .map(
      (a) =>
        `<span class="pv-act${a.solo ? ' is-solo' : ''}">${icon(a.i)}${
          a.label ? `<b>${esc(a.label)}</b>` : ''
        }</span>`
    )
    .join('')}
</div>`;

const previewArticle = (o) => `
<article class="post-preview pv-blog">
  <div class="pv-head">
    <span class="pv-av">${esc(initials(channelDemo.account))}</span>
    <div class="pv-who"><b>${esc(channelDemo.account)}</b><span>${esc(o.preview.updated)}</span></div>
  </div>
  <div class="pv-article">
    <!-- Styled as a headline, but not a heading element: this is the mockup of
         someone else's article, not a section of this page. As <h4> it skipped
         a level under the section's <h2> and broke the document outline. -->
    <p class="pv-title">${esc(o.title)}</p>
    <p class="pv-lede">${esc(o.lines[0])}</p>
    <ul class="pv-outline">
      ${o.lines
        .slice(1)
        .map((l) => `<li><span class="pv-h2">H2</span>${esc(l.replace(/^H2 · /, ''))}</li>`)
        .join('')}
    </ul>
    <p class="pv-meta">${esc(o.meta)} · ${o.preview.readMins} min read</p>
  </div>
</article>`;

const previewLinkedIn = (o) => {
  const p = o.preview;
  return `
<article class="post-preview pv-linkedin">
  <div class="pv-head">
    <span class="pv-av">${esc(initials(channelDemo.account))}</span>
    <div class="pv-who">
      <b>${esc(p.name)}</b>
      <span class="pv-sub">${esc(p.headline)}</span>
      <span class="pv-time">${esc(p.time)} · ${icon('globe')}</span>
    </div>
    <span class="pv-more">${icon('dots')}</span>
  </div>
  <div class="pv-body">
    ${o.lines.map((l) => (l === '' ? '<p class="pv-gap"></p>' : `<p>${esc(l)}</p>`)).join('')}
  </div>
  <a class="pv-link" tabindex="-1" aria-hidden="true">
    ${postMedia({ key: 'summer-ac', alt: 'A service technician in a Cool Care uniform opening a wall-mounted air-conditioning unit, a cover across it reading “please don’t use AC under maintenance”, and a gauge outside the window reading 42 degrees.' })}
    <div class="pv-link-meta">
      <b>${esc(p.link.title)}</b>
      <span>${esc(p.link.domain)}</span>
    </div>
  </a>
  <div class="pv-stats">
    <span class="pv-reacts">${icon('thumb')}${icon('heart')}</span>
    <span>${p.reactions}</span>
    <span class="pv-stats-r">${p.comments} comments · ${p.reposts} reposts</span>
  </div>
  ${pvActions([
    { i: 'thumb', label: 'Like' },
    { i: 'bubble', label: 'Comment' },
    { i: 'repost', label: 'Repost' },
    { i: 'send', label: 'Send' },
  ])}
</article>`;
};

const previewInstagram = (o) => {
  const p = o.preview;
  const caption = o.lines.filter((l) => l !== '');
  return `
<article class="post-preview pv-instagram">
  <div class="pv-head pv-head-ig">
    <span class="pv-av">${esc(initials(channelDemo.account))}</span>
    <div class="pv-who">
      <b>${esc(p.user)}</b>
      <span class="pv-sub">${esc(p.place)}</span>
    </div>
    <span class="pv-more">${icon('dots')}</span>
  </div>
  ${postMedia({ key: 'summer-ac', alt: 'A service technician in a Cool Care uniform opening a wall-mounted air-conditioning unit, a cover across it reading “please don’t use AC under maintenance”, and a gauge outside the window reading 42 degrees.' })}
  ${pvActions([
    { i: 'heart' },
    { i: 'bubble' },
    { i: 'send' },
    { i: 'bookmark', solo: true },
  ])}
  <div class="pv-ig-body">
    <p class="pv-likes">${p.likes} likes</p>
    <p class="pv-caption"><b>${esc(p.user)}</b> ${esc(caption[0])}</p>
    ${caption
      .slice(1, -1)
      .map((l) => `<p class="pv-caption">${esc(l)}</p>`)
      .join('')}
    <p class="pv-tags">${esc(caption[caption.length - 1])}</p>
    <p class="pv-comments">View all ${p.comments} comments</p>
    <p class="pv-time">${esc(p.time)}</p>
  </div>
</article>`;
};

const previewFacebook = (o) => {
  const p = o.preview;
  return `
<article class="post-preview pv-facebook">
  <div class="pv-head">
    <span class="pv-av">${esc(initials(channelDemo.account))}</span>
    <div class="pv-who">
      <b>${esc(p.page)}</b>
      <span class="pv-time">${esc(p.time)} · ${icon('globe')}</span>
    </div>
    <span class="pv-more">${icon('dots')}</span>
  </div>
  <div class="pv-body">
    ${o.lines.map((l) => (l === '' ? '<p class="pv-gap"></p>' : `<p>${esc(l)}</p>`)).join('')}
  </div>
  <div class="pv-link pv-link-fb">
    ${postMedia({ key: 'summer-ac', alt: 'A service technician in a Cool Care uniform opening a wall-mounted air-conditioning unit, a cover across it reading “please don’t use AC under maintenance”, and a gauge outside the window reading 42 degrees.' })}
    <div class="pv-link-meta">
      <span>${esc(p.link.domain)}</span>
      <b>${esc(p.link.title)}</b>
    </div>
  </div>
  <div class="pv-stats">
    <span class="pv-reacts">${icon('thumb')}${icon('heart')}</span>
    <span>${p.reactions}</span>
    <span class="pv-stats-r">${p.comments} comments · ${p.shares} shares</span>
  </div>
  ${pvActions([
    { i: 'thumb', label: 'Like' },
    { i: 'bubble', label: 'Comment' },
    { i: 'send', label: 'Share' },
  ])}
</article>`;
};

const PREVIEWS = {
  blog: previewArticle,
  linkedin: previewLinkedIn,
  instagram: previewInstagram,
  facebook: previewFacebook,
};

const channelPreview = (o) => (PREVIEWS[o.id] || previewArticle)(o);

export const channelsSection = () => `
<section class="sec" id="channels">
  <div class="wrap">
    ${sectionHead({
      kicker: 'One idea, every channel',
      title: 'Write it once. It arrives in the right shape everywhere.',
      lead:
        'Each channel gets its own version, not the same headline pasted three times. Pick a tab and see what one idea turns into.',
    })}

    <div class="morph reveal" data-tabs>
      <div class="morph-source">
        <span class="morph-k">The idea</span>
        <p class="morph-idea">${esc(channelDemo.idea)}</p>
        <span class="morph-acct">${esc(channelDemo.account)}</span>
        <span class="morph-arrow" aria-hidden="true">${icon('arrow')}</span>
      </div>

      <div class="morph-out">
        <div class="tabs-bar morph-tabs" role="tablist" aria-label="Output channel">
          ${channelDemo.outputs
            .map(
              (o, i) => `
          <button class="tab-btn" role="tab" id="ch-${o.id}" aria-controls="chp-${o.id}"
                  aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(o.label)}</button>`
            )
            .join('')}
        </div>
        ${channelDemo.outputs
          .map(
            (o, i) => `
        <div class="morph-panel" role="tabpanel" id="chp-${o.id}" aria-labelledby="ch-${o.id}"${
              i === 0 ? '' : ' hidden'
            }>
          ${channelPreview(o)}
          <p class="pv-foot">${esc(o.foot)}</p>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </div>
</section>`;

/* ==========================================================================
   07 — AI drafts it. You decide.
   ========================================================================== */
export const aiSection = () => `
<section class="sec sec-paper" id="ai">
  <div class="wrap">
    <div class="split">
      <div class="split-text reveal">
        ${eyebrow('AI and manual, side by side')}
        <h2>AI drafts it. <em>You decide.</em></h2>
        <p class="lead">
          ContentLineup is not a content farm. The AI gets you a structured first draft in about a minute &mdash;
          then you edit it like a document, or ask for a change in plain English and watch that one section
          rewrite itself. Nothing publishes until a person approves it.
        </p>
        <ul class="check-list">
          <li>${icon('check')}<span><b>Generate with AI</b> &mdash; outline first, in your brand voice</span></li>
          <li>${icon('check')}<span><b>Or write manually</b> &mdash; a blank editor, no AI involved</span></li>
          <li>${icon('check')}<span>Revise by asking: &ldquo;make the intro shorter&rdquo;, &ldquo;add a table&rdquo;</span></li>
          <li>${icon('check')}<span><b>Captions and hashtags</b> &mdash; written per channel, from your account preset</span></li>
          <li>${icon('check')}<span>Full version history &mdash; roll back anything</span></li>
        </ul>
        <div class="cta-row" style="margin-top:26px">
          ${btn('See the editor', '/features#ai-writer', 'secondary', true)}
        </div>
      </div>

      <div class="split-visual reveal">
        <div class="aidemo" id="ai-demo" data-instructions='${esc(JSON.stringify(aiDemo.instructions))}'>
          <div class="aidemo-head">
            <span class="aidemo-modes" role="group" aria-label="Editor mode">
              <button type="button" class="aidemo-mode is-on" data-mode="ai" aria-pressed="true">Generate with AI</button>
              <button type="button" class="aidemo-mode" data-mode="manual" aria-pressed="false">Write manually</button>
            </span>
            <span class="aidemo-sec">${esc(aiDemo.section)}</span>
          </div>
          <div class="aidemo-doc">
            <p class="aidemo-text" id="ai-demo-text">${esc(aiDemo.original)}</p>
            <div class="aidemo-table" id="ai-demo-table" hidden>
              <table>
                <colgroup>${aiDemo.table.cols.map((w) => `<col style="width:${w}">`).join('')}</colgroup>
                <thead><tr>${aiDemo.table.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
                <tbody>${aiDemo.table.rows
                  .map((r) => `<tr>${r.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`)
                  .join('')}</tbody>
              </table>
            </div>
            <p class="aidemo-manual" id="ai-demo-manual" hidden>${esc(aiDemo.manualPlaceholder)}<span class="aidemo-caret"></span></p>
          </div>
          <div class="aidemo-ask">
            <span class="aidemo-k">Ask for a change</span>
            <div class="aidemo-btns">
              ${aiDemo.instructions
                .map(
                  (ins, i) =>
                    `<button class="aidemo-btn" type="button" data-ins="${i}" aria-pressed="false">${esc(
                      ins.label
                    )}</button>`
                )
                .join('')}
              <button class="aidemo-btn aidemo-reset" type="button" data-ins="reset">Undo</button>
            </div>
          </div>
          <p class="aidemo-fine">Only the selected section changes. Everything else stays exactly as you left it.</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

/* ==========================================================================
   08 — Proof
   ========================================================================== */
export const proofSection = (caseStudy) => `
<section class="sec sec-ink" id="proof">
  <div class="wrap">
    <div class="proof">
      <div class="reveal">
        ${eyebrow('Customer story')}
        <p class="proof-quote">
          &ldquo;I knew exactly what to write. I had the list. What I did not have was a Tuesday evening
          where nothing else was on fire &mdash; which turns out to be the only input the old process actually needed.&rdquo;
        </p>
        <div class="proof-by">
          <span class="proof-av">IM</span>
          <div>
            <b>Iman Marsh</b>
            <span>Owner, Northgate Air &middot; 9-person HVAC company</span>
          </div>
        </div>
        <p class="proof-disclosure">
          <b>Composite customer story.</b> The workflow, timings and figures below reflect real usage
          patterns we see across local service businesses; the company and the people in it are
          illustrative, not a single named customer.
        </p>
        ${
          caseStudy
            ? `<div class="cta-row" style="margin-top:26px">
          <a class="btn btn-light" href="${caseStudy.path}">Read the case study ${icon('arrow')}</a>
        </div>`
            : ''
        }
      </div>
      <div class="metrics reveal-stagger">
        <div class="metric"><b data-count="8" data-prefix="2 &rarr; ">2 &rarr; 8</b><span>posts per year to posts per month</span></div>
        <div class="metric sched"><b data-count="47" data-suffix=" min">47 min</b><span>total human time per week</span></div>
        <div class="metric"><b data-count="1237" data-prefix="+" data-suffix="%">+1,237%</b><span>organic impressions in 6 months</span></div>
        <div class="metric sched"><b data-count="19" data-prefix="3 &rarr; ">3 &rarr; 19</b><span>organic enquiries per month</span></div>
      </div>
    </div>
  </div>
</section>`;

/* ==========================================================================
   09 — Who it's for
   ========================================================================== */
export const audienceSection = () => `
<section class="sec" id="who">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Who it’s for',
      title: 'Three kinds of team, one bottleneck.',
      lead: 'Different weeks, same problem: content that gets written, then gets stuck on the way out.',
      align: 'center',
    })}
    <div class="who-grid reveal-stagger">
      ${homeNiches
        .map(
          (n) => `
      <article class="who-card">
        <span class="who-icon">${icon(
          n.id === 'owners' ? 'spark' : n.id === 'teams' ? 'layers' : 'team'
        )}</span>
        <h3>${esc(n.label)}</h3>
        <p class="who-head">${esc(n.headline)}</p>
        <p class="who-prob"><b>The problem &mdash;</b> ${esc(n.problem)}</p>
        <p class="who-sol"><b>With ContentLineup &mdash;</b> ${esc(n.solution)}</p>
        <div class="who-stats">
          ${n.stats.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}
        </div>
        <a class="who-link" href="/made-for#${n.id}">See the full breakdown ${icon('arrow')}</a>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;

/* ==========================================================================
   10 — Pricing
   ========================================================================== */
export const pricingSection = () => `
<section class="sec sec-cream" id="pricing">
  <div class="wrap">
    ${sectionHead({
      kicker: 'Pricing',
      title: 'Start free. Upgrade when you outgrow it.',
      lead:
        'Every plan gives you the whole workflow &mdash; ideas, calendar, approvals, publishing and export. What changes between them is how many posts, accounts and seats you get.',
      align: 'center',
    })}
    ${billingToggle()}
    <div class="price-row reveal-stagger">
      ${plans
        .map(
          (p) => `
      <article class="price-card${p.featured ? ' featured' : ''}">
        ${p.featured ? `<span class="price-flag">${esc(p.kicker)}</span>` : ''}
        <h3>${esc(p.name)}</h3>
        <p class="price-outcome">${esc(p.outcome)}</p>
        ${
          p.annual
            ? `<div class="price-fig">
          <span class="price-when for-monthly"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></span>
          <span class="price-when for-annual"><b>${esc(p.annual.perMonth)}</b><span>${esc(p.period)}</span></span>
        </div>
        <p class="bill-note for-monthly">or ${esc(p.annual.price)} a year &mdash; ${esc(p.annual.saving)}</p>
        <p class="bill-note for-annual">${esc(p.annual.price)} billed yearly &middot; ${esc(p.annual.saving)}</p>`
            : `<div class="price-fig"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
        <p class="bill-note">Free on either billing period.</p>`
        }
        <a class="btn ${p.featured ? 'btn-primary' : 'btn-secondary'} btn-block" href="${
            p.cta.href
          }" data-cta="home-pricing-${p.id}">${esc(p.cta.label)}</a>
        <ul class="price-inc">
          ${p.includes
            .slice(0, 5)
            .map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`)
            .join('')}
        </ul>
      </article>`
        )
        .join('')}
    </div>

  </div>
</section>`;

/* ==========================================================================
   11 — FAQ + resources
   ========================================================================== */
export const resourceStrip = (items) => `
<div class="res-strip">
  <div class="res-strip-head">
    <h3>Keep reading</h3>
    <a class="res-all" href="/resources">All resources ${icon('arrow')}</a>
  </div>
  <div class="res-cards">
    ${items
      .map(
        (p) => `
    <a class="res-card" href="${p.path}">
      <span class="res-cat">${esc(p.categoryLabel)}</span>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.excerpt)}</p>
      <span class="res-more">${p.readMins} min read ${icon('arrow')}</span>
    </a>`
      )
      .join('')}
  </div>
</div>`;
