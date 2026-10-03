// Behavioral checks for the globe's motion, accessibility, and failure lifecycle.
// Run with `node --test tests/orbital.test.cjs`. Rendering is checked in-browser.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/orbital.js'), 'utf8');

function setup({ reduced = false, mobile = false, noWebGL = false, saveData = false } = {}) {
  class Element {
    constructor() { this.hidden = false; this.dataset = {}; this.attrs = {}; this.listeners = {}; this.textContent = ''; this.classList = { add() {}, remove() {} }; }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    fire(name, event = {}) { for (const fn of this.listeners[name] || []) fn(event); }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    getAttribute(key) { return this.attrs[key]; }
    removeAttribute(key) { delete this.attrs[key]; }
    getBoundingClientRect() { return { width: 500 }; }
  }
  const document = new Element(); document.hidden = false;
  const earth = new Element(); earth.dataset = { texture: '/large.jpg', mobileTexture: '/small.jpg' };
  const canvas = new Element(); canvas.hidden = true; canvas.clientWidth = 500;
  canvas.parentElement = new Element(); canvas.setPointerCapture = () => {}; canvas.hasPointerCapture = () => false;
  const fallback = new Element(), controls = new Element(), hint = new Element(), status = new Element();
  controls.hidden = true; hint.textContent = 'Static Asia'; hint.dataset.interactive = 'Drag to explore';
  const pause = new Element(), glyph = new Element(); pause.dataset = { play: 'Start rotation', pause: 'Pause rotation' }; pause.querySelector = () => glyph;
  const buttons = Object.fromEntries(['in', 'out', 'pause', 'east', 'west'].map(k => [k, k === 'pause' ? pause : new Element()]));
  for (const [key, el] of Object.entries(buttons)) { el.dataset.action = key; el.closest = () => el; }
  const regions = ['Asia', 'Europe', 'Americas'].map(text => { const el = new Element(); el.textContent = text; return el; });
  const elements = { canvas, '.earth-fallback': fallback, '.earth-controls': controls, '[data-globe-hint]': hint, '[data-globe-status]': status };
  for (const [key, value] of Object.entries(buttons)) elements[`[data-action="${key}"]`] = value;
  earth.querySelector = selector => elements[selector]; earth.querySelectorAll = () => regions;
  document.querySelector = selector => selector === '[data-earth]' ? earth : null;
  const drawn = [], angles = []; let draws = 0;
  const gl = new Proxy({ getShaderParameter: () => true, getProgramParameter: () => true, getParameter: () => 4096, getError: () => 0, NO_ERROR: 0, getUniformLocation: (_, key) => key, uniform2f: (key, x, y) => { if (key === 'angle') angles.push([x, y]); }, drawArrays: () => { draws++; drawn.push(angles.at(-1)); } }, { get(target, key) { if (key in target) return target[key]; if (key.toUpperCase() === key) return 1; return () => ({}); } });
  canvas.getContext = () => noWebGL ? null : gl;
  const motion = new Element(); motion.matches = reduced;
  const frames = new Map(); let next = 0, time = 0, image, intersection;
  const context = { document, navigator: { connection: { saveData } }, devicePixelRatio: 2,
    matchMedia: query => query.includes('reduced-motion') ? motion : { matches: mobile },
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; }, cancelAnimationFrame: id => frames.delete(id),
    Image: class { constructor() { image = this; } },
    IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} },
    ResizeObserver: class { observe() {} }
  };
  context.window = context; context.addEventListener = () => {};
  vm.runInNewContext(source, context);
  const advance = (n = 150) => { for (let i = 0; i < n && frames.size; i++) { time += 34; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); } };
  return { document, canvas, fallback, controls, hint, status, pause, motion, regions, frames, advance, drawn,
    load: () => image?.onload(), error: () => image?.onerror(), texture: () => image?.src,
    action: key => controls.fire('click', { target: buttons[key] }),
    visibility: shown => intersection([{ isIntersecting: shown }]),
    draws: () => draws
  };
}

test('a device without WebGL retains the readable image and hides unusable controls', () => {
  const s = setup({ noWebGL: true });
  assert.equal(s.canvas.hidden, true); assert.equal(s.controls.hidden, true);
  assert.equal(s.fallback.getAttribute('aria-hidden'), undefined); assert.equal(s.frames.size, 0);
});
test('an image failure returns to the static experience', () => {
  const s = setup(); s.error();
  assert.equal(s.canvas.hidden, true); assert.equal(s.controls.hidden, true);
  assert.equal(s.hint.textContent, 'Static Asia'); assert.equal(s.frames.size, 0);
});
test('mobile and data-saver devices request the smaller texture', () => {
  assert.equal(setup({ mobile: true }).texture(), '/small.jpg');
  assert.equal(setup({ saveData: true }).texture(), '/small.jpg');
  assert.equal(setup().texture(), '/large.jpg');
});
test('a loaded globe rotates, and the pause control stops rendering once it settles', () => {
  const s = setup(); s.load(); s.advance(8);
  assert.equal(s.canvas.hidden, false); assert.equal(s.controls.hidden, false);
  assert.equal(s.fallback.getAttribute('aria-hidden'), 'true');
  assert.ok(s.drawn.at(-1)[0] > s.drawn[0][0]);
  s.action('pause'); s.advance();
  assert.equal(s.pause.getAttribute('aria-label'), 'Start rotation'); assert.equal(s.frames.size, 0);
});
test('reduced motion starts static and region selection reaches the requested geography', () => {
  const s = setup({ reduced: true }); s.load(); s.advance();
  assert.equal(s.pause.getAttribute('aria-label'), 'Start rotation'); assert.equal(s.frames.size, 0);
  s.regions[2].fire('click'); s.advance();
  assert.ok(Math.abs(s.drawn.at(-1)[0] - (-80 * Math.PI / 180 + 2 * Math.PI)) < .0001);
  assert.equal(s.status.textContent, 'Americas'); assert.equal(s.regions[2].getAttribute('aria-pressed'), 'true');
  assert.equal(s.frames.size, 0);
});
test('keyboard rotation is operable and does not leave automatic rotation running', () => {
  const s = setup(); s.load(); let prevented = false;
  s.canvas.fire('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } }); s.advance();
  assert.equal(prevented, true); assert.equal(s.pause.getAttribute('aria-label'), 'Start rotation');
  assert.ok(Math.abs(s.drawn.at(-1)[0] - 120 * Math.PI / 180) < .001); assert.equal(s.frames.size, 0);
});
test('rendering suspends offscreen and in a background tab, then resumes', () => {
  const s = setup(); s.load(); s.advance(3);
  s.visibility(false); assert.equal(s.frames.size, 0);
  s.visibility(true); assert.equal(s.frames.size, 1);
  s.document.hidden = true; s.document.fire('visibilitychange'); assert.equal(s.frames.size, 0);
  s.document.hidden = false; s.document.fire('visibilitychange'); assert.equal(s.frames.size, 1);
});
test('a changed motion preference and context loss stop the animation safely', () => {
  const s = setup(); s.load(); s.advance(3);
  s.motion.matches = true; s.motion.fire('change'); s.advance(); assert.equal(s.frames.size, 0);
  s.canvas.fire('webglcontextlost', { preventDefault() {} });
  assert.equal(s.canvas.hidden, true); assert.equal(s.controls.hidden, true); assert.equal(s.frames.size, 0);
  assert.equal(s.fallback.getAttribute('aria-hidden'), undefined);
});
