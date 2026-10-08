# Infographic prompt — "Who Are My Neighbors?"

Copy-pasteable prompt for an AI image generator. Target: 1920 × 1080, chalkboard
sketchnote, dark navy. Every number below is verified against `index.md`.

**Story spine:** *Every spatial econometric result is conditional on a
neighbourhood map somebody chose before the analysis began — so estimate the map
instead, and watch the answers move.*

---

## Section A — Full image generation prompt

A wide 1920×1080 hand-drawn chalkboard sketchnote on a deep navy background
(#0e1545), lit as if by a warm desk lamp from the upper left, with the faint
smudge and grain of a real slate board that has been erased many times. All
lettering is in a confident, slightly irregular chalk hand — the work of a
professor who draws well and quickly, not a typeface. Chalk white (#f0ece2) for
titles and body text, steel blue (#8bb8e0) for structure and arrows, warm orange
(#e8956a) for the ideas being challenged, teal (#00d4c8) for the payoff numbers,
and muted grey (#b0a89a) for annotations and small print.

Across the top, a title banner: **"WHO ARE MY NEIGHBORS?"** in large chalk
capitals, underlined twice with a slightly wobbly double rule, and beneath it in
smaller looping script: *"Spatial econometrics hands you the map. What if you
estimated it instead?"* To the far right of the banner, a small chalk sketch of
a dinner table seen from above with six place settings and question marks where
the name cards should be.

The body is a 3 × 2 grid of panels, each separated by thin chalk rules with the
slight bow of a hand-drawn line.

**Panel 1 (top left) — "THE MAP IS A CHOICE."** A simplified chalk outline of
Europe with five regions marked as small circles. Three different sets of
connecting lines are drawn over it in three colours: short orange arcs hugging
borders labelled *"contiguity"*, medium steel-blue arcs labelled *"7 nearest
neighbours"*, and long sweeping teal arcs labelled *"estimated"*. Below, in
chalk: *"Same data. Same model. Three different neighbourhoods."*

**Panel 2 (top centre) — "8,010 UNKNOWNS."** A large chalk balance scale. On the
heavy left pan, a stack of small squares labelled **8,010 links** tipping the
beam sharply down. On the light right pan, a thin stack labelled **1,710
observations**. Underneath the fulcrum, in orange chalk: **"4.7 parameters per
observation."** A small chalk speech bubble points at the scale: *"The likelihood
alone cannot do this."*

**Panel 3 (top right) — "THE PRIOR IS THE METHOD."** Two small curve sketches
side by side on a shared axis labelled *"neighbours per region"*. The left curve
is a wide grey bell centred at a chalk-circled **44.5**, labelled *"'non-
informative'"* with the quotation marks drawn emphatically. The right curve is a
narrow teal spike at **7**, labelled *"anchored"*. Between them a chalk arrow and
the words *"same word, opposite belief"*.

**Panel 4 (bottom left) — "IT REPRODUCES."** A neat chalk ledger of six rows, each
a quantity name on the left and a tick on the right, with the header **"12 of 12
EXACT"** in teal. Below the ledger, in small grey chalk: *"seed 571 · estimateW
0.2.0 · same RNG · same BLAS"*. A hand-drawn magnifying glass rests over the row
reading **ρ = 0.71322**.

**Panel 5 (bottom centre) — "THE MODEL FOUND THE BORDERS."** A chalk 6 × 6 grid
shaded to show bright blocks along the diagonal and sparse speckle elsewhere,
captioned *"posterior link probability, sorted by country"*. Two large numbers
sit beside it: **35.6%** in teal (*"weight on compatriots"*) above **7.1%** in
grey (*"if links were random"*). Beneath, in chalk capitals: **"NOBODY TOLD IT
ABOUT COUNTRIES."**

**Panel 6 (bottom right) — "THE ANSWER MOVES."** Two chalk bars side by side
under the heading *"total effect of tertiary education"*. The left bar, teal and
tall, is labelled **0.00153 — estimated map**. The right bar, grey and less than
half the height, is labelled **0.00066 — contiguity**. A chalk bracket spans the
gap with **"2.3×"** written above it. Below: *"Same model. Different map.
Different policy."*

Around the margins, in the small looping hand of someone annotating their own
board: at the lower left, *"90 European NUTS-1 regions, 2001–2019"*; at the lower
right, *"replication of Krisztin & Piribauer (2026)"*; in the bottom-left corner,
a small honest note boxed in grey chalk: *"ESS(ρ) = 26.5 — trust the means, not
the intervals."* A few chalk-dust fingerprints and one half-erased equation ghost
in the background give the board a used, human texture.

Do not render the panels as flat vector infographic tiles; everything must read
as drawn by hand on slate, with visible chalk texture, slight line wobble, and
uneven pressure.

---

## Section B — Negative prompt

photorealistic, 3D render, glossy plastic, stock-photo people, corporate clip
art, flat vector infographic style, gradient meshes, drop shadows, neon glow,
lens flare, watermark, signature, QR code, pie charts, world map with pins,
generic "data" iconography, circuit-board motifs, glowing brains, robot hands,
crisp geometric typography, Helvetica, Arial, perfectly straight rules, mirrored
or duplicated text, gibberish lettering, misspelled words, more than six panels,
busy background patterns, rainbow palettes, purple and magenta, light or white
backgrounds.

---

## Section C — Condensed prompt (< 250 words)

Hand-drawn chalkboard sketchnote, 1920×1080, deep navy slate (#0e1545), chalk
white (#f0ece2), steel blue (#8bb8e0), warm orange (#e8956a), teal (#00d4c8),
muted grey (#b0a89a). Title in chalk capitals: **"WHO ARE MY NEIGHBORS?"**,
double-underlined, subtitle *"Spatial econometrics hands you the map. What if you
estimated it instead?"*

Six panels in a 3×2 grid, hand-drawn rules between them:

1. Outline of Europe with three different sets of connecting arcs in orange,
   steel blue and teal — *"same data, three neighbourhoods"*.
2. A tipping balance scale: **8,010 links** outweighing **1,710 observations**;
   below it **"4.7 parameters per observation"**.
3. Two curves on one axis: a wide grey bell at **44.5** labelled *"'non-
   informative'"*, a narrow teal spike at **7** labelled *"anchored"*.
4. A ledger headed **"12 of 12 EXACT"** with a magnifying glass over
   **ρ = 0.71322**.
5. A 6×6 grid bright along the diagonal, with **35.6%** in teal over **7.1%** in
   grey, captioned **"NOBODY TOLD IT ABOUT COUNTRIES."**
6. Two bars: teal **0.00153** (estimated map) beside grey **0.00066**
   (contiguity), bracketed **"2.3×"**.

Margins carry small chalk notes: *"90 European NUTS-1 regions, 2001–2019"* and
*"ESS(ρ) = 26.5 — trust the means, not the intervals."* Visible chalk texture,
line wobble, half-erased ghosts. No vector-flat style, no photorealism, no
stock imagery.

---

## Section D — Panel reference data

All values verified against `index.md` and the CSV outputs.

### Story beats

| # | Beat | Panel |
|---|---|---|
| 1 | The neighbourhood map is a choice, not a fact | 1 |
| 2 | Estimating it is wildly underdetermined | 2 |
| 3 | Only an explicit prior makes it possible | 3 |
| 4 | The published result reproduces exactly | 4 |
| 5 | The estimated network is national, not geographic | 5 |
| 6 | Changing the map changes the policy number | 6 |

### The three BIG numbers

| Number | Meaning | Panel |
|---|---|---|
| **8,010** | off-diagonal cells estimated, against 1,710 observations | 2 |
| **35.6% vs 7.1%** | link weight on compatriots vs the chance benchmark | 5 |
| **2.3×** | how much larger the education effect is under the estimated map | 6 |

### ON-IMAGE text (must appear, verbatim)

- WHO ARE MY NEIGHBORS?
- 8,010 links · 1,710 observations · 4.7 parameters per observation
- 44.5 ("non-informative") vs 7 (anchored)
- 12 of 12 EXACT · ρ = 0.71322
- 35.6% vs 7.1% · NOBODY TOLD IT ABOUT COUNTRIES
- 0.00153 vs 0.00066 · 2.3×

### MARGIN text

- 90 European NUTS-1 regions, 2001–2019
- replication of Krisztin & Piribauer (2026)
- ESS(ρ) = 26.5 — trust the means, not the intervals

### REFERENCE only (do not render; context for the designer)

- Direct impact of initial productivity −0.01880; indirect −0.03972; ratio 2.11
- Estimated mean degree 6.47 against a prior anchor of 7
- Same-country AUC 0.753 vs queen-contiguity AUC 0.698
- Strongest links average 921 km vs 1,331 km for a random pair
- Ten of ninety regions have no queen-contiguity neighbour at all
- Ground-truth simulation: AUC 0.976, but no parameter interval covered the truth
