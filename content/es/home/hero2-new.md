---
# Versión en español del hero nativo (mirror de content/home/hero2-new.md).
# La sección comparte el SCSS #hero2-new y el script en línea de abajo; sólo se
# traduce el texto. El enlace oculto del título (huevo de pascua a Canva) se
# conserva. Consulta el archivo en inglés para las notas de implementación.

widget: blank

# ¿Activar este widget? true/false
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
    <h1 class="hero-title"><a class="hero-title-link" href="https://canva.link/hhrue9c5aogivjn" target="_blank" rel="noopener">Sobre la geografía del desarrollo</a></h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle" data-rotate="Macrodatos geoespaciales|Economía del desarrollo|Econometría espacial|Aprendizaje automático causal" aria-label="Perspectivas desde los macrodatos geoespaciales, la economía del desarrollo, la econometría espacial y el aprendizaje automático causal">Perspectivas desde los macrodatos geoespaciales, la economía del desarrollo, la econometría espacial y el aprendizaje automático causal</p>
  </div>

  <div class="hero-glass-card hero-glass-card--tagline hero-glass-card--delay-2">
    <p class="hero-tagline">Cuándo, dónde y por qué ocurre el desarrollo&hellip;</p>
  </div>

  <div class="hero-glass-card hero-glass-card--author hero-glass-card--delay-3">
    <p class="hero-author-name">Carlos Mendez</p>
    <p class="hero-author-affiliation">Escuela de Posgrado en Desarrollo Internacional<br>Universidad de Nagoya, Japón</p>
  </div>

  <a href="#about" class="hero-scroll-indicator" aria-label="Bajar a la sección de perfil">
    <span class="hero-scroll-label">bajar</span>
    <span class="hero-scroll-chevron" aria-hidden="true">&#9662;</span>
  </a>
</div>

<script>
  (function () {
    var hero = document.getElementById('hero2-new');
    if (!hero) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;

    /* ---- Parallax del cursor: tarjetas + contraparallax del fondo (C1) ---- */
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
          /* el fondo deriva en sentido OPUESTO al cursor para dar profundidad */
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

    /* ---- B2: pilares de investigación tipo máquina de escribir (estilo
       Indonesia514; sólo movimiento, lista completa para reduced-motion) ---- */
    if (!reduce) {
      var sub = hero.querySelector('.hero-subtitle[data-rotate]');
      if (sub) {
        var items = sub.getAttribute('data-rotate').split('|');
        if (items.length > 1) {
          sub.textContent = '';
          var lead = document.createElement('span');
          lead.className = 'hero-subtitle-lead';
          lead.textContent = 'Perspectivas desde';
          var rot = document.createElement('span');
          rot.className = 'hero-rotator';
          rot.setAttribute('aria-hidden', 'true');
          /* sizer invisible = frase más larga, para que la línea centrada no
             se reacomode mientras el texto se escribe y se borra */
          var longest = items[0];
          for (var q = 1; q < items.length; q++) {
            if (items[q].length > longest.length) longest = items[q];
          }
          var sizer = document.createElement('span');
          sizer.className = 'hero-rotator-sizer';
          sizer.textContent = longest;
          var live = document.createElement('span');
          live.className = 'hero-rotator-live';
          var txt = document.createElement('span');
          txt.className = 'hero-rotator-text';
          var cur = document.createElement('span');
          cur.className = 'hero-rotator-cursor';
          cur.textContent = '|';
          live.appendChild(txt);
          live.appendChild(cur);
          rot.appendChild(sizer);
          rot.appendChild(live);
          sub.appendChild(lead);
          sub.appendChild(rot);

          var ti = 0, ci = 0, deleting = false;
          var TYPE = 90, DEL = 45, HOLD = 1800, GAP = 500;
          function tick() {
            var word = items[ti];
            if (!deleting) {
              ci++;
              txt.textContent = word.slice(0, ci);
              if (ci >= word.length) { deleting = true; return setTimeout(tick, HOLD); }
              return setTimeout(tick, TYPE);
            }
            ci--;
            txt.textContent = word.slice(0, ci);
            if (ci <= 0) {
              deleting = false;
              ti = (ti + 1) % items.length;
              return setTimeout(tick, GAP);
            }
            return setTimeout(tick, DEL);
          }
          setTimeout(tick, 600);
        }
      }
    }
  })();
</script>
