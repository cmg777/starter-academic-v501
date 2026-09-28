# AhaSlides deck — source of truth

**Presentation:** The FWL Theorem: Making Multivariate Regressions Intuitive
**Subtitle:** Partialling-out a confounder to estimate a known +0.2 causal effect
**Author:** Carlos Mendez — Nagoya University (GSID)
**Source deck:** `../slides/slides.qmd` (Quarto reveal.js, 29 content slides + 4 act dividers + title)
**Post:** https://carlos-mendez.org/post/python_fwl/
**Language:** English only
**Public view link:** TBD (filled after the MCP build)
**Editor:** TBD (filled after the MCP build) — presentation ID and join code likewise TBD

## Composition

| Kind | Count |
|---|---|
| Title | 1 |
| Act dividers (incl. the closing sentence) | 4 |
| Content slides (images of the Quarto slides), incl. 6 "Before you look" cues | 29 |
| Interactive slides (new) | 7 |
| **Total** | **41** |

**Content slides are images.** All 34 pages of the Quarto deck are rendered to PDF and
imported, so the original typography, tables, LaTeX, code highlighting, the `.takeaway`
boxes and the act-divider colors are preserved exactly. AhaSlides supplies only the
audience layer. The procedure is in
[`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md); this deck's
specifics are in `README.md`.

## What this file is for

Because the content slides are images, this file is the **only** place three things live:

- **All 30 speaker notes**, carried over verbatim from `slides.qmd`. They cannot be
  attached to imported slides, so keep this file open on a second screen while presenting.
- **The 7 interactive slides** — question, options, correct answer, points — which are
  created natively through the MCP from `deck.json`.
- **The running order**, which `build_deck_json.py` validates.

## Free-plan constraints — accepted in advance

**This deck, like the other two, will be capped at 3 live participants on the free plan.**
That is measured on the earlier decks, not yet on this one. Both report **0 / 3** and
*"You have reached the free slide limit"* with eight interactive slides each —
`python_bridge_impact` (10040213) and `python_sc_bayes_spatial` (10042312) — and on the
latter the same 36 images with **no** interactive slides reported *"you can host up to 50
live participants"*, while converting all its quizzes to polls changed nothing. The free
allowance is a small count of interactive slides of *any* type, so these seven (one
`poll`, six `pick_answer_quiz`) are expected to land in the same place. The user has
accepted that trade-off.

So the deck uses the better mechanic rather than chasing the cap: six scored quizzes that
reveal the correct answer and keep a leaderboard, plus one genuine prediction poll. Word
Cloud, Rating Scale and Open Ended are separately premium and are not used. Run the deck
as-is for a small group or a demo, or upgrade to lift the cap; confirm the reading in the
editor after a fresh reload once the deck is built.

## Interactive slides at a glance

| # | Position | Type | Follows source page | Correct |
|---|---|---|---|---|
| I1 | 5 | poll | 4 — Before you look: what sign will the naive slope take? | none (prediction) |
| I2 | 14 | quiz | 12 — Before you look: which regression gives δ̂? | A. income on coupons |
| I3 | 20 | quiz | 17 — Before you look: does the Step 1 shortcut keep both numbers? | B. Same coefficient, but a much larger SE |
| I4 | 24 | quiz | 20 — Before you look: will Step 2's SE equal the full model's 0.1203? | B. Close, but slightly smaller |
| I5 | 29 | quiz | 24 — Before you look: does adding the means back change the slope? | A. No, the slope is unchanged |
| I6 | 32 | quiz | 26 — Before you look: does a second control move the coupon coefficient? | B. Slightly |
| I7 | 40 | quiz | 33 — FWL is Double Machine Learning with a linear mop | A. The two OLS partialling-out regressions (with flexible ML learners, plus cross-fitting) |

**How a cue works in the room.** Six of the seven interactive slides answer a "Before you
look" cue slide that is already in the Quarto deck, and each repeats that cue's A/B/C
options verbatim (the build checks it). Show the cue image, then advance to the
interactive slide to open voting; the next image is the reveal. I7 is the only one without
a cue: a recap quiz on the Double Machine Learning bridge slide.

**Callback.** I1 (slide 5) asks the room to predict the naive slope's sign before anyone has
seen the scatter. The Simpson's paradox side-by-side (slide 36) puts that same naive
−0.106 next to the conditioned +0.267 — show I1's bar chart again there.

# Slides

## 1 — Title

**Title:** The FWL Theorem: Making Multivariate Regressions Intuitive

**Subtitle:** Partialling-out a confounder to estimate a known +0.2 causal effect

**Image page:** 1 of 34

---

## 2 — Act divider

**Title:** The Tension

**Image page:** 2 of 34

**Background:** `#d97757`

---

## 3 — Content

**Title:** We planted a +0.2 coupon effect in 50 stores — will a regression find it?

**Image page:** 3 of 34

**Notes:** The hook: one dataset, one question, and — unusually — a known answer.
Because we built the data, we can grade every estimator against the truth. Do not reveal
the naive result yet; the next slide asks the room to predict it.

---

## 4 — Cue slide (Before you look)

**Title:** Before you look: what sign will the naive slope take?

**Image page:** 4 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: regress sales on coupons with no controls — what sign does the
slope take? Give 20 seconds, then take the vote. Follow-up for the discussion: if it is
not +0.2, which variable is to blame? Answer on the next slide: C, negative (−0.1059),
because income confounds the comparison. (AhaSlides interactive I1 follows.)

---

## 5 — ★ INTERACTIVE 1 — Poll (no correct answer)

**Type:** multiple-choice poll · single selection · results as bar chart

**Question:** Regress sales on coupons alone. What sign will the slope take?

**Options:**

- A. Positive, close to the true +0.2
- B. Roughly zero
- C. Negative

**Correct answer:** none — this is a prediction poll, not a quiz.

**Notes:** A pure prediction poll: there is no right answer to score, and nobody should
be told they were wrong. The previous slide already asked the question; this is where
the room commits. Give 20 seconds, then close the vote and do not comment on the split —
the true effect is +0.2, so most people expect the naive slope to land near it (A) or to
wash out (B). The next slide answers it: C, negative. The slope is −0.1059, because
income confounds the comparison. If B draws votes, grant the fair part: the naive slope
is not significant (p = 0.365). But its sign is backwards from the planted +0.2, and
that is the point. Screenshot the bar chart or keep it open in a second tab: the
Simpson's paradox side-by-side (slide 36) is the moment to show the room what it
originally predicted.

---

## 6 — Content

**Title:** Naive regression: coupons look like they *reduce* sales

**Image page:** 5 of 34

**Notes:** The answer to the vote: negative. The slope is −0.1059 even though we planted
+0.2. Don't explain the mechanism yet — just plant that the raw picture is negative and
misleading. Income is the culprit; we earn the reversal in Act II and return to this
picture in the side-by-side at the end.

---

## 7 — Content

**Title:** Where we're going

**Image page:** 6 of 34

**Notes:** Built from the post's learning objectives. Teaching deck, so we signpost.
Keep it to one breath per line. Six "Before you look" slides along the way ask the room
to predict before each reveal.

---

## 8 — Act divider

**Title:** The Investigation

**Image page:** 7 of 34

**Background:** `#6a9bcc`

---

## 9 — Content

**Title:** Income is a confounder that opens a backdoor from coupons to sales

**Image page:** 8 of 34

**Notes:** This is the DAG from the post in words. Income drives both the treatment and
the outcome — the textbook confounder. Blocking the backdoor means conditioning on
income. FWL is the elegant way to do exactly that and to picture it.

---

## 10 — Content

**Title:** A simulated lab with a known answer: the true effect is exactly +0.2

**Image page:** 9 of 34

**Notes:** Why simulate? Because the true causal effect is known by construction —
exactly +0.2 — so we can grade every method against ground truth. 50 stores, income
centered at \$50K. Day of week is drawn uniformly from 1 to 7, independently of income
and coupons. Coupons fall with income; sales rise with coupons, income, and day of week.
The draw order (income, day of week, coupons, sales) matters for reproducing the seed-42
sample. The full function rounds each column to two decimals before returning the
DataFrame.

---

## 11 — Content

**Title:** The naive slope is −0.106 — and points the wrong way (p = 0.365)

**Image page:** 10 of 34

**Notes:** Each extra percentage point of coupons is "associated with" \$106 less in
daily sales — but it is not significant and it contradicts the planted +0.2. Wealthy
neighborhoods use fewer coupons yet spend more, so the raw slope inherits income's
negative coupon link. This is the result the controls will fix.

---

## 12 — Content

**Title:** Add income as a control and the slope flips to +0.267 (p = 0.031)

**Image page:** 11 of 34

**Notes:** One control reverses the conclusion. The CI [0.025, 0.509] now excludes zero.
Income itself is strongly positive (+0.3836, p < 0.001), confirming richer stores spend
more — call it γ̂; we need it on the next slides. But how big is the bias, exactly, and
what is the regression *doing* when it "controls for" income?

---

## 13 — Cue slide (Before you look)

**Title:** Before you look: which regression gives δ̂?

**Image page:** 12 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: the gap between the naive and the full slope is −0.3732, and it
equals γ̂ × δ̂ with γ̂ = 0.3836. Which auxiliary regression supplies δ̂: income on
coupons, or coupons on income? Answer on the next slide: A — regress the omitted
variable (income) on the treatment (coupons). Its slope, −0.9730, gives 0.3836 ×
(−0.9730) = −0.3732, the whole gap. The reverse regression (slope −0.3935) gives −0.151
and reconciles nothing. C is the partialling-out regression for sales, a different
auxiliary regression altogether. If anyone assumes the two directions are
interchangeable, point out that both slopes share the same covariance but divide it by
different variances (coupons' versus income's), so they differ. (AhaSlides interactive
I2 follows.)

---

## 14 — ★ INTERACTIVE 2 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** The naive-minus-full gap is −0.3732 = γ̂ × δ̂, with γ̂ = 0.3836. Which
regression gives δ̂?

**Options:**

- A. income on coupons  ← CORRECT
- B. coupons on income
- C. sales on income

**Notes:** Answer: A. Regress the omitted variable (income) on the treatment (coupons):
its slope is δ̂ = −0.9730, and 0.3836 × (−0.9730) = −0.3732 — the whole gap between the
naive −0.1059 and the full 0.2673, to the last digit. B is the reverse regression: slope
−0.3935, a bias term of −0.151, and an implied naive slope of +0.116 that reconciles
nothing. C, sales on income, is the partialling-out regression for the outcome, not an
OVB regression. If anyone assumes the two directions are interchangeable, name the trap:
both slopes share the same covariance, but one divides it by the variance of coupons and
the other by the variance of income, so they differ. The next slide writes the identity out in full.

---

## 15 — Content

**Title:** The OVB identity accounts for the whole gap, to the last digit

**Image page:** 13 of 34

**Notes:** Read the identity aloud: naive slope = full-regression slope + (income's
effect on sales) × (how income moves with coupons). γ̂ > 0 and δ̂ < 0, so the bias is
negative — and large enough to flip the sign. The identity is exact in the sample and
links the naive slope to the full-regression estimate 0.2673, not to the true 0.2.
Direction matters: δ̂ comes from regressing income ON coupons. Flip it (coupons on
income, slope −0.3935) and the bias term is −0.151, which would imply a naive slope of
+0.116 — not the −0.106 we observe, so it reconciles nothing. Population version: δ =
−1.0, so the naive slope converges to 0.2 + 0.3 × (−1.0) = −0.10. More data will not
rescue it.

---

## 16 — Content

**Title:** FWL: any multivariate coefficient is a univariate slope on residuals

**Image page:** 14 of 34

**Notes:** Frisch & Waugh (1933), Lovell (1963); Lovell (2008) gives a short teaching
proof. This is an algebraic identity, not an approximation. The tilde is
partialling-out: keep only the variation orthogonal to income — uncorrelated with income
in the sample, not necessarily independent of it. The intercept counts as one more
control. Full OLS and residualize-both return the same coefficient on coupons; we test
the residualize-X-only shortcut in a moment.

---

## 17 — Content

**Title:** FWL by hand: one covariance over one variance returns 0.2673

**Image page:** 15 of 34

**Notes:** Two residual vectors, one covariance, one variance. Trap: np.cov divides by n
− 1 by default, np.var by n unless ddof=1 — mix them and the slope inflates by 50/49 to
0.2728. The matrix form multiplies the raw x1 and y by M2; the matrix does the
residualizing inside the product. That is Line 4 of the proof in the post, and it
returns 0.2673 once more.

---

## 18 — Content

**Title:** Three lines of statsmodels reproduce the multivariate coefficient

**Image page:** 16 of 34

**Notes:** The full script is in the post; these are the load-bearing lines. Residualize
coupons on income, residualize sales on income, then regress residual on residual
without an intercept — both residual series have mean zero. Next, a tempting shortcut:
what if we skip residualizing sales and keep the raw outcome?

---

## 19 — Cue slide (Before you look)

**Title:** Before you look: does the Step 1 shortcut keep both numbers?

**Image page:** 17 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: this regression uses residualized coupons but raw sales, with
no intercept. (a) Will the coefficient still be 0.2673? (b) Will the standard error
still be about 0.12? Answer on the next slide: B — the coefficient is exactly 0.2673,
but the SE jumps to 1.2715. (AhaSlides interactive I3 follows.)

---

## 20 — ★ INTERACTIVE 3 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Step 1 regresses raw sales on residualized coupons, with no intercept.
Does the shortcut keep both numbers?

**Options:**

- A. Same coefficient (0.2673) and the same SE, about 0.12
- B. Same coefficient, but a much larger SE  ← CORRECT
- C. A different coefficient

**Notes:** Answer: B. The coefficient is exactly 0.2673 — residualized coupons are
orthogonal to both the constant and income, so the part of raw sales those two explain
drops out of the slope. The SE does not survive: it jumps to 1.2715, more than ten times
the full model's 0.1203, and p rises to 0.834 — stop here and you would conclude coupons
do nothing. The culprit is the missing intercept: raw sales has a mean of 33.61, and a
line forced through the origin must explain that level too. Add the intercept back and
the SE falls to 0.1437, closing 98% of the gap; the rest is income's variation still
left in sales. C is the one to rule out firmly: full OLS, residualize-X-only and
residualize-both all return the same coefficient.

---

## 21 — Content

**Title:** Step 1 keeps the coefficient, but its SE balloons to 1.2715

**Image page:** 18 of 34

**Notes:** The coefficient survives: coupons_tilde is orthogonal to both the constant
and income, so x̃₁ᵀy = x̃₁ᵀỹ (corollary (a) of the proof). So all three estimators —
full OLS, residualize-X-only, residualize-both — return the same coefficient on coupons.
The SE does not: it is more than ten times larger, and p = 0.834. Raw sales is not
mean-zero (its mean is 33.61), so dropping the intercept matters a great deal. The next
slide takes the jump apart.

---

## 22 — Content

**Title:** Step 1's SE explodes because the intercept is missing

**Image page:** 19 of 34

**Notes:** Forced through the origin, the Step 1 line must also explain the level of
sales, and it cannot: the sales mean of 33.6 stays in the residuals. The SSR is 57,181
without an intercept and 715 with one; the difference equals n × mean(sales)² exactly.
In SE levels, (1.2715 − 0.1437) / (1.2715 − 0.1203) = 0.98. Demeaning sales instead of
adding an intercept gives 0.1422: the same SSR of 715, divided by 49 instead of 48
(factor √(48/49) = 0.9897). The last step, 0.1437 → 0.1203, is income's variation still
in sales: residualizing sales on income cuts the SSR from 715 to 491.

---

## 23 — Cue slide (Before you look)

**Title:** Before you look: will Step 2's SE equal the full model's 0.1203?

**Image page:** 20 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: Step 2 regresses residualized sales on residualized coupons.
Will its standard error equal the full model's 0.1203? Answer on the next slide: B —
0.1178. Same residuals, but the software divides by 49 degrees of freedom instead of 47.
(AhaSlides interactive I4 follows.)

---

## 24 — ★ INTERACTIVE 4 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Step 2 residualizes sales too, then regresses residual on residual with no
intercept. Will its SE equal the full model's 0.1203?

**Options:**

- A. Yes, exactly 0.1203
- B. Close, but slightly smaller  ← CORRECT
- C. Close, but slightly larger

**Notes:** Answer: B — 0.1178. Step 2 leaves exactly the full model's residuals, so the
sum of squared residuals is identical; only the divisor changes. The software sees 49
residual degrees of freedom where the full model has 47, because it does not know that
two parameters — the intercept and income — were already spent in the partialling-out
step. The SE ratio is √(47/49) = 0.9794, and 0.1203 × 0.9794 = 0.1178. So Step 2
slightly overstates precision: report the full-model 0.1203. If A wins, it is the useful
mistake — the coefficient matches exactly, so people assume the SE does too.

---

## 25 — Content

**Title:** Step 2 leaves the same residuals — only the degrees of freedom differ

**Image page:** 21 of 34

**Notes:** Line 2 of the proof says ỹ = x̃₁β̂₁ + e: the residual-on-residual regression
leaves exactly the full model's residuals, so the SSR is identical (the code check
prints "Same residuals: True"). The variance factor is shared too; only the divisor
changes, 49 instead of 47. Step 2's software SE of 0.1178 slightly overstates precision,
because the software does not know that two parameters were already estimated in the
partialling-out step. Report 0.1203. Either way, the coupon effect is significant.

