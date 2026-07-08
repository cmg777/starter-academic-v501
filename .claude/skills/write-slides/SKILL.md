---
name: write-slides
description: Generate a Quarto reveal.js slide deck from an existing post on carlos-mendez.org. The skill reads the post's prose, figures, tables, and results_report.md, runs an audience-triage + key-takeaway + outline-checkpoint interview (porting Scott Cunningham's "Rhetoric of Decks"), then writes a slides.qmd (+ a branded SCSS theme + a custom title-slide partial), renders it with `quarto render` to content/post/<slug>/slides/, and opens it from a "Slides (HTML)" button. Built-in menu / chalkboard / speaker view / preview-links / overview; assertion titles, 3-act arc, one idea per slide; key-result title strip; English-only.
argument-hint: "<post slug> [--no-link] [--no-verify]"
disable-model-invocation: true
user-invocable: true
---

# Write Slide Deck: a branded Quarto reveal.js talk for a published post

Produce a **Quarto reveal.js deck** that lives alongside an existing post on
carlos-mendez.org. The reader clicks a `Slides (HTML)` button, the deck opens, and it
presents the post's argument as an **assertion-titled, one-idea-per-slide narrative** — the
post's own figures, tables, and numbers, restructured into a talk with reveal.js's built-in
**menu, chalkboard, speaker view, preview-links, and overview**.

The deck is authored as a `slides.qmd` (`format: revealjs`) and rendered by the **Quarto CLI**
to `content/post/<slug>/slides/` (mirroring the `web_app/` precedent). It is branded to a
**fixed** site SCSS theme and needs no CDN (reveal + plugins are bundled by Quarto).

