// The sign-in page.
//
// One form, two destinations. There are two different things called "signing
// in" on this domain — a ContentLineup customer reaching the product at
// app.contentlineup.com, and whoever runs this website reaching the editor at
// /admin — and this page does not make you pick first. You type who you are and
// it sends you to the right place:
//
//   the admin username  -> the password is checked here, and you land in /admin
//   anything else       -> you are sent to the product's own sign-in page
//
// What the second case deliberately does NOT do is take a customer's product
// password anywhere. The app is a separate service with its own session and
// this site has no way to authenticate against it, so a password typed by a
// non-admin is discarded on arrival, never stored, never logged, never
// forwarded. It is the one honest way to have a single form: the site can only
// verify the one password it actually holds a hash of.
//
// Errors come back here rather than on the admin's own form, so the page you
// sign in on is the page you correct a typo on. They are plain #fragments and
// CSS :target — no JavaScript, so this works with scripting disabled like the
// rest of the site.
//
// Built only with --admin-link; see src/lib/admin-link.mjs.
import { page, esc, icon, eyebrow } from '../lib/html.mjs';
import { site, cta } from '../data/site.mjs';
import { ADMIN_PATH } from '../lib/admin-link.mjs';

export function loginPage() {
  const body = `
<section class="wrap login-page">
  <div class="login-head">
    ${eyebrow('Sign in')}
    <h1>Sign in</h1>
  </div>

  <div class="login-card">
    <p class="login-error" id="error" role="alert">
      ${icon('cross')} That username and password do not match.
    </p>
    <p class="login-error" id="locked" role="alert">
      ${icon('clock')} Too many failed attempts. Try again in a few minutes.
    </p>

    <form method="post" action="${ADMIN_PATH}/login" class="login-form">
      <input type="hidden" name="from" value="site">
      <input type="hidden" name="next" value="/">

      <label for="login-user">Email or username</label>
      <input id="login-user" name="username" autocomplete="username" autocapitalize="none"
        spellcheck="false" autofocus required>

      <label for="login-pass">Password</label>
      <input id="login-pass" name="password" type="password" autocomplete="current-password" required>

      <button class="btn btn-primary btn-block" type="submit">Sign in ${icon('arrow')}</button>
    </form>

    <p class="login-alt">
      Signing in to ${esc(site.name)} takes you to the app.
      No account yet? <a href="${cta.primary.href}">Start free</a> — no credit card required.
    </p>
  </div>
</section>`;

  return page({
    path: '/login',
    title: `Sign in | ${site.name}`,
    description: `Sign in to your ${site.name} account, or to the admin for this website.`,
    // A utility page with nothing to rank for, and one way through it is the
    // door into the editor — neither belongs in an index.
    noindex: true,
    body,
  });
}
