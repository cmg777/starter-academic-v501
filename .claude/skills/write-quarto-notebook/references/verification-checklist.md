# Verification checklist for `write-quarto-notebook`

The Phase 6 verification report uses the items in this file to decide
pass/fail and to assemble the follow-up offer. Each line in the report
is either `[✓]`, `[✗]`, or `[~]` (skipped).

---

## Mandatory checks (must all pass for `[✓]` overall)

### Files

- [ ] **`.qmd` written to expected path**
  - R → `content/post/<slug>/tutorial.qmd`
  - Python → `content/post/<slug>/references/tutorial.qmd`
  - Stata → `content/post/<slug>/references/tutorial.qmd`

- [ ] **File line count is sensible** (heuristic: between 50% and 110%
  of the source `index.md` line count; outside that range, surface as
  an ambiguity in the report).

- [ ] **YAML front matter parses** (no syntax error reported by Quarto
  on render). Most reliable check: just run `quarto render` and see.

- [ ] **Setup-packages chunk exists** and is the first executable chunk
  (R uses `pacman::p_load`, Python uses the `ensure(...)` loop, Stata
  has the commented `ssc install` lines).

- [ ] **Data-download chunk exists** with the GitHub raw URL of this
  project (unless the post does not have a data file in its directory).

### Render (only if Phase 4 ran)

- [ ] **`quarto render` exited 0** on attempt ≤ 3.

- [ ] **`tutorial.html` produced** in the same directory as the `.qmd`.

- [ ] **No `[✗]` rows in the language-specific subchecks** (R: every
  ggplot chunk produced a figure; Python: every matplotlib chunk
  produced a figure; Stata: every `graph export` produced a non-empty
  PNG).

- [ ] **Render elapsed time is in expected range**:
  - R: 30s–5min (MICE / MCMC heavy posts run longer)
  - Python: 15s–3min
  - Stata: 30s–10min (Stata is slow)

  If wildly outside (e.g. 30 min), surface as an ambiguity in the
  report but do not fail the check.

### ZIP project bundle (only if Phase 4.5 ran)

- [ ] **`<slug>.zip` exists** at `content/post/<slug>/<slug>.zip`.

- [ ] **`unzip -l` returns exactly 4 file entries inside `<slug>/`**:
  `_quarto.yml`, `tutorial.qmd`, the canonical script (`analysis.R` /
  `script.py` / `analysis.do`), and `README.md`.

- [ ] **No `__MACOSX/`, no `.DS_Store`** entries (would indicate the
  zip ran against a real working directory instead of a `mktemp`
  staging area).

- [ ] **No render outputs in the ZIP** — `tutorial.html` and
  `tutorial_files/` must not appear.

- [ ] **`_quarto.yml` content is correct**: the minimal 2-line stub
  `project:\n  type: default\n`, OR (if the bundle already had a
  `_quarto.yml`) byte-identical to the bundle's pre-existing
  version.

- [ ] **`README.md` header matches** `# <slug> — Quarto project`
  (first line).

- [ ] **ZIP file size in expected range**:
  - R: 25–40 KB
  - Python: 30–60 KB (varies with `script.py` length)
  - Stata: 25–40 KB

### Index.md (only if Phase 5 ran)

- [ ] **`links:` block contains a `Quarto project (.zip)` entry**
  pointing to `<slug>.zip` (bundle-relative, no `https://` prefix).

- [ ] **No stale `Quarto (.qmd)` entry** left behind from a previous
  run of the skill (the upgrade rule renames the old entry in place
  rather than duplicating).

- [ ] **Existing entries are unchanged** (Colab, R script, AI Podcast,
  MD version --- whatever was there before --- must still be present
  byte-for-byte).

---

## Soft checks (warnings only --- do not block `[✓]`)

These are quality signals that can be reported alongside the main
status but don't fail the run.

- [ ] **Every figure has a `#| fig-cap:`** that isn't `"TODO"` or empty.
- [ ] **Every code chunk has a `#| label:`** (or is a `bash` /
  non-executable block).
