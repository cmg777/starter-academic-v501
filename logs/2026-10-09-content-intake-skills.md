# 2026-10-09 — Intake skills for new publications and presentations

Goal: the user hands over a file (paper PDF, slides) and gets a finished, trilingual entry.

- New skill `add-publication` (`.claude/skills/add-publication/SKILL.md`): PDF → metadata (Crossref-confirmed when a DOI exists) → one SCOPE confirmation (type, folder, buttons, PDF hosting rights, plain summary, homepage featured slot, image, explainer body, CV, commit) → EN bundle + `cite.bib` → ES/JA via translate-content → CV via update-cv → build + audit + parity. Has an update mode for working papers that become published.
- New skill `add-presentation`: slides (PDF or link) → bundle with Slides button / embed, cover from slide 1 (`pdftoppm` + crop to 16:9), plain summary, ES/JA, CV line, verification.
- New guide `.claude/docs/adding-content.md`: intake table for every item type (software and data recipes included) and the rules shared by all additions.
- CLAUDE.md and README: point to the above; fixed the presentation folder convention (`YYYYMMDDABBR`, no hyphen, as the folders actually are) and the stale README note on homepage article selection (now featured-first).
- Recipe check: Crossref BibTeX/JSON lookups and `pdftoppm` page rendering work locally.
