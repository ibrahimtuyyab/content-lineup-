// Create or upgrade the content database.
//   node db/migrate.mjs
import { migrate, DB_PATH, stats, isInitialised, addMissingColumns } from './db.mjs';

const existed = isInitialised();
const version = migrate();
const added = addMissingColumns();
if (added.length) console.log('Added columns: ' + added.join(', '));

console.log(`${existed ? 'Migrated' : 'Created'} ${DB_PATH}`);
console.log(`Schema version ${version}`);

if (existed) {
  const s = stats();
  console.log(
    `${s.posts} posts (${s.published} published, ${s.scheduled} scheduled, ${s.drafts} draft) · ` +
      `${s.categories} categories · ${s.authors} authors`
  );
} else {
  console.log('Next: node db/seed.mjs');
}
