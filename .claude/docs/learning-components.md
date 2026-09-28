# Learning components

Active-learning blocks for tutorial posts. They turn a post from something the reader scrolls through into something the reader works through:

| Component | Element | Left accent | What it does | Where | How many |
|---|---|---|---|---|---|
| **Predict card** | `<div class="learn-card predict-card">` + nested `<details class="learn-card-reveal">` | steel blue `#6a9bcc` | Asks the reader to commit to an answer, then reveals it | Just **before** the code block whose output answers it | 4–6, encouraged |
| **Solution card** | `<details class="learn-card solution-card">` | teal `#00d4c8` | Worked solution to one exercise: code + real output + 1–3 sentences | Right after each exercise | One per exercise |
| **Misconception card** | `<details class="learn-card misconception-card">` | warm orange `#d97757` | States a tempting myth, then what is actually true, with evidence from the post | `## Common misconceptions` section | 3–6, encouraged |
| **Proof card** | `<details class="learn-card proof-card">` | near black `#141413` (dark mode `#c8d0e0`) | Collapsible derivation for readers who want it | Right after the theorem statement | Optional, usually 1 |
| **Interactive widget** | a Hugo shortcode (e.g. `{{< fwl-lab >}}`) | — | Sliders/toggles that recompute a result live | Its own `##` section | Optional |

