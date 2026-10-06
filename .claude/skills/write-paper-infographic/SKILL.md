---
name: write-paper-infographic
description: Create a source-grounded infographic brief for an academic paper or publication bundle, with a central research question, graphical evidence, and concise answer. Generate a reviewable image or install publication assets only when requested. Use for research publication infographics, not teaching-post storyboard prompts.
argument-hint: "<publication slug or path> [--mode brief|render|install] [--output path]"
user-invocable: true
---

# Write Paper Infographic

Turn one academic paper into a clear visual argument: **research question at the
TOP, graphical evidence in the MIDDLE, concise answer at the BOTTOM**. This is
the preferred composition, not a requirement to force every discipline into the
same chart. Respect the user's format, language, chart, and destination choices.
Keep the existing teaching-post `write-infographic` skill separate; its six-panel
storyboard and metaphor rules do not apply here.

## Invocation and scope

Use the repository's documented `/project:` notation:

```text
/project:write-paper-infographic 20260528-EM
/project:write-paper-infographic content/publication/20260528-EM --mode brief --output /tmp/okun-brief.md
/project:write-paper-infographic <publication-slug> --mode render --output /tmp/paper-candidate
/project:write-paper-infographic <publication-slug> --mode install
```

Current Claude Code exposes project skills directly as
`/write-paper-infographic`; `/project:` above follows this repository's existing
documentation, not an additional registered alias. Parse `$ARGUMENTS` and the
surrounding request together. Resolve a bare slug under `content/publication/`;
accept an explicit publication bundle, paper PDF, or source path. Preserve path
case. If the paper or requested destination is ambiguous, ask only for the
missing choice and continue independent source inspection. Do not create a
publication page merely because a standalone PDF was supplied.

Choose the mode from the explicit request; flags are optional:

| Mode | Authorized output |
|---|---|
| **brief** (default) | A reviewable `paper_infographic_instructions.md` in the publication bundle, or the requested output file. For a standalone paper, use a scratch destination. No output artwork generation, conversion, or asset replacement; temporary PDF page renders for evidence inspection are allowed. |
| **render** | The brief plus candidate image(s) and necessary plotting source/data in a scratch/output directory. Generate only when asked; keep the published asset intact. |
| **install** | Generate or use the requested approved candidate, verify it, and update the target publication's EN/ES/JA assets and alt descriptions. This mode requires a request to add, replace, or install the publication image. |

An unqualified invocation means **brief**. A request to "generate a preview"
means **render**, not installation. A request to "create and add this paper's
featured image" authorizes **install**; do not ask again for permission already
given. Resolve conflicting modes before dependent work. State the chosen mode
and paths briefly, then proceed. Never infer commit, push, or deployment permission
from any mode. Preserve unrelated edits and existing candidates; use a distinct
filename when the intended overwrite is unclear. Stop a blocked operation rather
than routing around a permission denial.

## Inspect the paper and website

Read the current repository instructions and `git status`. Read the publication's
front matter and research narrative, citation, available PDF/source, and relevant
figure/data/code files. Check publication identity and version: an accepted or
working paper can differ from the journal version. Record which version supports
the design; never silently combine incompatible estimates. Follow available PDF
tool guidance to extract and visually inspect relevant pages, including table
headings, column labels, notes, and surrounding interpretation. An abstract alone
does not establish numerical chart data.

Inspect actual publication thumbnails, not tutorial artwork. Start with
`content/publication/20260528-EM/featured.webp`, then the newest relevant papers
selected by publication date in `layouts/index.html`. Useful contrasting references
are `content/publication/20260216-APJRS/featured.webp` (commuting estimates and
reported standard errors) and `content/publication/20251006-SIR/featured.webp`
(poverty-indicator prediction accuracy). These show different evidence choices
within the same question/evidence/answer hierarchy. Inspect the target's existing
image too. Preserve semantic scientific colors when using a chart or map. If a
reference moves or is absent, report that and select another actual publication.

Read `assets/css/orbital-palette.css`, `layouts/partials/orbital-thumbnail.html`,
and the publication rules in `assets/css/orbital.css` for current colors and card
geometry. Inspect `layouts/partials/page_header.html` and any publication image
partial it calls for current full-image and enlargement behavior. Re-read these
before installation when others are changing the viewer; do not modify shared
viewer/layout files as part of an image request.
If a supplied snapshot lacks Git metadata or integration dependencies, continue
the supported source/brief work and report the unavailable checks. Do not claim
build or browser verification from a partial fixture.

## Establish evidence before quantitative design

Choose one central question the paper actually addresses, the most informative
evidence for it, and an answer with the paper's scope and limitations. Distinguish
prediction, description, association, and causal identification. Model terminology
such as "effect" is not by itself evidence of causality. Preserve the estimand,
population, geography, time window, and material caveats. An insignificant estimate
is not proof of zero; contrasting significance levels do not establish a significant
between-group difference. Avoid cherry-picking the strongest coefficient when the
paper's main finding is heterogeneity or uncertainty.