---

## 26 — Content

**Title:** Partialling-out, drawn: residuals are what a straight line in income leaves
over

**Image page:** 22 of 34

**Notes:** Look at the dashed segments first. The downward fit confirms richer stores
use fewer coupons. Each dashed line is a residual — how unusual a store's coupon use is
*given* its income. Partialling-out throws away the line and keeps only those segments:
"among similar-income stores, who couponed more or less than expected?" By construction
the residuals are uncorrelated with income — not independent of it. A curved dependence
on income could still hide in them.

---

## 27 — Content

**Title:** The hidden positive relationship the table couldn't show you

**Image page:** 23 of 34

**Notes:** This is the payoff plot — the conditional relationship a multivariate
regression captures but cannot draw. Stores that couponed more than expected also sold
more than expected. The slope of this single line is exactly 0.2673, the full-regression
coefficient, now visible to a non-technical audience.

---

## 28 — Cue slide (Before you look)

**Title:** Before you look: does adding the means back change the slope?

**Image page:** 24 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: adding the sample means back shifts every point up and to the
right. Will it change the slope? Answer on the next slide: A — the slope is 0.2673
again. Adding a constant to either axis moves the cloud, not its tilt; the intercept
absorbs the shift. (AhaSlides interactive I5 follows.)

---

## 29 — ★ INTERACTIVE 5 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Shift each residual by its variable's sample mean, so every point moves up
and to the right. Does the slope change?

