#!/usr/bin/env node
// Content CLI.
//
//   node db/cli.mjs <command> [args]
//
// Talks to Supabase when it is configured, and to the local SQLite mirror
// otherwise — the command set is identical either way.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import {
  driver,
  target,
  ready,
  allPosts,
  postBySlug,
  savePost,
  setStatus,
  deletePost,
  allCategories,
  allAuthors,
  scheduledPosts,
  revisions,
  restoreRevision,
  stats,
} from './store.mjs';
import { parse, stringify, toPost } from './frontmatter.mjs';
import { renderBody } from './render.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DRAFTS = join(ROOT, 'content');

/* --- arg parsing ---------------------------------------------------------- */
const [, , command, ...rest] = process.argv;
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) {
    const key = rest[i].slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i++;
    } else flags[key] = true;
  } else args.push(rest[i]);
}

class CliError extends Error {}
const die = (msg) => {
  throw new CliError(msg);
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const today = () => new Date().toISOString().slice(0, 10);

const STATUS_MARK = { published: '●', scheduled: '◐', draft: '○' };

/* --- commands ------------------------------------------------------------- */
const commands = {
  help() {
    console.log(`
ContentLineup content database
  store: ${driver} → ${target}

  list [--status s] [--category c]   List posts
  show <slug>                   Print one post's metadata
  queue                         Posts scheduled for a future date
  stats                         Row counts
  check                         Verify the store is reachable

  new "<title>" --category <c>  Create a draft file in content/ to write in
  import <file> [--slug s]      Load a front-matter file into the database
  export <slug> [--out <file>]  Write a post back out as a front-matter file

  publish <slug> [--at <date>]  Mark published (default: today)
  schedule <slug> --at <date>   Publish automatically on that date
  unpublish <slug>              Back to draft — removed from the next build
  feature <slug> [--off]        Toggle the homepage feature flag
  delete <slug> --yes           Delete a post and its revisions

  revisions <slug>              Revision history
  restore <slug> <revisionId>   Roll the body back to a revision

  categories                    List categories
  authors                       List authors

After any change: npm run build
`);
  },

  async check() {
    await ready();
    const s = await stats();
    console.log(`Connected to ${driver} (${target}).`);
    console.log(
      `${s.posts} posts · ${s.published} published · ${s.scheduled} scheduled · ${s.drafts} draft`
    );
  },

  async list() {
    let posts = await allPosts();
    if (flags.status) posts = posts.filter((p) => p.status === flags.status);
    if (flags.category) posts = posts.filter((p) => p.category === flags.category);
    if (!posts.length) return console.log('No posts match.');

    for (const p of posts) {
      const mark = STATUS_MARK[p.status] || '?';
      const date = (p.published || '——————————').padEnd(10);
      const feat = p.featured ? ' ★' : '  ';
      console.log(`${mark} ${date}${feat} ${String(p.category).padEnd(16)} ${p.slug}`);
    }
    const s = await stats();
    console.log(
      `\n${posts.length} shown · ${s.published} published, ${s.scheduled} scheduled, ${s.drafts} draft` +
        `  [${driver}]`
    );
  },

  async show() {
    const slug = args[0] || die('show <slug>');
    const p = await postBySlug(slug);
    if (!p) die(`No post with slug "${slug}".`);
    const rendered = renderBody(p);
    console.log(`
  ${p.title}
  ${'-'.repeat(Math.min(p.title.length, 70))}
  slug          ${p.slug}
  url           ${p.path}
  status        ${p.status}${p.featured ? ' · featured' : ''}
  category      ${p.category}
  author        ${p.author}
  published     ${p.published || '—'}
  modified      ${p.modified || '—'}
  read time     ${p.readMins} min
  thumb screen  ${p.thumb}
  format        ${p.bodyFormat}
  meta title    ${p.metaTitle} (${p.metaTitle.length} chars)
  description   ${p.description.length} chars
  primary kw    ${p.primaryKeyword || '—'}
  secondary kw  ${p.secondaryKeywords.join(', ') || '—'}
  FAQs          ${p.faqs?.length || 0}
  body          ${p.body.length} chars stored → ${rendered.length} rendered
`);
  },

  async queue() {
    const q = await scheduledPosts();
    if (!q.length) return console.log('Nothing scheduled for a future date.');
    console.log('Scheduled — these publish themselves on the next build after their date:\n');
    for (const p of q) console.log(`  ${p.published}  ${p.title}`);
  },

  async stats() {
    for (const [k, v] of Object.entries(await stats())) console.log(`  ${k.padEnd(12)} ${v}`);
  },

  async new() {
    const title = args[0] || die('new "<title>" --category <category>');
    const category = flags.category || die('--category is required. See: node db/cli.mjs categories');
    const cats = await allCategories();
    if (!cats.some((c) => c.slug === category)) {
      die(`Unknown category "${category}". Known: ${cats.map((c) => c.slug).join(', ')}`);
    }
    const slug = flags.slug || slugify(title);
    mkdirSync(DRAFTS, { recursive: true });
    const file = join(DRAFTS, `${slug}.md`);
    if (existsSync(file) && !flags.force) die(`${file} already exists. Pass --force to overwrite.`);

    writeFileSync(
      file,
      stringify({
        title,
        metaTitle: title,
        description: '',
        excerpt: '',
        category,
        authorSlug: 'iqbal-hussain',
        primaryKeyword: '',
        secondaryKeywords: [],
        thumb: 'list',
        readMins: 8,
        featured: false,
        status: 'draft',
        published: today(),
        modified: today(),
        bodyFormat: 'markdown',
        faqs: [{ q: 'A question people actually ask', a: 'A two-to-four sentence answer.' }],
        body: `[answer]
The direct answer, in two or three sentences. This is the paragraph AI answer
engines quote, so put the conclusion here rather than a preamble.
[/answer]

An opening paragraph that sets up why this matters.

[toc]

## The first real section

Write the section. Answer the heading in the first two sentences.

[figure screen="list" caption="Optional caption explaining what the screen shows."]

## A section with a table

[table caption="What the table shows"]
Column A | Column B
First    | Second
[/table]

[takeaways]
- The first thing worth remembering
- The second thing worth remembering
[/takeaways]

[cta]
`,
      })
    );
    console.log(`Created ${file}`);
    console.log(`Write it, then:  node db/cli.mjs import content/${slug}.md`);
  },

  async import() {
    const file = args[0] || die('import <file>');
    const path = resolve(file);
    if (!existsSync(path)) die(`No such file: ${path}`);
    const { data, body } = parse(readFileSync(path, 'utf8'));
    const slug = flags.slug || data.slug || basename(path).replace(/\.(md|markdown|html?)$/i, '');
    const post = toPost(data, body, slug);

    // Fail before writing if a shortcode references something that does not exist.
    renderBody({ body: post.body, bodyFormat: post.bodyFormat });

    const existing = await postBySlug(slug);
    // The file is the source of truth on import, so a stale `status: draft`
    // would quietly unpublish a live post. Say so rather than doing it silently.
    const demoting = existing?.status === 'published' && post.status !== 'published';
    if (demoting && !flags.yes) {
      die(
        `"${slug}" is currently published, but the file says status: ${post.status}.\n` +
          `  Importing would remove it from the site. Either set "status: published" in the file,\n` +
          `  or re-run with --yes to accept the change.`
      );
    }

    const saved = await savePost({ ...post, revisionNote: `Imported from ${basename(path)}` });
    console.log(`${existing ? 'Updated' : 'Created'} ${saved.slug} → ${saved.path} [${saved.status}]`);
    if (demoting) console.log(`Note: it was published and is now ${saved.status}.`);
    if (saved.status !== 'published') {
      console.log(`Publish it with:  node db/cli.mjs publish ${saved.slug}`);
    }
  },

  async export() {
    const slug = args[0] || die('export <slug>');
    const p = await postBySlug(slug);
    if (!p) die(`No post with slug "${slug}".`);
    const out = flags.out || join(DRAFTS, `${slug}.md`);
    mkdirSync(resolve(out, '..'), { recursive: true });
    writeFileSync(out, stringify(p));
    console.log(`Wrote ${out}`);
  },

  async publish() {
    const slug = args[0] || die('publish <slug>');
    const at = flags.at === true || !flags.at ? today() : flags.at;
    const p = await setStatus(slug, 'published', at);
    console.log(`${p.slug} is published (${p.published}). Run: npm run build`);
  },

  async schedule() {
    const slug = args[0] || die('schedule <slug> --at YYYY-MM-DD');
    const at = flags.at;
    if (!at || at === true) die('--at YYYY-MM-DD is required.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) die('--at must be YYYY-MM-DD.');
    const p = await setStatus(slug, 'scheduled', at);
    console.log(`${p.slug} is scheduled for ${p.published}.`);
    console.log('It appears on the site from the first build on or after that date.');
  },

  async unpublish() {
    const slug = args[0] || die('unpublish <slug>');
    await setStatus(slug, 'draft');
    console.log(`${slug} is back to draft — it drops out of the next build.`);
  },

  async feature() {
    const slug = args[0] || die('feature <slug> [--off]');
    const p = await postBySlug(slug);
    if (!p) die(`No post with slug "${slug}".`);
    const saved = await savePost({ ...p, featured: !flags.off });
    console.log(`${saved.slug} featured: ${saved.featured}`);
  },

  async delete() {
    const slug = args[0] || die('delete <slug> --yes');
    if (!flags.yes) die('Refusing to delete without --yes.');
    const p = await postBySlug(slug);
    if (!p) die(`No post with slug "${slug}".`);
    await deletePost(slug);
    console.log(`Deleted "${p.title}" and its revisions.`);
  },

  async revisions() {
    const slug = args[0] || die('revisions <slug>');
    const list = await revisions(slug);
    if (!list.length) return console.log('No revisions recorded for that post.');
    for (const r of list) {
      const when = String(r.created_at).replace('T', ' ').slice(0, 19);
      console.log(`  #${String(r.id).padEnd(4)} ${when}  ${r.note || ''}`);
    }
    console.log(`\nRestore with:  node db/cli.mjs restore ${slug} <id>`);
  },

  async restore() {
    const [slug, id] = args;
    if (!slug || !id) die('restore <slug> <revisionId>');
    const p = await restoreRevision(slug, Number(id));
    console.log(`Restored ${p.slug} to revision #${id}.`);
  },

  async categories() {
    const [cats, posts] = await Promise.all([allCategories(), allPosts()]);
    for (const c of cats) {
      const n = posts.filter((p) => p.category === c.slug).length;
      console.log(`  ${c.slug.padEnd(18)} ${c.label.padEnd(18)} ${n} posts`);
    }
  },

  async authors() {
    for (const a of await allAuthors()) {
      console.log(`  ${a.slug.padEnd(20)} ${a.name}  ${a.email || ''}`);
    }
  },
};

/* --- dispatch -------------------------------------------------------------- */
if (!command || command === 'help' || flags.help) {
  commands.help();
  process.exit(0);
}

const fn = commands[command];
if (!fn) {
  console.error(`Unknown command "${command}".`);
  commands.help();
  process.exit(1);
}

try {
  await fn();
} catch (err) {
  console.error(err instanceof CliError ? 'Error: ' + err.message : 'Error: ' + err.message);
  process.exitCode = 1;
}