Before specifying quantitative marks, write an **evidence ledger** in the brief:

| Claim or mark | Exact source locator | Value and meaning | Uncertainty / transformation |
|---|---|---|---|
| Each plotted result, comparison, or map layer | File/version, printed page and PDF page when different, table/figure, row/column/model | Estimate, sign, units, denominator, group, period; distinguish totals from direct/indirect components | Interval type/level or SE and method; any calculation and rounding |

Verify every numeric entry against the source, visually checking ambiguous PDF
extraction. Cite textual claims to their section/page as well. Prefer provided
intervals. If deriving intervals from reported SEs is justified, disclose the
formula, assumptions, and rounding; do not automatically use `estimate ± 1.96 SE`
for every design, or label a reconstruction as an author-reported interval. Do
not add invented significance stars, sample sizes, endpoints, or missing values.
Retain full calculation precision until labeling. Record the source's sample for
the displayed model rather than borrowing a larger descriptive sample.

Only proceed to quantitative design once values, units, and interpretation are
traceable. If a PDF or data is unavailable, identify exactly what is missing.
Produce a limited conceptual brief if the available text supports one; request the
needed source before a quantitative render. Never fill gaps from a thumbnail,
intuition, or a generative model. A map additionally needs an identifiable source
map or real boundary data and verified joins/group assignments. Do not invent
district boundaries or turn statistical groups into contiguous geographic regions.

## Compose and choose the rendering method

Default to one short question, one dominant evidence display, and one short
answer. Roughly 4–10 words for the question and 2–6 for the answer often work;
scientific accuracy and user choices take precedence. Keep essential qualifiers
visible and move secondary exposition to the brief or page description. Do not
shrink everything to reproduce a paper's full table or abstract.

Choose evidence that fits the paper: a point/interval plot for uncertain estimates,
a trend or scatterplot for a relationship, a verified map for spatial evidence,
a comparison of predictions for validation, or a source-supported diagram for a
theoretical result. Use multiple panels only when the comparison needs them.
Do not require four regimes, error bars, or a map for unrelated papers.

When exact positions, scales, intervals, or geography carry meaning, reuse a clear
source figure or draw deterministically from the verified data (for example with
Matplotlib, R, or a suitable vector/GIS tool). Keep the data and plotting source
with the reviewable candidate. Use available image-generation skills/tools for
appropriate artwork and visual design, following their instructions. Generative
artwork must not supply or redraw authoritative quantitative marks. If combining
layers, retain the exact scientific plot and typeset labels through supported
tools; validate the final composite, not merely the original plot. If the available
tools cannot preserve it faithfully, deliver the exact plot and design brief and
report the limitation.

Prefer a native 16:9 master at 1920×1080 or larger; 1280×720 is the repository
minimum. Do not upscale a compressed thumbnail as the master. Use large, crisp
lettering and an obvious question → evidence → answer hierarchy, with at least
5% clear outer margins by default. No decorative haze, glow, or texture over
labels; keep interval caps, minus signs, decimal points, and legends intact.

Use current website tokens for the surrounding design: navy `#050a12`, panels
`#0a121d`, ink `#edf2f6`, blue `#88b9de`, gold `#e9c184`, secondary `#9baaba`,
and separators `#22303e`. Resolve the actual CSS tokens on each invocation and
record their current hex values and design roles in the brief; do not guess a
similar palette or treat this list as permanent. Aim for contrast of at least
4.5:1 for normal text and 3:1
for large text and essential graphic marks. The separator color is not suitable
for essential labels/whiskers. Preserve semantic chart/map colors, scales, class
breaks, and legends; use redundant labels or line/shape distinctions. Apply brand
colors around the evidence instead of changing its meaning. Gold never implies
that a positive unemployment estimate is a desirable outcome.

## Deliver the brief

Keep the brief economical but sufficient to reproduce and review the design:

- **Scope and sources:** paper/version, requested mode, destination, references
  actually inspected, user overrides, and unresolved source limitations.
- **Question / evidence / answer:** exact proposed on-image wording, selected
  visual and why it answers the question, essential qualifier and source credit.
- **Evidence ledger:** verified values and source locations, calculations,
  uncertainty, units, and interpretation limits.
- **Production instructions:** composition, palette and semantic exceptions,
  typography/margins, axis/legend specifications, deterministic versus generated
  layers, and a concise generation prompt only when that method is useful.
- **Delivery plan:** asset paths, EN/ES/JA alt descriptions, WebP and display
  checks; mark planned checks as pending until actually run.

Read the brief back and cross-check question, answer, ledger, and production
instructions for contradictions. A brief-only result cannot certify image quality
or delivered bytes. End there unless rendering/installation was requested.

## Render, install, and verify when requested

