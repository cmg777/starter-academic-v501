# Render-and-fix recipes for `write-quarto-notebook`

The Phase 4 render-and-fix loop runs `quarto render <path>` and inspects
stderr. This file is the catalog of recognised error patterns and the
corresponding auto-fixes. Apply the matching recipe and retry, up to 3
total render attempts.

If an error doesn't match any pattern below, **stop** and report the raw
error to the user. Do not invent fixes for unrecognised errors --- the
guard against that is exactly what makes this loop safe to run
autonomously.

---

## R errors

### `there is no package called 'X'`

The R chunk references a package that wasn't in the `pacman::p_load(...)`
list. Add `X` to the list and retry. Example:

```
> there is no package called 'forcats'
```

Fix: in the `setup-packages` chunk, add `forcats` to the
`pacman::p_load(...)` call.

### `could not find function "X"`

A function call references a package that *is* loaded but the user may
have forgotten to attach it (i.e., `requireNamespace` without `library`).
Check whether the package is in `pacman::p_load(...)` (which calls
`library` under the hood). If not, add it. Otherwise the function name
may be misspelled --- stop and report.

### `object 'X' not found`

A chunk references a binding that was defined in an earlier chunk that
didn't run (or that uses a different name). Two sub-cases:

1. **Chunk was skipped** --- check whether the earlier chunk has
   `#| eval: false`. If so, remove that flag.
2. **Name mismatch** --- the binding is named differently in the
   referencing chunk. Compare both chunks, pick the canonical name,
   propagate. If unclear, stop.

### `Can't select columns that don't exist. ✖ Column 'X' doesn't exist.`

A `dplyr::select()` call references a column that isn't in the data
frame at that point in the pipe. Most common cause: a chunk unnests a
list-column that only contains a subset of the columns the chunk
expects. Example seen in the wild --- `prop99_syn |> unnest(.outcome)`
exposes `time_unit` and `real_y` but **not** `synth_y` (which lives in
the sister `.synthetic_control` list-column).

Fix recipes:

1. **Drop the missing column from `select()`** if the chunk's purpose
   doesn't strictly need it.
2. **Switch to a higher-level grab helper** that combines the columns
   you want. E.g. `grab_synthetic_control(placebo = TRUE)` exposes both
   `real_y` and `synth_y` directly.
3. **Unnest the right list-column.** Inspect the nested tibble's
   structure (the previous chunk usually prints it) and adjust the
   `unnest(cols = c(...))` argument.

If the column is referenced in an interpretation downstream of the
chunk, also fix the prose so it doesn't claim to show data that isn't
displayed. Retry render.

### `Duplicate chunk label 'X'`

Two chunks share a `#| label:` value. Renumber the second occurrence by
appending `-2`, `-3`, etc. Example: if both `fig-trends` chunks exist,
rename the second to `fig-trends-2`.

### `Cannot find LaTeX command \X` / `MathJax could not parse`

A math expression uses an escape sequence MathJax doesn't recognise.
Most often a missed `\\` → `\` transform. Re-scan every `$$...$$` and
`$...$` block, apply the transformations from
[`transformations.md`](transformations.md) §2 more aggressively. In
particular, watch for:

- `\\big` / `\\Big` survivors
- `\\,` inside `\arg\min_{...}` or `\sum_{...}` clauses
- `\\^\*` survivors

If after retry the same math chunk still fails, switch the bracket from
`$$ ... $$` to `\\[ ... \\]` (both work in MathJax but some edge cases
parse differently). Last resort: replace the bad math span with a
`<!-- math: <description> -->` placeholder and surface in the
verification report.

---

## Python errors

### `ModuleNotFoundError: No module named 'X'`

The `ensure(...)` setup loop didn't list `X` (or listed it under the
wrong PyPI name). Add a new entry to the `for spec in [...]` list. Remember:

- `scikit-learn` PyPI name → `sklearn` import name → `ensure("scikit-learn", "sklearn")`
- `Pillow` PyPI name → `PIL` import name → `ensure("Pillow", "PIL")`
- `opencv-python` PyPI name → `cv2` import name → `ensure("opencv-python", "cv2")`

Retry. If still failing, the user's Python environment is locked
(e.g., conda env, system Python without write access). Stop and surface
the install hint.

### `ImportError: cannot import name 'X' from 'Y'`

Version mismatch: the installed `Y` does not have symbol `X`. Pin the
version: `ensure("Y==<version>")`. Find the right version by checking
the companion `script.py` for any `# requires Y >= ...` comments, or by
looking at the published post's "Setup" section.

