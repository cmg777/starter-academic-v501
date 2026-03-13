# Bounding Causal Effects When Confounders Are Hidden

## Design Style

- **Sketchnote aesthetic**: hand-drawn feel with informal lettering, doodle-style icons, and hand-sketched arrows connecting ideas
- Use simple illustrations: stick figures for workers, magnifying glass for "unmeasured," brackets for bounds, a scale/balance for trade-offs
- Panels flow top-to-bottom or left-to-right with visual connectors (arrows, dotted lines)
- Key numbers should be large and bold; supporting text should be compact

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary / headers | Steel blue | `#6a9bcc` |
| Accents / highlights | Warm orange | `#d97757` |
| Text / outlines | Near black | `#141413` |
| Call-outs / emphasis | Teal | `#00d4c8` |
| Panel titles | Heading blue | `#1a3a8a` |

- Use steel blue for panel borders and section headers
- Use warm orange for key numbers and warning highlights (e.g., bias)
- Use teal for positive emphasis (e.g., "32% tighter")
- Use near black for body text and sketch outlines

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
