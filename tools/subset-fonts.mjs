// Subset the self-hosted fonts to the characters this site actually renders.
//
//   node tools/subset-fonts.mjs        (npm run fonts)
//
// Reads the full originals from assets/fonts-src/ and writes subsets into
// public/fonts/, which is what build.mjs copies into dist/. Run it when the
// originals change or when the site starts using a character it did not before
// — the check at the bottom tells you when that has happened.
//
// This is the only script in the repo with a dependency, and it is a
// devDependency run by hand: the build and the server stay zero-dependency.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import subsetFont from 'subset-font';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'assets', 'fonts-src');
const OUT = join(ROOT, 'public', 'fonts');

/**
 * The glyph set to keep. Deliberately wider than today's copy: a subset that
 * has to be regenerated for every apostrophe is a subset nobody regenerates,
 * and a missing glyph is a visible fallback-font flash on a heading.
 */
const CHARSET = [
  // Printable ASCII
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  // Latin-1 letters, for names and loan words
  ...Array.from({ length: 96 }, (_, i) => String.fromCharCode(0xc0 + i)),
  // Typographic punctuation the copy actually uses
  '‘’‚“”„–—…•·′″‹›«»†‡',
  // Currency, maths and marks that appear in prices, stats and lists
  '€£¥¢°±×÷≈≠≤≥∞µ†№§¶©®™−',
  // Arrows and ticks used in the workflow copy (Idea → Generate → …)
  '→←↑↓↔⇒✓✔✗✕',
  // Fractions and superscripts that show up in pricing and footnotes
  '½¼¾⅓⅔¹²³ⁿ',
].join('');

/**
 * Per-font axis instancing. Fraunces ships three axes — opsz, wght and SOFT —
 * and their delta table (gvar) is 145KB of a 187KB uncompressed font, so this,
 * not the glyph count, is where the weight actually is.
 *
 * SOFT is pinned to 0, which is already the font's default and a value nothing
 * in styles.css ever changes: no CSS here sets font-variation-settings. That
 * single pin is worth about half the file.
 *
 * opsz and wght are deliberately left alone. Browsers drive opsz automatically
 * (font-optical-sizing defaults to auto), so pinning or narrowing it would
 * change how the display headings look at size — and measuring showed a
 * narrowed wght range makes the file *larger*, because the deltas get rebased
 * around a new default.
 */
const FONTS = [
  // Inter's only axis is wght, and the site genuinely uses 400 through 700.
  { file: 'inter-latin.woff2', label: 'Inter' },
  { file: 'fraunces-latin.woff2', label: 'Fraunces', variationAxes: { SOFT: 0 } },
];

// Miscellaneous Symbols and Dingbats. The copy uses a couple of these (the ☀ in
// the Instagram caption demo); no Latin text font contains them, so they render
// from the system emoji font by design and are not a subsetting miss.
const isSymbolBlock = (code) => code >= 0x2600 && code <= 0x27bf;

if (!existsSync(SRC)) {
  console.error(`Missing ${SRC} — the full originals live there, not in public/fonts.`);
  process.exit(1);
}

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
let before = 0;
let after = 0;

console.log(`Subsetting to ${[...new Set(CHARSET)].length} unique characters\n`);

for (const { file, label, variationAxes } of FONTS) {
  const src = join(SRC, file);
  if (!existsSync(src)) {
    console.error(`  ${label.padEnd(10)} SKIPPED — ${file} not found in assets/fonts-src/`);
    continue;
  }

  const original = readFileSync(src);
  const subset = await subsetFont(original, CHARSET, {
    targetFormat: 'woff2',
    ...(variationAxes ? { variationAxes } : {}),
  });

  writeFileSync(join(OUT, file), subset);
  before += original.length;
  after += subset.length;

  const saved = (100 - (subset.length / original.length) * 100).toFixed(0);
  console.log(
    `  ${label.padEnd(10)} ${kb(original.length).padStart(9)} → ${kb(subset.length).padStart(9)}  (−${saved}%)`
  );
}

console.log(`\n  ${'Total'.padEnd(10)} ${kb(before).padStart(9)} → ${kb(after).padStart(9)}`);

/* -------------------------------------------------------------- guard rail */
// Warn if the built site uses a character the subset does not cover. Text is
// pulled from dist/ if it exists, so this runs after a build and stays honest
// about what the pages contain rather than what this file guessed.
const DIST = join(ROOT, 'dist');
if (existsSync(DIST)) {
  const kept = new Set(CHARSET);
  const missing = new Map();

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        const text = readFileSync(full, 'utf8')
          .replace(/<script[\s\S]*?<\/script>/g, ' ')
          .replace(/<style[\s\S]*?<\/style>/g, ' ')
          .replace(/<[^>]+>/g, ' ');
        for (const ch of text) {
          const code = ch.codePointAt(0);
          // Ignore control characters and anything outside the Latin plane the
          // fonts cover at all (emoji render from the system font).
          if (code < 32 || code > 0x2b1a || kept.has(ch) || isSymbolBlock(code)) continue;
          missing.set(ch, (missing.get(ch) || 0) + 1);
        }
      }
    }
  };
  walk(DIST);

  if (missing.size) {
    const list = [...missing.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} (U+${ch.codePointAt(0).toString(16).toUpperCase()}, ×${n})`)
      .join('  ');
    console.log(`\n  ⚠ Characters in dist/ that the subset does not cover:\n    ${list}`);
    console.log('    Add them to CHARSET above and re-run, or they fall back to a system font.');
  } else {
    console.log('\n  ✓ Every character in dist/ is covered by the subset.');
  }
}
