# AhaSlides deck: presenter copy

> **Generated** by `build_deck_json.py` from `../slides/slides.qmd` (content slides, speaker notes) and `activities.py` (interactive slides). Do not edit by hand: edit those two files and regenerate.

**Presentation:** The FWL Theorem: Making Multivariate Regressions Intuitive  
**Editor:** https://presenter.ahaslides.com/presentation/10198190 (ID 10198190, join code **VSXHY**)  
**Public view link:** https://presenter.ahaslides.com/share/1790567562708-72xqh62ban  
**Plan:** AhaSlides Education Large (paid, from 2026-10-06)  
**Backup of the free-plan version:** presentation 10274590

## Composition

| Kind | Count |
|---|---|
| Content slides (images of the Quarto deck) | 34 |
| Interactive slides, core | 25 |
| Interactive slides, optional (skip live if behind) | 10 |
| **Total** | **69** |

Activity time: about **28 min** for the core slides, plus **15.5 min** if every optional slide runs. Quizzes use 30-second timers with faster answers earning more points (the Colab stop has five minutes).

## Run of show

| Pos | ID | After page | Type | Tier | Min | Answer |
|---|---|---|---|---|---|---|
| 2 | N1 | 1 | QR code (join) | core | 1 | none (unscored) |
| 3 | N2 | 1 | Word cloud | core | 1.5 | none (unscored) |
| 4 | N3 | 1 | Rating scale | core | 1 | none (unscored) |
| 5 | N4 | 1 | Live Q&A | core | 0.5 | none (unscored) |
| 9 | I1 | 4 | Poll | core | 1 | none (prediction) |
| 13 | N5 | 7 | Draw answer | *optional* | 2 | none (unscored) |
| 16 | N6 | 9 | Quiz: categorise | core | 1 | Treatment: Coupon redemption rate; Outcome: Monthly sales; Confounder: Neighborhood income; Affects the outcome only: Day of week |
| 18 | N7 | 10 | Quiz: true or false | *optional* | 1 | False |
| 20 | N8 | 11 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 22 | I2 | 12 | Quiz: pick answer | core | 1 | A. income on coupons |
| 24 | N9 | 13 | Quiz: fill in the blanks | core | 1 | income, income, coupons |
| 26 | N10 | 14 | Quiz: match pairs | core | 1 | γ̂ (gamma-hat) = Income coefficient in the full model, 0.3836; δ̂ (delta-hat) = Slope of income on coupons, −0.9730; x̃₁ (x1-tilde) = Coupons after partialling out income; M₂ = Matrix that residualizes on the controls |
| 28 | N11 | 15 | Quiz: correct order | core | 1 | Regress coupons and sales on income, with an intercept → Keep the two residual series, x̃ and ỹ → Compute Cov(x̃, ỹ) / Var(x̃) with the same divisor → Check that it equals the full-OLS coefficient, 0.2673 |
| 30 | N12 | 16 | Quiz: short answer | core | 5 | 0.2673 |
| 32 | I3 | 17 | Quiz: pick answer | core | 1 | B. Same coefficient, but a much larger SE |
| 34 | N14 | 18 | Quiz: true or false | *optional* | 1 | False |
| 36 | N13 | 19 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 38 | I4 | 20 | Quiz: pick answer | core | 1 | B. Close, but slightly smaller |
| 43 | I5 | 24 | Quiz: pick answer | core | 1 | A. No, the slope is unchanged |
| 46 | I6 | 26 | Quiz: pick answer | core | 1 | B. Slightly |
| 48 | N15 | 27 | Leaderboard | core | 0.5 | none (unscored) |
| 50 | N16 | 28 | Quiz: correct order | *optional* | 1 | Naive slope, no controls → True effect planted in the simulation → FWL slope after partialling out income → FWL slope after partialling out income and day of week |
| 53 | N17 | 30 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 56 | N18 | 32 | 2x2 matrix | *optional* | 2 | none (unscored) |
| 57 | N19 | 32 | Idea board | *optional* | 3 | none (unscored) |
| 59 | I7 | 33 | Quiz: pick answer | core | 1 | A. The two OLS partialling-out regressions (with flexible ML learners, plus cross-fitting) |
| 60 | R1 | 33 | Quiz: pick answer | core | 0.75 | B. a confounder |
| 61 | R2 | 33 | Quiz: pick answer | core | 0.75 | C. coupons |
| 62 | R3 | 33 | Quiz: pick answer | core | 0.75 | A. Degrees of freedom: 49 vs 47 |
| 63 | R4 | 33 | Quiz: pick answer | core | 0.75 | C. No, the confounder must be measured |
| 64 | N21 | 33 | Leaderboard | core | 0.5 | none (unscored) |
| 66 | N22 | 34 | Word cloud | *optional* | 1 | none (unscored) |
| 67 | N23 | 34 | Rating scale | core | 1 | none (unscored) |
| 68 | N24 | 34 | Open ended | core | 2 | none (unscored) |
| 69 | N25 | 34 | Duck race | core | 1 | none (unscored) |

# Slides

## 1 — Title

**Title:** The FWL Theorem: Making Multivariate Regressions Intuitive

**Subtitle:** Partialling-out a confounder to estimate a known +0.2 causal effect

**Image page:** 1 of 34

---

## 2 — ★ N1 — QR code (join) (CORE, ~1 min)

