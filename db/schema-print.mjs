// Print the Supabase schema, ready to paste into the SQL Editor.
//
//   npm run db:schema              print it
//   npm run db:schema -- --open    print it and open the SQL Editor in a browser
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { SUPABASE_URL } from './env.mjs';

const SQL = readFileSync(join(resolve(import.meta.dirname), 'schema.supabase.sql'), 'utf8');

if (process.argv.includes('--raw')) {
  process.stdout.write(SQL);
  process.exit(0);
}

const projectRef = SUPABASE_URL ? new URL(SUPABASE_URL).host.split('.')[0] : null;
const editor = projectRef ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` : null;

console.log('─'.repeat(74));
console.log(' Copy everything between the lines into the Supabase SQL Editor and run it.');
if (editor) console.log(` Editor: ${editor}`);
else console.log(' Editor: your Supabase dashboard → SQL Editor → New query');
console.log('─'.repeat(74));
console.log();
process.stdout.write(SQL);
console.log();
console.log('─'.repeat(74));
console.log(' Then:  npm run db:push');
console.log('─'.repeat(74));

if (process.argv.includes('--open') && editor) {
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', editor] : [editor];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}
