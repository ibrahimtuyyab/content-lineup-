// The register of editable site content.
//
// One entry per thing the admin can edit that is not a post and not a plan.
// This file is the only place that decides what is editable, what it is called
// in the admin, and which page it appears on — the loader (blocks.mjs), the
// site's exports (site.mjs) and the admin's forms are all driven from it, so a
// new editable block is one entry here and nothing else.
//
// `default` is the value that ships in the repository. It is also the shape the
// admin builds its form from, which is why nothing here needs a hand-written
// field schema: the form is derived from the default, so the two cannot drift.
import * as D from './site.defaults.mjs';
import { relatedFor as relatedForDefault } from './links.defaults.mjs';
import { overrides, merge } from './overrides.mjs';

/**
 * Groups order the admin's content page. They are editorial, not technical:
 * someone fixing the wording of a feature card should not have to know that it
 * lives in the same file as the analytics domain.
 */
export const GROUPS = [
  ['Global', 'Identity, navigation and calls to action that appear on every page'],
  ['Homepage', 'The sections that make up the front page, in the order they appear'],
  ['Product', 'Features, channels, integrations and the product screens'],
  ['Audiences', 'Who the product is for, and the comparison against the alternatives'],
  ['Support', 'FAQs, trust points and the cross-page related links'],
];

export const BLOCKS = [
  /* ------------------------------------------------------------------ global */
  {
    key: 'site',
    group: 'Global',
    label: 'Site identity',
    hint: 'Name, tagline, description, contact email and the app URLs. The description is the default meta description and the origin is used to build every canonical URL, so a typo here shows up on every page.',
    default: D.site,
  },
  {
    key: 'analytics',
    group: 'Global',
    label: 'Analytics',
    hint: 'The domain must match the site registered in your Plausible dashboard exactly, or every event is dropped silently. Set enabled to false to ship no analytics script at all.',
    default: D.analytics,
  },
  {
    key: 'cta',
    group: 'Global',
    label: 'Calls to action',
    hint: 'The button labels and destinations used across the site. Changing `primary` changes the main button in the header, the hero and the closing section.',
    default: D.cta,
  },
  {
    key: 'nav',
    group: 'Global',
    label: 'Header navigation',
    hint: 'The main menu, in order. Five items is the practical maximum before it wraps on a laptop.',
    default: D.nav,
  },
  {
    key: 'footerNav',
    group: 'Global',
    label: 'Footer navigation',
    hint: 'Footer columns, each with its own list of links. Anchor links like /features#calendar are fine.',
    default: D.footerNav,
  },

  /* --------------------------------------------------------------- homepage */
  {
    key: 'scatteredStack',
    group: 'Homepage',
    label: 'The problem: scattered stack',
    hint: 'The tool-and-job pairs in the problem section. Each line names something the reader recognises from their own week.',
    default: D.scatteredStack,
  },
  {
    key: 'stages',
    group: 'Homepage',
    label: 'Workflow stages',
    hint: 'The spine of the whole site: Idea → Generate → Calendar → Approve → Publish. `screen` must be one of the product screen ids, and the deeper pages render these as numbered steps.',
    default: D.stages,
  },
  {
    key: 'ideaDemo',
    group: 'Homepage',
    label: 'Idea demo',
    hint: 'The worked examples behind the interactive idea box on the homepage.',
    default: D.ideaDemo,
  },
  {
    key: 'aiDemo',
    group: 'Homepage',
    label: 'AI editing demo',
    hint: 'The before/after copy and the instruction chips in the AI section.',
    default: D.aiDemo,
  },
  {
    key: 'channelDemo',
    group: 'Homepage',
    label: 'One idea, four channels',
    hint: 'The tabbed demo showing a single idea rewritten per channel.',
    default: D.channelDemo,
  },
  {
    key: 'workflowCompare',
    group: 'Homepage',
    label: 'Manual vs automated',
    hint: 'The two side-by-side time columns. Keep the totals consistent with the rows — a reader who adds them up and finds they disagree stops believing the rest of the page.',
    default: D.workflowCompare,
  },
  {
    key: 'accountTree',
    group: 'Homepage',
    label: 'Accounts and campaigns tree',
    hint: 'The example account structure shown in the accounts section.',
    default: D.accountTree,
  },

  /* ---------------------------------------------------------------- product */
  {
    key: 'features',
    group: 'Product',
    label: 'Features',
    hint: 'Every feature card on /features. `soon: true` marks a feature as roadmap and labels it as such everywhere it appears — the site keeps shipped and unshipped visibly apart, so do not use it for something that already works.',
    default: D.features,
  },
  {
    key: 'channels',
    group: 'Product',
    label: 'Publishing channels',
    hint: "Where content is published to. `status` is either 'live' or 'soon'; live channels are always listed first, automatically, so the order here only matters within each group.",
    default: D.channels,
  },
  {
    key: 'integrations',
    group: 'Product',
    label: 'Integrations',
    hint: 'The integrations grid. `group` must be one of the integration groups below, or the entry will not appear under any heading.',
    default: D.integrations,
  },
  {
    key: 'integrationGroups',
    group: 'Product',
    label: 'Integration groups',
    hint: 'The headings the integrations grid is grouped under, in order.',
    default: D.integrationGroups,
  },
  {
    key: 'keyModes',
    group: 'Product',
    label: 'Bring-your-own-key modes',
    hint: 'The two ways of paying for generation, as explained on the pricing and integrations pages.',
    default: D.keyModes,
  },
  {
    key: 'screens',
    group: 'Product',
    label: 'Product screen captions',
    hint: 'The title, caption and alt text for each rendered product screen. The alt text is what a screen reader announces, so describe what the screen shows rather than repeating the title.',
    default: D.screens,
  },
  {
    key: 'screenOrder',
    group: 'Product',
    label: 'Screen build order',
    hint: 'Which screens are generated at build time, in order. Every id must exist in the screen captions above.',
    default: D.screenOrder,
  },
  {
    key: 'tourScreens',
    group: 'Product',
    label: 'Homepage tour screens',
    hint: 'The screens that carry the Idea → Generate → Calendar → Approve → Publish story on the homepage.',
    default: D.tourScreens,
  },

  /* -------------------------------------------------------------- audiences */
  {
    key: 'niches',
    group: 'Audiences',
    label: 'Audiences',
    hint: 'All nine audiences on /made-for. Business owners, marketing teams and agencies always lead, and those three are the ones the homepage shows.',
    default: D.niches,
  },
  {
    key: 'comparison',
    group: 'Audiences',
    label: 'Comparison matrix',
    hint: 'The comparison table. `values` and `notes` must each have exactly one entry per column. The `fair` line is the part that admits where the alternatives win — it is the reason the table is credible, so keep it honest.',
    default: D.comparison,
  },

  /* ---------------------------------------------------------------- support */
  {
    key: 'faqGroups',
    group: 'Support',
    label: 'FAQs',
    hint: 'Every FAQ, grouped. Items marked `home: true` also appear on the homepage, and all of them feed the FAQ structured data — so an answer that is not true of the product is a search-engine problem as well as an honesty one.',
    default: D.faqGroups,
  },
  {
    key: 'pricingFaqs',
    group: 'Support',
    label: 'Pricing FAQs',
    hint: 'The shorter FAQ list shown under the pricing table.',
    default: D.pricingFaqs,
  },
  {
    key: 'trustPoints',
    group: 'Support',
    label: 'Trust points',
    hint: 'The security and privacy commitments on /security. Only claim what is actually implemented.',
    default: D.trustPoints,
  },
  {
    key: 'topicClusters',
    group: 'Support',
    label: 'Topic clusters',
    hint: 'How the resources hub groups articles. `slugs` lists post slugs; a slug with no matching published post is skipped rather than rendered as a dead link.',
    default: D.topicClusters,
  },
  {
    key: 'relatedFor',
    group: 'Support',
    label: 'Related links',
    hint: 'The editorial cross-links at the foot of each marketing page, keyed by page. Every entry should be somewhere a reader of that page plausibly wants to go next; this is not a link farm.',
    default: relatedForDefault,
  },
];