**Options:**

- A. No, the slope is unchanged  ← CORRECT
- B. Yes, the slope gets steeper
- C. Yes, the slope gets flatter

**Notes:** Answer: A — the slope is 0.2673 again. Adding a constant to either axis moves
the cloud, not its tilt; the intercept absorbs the shift. What the shift buys is
readable units: a residual of −5 means five points below what income predicts, while the
shifted axes read roughly 34% coupons and 33.6 thousand dollars of sales. The SE moves a
hair, 0.119 against Step 2's 0.118, because this regression estimates an intercept and
keeps 48 residual degrees of freedom instead of 49. It is a display device: for
inference, still report the full-model 0.1203.

---

## 30 — Content

**Title:** Adding the means back keeps the slope but restores readable units

**Image page:** 25 of 34

**Notes:** A residual of −5 doesn't mean −5% coupon usage; it means 5 points below what
income predicts. Adding each variable's mean back shifts the axes into interpretable
units without touching the slope (still 0.2673, p = 0.029). The SE moves slightly, 0.119
against Step 2's 0.118 — degrees of freedom again: this regression estimates an
intercept, so it has 48 residual df instead of 49. This is a display device for a slide
or a stakeholder report; for inference, report the full-model SE of 0.1203.

---

## 31 — Cue slide (Before you look)

