/* ContentLineup — site interactions.
   No dependencies. Everything degrades to working HTML without it, and every
   animation here is either explaining the product or getting out of the way. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var onView = function (el, fn, opts) {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { fn(e.isIntersecting, io, e.target); });
    }, opts || { threshold: 0.2 });
    io.observe(el);
    return io;
  };

  /* Coalesces a handler onto the next animation frame.

     A scroll listener that measures the page runs on every scroll event — which
     can be several per frame — and each measurement forces the browser to flush
     pending layout before it can answer. That is the layout thrash you see as
     jitter while scrolling. Wrapping the handler here means it runs at most once
     per frame, and it runs at the point in the frame where the layout it reads
     is already up to date. */
  var onFrame = function (fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  };

  /* Runs `done` when el's own animation finishes.

     Pairing a setTimeout against a duration written in the stylesheet means two
     copies of the same number, and they drift the moment either side changes;
     if the timeout is short the class is stripped mid-animation and the card
     snaps. The event is the real signal. The timer is only a backstop for the
     case where no animation runs at all (reduced motion, display:none). */
  var onAnimEnd = function (el, done) {
    var fired = false;
    var fire = function (e) {
      if (fired || (e && e.target !== el)) return;
      fired = true;
      el.removeEventListener('animationend', fire);
      window.clearTimeout(guard);
      done();
    };
    var guard = window.setTimeout(fire, 1200);
    el.addEventListener('animationend', fire);
  };

  /* ---------- CTA tracking ----------
     One delegated listener for every [data-cta] on the page. The value names
     the placement ("hero", "pricing-team"), because the only question worth
     asking of this data is which placement actually converts.

     Fired on pointerdown as well as click: a click that navigates to the signup
     app can tear the page down before the beacon leaves, and pointerdown gives
     the request a head start. `sent` keeps the pair from double-counting. */
  var track = function (name, props) {
    if (typeof window.plausible !== 'function') return;
    window.plausible(name, props ? { props: props } : undefined);
  };

  var ctaSent = new WeakMap();
  var onCta = function (e) {
    var el = e.target.closest ? e.target.closest('[data-cta]') : null;
    if (!el || ctaSent.has(el)) return;
    ctaSent.set(el, 1);
    // Allow the same button to be counted again on a later, separate click.
    setTimeout(function () { ctaSent.delete(el); }, 1000);
    track('CTA', { placement: el.dataset.cta, label: (el.textContent || '').trim().slice(0, 60) });
  };
  document.addEventListener('pointerdown', onCta, { passive: true, capture: true });
  document.addEventListener('click', onCta, { passive: true, capture: true });

  /* ---------- monthly / annual pricing ----------
     One flag on <html> drives every price grid on the page; CSS does the
     swapping. Nothing here writes to storage — the choice is a way of reading
     the page, not a preference worth remembering. */
  var billOpts = $$('[data-billing-set]');
  if (billOpts.length) {
    billOpts.forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.dataset.billingSet;
        document.documentElement.dataset.billing = mode;
        billOpts.forEach(function (o) {
          var on = o.dataset.billingSet === mode;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        track('Billing period', { period: mode });
      });
    });
  }

  /* ---------- sticky header + reading progress ----------
     One scroll listener drives both. The progress hairline is decorative, so it
     is skipped entirely when the reader has asked for reduced motion rather
     than being animated at zero duration. */
  var head = $('#site-head');
  var bar = reduced ? null : $('#progress-bar');
  if (head || bar) {
    var onScroll = function () {
      var y = window.scrollY;
      if (head) {
        head.classList.toggle('stuck', y > 8);
        head.classList.toggle('past-hero', y > 480);
      }
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      }
    };
    onScroll();
    // Reads scrollHeight (a layout flush) and then writes a transform. Doing that
    // per scroll event thrashes layout; once per frame is all the bar can show.
    var onScrollFramed = onFrame(onScroll);
    window.addEventListener('scroll', onScrollFramed, { passive: true });
    window.addEventListener('resize', onScrollFramed, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  var toggle = $('#nav-toggle');
  var mobile = $('#nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobile.hidden = open;
      document.body.style.overflow = open ? '' : 'hidden';
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.hidden = true;
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobile.hidden) toggle.click();
    });
  }

  /* ---------- sticky bottom CTA (mobile) ----------
     Appears once the hero CTA has scrolled away, hides again over the footer so
     it never covers the closing call to action. */
  var sticky = $('#sticky-cta');
  if (sticky) {
    var foot = $('.final-cta') || $('.site-foot');
    var stickyScroll = function () {
      var past = window.scrollY > 620;
      var atEnd = foot ? foot.getBoundingClientRect().top < window.innerHeight : false;
      sticky.hidden = !(past && !atEnd);
    };
    stickyScroll();
    // getBoundingClientRect forces a layout flush, so this reads once a frame.
    window.addEventListener('scroll', onFrame(stickyScroll), { passive: true });
  }

  /* ---------- hero board: cursor tilt ----------
     Desktop and motion-safe only. The board already rests at a 3D angle in CSS;
     this just steers it a few degrees toward the cursor so the depth reads as
     real rather than as a static skew. Writes two custom properties and lets
     the compositor do the rest — no layout, no per-frame style recalc. */
  var board = $('#lineup');
  if (board && !reduced && window.matchMedia('(min-width: 861px) and (pointer: fine)').matches) {
    var stage = board.parentNode;
    var tilting = false;
    var pending = null;

    var apply = function () {
      tilting = false;
      if (!pending) return;
      board.style.setProperty('--tilt-y', pending.y.toFixed(2) + 'deg');
      board.style.setProperty('--tilt-x', pending.x.toFixed(2) + 'deg');
    };

    stage.addEventListener(
      'pointermove',
      function (e) {
        var r = stage.getBoundingClientRect();
        // -1..1 from the centre of the board.
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        pending = { y: dx * 12, x: 7 - dy * 6 };
        board.classList.add('is-tracking');
        if (!tilting) {
          tilting = true;
          requestAnimationFrame(apply);
        }
      },
      { passive: true }
    );

    // Ease back to the resting pose on the way out.
    stage.addEventListener('pointerleave', function () {
      board.classList.remove('is-tracking');
      board.style.removeProperty('--tilt-y');
      board.style.removeProperty('--tilt-x');
    });
  }

  /* ---------- diagram scroll affordance ----------
     Below ~620px the editorial diagrams scroll sideways inside their figure.
     Flag the ones that actually overflow so the edge fade only ever appears
     when there is genuinely more diagram to the right. */
  $$('.art').forEach(function (fig) {
    var canvas = $('.art-canvas', fig);
    if (!canvas) return;
    var sync = function () {
      var over = canvas.scrollWidth - canvas.clientWidth;
      fig.classList.toggle('is-overflowing', over > 2);
      fig.classList.toggle('at-start', canvas.scrollLeft <= 2);
      fig.classList.toggle('at-end', canvas.scrollLeft >= over - 2);
    };
    sync();
    var syncOnFrame = onFrame(sync);
    canvas.addEventListener('scroll', syncOnFrame, { passive: true });
    window.addEventListener('resize', syncOnFrame, { passive: true });
    // Fonts land after first paint and change the measurement.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  });

  /* ---------- scroll reveals ---------- */
  var revealables = $$('.reveal, .reveal-stagger');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    revealables.forEach(function (el) { io.observe(el); });
    requestAnimationFrame(function () {
      revealables.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('in');
      });
    });
  }

  /* ---------- the hero lineup board ----------
     Cards walk Ideas → Drafts → Calendar → Approved → Published, one hop per
     tick, so the workflow the copy describes is the thing you actually watch. */
  var lineup = $('#lineup');
  if (lineup) {
    var STAGES = ['idea', 'draft', 'calendar', 'approved', 'published'];
    var slots = {};
    STAGES.forEach(function (id) {
      var col = $('.lu-col[data-stage="' + id + '"]', lineup);
      slots[id] = col ? $('.lu-slot', col) : null;
    });

    var pool = [];
    try { pool = JSON.parse(lineup.getAttribute('data-pool') || '[]'); } catch (e) { pool = []; }
    var poolAt = 0;

    var CH_LABEL = { blog: 'Blog', linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram' };

    var countEls = {};
    STAGES.forEach(function (id) {
      var col = $('.lu-col[data-stage="' + id + '"]', lineup);
      countEls[id] = col ? $('.lu-count', col) : null;
    });

    var counts = function () {
      STAGES.forEach(function (id) {
        if (!countEls[id] || !slots[id]) return;
        // A card on its way out is position:absolute but still a child, so it
        // would otherwise keep being counted while it fades.
        var live = 0;
        for (var c = slots[id].firstElementChild; c; c = c.nextElementSibling) {
          if (!c.classList.contains('lu-exit')) live++;
        }
        countEls[id].textContent = String(live);
      });
    };

    var makeCard = function (d) {
      var tpl = $('.lu-card', lineup);
      if (!tpl) return null;
      var el = tpl.cloneNode(true);
      el.className = 'lu-card tone-' + d.tone;
      el.setAttribute('data-channel', d.c);
      var brand = $('.lu-brand', el);
      if (brand) brand.innerHTML = '<span class="lu-av">' + d.i + '</span>' + d.b;
      var ch = $('.lu-ch span', el);
      if (ch) ch.textContent = CH_LABEL[d.c] || d.c;
      var title = $('.lu-title', el);
      if (title) title.textContent = d.t;
      var footEl = $('.lu-card-foot', el);
      if (footEl) footEl.hidden = true;
      // The template may have been mid-tilt when it was cloned.
      el.removeAttribute('style');
      return el;
    };

    /* Takes a card out of flow at the exact spot it already occupies, so the
       fade-out costs nothing in layout. One measured read, then one write. */
    var retire = function (card) {
      var top = card.offsetTop;
      var h = card.offsetHeight;
      card.style.top = top + 'px';
      card.style.height = h + 'px';
      card.classList.add('lu-exit');
      counts();
      onAnimEnd(card, function () {
        if (card.parentNode) card.parentNode.removeChild(card);
      });
    };

    var cursor = 0;
    // One hop at a time. Without this an interval tick landing on a slow frame
    // could start a second hop over the first, and the two would fight over the
    // same card's classes.
    var moving = false;

    var advance = function () {
      if (moving) return;
      var i = 3 - (cursor % 4);
      var from = slots[STAGES[i]];
      var to = slots[STAGES[i + 1]];
      cursor++;
      if (!from || !to) return;

      // Skip cards already on their way out of the board.
      var card = from.lastElementChild;
      while (card && card.classList.contains('lu-exit')) card = card.previousElementSibling;
      if (!card) return;

      moving = true;
      card.classList.add('lu-leaving');

      onAnimEnd(card, function () {
        card.classList.remove('lu-leaving');
        to.insertBefore(card, to.firstChild);
        card.classList.add('lu-entering');
        if (STAGES[i + 1] === 'published') {
          var f = $('.lu-card-foot', card);
          if (f) f.hidden = false;
        }
        onAnimEnd(card, function () {
          card.classList.remove('lu-entering');
          moving = false;
        });

        // Retire the oldest published card and feed a fresh idea in at the top.
        var pub = slots.published;
        if (pub && pub.querySelectorAll('.lu-card:not(.lu-exit)').length > 3) {
          var old = pub.lastElementChild;
          while (old && old.classList.contains('lu-exit')) old = old.previousElementSibling;
          if (old) retire(old);
        }
        if (STAGES[i] === 'idea' && pool.length) {
          var fresh = makeCard(pool[poolAt % pool.length]);
          poolAt++;
          if (fresh && slots.idea) {
            fresh.classList.add('lu-entering');
            slots.idea.appendChild(fresh);
            onAnimEnd(fresh, function () { fresh.classList.remove('lu-entering'); });
          }
        }
        counts();
      });
    };

    var timer = null;
    var inView = false;
    // Both conditions are checked here rather than at the call sites, because
    // the visibilitychange handler used to call start() unconditionally and so
    // restarted the board while it was scrolled well off screen.
    var start = function () {
      if (timer || reduced || !inView || document.hidden) return;
      timer = window.setInterval(advance, 2000);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };

    if (!reduced) {
      onView(lineup, function (visible) { inView = visible; visible ? start() : stop(); }, { threshold: 0.25 });
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    }

  }

  /* ---------- the tour: product screens follow the copy you are reading ---------- */
  var tour = $('#tour-grid');
  if (tour) {
    var steps = $$('.tour-step', tour);
    var shots = $$('.tour-shot', tour);
    var pips = $$('.tour-pip', tour);
    var urlEl = $('#tour-url');
    var URLS = {
      idea: 'app.contentlineup.com / ideas',
      generate: 'app.contentlineup.com / editor',
      calendar: 'app.contentlineup.com / calendar',
      approve: 'app.contentlineup.com / approvals',
      publish: 'app.contentlineup.com / publishing',
    };
    var current = '';
    var setStage = function (id) {
      if (!id || id === current) return;
      current = id;
      steps.forEach(function (s) { s.classList.toggle('is-on', s.dataset.step === id); });
      shots.forEach(function (s) { s.classList.toggle('is-on', s.dataset.shot === id); });
      pips.forEach(function (p) { p.classList.toggle('is-on', p.dataset.pip === id); });
      if (urlEl && URLS[id]) urlEl.textContent = URLS[id];
    };

    // Whichever step sits nearest the middle of the viewport wins. Reading the
    // entries in callback order picks the wrong one when several cross at once
    // (a fast scroll, or jumping straight to an anchor).
    var pickNearest = function () {
      var mid = window.innerHeight / 2;
      var best = null;
      var bestDist = Infinity;
      steps.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = s; }
      });
      if (best) setStage(best.dataset.step);
    };

    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(pickNearest, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
      steps.forEach(function (s) { tio.observe(s); });
    }
    // A cheap scroll fallback keeps it correct during momentum scrolling too.
    var tourTicking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (tourTicking) return;
        tourTicking = true;
        requestAnimationFrame(function () { pickNearest(); tourTicking = false; });
      },
      { passive: true }
    );

    // The rail doubles as navigation.
    pips.forEach(function (pip) {
      pip.addEventListener('click', function () {
        var target = $('.tour-step[data-step="' + pip.dataset.pip + '"]', tour);
        if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      });
    });
  }

  /* ---------- "type an idea" demo ----------
     Pre-computed responses. It is a taste of the first screen, and it says so. */
  var idemo = $('#idea-demo');
  if (idemo) {
    var presets = [];
    try { presets = JSON.parse(idemo.getAttribute('data-presets') || '[]'); } catch (e2) { presets = []; }
    var input = $('#idea-demo-input');
    var out = $('#idea-demo-out');
    var titleOut = $('[data-out="title"]', out);
    var hooksOut = $('[data-out="hooks"]', out);
    var datesOut = $('[data-out="dates"]', out);

    var titleCase = function (s) {
      var small = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs'];
      return s
        .trim()
        .split(/\s+/)
        .map(function (w, i) {
          var lower = w.toLowerCase();
          if (i && small.indexOf(lower) > -1) return lower;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
    };

    var fallback = function (text) {
      var t = titleCase(text);
      return {
        title: t + ': A Practical Guide',
        hooks: [
          'Most people get ' + text.toLowerCase() + ' wrong in the same three ways.',
          'Here is the short version of ' + text.toLowerCase() + ', without the filler.',
        ],
        dates: ['Blog · Tue 09:00', 'LinkedIn · Tue 09:00', 'Facebook · Thu 10:00'],
      };
    };

    var render = function (data) {
      if (!reduced) out.classList.add('is-updating');
      window.setTimeout(
        function () {
          titleOut.textContent = data.title;
          hooksOut.innerHTML = data.hooks
            .map(function (h) { return '<li>' + h.replace(/[<>&]/g, '') + '</li>'; })
            .join('');
          datesOut.innerHTML = data.dates
            .map(function (d) { return '<span class="idemo-date">' + d.replace(/[<>&]/g, '') + '</span>'; })
            .join('');
          out.classList.remove('is-updating');
        },
        reduced ? 0 : 240
      );
    };

    $$('.idemo-preset', idemo).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = presets[Number(b.dataset.preset)];
        if (!d) return;
        $$('.idemo-preset', idemo).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        if (input) input.value = d.idea;
        render(d);
      });
    });

    var form = $('#idea-demo-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = (input && input.value || '').trim();
        if (!text) return;
        var hit = presets.filter(function (p) { return p.idea.toLowerCase() === text.toLowerCase(); })[0];
        $$('.idemo-preset', idemo).forEach(function (o) {
          o.setAttribute('aria-pressed', String(!!hit && presets[Number(o.dataset.preset)] === hit));
        });
        render(hit || fallback(text));
      });
    }
  }

  /* ---------- AI revision demo ---------- */
  var aidemo = $('#ai-demo');
  if (aidemo) {
    var textEl = $('#ai-demo-text');
    var original = textEl ? textEl.textContent : '';
    var instructions = [];
    try { instructions = JSON.parse(aidemo.getAttribute('data-instructions') || '[]'); } catch (e3) { instructions = []; }

    var swap = function (next, btnEl) {
      $$('.aidemo-btn', aidemo).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btnEl)); });
      if (reduced) { textEl.textContent = next; return; }
      aidemo.classList.add('is-writing');
      window.setTimeout(function () {
        textEl.textContent = next;
        aidemo.classList.remove('is-writing');
        aidemo.classList.add('is-written');
        window.setTimeout(function () { aidemo.classList.remove('is-written'); }, 700);
      }, 420);
    };

    var tableEl = $('#ai-demo-table');
    var manualEl = $('#ai-demo-manual');
    var askEl = $('.aidemo-ask', aidemo);

    // The "comparison table" instruction inserts a real table into the draft;
    // every other instruction hides it again, because the draft it describes
    // no longer contains one.
    var showTable = function (on) {
      if (tableEl) tableEl.hidden = !on;
    };

    $$('.aidemo-btn', aidemo).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.ins === 'reset') { swap(original, null); showTable(false); return; }
        var ins = instructions[Number(b.dataset.ins)];
        if (!ins) return;
        swap(ins.result, b);
        showTable(ins.id === 'table');
      });
    });

    /* Editor mode: "Generate with AI" vs "Write manually". Manual is a genuinely
       blank page — no AI copy, and the revision buttons are disabled, because
       there is nothing generated to revise. */
    var modes = $$('.aidemo-mode', aidemo);
    var setMode = function (mode) {
      var manual = mode === 'manual';
      modes.forEach(function (m) {
        var on = m.dataset.mode === mode;
        m.classList.toggle('is-on', on);
        m.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      aidemo.classList.toggle('is-manual', manual);
      if (textEl) textEl.hidden = manual;
      if (manualEl) manualEl.hidden = !manual;
      showTable(false);
      if (!manual) swap(original, null);
      if (askEl) askEl.setAttribute('aria-hidden', manual ? 'true' : 'false');
      $$('.aidemo-btn', aidemo).forEach(function (b) { b.disabled = manual; });
      track('AI demo mode', { mode: mode });
    };
    modes.forEach(function (m) {
      m.addEventListener('click', function () { setMode(m.dataset.mode); });
    });
  }

  /* ---------- campaign list: rows advance ----------
     The board and the publishing queue both move; this table was the one place
     showing content states that sat completely still. Same idea as the queue —
     one row at a time steps Draft -> In review -> Scheduled -> Published — so
     the three views tell the same story at the same tempo.

     Only rows in the visible account panel are touched, and the interval is
     stopped when the section scrolls out of view or the tab is hidden. */
  var tree = $('.tree');
  if (tree && !reduced) {
    var TREE_ORDER = ['draft', 'review', 'scheduled', 'published'];
    var TREE_LABEL = { draft: 'Draft', review: 'In review', scheduled: 'Scheduled', published: 'Published' };
    var treeCursor = 0;
    var treeTimer = null;

    var treeAdvance = function () {
      var panel = $$('.tree-panel', tree).filter(function (pn) { return !pn.hidden; })[0];
      if (!panel) return;
      var items = $$('.tree-item', panel);
      if (!items.length) return;

      var row = items[treeCursor % items.length];
      treeCursor++;
      var pill = $('.state', row);
      if (!pill) return;

      var current = (pill.className.match(/state-([a-z]+)/) || [])[1] || 'draft';
      var next = TREE_ORDER[(TREE_ORDER.indexOf(current) + 1) % TREE_ORDER.length];

      pill.className = 'state state-' + next;
      pill.innerHTML = '<span class="tick"></span>' + TREE_LABEL[next];
      // Restart the flash: remove, force reflow, re-add.
      row.classList.remove('is-moved');
      void row.offsetWidth;
      row.classList.add('is-moved');
    };

    var treeStart = function () { if (!treeTimer) treeTimer = window.setInterval(treeAdvance, 2600); };
    var treeStop = function () { window.clearInterval(treeTimer); treeTimer = null; };
    onView(tree, function (visible) { visible ? treeStart() : treeStop(); }, { threshold: 0.25 });
    document.addEventListener('visibilitychange', function () { document.hidden ? treeStop() : treeStart(); });
  }

  /* ---------- animated counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    counters.forEach(function (el) {
      var target = Number(el.dataset.count);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var final = el.textContent;
      if (reduced || !isFinite(target)) return;
      onView(
        el,
        function (visible, obs, node) {
          if (!visible) return;
          if (obs) obs.unobserve(node);
          var t0 = null;
          var dur = 1100;
          var step = function (ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            var v = Math.round(target * eased);
            el.textContent = p < 1 ? prefix + v.toLocaleString('en-US') + suffix : final;
            if (p < 1) requestAnimationFrame(step);
          };
          el.textContent = prefix + '0' + suffix;
          requestAnimationFrame(step);
        },
        { threshold: 0.5 }
      );
    });
  }

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(function (group) {
    var buttons = $$('[role="tab"]', group);
    var panels = $$('[role="tabpanel"]', group);

    var select = function (id, focus) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('aria-controls') === id;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panels.forEach(function (pn) {
        var on = pn.id === id;
        pn.hidden = !on;
        if (on && !reduced) {
          pn.classList.remove('panel-in');
          void pn.offsetWidth;
          pn.classList.add('panel-in');
        }
      });
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('aria-controls')); });
    });

    group.addEventListener('keydown', function (e) {
      if (e.target.getAttribute('role') !== 'tab') return;
      var i = buttons.indexOf(e.target);
      var n = null;
      var vertical = group.querySelector('[aria-orientation="vertical"]');
      var nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      var prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      if (e.key === nextKey || e.key === 'ArrowRight') n = (i + 1) % buttons.length;
      else if (e.key === prevKey || e.key === 'ArrowLeft') n = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = buttons.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(buttons[n].getAttribute('aria-controls'), true);
    });
  });

  /* ---------- FAQ: animate the close, the browser handles the open ---------- */
  $$('.faq-item').forEach(function (item) {
    var summary = $('summary', item);
    if (!summary) return;
    summary.addEventListener('click', function (e) {
      if (!item.open || reduced) return;
      e.preventDefault();
      item.classList.add('collapsing');
      var done = function () {
        item.classList.remove('collapsing');
        item.open = false;
        item.removeEventListener('transitionend', done);
      };
      item.addEventListener('transitionend', done);
      window.setTimeout(function () { if (item.classList.contains('collapsing')) done(); }, 400);
    });
  });

  /* ---------- resources filter ---------- */
  var filters = $('#post-filters');
  if (filters) {
    var cards = $$('[data-category]');
    var empty = $('#no-results');
    var apply = function (cat) {
      var shown = 0;
      cards.forEach(function (c) {
        var on = cat === 'all' || c.dataset.category === cat;
        c.hidden = !on;
        if (on) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      $$('button', filters).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.filter === cat));
      });
      var url = cat === 'all' ? location.pathname : location.pathname + '#' + cat;
      history.replaceState(null, '', url);
    };

    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (b) apply(b.dataset.filter);
    });

    var hash = location.hash.replace('#', '');
    if (hash && $$('button[data-filter="' + hash + '"]', filters).length) apply(hash);
  }

  /* ---------- legacy publishing queue (deeper pages) ---------- */
  var queue = $('#queue');
  if (queue) {
    var ORDER = ['draft', 'scheduled', 'published'];
    var rows = $$('.q-row', queue);
    var bar = $('#queue-bar');
    var qcursor = 0;
    var qtimer = null;

    var qadvance = function () {
      var row = rows[qcursor % rows.length];
      var at = ORDER.indexOf(row.dataset.state);
      var next = ORDER[(at + 1) % ORDER.length];

      if (next === 'draft') {
        var qpool = (queue.dataset.pool || '').split('|').filter(Boolean);
        if (qpool.length) {
          var pick = qpool[Math.floor(Math.random() * qpool.length)].split('::');
          $('.q-name', row).textContent = pick[0];
          var kw = $('.q-kw', row);
          if (kw && pick[1]) kw.textContent = pick[1];
        }
      }

      row.dataset.state = next;
      $('.q-state-label', row).textContent = next.charAt(0).toUpperCase() + next.slice(1);
      row.classList.remove('flip');
      void row.offsetWidth;
      row.classList.add('flip');

      var published = rows.filter(function (r) { return r.dataset.state === 'published'; }).length;
      if (bar) bar.style.width = Math.round((published / rows.length) * 100) + '%';
      qcursor++;
    };

    if (!reduced) {
      onView(
        queue,
        function (visible) {
          if (visible && !qtimer) qtimer = window.setInterval(qadvance, 2100);
          if (!visible && qtimer) { window.clearInterval(qtimer); qtimer = null; }
        },
        { threshold: 0.25 }
      );
    }

  }

  /* ---------- subtle hero parallax (desktop, motion-safe) ---------- */
  var parallax = $$('[data-parallax]');
  if (parallax.length && !reduced && window.matchMedia('(min-width: 1080px)').matches) {
    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          parallax.forEach(function (el) {
            var rate = parseFloat(el.dataset.parallax) || 0.04;
            el.style.transform = 'translate3d(0,' + (-y * rate).toFixed(2) + 'px,0)';
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }
})();