### `kernel died` / `KernelInterrupted`

The Python kernel crashed mid-render. Two sub-cases:

1. **Out of memory** --- a chunk allocated too much. Stop and report.
   This is a structural issue, not auto-fixable.
2. **C extension segfault** --- often a library version mismatch. Stop
   and report; ask the user to align versions in `script.py`.

### `RuntimeError: Jupyter cannot find a kernel for ...`

The `jupyter: python3` line in YAML references a kernel that Jupyter
can't find. Probe via `jupyter kernelspec list`. If the user's default
kernel is named differently (e.g., `python3.11`), update the YAML to
match. Retry.

---

## Stata errors

### `nbstata kernel not found` / `kernelspec 'nbstata' not found`

The `nbstata` Jupyter kernel is not installed. **Stop**, do not retry.
Surface the install hint to the user:

```
The Stata Quarto notebook requires the `nbstata` Jupyter kernel:

  pip install nbstata
  python -m nbstata.install

Make sure `stata`, `stata-mp`, or `stata-se` is on your PATH first.
nbstata also needs a working Stata license.

Once installed, re-run: /project:write-quarto-notebook <slug>
```

### `command X is unrecognized`

A Stata user-contributed command is referenced but not installed. The
fix is *not* automatic --- `ssc install` requires user judgment about
which source (SSC, net, GitHub). Stop and surface:

```
The .qmd references the Stata command `X`. Add this to the setup chunk:

  ssc install X, replace

(or net install X, from(...) if X lives outside SSC).
```

### `file <X> not found`

The .do file references a data file via relative path. The renderer's
working directory may be different from the post directory. Fix by
rewriting the path to the GitHub raw URL (Stata can read URLs over HTTP
since 13+):

```stata
use "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/<file>.dta", clear
```

Retry.

### `graph export X.png` produces zero-byte file

Stata's `graph export` to PNG can fail silently if no graph is active.
Add `graph display, name(my_graph)` before the export, or use the
`name()` option on the most recent `twoway`/`tsline` to keep the graph
addressable. Retry.

---

## Quarto-level errors

### `Mermaid syntax error`

The Mermaid renderer in Quarto (via Pandoc filter) is stricter than
GitHub's. Common fixes:

- Replace `subgraph IDENTIFIER ["Title"]` with `subgraph "Title"`.
- Replace HTML `<br/>` line breaks with literal `\n` inside node
  labels.
- Ensure all nodes referenced by edges have been defined.

If still failing after 1 retry, fall back: replace the Mermaid block
with a comment placeholder `<!-- mermaid omitted: <reason> -->` and
record the omission in the verification report.

### `Citeproc could not find ...`

The post uses `[@key]` citation syntax but no `.bib` file is configured.
The Hugo posts cite via markdown links, not citeproc, so this should
never trigger. If it does, the source has a stray citeproc reference
--- strip it.

### `Cannot create directory`

The renderer doesn't have write permission to `<output>_files/`. Check
that the post directory is writable. Surface as a real error; not
auto-fixable.

### Out-of-memory / `cannot allocate memory of size X`

The MICE imputation, CausalImpact MCMC, or a large bootstrap loop
exceeded available RAM. Two non-auto-fix mitigations to surface:

- Reduce iterations: edit the chunk to use fewer MICE imputations
  (`m = 1` instead of `m = 5`) or fewer MCMC samples.