**Title:** Before you look: does a second control move the coupon coefficient?

**Image page:** 26 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: the DGP makes day of week independent of coupons and of income.
Will adding it as a second control change the coupon coefficient — and if so, by how
much, and why? Answer on the next slide: B — from 0.2673 to 0.2706, a shift of about
0.003. (AhaSlides interactive I6 follows.)

---

## 32 — ★ INTERACTIVE 6 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Add day of week as a second control. In the DGP it is independent of both
coupons and income. Does the coupon coefficient move?

**Options:**

- A. Not at all: it stays exactly 0.2673
- B. Slightly  ← CORRECT
- C. A lot: day of week is a second confounder

**Notes:** Answer: B — from 0.2673 to 0.2706, a shift of about 0.003. Independence in
the DGP is a population statement; in a sample of 50 stores, day of week has a small
chance partial association with coupons given income (regress day of week on coupons and
income: slope −0.0101; partial correlation −0.021), and the OVB identity accounts for
the shift exactly: 0.2673 = 0.2706 + 0.3195 × (−0.0101). A is the tempting answer and
the one worth discussing: it is what the population says, and the shift would vanish in
large samples. C is ruled out by construction — day of week is not a confounder here,
and it is not even significant itself (0.3195, p = 0.198). Precision is a separate
story, told by the SE: 0.1203 → 0.1194.

