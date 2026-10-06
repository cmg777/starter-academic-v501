// node capture.mjs <canva url> <outdir>: one PNG per page (3840x2160) + text.json
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [url, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
await page.addStyleTag({ content: 'header, footer, .jv5LaQ { visibility: hidden !important; }' });
const counter = () => page.evaluate(() => (document.querySelector('footer')?.textContent || '').match(/(\d+)\s*\/\s*(\d+)/)?.slice(1).map(Number));
const [, total] = await counter();
const texts = {};
for (let i = 1; i <= total; i++) {
  const [cur] = await counter();
  if (cur !== i) throw new Error(`expected page ${i}, at ${cur}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => { for (const v of document.querySelectorAll('video')) { v.pause(); v.currentTime = 0; } await new Promise(r => setTimeout(r, 800)); });
  await page.screenshot({ path: `${out}/p${String(i).padStart(2, '0')}.png` });
  texts[i] = await page.evaluate(() => [...document.querySelectorAll('[role=region]')].map(e => e.innerText).join(' ').replace(/\s+/g, ' ').trim());
  if (i < total) {
    await page.keyboard.press('ArrowRight');
    for (let k = 0; k < 20; k++) { await page.waitForTimeout(300); const [c] = await counter(); if (c === i + 1) break; }
  }
}
fs.writeFileSync(`${out}/text.json`, JSON.stringify(texts, null, 1));
console.log(`captured ${total} pages`);
await browser.close();