**Answer:** none (unscored)

**Notes:** Students join at ahaslides.com with code VSXHY or by scanning the QR code. Names are required on join, so the leaderboard and the spinner wheels show real names. Keep this slide up while the room settles and watch the participant count rise.

---

## 3 — ★ N2 — Word cloud (CORE, ~1.5 min)

**Prompt:** In one word: what does controlling for income do to a regression?

**Answer:** none (unscored)

**Settings:** `{"entriesPerParticipant": 2}`

**Notes:** Warm-up, no right answer. Expect words such as hold constant, remove, adjust, isolate or fix. Do not correct anyone yet. The same prompt returns at the very end of class, so keep this cloud in mind (or screenshot it) for the comparison.

---

## 4 — ★ N3 — Rating scale (CORE, ~1 min)

**Prompt:** Before we start: how confident are you?

Scale 1 (Not at all) to 5 (Completely):
- I can explain what controlling for a variable does to a coefficient
- I can predict the sign of omitted-variable bias
- I can draw a picture of a multivariate regression coefficient

**Answer:** none (unscored)

**Notes:** Baseline confidence on a 1 to 5 scale. The same three statements return after the exit ticket, so the class can see its own change. Read the averages aloud without comment.

---

## 5 — ★ N4 — Live Q&A (CORE, ~0.5 min)

**Prompt:** Questions? Ask them here at any time during class

**Answer:** none (unscored)

**Notes:** Q&A stays open on every slide (presentation setting: Q&A on all slides). Questions are anonymous unless students choose to sign them. Point out that upvoting a question pushes it to the top. Check the Q&A at each leaderboard break and at the end.

---

## 6 — Act divider

**Title:** The Tension

**Image page:** 2 of 34

**Background:** `#d97757`

---

## 7 — Content

**Title:** We planted a +0.2 coupon effect in 50 restaurants — will a regression find it?

**Image page:** 3 of 34

**Notes:** The hook: one dataset, one question, and — unusually — a known answer. Because we built the data, we can grade every estimator against the truth. Do not reveal the naive result yet; the next slide asks the room to predict it.

---

## 8 — Cue slide (Before you look)

**Title:** Before you look: what sign will the naive slope take?

**Image page:** 4 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: regress sales on coupons with no controls — what sign does the slope take? Give 20 seconds, then take the vote. Follow-up for the discussion: if it is not +0.2, which variable is to blame? Answer on the next slide: C, negative (−0.1059), because income confounds the comparison. (AhaSlides interactive I1 follows.)

---

## 9 — ★ I1 — Poll (CORE, ~1 min)

**Prompt:** Regress sales on coupons alone. What sign will the slope take?

- A. Positive, close to the true +0.2
- B. Roughly zero
- C. Negative

**Answer:** none (prediction)

**Settings:** `{"hasTimeLimit": true, "timeToAnswer": 30, "multipleChoice": false, "typeChart": "barChart", "showPercentage": true}`

**Notes:** A pure prediction poll: there is no right answer to score, and nobody should be told they were wrong. The previous slide asked the question; this is where the room commits. Give 30 seconds, then close the vote and do not comment on the split. The true effect is +0.2, so most people expect the naive slope to land near it (A) or to wash out (B). The next slide answers it: C, negative, with a slope of −0.1059, because income confounds the comparison. If B draws votes, grant the fair part: the naive slope is not significant (p = 0.365). Its sign is still the opposite of the planted +0.2, and that is the point. The results return at the Simpson paradox slide in Act III, where the spinner cold call starts by showing the room this bar chart again.

---

## 10 — Content

**Title:** Naive regression: coupons look like they reduce sales

**Image page:** 5 of 34

**Notes:** The answer to the vote: negative. The slope is −0.1059 even though we planted +0.2. Don't explain the mechanism yet — just plant that the raw picture is negative and misleading. Income is the culprit; we earn the reversal in Act II and return to this picture in the side-by-side at the end.

---

## 11 — Content

**Title:** Where we're going

**Image page:** 6 of 34

**Notes:** Built from the post's learning objectives. Teaching deck, so we signpost. Keep it to one breath per line. Six "Before you look" slides along the way ask the room to predict before each reveal.

---

## 12 — Act divider

**Title:** The Investigation

**Image page:** 7 of 34

**Background:** `#6a9bcc`

---

## 13 — ★ N5 — Draw answer (OPTIONAL, skip if behind, ~2 min)

**Prompt:** Draw the arrows: what causes what among coupons, income and sales?

**Answer:** none (unscored)

**Notes:** Give 60 seconds. The target picture has three arrows: income to coupons, income to sales, and coupons to sales. Pick two or three drawings to discuss. Common slips are an arrow from sales to income, or a missing arrow from income to coupons. The next slide names income as the confounder that opens the backdoor path.

---

## 14 — Content

**Title:** Income is a confounder that opens a backdoor from coupons to sales

**Image page:** 8 of 34

**Notes:** This is the DAG from the post in words. Income drives both the treatment and the outcome — the textbook confounder. Blocking the backdoor means conditioning on income. FWL is the elegant way to do exactly that and to picture it.

---

## 15 — Content

**Title:** A simulated lab with a known answer: the true effect is exactly +0.2

**Image page:** 9 of 34

