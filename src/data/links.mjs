// Editorial cross-links between marketing pages and articles.
//
// The shipped link graph is in links.defaults.mjs; this applies the admin's
// edits over it, the same way src/data/site.mjs does for the rest of the
// content. Kept as one export so the pages that render it are unchanged.
import { content } from './content-blocks.mjs';

export const relatedFor = content.relatedFor;
