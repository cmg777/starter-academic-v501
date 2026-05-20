# Render-and-fix recipes for `write-quarto-notebook-python`

The Phase 4 render-and-fix loop runs `quarto render tutorial.qmd` in
the post's `references/` directory and inspects stderr. This file is
the catalog of recognised error patterns and the corresponding
auto-fixes. Apply the matching recipe and retry, up to 3 total render
attempts.

If an error doesn't match any pattern below, **stop** and report the
raw error to the user. Do not invent fixes for unrecognised errors.

---

## Bundle-specific patterns (unique to this skill)

### `Jupyter kernel '<slug>-tutorial' not found`

Quarto resolved the YAML `jupyter:` field to a kernel name but no
matching kernelspec is registered. Two sub-cases:

1. **`setup_env.py` was not run on this machine yet.** Run it
   explicitly from the `references/` directory:

   ```bash
   python3 setup_env.py
   ```

   then retry the render.

2. **`setup_env.py` ran but `register_kernel()` failed silently.**
   Check `~/Library/Jupyter/kernels/<slug>-tutorial/` (macOS) or
   `~/AppData/Roaming/jupyter/kernels/<slug>-tutorial/` (Windows). If
   the directory exists but `kernel.json` has a stale path, delete
   the directory and re-run `setup_env.py`. If `setup_env.py` errors,
   surface the error and stop.

### `Path(sys.executable).resolve() ... assertion failed` (in `setup-packages` chunk)

The verification chunk inside `tutorial.qmd` asserts that the kernel
is running inside `.venv/`. If the assertion fails, the wrong Python
is in use. Two fixes:

1. **`QUARTO_PYTHON` not set.** The wrapper scripts export
   `QUARTO_PYTHON=$PWD/.venv/bin/python` before invoking
   `quarto render`. If the user invoked `quarto render` directly
   without the wrapper, set the env var manually:

   ```bash
   export QUARTO_PYTHON="$PWD/.venv/bin/python"
   quarto render tutorial.qmd
   ```

2. **`.venv` doesn't exist yet.** Run `python3 setup_env.py` first.

### `Library not loaded: @rpath/libpython3.X.dylib`

The user's outer Python is uv-managed standalone CPython, whose
generated venvs have a broken rpath. `setup_env.py`'s `_probe_candidate`
should catch this and the `find_compatible_python()` relaunch should
kick in. If it didn't (because the user has *only* uv-standalone
Pythons), surface the error and instruct the user to install a regular
Python from python.org, Homebrew, or miniforge.

### Stale `.venv/` blocks setup

If the user previously ran `setup_env.py` with a different Python (or
without pip), `ensure_venv()` rebuilds the venv when
`_venv_matches_outer()` returns False. If the auto-fix doesn't kick in
(e.g., venv looks healthy but contents are corrupted), instruct the
user to `rm -rf .venv/` and re-run `setup_env.py`.

---

## Python errors (general)

### `ModuleNotFoundError: No module named 'X'`

A `{python}` chunk imports a module that wasn't installed by
`setup_env.py`. Two sub-cases:

1. **Direct import not in `PINNED`.** Add `X` (with PyPI name resolved
   if needed: `sklearn` → `scikit-learn`, `PIL` → `Pillow`, `cv2` →
   `opencv-python`) to `PINNED` in `setup_env.py`. Probe the dev-machine
   version via `importlib.metadata.version("X")`. Re-run
   `setup_env.py` (now installs the new package into the venv) and
   retry the render.

2. **Module exists in venv but not on PATH for kernel.** Check
   `python3 -c "import X"` from inside the venv (`.venv/bin/python
   -c "import X"`). If the import works there, the kernel registration
   has gone stale — delete the kernelspec
   (`jupyter kernelspec uninstall <slug>-tutorial -f`) and re-run
   `setup_env.py`.

### `ImportError: cannot import name 'X' from 'Y'`

Version mismatch: the installed `Y` does not have symbol `X`. Pin the
exact version in `setup_env.py`'s `PINNED` dict and re-run. The
companion `script.py` is the canonical source for which version
worked.

