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
    const missing = loaded.authMissing();
    return fail(
      res,
      503,
      'The admin is not configured, and will not run unprotected on a public URL.\n\n' +
        `This deployment cannot see: ${missing.join(', ')}\n\n` +
        'Add them in Vercel → Project → Settings → Environment Variables, then\n' +
        'redeploy — variables added after a deployment do not reach the one already\n' +
        'running. Two things to check if they look like they are already set:\n\n' +
        '  1. Environment. A variable ticked only for Preview is invisible in\n' +
        '     Production, and vice versa. Tick the one this URL is.\n' +
        '  2. Redeploy. Settings → Deployments → ⋯ → Redeploy on the latest one.\n\n' +
        'The values are the ADMIN_ lines in your local .env. Print them with:\n' +
        '  npm run admin:password -- --show'
    );
  }

  return loaded.handler(req, res);
}
