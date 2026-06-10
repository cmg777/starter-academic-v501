# 2026-06-10 — Journal-style Abstract sections across all tutorials + skill updates

Two-part change that makes a journal-style **`## Abstract`** the standard opener for
every data-science tutorial on the site, and teaches the authoring/review skills to
produce and enforce it going forward.

## Part 1 — Abstracts added to 63 tutorials (commit `768088c`)

Added a single journal-style `## Abstract` paragraph at the top of every substantive
tutorial under `content/post/`, immediately **before** the existing `## Overview`
(existing section numbering left untouched).

- **Form:** one dense ~150–250 word paragraph, no bold sub-labels, flowing through six
  beats — **motivation → research objective → data → methods → main results (with real
  numbers) → main implication**.
- **Scope:** full tutorials only (Python/R/Stata). Written by ~64 parallel sub-agents
  (one per post), each extracting the post's **real headline numbers** (sourced to
  specific lines) rather than inventing any.
  - **63 abstracts written.** `r_two_stage_did` self-skipped (theory page; analysis
    lives in an external Colab) — matching the skip rule.
  - Skipped by design: thin Colab-landing posts (`python_esda`, `python_gwr_mgwr`,
    `python_monitor_*`, …), the 8 GEE nightlights posts, and non-tutorial
    announcements.
- **English body only.** ES/JA stubs and the front-matter `summary:` field were not
  touched — `scripts/i18n-parity.sh` still reports **0 gaps** (87/87 post stubs per
  language). No `abstract:` front-matter key was added; the Abstract is a body section.
- **House style:** literal currency `\\$`, em dashes (—) not `--`, inline math left as
  proper `$…$`. A post-write audit fixed three `--`-as-dash/minus slips
  (`r_did`, `stata_spxtivdfreg`, `stata_bma_dsl`).
- **Verification:** structural (exactly one `## Abstract` before the first heading in
  all 63), pure-insertion (0 deletions, front matter intact), and i18n parity all
  passed. A full local Hugo build is blocked by a **pre-existing** Wowchemy
  module-resolution issue in the isolated 0.111.3 verify binary (reproduces on a clean
  tree; unrelated to body-text edits) — Netlify's full-module build is the gate.

## Part 2 — `write-post` / `review-post` skills updated

So future posts ship with a correct Abstract and the reviewer enforces it.

**`write-post` (auto-writes the Abstract):**
- `SKILL.md`: new first row in the §2.1 post-structure table; new **§2.1a "Abstract
  (the six-beat opener)"** with the recipe, rules, placement note, and a generic
  skeleton; Abstract row added to the Phase 3a verify table.
- `references/quality-checklist.md`: "Abstract present and well-formed" item.
- `references/front-matter-templates.md`: note that the Abstract is a **body** section,
  not an `abstract:` front-matter key.

**`review-post` (new Dimension 13):**
- Grew from **12 → 13 review dimensions**. New `### Dimension 13: Abstract` checks
  placement-first, single-paragraph six-beat structure, formatting, and **number
  accuracy cross-checked against the Dimension 1 / Dimension 8 output blocks**.
- New `focus: abstract` mode (focus tables in `SKILL.md` + `scoring-and-criteria.md`).
- Verdict rule: Abstract numbers not matching the body, or a missing Abstract on a
  substantive tutorial, is **HIGH**; malformed/missing-beat is **MEDIUM**; thin
  landing pages are **N/A**. Added `## 13. Abstract Section` to `report-template.md`.

**Docs synced:** `CLAUDE.md` and `README.md` — `write-post` now lists "Abstract first";
`review-post` documented as **13 dimensions** with the `abstract` focus mode.

## Not included here

`assets/scss/custom.scss` has an unrelated hero-rotator recolor (cyan/indigo → brand
teal/steel-blue) in the working tree from in-progress hero work — deliberately left
out of these commits.
