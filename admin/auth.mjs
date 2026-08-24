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
const SESSION_HOURS = 12;

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
    return {
      enabled: false,
      reason: !user && !hash ? 'ADMIN_USER and ADMIN_PASSWORD_HASH are not set' : 'the login is half-configured',
      isLoggedIn: () => true,
    };
  }

  // A session secret that changes per start is a working default: it means
  // every restart logs you out, which is a nuisance but never a hole. Setting
  // ADMIN_SESSION_SECRET in .env is what makes sessions survive a restart.
  const key = secret || randomBytes(32).toString('hex');

  return {
    enabled: true,
    ephemeralSecret: !secret,
    user,

    isLoggedIn: (req) => readCookies(req, COOKIE).some((c) => valid(key, user, c)),

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
    login(name, password) {
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
      return { ok: true, cookie: cookieHeader(mint(key, user)) };
    },

    logoutCookie: () => cookieHeader('', 0),
  };
}

/**
 * Set-Cookie for the session.
 *
 * No `Secure`, because the admin is served over http on loopback and a Secure
 * cookie would simply never be stored. `SameSite=Strict` is what stops another
 * site on the machine's browser posting to these routes with the cookie
 * attached, which is the only cross-site risk a loopback tool really has.
 *
 * `Path` follows the mount. Sharing an origin with the marketing site is the
 * whole point of mounting it under /admin, and a session cookie scoped to `/`
 * would then be attached to every request for a page, an image and a font on
 * the public side of that origin — for no reason, since only the admin ever
 * reads it.
 */
const cookieHeader = (value, maxAge = SESSION_HOURS * 3600) =>
  `${COOKIE}=${encodeURIComponent(value)}; Path=${B || '/'}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;

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
