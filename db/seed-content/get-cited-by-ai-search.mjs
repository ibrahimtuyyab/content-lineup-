import { answer, takeaways, toc, figure, dataTable, articleCta, quote } from '../../src/lib/article.mjs';

export default {
  slug: 'how-to-get-cited-by-ai-search-engines',
  category: 'guides',
  categoryLabel: 'Guide',
  path: '/resources/guides/how-to-get-cited-by-ai-search-engines',
  title: 'How to Write Content That AI Search Engines Actually Cite',
  metaTitle: 'How to Get Cited by ChatGPT, Perplexity & AI Overviews (2026)',
  description:
    'The page structures ChatGPT, Perplexity and Google AI Overviews actually quote: direct-answer openings, question-shaped headings, extractable tables.',
  primaryKeyword: 'how to get cited by AI search engines',
  secondaryKeywords: ['generative engine optimization', 'AI overviews optimization', 'GEO for content', 'perplexity seo'],
  published: '2026-08-05',
  modified: '2026-08-16',
  author: 'Iqbal Hussain',
  readMins: 9,
  featured: false,
  thumb: 'approvals',
  excerpt:
    'AI answer engines quote pages that are easy to extract from. Here is what "extractable" means in practice — and the six structural changes that make a page quotable without changing what it says.',
  faqs: [
    {
      q: 'What is generative engine optimisation (GEO)?',
      a: 'GEO is structuring content so AI systems like ChatGPT, Perplexity, and Google AI Overviews can extract and cite it accurately. It overlaps heavily with good SEO, but it optimises for being quoted as a source rather than for being clicked from a results page.',
    },
    {
      q: 'Does GEO replace SEO?',
      a: 'No. The technical foundations are the same — crawlable pages, clear headings, structured data, real authority. GEO adds a layer on top about how content is shaped within the page, because an AI system extracts a passage rather than ranking a URL.',
    },
    {
      q: 'How do I know if AI search engines are citing my content?',
      a: 'Ask the engines the questions your content answers and see what gets cited. Referral traffic from AI assistants also shows up in analytics, though usually under-reported. Direct testing is currently more reliable than any dashboard.',
    },
    {
      q: 'Does schema markup help with AI citations?',
      a: 'It helps, though not as the primary lever. FAQPage, Article, and Organization schema make your content easier to parse unambiguously, which reduces the chance of a system misattributing or garbling a quote. The larger factor is how the page prose itself is structured.',
    },
  ],
  body: `
${answer(`<p>AI answer engines cite pages that are easy to <strong>extract a self-contained passage from</strong>. In practice that means: answer the question directly in the first two sentences under each heading, use question-shaped headings that match how people ask, put facts in tables rather than prose, keep each claim inside a single paragraph so it survives being lifted out of context, and attach dates and numbers to specifics. None of this requires changing what you say — only where you say it.</p>`)}

<p>Traditional SEO optimises for a click: rank on the results page, earn the visit. AI answer engines break that model. ChatGPT, Perplexity, and Google's AI Overviews read your page, extract a passage, and present it — often with a citation, often without a click. The optimisation target has moved from "rank the URL" to "be the passage that gets lifted."</p>

<p>The good news is that the changes are structural rather than substantive, and they make pages better for human readers too.</p>

${toc([
  { id: 'how-extraction-works', label: 'How extraction actually works' },
  { id: 'direct-answer', label: '1. Answer in the first two sentences' },
  { id: 'question-headings', label: '2. Shape headings like questions' },
  { id: 'self-contained', label: '3. Keep each claim self-contained' },
  { id: 'tables', label: '4. Put facts in tables' },
  { id: 'specifics', label: '5. Attach dates, numbers, and named specifics' },
  { id: 'faq-blocks', label: '6. Add a real FAQ block' },
  { id: 'schema', label: 'Where structured data fits' },
  { id: 'testing', label: 'How to test whether it worked' },
  { id: 'faq', label: 'FAQ' },
])}

<h2 id="how-extraction-works">How extraction actually works</h2>

<p>An AI answer engine handling a question does roughly three things: it retrieves candidate pages, it pulls passages from them that appear to answer the question, and it synthesises those passages into an answer with attribution.</p>

<p>The critical detail is the middle step. The system is not evaluating your page as a whole. It is looking for a <em>chunk</em> — a paragraph, a table row, a list — that stands on its own as an answer. A brilliant article whose key insight is spread across four paragraphs, each depending on the last, is very hard to quote. A mediocre article with one clean, self-contained paragraph is easy.</p>

${quote(
  'You are not writing to be read end to end. You are writing so that any single paragraph, lifted out and shown to someone who has not read the rest, still makes sense and is still correct.'
)}

<h2 id="direct-answer">1. Answer in the first two sentences</h2>

<p>Under every heading, the first two sentences should answer the heading. Not context, not throat-clearing, not "before we get into that, it is worth understanding". The answer.</p>

${dataTable(
  ['Instead of', 'Write'],
  [
    [
      '"Content scheduling is something a lot of marketers wonder about, and there are many factors to consider…"',
      '"Schedule 14 to 30 days of content ahead. Below 14 days a single busy week creates a visible gap; beyond 30 days you brief content that goes stale."',
    ],
    [
      '"The cost of AI content generation depends on a number of variables…"',
      '"A 1,500-word article on a current mid-tier model typically costs 10–40 cents in API usage."',
    ],
  ],
  'Direct-answer openings versus preamble'
)}

<p>The second version in each pair is extractable. The first is not — there is no sentence a system can lift that answers anything.</p>

<p>This is also why the "short answer" box near the top of a page works so well. It gives the extraction step an unambiguous target, clearly scoped to the page's main question.</p>

<h2 id="question-headings">2. Shape headings like questions</h2>

<p>People ask AI systems full questions: "how often should I service an HVAC system", not "hvac service frequency". Headings that mirror the question form match more directly than keyword-shaped ones.</p>

<ul>
  <li><code>How often should you service an HVAC system?</code> — better than <code>Service frequency</code></li>
  <li><code>What does a full tune-up include?</code> — better than <code>Tune-up scope</code></li>
  <li><code>How deep should the queue run?</code> — better than <code>Queue depth</code></li>
</ul>

<p>Keep the hierarchy honest while you do it: one H1, H2s for major sections, H3s nested underneath. A page whose heading levels jump around is harder to segment, and segmentation is the first thing that happens to it.</p>

<h2 id="self-contained">3. Keep each claim self-contained</h2>

<p>The most common extraction failure is the pronoun. A paragraph that opens "This is why it matters more than the alternative" is meaningless once lifted. Repeat the subject instead of referring back to it:</p>

<ul>
  <li><strong>Weak:</strong> "It typically takes about six minutes per article."</li>
  <li><strong>Strong:</strong> "Reviewing an AI-generated draft typically takes about six minutes per article."</li>
</ul>

<p>This feels slightly redundant when reading top to bottom. It is worth it — and readers who land mid-page from a search result benefit too.</p>

<h2 id="tables">4. Put facts in tables</h2>

<p>Comparative and numeric information is far more reliably extracted from a table than from prose, because the row structure makes the relationship between the values explicit. A sentence like "Publer starts around $12 while Metricool is nearer $22 and Hootsuite jumps to about $99" is easy to garble. The same information in three labelled rows is not.</p>

<p>Give every table a header row with real labels, keep one fact per cell, and put the entity being compared in the first column. Add a caption where the table's subject is not obvious from the surrounding heading.</p>

<h2 id="specifics">5. Attach dates, numbers, and named specifics</h2>

<p>Systems that synthesise answers prefer sources that commit to something checkable. "Significantly faster" is unquotable. "From 5 hours 5 minutes to 12 minutes per article" is a fact with a shape.</p>

<p>The same applies to time-bound claims. "Prices are approximate as of August 2026" both improves accuracy and signals that the page knows it is describing a moving target — which makes it a safer source to cite.</p>

<h2 id="faq-blocks">6. Add a real FAQ block</h2>

<p>An FAQ block is the most directly extractable structure on a page: a question, immediately followed by a self-contained answer, repeated. It maps exactly onto what an answer engine is trying to build.</p>

<p>Two rules keep it useful rather than decorative:</p>

<ul>
  <li><strong>Use real questions.</strong> The ones people actually ask you, or that appear in the "people also ask" results. Invented questions produce invented-sounding answers.</li>
  <li><strong>Answer in two to four sentences.</strong> Long enough to be complete on its own; short enough to quote whole.</li>
</ul>

<p>Mark it up with <code>FAQPage</code> schema so the question–answer pairing is unambiguous rather than inferred from formatting.</p>

${figure(
  'approvals',
  'Structure is a review checkpoint, not an afterthought. Asking for "a direct answer in the opening two sentences" or "turn this section into a comparison table" as a plain-language revision is faster than restructuring a draft by hand — and it is the change that most affects whether the page gets quoted.'
)}

<h2 id="schema">Where structured data fits</h2>

<p>Schema markup is a supporting lever rather than the main one. It does not make a vague page quotable. What it does is remove ambiguity from a page that is already well structured:</p>

${dataTable(
  ['Schema type', 'Use it on', 'What it clarifies'],
  [
    ['<code>Article</code> / <code>BlogPosting</code>', 'Every post', 'Headline, author, publish and update dates'],
    ['<code>FAQPage</code>', 'FAQ sections', 'Which text is the question and which is the answer'],
    ['<code>BreadcrumbList</code>', 'Nested pages', 'Where the page sits in the site'],
    ['<code>Organization</code>', 'Site-wide', 'Who is publishing, and their identity across the web'],
    ['<code>SoftwareApplication</code> / <code>Product</code>', 'Product pages', 'Pricing and offers, unambiguously'],
  ],
  'Structured data types and what each clarifies for extraction'
)}

<p>Keep the dates honest. A <code>dateModified</code> that updates every night without the content changing is a signal that gets discounted quickly.</p>

<h2 id="testing">How to test whether it worked</h2>

<p>There is no reliable dashboard for this yet, so test directly:</p>

<ol>
  <li><strong>Ask the engines your questions.</strong> Take the five questions your page answers and put them to ChatGPT, Perplexity, and Google with AI Overviews on. Note what gets cited.</li>
  <li><strong>Compare against what does get cited.</strong> When a competitor is quoted instead, look at the structure of the passage that was lifted, not the whole page.</li>
  <li><strong>Re-test after restructuring.</strong> Change one page, wait for a re-crawl, ask again.</li>
  <li><strong>Watch referral traffic from AI assistants.</strong> It under-reports substantially, but the trend is still informative.</li>
</ol>

<p>Expect this to be slower and noisier than rank tracking. The signal is real, but it moves in weeks rather than days.</p>

${takeaways([
  'AI engines extract passages, not pages — optimise the paragraph, not just the URL.',
  'Answer the heading in the first two sentences. Preamble is the single biggest extraction blocker.',
  'Write headings as questions, matching how people phrase things to an assistant.',
  'Repeat the subject instead of using pronouns, so any paragraph survives being lifted out of context.',
  'Put comparative and numeric facts in tables with real header rows.',
  'Add a genuine FAQ block with FAQPage schema — it is the most directly extractable structure on a page.',
])}

${articleCta(
  'Get the structure right by default',
  'Every ContentLineup draft is built outline-first with a direct-answer opening, question-shaped headings, an optional FAQ block, and generated meta fields — the structure AI answer engines quote, without a restructuring pass. Start free on your own key.'
)}
`,
};