Render candidates in scratch first. Check the final image against the ledger:
every mark's position, scale, sign, label, interval endpoint, unit, legend, and
geographic assignment. Inspect both full size and small previews. Current research
rows use **160 CSS px on desktop and 96 CSS px on mobile**, with `object-fit:
contain`; confirm current CSS. Judge question/answer recognition and the principal
visual at those sizes, not just in a 400 px preview. Shorten copy or simplify the
composition if needed. Fine ticks and interval notes belong to the full-image
reading experience; do not claim that all details are readable at 96 px.

Encode the selected candidate as `featured.webp`, starting near quality 90 and
comparing actual output. Consider lossless WebP for fragile text/linework; optimize
only while scientific marks, semantic colors, and lettering remain clear. Measure
the **encoded file's bytes** and dimensions, and report bytes (optionally KiB),
not an estimate based on a generation setting. Inspect the WebP itself. No arbitrary
byte target takes priority over readability.

For installation, update the corresponding bundle under `content/publication/`,
`content/es/publication/`, and `content/ja/publication/`. Read the glossary and
publication/asset conventions in
`../translate-content/references/glossary.md` and
`../translate-content/references/field-rules.md` relative to this skill. Default
to the same image bytes in all three bundles, as in the approved Okun example;
localized artwork is an option when requested, with identical scientific content.
Publications use full translations, never the teaching-post stub convention. If a
counterpart page is missing, create its full translation within an authorized
installation or report the missing dependency; do not claim parity from images alone.

Write a meaningful localized `image.alt_text` in each `index.md`: the question,
core result, units, uncertainty, and answer, in neutral Latin American Spanish
and polite Japanese where applicable. The approved publication practice localizes
this field even though the older general translation rules say to copy the whole
`image` block; preserve the other image settings. Keep identifiers, DOI, dates,
URLs, and unrelated prose intact. The homepage thumbnail is currently decorative
inside an `aria-hidden` link with `alt=""`; verify descriptive text on the actual
publication/full-image view without changing that shared thumbnail contract.

Before replacing a prior `featured.*`, inspect Hugo's `*featured*` selection and
avoid ambiguous duplicate candidates. Keep backups outside the content bundle.
Verify identical hashes across locales for shared artwork, or corresponding
scientific content for localized versions. Run `scripts/i18n-parity.sh` and a
production build using the pinned Hugo from `CLAUDE.md`, writing build/cache output
to scratch when appropriate. Distinguish pre-existing failures from this change.

Inspect EN/ES/JA rendered publication pages plus the research cards at desktop
and mobile widths. Check full composition, readable question/answer, no clipping,
responsive WebP selection, and no blur, overlay, or transform washing out the
thumbnail. Preserve the current 320×180 q88 and 640×360 q92 thumbnail pipeline,
`srcset`, lazy loading, and async decoding. Measure the delivered thumbnail files
as well as the master. Open/enlarge the image through the existing viewer when
available; check that the full image, localized alt description, and mobile fitting
work. A render-only candidate may use an isolated preview; name anything not tested
on the real page. Report layout/viewer defects without expanding an asset request
into unrelated shared-template edits.

Finish with exact output paths, the selected question and answer, source anchors,
measured image/thumbnail dimensions and bytes if rendered, locales updated, and
checks actually performed versus pending. Leave changes uncommitted.

## Worked example: Okun's law in Indonesia

Use this to calibrate source fidelity and hierarchy, not as a universal chart:
`content/publication/20260528-EM/` contains *Okun's law and spatial regimes in
Indonesia: A machine learning approach*. Its approved image asks **"Growth up,
unemployment down?"**, shows four estimates with uncertainty in the middle, and
answers **"Not everywhere."** The user removed filled bars: preserve **estimate
dots and capped interval lines only** when reproducing this version.

For the bundled `working-paper.pdf`, Table 6 on printed/PDF page 22, **Long Run →
Total Effects**, reports the following estimates and parenthesized standard errors.
Check the current source before reuse; do not substitute Table 3 slopes, short-run
totals, direct effects, or province-level results.

| Regime | Estimate | SE | Derived endpoints: estimate ± 1.96 SE |
|---|---:|---:|---|
| G1 | −0.189 | 0.045 | [−0.27720, −0.10080] |
| G2 | +0.137 | 0.050 | [+0.03900, +0.23500] |
| G3 | −0.028 | 0.024 | [−0.07504, +0.01904] |
| G4 | −0.014 | 0.028 | [−0.06888, +0.04088] |

These are long-run total model associations, in percentage points of unemployment
rate change per percentage point of GDP growth (see Eq. 1 and §§2.1, 3.3). Table 6
uses 4,626 observations; the underlying 2011–2020 panel has 514 districts, which
is different from the estimation observation count. The displayed intervals are
an approximate normal reconstruction from rounded SEs, not intervals printed in
Table 6. Label them **"Whiskers: estimate ± 1.96 SE"**. Keep a common linear scale
and visible zero line. G3/G4 cross zero; do not label them "no effect". G1/G2's
opposite signs support heterogeneity, not a causal claim that growth creates or
destroys jobs. G1–G4 are learned district regimes, not four invented geographic
blocks. The approved blue/gold/neutral colors distinguish displayed results, not
a good/bad ranking.
