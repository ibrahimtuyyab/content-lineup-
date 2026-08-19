// Central content + config for the ContentLineup marketing site.
// Brand tokens mirror the live product site: ink #0a0a0a, paper #fafaf7, accent #c2410c, Fraunces + Inter.

export const site = {
  name: 'ContentLineup',
  legalName: 'ContentLineup by Teczon Labs',
  origin: 'https://contentlineup.com',
  tagline: 'Draft it today, publish it next Thursday.',
  description:
    'ContentLineup writes SEO-ready articles with AI, matches images to every section, and publishes each post on the exact date and time you pick. Use our managed AI key or bring your own.',
  email: 'iqbal@teczonlabs.com',
  parent: { name: 'Teczon Labs', url: 'https://teczonlabs.com' },
  app: {
    login: 'https://app.contentlineup.com/login',
    signup: 'https://app.contentlineup.com/signup',
  },
  social: ['https://teczonlabs.com', 'https://app.contentlineup.com'],
  locale: 'en_US',
  twitter: '@contentlineup',
  founded: '2025',
};

export const cta = {
  primary: { label: 'Start free', href: site.app.signup },
  secondary: { label: 'See how it works', href: '/how-it-works' },
  login: { label: 'Log in', href: site.app.login },
};

export const nav = [
  { label: 'Features', href: '/features' },
  { label: 'Made For', href: '/made-for' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Resources', href: '/resources' },
  { label: 'Pricing', href: '/pricing' },
];

export const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Why ContentLineup', href: '/why-contentlineup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Made For', href: '/made-for' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/resources' },
      { label: 'Case studies', href: '/resources#case-studies' },
      { label: 'Comparisons', href: '/resources#comparisons' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Legal & Trust',
    links: [
      { label: 'Security & Trust', href: '/security' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Features (section 5). `soon: true` renders a Coming Soon chip.
// ---------------------------------------------------------------------------
export const features = [
  {
    id: 'ai-writer',
    name: 'AI article writer',
    kind: 'write',
    short: 'Long-form drafts with a real structure, not a wall of text.',
    body:
      'Give ContentLineup a topic and a target keyword. It returns a full draft with a proper H2/H3 hierarchy, an intro that answers the question in the first paragraph, a developed body, a conclusion, and an optional FAQ block. Every draft is built from an outline first, so sections do not drift or repeat themselves the way single-prompt output usually does.',
    bullets: [
      'Outline-first generation, so headings stay in logical order',
      'Direct-answer opening paragraph — the format AI search engines quote',
      'Optional FAQ block appended with question-shaped H3s',
      'Tone and reading level set once per workspace, applied to every draft',
    ],
    screen: 'plans',
  },
  {
    id: 'auto-images',
    name: 'Auto-matched images',
    kind: 'write',
    short: 'A featured image plus inline images matched to each section.',
    body:
      'ContentLineup reads the finished draft, works out what each section is actually about, and places a featured image plus inline images that match those sections. Every image ships with descriptive alt text generated from the surrounding copy, so your posts stay accessible and image search has something real to index.',
    bullets: [
      'Featured image chosen from the article subject, not the title alone',
      'Inline images placed against the section they illustrate',
      'Descriptive alt text written per image, not filename stuffing',
      'Swap any image for your own upload without regenerating the article',
    ],
    screen: 'library',
  },
  {
    id: 'seo-output',
    name: 'SEO-ready output',
    kind: 'write',
    short: 'Meta title, meta description, slug, and keyword checks in the draft.',
    body:
      'Each article arrives with a meta title inside the length that actually renders in search results, a meta description written as a click-through pitch rather than a summary, and a clean URL slug. ContentLineup also checks your primary and secondary keywords against the finished body and flags the ones that never made it in.',
    bullets: [
      'Meta title and description generated and length-checked',
      'Clean, readable URL slug — no dates or ID numbers',
      'Primary + secondary keyword coverage checked against the body copy',
      'Internal link suggestions drawn from articles already in your library',
    ],
    screen: 'strategy',
  },
  {
    id: 'scheduling',
    name: 'Per-post scheduling',
    kind: 'schedule',
    short: 'Pick any future date and time, per article.',
    body:
      'Every article carries its own publish date and time. Set one for next Tuesday at 9:00 AM and another for the first of next month; ContentLineup holds each in the queue and publishes it on the minute you chose, in your workspace timezone. Nothing waits on you being at a desk.',
    bullets: [
      'Minute-level scheduling in your workspace timezone',
      'Reschedule by editing the date — the queue reorders itself',
      'Publish-now override on any queued article',
      'Clear queue states: Draft → Scheduled → Published',
    ],
    screen: 'list',
  },
  {
    id: 'social-autoshare',
    name: 'Auto-share on publish',
    kind: 'social',
    short: 'The article goes live and the social posts go out with it.',
    body:
      'Connect LinkedIn, Facebook and Instagram once. When an article publishes, ContentLineup writes a promo post for each connected channel — a hook drawn from the article rather than the headline pasted twice — attaches the featured image, and posts it at the same moment the article goes live. Distribution stops being a separate job you remember to do afterwards.',
    bullets: [
      'One post per channel, written for that channel rather than copy-pasted',
      'Featured image attached automatically, cropped per platform',
      'Fires the moment the article publishes — or on a delay you set',
      'Edit or switch off any channel before it goes out',
    ],
    screen: 'social',
    platforms: ['linkedin', 'facebook', 'instagram'],
  },
  {
    id: 'social-composer',
    name: 'Social composer & scheduler',
    kind: 'social',
    short: 'Standalone social posts, queued on their own schedule.',
    body:
      'Not everything worth posting is an article. Write standalone posts for LinkedIn, Facebook and Instagram in the same workspace, schedule each one to its own date and time, and watch them move through the same Draft → Scheduled → Published queue. One place for the whole content operation instead of a blog tool plus a social tool.',
    bullets: [
      'Compose once, adapt per channel, or write each separately',
      'Per-post scheduling to the minute, same as articles',
      'Approval gate applies to social posts too',
      'Image upload or reuse an image from the article library',
    ],
    screen: 'social',
    platforms: ['linkedin', 'facebook', 'instagram'],
  },
  {
    id: 'revisions',
    name: 'Chat-style revisions',
    kind: 'write',
    short: 'Say "make this shorter" and only that section changes.',
    body:
      'Edits are a conversation, not a prompt rewrite. Select a section and ask for what you want in plain language — "make this shorter", "add a comparison table", "rewrite this for a first-time buyer" — and ContentLineup applies the change to that section while leaving the rest of the article untouched.',
    bullets: [
      'Section-scoped edits, so the rest of the draft stays stable',
      'Natural-language instructions, no prompt engineering',
      'Add tables, lists, or FAQ blocks on request',
      'Full revision history — roll back to any earlier version',
    ],
    screen: 'approvals',
  },
  {
    id: 'keys',
    name: 'Managed or BYO API key',
    kind: 'ai',
    short: 'Use our managed key, or plug in your own OpenAI or Gemini key.',
    body:
      'Start on the managed key and write your first article without ever opening a provider dashboard. When volume grows and you want per-token cost control, paste your own OpenAI or Gemini key into Settings and switch over. Both modes use the same generation pipeline — the only thing that changes is whose key pays for the tokens.',
    bullets: [
      'Managed key: nothing to configure, generation included in your plan',
      'BYO key: your OpenAI or Gemini key, your provider bill, at cost',
      'Switch modes at any time without losing content',
      'Keys are encrypted at rest and never displayed again after saving',
    ],
    screen: 'settings',
  },
  {
    id: 'no-lock-in',
    name: 'No lock-in',
    kind: 'trust',
    short: 'Your content is yours, exportable, in open formats.',
    body:
      'Articles export as Markdown, HTML, or a spreadsheet of the whole content plan. Images download with them. There is no proprietary format, no export fee, and no gate that switches off your archive when you cancel — a closed account keeps read and export access to everything you already made.',
    bullets: [
      'Export any article as Markdown or HTML',
      'Export the whole content plan as a spreadsheet',
      'Images download alongside the article body',
      'Cancelling keeps read + export access to past work',
    ],
    screen: 'settings',
  },
  {
    id: 'calendar',
    name: 'Editorial calendar',
    kind: 'schedule',
    soon: true,
    short: 'A drag-and-drop month view of everything queued.',
    body:
      'A month grid of every draft, scheduled post, and published article. Drag an article to a different day to reschedule it, spot the weeks where nothing is queued, and see your whole publishing rhythm without opening a list.',
    bullets: [
      'Month view across drafts, scheduled, and published',
      'Drag to reschedule — no date picker',
      'Gap highlighting for weeks with nothing queued',
    ],
    screen: 'calendar',
  },
  {
    id: 'recurring',
    name: 'Recurring publish slots',
    kind: 'schedule',
    soon: true,
    short: '"Every Tue & Thu at 9 AM", filled automatically from the queue.',
    body:
      'Define the rhythm once — every Tuesday and Thursday at 9:00 AM — and ContentLineup pulls the next approved article off the queue to fill each slot. You keep the cadence even in the weeks you never log in.',
    bullets: [
      'Define a weekly or monthly publishing rhythm',
      'Slots auto-fill from approved drafts in the queue',
      'Empty-slot warnings before the queue runs dry',
    ],
    screen: 'calendar',
  },
  {
    id: 'bulk',
    name: 'Bulk briefs',
    kind: 'write',
    soon: true,
    short: 'Paste a spreadsheet of topics; get a scheduled month back.',
    body:
      'Paste or upload a spreadsheet of topics, target keywords, and publish dates. ContentLineup generates every article in the sheet and drops each one into the queue on its assigned date — a quarter of content briefed in a single paste.',
    bullets: [
      'CSV or spreadsheet paste with topic, keyword, and date columns',
      'Batch generation with per-row status',
      'Rows land in the queue already scheduled',
    ],
    screen: 'ideas',
  },
];

export const comingSoon = features.filter((f) => f.soon);
export const shippedFeatures = features.filter((f) => !f.soon);

// ---------------------------------------------------------------------------
// Social channels. Three, deliberately — depth on the platforms our audience
// actually uses beats a long list of logos nobody connects.
// ---------------------------------------------------------------------------
export const socialPlatforms = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    status: 'live',
    best: 'B2B, SaaS, agencies and consultants',
    desc:
      'Posts as you or as a company page. ContentLineup opens with the article\'s direct answer rather than a link dump, because LinkedIn rewards posts people stop to read.',
    detail: 'Personal profile or company page · text posts with link preview · image posts',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    status: 'live',
    best: 'Local business, e-commerce and community audiences',
    desc:
      'Publishes to a Page with the featured image and a short lead-in. The format local service businesses get the most out of, and the one they most often forget to do.',
    detail: 'Facebook Pages · link posts with preview image · image posts',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'live',
    best: 'E-commerce, real estate and visual-first brands',
    desc:
      'Publishes a feed post built from the article\'s featured image with the caption written for Instagram — no link in the caption, so the copy carries the click to your bio or profile link.',
    detail: 'Instagram Business/Creator accounts · single-image feed posts · captions with hashtags',
  },
];

// ---------------------------------------------------------------------------
// How it works — 4 steps
// ---------------------------------------------------------------------------
export const steps = [
  {
    n: '01',
    title: 'Describe the topic',
    short: 'A sentence and a target keyword is enough.',
    body:
      'Type the topic the way you would explain it to a writer — "a buyer guide for first-time condo buyers in Austin, targeting austin condo buying guide". Add a tone, a reading level, and an audience if you want them; ContentLineup remembers the ones you set per workspace, so most briefs are one line.',
    detail: [
      'Brief in plain language, not a prompt template',
      'Primary keyword plus up to four secondary keywords',
      'Workspace-level tone, audience, and reading level applied automatically',
    ],
    screen: 'ideas',
  },
  {
    n: '02',
    title: 'AI writes the article',
    short: 'Outline first, then a full structured draft.',
    body:
      'ContentLineup builds the outline before it writes a word, then fills it in: an opening paragraph that answers the question directly, H2 and H3 sections in logical order, a conclusion, and an optional FAQ block. Then you edit by talking to it — ask for a shorter intro or a comparison table and only that section changes.',
    detail: [
      'Outline-first generation keeps sections from repeating',
      'Direct-answer intro — the shape AI answer engines quote',
      'Chat-style revisions scoped to one section at a time',
    ],
    screen: 'approvals',
  },
  {
    n: '03',
    title: 'Images placed automatically',
    short: 'Featured plus inline images, with alt text written for each.',
    body:
      'The finished draft gets read back, section by section, and images are matched to what each section is actually about — not just the headline. A featured image goes up top, inline images sit with the sections they illustrate, and every one carries descriptive alt text generated from the copy around it.',
    detail: [
      'Featured image plus inline images per section',
      'Alt text written from the surrounding copy',
      'Swap any image for your own upload without regenerating',
    ],
    screen: 'library',
  },
  {
    n: '04',
    title: 'It publishes and shares itself',
    short: 'Pick the date. The article and its social posts go out together.',
    body:
      'Set the publish date and time per article and the queue takes over. The article moves Draft → Scheduled → Published on its own, in your workspace timezone — and if you have connected LinkedIn, Facebook or Instagram, a promo post written for each channel goes out with it. An approval gate can sit in front of all of that if a client or an editor needs to sign off first.',
    detail: [
      'Minute-level scheduling in your workspace timezone',
      'Auto-shares to LinkedIn, Facebook and Instagram on publish',
      'Optional approval gate covering articles and social posts',
    ],
    screen: 'list',
  },
];

// ---------------------------------------------------------------------------
// Manual workflow vs ContentLineup (time comparison)
// ---------------------------------------------------------------------------
export const workflowCompare = {
  manual: {
    title: 'The manual workflow',
    total: '4h 40m',
    unit: 'per article',
    rows: [
      { label: 'Research + outline', time: '45m' },
      { label: 'Writing the draft', time: '2h 00m' },
      { label: 'Editing + restructuring', time: '45m' },
      { label: 'Finding and licensing images', time: '30m' },
      { label: 'Formatting + alt text', time: '20m' },
      { label: 'Meta title, description, slug', time: '20m' },
      { label: 'Remembering to hit publish', time: 'ongoing' },
    ],
  },
  automated: {
    title: 'With ContentLineup',
    total: '12m',
    unit: 'per article',
    rows: [
      { label: 'Describe the topic + keyword', time: '2m' },
      { label: 'AI writes the structured draft', time: 'automatic' },
      { label: 'Review + chat-style revisions', time: '8m' },
      { label: 'Images matched + alt text written', time: 'automatic' },
      { label: 'Meta, slug, keyword check', time: 'automatic' },
      { label: 'Pick the publish date', time: '2m' },
      { label: 'Publishing itself', time: 'automatic' },
    ],
  },
  note:
    'Timings are our own benchmark across 40 articles of 1,400–1,800 words, measured against a solo marketer writing the same briefs by hand. Your review time will vary with how much you edit.',
};

// ---------------------------------------------------------------------------
// Managed key vs BYO key
// ---------------------------------------------------------------------------
export const keyModes = [
  {
    id: 'managed',
    label: 'Managed key',
    kicker: 'Nothing to set up',
    summary:
      'Write your first article about ninety seconds after signing up. No provider account, no billing dashboard, no key to paste — generation is included in your plan.',
    best: 'Best for solo marketers, local businesses, and anyone who does not want a second bill from an AI provider.',
    points: [
      'Zero configuration — sign up and write',
      'One predictable monthly price, no token maths',
      'Model upgrades handled for you',
      'Article allowance included in the plan',
    ],
    caveat: 'A monthly article allowance applies. Switch to your own key any time to lift it.',
  },
  {
    id: 'byo',
    label: 'Bring your own key',
    kicker: 'Full cost control',
    summary:
      "Paste an OpenAI or Gemini key into Settings and ContentLineup uses it for every generation. You pay your provider directly at cost, and your article volume stops being a line item on anyone else's pricing page.",
    best: 'Best for agencies, publishers, and high-volume sites where per-article cost matters more than convenience.',
    points: [
      'Your OpenAI or Gemini key, your provider bill, at cost',
      'No article cap from us — your provider limits apply',
      'Pick the exact model you want to generate with',
      "Requests run against your key, never pooled with another account's traffic",
    ],
    caveat: 'You manage the provider account, the spend limits, and key rotation.',
  },
];

// ---------------------------------------------------------------------------
// Audiences (section 6)
// ---------------------------------------------------------------------------
export const niches = [
  {
    id: 'affiliate',
    label: 'Affiliate & niche sites',
    short: 'Scale volume without losing the format.',
    headline: 'Go from six posts a month to sixty without losing the format.',
    problem:
      'Affiliate revenue tracks published volume, but volume is exactly what breaks first. Freelance writers drift from the template, the comparison tables stop matching, and by post thirty the site reads like four different people wrote it — because they did.',
    solution:
      'Set the article structure once at the workspace level and every draft comes out in that shape: same intro pattern, same comparison table, same verdict block, same image treatment. Queue a month of posts in an afternoon and let the schedule drip them out.',
    example:
      'Example output: "Best Budget Espresso Machines Under $500 (2026)" — a spec table, five reviewed picks, a who-should-buy-what verdict, and an FAQ block, published every Tuesday at 7 AM.',
    stats: [
      { value: '60+', label: 'posts a month, solo' },
      { value: '1', label: 'template applied to every draft' },
    ],
  },
  {
    id: 'agencies',
    label: 'Agencies',
    short: 'Client content at a margin that survives.',
    headline: 'Deliver client content at a margin that actually survives.',
    problem:
      'Content retainers get sold at a fixed monthly fee and delivered at a variable cost. One demanding client, one writer who quits mid-month, and the margin on that account is gone. Meanwhile every client wants their own voice, their own keywords, and their own approval chain.',
    solution:
      'Give each client a workspace with its own brand voice, keyword strategy, and approval gate. Generate across all of them from one login, route drafts to the client for sign-off, and let approved articles publish on their own schedule. Bring your own key and the marginal cost per article is measured in cents.',
    example:
      'Example output: twelve clients on a two-post-a-week cadence, all drafted Monday, approved by Wednesday, publishing Tuesday and Thursday without an account manager in the loop.',
    stats: [
      { value: '12+', label: 'client workspaces, one login' },
      { value: 'Per-client', label: 'voice and approval chain' },
    ],
  },
  {
    id: 'local',
    label: 'Local businesses',
    short: 'An active blog without a writer on payroll.',
    headline: 'Keep the blog alive without hiring a writer.',
    problem:
      'Local search rewards businesses that look active, and nothing signals "closed" like a blog whose last post is eighteen months old. But there is no marketing hire coming, and the owner is not going to write a seasonal maintenance guide at 9 PM.',
    solution:
      'Brief a quarter of service pages, seasonal posts, and customer FAQs in one sitting, then let them publish fortnightly. The site stays current, the service pages pick up the long-tail queries, and nobody has to remember it is content day.',
    example:
      'Example output: "How Often Should You Service an HVAC System in Phoenix?" — a direct answer, a seasonal schedule table, and a booking CTA, published the first Monday of each month.',
    stats: [
      { value: '0', label: 'writers to hire' },
      { value: '90 days', label: 'of content briefed in one sitting' },
    ],
  },
  {
    id: 'saas',
    label: 'SaaS & startups',
    short: 'Long-tail SEO without engineering time.',
    headline: 'Ship long-tail SEO without pulling engineers off the roadmap.',
    problem:
      'Comparison pages, integration pages, and "how to do X with Y" long-tail posts are the highest-intent traffic a SaaS company can get — and they are always the thing that slips, because the only people who understand the product are busy shipping it.',
    solution:
      'Brief the comparison and use-case matrix once, generate the whole set, and put it on a weekly cadence. Founders review for accuracy in a few minutes per post instead of drafting from scratch, and the long-tail library compounds while the team stays on the product.',
    example:
      'Example output: "Zapier vs Make for Ops Teams (2026)" plus eleven sibling comparison pages, one publishing every Wednesday for a quarter.',
    stats: [
      { value: '~6 min', label: 'founder review per post' },
      { value: '12', label: 'comparison pages per quarter' },
    ],
  },
  {
    id: 'owners',
    label: 'Business owners',
    short: 'Consistent content, no marketing department.',
    headline: 'Consistent content with no marketing department behind it.',
    problem:
      'Everyone says you need to publish. Nobody explains how a non-technical owner with no in-house marketer is supposed to produce it, week after week, alongside actually running the business.',
    solution:
      'Describe what your customers ask you, in your own words. ContentLineup turns each question into a structured, SEO-ready article, matches images, writes the meta, and publishes on a schedule you set once. The whole job becomes a review, not a writing session.',
    example:
      'Example output: "What Does a Full Bookkeeping Service Actually Include?" — a direct answer, a scope table, pricing context, and a contact CTA, published every other Thursday.',
    stats: [
      { value: '1 line', label: 'brief per article' },
      { value: 'Set once', label: 'schedule, then hands-off' },
    ],
  },
  {
    id: 'real-estate',
    label: 'Real estate',
    short: 'Stay visible locally between listings.',
    headline: 'Stay visible in local search between listings.',
    problem:
      'Agents live and die by local visibility, but listing pages churn — they go up, they sell, they disappear. The evergreen content that actually holds local rankings (neighbourhood guides, market updates, buyer FAQs) is the work that never gets done during a busy quarter.',
    solution:
      'Queue neighbourhood guides, monthly market updates, and buyer/seller FAQ posts on a predictable schedule. The evergreen layer keeps compounding in local search while your listings turn over, and each post carries a valuation or viewing CTA.',
    example:
      'Example output: "Living in Riverdale: Schools, Commute, and What Homes Actually Sell For" — a neighbourhood profile, a price table, commute times, and a valuation CTA, published the 1st and 15th.',
    stats: [
      { value: '2x/month', label: 'market updates, automatic' },
      { value: 'Evergreen', label: 'local content between listings' },
    ],
    guide: '/resources/guides/real-estate-content-marketing-guide',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    short: 'Content that sells the catalogue.',
    headline: 'Content that sells the catalogue, not just describes it.',
    problem:
      'Product pages convert people who already know what they want. Everyone earlier in the journey is searching "how do I choose", "what is the difference between", and "best gift for" — and that content competes with affiliate sites that publish it full time.',
    solution:
      'Generate buying guides, product-education posts, and seasonal gift guides that link straight into your collections. Brief the seasonal calendar in advance and let Q4 publish itself while you are dealing with fulfilment.',
    example:
      'Example output: "How to Choose a Cast Iron Skillet (Size, Weight, and Seasoning)" — a sizing table, a care section, an FAQ block, and links into three collection pages.',
    stats: [
      { value: 'Q4', label: 'gift guides briefed in advance' },
      { value: 'Top-funnel', label: 'traffic into collection pages' },
    ],
  },
  {
    id: 'coaches',
    label: 'Coaches & consultants',
    short: 'Authority content that feeds the pipeline.',
    headline: 'Publish the authority content your pipeline depends on.',
    problem:
      'Consulting leads come from looking like the person who has already solved the problem. That means publishing thinking, consistently — which is exactly what gets dropped the moment client delivery gets busy, and client delivery is always busy.',
    solution:
      'Turn the frameworks you already use into a library of thought-leadership posts and FAQ articles, on a cadence that survives a busy month. Each post ends with a consultation CTA, so the content works the pipeline while you work the clients.',
    example:
      'Example output: "The 90-Day Onboarding Framework We Use With Every Ops Client" — the framework, a week-by-week table, common failure modes, and a discovery-call CTA.',
    stats: [
      { value: 'Weekly', label: 'cadence through busy months' },
      { value: 'CTA', label: 'on every published post' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------
export const integrations = [
  { name: 'OpenAI', group: 'AI models', status: 'live', desc: 'Bring your own OpenAI key and pick the model every draft is generated with.', glyph: 'ai' },
  { name: 'Google Gemini', group: 'AI models', status: 'live', desc: 'Use a Gemini key as your generation provider, with the same pipeline and the same output.', glyph: 'ai' },
  { name: 'Managed AI key', group: 'AI models', status: 'live', desc: 'Skip provider setup entirely — generation runs on our key and is included in your plan.', glyph: 'ai' },
  { name: 'LinkedIn', group: 'Social', status: 'live', desc: 'Post to a personal profile or a company page when an article publishes, or on its own schedule.', glyph: 'linkedin' },
  { name: 'Facebook', group: 'Social', status: 'live', desc: 'Publish to a Facebook Page with the featured image and a lead-in written for the feed.', glyph: 'facebook' },
  { name: 'Instagram', group: 'Social', status: 'live', desc: 'Publish single-image feed posts to a Business or Creator account, caption written for Instagram.', glyph: 'instagram' },
  { name: 'Unsplash', group: 'Images', status: 'live', desc: 'Featured and inline images matched to each section, with alt text written per image.', glyph: 'image' },
  { name: 'Direct image upload', group: 'Images', status: 'live', desc: 'Replace any auto-matched image with your own file without regenerating the article.', glyph: 'image' },
  { name: 'Markdown export', group: 'Publishing', status: 'live', desc: 'Export any article as clean Markdown, images included, ready for any static site.', glyph: 'export' },
  { name: 'HTML export', group: 'Publishing', status: 'live', desc: 'Export publish-ready HTML with heading structure and image tags intact.', glyph: 'export' },
  { name: 'Publishing webhooks', group: 'Publishing', status: 'live', desc: 'Fire a webhook the moment an article publishes so your own systems can react.', glyph: 'api' },
  { name: 'REST API', group: 'Publishing', status: 'live', desc: 'Create briefs, read drafts, and schedule posts programmatically from your own stack.', glyph: 'api' },
  { name: 'Spreadsheet export', group: 'Planning', status: 'live', desc: 'Download the whole content plan — topics, keywords, dates, statuses — as a sheet.', glyph: 'sheet' },
  { name: 'Team workspaces', group: 'Planning', status: 'live', desc: 'Invite teammates or clients to a workspace with their own review and approval rights.', glyph: 'team' },
  { name: 'Google Search Console', group: 'Analytics', status: 'soon', desc: 'Pull impressions and average position back against each published article.', glyph: 'chart' },
  { name: 'Google Analytics 4', group: 'Analytics', status: 'soon', desc: 'See sessions and conversions per published post inside the library view.', glyph: 'chart' },
  { name: 'Zapier', group: 'Planning', status: 'soon', desc: 'Trigger ContentLineup briefs from thousands of apps without writing code.', glyph: 'api' },
  { name: 'Slack notifications', group: 'Planning', status: 'soon', desc: 'Get a Slack ping when a draft needs approval or an article goes live.', glyph: 'team' },
  { name: 'Custom CMS connector', group: 'Publishing', status: 'soon', desc: 'Push published articles straight into your own CMS over the API.', glyph: 'export' },
];

export const integrationGroups = ['AI models', 'Social', 'Images', 'Publishing', 'Planning', 'Analytics'];

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
export const plans = [
  {
    id: 'byo',
    name: 'Bring your own key',
    price: '$0',
    period: '/month',
    numeric: '0',
    kicker: 'Free, forever',
    summary: 'Every feature, unlimited articles. You supply an OpenAI or Gemini key and pay your provider at cost.',
    cta: { label: 'Start free', href: site.app.signup },
    featured: false,
    includes: [
      'Unlimited articles and scheduled posts',
      'Unlimited sites and workspaces',
      'AI article writer with outline-first drafts',
      'Auto-matched images with generated alt text',
      'SEO meta, slug, and keyword coverage checks',
      'Per-post scheduling to the minute',
      'Chat-style section revisions',
      'Markdown, HTML, and spreadsheet export',
      'Email support',
    ],
    limits: "No article cap from us. Your provider's rate limits and billing apply.",
  },
  {
    id: 'managed',
    name: 'Managed key',
    price: '$29',
    period: '/month',
    numeric: '29',
    kicker: 'Most popular',
    summary: 'No provider account, no key to paste. Generation runs on our managed key and is included in the price.',
    cta: { label: 'Start free trial', href: site.app.signup },
    featured: true,
    includes: [
      'Everything in Bring your own key',
      '40 generated articles per month included',
      'No OpenAI or Gemini account required',
      'Model upgrades handled for you',
      '3 workspaces, 3 team seats',
      'Approval workflow',
      'Publishing webhooks and REST API',
      'Priority email support',
    ],
    limits: '40 articles/month. Unused articles do not roll over. Add your own key any time to remove the cap.',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$89',
    period: '/month',
    numeric: '89',
    kicker: 'For client work',
    summary: 'Managed key at agency volume, with the workspace and seat count client delivery actually needs.',
    cta: { label: 'Start free trial', href: site.app.signup },
    featured: false,
    includes: [
      'Everything in Managed key',
      '175 generated articles per month included',
      'Unlimited workspaces, 15 team seats',
      'Per-client brand voice and approval chains',
      'Client-facing review links',
      'Spreadsheet export of every content plan',
      'Priority support with a named contact',
    ],
    limits: '175 articles/month across all workspaces. Bring your own key on any workspace to remove the cap.',
  },
];

export const pricingFaqs = [
  {
    q: 'What does "free forever" actually mean?',
    a: 'The bring-your-own-key plan is $0 per month with no article cap and no feature gates. You connect an OpenAI or Gemini key and pay that provider directly for the tokens you use. We do not take a cut of it and the plan does not expire.',
  },
  {
    q: 'How much does bringing my own key cost me in practice?',
    a: 'It depends on the model you choose and the article length. A 1,500-word article on a current mid-tier model typically lands in the low tens of cents. Your provider dashboard shows the exact spend, and you can set hard spend limits there.',
  },
  {
    q: 'What counts as one article against a managed-key allowance?',
    a: 'One generated draft counts as one article. Chat-style revisions to an existing draft do not count again, so editing is free. Regenerating an article from scratch counts as a new one.',
  },
  {
    q: 'Do unused managed-key articles roll over?',
    a: 'No. Allowances reset on your billing date. If you routinely finish the month with articles left over, the free bring-your-own-key plan is the cheaper choice, and we would rather you were on it.',
  },
  {
    q: 'Can I switch between the managed key and my own key?',
    a: 'Yes, at any time, from Settings. Switching does not affect existing drafts, scheduled posts, or your library. Many teams start on the managed key and move to their own once monthly volume makes it cheaper.',
  },
  {
    q: 'What happens if I exceed my managed-key allowance?',
    a: 'Generation pauses for the rest of the billing period. Nothing already scheduled is affected and everything published stays published. You can upgrade, wait for the reset, or paste in your own key to keep going immediately.',
  },
  {
    q: 'Is there a contract or a cancellation fee?',
    a: 'No. Paid plans are monthly and cancel from the billing screen in a click. There is no cancellation fee, no exit interview, and no support ticket required.',
  },
  {
    q: 'What happens to my content if I cancel?',
    a: 'It stays yours. A cancelled account keeps read and export access to every article you generated, and already-published posts are unaffected. Export as Markdown, HTML, or a spreadsheet whenever you want.',
  },
];

// ---------------------------------------------------------------------------
// FAQs — homepage teaser is the `home: true` subset; /faq renders all, grouped
// ---------------------------------------------------------------------------
export const faqGroups = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is ContentLineup?',
        a: 'ContentLineup is an AI blog writing and publishing tool. You describe a topic, it writes a structured, SEO-ready article, matches images to each section with alt text, and publishes the post on the date and time you choose. It works as a single workflow — briefing, writing, images, SEO, and scheduling all happen in one place rather than across four tools.',
        home: true,
      },
      {
        q: 'How long does it take to publish my first article?',
        a: 'On the managed key, most people go from signup to a scheduled article in under ten minutes: about ninety seconds to sign up and brief the topic, a couple of minutes for the draft, and the rest is your own review time. There is nothing to install and no provider account to create.',
        home: true,
      },
      {
        q: 'Do I need to be technical to use it?',
        a: 'No. Briefing is a sentence of plain English and editing is a conversation — "make this shorter", "add a comparison table". The only optional technical step is pasting your own API key, and the managed key exists precisely so you can skip it.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes. The bring-your-own-key plan is free forever with no article cap — you connect your own OpenAI or Gemini key and pay that provider directly. Managed-key plans start at $29/month and include generation, so there is no second bill.',
        home: true,
      },
    ],
  },
  {
    title: 'Managed key vs your own key',
    items: [
      {
        q: 'What is the difference between the managed key and bringing my own?',
        a: 'With the managed key, generation runs on our AI provider account and is included in your plan price — nothing to configure. With your own key, you paste an OpenAI or Gemini key into Settings and your provider bills you directly at cost, with no article cap from us. The generation pipeline and the output are identical; only the billing path changes.',
        home: true,
      },
      {
        q: 'Which option should I choose?',
        a: 'Start on the managed key if you want to be writing in ninety seconds and prefer one predictable bill. Move to your own key when monthly volume gets high enough that per-token pricing beats a flat fee, or when you want to pick the exact model. Switching is a toggle in Settings and takes effect on the next generation.',
      },
      {
        q: 'Which AI providers can I bring a key from?',
        a: 'OpenAI and Google Gemini are supported today. You choose which model within that provider generates your drafts, so you can trade cost against quality yourself.',
      },
      {
        q: 'Can I use different keys for different clients?',
        a: "Yes. Keys are set per workspace, so an agency can run one client on the client's own key, another on the agency key, and a third on the managed key, all from the same login.",
      },
    ],
  },
  {
    title: 'Security, data & privacy',
    items: [
      {
        q: 'How is my API key stored?',
        a: 'Keys are encrypted at rest with AES-256 and are write-only in the interface — after you save one, it is never displayed again, only its last four characters. They are decrypted in memory solely to sign a request to your chosen provider, and are never logged, never shown to support staff, and never included in exports.',
        home: true,
      },
      {
        q: 'Does my content get used to train AI models?',
        a: 'No. We do not train models on your content, and we send generation requests to providers under API terms that exclude training on API traffic. Your briefs, drafts, and published articles are yours.',
      },
      {
        q: 'Who can see my drafts?',
        a: 'Only people you invite to that workspace. Workspaces are isolated from each other, which is what makes the per-client agency setup safe. Support staff cannot read your content unless you explicitly grant access for a specific issue.',
      },
      {
        q: 'Where is my data hosted?',
        a: 'On managed cloud infrastructure in the United States, with encryption in transit (TLS 1.2+) and at rest, automated daily backups, and access limited to the minimum set of staff who need it. Full detail is on the Security & Trust page.',
      },
    ],
  },
  {
    title: 'Writing & quality',
    items: [
      {
        q: 'Will the articles sound generic?',
        a: 'They sound like what you brief. ContentLineup builds an outline before writing, applies the tone, audience, and reading level you set per workspace, and takes plain-language revision instructions on individual sections. The honest answer is that no AI tool produces a publish-ready expert article with zero human input — the realistic workflow is a strong draft in two minutes and a focused review in eight, instead of four hours from scratch.',
        home: true,
      },
      {
        q: 'Can I edit an article after it is generated?',
        a: 'Yes, in two ways. Chat-style revisions apply a plain-language instruction to one section — "tighten this", "add a comparison table" — leaving everything else untouched. You can also edit the text directly. Every version is kept, so you can roll back.',
      },
      {
        q: 'Does it write meta titles and descriptions?',
        a: 'Yes. Every article ships with a length-checked meta title, a meta description written as a click-through pitch rather than a summary, and a clean URL slug. It also checks your primary and secondary keywords against the finished body and flags any that never made it in.',
      },
      {
        q: 'Where do the images come from?',
        a: 'Featured and inline images are matched from Unsplash against what each section is actually about, and every image gets descriptive alt text generated from the surrounding copy. You can replace any image with your own upload without regenerating the article.',
      },
    ],
  },
  {
    title: 'Scheduling & publishing',
    items: [
      {
        q: 'How does scheduling work?',
        a: 'Each article carries its own publish date and time, set to the minute in your workspace timezone. It sits in the queue as Scheduled and flips to Published at that moment, whether or not you are logged in. Rescheduling is just editing the date.',
        home: true,
      },
      {
        q: 'Can I have someone approve posts before they go live?',
        a: 'Yes. Turn on the approval gate for a workspace and scheduled articles wait for a named reviewer to sign off before publishing. Agencies use this to let clients approve without giving them access to everything else.',
      },
      {
        q: 'Which social platforms can ContentLineup post to?',
        a: 'LinkedIn, Facebook and Instagram. LinkedIn posts to a personal profile or a company page, Facebook to a Page, and Instagram to a Business or Creator account as a single-image feed post. We support three networks deliberately rather than a long list — these are the ones our customers actually use, and depth on them beats breadth we cannot maintain.',
        home: true,
      },
      {
        q: 'Does it just paste the article headline into a social post?',
        a: 'No. Each channel gets a post written for that channel — a hook drawn from the article body, the featured image cropped for the platform, and a format that suits the feed. LinkedIn opens with the direct answer, Facebook leads with the image and a short lead-in, and Instagram gets a caption written without a link, because links do not work in Instagram captions.',
      },
      {
        q: 'Can I schedule social posts that are not tied to an article?',
        a: 'Yes. The social composer writes and schedules standalone posts for any connected channel, on their own dates and times, through the same Draft → Scheduled → Published queue as articles. Auto-share on publish and standalone posts run side by side.',
      },
      {
        q: 'Can I review social posts before they go out?',
        a: 'Yes. The approval gate applies to social posts as well as articles, and you can edit or switch off any individual channel before an auto-share fires.',
      },
      {
        q: 'What if I want to publish something right now?',
        a: 'Any queued article has a publish-now override. Equally, you can pull a scheduled article back to draft at any point before its slot.',
      },
      {
        q: 'What happens if my scheduled slot passes while I am offline?',
        a: 'Nothing changes — publishing runs on our infrastructure, not in your browser. Being offline, asleep, or on holiday has no effect on the queue.',
      },
    ],
  },
  {
    title: 'Billing, cancellation & leaving',
    items: [
      {
        q: 'Can I cancel any time?',
        a: 'Yes. Paid plans are month to month and cancel in one click from the billing screen. No contract, no cancellation fee, no support ticket. You keep access until the end of the period you have already paid for.',
        home: true,
      },
      {
        q: 'What happens to my content if I leave?',
        a: 'You keep it. Anything already published stays published and is unaffected by your account status. Your account keeps read and export access to your whole library after cancelling, so you can take everything out as Markdown, HTML, or a spreadsheet on your own timetable. We do not hold your archive hostage to a renewal.',
        home: true,
      },
      {
        q: 'Is my content locked into a proprietary format?',
        a: 'No. Articles export as standard Markdown or HTML with their images, and the whole content plan exports as a spreadsheet. There is nothing to convert and no export fee.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'If something goes wrong in your first month on a paid plan, email us and we will refund it. We would rather do that than keep money from someone the product did not work for.',
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
export const homeFaqs = allFaqs.filter((f) => f.home);

// ---------------------------------------------------------------------------
// Comparison matrix (section 8)
// ---------------------------------------------------------------------------
export const comparison = {
  columns: ['ContentLineup', 'Generic AI writing tools', 'Legacy scheduling tools'],
  rows: [
    {
      dimension: 'One unified workflow',
      detail: 'Brief, draft, images, SEO, and scheduling in a single place',
      values: ['yes', 'no', 'partial'],
      notes: [
        'Everything happens in one queue — no copy-paste between tools',
        'Writing only. Images, SEO fields, and publishing happen elsewhere',
        'Scheduling only. You still write the article somewhere else',
      ],
    },
    {
      dimension: 'Publishes to social channels',
      detail: 'LinkedIn, Facebook and Instagram, from the same queue',
      values: ['yes', 'no', 'yes'],
      notes: [
        'Three channels: auto-share on publish, plus standalone scheduled posts',
        'No publishing layer of any kind — output is text you paste somewhere',
        'Many more networks, plus inbox and social analytics we do not have',
      ],
    },
    {
      dimension: 'Per-article scheduling',
      detail: 'A distinct future date and time on each individual post',
      values: ['yes', 'no', 'yes'],
      notes: [
        'Minute-level, per article, in your workspace timezone',
        'No publishing layer — output is text you paste somewhere',
        'This is what they are built for, and they do it well',
      ],
    },
    {
      dimension: 'Auto-matched images with alt text',
      detail: 'Featured and inline images chosen per section, alt text written',
      values: ['yes', 'partial', 'no'],
      notes: [
        'Matched per section from the finished draft, alt text generated',
        'Some generate images on request, but not matched to sections or alt-texted',
        'You attach media yourself',
      ],
    },
    {
      dimension: 'SEO fields generated',
      detail: 'Meta title, meta description, slug, keyword coverage check',
      values: ['yes', 'partial', 'no'],
      notes: [
        'Generated, length-checked, and verified against your keywords',
        'Will write a meta description if you ask for one in the prompt',
        'Not a content tool',
      ],
    },
    {
      dimension: 'Managed or BYO key',
      detail: 'Choose between an included key and your own provider account',
      values: ['yes', 'partial', 'no'],
      notes: [
        'Both, switchable per workspace at any time',
        'Usually one or the other, rarely both',
        'No AI generation to key',
      ],
    },
    {
      dimension: 'No content lock-in',
      detail: 'Export in open formats, keep access after cancelling',
      values: ['yes', 'partial', 'partial'],
      notes: [
        'Markdown, HTML, spreadsheet. Read + export access survives cancellation',
        'Output is text you already hold, but plans and history usually are not exportable',
        'Scheduled queues generally do not export cleanly',
      ],
    },
    {
      dimension: 'Approval workflow',
      detail: 'A reviewer signs off before anything publishes',
      values: ['yes', 'no', 'partial'],
      notes: [
        'Per-workspace approval gate with client-facing review links',
        'No concept of publishing, so no approvals',
        'Common in team tiers, usually at a higher price point',
      ],
    },
    {
      dimension: 'Editorial calendar',
      detail: 'Drag-and-drop month view of the whole queue',
      values: ['soon', 'no', 'yes'],
      notes: [
        'On the roadmap — list view and per-post scheduling ship today',
        'Not offered',
        'Mature, and generally the strongest part of these tools',
      ],
    },
    {
      dimension: 'Recurring publish slots',
      detail: '"Every Tue & Thu at 9 AM", auto-filled from the queue',
      values: ['soon', 'no', 'yes'],
      notes: ['On the roadmap', 'Not offered', 'A standard feature, well executed'],
    },
    {
      dimension: 'Bulk briefs from a spreadsheet',
      detail: 'Paste many topics, generate and schedule the whole set',
      values: ['soon', 'no', 'partial'],
      notes: [
        'On the roadmap',
        'Batch prompting exists, but with no scheduling on the other end',
        'Bulk upload of finished posts, not generation',
      ],
    },
    {
      dimension: 'Pricing model',
      detail: 'What you actually pay',
      values: ['note', 'note', 'note'],
      notes: [
        'Free forever on your own key; $29/mo managed',
        'Typically $20–$99/mo per seat, with generation credits metered',
        'Typically per-channel or per-seat, climbing quickly with team size',
      ],
    },
  ],
  fair:
    'Where legacy scheduling tools still win: channel breadth. We do three networks well — LinkedIn, Facebook and Instagram — and they do a dozen, with a social inbox, community management and social analytics we do not offer at all. Their calendars and recurring slots are also more mature than ours. Where generic AI writing tools win: raw drafting flexibility for formats that are not articles, and a broader choice of models. ContentLineup is the better fit when the job is publishing structured articles and getting them distributed, from one queue, without running three tools to do it.',
};

// ---------------------------------------------------------------------------
// Product screens (section 7) — captions reused across Features and articles
// ---------------------------------------------------------------------------
export const screens = {
  plans: {
    title: 'Plans',
    caption:
      'Your content plan at a glance: every brief, its target keyword, its owner, and where it sits in the pipeline. This is the view most teams open first thing on a Monday.',
    alt: 'ContentLineup Plans screen showing a content plan of briefs with target keywords, owners, and pipeline status.',
  },
  ideas: {
    title: 'Ideas',
    caption:
      'The topic backlog. Capture ideas as they arrive, tag them with a target keyword, and promote the good ones into briefs when there is room in the queue.',
    alt: 'ContentLineup Ideas screen showing a backlog of article topics with keyword tags and estimated search volume.',
  },
  calendar: {
    title: 'Calendar',
    caption:
      'The month view of everything queued. Scheduled posts sit on their publish dates, so an empty week is obvious before it becomes a gap in your archive.',
    alt: 'ContentLineup Calendar screen showing a month grid with scheduled articles placed on their publish dates.',
  },
  list: {
    title: 'List',
    caption:
      'Every article with its state and publish time. Draft, Scheduled, and Published are colour-coded, and the publish column is the single source of truth for what goes out when.',
    alt: 'ContentLineup List screen showing all articles with Draft, Scheduled, and Published states and publish timestamps.',
  },
  approvals: {
    title: 'Approvals',
    caption:
      'The review gate. Drafts wait here for a named reviewer, who can request a chat-style revision or approve for publishing — without access to the rest of the workspace.',
    alt: 'ContentLineup Approvals screen showing drafts awaiting review with approve and request-changes actions.',
  },
  library: {
    title: 'Library',
    caption:
      'Everything you have ever generated, published or not, with its images and revision history. Nothing is deleted when a plan ends, and everything here exports.',
    alt: 'ContentLineup Library screen showing an archive of generated articles with image thumbnails and publish dates.',
  },
  strategy: {
    title: 'Strategy',
    caption:
      'Keyword planning and coverage. See which target keywords already have an article, which are still open, and where two drafts are competing for the same query.',
    alt: 'ContentLineup Strategy screen showing keyword coverage, target keywords, and content gaps.',
  },
  social: {
    title: 'Social',
    caption:
      'Connected channels and the social queue. Auto-share posts appear against the article that triggers them; standalone posts sit alongside on their own schedule, in the same Draft → Scheduled → Published states.',
    alt: 'ContentLineup Social screen showing connected LinkedIn, Facebook and Instagram accounts with a queue of scheduled social posts.',
  },
  settings: {
    title: 'Settings',
    caption:
      'Workspace configuration: invite team members, export the content plan as a spreadsheet, paste a personal OpenAI or Gemini key, or switch to the managed key. Saved keys are shown only by their last four characters.',
    alt: 'ContentLineup Settings screen showing team members, content plan export, personal API key entry, and the managed key option.',
  },
};

export const screenOrder = ['plans', 'ideas', 'calendar', 'list', 'approvals', 'social', 'library', 'strategy', 'settings'];

export const trustPoints = [
  {
    title: 'API keys encrypted at rest',
    body:
      'Personal keys are encrypted with AES-256 before they touch a database, and the interface is write-only — once saved, a key is never rendered again, only its last four characters. Keys are decrypted in memory only to sign a request to your provider, and are excluded from logs, exports, and support tooling.',
  },
  {
    title: 'BYO-key requests are never pooled',
    body:
      "When you bring your own key, generation runs against your provider account and your quota alone. Your requests are never batched with another customer's traffic, and your key is never used to serve anyone else's generation.",
  },
  {
    title: 'You own the content',
    body:
      'Copyright in everything you generate is yours. We claim no licence to publish, resell, or showcase your articles, and we do not train models on your content or briefs.',
  },
  {
    title: 'No lock-in, by design',
    body:
      'Articles export as Markdown or HTML with their images; the whole content plan exports as a spreadsheet. Cancelled accounts keep read and export access to the archive. There is no export fee and no proprietary format to convert out of.',
  },
  {
    title: 'Encryption in transit',
    body:
      'Every connection to the app and the API is TLS 1.2 or higher, with HSTS enforced. Provider calls leave over TLS as well; nothing about your content travels in the clear.',
  },
  {
    title: 'Least-privilege access',
    body:
      'Production access is limited to the engineers who need it, gated behind SSO and multi-factor authentication, and logged. Support staff cannot read workspace content unless you explicitly grant access for a specific issue, and that grant expires.',
  },
  {
    title: 'Workspace isolation',
    body:
      'Workspaces are isolated at the data layer, which is what makes the per-client agency setup safe. A member of one workspace cannot enumerate or read another, even inside the same account.',
  },
  {
    title: 'Backups and recovery',
    body:
      'Automated daily encrypted backups with point-in-time recovery. Deleting an article moves it to a recoverable state before it is purged, so a misclick is not permanent.',
  },
];
