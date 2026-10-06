/* Native scroll snapping keeps the photo collection usable without JavaScript.
 * Slides snap to the centre so neighbours stay visible for the coverflow depth
 * effect (orbital-cinema.js); positions are measured, not assumed full-width. */
(() => {
  'use strict';
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;
  const track = gallery.querySelector('.gallery-track');
  const slides = [...track.children];
  const counter = gallery.querySelector('[data-gallery-current]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const target = i => slides[i].offsetLeft - (track.clientWidth - slides[i].offsetWidth) / 2;
  const nearest = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, gap = Infinity;
    slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (d < gap) { gap = d; best = i; } });
    return best;
  };
  let index = Math.max(0, Math.min(slides.length - 1, Number(gallery.dataset.galleryStart) || 0));
  // Position on the next frame, so measuring never forces a layout during startup.
  requestAnimationFrame(() => track.scrollTo({ left: target(index), behavior: 'auto' }));
  counter.textContent = index + 1;
  const go = next => {
    next = (next + slides.length) % slides.length;
    track.scrollTo({ left: target(next), behavior: reduce.matches || Math.abs(next - index) > 1 ? 'auto' : 'smooth' });
  };
  track.addEventListener('scroll', () => {
    index = nearest();
    counter.textContent = index + 1;
  }, { passive: true });
  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => go(index - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => go(index + 1));
  // Clicking a side photo brings it to the centre.
  slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== index) go(i); }));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const destinations = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    go(destinations[event.key]);
  });
  if (slides.length > 1) gallery.querySelector('.gallery-controls').hidden = false;
})();
