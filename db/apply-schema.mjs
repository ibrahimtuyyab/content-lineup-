// Apply the Supabase schema without leaving the terminal.
//
//   npm run db:apply
//
// Supabase's Data API (the sb_secret_… / anon keys) can only read and write
// rows — it cannot run DDL. Creating tables needs the Management API, which
// authenticates with a *personal access token* instead.
//
// Create one at https://supabase.com/dashboard/account/tokens and put it in
// .env as SUPABASE_ACCESS_TOKEN. A token grants access to your whole Supabase
// account, so revoke it on that same page once the schema is applied.
//
// If you would rather not create a token, run `npm run db:schema` and paste the
// output into the SQL Editor — same result, no extra credential.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SUPABASE_URL, requireSupabase } from './env.mjs';

const TOKEN = (process.env.SUPABASE_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const SQL = readFileSync(join(resolve(import.meta.dirname), 'schema.supabase.sql'), 'utf8');

requireSupabase();
const ref = new URL(SUPABASE_URL).host.split('.')[0];

if (!TOKEN) {
  console.error(`
No SUPABASE_ACCESS_TOKEN in .env.

The Data API keys cannot create tables — that needs a personal access token.

  Option A  Create a token at https://supabase.com/dashboard/account/tokens
            add  SUPABASE_ACCESS_TOKEN=sbp_...  to .env, then re-run this.
            Revoke it afterwards; it grants account-wide access.

  Option B  Run:  npm run db:schema
            and paste the output into
            https://supabase.com/dashboard/project/${ref}/sql/new
`);
  process.exit(1);
}

if (!TOKEN.startsWith('sbp_')) {
  console.error(
    `SUPABASE_ACCESS_TOKEN does not look like a personal access token (expected it to start "sbp_").\n` +
      `The sb_secret_… key is a Data API key and cannot run DDL.`
  );
  process.exit(1);
}

const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).message || text;
    } catch {}
    throw new Error(`Management API ${res.status}: ${msg}`);
  }
  return text ? JSON.parse(text) : null;
};

console.log(`Applying schema to project ${ref}…`);

try {
  await api(`/v1/projects/${ref}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ query: SQL }),
  });
} catch (err) {
  console.error(`\n${err.message}\n`);
  if (/not found|403/i.test(err.message)) {
    console.error('Check that the token belongs to the account that owns this project.');
  }
  process.exit(1);
}

// Verify through the Data API, which is what the site will actually use.
const { rest } = await import('./supabase.mjs');
const tables = ['authors', 'categories', 'posts', 'post_keywords', 'post_faqs', 'post_revisions'];
console.log('\nVerifying via the Data API…');
for (const t of tables) {
  try {
    await rest(`${t}?select=*&limit=1`, { mode: 'write' });
    console.log(`  ✓ ${t}`);
  } catch (err) {
    console.log(`  ✗ ${t} — ${err.message}`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) console.log('\nSchema applied. Next:  npm run db:push');
