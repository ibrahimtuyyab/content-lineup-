# SEO content plan

The architecture the site is built around, and the editorial queue that fills it.

Nothing in the "queue" section below exists yet. It is a plan, not a claim — the
site only ever links to articles that are actually in the database. Add a row here
when you commit to a topic, write it with `npm run posts -- new`, and it appears on
`/resources`, in the relevant topic cluster, in the sitemap and in the RSS feed
automatically.

---

## 1. The shape

Three layers, each with a different job:

| Layer | Job | Lives at |
|---|---|---|
| **Product pages** | Answer the commercial-intent version of a query and convert | `/features`, `/pricing`, `/integrations`, `/how-it-works`, `/made-for` |
| **Comparison pages** | Catch "X vs Y" and "best X" searches at the bottom of the funnel | `/why-contentlineup`, `/compare/*`, `resources/comparisons/*` |
| **Guides** | Answer informational queries and build topical authority | `resources/guides/*` |

Every guide links up to the product page that owns the same intent. Every product
page links down to at least one guide. That link graph is defined in
`src/data/links.mjs` (marketing pages) and `topicClusters` in `src/data/site.mjs`
(the resources hub), so it is reviewable in two places rather than scattered
through templates.

## 2. Topic clusters

Defined in `topicClusters` (`src/data/site.mjs`) and rendered on `/resources#topics`.

| Cluster | Owns | Pillar page |
|---|---|---|
| Social media automation | scheduling, auto-publishing, automation benefits and limits | `/features#stage-publish` |
| Content planning & calendars | briefs, calendars, cadence, posting times | `/features#calendar` |
| SEO & content marketing | keyword research, search intent, on-page optimisation | `/features#seo-output` |
| Tool comparisons | head-to-heads, alternatives, "best of" | `/compare/contentlineup-vs-buffer` |
| Results & case studies | proof, before-and-after numbers | `/made-for` |
| Product updates | shipped vs roadmap | `/features` |

## 3. Keyword → page map

**Already covered.** These queries have a page today.

| Query / topic | Page |
|---|---|
| social media automation | `/` (hero + publish stage), `/features#stage-publish` |
| content creation automation | `/`, `/features#ai-writer` |
| social media marketing tools | `/integrations`, `/compare/contentlineup-vs-buffer` |
| content calendar / editorial calendar | `/features#calendar`, `/how-it-works` |
| content approval workflow | `/features#approvals` |
| manage multiple brands / client content | `/features#accounts`, `/made-for#agencies` |
| scheduling content so it publishes itself | `resources/guides/how-to-schedule-content-so-it-publishes-itself` |
| Buffer alternatives | `resources/comparisons/best-buffer-alternatives-2026` |
| getting cited by AI search engines | `resources/guides/how-to-get-cited-by-ai-search-engines` |
| content briefs | `resources/guides/how-to-brief-an-article-in-sixty-seconds` |
| real estate content marketing | `resources/guides/real-estate-content-marketing-guide` |
| seo best practices for beginners | `resources/guides/seo-best-practices-for-beginners` (cluster hub) |
| how to perform keyword research | `resources/guides/how-to-perform-keyword-research` |
| search intent in seo | `resources/guides/search-intent-in-seo` |
| automation tools for instagram | `resources/guides/automation-tools-for-instagram` |

**The queue.** Written in priority order — highest commercial intent first, because
comparison pages convert while educational ones only build authority.