- Add `#| cache: true` to the slow chunk and re-render (cached output
  survives subsequent renders).

Surface as a recommendation, not an auto-fix.

---

## Pinned-version install failures

The setup-packages chunk pins every top-level package to a specific
version (see [`language-conventions.md`](language-conventions.md) §
Version pinning policy). When a pinned version is no longer available
--- yanked from PyPI, archived from CRAN, or missing a binary for the
user's platform --- the install step fails. The Phase 4 render-fix
loop must drop the pin for that one package, retry, and surface the
substitution in the verification report.

### R: `package 'pkg' is not available at version 'x.y.z'` (pak)

`pak::pkg_install("tidysynth@0.2.1")` returns an error indicating the
exact version cannot be located on CRAN or its mirrors.

Auto-fix:

1. Locate the offending entry in the `pak::pkg_install(c(...))` vector
   inside the setup-packages chunk.
2. Drop the `@version` suffix for just that one package:
   `"tidysynth"` instead of `"tidysynth@0.2.1"`.
3. Retry the render. `pak` will install the latest available version.
4. Add a `[~]` line to the verification report:
   ```
   [~] tidysynth pinned to <latest, e.g. 0.2.0> instead of 0.2.1
       (requested version not available on CRAN)
   ```
5. Add an inline comment in the setup chunk so the next render is
   transparent:
   ```r
   "tidysynth",  # was tidysynth@0.2.1; not available on CRAN as of <date>
   ```

If retrying with the drop-pinned version *still* fails (package
fully removed from CRAN), try the CRAN archive recipe below before
giving up.

### R: `404 Not Found` on CRAN install URL

The package was archived from CRAN entirely. `pak` cannot reach it via
the standard repos. Fall back to the CRAN archive's tarball URL:

```r
pak::pkg_install("https://cran.r-project.org/src/contrib/Archive/<pkg>/<pkg>_<x.y.z>.tar.gz")
```

For example:
```r
pak::pkg_install("https://cran.r-project.org/src/contrib/Archive/tidysynth/tidysynth_0.2.0.tar.gz")
```

Retry. If the archive URL also 404s, the version is fully unavailable
--- stop and report.

### Python: `Could not find a version that satisfies the requirement pkg==x.y.z`

The pinned version is not on PyPI or has been yanked.

Auto-fix:

1. Locate the offending entry in the `PINNED = { ... }` dict inside
   the setup-packages chunk.
2. Remove that entry from `PINNED`.
3. Replace it with an `ensure_unpinned(pkg)` call before the loop, or
   add an explicit `try/except` clause that falls back to latest:
   ```python
   for pkg, want in PINNED.items():
       try:
           subprocess.check_call(
               [sys.executable, "-m", "pip", "install", f"{pkg}=={want}"])
       except subprocess.CalledProcessError:
           subprocess.check_call(
               [sys.executable, "-m", "pip", "install", pkg])
   ```
4. Retry the render.
5. Add a `[~]` line to the verification report listing the substitution.

### When NOT to retry

If the developer's machine itself doesn't have the pinned version
installed (Phase 1.8's probe reported `NOT_INSTALLED`), the pin was
fabricated upstream --- do **not** silently retry. Stop, surface the
probe gap, and ask the user to either install the package locally or
explicitly opt into the unpinned install.

---

## Fallback policy

When a recognised error survives 3 retries, or when an unrecognised
error appears on attempt 1:

1. **Do not delete the `.qmd`.** The user will want to inspect.
2. **Do not modify `index.md`.** The link entry is only added on a
   successful render.
3. **Surface the verification report with `[✗]` lines.** The Phase 6
   report makes the failure visible.
4. **Print the last 30 lines of stderr** so the user has the raw error
   for manual debugging.
5. **Offer two follow-ups**: "open the `.qmd` to inspect" and
   "re-run with `--no-render` to skip the render step".
