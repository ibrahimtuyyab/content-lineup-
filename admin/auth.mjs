// Login for the admin.
//
// The admin binds to loopback, which stops a stranger on the network reaching
// it but does nothing about whoever is already sitting at the machine, or about
// a browser tab left open on a shared laptop. So: a username, a password, and a
// session that expires.
//
// Three things are deliberate here.
//
// The password is never stored, in this file or anywhere else. `.env` holds a
// scrypt hash of it, and .env is gitignored — so the password does not end up
// in the repository, in the shell history of whoever set it up, or in a diff.
// Change it with `npm run admin:password`.
//
// The session is a signed cookie rather than a server-side session table.
// There is one user and one process; a table would be state to keep, expire and
// invalidate for no gain. The cookie carries its own expiry and an HMAC over
// it, so a tampered or expired cookie fails the same check.
//
// Every comparison that touches a secret is constant-time. It is unlikely to
// matter over loopback, but "unlikely to matter" is how timing leaks survive.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { BASE as B } from './paths.mjs';

const COOKIE = 'cl_admin';

/**
 * How long a sign-in lasts.
 *
 * Two hours, not a working day. This is a content editor: a session is worth
 * exactly as long as the sitting it was opened for, and every hour past that is
 * an hour in which typing /admin into the address bar opens the editor for
 * whoever is at the machine. Signing in again is one form.
 */
const SESSION_HOURS = 2;

/* ------------------------------------------------------------------ hashing */

// Deliberately slow. These are scrypt's own defaults apart from N, which is
// raised because this runs once per login, not once per request.
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 };

/** Hash a password for storage: 'scrypt$<salt hex>$<hash hex>'. */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password), salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/** Does this password match a stored hash? Constant-time. */
export function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  let expected;
  try {
    expected = Buffer.from(hashHex, 'hex');
  } catch {
    return false;
  }
  const actual = scryptSync(String(password), Buffer.from(saltHex, 'hex'), expected.length, SCRYPT);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Compare two strings without leaking where they first differ. */
const sameString = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  // Length is not secret here — the username is not the secret — but padding to
  // a fixed width keeps timingSafeEqual from throwing on a mismatch.
  const n = Math.max(x.length, y.length, 1);
  return timingSafeEqual(Buffer.concat([x], n), Buffer.concat([y], n));
};

/* ------------------------------------------------------------------ session */

/**
 * Sign a payload, tied to the admin that issued it.
 *
 * The mount goes into the signature but not into the cookie, so the cookie
 * format is unchanged and a session simply fails to verify anywhere else.
 *
 * This matters because a cookie is scoped to a host and a path — never to a
 * port. Running the editor on its own at localhost:8081 and mounted at
 * localhost:8080/admin puts two different servers on one cookie namespace, and
 * a session minted by either was cryptographically valid for the other: signing
 * in once meant the second one waved you through without ever showing a login.
 */
const sign = (secret, payload) => createHmac('sha256', secret).update(`${payload}|${B}`).digest('hex');

/** A signed cookie value: '<user>.<expiry ms>.<hmac>'. */
const mint = (secret, user) => {
  const payload = `${user}.${Date.now() + SESSION_HOURS * 3600_000}`;
  return `${payload}.${sign(secret, payload)}`;
};

/**
 * Is this cookie a session we issued, for this user, that has not expired?
 *
 * The signature is checked before the expiry is trusted, because the expiry is
 * inside the signed payload — reading it first would be reading attacker input.
 */
const valid = (secret, user, cookie) => {
  const parts = String(cookie || '').split('.');
  if (parts.length !== 3) return false;
  const [who, until, mac] = parts;
  if (!sameString(mac, sign(secret, `${who}.${until}`))) return false;
  if (who !== user) return false;
  return Number(until) > Date.now();
};

/**
 * Every cookie sent under this name, not just the first.
 *
 * A browser can hold more than one cookie of the same name at different paths —
 * a `/` one from the editor running on its own, a `/admin` one from the editor
 * mounted in the site — and it sends all the ones whose path matches, in an
 * order the server does not control. Reading only the first would sign you out
 * at random depending on which one the browser happened to list first.
 */
const readCookies = (req, name) => {
  const out = [];
  for (const part of String(req.headers.cookie || '').split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) out.push(decodeURIComponent(rest.join('=')));
  }
  return out;
};

/* ------------------------------------------------- failed-attempt throttling */

/**
 * A password this short is guessable at machine speed, so slow it down.
 *
 * In memory and per-process, which is the right scope: there is one process,
 * and a restart to clear the lockout needs the same access to the machine that
 * would let someone read .env anyway.
 */
const attempts = { count: 0, until: 0 };
const MAX_ATTEMPTS = 8;
const LOCKOUT_MIN = 15;