| # | Working title | Target query | Cluster | Category | Notes |
|---|---|---|---|---|---|
| 1 | Hootsuite vs Buffer: an honest comparison | compare hootsuite and buffer | Tool comparisons | `comparisons` | Must be verifiably accurate — check both pricing pages on the day of writing and date the article. Say plainly where each wins. |
| 2 | Meta Business Suite vs Hootsuite | compare meta business suite and hootsuite | Tool comparisons | `comparisons` | Same rule: verify current feature sets, do not assert from memory. |
| 3 | The best free social media schedulers | best free social media schedulers | Tool comparisons | `comparisons` | Include ContentLineup's free plan honestly, alongside genuinely free competitors. |
| 4 | Social media automation: what to automate and what not to | benefits of social media automation | Social media automation | `guides` | The credibility piece for the whole cluster. Lead with the limits. |
| 5 | ~~Instagram automation: what the API actually allows~~ | automation tools for instagram | Social media automation | `guides` | **Published 2026-08-20.** |
| 6 | When to post on social media — and why the "best time" charts mislead | best times to post on social media | Content planning | `guides` | Argue for testing against your own audience; do not publish invented benchmark tables. |
| 7 | ~~How to do keyword research without a paid tool~~ | how to perform keyword research | SEO | `guides` | **Published 2026-08-20.** |
| 8 | ~~Search intent: the four types and how to tell them apart~~ | search intent in seo | SEO | `guides` | **Published 2026-08-20.** |
| 9 | Blog post optimisation: a pre-publish checklist | blog post optimization techniques | SEO | `guides` | Mirrors the SEO fields ContentLineup fills in. |
| 10 | SEO vs content marketing: not the same job | compare seo and content marketing | SEO | `guides` | Positioning piece; links to `/why-contentlineup`. |
| 11 | Types of SEO strategy, and which one a small business needs | types of seo strategies | SEO | `guides` | Beginner-facing entry point. |
| 12 | ~~SEO for beginners: the first ten things~~ | seo best practices for beginners | SEO | `guides` | **Published 2026-08-20 — the hub for the SEO cluster.** |
| 13 | Audience engagement: what actually moves the number | audience engagement strategies | Content planning | `guides` | |
| 14 | A content creation workflow you can keep for a year | content creation tips | Content planning | `guides` | Strong CTA into the idea board. |
| 15 | Social media analytics: the metrics worth a weekly look | social media analytics software | Tool comparisons | `guides` | **Be careful:** ContentLineup has no analytics. Write it as an educational piece and say so. |
| 16 | Email marketing basics for people who already blog | email marketing basics | Content planning | `guides` | Adjacent-audience play; no product claim. |
| 17 | Influencer marketing without a budget | influencer marketing | Content planning | `guides` | Adjacent-audience play. |
| 18 | Digital marketing in Pakistan: what is actually working | digital marketing trends in pakistan | Content planning | `guides` | Only worth writing with real local data or first-hand experience. Otherwise skip it. |

### Still blocked on verification

Queue items 1, 2, 3 and 15 (Hootsuite vs Buffer, Meta Business Suite vs Hootsuite,
best free schedulers, social media analytics) all turn on competitor pricing and
feature sets that change without notice. The rule in this file is to check the
source on the day of writing and date the article — so they stay unwritten until
someone verifies the current facts rather than asserting them from memory. That is
a deliberate hold, not a backlog.

## 4. Rules for every article

- **One `<h1>`**, question-shaped `<h2>`s, no heading-level skips.
- **A direct-answer block** (`[answer]`) in the first screenful. This is what AI
  answer engines quote.
- **A real FAQ block** (`post_faqs`) — it becomes both an accordion and `FAQPage`
  structured data.
- **Tables for comparative facts.** Answer engines extract them cleanly.
- **A primary keyword and up to four secondary keywords** set in the database, not
  sprinkled through the prose.
- **Internal links**: at least one up to a product page, at least two across to
  sibling articles.
- **One CTA**, contextual to the article, using the shared `[cta]` shortcode.
- **No invented statistics, customers, or benchmarks.** If a number is ours, say how
  it was measured. If it is someone else's, link the source and date it.
- **Comparison articles must be re-checked before each quarter.** Competitor pricing
  and features change; a stale comparison is worse than none.

## 5. Publishing cadence

The database supports scheduled publishing (`status = 'scheduled'` plus a
`published_at` date), and Row Level Security only exposes a post once that date has
passed. Pair it with a daily build on the host and the site publishes itself:

```bash
npm run posts -- schedule my-post --at 2026-12-01
npm run posts -- queue
```

One article a week is enough to work through the queue above in under five months.

## 6. Measuring it

Google Search Console and GA4 integrations are on the ContentLineup roadmap but not
shipped, so for now: verify the property in Search Console, watch impressions per
cluster rather than per article, and re-check the queue order every quarter against
what is actually earning impressions.
