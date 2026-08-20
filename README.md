# ContentLineup — marketing website

A fast, animated, SEO-optimised static marketing site for ContentLineup, built as a
**zero-dependency Node static site generator**. No framework, no `node_modules`, no
install step. Articles live in a Supabase Postgres database, and `node build.mjs`
writes a complete `dist/` you can host anywhere.

## Quick start

```bash
npm run build     # renders dist/
npm run serve     # serves dist/ at http://localhost:8080
npm start         # build + serve
npm run admin     # content editor at http://127.0.0.1:8081
npm run audit     # overflow / links / console / load-time check against a running server
npm run fonts     # re-subset the web fonts (only when assets/fonts-src/ changes)
```

`PORT=3000 npm run serve` to change the port.

First time, or after cloning: see [Content database (Supabase)](#content-database-supabase)
for the `.env` values and the one-time schema push.

## What the site argues

Every page is built around one workflow:

    Idea → Generate → Calendar → Approve → Publish

That sequence is data, not prose — `stages` in `src/data/site.mjs` drives the
homepage tour, the /features page grouping, the /how-it-works page, the `HowTo`
structured data and `llms.txt`. Change it in one place and the whole site follows.

The positioning it protects: ContentLineup is a **content operating system**, not
an AI blog writer. The AI is one way into stage two, and the page says so out loud
("AI drafts it. You decide.") because a site that reads as an AI content farm
repels exactly the buyers this product is for.

**Product truth is enforced by data.** `channels` and `features` carry a
`status`/`soon` flag, and every renderer reads it — so WordPress and Payload CMS
publishing appear everywhere they should, always labelled *Coming soon*, and
`llms.txt` tells answer engines the same thing. Nothing on the site can quietly
claim a capability the data does not.

## Why no framework

The whole site is 23 static HTML pages plus one stylesheet and one small script.
A framework would add a dependency tree, a build toolchain, and hydration cost for
no gain. What you get instead:

| | |
|---|---|
| Largest page (homepage) | 98 KB HTML → **20 KB** gzipped, 15 KB brotli |
| CSS | 76 KB → **15 KB** gzipped, content-hashed, cached a year |
| JS | 22 KB → **7 KB** gzipped, deferred, content-hashed |
| Fonts | 98 KB for both, subset from 165 KB (`npm run fonts`) |
| Blocking requests | 1 stylesheet, 2 preloaded fonts |
| Third-party requests | **one** — the Plausible analytics script (deferred, cookieless, no consent banner needed). Fonts, icons and images are all self-hosted. |

Every interaction degrades gracefully: with JavaScript disabled the FAQ accordions
still open (native `<details>`), the nav still works, all content is still rendered,
the monthly/annual pricing toggle falls back to monthly (with the annual price still
readable underneath), and the reveal animations simply do not run.

### Asset fingerprinting

`build.mjs` hashes the CSS and JS by content and emits `styles.<hash>.css` /
`app.<hash>.js`. `src/lib/assets.mjs` holds the registry the page shell reads, and the
build calls `setAssets()` before rendering anything. Because the URL changes whenever
the bytes do, `serve.mjs`, `vercel.json` and `netlify.toml` all serve them with
`max-age=31536000, immutable` — a repeat visitor spends no round-trip revalidating
them, and there is no cache to purge on deploy.

### Fonts

`public/fonts/` holds **subsets**; the full originals live in `assets/fonts-src/` and
are what `npm run fonts` reads. Both are committed, so a fresh clone builds correctly
without running the subsetter.

`tools/subset-fonts.mjs` is the one script in the repo with a dependency
(`subset-font`, a devDependency) — the build and the server stay zero-dependency.
It cuts the two fonts from 165 KB to 98 KB. Most of that is Fraunces: pinning its
`SOFT` variation axis to 0, a value nothing in `styles.css` ever changes, halves the
file on its own, because the variation deltas rather than the glyphs are the weight.
`opsz` and `wght` are deliberately left variable — browsers drive optical sizing
automatically, so pinning `opsz` would change how the display headings look.

After a build, the script also reports any character in `dist/` that the subset does
not cover, so a new glyph in the copy shows up as a warning rather than as a silent
fallback-font flash on a heading.

## Layout

```
build.mjs              SSG entry point — routes, sitemap, robots, RSS
serve.mjs              Production static server (brotli/gzip, caching, clean URLs)
src/
  styles.css           Design system + all component styles
  app.js               Nav, reveals, lineup board, scroll tour, demos, tabs, counters
  data/
    site.mjs           Brand, nav, stages, channels, features, audiences, pricing, FAQs,
                       demo data for the interactive sections, topic clusters
    content.mjs        The site's read-only view of the content database
  lib/
    html.mjs           Page shell, SEO head, JSON-LD, header/footer, primitives
    home-sections.mjs  The homepage, section by section
    blocks.mjs         Sections shared by the deeper pages
    article.mjs        Long-form article markup helpers
    screens.mjs        The thirteen app screens, rendered as SVG
  pages/               One module per route group
docs/
  seo-content-plan.md  Keyword → page map, topic clusters, and the editorial queue
public/                Static assets copied verbatim into dist/
  fonts/               Inter + Fraunces (latin subset, self-hosted)
  og/                  1200×630 PNG social cards
db/
  schema.supabase.sql  Postgres schema + RLS policies for Supabase
  supabase.mjs         Supabase data layer (PostgREST over fetch)
  env.mjs              .env loading and key selection
  store.mjs            Picks Supabase or the local mirror
  render.mjs           Markdown + shortcode expansion
  frontmatter.mjs      File to database import/export format
  push.mjs             Upload local content to Supabase
  schema-print.mjs     Print the SQL to paste into Supabase
  cli.mjs              Content CLI
  schema.sql           SQLite schema (local mirror)
  db.mjs               SQLite data layer (local mirror)
  migrate.mjs          Build the local mirror
  seed.mjs             Seed the local mirror from the launch articles
  seed-content/        Launch articles as modules (import payload only)
admin.mjs              Local web editor for the database
.env                   Supabase credentials (gitignored)
data/content.db        Local SQLite mirror / offline fallback
data/content-cache.json  Last successful Supabase fetch (gitignored)
content/               Scratch folder for draft files awaiting import
tools/
  make-og.mjs          Regenerates the OG cards (needs Chrome; output is committed)
  audit.mjs            Headless audit: overflow, headings, alt text, meta, links
  shots.mjs            Screenshot capture with real device emulation
  inspect.mjs          Section-by-section screenshots + overflow report, any page/width
  interact.mjs         Drives every homepage interaction in a real browser and reports
  mock-postgrest.mjs   Supabase test double for local end-to-end testing
```

## Design system

Carried over from the product site so the two read as one brand.

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#0a0a0a` | Text |
| `--paper` | `#fafaf7` | Page background |
| `--accent` | `#c2410c` | AI / writing elements, primary CTA |
| `--sched` | `#0f766e` | Scheduling / calendar elements |
| `--peach` / `--cream` | `#f4d4ba` / `#efeae1` | Highlights, surfaces |

Type: **Fraunces** (display serif) for headings, **Inter** for body, system monospace
for timestamps, queue states, keywords and API/technical UI.

## Content

Editing content rarely means touching markup:

- **Stages, channels, features, audiences, pricing, FAQs, comparison matrix, topic
  clusters, and the demo data behind every interactive section** — `src/data/site.mjs`
- **Articles** — in the content database. See **Content database** below.
- **Adding a page** — write a render function and add one line to `routes` in `build.mjs`.
- **The SEO plan** — `docs/seo-content-plan.md` holds the keyword → page map and the
  editorial queue. Nothing in that queue is written yet, and the site never links to
  an article that is not really in the database.

### Marking something shipped

When WordPress publishing (or any other roadmap item) goes live, flip it in one
place and the whole site updates — the homepage band, the features page, the FAQ,
the comparison tables and `llms.txt`:

```js
// src/data/site.mjs
{ id: 'wordpress', name: 'WordPress', status: 'soon' }   // → 'live'
{ id: 'wordpress', name: 'Publish to WordPress', soon: true }  // → delete the flag
```

## Content database (Supabase)

Every article lives in a Supabase Postgres database. The static build reads from
it, so adding a row is all it takes for a post to appear on the site, in the
category filter, the sitemap, the RSS feed and the related-posts logic.

There is still nothing to install: the Supabase client here is plain `fetch`
against PostgREST — the same HTTP API `supabase-js` wraps.

### One-time setup

```bash
cp .env.example .env       # then fill in the three values from your project
npm run db:schema          # prints the SQL — paste it into the Supabase SQL Editor
npm run db:push            # uploads every post, author and category
npm run db:check           # confirms the connection and counts rows
npm run build
```

`.env` needs three values, all from your Supabase dashboard under **Settings → API**:

| Variable | What it is | Used by |
|---|---|---|
| `SUPABASE_URL` | Project URL | everything |
| `SUPABASE_ANON_KEY` | anon / publishable key | the build (read-only in practice) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key | `db:push`, the CLI, the admin UI |

`.env` is gitignored. The service_role key bypasses Row Level Security — keep it
on your machine and in CI secrets, never in a browser bundle or a commit.

### Row Level Security does the publishing

The publishing rule is enforced in the database, not in application code. The
anon key can only ever read posts that are genuinely live:

```sql
status = 'published'
or (status = 'scheduled' and published_at <= current_date)
```

So a draft cannot leak even if the anon key does, and the build gets the correct
set of posts without having to filter anything itself.

### Three ways to add a post

**1. The admin UI** — `npm run admin`, then **New post**. A form for every field,
a shortcode reference built into the page, and a **Rebuild site** button. Bound to
loopback with no authentication, because it is a local authoring tool.

**2. A file** — write markdown with front-matter, then import it:

```bash
npm run posts -- new "How to Brief an Article" --category guides
#   → creates content/how-to-brief-an-article.md with a scaffold to fill in
npm run posts -- import content/how-to-brief-an-article.md
npm run posts -- publish how-to-brief-an-article
npm run build
```

**3. In Supabase directly** — the table editor, the SQL editor, or any Postgres
client. The site picks it up on the next build.

### Post status

Status mirrors the product's own queue, so the site behaves the way the marketing
copy claims:

| Status | Behaviour |
|---|---|
| `draft` | Never built. Invisible to the anon key entirely. |
| `scheduled` | Becomes visible from the first build on or after `published_at`. |
| `published` | Always built. |

```bash
npm run posts -- schedule my-post --at 2026-12-01   # publishes itself on that date
npm run posts -- queue                              # what is waiting
```

Scheduling only takes effect when a build runs, so on a live host pair it with a
daily build (a cron job, or your host's scheduled-deploy feature).

### The build never depends on the network

Content resolution falls back in order:

1. **Supabase** — the live content
2. **`data/content-cache.json`** — rewritten on every successful fetch
3. **`data/content.db`** — the local SQLite mirror

So a network blip, an expired key, or an offline laptop degrades to the last
known-good content instead of failing the build. Each fallback says clearly which
source it used.

### Body format and shortcodes

A post body is stored as either `html` or `markdown`. Markdown bodies get a small
supported subset — headings (auto-IDed), paragraphs, lists, tables, blockquotes,
links, bold, italic and inline code — plus shortcodes for the recurring article
components:

```
[answer]The direct answer, two or three sentences.[/answer]
[toc]                                          builds itself from the H2s
[figure screen="list" caption="Optional."]     any screen id from screens.mjs
[table caption="Optional"]
Header A | Header B
Cell 1   | Cell 2
[/table]
[quote cite="Name, Role"]The pull quote.[/quote]
[takeaways]
- First point
- Second point
[/takeaways]
[cta title="Optional" body="Optional"]
```

Shortcodes are validated before anything is written, so a typo in a screen id is
rejected at save time rather than breaking the build.

### Schema

```
authors          id, slug, name, email, bio, url
categories       id, slug, label, singular, sort
posts            id, slug, category_id, author_id, title, meta_title, description,
                 excerpt, body, body_format, primary_keyword, thumb_screen,
                 read_mins, featured, status, published_at, modified_at, notes
post_keywords    secondary target keywords, ordered
post_faqs        question/answer pairs → accordion + FAQPage schema
post_revisions   written by a database trigger on every body or title change
v_posts          view joining posts + category + author + derived URL path
```

Revision history is a Postgres trigger rather than application code, so it cannot
be bypassed — edits made in the Supabase table editor are captured too.

Full definition with comments and RLS policies: `db/schema.supabase.sql`.

### Other commands

```bash
npm run posts -- list [--status draft] [--category guides]
npm run posts -- show <slug>            # metadata + rendered size
npm run posts -- export <slug>          # back out to a front-matter file
npm run posts -- feature <slug> [--off] # homepage feature flag
npm run posts -- revisions <slug>
npm run posts -- restore <slug> <id>
npm run posts -- delete <slug> --yes
npm run posts -- stats
```

### The local mirror

`data/content.db` is a SQLite copy of the same schema. It is what the project ran
on before Supabase, and it stays useful as an offline fallback and a single-file
backup. `npm run db:push` reads from it, so it is also the migration source.

To rebuild it from the original launch content: `npm run mirror:init && npm run mirror:seed`.

### Testing without a project

`node tools/mock-postgrest.mjs` serves the local SQLite content over the same HTTP
shapes Supabase exposes, including the RLS behaviour. Point `SUPABASE_URL` at it to
exercise the whole Supabase path — build, CLI and admin — with no real project:

```bash
node tools/mock-postgrest.mjs 54321 &
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=anon-test npm run build
```

## Homepage interactions

All of it is in `src/app.js`, all of it degrades to working HTML, and all of it
respects `prefers-reduced-motion`:

| Element | What it does |
|---|---|
| **The lineup board** (hero) | Cards for five different businesses walk Ideas → Drafts → Calendar → Approved → Published, one hop every two seconds, pausing when off-screen or when the tab is hidden. |
| **The tour** | Five product screens pinned beside the copy; whichever stage is nearest the middle of the viewport is the one shown. The rail below doubles as navigation. |
| **"Type an idea"** | Pre-computed responses for four demo accounts, plus a generated fallback for free text. Labelled *Demo* — it is a taste of the first screen, not a live endpoint. |
| **Channel tabs** | One idea rendered as a blog post, a LinkedIn post, an Instagram caption and a Facebook post. |
| **Account tree** | Account → Campaign → Content → Approval across five demo brands, as a vertical tablist. |
| **AI revision demo** | Click an instruction and watch that one paragraph rewrite itself, with an undo. |
| **Counters** | The case-study metrics count up once, then settle on the real figures. |

`node tools/interact.mjs` drives every one of them in a real browser and prints
what happened, including a reduced-motion pass.

## Product screenshots

`src/lib/screens.mjs` renders thirteen dashboard screens (Ideas, Campaigns, Editor,
Calendar, Approvals, Publishing, Accounts, Plans, Content, Social, Library, Strategy,
Settings) as self-contained SVG at build time. Five different demo brands appear
across them, so the product never looks like it has one customer.

**To swap in real PNG captures:** drop files at `public/screens/<id>.png` and set
`SCREEN_EXT = 'png'` in `src/lib/screens.mjs`. Every reference across the site —
homepage tour, features page, articles, resources — resolves through `screenSrc()`,
so nothing else needs editing. Captions and alt text live in `screens` in
`src/data/site.mjs` and stay as they are.

This is the single highest-value follow-up on the whole site: the SVGs are a good
likeness, but real captures of the actual app would be better, and swapping them in
is a two-line change.

## Editorial diagrams

`src/lib/art.mjs` renders six explanatory figures for the pages the product screens
do not reach. A screen shows what the product *looks like*; a diagram shows how
something *works*, and each one is drawn to carry the single claim its section makes.

| Artwork | Page | What it argues |
|---|---|---|
| `workflow-spine` | `/faq` | The five stages, and that Approve is a gate a person passes |
| `channel-flow` | `/integrations` | One idea, reshaped per channel — live ones first |
| `key-handling` | `/security` | The life of an API key, and the three things that never happen to it |
| `value-meter` | `/pricing` | 4h 40m against 12m — the gap the plans are priced against |
| `how-we-work` | `/about` | The three rules that decide what ships |
| `support-panel` | `/contact` | What happens after you send the message |

They draw from the same palette as the screens (`C`, `SANS`, `SERIF`, `MONO` are
exported from `screens.mjs`) so a brand tweak cannot leave the two sets of artwork
disagreeing.

Unlike the screens these are **inlined into the page**, not referenced as `<img>`.
An SVG inside an `<img>` is a closed document that page CSS cannot reach, and the
self-drawing animation is the point. Cost is 4–7 KB of HTML per page before
compression, and every figure stays under 8 KB brotli.

**Anything a diagram states must already be true in the page copy.** The support
panel quotes the same response times as the paragraphs beside it; the value meter
carries the same benchmark footnote as the homepage. A figure that invents a faster
SLA than the text next to it is worse than no figure.

### Motion

Animation is driven entirely by the `.in` class the existing scroll-reveal observer
already sets — there is no second observer and no animation library.

- `.art-draw` — strokes draw themselves. Every animated path carries
  `pathLength="1"`, so one duration covers a 40px connector and a 700px spine at the
  same rate rather than needing per-path timing.
- `.art-pop` — nodes settle in just behind the stroke that reaches them.
- `.art-bar` — measured bars grow from zero to the value they represent.
- `--art-i` on each element is its position in the sequence; the CSS multiplies it
  into a `transition-delay`.

Below ~620px a diagram scrolls sideways inside its own figure rather than shrinking
its labels past legibility. `app.js` flags whether the canvas actually overflows and
which end it is at, and CSS masks the appropriate edge — so a fade always means
"there is more diagram this way", and the page itself never scrolls horizontally.

Under `prefers-reduced-motion: reduce` every figure jumps straight to its finished
state. These are information, not decoration: a diagram must be complete whether or
not it was allowed to animate. The reading-progress hairline is decorative, so it is
skipped entirely rather than animated at zero duration.

## SEO / GEO

**Structured data** — one JSON-LD `@graph` per page, cross-referenced by `@id`:

| Node | Where |
|---|---|
| `Organization`, `WebSite` | every page |
| `WebPage` | every page — links to the site, the publisher, its primary image and its breadcrumb |
| `BreadcrumbList` | every page except the homepage and 404 |
| `SoftwareApplication` + `Offer` | home, features, pricing |
| `Article` / `BlogPosting` | every article, with `wordCount` and keywords |
| `FAQPage` | every FAQ block, on pages and in articles |
| `HowTo` | /how-it-works, with per-step anchors and images |
| `ItemList` | ranked list articles, driven by the `list_items` column |
| `CollectionPage` | the resources hub |
| `speakable` | articles — the answer box, H1 and takeaways |

`node tools/audit.mjs` parses and cross-checks all of it: every `@id` reference must
resolve, and no `@id` may be reused for a different type.

**Crawl and discovery**

- `sitemap.xml` with an `image:image` entry per URL and accurate `lastmod` from the
  database for articles.
- `robots.txt` explicitly allowing GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot,
  Google-Extended and Applebot-Extended.
- `llms.txt` — a plain-text summary for AI answer engines: what the product does,
  pricing, which social channels are and are not supported, what is still on the
  roadmap, and a linked index of every page and article. Generated from the same data
  the site is, so it cannot drift.
- `feed.xml` RSS, linked from every page via `<link rel="alternate">`.
- Canonical tags, OG + Twitter cards with real 1200×630 PNGs, `og:image:type` and
  `twitter:image:alt`.

**On-page**

- Clean URLs throughout (`/pricing`, `/resources/guides/…`, `/compare/…`), one `<h1>`
  per page, no heading-level skips, descriptive alt text and explicit dimensions on
  every image.
- Contextual internal links between marketing pages and the relevant articles, defined
  in `src/data/links.mjs` so the link graph is reviewable in one place.
- Articles are structured for answer-engine extraction: a direct-answer block near the
  top, question-shaped headings, self-contained paragraphs, tables for comparative
  facts, and a real FAQ block.

## Verification

```bash
npm run serve &          # in one shell
node tools/audit.mjs     # in another
```

Checks every page at 390 / 820 / 1440 px for horizontal overflow, plus heading
hierarchy, missing alt text, missing image dimensions, canonical tags, title and
meta-description lengths, JSON-LD validity, console errors, and internal link
integrity. Exits non-zero on failure, so it drops straight into CI.

`node tools/shots.mjs` captures screenshots into `.shots/` using real device
emulation over the DevTools Protocol.

## Deployment

The build output is plain static files — any static host works.

**Netlify** — `netlify.toml` is committed with headers and caching:
```bash
npx netlify-cli deploy --prod
```

**Vercel** — `vercel.json` is committed with `cleanUrls` and headers:
```bash
npx vercel --prod
```

**Cloudflare Pages** — build command `npm run build`, output directory `dist`.

**Docker / any VPS** — multi-stage `Dockerfile` builds and serves on port 8080:
```bash
docker build -t contentlineup-site .
docker run -d --restart unless-stopped -p 80:8080 contentlineup-site
```
`--restart unless-stopped` is what keeps it up across reboots and crashes.

**Bare Node on a server** — `node serve.mjs` behind a process manager:
```bash
pm2 start serve.mjs --name contentlineup-site && pm2 save && pm2 startup
```

### Before going live

1. Set the real domain in `site.origin` (`src/data/site.mjs`) — it drives canonicals,
   OG URLs, JSON-LD `@id`s, the sitemap and the feed.
2. Confirm the pricing figures in `plans` (`src/data/site.mjs`). The tier structure is
   in place; the numbers are a starting proposal.
2b. Re-check the `status` flags on `channels` and the `soon` flags on `features`
   against what the app actually does today. The site is only as honest as they are.
3. Swap in real dashboard PNGs if you want photographic captures (see above).
4. Point `site.app.signup` / `site.app.login` at the live signup and login URLs.
4b. **Set `site.app.demo`** (`src/data/site.mjs`) to your real Cal.com/Calendly booking
   link. It currently holds a placeholder, and "Book a demo" is the highest-intent
   button on the site — a dead link there is the most expensive dead link there is.
4c. **Set `analytics.domain`** (`src/data/site.mjs`) to the site as registered in your
   Plausible dashboard. If it does not match exactly, every event is dropped silently
   and the funnel looks empty rather than broken. Set `analytics.enabled = false` to
   ship without any analytics at all.
   Plausible ignores `localhost` by design, so CTA events only appear once deployed.
5. Put `SUPABASE_URL` and `SUPABASE_ANON_KEY` into your host's environment variables so
   the deploy build reads live content. The service_role key is not needed to build.

### Viewing it from other devices on the network

`npm run serve` binds to `0.0.0.0`, so it is already reachable from phones,
tablets and other machines on the same network. On start it prints the exact URL:

```
  Local    http://localhost:8080
  Network  http://192.168.4.20:8080   (Wi-Fi)
```

Open the **Network** URL on any device on the same Wi-Fi.

- `HOST=127.0.0.1 npm run serve` restricts it back to this machine only.
- `PORT=3000 npm run serve` changes the port.
- Windows may prompt to allow `node.exe` through the firewall the first time —
  allow it for the network profile you are on.
- **The admin UI is deliberately not exposed.** It binds to `127.0.0.1` only,
  because it has no authentication and can edit and delete content. Reach it from
  this machine at http://127.0.0.1:8081, or use an SSH tunnel — do not rebind it
  to `0.0.0.0`.
- If a device on the same Wi-Fi still cannot connect, the network itself may have
  client isolation enabled (common on guest and public Wi-Fi), which blocks
  device-to-device traffic regardless of firewall settings.

Running `npm run serve` in a terminal ties the server to that terminal. To run it
detached so it keeps serving after the terminal closes:

```powershell
npm run servers -- start     # detached, builds first if dist/ is missing
npm run servers -- status    # PIDs and the URLs, including the network one
npm run servers -- stop
npm run servers -- restart
```

That still does not survive a reboot — for that, see the scheduled task below.

### Keeping the local server up across reboots (Windows, optional)

```powershell
powershell -ExecutionPolicy Bypass -File tools\autostart.ps1
```

Registers a per-user Scheduled Task that builds and serves the site at logon,
hidden, restarting automatically if it stops. No admin rights, nothing installed
system-wide. Remove it with the same command plus `-Remove`.
