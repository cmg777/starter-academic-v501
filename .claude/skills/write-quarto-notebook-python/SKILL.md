---
name: write-quarto-notebook-python
description: Generate a friction-free executable Quarto bundle from an existing Python blog post. Beyond a plain tutorial.qmd, the skill ships a hermetic .venv bootstrap (setup_env.py with preflight + auto-relaunch), responsive-figure CSS, one-click render wrappers (.command + .bat), and a downloadable ZIP that students can extract and render in two clicks. Probes pinned versions from the dev machine with macOS Intel wheel-availability overrides. Confirms scope before writing.
argument-hint: "<post slug> [--no-render] [--no-link]"
disable-model-invocation: true
user-invocable: true
---

# Write Quarto Notebook (Python): friction-free bundle for a published post

Produce a **complete, friction-free Quarto bundle** from an existing
Python tutorial post on carlos-mendez.org. The student downloads a
single ZIP, extracts it, double-clicks `render.command` (macOS) or
`render.bat` (Windows), and sees the rendered tutorial in their browser
— with no Python installation gymnastics, no kernel registration, no
Positron interpreter selection.

This skill runs **parallel** to `write-quarto-notebook` (which keeps a
lighter Python branch alongside R + Stata). The two patterns coexist:
use `write-quarto-notebook` for posts where chunk-time `pip install`
inside the kernel is fine; use this skill for student-facing tutorials
where the friction-free bundle pattern matters.

The bundle pattern was validated end-to-end on
`content/post/python_pyfixest/` in May 2026 over 8 iterations. This
skill codifies the final result so any Python post can produce the same
deliverable.

---

## What this skill does NOT do

- **Does not write or modify prose, equations, or section structure.**
  The Hugo `index.md` is the authoritative source of all narrative
  content; the skill copies it verbatim with a small set of mechanical
  transforms.
- **Does not rewrite `script.py`.** The companion script remains the
  canonical execution record; the skill never edits it.
- **Does not commit or push.** It leaves the new files (and the
  modified `index.md`) in the working tree and offers a follow-up
  commit message. The user runs the commit.
- **Does not render or commit `tutorial.html`.** The `.qmd` and bundle
  are the source-of-truth artifacts; the reader renders locally on
  demand.
- **Does not build a `featured.png` or AI podcast clip.** Existing
  skills handle those.

---

## Example invocations

```
# Standard run: probe versions, write all 7 bundle files, render, build
# ZIP, verify in tempdir, update index.md link.
/project:write-quarto-notebook-python python_pyfixest
/project:write-quarto-notebook-python python_pca

# Skip render + tempdir verification + index.md update. Useful when
# offline or when iterating on the YAML/setup_env without rendering.
/project:write-quarto-notebook-python python_doubleml --no-render

# Render and build ZIP, but do NOT modify index.md's links: block.
/project:write-quarto-notebook-python python_pca --no-link
```

---

## Deliverables

Every successful run produces these eight artifacts:

| Path | Purpose |
|---|---|
| `content/post/<slug>/references/tutorial.qmd` | Executable Quarto notebook (jupyter: `<slug>-tutorial`; responsive-figure CSS in header) |
| `content/post/<slug>/references/setup_env.py` | Hermetic `.venv` bootstrap + preflight + auto-relaunch + kernel registration |
| `content/post/<slug>/references/_quarto.yml` | Wires `setup_env.py` to Quarto's `pre-render` hook |
| `content/post/<slug>/references/render.command` | macOS one-click wrapper (executable) |
| `content/post/<slug>/references/render.bat` | Windows one-click wrapper |
| `content/post/<slug>/references/README.md` | Bundle README (prerequisites, how-to, troubleshooting) |
| `content/post/<slug>/build_bundle.sh` | Bash packager that produces the ZIP |
| `content/post/<slug>/<slug>.zip` | Downloadable bundle (7 files inside `<slug>/`) |

