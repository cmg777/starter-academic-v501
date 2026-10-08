# Infographic instructions — Staggered Synthetic Difference-in-Differences (Gender Quotas)

A storyboard-first chalkboard infographic for the post *Staggered Synthetic Difference-in-Differences (SDID) in Stata: Gender Quotas and Women in Parliament*. Template: **Causal Inference**, layered panels (content-dense). Generate the image in Gemini/Imagen, then overlay the panel body text from Section D by hand for crisp numbers.

**Story Spine (one sentence):** *Staggered synthetic difference-in-differences reveals that parliamentary gender quotas raise women's representation by about eight percentage points — by building a separate synthetic control for each adoption cohort and aggregating them — challenging the assumption that one two-way fixed-effects regression can summarize policies that arrive on different clocks.*

**Guiding question (title banner):** "When policies arrive on different clocks, what does '+8 points' really mean?"

**3 BIG numbers (warm-orange callouts):**
- **+8.0 pp** — overall ATT (women in parliament)
- **9 countries / 7 cohorts** — the staggered structure
- **−3.5 … +21.8** — the range of cohort effects

**3 contextual numbers (smaller, ink):** N = 119 countries · 1990–2015 · *p* = 0.032

**Palette:** chalk on dark slate. Treated/adopting = warm orange (#d97757); control/synthetic = steel blue (#6a9bcc); SDID aggregate / positive effect = teal (#00d4c8); ink/near-black slate (#141413) background; chalk-white linework and handwriting.

---

## Section A — Full image-generation prompt (flowing prose, ~850 words)

A hand-drawn chalkboard infographic on a dark slate-green background, in the style of an economics professor's lecture board — loose chalk linework, simple sketch metaphors rather than precise charts, warm and inviting, a little imperfect. The board is organized as a left-to-right story in six numbered panels, with a bold hand-lettered title banner across the top reading **"WHEN POLICIES ARRIVE ON DIFFERENT CLOCKS"** and a smaller subtitle beneath: *Do gender quotas raise women in parliament — and what does an average mean when each country adopts in a different year?* Three large warm-orange chalk callout numbers float prominently near the top: **+8.0 points**, **9 countries / 7 cohorts**, and **−3.5 to +21.8**. Small ink notes read *119 countries · 1990–2015 · p = 0.032*.

Panel 1 (Hook), top-left: a row of small wall clocks drawn in chalk, each showing a different year — 2000, 2002, 2003, 2005, 2010, 2012, 2013 — sitting above a simplified strip of a world map with a few countries lightly shaded warm orange. A hand-lettered caption: *"Nine countries, seven different years."* The metaphor: the same policy, adopted on different clocks.

Panel 2 (Stakes): a tangled bundle of chalk wires plugged into a junction box, where an arrow labelled *"already-treated country"* is wrongly plugged in as a *"control"* for a later adopter. A small warning triangle with a minus sign hovers nearby. Caption: *"The naive regression secretly uses the already-treated as controls — weights can even go negative."* This is the forbidden-comparison problem, sketched as crossed wires.

Panel 3 (Attempt): a staircase drawn in chalk, each step shaded orange, being sliced by a dotted line into separate clean steps. Caption: *"Split the staircase into clean cohorts."* The staggered adoption pattern becoming separate per-cohort problems.

Panel 4 (Twist — the comparison metaphor): a set of small balance scales, one per cohort. On the left pan of each scale sits a single orange figure (the treated cohort); on the right pan, a blend of several small steel-blue figures (donor countries) forming a *synthetic twin*. A chalk label: *"Each cohort gets its own synthetic control, built only from never-treated countries."* The teal weights ω and λ are written lightly beside one scale.

Panel 5 (Surprise): a row of vertical chalk bars, one per cohort year, most rising in teal but two dipping below a baseline in orange, with a dashed teal horizontal line drawn across them labelled *"+8.0 average."* Tiny labels mark the tallest bar (2012, +21.8) and the dips (2005, −3.5). Caption: *"Effects swing from −3.5 to +21.8 — the average hides the spread."*

Panel 6 (Resolution), bottom-right: a simple event-study sketch — a horizontal time axis with a vertical "adoption" line in the middle; to the left, a string of small dots hugging the zero line (labelled *"placebos ≈ 0"*); to the right, dots climbing upward and staying high, with a faint shaded band around them widening to the right. Caption: *"Read the event study: flat before, climbing after."*

Around the margins, two "professor's notes" in looser handwriting with little arrows pointing back to panels: one near Panel 2 reading *"TWFE can flip signs under staggered timing; per-cohort SDID never uses a treated unit as a control,"* and one near Panel 6 reading *"Pre-period dots near zero are the placebo test — they're what make the post-period effect believable."* In the bottom-left corner, a small color legend: an orange square = *treated / adopting country*, a steel-blue square = *synthetic control*, a teal square = *SDID effect*. Faintly, at about 15% opacity behind the panels, a few chalk formulas float as background texture: *ATT = Σ (Nₐ·Tₐ / ΣN·T) · τₐ*, a small simplex note *Σωᵢ = 1, ωᵢ ≥ 0*, and a tiny three-step staircase doodle. The overall feel is a single coherent lecture board that walks the eye from "different clocks" to "read the event study," warm and legible, chalk textures throughout, no photorealism.

---

## Section B — Negative prompt

photorealistic, 3D render, glossy, corporate stock-photo style, precise data-visualization charts with gridlines and tick labels, axis numbers, spreadsheet, neon colors, cluttered, busy gradients, smooth vector flatness, watermark, distorted text, gibberish lettering, misspelled words, tiny unreadable numbers, more than three large callout numbers, pie charts, photographic faces, flags in full detail, political party logos.

---

## Section C — Condensed prompt (~190 words)

Hand-drawn chalkboard infographic, dark slate background, economics-lecture style, loose chalk linework, simple sketch metaphors (not precise charts). Title banner: **"WHEN POLICIES ARRIVE ON DIFFERENT CLOCKS."** Three big warm-orange callout numbers: **+8.0 points**, **9 countries / 7 cohorts**, **−3.5 to +21.8**. Six numbered panels left to right: (1) a row of small wall clocks showing 2000–2013 over a faint world-map strip — *"nine countries, seven years"*; (2) tangled chalk wires where an *"already-treated"* country is wrongly plugged in as a *"control"*, a minus-sign warning — the forbidden comparison; (3) an orange staircase being sliced into clean steps — *"split into cohorts"*; (4) small balance scales, one orange treated figure weighed against a blend of steel-blue donor figures — *"each cohort gets its own synthetic twin"*; (5) a row of bars, mostly teal rising, two orange dipping, a dashed *"+8.0 average"* line — *"effects swing −3.5 to +21.8"*; (6) an event-study sketch, dots flat at zero before a vertical adoption line, climbing after — *"flat before, climbing after."* Legend: orange = treated, steel = synthetic, teal = SDID. Chalk formulas faint in the background. Warm, legible, imperfect.

---

## Section D — Panel reference data (for manual text overlay)

Every number below is verified against `index.md` / `results_report.md`.

**Title:** WHEN POLICIES ARRIVE ON DIFFERENT CLOCKS
**Subtitle:** Do gender quotas raise women in parliament — and what does an average mean when each country adopts in a different year?

**Big numbers:**
- +8.0 pp — overall ATT (SE 3.74, *p* = 0.032)
- 9 countries / 7 cohorts — staggered adoption (2000, 2002, 2003, 2005, 2010, 2012, 2013)
- −3.5 to +21.8 — range of cohort effects

**Panel 1 — Hook.** *Body:* Nine countries adopted a parliamentary gender quota between 2000 and 2013 — each in a different year. This is a staggered adoption design.

**Panel 2 — Stakes.** *Body:* The standard two-way fixed-effects regression secretly uses already-treated countries as controls for later adopters. Under heterogeneous timing its weights can go negative, so the estimate can even flip sign (Goodman-Bacon 2021).

**Panel 3 — Attempt.** *Body:* Staggered SDID splits the panel into adoption cohorts and runs one clean synthetic difference-in-differences per cohort, always against the 110 never-treated countries.

**Panel 4 — Twist (comparison metaphor).** *Body:* Each cohort gets its own synthetic control — a weighted blend (unit weights ω) of never-treated donor countries that tracks the cohort's pre-adoption trend, with time weights λ choosing the baseline years.

**Panel 5 — Surprise.** *Body:* The cohort effects range from −3.5 points (2005) to +21.8 (2012). The overall +8.0 is their treated-period-weighted average — not a universal constant. (Unweighted mean ≈ 7.0.)

**Panel 6 — Resolution.** *Body:* The sdid_event event study reads the dynamics: pre-adoption placebo coefficients hug zero (parallel trends hold), and post-adoption effects appear immediately (+4.1 pp) and persist above zero for over a decade.

**Professor's note 1 (→ Panel 2):** TWFE can flip signs under staggered timing; per-cohort SDID never uses a treated unit as a control.
**Professor's note 2 (→ Panel 6):** Pre-period dots near zero are the placebo test — they are what make the post-period effect believable.

**Legend:** orange = treated / adopting country · steel blue = synthetic control · teal = SDID effect / aggregate

**Background formulas (15–20% opacity):**
- ATT = Σₐ (Nₐ·Tₐ / Σ N·T) · τₐ
- Σ ωᵢ = 1, ωᵢ ≥ 0
- a small three-step staircase doodle
