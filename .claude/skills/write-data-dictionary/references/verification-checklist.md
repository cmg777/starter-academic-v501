# Phase 5 verification checklist

Run after `build_data_dictionary.py` succeeds. Skip entirely if `--no-verify`.

## A. Renderer self-checks (already run by the script)
The renderer asserts each `.dta` re-reads to the same shape and `<release>118</release>`. If it
raised, fix before continuing.

## B. Structural greps on `index.html`
Confirm (Python or grep):
- one download link per dataset (`<base>.dta`) + a source-file link + the ZIP + `stata_codebook.do`,
  all `https://raw.githubusercontent.com/...`;
- code snippets contain the raw base and `read_stata` / `use ` / `read_dta` and the
  `pyreadstat` + `urllib.request.urlretrieve` example, plus the Colab note;
- one `id="var-<name>"` per unique variable; cross-file index has matching `href="#var-<name>"`;
- present sections match the nav (`#downloads … #datasets`), and the optional sections (overview /
  cite / formulas / caveats) appear only when their YAML is non-empty;
- **tag balance even**: `<section>`==`</section>`, `<table>`==`</table>`, `<div`==`</div>`;
- `[data-theme="dark"]`, `id="themeToggle"`, `id="expandBtn"`, `IntersectionObserver`,
  `@media print` all present.

## C. Headless-Chromium interaction pass
Render the built file and assert (no JS console errors throughout):
- **tabs**: clicking each `.tab` leaves exactly one `.ds-panel` visible;
- **expand-all**: clicking `#expandBtn` makes *all* panels visible (proves Ctrl+F / print cover
  every dataset);
- **dark mode**: clicking `#themeToggle` changes `getComputedStyle(body).backgroundColor` and the
  choice persists after `reload()`;
- **cross-link**: clicking the first `#index a[href^="#var-"]` sets `location.hash` to `#var-…`;
- **print**: `emulateMedia('print')` shows all panels.

A generic driver (works for any post — picks the first matrix link dynamically):

```js
const { chromium } = require('playwright');
(async () => {
  const pg = await (await chromium.launch()).newPage({viewport:{width:1340,height:1000}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.argv[2],{waitUntil:'load'}); await pg.waitForTimeout(300);
  const tabs=await pg.$$('.tab'); let ok=true;
  for(let i=0;i<tabs.length;i++){await tabs[i].click();await pg.waitForTimeout(40);
    if(await pg.evaluate(()=>[...document.querySelectorAll('.ds-panel')].filter(p=>getComputedStyle(p).display!=='none').length)!==1)ok=false;}
  console.log('tabs one-panel:',ok);
  await pg.click('#expandBtn');await pg.waitForTimeout(100);
  console.log('expand visible:',await pg.evaluate(()=>[...document.querySelectorAll('.ds-panel')].filter(p=>getComputedStyle(p).display!=='none').length),'/',tabs.length);
  await pg.click('#themeToggle');await pg.waitForTimeout(60);
  console.log('dark:',await pg.evaluate(()=>document.documentElement.dataset.theme+'|'+getComputedStyle(document.body).backgroundColor));
  console.log('xlink:',await pg.evaluate(()=>{const a=document.querySelector('#index a[href^="#var-"]');if(a){a.click();return location.hash;}return 'none';}));
  await pg.emulateMedia({media:'print'});
  console.log('print visible:',await pg.evaluate(()=>[...document.querySelectorAll('.ds-panel')].filter(p=>getComputedStyle(p).display!=='none').length),'/',tabs.length);
  console.log('JS errors:',errs.length?errs:'none');
  process.exit(0);
})();
```
Run with the repo's cached Playwright: `NODE_PATH="$(find ~/.npm/_npx -maxdepth 4 -type d -name node_modules | head -1)" node driver.js <abs path to index.html>` (or `npx playwright@latest install chromium` once if no browser is cached).

## D. Hugo build
Build with a pinned binary in the **0.96–0.119** window (e.g. the verify binary
`/tmp/hugo-verify/hugo` at 0.111.3, or `"$HOME/Library/Application Support/Hugo/0.84.2/hugo"` only
if ≥0.96 is unavailable — note 0.84.2 fails on `continue`): `hugo --gc --minify --buildFuture`.
Confirm `public/post/<slug>/data/index.html` exists and the post renders with the "Data dictionary"
button resolving to `/post/<slug>/data/index.html` (and the GitHub data buttons gone if the user
chose to remove them).

## E. Cleanliness
`git status` should show only the intended new/changed files under `content/post/<slug>/` (and the
one `index.md` edit); nothing under `content/es` or `content/ja`. Re-running the renderer changes
`.dta` bytes only via their embedded timestamp — `git restore` that churn before committing if the
data is unchanged.