export const lockedFor = () => Math.max(0, Math.ceil((attempts.until - Date.now()) / 60_000));

const recordFailure = () => {
  attempts.count++;
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.until = Date.now() + LOCKOUT_MIN * 60_000;
    attempts.count = 0;
  }
};

/* --------------------------------------------------------------------- guard */

/**
 * Build the guard from the environment.
 *
 * Returns `enabled: false` when no password hash is configured, so an existing
 * checkout keeps working exactly as it did rather than locking its owner out of
 * their own content the moment they pull. The admin prints a line saying so.
 */
export function createAuth(env = process.env) {
  const user = (env.ADMIN_USER || '').trim();
  const hash = (env.ADMIN_PASSWORD_HASH || '').trim();
  const secret = (env.ADMIN_SESSION_SECRET || '').trim();

  if (!user || !hash) {
    // Name the ones actually missing. "Set these three" when two are already
    // set sends you looking in the wrong place — and the usual cause is a
    // variable that exists but is scoped to the wrong environment, which looks
    // identical to one that was never added.
    const missing = [!user && 'ADMIN_USER', !hash && 'ADMIN_PASSWORD_HASH'].filter(Boolean);
    return {
      enabled: false,
      missing,
      reason:
        missing.length === 2
          ? 'ADMIN_USER and ADMIN_PASSWORD_HASH are not set'
          : `${missing[0]} is not set (the other one is)`,
      isLoggedIn: () => true,
      sessionAge: () => Infinity,
    };
  }

  // A session secret that changes per start is a working default: it means
  // every restart logs you out, which is a nuisance but never a hole. Setting
  // ADMIN_SESSION_SECRET in .env is what makes sessions survive a restart.
  //
  // Deployed, the deployment's own id is mixed in. A serverless admin has no
  // "restart" to speak of — the secret is an environment variable that sits
  // there for months, so a cookie minted once stays valid for as long as its
  // own expiry allows, on any machine that still has it, through every deploy
  // in between. Signing with the deployment as well means shipping is also how
  // you clear every session: the next deploy invalidates all of them, and
  // whoever holds one is asked for the password again. The cost is having to
  // sign in after each deploy, which is a fair price for being able to end a
  // session you are no longer sure about without touching a dashboard.
  //
  // Locally there is no such variable, so nothing changes: the secret alone
  // signs, and `npm start` keeps you signed in across restarts as before.
  // Three names for the same thing, in the order they are most likely to be
  // there. All of them are system variables the platform sets per deployment,
  // and all of them are absent if a project has turned system variables off —
  // in which case this falls back to the secret alone and behaves as it did.
  const deployment = (
    env.VERCEL_DEPLOYMENT_ID ||
    env.VERCEL_GIT_COMMIT_SHA ||
    env.VERCEL_URL ||
    ''
  ).trim();
  const key = secret ? `${secret}${deployment && `.${deployment}`}` : randomBytes(32).toString('hex');

  return {
    enabled: true,
    ephemeralSecret: !secret,
    user,

    isLoggedIn: (req) => readCookies(req, COOKIE).some((c) => valid(key, user, c)),

    /**
     * How long ago the session on this request was signed, in milliseconds —
     * Infinity when there is no valid one.
     *
     * For the re-entry check in the server: arriving at the admin from outside
     * it asks for the password again, and a sign-in that has only just happened
     * must not be asked to happen again. Chrome calls the redirect that follows
     * a sign-in same-origin, so it would not trigger anyway; this is what makes
     * that true of every browser rather than the one that was tested.
     */
    sessionAge: (req) => {
      const c = readCookies(req, COOKIE).find((one) => valid(key, user, one));
      if (!c) return Infinity;
      const until = Number(String(c).split('.')[1]);
      return Date.now() - (until - SESSION_HOURS * 3600_000);
    },

    /**
     * Is this name the admin's?
     *
     * Only for the site's combined sign-in form, which has to decide whether a
     * submission is an admin logging in or a customer who should be sent to the
     * product app. It does mean that form can tell you a username is not the
     * admin's — which login() itself is careful never to reveal. That is a fair
     * trade here and nowhere else: there is exactly one account, its name sits
     * in .env on this machine, and the whole thing is bound to loopback. What
     * stays hidden is the only part worth hiding — whether the password matched.
     */
    isUser: (name) => sameString(name || '', user),

    /** @returns {{ok: true, cookie: string} | {ok: false, error: string}} */
    login(name, password, { secure = false } = {}) {
      const mins = lockedFor();
      if (mins) {
        return { ok: false, error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` };
      }
      // Both checks always run, so a wrong username and a wrong password take
      // the same time and the response cannot say which one was wrong.
      const nameOk = sameString(name || '', user);
      const passOk = verifyPassword(password || '', hash);
      if (!nameOk || !passOk) {
        recordFailure();
        return { ok: false, error: 'That username and password do not match.' };
      }
      attempts.count = 0;
      return { ok: true, cookie: cookieHeader(mint(key, user), { secure }) };
    },

    logoutCookie: ({ secure = false } = {}) => cookieHeader('', { secure, maxAge: 0 }),
  };
}

/**
 * Set-Cookie for the session.
 *
 * `Secure` follows the connection rather than being fixed either way. Deployed,
 * the session travels over HTTPS and must never be allowed onto plain http.
 * Locally the admin *is* plain http on loopback, and a Secure cookie there is
 * silently dropped by the browser — the login would appear to succeed and then
 * not have happened, which is a miserable thing to debug. So it is decided per
 * request, from the proxy's own header.
 *
 * `SameSite=Strict` stops another site in the same browser posting to these
 * routes with the cookie attached, on either connection.
 *
 * `Path` follows the mount. Sharing an origin with the marketing site is the
 * whole point of mounting it under /admin, and a session cookie scoped to `/`
 * would then be attached to every request for a page, an image and a font on
 * the public side of that origin — for no reason, since only the admin ever
 * reads it.
 *
 * No `Max-Age` and no `Expires`, so the browser holds it only until it closes.
 * A cookie with a lifetime is written to disk and survives the window, the
 * laptop lid and the walk away from the desk; this one does not. The expiry
 * that matters is inside the value and checked here — the browser dropping it
 * sooner is a second, stricter limit, not the only one.
 */
const cookieHeader = (value, { secure = false, maxAge = null } = {}) =>
  `${COOKIE}=${encodeURIComponent(value)}; Path=${B || '/'}; HttpOnly; SameSite=Strict` +
  `${secure ? '; Secure' : ''}${maxAge === null ? '' : `; Max-Age=${maxAge}`}`;

/* ---------------------------------------------------------------- login page */

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Where to go after signing in — but only ever somewhere on this admin.
 *
 * Checked here as well as at the redirect, so the form cannot carry an
 * off-site value around between attempts. `//host` is the case worth naming:
 * it starts with a slash but a browser reads it as a protocol-relative URL to
 * another origin.
 */
export const safeNext = (next) => {
  const s = String(next || '/');
  return s.startsWith('/') && !s.startsWith('//') ? s : '/';
};

/* --------------------------------------------------- where you were headed */

const NEXT = 'cl_admin_next';

/**
 * The page an unauthenticated visitor asked for, carried across the sign-in.
 *
 * Mounted inside the site, the form they are sent to is /login — a page of the
 * static build, rendered once and served from a CDN. It cannot read a `?next=`
 * out of its own URL and write it into the form, and the site ships no
 * JavaScript that could. So the destination travels the one way a static page
 * cannot lose it: in a cookie scoped to the admin, which the browser attaches
 * to the sign-in POST because that POST goes to /admin/login.
 *
 * Short-lived and HttpOnly like the session, and only ever a path on this
 * admin — safeNext() is applied on the way in and again on the way out.
 */
export const nextCookie = (path, { secure = false } = {}) =>
  `${NEXT}=${encodeURIComponent(safeNext(path))}; Path=${B || '/'}; HttpOnly; SameSite=Strict` +
  `${secure ? '; Secure' : ''}; Max-Age=600`;

/** Forget it. Sent with the session the moment the sign-in succeeds. */
export const clearNextCookie = ({ secure = false } = {}) =>
  `${NEXT}=; Path=${B || '/'}; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}; Max-Age=0`;

/** What the last redirect to the sign-in remembered, or the admin's root. */
export const readNext = (req) => safeNext(readCookies(req, NEXT)[0]);

/**
 * The admin's own sign-in form — for when it is running on its own.
 *
 * Mounted inside the site there is one sign-in page and this is not it: /login
 * asks the same two questions for the product and for this admin, and decides
 * from the username which one you meant. Two forms on one origin is one more
 * than anybody needs, so the mounted admin sends people there instead and this
 * is never rendered. `npm run admin` has no site next to it, and still does.
 */
export const loginView = (layout, { error, next } = {}) =>
  layout(
    'Sign in',
    `<div class="login">
       <h1>Sign in</h1>
       <p class="sub">The ContentLineup content admin.</p>
       ${error ? `<div class="flash err">${esc(error)}</div>` : ''}
       <form method="post" action="${B}/login">
         <input type="hidden" name="next" value="${esc(safeNext(next))}">
         <label>Username</label>
         <input name="username" autocomplete="username" autofocus required>
         <label>Password</label>
         <input name="password" type="password" autocomplete="current-password" required>
         <button class="btn">Sign in</button>
       </form>
       <p class="hint">Change the password with <code>npm run admin:password</code>.</p>
     </div>`,
    '',
    true
  );
