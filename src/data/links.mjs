// Editorial cross-links between marketing pages and articles.
//
// Kept as data rather than scattered through templates so the internal link
// graph is reviewable in one place — and so a dead link is a one-line fix.
// Every entry should be somewhere a reader of that page plausibly wants to go
// next; this is not a link farm.

export const relatedFor = {
  features: {
    title: 'Related reading',
    links: [
      {
        href: '/how-it-works',
        tag: 'Walkthrough',
        title: 'How it works, step by step',
        blurb: 'The same features shown in order, from a one-line brief to a published post.',
      },
      {
        href: '/resources/guides/how-to-schedule-content-so-it-publishes-itself',
        tag: 'Guide',
        title: 'How to schedule content so it publishes itself',
        blurb: 'The queue-based system these features are built around, explained from scratch.',
      },
      {
        href: '/why-contentlineup',
        tag: 'Comparison',
        title: 'How this compares to writing tools and schedulers',
        blurb: 'Eleven dimensions, including the three where the alternatives win.',
      },
    ],
  },

  pricing: {
    title: 'Before you decide',
    links: [
      {
        href: '/security',
        tag: 'Trust',
        title: 'How your API keys and content are handled',
        blurb: 'Encryption, what we never log, and what happens to your archive if you cancel.',
      },
      {
        href: '/resources/case-studies/northgate-air-hvac-content-case-study',
        tag: 'Case study',
        title: 'What it costs in practice: under $5 a month',
        blurb: 'A real bring-your-own-key bill across eight articles a month, with the numbers.',
      },
      {
        href: '/faq',
        tag: 'FAQ',
        title: 'Billing, cancellation and leaving',
        blurb: 'What counts as an article, what happens if you exceed an allowance, how to export.',
      },
    ],
  },

  integrations: {
    title: 'Related reading',
    links: [
      {
        href: '/compare/contentlineup-vs-buffer',
        tag: 'Comparison',
        title: 'ContentLineup vs Buffer',
        blurb: 'Three social channels done properly versus a dozen with an inbox and analytics.',
      },
      {
        href: '/security',
        tag: 'Trust',
        title: 'What happens to a key you connect',
        blurb: 'Encrypted at rest, write-only, never pooled with another account.',
      },
      {
        href: '/features',
        tag: 'Product',
        title: 'Every feature in detail',
        blurb: 'What each integration actually plugs into, screen by screen.',
      },
    ],
  },

  'made-for': {
    title: 'Go deeper',
    links: [
      {
        href: '/resources/guides/real-estate-content-marketing-guide',
        tag: 'Guide',
        title: 'A full playbook for one of these audiences',
        blurb: 'Twelve months of real estate content, with the four post types that keep working.',
      },
      {
        href: '/resources/case-studies/northgate-air-hvac-content-case-study',
        tag: 'Case study',
        title: '2 posts a year to 8 a month',
        blurb: 'A nine-person local business, six months of numbers, and what did not work.',
      },
      {
        href: '/pricing',
        tag: 'Pricing',
        title: 'What it costs for your situation',
        blurb: 'Free on your own key, or $29 managed. Every feature on every plan.',
      },
    ],
  },

  security: {
    title: 'Related reading',
    links: [
      {
        href: '/faq',
        tag: 'FAQ',
        title: 'Privacy and data questions',
        blurb: 'Who can see drafts, whether we train on your content, where data is hosted.',
      },
      {
        href: '/integrations',
        tag: 'Product',
        title: 'What you connect, and what it can reach',
        blurb: 'AI providers, social channels and exports — and the exits that prevent lock-in.',
      },
      {
        href: '/terms',
        tag: 'Legal',
        title: 'Terms of service',
        blurb: 'Content ownership, acceptable use, and who is responsible for reviewing output.',
      },
    ],
  },

  'why-contentlineup': {
    title: 'Keep comparing',
    links: [
      {
        href: '/compare/contentlineup-vs-buffer',
        tag: 'Head to head',
        title: 'ContentLineup vs Buffer',
        blurb: 'Where we overlap on three channels, and where Buffer wins outright.',
      },
      {
        href: '/resources/comparisons/best-buffer-alternatives-2026',
        tag: 'Comparison',
        title: 'Best Buffer alternatives in 2026',
        blurb: 'Seven tools compared on what each is genuinely better at.',
      },
      {
        href: '/resources/guides/how-to-get-cited-by-ai-search-engines',
        tag: 'Guide',
        title: 'Getting cited by ChatGPT and Perplexity',
        blurb: 'The page structures answer engines actually quote, and why they matter now.',
      },
    ],
  },

  'how-it-works': {
    title: 'Related reading',
    links: [
      {
        href: '/features',
        tag: 'Product',
        title: 'Every feature in detail',
        blurb: 'The full list behind these four steps, including what is still on the roadmap.',
      },
      {
        href: '/resources/guides/how-to-brief-an-article-in-sixty-seconds',
        tag: 'Guide',
        title: 'How to brief an article in sixty seconds',
        blurb: 'Step one done well: the four-line template that decides whether a draft is any good.',
      },
      {
        href: '/made-for',
        tag: 'Audiences',
        title: 'What this looks like for your business',
        blurb: 'Eight audience types, the problem each has, and an example of what gets written.',
      },
    ],
  },
};
