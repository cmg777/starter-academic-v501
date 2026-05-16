---
name: write-quarto-notebook
description: Generate a self-contained Quarto notebook (.qmd) from an existing R / Python / Stata blog post + companion script on carlos-mendez.org. Renders the notebook locally to verify it works, then adds a "Quarto (.qmd)" link button to the post's front matter. Confirms scope before writing.
argument-hint: "<post slug> [--no-render] [--no-link]"
disable-model-invocation: true
user-invocable: true
---

# Write Quarto Notebook: executable companion for a published post

Produce a **single, self-contained Quarto notebook** (`tutorial.qmd`) that a
reader can open in Positron or RStudio, hit *Render*, and reproduce the entire
tutorial --- prose, code, output, and figures --- with no setup beyond a
working R / Python / Stata installation.

This skill closes a gap left by the other writing skills:
- `write-script` produces a runnable script (`analysis.R` / `script.py` /
  `analysis.do`) with no prose.
- `write-post` produces a Hugo-rendered post (`index.md`) with prose but not
  executable end-to-end.
- `notebook.ipynb` is wired for Google Colab/IRkernel, not local Positron/RStudio.

The Quarto notebook is a **third artifact**: copy the prose from `index.md`,
copy the clean code blocks from `index.md` (which are the didactic versions of
the companion script), drop the static output blocks, regenerate every figure
inline, and let Quarto execute everything from a single file.

**Supported languages:** R, Python, Stata (auto-detected from slug + companion
script).

## What this skill does NOT do

- **Does not write or modify prose, equations, or section structure.** The
  Hugo `index.md` is the authoritative source of all narrative content; the
  skill copies it verbatim with a small set of mechanical transforms.
- **Does not rewrite the companion script.** `analysis.R` / `script.py` /
  `analysis.do` remain the canonical execution record; the skill never edits
  them.
- **Does not commit or push.** It leaves the new file (and the modified
  `index.md`) in the working tree and offers a follow-up commit message. The
  user runs the commit.
- **Does not render or commit `tutorial.html`.** The `.qmd` is the
  source-of-truth artifact; the reader renders locally on demand.
- **Does not build a `featured.png` or AI podcast clip.** Existing skills
  handle those.

---

## Example invocations

```
# R post (companion script is analysis.R)
/project:write-quarto-notebook r_causalpolicy_workshop
/project:write-quarto-notebook r_did

# Python post (companion script is script.py)
/project:write-quarto-notebook python_doubleml
/project:write-quarto-notebook python_dowhy

# Stata post (companion script is analysis.do)
/project:write-quarto-notebook stata_rct
/project:write-quarto-notebook stata_cate2

# Skip the render step (useful for offline / unsupported environment)
/project:write-quarto-notebook r_causalpolicy_workshop --no-render

# Render but do NOT modify index.md's links: block
/project:write-quarto-notebook r_causalpolicy_workshop --no-link
```

---

## Deliverables

| Language | Output path | Quarto theme | Engine line in YAML |
|---|---|---|---|
| R | `content/post/<slug>/tutorial.qmd` | `darkly` | (none --- knitr is default) |
| Python | `content/post/<slug>/references/tutorial.qmd` | `cosmo` | `jupyter: python3` |
| Stata | `content/post/<slug>/references/tutorial.qmd` | `cosmo` | `jupyter: nbstata` |

These conventions are pinned to existing precedents:
- R: `content/post/r_demeaning_twfe/tutorial.qmd`, `content/post/r_dynamic_bma/tutorial.qmd`
- Python: `content/post/python_EconML/references/tutorial-econml-resource-curse.qmd`
- Stata: `content/post/stata_cate2/references/tutorial-cate-resource-curse.qmd`

On success the skill also modifies `content/post/<slug>/index.md`: a new
`links:` entry with `icon: file-code`, `name: "Quarto (.qmd)"`, pointing at
the GitHub raw URL of the new file. See **Phase 5** for the placement rule.

---

## Site color palette

The same palette used by `write-script` and `write-post`. Apply it when the
skill needs to *generate new* ggplot/matplotlib code (e.g., a figure chunk
that lives in the source script but is missing from `index.md`).

