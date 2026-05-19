# Project-ZIP bundle for `write-quarto-notebook`

> This file is part of the `write-quarto-notebook` skill. Read it
> during Phase 4.5 when building the downloadable project archive.

After a successful render, the skill packages the executable
companion into a single `<slug>.zip` so the reader can unzip it,
open the folder in Positron or RStudio, and start rendering without
prompts. This file documents the recipe and the README template.

---

## Why a ZIP, not a bare .qmd

A bare `tutorial.qmd` download forces Positron / RStudio to prompt
for a project directory on first open. A folder containing
`tutorial.qmd` + a minimal `_quarto.yml` is recognised as a Quarto
project immediately — no prompt. Shipping a ZIP whose contents
extract to `<slug>/{...}` gives the reader that folder structure
"for free".

The pattern was validated on `r_did_ring` in 2026-05-19. The
front-matter button changed from "Quarto (.qmd)" to "Quarto project
(.zip)" and the live behaviour now matches the user's mental model
("click → download → unzip → open in Positron → done").

---

## What goes inside the ZIP

Every ZIP has the same four files inside a top-level folder named
after the post slug:

| Path inside ZIP | Source | Purpose |
|-----------------|--------|---------|
| `<slug>/tutorial.qmd` | copied from the post bundle | Self-contained Quarto notebook |
| `<slug>/<canonical-script>` | copied from the post bundle | Reference / runnable companion (R: `analysis.R`, Python: `script.py`, Stata: `analysis.do`) |
| `<slug>/_quarto.yml` | preserved if it already exists in the bundle, otherwise generated as a 2-line stub | Project marker so Positron / RStudio open the folder as a project |
| `<slug>/README.md` | generated from the language-specific template below | One-page explainer for the reader |

**Not included** (deliberately): data files, render artefacts
(`tutorial.html`, `tutorial_files/`), CSV outputs, PNGs, the
results report, the infographic instructions. The ZIP is the
executable-tutorial deliverable; the published post is the place
to discover everything else.

---

## Recipe (bash, per language)

The recipe is identical for all three languages except for two
copy lines (source paths differ).

### R post

```bash
SLUG="<slug>"
WORK=$(mktemp -d)
mkdir -p "$WORK/$SLUG"

# 1. tutorial.qmd lives next to index.md
cp "content/post/$SLUG/tutorial.qmd" "$WORK/$SLUG/"

# 2. canonical script lives next to index.md
cp "content/post/$SLUG/analysis.R" "$WORK/$SLUG/"

# 3. _quarto.yml: preserve if present, else generate minimal stub
if [ -f "content/post/$SLUG/_quarto.yml" ]; then
  cp "content/post/$SLUG/_quarto.yml" "$WORK/$SLUG/"
else
  printf 'project:\n  type: default\n' > "$WORK/$SLUG/_quarto.yml"
fi

# 4. README.md: generated from the R template below
cat > "$WORK/$SLUG/README.md" <<EOF
... see "README.md template (R)" section below, with placeholders filled in ...
EOF

# 5. zip + relocate to the post bundle root
( cd "$WORK" && zip -r "$SLUG.zip" "$SLUG/" )
mv "$WORK/$SLUG.zip" "content/post/$SLUG/$SLUG.zip"
rm -rf "$WORK"
```

### Python post

Two source-path differences (tutorial in `references/`, canonical
script at root):

```bash
SLUG="<slug>"
WORK=$(mktemp -d)
mkdir -p "$WORK/$SLUG"

cp "content/post/$SLUG/references/tutorial.qmd" "$WORK/$SLUG/"
cp "content/post/$SLUG/script.py"               "$WORK/$SLUG/"

if [ -f "content/post/$SLUG/references/_quarto.yml" ]; then
  cp "content/post/$SLUG/references/_quarto.yml" "$WORK/$SLUG/"
else
  printf 'project:\n  type: default\n' > "$WORK/$SLUG/_quarto.yml"
fi

# Optional: setup_env.py if the pre-render hook exists
if [ -f "content/post/$SLUG/references/setup_env.py" ]; then
  cp "content/post/$SLUG/references/setup_env.py" "$WORK/$SLUG/"
fi

cat > "$WORK/$SLUG/README.md" <<EOF
... see "README.md template (Python)" ...
EOF

( cd "$WORK" && zip -r "$SLUG.zip" "$SLUG/" )
mv "$WORK/$SLUG.zip" "content/post/$SLUG/$SLUG.zip"
rm -rf "$WORK"
```

### Stata post

Same shape as Python, with `analysis.do` instead of `script.py`:

