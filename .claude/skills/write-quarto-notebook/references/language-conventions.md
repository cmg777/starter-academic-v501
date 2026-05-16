# Language conventions for `write-quarto-notebook`

Quarto YAML front-matter templates, chunk-fence syntax, and pinned-
version setup chunks for the three supported languages. Use the matching
block below as the starting point for Phase 3.1 / Phase 3.3 of the skill.

---

## Version pinning policy

Every generated `.qmd` pins **the exact versions** of every top-level
package to the versions installed on the developer's machine at
skill-run time. This is the project's reproducibility hook: a reader
who clones the repo and renders the `.qmd` on any future date gets the
same numerical output as the original published post.

**Where versions come from.** Phase 1.8 of the skill probes the
developer's machine via:

- **R**: `Rscript -e 'as.character(packageVersion("pkg"))'` per package
  (batched into one call for speed).
- **Python**: `python -c 'import importlib.metadata as m; print(m.version("pkg"))'`
  per package.
- **Stata**: skipped --- SSC packages have no canonical version field.

**Coverage.** Top-level packages only. Anything explicitly listed in
the companion script's `pacman::p_load(...)` block (R) or top-level
`import` statements (Python). Transitive dependencies are not pinned;
they install at whatever the pinned top-levels require.

**Install mechanism inside the `.qmd`.**

- **R**: `pak::pkg_install(c("pkg@x.y.z", ...))` --- fast modern
  installer with binary cache. `pak` itself is the only bootstrap
  dependency.
- **Python**: probe + reinstall when version differs --- skips the
  pip call when the right version is already installed.
- **Stata**: no version pinning; `ssc install` lines stay commented
  with a clear note about the limitation.

**Fallback when a pinned version is unavailable.** If a version has
been yanked from PyPI or archived from CRAN, the Phase 4 render-fix
loop drops the pin for that one package on retry and surfaces the
substitution as a `[~]` line in the verification report. See
[`render-and-fix.md`](render-and-fix.md) § Pinned-version install
failures.

**Determinism, not portability.** Pinning produces the same numbers on
any machine that *can install the pinned versions*. It does not
guarantee the rendered `.qmd` works on every machine --- e.g., a
binary not available for Apple Silicon will force a source build, and
truly archived versions may require manual intervention.

---

## R

**Output path:** `content/post/<slug>/tutorial.qmd` (next to `index.md`).
**Precedent:** `content/post/r_demeaning_twfe/tutorial.qmd`,
`content/post/r_dynamic_bma/tutorial.qmd`.

### Front matter

```yaml
---
title: "<copy from index.md title>"
subtitle: "<one-line summary>"
author: "Carlos Mendez"
date: "<YYYY-MM-DD>"
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    code-summary: "Show code"
    theme: darkly
    fig-width: 9
    fig-height: 5.5
    fig-dpi: 300
execute:
  warning: false
  message: false
---
```

No engine line: knitr is the default for `.qmd` files containing
`{r}` chunks.

### Code chunk syntax

````markdown
```{r}
#| label: fit-rdd

fit_rdd <- lm(cigsale ~ year0 + prepost + year0:prepost,
              data = as_tibble(prop99_ts))
coeftest(fit_rdd, vcov. = vcovHAC)
```
````

### Figure chunk

````markdown
```{r}
#| label: fig-rdd
#| fig-cap: "RDD on time: piecewise pre/post linear fit with level and slope breaks at 1989."

# ... ggplot code ...
```
````

### Setup-packages chunk pattern (pinned versions)

````markdown
```{r}
#| label: setup-packages

# Install pak (the fast modern installer) if missing. pak is the only
# bootstrap dependency; everything else gets pinned-version installs.
if (!requireNamespace("pak", quietly = TRUE)) {
  install.packages("pak", repos = "https://cloud.r-project.org")
}

# Install the EXACT versions used when this post was published.
# Versions come from Phase 1.8's probe of the developer's machine.
pak::pkg_install(c(
  "tidyverse@2.0.0",        # <- substitute every probed version
  "sandwich@3.1.1",
  "lmtest@0.9.40",
  # ... one entry per top-level package ...
  "forcats@1.0.0"
))

# Attach the packages we use directly.
library(tidyverse); library(sandwich); library(lmtest)
# ... library() calls for every pinned package ...
library(forcats)

set.seed(42)
```
````

Notes:

- `pak::pkg_install(c("pkg@version", ...))` is the canonical pinned-
  install call. The `@version` syntax accepts any CRAN-valid version
  string; dots and dashes both work (`3.1.1` and `3.1-1` are
  equivalent).
- Order matters: install before `library()` so the right version is
  attached.
- The setup chunk should also include `set.seed(42)` so any MCMC /
  imputation / bootstrap is deterministic.

### R-specific gotchas

- `darkly` theme renders the *page* on dark background; default ggplot
  panels stay light. **Do not** copy the `theme_site()` function from
  `analysis.R` --- it forces a navy panel that clashes with the rest of
  the rendered page. Use the default `theme_minimal()` or no `theme()`
  call.
- `tidysynth::plot_*()` helpers return ggplot objects; the chunk's last
  expression must be the plot call so Quarto prints it.
- If a chunk binds variables used in a downstream chunk, those bindings
  carry over (knitr persistent session). No need to repeat `library()`
  in every chunk.

---

## Python

**Output path:** `content/post/<slug>/references/tutorial.qmd` (in
`references/` subfolder, as per existing precedent).
**Precedent:** `content/post/python_EconML/references/tutorial-econml-resource-curse.qmd`.