| Name | Hex | Use |
|------|-----|-----|
| Steel blue | `#6a9bcc` | Primary data |
| Warm orange | `#d97757` | Reference lines, treated unit |
| Near black | `#141413` | Annotations |
| Teal | `#00d4c8` | Highlights (sparingly) |
| Dark navy | `#0f1729` | Dark-theme figure background |
| Grid line | `#1f2b5e` | Dark-theme grid |
| Light text | `#c8d0e0` | Dark-theme axis text |
| White text | `#e8ecf2` | Dark-theme titles |

The R `darkly` Quarto theme renders the *page* on a dark background; default
ggplot figures stay on a *light* panel by default (matching
`r_demeaning_twfe/tutorial.qmd`). Do not force a dark ggplot theme unless the
companion `analysis.R` explicitly does so.

---

## Phase 1: Pre-flight

### 1.1 Parse arguments

Parse `$ARGUMENTS` into:

- **Slug** --- the first positional token (e.g. `r_causalpolicy_workshop`).
  Mandatory.
- **`--no-render`** --- skip Phase 4 (render-and-fix). Default: render is
  mandatory; the skill is not considered successful until `quarto render`
  exits 0.
- **`--no-link`** --- skip Phase 5 (add link entry to `index.md`). Default:
  the link entry is added after a successful render.

Reject any other argument or flag with a clear error.

### 1.2 Locate the post

The post directory is `content/post/<slug>/`. Error out if it does not
exist.

### 1.3 Detect language

Apply these rules in order:

1. If `analysis.R` exists in the post directory → **R**.
2. If `script.py` exists → **Python**.
3. If `analysis.do` exists → **Stata**.
4. Otherwise inspect slug prefix: `r_*` → R, `python_*` → Python,
   `stata_*` → Stata.
5. If still ambiguous (e.g. multiple scripts) → stop and ask the user
   which language to use.

### 1.4 Verify required inputs

`content/post/<slug>/index.md` must exist (always required).

The matching companion script must exist (R: `analysis.R`, Python:
`script.py`, Stata: `analysis.do`). If missing, stop and tell the user to
run `/project:write-script` first.

### 1.5 Detect prior outputs

Compute the target output path (see the **Deliverables** table). If the
file already exists, ask the user whether to overwrite. Do not silently
clobber.

### 1.6 Check tooling

Run `quarto --version`. The skill requires Quarto ≥ 1.4. If missing, stop
and tell the user to install Quarto from <https://quarto.org/docs/get-started/>.

Language-specific tooling checks (only if Phase 4 will run):

- **R**: no parse-time check required. The setup-packages chunk in the
  generated `.qmd` will bootstrap `pacman` and install missing CRAN
  packages on first render.
- **Python**: confirm a Python with a Jupyter kernel exists. `quarto check
  jupyter` is the canonical probe. If absent, surface a clear "install
  jupyter: `pip install jupyter`" error and stop (unless `--no-render`).
- **Stata**: confirm the `nbstata` Jupyter kernel is installed. Probe with
  `jupyter kernelspec list | grep -i stata`. If absent, surface "install
  nbstata: `pip install nbstata && python -m nbstata.install`" and stop
  (unless `--no-render`).

### 1.7 Read source materials

Read `index.md` (the authoritative prose source) and the companion script
end-to-end. Count code blocks, figures, mermaid blocks, and math
expressions in `index.md` so you can report the totals in the scope block.

### 1.8 Probe installed package versions (for replicability)

The generated `.qmd` pins **exact versions** of every top-level package
so the notebook produces the same numbers when re-rendered months or
years later. The ground truth is whatever is installed on the
developer's machine *right now* --- that, by induction, is the
environment that produced the published post. See
[`references/language-conventions.md`](references/language-conventions.md)
§ Version pinning policy for the rationale.

Extract the top-level package list from the companion script:

- **R**: parse `pacman::p_load(...)` (or `library(...)` calls if pacman
  isn't used) from `analysis.R`. Collect every package name.
- **Python**: parse top-level `import X` and `from X import ...` lines
  from `script.py`. Resolve PyPI names where they differ from import
  names (e.g. `sklearn` → `scikit-learn`, `PIL` → `Pillow`,
  `cv2` → `opencv-python`).
- **Stata**: **skip** --- Stata SSC packages have no canonical version
  field. The skill notes this limitation in the scope block but does
  not try to pin Stata user-contributed packages.

Probe each version on the developer's machine:

- **R**, single batch call (fast):
  ```bash
  Rscript -e 'pkgs <- c("tidyverse","sandwich","lmtest",...); \
              for (p in pkgs) cat(sprintf("%s %s\n", p, \
                tryCatch(as.character(packageVersion(p)), \
                         error = function(e) "NOT_INSTALLED")))'
  ```
- **Python**, single batch call:
  ```bash
  python -c 'import importlib.metadata as m; \
             pkgs = ["pandas","numpy",...]; \
             [print(p, (m.version(p) if True else "NOT_INSTALLED")) \
              for p in pkgs]'
  ```
  (with proper try/except around each `m.version(p)`).

Capture the output as a dictionary `{pkg: version}`. Anything reporting
`NOT_INSTALLED` is logged for the scope block.

**Handling missing packages.** If the probe reports `NOT_INSTALLED` for
any package, surface it in the scope block under **Could not probe**.
Do not fabricate a version. Ask the user whether to:

1. Install the package now and re-run the skill, OR
2. Omit the version pin for that one package (the generated setup
   chunk uses `pak::pkg_install("pkg")` without `@version`, letting
   pak pick the latest version at render time).

Default to option 1 if the user doesn't override.

---

## Phase 2: Confirm scope (MANDATORY)

Before writing anything, print a structured scope block and wait for
explicit user confirmation. Use this template literally:

```
SCOPE
=====
Post slug:        <slug>
Detected language: R | Python | Stata
Source files:
  - content/post/<slug>/index.md   (<N> lines)
  - content/post/<slug>/<script>   (<M> lines)
Output file:      <output path from Deliverables table>
Quarto theme:     darkly | cosmo
Engine:           knitr (R) | jupyter: python3 | jupyter: nbstata
Render step:      will run | SKIPPED (--no-render)
Index.md link:    will be added | SKIPPED (--no-link)

Content detected in index.md:
  - Sections:   <K>
  - R code blocks (```r):       <a>
  - Python code blocks:         <b>
  - Stata code blocks:          <c>
  - Mermaid diagrams:           <d>
  - Figure references (PNG):    <e>
  - Display math equations:     <f>

Tooling check:
  - quarto:    <version>
  - language:  <ok | error message>

Pinned versions (top-level, will appear in setup-packages chunk):
  - tidyverse@2.0.0
  - sandwich@3.1.1
  - lmtest@0.9.40
  - <... one line per top-level package, with the probed version ...>
Could not probe:
  - <list any package the probe reported NOT_INSTALLED, with action plan>
  (skipped entirely for Stata — SSC has no canonical version field)

Ambiguities (if any):
  - <list anything that needs human judgment>

Proceed? (y / explain change / cancel)
```

Wait for `y` before continuing. If the user replies with a change request,
adjust and re-print the scope block.

---

## Phase 3: Generate the .qmd

Five transformation passes on the source `index.md`. Detailed rules live in
[`references/transformations.md`](references/transformations.md); the
checklist below is the executable summary.

### 3.1 Write the YAML front matter

Use the language-specific template from
[`references/language-conventions.md`](references/language-conventions.md).
All three languages share these fields:

```yaml
title: <copy from index.md front-matter `title`>
subtitle: <one-line summary from index.md `summary` field, truncated to ~80 chars>
author: "Carlos Mendez"
date: <copy from index.md `date`, formatted as YYYY-MM-DD>
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    code-summary: "Show code"
    fig-width: 9
    fig-height: 5.5
    fig-dpi: 300
execute:
  warning: false
  message: false