**Notes:** Why simulate? Because the true causal effect is known by construction — exactly +0.2 — so we can grade every method against ground truth. 50 restaurants, one per neighborhood, income centered at \$50K. `coupons` is the redemption rate: the percentage of the restaurant's 100 coupons redeemed during the month; `sales` is monthly sales in thousands of dollars. Day of week is drawn uniformly from 1 to 7, independently of income and coupons. Coupons fall with income; sales rise with coupons, income, and day of week. The draw order (income, day of week, coupons, sales) matters for reproducing the seed-42 sample. The full function rounds each column to two decimals before returning the DataFrame.

---

## 16 — ★ N6 — Quiz: categorise (CORE, ~1 min)

**Prompt:** Sort each variable by its role in the coupon study

- **Treatment:** Coupon redemption rate
- **Outcome:** Monthly sales
- **Confounder:** Neighborhood income
- **Affects the outcome only:** Day of week

**Answer:** Treatment: Coupon redemption rate; Outcome: Monthly sales; Confounder: Neighborhood income; Affects the outcome only: Day of week

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: coupons are the treatment, sales the outcome, income the confounder, and day of week affects sales only. Day of week is the instructive one. It raises sales but is drawn independently of income and coupons, so leaving it out does not bias the coupon effect in the population. It returns in Act II as the second control.

---

## 17 — Content

**Title:** The naive slope is −0.106 — and points the wrong way (p = 0.365)

**Image page:** 10 of 34

**Notes:** Each extra percentage point of coupons is "associated with" \$106 less in monthly sales — but it is not significant and it contradicts the planted +0.2. Wealthy neighborhoods redeem fewer coupons yet spend more, so the raw slope inherits income's negative coupon link. This is the result the controls will fix.

---

## 18 — ★ N7 — Quiz: true or false (OPTIONAL, skip if behind, ~1 min)

**Prompt:** The naive slope is not significant (p = 0.365), so coupons have no effect on sales.

**Answer:** False

**Notes:** Answer: False. A large p-value is an absence of evidence, not evidence of no effect. Here the problem is worse than noise: the naive slope is confounded by income, and the true effect is +0.2 by construction. The next slide adds income as a control and the slope flips to +0.267.

---

## 19 — Content

**Title:** Add income as a control and the slope flips to +0.267 (p = 0.031)

**Image page:** 11 of 34

**Notes:** One control reverses the conclusion. The CI [0.025, 0.509] now excludes zero. Income itself is strongly positive (+0.3836, p < 0.001), confirming richer neighborhoods spend more — call it γ̂; we need it on the next slides. But how big is the bias, exactly, and what is the regression *doing* when it "controls for" income?

---

## 20 — ★ N8 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: why did adding income flip the sign?

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Spin the wheel; it fills itself with the names of joined students. A good answer: richer neighborhoods redeem fewer coupons but spend more, so without income the coupon slope absorbs the negative link between coupons and income. Holding income fixed removes that backdoor, and the slope turns positive. The next slide asks which regression measures the bias.

---

## 21 — Cue slide (Before you look)

**Title:** Before you look: which regression gives δ̂?

**Image page:** 12 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: the gap between the naive and the full slope is −0.3732, and it equals γ̂ × δ̂ with γ̂ = 0.3836. Which auxiliary regression supplies δ̂: income on coupons, or coupons on income? Answer on the next slide: A — regress the omitted variable (income) on the treatment (coupons). Its slope, −0.9730, gives 0.3836 × (−0.9730) = −0.3732, the whole gap. The reverse regression (slope −0.3935) gives −0.151 and reconciles nothing. C is the partialling-out regression for sales, a different auxiliary regression altogether. If anyone assumes the two directions are interchangeable, point out that both slopes share the same covariance but divide it by different variances (coupons' versus income's), so they differ. (AhaSlides interactive I2 follows.)

---

## 22 — ★ I2 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** The naive-minus-full gap is −0.3732 = γ̂ × δ̂, with γ̂ = 0.3836. Which regression gives δ̂?

- A. income on coupons  ← CORRECT
- B. coupons on income
- C. sales on income

**Answer:** A. income on coupons

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A. Regress the omitted variable (income) on the treatment (coupons): its slope is δ̂ = −0.9730, and 0.3836 × (−0.9730) = −0.3732 — the whole gap between the naive −0.1059 and the full 0.2673, to the last digit. B is the reverse regression: slope −0.3935, a bias term of −0.151, and an implied naive slope of +0.116 that reconciles nothing. C, sales on income, is the partialling-out regression for the outcome, not an OVB regression. If anyone assumes the two directions are interchangeable, name the trap: both slopes share the same covariance, but one divides it by the variance of coupons and the other by the variance of income, so they differ. The next slide writes the identity out in full.

---

## 23 — Content

**Title:** The OVB identity accounts for the whole gap, to the last digit

**Image page:** 13 of 34

