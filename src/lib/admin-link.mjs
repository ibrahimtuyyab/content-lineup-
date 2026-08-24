// Whether the built pages point their Log in button at the admin.
//
// The site is a static build. On Vercel and Netlify it is served by a CDN with
// no Node process behind it, so /admin does not exist there — and the header's
// Log in button has a real job on the public site: it sends customers to their
// ContentLineup account at app.contentlineup.com. Repointing it there would
// take every visitor to a sign-in form for this site's own editor instead.
//
// So it is opt-in, and off by default. `npm run build` — which is exactly what
// the hosts run — leaves Log in pointing at the product. `npm start` builds
// with --admin-link and serves with the admin mounted, so the button and the
// thing it opens arrive together.
//
// The cost of that, worth knowing: on a local build the header's Log in button
// no longer reaches the product app, so that one link cannot be clicked through
// locally. `npm run serve` (no admin) gives you the public behaviour back.
//
// A build flag rather than an environment variable because npm scripts have to
// work the same on Windows: `ADMIN_LINK=1 node build.mjs` is a syntax error in
// PowerShell and cmd, and this project carries no cross-env dependency.
const flagged = process.argv.includes('--admin-link') || process.env.ADMIN_LINK === '1';

/** Is the admin reachable from the pages this build produces? */
export const adminLink = flagged;

/** Where it lives, matching the mount in serve.mjs. */
export const ADMIN_PATH = '/admin';

/** The site's own sign-in page, which offers both the product and the admin. */
export const LOGIN_PATH = '/login';
