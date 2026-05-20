# Verification checklist for `write-quarto-notebook-python`

The Phase 8 verification report uses the items in this file to decide
pass/fail and to assemble the follow-up offer. Each line in the report
is either `[✓]`, `[✗]`, or `[~]` (skipped).

---

## Mandatory checks (must all pass for `[✓]` overall)

### Bundle source files (Phase 3)

- [ ] **`tutorial.qmd`** written to
  `content/post/<slug>/references/tutorial.qmd`.
- [ ] **`setup_env.py`** written to
  `content/post/<slug>/references/setup_env.py`.
  - `KERNEL_NAME` field equals `<slug>-tutorial`.
  - `PINNED` is non-empty and contains at minimum `jupyter` +
    `ipykernel`.
- [ ] **`_quarto.yml`** written to
  `content/post/<slug>/references/_quarto.yml`.
  - Contains `pre-render: python3 setup_env.py`.
- [ ] **`render.command`** written to
  `content/post/<slug>/references/render.command` (executable).
- [ ] **`render.bat`** written to
  `content/post/<slug>/references/render.bat`.
- [ ] **`README.md`** written to
  `content/post/<slug>/references/README.md`.
  - First line is `# <slug> — Quarto project`.
- [ ] **`build_bundle.sh`** written to
  `content/post/<slug>/build_bundle.sh` (executable).

### Render (only if Phase 4 ran)

- [ ] **`quarto render tutorial.qmd` exited 0** on attempt ≤ 3 from
  the `references/` directory.
- [ ] **`tutorial.html`** produced in `references/`.
- [ ] **`setup-packages` verification chunk** confirms `.venv` in
  `sys.executable.parts` and lists all PINNED packages as `[OK]`.

### ZIP bundle (Phase 5)

- [ ] **`<slug>.zip`** exists at `content/post/<slug>/<slug>.zip`.
- [ ] **`unzip -l` shows exactly 7 file entries inside `<slug>/`**:
  - `tutorial.qmd`
  - `setup_env.py`
  - `_quarto.yml`
  - `render.command` (executable bits preserved)
  - `render.bat`
  - `README.md`
  - `script.py`
- [ ] **No `__MACOSX/`, no `.DS_Store`** entries.
- [ ] **No `.venv/` in the ZIP** (must not zip a real working dir).
- [ ] **No render outputs** (`tutorial.html`, `tutorial_files/`).

### Tempdir end-to-end test (Phase 6)

- [ ] **`/tmp/<slug>-verify-<timestamp>/<slug>/`** populated from
  `unzip` and contains all 7 files.
- [ ] **`bash render.command`** (or `python3 setup_env.py && quarto
  render tutorial.qmd`) succeeds in the tempdir.
- [ ] **`tutorial.html`** is produced in the tempdir and is
  non-empty.
- [ ] **Cleanup** — tempdir is removed after the test passes.

### `index.md` update (Phase 7)

- [ ] **`links:` block contains a `Quarto project (.zip)` entry**
  pointing to `<slug>.zip`.
- [ ] **No stale `Quarto (.qmd)` / `Tutorial bundle (.zip)` entry**
  left behind from previous runs.
- [ ] **Existing entries are unchanged** (script, Colab, MD version,
  AI Podcast — whatever was there before — must still be present
  byte-for-byte).

---

## Soft checks (warnings only — do not block `[✓]`)

These are quality signals that can be reported alongside the main
status but don't fail the run.

- [ ] **Every `{python}` chunk has a `#| label:`**.
- [ ] **Every figure chunk has a `#| fig-cap:`** that isn't empty or
  `"TODO"`.
- [ ] **No `\\,` survivors** in math spans (quick regex sweep).
- [ ] **No `/post/<slug>/` relative links** in the body (all rewritten
  to absolute).
- [ ] **No leftover Hugo shortcodes** (`{{< ... >}}` or `{{% ... %}}`).
- [ ] **`include-in-header` CSS block** present in YAML header.
- [ ] **`fig-dpi: 150`** in YAML header (not 300).

---

## Report templates

### Success case (all mandatory `[✓]`)

