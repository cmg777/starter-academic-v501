# macOS Intel wheel-availability catalog

Catalog of Python packages whose latest releases dropped macOS Intel
(x86_64) wheels. When a tutorial's `script.py` directly or transitively
imports any package listed under "Triggered by", `write-quarto-notebook-python`
adds the listed transitive pin to `setup_env.py`'s `PINNED` dict so the
bundle installs from a wheel on macOS Intel (no slow source build, no
LLVM-headers prerequisite).

The catalog is consulted in Phase 1 of the skill. Pin only matched
packages — bundles for scripts that don't pull in these packages stay
lean.

---

## Format

| Package | Last Intel-wheel version | Triggered by (import names) | Notes |
|---|---|---|---|

## Entries

| Package | Last Intel-wheel version | Triggered by | Notes |
|---|---|---|---|
| `numba` | `0.62.1` | `numba`, `pyfixest`, `statsmodels` (>=0.15), `sktime`, `umap` | Numba 0.63+ dropped macOS Intel wheels (cp310–cp313). 0.62.1 covers cp310–cp313 on Intel + Apple Silicon + Linux + Windows. |
| `llvmlite` | `0.45.0` | (transitive via `numba`) | Llvmlite 0.46+ dropped Intel wheels. 0.45.0 is the pair for `numba==0.62.1`. Adds itself automatically when `numba` is in the trigger list. |

---

## How the skill applies the catalog

In Phase 1, after probing the dev-machine versions of the direct
imports from `script.py`:

1. Compute the **trigger set** = the set of top-level imports from
   `script.py` (plus a small fixed list of packages known to pull in
   numba transitively: `pyfixest`, `statsmodels`, `sktime`, `umap`).
2. For each row in the catalog, check whether **Triggered by** ∩ trigger
   set is non-empty.
3. If yes, add the row's `{package: last Intel-wheel version}` pair to
   the `PINNED` dict, even if `package` is not imported directly. The
   transitive `llvmlite` pin is added automatically as a hard dependency
   of `numba`.

The Intel-override pins are tagged `[Intel-override]` in the Phase 2
scope block so the user can see exactly which entries came from the
catalog.

---

## Adding new entries

When a new package drops Intel wheels:

1. Identify the last release with cp310–cp313 macOS Intel wheels (check
   PyPI's "Download files" table or `pip download
   --only-binary=:all: --platform=macosx_10_15_x86_64 pkg==X`).
2. Identify which top-level packages pull it in (direct or transitive).
3. Add a row to the table above.
4. If the new package has its own transitive dependencies that also
   need Intel pins, add those rows too and link them in the "Notes"
   column.

Test the addition by re-rendering an affected tutorial on macOS Intel.

---

## Why not pin proactively for everything

Pinning every potentially-problematic package "just in case" creates
two issues:

- **Stale pins drift.** A package that ships Intel wheels today may
  not need a pin at all next year — and the pinned version becomes
  artificially old when a newer one would work fine.
- **Compatibility constraints.** A pin for one package can force the
  resolver to downgrade unrelated packages. Keeping pins narrow
  (only what's actually needed) minimizes that surface.

The catalog is intentionally short. Most scripts will not trigger any
entries; their `PINNED` dict will contain just the probed direct
imports + `jupyter` + `ipykernel`.

---

## Provenance

The `numba`/`llvmlite` entries were verified during the
`python_pyfixest` iteration 2 (2026-03–05). They are the cause for
the existence of this catalog. See `content/post/python_pyfixest/`
for the original validation.