Plus the `index.md` update (Phase 7), unless `--no-link` is given.

---

## Site color palette

Apply when the skill needs to generate *new* matplotlib code (rare —
the source script is the canonical visual style).

| Name | Hex | Use |
|------|-----|-----|
| Steel blue | `#6a9bcc` | Primary data |
| Warm orange | `#d97757` | Reference lines, treated unit |
| Near black | `#141413` | Annotations |
| Teal | `#00d4c8` | Highlights (sparingly) |
| Dark navy | `#0f1729` | Dark-theme figure background |

---

## Phase 1: Pre-flight

### 1.1 Parse arguments

Parse `$ARGUMENTS` into:

- **Slug** — the first positional token (e.g. `python_pyfixest`).
  Mandatory.
- **`--no-render`** — skip Phase 4 (render), Phase 6 (tempdir test),
  and Phase 7 (index.md link). Phases 1–3 + 5 still run (the bundle
  is built but unverified). Default: render is mandatory.
- **`--no-link`** — skip Phase 7 only. Phases 4–6 still run.

Reject any other argument or flag with a clear error.

### 1.2 Locate the post

The post directory is `content/post/<slug>/`. Error out if it does
not exist.

### 1.3 Verify required inputs

- `content/post/<slug>/index.md` must exist.
- `content/post/<slug>/script.py` must exist.

If `script.py` is missing, stop and tell the user to run
`/project:write-script <topic> dataset: <dataset>` first.

### 1.4 Check tooling

- Run `quarto --version`. Require ≥ 1.4. If missing, stop.
- Run `python3 -c "import sys; print(sys.version_info[:2])"`. Require
  3.10–3.13. If outside that range, the skill can still write the
  bundle but cannot verify it; surface as an ambiguity.

### 1.5 Detect prior outputs

Compute the target output paths. If any of these already exist, ask
the user whether to overwrite. Do not silently clobber:

- `content/post/<slug>/references/tutorial.qmd`
- `content/post/<slug>/references/setup_env.py`
- `content/post/<slug>/<slug>.zip`

### 1.6 Read source materials

Read `index.md` (the authoritative prose source) and `script.py`
end-to-end. Count code blocks, figures, mermaid blocks, and math
expressions in `index.md` so you can report the totals in the scope
block.

### 1.7 Parse imports + probe versions

Extract top-level imports from `script.py`:

- `import X` and `from X import ...` lines at zero indentation.
- Resolve PyPI names where they differ from import names. Common
  mappings: `sklearn` → `scikit-learn`, `PIL` → `Pillow`, `cv2` →
  `opencv-python`, `skimage` → `scikit-image`, `bs4` →
  `beautifulsoup4`, `yaml` → `PyYAML`.

Probe each version on the developer's machine (single batch call):

```bash
python3 -c '
import importlib.metadata as m
pkgs = ["pkg1", "pkg2", ...]
for p in pkgs:
    try:
        print(p, m.version(p))
    except m.PackageNotFoundError:
        print(p, "NOT_INSTALLED")
'
```

Anything reporting `NOT_INSTALLED` is logged for the scope block.

### 1.8 Apply Intel-wheel catalog overrides

Read `references/intel-wheel-catalog.md`. Compute the **trigger set**:

- Top-level imports from `script.py`, plus
- A small fixed list of packages known to pull in catalog entries
  transitively (currently: `pyfixest`, `statsmodels`, `sktime`,
  `umap`).

