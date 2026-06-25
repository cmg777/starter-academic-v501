# 2026-06-25 — `update-cv` skill: sync the LaTeX CV from website content

**Status: skill + infrastructure in place and verified.** `content/cv/main.tex` compiles cleanly
with `latexmk`/`pdflatex`; the Hugo guard works (no `/cv/` page, no LaTeX sources leak into
`public/`, `static/media/CV.pdf` still published). The skill itself is an interactive,
user-invoked tool — its first content sync is run on demand via `/project:update-cv`.

## What this is

Carlos now maintains his CV as a hand-written **moderncv LaTeX** project at `content/cv/`
(`main.tex` + the moderncv `.cls`/`.sty` files + `avatar.png` + `certificates/`), compiled to
`static/media/CV.pdf` (served at `carlos-mendez.org/media/CV.pdf`, linked from the author profiles).
The website is the **content feed**; the PDF is the **published artifact**. The new
`/project:update-cv` skill folds the website's latest content into the CV and rebuilds the PDF.

## Design (decisions locked with the user)

- **Add-only sync.** The skill inserts website items **missing** from the CV and never rewrites,
  reorders, or deletes existing hand-curated entries. Reason: the website front matter is thinner
  than the CV (publications are `authors: [admin]` with **no coauthors**; the polished citations and
  curated talk selection live only in `main.tex`), so full regeneration would lose information.
- **Three website-driven sections only:** Publications and Research (← `content/publication/`, routed
  by `publication_types`), Recent Presentations (← `content/event/`, newest-only), Software/Databases/
  Web Apps (← `content/projects/`, flagged as candidates). All other sections (Positions, Education,
  Teaching, Other Experience, Awards, Grants, Professional Activities) are **never touched**.
- **Coauthors via Crossref.** For a new publication with a `doi`, the skill queries Crossref for the
  author list + journal, drafts the `\cvitem`, and asks the user to confirm; no DOI ⇒ prompt.
- **English-only.** Site i18n rules do not apply to the CV PDF.
- **Output:** compile → copy to `static/media/CV.pdf` → stop **uncommitted** for review (matches the
  repo's other skills). Manual trigger only (no hook).

## Changes made

- **New skill** `.claude/skills/update-cv/` — `SKILL.md` (four-phase: pre-flight → confirm SCOPE →
  apply insertions → compile/copy/verify) + `references/{section-map,latex-format,crossref,scope-and-verify}.md`.
- **Hugo guard:** `config/_default/config.yaml` content mount `excludeFiles: '{es,ja}/**'` →
  `'{es,ja,cv}/**'` so `content/cv/` (LaTeX sources, ~4.7 MB) never publishes and no empty `/cv/`
  page is generated. Only `static/media/CV.pdf` is public.
- **`.gitignore`:** LaTeX build artifacts under `content/cv/` (`*.aux`/`*.log`/`*.out`/`*.fls`/
  `*.fdb_latexmk`/`*.synctex.gz`/`*.toc`/`*.bbl`/`*.blg`/`main.pdf`). The `.tex`/`.cls`/`.sty`/
  `avatar.png`/`certificates/` sources are committed.
- **Docs:** `CLAUDE.md` gained a **Curriculum Vitae (CV)** section, the skills index/count line
  (17 → 18 skills; `update-cv` added as the sixth standalone companion skill).

## Verification

- `cd content/cv && latexmk -pdf main.tex` → produced `main.pdf` (clean exit; full TeX toolchain
  present). Build artifacts clean up with `latexmk -c` and are gitignored.
- Pinned Hugo build (`/tmp/hugo-verify/hugo`, 0.111.3 extended): `public/cv` absent,
  `public/media/CV.pdf` present, no `main.tex`/`moderncv*.sty` under `public/`.

## Next

- First real sync: run `/project:update-cv --dry-run` to see what the website has that the CV
  doesn't, then `/project:update-cv` to add + rebuild. Re-run whenever a new publication/talk lands.
- Possible later: a git hook to auto-run on `content/{publication,event,projects}` changes (the user
  chose manual-only for now).
