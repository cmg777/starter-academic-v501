# JASID deck rebuild: new AI cover, Quarto source, interactive dumbbells

Carlos asked for a different first image and thumbnail for `content/presentations/20261129JASID/`
(the talk reused the satellite-over-Earth-at-night idea already carried by the ADBI talk
`20261030ADBI`, and neither image said anything about AI), for the story flow to be improved with
the craft in `.claude/skills/write-slides/references/`, and for the results to be illustrated with
the dumbbell plots from the original research deck.

## Cover artwork

Three candidates generated with the bundled Codex CLI
(`/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex exec`,
`image_generation` feature). Carlos selected candidate 3: an Andean valley seen from orbit at dawn,
with a lattice of pale-blue nodes rising off the landscape and converging into a vertical column of
numbers, three of them legible (0.42, −1.07, 0.88). The left 48% of the frame is deliberately dark
and empty, because `#title-slide .title-card` is `margin-left: 5.5%; width: 45%`.

Selected PNG 2,472,698 bytes at 1920×1080, encoded to WebP quality 94 (Pillow, method 6):
`slides/figures/fig-title-ai-satellite.webp`, 273,364 bytes at 1920×1080. No visible banding in the
sky gradient at q94; q90 was 184,042 bytes and was not used.

The old `fig-title-orbital-monitoring.png` (2,385,026 bytes) was deleted. Three references had to
move with it: the `data-background-image` in `title-slide.html`, the directional-veil selector in
`theme.scss` (`.slide-background-content[style*="…"]::after`), and the closing slide. The
`title-background-description` alt paragraph was rewritten to describe the new artwork.

`featured.jpg` is a headless-Chrome capture of the rendered title slide at 1920×1080 with the reveal
progress bar, slide number, controls and menu button hidden by injected CSS, encoded at JPEG q90
4:4:4: 334,856 bytes, byte-identical in the EN, ES and JA bundles (md5 7f4fc4019fa357bd10c4825b2627a89d).
It replaces a 1280×720 capture, which was the bare minimum under design-system §5.

## Deck source recovered

The bundle shipped only the rendered `index.html` and `jasid.css`; no `slides.qmd` existed anywhere
on disk. The deck was rebuilt from `~/Documents/GitHub/project2026e-slides/monitoring-local-development.qmd`
and now carries its own source. Copied over verbatim: `theme.scss` (the compiled theme already in
`slides_files/` was confirmed to be this file), `title-slide.html`, `fonts.html`, `plotly.html`.
`jasid.css` is kept — it is a layout layer on top of the theme, not a replacement — and
`slides/fonts/` already held the three variable TTFs.

`embed-resources` stays **false**, unlike the source deck: the sidecar `slides_files/` is what is
committed, and `true` would base64-inline the 4.3 MB plotly bundle into a single index.html that the
Hugo iframe must download before the first slide paints.

## Story flow: 19 slides to 17

Three acts with two full-bleed `#06101F` dividers, assertion titles throughout, and a `.takeaway`
card on each of the nine substantive non-chart slides. Merged: "AI turns repeated observations into
useful predictors" + "An embedding summarizes a place as 64 numbers" into one slide; "A visible
landscape cannot reveal every household's life" + "Predictions can guide where to look next" into a
two-column limits slide. Cut to speaker notes: the illustrative `[0.23, −0.51, …]` vector slide and
the standalone "must work on places left out of training" slide, whose point now rides in the
out-of-sample framing of the chart slides. Every cut paragraph was preserved verbatim in
`::: {.notes}`, including the provenance sentences.

The population-weighting slide moved out of Act I and into Act II as the methodological pivot
between the two dumbbells, so the sequence now reads: lights win on the simple average → most land
is empty → weight by population and the embeddings win.

## Figures

Replaced by interactive Plotly figures from the original deck (`{{< include >}}` inside a
```` ```{=html} ```` fence), with `plotly.min.js` (4,293,347 bytes) and `geo-municipalities.js`
(389,575 bytes):

| New | Replaces |
|---|---|
| `fig-r2-master-simple.html` | `poverty-weighting.svg` |
| `fig-r2-master.html` | `poverty-weighting.svg`, `poverty-random-split.svg` |
| `fig-combined-range.html` | `poverty-random-split.svg`, `poverty-department-transfer.svg` |
| `fig-views-lisa-sdg1.html` | `poverty-lisa-comparison.svg` |

Also deleted: `year-observations.png` (2,547,277 bytes), an orphan tracked since `6adc6c2b` and
referenced by no slide. Net bundle change 19 MB → 18 MB.

Every poverty value quoted on a slide was decoded from the figures' own binary `bdata` arrays rather
than copied from prose: simple aggregation 0.515 lights / 0.375 embeddings; population-weighted
0.553 / 0.691; combined predictor 0.537 under whole-department transfer and 0.721 under the random
split. **Poverty is the top row of all three charts** — the first draft said "bottom row" in three
captions and three notes and was corrected after seeing the rendered chart.

The two bespoke teaching figures `ntl-poverty-scatter.svg` and `ntl-r2-teaching.svg` stay in the main
flow at Carlos's request, immediately before the first dumbbell, where they now also serve to define
R² for the charts that follow.

## Validation

Quarto 1.8.27 (`$HOME/opt/bin/quarto`) rendered `index.html` (454 KB) + `slides_files/`. Static
checks: 0 leaked `{{< include` markers, 4 `.plotly-figure` divs, 1 reference each to `plotly.min.js`
and `geo-municipalities.js`, 0 references to the old cover, every referenced figure present on disk.
Two stale hash-named generated files left behind by the re-render were removed
(`quarto-b1e627a8….css`, `quarto-syntax-highlighting-dark-4d9afe2b….css`); exactly one theme and one
syntax stylesheet remain.

A CDP driver stepped through the whole deck in headless Chrome at 1280×720:
`Reveal.getTotalSlides()` reports **17**, every slide has **0 px overflow**, all four Plotly figures
draw (3 `<svg>` each, including the LISA map, which defers `Plotly.newPlot` to `slidechanged` and
only paints once its slide is active), and the console is clean apart from a favicon 404 from the
throwaway test server. `scripts/i18n-parity.sh` reports 0 missing, 0 stale, 0 asset-warn.

**Not run:** the pinned Hugo production build, the Hugo-served HTTP checks and
`scripts/audit-site.py` — Hugo is no longer installed on this machine (`CLAUDE.md` still points at
`$HOME/Library/Application Support/Hugo/0.111.3/hugo`, which does not exist). `node` is absent too,
so `node --test tests/*.cjs` did not run; no test touches this bundle. The deck was verified over a
`python3 -m http.server` instead. The new file types inside the bundle (`.qmd`, `.scss`,
`title-slide.html`) match what `content/presentations/20260721GSID/slides/` already ships and
Netlify already builds.

Side fix: `.claude/skills/write-slides/SKILL.md` and two of its references pointed at
`/Applications/quarto/bin/quarto`, which does not exist here; they now use `$HOME/opt/bin/quarto`.

The trilingual `index.md` files are unchanged: title, subtitle, slug, `url_slides`, the iframe and
the summary and abstract all remain accurate — the talk is still scoped to SDG 1, with the other
goals present only as context around the highlighted poverty row.
