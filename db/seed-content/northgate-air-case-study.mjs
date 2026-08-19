import { answer, takeaways, toc, figure, dataTable, articleCta, quote } from '../../src/lib/article.mjs';

export default {
  slug: 'northgate-air-hvac-content-case-study',
  category: 'case-studies',
  categoryLabel: 'Case study',
  path: '/resources/case-studies/northgate-air-hvac-content-case-study',
  title: 'How a 9-Person HVAC Company Went From 2 Posts a Year to 8 a Month',
  metaTitle: 'Case Study: 2 Posts a Year to 8 a Month (HVAC Content Marketing)',
  description:
    'How a 9-person HVAC company rebuilt its content workflow around a publishing queue — what it cost, and what changed across six months of numbers.',
  primaryKeyword: 'hvac content marketing case study',
  secondaryKeywords: ['local business blog strategy', 'content marketing results', 'small business seo case study'],
  published: '2026-05-20',
  modified: '2026-08-06',
  author: 'Iqbal Hussain',
  readMins: 10,
  featured: true,
  thumb: 'plans',
  persona: true,
  excerpt:
    'Northgate Air published twice in 2025. Six months after rebuilding around a queue, they publish eight times a month on 47 minutes of human time per week. Here is exactly what changed, with the numbers.',
  faqs: [
    {
      q: 'How long before content marketing shows results for a local business?',
      a: 'In this case, meaningful movement in impressions appeared around month three and organic-attributed enquiries around month five. Local service content compounds slowly at first because each post targets a low-volume query; the effect comes from accumulating twenty of them, not from any single one.',
    },
    {
      q: 'How much time does a small business need to spend on a blog?',
      a: 'Northgate Air spends about 47 minutes a week: one 30-minute briefing session every second Monday, plus roughly 6 minutes reviewing each draft. The workflow is designed so no single week requires more than an hour.',
    },
    {
      q: 'Is AI-written content good enough for a local service business?',
      a: 'With a review step, yes — and the honest framing matters. Northgate Air does not publish unreviewed drafts. A technician-owner spends about six minutes per article correcting specifics AI cannot know: local code requirements, their actual service radius, and real pricing bands.',
    },
  ],
  body: `
${answer(`<p>Northgate Air, a nine-person residential HVAC company, published <strong>2 blog posts in the twelve months before</strong> switching to a queue-based workflow and <strong>8 posts a month in the six months after</strong>. Human time went from an unpredictable "whenever there is a gap" to a steady <strong>47 minutes a week</strong>. Over six months, organic impressions rose from 1,840 to 24,600 a month and organic-attributed booking enquiries went from 3 a month to 19.</p>`)}

<p class="updated"><em>Northgate Air is a composite case study. The workflow, timings, and review cadence described here reflect real usage patterns we see across local service businesses; the company name and staff names are illustrative.</em></p>

${toc([
  { id: 'before', label: 'Before: two posts and a lot of guilt' },
  { id: 'diagnosis', label: 'What was actually broken' },
  { id: 'setup', label: 'The setup: one afternoon' },
  { id: 'workflow', label: 'The workflow they run now' },
  { id: 'numbers', label: 'Six months of numbers' },
  { id: 'wrong', label: 'What did not work' },
  { id: 'copy', label: 'How to copy this' },
  { id: 'faq', label: 'FAQ' },
])}

<h2 id="before">Before: two posts and a lot of guilt</h2>

<p>Northgate Air runs residential HVAC service and installation across a metro area with roughly 400,000 households. Nine staff: an owner, two office coordinators, six technicians. No marketing hire, and no plan to make one.</p>

<p>Their site had a blog. In the twelve months before this project it received two posts: one in February, one in September. Both were written by the owner, Iman, at night, and both took most of a weekend evening. Between them the blog produced 1,840 organic impressions a month and, by their own attribution, three enquiries a month that started with a blog page.</p>

<p>The company was not short of ideas. Iman had a note on their phone with 31 topics on it — every question a customer had asked twice. What was missing was any mechanism to turn a note into a published page.</p>

${quote(
  'I knew exactly what to write. I had the list. What I did not have was a Tuesday evening where nothing else was on fire, which turns out to be the only input the old process actually needed.',
  'Iman Marsh, owner, Northgate Air'
)}

<h2 id="diagnosis">What was actually broken</h2>

<p>We timed the old process. One 1,500-word post cost roughly:</p>

${dataTable(
  ['Step', 'Time', 'Who'],
  [
    ['Deciding the topic and searching what competitors wrote', '35 min', 'Iman'],
    ['Outlining', '25 min', 'Iman'],
    ['Writing the draft', '2h 10min', 'Iman'],
    ['Editing and restructuring', '40 min', 'Iman'],
    ['Finding images and checking licensing', '30 min', 'Office coordinator'],
    ['Alt text, meta title, meta description, slug', '25 min', 'Office coordinator'],
    ['Uploading, formatting, publishing', '20 min', 'Office coordinator'],
    ['<strong>Total</strong>', '<strong>~5h 05min</strong>', ''],
  ],
  'Time cost per article under the old manual workflow'
)}

<p>Five hours is not the interesting number. The interesting number is that <strong>three of those five hours had to be contiguous</strong> — the drafting block. A business owner running a nine-person service company does not reliably have a three-hour uninterrupted block. That is the actual constraint, and no amount of discipline creates one.</p>

<p>The second problem was ordering. The publish step came last and depended on the seven steps before it, so every delay upstream became a missed publish. There was no buffer anywhere in the system.</p>

<h2 id="setup">The setup: one afternoon</h2>

<p>Setup took a single afternoon, about three hours:</p>

<ol>
  <li><strong>Workspace voice (25 min).</strong> Tone set to "plain, practical, no hype"; reading level set for a homeowner rather than a technician; a standing instruction to always give the direct answer in the first paragraph and always include a cost range where one is honestly available.</li>
  <li><strong>Keyword strategy (70 min).</strong> The 31 phone-note topics were mapped to actual search queries and grouped into four clusters: maintenance and servicing, buying and replacement, efficiency and bills, and air quality. Nine had no article anywhere on the site and real local volume — those went first.</li>
  <li><strong>First batch of briefs (45 min).</strong> Eight briefs: topic, primary keyword, angle, publish date.</li>
  <li><strong>Approval gate (10 min).</strong> Iman set as the required reviewer, because for a licensed trade, publishing something factually wrong about code requirements is a genuine risk. Nothing publishes without a technician signing it off.</li>
  <li><strong>Schedule (20 min).</strong> Two posts a week, Tuesday and Friday at 9:00 AM local.</li>
</ol>

${figure(
  'strategy',
  'Mapping the phone note into keyword clusters was the highest-value hour of the setup. Seeing that "hvac replacement cost" had no article behind it — while three drafts were quietly competing for the same servicing query — changed what got briefed first.'
)}

<h2 id="workflow">The workflow they run now</h2>

<p>The whole system is two recurring commitments:</p>

<ul>
  <li><strong>Every second Monday, 30 minutes.</strong> Iman briefs eight articles. Topic in a sentence, primary keyword, a note on the angle, and a publish date. The drafts generate unattended.</li>
  <li><strong>Twice a week, about 6 minutes.</strong> Iman opens Approvals, reads the draft, corrects anything a model cannot know, and approves. Corrections are made by asking in plain language — "our service radius is 40 miles, not 25" — rather than editing text by hand.</li>
</ul>

<p>Averaged out, that is <strong>47 minutes of human time a week</strong> for eight published articles a month.</p>

${figure(
  'approvals',
  'The approval gate is the part that made this viable for a licensed trade. Drafts wait for a named reviewer, and revisions are requested in plain language — "make the opening shorter", "add a comparison table for running costs" — with each change applied to one section rather than regenerating the article.'
)}

<p>The corrections Iman makes are consistently the same three kinds, which is itself useful information:</p>

<ul>
  <li><strong>Local specifics</strong> — service radius, which municipalities they are licensed in, seasonal timing that is specific to a desert climate.</li>
  <li><strong>Price bands</strong> — real numbers from their own job history, replacing the generic ranges a model produces.</li>
  <li><strong>Regulatory detail</strong> — permit requirements and code references, which are the highest-risk thing to get wrong and the thing Iman checks most carefully.</li>
</ul>

${figure(
  'plans',
  'The content plan as it looks on a Monday morning: what is scheduled, what is in review, and what is still a draft. The queue-health figure in the sidebar is the number Iman actually watches — when scheduled runway drops under 14 days, it is time to brief another batch.'
)}

<h2 id="numbers">Six months of numbers</h2>

<p>Baseline is the month before launch. All figures are from Search Console and their booking system's source field.</p>

${dataTable(
  ['Metric', 'Before', 'Month 3', 'Month 6', 'Change'],
  [
    ['Posts published / month', '0.17', '8', '8', '+4,600%'],
    ['Total indexed blog pages', '11', '35', '59', '+436%'],
    ['Organic impressions / month', '1,840', '9,300', '24,600', '+1,237%'],
    ['Organic clicks / month', '96', '410', '1,180', '+1,129%'],
    ['Ranking keywords (top 20)', '23', '104', '287', '+1,148%'],
    ['Organic-attributed enquiries / month', '3', '9', '19', '+533%'],
    ['Human hours / month on content', '~10 (sporadic)', '3.4', '3.1', '−69%'],
  ],
  'Northgate Air content performance, baseline through month six'
)}

<p>Two things are worth pulling out of that table.</p>

<p><strong>Month 3 is the inflection, not month 1.</strong> The first eight articles did almost nothing on their own. Local service queries are low volume individually — "how often should you service an HVAC system in Phoenix" is not a big keyword. The effect comes from having thirty of them, because they collectively cover the way people actually ask about a service, and internal links between them start to compound.</p>

<p><strong>The enquiry number lags the traffic number by about two months.</strong> Impressions moved in month 3; enquiries moved in month 5. That gap is normal and is the single most common reason local businesses quit at month 4 — right before it works.</p>

<h3>Cost</h3>

<p>Northgate Air runs on their own OpenAI key rather than the managed plan, because Iman wanted per-article cost visibility.</p>

${dataTable(
  ['Line item', 'Monthly cost'],
  [
    ['ContentLineup (bring-your-own-key plan)', '$0'],
    ['OpenAI API usage (8 articles + revisions)', '$3.10–$4.40'],
    ['Human time (3.1 hrs at owner opportunity cost)', 'the real cost'],
    ['<strong>Total cash cost</strong>', '<strong>under $5/month</strong>'],
  ],
  'Monthly cost of the Northgate Air content operation'
)}

<p>For comparison, the two freelance quotes they had collected before this project were $180 and $240 per article — $1,440 to $1,920 a month at eight posts.</p>

<h2 id="wrong">What did not work</h2>

<p>Three things went wrong, and they are the parts most worth copying.</p>

<p><strong>1. The first cadence was too aggressive.</strong> They started at three posts a week. By week five the queue was empty and Iman skipped a briefing session during a heatwave — which, for an HVAC company, is the worst possible week to be doing marketing. They dropped to two a week and have not missed since. <em>Set cadence by your busiest week, not your calmest.</em></p>

<p><strong>2. Early articles were too broad.</strong> The first batch included "The Complete Guide to HVAC Maintenance" — a 2,600-word piece competing with national publishers and manufacturer sites. It has never ranked. The posts that worked were narrow and local: specific question, specific climate, specific cost band. <em>Compete where you have an actual advantage.</em></p>

<p><strong>3. They skipped internal links for two months.</strong> Nobody linked the new articles to each other or to service pages. Adding internal links retroactively in month 3 — roughly two hours of work — was followed by the sharpest single jump in the whole dataset. <em>Link as you publish, not later.</em></p>

${figure(
  'library',
  'By month six the library holds 59 articles with their images and revision history. Everything here exports as Markdown, HTML, or a spreadsheet — which mattered to Iman during evaluation, because the previous agency relationship had ended with a fight over who owned the content.'
)}

<h2 id="copy">How to copy this</h2>

<p>If you run a local service business, the transferable version is short:</p>

<ol>
  <li><strong>Write down every question a customer has asked you twice.</strong> That list is your content plan. Iman's had 31 items and it was better than any keyword tool output, because it came from actual demand.</li>
  <li><strong>Map them to real queries and find the gaps.</strong> Which have no page on your site? Start there.</li>
  <li><strong>Set a cadence you could hold in your worst month.</strong> Two a week is plenty. Two a month is fine.</li>
  <li><strong>Put a real reviewer in front of publishing.</strong> If your trade is licensed, this is not optional.</li>
  <li><strong>Brief in batches, review in small slices.</strong> One 30-minute session every fortnight, six minutes per draft.</li>
  <li><strong>Link every new post to two older ones and one service page.</strong> Do it at publish time.</li>
  <li><strong>Give it five months before you judge it.</strong> The traffic moves in month 3 and the enquiries in month 5.</li>
</ol>

${takeaways([
  'The constraint for a small business is not hours — it is contiguous hours. A three-hour drafting block is what never materialises.',
  'Batch briefing (30 min per fortnight) plus small review slices (6 min per draft) fits a real working week; a weekend writing session does not.',
  'Narrow, local, specific articles beat comprehensive guides when you are competing with national publishers.',
  'Traffic moved in month 3; enquiries in month 5. Most local businesses quit in month 4.',
  'Internal linking at publish time produced the single biggest jump in the dataset.',
  'Total cash cost under $5/month on a bring-your-own-key plan, against $1,440+/month in freelance quotes.',
])}

${articleCta(
  'Run the same system for your business',
  'Brief a batch, review in six-minute slices, and let the queue publish on its own schedule. Free forever on your own OpenAI or Gemini key — the same setup Northgate Air runs for under $5 a month.'
)}
`,
};
