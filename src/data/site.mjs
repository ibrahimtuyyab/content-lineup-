// The site's view of its own content.
//
// Every page imports from here, exactly as it did when this file held the
// content itself. What changed is where the content comes from: the shipped
// copy now lives in site.defaults.mjs, and the admin's edits are laid over it
// from the `content_blocks` table (see overrides.mjs for the fallback chain).
//
// The derived exports below are recomputed from the merged values rather than
// re-exported from the defaults. That distinction is the whole correctness
// argument for this file: `comingSoon` re-exported from site.defaults.mjs would
// keep listing a feature that had just been marked as shipped in the admin.
import { content } from './content-blocks.mjs';

/* --------------------------------------------------------------- base content
   One export per editable block, in the order they appear in the register. */
export const site = content.site;
export const analytics = content.analytics;
export const cta = content.cta;
export const nav = content.nav;
export const footerNav = content.footerNav;

export const scatteredStack = content.scatteredStack;
export const ideaDemo = content.ideaDemo;
export const aiDemo = content.aiDemo;
export const channelDemo = content.channelDemo;
export const workflowCompare = content.workflowCompare;
export const accountTree = content.accountTree;

export const features = content.features;
export const integrations = content.integrations;
export const integrationGroups = content.integrationGroups;
export const keyModes = content.keyModes;
export const screens = content.screens;
export const screenOrder = content.screenOrder;
export const tourScreens = content.tourScreens;

export const comparison = content.comparison;
export const faqGroups = content.faqGroups;
export const pricingFaqs = content.pricingFaqs;
export const trustPoints = content.trustPoints;
export const topicClusters = content.topicClusters;

/**
 * Pricing plans have their own table and their own admin page, and
 * src/data/pricing.mjs is what the templates actually read. This export stays
 * as the shipped fallback for a build with no database, which is also what
 * `npm run plans:push` seeds from — so it is deliberately not an editable
 * block: two places to change a price is one too many.
 */
export { plans } from './site.defaults.mjs';

/* ------------------------------------------------------------------- derived */

/** Roadmap and shipped, kept visibly apart everywhere they are rendered. */
export const comingSoon = features.filter((f) => f.soon);
export const shippedFeatures = features.filter((f) => !f.soon);

/**
 * What ships today leads, everywhere this list is rendered. Ordering the band
 * WordPress → Payload → the three live channels made the second thing a visitor
 * saw two absences. Order within each group is preserved, so adding a channel
 * needs no thought about placement.
 */
export const channels = [
  ...content.channels.filter((c) => c.status === 'live'),
  ...content.channels.filter((c) => c.status !== 'live'),
];

export const liveChannels = channels.filter((c) => c.status === 'live');
export const socialPlatforms = channels.filter((c) => c.type === 'Social');

/** Legacy alias — the deeper pages still render `steps`. */
export const stages = content.stages;
export const steps = stages.map((s) => ({ ...s, title: s.title }));

/** Business owners, marketing teams and agencies lead; the rest follow. */
const NICHE_ORDER = ['owners', 'teams', 'agencies'];
export const niches = [...content.niches].sort((a, b) => {
  const ai = NICHE_ORDER.indexOf(a.id);
  const bi = NICHE_ORDER.indexOf(b.id);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
});

/**
 * The three audiences the homepage focuses on. All nine live on /made-for.
 * Filtered rather than mapped over NICHE_ORDER: an id deleted in the admin
 * would otherwise leave a hole in this array that the homepage would render as
 * a crash rather than as one card fewer.
 */
export const homeNiches = NICHE_ORDER.map((id) => niches.find((n) => n.id === id)).filter(Boolean);

export const allFaqs = faqGroups.flatMap((g) => g.items || []);
export const homeFaqs = allFaqs.filter((f) => f.home);