---

## 33 — Content

**Title:** A second control barely moves the coefficient — and FWL still matches it

**Image page:** 27 of 34

**Notes:** The OVB identity describes the shift exactly: 0.2673 = 0.2706 + 0.3195 ×
(−0.0101), where 0.3195 is day of week's coefficient in the three-variable model and
−0.0101 is its slope on coupons after controlling for income. That is a tiny chance
association in this sample — not the raw correlation of −0.076, and not a precision
gain. Precision shows up in the SE, which moves separately (0.1203 → 0.1194). Because
day of week is independent of coupons and income in the DGP, the shift would vanish in
large samples. Day of week itself is not significant (0.3195, p = 0.198). The FWL recipe
is unchanged — residualize on the full control set, then regress. This is exactly why
fixed-effects packages (reghdfe, fixest, pyfixest) partial out hundreds of dummies
first.

---

## 34 — Act divider

**Title:** The Resolution

**Image page:** 28 of 34

**Background:** `#00d4c8`

---

## 35 — Content

**Title:** After partialling out income, the estimated effect is +0.267

**Image page:** 29 of 34

**Background:** `#141413`

**Notes:** Between the misleading naive −0.106 and the planted truth +0.200, the
conditioned estimate lands at +0.267 — close, with the gap due to just 50 observations.
Closing the backdoor removes the bias, not the sampling noise. The point: the same data,
honestly conditioned, recovers the right sign and roughly the right magnitude. The SE to
report is the full-model 0.1203.

