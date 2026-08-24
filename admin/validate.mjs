// What a content block is not allowed to be.
//
// The generic form cannot express "this list needs one entry per column" or
// "this id has to name a screen that exists", so the checks live here, keyed by
// block. They run on every save, before anything is written.
//
// The line between an error and a warning is whether the published site would
// be wrong, not whether the value looks odd:
//
//   error    the build crashes, a page renders empty, or an entry is silently
//            dropped from the page it was written for
//   warning  the site still builds and reads correctly, but something is
//            probably not what the author meant
//
// Errors refuse the save. Warnings are shown after it. Anything not listed here
// is saved as typed — this is a guard against breaking the site, not a style
// guide for the copy.
import { renderers } from '../src/lib/screens.mjs';

/** Screen ids that can actually be drawn. Anything else has no image to show. */
export const SCREEN_IDS = Object.keys(renderers);

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const blank = (v) => v == null || String(v).trim() === '';

const url = (v) => {
  try {
    const u = new URL(String(v));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/** A link that is either a site-relative path or an absolute http(s) URL. */
const href = (v) => !blank(v) && (String(v).startsWith('/') || String(v).startsWith('#') || url(v));

/** Every field in `fields` must be a non-empty string on every item. */
const required = (arr, fields, noun, out) => {
  (arr || []).forEach((item, i) => {
    for (const f of fields) {
      if (blank(item?.[f])) out.push(`${noun} ${i + 1}: ${f} cannot be empty.`);
    }
  });
};

/** Ids must be unique, or the later one wins wherever they are looked up. */
const unique = (arr, field, noun, out) => {
  const seen = new Map();
  (arr || []).forEach((item, i) => {
    const v = item?.[field];
    if (blank(v)) return;
    if (seen.has(v)) out.push(`${noun} ${i + 1}: ${field} "${v}" is already used by ${noun} ${seen.get(v) + 1}.`);
    else seen.set(v, i);
  });
};

const nonEmpty = (arr, noun, out) => {
  if (!Array.isArray(arr) || !arr.length) out.push(`${noun} cannot be empty — the section it fills would render blank.`);
};

/**
 * One validator per block. Each gets the proposed value and `live`, the fully
 * merged content as it will be after this save, so a check can look at another
 * block. Returns { errors, warnings }; either may be omitted.
 */
const CHECKS = {
  site(v, live, e, w) {
    for (const f of ['name', 'origin', 'description', 'email']) {
      if (blank(v?.[f])) e.push(`${f} cannot be empty — it appears on every page.`);
    }
    if (!blank(v?.origin) && !url(v.origin)) {
      e.push(`origin must be a full URL like https://contentlineup.com — every canonical URL is built from it.`);
    }
    if (String(v?.origin || '').endsWith('/')) w.push('origin has a trailing slash, which will double up in canonical URLs.');
    for (const [k, val] of Object.entries(v?.app || {})) {
      if (!blank(val) && !url(val)) e.push(`app.${k} must be a full URL.`);
    }
    if (!blank(v?.email) && !String(v.email).includes('@')) e.push('email does not look like an address.');
  },

  analytics(v, live, e, w) {
    if (!v?.enabled) return;
    if (blank(v.domain)) e.push('domain is required while analytics is enabled, or every event is dropped.');
    if (blank(v.src) || !url(v.src)) e.push('src must be the full URL of the analytics script.');
  },

  cta(v, live, e) {
    for (const [k, item] of Object.entries(v || {})) {
      if (blank(item?.label)) e.push(`${k}: label cannot be empty — it is the text on the button.`);
      if (!href(item?.href)) e.push(`${k}: href must be a path like /pricing or a full URL.`);
    }
  },

  nav(v, live, e) {
    nonEmpty(v, 'The header navigation', e);
    required(v, ['label'], 'Item', e);
    (v || []).forEach((item, i) => {
      if (!href(item?.href)) e.push(`Item ${i + 1}: href must be a path like /pricing or a full URL.`);
    });
  },

  footerNav(v, live, e) {
    nonEmpty(v, 'The footer navigation', e);
    required(v, ['title'], 'Column', e);
    (v || []).forEach((col, i) => {
      if (!col?.links?.length) e.push(`Column ${i + 1} ("${col?.title || '?'}") has no links.`);
      (col?.links || []).forEach((l, j) => {
        if (blank(l?.label)) e.push(`Column ${i + 1}, link ${j + 1}: label cannot be empty.`);
        if (!href(l?.href)) e.push(`Column ${i + 1}, link ${j + 1}: href must be a path or a full URL.`);
      });
    });
  },

  features(v, live, e, w) {
    nonEmpty(v, 'The feature list', e);
    unique(v, 'id', 'Feature', e);
    required(v, ['id', 'name', 'short', 'body'], 'Feature', e);
    (v || []).forEach((f, i) => {
      if (!blank(f?.screen) && !live.screenOrder.includes(f.screen)) {
        e.push(
          `Feature ${i + 1} ("${f.name || f.id}") points at screen "${f.screen}", which is not in the ` +
            'screen build order — the image would 404. ' +
            `Known: ${live.screenOrder.join(', ')}`
        );
      }
      if (!f?.bullets?.length) w.push(`Feature ${i + 1} ("${f?.name || f?.id}") has no bullets.`);
    });
  },

  channels(v, live, e) {
    nonEmpty(v, 'The channel list', e);
    unique(v, 'id', 'Channel', e);
    required(v, ['id', 'name', 'type', 'tagline', 'desc'], 'Channel', e);
    (v || []).forEach((c, i) => {
      if (!['live', 'soon'].includes(c?.status)) {
        e.push(`Channel ${i + 1} ("${c?.name || c?.id}"): status must be "live" or "soon", not "${c?.status}".`);
      }
    });
  },

  integrations(v, live, e) {
    nonEmpty(v, 'The integrations grid', e);
    required(v, ['name', 'desc'], 'Integration', e);
    (v || []).forEach((it, i) => {
      if (!live.integrationGroups.includes(it?.group)) {
        e.push(
          `Integration ${i + 1} ("${it?.name}") is in group "${it?.group}", which is not one of the ` +
            'integration groups — it would not appear under any heading. ' +
            `Known: ${live.integrationGroups.join(', ')}`
        );
      }
    });
  },

  integrationGroups(v, live, e, w) {
    nonEmpty(v, 'The integration groups', e);
    if (new Set(v).size !== (v || []).length) e.push('Group names must be unique.');
    const used = new Set((live.integrations || []).map((i) => i.group));
    for (const g of used) {
      if (!v.includes(g)) e.push(`"${g}" is still the group of at least one integration. Remove or move those first.`);
    }
    for (const g of v || []) {
      if (!used.has(g)) w.push(`"${g}" has no integrations in it, so the heading will not render.`);
    }
  },

  keyModes(v, live, e) {
    nonEmpty(v, 'The key modes', e);
    unique(v, 'id', 'Mode', e);
    required(v, ['id', 'label', 'kicker', 'summary'], 'Mode', e);
  },

  stages(v, live, e) {
    nonEmpty(v, 'The workflow stages', e);
    unique(v, 'id', 'Stage', e);
    required(v, ['id', 'n', 'verb', 'title', 'short', 'body'], 'Stage', e);
    (v || []).forEach((s, i) => {
      if (!blank(s?.screen) && !live.screenOrder.includes(s.screen)) {
        e.push(`Stage ${i + 1} ("${s.title || s.id}") points at screen "${s.screen}", which is not built.`);
      }
    });
  },

  scatteredStack(v, live, e) {
    nonEmpty(v, 'The problem list', e);
    required(v, ['tool', 'job'], 'Row', e);
  },

  screens(v, live, e, w) {
    if (!isObj(v) || !Object.keys(v).length) return e.push('There must be at least one screen caption.');
    for (const [id, s] of Object.entries(v)) {
      for (const f of ['title', 'caption', 'alt']) {
        if (blank(s?.[f])) e.push(`Screen "${id}": ${f} cannot be empty.`);
      }
      if (!SCREEN_IDS.includes(id)) {
        w.push(`Screen "${id}" has no renderer in src/lib/screens.mjs, so it can carry a caption but not be drawn.`);
      }
    }
    for (const id of live.screenOrder || []) {
      if (!v[id]) e.push(`Screen "${id}" is in the build order but has no caption here.`);
    }
  },

  screenOrder(v, live, e) {
    nonEmpty(v, 'The screen build order', e);
    if (new Set(v).size !== (v || []).length) e.push('The same screen is listed twice.');
    for (const id of v || []) {
      if (!SCREEN_IDS.includes(id)) {
        e.push(
          `"${id}" has no renderer in src/lib/screens.mjs, so the build would crash trying to draw it. ` +
            `Known: ${SCREEN_IDS.join(', ')}`
        );
      }
    }
    // Anything already pointing at a screen this save would remove.
    const pointing = [
      ...(live.features || []).filter((f) => f.screen).map((f) => [`feature "${f.name || f.id}"`, f.screen]),
      ...(live.stages || []).filter((s) => s.screen).map((s) => [`stage "${s.title || s.id}"`, s.screen]),
      ...(live.tourScreens || []).map((id) => ['the homepage tour', id]),
    ];
    for (const [who, id] of pointing) {
      if (!v.includes(id)) e.push(`${who} points at screen "${id}", which this change would stop building.`);
    }
  },

  tourScreens(v, live, e, w) {
    nonEmpty(v, 'The homepage tour', e);
    for (const id of v || []) {
      if (!(live.screenOrder || []).includes(id)) {
        e.push(`"${id}" is not in the screen build order, so it has no image to show.`);
      }
    }
    if ((v || []).length > 6) w.push(`${v.length} screens is a long tour; the homepage was designed around five.`);
  },

  niches(v, live, e, w) {
    nonEmpty(v, 'The audience list', e);
    unique(v, 'id', 'Audience', e);
    required(v, ['id', 'label', 'headline', 'problem', 'solution'], 'Audience', e);
    for (const id of ['owners', 'teams', 'agencies']) {
      if (!(v || []).some((n) => n.id === id)) {
        w.push(`No audience with id "${id}", so the homepage will show fewer than three audience cards.`);
      }
    }
  },

  comparison(v, live, e, w) {
    const cols = v?.columns || [];
    if (cols.length < 2) e.push('A comparison needs at least two columns.');
    if (!v?.rows?.length) e.push('A comparison needs at least one row.');
    (v?.rows || []).forEach((r, i) => {
      if (blank(r?.dimension)) e.push(`Row ${i + 1}: dimension cannot be empty.`);
      if ((r?.values || []).length !== cols.length) {
        e.push(
          `Row ${i + 1} ("${r?.dimension || '?'}") has ${(r?.values || []).length} values for ` +
            `${cols.length} columns — the table would be misaligned.`
        );
      }
      if ((r?.notes || []).length !== cols.length) {
        e.push(
          `Row ${i + 1} ("${r?.dimension || '?'}") has ${(r?.notes || []).length} notes for ${cols.length} columns.`
        );
      }
    });
    if (blank(v?.fair)) {
      w.push('The "where the alternatives win" line is empty. It is the part that makes the table credible.');
    }
  },

  faqGroups(v, live, e, w) {
    nonEmpty(v, 'The FAQ list', e);
    required(v, ['title'], 'Group', e);
    let home = 0;
    (v || []).forEach((g, i) => {
      if (!g?.items?.length) e.push(`Group ${i + 1} ("${g?.title || '?'}") has no questions.`);
      (g?.items || []).forEach((it, j) => {
        if (blank(it?.q)) e.push(`Group ${i + 1}, question ${j + 1}: the question cannot be empty.`);
        if (blank(it?.a)) {
          e.push(
            `Group ${i + 1}, question ${j + 1} ("${String(it?.q || '').slice(0, 40)}"): the answer cannot be ` +
              'empty — it is published as FAQ structured data.'
          );
        }
        if (it?.home) home++;
      });
    });
    if (!home) w.push('No question is marked for the homepage, so the homepage FAQ section will be empty.');
  },

  pricingFaqs(v, live, e) {
    nonEmpty(v, 'The pricing FAQs', e);
    required(v, ['q', 'a'], 'Question', e);
  },

  trustPoints(v, live, e) {
    nonEmpty(v, 'The trust points', e);
    required(v, ['title', 'body'], 'Point', e);
  },

  topicClusters(v, live, e, w) {
    nonEmpty(v, 'The topic clusters', e);
    unique(v, 'id', 'Cluster', e);
    required(v, ['id', 'label', 'blurb'], 'Cluster', e);
    (v || []).forEach((c, i) => {
      if (blank(c?.pillar?.label) || !href(c?.pillar?.href)) {
        e.push(`Cluster ${i + 1} ("${c?.label || c?.id}"): the pillar page needs a label and a link.`);
      }
      if (!c?.slugs?.length) w.push(`Cluster ${i + 1} ("${c?.label || c?.id}") lists no post slugs, so it will be empty.`);
    });
  },

  relatedFor(v, live, e, w) {
    if (!isObj(v) || !Object.keys(v).length) return w.push('No related links are configured for any page.');
    for (const [page, group] of Object.entries(v)) {
      if (blank(group?.title)) e.push(`"${page}": the section needs a title.`);
      if (!group?.links?.length) e.push(`"${page}" has no links. Remove the entry instead of leaving it empty.`);
      (group?.links || []).forEach((l, i) => {
        if (!href(l?.href)) e.push(`"${page}", link ${i + 1}: href must be a path or a full URL.`);
        if (blank(l?.title)) e.push(`"${page}", link ${i + 1}: title cannot be empty.`);
      });
      if ((group?.links || []).length > 4) {
        w.push(`"${page}" has ${group.links.length} links; the section was designed for three.`);
      }
    }
  },

  workflowCompare(v, live, e) {
    for (const side of ['manual', 'automated']) {
      const col = v?.[side];
      if (!col) {
        e.push(`The "${side}" column is missing.`);
        continue;
      }
      if (blank(col.title)) e.push(`${side}: title cannot be empty.`);
      if (!col.rows?.length) e.push(`${side}: there are no rows.`);
    }
  },

  accountTree(v, live, e) {
    nonEmpty(v, 'The account tree', e);
    required(v, ['id', 'name'], 'Account', e);
    unique(v, 'id', 'Account', e);
  },

  ideaDemo(v, live, e) {
    if (!v?.presets?.length) e.push('The idea demo needs at least one preset.');
    required(v?.presets, ['idea', 'title'], 'Preset', e);
  },

  aiDemo(v, live, e) {
    if (blank(v?.original)) e.push('The "before" paragraph cannot be empty.');
    if (!v?.instructions?.length) e.push('The AI demo needs at least one instruction chip.');
    required(v?.instructions, ['id', 'label', 'result'], 'Instruction', e);
  },

  channelDemo(v, live, e) {
    if (blank(v?.idea)) e.push('The demo needs an idea.');
    if (!v?.outputs?.length) e.push('The demo needs at least one channel output.');
    required(v?.outputs, ['id', 'label', 'title'], 'Output', e);
  },
};

/**
 * Check one proposed block value.
 * @param key   the block being saved
 * @param value the proposed value
 * @param live  every block merged, with this value already in place
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateBlock(key, value, live) {
  const errors = [];
  const warnings = [];
  if (value === undefined || value === null) {
    errors.push('The value is empty.');
    return { errors, warnings };
  }
  try {
    CHECKS[key]?.(value, live, errors, warnings);
  } catch (err) {
    // A validator that trips over an unexpected shape is itself a finding: the
    // value is malformed enough that a renderer would trip over it too.
    errors.push(`This value is not the shape the site expects (${err.message}).`);
  }
  return { errors, warnings };
}

/** Enum choices the generic form should render as a dropdown, by field name. */
export const enumsFor = (key, live) => {
  const shared = { screen: live.screenOrder || [] };
  if (key === 'features' || key === 'stages') return shared;
  if (key === 'channels') return { status: ['live', 'soon'], type: ['Blog', 'Headless CMS', 'Social'] };
  if (key === 'integrations') {
    return { group: live.integrationGroups || [], status: ['live', 'soon'] };
  }
  if (key === 'screenOrder' || key === 'tourScreens') return {};
  return shared;
};