For each catalog row, check whether **Triggered by** ∩ trigger set is
non-empty. If yes, add the row's `{package: last Intel-wheel
version}` to `PINNED` (tagged `[Intel-override]` in the scope
block).

### 1.9 Build the final `PINNED` dict

In this order, for stable ordering:

1. Direct imports from `script.py`, alphabetized, with probed
   versions. Skip `NOT_INSTALLED` entries (surface as warnings).
2. Intel-override transitive pins from §1.8.
3. Bootstrap: `jupyter` and `ipykernel` (always last). Probe the
   dev-machine versions or default to the latest if not installed.

### 1.10 Handling missing packages

If §1.7 reports `NOT_INSTALLED` for any direct import, surface in
the scope block under **Could not probe** and ask the user whether
to:

1. Install the package now and re-run the skill, OR
2. Omit the version pin for that one package (the entry in
   `setup_env.py`'s `PINNED` becomes a comment so the bundle still
   builds but the version is not enforced).

Default to option 1 if the user doesn't override.

---

## Phase 2: Confirm scope (MANDATORY)

Before writing anything, print a structured scope block and wait for
explicit user confirmation. Use this template literally:

```
SCOPE
=====
Post slug:        <slug>
Kernel name:      <slug>-tutorial
Source files:
  - content/post/<slug>/index.md   (<N> lines)
  - content/post/<slug>/script.py  (<M> lines)

Bundle output paths:
  - content/post/<slug>/references/tutorial.qmd
  - content/post/<slug>/references/setup_env.py
  - content/post/<slug>/references/_quarto.yml
  - content/post/<slug>/references/render.command
  - content/post/<slug>/references/render.bat
  - content/post/<slug>/references/README.md
  - content/post/<slug>/build_bundle.sh
  - content/post/<slug>/<slug>.zip

Render step:           will run | SKIPPED (--no-render)
Tempdir verification:  will run | SKIPPED (--no-render)
index.md link update:  will run | SKIPPED (--no-render | --no-link)

Content detected in index.md:
  - Sections:                <K>
  - Python code blocks:      <a>
  - Mermaid diagrams:        <b>
  - Figure references (PNG): <c>
  - Display math equations:  <d>

Tooling check:
  - quarto:    <version>
  - python3:   <version>

PINNED dict for setup_env.py:
  <pkg>           <version>    [probed]
  <pkg>           <version>    [probed]
  ...
  numba           0.62.1       [Intel-override; triggered by pyfixest]
  llvmlite        0.45.0       [Intel-override; transitive via numba]
  jupyter         <version>    [bootstrap]
  ipykernel       <version>    [bootstrap]

Could not probe:
  - <list any package the probe reported NOT_INSTALLED, with action plan>

Ambiguities (if any):
  - <list anything that needs human judgment>

Proceed? (y / explain change / cancel)
```

Wait for `y` before continuing. If the user replies with a change
request, adjust and re-print the scope block.

---

## Phase 3: Generate the bundle source files

Write seven files. See `references/templates/` for canonical templates.

### 3.1 `content/post/<slug>/references/tutorial.qmd`

Apply the five transformation passes from
[`references/transformations.md`](references/transformations.md):

1. YAML front matter (use `templates/tutorial.qmd.partial.yaml`;
   substitute `<TITLE>`, `<SUBTITLE>`, `<DATE>`, `<KERNEL_NAME>`).
2. Math escape.
3. Mermaid blocks.
4. Internal link rewriting.
5. Code-fence rewriting (`{python}` for executable; drop ` ```text `
   blocks; keep `bash`/`yaml`/`r`/`stata` as bare fences).

Synthesize the `setup-packages` chunk as a verification-only chunk
(asserts `.venv` in `sys.executable.parts`; lists headline packages
OK/MISMATCH). See `transformations.md` §5 for the template.

Append the "Source files" footer.

### 3.2 `content/post/<slug>/references/setup_env.py`

Copy `templates/setup_env.py.template` and substitute:

- `<PINNED_DICT>` ← the Python literal for the dict computed in
  §1.9, formatted with one entry per line and column-aligned values
  (12-char key column).
