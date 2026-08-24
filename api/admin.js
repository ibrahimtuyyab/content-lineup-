// The admin, as a Vercel serverless function.
//
// vercel.json rewrites /admin and /admin/* here. Everything else on the domain
// is the static site out of dist/, exactly as before — this function is only
// ever reached for the editor.
//
// The mount prefix is set before the admin is imported, because admin/paths.mjs
// reads it at module scope and every link, form action and redirect the admin
// writes is built from it.
process.env.ADMIN_BASE = '/admin';

/**
 * The admin is imported lazily and remembered.
 *
 * Two reasons. It connects to the database as it loads, and a cold start that
 * cannot reach Neon should answer with something explanatory rather than a
 * platform stack trace. And a warm instance keeps the module, so the connection
 * work happens once per instance rather than once per request.
 */
let mod = null;
let loadError = null;

async function admin() {
  if (mod || loadError) return mod;
  try {
    mod = await import('../admin/server.mjs');
  } catch (err) {
    loadError = err;
  }
  return mod;
}

/**
 * What to say when the login is not configured — and what this deployment can
 * actually see, since that is the only question that matters here.
 *
 * "Set these variables" is not much help to someone who believes they already
 * did: the two ways that happens are a variable ticked for the wrong
 * environment, and a variable added after the running deployment was built.
 * Both look identical from outside. So the page reports which names are
 * visible, and which environment Vercel says this is, which distinguishes them.
 *
 * Names only, never values. `DATABASE_URL` is listed the same way, because a
 * deployment that can see it and not `ADMIN_USER` has variables scoped to
 * different environments — which is the answer, and is otherwise invisible.
 */
const notConfigured = (missing) => {
  const known = ['ADMIN_USER', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'DATABASE_URL'];
  const seen = known.filter((k) => (process.env[k] || '').trim());
  const absent = known.filter((k) => !seen.includes(k));
  const where = process.env.VERCEL_ENV || 'unknown';

  return [
    'The admin is not configured, and will not run unprotected on a public URL.',
    '',
    `Missing: ${missing.join(', ')}`,
    '',
    '--- what this deployment can see ---------------------------------------',
    `  environment   ${where}${where === 'preview' ? '   (a Preview URL, not Production)' : ''}`,
    `  set           ${seen.length ? seen.join(', ') : '(none of them)'}`,
    `  not set       ${absent.join(', ')}`,
    '------------------------------------------------------------------------',
    '',
    seen.includes('DATABASE_URL') && !seen.includes('ADMIN_USER')
      ? `DATABASE_URL is visible here but ADMIN_USER is not, so this deployment does\n` +
        `read some variables. The ADMIN_ ones are almost certainly ticked for a\n` +
        `different environment than "${where}" — open each one and tick "${where}".`
      : `Add them in Vercel → Project → Settings → Environment Variables, tick\n` +
        `"${where === 'unknown' ? 'Production' : where}", and redeploy.`,
    '',
    'Then redeploy. Variables added after a deployment do not reach the one',
    'already running: Deployments → ⋯ on the latest → Redeploy.',
    '',
    'The values are the ADMIN_ lines in your local .env. Print them with:',
    '  npm run admin:password -- --show',
  ].join('\n');
};

const fail = (res, status, message) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(message + '\n');
};

/**
 * Put back the URL the visitor actually asked for.
 *
 * A rewrite means the function is reached at /api/admin, and what `req.url`
 * holds there is a platform detail rather than a promise. The admin routes on
 * the path, so guessing wrong would break every route at once — and only after
 * a deploy. So vercel.json passes the original path along as `__path` and this
 * rebuilds the URL from it: no guessing, and testable on this machine.
 *
 * Any real query string is preserved; Vercel merges the request's own
 * parameters into the destination alongside `__path`.
 */
const restorePath = (req) => {
  const url = new URL(req.url || '/', 'http://admin.local');
  const original = url.searchParams.get('__path');
  if (!original || !original.startsWith('/')) return;
  url.searchParams.delete('__path');
  const rest = url.searchParams.toString();
  req.url = original + (rest ? `?${rest}` : '');
};

export default async function handler(req, res) {
  restorePath(req);
  const loaded = await admin();

  if (!loaded) {
    return fail(
      res,
      503,
      'The admin could not start.\n\n' +
        String(loadError?.message || 'Unknown error') +
        '\n\nThe site itself is unaffected. Check DATABASE_URL in the project settings.'
    );
  }

  // The one thing that must never happen on a public URL.
  //
  // With no ADMIN_USER and ADMIN_PASSWORD_HASH the admin runs without a login —
  // which is a reasonable default for a tool bound to loopback on your own
  // machine, and an unauthenticated, internet-reachable editor for the content
  // database here. So deployed, an unconfigured login is a refusal, not a
  // convenience. Locally nothing changes.
  if (!loaded.authEnabled()) {
    return fail(res, 503, notConfigured(loaded.authMissing()));
  }

  return loaded.handler(req, res);
}