---

## 36 — Content

**Title:** Simpson's paradox, resolved: the slope flips from −0.106 to +0.267

**Image page:** 30 of 34

**Notes:** The single most persuasive slide. Left panel is the confounded raw slope
(−0.106), right panel is the conditional relationship (slope +0.267, an estimate of the
true +0.2), and only the conditioning changed. A trend in the aggregate reverses once
you condition on the relevant variable — the textbook definition of Simpson's paradox.
This is what FWL lets you *draw*.

---

## 37 — Content

**Title:** Every FWL variant matches its full regression — only the SE moves

**Image page:** 31 of 34

**Notes:** Every FWL variant matches its full-regression twin to four decimals, and
plain NumPy returns 0.2673 too. The only thing that moves the coefficient is which
controls you partial out, not how you do the algebra. Within each family (one control,
two controls), the SEs differ for two reasons only: how much variation is left in the
residuals (Step 1 leaves the sales mean and income's share of sales in them) and the
residual degrees of freedom. Across families, and for the naive row, the variation left
in coupons after the controls also changes. +0.267 sits beside the true +0.200 — the
difference is sampling noise in 50 stores.

---

## 38 — Content

**Title:** Does FWL make this causal? No — it visualizes, it does not identify

**Image page:** 32 of 34

**Notes:** Steelman, don't strawman. The estimate is causal here only because the
simulation guarantees no unmeasured confounding; in real data that must be argued, not
assumed. Linearity is the second caveat, and it is subtler than "nonlinear confounding
breaks FWL". Linear partialling-out removes only the linear part of income. That is
harmless when only the treatment (coupon) equation curves in income: the outcome
equation is still correctly specified, and the coefficient stays unbiased (Exercise 7:
0.200). It fails when the outcome (sales) equation has a nonlinear income term that the
linear control misses and that moves with coupons beyond linear income (0.127). Adding
income² restores 0.200; flexible learners — DML — do this automatically. And if a second
confounder is omitted, no amount of residualizing on income saves you.

---

## 39 — Content

**Title:** FWL is Double Machine Learning with a linear mop

**Image page:** 33 of 34

**Notes:** Chernozhukov et al. (2018). The whole DML estimator is FWL with the OLS
partial-out replaced by cross-fitted machine learning: each store's residuals come from
models fit on the other folds, then the same residual-on-residual regression runs. It
still needs no unmeasured confounding and learners that are good enough. It matters when
the outcome depends on the controls in ways a linear control misses and those terms move
with the treatment; a curve in the treatment equation alone is harmless for linear FWL.
Master FWL and DML stops being mysterious — it is this same plot, learned with a smarter
mop. The companion post python_doubleml runs it on a real experiment.

---

## 40 — ★ INTERACTIVE 7 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** What does Double Machine Learning replace in the FWL recipe?

**Options:**

- A. The two OLS partialling-out regressions (with flexible ML learners, plus cross-fitting)  ← CORRECT
- B. The final residual-on-residual regression
- C. The confounder itself

**Notes:** A recap quiz on the bridge slide; it has no cue slide of its own, so ask it
straight after the two-column comparison. Answer: A. DML keeps the
residualize-then-regress logic and swaps only the mop: the outcome and the treatment are
each residualized with flexible learners (a forest, a lasso) instead of OLS, and
cross-fitting means each store's residuals come from models fit on the other folds. B is
the step DML leaves untouched — the final regression of residual y on residual d runs
exactly as in FWL. C is the trap worth naming: nothing replaces the confounder. DML
still needs every confounder measured, and it offers no protection against an unmeasured
one. Close the loop: the residual-on-residual scatter this deck drew at slope 0.2673 is
the same picture DML draws, learned with a smarter mop.

---

## 41 — Act divider

**Title:** Don't read the coefficient — read the partialled-out scatter.

**Image page:** 34 of 34

**Background:** `#141413`

**Notes:** The one sentence to remember. A multivariate coefficient is a univariate
slope on residuals; FWL lets you see it, and seeing it is what turns a confounded −0.106
into an honest +0.267.

---
