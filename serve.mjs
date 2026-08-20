// Production static server for dist/ — zero dependencies.
//
//   node serve.mjs                 → http://localhost:8080
//   PORT=3000 node serve.mjs
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

const load = (file) => {
  if (cache.has(file)) return cache.get(file);
  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  const entry = {
    buf,
    ext,
    type: TYPES[ext] || 'application/octet-stream',
    etag: `W/"${statSync(file).size.toString(16)}-${Math.round(statSync(file).mtimeMs).toString(16)}"`,
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

const server = createServer((req, res) => {
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
});

/** Every non-internal IPv4 address, so the LAN URL never has to be guessed. */
function lanAddresses() {
  const out = [];
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) out.push({ name, address: a.address });
    }
  }
  return out;
}

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
  console.log('');
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log('\nShutting down…');
    server.close(() => process.exit(0));
  });
}
