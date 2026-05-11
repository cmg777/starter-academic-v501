---
# PARKED: this is the redesigned hero (Phase 1-6 of the 2026-05-11 hero
# redesign work). Currently INACTIVE. Old Canva-JPG hero in `hero2.md`
# is live instead while title-glyph transparency on macOS is diagnosed.
#
# To re-activate this hero:
#   1. Set `active: true` here
#   2. Set `active: false` in `hero2.md`
#   3. Save — Hugo hot-reloads. The new-hero SCSS in Section 21 of
#      `assets/scss/custom.scss` is scoped to `#hero2-new` so it auto-
#      applies when this widget is active.
#
# Open issue (pending resume): on the user's macOS, title letters render
# as transparent (map visible through letterforms). After seven CSS
# iterations the root cause is suspected to be a macOS Accessibility
# setting (Reduce transparency / Increase contrast / Color filters) or
# a non-Dark-Reader browser extension. See `logs/2026-05-11-hero-native-text.md`
# for the full diagnostic history.

widget: blank

# Activate this widget? true/false
active: false

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
    <h1 class="hero-title" style="color: #ffffff; opacity: 1; -webkit-text-fill-color: #ffffff;">On the Geography of Development</h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle">Insights from Geospatial Big Data, Development Economics, and Spatial Econometrics</p>
  </div>

  <div class="hero-glass-card hero-glass-card--tagline hero-glass-card--delay-2">
    <p class="hero-tagline">When, where and why development occurs&hellip;</p>
  </div>

  <div class="hero-glass-card hero-glass-card--author hero-glass-card--delay-3">
    <p class="hero-author-name">Carlos Mendez</p>
    <div class="hero-social-icons" aria-label="Social profiles">
      <a href="https://orcid.org/0000-0001-7978-2815" target="_blank" rel="noopener" aria-label="ORCID"><i class="ai ai-orcid"></i></a>
      <a href="https://scholar.google.co.jp/citations?user=v9dK0MoAAAAJ&amp;hl=en" target="_blank" rel="noopener" aria-label="Google Scholar"><i class="ai ai-google-scholar"></i></a>
      <a href="https://github.com/cmg777" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
      <a href="https://www.linkedin.com/in/mendezguerra/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
    </div>
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
