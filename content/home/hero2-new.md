---
# LIVE: this is the redesigned native hero (the old Canva-GIF hero in
# `hero2.md` is now `active: false`). The new-hero SCSS is Section 21 of
# `assets/scss/custom.scss`, scoped to `#hero2-new`.
#
# Title-transparency bug — RESOLVED 2026-06-03. The long-standing "title
# letters render transparent (map visible through letterforms)" issue was
# NOT a macOS/extension problem. Root cause: the scroll-driven `heroFadeOut`
# used `animation-timeline: view()`, which bound to `#hero2-new` (it has
# `overflow: hidden` for the Ken Burns bg, making it a scroll container)
# instead of the document. The topmost (title) panel therefore resolved to a
# fixed ~0.43 opacity even at scroll top, so the whole card — navy panel and
# white text — was semi-transparent. Reproduced deterministically in headless
# Chromium by diffing the title panel's computed opacity vs the (solid) lower
# panels. Fix: removed the `heroFadeOut` view-timeline block. See
# `logs/2026-06-03-hero-title-fix.md` (and `logs/2026-05-11-hero-native-text.md`
# for the earlier diagnostic history).
#
# 2026-06-03 — modern/dynamic enhancement pass (Section 21 of custom.scss +
# the inline <script> below): nightlights twinkle canvas painted ON TOP of the
# KEPT websiteCover5.webp (A1), light frosted-glass panels (B5), word-by-word
# blur-in title (B1), drawing underline (B4), rotating research pillars in the
# subtitle (B2), and cursor counter-parallax on the background (C1). The
# background image is intentionally preserved. Still NO `animation-timeline:
# view()` — that was the root cause of the transparent-title bug above.

widget: blank

# Activate this widget? true/false
active: true

headless: true
weight: 02
title:
hero_media:

design:
  background:
    image: websiteCover5.webp
    image_darken: 0
    image_size: cover
    image_position: center
    image_parallax: false
    text_color_light: true
---

<div class="hero-native">
  <div class="hero-glass-card hero-glass-card--title hero-glass-card--delay-1">
    <h1 class="hero-title">
      <span class="hero-title-word">On</span>
      <span class="hero-title-word">the</span>
      <span class="hero-title-word">Geography</span>
      <span class="hero-title-word">of</span>
      <span class="hero-title-word">Development</span>
    </h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle" data-rotate="Geospatial Big Data|Development Economics|Spatial Econometrics" aria-label="Insights from Geospatial Big Data, Development Economics, and Spatial Econometrics">Insights from Geospatial Big Data, Development Economics, and Spatial Econometrics</p>
  </div>

  <div class="hero-glass-card hero-glass-card--tagline hero-glass-card--delay-2">
    <p class="hero-tagline">When, where and why development occurs&hellip;</p>
  </div>

  <div class="hero-glass-card hero-glass-card--author hero-glass-card--delay-3">
    <p class="hero-author-name">Carlos Mendez</p>
    <p class="hero-author-affiliation">Graduate School of International Development<br>Nagoya University, Japan</p>
  </div>

  <a href="#about" class="hero-scroll-indicator" aria-label="Scroll to about section">
    <span class="hero-scroll-label">scroll</span>
    <span class="hero-scroll-chevron" aria-hidden="true">&#9662;</span>
  </a>
</div>

