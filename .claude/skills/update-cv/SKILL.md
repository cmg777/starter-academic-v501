---
name: update-cv
description: Sync Carlos Mendez's LaTeX CV (content/cv/main.tex) with the website's latest publications, presentations, and software/app projects, then recompile it to static/media/CV.pdf (served at carlos-mendez.org/media/CV.pdf). Additive-merge only — it inserts website items that are MISSING from the CV and never rewrites, reorders, or deletes the hand-curated entries; the hand-maintained sections (Positions, Education, Teaching, Other Experience, Awards, Grants, Professional Activities) are never touched. For each new publication it looks up coauthors/journal on Crossref via the entry's DOI and has you confirm the drafted line; entries without a DOI prompt you to paste the coauthors. Confirms scope before editing, compiles with pdflatex, copies the PDF into static/media/, and leaves everything uncommitted for review. English-only.
argument-hint: "[--section publications|presentations|software|all] [--dry-run] [--no-build]"
disable-model-invocation: true
user-invocable: true
---

# Update the CV from website content, then rebuild CV.pdf

Fold the website's newest content into the LaTeX CV and refresh the published PDF. The website is
the **content feed**; `static/media/CV.pdf` is the **published artifact**.

- **Source (read):** `content/publication/` (journal articles, books, chapters, reports,
  dissertations), `content/event/` (talks), `content/projects/` (software / databases / web apps).
- **Target (write):** `content/cv/main.tex` — a hand-written **moderncv** project. Only three of
  its sections are website-driven: **Publications and Research**, **Recent Presentations**, and
  **Software, Databases, and Web Applications**.
- **Output:** compile `main.tex` → copy the PDF to `static/media/CV.pdf` (the only public CV file;
  `content/cv/` itself is excluded from the Hugo build).

This is the CV counterpart to `update-author-profile`: it edits structured content, normalizes LaTeX
escaping so the build never breaks, **confirms scope before writing, and never commits**.

## The one rule that governs everything: ADD-ONLY

The website front matter is **thinner** than the CV — publications are stored as `authors: [admin]`
with **no coauthors**, and the CV's polished citations (coauthor lists, journal formatting, curated
talk selection) live **only** in `main.tex`. Therefore this skill **never regenerates** a section.
It computes the set of website items **missing** from the CV and **inserts only those**, leaving
every existing line byte-for-byte. A run that finds nothing new makes **zero** edits.

## What this skill does NOT do

- **Does not touch hand-maintained sections.** Academic Positions, Education, Research/Teaching
  Fields, Teaching Experience, Other Experience, Awards, Research Grants, and Professional Activities
  are off-limits — never read them for diffing, never edit them.
- **Does not delete, reorder, or reword existing entries.** Insertion only.
- **Does not invent coauthors.** It fills them from Crossref (when a DOI exists) for you to confirm,
  or asks you to paste them. It never guesses.
- **Does not auto-insert software/app projects.** That mapping is fuzzy, so projects are *flagged as
  candidates* for your explicit approval.
- **Does not commit, push, or translate.** English-only; leaves the working tree for your review.

## Reference files (read before acting)

- `references/section-map.md` — which website source feeds which CV section/subsection, the
  `publication_types` → subsection table, and the front-matter-field → LaTeX-argument mapping.
- `references/latex-format.md` — the `\cvitem`/`\cventry` templates, the LaTeX-escaping catalog,
  the chronological-insertion rule, and the DOI + normalized-title **dedupe** algorithm.
- `references/crossref.md` — the Crossref lookup recipe (curl by DOI), the fields to extract, the
  coauthor-formatting rule (Oxford "and", Mendez removed), and the offline / no-DOI fallback.
- `references/scope-and-verify.md` — the Phase-2 SCOPE block + the compile / copy / clean recipe +
  the Hugo-guard check.

## Example invocations

