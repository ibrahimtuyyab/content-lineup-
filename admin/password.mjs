// Set or rotate the admin login.
//
//   npm run admin:password                  prompts for a password, hidden
//   npm run admin:password -- --user teczon  also sets the username
//   npm run admin:password -- --print        print the lines, change nothing
//
// Writes ADMIN_USER, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET into .env,
// replacing them if they are already there. The password itself is never
// written anywhere — only a scrypt hash of it — and it is read from a hidden
// prompt rather than an argument, so it does not end up in shell history
// either.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { hashPassword } from './auth.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const ENV = join(ROOT, '.env');

const args = process.argv.slice(2);
const printOnly = args.includes('--print');
const user = args.includes('--user') ? args[args.indexOf('--user') + 1] : null;

/**
 * `--show`: print the login variables already in .env, for pasting into a host.
 *
 * Not a new password — the existing one. A deployment needs the same three
 * values this machine uses, and the alternative is opening .env and picking the
 * right lines out of it by eye, which is where a truncated hash comes from.
 *
 * The password itself is not among them and cannot be: .env holds a hash.
 */
if (args.includes('--show')) {
  const file = join(resolve(import.meta.dirname, '..'), '.env');
  if (!existsSync(file)) {
    console.error('\nNo .env here. Create the login first:  npm run admin:password\n');
    process.exit(1);
  }
  const lines = readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => /^ADMIN_(USER|PASSWORD_HASH|SESSION_SECRET)=/.test(l.trim()));

  if (!lines.length) {
    console.error('\nNo login configured yet. Create one:  npm run admin:password\n');
    process.exit(1);
  }

  console.log('\nSet these in your host, then redeploy:\n');
  for (const l of lines) console.log('  ' + l.trim());
  console.log('\nADMIN_SESSION_SECRET is optional — without it a restart signs you out.');
  console.log('Treat all three as secrets: they are what stands between the internet');
  console.log('and your content database.\n');
  process.exit(0);
}

/** Read a line without echoing it back to the terminal. */
const askHidden = (question) =>
  new Promise((done) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = (char) => {
      // Redraw the prompt with nothing after it, so the password never appears.
      if (!['\r', '\n', ''].includes(String(char))) {
        process.stdout.write('\x1b[2K\x1b[G' + question);
      }
    };
    process.stdin.on('data', onData);
    rl.question(question, (answer) => {
      process.stdin.off('data', onData);
      rl.close();
      process.stdout.write('\n');
      done(answer);
    });
  });

const password = await askHidden('New admin password: ');
if (!password) {
  console.error('\nNothing entered — nothing changed.\n');
  process.exit(1);
}
const again = await askHidden('Confirm password:   ');
if (password !== again) {
  console.error('\nThose do not match — nothing changed.\n');
  process.exit(1);
}
if (password.length < 8) {
  console.error('\nUse at least 8 characters — nothing changed.\n');
  process.exit(1);
}

const values = {
  ADMIN_USER: user || null, // null = leave whatever is there
  ADMIN_PASSWORD_HASH: hashPassword(password),
  ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'),
};

if (printOnly) {
  console.log('\nAdd these to .env:\n');
  for (const [k, v] of Object.entries(values)) if (v) console.log(`${k}=${v}`);
  console.log('');
  process.exit(0);
}

/** Replace a key in .env if present, append it if not. */
const setKey = (text, key, value) => {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  return re.test(text) ? text.replace(re, line) : text.replace(/\n*$/, '\n') + line + '\n';
};

let env = existsSync(ENV) ? readFileSync(ENV, 'utf8') : '';
const isNew = !/^ADMIN_PASSWORD_HASH=/m.test(env);

if (isNew && !/# Admin login/.test(env)) {
  env =
    env.replace(/\n*$/, '\n') +
    '\n# ---------------------------------------------------------------------------\n' +
    '# Admin login (npm run admin)\n' +
    '#\n' +
    '# The password is not here — ADMIN_PASSWORD_HASH is a scrypt hash of it.\n' +
    '# Change it with: npm run admin:password\n' +
    '# ADMIN_SESSION_SECRET keeps you logged in across restarts; rotating it\n' +
    '# signs every open session out.\n' +
    '# ---------------------------------------------------------------------------\n';
}

for (const [k, v] of Object.entries(values)) {
  if (v) env = setKey(env, k, v);
}
if (!/^ADMIN_USER=/m.test(env)) env = setKey(env, 'ADMIN_USER', 'admin');

writeFileSync(ENV, env);

const current = /^ADMIN_USER=(.*)$/m.exec(env)?.[1] || 'admin';
console.log(`\nAdmin login updated in .env`);
console.log(`  username  ${current}`);
console.log(`  password  stored as a scrypt hash, not as text`);
console.log(`\nRestart the admin for it to take effect:  npm run admin\n`);
