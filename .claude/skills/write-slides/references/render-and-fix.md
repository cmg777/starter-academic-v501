# Render-and-fix catalog

Failure modes for `write-slides` (Quarto engine), each with symptom → cause → fix. Apply the
**render-and-fix loop** (max 3 attempts) on a `quarto render` failure, like `write-quarto-
notebook`. Grows over time — append new modes with the symptom quoted from the error.

---

## 1. Chalkboard incompatible with self-contained output  (the headline gotcha)

**Symptom.** `quarto render` errors: `Reveal plugin 'RevealChalkboard is not compatible with
self-contained output`.

**Cause.** `embed-resources: true` (self-contained single file) cannot bundle the chalkboard
plugin's assets.

**Fix.** Do **not** use `embed-resources: true`. The deck ships `index.html` + `slides_files/`
(the default), which Hugo serves fine (the `tutorial.html` precedent). The template already
omits `embed-resources`. Only enable it if a deck drops chalkboard.

---

## 2. SCSS theme compile error

**Symptom.** `quarto render` fails in Dart Sass (e.g. "Undefined variable `$primary`", or a
bad `lighten()` argument).

**Cause.** A `site-brand.scss` rule references a variable Quarto hasn't defined yet, or a typo.

**Fix.** Keep variable *overrides* in `/*-- scss:defaults --*/` and *rules* in
`/*-- scss:rules --*/`. Use the brand tokens defined at the top of `site-brand.scss`
(`$orange/$teal/$steel/$ink/$heading`), not Quarto-internal names. Re-render.

---

## 3. Title strip empty or partial error

**Symptom.** The title slide has no number strip, or render errors on the partial.

**Cause.** `key-results:` missing/malformed in the front matter, or `title-slide.html` edited
incorrectly. The partial loops `$for(key-results)$ … $key-results.num$ … $endfor$`.

**Fix.** Ensure front matter has a `key-results:` list of `{ num, cap }` maps. Keep
`title-slide.html` verbatim from `templates/`. If the partial proves brittle, fall back: drop
`template-partials` and render the strip as a custom first `## {.center}` slide instead.

---

## 4. Hugo trailing-slash URL rewrite

**Symptom.** The button's rendered `href` is `/slides/` (absolute) → 404.

**Cause.** Wowchemy's `page_links.html` re-roots a trailing-slash scheme-less `url:` to absolute.

**Fix.** Emit `url: slides/index.html` (relative, **no** trailing slash). `…/slides/index.html`
returning a **301** to the directory is fine (the browser follows it).

---

## 5. Hugo dev-server issues (port collision / 0.84.2 can't build)

**Symptom.** "address already in use", or `function "continue" not defined`.

**Fix.** Scan ports from 1316 for a free one; kill the started Hugo after verifying. Use a Hugo
**≥ 0.96** extended binary (the pinned 0.111.3 at `/tmp/hugo-verify/hugo`) — the on-disk 0.84.2
no longer builds this site. If no ≥0.96 binary exists, skip Layer A (`[~]`) and rely on Layer B.

---

## 6. Figure not found at render / broken image

**Symptom.** `quarto render` warns "resource not found", or the deck shows a broken image.

**Cause.** Wrong filename or a figure in a subfolder; the path is relative to the `.qmd` (in
`slides/`), so a bundle-root figure is `../<slug>_fig.png`.

**Fix.** Reference the exact file as `../<EXACT_NAME>.png` (one level up). Confirm against the
Phase-1 figure manifest. Quarto keeps the `../` reference; the smoke test checks it resolves.

---

## 7. An equation renders as a MathJax error

**Symptom.** An equation shows a "Math Processing Error" / red text; the static smoke test passed.

**Cause.** A macro MathJax can't process (rare — MathJax 2's macro set is broad), or a typo. In
a `.qmd` there is **no** Goldmark, so write plain LaTeX.

**Fix.** Correct the macro/typo (`\mathbb`/`\hat`/`\sum`/`\arg\min`/`\|…\|`/`\pm` are all fine).
Always eyeball math in a **real browser**, not just the static smoke test (see §12).

---

## 8. Slide overflows / figure too big

**Symptom.** Content spills past the slide.

**Cause.** A figure with `auto-stretch` disabled, or a slide overloaded with content.

**Fix.** Keep `auto-stretch: true` (default) and `fig-align: center` — Quarto bounds the image
to the slide. For text, apply the MB/MC pass (`rhetoric-of-decks.md`): one idea per slide; push
overflow to `::: {.notes}`. The theme caps images at `max-width:100%`.

---

## 9. Collision with an existing slides.pdf or Wowchemy slides page

**Symptom.** The post already has a "Slides (PDF)" button or a `content/slides/<name>` page.

**Fix.** They coexist: the HTML deck is `slides/` + **"Slides (HTML)"** + relative url; the PDF
is root `slides.pdf` + **"Slides (PDF)"** + absolute url, new tab; Wowchemy's native page is
`content/slides/<name>` + the hard-coded "Slides" label. Phase-2 Round 4 confirms the labels.

---

## 10. The post changed during the interview

**Symptom.** Phase 3 finds a title/front-matter mismatch with Phase 1.

**Fix.** Phase 3 re-reads `index.md`; if the title/front matter differ, surface the diff and
ask whether to abort or proceed. Never silently use stale Phase-1 data.

---

## 11. The deck's rendered output is committed (unlike tutorials)

**Symptom.** After pushing, the live deck 404s or renders unstyled/broken — `index.html` or
`slides_files/` is missing from the deploy.

**Cause.** The rendered output wasn't committed. **Netlify builds with Hugo, not Quarto**, so
it cannot render the `.qmd` — it serves only what is in git. The repo `.gitignore` ignores
`tutorial.html`/`tutorial_files/` (tutorials are rendered locally by readers, never served) but
deliberately does **not** ignore `slides_files/`.

**Fix.** Commit the **whole** `slides/` dir — `slides.qmd` + `site-brand.scss` +
`title-slide.html` (source) **and** `index.html` + `slides_files/` (the served deck, ~8 MB):
`git add content/post/<slug>/slides/`. Only Quarto's local cache is ignored
(`content/post/*/slides/.quarto/`). Never add a `.gitignore` rule that catches `slides_files/`.

---

## 12. Math shows as raw LaTeX (`\hat\alpha`) instead of typeset

**Symptom.** Slides display the LaTeX **source** — `\hat\alpha \pm 95\%` — not the typeset math.
The static smoke test passed (it only checks that `$…$` became `<span class="math">` spans, NOT
that they actually *render*).

**Cause.** `html-math-method: katex` is **broken in Quarto revealjs**: it emits
`<span class="math inline">\hat\alpha</span>` (raw) and loads KaTeX, but adds **no auto-render
call**, so KaTeX is never invoked.

**Fix.** Use the **default MathJax** — do NOT set `html-math-method`. MathJax (the reveal math
plugin) renders `\(…\)` across the whole slide DOM (body, captions, headings, table cells).
**Verify in a real browser** — the static smoke test cannot see unrendered math (this is the bug
that shipped twice). See the Playwright math-render check in `verification-checklist.md` +
`templates/math-check.cjs`.
