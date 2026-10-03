/* Native scroll snapping keeps the photo collection usable without JavaScript. */
(() => {
  'use strict';
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;
  const track = gallery.querySelector('.gallery-track');
  const slides = [...track.children];
  const counter = gallery.querySelector('[data-gallery-current]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, Math.min(slides.length - 1, Number(gallery.dataset.galleryStart) || 0));
  track.scrollTo({ left: index * track.clientWidth, behavior: 'auto' });
  counter.textContent = index + 1;
  const go = next => {
    next = (next + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduce.matches || Math.abs(next - index) > 1 ? 'auto' : 'smooth' });
  };
  track.addEventListener('scroll', () => {
    index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    counter.textContent = index + 1;
  }, { passive: true });
  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => go(index - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const destinations = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    go(destinations[event.key]);
  });
  if (slides.length > 1) gallery.querySelector('.gallery-controls').hidden = false;
})();
