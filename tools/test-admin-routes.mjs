// End-to-end check of the admin's content editor, over HTTP.
//
//   ADMIN_PORT=8099 node admin.mjs &
//   ADMIN_PORT=8099 ADMIN_TEST_PASSWORD=... node tools/test-admin-routes.mjs
//
// The password is taken from the environment, never from this file: a test
// fixture in the repository is still a credential in the repository. If the
// admin has no login configured, the suite skips signing in and runs anyway.
//
// Fetches a real editor page, submits the real form the way a browser would,
// and asserts on what came back and on what reached the database. The form
// engine is unit-tested by tools/test-admin-form.mjs; what this covers is the
// part that only breaks once the pieces are wired together — that a save
// actually persists, that a refused save refuses, and that a reset puts the
// shipped content back.
//
// It writes to whichever database the admin is talking to, and puts everything
// it touched back before it exits.
// Loads .env, so the username comes from the same place the admin reads it.
// The password deliberately does not: .env holds only a hash of it.
import '../db/env.mjs';

const PORT = Number(process.env.ADMIN_PORT) || 8099;
const BASE = `http://127.0.0.1:${PORT}`;

let failed = 0;
const ok = (name) => console.log(`  ok    ${name}`);
const bad = (name, why) => {
  failed++;
  console.log(`  FAIL  ${name}\n          ${why}`);
};
const check = (name, cond, why) => (cond ? ok(name) : bad(name, why));

/* ------------------------------------------------------------------ session */

// Every request below needs the session cookie, so the global is shadowed once
// here rather than threaded through forty call sites.
let COOKIE = '';
const rawFetch = globalThis.fetch;
const fetch = (url, opts = {}) =>
  rawFetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), ...(COOKIE ? { Cookie: COOKIE } : {}) },
  });

const USER = process.env.ADMIN_TEST_USER || process.env.ADMIN_USER || 'admin';
const PASSWORD = process.env.ADMIN_TEST_PASSWORD || '';

/** Is the admin asking us to sign in? */
const loginRequired = async () => {
  const res = await rawFetch(`${BASE}/`, { redirect: 'manual' });
  return res.status === 303 && String(res.headers.get('location')).startsWith('/login');
};

const signIn = async (username, password) => {
  const res = await rawFetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password, next: '/' }).toString(),
    redirect: 'manual',
  });
  const set = res.headers.get('set-cookie') || '';
  return { status: res.status, cookie: set.split(';')[0] };
};

/* --------------------------------------------------- a browser, approximately */

const unescape = (s) =>
  s.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');

/** Everything the block form on this page would submit. */
function formFields(html) {
  const params = new URLSearchParams();
  const tag = /<(input|textarea|select)\b([^>]*)>/gi;
  let m;
  while ((m = tag.exec(html))) {
    const [, kind, attrs] = m;
    const name = /name="([^"]*)"/.exec(attrs)?.[1];
    if (!name) continue;
    const lower = kind.toLowerCase();

    if (lower === 'input') {
      const type = (/type="([^"]*)"/.exec(attrs)?.[1] || 'text').toLowerCase();
      if ((type === 'checkbox' || type === 'radio') && !/\bchecked\b/.test(attrs)) continue;
      params.append(unescape(name), unescape(/value="([^"]*)"/.exec(attrs)?.[1] ?? ''));
      continue;
    }
    if (lower === 'textarea') {
      const close = html.indexOf('</textarea>', tag.lastIndex);
      params.append(unescape(name), unescape(html.slice(tag.lastIndex, close)));
      tag.lastIndex = close;
      continue;
    }
    const close = html.indexOf('</select>', tag.lastIndex);
    const body = html.slice(tag.lastIndex, close);
    const chosen =
      /<option value="([^"]*)"[^>]*\bselected\b/.exec(body)?.[1] ?? /<option value="([^"]*)"/.exec(body)?.[1] ?? '';
    params.append(unescape(name), unescape(chosen));
    tag.lastIndex = close;
  }
  return params;
}

const editor = async (key, json = false) => {
  const res = await fetch(`${BASE}/content/${key}${json ? '?json=1' : ''}`);
  const html = await res.text();
  return { html, fields: formFields(html) };
};

const post = (path, params) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'manual',
  });

/* ---------------------------------------------------------------------- run */