### Front matter

```yaml
---
title: "<copy from index.md title>"
subtitle: "<one-line summary>"
author: "Carlos Mendez"
date: "<YYYY-MM-DD>"
jupyter: python3
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    code-summary: "Show code"
    theme: cosmo
    embed-resources: true
    fig-width: 9
    fig-height: 5.5
    fig-dpi: 300
execute:
  warning: false
  message: false
---
```

### Setup-packages chunk pattern (pinned versions)

````markdown
```{python}
#| label: setup-packages

import subprocess, sys, importlib.metadata

# {PyPI name: pinned version}. Versions come from Phase 1.8's probe.
PINNED = {
    "pandas":       "2.2.0",     # <- substitute every probed version
    "numpy":        "1.26.4",
    "scikit-learn": "1.4.1",
    "statsmodels":  "0.14.1",
    "doubleml":     "0.7.1",
    # ... one entry per top-level import from script.py ...
}

# Some PyPI names differ from import names. Used only if you need to
# detect "installed but wrong version" via __import__ instead of
# importlib.metadata.version() — the latter takes the PyPI name directly.
IMPORT_NAME = {"scikit-learn": "sklearn", "Pillow": "PIL",
               "opencv-python": "cv2"}

# Probe-then-install: skip the pip call when the right version is
# already installed (saves time on warm machines).
for pkg, want in PINNED.items():
    try:
        have = importlib.metadata.version(pkg)
        if have != want:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", f"{pkg}=={want}"])
    except importlib.metadata.PackageNotFoundError:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", f"{pkg}=={want}"])

import random, numpy as np
random.seed(42)
np.random.seed(42)
```
````

Notes:

- `importlib.metadata.version("pkg")` is the canonical version-query in
  Python ≥ 3.8 (no need for `pkg_resources` / `setuptools`).
- The probe-then-install loop is idempotent: re-running the chunk on a
  warm machine is a no-op when versions match.
- For packages with C extensions (numpy, scipy), the pinned version
  must have a wheel for the user's Python + platform; otherwise pip
  falls back to source build (slow but works).

### Figure chunk

````markdown
```{python}
#| label: fig-pre-trends
#| fig-cap: "Pre-trend visual check before fitting DiD."

import matplotlib.pyplot as plt
# ... plotting code ...
plt.show()
```
````

### Python-specific gotchas

- `cosmo` is the default Bootstrap theme; clean light look. Do not
  override unless the source post specifies otherwise.
- The first chunk should also include `%matplotlib inline` only if the
  rest of the project assumes it (check `script.py` first --- Jupyter
  enables inline plots by default in Quarto).
- For data files referenced via relative paths in `script.py`, rewrite
  the path to the GitHub raw URL or copy the file into the `references/`
  subfolder.

---

## Stata

**Output path:** `content/post/<slug>/references/tutorial.qmd`.
**Precedent:** `content/post/stata_cate2/references/tutorial-cate-resource-curse.qmd`.

### Front matter

```yaml
---
title: "<copy from index.md title>"
subtitle: "<one-line summary>"
author: "Carlos Mendez"
date: "<YYYY-MM-DD>"
jupyter: nbstata
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    code-summary: "Show Stata code"
    code-tools: true
    theme: cosmo
    embed-resources: true
    fig-width: 9
    fig-height: 5.5
    fig-dpi: 300
execute:
  warning: false
  message: false
---
```

### Code chunk syntax

````markdown
```{stata}
* Run these once on a fresh machine:
* ssc install ivreg2, replace
* ssc install ranktest, replace
* net install grc1leg, from(http://www.stata.com/users/vwiggins/)

clear all
set seed 42
use "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/<dataset>.dta"
describe
```
````

### Mixing Python and Stata

`nbstata` allows `{python}` chunks in a Stata notebook. Useful for the
final figure assembly when Stata's graph engine is awkward:

````markdown
```{python}
import pandas as pd
df = pd.read_stata("results.dta")
df.plot()
```
````

### Stata-specific gotchas

- `nbstata` requires a **licensed Stata installation** on the renderer's
  machine. The skill's Phase 1.6 must check `jupyter kernelspec list`
  and surface a clear install error if missing.
- Stata figures are saved via `graph export` to PNG, then embedded in
  the rendered HTML. Use `graph export figN.png, replace width(1800)` to
  get a reasonable resolution; Quarto won't auto-display them otherwise.
- Stata 17+ supports `frame` directly; older Stata versions need `import
  delimited` and manual joins. Match the version assumption from the
  source `analysis.do`.
- `ssc install` and `net install` commands belong in a `*` commented
  block at the top of the setup chunk --- the reader uncomments them on
  first run. Do not put them inside an `{stata}` chunk that runs every
  time, because `ssc install` re-installation aborts on repeat.

---

## Cross-language conventions

| Setting | All three languages |
|---|---|
| `toc: true`, `toc-depth: 3` | yes |
| `code-fold: true` | yes |
| `code-summary` | "Show code" (R/Python) or "Show Stata code" (Stata) |
| `fig-dpi: 300` | yes |
| `execute.warning: false`, `execute.message: false` | yes |
| Math: MathJax (default) | yes |
| Mermaid: ```` ```{mermaid} ```` | yes (Quarto renders natively) |

The differences --- theme (darkly vs cosmo), engine line, package-install
chunk syntax --- are the only language-specific bits to vary.
