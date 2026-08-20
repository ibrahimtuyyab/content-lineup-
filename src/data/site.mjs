// Central content + config for the ContentLineup marketing site.
// Brand tokens mirror the live product site: ink #0a0a0a, paper #fafaf7, accent #c2410c, Fraunces + Inter.

export const site = {
  name: 'ContentLineup',
  legalName: 'ContentLineup by Teczon Labs',
  origin: 'https://contentlineup.com',
  tagline: 'Every idea, lined up and published.',
  description:
    'ContentLineup is a content operating system for marketing teams: capture ideas, generate drafts with AI or write them yourself, plan them on a calendar, get approvals, and publish to your blog and social channels on schedule.',
  email: 'iqbal@teczonlabs.com',
  parent: { name: 'Teczon Labs', url: 'https://teczonlabs.com' },
  app: {
    login: 'https://app.contentlineup.com/login',
    signup: 'https://app.contentlineup.com/signup',
    // ⚠️ SET BEFORE DEPLOY — booking page for "Book a demo".
    // A mailto: used to sit here: it captured no lead, carried no attribution,
    // and did nothing at all on a device with no mail client configured.
    demo: 'https://cal.com/contentlineup/demo',
  },
  social: ['https://teczonlabs.com', 'https://app.contentlineup.com'],
  locale: 'en_US',
  twitter: '@contentlineup',
  founded: '2025',
};

/**
 * Cookieless analytics. Plausible sets no cookies and stores no personal data,
 * so this needs no consent banner under GDPR/ePrivacy — which is the whole
 * reason to prefer it over GA4 on a site with EU traffic.
 *
 * ⚠️ SET BEFORE DEPLOY — `domain` must match the site registered in your
 * Plausible dashboard exactly, or every event is dropped silently.
 * For Fathom instead: set provider 'fathom', src to your CDN URL, and put the
 * site id in `domain`; the CTA events in app.js work with either.
 */
export const analytics = {
  enabled: true,
  provider: 'plausible',
  domain: 'contentlineup.com',
  src: 'https://plausible.io/js/script.outbound-links.js',
};

export const cta = {
  primary: { label: 'Start free', href: site.app.signup },
  // Not "90-second tour": there is no video, and promising one the page cannot
  // deliver is exactly where a first-time visitor decides we oversell.
  secondary: { label: 'See how it works', href: '/#tour' },
  tour: { label: 'See how it works', href: '/#tour' },
  demo: { label: 'Book a demo', href: site.app.demo },
  login: { label: 'Log in', href: site.app.login },
};

