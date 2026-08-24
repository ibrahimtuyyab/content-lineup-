// The site server — zero dependencies.
//
//   node serve.mjs                 → http://localhost:8080   (the site alone)
//   node serve.mjs --admin         → and the editor at /admin
//   npm start                      → build with the admin link, then both
//   PORT=3000 node serve.mjs
//
// With --admin it also mounts the content editor under /admin, so one command
// and one port serve the marketing site and the thing that edits it. The admin
// is imported only when that flag is given: the Docker image ships serve.mjs
// and dist/ and nothing else, and must not import a module that is not there.
//
// Serves clean URLs (/pricing → dist/pricing/index.html), compresses text
// responses, sets long-lived immutable caching on fingerprintable assets and
// short caching on HTML, and adds baseline security headers.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs';
import { join, extname, resolve, normalize } from 'node:path';
import { networkInterfaces } from 'node:os';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

const ROOT = resolve(import.meta.dirname, 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

/** dist/, so a caller mounting this can check for it too. */
export const DIST = ROOT;

if (!existsSync(ROOT)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);

// Compress once at boot rather than per request.
const cache = new Map();
const encode = (buf, ext) => {
  if (!COMPRESSIBLE.has(ext) || buf.length < 1024) return null;
  return {
    br: brotliCompressSync(buf, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 10, [constants.BROTLI_PARAM_SIZE_HINT]: buf.length },
    }),
    gzip: gzipSync(buf, { level: 9 }),
  };
};

/**
 * Read a file, compressed and with its ETag, remembering the result.
 *
 * The cached copy is keyed on the file's size and modification time, not just
 * its path. A plain path cache is correct for a container that builds once and
 * then only serves — but this same server now sits behind the admin's "Rebuild
 * site" button, which rewrites all of dist/ underneath it. Serving the bytes
 * from before the rebuild made that button look broken: the page reloads and
 * nothing has changed.
 *
 * One stat per request either way — the ETag already needed it.
 */
const load = (file) => {
  const stat = statSync(file);
  const stamp = `${stat.size.toString(16)}-${Math.round(stat.mtimeMs).toString(16)}`;

  const hit = cache.get(file);
  if (hit && hit.stamp === stamp) return hit;

  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  const entry = {
    buf,
    ext,
    stamp,
    type: TYPES[ext] || 'application/octet-stream',
    etag: `W/"${stamp}"`,
    enc: encode(buf, ext),
  };
  cache.set(file, entry);
  return entry;
};

/** Map a URL path to a file inside dist/, or null. */
function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const target = resolve(join(ROOT, clean));
  if (!target.startsWith(ROOT)) return null; // path traversal guard

  if (existsSync(target) && statSync(target).isFile()) return target;

  const withIndex = join(target, 'index.html');
  if (existsSync(withIndex)) return withIndex;

  const withHtml = target + '.html';
  if (existsSync(withHtml)) return withHtml;

  return null;
}

/**
 * Serve one request out of dist/. Exported so the combined server can hand it
 * everything that is not the admin.
 */
export const staticHandler = (req, res) => {
  const started = Date.now();
  const urlPath = req.url || '/';

  // Redirect trailing slashes (except root) to the canonical form.
  const bare = urlPath.split('?')[0];
  if (bare.length > 1 && bare.endsWith('/')) {
    res.writeHead(301, { Location: bare.slice(0, -1) + (urlPath.slice(bare.length) || '') });
    return res.end();
  }

  const file = resolveFile(urlPath);
  const notFound = !file;
  const target = file || join(ROOT, '404.html');

  let entry;
  try {
    entry = load(target);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    return res.end('Internal error');
  }

  const isHtml = entry.ext === '.html';
  // Content-addressed assets (styles.<hash>.css, app.<hash>.js) join the media
  // files on a one-year immutable cache: the URL changes when the bytes do.
  const immutable =
    /\.(woff2|png|jpg|webp|avif|svg|ico)$/i.test(target) || /\.[0-9a-f]{8,}\.(css|js)$/i.test(target);

  const headers = {
    'Content-Type': entry.type,
    'Cache-Control': isHtml
      ? 'public, max-age=0, must-revalidate'
      : immutable
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600',
    ETag: entry.etag,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
    Vary: 'Accept-Encoding',
  };

  if (req.headers['if-none-match'] === entry.etag) {
    res.writeHead(304, headers);
    return res.end();
  }

  let body = entry.buf;
  const accept = String(req.headers['accept-encoding'] || '');
  if (entry.enc) {
    if (/\bbr\b/.test(accept)) {
      body = entry.enc.br;
      headers['Content-Encoding'] = 'br';
    } else if (/\bgzip\b/.test(accept)) {
      body = entry.enc.gzip;
      headers['Content-Encoding'] = 'gzip';
    }
  }
  headers['Content-Length'] = body.length;

  res.writeHead(notFound ? 404 : 200, headers);
  if (req.method === 'HEAD') return res.end();
  res.end(body);

  if (process.env.LOG !== 'off') {
    console.log(
      `${notFound ? 404 : 200}  ${bare.padEnd(56)} ${String(body.length).padStart(8)}b  ${Date.now() - started}ms`
    );
  }
};