```
Verification
============
[✓] tutorial.qmd written to references/tutorial.qmd       (<N> lines)
[✓] setup_env.py written; PINNED has <K> packages
[✓] _quarto.yml + render.command + render.bat + README.md + build_bundle.sh written
[✓] quarto render exited 0                                (<elapsed>s, attempt <K>/3)
[✓] tutorial.html produced                                (<F> figures inline)
[✓] <slug>.zip written to content/post/<slug>/<slug>.zip  (<size> KB, 7 files in <slug>/)
[✓] Tempdir end-to-end render succeeded                   (<elapsed>s)
[✓] index.md links: entry inserted                        ("Quarto project (.zip)" → <slug>.zip)

Soft checks:
[~] <any warnings>

Pinned versions in setup_env.py:
  <pkg>           <version>    [probed]
  <pkg>           <version>    [Intel-override]
  jupyter         <version>    [bootstrap]
  ipykernel       <version>    [bootstrap]
```

### Render-failed case

```
Verification
============
[✓] tutorial.qmd written
[✓] setup_env.py written
[✓] _quarto.yml + wrappers + README + build_bundle.sh written
[✗] quarto render failed after 3 attempts

Last error (stderr tail):
<last 30 lines of stderr>

[~] ZIP bundle skipped — render must succeed first.
[~] index.md left untouched — Phase 7 skipped.

What to do:
  1. Open content/post/<slug>/references/tutorial.qmd and inspect the failing chunk.
  2. Inspect content/post/<slug>/references/setup_env.py's PINNED dict.
  3. Re-run setup manually:
       cd content/post/<slug>/references && python3 setup_env.py && quarto render tutorial.qmd
  4. Or re-run the skill with --no-render to keep the bundle:
       /project:write-quarto-notebook-python <slug> --no-render
```

### `--no-render` case

```
Verification
============
[✓] tutorial.qmd written
[✓] setup_env.py written
[✓] _quarto.yml + wrappers + README + build_bundle.sh written
[✓] <slug>.zip built                                       (<size> KB, 7 files in <slug>/)
[~] quarto render skipped (--no-render)
[~] Tempdir end-to-end test skipped (no render)
[~] index.md links: entry skipped (--no-render implies --no-link)
```

---

## Follow-up offer template

After printing the verification report, always print a numbered
follow-up block. Adjust the offers based on which checks passed.

### When everything succeeded

```
Follow-ups
----------
1. Review the published post for consistency with the new notebook:
     /project:review-post <slug>

2. Commit and push (Netlify auto-deploys):
     git add content/post/<slug>/references/ \
             content/post/<slug>/build_bundle.sh \
             content/post/<slug>/<slug>.zip \
             content/post/<slug>/index.md
     git commit -m "<slug>: add Quarto tutorial bundle for local execution"
     git push origin master

3. Open the rendered notebook locally:
     open content/post/<slug>/references/tutorial.html
```

### When render failed

```
Follow-ups
----------
1. Inspect the failing tutorial:
     open content/post/<slug>/references/tutorial.qmd

2. Re-run setup + render manually after editing:
     cd content/post/<slug>/references
     python3 setup_env.py
     quarto render tutorial.qmd

3. Re-run the skill with --no-render to keep the bundle and skip the
   render step entirely (the index.md link will also be skipped):
     /project:write-quarto-notebook-python <slug> --no-render
```

### When `--no-render` was given

```
Follow-ups
----------
1. Render manually from the bundle:
     cd content/post/<slug>/references
     python3 setup_env.py
     quarto render tutorial.qmd

2. If the render succeeds, re-run the skill without --no-render to
   complete the end-to-end test and add the index.md link button:
     /project:write-quarto-notebook-python <slug>
```

---

## What the skill should NOT do after Phase 8

- Open the rendered HTML automatically.
- Commit or push.
- Modify any file other than the seven bundle source files, the
  ZIP, and (optionally) the `index.md`.
- Re-run `quarto render` after Phase 6 even if the user gives a
  positive signal — that's a separate skill invocation.

These restraint rules exist so the skill is safe to run autonomously
without surprising the user.
