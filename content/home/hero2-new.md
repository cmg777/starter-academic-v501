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
# the inline script below): word-by-word blur-in title (B1), drawing underline
# (B4), rotating research pillars in the subtitle (B2), and cursor
# counter-parallax on the KEPT websiteCover5.webp background (C1). Cards stay
# fully transparent. (A nightlights twinkle canvas + frosted-glass panels were
# tried and removed per review.) Still NO `animation-timeline: view()` — that
# was the root cause of the transparent-title bug above.

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