- [ ] **No `\\,` survivors** in any math span (quick regex sweep).
- [ ] **No `/post/<slug>/` relative links** in the body (all rewritten
  to absolute).
- [ ] **No leftover Hugo shortcodes** (`{{< ... >}}` or `{{% ... %}}`).
- [ ] **No `figN_*.png` references via `knitr::include_graphics` or
  inline `![](...)`** --- all figures must regenerate from chunks.

If any soft check fails, list it as a `[~]` line in the report with a
short explanation. The user may want to fix manually.

---

## Report templates

### Success case (all mandatory `[✓]`)

```
Verification
============
[✓] tutorial.qmd written to <path>             (<N> lines)
[✓] YAML front matter parses
[✓] Setup-packages chunk present
[✓] Data-download chunk present
[✓] quarto render exited 0                     (<elapsed>s, attempt <K>/3)
[✓] tutorial.html produced                     (<F> figures inline)
[✓] <slug>.zip written to <path>               (<size> KB, 4 files in <slug>/)
[✓] index.md links: entry inserted             ("Quarto project (.zip)" → <slug>.zip)

Soft checks:
[~] <any warnings>
```

### Render-failed case

```
Verification
============
[✓] tutorial.qmd written to <path>             (<N> lines)
[✓] YAML front matter parses
[✓] Setup-packages chunk present
[✓] Data-download chunk present
[✗] quarto render failed after 3 attempts

Last error (stderr tail):
<last 30 lines of stderr>

[~] index.md left untouched — Phase 5 skipped (render must succeed first).

What to do:
  1. Open <path> and inspect the failing chunk.
  2. Re-run with --no-render to keep the .qmd as draft:
       /project:write-quarto-notebook <slug> --no-render
  3. Or fix the chunk manually and re-render:
       cd <render-dir> && quarto render tutorial.qmd
```

### `--no-render` case

```
Verification
============
[✓] tutorial.qmd written to <path>             (<N> lines)
[✓] YAML front matter parses
[✓] Setup-packages chunk present
[✓] Data-download chunk present
[~] quarto render skipped (--no-render)
[~] index.md links: entry skipped (--no-render implies --no-link)
```

---

## Follow-up offer template

After printing the verification report, always print a numbered
follow-up block. Adjust the offers based on which checks passed:

### When render and link succeeded

```
Follow-ups
----------
1. Review the published post for consistency with the new notebook:
     /project:review-post <slug>

2. Commit and push (Netlify auto-deploys):
     git add content/post/<slug>/<output-path> \
             content/post/<slug>/<slug>.zip \
             content/post/<slug>/index.md \
             logs/<YYYY-MM-DD>-<slug>-quarto.md
     git commit -m "<slug>: add Quarto tutorial for local execution"
     git push origin master

3. Open the rendered notebook locally:
     open content/post/<slug>/<output-path-no-extension>.html
```

The skill suggests creating a `logs/<date>-<slug>-quarto.md` entry, but
**does not write one automatically** --- that pattern lives in the
user's commit workflow.

### When render failed

```
Follow-ups
----------
1. Inspect the failing .qmd:
     open content/post/<slug>/<output-path>

2. Re-render manually after editing:
     cd content/post/<slug>[/references]
     quarto render tutorial.qmd

3. Re-run the skill with --no-render to keep the draft and skip the
   render step entirely (the index.md link will also be skipped):
     /project:write-quarto-notebook <slug> --no-render
```

### When `--no-render` was given

```
Follow-ups
----------
1. Render the draft manually:
     cd content/post/<slug>[/references]
     quarto render tutorial.qmd

2. If the render succeeds, re-run the skill without --no-render to add
   the index.md link button:
     /project:write-quarto-notebook <slug>
```

---

## What the skill should NOT do after Phase 6

- Open the rendered HTML automatically.
- Commit or push.
- Write the `logs/<date>-<slug>-quarto.md` entry.
- Modify any file other than the `.qmd` and (optionally) the
  `index.md`.
- Re-run quarto render after Phase 4 even if the user gives a positive
  signal --- that's a separate skill invocation.

These restraint rules exist so the skill is safe to run autonomously
without surprising the user.