/** Every non-internal IPv4 address, so the LAN URL never has to be guessed. */
export function lanAddresses() {
  const out = [];
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) out.push({ name, address: a.address });
    }
  }
  return out;
}

/* ------------------------------------------------------------------- admin */

/**
 * Mount the content editor under /admin, on this same port.
 *
 * Imported dynamically and only when asked for. Two reasons, both real:
 * the Docker image copies serve.mjs and dist/ and nothing else, so a static
 * import of ../admin would break the image outright; and importing the admin
 * opens a database connection, which a plain static server has no business
 * doing.
 *
 * ADMIN_BASE is set before the import because admin/paths.mjs reads it at
 * module scope — it is what every link, form action and redirect in the admin
 * is prefixed with.
 */
const ADMIN_MOUNT = '/admin';

async function loadAdmin() {
  process.env.ADMIN_BASE = ADMIN_MOUNT;
  const mod = await import('./admin/server.mjs');
  return mod;
}

const wantsAdmin = process.argv.includes('--admin') || process.env.ADMIN === '1';

let admin = null;
let adminError = null;
if (wantsAdmin) {
  try {
    admin = await loadAdmin();
  } catch (err) {
    // The site is static files and does not need the database, so a store that
    // is unreachable takes out /admin and nothing else.
    adminError = err;
  }
}

const onAdminPath = (url) => {
  const path = url.split('?')[0];
  return path === ADMIN_MOUNT || path.startsWith(ADMIN_MOUNT + '/');
};

/** What /admin says when it could not be loaded. */
const adminUnavailable = (res) => {
  const body =
    'The content editor could not start.\n\n' +
    String(adminError?.message || 'Unknown error') +
    '\n\nThe site itself is unaffected.\n';
  res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
};

const handler = (req, res) => {
  if (wantsAdmin && onAdminPath(req.url || '/')) {
    return admin ? admin.handler(req, res) : adminUnavailable(res);
  }
  return staticHandler(req, res);
};

/* ------------------------------------------------------------------ listen */

const server = createServer(handler);

server.listen(PORT, HOST, () => {
  console.log(`\nContentLineup is live — serving ${ROOT}\n`);
  console.log(`  Local    http://localhost:${PORT}`);
  if (HOST === '0.0.0.0' || HOST === '::') {
    const lan = lanAddresses();
    for (const { name, address } of lan) {
      console.log(`  Network  http://${address}:${PORT}   (${name})`);
    }
    if (!lan.length) console.log('  Network  no external network interface found');
  } else {
    console.log(`  Bound to ${HOST} only — set HOST=0.0.0.0 to allow other devices`);
  }

  if (wantsAdmin && admin) {
    console.log(`\n  Admin    http://localhost:${PORT}${ADMIN_MOUNT}`);
    console.log(`  Store    ${admin.describeStore()}`);
    console.log('  ' + admin.describeAuth().replace(/^Login: +/, 'Login    ').replace(/\n/g, '\n  '));
    if (HOST === '0.0.0.0' || HOST === '::') {
      console.log(
        `\n  ${ADMIN_MOUNT} is reachable from every device on this network, over plain http.\n` +
          '  Set HOST=127.0.0.1 to keep it to this machine.'
      );
    }
  } else if (wantsAdmin) {
    console.log(`\n  Admin    failed to start — ${String(adminError?.message || '').split('\n')[0]}`);
  }
  console.log('');
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log('\nShutting down…');
    server.close(() => process.exit(0));
  });
}