- `<KERNEL_NAME>` ← `<slug>-tutorial`
- `<KERNEL_DISPLAY>` ← human-readable form (e.g. "PyFixest
  Tutorial", "Python PCA Tutorial"). Title-case the slug after
  stripping the `python_` prefix.

### 3.3 `content/post/<slug>/references/_quarto.yml`

Copy `templates/_quarto.yml.template` verbatim (no substitutions).

### 3.4 `content/post/<slug>/references/render.command`

Copy `templates/render.command.template` verbatim. `chmod +x` after
writing.

### 3.5 `content/post/<slug>/references/render.bat`

Copy `templates/render.bat.template` verbatim.

### 3.6 `content/post/<slug>/references/README.md`

Copy `templates/README.md.template` and substitute:

- `<TITLE>` ← Hugo `title` from `index.md`
- `<SLUG>` ← the post slug
- `<KERNEL_NAME>` ← `<slug>-tutorial`

### 3.7 `content/post/<slug>/build_bundle.sh`

Copy `templates/build_bundle.sh.template` verbatim. The template
derives `SLUG` from `basename "${POST_DIR}"`, so no substitutions are
needed. `chmod +x` after writing.

---

## Phase 4: Render-and-fix loop (max 3 attempts)

Skip if `--no-render` was given.

Run from the `references/` directory:

```bash
cd content/post/<slug>/references
python3 setup_env.py 2>&1     # one-time setup (idempotent on re-runs)
quarto render tutorial.qmd 2>&1
```

If `quarto render` exits 0, continue to Phase 5.

If it exits non-zero, classify the stderr against
[`references/render-and-fix.md`](references/render-and-fix.md). The
catalog covers Python errors (ModuleNotFoundError, ImportError,
kernel-died, pinned-version-unavailable), Quarto errors (Mermaid,
MathJax, duplicate labels), and bundle-specific patterns (kernel not
found, Path resolution assertion, uv-standalone rpath, stale venv).

Apply the matching fix and retry. After 3 failed attempts, stop and
report (do not delete any bundle file).

---

## Phase 5: Build the ZIP bundle

Run:

```bash
bash content/post/<slug>/build_bundle.sh
```

The script copies the seven source files into a staged `<slug>/`
folder under `mktemp`, `chmod +x`s `render.command`, and produces
`content/post/<slug>/<slug>.zip`.

Verify with `unzip -l`:

- Exactly 7 file entries inside `<slug>/` (plus the bare `<slug>/`
  directory entry).
- No `__MACOSX/`, no `.DS_Store`.
- No `.venv/`, no `tutorial.html`, no `tutorial_files/`.

If the ZIP is malformed, surface as `[✗]` in Phase 8 and abort
Phases 6–7 (no link entry without a valid ZIP).

---

## Phase 6: Tempdir end-to-end verification

Skip if `--no-render` was given.

Reproduces the "fresh student" experience:

```bash
TEMP=/tmp/<slug>-verify-$(date +%s)
mkdir -p "$TEMP"
unzip -q content/post/<slug>/<slug>.zip -d "$TEMP"
cd "$TEMP/<slug>"
bash render.command 2>&1 | head -200
test -s tutorial.html
cd -
rm -rf "$TEMP"
```

Confirm `tutorial.html` exists and is non-empty (size > 100 KB
typical). If the tempdir render fails, surface the exact error and
**stop before Phase 7** (do not modify `index.md`).

---

## Phase 7: Update `index.md` link

Skip if `--no-link` was given OR Phase 4 / Phase 6 did not succeed.

Insert a `links:` entry into `index.md`'s YAML front matter:

```yaml
- icon: file-code
  icon_pack: fas
  name: "Quarto project (.zip)"
  url: <slug>.zip
```

**Placement rule.** Scan the existing `links:` block in this order:

1. If a Google Colab entry exists and an AI Podcast entry exists,
   insert *between* them.
2. Else if a Google Colab entry exists, insert immediately after it.
3. Else if a `Python script` entry exists, insert immediately after
   it.
4. Else insert as the first entry of `links:`.

**Idempotency / upgrade rule.** If a previous-version entry already
exists — typically `"Quarto (.qmd)"` (from `write-quarto-notebook`) or
`"Tutorial bundle (.zip)"` (from a hand-edited bundle pointing at
`/uploads/<slug>_tutorial.zip`) — rewrite both the `name:`, `url:`,
and `icon:` fields in place. Do not duplicate, do not leave the stale
entry behind.

---

## Phase 8: Verification report + follow-ups

Print a structured `[✓]/[✗]/[~]` block per
[`references/verification-checklist.md`](references/verification-checklist.md).

Offer 2–3 copy-pasteable follow-ups (commit + push, review-post, open
rendered HTML). Do not auto-run any follow-up.

---

## Auto-fix recipes (summary)

Detailed pattern-and-action catalog: see
[`references/render-and-fix.md`](references/render-and-fix.md).

## Transformations applied to `index.md` → `tutorial.qmd`

Detailed transformation rules with examples: see
[`references/transformations.md`](references/transformations.md).

## macOS Intel wheel-availability catalog

Detailed catalog with last-Intel-wheel versions and trigger sets: see
[`references/intel-wheel-catalog.md`](references/intel-wheel-catalog.md).

## Verification checklist

Detailed go/no-go items (used by Phase 8 to decide success/fail) and
follow-up offer templates: see
[`references/verification-checklist.md`](references/verification-checklist.md).

## Templates

The seven canonical templates (one per bundle file): see
[`references/templates/`](references/templates/).

---

## Acceptance tests (for the skill itself)

Run after editing this `SKILL.md` to confirm the contract still
works.

1. **Reproduce `python_pyfixest`.** Move existing
   `content/post/python_pyfixest/references/tutorial.qmd` and
   `setup_env.py` aside to `.before-skill`. Invoke the skill on
   `python_pyfixest`. Expect the regenerated files to be functionally
   identical (modulo whitespace and comment ordering), the ZIP to
   contain 7 files, and the tempdir render to succeed.

2. **Apply to a fresh Python post.** Pick a Python post without a
   current bundle (e.g. `python_doubleml`). Invoke the skill. Expect:
   - 6 source files written into `references/`, plus
     `build_bundle.sh` at the post root.
   - `setup_env.py`'s `PINNED` dict matches the dev-machine's probed
     versions of the script's top-level imports + `jupyter` /
     `ipykernel`.
   - If the script transitively pulls in `numba`, the Intel-override
     is applied automatically.
   - ZIP at `content/post/<slug>/<slug>.zip` with the 7 expected
     entries.
   - Tempdir render produces a non-empty `tutorial.html`.
   - `index.md` gains a `"Quarto project (.zip)"` link entry.

3. **`--no-render` flag.** Invoke with `--no-render`. The skill
   writes all 7 bundle source files, builds the ZIP, *skips* the
   tempdir test, *skips* the `index.md` update, and reports
   `[~] quarto render skipped (--no-render)`.

4. **Idempotent re-run.** Run the skill twice on the same slug.
   Second run should detect existing files and ask before
   overwriting. On `y`, produce identical output (deterministic
   templates + fresh probe).

5. **Intel catalog trigger.** For a script that imports `pyfixest`,
   confirm `PINNED` contains `"numba": "0.62.1"` and `"llvmlite":
   "0.45.0"`. For a script with only `numpy`/`pandas`/`matplotlib`,
   confirm those entries are absent.

6. **Render-fix loop.** Manually break `setup_env.py` by deleting
   one entry from `PINNED` whose import appears in `tutorial.qmd`.
   Re-render via Phase 4. The loop must add the package back
   (probing the dev-machine version) and retry. Surfaces as `[~]` in
   the report.

7. **ZIP round-trip.** After Phase 5, `unzip -l <slug>.zip` shows
   exactly 7 entries inside `<slug>/`: `tutorial.qmd`, `setup_env.py`,
   `_quarto.yml`, `render.command`, `render.bat`, `README.md`,
   `script.py`. Executable bits on `render.command` must survive the
   unzip.
