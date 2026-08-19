import { answer, figure, dataTable, articleCta } from '../../src/lib/article.mjs';

export default {
  slug: 'product-update-august-2026',
  category: 'product-updates',
  categoryLabel: 'Product update',
  path: '/resources/product-updates/product-update-august-2026',
  title: 'Product Update — August 2026: Managed Keys, Approvals, and What Is Next',
  metaTitle: 'ContentLineup Product Update — August 2026',
  description:
    'What shipped this quarter — the managed AI key, approvals, spreadsheet export and team seats — plus an honest status on the three roadmap features.',
  primaryKeyword: 'contentlineup product update',
  secondaryKeywords: ['contentlineup roadmap', 'managed api key', 'content approval workflow'],
  published: '2026-08-18',
  modified: '2026-08-18',
  author: 'Iqbal Hussain',
  readMins: 5,
  featured: false,
  thumb: 'settings',
  excerpt:
    'The managed AI key, approvals, spreadsheet export, and team seats all shipped this quarter. Here is what each one does — and an honest status on the three roadmap items still labelled Coming Soon.',
  body: `
${answer(`<p>Four things shipped this quarter: the <strong>managed AI key</strong> (use ContentLineup without an OpenAI or Gemini account), the <strong>approval workflow</strong>, <strong>spreadsheet export</strong> of the whole content plan, and <strong>team seats</strong> with per-workspace roles. Three roadmap items — the editorial calendar, recurring publish slots, and bulk briefs — are still in development and remain labelled Coming Soon everywhere on this site.</p>`)}

<h2>Shipped: the managed AI key</h2>

<p>Until this quarter, using ContentLineup meant having an OpenAI or Gemini account and pasting a key. That is fine for people who already live in a provider dashboard and a genuine barrier for everyone else — and "everyone else" turned out to be most of the people who needed the product.</p>

<p>The managed key removes that step entirely. Sign up, brief a topic, generate. Generation runs on our provider account and is included in the plan price, with a monthly article allowance instead of a per-token bill.</p>

<p>The bring-your-own-key plan has not changed and is not going away. It remains free, uncapped, and the cheaper option at volume. What is new is that both now live side by side and switch with a toggle:</p>

${figure(
  'settings',
  'Both modes in one place. Choosing the managed key needs no configuration; bringing your own means pasting a key that is encrypted at rest and shown only by its last four characters afterwards. Switching modes does not affect existing drafts, scheduled posts, or the library.'
)}

${dataTable(
  ['', 'Managed key', 'Bring your own key'],
  [
    ['Setup', 'None', 'Paste an OpenAI or Gemini key'],
    ['Who is billed for tokens', 'Included in your plan', 'Your provider, at cost'],
    ['Article cap', '40/mo (Managed), 175/mo (Agency)', 'None from us'],
    ['Model choice', 'Managed for you', 'You pick the model'],
    ['Price', '$29/mo or $89/mo', '$0/mo'],
  ],
  'Managed key versus bring-your-own key'
)}

<h2>Shipped: the approval workflow</h2>

<p>The most requested feature from agencies, and from anyone in a regulated trade. Turn on the approval gate for a workspace and scheduled articles wait for a named reviewer to sign off before publishing.</p>

<p>Two details that came out of how people actually asked for it:</p>

<ul>
  <li><strong>Reviewers do not need access to everything.</strong> A reviewer sees the drafts assigned to them, not the rest of the workspace — which is what makes client-facing review workable.</li>
  <li><strong>Changes are requested in plain language.</strong> A reviewer asks for "a shorter opening" or "a comparison table for running costs" and the change is applied to that section only.</li>
</ul>

${figure(
  'approvals',
  'Drafts wait for a named reviewer, who can approve for scheduling or request a change without editing text by hand. The scheduled publish time stays attached to the article throughout.'
)}

<h2>Shipped: spreadsheet export and team seats</h2>

<p>Two smaller items that came from the same underlying request — "let more than one person work on this, and let me get everything out."</p>

<ul>
  <li><strong>Spreadsheet export.</strong> The whole content plan — topics, target keywords, owners, publish dates, statuses — downloads as a single sheet. Articles already exported as Markdown and HTML; this covers the plan itself.</li>
  <li><strong>Team seats and roles.</strong> Invite members to a workspace as Owner, Editor, or Reviewer. Seats are per plan; workspaces stay isolated from each other.</li>
</ul>

<h2>Still coming: an honest status</h2>

<p>Three features are labelled Coming Soon across this site. Rather than quietly moving the labels around, here is where each actually stands:</p>

${dataTable(
  ['Feature', 'Status', 'What is blocking it'],
  [
    [
      '<strong>Editorial calendar</strong>',
      'In development',
      'Drag-to-reschedule needs to handle timezone edge cases correctly before it ships. Per-post scheduling and the list view work today.',
    ],
    [
      '<strong>Recurring publish slots</strong>',
      'Design complete, not built',
      'Depends on the calendar shipping first — slots are a calendar concept.',
    ],
    [
      '<strong>Bulk briefs</strong>',
      'In development',
      'Batch generation works; the spreadsheet import and per-row error handling do not yet.',
    ],
  ],
  'Roadmap status for the three Coming Soon features'
)}

<p>We would rather label these honestly than describe them in the present tense on a feature page. If one of them is the reason you are evaluating ContentLineup, that is worth knowing before you sign up rather than after.</p>

<h2>Smaller changes</h2>

<ul>
  <li>Keyword coverage checks now flag secondary keywords that never made it into the finished body, not just the primary one.</li>
  <li>Alt text generation reads the surrounding two paragraphs rather than the section heading alone, which materially improved accuracy on image-heavy posts.</li>
  <li>Revision history is now unlimited rather than capped at the last ten versions.</li>
  <li>Queue health in the sidebar shows scheduled runway in days, so an approaching gap is visible before it becomes one.</li>
</ul>

${articleCta(
  'Try the managed key',
  'No provider account, no key to paste — sign up and brief your first article. Or stay on the free bring-your-own-key plan, which is uncapped and is not going anywhere.'
)}
`,
};