```

Then add language-specific lines:
- **R**: `theme: darkly` (under `format.html`).
- **Python**: `theme: cosmo`, `embed-resources: true`, top-level
  `jupyter: python3`.
- **Stata**: `theme: cosmo`, `embed-resources: true`, top-level
  `jupyter: nbstata`.

### 3.2 Translate the section body

Walk `index.md` section by section. For each line, apply this dispatch
table:

| Source line type | Action |
|---|---|
| Prose, headings, tables, blockquotes | Copy verbatim |
| Display math (`$$...$$`) | Apply math-escape transform (see below) |
| Inline math (`$...$`) | Apply math-escape transform |
| ` ```mermaid ` fence | Rewrite to ` ```{mermaid} ` (Quarto-native) |
| ` ```r ` / ` ```python ` / ` ```stata ` fence | Rewrite to ` ```{r} ` / ` ```{python} ` / ` ```{stata} `, add `#| label:` |
| ` ```text ` output block | **Drop entirely** --- Quarto re-executes and prints |
| `![alt](figN.png)` line | Replace with the chunk that *generates* the figure (lift from companion script if missing from index.md) |
| Internal site link `/post/foo/` | Rewrite to `https://carlos-mendez.org/post/foo/` |
| Hugo shortcode `{{< ... >}}` | Drop or convert (see transformations.md) |

**Math-escape transform.** Goldmark + Hugo double-escapes backslashes
inside `$$...$$`; Quarto's MathJax doesn't need that. Apply these
substitutions to every math span:
- `\\,` → `\,`     (thin space)
- `\\*` → `*` (or `^*` if it follows `^`)
- `\\{` → `\{`
- `\\}` → `\}`
- `\\^\*` → `^*`
- `\\Big` → `\Big`, `\\big` → `\big`

**Chunk labels.** Every code chunk gets `#| label: <slug>` where slug is
predictable:
- `setup-packages` for the first chunk
- `data-download` for the data-loading chunk
- `data-<entity>` for derived datasets (e.g. `data-california`)
- `fit-<method>` for model fits (`fit-did`, `fit-arima`, `fit-rdd`,
  `fit-naive`)
- `fig-<purpose>` for figure-producing chunks (`fig-raw-series`,
  `fig-forest`)
- `<topic>-<role>` for everything else (`its-arima-gap`, `sc-balance`)

Figure chunks also get `#| fig-cap: "<alt text from index.md>"` and an
optional `#| fig-height` / `#| fig-width` override if the figure needs
extra room.

### 3.3 Synthesize the setup-packages chunk

This is the first executable chunk of the notebook --- positioned before
the data-download chunk and after any "Overview / Potential outcomes"
prose. It pins **the exact versions probed in Phase 1.8** so the
notebook is bit-reproducible when re-rendered on a fresh machine months
later. Templates by language:

**R**: use `pak::pkg_install("pkg@version")` with the versions captured
in Phase 1.8. Substitute the probed versions in the vector below.
(The example shows `r_causalpolicy_workshop`'s actual pin list.)

```r
#| label: setup-packages

# Install pak (the fast modern installer) if missing. pak is the only
# bootstrap dependency; everything else gets pinned-version installs.
if (!requireNamespace("pak", quietly = TRUE)) {
  install.packages("pak", repos = "https://cloud.r-project.org")
}

# Install the EXACT versions used when this post was published.
# Pinning fosters replicability: a reader who renders this notebook on
# any machine, any future date, gets the same numbers as the original.
pak::pkg_install(c(
  "tidyverse@2.0.0",
  "sandwich@3.1.1",
  "lmtest@0.9.40",
  "tidysynth@0.2.1",
  "fpp3@1.0.3",
  "mice@3.17.0",
  "ranger@0.17.0",
  "CausalImpact@1.3.0",
  "broom@1.0.8",
  "glue@1.8.0",
  "forcats@1.0.0"
))

# Attach the packages we use directly.
library(tidyverse); library(sandwich); library(lmtest)
library(tidysynth); library(fpp3);     library(mice)
library(ranger);    library(CausalImpact)
library(broom);     library(glue);     library(forcats)

set.seed(42)
```

**Python**: probe-then-install pattern. Reinstall only when the
installed version differs from the pin (saves time on warm machines).

```python
#| label: setup-packages

import subprocess, sys, importlib.metadata

# {PyPI name: pinned version}. Substitute the versions probed in Phase 1.8.
PINNED = {
    "pandas":       "2.2.0",
    "numpy":        "1.26.4",
    "scikit-learn": "1.4.1",
    # ... one entry per top-level import from script.py ...
}

# Some PyPI names differ from their import names. The probe in Phase 1.8
# resolves these; record them here so version checks use the right key.
IMPORT_NAME = {"scikit-learn": "sklearn", "Pillow": "PIL",
                "opencv-python": "cv2"}

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
random.seed(42); np.random.seed(42)
```

**Stata**: version pinning is not supported (SSC has no canonical
version field). The setup chunk emits the `ssc install` lines as
comments with a clear note about the limitation, and --- if available
--- the developer's install dates from `which <package>` as a
best-effort record.

```stata
* Version pinning is not supported for Stata user-contributed packages
* via `ssc install` --- SSC has no canonical version field. To replicate
* exactly, note the install dates from `which <package>` after first
* install. The skill records the developer's install dates inline below.
*
* Run these once on a fresh machine:
* ssc install <package>, replace   // dev installed YYYY-MM-DD per `which`
```

### 3.4 Wire the data-download chunk

Find the data file referenced by the companion script. If the data lives
in the post directory (e.g. `proposition99.rds`, `dataSIM4RCT.dta`,
`Iris.csv`) hard-code the **GitHub raw URL** of this project:

```
https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/<filename>
```

Wrap the download in a `if (!file.exists(...))` guard so re-renders skip
the network call. For external dataset URLs, leave the script's existing
download logic intact.

### 3.5 Add the "Source files" footer

Append a short final section to the `.qmd`:

```markdown
## Source files

- Companion script: [`<script>`](https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/<script>)
- Published post: <https://carlos-mendez.org/post/<slug>/>
- GitHub repo: <https://github.com/cmg777/starter-academic-v501>
```

Write the assembled `.qmd` to the target path.

---

## Phase 4: Render-and-fix loop (max 3 attempts)

Skip this phase if `--no-render` was given.

Run from the post directory (so caches and figure outputs land in the
right place):

```bash
cd content/post/<slug>      # (R) the .qmd lives here directly
# OR
cd content/post/<slug>/references   # (Python / Stata) .qmd is one level deeper
quarto render tutorial.qmd 2>&1
```

If the command exits 0 → continue to Phase 5.

If it exits non-zero, classify the stderr against the auto-fix catalog in
[`references/render-and-fix.md`](references/render-and-fix.md), apply the
matching fix, and retry. The most common patterns are summarised here:

| Error pattern | Auto-fix |
|---|---|
| `there is no package called 'X'` (R) | Add `X` to the `pak::pkg_install(...)` vector with the probed version (re-run the Phase 1.8 probe for that one package), retry. |
| `ModuleNotFoundError: No module named 'X'` (Python) | Add `X` to the `PINNED` dict with the probed version, retry. |
| `pak: package 'pkg' not available at version 'x.y.z'` | Drop the `@version` suffix for that package on retry (install latest). Surface the substitution in the verification report as a `[~]` line: `pkg pinned to <latest> instead of <wanted>`. |
| `Could not find a version that satisfies the requirement pkg==x.y.z` (pip) | Drop the `==version` for that package on retry. Surface the substitution in the verification report. |
| `404 Not Found` on CRAN install URL | Fall back to the CRAN archive direct URL: `pak::pkg_install("https://cran.r-project.org/src/contrib/Archive/pkg/pkg_x.y.z.tar.gz")`. Retry. |
| `nbstata kernel not found` | Stop; print "install nbstata: `pip install nbstata && python -m nbstata.install`". |
| `Duplicate chunk label '<label>'` | Renumber the offending labels, retry. |
| `Unknown LaTeX command \X` or "MathJax could not parse" | Re-apply math-escape transform aggressively, retry. |
| `object '<x>' not found` inside a figure chunk | Hoist the data-prep used by an earlier chunk into the failing one, retry. |
| `Can't select columns that don't exist` (R, dplyr) | Inspect the list-column being unnested; switch to a higher-level grab helper if available (e.g. tidysynth `grab_synthetic_control()`), retry. |
| `Mermaid syntax error` | Fall back to a static PNG generated via `mermaid-cli` if available, otherwise drop the diagram with a `<!-- mermaid block omitted: <reason> -->` placeholder. |
| Anything else | Stop. Print the raw error to the user. |

After 3 failed attempts (or any unrecognised error) stop and report. **Do
not** silently leave a broken `.qmd` behind --- but also do not delete it
(the user will want to inspect).

---

## Phase 5: Add the link to index.md (default: yes)

Skip this phase if `--no-link` was given OR Phase 4 did not succeed.

Insert a `links:` entry into `index.md`'s YAML front matter. Use this
exact template, substituting `<slug>` and `<output-path-relative-to-slug>`:

```yaml
- icon: file-code
  icon_pack: fas
  name: "Quarto (.qmd)"
  url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/<output-path-relative-to-slug>
```

For R the URL ends in `/tutorial.qmd`; for Python and Stata it ends in
`/references/tutorial.qmd`.

**Placement rule.** Scan the existing `links:` block in this order:

1. If a Google Colab entry exists and an AI Podcast entry exists, insert
   the new entry *between* them.
2. Else if a Google Colab entry exists, insert immediately after it.
3. Else if a script entry exists (`R script`, `Python script`, `Stata script`),
   insert immediately after it.
4. Else insert as the first entry of `links:`.

If a "Quarto (.qmd)" entry already exists, update its URL in place and do
not duplicate.

---

## Phase 6: Verification report + follow-ups

Print a structured success block:

```
Verification
============
[✓] tutorial.qmd written to <path>             (<N> lines)
[✓] quarto render succeeded                    (<elapsed>s)
[✓] tutorial.html produced                     (<K> figures inline)
[✓] index.md links: entry inserted             (between <prev> and <next>)
[~] All pinned versions installed cleanly      (or list any pkg that
                                                fell back to latest)
```

Use `[✗]` for any step that was skipped (with the reason) or failed.
Use `[~]` for soft warnings (e.g. one pinned version was unavailable
and got substituted by the render-fix loop --- not a failure, but
worth surfacing).

Then offer 2–3 follow-up actions, written so the user can copy-paste:

```
Follow-ups
----------
1. Review the published post for consistency with the new notebook:
   /project:review-post <slug>

2. Commit and push (Netlify auto-deploys):
   git add content/post/<slug>/<output-path> content/post/<slug>/index.md \
           logs/<YYYY-MM-DD>-<slug>-quarto.md
   git commit -m "<slug>: add Quarto tutorial for local execution"
   git push origin master

3. Open the rendered notebook locally:
   open content/post/<slug>/<output-path-no-extension>.html
```

Do not auto-run any follow-up. The skill ends here.

---

## Auto-fix recipes (summary)

Detailed pattern-and-action catalog: see
[`references/render-and-fix.md`](references/render-and-fix.md).

## Language conventions (summary)

Detailed YAML templates, chunk-fence syntax, engine-specific gotchas: see
[`references/language-conventions.md`](references/language-conventions.md).

## Transformations applied to index.md → tutorial.qmd

Detailed transformation rules with examples: see
[`references/transformations.md`](references/transformations.md).

## Verification checklist

Detailed go/no-go items (used by Phase 6 to decide success/fail) and
follow-up offer templates: see
[`references/verification-checklist.md`](references/verification-checklist.md).

---

## Acceptance tests (for the skill itself)

Run after editing this `SKILL.md` to confirm the contract still works.

1. **R reproduction.** Move
   `content/post/r_causalpolicy_workshop/tutorial.qmd` aside to
   `tutorial.qmd.before-skill`. Invoke
   `/project:write-quarto-notebook r_causalpolicy_workshop`. The regenerated
   file must render cleanly and structurally match the backup (line count
   within ±10%, same number of chunks, same `#| label:` slugs).
2. **Python smoke.** Pick a `python_*` post (e.g. `python_doubleml` if it
   lacks a `references/tutorial.qmd`). Invoke the skill. The generated
   `.qmd` must use `jupyter: python3` and render in the project's Python
   environment.
3. **Stata smoke.** Pick a `stata_*` post (e.g. `stata_rct`). Invoke the
   skill. The generated `.qmd` must use `jupyter: nbstata`. If `nbstata`
   is not installed locally, the skill must surface the install hint and
   stop before writing a broken file.
4. **Render-fix loop.** Manually inject `library(does_not_exist)` into a
   generated `.qmd`, re-render via Phase 4. The loop must add the package
   to `pacman::p_load(...)` (and fail cleanly when the package truly does
   not exist).
5. **`--no-render` flag.** `/project:write-quarto-notebook <slug> --no-render`
   writes the `.qmd`, prints `[✗] render: skipped (--no-render)` in the
   verification report, and does **not** modify `index.md`.
