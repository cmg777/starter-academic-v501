# Scope block & verification

## Phase-2 SCOPE block

Fill this in and print it, then wait for an explicit `y`. `--dry-run` stops right after printing.

```
SCOPE — update-cv   (ADD-ONLY: existing entries are never changed)
  CV file:   content/cv/main.tex
  Sections:  Publications and Research · Recent Presentations · Software/Databases/Web Apps
  Output:    static/media/CV.pdf   (compiled from main.tex; content/cv/ is build-excluded)

  NEW publications → Publications and Research
    [Peer-reviewed Articles]
      2026  "Okun's law and spatial regimes in Indonesia…"   coauthors: Crossref (doi 10.1016/…)
      2025  "Mapping the dimensions of poverty…"             coauthors: Crossref (doi 10.1007/…)
    [Book Chapters]
      2026  "…"                                              coauthors: ASK (no doi)
  NEW presentations → Recent Presentations   (only talks ≥ 2025, the latest already listed)
      2026  "…"  @ <event>, <city>, <country>
  CANDIDATE software/apps → confirm individually (fuzzy; none added without your OK)
      • <project title>  →  Software? / Database? / Web App?   \url{<link>}

  Already in CV (skipped): <n> publications, <n> talks   (matched by DOI / title)
  Possible duplicates (confirm): <list or "none">
Proceed? (y/n)
```

If the diff is empty, skip the block and report **"CV already in sync — no changes."**

## Verification recipe (Phase 4)

Run after writing `main.tex`, unless `--no-build` was passed.

### 1. Compile + copy the PDF
```bash
cd content/cv
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex   # fallback: pdflatex main.tex (×2)
cd ../..
cp content/cv/main.pdf static/media/CV.pdf                       # the served file
cd content/cv && latexmk -c && cd ../..                          # clean .aux/.log/.out (keeps main.pdf, gitignored)
```
- A **non-zero exit** or `! LaTeX Error` / `! Undefined control sequence` fails the run — report the
  offending entry (usually an unescaped `&`/`%`/`_` or a bad accent) and fix it; do **not** copy a
  stale/broken PDF over `static/media/CV.pdf`.
- Optional page-count sanity: `pdfinfo content/cv/main.pdf | grep Pages` (or `mdls -name kMDItemNumberOfPages`).

### 2. Confirm the edit is additive
```bash
git --no-pager diff content/cv/main.tex
```
- Expect **only added lines** (green) inside the three in-scope sections. **Any** deletion, or any
  change outside those sections, is a bug — stop and report, don't proceed to the PDF copy.

### 3. Hugo guard (do this once after the config change, and any time content/cv changes shape)
Confirms the LaTeX sources never leak into the published site and no empty `/cv/` page appears.
```bash
# Pinned Hugo (0.96–0.119 window); re-download 0.111.3 extended to /tmp/hugo-verify/hugo if missing.
/tmp/hugo-verify/hugo --gc --minify --buildFuture --quiet
test ! -e public/cv            && echo "OK: no /cv/ page"
test -f public/media/CV.pdf    && echo "OK: CV.pdf published"
find public -name 'main.tex' -o -name 'moderncv*.sty' | grep -q . \
  && echo "LEAK: content/cv sources in public/" || echo "OK: no LaTeX sources leaked"
```
All three must print `OK`. (`public/` is gitignored — this is a throwaway build.)

## Report

Print a per-section `[✓]/[~]/[✗]` summary: items added (with titles), items skipped as already
present, any items deferred (no DOI and you skipped), the compile result + PDF page count, and the
files changed (`content/cv/main.tex`, `static/media/CV.pdf`). Then offer the copy-paste commit:

```
git add content/cv/main.tex static/media/CV.pdf
git commit -m "cv: sync <N> publication(s)/talk(s) from website; rebuild CV.pdf"
```

**Never auto-commit. Never claim success on a non-zero compile exit or a non-additive diff.**
