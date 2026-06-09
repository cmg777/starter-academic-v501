---
# ネイティブ hero の日本語版（content/home/hero2-new.md のミラー）。
# このセクションは SCSS #hero2-new と下記のインラインスクリプトを共有し、
# テキストのみを翻訳しています。タイトルの隠しリンク（Canva へのイースター
# エッグ）は維持しています。実装メモは英語版ファイルを参照してください。

widget: blank

# このウィジェットを有効にする？ true/false
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
    <h1 class="hero-title"><a class="hero-title-link" href="https://canva.link/hhrue9c5aogivjn" target="_blank" rel="noopener">開発の地理学</a></h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle" data-rotate="地理空間ビッグデータ|開発経済学|空間計量経済学|因果機械学習" aria-label="地理空間ビッグデータ、開発経済学、空間計量経済学、因果機械学習からの視点">地理空間ビッグデータ、開発経済学、空間計量経済学、因果機械学習からの視点</p>
  </div>

  <div class="hero-glass-card hero-glass-card--tagline hero-glass-card--delay-2">
    <p class="hero-tagline">開発がいつ・どこで・なぜ起こるのか&hellip;</p>
  </div>

  <div class="hero-glass-card hero-glass-card--author hero-glass-card--delay-3">
    <p class="hero-author-name">カルロス・メンデス</p>
    <p class="hero-author-affiliation">国際開発研究科<br>名古屋大学（日本）</p>
  </div>

  <a href="#about" class="hero-scroll-indicator" aria-label="プロフィールへスクロール">
    <span class="hero-scroll-label">スクロール</span>
    <span class="hero-scroll-chevron" aria-hidden="true">&#9662;</span>
  </a>
</div>

<script>
  (function () {
    var hero = document.getElementById('hero2-new');
    if (!hero) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;

    /* ---- カーソルのパララックス：カード＋背景のカウンターパララックス (C1) ---- */
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
          /* 背景はカーソルと逆方向に動き、奥行きを演出する */
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

    /* ---- B2: 研究の柱を回転表示（動きのみ） ---- */
    if (!reduce) {
      var sub = hero.querySelector('.hero-subtitle[data-rotate]');
      if (sub) {
        var items = sub.getAttribute('data-rotate').split('|');
        if (items.length > 1) {
          sub.textContent = '';
          var lead = document.createElement('span');
          lead.className = 'hero-subtitle-lead';
          lead.textContent = '研究テーマ：';
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
