// Environment loading and credential selection.
//
// Reads .env via Node's built-in process.loadEnvFile() — no dotenv dependency.
// Real environment variables always win, so CI secrets override the file.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_FILE = join(ROOT, '.env');

if (existsSync(ENV_FILE)) {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch (err) {
    console.warn(`Could not read .env: ${err.message}`);
  }
}

const clean = (v) => (v ? String(v).trim().replace(/^["']|["']$/g, '') : '');

// Accept either the full project URL or just the project ref, since the ref is
// the part people can read off the dashboard URL.
//
// The dashboard shows the REST endpoint (…supabase.co/rest/v1) in some places
// and the bare project URL in others. Strip the API path so either one works —
// the client appends /rest/v1 itself.
const rawUrl = clean(process.env.SUPABASE_URL)
  .replace(/\/+$/, '')
  .replace(/\/rest\/v\d+$/i, '')
  .replace(/\/auth\/v\d+$/i, '');
const projectRef = clean(process.env.SUPABASE_PROJECT_REF);

export const SUPABASE_URL = rawUrl
  ? /^https?:\/\//.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}${rawUrl.includes('.') ? '' : '.supabase.co'}`
  : projectRef
  ? `https://${projectRef}.supabase.co`
  : '';

// Supabase renamed its keys; accept either generation.
//   anon / publishable  → read-only, safe for builds, RLS applies
//   service_role / secret → full access, local + CI only, never in a browser
export const ANON_KEY = clean(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
export const SERVICE_KEY = clean(
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
);

export const hasSupabase = !!(SUPABASE_URL && (ANON_KEY || SERVICE_KEY));

// Neon / Vercel Postgres. Vercel injects several aliases for a connected Neon
// store; any of them is the same database, so accept whichever is present.
// The unpooled variant is preferred for schema work and bulk writes.
export const NEON_URL = clean(
  process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL
);

export const hasNeon = /^postgres(ql)?:\/\//.test(NEON_URL);

/** Host only, for logging — never print the whole string, it contains the password. */
export const neonHost = () => {
  try {
    return new URL(NEON_URL).hostname;
  } catch {
    return '(unset)';
  }
};

/**
 * Pick a key for the job.
 * @param {'read'|'write'} mode
 */
export function keyFor(mode) {
  if (mode === 'write') {
    if (!SERVICE_KEY) {
      throw new Error(
        'Writing to Supabase needs SUPABASE_SERVICE_ROLE_KEY in .env.\n' +
          'Find it in your project under Settings → API → service_role.\n' +
          'Keep it out of version control and out of any browser bundle.'
      );
    }
    return SERVICE_KEY;
  }
  // Reads prefer the anon key so builds exercise the same RLS rules production does.
  const key = ANON_KEY || SERVICE_KEY;
  if (!key) throw new Error('No Supabase key found. Set SUPABASE_ANON_KEY in .env.');
  return key;
}

export function requireSupabase() {
  if (!SUPABASE_URL) {
    throw new Error(
      'SUPABASE_URL is not set.\n' +
        'Copy .env.example to .env and fill in your project URL and keys.\n' +
        'Both are in your Supabase dashboard under Settings → API.'
    );
  }
  if (!ANON_KEY && !SERVICE_KEY) {
    throw new Error('No Supabase key set. Add SUPABASE_ANON_KEY to .env.');
  }
}
