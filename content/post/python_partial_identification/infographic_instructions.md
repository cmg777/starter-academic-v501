# Bounding Causal Effects When Confounders Are Hidden

## Design Style

- **Chalkboard sketchnote aesthetic**: dark background with chalk-drawn lettering, chalk-dust textures, and hand-sketched icons that look drawn in white or colored chalk
- Use simple chalk-style illustrations: stick figures for workers, magnifying glass for "unmeasured," brackets for bounds, a scale/balance for trade-offs
- Panel borders: chalk-drawn rounded rectangles with slightly uneven edges (hand-drawn feel)
- Connectors: chalk arrows and dotted chalk lines between panels showing narrative flow
- Key numbers: oversized chalk-style numerals, optionally circled or underlined with a chalk swoosh
- Subtle chalk dust / smudge effects near text edges for realism

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Navy blue | `#0e1545` |
| Body text / outlines | Chalk white | `#f0ece2` |
| Panel titles / headers | Steel blue (bright) | `#8bb8e0` |
| Accents / key numbers | Warm orange | `#e8956a` |
| Call-outs / positive emphasis | Teal | `#00d4c8` |
| Underlines / secondary accents | Muted chalk gray | `#b0a89a` |

- Use steel blue for panel titles and chalk-drawn borders
- Use warm orange for key numbers, bold callouts, and warning highlights (e.g., bias)
- Use teal for positive emphasis (e.g., "32% tighter", improvement metrics)
- Use chalk white for body text and sketch outlines
- Use muted gray for connectors, dotted lines, and de-emphasized annotations
- Never use pure white (`#ffffff`) -- chalk is always slightly warm/creamy

## Visual Hierarchy

- **Panel titles**: largest text, steel blue, all caps or small caps chalk lettering
- **Key numbers**: second largest, warm orange, optionally circled or underlined
- **Body sentences**: chalk white, compact hand-lettered style
- **Annotations / labels**: muted chalk gray, smaller size
- **Icons / illustrations**: chalk white outlines with occasional color fills (teal or orange)

## Panel Layout

- **Landscape orientation** (e.g., 1920x1080 or 16:9 aspect ratio)
- 6 panels arranged in a 3x2 grid (3 columns x 2 rows)
- Each panel: chalk-drawn rounded rectangle border in steel blue
- Panels connected by chalk arrows or dotted lines showing the narrative flow (1->2->3->4->5->6)
- Small panel number in top-left corner of each panel (warm orange, circled)
- Leave breathing room between panels -- the dark background itself is a design element

## Panel Content (6 Panels)

### Panel 1 — The Problem

- Standard causal methods assume all confounders are observed -- but what if that assumption fails?
- Partial identification offers an honest alternative: instead of one number, compute a guaranteed range of values the true effect must lie within.
- Credible uncertainty over incredible certainty.

### Panel 2 — Case Study

- 1,000 workers. Treatment: job training. Outcome: got a job within 6 months.
- An unmeasured confounder -- prior work experience -- inflates the naive estimate to 38.2 pp, when the true effect is only 27 pp.
- Upward bias of 11.2 pp because experienced workers disproportionately enroll.

### Panel 3 — Manski Bounds (No Assumptions)

- Using only observed data and the law of total probability, Manski bounds bracket the ATE to [-0.298, 0.702].
- Width: exactly 1.0 -- we cannot determine even the sign of the effect.
- These bounds are sharp: no tighter bounds exist without additional assumptions.

### Panel 4 — Tighter Bounds (Entropy & PNS)

- Entropy bounds limit how much the hidden confounder can distort the data, narrowing the ATE to [-0.228, 0.454] -- 32% tighter.
- Tian-Pearl bounds answer a deeper question: was training both necessary AND sufficient? PNS bounded to [0%, 70.2%].

### Panel 5 — Key Insight: More Data Doesn't Help

- Manski width stays at 1.0 from N = 100 to N = 5,000 -- identification bounds reflect what we fundamentally cannot learn, not sampling noise.
- To narrow bounds: add an instrument, assume monotonicity, or measure the confounder.

### Panel 6 — Bottom Line

- All confounders observed? Use point identification (DoWhy, DoubleML). Instrument available? Use IV. Neither? Partial identification.
- Partial identification doesn't give you THE answer -- it tells you honestly what the data can and cannot say.
- Any claim of a 75 pp benefit is inconsistent with the data -- the ATE cannot exceed 0.702.
