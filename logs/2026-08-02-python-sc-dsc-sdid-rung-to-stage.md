# 2026-08-02 — "rung" becomes "stage" across the `python_sc_dsc_sdid` bundle

## What changed

The ladder metaphor kept its ladder but lost its rungs. Every occurrence of *rung* / *rungs*
in the Python bundle is now *stage* / *stages* — 207 replacements across 15 files:

| File | Replacements |
|---|---:|
| `index.md` | 48 |
| `slides/slides.qmd` | 33 |
| `analysis.py` | 24 |
| `slides/SLIDES_REVIEW.md` | 16 |
| `cheatsheet_python.py` | 14 |
| `cheatsheet_R.R` | 14 |
| `notebook.ipynb` | 13 |
| `cheatsheet_stata.do` | 12 |
| `references/tutorial.qmd` | 10 |
| `execution_log.txt` | 8 |
| `web_app/index.html` | 5 |
| `logs/2026-08-02-…-slides.md` | 4 |
| `web_app/app.js`, `references/README.md`, `web_app/REVIEW.md` | 3 each |

So `## 8. Rung 0 — Difference-in-differences` is now `## 8. Stage 0 — …`, the deck's Act II
divider reads **One Config, Six Stages**, and Act IV reads **Which Stage?**

## Why "stage" and not "step"

"Step" was the first choice and it is the wrong word *here*. This post already uses **Step-1**
as load-bearing terminology: `TSSC` implements the Li–Shankar **two-step** estimator, §10.2 is
"The four variants and the Step-1 selection", and `.selection` is the package's own accessor.
"Step 2 — Demeaned SC" sitting beside "the Step-1 selection" reads as though the two are
related. They are not.

Counts of every candidate across the bundle, which is how the choice was made:

| Candidate | Existing uses | Verdict |
|---|---:|---|
| `tier` | 0 | clean, but implies a quality ranking — §16 argues the top is *not* where to stand |
| **`stage`** | **2** | **chosen** — both strays reworded |
| `approach` | 2 | clean but long in headings |
| `family` | 9 | "the SDID **family**" already means something |
| `step` | 20 | Step-1 selection, two-step estimator |
| `model` | 13 | collides |
| `variant` | 104 | `TSSC.variants` is core API |
| `estimator` | 162 | used constantly |
| `method` | 220 | worst — `method="MSCa"`, "the covariate **method**" (the 1.76 pp headline), "nine inference **methods**", and two deck tables headed `| Method |` |

## Eight hand-fixes a blind replacement would have got wrong

- `## 16. Which rung should you stand on?` → **"Which stage should you choose?"** — one *stands
  on* a stage in a theatre, which is not the sense wanted.
- Deck speaker notes, "which rung to stand on" → "which stage to choose".
- "on every rung of the ladder" → "**at** every stage of the ladder" (×4: `index.md`,
  `slides.qmd`, `notebook.ipynb`, `tutorial.qmd`) — you are *at* a stage, not *on* one.
- The two pre-existing uses of "stage" were about the four `Mlsynth*Error` types telling you
  "which **stage** failed"; both became "which **phase** failed" (`index.md` §4.2,
  `notebook.ipynb`) so the word means exactly one thing in the bundle.

## Knock-on rebuilds

- `slides/index.html` re-rendered with Quarto 1.8.27 — the rendered deck is a committed
  production asset, so a source-only change would have left it stale.
- `python_sc_dsc_sdid.zip` rebuilt via `build_bundle.sh`, since `tutorial.qmd`,
  `references/README.md` and all three cheat sheets changed. Verified: 0 "rung", 77 "stage".
- `execution_log.txt` banners updated so the recorded run still matches what `analysis.py`
  would now print. **Only the six section banners and two summary lines changed — no number in
  that log was touched.**

## Verification

Identical to the pre-rename baseline, so the change is cosmetic in exactly the way intended:

| Check | Result |
|---|---|
| `quarto render` | clean; `index.html` regenerated |
| `smoke-test.js` | 15/15 |
| `math-check.cjs` | 42 slides, no raw LaTeX |
| `slide-audit.cjs` | 0 overflow, 0 raw LaTeX, branding on-brand, 30 takeaway cards, 15 dense (unchanged) |
| Hugo 0.111.3 | post 200, deck 200, web app 200, bundle zip 200 |
| Rendered post | 0 "rung"; `Stage 0`–`Stage 5` all present |
| `notebook.ipynb` | valid JSON, 55 cells |
| `analysis.py`, `cheatsheet_python.py` | compile |
| `web_app/app.js` | `node --check` passes |

## Deliberately out of scope

**The R edition still says "rung"** — `content/post/r_sc_dsc_sdid/index.md` (42) and its deck
(11). The scope chosen was the Python bundle only. The two posts cross-link, so a reader moving
between them will meet both words for the same idea. Renaming the R edition is a one-command
follow-up if that inconsistency is unwanted.

The ES/JA stubs needed no change — they are translated title-and-summary cards and never
contained the word.
