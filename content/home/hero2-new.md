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
    <h1 class="hero-title">On the Geography of Development</h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle">Insights from Geospatial Big Data, Development Economics, and Spatial Econometrics</p>
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    var hero = document.getElementById('hero2-new');
    if (!hero) return;
    var panels = hero.querySelectorAll('.hero-glass-card');
    var multipliers = [6, 4, 3];
    var raf = null, lastX = 0, lastY = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      lastX = (e.clientX - r.left) / r.width - 0.5;
      lastY = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        panels.forEach(function (p, i) {
          var m = multipliers[i] || 2;
          p.style.setProperty('--px', (lastX * m).toFixed(2) + 'px');
          p.style.setProperty('--py', (lastY * m).toFixed(2) + 'px');
        });
      });
    });
    hero.addEventListener('mouseleave', function () {
      panels.forEach(function (p) {
        p.style.setProperty('--px', '0px');
        p.style.setProperty('--py', '0px');
      });
    });
  })();
</script>