The skill's signature behaviour is **the interview** (Phase 2): it ports `beautiful_deck`'s
audience triage and outline checkpoint into this project's confirm-scope step, confirming the
**audience**, the **key takeaways + headline numbers**, and the **full slide outline** before
writing anything. The craft (3-act arc, assertion titles, pedagogical movement, MB/MC pacing,
Devil's-Advocate) lives in [`references/rhetoric-of-decks.md`](references/rhetoric-of-decks.md).

---

## What this skill does NOT do

- **Does not modify post prose, equations, or sections.** It only injects one YAML `links:`
  entry (skippable with `--no-link`).
- **Does not re-run the post's pipeline.** If `results_report.md` is stale, run
  `/project:write-results-report <slug>` first.
- **Does not execute code.** Deck code blocks are illustrative (`{.r}`, not `{r}`), so
  `quarto render` is a pure Pandoc render — no R/Python kernel or package install.
- **Does not design a theme per deck.** The brand is **fixed** — `site-brand.scss` is copied
  verbatim every run (a deliberate departure from upstream `beautiful_deck`).
- **Does not produce a single self-contained file.** The chalkboard plugin is incompatible
  with `embed-resources`, so the deck ships `index.html` + `slides_files/` (Hugo serves this
  fine — the `tutorial.html` precedent).
- **Does not export a PDF.** It documents reveal.js's in-browser `?print-pdf` recipe.
- **Does not commit, push, or open a PR.** Phase 5 prints copy-pasteable follow-ups.
- **Does not support standalone-topic invocation.** A deck requires an existing post.
- **Does not create ES/JA copies.** The deck rides with the English post like `web_app/`.
- **Does not ship a companion review skill.** Write-only for now.
- **Requires the Quarto CLI** (`/Applications/quarto/bin/quarto`, 1.8.27+) to (re)generate.

---

## Example invocations

```
# Standard run: read the post, run the audience/takeaway/outline interview, write
# slides.qmd + theme + partial, `quarto render` → index.html + slides_files/, verify,
# add the "Slides (HTML)" button.
/project:write-slides r_double_lasso
/project:write-slides python_did101

# Skip the YAML link injection. slides/ is still written + rendered + verified, index.md untouched.
/project:write-slides python_pyfixest --no-link

# Skip verification (render + Hugo + smoke test). A minimal file-existence check still runs.
/project:write-slides r_did --no-verify
```

---

## Deliverables

| Path | Purpose |
|---|---|
| `content/post/<slug>/slides/slides.qmd` | Deck source (`format: revealjs`) — the only per-post authored file |
| `content/post/<slug>/slides/site-brand.scss` | revealjs theme (copied verbatim from `references/templates/`) |
| `content/post/<slug>/slides/title-slide.html` | title-slide partial rendering the key-result strip (copied verbatim) |
| `content/post/<slug>/slides/index.html` | the rendered deck (`quarto render` output) |
| `content/post/<slug>/slides/slides_files/` | reveal.js + plugins + libs (`quarto render` output, ~8 MB) |

Plus the `index.md` update injecting the `Slides (HTML)` YAML link, unless `--no-link`. The
deck is reachable at `/post/<slug>/slides/index.html`. Figures are reused in place via
relative `../<slug>_*.png` (not copied).

**Commit the whole `slides/` dir.** Unlike Quarto *tutorials* (whose `tutorial.html` /
`tutorial_files/` are git-ignored because readers render locally), the deck's rendered
`index.html` + `slides_files/` (~8 MB) are **production assets Netlify serves** — Netlify runs
Hugo, not Quarto, so the rendered output must be in git. Only Quarto's local cache is ignored
(`content/post/*/slides/.quarto/`). See `references/render-and-fix.md` §11.

---

## Site color palette (fixed brand — every deck)

`site-brand.scss` carries these (sourced from `assets/scss/custom.scss`); do not vary them.
**The theme is dark mode** — a navy canvas with light text; the brand accents are unchanged.

| Token | Hex | Use in the deck |
|---|---|---|
| Navy (canvas) | `#0f1729` | The deck canvas — **dark mode**. Set via `$body-bg: $navy`. |
| Body text | `#e6ebf3` | Body copy on the navy canvas. Set via `$body-color`. |
| Headings | `#f2f5fa` | Assertion titles / headings (near-white on navy). |
| Muted | `#aebfd8` | Captions, figure/equation glosses, byline meta, key-result labels (`$muted`). |
| Steel blue | `#6a9bcc` | Links, list markers, **bold `strong` text**, 3rd title stat |
| Warm orange | `#d97757` | Act I + closing dividers, assertion underline, key table cell, big number, 1st stat, `.takeaway` accent |
| Teal | `#00d4c8` | Integrated/Act III divider, table head rule, 2nd title stat, link hover, dark-slide accents |
| Brand blue | `#1a3a8a` | Full-bleed section/"tool" divider backgrounds (readable on navy) |
| Display font | Cinzel | Title, dividers, big number, key-result numbers |
| Mono font | IBM Plex Mono | Code blocks |

The warm orange also carries the **`.takeaway` card** — each content slide's concluding line
(see the **Takeaway card** component in `slide-archetypes.md`). Reuses `$orange` with light text; no new color.

---

## Phase 1: Pre-flight (read-only)

Do not write any file in this phase.

### 1.1 Parse arguments
- **Slug** — first positional token. Mandatory.
- **`--no-link`** — skip the `index.md` YAML injection (Phase 3.5).
- **`--no-verify`** — skip Phase 4 (a minimal file sanity check still runs).
Reject unknown flags.

### 1.2 Locate the post
`content/post/<slug>/`. Hard-fail with a message pointing to `/project:write-post` if absent.

### 1.3 Detect existing deck + button collisions
If `content/post/<slug>/slides/` exists, ask: **(a)** overwrite [default], **(b)** cancel,
**(c)** suffixed `slides_v2/`. Note any pre-existing `slides.pdf` or Wowchemy
`content/slides/<name>` page — they do **not** collide (different folders/labels); surface in
the SCOPE block for Phase-2 Round 4.

### 1.4 Read the post
Read `content/post/<slug>/index.md` in full. Extract: `title:`; `subtitle`/`summary`; language;
`tags`/`categories`; the **Abstract** and **Overview**; **Learning objectives**; method
headings; **interpretation paragraphs** (→ speaker notes); the **Summary/Conclusion**; every
image `![caption](<slug>_*.png)` with its caption; every Markdown table; every `$$…$$`.

### 1.5 Read the numbers
If `results_report.md` exists, parse the headline numbers + interpretations; read
`execution_log.txt` if present. If **neither** exists, record "no structured numbers — derive
from prose/captions and confirm with the user in Phase 2."

### 1.6 Build the raw-material manifest
List: figures (path, caption), tables (caption, key cell), equations, and the **3 headline
numbers** for the title strip. **Cap on-slide figures at 12**; log any dropped filenames.
See [`references/slide-mapping.md`](references/slide-mapping.md).

### 1.7 Propose a default audience + 3-act arc
From the slug prefix + tags, propose a default **audience** (Teaching for tutorials) and a
draft 3-act outline (Tension → Investigation → Resolution).

---

## Phase 2: Confirm scope (MANDATORY interview)

Ports `beautiful_deck`'s Step-0 triage + Step-2 outline checkpoint. Templates:
[`references/interview-questions.md`](references/interview-questions.md). Cap each
`AskUserQuestion` call at 4 questions / 2–4 options; the final gate is plain-text `y`.

### 2.1 Preliminary SCOPE block
```
SCOPE (PRELIMINARY — to be confirmed in the interview)
======================================================
Post slug:         <slug>
Title:             <title>
Language:          <R | Python | Stata | mixed>
Numbers source:    <results_report.md | index.md prose only | none — confirm>
Figures found:     <N>   [capped at 12; dropped: <list|none>]
Tables found:      <N>      Equations found: <N>
Proposed audience: <teaching | seminar | conference | working/external>
Proposed arc:
  ACT I  — Tension:       <one-line hook>
  ACT II — Investigation: <one-line method spine>
  ACT III— Resolution:    <one-line headline result>
Key-result strip (title): <num1 · num2 · num3>   (you'll confirm)
Inferred takeaways:       - <t1>  - <t2>  - <t3>
Existing slides/:  <none | present — overwrite | present — abort>
slides.pdf / Wowchemy page: <none | present — coexists>
Engine:            Quarto revealjs → index.html + slides_files/ (chalkboard, menu, speaker view)
Theme:             FIXED site brand (steel/orange/teal/heading-blue/ink)
Output:            content/post/<slug>/slides/{slides.qmd, site-brand.scss, title-slide.html, index.html}
Flags:             --no-link=<t/f>  --no-verify=<t/f>
```

### 2.2 Interview rounds
1. **Audience triage** (always) — sets the ethos·pathos·logos balance, slide count, MB/MC.
2. **Key takeaways + headline numbers** (always) — the Act-III assertions **and the 3
   title-strip numbers**; force number confirmation when there's no results report.
3. **Outline checkpoint** (always) — render the full proposed slide list (one line per slide:
   `archetype · assertion title`) and require approval before writing anything.
4. **Devil's-Advocate + button collision** (conditional).

### 2.3 Final confirmation
Re-print the resolved SCOPE block + approved outline, then prompt (plain text, NOT
`AskUserQuestion`): `Proceed to write the deck? (y / explain change / cancel)`. Never write
before `y`.

---

## Phase 3: Generate the deck

### 3.1 Create the folder
`content/post/<slug>/slides/`.

### 3.2 Copy verbatim templates
Copy unchanged from `references/templates/`: **`site-brand.scss`** and **`title-slide.html`**.
The theme gives the title slide a thin orange **accent rule** + a **refined byline** (author
primary; institute/date smaller/grey) automatically. **Optional:** if the `key-results` are
*word* labels forming an arc (Learn → Explore → Research), connect them with the pipeline-arrow
`$sep$` edit to `title-slide.html` (slide-archetypes archetype 1) — the one approved
`title-slide.html` variation; **word strips only, never numeric key-results**.

### 3.3 Author `slides.qmd`
Start from `references/templates/slides.qmd.tmpl`. Fill the front matter: `title`/`subtitle`;
the title-slide **`deck-author`** + **`deck-author-url`** (hyperlinked author), **`institute`**
(university), **`date: today`** + **`date-format: long`** (auto-stamps the render/update date);
and **`key-results:`** (the 3 confirmed headline numbers as `{num, cap}`). Write the body from
the approved outline using [`references/slide-archetypes.md`](references/slide-archetypes.md) +
[`references/slide-mapping.md`](references/slide-mapping.md): `##` assertion titles; figures
`![caption](../<slug>_*.png)`; Markdown tables with `[cell]{.key}`; code ` ``` {.r
code-line-numbers="…"} `; equations `$$…$$`; columns `::: {.columns}`; speaker notes
`::: {.notes}`; dividers `# … {.divider background-color="…"}`. **End each substantive content
slide with its takeaway card** — the concluding line as `[…]{.takeaway .fragment}` (the
**Takeaway card** component in slide-archetypes.md); reserve `.comment` for small
figure/equation glosses. **Write all on-slide math as LaTeX `$...$`, never literal Unicode**
(`$\hat\alpha$` not `α̂`); Mixed numbers (keep `.key`/`.bignum` as styled text); notes stay
Unicode (slide-mapping § "Math symbols → LaTeX"). Run the **MB/MC + one-idea-per-slide pass**
(rhetoric-of-decks § MB/MC) before rendering.

### 3.4 Render
```bash
cd content/post/<slug>/slides && /Applications/quarto/bin/quarto render slides.qmd
```
→ `index.html` + `slides_files/`. On failure, apply the **render-and-fix loop (max 3
attempts)** from [`references/render-and-fix.md`](references/render-and-fix.md) (e.g. the
chalkboard/`embed-resources` conflict, an SCSS error, a title-partial/`key-results` issue),
then re-render. Confirm `index.html` exists (> 30 KB) and no `{{…}}` marker remains.

### 3.5 Inject the YAML `Slides (HTML)` link (skip if `--no-link`)
Insert as the **first** entry of the post's `links:` array (create it if absent):
```yaml
- icon: person-chalkboard
  icon_pack: fas
  name: "Slides (HTML)"
  url: slides/index.html
```
**Relative `url`, no trailing slash** (a trailing slash 404s — see
[`references/render-and-fix.md`](references/render-and-fix.md) §4). **Idempotent:** if a
`name: "Slides (HTML)"` entry exists, rewrite it in place. Fall back to `display` if the FA
build lacks `person-chalkboard`.

### 3.6 Guard against mid-interview edits
Re-read `index.md`; if the title/front matter changed since Phase 1, surface the diff and ask
whether to abort or proceed.

---

## Phase 4: Verification (skip if `--no-verify`)

Run [`references/verification-checklist.md`](references/verification-checklist.md):
**Layer 0** (`quarto render` → `index.html` + `slides_files/`, render-and-fix loop); **Layer
A** (Hugo ≥0.96 HTTP-200 on the deck + a sampled `slides_files/` asset + every `../<slug>_*.png`
+ the post page; plus the YAML-link check that the button points to `…/slides/index.html`, not
`/slides/`); **Layer B** (the Node static smoke test); and **Layer C** — a Playwright browser
**math-render check** (`templates/math-check.cjs`) that loads the deck, traverses every slide,
and **fails on raw LaTeX**. Layer C is **mandatory when the deck has math**: the static layers
only see that `$…$` became `<span class="math">`, NOT that it *renders* — a broken engine ships
raw `\hat\alpha`. If no ≥0.96 Hugo binary is available, mark Layer A `[~]` and rely on Layer B;
if Playwright/Chrome is unavailable, eyeball the math manually (open the deck; `$\hat\alpha$`
must show as α̂, not `\hat\alpha`). Always kill any Hugo process started.

---

## Phase 5: Report + follow-ups

Print the `[✓]/[✗]/[~]` report from the checklist, then offer 2–3 copy-pasteable follow-ups
(never auto-run):
```
NEXT STEPS (copy + paste)
=========================
1. Preview (serve over http; press M=menu, B=chalkboard, S=speaker view, O=overview):
   /tmp/hugo-verify/hugo server --disableFastRender        # or your ≥0.96 hugo
   open http://localhost:1313/post/<slug>/slides/

2. Export a PDF handout (in-browser; the skill does not build one):
   open "http://localhost:1313/post/<slug>/slides/?print-pdf"
   then Print → Save as PDF (landscape, no margins, background graphics on)

3. Re-render after editing slides.qmd:
   cd content/post/<slug>/slides && /Applications/quarto/bin/quarto render slides.qmd

4. Commit + push:
   git add content/post/<slug>/slides/ content/post/<slug>/index.md
   git commit -m "<slug>: add Quarto reveal.js slide deck

   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   git push origin master
```
If any `[✗]`: do not strip the `index.md` link; surface the failed assertion with its path;
suggest the matching `render-and-fix.md` entry; offer a re-run.

---

## Reference files

- [`references/rhetoric-of-decks.md`](references/rhetoric-of-decks.md) — the ported
  philosophy (Three Laws, audience triage, 3-act arc, assertion titles, pedagogical movement,
  MB/MC, Devil's-Advocate, Beamer→Quarto-revealjs map).
- [`references/slide-archetypes.md`](references/slide-archetypes.md) — the 12 slide layouts as
  copy-paste **Quarto markdown**.
- [`references/interview-questions.md`](references/interview-questions.md) — Phase-2
  `AskUserQuestion` templates (triage, takeaways, outline checkpoint).
- [`references/quarto-revealjs-guide.md`](references/quarto-revealjs-guide.md) — how the
  `.qmd`+`.scss`+partial compose; the render command; format options; features; math/code/
  figure/columns/notes mechanics; why not embed-resources.
- [`references/slide-mapping.md`](references/slide-mapping.md) — post → arc heuristics;
  figure/table/equation placement; the key-result strip; MB/MC pass.
- [`references/verification-checklist.md`](references/verification-checklist.md) — Phase-4
  checks + report template.
- [`references/render-and-fix.md`](references/render-and-fix.md) — failure-mode catalog.
- `references/templates/` — `slides.qmd.tmpl`, `site-brand.scss`, `title-slide.html`, `smoke-test.js`.

---

## Acceptance tests (for the skill itself)

1. **Reference deck — `r_double_lasso`.** Invoke, audience Teaching, approve the outline.
   Expect `slides/{slides.qmd, site-brand.scss, title-slide.html}` written; `quarto render` →
   `index.html` + `slides_files/`; the title key-result strip shows the 3 numbers; the smoke
   test 100% `[✓]`; the button links to `…/slides/index.html`.
2. **No results report.** Phase 1 records "no structured numbers"; Round 2 forces number
   confirmation (incl. the title strip); the deck still builds.
3. **Many figures.** The figure cap engages; dropped filenames are logged.
4. **`--no-link`.** `slides/` written + rendered + verified; `index.md` byte-identical.
5. **`--no-verify`.** Phases 1–3 + 5 run; Phase 4 skipped; minimal file sanity still runs.
6. **Idempotent re-run.** Second run detects `slides/`, asks before overwriting, reproduces
   byte-identical `site-brand.scss`/`title-slide.html`; the link inject does not duplicate.
7. **Trailing-slash guard.** The rendered post page contains `href="/post/<slug>/slides/index.html"`.
8. **Chalkboard/embed-resources guard.** `embed-resources: true` is NOT set (render would
   fail); the deck ships `index.html` + `slides_files/`.
9. **Takeaway cards.** Substantive content slides end with a `[…]{.takeaway .fragment}` card
   (renders as the orange accent card, rises/fades in last); `.comment` is used only for small
   figure/equation glosses, not for the slide's concluding takeaway.
10. **Title-slide polish.** The title slide shows the orange accent rule under the title and the
    refined byline (author larger; institute/date smaller/grey). A word-strip deck may use the
    `$sep$` pipeline arrows; a numeric-strip deck must NOT (colors stay orange/teal/steel).