<script>
  (function () {
    var hero = document.getElementById('hero2-new');
    if (!hero) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;

    /* ---- Cursor parallax: cards (existing) + background counter-parallax (C1) ---- */
    if (!reduce && !noHover) {
      var panels = hero.querySelectorAll('.hero-glass-card');
      var mult = [6, 4, 3];
      var raf = null, lx = 0, ly = 0;
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        lx = (e.clientX - r.left) / r.width - 0.5;
        ly = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          for (var i = 0; i < panels.length; i++) {
            var m = mult[i] || 2;
            panels[i].style.setProperty('--px', (lx * m).toFixed(2) + 'px');
            panels[i].style.setProperty('--py', (ly * m).toFixed(2) + 'px');
          }
          /* background drifts OPPOSITE the cursor for depth (image is kept) */
          hero.style.setProperty('--bg-px', (lx * -12).toFixed(2) + 'px');
          hero.style.setProperty('--bg-py', (ly * -12).toFixed(2) + 'px');
        });
      });
      hero.addEventListener('mouseleave', function () {
        for (var j = 0; j < panels.length; j++) {
          panels[j].style.setProperty('--px', '0px');
          panels[j].style.setProperty('--py', '0px');
        }
        hero.style.setProperty('--bg-px', '0px');
        hero.style.setProperty('--bg-py', '0px');
      });
    }

    /* ---- A1: nightlights twinkle canvas (painted ON TOP of the kept photo) ---- */
    if (!reduce) {
      var canvas = document.createElement('canvas');
      canvas.className = 'hero-nightlights';
      canvas.setAttribute('aria-hidden', 'true');
      hero.insertBefore(canvas, hero.firstChild);
      var ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W = 0, H = 0, pts = [], sprites = {};
        var COLORS = [
          ['warm', 'rgba(255,233,194,'],
          ['white', 'rgba(255,255,255,'],
          ['teal', 'rgba(0,212,200,'],
          ['orange', 'rgba(217,119,87,']
        ];

        function makeSprite(prefix) {
          var s = document.createElement('canvas'), sz = 32;
          s.width = s.height = sz;
          var g = s.getContext('2d');
          var rg = g.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
          rg.addColorStop(0, prefix + '1)');
          rg.addColorStop(0.35, prefix + '0.55)');
          rg.addColorStop(1, prefix + '0)');
          g.fillStyle = rg;
          g.fillRect(0, 0, sz, sz);
          return s;
        }

        function build() {
          var r = hero.getBoundingClientRect();
          W = r.width; H = r.height;
          if (!W || !H) return;
          canvas.width = Math.round(W * dpr);
          canvas.height = Math.round(H * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          for (var c = 0; c < COLORS.length; c++) sprites[COLORS[c][0]] = makeSprite(COLORS[c][1]);
          var n = Math.max(26, Math.min(105, Math.round((W * H) / 14500)));
          var cl = [];
          for (var k = 0; k < 4; k++) {
            cl.push({ x: 0.12 + 0.76 * ((k + 0.5) / 4), y: (k % 2) ? 0.62 : 0.34 });
          }
          pts = [];
          for (var i = 0; i < n; i++) {
            var x, y;
            if (Math.random() < 0.58) {
              var a = cl[i % cl.length];
              x = (a.x + (Math.random() - 0.5) * 0.24) * W;
              y = (a.y + (Math.random() - 0.5) * 0.24) * H;
            } else {
              x = Math.random() * W;
              y = Math.random() * H;
            }
            var roll = Math.random();
            var col = roll < 0.6 ? 'warm' : roll < 0.8 ? 'white' : roll < 0.92 ? 'teal' : 'orange';
            pts.push({
              x: x, y: y,
              d: 1.3 + Math.random() * 3.4,
              col: col,
              base: 0.30 + Math.random() * 0.40,
              amp: 0.18 + Math.random() * 0.34,
              sp: 0.0006 + Math.random() * 0.0016,
              ph: Math.random() * Math.PI * 2
            });
          }
        }

        var last = 0, running = false, rafId = null;
        function frame(t) {
          if (!running) return;
          rafId = requestAnimationFrame(frame);
          if (t - last < 55) return;   /* ~18fps is plenty for a slow twinkle */
          last = t;
          ctx.clearRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'lighter';
          for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            var al = p.base + p.amp * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
            if (al <= 0.02) continue;
            var gd = p.d * 4;
            ctx.globalAlpha = al > 1 ? 1 : al;
            ctx.drawImage(sprites[p.col], p.x - gd / 2, p.y - gd / 2, gd, gd);
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
        function startC() { if (!running) { running = true; last = 0; rafId = requestAnimationFrame(frame); } }
        function stopC() { running = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

        build();
        startC();

        var rt;
        window.addEventListener('resize', function () {
          clearTimeout(rt);
          rt = setTimeout(build, 200);
        });
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) stopC(); else startC();
        });
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (es) {
            for (var i = 0; i < es.length; i++) {
              if (es[i].isIntersecting) startC(); else stopC();
            }
          }, { threshold: 0 });
          io.observe(hero);
        }
      }
    }

    /* ---- B2: rotating research pillars (motion only; full text kept otherwise) ---- */
    if (!reduce) {
      var sub = hero.querySelector('.hero-subtitle[data-rotate]');
      if (sub) {
        var items = sub.getAttribute('data-rotate').split('|');
        if (items.length > 1) {
          sub.textContent = '';
          var lead = document.createElement('span');
          lead.className = 'hero-subtitle-lead';
          lead.textContent = 'Insights from';
          var rot = document.createElement('span');
          rot.className = 'hero-rotator';
          rot.setAttribute('aria-hidden', 'true');
          for (var q = 0; q < items.length; q++) {
            var it = document.createElement('span');
            it.className = 'hero-rotator-item' + (q === 0 ? ' is-active' : '');
            it.textContent = items[q];
            rot.appendChild(it);
          }
          sub.appendChild(lead);
          sub.appendChild(rot);
          var ritems = rot.querySelectorAll('.hero-rotator-item');
          var ri = 0;
          setInterval(function () {
            ritems[ri].classList.remove('is-active');
            ri = (ri + 1) % ritems.length;
            ritems[ri].classList.add('is-active');
          }, 2800);
        }
      }
    }
  })();
</script>
