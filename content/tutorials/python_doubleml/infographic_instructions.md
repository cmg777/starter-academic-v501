# Estimating Causal Effects with Double Machine Learning

## Design Style

- **Chalkboard sketchnote aesthetic**: dark background with chalk-drawn lettering, chalk-dust textures, and hand-sketched icons that look drawn in white or colored chalk
- Use simple chalk-style illustrations: decision trees for ML learners, crossed-out confounders for partialling out, folded data blocks for cross-fitting, stick figures for job seekers, noise-canceling headphones for the "signal vs noise" analogy
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

### Panel 1 — The Confounding Problem

- Machine learning excels at prediction -- but predicting well does not mean you have found a causal effect.
- Confounders that drive both treatment and outcome can bias naive estimates, making a bonus look more or less effective than it really is.
- DML uses ML to strip away confounding "noise," leaving only the causal signal.

### Panel 2 — Pennsylvania Bonus Experiment

- 5,099 unemployment insurance claimants -- 1,745 offered a cash bonus for finding work fast, 3,354 assigned to control.
- 15 covariates capture demographics and labor market history; covariate balance confirms proper randomization.
- Raw outcome gap: bonus recipients log about 0.09 fewer log points of unemployment duration.

### Panel 3 — Partialling Out with Cross-Fitting

- DML fits two ML models -- one predicts the outcome, one predicts treatment -- then regresses outcome residuals on treatment residuals to isolate the causal effect.
- 5-fold cross-fitting ensures each observation's residual is predicted out-of-sample, eliminating regularization bias.
- Random Forest DML estimate: -0.0736 (SE = 0.0354, p = 0.038) -- a statistically significant causal effect.

### Panel 4 — Four Methods Compared

- Naive OLS: -0.0855. OLS with covariates: -0.0717. DML with Random Forest: -0.0736. DML with Lasso: -0.0712.
- RF and Lasso DML estimates differ by only 0.0024 -- less than 7% of the standard error -- confirming learner robustness.
- All four methods agree on direction: the bonus reduces unemployment duration.

### Panel 5 — Key Insight: A 7.4% Faster Return to Work

- The cash bonus reduces unemployment duration by 7.4%, but the 95% confidence interval spans 0.4% to 14.3% -- a wide range of plausible effect sizes.
- In this randomized experiment, DML and covariate-adjusted OLS agree closely -- DML's advantage is providing valid standard errors and confidence intervals.

### Panel 6 — Bottom Line

- Use DML when confounders are high-dimensional or their functional form is unknown -- it lets flexible ML handle nuisance functions while keeping causal inference rigorous.
- The PLR model assumes a constant treatment effect; for heterogeneous effects, extend to the Interactive Regression Model or causal forests.
- Robustness check: if switching ML learners changes your estimate substantially, revisit your model specification.
