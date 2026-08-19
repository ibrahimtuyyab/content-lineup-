// Launch content, kept as modules purely as the initial import payload for
// db/seed.mjs. After seeding, the database is the source of truth and the site
// never reads these files — edit posts through the admin UI or db/cli.mjs.
import scheduleGuide from './schedule-content-that-publishes-itself.mjs';
import bufferAlternatives from './best-buffer-alternatives-2026.mjs';
import northgate from './northgate-air-case-study.mjs';
import realEstate from './real-estate-content-marketing-guide.mjs';
import geo from './get-cited-by-ai-search.mjs';
import update from './product-update-2026-08.mjs';

export const seedPosts = [update, realEstate, bufferAlternatives, geo, scheduleGuide, northgate].sort(
  (a, b) => (a.published < b.published ? 1 : -1)
);