const byKey = new Map(BLOCKS.map((b) => [b.key, b]));

/** One block's definition, or undefined for a key that is not editable. */
export const blockDef = (key) => byKey.get(key);

/** The shipped value for a key — what "reset to default" restores. */
export const defaultFor = (key) => byKey.get(key)?.default;

/**
 * Lay a set of overrides over every default.
 *
 * Exported so the admin can build the same view of the content from rows it
 * has just read, instead of from the snapshot this module loaded at startup —
 * a cross-block check like "is this integration group one that exists" has to
 * see the edit made thirty seconds ago to be worth making.
 */
export const effective = (overrideMap = {}) =>
  Object.fromEntries(BLOCKS.map((b) => [b.key, merge(b.default, overrideMap[b.key])]));

/**
 * The content the site actually renders: the default with any override laid
 * over it. site.mjs re-exports these, so every page reads edited content
 * through the same path it always read the hardcoded content through.
 */
export const content = effective(overrides);

/** Keys that currently carry an override. Drives the "edited" marker. */
export const editedKeys = new Set(BLOCKS.filter((b) => b.key in overrides).map((b) => b.key));

/**
 * Override rows whose key is not in the register any more. Surfaced in the
 * admin rather than ignored, because the alternative is an edit that someone
 * made, that is stored, and that silently stopped having any effect.
 */
export const orphanKeys = Object.keys(overrides).filter((k) => !byKey.has(k));
