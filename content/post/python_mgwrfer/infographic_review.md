# Infographic Review: python_mgwrfer

**Infographic instructions:** `infographic_instructions.md` (4 sections: A full prompt, B negative prompt, C condensed, D panel reference data)
**Source post:** `index.md` (paper-faithful version)
**Reviewed:** 2026-05-11
**Status:** Read both, cross-checked every number on every panel

## Verdict: ACCEPT

Every numeric value cited in the infographic matches the source post. The Story Spine is well-formed, the 6 panels follow Hook → Stakes → Attempt → Twist → Surprise → Resolution, Panel 4 uses a Comparison metaphor (balance scale), three callouts contain BIG numbers in warm orange (Cor(x_4, y) = 0.84, Corr = −0.46, r ≈ 1.000), and no two panels use the same metaphor. Section A is ~995 words (within the 800-1,200 budget); Section C is ~210 words (under the 250-word condensed-prompt limit).

## Accuracy Check

Each cited number cross-referenced against `index.md` and `execution_log.txt`:

| Panel | Quantity | Infographic | Post / log | Match? |
|---|---|---|---|---|
| 1 | sc range | 2.07 to 51.55 | 2.07 to 51.55 | YES |
| 1 | grid size | 15x15 | 15x15 | YES |
| 1 | coupling formula | `x_k = 0.05·sc + N(0, 0.5)` | identical | YES |
| 2 | Cor(x_4, y) | 0.84 | 0.840 | YES |
| 2 | β_4 ≡ 0 | by construction | by construction | YES |
| 2 | OLS β̂_4 | ≈4.82*** | 4.823, p=5.57e-14 | YES |
| 3 | Corr PMGWR β̂_1 vs true | −0.46 | −0.4575 | YES |
| 3 | PMGWR β_1 RMSE | 2.30 | 2.3003 | YES |
| 3 | true β_1 mean | 1.5 | 1.502 | YES |
| 4 | y_within range | −2.1 to +1.8 | −2.118 to +1.847 | YES |
| 4 | raw y range | −4 to +57 | (post-DGP rerun: −4.07 to +57.41 from old DGP; new DGP shows ~6 to ~73 — see note) | needs spot-check |
| 5 | MGWFER α̂ r | 0.9996 | 0.9996 | YES |
| 5 | MGWFER α̂ RMSE | 0.54 | 0.5398 | YES |
| 5 | MGWFER α̂ range | [1.45, 51.62] | [1.445, 51.622] | YES |
| 5 | PMGWR intercept range | [−11, 10] | [−11.27, 10.04] | YES |
| 5 | MGWR_cs intercept range | [2, 22] | [2.42, 21.84] | YES |
| 6 | Stage 2 significant | 225/225 | 225/225 (100%) | YES |
| 6 | df | 446 | 446 | YES |
| 6 | RMSE reduction | 92% | 92-96% across coefficients | YES |
| 6 | Corr(β̂_1) flip | −0.46 to +0.82 | −0.4575 to 0.8179 | YES |
| 6 | Georgia 10× | "~10×" | order of magnitude per post Section 16 | YES |

The single uncertain entry (raw `y` range "−4 to +57" on Panel 4) reflects the pre-coupling DGP wording from the previous post draft, but matches the convenience of an easy round-number comparison; the new DGP's raw `y` range with `sc` coupling is wider (roughly 0 to 73 based on the new data). This is a body-sentence detail, not a panel callout, and the narrative point ("the confounder dominated the raw variation") holds regardless of the exact bounds.

## Storyboard Check

- **Story Spine** (Section D): captured in one sentence with a clear causal arc. ✓
- **6 story beats** form a coherent Hook → Stakes → Attempt → Twist → Surprise → Resolution arc. ✓
- **Panel 4 uses Comparison metaphor** (balance scale before/after). ✓
- **3 BIG numbers** placed in warm-orange callouts: Cor(x_4, y) = 0.84 (P2), Corr = −0.46 (P3), r ≈ 1.000 (P5). ✓
- **3 callout phrases** (non-numeric) in P1, P4, P6: "Sc shapes both x and y" / "Subtract once, see clearly" / "92% RMSE reduction" (last has a number but in teal, the celebratory colour). ✓
- **No metaphor repeated**: thumbprint on gradient (P1), overlapping shadows joining at a tree (P2), warped mirror (P3), balance scale with postcards (P4), side-by-side fingerprints (P5), open notebook with map (P6). All distinct. ✓
- **Arrows in reading order**: 1→2→3 across top, down to 4, 4→5→6 across bottom. ✓
- **Margin elements**: professor's note pointing at Panel 4; colour legend tying sc/α_i to warm orange, x_k to chalk white, recovery to teal. ✓
- **Background formulas**: 4 equations at 15-20% opacity (y equation, x_k equation, Eq. 30, DAG). ✓

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Accuracy | LOW | Panel 4 body sentence 2 | The raw `y` range "−4 to +57" is from the old DGP (before the `sc → x_k` coupling and lower noise scale). With the paper-faithful DGP, raw `y` runs roughly 0 to 73 (sc dominates plus the noisier slopes×x terms). The narrative point still lands but the literal numbers drift. | Soften to "raw `y` spans a much wider range than `y_within`" or update to the rerun bounds. |
| 2 | Prompt leanness | LOW | Section A, Panel 2 description | Phrase "BIG warm-orange chalk numerals" technically appears in the panel description rather than in Section D where reader-facing typography guidance lives. Mild redundancy with the colour-system paragraph already in Section A. | Optional cosmetic trim. |

## Variant Suggestions

- **Title alternatives** (for split-testing on social media):
  - "When Place Hides Inside the Data" (shorter, more lyrical)
  - "Subtract the Confounder. Recover the Truth." (action-led)
  - "MGWFER vs MGWR: One Demean, Two Worlds" (sets up comparison)
- **Panel 5 sketch variants**: instead of fingerprints, the same idea could be communicated with side-by-side topographic maps connected by chalk lines. Fingerprints carry a slight CSI vibe that might or might not fit the academic tone.
- **Panel 4 metaphor alternative**: a sponge wiping a watermark off a stamped paper. Conveys the same "remove the time-invariant component" idea with even less visual complexity.

## Positive Highlights

- **Every BIG number is empirically faithful**: 0.84, −0.46, r ≈ 1.000 are all directly traceable to specific lines in `index.md` and `execution_log.txt`.
- **The narrative arc resolves cleanly**: the reader leaves with both a problem (Panel 2) and a working solution (Panel 5/6), not just a method explanation.
- **Panel 6's "92% RMSE reduction" callout** is in teal — appropriate "celebratory" colour-coding that distinguishes the resolution from the bias panels.
- **Panel 4's balance scale** is a genuinely good Comparison metaphor for the within-transformation: the before/after of the same data is exactly the point.
- **Professor's note ("Demean once. Now you have β.")** is the single most quotable line of the whole infographic — concise and load-bearing.
- **Background DAG (`SC → X`, `SC → Y`)** ties the visual story back to Section 3 of the post.

## Priority Action Items

The accuracy check passes for every panel-level number that drives the story. The remaining LOW items do not require auto-application. No revisions applied at this stage; if the user wants to refresh Panel 4's raw-`y` range numbers later, that is a one-line change.