**Notes:** Read the identity aloud: naive slope = full-regression slope + (income's effect on sales) × (how income moves with coupons). γ̂ > 0 and δ̂ < 0, so the bias is negative — and large enough to flip the sign. The identity is exact in the sample and links the naive slope to the full-regression estimate 0.2673, not to the true 0.2. Direction matters: δ̂ comes from regressing income ON coupons. Flip it (coupons on income, slope −0.3935) and the bias term is −0.151, which would imply a naive slope of +0.116 — not the −0.106 we observe, so it reconciles nothing. Population version: δ = −1.0, so the naive slope converges to 0.2 + 0.3 × (−1.0) = −0.10. More data will not rescue it.

---

## 24 — ★ N9 — Quiz: fill in the blanks (CORE, ~1 min)

**Prompt:** Complete the omitted-variable bias identity

> Naive slope = full slope + γ̂ × δ̂. Here γ̂ is the effect of [blank] on sales, and δ̂ is the slope from regressing [blank] on [blank].
- blank 1: options income, coupons, day of week → **income**
- blank 2: options coupons, income, sales → **income**
- blank 3: options sales, income, coupons → **coupons**

**Answer:** income, income, coupons

**Notes:** Answer: income, income, coupons. γ̂ is the coefficient of the omitted variable (income) in the full model, 0.3836. δ̂ comes from regressing the omitted variable on the treatment, slope −0.9730. Their product, −0.3732, is the whole gap between the naive −0.1059 and the full 0.2673. The direction of the auxiliary regression matters, as the previous quiz showed.

---

## 25 — Content

**Title:** FWL: any multivariate coefficient is a univariate slope on residuals

**Image page:** 14 of 34

**Notes:** Frisch & Waugh (1933), Lovell (1963); Lovell (2008) gives a short teaching proof. This is an algebraic identity, not an approximation. The tilde is partialling-out: keep only the variation orthogonal to income — uncorrelated with income in the sample, not necessarily independent of it. The intercept counts as one more control. Full OLS and residualize-both return the same coefficient on coupons; we test the residualize-X-only shortcut in a moment.

---

## 26 — ★ N10 — Quiz: match pairs (CORE, ~1 min)

**Prompt:** Match each symbol to its meaning

- γ̂ (gamma-hat) ↔ Income coefficient in the full model, 0.3836
- δ̂ (delta-hat) ↔ Slope of income on coupons, −0.9730
- x̃₁ (x1-tilde) ↔ Coupons after partialling out income
- M₂ ↔ Matrix that residualizes on the controls

**Answer:** γ̂ (gamma-hat) = Income coefficient in the full model, 0.3836; δ̂ (delta-hat) = Slope of income on coupons, −0.9730; x̃₁ (x1-tilde) = Coupons after partialling out income; M₂ = Matrix that residualizes on the controls

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: γ̂ is the income coefficient (0.3836), δ̂ the slope of income on coupons (−0.9730), x̃₁ the coupon residual after partialling out income, and M₂ the residual-maker matrix that does the partialling out inside the matrix formula. If x̃₁ and M₂ get mixed up, stress that M₂ is the operator and x̃₁ = M₂x₁ is its output. The next slide computes the FWL slope by hand.

---

## 27 — Content

**Title:** FWL by hand: one covariance over one variance returns 0.2673

**Image page:** 15 of 34

**Notes:** Two residual vectors, one covariance, one variance. Trap: np.cov divides by n − 1 by default, np.var by n unless ddof=1 — mix them and the slope inflates by 50/49 to 0.2728. The matrix form multiplies the raw x1 and y by M2; the matrix does the residualizing inside the product. That is Line 4 of the proof in the post, and it returns 0.2673 once more.

---

## 28 — ★ N11 — Quiz: correct order (CORE, ~1 min)

**Prompt:** Put the FWL-by-hand recipe in order

1. Regress coupons and sales on income, with an intercept
2. Keep the two residual series, x̃ and ỹ
3. Compute Cov(x̃, ỹ) / Var(x̃) with the same divisor
4. Check that it equals the full-OLS coefficient, 0.2673

**Answer:** Regress coupons and sales on income, with an intercept → Keep the two residual series, x̃ and ỹ → Compute Cov(x̃, ỹ) / Var(x̃) with the same divisor → Check that it equals the full-OLS coefficient, 0.2673

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: regress on income, keep the residuals, divide the covariance by the variance, then compare with full OLS. The third step hides the trap from the slide: np.cov divides by n − 1 and np.var by n unless ddof=1, and mixing them inflates the slope by 50/49 to 0.2728. The Colab stop that follows lets everyone see both numbers.

---

## 29 — Content

**Title:** Three lines of statsmodels reproduce the multivariate coefficient

**Image page:** 16 of 34

**Notes:** The full script is in the post; these are the load-bearing lines. Residualize coupons on income, residualize sales on income, then regress residual on residual without an intercept — both residual series have mean zero. Next, a tempting shortcut: what if we skip residualizing sales and keep the raw outcome?

---

## 30 — ★ N12 — Quiz: short answer (CORE, ~5 min)

**Prompt:** Colab stop: run the notebook from the top through Section 9. What does beta_1 = Cov / Var print?

**Answer:** 0.2673

**Settings:** `{"timeToAnswer": 300, "fastAnswerGetMorePoint": true}`

**Notes:** The single live-coding stop, about five minutes. Students open the Google Colab button on the post (https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/tutorials/python_fwl/notebook.ipynb) and run the cells from the top through Section 9, FWL by hand in NumPy. The cell prints beta_1 = Cov / Var = 0.2673, the full-regression coefficient, and on the next line the wrong value 0.2728 that comes from mixing divisors. Type the answer with four decimals. Students who finish early can explain to a neighbor why the two printed numbers differ.

---

## 31 — Cue slide (Before you look)

**Title:** Before you look: does the Step 1 shortcut keep both numbers?

**Image page:** 17 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: this regression uses residualized coupons but raw sales, with no intercept. (a) Will the coefficient still be 0.2673? (b) Will the standard error still be about 0.12? Answer on the next slide: B — the coefficient is exactly 0.2673, but the SE jumps to 1.2715. (AhaSlides interactive I3 follows.)

---

## 32 — ★ I3 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Step 1 regresses raw sales on residualized coupons, with no intercept. Does the shortcut keep both numbers?

- A. Same coefficient (0.2673) and the same SE, about 0.12
- B. Same coefficient, but a much larger SE  ← CORRECT
- C. A different coefficient

**Answer:** B. Same coefficient, but a much larger SE

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B. The coefficient is exactly 0.2673 — residualized coupons are orthogonal to both the constant and income, so the part of raw sales those two explain drops out of the slope. The SE does not survive: it jumps to 1.2715, more than ten times the full model's 0.1203, and p rises to 0.834 — stop here and you would conclude coupons do nothing. The culprit is the missing intercept: raw sales has a mean of 33.61, and a line forced through the origin must explain that level too. Add the intercept back and the SE falls to 0.1437, closing 98% of the gap; the rest is income's variation still left in sales. C is the one to rule out firmly: full OLS, residualize-X-only and residualize-both all return the same coefficient.

---

## 33 — Content

**Title:** Step 1 keeps the coefficient, but its SE balloons to 1.2715

**Image page:** 18 of 34

**Notes:** The coefficient survives: coupons_tilde is orthogonal to both the constant and income, so x̃₁ᵀy = x̃₁ᵀỹ (corollary (a) of the proof). So all three estimators — full OLS, residualize-X-only, residualize-both — return the same coefficient on coupons. The SE does not: it is more than ten times larger, and p = 0.834. Raw sales is not mean-zero (its mean is 33.61), so dropping the intercept matters a great deal. The next slide takes the jump apart.

---

## 34 — ★ N14 — Quiz: true or false (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Adding an intercept to Step 1 brings its SE all the way back to the full model, 0.1203.

**Answer:** False

**Notes:** Answer: False. The intercept closes 98% of the gap, from 1.2715 down to 0.1437, but not all of it. The rest is the variation in sales that income explains and that Step 1 leaves in the residuals. Residualizing sales on income cuts the sum of squared residuals from 715 to 491 and brings the SE to the full-model value. The next slide takes the jump apart.

---

## 35 — Content

**Title:** Step 1's SE explodes because the intercept is missing

**Image page:** 19 of 34

**Notes:** Forced through the origin, the Step 1 line must also explain the level of sales, and it cannot: the sales mean of 33.6 stays in the residuals. The SSR is 57,181 without an intercept and 715 with one; the difference equals n × mean(sales)² exactly. In SE levels, (1.2715 − 0.1437) / (1.2715 − 0.1203) = 0.98. Demeaning sales instead of adding an intercept gives 0.1422: the same SSR of 715, divided by 49 instead of 48 (factor √(48/49) = 0.9897). The last step, 0.1437 → 0.1203, is income's variation still in sales: residualizing sales on income cuts the SSR from 715 to 491.

---

## 36 — ★ N13 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: why does dropping the intercept blow up the SE?

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Spin and ask the student to explain the slide in their own words. A good answer: a line forced through the origin must also explain the level of sales, whose mean is 33.6, so that level stays in the residuals and inflates the residual variance. The coefficient survives because residualized coupons are orthogonal to the constant; the SE does not.

---

## 37 — Cue slide (Before you look)

**Title:** Before you look: will Step 2's SE equal the full model's 0.1203?

**Image page:** 20 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: Step 2 regresses residualized sales on residualized coupons. Will its standard error equal the full model's 0.1203? Answer on the next slide: B — 0.1178. Same residuals, but the software divides by 49 degrees of freedom instead of 47. (AhaSlides interactive I4 follows.)

---

## 38 — ★ I4 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Step 2 residualizes sales too, then regresses residual on residual with no intercept. Will its SE equal the full model's 0.1203?

- A. Yes, exactly 0.1203
- B. Close, but slightly smaller  ← CORRECT
- C. Close, but slightly larger

**Answer:** B. Close, but slightly smaller

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B — 0.1178. Step 2 leaves exactly the full model's residuals, so the sum of squared residuals is identical; only the divisor changes. The software sees 49 residual degrees of freedom where the full model has 47, because it does not know that two parameters — the intercept and income — were already spent in the partialling-out step. The SE ratio is √(47/49) = 0.9794, and 0.1203 × 0.9794 = 0.1178. So Step 2 slightly overstates precision: report the full-model 0.1203. If A wins, it is the useful mistake — the coefficient matches exactly, so people assume the SE does too.

---

## 39 — Content

**Title:** Step 2 leaves the same residuals — only the degrees of freedom differ

**Image page:** 21 of 34

**Notes:** Line 2 of the proof says ỹ = x̃₁β̂₁ + e: the residual-on-residual regression leaves exactly the full model's residuals, so the SSR is identical (the code check prints "Same residuals: True"). The variance factor is shared too; only the divisor changes, 49 instead of 47. Step 2's software SE of 0.1178 slightly overstates precision, because the software does not know that two parameters were already estimated in the partialling-out step. Report 0.1203. Either way, the coupon effect is significant.

---

## 40 — Content

**Title:** Partialling-out, drawn: residuals are what a straight line in income leaves over

**Image page:** 22 of 34

**Notes:** Look at the dashed segments first. The downward fit confirms richer neighborhoods redeem fewer coupons. Each dashed line is a residual — how unusual a restaurant's redemption rate is *given* its income. Partialling-out throws away the line and keeps only those segments: "among restaurants in similar-income neighborhoods, which redeemed more or fewer coupons than expected?" By construction the residuals are uncorrelated with income — not independent of it. A curved dependence on income could still hide in them.

---

## 41 — Content

**Title:** The hidden positive relationship the table couldn't show you

**Image page:** 23 of 34

**Notes:** This is the payoff plot — the conditional relationship a multivariate regression captures but cannot draw. Restaurants that redeemed more coupons than expected also sold more than expected. The slope of this single line is exactly 0.2673, the full-regression coefficient, now visible to a non-technical audience.

---

## 42 — Cue slide (Before you look)

**Title:** Before you look: does adding the means back change the slope?

**Image page:** 24 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: adding the sample means back shifts every point up and to the right. Will it change the slope? Answer on the next slide: A — the slope is 0.2673 again. Adding a constant to either axis moves the cloud, not its tilt; the intercept absorbs the shift. (AhaSlides interactive I5 follows.)

---

## 43 — ★ I5 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Shift each residual by its variable's sample mean, so every point moves up and to the right. Does the slope change?

- A. No, the slope is unchanged  ← CORRECT
- B. Yes, the slope gets steeper
- C. Yes, the slope gets flatter

**Answer:** A. No, the slope is unchanged

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A — the slope is 0.2673 again. Adding a constant to either axis moves the cloud, not its tilt; the intercept absorbs the shift. What the shift buys is readable units: a residual of −5 means five points below what income predicts, while the shifted axes read roughly 34% coupons and 33.6 thousand dollars of sales. The SE moves a hair, 0.119 against Step 2's 0.118, because this regression estimates an intercept and keeps 48 residual degrees of freedom instead of 49. It is a display device: for inference, still report the full-model 0.1203.

---

## 44 — Content

**Title:** Adding the means back keeps the slope but restores readable units

**Image page:** 25 of 34

**Notes:** A residual of −5 doesn't mean a −5% redemption rate; it means 5 points below what income predicts. Adding each variable's mean back shifts the axes into interpretable units without touching the slope (still 0.2673, p = 0.029). The SE moves slightly, 0.119 against Step 2's 0.118 — degrees of freedom again: this regression estimates an intercept, so it has 48 residual df instead of 49. This is a display device for a slide or a stakeholder report; for inference, report the full-model SE of 0.1203.

---

## 45 — Cue slide (Before you look)

**Title:** Before you look: does a second control move the coupon coefficient?

**Image page:** 26 of 34

**Background:** `#1a3a8a`

**Notes:** Ask the room: the DGP makes day of week independent of coupons and of income. Will adding it as a second control change the coupon coefficient — and if so, by how much, and why? Answer on the next slide: B — from 0.2673 to 0.2706, a shift of about 0.003. (AhaSlides interactive I6 follows.)

---

## 46 — ★ I6 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Add day of week as a second control. In the DGP it is independent of both coupons and income. Does the coupon coefficient move?

- A. Not at all: it stays exactly 0.2673
- B. Slightly  ← CORRECT
- C. A lot: day of week is a second confounder

**Answer:** B. Slightly

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B — from 0.2673 to 0.2706, a shift of about 0.003. Independence in the DGP is a population statement; in a sample of 50 restaurants, day of week has a small chance partial association with coupons given income (regress day of week on coupons and income: slope −0.0101; partial correlation −0.021), and the OVB identity accounts for the shift exactly: 0.2673 = 0.2706 + 0.3195 × (−0.0101). A is the tempting answer and the one worth discussing: it is what the population says, and the shift would vanish in large samples. C is ruled out by construction — day of week is not a confounder here, and it is not even significant itself (0.3195, p = 0.198). Precision is a separate story, told by the SE: 0.1203 → 0.1194.

---

## 47 — Content

**Title:** A second control barely moves the coefficient — and FWL still matches it

**Image page:** 27 of 34

**Notes:** The OVB identity describes the shift exactly: 0.2673 = 0.2706 + 0.3195 × (−0.0101), where 0.3195 is day of week's coefficient in the three-variable model and −0.0101 is its slope on coupons after controlling for income. That is a tiny chance association in this sample — not the raw correlation of −0.076, and not a precision gain. Precision shows up in the SE, which moves separately (0.1203 → 0.1194). Because day of week is independent of coupons and income in the DGP, the shift would vanish in large samples. Day of week itself is not significant (0.3195, p = 0.198). The FWL recipe is unchanged — residualize on the full control set, then regress. This is exactly why fixed-effects packages (reghdfe, fixest, pyfixest) partial out hundreds of dummies first.

---

## 48 — ★ N15 — Leaderboard (CORE, ~0.5 min)

**Answer:** none (unscored)

**Notes:** End of Act II checkpoint. Read the top five aloud, then check the Q&A for questions that collected upvotes before moving on to the resolution.

---

## 49 — Act divider

**Title:** The Resolution

**Image page:** 28 of 34

**Background:** `#00d4c8`

---

## 50 — ★ N16 — Quiz: correct order (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Order these coupon estimates from smallest to largest

1. Naive slope, no controls
2. True effect planted in the simulation
3. FWL slope after partialling out income
4. FWL slope after partialling out income and day of week

**Answer:** Naive slope, no controls → True effect planted in the simulation → FWL slope after partialling out income → FWL slope after partialling out income and day of week

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: naive −0.1059, true 0.2000, FWL with income 0.2673, FWL with income and day of week 0.2706. The order shows the whole story in one line: the confounded estimate has the wrong sign, conditioning recovers the right sign, and the remaining gap to 0.2 is sampling noise in 50 restaurants. The next slides make that case with pictures.

---

## 51 — Content

**Title:** After partialling out income, the estimated effect is +0.267

**Image page:** 29 of 34

**Background:** `#141413`

**Notes:** Between the misleading naive −0.106 and the planted truth +0.200, the conditioned estimate lands at +0.267 — close, with the gap due to just 50 observations. Closing the backdoor removes the bias, not the sampling noise. The point: the same data, honestly conditioned, recovers the right sign and roughly the right magnitude. The SE to report is the full-model 0.1203.

---

## 52 — Content

**Title:** Simpson's paradox, resolved: the slope flips from −0.106 to +0.267

**Image page:** 30 of 34

**Notes:** The single most persuasive slide. Left panel is the confounded raw slope (−0.106), right panel is the conditional relationship (slope +0.267, an estimate of the true +0.2), and only the conditioning changed. A trend in the aggregate reverses once you condition on the relevant variable — the textbook definition of Simpson's paradox. This is what FWL lets you *draw*.

---

## 53 — ★ N17 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: explain Simpson's paradox in this example in one sentence

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Before spinning, go back to the results of the first poll (I1) and show the room what it predicted for the naive slope. Then spin. A good sentence: across all restaurants coupons and sales move in opposite directions, but among restaurants with similar income they move together, because income drives both.

---

## 54 — Content

**Title:** Every FWL variant matches its full regression — only the SE moves

**Image page:** 31 of 34

**Notes:** Every FWL variant matches its full-regression twin to four decimals, and plain NumPy returns 0.2673 too. The only thing that moves the coefficient is which controls you partial out, not how you do the algebra. Within each family (one control, two controls), the SEs differ for two reasons only: how much variation is left in the residuals (Step 1 leaves the sales mean and income's share of sales in them) and the residual degrees of freedom. Across families, and for the naive row, the variation left in coupons after the controls also changes. +0.267 sits beside the true +0.200 — the difference is sampling noise in 50 restaurants.

---

## 55 — Content

**Title:** Does FWL make this causal? No — it visualizes, it does not identify

**Image page:** 32 of 34

**Notes:** Steelman, don't strawman. The estimate is causal here only because the simulation guarantees no unmeasured confounding; in real data that must be argued, not assumed. Linearity is the second caveat, and it is subtler than "nonlinear confounding breaks FWL". Linear partialling-out removes only the linear part of income. That is harmless when only the treatment (coupon) equation curves in income: the outcome equation is still correctly specified, and the coefficient stays unbiased (Exercise 7: 0.200). It fails when the outcome (sales) equation has a nonlinear income term that the linear control misses and that moves with coupons beyond linear income (0.127). Adding income² restores 0.200; flexible learners — DML — do this automatically. And if a second confounder is omitted, no amount of residualizing on income saves you.

---

## 56 — ★ N18 — 2x2 matrix (OPTIONAL, skip if behind, ~2 min)

**Prompt:** Where does each threat to a causal FWL estimate land?

X axis: How likely in real data · Y axis: How much bias it causes
- An unmeasured second confounder
- Sales depend on income squared, but we control linearly
- Coupons depend on income squared, but we control linearly
- Only 50 restaurants
- Day of week left out

**Answer:** none (unscored)

**Notes:** Unscored; it sets up a discussion. The post gives the reference answers. An unmeasured confounder can bias the estimate without limit and is common in real data. A curve in the sales equation that the linear control misses biases it (0.127 instead of 0.200). A curve in the coupon equation alone is harmless (0.200). Fifty restaurants add noise, not bias. Leaving out day of week adds no bias here, because it is independent of coupons and income. Ask which dot the room placed furthest from these answers.

---

## 57 — ★ N19 — Idea board (OPTIONAL, skip if behind, ~3 min)

**Prompt:** Name a confounder from your own research: treatment, outcome, confounder

Groups: Development and growth, Policy and public economics, Health, education and labor, Other fields

**Answer:** none (unscored)

**Notes:** Ask each student for one example in the form treatment, outcome, confounder (for example: microcredit, household income, entrepreneurial ability). After two minutes, open the voting round and discuss the top two. For each, ask whether the confounder can be measured; if it cannot, FWL and DML cannot remove it.

---

## 58 — Content

**Title:** FWL is Double Machine Learning with a linear mop

**Image page:** 33 of 34

**Notes:** Chernozhukov et al. (2018). The whole DML estimator is FWL with the OLS partial-out replaced by cross-fitted machine learning: each restaurant's residuals come from models fit on the other folds, then the same residual-on-residual regression runs. It still needs no unmeasured confounding and learners that are good enough. It matters when the outcome depends on the controls in ways a linear control misses and those terms move with the treatment; a curve in the treatment equation alone is harmless for linear FWL. Master FWL and DML stops being mysterious — it is this same plot, learned with a smarter mop. The companion post python_doubleml runs it on a real experiment.

---

## 59 — ★ I7 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** What does Double Machine Learning replace in the FWL recipe?

- A. The two OLS partialling-out regressions (with flexible ML learners, plus cross-fitting)  ← CORRECT
- B. The final residual-on-residual regression
- C. The confounder itself

**Answer:** A. The two OLS partialling-out regressions (with flexible ML learners, plus cross-fitting)

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** A recap quiz on the bridge slide; it has no cue slide of its own, so ask it straight after the two-column comparison. Answer: A. DML keeps the residualize-then-regress logic and swaps only the mop: the outcome and the treatment are each residualized with flexible learners (a forest, a lasso) instead of OLS, and cross-fitting means each restaurant's residuals come from models fit on the other folds. B is the step DML leaves untouched — the final regression of residual y on residual d runs exactly as in FWL. C is the trap worth naming: nothing replaces the confounder. DML still needs every confounder measured, and it offers no protection against an unmeasured one. Close the loop: the residual-on-residual scatter this deck drew at slope 0.2673 is the same picture DML draws, learned with a smarter mop.

---

## 60 — ★ R1 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 1 of 4: income raises sales and lowers coupon use. In this study, income is

- A. a mediator
- B. a confounder  ← CORRECT
- C. an instrument

**Answer:** B. a confounder

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Final review round, question 1 of 4, with a 20-second timer. Answer: B, a confounder. Income causes both the treatment and the outcome, which opens the backdoor path that biased the naive slope. A mediator would sit between coupons and sales, and an instrument would move coupons without affecting sales directly.

---

## 61 — ★ R2 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 2 of 4: the coupon coefficient equals the slope of residualized sales on residualized

- A. income
- B. day of week
- C. coupons  ← CORRECT

**Answer:** C. coupons

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: C, coupons. This is the FWL theorem in one line: partial income out of both coupons and sales, then regress one residual on the other. The slope is 0.2673, identical to the coefficient in the full regression.

---

## 62 — ★ R3 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 3 of 4: the Step 2 SE is 0.1178 and the full-model SE is 0.1203. Why do they differ?

- A. Degrees of freedom: 49 vs 47  ← CORRECT
- B. Different residuals
- C. A different coefficient

**Answer:** A. Degrees of freedom: 49 vs 47

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A. The residuals and the coefficient are identical; only the divisor changes. The software counts 49 residual degrees of freedom in Step 2 instead of 47, because it does not know that the intercept and income were already estimated. Report the full-model 0.1203.

---

## 63 — ★ R4 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 4 of 4: can FWL or DML remove the bias from an unmeasured confounder?

- A. Yes, with enough data
- B. Only with cross-fitting
- C. No, the confounder must be measured  ← CORRECT

**Answer:** C. No, the confounder must be measured

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: C. Both methods condition only on the controls you give them. More data and flexible learners help with functional form, not with a confounder that is missing from the data. This is the main caveat of the lecture, so end the round on it before the final podium.

---

## 64 — ★ N21 — Leaderboard (CORE, ~0.5 min)

**Answer:** none (unscored)

**Notes:** Final podium for the quiz points of the whole class. Congratulate the top three; the prize raffle at the end gives everyone else a chance as well.

---

## 65 — Act divider

**Title:** Don't read the coefficient — read the partialled-out scatter.

**Image page:** 34 of 34

**Background:** `#141413`

**Notes:** The one sentence to remember. A multivariate coefficient is a univariate slope on residuals; FWL lets you see it, and seeing it is what turns a confounded −0.106 into an honest +0.267.

---

## 66 — ★ N22 — Word cloud (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Again, in one word: what does controlling for income do to a regression?

**Answer:** none (unscored)

**Settings:** `{"entriesPerParticipant": 2}`

**Notes:** The opening prompt again. Put the two clouds side by side if time allows. A good outcome is a shift from hold constant and remove toward words such as residualize, partial out, isolate, or condition.

---

## 67 — ★ N23 — Rating scale (CORE, ~1 min)

**Prompt:** After class: how confident are you now?

Scale 1 (Not at all) to 5 (Completely):
- I can explain what controlling for a variable does to a coefficient
- I can predict the sign of omitted-variable bias
- I can draw a picture of a multivariate regression coefficient

**Answer:** none (unscored)

**Notes:** The same three statements as the opening scale. Compare the averages with the baseline aloud. The statement with the smallest gain is the one to revisit at the start of the next class.

---

## 68 — ★ N24 — Open ended (CORE, ~2 min)

**Prompt:** Exit ticket: what is still unclear about FWL? One sentence.

**Answer:** none (unscored)

**Notes:** The exit ticket. Responses are named, because names are required on join, so they can be followed up individually. Skim them after class and open the next session with the two most common points of confusion.

---

## 69 — ★ N25 — Duck race (CORE, ~1 min)

**Answer:** none (unscored)

**Notes:** Prize raffle. Every joined student becomes a duck and the winner is pure luck, so students who scored low on the quizzes still have a chance. Students pick a duck design on their phones before the start.

---
