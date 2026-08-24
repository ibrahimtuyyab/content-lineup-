// Stand-in for Vercel, so the deployed path can be exercised on this machine.
//
//   node admin/test-vercel.mjs           → http://127.0.0.1:8090
//   PORT=9000 node admin/test-vercel.mjs
//
// A deployment is the one configuration that cannot be tried before it is
// live, and it differs from local in ways that break things quietly: the
// function is reached through a rewrite so `req.url` is not the path anyone
// asked for, the runtime hands the body over already parsed, and the connection
// is HTTPS behind a proxy. Each of those has a matching branch in the code, and
// none of them is exercised by `npm start`.
//
// So this reproduces them: it applies the same rewrite vercel.json declares,
// calls api/admin.js exactly as the platform would, pre-parses the request body
// the way a serverless runtime does, and claims HTTPS through the same header a
// proxy uses. Everything else is served out of dist/, as the CDN would.
//
// Run the end-to-end suite against it:
//   ADMIN_URL=http://127.0.0.1:8090/admin ADMIN_TEST_PASSWORD=... node admin/test-routes.mjs
import { createServer } from 'node:http';
import '../db/env.mjs';

process.env.VERCEL = '1';

const PORT = Number(process.env.PORT) || 8090;

const { staticHandler, DIST } = await import('../serve.mjs');
const { default: adminFunction } = await import('../api/admin.js');

/** The rewrites in vercel.json, applied the way the platform applies them. */
const rewrite = (url) => {
  const [path, query = ''] = url.split('?');
  if (path !== '/admin' && !path.startsWith('/admin/')) return null;
  const params = new URLSearchParams(query);
  params.set('__path', path);
  return `/api/admin?${params}`;
};

/**
 * What a serverless runtime hands a function.
 *
 * The body arrives parsed, and the stream behind it is finished — which is why
 * readBody prefers `req.body` when it is there. Reading the stream first and
 * setting the property is exactly the order the platform does it in.
 */
const withParsedBody = (req) =>
  new Promise((resolve) => {
    if (req.method !== 'POST' && req.method !== 'PUT') return resolve();
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      const type = String(req.headers['content-type'] || '');
      if (type.includes('application/x-www-form-urlencoded')) {
        req.body = Object.fromEntries(new URLSearchParams(data));
      } else if (type.includes('application/json')) {
        try {
          req.body = JSON.parse(data);
        } catch {
          req.body = {};
        }
      } else {
        req.body = data;
      }
      resolve();
    });
  });

const server = createServer(async (req, res) => {
  // A proxy terminates TLS and says so in this header; the admin reads it to
  // decide whether the session cookie may carry Secure.
  req.headers['x-forwarded-proto'] = 'https';

  const rewritten = rewrite(req.url || '/');
  if (!rewritten) return staticHandler(req, res);

  req.url = rewritten;
  await withParsedBody(req);
  try {
    await adminFunction(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Function threw: ${err.message}\n`);
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nVercel stand-in — serving ${DIST}\n`);
  console.log(`  Site   http://127.0.0.1:${PORT}`);
  console.log(`  Admin  http://127.0.0.1:${PORT}/admin   (through api/admin.js, as deployed)`);
  console.log(`\n  VERCEL=1, body pre-parsed, x-forwarded-proto: https\n`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