```bash
SLUG="<slug>"
WORK=$(mktemp -d)
mkdir -p "$WORK/$SLUG"

cp "content/post/$SLUG/references/tutorial.qmd" "$WORK/$SLUG/"
cp "content/post/$SLUG/analysis.do"             "$WORK/$SLUG/"

if [ -f "content/post/$SLUG/references/_quarto.yml" ]; then
  cp "content/post/$SLUG/references/_quarto.yml" "$WORK/$SLUG/"
else
  printf 'project:\n  type: default\n' > "$WORK/$SLUG/_quarto.yml"
fi

cat > "$WORK/$SLUG/README.md" <<EOF
... see "README.md template (Stata)" ...
EOF

( cd "$WORK" && zip -r "$SLUG.zip" "$SLUG/" )
mv "$WORK/$SLUG.zip" "content/post/$SLUG/$SLUG.zip"
rm -rf "$WORK"
```

---

## Minimal `_quarto.yml`

Two lines, exactly. Don't add `title`, `format`, or any other
keys here — `tutorial.qmd`'s own YAML front matter carries the
theme, toc-depth, fig-dpi, and engine.

```yaml
project:
  type: default
```

**Preserve-if-present rule.** If the post bundle already contains a
`_quarto.yml` (next to `tutorial.qmd` for R; in `references/` for
Python and Stata), copy it into the ZIP verbatim instead of
generating the stub. This preserves hand-written settings like
`pre-render` hooks. Example: `python_pyfixest/references/_quarto.yml`
has `pre-render: python3 setup_env.py` — losing that would break
the bundled render.

---

## README.md templates

The three templates share the same skeleton with language-specific
substitutions. Replace `<TITLE>`, `<SLUG>`, `<SCRIPT-NAME>`,
`<DATA-NAME>`, `<METHOD-CITATION>`, `<DATA-CITATION>` with values
extracted from the post.

### README.md template (R)

```markdown
# <SLUG> — Quarto project

Executable companion to the blog post:

> **<TITLE>**
> <https://carlos-mendez.org/post/<SLUG>/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, code, output, and figures inline. The didactic, render-and-read version of the tutorial. |
| `<SCRIPT-NAME>` | Canonical companion script — equivalent logic, runnable directly with `Rscript <SCRIPT-NAME>`. Useful if you prefer plain-R execution over rendering. |
| `_quarto.yml` | Minimal Quarto project marker so Positron / RStudio open this folder as a recognised Quarto project (no prompt for a project directory). |
| `README.md` | This file. |

## How to render the tutorial

1. Open this folder in **Positron** or **RStudio**.
2. Open `tutorial.qmd` and click **Render** (or run
   `quarto render tutorial.qmd` from a terminal in this folder).
3. The `setup-packages` chunk pins **exact versions** of every
   top-level R package via `pak::pkg_install("pkg@x.y.z")` and
   installs them on first run (subsequent renders reuse the
   cached versions).
4. The rendered output is `tutorial.html` plus a `tutorial_files/`
   directory of figures. Both are regenerated each time you render.

## How to run the canonical script directly

```bash
Rscript <SCRIPT-NAME> 2>&1 | tee execution_log.txt
```

The script downloads <DATA-NAME> from the GitHub raw URL of the
published post (with a local-file fallback if you place <DATA-NAME>
next to the script).

## Requirements

- **Quarto** ≥ 1.4
- **R** ≥ 4.5
- ~150 MB of CRAN packages on first install (cached after that)

## References

- **Published post:** <https://carlos-mendez.org/post/<SLUG>/>
- **Source repo:** <https://github.com/cmg777/starter-academic-v501>
- **Methodology:** <METHOD-CITATION>
- **Data source:** <DATA-CITATION>
```

### README.md template (Python)

Substitute `Rscript <SCRIPT-NAME>` → `python <SCRIPT-NAME>`,
`R ≥ 4.5` → `Python ≥ 3.10`, and the CRAN line with `pip install`
language. `setup-packages` chunk language: "installs pinned
versions via `pip install pkg==x.y.z`".