```
/project:update-cv                       # all three sections; full interactive run
/project:update-cv --dry-run             # show the SCOPE block (what WOULD be added), then stop
/project:update-cv --section publications  # only sync content/publication/
/project:update-cv --section presentations
/project:update-cv --no-build            # edit main.tex but skip compile + PDF copy
```

---

## Phase 1 — Pre-flight (read-only)

1. **Parse arguments.** `--section` (default `all`), `--dry-run`, `--no-build`.
2. **Load references** (`section-map.md`, `latex-format.md`, `crossref.md`, `scope-and-verify.md`).
3. **Read the CV.** Read `content/cv/main.tex`. Build the **already-in-CV index** per
   `latex-format.md`: the set of DOIs (from `% https://doi.org/…` comments) and the set of
   normalized entry titles (from `\cvitem{…}{…}` / `\cventry{…}{…}` inside the in-scope sections).
4. **Read the website sources** in scope. For publications, parse each
   `content/publication/*/index.md` front matter (`title`, `authors`, `date`, `doi`,
   `publication`, `publication_types`); for events, `content/event/*/index.md`
   (`title`, `subtitle`, `event`, `location`, `date`); for projects, `content/projects/*/index.md`
   (`title`, `summary`, `links`, `date`).
5. **Compute the additive diff.** A website item is **new** iff it matches **no** CV entry by DOI
   **and** no CV entry by normalized title. For presentations, additionally keep only talks **newer
   than the most recent `\cventry` already in Recent Presentations** (the CV deliberately curates
   recent talks; older ones are pruned/commented). For projects, produce **candidates only**.

## Phase 2 — Confirm scope (print SCOPE, wait for `y`)

Print the **SCOPE block** from `references/scope-and-verify.md`, filled in: each new item, its
target subsection, the year it will sort to, and whether its coauthors come from Crossref (DOI
present) or need to be pasted. List flagged software/app **candidates** separately. **Wait for an
explicit `y`.** If `--dry-run`, stop here. If the diff is empty, report "CV already in sync" and stop.

## Phase 3 — Apply additions (insertion only)

Per `latex-format.md` and `crossref.md`, for each approved item:

- **Publication.** Route to the subsection by `publication_types` (`2`→Peer-reviewed Articles,
  `5`→Books, `6`→Book Chapters, `4`→Reports, `7`→Dissertations, `3`→Working Papers). If a DOI exists,
  query Crossref for coauthors + journal + year, **draft** the `\cvitem` line, show it, and let me
  confirm or edit. No DOI → ask me to paste coauthors/journal. Apply the LaTeX-escaping catalog.
  Insert at the correct chronological position with an `Edit` anchored on the neighbouring entry.
- **Presentation.** Build the `\cventry{year}{title}{event}{city}{country}{}`; confirm the
  city/country split with me; insert at the top of Recent Presentations.
- **Software/app.** Only for candidates I approved; place under Software / Databases / Web
  Applications as I direct.

Use targeted `Edit`s anchored on existing lines — **never rewrite the file**, never alter a line you
are not adding next to.

## Phase 4 — Build, copy & report (unless `--no-build`)

Run the recipe in `references/scope-and-verify.md`:

1. **Compile** in `content/cv/`: `latexmk -pdf -interaction=nonstopmode main.tex` (fallback: two
   `pdflatex` passes). Require a clean exit and a produced `main.pdf`.
2. **Copy** `content/cv/main.pdf` → `static/media/CV.pdf` (the served file).
3. **Clean** build artifacts (`latexmk -c`); they're gitignored anyway.
4. **Verify the diff is additive**: `git diff content/cv/main.tex` must show **only insertions** in
   the three in-scope sections — zero deletions, zero edits elsewhere. If not, stop and report.

Then print a `[✓]/[~]/[✗]` summary (items added per section, PDF page count, files changed) and a
copy-paste commit (`git add content/cv/main.tex static/media/CV.pdf && git commit -m "cv: sync …"`).
**Never auto-commit. Never claim success on a non-zero compile exit or a non-additive diff.**