const MARK = 'ADMIN TEST — API keys encrypted at rest';

console.log(`\nAdmin end-to-end (${BASE})\n`);

// 0. The login, if one is configured.
const gated = await loginRequired();
if (gated) {
  if (!PASSWORD) {
    console.error(
      'This admin has a login, so the suite needs the password:\n\n' +
        '  ADMIN_TEST_PASSWORD=... node tools/test-admin-routes.mjs\n'
    );
    process.exit(1);
  }

  for (const [name, path] of [
    ['the posts page', '/'],
    ['the content editor', '/content/features'],
    ['authors', '/reference'],
  ]) {
    const res = await rawFetch(`${BASE}${path}`, { redirect: 'manual' });
    check(
      `${name} is closed to a signed-out visitor`,
      res.status === 303 && String(res.headers.get('location')).includes('/login'),
      `got ${res.status}`
    );
  }

  const write = await rawFetch(`${BASE}/content/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'key=trustPoints',
    redirect: 'manual',
  });
  check('a signed-out write is refused', write.status === 401, `got ${write.status}`);

  const wrongPass = await signIn(USER, PASSWORD + 'x');
  check('the wrong password is refused', wrongPass.status === 401, `got ${wrongPass.status}`);
  check('a refused sign-in issues no cookie', !wrongPass.cookie.includes('cl_admin='), 'a cookie was set');

  const wrongUser = await signIn(USER + 'x', PASSWORD);
  check('the wrong username is refused', wrongUser.status === 401, `got ${wrongUser.status}`);

  const good = await signIn(USER, PASSWORD);
  check('the right credentials are accepted', good.status === 303, `got ${good.status}`);
  check('signing in issues a session cookie', good.cookie.startsWith('cl_admin='), 'no cookie');
  COOKIE = good.cookie;

  const after = await fetch(`${BASE}/`, { redirect: 'manual' });
  check('the session opens the admin', after.status === 200, `got ${after.status}`);
} else {
  console.log('  --    no login configured; running without one');
}

// 1. A plain edit through the form, and does it reach the database.
{
  const { fields } = await editor('trustPoints');
  const before = fields.get('v[0].title');
  fields.set('v[0].title', MARK);
  const res = await post('/content/save', fields);
  check('form save redirects on success', res.status === 303, `got ${res.status}`);

  const { fields: after } = await editor('trustPoints');
  check('the edit is stored and read back', after.get('v[0].title') === MARK, `got "${after.get('v[0].title')}"`);
  check('the rest of the block is untouched', after.get('v[1].title') === fields.get('v[1].title'), 'sibling changed');

  const index = await (await fetch(`${BASE}/content`)).text();
  const row = index.slice(index.indexOf('/content/trustPoints'), index.indexOf('/content/trustPoints') + 400);
  check('the index marks it as edited', row.includes('edited'), 'no edited pill');
  check('the shipped value was not the marker', before !== MARK, 'test data collided with real content');
}

// 2. The build publishes it.
//
// The build wipes dist/ and writes it again. On Windows a file that something
// else has open cannot be deleted, so `node serve.mjs` running against the same
// dist/ can make this fail — which looks like the edit did not publish when
// really the build never finished. Checked separately, and reported with the
// build's own output, so the two are never confused.
{
  const { spawnSync } = await import('node:child_process');
  const { readFileSync, existsSync } = await import('node:fs');

  const built = spawnSync(process.execPath, ['build.mjs'], { encoding: 'utf8' });
  const output = `${built.stdout || ''}${built.stderr || ''}`.trim().split('\n').slice(-4).join('\n          ');
  check('the rebuild succeeds', built.status === 0, `exit ${built.status}\n          ${output}`);

  if (built.status === 0) {
    const page = 'dist/security/index.html';
    check('the rebuild wrote the page', existsSync(page), `${page} is missing`);
    if (existsSync(page)) {
      check('a rebuild publishes the edit', readFileSync(page, 'utf8').includes(MARK), 'the marker is not in it');
    }
  }
}

// 3. Reset puts the shipped content back.
{
  const res = await post('/content/reset', new URLSearchParams({ key: 'trustPoints' }));
  check('reset redirects', res.status === 303, `got ${res.status}`);
  const { fields } = await editor('trustPoints');
  check('reset restores the shipped value', fields.get('v[0].title') !== MARK, 'still the test value');

  const index = await (await fetch(`${BASE}/content`)).text();
  const row = index.slice(index.indexOf('/content/trustPoints'), index.indexOf('/content/trustPoints') + 400);
  check('the index no longer marks it as edited', !row.includes('edited'), 'still marked edited');
}

// 4. A change that would break the build is refused.
{
  const { fields } = await editor('screenOrder');
  fields.set('v', 'ideas\nnot-a-real-screen\ncalendar');
  const res = await post('/content/save', fields);
  const html = await res.text();
  check('an unknown screen id is refused', res.status === 400, `got ${res.status}`);
  check('the refusal names the problem', html.includes('not-a-real-screen'), 'error does not mention the id');
  check('the refusal lists the valid ids', html.includes('Known:'), 'no list of known screens');

  const { fields: still } = await editor('screenOrder');
  check('nothing was written', !still.get('v').includes('not-a-real-screen'), 'the bad value was stored');
}

// 5. A cross-block rule sees the other block.
{
  const { fields } = await editor('integrationGroups');
  fields.set('v', 'Blog & CMS\nSocial');
  const res = await post('/content/save', fields);
  const html = await res.text();
  check('removing a group still in use is refused', res.status === 400, `got ${res.status}`);
  check('the refusal names a group in use', html.includes('AI models'), 'does not say which group');
}

// 6. Add / Remove / Move change the form without saving.
{
  const { fields } = await editor('trustPoints');
  const n = Number(fields.get('__len:v'));
  fields.set('v[0].title', 'edited but not saved');
  fields.set('__action', 'add:v');
  const res = await post('/content/save', fields);
  const html = await res.text();
  check('add returns the form', res.status === 200, `got ${res.status}`);
  check('add says it is unsaved', html.includes('not saved yet'), 'no unsaved notice');

  const grown = formFields(html);
  check('add grows the list by one', Number(grown.get('__len:v')) === n + 1, `${grown.get('__len:v')} vs ${n + 1}`);
  check('add keeps the untyped edit', grown.get('v[0].title') === 'edited but not saved', 'edit lost');
  check('add appends an empty entry', grown.get(`v[${n}].title`) === '', 'new entry is not empty');

  const stored = await editor('trustPoints');
  check('add wrote nothing to the database', Number(stored.fields.get('__len:v')) === n, 'the list was persisted');
}

// 7. Move reorders without saving.
{
  const { fields } = await editor('trustPoints');
  const first = fields.get('v[0].title');
  const second = fields.get('v[1].title');
  fields.set('__action', 'down:v[0]');
  const moved = formFields(await (await post('/content/save', fields)).text());
  check('move swaps two entries', moved.get('v[0].title') === second && moved.get('v[1].title') === first, 'order unchanged');
}

// 8. Remove drops the right entry.
{
  const { fields } = await editor('trustPoints');
  const n = Number(fields.get('__len:v'));
  const second = fields.get('v[1].title');
  fields.set('__action', 'del:v[0]');
  const cut = formFields(await (await post('/content/save', fields)).text());
  check('remove shortens the list', Number(cut.get('__len:v')) === n - 1, 'length unchanged');
  check('remove drops the named entry', cut.get('v[0].title') === second, 'wrong entry removed');
}

// 9. JSON mode round-trips, and refuses what it cannot parse.
{
  const { fields } = await editor('analytics', true);
  const value = JSON.parse(fields.get('json'));
  value.domain = 'admin-test.example.com';
  fields.set('json', JSON.stringify(value, null, 2));
  const res = await post('/content/save', fields);
  check('a JSON save redirects', res.status === 303, `got ${res.status}`);

  const back = JSON.parse((await editor('analytics', true)).fields.get('json'));
  check('the JSON edit is stored', back.domain === 'admin-test.example.com', `got ${back.domain}`);

  const broken = new URLSearchParams({ key: 'analytics', mode: 'json', json: '{ not json' });
  const bad2 = await post('/content/save', broken);
  const html = await bad2.text();
  check('invalid JSON is refused', bad2.status === 400, `got ${bad2.status}`);
  check('invalid JSON hands the text back', html.includes('not json'), 'the typed text was lost');

  await post('/content/reset', new URLSearchParams({ key: 'analytics' }));
  const reset = JSON.parse((await editor('analytics', true)).fields.get('json'));
  check('reset restores the shipped analytics domain', reset.domain !== 'admin-test.example.com', 'still the test value');
}

// 10. Validation refuses an empty required field rather than publishing a gap.
{
  const { fields } = await editor('nav');
  fields.set('v[0].label', '');
  const res = await post('/content/save', fields);
  check('an empty nav label is refused', res.status === 400, `got ${res.status}`);
  check('nothing was written', (await editor('nav')).fields.get('v[0].label') !== '', 'the empty label was stored');
}

// 11. Authors: create, then delete, and refuse a delete that would orphan posts.
{
  const form = (o) => new URLSearchParams(o);
  const made = await post('/authors/save', form({ name: 'Admin Test Author', slug: '', email: 't@example.com' }));
  check('creating an author redirects', made.status === 303, `got ${made.status}`);

  const list = await (await fetch(`${BASE}/reference`)).text();
  check('the new author is listed', list.includes('admin-test-author'), 'not on the reference page');
  check('it is listed with no posts', /admin-test-author[\s\S]{0,600}?Delete/.test(list), 'no delete button offered');

  const gone = await post('/authors/delete', form({ slug: 'admin-test-author' }));
  check('deleting an unused author redirects', gone.status === 303, `got ${gone.status}`);
  check(
    'the author is gone',
    !(await (await fetch(`${BASE}/reference`)).text()).includes('admin-test-author'),
    'still listed'
  );

  const refused = await (await post('/authors/delete', form({ slug: 'iqbal-hussain' }))).text();
  check('deleting an author with posts is refused', /is the author of \d+ post/.test(refused), 'not refused');
}

// 12. Categories: the slug is in the URL of every post in it.
{
  const form = (o) => new URLSearchParams(o);
  const made = await post('/categories/save', form({ label: 'Admin Test', singular: 'Admin Test', sort: '9' }));
  check('creating a category redirects', made.status === 303, `got ${made.status}`);
  check(
    'the new category is listed',
    (await (await fetch(`${BASE}/reference`)).text()).includes('/resources/admin-test'),
    'not listed'
  );

  const renamed = await post(
    '/categories/save',
    form({ label: 'Admin Test', singular: 'Admin Test', slug: 'admin-test-2', sort: '9', original_slug: 'admin-test' })
  );
  check('renaming an empty category is allowed', renamed.status === 303, `got ${renamed.status}`);

  const blocked = await (
    await post(
      '/categories/save',
      form({ label: 'Guides', singular: 'Guide', slug: 'guides-renamed', sort: '1', original_slug: 'guides' })
    )
  ).text();
  check('renaming a category that holds posts is refused', /holds \d+ post/.test(blocked), 'not refused');
  check('the refusal explains why', blocked.includes('part of their URLs'), 'no reason given');

  await post('/categories/delete', form({ slug: 'admin-test-2' }));
  check(
    'the test category is cleaned up',
    !(await (await fetch(`${BASE}/reference`)).text()).includes('admin-test'),
    'still listed'
  );
}

// 13. The posts and plans editors still work.
{
  for (const [name, path] of [
    ['posts', '/'],
    ['pricing', '/plans'],
    ['new post', '/new'],
    ['reference', '/reference'],
  ]) {
    const res = await fetch(`${BASE}${path}`);
    check(`the ${name} page still renders`, res.status === 200, `got ${res.status}`);
  }
}

// 14. Signing out ends the session. Last, because everything after it would
//     be signed out too.
if (gated) {
  const res = await fetch(`${BASE}/logout`, { method: 'POST', redirect: 'manual' });
  check('signing out redirects to the login', res.status === 303, `got ${res.status}`);

  const cleared = res.headers.get('set-cookie') || '';
  check('signing out clears the cookie', /cl_admin=;|Max-Age=0/.test(cleared), 'cookie not cleared');

  COOKIE = '';
  const shut = await fetch(`${BASE}/content`, { redirect: 'manual' });
  check('the admin is closed again afterwards', shut.status === 303, `got ${shut.status}`);
}

console.log(failed ? `\n${failed} check(s) failed.\n` : '\nEvery check passed.\n');
process.exit(failed ? 1 : 0);
