// Put the schema on the clipboard, ASCII-safe, and open the SQL editor.
//   npm run db:copy
//
// Generated from schema.supabase.sql each time so there is only ever one
// source of truth for the schema.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { SUPABASE_URL } from './env.mjs';

const sql = readFileSync(join(resolve(import.meta.dirname), 'schema.supabase.sql'), 'utf8')
  .replace(/→/g, '->')
  .replace(/—/g, '--')
  .replace(/…/g, '...')
  .replace(/[’']/g, "'");

const copy = {
  win32: 'clip',
  darwin: 'pbcopy',
}[process.platform] || 'xclip -selection clipboard';

try {
  execSync(copy, { input: sql });
  console.log(`Schema copied to the clipboard (${sql.length} characters).`);
} catch {
  console.log('Could not reach the clipboard. Run `npm run db:schema` and copy manually.');
}

if (SUPABASE_URL) {
  const ref = new URL(SUPABASE_URL).host.split('.')[0];
  const url = `https://supabase.com/dashboard/project/${ref}/sql/new`;
  console.log(`SQL editor: ${url}`);
  if (!process.argv.includes('--no-open')) {
    const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  }
}

console.log('\nPaste into the editor, click Run, then: npm run db:push');
