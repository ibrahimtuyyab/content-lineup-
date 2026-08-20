import { page, faqSchema, softwareSchema, finalCta } from '../lib/html.mjs';
import {
  heroSection,
  channelBand,
  problemSection,
  tourSection,
  teamsSection,
  channelsSection,
  aiSection,
  proofSection,
  audienceSection,
  pricingSection,
  resourceStrip,
} from '../lib/home-sections.mjs';
import { faqSection } from '../lib/blocks.mjs';
import { homeFaqs, plans, stages } from '../data/site.mjs';
import { posts, featured } from '../data/content.mjs';
import { abs } from '../lib/html.mjs';
import { screenSrc } from '../lib/screens.mjs';
import { screens } from '../data/site.mjs';

/** HowTo schema for the five-stage workflow — the same spine as the page copy. */
const howToSchema = () => ({
  '@type': 'HowTo',
  name: 'How to take a content idea from capture to published post',
  description:
    'The ContentLineup workflow: capture the idea, draft it with AI or by hand, schedule it on the content calendar, get it approved, and publish it to your blog and social channels.',
  totalTime: 'PT12M',
  step: stages.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.body,
    url: abs('/#stage-' + s.id),
    image: abs(screenSrc(s.screen)),
  })),
});

export default function home() {
  const caseStudy = posts.find((p) => p.category === 'case-studies');
  const reading = (featured.length >= 3 ? featured : posts).slice(0, 3);

  const body = `
${heroSection()}
${channelBand()}
${problemSection()}
${tourSection()}
${teamsSection()}
${channelsSection()}
${aiSection()}
${proofSection(caseStudy)}
${audienceSection()}
${pricingSection()}
${faqSection(homeFaqs, {
  kicker: 'Questions',
  title: 'The things people ask before signing up',
  lead: 'Short answers to the objections that actually decide it. The rest live on the FAQ page.',
  after: resourceStrip(reading),
})}
${finalCta({
  title: 'Your next 30 days of content, lined up this afternoon.',
  lead:
    'Capture the ideas you already have, let ContentLineup draft them, drop them on the calendar, and approve the month in one sitting. Free to start, no card required.',
  note: 'Free plan, no card required &middot; Approve before anything goes live &middot; Export everything, always',
  secondary: 'demo',
})}`;

  return page({
    path: '/',
    title: 'ContentLineup — Content Calendar & Social Media Automation',
    ogTitle: 'ContentLineup — every idea, lined up and published',
    description:
      'Capture ideas, draft with AI or write manually, plan them on one content calendar, approve, and auto-publish to LinkedIn, Facebook and Instagram. Start free.',
    body,
    bodyClass: 'has-sticky-cta',
    schema: [softwareSchema(plans), howToSchema(), faqSchema(homeFaqs)],
    speakable: ['.hero h1', '.hero .lead'],
  });
}
