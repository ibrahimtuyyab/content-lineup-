// Where this admin is running, and what that changes.
//
// Three places now: a terminal on your machine (`npm run admin`), inside the
// site server on your machine (`npm start`), and a Vercel serverless function
// on the public internet. The third one differs from the other two in ways that
// are not cosmetic:
//
//   - the filesystem is read-only and holds no source, so the "Rebuild site"
//     button cannot run the build — it asks Vercel to redeploy instead
//   - the connection is HTTPS through a proxy, so the session cookie must be
//     Secure, which a cookie served over plain http must never be
//   - it is reachable by anyone, so an admin with no password configured is not
//     a convenience, it is an open door — and is refused outright
//
// Everything here is read from the environment rather than guessed, so running
// the same code locally behaves exactly as it did before.

/** Vercel sets this to "1" in both the build and the function runtime. */
export const onVercel = process.env.VERCEL === '1';

/**
 * A deploy hook URL, if one is configured.
 *
 * The published site is static: an edit lands in the database immediately, but
 * the pages people read are the ones written at the last build. This is how the
 * admin asks for a new one. Without it, the button can only tell you the edit
 * is saved and waiting for the next deploy — which is true, and better than a
 * button that appears to work and does not.
 *
 * Create it in Vercel: Project → Settings → Git → Deploy Hooks.
 */
export const deployHook = (process.env.VERCEL_DEPLOY_HOOK_URL || '').trim();

/**
 * Is this connection encrypted?
 *
 * `Secure` on a cookie means "only ever send this over HTTPS". Set it on a
 * plain-http origin and the browser simply never stores the cookie, so the
 * login would appear to succeed and then not — which is why this is decided per
 * request from the proxy's own header rather than assumed once at startup.
 */
export const isSecureRequest = (req) => {
  const proto = String(req?.headers?.['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  if (proto) return proto === 'https';
  return !!req?.socket?.encrypted;
};
