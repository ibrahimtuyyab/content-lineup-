// Build-time asset registry.
//
// build.mjs fingerprints styles.css and app.js with a content hash and calls
// setAssets() *before* any page renders, so the shell emits hashed URLs and the
// host can cache them for a year with `immutable`. Without the hash the best a
// host can do is a short max-age and a revalidation round-trip per visit.
//
// The defaults are the unhashed paths, so importing a page module directly
// (a test, a one-off render) still produces a working document with no build.
export const assets = {
  css: '/styles.css',
  js: '/app.js',
};

export const setAssets = (next) => Object.assign(assets, next);
