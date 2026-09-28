// Browser check for learning components (custom.scss §24) on a rendered post.
//
// Usage (dev server running; Playwright is installed globally):
//   cd <scratch dir> && node <repo>/.claude/skills/write-post/scripts/check_learn_cards.cjs \
//     http://127.0.0.1:1313/post/<slug>/
//
// For light, dark and a 375px-wide dark viewport it: switches the theme the way
// the site does (localStorage wcTheme), counts the cards, opens every <details>,
// reports each card type's left-accent color, flags raw Markdown left in a card
// (a missing blank line), flags horizontal page overflow and page errors, and
// saves a full-page screenshot per mode (learn-cards-<mode>-<width>.png) in the
// CURRENT directory — run it from a scratch directory, not the repo root.
// Exit code 1 on any problem. See .claude/docs/learning-components.md.
const { execSync } = require('child_process');
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const url = process.argv[2];
if (!url) { console.error('usage: node check_learn_cards.cjs <post URL>'); process.exit(2); }
const EXPECTED = {            // left accent per card type: [light, dark]
  'predict-card': ['rgb(106, 155, 204)', 'rgb(106, 155, 204)'],
  'solution-card': ['rgb(0, 212, 200)', 'rgb(0, 212, 200)'],
  'misconception-card': ['rgb(217, 119, 87)', 'rgb(217, 119, 87)'],
  'proof-card': ['rgb(20, 20, 19)', 'rgb(200, 208, 224)'],
};

(async () => {
  const browser = await chromium.launch();
  let failed = false;
  for (const [mode, width] of [['light', 1280], ['dark', 1280], ['dark', 375]]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: mode });
    await ctx.addInitScript((m) => { try { localStorage.setItem('wcTheme', m === 'dark' ? '1' : '0'); } catch (e) {} }, mode);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    const r = await page.evaluate((expected) => {
      document.querySelectorAll('.article-style details').forEach((d) => { d.open = true; });
      const out = { counts: {}, accents: {}, rawMarkdown: [] };
      for (const type of Object.keys(expected)) {
        const cards = [...document.querySelectorAll('.learn-card.' + type)];
        out.counts[type] = cards.length;
        out.accents[type] = [...new Set(cards.map((c) => getComputedStyle(c).borderLeftColor))];
      }
      document.querySelectorAll('.learn-card').forEach((c, i) => {
        const clone = c.cloneNode(true);
        clone.querySelectorAll('pre, code, mjx-container, script').forEach((n) => n.remove());
        const t = clone.textContent;
        if (/\*\*[^*\n]+\*\*|(^|\s)\$[^$\n]+\$/.test(t)) out.rawMarkdown.push(i);
      });
      out.dark = document.body.classList.contains('dark');
      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return out;
    }, EXPECTED);
    const problems = [];
    if (r.dark !== (mode === 'dark')) problems.push(`theme did not switch to ${mode}`);
    for (const [type, colors] of Object.entries(r.accents)) {
      const want = EXPECTED[type][mode === 'dark' ? 1 : 0];
      if (colors.some((c) => c !== want)) problems.push(`${type} left accent ${colors.join('/')} (want ${want})`);
    }
    if (r.rawMarkdown.length) problems.push(`raw Markdown/math text in card(s) #${r.rawMarkdown.join(', #')} (missing blank line?)`);
    if (r.overflow > 0) problems.push(`horizontal overflow ${r.overflow}px`);
    if (errors.length) problems.push(`page errors: ${errors.join(' | ')}`);
    await page.screenshot({ path: `learn-cards-${mode}-${width}.png`, fullPage: true });
    console.log(`${mode} ${width}px  cards ${JSON.stringify(r.counts)}  ${problems.length ? 'FAIL: ' + problems.join('; ') : 'OK'}`);
    if (problems.length) failed = true;
    await ctx.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