### `kernel died` / `KernelInterrupted`

The Python kernel crashed mid-render. Two sub-cases:

1. **Out of memory.** Surface as a recommendation: add
   `#| cache: true` to the slow chunk, or reduce iteration counts in
   the chunk body. Not auto-fixable.
2. **C extension segfault.** Often a library version mismatch
   (incompatible numpy + numba). Stop and report; ask the user to
   align versions in `script.py`.

### `Could not find a version that satisfies the requirement pkg==x.y.z`

The pinned version is not on PyPI or has been yanked. Auto-fix:

1. Locate the entry in `PINNED` inside `setup_env.py`.
2. Drop the `==version` for that package OR replace with the nearest
   available version (look at `pip install pkg== 2>&1` output for the
   list).
3. Re-run `setup_env.py`, retry the render.
4. Add a `[~]` line to the verification report listing the
   substitution.

---

## Quarto-level errors

### `Mermaid syntax error`

Common fixes:

- Replace `subgraph IDENTIFIER ["Title"]` with `subgraph "Title"`.
- Replace HTML `<br/>` line breaks with literal `\n` inside node
  labels.
- Ensure all nodes referenced by edges have been defined.

If still failing after 1 retry, fall back: replace the Mermaid block
with `<!-- mermaid omitted: <reason> -->` and record the omission in
the verification report.

### `Cannot find LaTeX command \X` / `MathJax could not parse`

A math expression uses an escape sequence MathJax doesn't recognise.
Most often a missed `\\` → `\` transform from `transformations.md` §2.
Re-scan every math span and apply the substitutions more
aggressively. Watch for `\\big` / `\\Big` survivors, `\\,` inside
`\sum_{...}`, and `\\^\*` survivors.

Last resort: replace the bad math span with a
`<!-- math: <description> -->` placeholder and surface in the
verification report.

### `Duplicate chunk label 'X'`

Two chunks share a `#| label:`. Renumber the second occurrence
(`-2`, `-3`, etc.).

### `Cannot create directory` / write-permission errors

The renderer doesn't have write permission to `tutorial_files/`.
Surface as a real error; not auto-fixable.

---

## Pinned-version install failures

If `setup_env.py`'s `ensure_packages_in_venv()` fails with a
`subprocess.CalledProcessError` while installing `pkg==version`:

1. **Wheel not available for platform.** Check the Intel-wheel catalog
   (`intel-wheel-catalog.md`). If the package is listed, the catalog
   pin should have been applied already — investigate why it wasn't.
   If the package is NOT listed, the Intel pin is a candidate new
   catalog entry. Surface as `[✗]` and instruct the user to either
   downgrade the package manually or add a catalog entry.

2. **Version yanked from PyPI.** Drop the `==version` for that
   package in `PINNED`. Surface as `[~]`.

3. **Network failure.** Retry once. If it still fails, surface as
   `[✗]` and instruct the user to check connectivity.

---

## When NOT to retry

- If `quarto render` succeeds but the verification chunk's assertion
  fails (Path(sys.executable).resolve() not in .venv) — this means
  Quarto picked a different kernel than expected. Investigate the
  `QUARTO_PYTHON` env var and the kernel registration; do not
  silently retry.

- If `setup_env.py`'s preflight rejects the outer Python (no
  compatible 3.10-3.13 found) — the user must install a working
  Python; the skill cannot fix that.

- If 3 render attempts have already been made on the same error
  pattern — escalate to the user.

---

## Fallback policy

When a recognised error survives 3 retries, or when an unrecognised
error appears on attempt 1:

1. **Do not delete the `.qmd`, `setup_env.py`, or any bundle file.**
2. **Do not modify `index.md`** (Phase 7 only runs on success).
3. **Surface `[✗]` lines** in the Phase 8 verification report.
4. **Print the last 30 lines of stderr.**
5. **Offer follow-ups**: "open the `.qmd` to inspect", "re-run with
   `--no-render`", "open `setup_env.py` to inspect `PINNED`".
