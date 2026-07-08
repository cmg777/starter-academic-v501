# Verification checklist (Phase 4)

Three layers, all skipped only by `--no-verify`. The deck contains **no executable code**
(code blocks are `{.r}`, not `{r}`), so `quarto render` is a pure Pandoc render — no R/Python
kernel or package install is needed.

---

## Layer 0 — Quarto render (with render-and-fix loop)

From the deck dir:
```bash
cd content/post/<slug>/slides
/Applications/quarto/bin/quarto render slides.qmd
```
Must produce `index.html` (> 30 KB) + a `slides_files/` directory. On failure, apply the
render-and-fix loop (max 3 attempts) using `render-and-fix.md`, then re-render. Common first-
run fix: if `embed-resources: true` is set, remove it (chalkboard is incompatible).

---

## Layer A — Hugo static checks

Start Hugo on a free port (scan from 1316; `lsof -iTCP:$p -sTCP:LISTEN -t`). **Use a Hugo
≥ 0.96 extended binary** (the pinned 0.111.3 at `/tmp/hugo-verify/hugo`, or the user's
`hugo` — the on-disk 0.84.2 no longer builds this site). If none is available, mark Layer A
`[~]` and rely on Layer B. Assert **HTTP 200** for:

| URL | Note |
|---|---|
| `/post/<slug>/slides/` | 200 (canonical URL) |
| `/post/<slug>/slides/index.html` | 200 **or 301** (Hugo canonicalises to the dir; the browser follows — a pass) |
| `/post/<slug>/slides/slides_files/…` (a sampled reveal asset) | 200 (assets dir served) |
| every referenced `../<slug>_*.png` → `/post/<slug>/<slug>_*.png` | 200 (figures via `../`) |
| `/post/<slug>/` (post still renders) | 200 |

**Kill Hugo** (PID captured at start) before reporting.

### YAML link check (unless `--no-link`)
Fetch `/post/<slug>/` and confirm an `<a>` whose `href` is exactly
`/post/<slug>/slides/index.html` — **not** `/slides/` (the trailing-slash bug, render-and-fix §1).

---

## Layer B — Node static smoke test

```bash
BASE="/abs/.../content/post/<slug>/slides" node \
  .claude/skills/write-slides/references/templates/smoke-test.js
```
Exits 0/1, `[✓]/[✗]` per assertion. Checks the rendered files: `index.html` + `slides_files/`
+ `slides.qmd` present; reveal structure; the **title key-result strip** rendered; chalkboard
+ menu wired in; speaker notes; **(if the deck has math) MathJax is referenced and the math spans
use `\(…\)` delimiters** — a static guard that catches the `html-math-method: katex` misconfig;
≥1 brand divider (`data-background-color`); 6 ≤ `<section>` ≤ 60; every `../<slug>_*.png` exists
on disk; no leaked `{{…}}` markers.

**Layer B's math guard is static** — it catches the **katex-misconfiguration** (wrong delimiters
in the emitted HTML), but it canNOT confirm math actually **renders at runtime** (e.g. a MathJax
CDN failure still ships raw `\hat\alpha`). That is what Layer C catches.

**Takeaway-card check.** Confirm the deck's substantive content slides carry a
`class="takeaway"` element (the concluding orange accent card) — `grep -c 'class="[^"]*takeaway'
index.html` should be ≥1 and roughly match the number of content slides — and that the compiled
theme CSS (`slides_files/libs/revealjs/dist/theme/quarto-*.css`) contains the `.reveal .takeaway`
rule. When eyeballing in the browser (Layer C / preview), click through a takeaway slide and
confirm the card renders as the orange accent card and rises/fades in on its final fragment.

---

## Layer C — browser math-render check (MANDATORY when the deck has math)

The static layers cannot confirm runtime rendering (this bug shipped twice before this check
existed). Drive a real browser to confirm the LaTeX typesets — no `NODE_PATH` needed,
`math-check.cjs` auto-locates Playwright:
```bash
node .claude/skills/write-slides/references/templates/math-check.cjs \
  "$PWD/content/post/<slug>/slides/index.html"
# First run only, if Playwright is missing (exit 3):  npx playwright install chromium
```
`math-check.cjs` auto-resolves Playwright (project / any npx-cache hash / global npm root — via
the `loadChromium()` it shares with `draw-sketchy-diagram/scripts/render.js`), opens the deck in
the system Chrome (bundled Chromium fallback), waits for MathJax, traverses **every** slide (via
`Reveal.next()`, covering the vertical content sub-slides under each `#` divider), and **fails
(`[✗]`) if any slide shows raw backslash-LaTeX** (`\hat`, `\(`, …); it exits 0 only when all math
rendered. If Playwright/Chrome is unavailable (exit 3), mark Layer C `[~]` and fall back to a
manual eyeball — open the deck and confirm `$\hat\alpha$` shows as α̂, not `\hat\alpha` (bootstrap
per `.claude/skills/review-app/references/headless-browser.md`). **Never commit with raw LaTeX.**

---

## Report template (Phase 5)

```
VERIFICATION REPORT
===================
Deck:        content/post/<slug>/slides/  (index.html + slides_files/)
Quarto:      <version>           Hugo port: <port | n/a>
Render:      <OK | FAILED>       Smoke test: <PASS | FAIL>

Render (Layer 0)
  [✓] quarto render → index.html (<size>) + slides_files/

Static checks (Layer A)
  [✓] /post/<slug>/slides/                       (200)
  [✓] /post/<slug>/slides/  reveal asset          (200)
  [✓] figures resolve via ../ : <N>/<N>           (200)
  [✓] /post/<slug>/  (post still renders)         (200)
  OR [~] Skipped (no ≥0.96 Hugo binary)

YAML link check
  [✓] /post/<slug>/  links to slides/index.html (no trailing-slash bug)
  OR [~] Skipped (--no-link)

Node smoke test (Layer B)
  [✓] reveal structure · title strip · chalkboard+menu · notes · figures · dividers
  OR [~] Skipped (--no-verify)

Slide inventory
  [✓] <N> slides — <a> figure · <b> code · <c> table · <d> equation · Devil's-Advocate: <y/n>
  [✓] takeaway cards: <k> content slides end with a .takeaway card

Overall: <PASS | FAIL>
```
`[~]` = warning; PASS if no `[✗]`.

---

## Failure protocol

If any `[✗]`: do **not** strip the `index.md` link; surface the failed assertion with its
path; suggest the matching `render-and-fix.md` entry; offer a re-run.

---

## `--no-verify` minimal sanity (still do these)

- `index.html` exists and is > 30 KB; `slides_files/` exists; `slides.qmd` present.
- If `--no-link` is off: `index.md` contains `name: "Slides (HTML)"`.

---

## Previewing note (Phase-5 follow-ups)

Preview over **Hugo http** (`http://localhost:PORT/post/<slug>/slides/`). Press **M** (menu),
**B** (chalkboard), **S** (speaker view), **O** (overview); `?print-pdf` exports a PDF.
