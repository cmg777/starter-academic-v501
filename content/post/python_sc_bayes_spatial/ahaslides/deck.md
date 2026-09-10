# AhaSlides deck — source of truth

**Presentation:** Who Else Was Treated?
**Subtitle:** Three synthetic controls, one policy, and the interval that was 33 times too narrow
**Author:** Carlos Mendez — Nagoya University (GSID)
**Source deck:** `../slides/slides.qmd` (Quarto reveal.js, 31 content slides + 4 act dividers + title)
**Post:** https://carlos-mendez.org/post/python_sc_bayes_spatial/
**Language:** English only
**Public view link:** https://presenter.ahaslides.com/share/1789021577046-xkh2lwuly9
**Editor:** https://presenter.ahaslides.com/presentation/10042312 (ID 10042312, join code 2PVGU)

## Composition

| Kind | Count |
|---|---|
| Title | 1 |
| Act dividers | 4 |
| Content slides (images of the Quarto slides) | 31 |
| Interactive slides (new) | 8 |
| **Total** | **44** |

**Content slides are images.** All 36 pages of the Quarto deck were rendered to PDF and
imported, so the original typography, tables, LaTeX, emphasis and act-divider colours are
preserved exactly. AhaSlides supplies only the audience layer. The procedure is in
[`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md); this deck's
specifics are in `README.md`.

## What this file is for

Because the content slides are images, this file is the **only** place three things live:

- **All 31 speaker notes**, carried over verbatim from `slides.qmd`. They cannot be
  attached to imported slides, so keep this file open on a second screen while presenting.
- **The 8 interactive slides** — question, options, correct answer, points — which are
  created natively through the MCP from `deck.json`.
- **The running order**, which `build_deck_json.py` validates.

## Free-plan constraints — tested, and not what you would guess

**Eight interactive slides put this deck over the free plan's allowance, and the slide
type makes no difference.** Tested on this deck, in this order:

1. 36 imported images, **no** interactive slides → *"As a free user, you can host up to
   50 live participants."* No crowns.
2. Added 2 `poll` + 6 `pick_answer_quiz` → *"You have reached the free slide limit"* and a
   **0 / 3** participant cap.
3. Converted all six quizzes to `poll`, on the theory that quizzes were the premium type
   → **no change**. All eight polls crowned (👑), still 0 / 3.

So the allowance is a small count of *interactive slides of any kind*, not a rule about
which types are premium. (Word Cloud, Rating Scale and Open Ended are separately premium.)
Step 3 was reverted: since the cap is identical either way, the deck uses the better
mechanic — six scored quizzes that reveal the correct answer and keep a leaderboard, plus
two genuine polls.

**Practical consequence:** run this deck as-is for a small group or a demo, or upgrade to
lift the cap. Slide 42 is a poll standing in for the open-ended closer the free plan does
not offer.

## Interactive slides at a glance

| # | Position | Type | Follows source page |
|---|---|---|---|
| I1 | 6 | poll | 5 — Nevada is California's only neighbour inside the don |
| I2 | 13 | quiz | 11 — Stage 1 — the simplex picks five donors and stops |
| I3 | 17 | quiz | 14 — Relax the simplex and the active donor pool multipli |
| I4 | 20 | quiz | 16 — Drop SUTVA and the bias has a closed form |
| I5 | 25 | quiz | 20 — The spatial parameter is clearly above zero |
| I6 | 29 | quiz | 23 — The leak runs the *opposite* way to the obvious hypo |
| I7 | 32 | quiz | 25 — The R edition's interval is 33 times too narrow — an |
| I8 | 42 | poll | 34 — Four things survive this deck |

Callback pair: **I1 (slide 6)** asks the room to predict Nevada's sign; **I6 (slide 29)**
cashes it in. Show the slide-6 bar chart again before asking I6.

# Slides

## 1 — Title

**Title:** Who Else Was Treated?

**Subtitle:** Three synthetic controls, one policy, and the interval that was 33 times
too narrow

**Image page:** 1 of 36

---

## 2 — Act divider

**Title:** Two Assumptions

**Image page:** 2 of 36

**Background:** `#d97757`

---

## 3 — Content

**Title:** The most replicated result in causal inference rests on two untested
assumptions

**Image page:** 3 of 36

**Notes:** The point of opening this way is that everybody knows the Prop 99 result and
almost nobody states these two assumptions out loud. Naming them as assumptions rather
than as machinery is the whole setup.

---

## 4 — Content

**Title:** Thirty-nine states, thirty-one years, and one line that leaves the pack

**Image page:** 4 of 36

**Notes:** California is already falling faster than the pack before the dashed line.
That is why difference-in-differences fails here and why synthetic control exists at
all.

---

## 5 — Content

**Title:** Nevada is California's only neighbour inside the donor pool

**Image page:** 5 of 36

**Notes:** The exclusion list is doing quiet work here. Oregon and Arizona border
California, but Abadie, Diamond and Hainmueller dropped both for having run their own
tobacco-control programmes, which leaves Nevada as the only contiguous donor. Eleven
states are absent from the panel for similar reasons. That is a gift and a limitation at
once: the parameter is easy to interpret, and a single channel is thin evidence for a
scalar.

---

## 6 — ★ INTERACTIVE 1 — Poll (no correct answer)

**Type:** multiple-choice poll · single selection · results as bar chart

**Question:** Nevada is the only donor state that borders California. What did
Proposition 99 do to Nevada's cigarette sales?

**Options:**

- A. They rose — Californians drove across the border for cheaper packs
- B. They fell — whatever happened in California happened in Nevada too
- C. They barely moved — a tax 400 miles away is somebody else's problem
- D. Impossible to say without modelling it

**Correct answer:** none — this is a prediction poll, not a quiz.

**Notes:** Run this BEFORE slide 28 reveals the sign, so the room commits while
cross-border shopping is still the obvious story. Most audiences pick A — and A is the
answer the estimate rejects. Do not comment on the split. Screenshot the bar chart or
leave the slide open in another tab: you come back to it at slide 29, and the callback
only works if you can show the room what it originally said.

---

## 7 — Content

**Title:** The simplex and SUTVA, written down

**Image page:** 6 of 36

**Notes:** Read the first line as a sentence: find the mix of donor states whose
weighted average tracks California over 1970 to 1987, subject to the mix being a genuine
average — no negative weights, and the weights adding to one. The set delta is the
simplex, and everything that distinguishes the three stages of this talk is a statement
about delta. The second line is SUTVA. It throws away every argument of the potential
outcome but one, which is why a classical synthetic control cannot report a spillover,
cannot test for one, and cannot be wrong about one in a way you would notice.

---

## 8 — Content

**Title:** Python can now do all three stages without leaving one language

**Image page:** 7 of 36

**Notes:** mlsynth's PyPI release lags main at the same version string, which is why it
gets a commit pin rather than a version pin.

---

## 9 — Content

**Title:** Three relaxations, then two post-mortems

**Image page:** 8 of 36

**Notes:** The three stages are nested: each keeps everything the previous stage assumed
except one restriction, which it replaces with something weaker. That is what makes the
comparison at the end meaningful — when the number moves, we know exactly which
assumption moved it. The last two items are not relaxations but audits: why the R
edition of this same analysis reports an interval 33 times narrower, and what an
effective sample size of 3 actually means.

---

## 10 — Act divider

**Title:** Three Stages on One Panel

**Image page:** 9 of 36

**Background:** `#6a9bcc`

---

## 11 — Content

**Title:** Each stage drops exactly one restriction from the stage before

**Image page:** 10 of 36

**Notes:** Stress that this is one regression, not three models. Stage 1 constrains
alpha to the simplex. Stage 2 replaces that hard constraint with a prior — same alpha,
weaker claim. Stage 3 keeps the prior and instead drops the assumption that the donors
are clean. So when a number moves between stages, we know exactly which restriction
moved it. That is the whole design of the talk.

---

## 12 — Content

**Title:** Stage 1 — the simplex picks five donors and stops

**Image page:** 11 of 36

**Notes:** Note Nevada is already in the blend, carrying a quarter of the counterfactual
— the one state we have reason to suspect. Section 4.1 of the post showed that sparsity
can come from the data: a donor that is useless gets zero weight without any constraint
forbidding it. Here it can equally have come from the constraint, and from the outside
the two look identical. That is the question Stage 2 exists to ask.

---

## 13 — ★ INTERACTIVE 2 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Stage 1 gives exactly zero weight to 33 of the 38 donors. From that output
alone, can you tell whether those zeros come from the data or from the simplex
constraint?

**Options:**

- A. Yes — a zero weight means the donor had nothing to contribute
- B. No — the constraint forces zeros, so the two are observationally identical  ← CORRECT
- C. Yes — the pre-treatment RMSE would be higher if the constraint were binding
- D. No — but only because 18 pre-treatment years is too short a window

**Notes:** The slide's own takeaway IS the question, so ask it rather than reading it.
The answer arrives two slides later, when relaxing the simplex takes the active pool
from 5 donors to 26. Section 4.1 of the post makes the same point from the other side:
sparsity CAN come from the data — a useless donor gets zero weight with no constraint
forbidding it — which is exactly why you cannot attribute it from the outside.
Distractor C is worth naming aloud: RMSE measures fit, not the provenance of the zeros.

---

## 14 — Content

**Title:** California and its synthetic are indistinguishable until 1988

**Image page:** 12 of 36

**Notes:** The two series track closely until 1988 and separate steadily after it,
reaching minus 26.7 packs by 2000. The pre-treatment gap is not exactly zero — it
wanders between minus 3.5 and plus 5 packs, so an RMSE of 1.60 is an average over that
wandering, not a promise that any single year fits well. Worth saying out loud: this
reproduces the R edition's minus 18.46 to within 0.04 packs, from a different package
and a different optimiser, which is the strongest evidence either implementation gets
that it is correctly coded.

---

## 15 — Content

**Title:** The horseshoe makes zero the default without making it compulsory

**Image page:** 13 of 36

**Notes:** Two properties that pull in opposite directions: enormous mass at zero, so a
donor with nothing to contribute gets nothing; and tails heavy enough that a donor with
a great deal to contribute is not shrunk into irrelevance. The name comes from the
shrinkage factor kappa, one over one plus lambda squared, whose implied prior is a Beta
one-half one-half — a U shape with peaks at 0 and 1. The Makalic–Schmidt step is the
practical one: every half-Cauchy is a scale mixture of inverse gammas, so one auxiliary
variable per scale gives closed-form conditionals throughout. Nothing is approximated.

---

## 16 — Content

**Title:** Relax the simplex and the active donor pool multiplies by five

**Image page:** 14 of 36

**Notes:** Point at the intervals before the points. Most of them straddle zero
comfortably — the model is willing to entertain a role for these donors, but the data do
not insist on one. The horseshoe did exactly what it promised: it made zero the default
without making it compulsory. Two consequences of dropping the simplex are visible at
once — the active count goes from 5 to 26, and the weights no longer sum to one. Neither
is a defect.

---

## 17 — ★ INTERACTIVE 3 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Two horseshoe synthetic controls — same panel, same prior family, both
correctly coded — report ATTs three packs apart. What do you check first?

**Options:**

- A. The random seed and the number of iterations
- B. Whether one fits an intercept and the other does not  ← CORRECT
- C. Whether one admitted more donors than the other
- D. Whether one chain converged and the other did not

**Notes:** This is the slide people push back on, so ask before you show. BSCM fits an
intercept of 16.86 and its weights sum to 0.758, so its blend sits near 100 packs
against California's 118 and the intercept lifts it back; scspill has no intercept and
standardises first. The rule is the takeaway: when two packages disagree about a model
they both implement, check the equation before you check the sampler. The tiebreaker is
external — scspill's rho = 0 case lands within 0.16 packs of the R edition, produced by
entirely separate C++ code. Do not average them.

---

## 18 — Content

**Title:** Two Bayesian synthetic controls, one intercept apart

**Image page:** 15 of 36

**Notes:** This is the slide people push back on. Both are horseshoe synthetic controls,
and they land three packs apart. The reason is the intercept: BSCM fits beta-zero at
16.86 and its weights sum to 0.758, so its blend sits about 100 packs against
California's 118 and the intercept lifts it back. scspill has no intercept and
standardises first. The tiebreaker is external — scspill's rho-equals-zero case lands
within 0.16 packs of the R edition, produced by entirely separate C++ code. Do not
average them.

---

## 19 — Content

**Title:** Drop SUTVA and the bias has a closed form

**Image page:** 16 of 36

**Notes:** Derive it out loud in one line: add and subtract the weighted sum of the
donors' no-treatment outcomes. What a classical synthetic control reports is the true
effect on California minus a weighted sum of the spillovers that landed on the donors —
with the same weights used to build the counterfactual. Two consequences worth stating.
If every spillover is zero the bias vanishes and classical synthetic control is right,
so SUTVA is not a technicality but the whole justification. And the sign of the bias is
the opposite of the sign of the weighted spillover, which is the fact the Nevada result
turns on.

---

## 20 — ★ INTERACTIVE 4 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** The bias in a classical synthetic control is the weighted sum of donor
spillovers — donor weight times donor contamination. Which donor damages the estimate
most?

**Options:**

- A. The most contaminated donor in the pool, whatever weight it carries
- B. A slightly contaminated donor carrying half the counterfactual  ← CORRECT
- C. Any donor sharing a border with the treated unit
- D. The donor with the largest raw cigarette sales

**Notes:** Straight from the slide's takeaway: a filthy donor with zero weight is
harmless, a slightly dirty one carrying half the counterfactual is not. A is the trap —
contamination alone is not the bias, the PRODUCT is. C is worth a sentence too:
contiguity is why we suspect Nevada, but weight is what makes it matter, and Nevada
happens to carry both.

---

## 21 — Content

**Title:** The simplex is gone; something took its place

**Image page:** 17 of 36

**Notes:** Say plainly what has been traded. The simplex is gone, and something has
taken its place: the assumption that some fixed alpha reproduces California's untreated
path exactly, in every pre-period. The weights may be negative and need not sum to one.
It is not weaker in some absolute sense — it is untestable in a way the simplex is not,
because the simplex's price shows up as pre-treatment RMSE and this one does not show up
anywhere.

---

## 22 — Content

**Title:** The donors' untreated path solves in closed form, and the nuisance block
cancels

**Image page:** 18 of 36

**Notes:** This is the technical heart of the talk. Substituting the treated unit's
equation into the donor system eliminates beta, the latent factors and the error
variances — they all cancel. What is left depends only on alpha, rho, w, W and observed
outcomes. That is why a weakly-mixing nuisance block does not poison the answer: there
is nowhere for it to enter. It also localises the whole identification problem onto one
scalar, which is what the rest of this talk is about.

---

## 23 — Content

**Title:** One call runs both samplers and post-processes the spillovers

**Image page:** 19 of 36

**Notes:** Everything spatial — w, W, the covariates — comes off the bundled panel, so
there is nothing to align by hand. Half a million iterations for a 13-year effect looks
excessive, and the post spends a whole section justifying it: the ATT is stable from
about 100,000 draws onward, but the spatial parameter needs roughly five times that
before its effective sample size reaches anything reportable. The rho-equals-zero
comparator falls out of the same fit, which is why Stage 2 costs no extra MCMC at all.

---

## 24 — Content

**Title:** The spatial parameter is clearly above zero

**Image page:** 20 of 36

**Background:** `#141413`

**Notes:** The interval excludes zero, so the data reject the restriction that would
collapse Stage 3 back to Stage 2. That is the SUTVA test, and it is a test the model
nests rather than one bolted on afterwards. Resist reading precision into this number —
the next slide is about exactly how much that interval is worth.

---

## 25 — ★ INTERACTIVE 5 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** The spatial parameter comes in at 0.316 with a 95% credible interval of
[0.231, 0.403], from 250,000 draws. What would most undermine that interval?

**Options:**

- A. A low effective sample size — the chain may never have explored the posterior  ← CORRECT
- B. A posterior standard deviation that is small relative to the support
- C. The fact that the interval excludes zero
- D. Drawing the parameter by random-walk Metropolis rather than Gibbs

**Notes:** This sets up the next slide's effective-sample-size table, where rho comes in
at 137 against sigma-squared's 204,000. Note 20 warns against reading precision into the
headline number; this is where that warning becomes concrete. D is the sharpest
distractor and the one to discuss: random-walk Metropolis is WHY the ESS is low, but the
sampler choice is not itself the defect — slow mixing is not weak identification. B
describes a tight posterior, which is a virtue, not a problem.

---

## 26 — Content

**Title:** The two parameters leaning on one contiguity channel are the hard ones

**Image page:** 21 of 36

**Notes:** Read the effective-sample-size column top to bottom. Sigma-squared has
204,000, the donor weights 10,000 to 26,000, rho has 137 and the price coefficient 388.
Same chain. The point is not that the software is bad — it is that rho is the only
parameter drawn by random-walk Metropolis rather than from a closed-form conditional, so
its draws are heavily autocorrelated. Its posterior is actually tight: standard
deviation 0.043 on a support 1.9 wide. Slow mixing is not the same thing as weak
identification, and the distinction matters for what you tell a referee.

---

## 27 — Content

**Title:** Almost the entire spillover lands on one state

**Image page:** 22 of 36

**Notes:** Walk the map first: on a linear colour scale almost every tile sits at the
pale end, because one state absorbs an order of magnitude more than any other. The
concentration is the finding, not a rendering artefact. Then the bars: Nevada at minus
5.50, then Idaho and Utah at about minus 0.49 — the two states that border Nevada, one
ring further out — and everything beyond that second ring is two orders of magnitude
smaller again. One limitation to state plainly rather than bury: scspill returns the
effects panel as posterior means, so no donor-level spillover has a credible interval.
"Noise" here means relative magnitude, not a tail probability. The interval evidence is
on rho, not on Nevada. And slice from 1988 onward — the pre-treatment rows are fit
residuals, not causal spillovers.

---

## 28 — Content

**Title:** The leak runs the *opposite* way to the obvious hypothesis

**Image page:** 23 of 36

**Background:** `#141413`

**Notes:** This is the sign surprise, and it is worth pausing on. The prior expectation
was cross-border shopping raising Nevada's sales; the estimate says they came in below
their no-treatment path. Be careful not to over-claim: the post explicitly declines to
name the dominant channel — advertising, media, social norms crossing a border that tax
arbitrage also crosses — because nothing in the estimate identifies which. What it does
say is that the net effect on Nevada ran the same way as the effect on California, not
against it. Remember too that this number is a posterior mean with no interval around
it.

---

## 29 — ★ INTERACTIVE 6 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** Nevada's sales came in BELOW its no-treatment path, and Nevada carries
positive weight in synthetic California. What does that do to the classical ATT?

**Options:**

- A. Biases it toward zero — the classical estimate understates the effect  ← CORRECT
- B. Biases it away from zero — the classical estimate overstates the effect
- C. Nothing — spillovers cancel across the donor pool
- D. It depends on whether the Nevada spillover is statistically significant

**Notes:** This is the payoff for the poll on slide 6 — show the room its own bars
first, then ask. A negative spillover on a positively-weighted donor drags synthetic
California down, so the classical comparison gives the policy LESS credit than it
deserves: modelling the leak makes the effect larger, not smaller. On the horseshoe
weights the correction is 1.19 packs; on the simplex weights, where Nevada carries 0.242
instead of 0.200, it is 1.51 — the classical estimate is the more contaminated of the
two. D is the wrong answer worth dwelling on: scspill returns the effects panel as
posterior means, so no donor-level spillover HAS a credible interval. The interval
evidence is on rho, not on Nevada.

---

## 30 — Content

**Title:** Which means the classical estimate was biased *toward zero*

**Image page:** 24 of 36

**Notes:** This inverts the intuition most audiences arrive with. The prior expectation
is cross-border shopping raising Nevada's sales, which would inflate the estimate. The
estimate says Nevada's sales fell. Negative spillover on a positively-weighted donor
drags synthetic California down, so the classical comparison gives the policy less
credit than it deserves. On the horseshoe weights that is 1.19 packs; on the simplex
weights, where Nevada carries 0.242 instead of 0.200, it is 1.51. The classical estimate
is the more contaminated of the two.

---

## 31 — Content

**Title:** The R edition's interval is 33 times too narrow — and the R specification
reproduces that exactly

**Image page:** 25 of 36

**Notes:** The point estimates are close. The intervals are not remotely close, and
"different language" does not explain a factor of 33. scspill documents six departures
from the R replication code; three have escape hatches, so the Python can be put back
into the R specification and run at the R edition's own budget of 5,000 iterations. It
reproduces rho to within 0.006 and the Nevada spillover to 0.03 packs — minus 3.750
against minus 3.778 — including an effective sample size of 3. That is not a coincidence
to be explained away; it is the R sampler's behaviour, faithfully reproduced. Which
means the difference is a specification difference, not a porting error.

---

## 32 — ★ INTERACTIVE 7 — Quiz (scored)

**Type:** multiple choice quiz · scored · presentation default points, no time limit

**Question:** The R edition's credible interval was 33 times too narrow. Running that
same specification 100 times longer — 5,000 draws to 500,000 — closed how much of the
gap?

**Options:**

- A. Almost all of it — it was a chain-length problem
- B. About 45% of the width — most of the gap was propagate_alpha  ← CORRECT
- C. None — the width did not move at all
- D. It overshot — the interval became too wide

**Notes:** The three widths: 0.482 at 5,000 draws, 0.702 at 500,000, and 12.713 once
alpha is propagated. A hundred times the iterations widens the interval by 45%;
propagating alpha widens it by 1,700%. The next slide names the two separable failures —
effective sample size asks whether the interval is RELIABLE, propagate_alpha asks
whether it is COMPLETE, and the published interval failed both. If the room picks A,
that is the useful mistake: chain length is the fix everyone reaches for first.

---

## 33 — Content

**Title:** Chain length was never the problem — the interval was incomplete

**Image page:** 26 of 36

**Notes:** Two separable failures, and the published interval failed both. Effective
sample size asks: is the interval reliable — did the chain actually explore the
posterior? At an ESS of 3, no. propagate_alpha asks a different question: is the
interval complete — does it carry uncertainty about which states make up synthetic
California? With alpha pinned at its posterior mean, no. Running the R specification a
hundred times longer fixes the first and moves the width only from 0.48 to 0.70. The
other factor of eighteen is the second. For the corrected run, adaptation lands
acceptance at 0.444 against the 0.44 target and an effective sample size of 137.

---

## 34 — Content

**Title:** A memory layout was doing part of the modelling

**Image page:** 27 of 36

**Notes:** Departure 1 is the most instructive kind of bug: the estimate simply answers
a slightly different question than the one asked. Nothing crashes and nothing looks
wrong. Departures 5 and 6 are different in kind — an omega-k conditional treating omega
as a variance while its neighbours treated it as a precision, and an FFBS initialisation
inconsistent with its own conditionals. Neither changes the California answer much, but
both mean the R sampler was not converging to any posterior at all. It was converging to
something, and that something had no interpretation.

---

## 35 — Content

**Title:** Artefacts shrink; errors do not

**Image page:** 28 of 36

**Notes:** Explain the test before reading the figure. Draw parameters from the prior
and simulate data from them: that is the marginal-conditional route to the joint
distribution of parameters and data. Or simulate data once and then run one Gibbs sweep,
repeatedly: that is the successive-conditional route. If every conditional in the
sampler is correct the two routes target the same joint distribution, so any statistic's
mean must agree. The documentation's rule for reading a failure is the one to quote: a
genuine incoherence holds its position or grows as the chain lengthens, while a mixing
artefact flips sign and shrinks. Here the maximum absolute z falls from 3.48 to 2.50,
six of the eight statistics shrink, and the flag count goes from one to zero. A single
Geweke run tells you almost nothing; two runs at different scales tell you which kind of
failure you have.

---

## 36 — Content

**Title:** The only prior that moves the answer is the one nobody calls a prior

**Image page:** 29 of 36

**Notes:** Flag this before anyone reads the level off the axis. `prior_sensitivity`
runs the *simplified* Step-2 kernel, not the production one, so the rho it reports here
sits near 0.8 and must not be compared with the headline 0.316. What is comparable is
the *shape*: the answer is flat across the inverse-gamma hyperparameters and across the
step size, and moves only when the support itself is truncated to plus or minus 0.5.
That is the finding — the support constraint is a prior too, and it is the one nobody
reports.

---

## 37 — Content

**Title:** The strongest objection — and the answer

**Image page:** 30 of 36

**Notes:** Deliver the objection as the strongest version of itself, then concede the
part that is true. The SAR layer is a model of how outcomes co-move across a fixed,
researcher-supplied graph, and swapping contiguity for a different graph would produce
different spillovers. The post says exactly that in its discussion. The response is not
that the assumption is harmless — it is that the alternative is rho equals zero, imposed
silently and never reported. Making the assumption a parameter is what lets the data
reject it. If pressed further, the honest concession is the identifying assumption
itself: that some fixed unconstrained combination of donors reproduces California
exactly. It is strong, and it is untestable.

---

## 38 — Act divider

**Title:** What Survives Every Relaxation

**Image page:** 31 of 36

**Background:** `#00d4c8`

---

## 39 — Content

**Title:** Every stage of the ladder agrees on the sign and the scale

**Image page:** 32 of 36

**Notes:** Read the ladder from the bottom up, then look at the hollow diamonds. Every
stage lands between minus 15.7 and minus 18.8 packs — two libraries, four prior
structures, one spatial layer and an independent third implementation — and the maximum
disagreement with the R edition is 0.278 packs across four comparable stages. Do not
over-claim beyond the figure: widening to the six comparable benchmark estimators in the
post's catalogue section stretches the range to minus 16.3 and minus 26.3, a wider band
than this ladder shows, though still without changing the sign.

---

## 40 — Content

**Title:** What Proposition 99 cost, and who else paid

**Image page:** 33 of 36

**Background:** `#141413`

**Notes:** Two numbers, one policy. Minus 16.87 packs per capita per year for California
once the leak is modelled, and minus 5.50 for Nevada, which never voted on it. The
consequence for how the policy gets described: reporting only California's number
understates Proposition 99's total public-health footprint, because a neighbouring state
also smoked less.

---

## 41 — Content

**Title:** Four things survive this deck

**Image page:** 34 of 36

**Notes:** Land these four and stop. The effect is robust and the classical estimate was
fine for the headline number. The donor pool composition is not robust at all, and
sentences of the form 'synthetic California is mostly Utah and Nevada' are closer to
artefacts than findings. SUTVA is false here, but the correction is modest for
California and large for Nevada — which is a different question, and the one classical
synthetic control could not ask. On the simplex weights the California correction is
1.51 rather than 1.19, because the constraint pushed more weight onto the one leaking
donor. And the interval, not the point estimate, was where the real error lived: two
distinct failures, one diagnosable by effective sample size and one by asking what the
interval is conditioning on.

---

## 42 — ★ INTERACTIVE 8 — Poll (no correct answer)

**Type:** multiple-choice poll · single selection · results as bar chart

**Question:** Four things survived this deck. Which one will change how you read the
next synthetic control paper?

**Options:**

- A. The effect is robust — minus 15.7 to minus 18.8 packs, every relaxation
- B. The donor pool is not — 5 donors or 26, depending on the constraint
- C. SUTVA is false here — 1.19 packs for California, 5.50 for Nevada
- D. The interval was the real error, not the point estimate

**Correct answer:** none — this is a prediction poll, not a quiz.

**Notes:** A closing temperature check, standing in for the open-ended Q&A slide the
free plan does not include. There is no right answer and the useful outcome is the
disagreement. If B or D wins, the deck landed — those are the two claims a reader is
least likely to arrive with. Use the split to choose what to take questions on.

---

## 43 — Content

**Title:** Everything here is runnable today

**Image page:** 35 of 36

**Notes:** Everything on this list ships with the post itself. The Colab notebook and
the Quarto project reproduce every number in this deck; the web app lets you move rho by
hand and watch the counterfactual respond; the data dictionary documents the panel and
both spatial objects. Both packages are young, so both are pinned — one to a release,
one to a commit — and the numbers are reproducible only under those pins.

---

## 44 — Act divider

**Title:** Let the data choose the donors, let the map say who else was treated, and let
the ESS say whether the interval means anything.

**Image page:** 36 of 36

**Background:** `#1a3a8a`

---