The four cards are **pure HTML `<details>`** — no JavaScript. They are styled by `assets/scss/custom.scss` **§24** (companion to §20, the Key-concepts toggle cards). The interactive widget is the only piece with JS, and it carries its own CSS and JS files. For `fwl-lab` these are `assets/css/fwl-lab.css` and `assets/js/fwl-lab.js`. Widget styles have no section in `custom.scss`, where §24 is the last numbered section. See [Interactive widget pattern](#interactive-widget-pattern).

## Trigger

**"Add learning components to `<post slug>`"**

Variants that run only part of the recipe: "Add predict checks to `<post>`" (step 3), "Add worked solutions to `<post>`" (step 6), "Add misconceptions to `<post>`" (step 5), "Add a proof to `<post>`" (step 4).

## Preconditions (site-wide, do not modify while writing a post)

- `markup.goldmark.renderer.unsafe: true` in `config/_default/config.yaml` (raw HTML in Markdown).
- `assets/scss/custom.scss` §24 — `.learn-card`, the four modifiers, `.learn-card-kicker`, `.learn-card-reveal`, the ▸/▾ chevrons, `:focus-visible` ring, and `.dark` variants. Without it the cards render as unstyled `<details>`.
- For an interactive widget only: its own `assets/css/<name>.css` and `assets/js/<name>.js`, loaded by the shortcode through Hugo Pipes. For `fwl-lab` that means `assets/css/fwl-lab.css`, not `custom.scss`.
- Helper scripts in `.claude/skills/write-post/scripts/`: `lint_learn_cards.py` (source markup lint) and `check_learn_cards.cjs` (rendered-page check in light/dark/375px; needs the global Playwright install).

## Recipe

1. **Run the analysis first and capture the numbers.** Run the post's script (`script.py` / `analysis.py` / `analysis.R` / `analysis.do`) and read its results file if it writes one (e.g. `fwl_results.json`). Every number that goes into a card comes from this run — never from memory, never rounded differently from the post body.
2. **Find the prediction moments.** Read the post and list 4–6 places where the output is surprising or decisive: a sign flip, a coefficient that moves when a control is added, a standard error that jumps, two methods that agree exactly, a correlation that is (near) zero.
3. **Predict cards (4–6).** For each moment, put a predict card between the explanation paragraph (sandwich layer 1) and the code block (layer 2) whose output answers it. The question must be answerable before running the code (direction, rough size, "same or different?"). The reveal cites the numbers from the output block that follows. A predict card does not break the sandwich — the explanation → code → output → interpretation layers stay in order around it.
4. **Proof card (optional).** Directly after the theorem statement (display equation + its "In words" sentence), add one proof card. Keep the proof short enough to read in two minutes; use `^\top` for transposes.
5. **Common misconceptions (3–6).** Add a `## Common misconceptions` section after the results sections (after the results summary/comparison) and **before** `## Discussion`. Start with one or two sentences of prose (see pitfall on §11F), then one misconception card per myth. Each card's body opens with `**What is actually true.**` and cites evidence the post already shows (a number, a figure, an output block).
6. **Exercises (3–8, graded).** Under `## Exercises`, graded Warm-up → Core → Stretch in increasing order, under `###` headings in either of two layouts (match the post's heading-numbering style): (a) one `###` per exercise, labeled by difficulty (e.g. `### 1. Warm-up: Recover the slope by hand`); or (b) one `###` per difficulty level (`### 22.1 Warm-up`, `### 22.2 Core`, `### 22.3 Stretch`), each holding 1–3 exercises that open with a bold `**Exercise N — Title.**` lead-in (the python_fwl reference layout). Either way, each exercise is a short prompt followed by exactly one solution card. Write the solution code, **run it**, paste the printed output verbatim into a `text` fence, then add 1–3 sentences.
7. **Interactive widget (optional).** Only when a slider genuinely teaches something the static figures cannot. Follow the pattern below.
8. **Verify.**
   - Lint the source: `python3 .claude/skills/write-post/scripts/lint_learn_cards.py content/post/<slug>/index.md` (exit 0).
   - Build: `"$HOME/Library/Application Support/Hugo/0.111.3/hugo" --gc --minify` (never while another build is running). Count cards in the output — minification may drop the quotes around single-token attribute values (multi-class values keep them), so grep the class names themselves rather than `class="…"`: `grep -o 'learn-card [a-z]*-card' public/post/<slug>/index.html | sort | uniq -c`.
   - Visual check on the dev server, from a scratch directory: `node <repo>/.claude/skills/write-post/scripts/check_learn_cards.cjs http://127.0.0.1:1313/post/<slug>/` — light, dark, 375px; accents, raw-Markdown leaks, overflow, page errors (exit 0), then look at the screenshots.
   - Review: `/project:review-post <slug> focus: learning`.
9. **i18n.** Posts are the stub exception: the ES/JA counterparts are card-only stubs, so the learning components live only in the English body. Nothing to translate.
10. **Log.** Add or update the post's entry in `logs/`.

## Copy-paste blocks

Keep the class names, line breaks and blank lines exactly as shown.

### Predict card

````markdown
<div class="learn-card predict-card">
<p class="learn-card-kicker">Predict first</p>

Question in Markdown (math like $\hat\beta\_1$ allowed). Commit to an answer before scrolling.

<details class="learn-card-reveal">
<summary>Reveal the answer</summary>

**Answer.** Two to four sentences citing the post's real numbers.

</details>
</div>
````

### Solution card

````markdown
<details class="learn-card solution-card">
<summary><span class="learn-card-kicker">Solution</span> Show the code and the numbers</summary>

```python
# solution code
```

```text
output produced by ACTUALLY running the code above
```

One to three sentences interpreting the output.

</details>
````

### Misconception card

````markdown
<details class="learn-card misconception-card">
<summary><span class="learn-card-kicker">Misconception</span> "Short myth."</summary>

**What is actually true.** The correction, with the evidence from this post (a number, a figure, an output block).

</details>
````

### Proof card

````markdown
<details class="learn-card proof-card">
<summary><span class="learn-card-kicker">Proof</span> Title</summary>

Body in Markdown, with display math:

$$\hat\beta = (X^\top M\_Z X)^{-1} X^\top M\_Z y$$

</details>
````

### Filled examples (python_fwl, numbers from `fwl_results.json`)

````markdown
<div class="learn-card predict-card">
<p class="learn-card-kicker">Predict first</p>

The naive slope of sales on coupons is $-0.106$. Once we control for income, will the coupon coefficient stay negative, shrink toward zero, or turn positive? Commit to an answer before scrolling.

<details class="learn-card-reveal">
<summary>Reveal the answer</summary>

**Answer.** It turns positive: $0.2673$ (SE $0.1203$, $p = 0.031$), close to the true effect of $0.2$. Richer neighborhoods get fewer coupons but buy more anyway, so without the control, income's positive effect on sales masquerades as a negative coupon effect.

</details>
</div>
````

````markdown
<details class="learn-card solution-card">
<summary><span class="learn-card-kicker">Solution</span> Show the code and the numbers</summary>

```python
# Residualize coupons on income (Step 1 of FWL), then apply Cov / Var
coupons_tilde = smf.ols("coupons ~ income", data=df).fit().resid
cov = df["sales"].cov(coupons_tilde)
var = coupons_tilde.var()
print(f"Cov(sales, coupons_tilde) = {cov:.4f}")
print(f"Var(coupons_tilde)        = {var:.4f}")
print(f"Cov / Var                 = {cov / var:.4f}")
```

```text
Cov(sales, coupons_tilde) = 3.9380
Var(coupons_tilde)        = 14.7320
Cov / Var                 = 0.2673
```

The ratio reproduces the full-model coefficient exactly, because a one-regressor slope is always Cov / Var — FWL just tells us which X to use.

</details>
````

(The solution output above was produced by running the snippet on `content/post/python_fwl/data/fwl_store_data.csv` on 2026-09-28.)

````markdown
<details class="learn-card misconception-card">
<summary><span class="learn-card-kicker">Misconception</span> "Step 1's huge standard error means the outcome has not been adjusted yet."</summary>

**What is actually true.** The coefficient is already exact ($0.2673$); the standard error of $1.2715$ comes mainly from the **dropped intercept**. Add the intercept back and it falls to $0.1437$; residualize sales as well and it is $0.1178$, versus $0.1203$ in the full model.

</details>
````

## Goldmark and MathJax rules

- **Blank lines are load-bearing.** Goldmark ends a raw-HTML block at the first blank line and parses what follows as Markdown. Required: a blank line after the opening lines (`<p class="learn-card-kicker">…</p>`, `<summary>…</summary>`), and a blank line before every `</details>`. Without them the body renders as raw text with literal `**` and `$…$`.
- **`<summary>` is raw HTML.** No Markdown, no backticks, no `\_` escapes — use `<code>` and `<em>`. If you must put math in a summary, write it unescaped (`$\beta_1$`) because Goldmark does not touch raw HTML; prefer plain words.
- **Math in the card body** follows the normal post rules (`.claude/skills/write-post/references/latex-escaping.md`): `\_` for subscripts, `\\,` for LaTeX punctuation commands, `\\$` for literal currency, and none of the AVOID-list constructs.
- **Transposes:** `X^\top` (not `X'` or `X^T`).
- **Math inside collapsed `<details>` works**: MathJax typesets the whole document at load, including closed `<details>` content, so the math is ready when the reader opens a card (the Key-concepts cards have always relied on this).
- **No `##`/`###` headings inside cards** (they would enter the left-side TOC and get §11E section-separator styling). No `<h2>`/`<h3>` HTML either.
- **Never nest learn-cards inside `.concept-pair`**, and do not put a learn-card inside another learn-card (the predict card's `learn-card-reveal` is the only nesting).

## Pitfalls

- **§11F list styling.** `custom.scss` §11F styles any `ul` that directly follows an `h2` (or `h2` + one `p`) as a teal "Learning objectives" box. A `## Common misconceptions` or `## Exercises` section that opens with a bullet list will pick that up. Open the section with prose, or use an ordered list.
- **Theme focus reset.** The theme sets `summary:focus { outline: none }` (and `details { margin-bottom: 1rem }`). §24 restores a visible keyboard ring with `summary:focus-visible` at higher specificity — do not add inline styles that override it.
- **Dark-mode `border-color` shorthand.** Until 2026-09-28, `.dark details.concept-card { border-color: … }` (§20) repainted the left accent too, so Example/Analogy cards lost their teal/orange edge in dark mode (the site default). §20 and §24 now set only `border-top/right/bottom-color`. Never use the `border-color` shorthand in a `.dark` rule for an accent-edged card.
- **Stale CSS/JS after deploy.** `netlify.toml` caches `*.css` and `*.js` for 30 days (`max-age=2592000`). Any widget asset must go through Hugo Pipes with `fingerprint` so a changed file gets a new URL. (`custom.scss` is compiled by Wowchemy into `/css/wowchemy.css`; theme changes land on the next build.) A post's standalone `web_app/` bypasses Hugo Pipes. It uses `?v=YYYYMMDD` query strings instead, as described in `.claude/skills/write-app/references/verification-checklist.md`.
- **Numbers that did not come from code.** A predict answer or solution output typed from memory is the most likely review failure. Re-run and paste.

## Interactive widget pattern

Generalized from the `fwl-lab` widget (`layouts/shortcodes/fwl-lab.html` + `assets/js/fwl-lab.js` + `assets/css/fwl-lab.css`). Use it for a small, self-contained lab: a few controls (sliders, toggles, a reset button) that recompute and redraw one result.

**Files (one widget = three files):**

| File | Role |
|---|---|
| `layouts/shortcodes/<name>.html` | Emits the mount `<div>` and, once per page, the fingerprinted CSS/JS |
| `assets/js/<name>.js` | All behavior; bundled/minified with `js.Build` (esbuild) |
| `assets/css/<name>.css` | All widget styles, scoped under `.<name>`; widget CSS never goes in `custom.scss` |

**Shortcode skeleton** (Hugo 0.111.3; the once-per-page guard was tested across dev-server rebuilds):

```go-html-template
{{- $id := printf "<name>-%d" .Ordinal -}}
<div class="<name>" id="{{ $id }}">
  <noscript><p>This interactive lab needs JavaScript.</p></noscript>
</div>
{{- if not (.Page.Scratch.Get "<name>-assets") -}}
{{- .Page.Scratch.Set "<name>-assets" true -}}
{{- $css := resources.Get "css/<name>.css" | minify | fingerprint -}}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
{{- $js := resources.Get "js/<name>.js" | js.Build (dict "minify" true "target" "es2017") | fingerprint -}}
<script src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" defer></script>
{{- end -}}
```

**Rules:**

- **Dark mode via CSS variables.** Define tokens on `.<name>` (light) and override them under `.dark .<name>` — the site toggles `body.dark` from its own theme switch, so `@media (prefers-color-scheme)` alone is wrong. Use the site palettes (light `#6a9bcc #d97757 #141413 #00d4c8`; dark `#0f1729 #1f2b5e #c8d0e0 #e8ecf2`).
- **Forbidden elements inside the widget:** `pre`, `code`, `img`, `h2`, `h3`, `table`, and the character `$`. Page-level CSS and scripts target them inside `.article-style`: §11 styles `pre`/`code`/`img`/`table`/headings, `copy-code.js` injects buttons into `pre > code`, the post layout's lightbox grabs every `.article-style img`, the TOC observer watches `h2[id]`/`h3[id]`, and MathJax treats `$…$` as math. Draw with SVG or `<canvas>`, label with `<span>`/`<div>`, and write currency as "USD".
- **Static math labels only.** MathJax typesets once at page load, so TeX in the shortcode's static markup renders, but TeX inserted later by JS does not. Dynamic readouts use plain text and Unicode (β̂ = 0.267).
- **Accessibility.** Native `<input type="range">`/`<button>` with `<label>`s; readouts in an `aria-live="polite"` region updated on `change` (not on every `input` tick, which floods screen readers); visible `:focus-visible` rings; honor `prefers-reduced-motion`.
- **Numbers must match the post.** At its default state the widget reproduces the post's headline numbers (for `fwl-lab`, the post's naive and FWL slopes).
- **Node smoke test.** Keep the numerics in pure functions (no DOM access at import time) and check them in Node before touching the browser, e.g. bundle with the same esbuild Hugo uses or `node --input-type=module -e "import('./assets/js/<name>.js')…"`, and assert the default-state numbers against the post's results JSON.
- **Browser checks.** On the dev server: light, dark and 375px width; no horizontal overflow; clean console; keyboard-only operation; the `aria-live` text changes after a control moves. `check_learn_cards.cjs` covers the page-level part (overflow, page errors, both themes).

## Reference implementation

`content/post/python_fwl/` (Frisch–Waugh–Lovell theorem, 50 simulated stores): §7.2 predict card, §8.2 proof card, §16 the `fwl-lab` interactive widget, §18 Common misconceptions, §22 graded exercises with solution cards. Canonical numbers: `content/post/python_fwl/fwl_results.json` (written by `script.py`).

Related: `.claude/skills/write-post/references/learning-components-template.md` (authoring template + quality bar), `.claude/skills/review-post/SKILL.md` (Dimension 3 "Learning components" checklist, `focus: learning`), `.claude/skills/write-post/references/key-concepts-template.md` (§20 Key-concepts cards).