```markdown
# <SLUG> — Quarto project

Executable companion to the blog post:

> **<TITLE>**
> <https://carlos-mendez.org/post/<SLUG>/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, code, output, and figures inline. |
| `<SCRIPT-NAME>` | Canonical companion script — equivalent logic, runnable directly with `python <SCRIPT-NAME>`. |
| `_quarto.yml` | Minimal Quarto project marker. |
| `README.md` | This file. |

## How to render the tutorial

1. Open this folder in **Positron** or **VS Code**.
2. Open `tutorial.qmd` and click **Render** (or run
   `quarto render tutorial.qmd`).
3. The `setup-packages` chunk pins exact versions via
   `pip install pkg==x.y.z` (subsequent renders skip the install
   when versions match).

## How to run the canonical script directly

```bash
python <SCRIPT-NAME> 2>&1 | tee execution_log.txt
```

## Requirements

- **Quarto** ≥ 1.4
- **Python** ≥ 3.10 with a Jupyter kernel (`pip install jupyter`)
- ~200 MB of PyPI packages on first install (cached after that)

## References

- **Published post:** <https://carlos-mendez.org/post/<SLUG>/>
- **Source repo:** <https://github.com/cmg777/starter-academic-v501>
- **Methodology:** <METHOD-CITATION>
- **Data source:** <DATA-CITATION>
```

### README.md template (Stata)

Substitute `Rscript`/`python` → `stata -b do`, R/Python version →
Stata 17+, and replace the pinned-install paragraph with a warning
that SSC packages cannot be pinned.

```markdown
# <SLUG> — Quarto project

Executable companion to the blog post:

> **<TITLE>**
> <https://carlos-mendez.org/post/<SLUG>/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, Stata code, output, and figures inline. |
| `<SCRIPT-NAME>` | Canonical companion do-file — runnable directly with `stata -b do <SCRIPT-NAME>`. |
| `_quarto.yml` | Minimal Quarto project marker. |
| `README.md` | This file. |

## How to render the tutorial

1. Open this folder in **Positron** or **VS Code**.
2. Open `tutorial.qmd` and click **Render** (or run
   `quarto render tutorial.qmd`).
3. The `setup-packages` chunk lists `ssc install` commands as
   comments. **SSC packages cannot be pinned to a version** —
   re-run on a fresh machine may install newer versions than the
   ones used when the post was written. Record install dates with
   `which <pkg>` if exact replication matters.

## How to run the canonical do-file directly

```bash
stata -b do <SCRIPT-NAME>
```

## Requirements

- **Quarto** ≥ 1.4
- **Stata** 17 or later
- **nbstata** Jupyter kernel (`pip install nbstata &&
  python -m nbstata.install`)

## References

- **Published post:** <https://carlos-mendez.org/post/<SLUG>/>
- **Source repo:** <https://github.com/cmg777/starter-academic-v501>
- **Methodology:** <METHOD-CITATION>
- **Data source:** <DATA-CITATION>
```

---

## Filename conventions

- ZIP **file**: `<slug>.zip` at the post-bundle root, regardless of
  language. Front-matter URL is just `<slug>.zip` (bundle-relative,
  no `https://` prefix, no `references/` prefix).
- Folder **inside** the ZIP: `<slug>/` (single top-level folder; no
  subfolders).
- All four files sit directly inside that folder. No nesting.

---

## Verification

After `mv "$WORK/$SLUG.zip" content/post/$SLUG/$SLUG.zip`, run:

```bash
unzip -l "content/post/$SLUG/$SLUG.zip"
```

Expected output (exact filenames vary; structure should not):

```
Archive:  content/post/<slug>/<slug>.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  ...   <slug>/
       25  ...   <slug>/_quarto.yml
    XXXXX  ...   <slug>/tutorial.qmd
     YYYY  ...   <slug>/README.md
    ZZZZZ  ...   <slug>/<canonical-script>
```

Additional checks:

- `unzip -p "<slug>.zip" "<slug>/_quarto.yml" | head -1` →
  `project:` (the minimal stub) OR the first line of the
  preserved hand-written file.
- `unzip -p "<slug>.zip" "<slug>/README.md" | head -1` →
  `# <slug> — Quarto project`.
- `du -h "<slug>.zip"` → expected size:
  - **R**: 25–40 KB
  - **Python**: 30–60 KB (depends on `script.py` length)
  - **Stata**: 25–40 KB
- No `__MACOSX/` entries; no `.DS_Store` entries.

---

## What to skip

- **Don't include data files** in the ZIP (datasets can be tens or
  hundreds of MB; the `tryCatch` / probe-then-pull pattern in
  `tutorial.qmd` already pulls them from the GitHub raw URL on
  demand).
- **Don't include `tutorial.html` / `tutorial_files/`** — these are
  render outputs the reader regenerates.
- **Don't include `featured.png/webp`, results report, infographic,
  CSV outputs, PNGs from `analysis.R`** — these belong to the
  published-post surface area, not the executable-tutorial bundle.
- **Don't include hidden files** (`.DS_Store`, `.gitignore`,
  `.Rproj.user/`) — these slip in if you zip a real
  working directory instead of a clean `mktemp` staging area.
