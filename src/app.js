/* ContentLineup — site interactions.
   No dependencies, ~5KB. Everything degrades to working HTML without it. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- sticky header ---------- */
  var head = $('#site-head');
  if (head) {
    var onScroll = function () {
      head.classList.toggle('stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
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
    // Anything already above the fold on load reveals immediately.
    requestAnimationFrame(function () {
      revealables.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('in');
      });
    });
  }

  /* ---------- animated publishing queue ---------- */
  var queue = $('#queue');
  if (queue) {
    var ORDER = ['draft', 'scheduled', 'published'];
    var rows = $$('.q-row', queue);
    var bar = $('#queue-bar');
    var cursor = 0;
    var running = false;
    var timer = null;

    var advance = function () {
      var row = rows[cursor % rows.length];
      var at = ORDER.indexOf(row.dataset.state);
      var next = ORDER[(at + 1) % ORDER.length];

      // A published row cycles back to draft as a fresh brief from the pool.
      if (next === 'draft') {
        var pool = (queue.dataset.pool || '').split('|').filter(Boolean);
        if (pool.length) {
          var pick = pool[Math.floor(Math.random() * pool.length)].split('::');
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

      cursor++;
    };

    var start = function () {
      if (running || reduced) return;
      running = true;
      timer = setInterval(advance, 2100);
    };
    var stop = function () {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
    };

    if (!reduced) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(
          function (entries) {
            entries[0].isIntersecting ? start() : stop();
          },
          { threshold: 0.25 }
        ).observe(queue);
      } else {
        start();
      }
      document.addEventListener('visibilitychange', function () {
        document.hidden ? stop() : start();
      });
    }

    // Live clock in the queue header keeps the "it runs without you" idea concrete.
    var clock = $('#queue-clock');
    if (clock) {
      var tick = function () {
        var d = new Date();
        clock.textContent =
          String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' local';
      };
      tick();
      setInterval(tick, 30000);
    }
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
      panels.forEach(function (p) { p.hidden = p.id !== id; });
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('aria-controls')); });
    });

    group.addEventListener('keydown', function (e) {
      if (e.target.getAttribute('role') !== 'tab') return;
      var i = buttons.indexOf(e.target);
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % buttons.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + buttons.length) % buttons.length;
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
      setTimeout(function () { if (item.classList.contains('collapsing')) done(); }, 400);
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
