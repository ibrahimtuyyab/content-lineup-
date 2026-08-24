// The admin login, checked without a server.
//
//   node tools/test-admin-auth.mjs
//
// Hashing, session cookies and the redirect target — the parts where being
// wrong is quiet. A session check that accepts a forged cookie does not throw,
// does not log, and does not look any different from one that works.
import { hashPassword, verifyPassword, createAuth, safeNext } from '../admin/auth.mjs';

let failed = 0;
const check = (name, cond, why = '') => {
  if (cond) return console.log(`  ok    ${name}`);
  failed++;
  console.log(`  FAIL  ${name}${why ? '\n          ' + why : ''}`);
};

/* -------------------------------------------------------------------- hashing */

const hash = hashPassword('correct horse battery staple');
check('a hash names its scheme', hash.startsWith('scrypt$'), hash.slice(0, 20));
check('the password is not in the hash', !hash.includes('correct'), 'the password is recoverable');
check('the right password verifies', verifyPassword('correct horse battery staple', hash));
check('a wrong password does not', !verifyPassword('correct horse battery stapl', hash));
check('an empty password does not', !verifyPassword('', hash));
check('a malformed hash is refused, not thrown on', !verifyPassword('x', 'nonsense'));
check('an empty hash is refused', !verifyPassword('x', ''));
check(
  'the same password hashes differently each time',
  hashPassword('same') !== hashPassword('same'),
  'the salt is not random'
);

/* -------------------------------------------------------------------- session */

const env = {
  ADMIN_USER: 'teczon',
  ADMIN_PASSWORD_HASH: hashPassword('Sw0rdfish!'),
  ADMIN_SESSION_SECRET: 'a'.repeat(64),
};
const auth = createAuth(env);
const asReq = (cookie) => ({ headers: { cookie } });

check('the login is on when configured', auth.enabled);
check('a session secret from the environment is not ephemeral', !auth.ephemeralSecret);
check('no cookie is not a session', !auth.isLoggedIn(asReq('')));
check('nonsense is not a session', !auth.isLoggedIn(asReq('cl_admin=nonsense')));

const good = auth.login('teczon', 'Sw0rdfish!');
check('the right credentials are accepted', good.ok);

const value = decodeURIComponent(/cl_admin=([^;]*)/.exec(good.cookie)[1]);
check('the session is accepted back', auth.isLoggedIn(asReq(`cl_admin=${encodeURIComponent(value)}`)));
check(
  'the session survives other cookies alongside it',
  auth.isLoggedIn(asReq(`theme=dark; cl_admin=${encodeURIComponent(value)}; other=1`))
);
check('the cookie is HttpOnly', good.cookie.includes('HttpOnly'));
check('the cookie is SameSite=Strict', good.cookie.includes('SameSite=Strict'));

// Tampering: change the expiry, keep the signature.
const [who, until, mac] = value.split('.');
const extended = `${who}.${Number(until) + 86_400_000}.${mac}`;
check(
  'a session with an edited expiry is refused',
  !auth.isLoggedIn(asReq(`cl_admin=${encodeURIComponent(extended)}`)),
  'the expiry is not covered by the signature'
);

const renamed = `admin.${until}.${mac}`;
check('a session with an edited username is refused', !auth.isLoggedIn(asReq(`cl_admin=${encodeURIComponent(renamed)}`)));

const expired = createAuth(env);
const stale = `teczon.${Date.now() - 1000}.x`;
check('an expired session is refused', !expired.isLoggedIn(asReq(`cl_admin=${encodeURIComponent(stale)}`)));

// A cookie signed with a different secret must not be accepted here.
const other = createAuth({ ...env, ADMIN_SESSION_SECRET: 'b'.repeat(64) });
const foreign = decodeURIComponent(/cl_admin=([^;]*)/.exec(other.login('teczon', 'Sw0rdfish!').cookie)[1]);
check(
  "another instance's session is refused",
  !auth.isLoggedIn(asReq(`cl_admin=${encodeURIComponent(foreign)}`)),
  'the signature is not checked against the secret'
);

check('the wrong password is refused', !auth.login('teczon', 'nope').ok);
check('the wrong username is refused', !auth.login('nobody', 'Sw0rdfish!').ok);
check(
  'the refusal does not say which half was wrong',
  auth.login('teczon', 'nope').error === auth.login('nobody', 'Sw0rdfish!').error
);

check('signing out expires the cookie', auth.logoutCookie().includes('Max-Age=0'));

/* -------------------------------------------------------------- configuration */

check('no configuration means no login', !createAuth({}).enabled);
check('a half-configured login stays off', !createAuth({ ADMIN_USER: 'x' }).enabled);
check('and says so', /half-configured|not set/.test(createAuth({ ADMIN_USER: 'x' }).reason));
check(
  'a missing session secret is flagged as ephemeral',
  createAuth({ ADMIN_USER: 'u', ADMIN_PASSWORD_HASH: hash }).ephemeralSecret
);

/* ----------------------------------------------------------- redirect target */

check('a path is kept', safeNext('/content/features') === '/content/features');
check('a query is kept', safeNext('/content?json=1') === '/content?json=1');
check('nothing becomes the root', safeNext('') === '/' && safeNext(null) === '/');
check('an absolute URL is dropped', safeNext('https://example.com') === '/');
check('a protocol-relative URL is dropped', safeNext('//example.com') === '/');
check('a javascript: URL is dropped', safeNext('javascript:alert(1)') === '/');

console.log(failed ? `\n${failed} check(s) failed.\n` : '\nEvery check passed.\n');
process.exit(failed ? 1 : 0);
