# write-quarto-notebook skill — new agentic skill + version pinning

**Date:** 2026-05-17

## Motivation

After hand-converting `r_causalpolicy_workshop/index.md` to a Quarto
notebook (`tutorial.qmd`) earlier today (see
`2026-05-17-r-causalpolicy-quarto-tutorial.md`), Carlos asked for the
conversion process to be codified as a reusable agentic skill that
works for R, Python, and Stata posts. The skill must render the
produced `.qmd` locally to verify it works, and pin every top-level
package to the exact version installed on the developer's machine so
that future re-renders reproduce the published numbers bit-for-bit.

A grep across `.claude/skills/` confirmed no existing skill touched
Quarto — the new `write-quarto-notebook` skill fills a real gap in the
project's eight-skill pipeline (Write/Review across script, results
report, post, infographic). It slots in after `write-post` and
`review-post` as a parallel "executable companion" stage.

## What was built

### `.claude/skills/write-quarto-notebook/`

Six-phase contract: pre-flight (with language detection + tooling
check + **package-version probe**) → mandatory scope confirmation →
generate `.qmd` → render-and-fix loop (max 3 attempts with an auto-fix
catalog) → optional `index.md` link addition → verification report
with follow-up offers.

```
.claude/skills/write-quarto-notebook/
├── SKILL.md                         464 lines  — main contract, six phases, invocation patterns, acceptance tests
└── references/
    ├── language-conventions.md      290 lines  — YAML templates + setup-chunk patterns for R / Python / Stata; "Version pinning policy" section
    ├── transformations.md           240 lines  — 11 transformation passes (math escape, mermaid, links, output drops, figure inlining, Hugo shortcodes, concept cards, drop list)
    ├── render-and-fix.md            340 lines  — auto-fix catalog for R / Python / Stata / Quarto-level errors; pinned-version install failure recipes
    └── verification-checklist.md    215 lines  — mandatory + soft checks, three report templates, follow-up offer templates
```

**Output conventions** (codified per language to match existing
precedents in the repo):

| Language | Output path | Quarto theme | Engine |
|---|---|---|---|
| R | `content/post/<slug>/tutorial.qmd` | `darkly` | (knitr default) |
| Python | `content/post/<slug>/references/tutorial.qmd` | `cosmo` | `jupyter: python3` |
| Stata | `content/post/<slug>/references/tutorial.qmd` | `cosmo` | `jupyter: nbstata` |

**Invocation**: `/project:write-quarto-notebook <slug> [--no-render] [--no-link]`.

### Version pinning (replicability layer)

The setup-packages chunk in every generated `.qmd` installs **exact
versions** of top-level packages so re-renders months later produce
the same numerical output. Source of truth for versions: probe the
developer's currently-installed packages at skill-run time via
`Rscript -e 'packageVersion("pkg")'` / `python -c
'importlib.metadata.version("pkg")'`. By induction, whatever is
installed on the box running the skill is what was used to render the
published post — there is no other ground truth (no `renv.lock` or
`requirements.txt` exists in this repo).

R install mechanism inside the `.qmd`:
```r
if (!requireNamespace("pak", quietly = TRUE)) install.packages("pak")
pak::pkg_install(c("tidyverse@2.0.0", "sandwich@3.1.1", ...))
library(tidyverse); library(sandwich); ...
set.seed(42)
```

Python install mechanism:
```python
PINNED = {"pandas": "2.2.0", "scikit-learn": "1.4.1", ...}
for pkg, want in PINNED.items():
    have = importlib.metadata.version(pkg) if installed else None
    if have != want:
        pip install f"{pkg}=={want}"
```

Stata is exempt — SSC user-contributed packages have no canonical
version field. The skill documents that limitation in the scope block
and emits `ssc install` lines as comments with the developer's install
date (from `which <pkg>`) as a best-effort record.

**Failure handling**: when a pinned version is unavailable (yanked
from PyPI, archived from CRAN), the Phase 4 render-fix loop drops the
pin for just that one package and surfaces the substitution as a `[~]`
soft warning in the verification report. Three new auto-fix recipes
catalogued in `references/render-and-fix.md`.

### Retrofit of `r_causalpolicy_workshop/tutorial.qmd`

The existing `tutorial.qmd` was retrofitted with the new pinned setup
chunk. Pinned versions (probed from the developer's R installation):

| Package | Pinned version |
|---|---|
| tidyverse | 2.0.0 |
| sandwich | 3.1.1 |
| lmtest | 0.9.40 |
| tidysynth | 0.2.1 |
| fpp3 | 1.0.3 |
| mice | 3.17.0 |
| ranger | 0.17.0 |
| CausalImpact | 1.3.0 |
| broom | 1.0.8 |
| glue | 1.8.0 |
| forcats | 1.0.0 |

The `§3 Setup and packages` prose was also rewritten to explain the
replicability rationale.

A bug in the original `tutorial.qmd` (committed in `924da61`) was
caught and fixed during the skill's acceptance test: the §10.8
`sc-nested` chunk used `unnest(.outcome) |> select(... real_y,
synth_y)`, but `.outcome` only carries `real_y` — `synth_y` lives in
the sister `.synthetic_control` list-column. Fixed by switching to
`grab_synthetic_control(placebo = TRUE)`. The pattern was added to
`render-and-fix.md` as a recipe so future skill operators recognise
it.

## Verification

- **Skill self-consistency**: `SKILL.md` + four `references/` files
  read end-to-end; phases are unambiguous, auto-fix recipes are
  specific.
- **Acceptance test (R reproduction)**: rendered the retrofitted
  `r_causalpolicy_workshop/tutorial.qmd` end-to-end via `quarto
  render`. Render succeeded in 88s (includes `pak` bootstrap install
  on first run). 13 figures regenerated inline. `tutorial.html`
  produced at 233 KB.
- **Numerical reproducibility check**: the rendered HTML contains:
  - Synthetic Control ATT = -18.85 packs (matches published post)
  - California MSPE ratio = 124, rank 1 of 39 (matches "about 124"
    in published post)
  - Fisher exact p-value = 0.0256 (matches published post)
  - Georgia (runner-up MSPE ratio) = 47.2 (matches published post)
- **Python and Stata smoke tests**: documented as acceptance tests in
  `SKILL.md` but **deferred** in this build pass. Both require
  language-specific Jupyter kernels (`python3`, `nbstata`) installed
  on the rendering machine; will be exercised when the first Python
  / Stata post is converted.

## Files in this commit

- `.claude/skills/write-quarto-notebook/SKILL.md` — new
- `.claude/skills/write-quarto-notebook/references/language-conventions.md` — new
- `.claude/skills/write-quarto-notebook/references/transformations.md` — new
- `.claude/skills/write-quarto-notebook/references/render-and-fix.md` — new
- `.claude/skills/write-quarto-notebook/references/verification-checklist.md` — new
- `content/post/r_causalpolicy_workshop/tutorial.qmd` — retrofitted setup chunk + sc-nested bug fix
- `CLAUDE.md` — new skill added to the eight-skill table and dedicated section
- `README.md` — new skill added to the project-level skills overview
- `logs/2026-05-17-write-quarto-notebook-skill.md` — this file
