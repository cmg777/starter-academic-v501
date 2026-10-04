/* Cinematic layer for the landing page: a depth starfield, pointer-driven 3D,
 * scroll reveals, network arcs on the globe, and a coverflow gallery.
 * Everything here is decorative. Without this script, or with reduced motion,
 * the page stays complete and still. Rendering pauses in background tabs.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DPR = () => Math.min(window.devicePixelRatio || 1, 1.5);
  root.classList.add('cinema');

  /* ---------- Shared pointer state (normalized to -1…1, eased) ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: innerWidth / 2, py: innerHeight / 3 };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    pointer.tx = e.clientX / innerWidth * 2 - 1;
    pointer.ty = e.clientY / innerHeight * 2 - 1;
    pointer.px = e.clientX; pointer.py = e.clientY;
    root.style.setProperty('--sx', e.clientX + 'px');
    root.style.setProperty('--sy', e.clientY + 'px');
  }, { passive: true });

  /* ---------- Scroll progress, header state, hero parallax ---------- */
  const bar = document.querySelector('.scroll-progress span');
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const stage = hero && hero.querySelector('.earth-stage');
  const scanner = stage && stage.querySelector('.orbits-front .orbit-a .satellite');
  const beam = stage && stage.querySelector('.observation-beam');
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (hero) {
      const exit = reduce.matches ? 0 : clamp(y / hero.offsetHeight, 0, 1);
      hero.style.setProperty('--hs', exit.toFixed(3));
      root.style.setProperty('--hero-exit', exit.toFixed(3));
    }
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Deep-space starfield (fixed, behind everything) ---------- */
  const cosmos = document.querySelector('.cosmos');
  const ctx = cosmos && cosmos.getContext('2d');
  let stars = [], meteors = [], W = 0, H = 0, running = false, last = 0, nextMeteor = 4000, nextBeamMeasure = 0;
  const sprite = document.createElement('canvas');
  (() => {
    sprite.width = sprite.height = 32;
    const s = sprite.getContext('2d'), g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, 'rgba(220,235,255,.85)');
    g.addColorStop(.45, 'rgba(136,185,222,.18)'); g.addColorStop(1, 'rgba(136,185,222,0)');
    s.fillStyle = g; s.fillRect(0, 0, 32, 32);
  })();
  function seedStars() {
    const count = Math.round(clamp(W * H / 4600, 110, 420));
    stars = Array.from({ length: count }, () => ({
      x: (Math.random() * 2 - 1) * 1.4, y: (Math.random() * 2 - 1) * 1.1, z: Math.random(),
      tw: Math.random() * Math.PI * 2, gold: Math.random() < .08
    }));
  }
  function sizeCosmos() {
    if (!ctx) return;
    const d = DPR();
    W = innerWidth; H = innerHeight;
    cosmos.width = Math.round(W * d); cosmos.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    seedStars(); drawCosmos(performance.now(), 0);
  }
  function drawCosmos(time, dt) {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, f = Math.max(W, H) * .62;
    const travel = scrollY * .00022 + time * .000006;          // scrolling flies the camera forward
    const ox = pointer.x * .05, oy = pointer.y * .035;
    for (const s of stars) {
      let z = (s.z - travel) % 1; if (z < 0) z += 1;
      const depth = .08 + z * 1.6;
      const sx = cx + (s.x - ox * (1.7 - z)) / depth * f * .5;
      const sy = cy + (s.y - oy * (1.7 - z)) / depth * f * .5;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const near = 1 - z;
      const twinkle = reduce.matches ? 1 : .72 + .28 * Math.sin(time * .0016 + s.tw);
      const size = (.9 + near * near * 5.2);
      ctx.globalAlpha = clamp((.18 + near * .82) * twinkle * Math.min(1, z * 14), 0, 1);
      if (size < 2.2) { ctx.fillStyle = s.gold ? '#e9c184' : '#c9d8e8'; ctx.fillRect(sx, sy, size * .55, size * .55); }
      else ctx.drawImage(sprite, sx - size, sy - size, size * 2, size * 2);
    }
    // Rare meteors with a fading tail.
    if (!reduce.matches) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        nextMeteor = 5000 + Math.random() * 9000;
        meteors.push({ x: W * (.25 + Math.random() * .7), y: H * Math.random() * .35, vx: -(.6 + Math.random() * .5), vy: .32 + Math.random() * .2, life: 1 });
      }
      meteors = meteors.filter(m => m.life > 0);
      for (const m of meteors) {
        m.x += m.vx * dt * .9; m.y += m.vy * dt * .9; m.life -= dt / 1300;
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 160, m.y - m.vy * 160);
        tail.addColorStop(0, `rgba(255,240,215,${.85 * m.life})`); tail.addColorStop(1, 'rgba(136,185,222,0)');
        ctx.globalAlpha = 1; ctx.strokeStyle = tail; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 160, m.y - m.vy * 160); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- One animation loop for pointer easing + stars ---------- */
  function placeObservationBeam(time) {
    if (!beam || !scanner || !stage || !fine.matches || time < nextBeamMeasure) return;
    nextBeamMeasure = time + 66;
    const frameRect = stage.getBoundingClientRect(), satelliteRect = scanner.getBoundingClientRect();
    const x = satelliteRect.left + satelliteRect.width * .48 - frameRect.left;
    const y = satelliteRect.top + satelliteRect.height * .52 - frameRect.top;
    const targetX = frameRect.width * .5, targetY = frameRect.height * .5;
    beam.style.setProperty('--beam-x', `${x.toFixed(1)}px`);
    beam.style.setProperty('--beam-y', `${y.toFixed(1)}px`);
    beam.style.setProperty('--beam-length', `${Math.hypot(targetX - x, targetY - y).toFixed(1)}px`);
    beam.style.setProperty('--beam-angle', `${Math.atan2(targetY - y, targetX - x).toFixed(4)}rad`);
  }

  function frame(time) {
    if (!running) return;
    const dt = last ? Math.min(time - last, 50) : 16; last = time;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * .004);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * .004);
    if (hero) { hero.style.setProperty('--hx', pointer.x.toFixed(4)); hero.style.setProperty('--hy', pointer.y.toFixed(4)); }
    placeObservationBeam(time);
    if (ctx) drawCosmos(time, dt);
    requestAnimationFrame(frame);
  }
  function start() { if (running || reduce.matches || document.hidden) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop() { running = false; }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reduce.addEventListener('change', () => {
    if (reduce.matches) { stop(); hero && hero.style.setProperty('--hs', 0); if (ctx) drawCosmos(0, 0); } else start();
  });
  if (ctx) { sizeCosmos(); addEventListener('resize', sizeCosmos, { passive: true }); }
  start();

  /* ---------- Scroll reveals ---------- */
  const revealGroups = [
    ['.section-intro, .section-heading, .about-copy, .contact-intro, .contact-details', 0],
    ['.research-card, .content-card, .publication-row, .talk-list > a, .member-card, .portrait-wrap, .gallery-track, .courses-link', 1]
  ];
  const revealables = [];
  for (const [selector, stagger] of revealGroups) {
    document.querySelectorAll(selector).forEach(el => {
      if (el.closest('.hero')) return;
      const siblings = stagger ? [...el.parentElement.children].filter(c => c.matches(selector)) : [el];
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 9) * 70}ms`);
      el.setAttribute('data-reveal', '');
      revealables.push(el);
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target; el.classList.add('is-in'); io.unobserve(el);
      setTimeout(() => el.classList.add('settled'), 1400);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealables.forEach(el => io.observe(el));
  } else revealables.forEach(el => el.classList.add('is-in', 'settled'));

  /* ---------- 3D tilt with moving glare ---------- */
  const tiltTargets = document.querySelectorAll('.research-card, .content-card .card-image, .portrait-frame, .publication-thumbnail, .talk-list .item-thumbnail');
  tiltTargets.forEach(el => {
    el.classList.add('tilt');
    if (el.tagName !== 'IMG') { const glare = document.createElement('span'); glare.className = 'glare'; glare.setAttribute('aria-hidden', 'true'); el.appendChild(glare); }
    const host = el.closest('.content-card, .publication-row, .talk-list > a') || el;
    let rect = null;
    host.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && fine.matches && !reduce.matches) rect = el.getBoundingClientRect(); });
    host.addEventListener('pointermove', e => {
      if (!rect) return;
      const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1), ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      const max = el.classList.contains('research-card') ? 7 : 10;
      el.style.setProperty('--rx', `${((.5 - ny) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((nx - .5) * max).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(nx * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(ny * 100).toFixed(1)}%`);
      el.classList.add('is-tilting');
    });
    host.addEventListener('pointerleave', () => {
      rect = null; el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.button, .round-link, .gallery-controls button').forEach(el => {
    el.classList.add('magnetic');
    el.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !fine.matches || reduce.matches) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * .28).toFixed(1)}px`);
      el.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * .4).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
  });

  /* ---------- Network arcs projected onto the WebGL globe ----------
   * Nagoya (the lab) linked to the regions its students and studies come from.
   * Projection mirrors the fragment shader in orbital.js exactly. */
  const earth = document.querySelector('[data-earth]');
  const arcs = earth && earth.querySelector('.earth-arcs');
  const actx = arcs && arcs.getContext('2d');
  if (earth && actx) {
    const rad = Math.PI / 180;
    const unit = ([lon, lat]) => [Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad), Math.cos(lat * rad) * Math.cos(lon * rad)];
    const hub = unit([136.9, 35.2]);
    const places = [[106.8, -6.2], [104.9, 11.6], [116.4, 39.9], [-77.0, -12.0], [-74.1, 4.7], [18.4, 43.9], [38.7, 9.0], [100.5, 13.8]].map(unit);
    const routes = places.map((b, i) => {
      const omega = Math.acos(clamp(hub[0] * b[0] + hub[1] * b[1] + hub[2] * b[2], -1, 1));
      const pts = [];
      for (let k = 0; k <= 56; k++) {
        const t = k / 56, s = Math.sin(omega);
        const wa = Math.sin((1 - t) * omega) / s, wb = Math.sin(t * omega) / s;
        const lift = 1 + (.035 + .11 * omega / Math.PI) * Math.sin(Math.PI * t);
        pts.push([(wa * hub[0] + wb * b[0]) * lift, (wa * hub[1] + wb * b[1]) * lift, (wa * hub[2] + wb * b[2]) * lift]);
      }
      return { pts, end: b, phase: i / places.length, speed: .00009 + (i % 3) * .00002 };
    });
    let clock = 0, prev = 0;
    earth.onGlobeDraw = (yaw, pitch, zoom, animated) => {
      const now = performance.now();
      if (animated && prev) clock += Math.min(now - prev, 80);
      prev = now;
      const d = DPR(), cw = arcs.clientWidth, ch = arcs.clientHeight;
      if (!cw) return;
      if (arcs.width !== Math.round(cw * d)) { arcs.width = Math.round(cw * d); arcs.height = Math.round(ch * d); }
      actx.setTransform(d, 0, 0, d, 0, 0); actx.clearRect(0, 0, cw, ch);
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), k = zoom / 1.27;
      const project = v => {
        const gx = v[0] * cy - v[2] * sy, gz = v[2] * cy + v[0] * sy, gy = v[1];
        const nx = gx, ny = gy * cp - gz * sp, nz = gy * sp + gz * cp;
        return { x: (nx * k + 1) / 2 * cw, y: (1 - (ny * k + 1) / 2) * ch, hidden: nz < 0 && nx * nx + ny * ny < 1, front: nz };
      };
      actx.lineCap = 'round';
      for (const r of routes) {
        const pr = r.pts.map(project);
        // Fade each segment out as it turns away towards the limb.
        actx.lineWidth = 1.1;
        for (let j = 1; j < pr.length; j++) {
          const a = pr[j - 1], b = pr[j], f = clamp(Math.min(a.front, b.front) * 5, 0, 1);
          if (f <= 0) continue;
          actx.strokeStyle = `rgba(233,193,132,${(.46 * f).toFixed(3)})`;
          actx.beginPath(); actx.moveTo(a.x, a.y); actx.lineTo(b.x, b.y); actx.stroke();
        }
        // Travelling pulse with a short comet tail.
        const head = ((clock * r.speed + r.phase) % 1) * (pr.length - 1);
        for (let j = 0; j < 9; j++) {
          const idx = Math.floor(head) - j; if (idx < 0) break;
          const p = pr[idx]; if (p.front <= 0) continue;
          actx.globalAlpha = (1 - j / 9) * .95 * clamp(p.front * 5, 0, 1);
          actx.fillStyle = j ? '#e9c184' : '#fff6e6';
          actx.beginPath(); actx.arc(p.x, p.y, j ? 1.6 - j * .12 : 2.3, 0, Math.PI * 2); actx.fill();
        }
        actx.globalAlpha = 1;
        const e = project(r.end);
        if (!e.hidden && e.front > 0) { actx.fillStyle = 'rgba(136,185,222,.9)'; actx.beginPath(); actx.arc(e.x, e.y, 2.2, 0, Math.PI * 2); actx.fill(); }
      }
      const h = project(hub);
      if (!h.hidden && h.front > 0) {
        const pulse = (clock % 2400) / 2400;
        actx.strokeStyle = `rgba(233,193,132,${.8 * (1 - pulse)})`; actx.lineWidth = 1.2;
        actx.beginPath(); actx.arc(h.x, h.y, 3 + pulse * 16, 0, Math.PI * 2); actx.stroke();
        actx.fillStyle = '#ffe9c4'; actx.beginPath(); actx.arc(h.x, h.y, 3.2, 0, Math.PI * 2); actx.fill();
      }
    };
  }

  /* ---------- Coverflow depth for the photo gallery ---------- */
  const track = document.querySelector('.gallery-track');
  if (track) {
    const slides = [...track.children];
    let queued = false;
    const paint = () => {
      queued = false;
      const mid = track.scrollLeft + track.clientWidth / 2;
      for (const s of slides) {
        const o = (s.offsetLeft + s.offsetWidth / 2 - mid) / s.offsetWidth;
        const a = clamp(o, -1.6, 1.6), m = Math.min(Math.abs(o), 1.6);
        s.style.setProperty('--o', a.toFixed(3));
        s.style.setProperty('--m', m.toFixed(3));
        s.classList.toggle('is-center', m < .5);
        s.style.zIndex = String(20 - Math.round(m * 6));
      }
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    track.addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue, { passive: true });
    paint(); setTimeout(paint, 300);
  }
})();