export const nav = [
  { label: 'Product', href: '/features' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Who it’s for', href: '/made-for' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
];

export const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Content calendar', href: '/features#calendar' },
      { label: 'Approvals', href: '/features#approvals' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Who it’s for',
    links: [
      { label: 'Business owners', href: '/made-for#owners' },
      { label: 'Marketing teams', href: '/made-for#teams' },
      { label: 'Agencies', href: '/made-for#agencies' },
      { label: 'Why ContentLineup', href: '/why-contentlineup' },
      { label: 'ContentLineup vs Buffer', href: '/compare/contentlineup-vs-buffer' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'All resources', href: '/resources' },
      { label: 'Guides', href: '/resources#guides' },
      { label: 'Case studies', href: '/resources#case-studies' },
      { label: 'Tool comparisons', href: '/resources#comparisons' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
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
    id: 'ideas',
    name: 'Idea board',
    kind: 'idea',
    stage: 'idea',
    short: 'Catch every idea before it dies in a Slack thread.',
    body:
      'Ideas arrive from everywhere — a sales call, a support ticket, a competitor post, a keyword you spotted at 11pm. The idea board is one place to drop them all, tag them with a target keyword, and let the good ones rise. When there is room in the calendar, promote an idea to a brief in one click and it carries its keyword and notes with it.',
    bullets: [
      'Capture from anywhere in the app, in a sentence',
      'Tag with a target keyword and the account it belongs to',
      'Captured → Ready to brief → Promoted, so nothing stalls silently',
      'Promote to a brief without retyping anything',
    ],
    screen: 'ideas',
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    kind: 'idea',
    stage: 'idea',
    short: 'Group content into a launch, a season, or a quarter.',
    body:
      'A campaign is a container for everything that belongs together: a product launch, a seasonal push, a quarterly theme. Every idea, draft, blog post and social post inside it shares a goal, a date range and an owner — so you can see whether the campaign is actually on track instead of scrolling a flat list of posts.',
    bullets: [
      'Account → Campaign → Content, so nothing floats loose',
      'Date range, owner and goal on every campaign',
      'Progress at a glance: drafted, approved, scheduled, published',
      'Filter the calendar to one campaign in a click',
    ],
    screen: 'campaigns',
  },
  {
    id: 'ai-writer',
    name: 'AI drafts, outline first',
    kind: 'write',
    stage: 'generate',
    short: 'A structured first draft in about a minute — not a wall of text.',
    body:
      'Give ContentLineup a topic and a target keyword. It builds the outline before it writes a word, then fills it in: an opening paragraph that answers the question directly, H2 and H3 sections in a logical order, a developed body, a conclusion, and an optional FAQ block. Because it plans before it writes, sections do not drift or repeat themselves the way single-prompt output usually does.',
    bullets: [
      'Outline-first generation, so headings stay in logical order',
      'Direct-answer opening — the format AI search engines quote',
      'Optional FAQ block with question-shaped H3s',
      'Tone, audience and reading level set once per account',
    ],
    screen: 'editor',
  },
  {
    id: 'manual',
    name: 'Or write it yourself',
    kind: 'write',
    stage: 'generate',
    short: 'A full editor. The AI is optional, not compulsory.',
    body:
      'Nothing forces you to generate. Start a blank post, paste something a writer sent over, or take an AI draft and rewrite it line by line. The editor, the calendar, the approvals and the publishing all work exactly the same whether a human or a model produced the words. Teams that use ContentLineup purely as a publishing workflow are using it correctly.',
    bullets: [
      'Start blank, paste in, or generate — same editor either way',
      'AI assistance stays off until you ask for it',
      'Every other feature works on hand-written posts',
      'Full revision history on manual edits too',
    ],
    screen: 'editor',
  },
  {
    id: 'revisions',
    name: 'Chat-style revisions',
    kind: 'write',
    stage: 'generate',
    short: 'Say “make the intro shorter” and only the intro changes.',
    body:
      'Edits are a conversation, not a prompt rewrite. Select a section and ask for what you want in plain language — “make this shorter”, “add a comparison table”, “rewrite this for a first-time buyer” — and ContentLineup applies the change to that section while leaving the rest of the post untouched.',
    bullets: [
      'Section-scoped edits, so the rest of the draft stays stable',
      'Plain-language instructions, no prompt engineering',
      'Add tables, lists or FAQ blocks on request',
      'Full revision history — roll back to any earlier version',
    ],
    screen: 'editor',
  },
  {
    id: 'brand-voice',
    name: 'Brand voice per account',
    kind: 'write',
    stage: 'generate',
    short: 'Set the voice once. Every draft comes out sounding like you.',
    body:
      'Tone, reading level, audience and the words you never want to see are set once on the account and applied to everything generated inside it. Run a dental practice and an agency client from the same login and neither one starts sounding like the other.',
    bullets: [
      'Tone, audience and reading level stored per account',
      'Banned-word and phrase list respected in every draft',
      'Structure templates so posts of a type stay consistent',
      'Change the voice and regenerate without losing the plan',
    ],
    screen: 'settings',
  },
  {
    id: 'auto-images',
    name: 'Images matched to each section',
    kind: 'write',
    stage: 'generate',
    short: 'A featured image plus inline images, with alt text written for each.',
    body:
      'ContentLineup reads the finished draft, works out what each section is actually about, and places a featured image plus inline images that match those sections. Every image ships with descriptive alt text written from the surrounding copy, so your posts stay accessible and image search has something real to index.',
    bullets: [
      'Featured image chosen from the subject, not the title alone',
      'Inline images placed against the section they illustrate',
      'Descriptive alt text per image, not filename stuffing',
      'Swap any image for your own upload without regenerating',
    ],
    screen: 'library',
  },
  {
    id: 'seo-output',
    name: 'SEO fields, already filled in',
    kind: 'write',
    stage: 'generate',
    short: 'Meta title, description, slug and keyword checks in the draft.',
    body:
      'Each post arrives with a meta title inside the length that actually renders in search results, a meta description written as a click-through pitch rather than a summary, and a clean URL slug. ContentLineup also checks your primary and secondary keywords against the finished body and flags the ones that never made it in.',
    bullets: [
      'Meta title and description generated and length-checked',
      'Clean, readable URL slug — no dates or ID numbers',
      'Primary and secondary keyword coverage checked against the body',
      'Internal link suggestions drawn from posts already in your library',
    ],
    screen: 'strategy',
  },
  {
    id: 'calendar',
    name: 'Content calendar',
    kind: 'schedule',
    stage: 'calendar',
    short: 'One month view for every brand, every channel.',
    body:
      'A month grid of everything in flight — drafts, posts waiting on approval, scheduled posts and published ones — across blogs and social channels. Filter it to one account or one campaign, spot the week where nothing is queued before it becomes a gap in your archive, and see your whole publishing rhythm without opening a list.',
    bullets: [
      'Month view across drafts, approvals, scheduled and published',
      'Blog posts and social posts on the same grid',
      'Filter by account, campaign, channel or owner',
      'Empty-week flags before the queue runs dry',
    ],
    screen: 'calendar',
  },
  {
    id: 'scheduling',
    name: 'Per-post scheduling',
    kind: 'schedule',
    stage: 'calendar',
    short: 'Pick any future date and time, per post, per channel.',
    body:
      'Every post carries its own publish date and time. Set one for next Tuesday at 9:00 AM and another for the first of next month; ContentLineup holds each in the queue and publishes it on the minute you chose, in your account timezone. Nothing waits on you being at a desk.',
    bullets: [
      'Minute-level scheduling in your account timezone',
      'Reschedule by editing the date — the queue reorders itself',
      'Publish-now override on anything queued',
      'Clear states: Idea → Draft → In review → Scheduled → Published',
    ],
    screen: 'list',
  },
  {
    id: 'approvals',
    name: 'Approvals',
    kind: 'approve',
    stage: 'approve',
    short: 'Nothing goes live until the right person says yes.',
    body:
      'Turn on the approval gate and scheduled content waits for a named reviewer before it publishes. Reviewers can approve, or ask for a change in plain language and watch the draft update. Clients get a review link that shows them their content and nothing else — no seat, no login, no access to the rest of your workspace.',
    bullets: [
      'Named reviewers per account or per campaign',
      'Client-facing review links — no account required',
      'Request a change in plain language instead of a comment thread',
      'The gate covers social posts as well as blog posts',
    ],
    screen: 'approvals',
  },
  {
    id: 'accounts',
    name: 'Multiple brands and clients',
    kind: 'approve',
    stage: 'approve',
    short: 'One calendar for every client. One login for all of them.',
    body:
      'Each brand or client gets its own account: its own voice, its own channels, its own campaigns, its own approval chain, its own calendar. Switch between them from one login, or open the all-accounts view and see everything publishing this week in a single grid.',
    bullets: [
      'Unlimited accounts on every plan',
      'Per-account voice, channels, reviewers and keywords',
      'One cross-account view of everything going out this week',
      'Accounts are isolated at the data layer — one client cannot see another',
    ],
    screen: 'accounts',
  },
  {
    id: 'social-autoshare',
    name: 'Auto-share on publish',
    kind: 'social',
    stage: 'publish',
    short: 'The post goes live and the social posts go out with it.',
    body:
      'Connect LinkedIn, Facebook and Instagram once. When a blog post publishes, ContentLineup writes a promo post for each connected channel — a hook drawn from the post rather than the headline pasted three times — attaches the featured image, and posts it at the same moment. Distribution stops being a separate job you remember to do afterwards.',
    bullets: [
      'One post per channel, written for that channel',
      'Featured image attached automatically, cropped per platform',
      'Fires the moment the post publishes — or on a delay you set',
      'Edit or switch off any channel before it goes out',
    ],
    screen: 'social',
    platforms: ['linkedin', 'facebook', 'instagram'],
  },
  {
    id: 'social-composer',
    name: 'Social composer',
    kind: 'social',
    stage: 'publish',
    short: 'Standalone social posts, on their own schedule.',
    body:
      'Not everything worth posting is a blog post. Write standalone posts for LinkedIn, Facebook and Instagram in the same workspace, schedule each to its own date and time, and watch them move through the same states as everything else. One place for the whole content operation instead of a blog tool plus a social scheduler.',
    bullets: [
      'Compose once and adapt per channel, or write each separately',
      'Per-post scheduling to the minute, same as blog posts',
      'The approval gate applies to social posts too',
      'Upload an image or reuse one from the library',
    ],
    screen: 'social',
    platforms: ['linkedin', 'facebook', 'instagram'],
  },
  {
    id: 'publishing-log',
    name: 'Publishing log',
    kind: 'trust',
    stage: 'publish',
    short: 'Proof of what went out, where, and when.',
    body:
      'Every publish attempt is recorded: which post, which channel, which account, the exact timestamp, and the live URL. If a channel rejects something — an expired token, a platform rule — you see the reason and can retry from the log rather than discovering the gap a week later.',
    bullets: [
      'Timestamped record of every publish across every channel',
      'Live URLs captured so you can check the result in one click',
      'Failures show the reason and a retry action',
      'Exportable as a spreadsheet for client reporting',
    ],
    screen: 'publishing',
  },
  {
    id: 'keys',
    name: 'Managed or your own AI key',
    kind: 'ai',
    stage: 'foundation',
    short: 'Use our AI, or plug in your own OpenAI or Gemini key.',
    body:
      'Start on the managed key and write your first post about ninety seconds after signing up — no provider account, nothing to paste. When volume grows and you want per-token cost control, add your own OpenAI or Gemini key in Settings and switch over. Both modes use the same pipeline; the only thing that changes is whose key pays for the tokens.',
    bullets: [
      'Managed: nothing to configure, generation included in your plan',
      'Your own key: your provider bill, at cost, with no cap from us',
      'Switch modes at any time without losing content',
      'Keys are encrypted at rest and never displayed again after saving',
    ],
    screen: 'settings',
  },
  {
    id: 'no-lock-in',
    name: 'No lock-in',
    kind: 'trust',
    stage: 'foundation',
    short: 'Your content is yours, exportable, in open formats.',
    body:
      'Posts export as Markdown, HTML, or a spreadsheet of the whole content plan. Images download with them. There is no proprietary format, no export fee, and no gate that switches off your archive when you cancel — a closed account keeps read and export access to everything you already made.',
    bullets: [
      'Export any post as Markdown or HTML',
      'Export the whole content plan as a spreadsheet',
      'Images download alongside the post body',
      'Cancelling keeps read and export access to past work',
    ],
    screen: 'settings',
  },
  {
    id: 'wordpress',
    name: 'Publish to WordPress',
    kind: 'publish',
    stage: 'publish',
    soon: true,
    short: 'Approved posts land in WordPress as scheduled posts.',
    body:
      'Connect a WordPress site once and approved posts are pushed straight into it — title, body, headings, featured image, inline images with alt text, meta title and description, and the publish date you set in ContentLineup. No copy-paste, no reformatting, no “who forgot to add the images” on a Friday afternoon.',
    bullets: [
      'Self-hosted WordPress and WordPress.com',
      'Featured and inline images transferred with alt text intact',
      'Category, tags and author mapped per account',
      'Scheduled in WordPress for the date ContentLineup holds',
    ],
    screen: 'publishing',
  },
  {
    id: 'payload',
    name: 'Publish to Payload CMS',
    kind: 'publish',
    stage: 'publish',
    soon: true,
    short: 'Push approved posts into a Payload collection.',
    body:
      'For teams running a modern headless stack, ContentLineup will publish into a Payload CMS collection over its API — fields mapped to your schema, media uploaded to your media collection, and the draft/published state respected. Your front end keeps rendering from Payload exactly as it does now.',
    bullets: [
      'Map ContentLineup fields onto your Payload collection schema',
      'Images uploaded into your Payload media collection',
      'Draft and published states respected',
      'Publishing webhooks and the REST API are live today if you cannot wait',
    ],
    screen: 'publishing',
  },
  {
    id: 'recurring',
    name: 'Recurring publish slots',
    kind: 'schedule',
    stage: 'calendar',
    soon: true,
    short: '“Every Tue & Thu at 9 AM”, filled automatically from the queue.',
    body:
      'Define the rhythm once — every Tuesday and Thursday at 9:00 AM — and ContentLineup pulls the next approved post off the queue to fill each slot. You keep the cadence even in the weeks you never log in.',
    bullets: [
      'Define a weekly or monthly publishing rhythm',
      'Slots auto-fill from approved posts in the queue',
      'Empty-slot warnings before the queue runs dry',
    ],
    screen: 'calendar',
  },
  {
    id: 'bulk',
    name: 'Bulk briefs',
    kind: 'write',
    stage: 'idea',
    soon: true,
    short: 'Paste a spreadsheet of topics; get a scheduled month back.',
    body:
      'Paste or upload a spreadsheet of topics, target keywords and publish dates. ContentLineup generates every post in the sheet and drops each one onto the calendar on its assigned date — a quarter of content briefed in a single paste.',
    bullets: [
      'CSV or spreadsheet paste with topic, keyword and date columns',
      'Batch generation with per-row status',
      'Rows land on the calendar already scheduled',
    ],
    screen: 'ideas',
  },
];

export const comingSoon = features.filter((f) => f.soon);
export const shippedFeatures = features.filter((f) => !f.soon);

// ---------------------------------------------------------------------------
// Channels content is published to. Status is honest: 'live' ships today,
// 'soon' is on the roadmap and is labelled as such everywhere it appears.
// ---------------------------------------------------------------------------
const channelDefs = [
  {
    id: 'wordpress',
    name: 'WordPress',
    type: 'Blog',
    status: 'soon',
    tagline: 'Posts land in WordPress, images and all.',
    best: 'Any business already running its blog on WordPress',
    desc:
      'Approved posts are pushed straight into WordPress with the body, headings, featured image, inline images and alt text intact — scheduled for the date you picked in ContentLineup.',
    detail: 'Self-hosted and WordPress.com · featured + inline images · category, tags and author mapping',
  },
  {
    id: 'payload',
    name: 'Payload CMS',
    type: 'Headless CMS',
    status: 'soon',
    tagline: 'Push into a Payload collection over its API.',
    best: 'Teams running a modern headless front end',
    desc:
      'Fields mapped onto your Payload collection schema, media uploaded to your media collection, draft and published states respected. Your front end keeps rendering exactly as it does now.',
    detail: 'Collection field mapping · media collection uploads · draft/published states',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'Social',
    status: 'live',
    tagline: 'Posts as you, or as the company page.',
    best: 'B2B, SaaS, agencies and consultants',
    desc:
      'Opens with the point rather than a link dump, because LinkedIn rewards posts people stop to read. Posts to a personal profile or a company page on the schedule you set.',
    detail: 'Personal profile or company page · text posts with link preview · image posts',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'Social',
    status: 'live',
    tagline: 'Page posts with the featured image attached.',
    best: 'Local business, e-commerce and community audiences',
    desc:
      'Publishes to a Facebook Page with the featured image and a short lead-in — the format local service businesses get the most out of, and the one they most often forget to do.',
    detail: 'Facebook Pages · link posts with preview image · image posts',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'Social',
    status: 'live',
    tagline: 'Feed posts with a caption written for Instagram.',
    best: 'E-commerce, real estate and visual-first brands',
    desc:
      'Publishes a single-image feed post built from the featured image, with a caption written for Instagram — no link in the caption, so the copy carries the click to your profile.',
    detail: 'Business/Creator accounts · single-image feed posts · captions with hashtags',
  },
];

// What ships today leads, everywhere this list is rendered. Ordering the band
// WordPress → Payload → the three live channels made the second thing a visitor
// saw two absences. Order within each group is preserved, so adding a channel
// to channelDefs needs no thought about placement.
export const channels = [
  ...channelDefs.filter((c) => c.status === 'live'),
  ...channelDefs.filter((c) => c.status !== 'live'),
];

export const liveChannels = channels.filter((c) => c.status === 'live');
export const socialPlatforms = channels.filter((c) => c.type === 'Social');

// ---------------------------------------------------------------------------
// The workflow. This is the spine of the whole site:
// Idea → Generate → Calendar → Approve → Publish.
// ---------------------------------------------------------------------------
export const stages = [
  {
    id: 'idea',
    n: '01',
    verb: 'Idea',
    title: 'Capture the idea',
    short: 'Every idea on one board instead of five inboxes.',
    body:
      'Add ideas the moment they turn up — from a sales call, a support email, a search term you spotted at 11pm. Tag each one with the brand it belongs to and the keyword you want it to rank for, then group related ones into a campaign. When the calendar has room, turn an idea into a brief. Nothing needs retyping.',
    detail: [
      'One board per account, or one view across all of them',
      'Target keyword and campaign attached at capture',
      'Promote to a brief without retyping anything',
    ],
    screen: 'ideas',
  },
  {
    id: 'generate',
    n: '02',
    verb: 'Generate',
    title: 'Draft it — with AI or by hand',
    short: 'A full draft in a minute, or a blank page if you prefer.',
    body:
      'Ask ContentLineup to write it and you get a draft built from an outline: it answers the question up front, puts the headings in a sensible order, picks an image for each section with alt text, and fills in the SEO fields. Or start with a blank page and write every word yourself. Either way, you can edit by asking — say “make the intro shorter” and only the intro changes.',
    detail: [
      'Outline-first AI drafts, or write it manually',
      'Brand voice applied per account, so nothing sounds generic',
      'Revise in plain language, one section at a time',
    ],
    screen: 'editor',
  },
  {
    id: 'calendar',
    n: '03',
    verb: 'Calendar',
    title: 'Put it on the calendar',
    short: 'One month view for every brand and every channel.',
    body:
      'Blog posts and social posts sit on the same month view. Filter by brand or campaign, spot the empty week before it turns into a gap, and pick the exact day and time each post goes out — in your own timezone, down to the minute.',
    detail: [
      'Blog and social on one grid, filtered by account or campaign',
      'Minute-level scheduling in your account timezone',
      'Empty-week flags before the queue runs dry',
    ],
    screen: 'calendar',
  },
  {
    id: 'approve',
    n: '04',
    verb: 'Approve',
    title: 'Get the sign-off',
    short: 'Nothing goes live until the right person says yes.',
    body:
      'Send each draft to one named reviewer — an editor, an owner, a client. They can approve it, or ask for a change in plain words and watch the draft update in front of them. Clients review through a link that shows only their own content: no seat, no login, no way into the rest of your workspace.',
    detail: [
      'Named reviewers per account or per campaign',
      'Client review links — no account required',
      'The gate covers social posts as well as blog posts',
    ],
    screen: 'approvals',
  },
  {
    id: 'publish',
    n: '05',
    verb: 'Publish',
    title: 'It publishes itself',
    short: 'On the date you picked, to every channel you connected.',
    body:
      'Once approved, a post goes out on its own at the minute you picked — to LinkedIn, Facebook and Instagram. WordPress and Payload CMS are on the way. Every attempt lands in the publishing log with a time and the live link, so you can show what went out without opening five tabs.',
    detail: [
      'Live today: LinkedIn, Facebook and Instagram',
      'Coming soon: WordPress and Payload CMS publishing',
      'Timestamped publishing log with live URLs and retries',
    ],
    screen: 'publishing',
  },
];

// Legacy alias — the deeper pages still render `steps`.
export const steps = stages.map((s) => ({ ...s, title: s.title }));

// ---------------------------------------------------------------------------
// The messy stack ContentLineup replaces. Used by the problem section.
// ---------------------------------------------------------------------------
export const scatteredStack = [
  { tool: 'Notion', job: 'where ideas go to be forgotten' },
  { tool: 'Google Docs', job: 'drafts, in twelve versions' },
  { tool: 'Slack', job: 'approvals, buried in a thread' },
  { tool: 'Spreadsheet', job: 'the calendar nobody updates' },
  { tool: 'CMS + 3 apps', job: 'copy, paste, reformat, repeat' },
];

// ---------------------------------------------------------------------------
// One idea, four channels. Powers the interactive Channels tabs.
// ---------------------------------------------------------------------------
export const channelDemo = {
  idea: 'Summer AC maintenance tips',
  account: 'Northgate Air',
  outputs: [
    {
      id: 'blog',
      preview: { kind: 'article', readMins: 7, updated: 'Draft · ready to schedule' },
      label: 'Blog post',
      meta: '1,540 words · 6 sections · 4 images',
      title: '7 Summer AC Maintenance Tips That Cut Your Cooling Bill',
      lines: [
        'The single biggest summer efficiency win is a clean filter — a clogged one can add 15% to a cooling bill and shorten the compressor’s life.',
        'H2 · Change the filter every 30–60 days in summer',
        'H2 · Clear two feet around the outdoor condenser',
        'H2 · What a professional tune-up actually checks',
      ],
      foot: 'Meta title 58 chars · slug /summer-ac-maintenance-tips · keyword covered 9×',
    },
    {
      id: 'linkedin',
      preview: {
        kind: 'linkedin',
        name: 'Northgate Air',
        headline: 'Heating & cooling for the north side · 9 employees',
        time: '2h',
        reactions: 27,
        comments: 4,
        reposts: 2,
        link: { domain: 'northgateair.com', title: '7 summer AC maintenance tips that cut your cooling bill' },
      },
      label: 'LinkedIn',
      meta: 'Company page · 1 image · 812 characters',
      title: 'Northgate Air',
      lines: [
        'A clogged air filter can add 15% to a summer cooling bill.',
        '',
        'It is the cheapest fix in the building and the one most often skipped. Here is the 20-minute checklist we give every customer before July:',
        '',
        '1. Filter out, date written on the new one',
        '2. Two feet cleared around the condenser',
        '3. Thermostat schedule checked, not guessed',
      ],
      foot: 'Publishes 09:00 · opens with the point, not a link',
    },
    {
      id: 'instagram',
      preview: { kind: 'instagram', user: 'northgateair', place: 'Northgate Air', time: '4 hours ago', likes: 34, comments: 6 },
      label: 'Instagram',
      meta: 'Business account · single-image feed post',
      title: '@northgateair',
      lines: [
        'Your AC is working twice as hard as it needs to. ☀️',
        '',
        '3 things to check before the heat hits — takes 20 minutes, saves about 15% on the bill.',
        '',
        'Full checklist on the blog — link in bio.',
        '',
        '#hvac #homemaintenance #summertips',
      ],
      foot: 'No link in caption · hashtags per account preset',
    },
    {
      id: 'facebook',
      preview: {
        kind: 'facebook',
        page: 'Northgate Air',
        time: 'Yesterday at 09:00',
        reactions: 18,
        comments: 3,
        shares: 2,
        link: { domain: 'NORTHGATEAIR.COM', title: '7 summer AC maintenance tips that cut your cooling bill' },
      },
      label: 'Facebook',
      meta: 'Page post · link preview with featured image',
      title: 'Northgate Air',
      lines: [
        'Before the first heatwave: three things worth twenty minutes of your Saturday.',
        '',
        'A clean filter alone can knock about 15% off a summer cooling bill — and it is the job people skip most.',
        '',
        'Full checklist below 👇',
      ],
      foot: 'Link preview pulls the featured image automatically',
    },
  ],
};

// ---------------------------------------------------------------------------
// The "type an idea" demo. Static, pre-computed responses — this is a taste of
// the product, not a live generation endpoint.
// ---------------------------------------------------------------------------
export const ideaDemo = {
  placeholder: 'Summer AC maintenance tips',
  presets: [
    {
      idea: 'Summer AC maintenance tips',
      account: 'Northgate Air',
      keyword: 'summer ac maintenance',
      title: '7 Summer AC Maintenance Tips That Cut Your Cooling Bill',
      hooks: [
        'A clogged filter can add 15% to a summer cooling bill.',
        'Three checks, twenty minutes, before the first heatwave.',
      ],
      dates: ['Blog · Tue 09:00', 'LinkedIn · Tue 09:00', 'Instagram · Thu 17:00'],
    },
    {
      idea: 'How to choose a florist for a wedding',
      account: 'Bloom Studio',
      keyword: 'choosing a wedding florist',
      title: 'How to Choose a Wedding Florist: 9 Questions to Ask First',
      hooks: [
        'Most couples book a florist before they know what to ask.',
        'The nine questions that decide whether the flowers survive the day.',
      ],
      dates: ['Blog · Wed 08:00', 'Instagram · Wed 12:00', 'Facebook · Fri 10:00'],
    },
    {
      idea: 'Are dental implants worth the cost',
      account: 'Harbor Dental',
      keyword: 'dental implants cost',
      title: 'Are Dental Implants Worth It? A Plain Look at Cost and Lifespan',
      hooks: [
        'An implant costs more up front and less over twenty years.',
        'What the price actually covers — and what it does not.',
      ],
      dates: ['Blog · Mon 09:00', 'Facebook · Mon 09:00', 'LinkedIn · Wed 08:00'],
    },
    {
      idea: 'Why our onboarding is now 3 days not 3 weeks',
      account: 'Lumen Analytics',
      keyword: 'saas onboarding time',
      title: 'How We Cut SaaS Onboarding From Three Weeks to Three Days',
      hooks: [
        'Onboarding was never a training problem. It was a setup problem.',
        'Three weeks to three days, and the four decisions that got us there.',
      ],
      dates: ['Blog · Thu 09:00', 'LinkedIn · Thu 09:00', 'LinkedIn · Mon 08:00'],
    },
  ],
};

// ---------------------------------------------------------------------------
// AI + manual demo: the revision instruction and the before/after copy.
// ---------------------------------------------------------------------------
export const aiDemo = {
  section: 'Introduction',
  original:
    'When it comes to the topic of summer air conditioning maintenance, there are a number of important considerations that homeowners should be aware of before the warmer months arrive, and understanding these factors can help you make more informed decisions about the care of your cooling system over the course of the season.',
  instructions: [
    {
      id: 'shorter',
      label: 'Make the introduction shorter.',
      result:
        'Summer is when an air conditioner works hardest — and when small neglected jobs cost the most. Here is what to check before the first heatwave.',
    },
    {
      id: 'direct',
      label: 'Open with the direct answer.',
      result:
        'Change the filter, clear two feet around the outdoor unit, and book a tune-up before June. Those three jobs account for most of what a summer service visit fixes.',
    },
    {
      id: 'table',
      label: 'Add a comparison table.',
      result:
        'Summer is when an air conditioner works hardest. The table below compares what each maintenance job costs, how long it takes, and what it saves over a season.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Accounts / campaigns hierarchy used by the Teams & Campaigns section.
// Demo data across five different businesses, deliberately.
// ---------------------------------------------------------------------------
export const accountTree = [
  {
    id: 'northgate',
    name: 'Northgate Air',
    kind: 'HVAC · 9 people',
    initials: 'NA',
    tone: 'accent',
    reviewer: 'Iman Marsh · Owner',
    campaigns: [
      {
        name: 'Summer cooling season',
        window: 'May – Aug',
        items: [
          { title: '7 summer AC maintenance tips', channel: 'Blog', state: 'published' },
          { title: 'Filter checklist carousel', channel: 'Instagram', state: 'scheduled' },
          { title: 'Heat pump vs furnace', channel: 'Blog', state: 'review' },
        ],
      },
      {
        name: 'Maintenance plans',
        window: 'Always on',
        items: [
          { title: 'What a tune-up includes', channel: 'Blog', state: 'draft' },
          { title: 'Plan comparison post', channel: 'Facebook', state: 'scheduled' },
        ],
      },
    ],
  },
  {
    id: 'bloom',
    name: 'Bloom Studio',
    kind: 'Florist · 4 people',
    initials: 'BS',
    tone: 'sched',
    reviewer: 'Priya Nandra · Owner',
    campaigns: [
      {
        name: 'Wedding season 2026',
        window: 'Feb – Sep',
        items: [
          { title: 'How to choose a wedding florist', channel: 'Blog', state: 'scheduled' },
          { title: 'Behind the arch — build video', channel: 'Instagram', state: 'review' },
          { title: 'Seasonal stem guide', channel: 'Blog', state: 'draft' },
        ],
      },
    ],
  },
  {
    id: 'harbor',
    name: 'Harbor Dental',
    kind: 'Dental practice · 12 people',
    initials: 'HD',
    tone: 'sched',
    reviewer: 'Dr. Alia Rahim · Principal',
    campaigns: [
      {
        name: 'Implants awareness',
        window: 'Q3',
        items: [
          { title: 'Are dental implants worth it?', channel: 'Blog', state: 'published' },
          { title: 'Implant myths, answered', channel: 'Facebook', state: 'scheduled' },
        ],
      },
    ],
  },
  {
    id: 'lumen',
    name: 'Lumen Analytics',
    kind: 'B2B SaaS · 30 people',
    initials: 'LA',
    tone: 'ink',
    reviewer: 'Marco Deniz · Head of Marketing',
    campaigns: [
      {
        name: 'Q3 product launch',
        window: 'Jul – Sep',
        items: [
          { title: 'Onboarding: 3 weeks to 3 days', channel: 'Blog', state: 'review' },
          { title: 'Launch announcement', channel: 'LinkedIn', state: 'scheduled' },
          { title: 'Customer story: Ridgeway', channel: 'Blog', state: 'draft' },
        ],
      },
    ],
  },
  {
    id: 'meridian',
    name: 'Meridian Collective',
    kind: 'Agency · 6 client accounts',
    initials: 'MC',
    tone: 'accent',
    reviewer: 'Client reviewer per account',
    campaigns: [
      {
        name: 'Retainer — all clients',
        window: 'Rolling',
        items: [
          { title: '12 posts drafted Monday', channel: 'Blog', state: 'draft' },
          { title: 'Client approvals due Wed', channel: 'Review', state: 'review' },
          { title: 'Publishing Tue & Thu', channel: 'Multi', state: 'scheduled' },
        ],
      },
    ],
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
    id: 'teams',
    label: 'Marketing teams',
    short: 'One workflow instead of five tools.',
    headline: 'Run the whole content operation from one place.',
    problem:
      'The work is spread across a wishlist in Notion, drafts in Google Docs, approvals in a Slack thread, a calendar in a spreadsheet and publishing in the CMS. Nothing is wrong with any of those tools — the problem is the seams between them, which is where content quietly stops moving.',
    solution:
      'Ideas, drafts, the calendar, approvals and publishing live in one workflow. Everyone can see what is in flight, who owns it, when it goes out and what is waiting on them. Campaigns group the work by launch or quarter, so “are we on track?” has an answer instead of a meeting.',
    example:
      'Example: a five-person team running two campaigns, drafting Monday, approving Wednesday, and publishing to the blog and LinkedIn on Tuesday and Thursday — without a status call.',
    stats: [
      { value: '1', label: 'workflow instead of five tools' },
      { value: 'Campaigns', label: 'grouped by launch or quarter' },
    ],
  },
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
/** Business owners, marketing teams and agencies lead; the rest follow. */
const NICHE_ORDER = ['owners', 'teams', 'agencies'];
niches.sort((a, b) => {
  const ai = NICHE_ORDER.indexOf(a.id);
  const bi = NICHE_ORDER.indexOf(b.id);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
});

/** The three audiences the homepage focuses on. All nine live on /made-for. */
export const homeNiches = ['owners', 'teams', 'agencies'].map((id) => niches.find((n) => n.id === id));

export const integrations = [
  { name: 'OpenAI', group: 'AI models', status: 'live', desc: 'Bring your own OpenAI key and pick the model every draft is generated with.', glyph: 'ai' },
  { name: 'Google Gemini', group: 'AI models', status: 'live', desc: 'Use a Gemini key as your generation provider, with the same pipeline and the same output.', glyph: 'ai' },
  { name: 'Managed AI key', group: 'AI models', status: 'live', desc: 'Skip provider setup entirely — generation runs on our key and is included in your plan.', glyph: 'ai' },
  { name: 'LinkedIn', group: 'Social', status: 'live', desc: 'Post to a personal profile or a company page when a post publishes, or on its own schedule.', glyph: 'linkedin' },
  { name: 'Facebook', group: 'Social', status: 'live', desc: 'Publish to a Facebook Page with the featured image and a lead-in written for the feed.', glyph: 'facebook' },
  { name: 'Instagram', group: 'Social', status: 'live', desc: 'Publish single-image feed posts to a Business or Creator account, caption written for Instagram.', glyph: 'instagram' },
  { name: 'WordPress', group: 'Blog & CMS', status: 'soon', desc: 'Push approved posts into WordPress with headings, featured and inline images, alt text and meta fields intact.', glyph: 'globe' },
  { name: 'Payload CMS', group: 'Blog & CMS', status: 'soon', desc: 'Publish into a Payload collection over its API, with media uploaded to your media collection.', glyph: 'layers' },
  { name: 'Publishing webhooks', group: 'Blog & CMS', status: 'live', desc: 'Fire a webhook the moment a post publishes so your own CMS or systems can react.', glyph: 'api' },
  { name: 'REST API', group: 'Blog & CMS', status: 'live', desc: 'Create briefs, read drafts, and schedule posts programmatically from your own stack.', glyph: 'api' },
  { name: 'Markdown export', group: 'Blog & CMS', status: 'live', desc: 'Export any post as clean Markdown, images included, ready for any static site.', glyph: 'export' },
  { name: 'HTML export', group: 'Blog & CMS', status: 'live', desc: 'Export publish-ready HTML with heading structure and image tags intact.', glyph: 'export' },
  { name: 'Unsplash', group: 'Images', status: 'live', desc: 'Featured and inline images matched to each section, with alt text written per image.', glyph: 'image' },
  { name: 'Direct image upload', group: 'Images', status: 'live', desc: 'Replace any auto-matched image with your own file without regenerating the post.', glyph: 'image' },
  { name: 'Team workspaces', group: 'Planning', status: 'live', desc: 'Invite teammates or clients to an account with their own review and approval rights.', glyph: 'team' },
  { name: 'Client review links', group: 'Planning', status: 'live', desc: 'Send a client a link that shows them their content to approve — no seat, no login.', glyph: 'team' },
  { name: 'Spreadsheet export', group: 'Planning', status: 'live', desc: 'Download the whole content plan — topics, keywords, dates, statuses — as a sheet.', glyph: 'sheet' },
  { name: 'Zapier', group: 'Planning', status: 'soon', desc: 'Trigger ContentLineup briefs from thousands of apps without writing code.', glyph: 'api' },
  { name: 'Slack notifications', group: 'Planning', status: 'soon', desc: 'Get a Slack ping when a draft needs approval or a post goes live.', glyph: 'team' },
  { name: 'Google Search Console', group: 'Analytics', status: 'soon', desc: 'Pull impressions and average position back against each published post.', glyph: 'chart' },
  { name: 'Google Analytics 4', group: 'Analytics', status: 'soon', desc: 'See sessions and conversions per published post inside the library view.', glyph: 'chart' },
];

export const integrationGroups = ['Blog & CMS', 'Social', 'AI models', 'Images', 'Planning', 'Analytics'];

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
export const plans = [
  {
    id: 'byo',
    name: 'Free',
    price: '$0',
    period: '/month',
    numeric: '0',
    annual: null, // free is free either way — no toggle state to show
    kicker: 'Free forever',
    outcome: 'Get your first month of content published.',
    summary:
      'The whole workflow — ideas, calendar, approvals, publishing — with unlimited posts. You add your own OpenAI or Gemini key and pay them directly, or write everything by hand and use no AI at all.',
    cta: { label: 'Start free', href: site.app.signup },
    featured: false,
    includes: [
      'Unlimited posts, ideas and campaigns',
      'Unlimited brands and client accounts',
      'Content calendar and per-post scheduling',
      'AI drafts on your own key — or write manually',
      'Images matched to each section with alt text',
      'Publish to LinkedIn, Facebook and Instagram',
      'Markdown, HTML and spreadsheet export',
      'Email support',
    ],
    limits: 'No limit on posts from us. If you use AI, your own provider bills you at cost.',
  },
  {
    id: 'managed',
    name: 'Team',
    price: '$29',
    period: '/month',
    numeric: '29',
    // Pay for ten months, get twelve. Priced off the monthly rate so the
    // discount stays honest if the monthly price ever moves.
    annual: { price: '$290', numeric: '290', perMonth: '$24', saving: '2 months free' },
    kicker: 'Most popular',
    outcome: 'Publish every week without chasing anyone.',
    summary:
      'Everything in Free, plus AI writing included — no separate account, no key to paste — and the approval step teams need before anything goes out.',
    // "Start free" rather than "Start free trial": the free plan is the on-ramp,
    // and the old label promised a trial whose length was stated nowhere.
    cta: { label: 'Start free', href: site.app.signup },
    featured: true,
    includes: [
      'Everything in Free',
      '40 AI-generated posts a month included',
      'No OpenAI or Gemini account needed',
      'Approval workflow with named reviewers',
      '3 team seats',
      'Publishing log with live URLs',
      'Publishing webhooks and REST API',
      'Priority email support',
    ],
    limits: '40 AI posts a month. Unused posts do not roll over. Add your own key any time to remove the cap.',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$89',
    period: '/month',
    numeric: '89',
    annual: { price: '$890', numeric: '890', perMonth: '$74', saving: '2 months free' },
    kicker: 'For client work',
    outcome: 'Run twelve clients without twelve calendars.',
    summary:
      'Everything in Team, at client volume: a separate brand voice for each client, their own approval chain, and review links that let them sign off without an account.',
    cta: { label: 'Start free', href: site.app.signup },
    featured: false,
    includes: [
      'Everything in Team',
      '175 AI-generated posts a month included',
      '15 team seats',
      'Per-client brand voice and approval chains',
      'Client review links — no seat required',
      'Cross-account view of everything publishing this week',
      'Spreadsheet export of every content plan',
      'Priority support with a named contact',
    ],
    limits: '175 AI posts a month across all accounts. Bring your own key on any account to remove the cap.',
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
    q: 'Is there an annual plan, and what does it save?',
    a: 'Yes. Team and Agency can be billed yearly instead of monthly, at ten months for twelve — $290 a year instead of $348, and $890 a year instead of $1,068. The plans are otherwise identical: same features, same AI allowance each month, same seats. The free plan is free on either period.',
  },
  {
    q: 'Is there a contract or a cancellation fee?',
    a: 'No. Paid plans are month to month, or yearly if you want the two-months-free rate, and either cancels from the billing screen in a click. There is no cancellation fee, no exit interview, and no support ticket required.',
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
    title: 'Before you sign up',
    items: [
      {
        q: 'What is ContentLineup?',
        a: 'ContentLineup is a content operating system: one place to capture ideas, draft them with AI or write them yourself, plan them on a shared calendar, route them for approval, and publish them to your blog and social channels on schedule. It replaces the usual chain of a notes app, a doc, a Slack thread, a spreadsheet and a CMS with a single workflow.',
        home: true,
      },
      {
        q: 'Do I have to use AI?',
        a: 'No. AI drafting is one way in, not the only one. You can open a blank editor and write every word yourself, or paste in something a freelancer sent over — the calendar, the approvals, the scheduling and the publishing all work exactly the same. Plenty of teams use ContentLineup purely as a publishing workflow and never generate anything.',
        home: true,
      },
      {
        q: 'Will it sound like my brand?',
        a: 'You set tone, audience, reading level and a list of words you never want to see once per account, and every draft generated in that account follows them. If you run several brands, each keeps its own voice. And because revisions are plain-language instructions on a single section, tightening a draft into your voice takes minutes rather than a rewrite. The honest version: no AI tool produces a publish-ready expert piece with zero human input — expect a strong draft in two minutes and a focused review in eight.',
        home: true,
      },
      {
        q: 'Does it publish directly to WordPress?',
        a: 'Not yet — WordPress publishing is in development and is labelled “coming soon” everywhere on this site for that reason. Today you can publish to LinkedIn, Facebook and Instagram automatically, export any post as clean Markdown or HTML with its images, or push posts into your own site using the REST API and publishing webhooks, which are both live.',
        home: true,
      },
      {
        q: 'Does it support Payload CMS?',
        a: 'Payload CMS publishing is on the roadmap alongside WordPress and is not shipped yet. If you are running a Payload front end today, the live REST API and publishing webhooks let you pull approved posts into your collection now, and the native connector will replace that wiring when it lands.',
        home: true,
      },
      {
        q: 'Can clients approve content before it goes live?',
        a: 'Yes. Turn on the approval gate and scheduled content waits for a named reviewer to sign off before anything publishes. Clients review through a link that shows them their own content and nothing else — no seat, no login, no access to the rest of your workspace. They can approve, or ask for a change in plain language and watch the draft update. The gate covers social posts as well as blog posts.',
        home: true,
      },
      {
        q: 'Can I manage multiple brands or clients?',
        a: 'Yes, on every plan, with no cap on how many. Each brand or client is its own account with its own voice, channels, campaigns, reviewers and calendar. You switch between them from a single login, or open the cross-account view to see everything publishing this week in one grid. Accounts are isolated at the data layer, so one client can never see another.',
        home: true,
      },
      {
        q: 'What happens if I cancel?',
        a: 'You keep your content. Anything already published stays published and is unaffected. A cancelled account keeps read and export access to the whole library, so you can take everything out as Markdown, HTML or a spreadsheet on your own timetable. Paid plans are month to month or yearly, cancel in one click either way, and there is no cancellation fee.',
        home: true,
      },
    ],
  },
  {
    title: 'Getting started',
    items: [
      {
        q: 'How long does it take to get my first post scheduled?',
        a: 'On the managed key, most people go from signup to a scheduled article in under ten minutes: about ninety seconds to sign up and brief the topic, a couple of minutes for the draft, and the rest is your own review time. There is nothing to install and no provider account to create.',
      },
      {
        q: 'Do I need to be technical to use it?',
        a: 'No. Briefing is a sentence of plain English and editing is a conversation — "make this shorter", "add a comparison table". The only optional technical step is pasting your own API key, and the managed key exists precisely so you can skip it.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes. The bring-your-own-key plan is free forever with no article cap — you connect your own OpenAI or Gemini key and pay that provider directly. Managed-key plans start at $29/month and include generation, so there is no second bill.',
      },
    ],
  },
  {
    title: 'Managed key vs your own key',
    items: [
      {
        q: 'What is the difference between the managed key and bringing my own?',
        a: 'With the managed key, generation runs on our AI provider account and is included in your plan price — nothing to configure. With your own key, you paste an OpenAI or Gemini key into Settings and your provider bills you directly at cost, with no article cap from us. The generation pipeline and the output are identical; only the billing path changes.',
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
        a: "Yes. Keys are set per account, so an agency can run one client on the client's own key, another on the agency key, and a third on the managed key, all from the same login.",
      },
    ],
  },
  {
    title: 'Security, data & privacy',
    items: [
      {
        q: 'How is my API key stored?',
        a: 'Keys are encrypted at rest with AES-256 and are write-only in the interface — after you save one, it is never displayed again, only its last four characters. They are decrypted in memory solely to sign a request to your chosen provider, and are never logged, never shown to support staff, and never included in exports.',
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
      },
      {
        q: 'Which social platforms can ContentLineup post to?',
        a: 'LinkedIn, Facebook and Instagram are live today. LinkedIn posts to a personal profile or a company page, Facebook to a Page, and Instagram to a Business or Creator account as a single-image feed post. WordPress and Payload CMS publishing are in development. We support a short list deliberately — depth on the channels our customers actually use beats breadth we cannot maintain.',
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
        a: 'Yes. Paid plans are month to month or yearly, and both cancel in one click from the billing screen. No contract, no cancellation fee, no support ticket. You keep access until the end of the period you have already paid for.',
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
      dimension: 'Idea capture and campaigns',
      detail: 'A backlog of ideas, grouped into campaigns with a goal and a date range',
      values: ['yes', 'no', 'partial'],
      notes: [
        'Idea board per account, promoted into briefs, grouped into campaigns',
        'Nothing before the prompt — you arrive with the topic already decided',
        'Some offer content buckets or tags, but not an idea-to-brief path',
      ],
    },
    {
      dimension: 'Multiple brands and clients',
      detail: 'Separate voice, channels, reviewers and calendar per account',
      values: ['yes', 'partial', 'partial'],
      notes: [
        'Unlimited accounts on every plan, isolated at the data layer, one login',
        'Usually one workspace; brand voice is something you re-paste each time',
        'Common, but usually gated behind the highest tier and priced per channel',
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
      dimension: 'Content calendar',
      detail: 'A month view of everything in flight, blog and social together',
      values: ['yes', 'no', 'yes'],
      notes: [
        'Month view across drafts, approvals, scheduled and published, filtered by account or campaign',
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
      dimension: 'Publishes to your blog or CMS',
      detail: 'Approved posts reach the site, not just the clipboard',
      values: ['partial', 'no', 'no'],
      notes: [
        'Markdown/HTML export, publishing webhooks and a REST API today; native WordPress and Payload CMS connectors in development',
        'Output is text you paste somewhere yourself',
        'Social only — a blog post is not something they handle',
      ],
    },
    {
      dimension: 'Pricing model',
      detail: 'What you actually pay',
      values: ['note', 'note', 'note'],
      notes: [
        'Free forever, unlimited posts and brands; $29/mo adds included AI writing',
        'Typically $20–$99/mo per seat, with generation credits metered',
        'Typically per-channel or per-seat, climbing quickly with team size',
      ],
    },
  ],
  fair:
    'Where legacy scheduling tools still win: channel breadth and analytics. We do three networks well — LinkedIn, Facebook and Instagram — and they do a dozen, with a social inbox, community management and social analytics we do not offer at all. Their recurring publish slots are also shipped and ours are not. Where generic AI writing tools win: raw drafting flexibility for formats that are not articles, and a broader choice of models. And if native WordPress or Payload CMS publishing is the thing you need on day one, ours is still in development — the API and webhooks are the honest answer until it lands. ContentLineup is the better fit when the job is taking ideas all the way to published posts, across several brands, without running four tools to do it.',
};

// ---------------------------------------------------------------------------
// Product screens (section 7) — captions reused across Features and articles
// ---------------------------------------------------------------------------
export const screens = {
  plans: {
    title: 'Plans',
    caption:
      'Your content plan at a glance: every brief, its target keyword, its owner, and where it sits in the workflow. This is the view most teams open first thing on a Monday.',
    alt: 'ContentLineup Plans screen showing a content plan of briefs with target keywords, owners, and workflow status.',
  },
  ideas: {
    title: 'Ideas',
    caption:
      'The idea board. Capture ideas as they arrive, tag them with a target keyword and a campaign, and promote the good ones into briefs when there is room in the calendar.',
    alt: 'ContentLineup Ideas board showing captured content ideas in Captured, Ready to brief and Promoted columns with keyword tags.',
  },
  campaigns: {
    title: 'Campaigns',
    caption:
      'Campaigns group everything that belongs together — a launch, a season, a quarter — with a date range, an owner, and progress across drafted, approved, scheduled and published.',
    alt: 'ContentLineup Campaigns screen showing content campaigns for several brands with date ranges, owners and progress bars.',
  },
  accounts: {
    title: 'Accounts',
    caption:
      'Every brand and client you manage, in one view. Each account keeps its own voice, channels, reviewers and calendar — and you switch between them from a single login.',
    alt: 'ContentLineup Accounts screen showing five client brands with their connected channels, scheduled posts and pending approvals.',
  },
  editor: {
    title: 'Editor',
    caption:
      'Write it yourself or ask for a draft — same editor either way. Revisions are a conversation: ask for a shorter intro and only the intro changes.',
    alt: 'ContentLineup Editor screen showing a blog post draft with an AI revision panel and a plain-language instruction being applied.',
  },
  calendar: {
    title: 'Calendar',
    caption:
      'The month view of everything queued, blog and social together. Scheduled posts sit on their publish dates, so an empty week is obvious before it becomes a gap in your archive.',
    alt: 'ContentLineup Calendar screen showing a month grid with scheduled blog and social posts placed on their publish dates.',
  },
  list: {
    title: 'List',
    caption:
      'Every piece of content with its state and publish time. Draft, In review, Scheduled and Published are colour-coded, and the publish column is the single source of truth for what goes out when.',
    alt: 'ContentLineup List screen showing all content with Draft, In review, Scheduled and Published states and publish timestamps.',
  },
  approvals: {
    title: 'Approvals',
    caption:
      'The review gate. Drafts wait here for a named reviewer, who can request a change in plain language or approve for publishing — without access to the rest of the workspace.',
    alt: 'ContentLineup Approvals screen showing drafts awaiting review with approve and request-changes actions.',
  },
  library: {
    title: 'Library',
    caption:
      'Everything you have ever created, published or not, with its images and revision history. Nothing is deleted when a plan ends, and everything here exports.',
    alt: 'ContentLineup Library screen showing an archive of generated posts with image thumbnails and publish dates.',
  },
  strategy: {
    title: 'Strategy',
    caption:
      'Keyword planning and coverage. See which target keywords already have a post, which are still open, and where two drafts are competing for the same query.',
    alt: 'ContentLineup Strategy screen showing keyword coverage, target keywords, and content gaps.',
  },
  social: {
    title: 'Social',
    caption:
      'Connected channels and the social queue. Auto-share posts appear against the blog post that triggers them; standalone posts sit alongside on their own schedule.',
    alt: 'ContentLineup Social screen showing connected LinkedIn, Facebook and Instagram accounts with a queue of scheduled social posts.',
  },
  publishing: {
    title: 'Publishing',
    caption:
      'The publishing log: what went out, to which channel, at what minute, and the live URL it landed on. Failures show the reason and a retry, so a gap never goes unnoticed.',
    alt: 'ContentLineup Publishing log showing timestamped publish events across channels with live URLs, statuses and retry actions.',
  },
  settings: {
    title: 'Settings',
    caption:
      'Account configuration: brand voice, team members and reviewers, content plan export, and whether generation runs on our managed AI key or your own.',
    alt: 'ContentLineup Settings screen showing brand voice, team members, content plan export and AI key options.',
  },
};

export const screenOrder = ['ideas', 'campaigns', 'editor', 'calendar', 'approvals', 'publishing', 'accounts', 'plans', 'list', 'social', 'library', 'strategy', 'settings'];

/** The five screens that carry the Idea → Generate → Calendar → Approve → Publish story. */
export const tourScreens = ['ideas', 'editor', 'calendar', 'approvals', 'publishing'];

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

// ---------------------------------------------------------------------------
// Topic clusters. This is the SEO architecture for the resources hub: each
// cluster owns a group of related search intents, points at the product page
// that answers the commercial version of the question, and collects the
// articles that answer the informational ones.
//
// `posts` is matched by category + slug, so a cluster is never a page of dead
// links — an empty cluster simply renders its pillar link and nothing else.
// The full editorial plan, including the topics not yet written, lives in
// docs/seo-content-plan.md.
// ---------------------------------------------------------------------------
export const topicClusters = [
  {
    id: 'automation',
    label: 'Social media automation',
    blurb:
      'Scheduling, auto-publishing and the parts of social media marketing worth handing to software — plus the parts that are not.',
    pillar: { label: 'How ContentLineup automates publishing', href: '/features#stage-publish' },
    slugs: ['how-to-schedule-content-so-it-publishes-itself'],
  },
  {
    id: 'planning',
    label: 'Content planning & calendars',
    blurb:
      'Briefs, content calendars, publishing cadence and the habits that keep a calendar alive past month three.',
    pillar: { label: 'The content calendar', href: '/features#calendar' },
    slugs: ['how-to-brief-an-article-in-sixty-seconds', 'real-estate-content-marketing-guide'],
  },
  {
    id: 'seo',
    label: 'SEO & content marketing',
    blurb:
      'Keyword research, search intent, blog post optimisation, and getting quoted by AI answer engines as well as ranked by search ones.',
    pillar: { label: 'SEO fields, already filled in', href: '/features#seo-output' },
    slugs: ['how-to-get-cited-by-ai-search-engines'],
  },
  {
    id: 'tools',
    label: 'Tool comparisons',
    blurb:
      'Honest head-to-heads between publishing and scheduling tools, including where the alternatives are genuinely better.',
    pillar: { label: 'ContentLineup vs Buffer', href: '/compare/contentlineup-vs-buffer' },
    slugs: ['best-buffer-alternatives-2026'],
  },
  {
    id: 'results',
    label: 'Results & case studies',
    blurb: 'Real businesses, real before-and-after numbers, and what did not work along the way.',
    pillar: { label: 'Who it is for', href: '/made-for' },
    slugs: ['northgate-air-hvac-content-case-study'],
  },
  {
    id: 'product',
    label: 'Product updates',
    blurb: 'What shipped, what is still labelled Coming Soon, and why.',
    pillar: { label: 'Every feature', href: '/features' },
    slugs: ['product-update-august-2026'],
  },
];
