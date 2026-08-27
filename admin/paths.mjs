// Where the admin is mounted.
//
// On its own (`npm run admin`) it owns the whole origin and this is empty, so
// every link it writes is the same root-relative path it always was. Mounted
// inside the site server (`npm start`) it lives under /admin, and every link,
// form action and redirect has to carry that prefix or it lands on the
// marketing site instead.
//
// One constant rather than a function, so a link is written as
// `href="${BASE}/content"` in the templates: the prefix is visible at the point
// the URL is built, and grepping for a route still finds it.
/**
 * A mount has to be a root-relative path and nothing else.
 *
 * Checked rather than trusted because of one specific way it goes wrong: Git
 * Bash on Windows rewrites an environment variable that looks like a Unix path,
 * so `ADMIN_BASE=/admin` arrives as `C:/Program Files/Git/admin`. Taken at face
 * value that produces an admin whose every link points into a directory on the
 * C: drive, and whose routes therefore never match — which looks like a routing
 * bug and is not one. Better to say so and carry on unmounted.
 */
const readBase = (raw) => {
  const value = String(raw || '').trim().replace(/\/+$/, '');
  if (!value) return '';
  if (!value.startsWith('/') || value.includes(':') || value.includes('\\')) {
    console.warn(
      `ADMIN_BASE is "${raw}", which is not a root-relative path like /admin — ignoring it.\n` +
        '  On Git Bash, set it as ADMIN_BASE=//admin or use MSYS_NO_PATHCONV=1.'
    );
    return '';
  }
  return value;
};

export const BASE = readBase(process.env.ADMIN_BASE);

/**
 * A path on the admin, prefixed. For the places a template literal is not
 * already in play — redirects, and the Location header.
 *
 * The admin's own root is `/`, which naively prefixed gives `/admin/` — and a
 * host configured for no trailing slashes answers that with a redirect to
 * `/admin` before the request ever reaches this code. Everything still works,
 * through an extra round trip on the one URL people land on most: the page you
 * arrive at straight after signing in. So the root collapses to the mount.
 */
export const u = (path = '/') => (path === '/' ? HOME : BASE + path);

/**
 * The admin's front page, as a link. `/admin` when mounted, `/` when not.
 * Written out because `${BASE}/` is the trailing-slash trap described above.
 */
export const HOME = BASE || '/';

/**
 * The path as the admin's own routes see it: with the mount prefix taken off.
 *
 * `/admin` and `/admin/` both mean the admin's root. Anything that does not
 * start with the prefix is left alone and will simply not match a route.
 */
export const strip = (pathname) => {
  if (!BASE) return pathname;
  if (pathname === BASE) return '/';
  return pathname.startsWith(BASE + '/') ? pathname.slice(BASE.length) : pathname;
};
