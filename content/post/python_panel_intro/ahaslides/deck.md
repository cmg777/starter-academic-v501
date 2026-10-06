# AhaSlides deck: presenter copy

> **Generated** by `build_deck_json.py` from `../slides/slides.qmd` (content slides, speaker notes) and `activities.py` (interactive slides). Do not edit by hand: edit those two files and regenerate.

**Presentation:** Introduction to Panel Data Methods  
**Editor:** https://presenter.ahaslides.com/presentation/10245137 (ID 10245137, join code **V62EU**)  
**Public view link:** https://presenter.ahaslides.com/share/1790911128481-t7x8a80cw2  
**Plan:** AhaSlides Education Large (paid, from 2026-10-06)  
**Backup of the free-plan version:** presentation 10274743

## Composition

| Kind | Count |
|---|---|
| Content slides (images of the Quarto deck) | 33 |
| Interactive slides, core | 25 |
| Interactive slides, optional (skip live if behind) | 12 |
| **Total** | **70** |

Activity time: about **28 min** for the core slides, plus **17.5 min** if every optional slide runs. Quizzes use 30-second timers with faster answers earning more points (the Colab stop has five minutes).

## Run of show

| Pos | ID | After page | Type | Tier | Min | Answer |
|---|---|---|---|---|---|---|
| 2 | N1 | 1 | QR code (join) | core | 1 | none (unscored) |
| 3 | N2 | 1 | Word cloud | core | 1.5 | none (unscored) |
| 4 | N3 | 1 | Rating scale | core | 1 | none (unscored) |
| 5 | N4 | 1 | Live Q&A | core | 0.5 | none (unscored) |
| 8 | N5 | 3 | Poll | core | 1 | none (prediction) |
| 12 | N6 | 6 | Draw answer | *optional* | 2 | none (unscored) |
| 16 | I1 | 9 | Quiz: pick answer | core | 1 | A. Less than 10% |
| 18 | N7 | 10 | Quiz: true or false | *optional* | 1 | False |
| 20 | N8 | 11 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 22 | N9 | 12 | Quiz: true or false | *optional* | 1 | False |
| 24 | I2 | 13 | Quiz: pick answer | core | 1 | C. Larger, with a larger standard error |
| 26 | N10 | 14 | Quiz: fill in the blanks | core | 1 | time, switch |
| 29 | I3 | 16 | Quiz: pick answer | core | 1 | B. Slightly different |
| 31 | N11 | 17 | Quiz: match pairs | core | 1 | First differences = Subtract the 2010 row from the 2012 row; Within (demeaning) = Subtract the mean of each worker; Dummy-variable FE = Add one dummy per worker, 2,198 in all; Absorbed FE (/ ID) = The fast software route to the same estimate |
| 32 | N12 | 17 | Quiz: short answer | core | 5 | 0.2103 |
| 34 | I4 | 18 | Quiz: pick answer | core | 1 | A. Exactly equal to FD, 0.2113 |
| 36 | N13 | 19 | Quiz: true or false | *optional* | 1 | False |
| 38 | N14 | 20 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 40 | I5 | 21 | Quiz: pick answer | core | 1 | B. Fall enough to flip the verdict |
| 43 | I6 | 23 | Quiz: pick answer | core | 1 | A. It equals the FE value, 0.2103 |
| 45 | N15 | 24 | Quiz: categorise | core | 1 | Cross-sectional camp: Pooled OLS, Between, Random effects; Within camp: First differences, Fixed effects, Two-way fixed effects |
| 46 | N16 | 24 | Leaderboard | core | 0.5 | none (unscored) |
| 48 | N17 | 25 | Quiz: correct order | *optional* | 1 | Between estimator → Pooled OLS → Random effects → Fixed effects |
| 51 | N18 | 27 | Spinner wheel | *optional* | 1.5 | none (unscored) |
| 53 | I7 | 28 | Quiz: pick answer | core | 1 | B. Change sign |
| 56 | N19 | 30 | 2x2 matrix | *optional* | 2 | none (unscored) |
| 57 | N20 | 30 | Idea board | *optional* | 3 | none (unscored) |
| 60 | R1 | 32 | Quiz: pick answer | core | 0.75 | B. Workers who switch union status |
| 61 | R2 | 32 | Quiz: pick answer | core | 0.75 | C. uncorrelated with union status |
| 62 | R3 | 32 | Quiz: pick answer | core | 0.75 | A. First differences with an intercept |
| 63 | R4 | 32 | Quiz: pick answer | core | 0.75 | B. The Mundlak term in CRE |
| 64 | N21 | 32 | Leaderboard | core | 0.5 | none (unscored) |
| 66 | N22 | 33 | Poll | *optional* | 1 | none (prediction) |
| 67 | N23 | 33 | Word cloud | *optional* | 1 | none (unscored) |
| 68 | N24 | 33 | Rating scale | core | 1 | none (unscored) |
| 69 | N25 | 33 | Open ended | core | 2 | none (unscored) |
| 70 | N26 | 33 | Duck race | core | 1 | none (unscored) |

# Slides

## 1 — Title

**Title:** Introduction to Panel Data Methods

**Subtitle:** Seven estimators, one wage panel: why the union premium triples

**Image page:** 1 of 33

---

## 2 — ★ N1 — QR code (join) (CORE, ~1 min)

**Answer:** none (unscored)

**Notes:** Students join at ahaslides.com with code V62EU or by scanning the QR code. Names are required on join, so the leaderboard and the spinner wheels show real names. Ask everyone to open the Colab notebook now and run its first cell, which installs pyfixest and linearmodels; the Colab stop in Act II then runs without waiting.

---

## 3 — ★ N2 — Word cloud (CORE, ~1.5 min)

**Prompt:** In one word: what can panel data do that a single cross-section cannot?

**Answer:** none (unscored)

**Settings:** `{"entriesPerParticipant": 2}`

**Notes:** Warm-up, no right answer. Expect words such as track, compare, change, control or difference. Do not correct anyone yet. The same prompt returns at the end of class, so keep this cloud in mind (or screenshot it) for the comparison.

---

## 4 — ★ N3 — Rating scale (CORE, ~1 min)

**Prompt:** Before we start: how confident are you?

Scale 1 (Not at all) to 5 (Completely):
- I can explain the difference between within and between variation
- I can say which variation each panel estimator uses
- I can choose between fixed effects and random effects

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

**Image page:** 2 of 33

**Background:** `#d97757`

---

## 7 — Content

**Title:** Same workers, same question — but the answer triples depending on the estimator

**Image page:** 3 of 33

**Notes:** The central tension of the tutorial: pooled OLS and the within (fixed-effects) estimator answer the same applied question — what does union membership do to wages — but disagree by a factor of three. The gap is not noise; it is the empirical signature of selection on unobservables. Everything in Act II is about earning the right to pick a number.

---

## 8 — ★ N5 — Poll (CORE, ~1 min)

**Prompt:** Gut call: which union premium would you report?

- A. 7.5 log points, from pooled OLS
- B. 21 log points, from the within estimators
- C. Both, each with the question it answers

**Answer:** none (prediction)

**Settings:** `{"hasTimeLimit": true, "timeToAnswer": 30, "multipleChoice": false, "limitChoice": 1, "typeChart": "barChart", "showPercentage": true}`

**Notes:** An opinion poll with no right answer at this point. The slide just asked which number to report; this is where the room commits before any method is explained. Do not comment on the split. The same poll returns after the closing sentence, and the lecture argues for C: each number answers a different question, so report both with their estimands.

---

## 9 — Content

**Title:** Six estimators on one panel disagree by a factor of three

**Image page:** 4 of 33

**Notes:** The spoiler figure. Don't explain every bar yet — just plant that the estimators split into two camps roughly three-fold apart, and that we come back to this picture in Act III. Cross-sectional methods (POLS 0.075, Between 0.066, RE 0.109) on one side; within methods (FDFE 0.211, FE 0.210, CRE 0.210) on the other.

---

## 10 — Content

**Title:** Where we're going

**Image page:** 5 of 33

**Notes:** Teaching deck, so we signpost. Seven "Before you look" slides along the way ask the room to predict before each reveal; on AhaSlides each one is followed by a live quiz.

---

## 11 — Act divider

**Title:** The Investigation

**Image page:** 6 of 33

**Background:** `#6a9bcc`

---

## 12 — ★ N6 — Draw answer (OPTIONAL, skip if behind, ~2 min)

**Prompt:** Draw the 2010 to 2012 wage path of a worker who joins a union

**Answer:** none (unscored)

**Notes:** Give 60 seconds. Most drawings will show a line that rises between the two years. Ask what the line of a comparable worker who never joins would look like: the within estimators compare these changes, not the levels. Keep two or three drawings in mind for the trajectories slide, which shows 30 real workers.

---

## 13 — Content

**Title:** The lab: 2,199 workers, two years, a perfectly balanced T = 2 panel

**Image page:** 7 of 33

**Notes:** NLSY-style data on US workers; the full file has five waves (2010–2018) but we keep two for pedagogical clarity. 4,398 worker-year observations, balanced. The low unionization rate (16.3%) matters: any estimator that leans on cross-sectional variation is working mostly with non-union workers.

---

## 14 — Content

**Title:** Each estimator chooses which variation to believe

**Image page:** 8 of 33

**Notes:** This columns slide replaces the post's Mermaid decision diagram (Quarto revealjs does not bundle mermaid.js, so a fenced mermaid block would render as raw text). The left side leans on between-worker variation; the right side on within-worker variation. CRE/Mundlak sits in the middle and recovers both. We will run both specification tests, and they disagree: the reason (which errors each test assumes) is part of the lesson.

---

## 15 — Cue slide (Before you look)

**Title:** Before you look: how much of union's variance is within workers?

**Image page:** 9 of 33

**Background:** `#1a3a8a`

**Notes:** Ask the room to commit before the decomposition. Give 20 seconds, then take the vote. Answer on the next slide: A, only 6.1% is within. The within SD (0.0911) is not a share; the share is its square over the sum of the squared between and within SDs. Just 73 of 2,199 workers switch. (AhaSlides interactive I1 follows.)

---

## 16 — ★ I1 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** What share of the variance of union status comes from workers who change status between 2010 and 2012?

- A. Less than 10%  ← CORRECT
- B. About 25%
- C. About 50%

**Answer:** A. Less than 10%

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A. Only 6.1% of the variance of union status is within workers. The within SD, 0.0911, is not a share: the share is its square divided by the sum of the squared between and within SDs (0.0083 out of 0.1362). Just 73 of 2,199 workers switch, so almost all the variation comes from comparing different workers. If B draws votes, point out that the SD ratio 0.0911/0.369 looks like 25% only because SDs are not variances. The next slide shows the decomposition.

---

## 17 — Content

**Title:** 94% of union variation is between workers — only 6.1% is within

**Image page:** 10 of 33

**Notes:** The answer to the vote: A. Fixed effects only use the within part. For union that is a thin 6.1% slice of total variance. Schooling has zero within-variation (nobody's education changes across two years), so FE mechanically drops it. The consequence: FE standard errors will be much larger than POLS — the FE-vs-RE choice is about precision as much as bias.

---

## 18 — ★ N7 — Quiz: true or false (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Fixed effects can estimate the wage return to schooling in this panel.

**Answer:** False

**Notes:** Answer: False. Schooling has zero within variation: no worker changes education between 2010 and 2012, so the worker effect absorbs it and fixed effects drop it mechanically. This is the price of within identification, and the reason the CRE model returns at the end of Act II.

---

## 19 — Content

**Title:** Only the workers who switch status identify the within estimators

**Image page:** 11 of 33

**Notes:** Most lines are flat-colored — always-union (orange) or never-union (blue). Only the teal "changer" lines carry identifying information for FE, FD, and Mundlak. One-way fixed effects reads only the teal lines, because a line whose union status never changes carries no within-worker contrast; the blue and orange lines can only be compared with each other, which is the cross-sectional comparison. The tension is literally a question of which lines you choose to read.

---

## 20 — ★ N8 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: why do only the teal lines identify fixed effects?

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Spin the wheel; it fills itself with the names of joined students. A good answer: a worker whose union status never changes has no within-worker contrast, so the worker effect absorbs everything about that worker. Only the 73 switchers, the teal lines, show a wage change alongside a union change.

---

## 21 — Content

**Title:** Pooled OLS — the naive baseline — reports a 7.5-log-point premium

**Image page:** 12 of 33

**Notes:** POLS treats every worker-year as independent, ignoring the panel. 7.5 log points, SE 2.3. This is the textbook cross-sectional answer and the number a naive analyst reports. The rest of the post is a tour through ways of subtracting the selection bias out. Between is its near-twin (0.066) because 94% of union variance is between-worker.

---

## 22 — ★ N9 — Quiz: true or false (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Pooled OLS is highly significant (t = 3.25), so its 7.5-log-point premium is unbiased.

**Answer:** False

**Notes:** Answer: False. Significance measures noise, not bias. If workers with higher unobserved ability are less likely to hold union jobs, pooled OLS mixes the union effect with that selection, however small its standard error. The rest of Act II is a tour of ways to remove the fixed part of that selection.

---

## 23 — Cue slide (Before you look)

**Title:** Before you look: smaller, the same, or larger than pooled OLS?

**Image page:** 13 of 33

**Background:** `#1a3a8a`

**Notes:** Ask: which way does first-differencing move the estimate, and what happens to its precision? Answer on the next slide: C. FD gives 0.2113 with SE 0.0792, about 3.4 times the POLS SE: differencing removes the fixed traits that depress the cross-sectional comparison but keeps only the 73 switchers. (AhaSlides interactive I2 follows.)

---

## 24 — ★ I2 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Pooled OLS gave 0.0750 (SE 0.0231). How will the first-difference estimate compare?

- A. Smaller than 0.075
- B. About the same
- C. Larger, with a larger standard error  ← CORRECT

**Answer:** C. Larger, with a larger standard error

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: C. FD gives 0.2113 with SE 0.0792, almost three times the POLS estimate and about 3.4 times its standard error. Differencing removes the fixed worker traits that depress the cross-sectional comparison, but it also discards every worker who never changes status, which leaves only 73 informative workers. The next slide writes out the differenced model.

---

## 25 — Content

**Title:** First-differencing erases $\alpha_i$ and triples the estimate to 0.211

**Image page:** 14 of 33

**Notes:** The answer to the vote: C. Start from y_it = α_i + β x_it + u_it; difference across the two periods and α_i drops out. The point estimate is almost three times POLS (0.211 vs 0.075) with a wide CI [≈0.06, 0.37] that excludes zero but also contains the POLS 0.075, so the upward revision is large in size but not statistically decisive on its own. Workers who switch into unions are a different population from always-union workers, so the within parameter is genuinely different — and arguably cleaner.

---

## 26 — ★ N10 — Quiz: fill in the blanks (CORE, ~1 min)

**Prompt:** Complete the logic of first differences

> First differencing removes the worker effect because it does not change over [blank]. The estimate is identified only by workers who [blank] union status.
- blank 1: options workers, time, industries → **time**
- blank 2: options keep, report, switch → **switch**

**Answer:** time, switch

**Notes:** Answer: time, switch. The worker effect is constant over the two years, so it cancels when we subtract the 2010 row from the 2012 row. A worker who never changes union status has a change of zero in the regressor, so only the 73 switchers move the estimate. That is why the standard error is 3.4 times larger than in pooled OLS.

---

## 27 — Content

**Title:** The within transformation demeans the data — and the slope steepens to 0.21

**Image page:** 15 of 33

**Notes:** Same observations, two pictures. Left (raw): POLS slope 0.075, dragged down because union and non-union mean wages sit close together. Right (demeaned): FE slope ≈ 0.21, identified only by the points that move off the origin — the switchers. The within estimator subtracts each worker's mean, so α_i vanishes; OLS on the demeaned data gives the FE coefficient.

---

## 28 — Cue slide (Before you look)

**Title:** Before you look: does fixed effects match FD's 0.2113?

**Image page:** 16 of 33

**Background:** `#1a3a8a`

**Notes:** Ask, and as a follow-up: if it differs, which feature of the FD regression could explain the gap? Answer on the next slide: B. FE gives 0.2103, a gap of 0.001, because the FD regression has an intercept that absorbs the common wage growth of 0.0727. Without the intercept FD returns exactly 0.2103. (AhaSlides interactive I3 follows.)

---

## 29 — ★ I3 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** With two periods, will the FE estimate equal the FD estimate of 0.2113?

- A. Exactly equal
- B. Slightly different  ← CORRECT
- C. Very different

**Answer:** B. Slightly different

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B. FE gives 0.2103, a gap of 0.001. The gap comes from the intercept in the FD regression, which absorbs the common wage growth of 0.0727; drop the intercept and FD returns exactly 0.2103. If anyone chose A, they have the right intuition about the identity; the intercept is the one detail that breaks it. The next slide shows three recipes that all give 0.2103.

---

## 30 — Content

**Title:** Three recipes, one number: FD, demeaning, and dummy FE all give 0.2103

**Image page:** 17 of 33

**Notes:** The answer to the vote: B, slightly different. DVFE with N−1 = 2,198 worker dummies recovers 0.2103 exactly. Modern software prefers absorption purely for speed: about 2,200 dummies still run fast, but at N = 100,000 the dummy spec is prohibitive while absorbed FE stays trivial. The FDFE +0.001 gap is the common time trend: FD without an intercept returns 0.2103, and adding a year effect to FE reproduces FD with an intercept (0.2113) — that is two-way FE, next.

---

## 31 — ★ N11 — Quiz: match pairs (CORE, ~1 min)

**Prompt:** Match each fixed-effects recipe to what it does

- First differences ↔ Subtract the 2010 row from the 2012 row
- Within (demeaning) ↔ Subtract the mean of each worker
- Dummy-variable FE ↔ Add one dummy per worker, 2,198 in all
- Absorbed FE (| ID) ↔ The fast software route to the same estimate

**Answer:** First differences = Subtract the 2010 row from the 2012 row; Within (demeaning) = Subtract the mean of each worker; Dummy-variable FE = Add one dummy per worker, 2,198 in all; Absorbed FE (| ID) = The fast software route to the same estimate

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: first differences subtract periods, demeaning subtracts worker means, dummy-variable FE adds 2,198 worker dummies, and absorption is the fast computational route. With T = 2 all of them return 0.2103, except that FD with an intercept gives 0.2113 because the intercept absorbs the common wage trend.

---

## 32 — ★ N12 — Quiz: short answer (CORE, ~5 min)

**Prompt:** Colab stop: run the notebook from the top through Section 10. What union coefficient does fixed effects print?

**Answer:** 0.2103

**Settings:** `{"timeToAnswer": 300, "fastAnswerGetMorePoint": true}`

**Notes:** The single live-coding stop, about five minutes. Students open the Google Colab button on the post (https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_panel_intro/notebook.ipynb) and run the cells from the top through Section 10, Within / Fixed effects. The first cell installs pyfixest and linearmodels, and Section 4 downloads the data from GitHub, so students who started the install at the beginning of class finish first. The cell prints Union coefficient: 0.2103 (SE 0.0812) and, on the next line, the FD slope without an intercept, also 0.2103. Type the answer with four decimals. Students who finish early can explain to a neighbor why the two printed numbers agree.

---

## 33 — Cue slide (Before you look)

**Title:** Before you look: where does two-way FE land?

**Image page:** 18 of 33

**Background:** `#1a3a8a`

**Notes:** Ask the room to pick before the code. Answer on the next slide: A. With T = 2 the year effect plays exactly the role of the FD intercept, so two-way FE equals FD with an intercept to six decimals. (AhaSlides interactive I4 follows.)

---

## 34 — ★ I4 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** FE gave 0.2103 and FD gave 0.2113. Where will two-way FE land?

- A. Exactly equal to FD, 0.2113  ← CORRECT
- B. Equal to FE, 0.2103
- C. Somewhere else

**Answer:** A. Exactly equal to FD, 0.2113

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A. Two-way FE gives 0.2113, identical to FD with an intercept to six decimals. With T = 2 the year effect plays exactly the role of the FD intercept, so the gap between FD and one-way FE closes. The next slide shows the code and output.

---

## 35 — Content

**Title:** Two-way FE absorbs year shocks and lands at 0.2113 — exactly first differences

**Image page:** 19 of 33

**Notes:** The answer to the vote: A. TWFE = 0.2113, identical to FD with an intercept: with T = 2 the two coincide exactly, while one-way FE (0.2103) equals FD without an intercept. The 0.001 gap is the common time trend that the year effect and FD's intercept both absorb. You cannot identify the effect of something that does not change within a worker — which is why applied researchers reach for CRE/Mundlak when they want within identification AND coefficients on time-invariant variables.

---

## 36 — ★ N13 — Quiz: true or false (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Two-way fixed effects can estimate the wage gap between women and men.

**Answer:** False

**Notes:** Answer: False. Being female never changes within a worker, so the worker effect absorbs it silently, exactly like schooling. The female penalty of −27.3 log points comes from the cross-sectional camp (POLS, RE, CRE), which is one reason researchers reach for CRE when they want both kinds of coefficient.

---

## 37 — Content

**Title:** Random effects bets on no-correlation — and is pulled toward POLS at 0.109

**Image page:** 20 of 33

**Notes:** RE treats α_i as a random draw uncorrelated with the regressors and uses GLS to blend within and between efficiently. Here it lands at 0.109, squarely between POLS (0.075) and FE (0.210), leaning toward POLS because within variation is thin. The SE (0.030) is striking — but that precision is real only if individual effects are uncorrelated with union status. The FE–POLS gap suggests they are not, so the precision is bought with bias.

---

## 38 — ★ N14 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: why does random effects land closer to pooled OLS than to fixed effects?

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Spin and ask the student to explain the slide in their own words. A good answer: random effects is a precision-weighted blend of the between and within estimators, and only 6.1% of the union variance is within workers, so the between comparison gets most of the weight. That is why RE lands at 0.109, much closer to 0.075 than to 0.210.

---

## 39 — Cue slide (Before you look)

**Title:** Before you look: what do robust SEs do to the Hausman statistic?

**Image page:** 21 of 33

**Background:** `#1a3a8a`

**Notes:** Ask: the robust FE SE grows much more than the robust RE SE, so what happens to the denominator V_FE − V_RE? Answer on the next slide: B. H falls from 5.62 (p = 0.018) to 1.79 (p = 0.180). But the plug-in number is not a valid test, because with robust errors V_FE − V_RE is no longer the variance of the difference. (AhaSlides interactive I5 follows.)

---

## 40 — ★ I5 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Plug the robust SEs (0.0812 for FE, 0.0299 for RE) into the Hausman formula instead of the classical ones. What happens to H?

- A. Rise, so the test rejects more strongly
- B. Fall enough to flip the verdict  ← CORRECT
- C. Fall, but still reject at 5%

**Answer:** B. Fall enough to flip the verdict

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B. H falls from 5.62 (p = 0.018) to 1.79 (p = 0.180), so the verdict flips from rejecting RE to not rejecting it. The robust FE standard error grows much more than the robust RE one, which inflates the denominator V_FE − V_RE. But stress that the plug-in number is not a valid test: with robust errors V_FE − V_RE is no longer the variance of the difference. The next slide shows the textbook test; the Mundlak alternative comes right after.

---

## 41 — Content

**Title:** The textbook Hausman test rejects RE, if the errors are classical

**Image page:** 22 of 33

**Notes:** The answer to the vote: B, the verdict flips, but only in an invalid test. β_FE − β_RE = +0.101. The textbook test (Stata's hausman fe re, R's phtest) uses classical variances because its formula relies on RE being fully efficient under the null. That gives H = 5.62 on 1 df, p = 0.018: reject. The robust SEs are much larger, especially for FE (0.0812 vs 0.0509), which suggests the classical assumption is doubtful. Plugging them in flips the verdict (H = 1.79, p = 0.180), but the result has no chi-square distribution. With robust errors, the valid check is the Mundlak test, next.

---

## 42 — Cue slide (Before you look)

**Title:** Before you look: what happens to the union coefficient in CRE?

**Image page:** 23 of 33

**Background:** `#1a3a8a`

**Notes:** Ask the room to commit. Answer on the next slide: A, exactly 0.2103. Once the worker mean of union status is controlled for, the only variation left in union is within variation, so RE has nothing else to use; this holds for any RE weight θ. (AhaSlides interactive I6 follows.)

---

## 43 — ★ I6 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** Random effects gave 0.1092. After adding union_bar, the worker mean of union status, what is the coefficient on union?

- A. It equals the FE value, 0.2103  ← CORRECT
- B. It stays near 0.11
- C. It moves between 0.11 and 0.21

**Answer:** A. It equals the FE value, 0.2103

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A, exactly 0.2103. Once the worker mean of union status is controlled for, the only variation left in union is within variation, so random effects has nothing else to use. This holds for any RE weight θ, which is the Mundlak (1978) result; the post proves it with FWL. The next slide shows the Mundlak model and its test.

---

## 44 — Content

**Title:** Mundlak recovers the FE coefficient and flags negative selection

**Image page:** 24 of 33

**Notes:** The answer to the vote: A. Mundlak (1978) proved β here is numerically identical to FE — and it is, to four decimals (0.2103). The γ on union_bar is −0.144, p = 0.072: workers with higher average union exposure earn less even after conditioning on within changes, consistent with lower-wage workers selecting into unions. In this balanced panel γ is exactly Between minus FE (0.0662 − 0.2103). Unlike the plug-in Hausman number, this test stays valid with robust SEs; clustered by worker it gives p = 0.106. So: the textbook test rejects, the robust test is borderline.

---

## 45 — ★ N15 — Quiz: categorise (CORE, ~1 min)

**Prompt:** Sort the estimators by the variation they use

- **Cross-sectional camp:** Pooled OLS, Between, Random effects
- **Within camp:** First differences, Fixed effects, Two-way fixed effects

**Answer:** Cross-sectional camp: Pooled OLS, Between, Random effects; Within camp: First differences, Fixed effects, Two-way fixed effects

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: pooled OLS, between and random effects lean on comparisons across workers; first differences, fixed effects and two-way FE use only changes within a worker. CRE was left out on purpose: it is the bridge, with a within coefficient equal to FE inside a random-effects model. Ask where the room would put it and why.

---

## 46 — ★ N16 — Leaderboard (CORE, ~0.5 min)

**Answer:** none (unscored)

**Notes:** End of Act II checkpoint. Read the top five aloud, then check the Q&A for questions that collected upvotes before moving on to the resolution.

---

## 47 — Act divider

**Title:** The Resolution

**Image page:** 25 of 33

**Background:** `#00d4c8`

---

## 48 — ★ N17 — Quiz: correct order (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Order these union estimates from smallest to largest

1. Between estimator
2. Pooled OLS
3. Random effects
4. Fixed effects

**Answer:** Between estimator → Pooled OLS → Random effects → Fixed effects

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: Between 0.0662, pooled OLS 0.0750, random effects 0.1092, fixed effects 0.2103. The order is the whole story: the more an estimator leans on comparisons across workers, the smaller the premium, which is the signature of negative selection into union jobs. The next slides make that case.

---

## 49 — Content

**Title:** Within-worker, joining a union pays 0.21 log points — nearly triple the naive 0.075

**Image page:** 26 of 33

**Background:** `#141413`

**Notes:** The Act-III payoff. Cross-sectional methods say 7–11 log points; within methods say about 21. The factor-of-three gap is the empirical signature of selection on unobservables: higher-ability workers are less likely to be unionized in this sample, so cross-sectional comparisons understate the within-worker payoff to *joining* a union. Caveat for Q&A: the 0.21 rests on 73 switchers and is specific to 2010–2012; with all five waves two-way FE falls to 0.040 (SE 0.026).

---

## 50 — Content

**Title:** Two camps, three-fold apart — and the gap is selection, not noise

**Image page:** 27 of 33

**Notes:** The payoff table. The seven methods cluster into two camps roughly three-fold apart; TWFE equals FDFE exactly because T = 2. Cross-sectional standard errors are 2.6–3.5× smaller, but these methods identify a biased (under our hypothesis) parameter; within methods are noisier but cleaner under weaker assumptions. Reporting both estimands side by side is more honest than picking one.

---

## 51 — ★ N18 — Spinner wheel (OPTIONAL, skip if behind, ~1.5 min)

**Prompt:** Cold call: why are the within-camp standard errors so much larger?

**Answer:** none (unscored)

**Settings:** `{"metadata": {"autoFillParticipantName": true}}`

**Notes:** Spin and ask. A good answer: the within estimators throw away every comparison across workers and keep only the 73 switchers, so they estimate the premium from a thin 6.1% slice of the union variance. The cross-sectional standard errors are 2.6 to 3.5 times smaller, but they buy precision with bias if selection is real.

---

## 52 — Cue slide (Before you look)

**Title:** Before you look: what happens to the age coefficient under two-way FE?

**Image page:** 28 of 33

**Background:** `#1a3a8a`

**Notes:** Ask, then hint: between 2010 and 2012 most workers age by exactly two years. Answer on the next slide: B, it turns negative (−0.0576). The year effect absorbs the two-year step for 1,885 workers, so the coefficient rests on the 314 whose interviews were not exactly two years apart: fragile, not an age profile. (AhaSlides interactive I7 follows.)

---

## 53 — ★ I7 — Quiz: pick answer (CORE, ~1 min)

**Prompt:** With controls, age raises log wages by about 0.02 per year in pooled OLS. What happens to the age coefficient under two-way FE?

- A. Stay near +0.02
- B. Change sign  ← CORRECT
- C. Shrink toward zero

**Answer:** B. Change sign

**Settings:** `{"timeToAnswer": 30, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B. It turns negative, −0.0576. Between 2010 and 2012, age rises by exactly two years for 1,885 of the 2,199 workers, which the year effect absorbs completely, so the coefficient is identified only by the 314 workers whose age rose by one or three years, mostly because of interview timing. Read it as fragile, not as an age profile of wages. The next slide shows all four models with controls.

---

## 54 — Content

**Title:** Adding controls leaves the two-camp gap intact

**Image page:** 29 of 33

**Notes:** The answer to the vote: B, the within age coefficient turns negative. With age, schooling, female, and year effects in every model, POLS drops to 0.057 (controls absorb some confounding) and RE to 0.088, but TWFE and CRE both report 0.213; CRE reproduces the TWFE coefficients exactly. Schooling (+11.1 log pts/yr) and the female penalty (−27.3 log pts) are stable across POLS/RE/CRE because they are time-invariant — and absorbed by FE. The within age coefficient (TWFE and CRE) flips to −0.058, a fragile estimate (age is not exactly collinear with the year dummy, but only the 314 workers whose age did not rise by exactly two years identify it), not a real age–wage relationship.

---

## 55 — Content

**Title:** Does FE make this causal? No — strict exogeneity still carries the weight

**Image page:** 30 of 33

**Notes:** Steelman, don't strawman. They remove time-invariant confounders, not time-varying ones — a promotion that coincides with joining a union still biases the within estimate. POLS and Between carry no causal reading absent unconfoundedness. Fixed effects discipline the comparison; they do not relax identification. The within estimand is local — it is identified off the 73 of 2,199 workers (3.3%) who switched union status (36 joined, 37 left) — and rests on strict exogeneity conditional on α_i. Reporting both the within and cross-sectional estimands, as the post does, is the honest move.

---

## 56 — ★ N19 — 2x2 matrix (OPTIONAL, skip if behind, ~2 min)

**Prompt:** Where does each threat to the within estimate land?

X axis: How likely in real data · Y axis: How much bias it causes
- A promotion that coincides with joining a union
- Fixed ability differences across workers
- Only 73 switchers
- Joiners and leavers respond differently
- Only two waves, 2010 and 2012

**Answer:** none (unscored)

**Notes:** Unscored; it sets up a discussion. The reference answers come from the slides. A time-varying shock such as a promotion that coincides with joining biases every within estimator. Fixed ability differences are exactly what fixed effects remove, so they cause no bias here. Seventy-three switchers mean noise and a local estimand, not bias. Joiners (0.345) and leavers (0.081) respond differently, so the symmetric model averages two effects. With all five waves two-way FE falls to 0.040, so the two-wave number is fragile. Ask which dot the room placed furthest from these answers.

---

## 57 — ★ N20 — Idea board (OPTIONAL, skip if behind, ~3 min)

**Prompt:** A panel question from your research: unit, treatment, and a fixed confounder

Groups: Development and growth, Policy and public economics, Health, education and labor, Other fields

**Answer:** none (unscored)

**Notes:** Ask each student for one example in the form unit, treatment, fixed confounder (for example: districts, a cash-transfer rollout, local institutions). After two minutes, open the voting round and discuss the top two. For each, ask whether the treatment varies within units over time; if it does not, fixed effects cannot identify it.

---

## 58 — Content

**Title:** The 0.21 rests on 73 switchers and on two waves

**Image page:** 31 of 33

**Notes:** These are the post's Exercises 5 and 6. Each subsample has fewer than 40 switchers, so the asymmetry is noisy, but it warns that the symmetric within model averages two very different responses. With T = 5, FD and FE also stop coinciding (they weight the periods differently), and neither is significant at 5%. None of this makes the cross-sectional 0.075 right; it says the within answer is local and fragile.

---

## 59 — Content

**Title:** With robust errors, lead with CRE/Mundlak and its built-in test

**Image page:** 32 of 33

**Background:** `#141413`

**Notes:** CRE/Mundlak gives you three things in one regression: the FE coefficient on the time-varying treatment, the RE framework that retains schooling and gender, and a built-in specification test (the t-stat on the Mundlak term) that can be made robust to heteroskedasticity and clustering, which the Hausman formula cannot. Here the two tests disagree because they assume different errors; the honest summary is that the evidence against RE is suggestive, not conclusive. The cost — one extra regressor per time-varying covariate — is essentially free in modern software.

---

## 60 — ★ R1 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 1 of 4: fixed effects identify the union premium from which workers?

- A. Workers who are always in a union
- B. Workers who switch union status  ← CORRECT
- C. Workers who are never in a union

**Answer:** B. Workers who switch union status

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Final review round, question 1 of 4, with a 20-second timer. Answer: B. Only the 73 switchers (36 joined, 37 left) have a within-worker change in union status; for everyone else the worker effect absorbs union status completely.

---

## 61 — ★ R2 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 2 of 4: random effects is consistent only if the worker effect is

- A. constant over time
- B. larger than the idiosyncratic error
- C. uncorrelated with union status  ← CORRECT

**Answer:** C. uncorrelated with union status

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: C. Every model here assumes the worker effect is constant over time; random effects adds that it is uncorrelated with the regressors. The gap between FE (0.210) and RE (0.109) suggests that assumption fails in this panel.

---

## 62 — ★ R3 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 3 of 4: with T = 2, two-way fixed effects equals which estimator exactly?

- A. First differences with an intercept  ← CORRECT
- B. One-way fixed effects
- C. Pooled OLS

**Answer:** A. First differences with an intercept

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: A, both give 0.2113. The year effect in two-way FE plays the role of the intercept in the differenced regression. One-way FE (0.2103) equals FD without an intercept instead.

---

## 63 — ★ R4 — Quiz: pick answer (CORE, ~0.75 min)

**Prompt:** Review 4 of 4: with robust errors, which specification test stays valid?

- A. The textbook Hausman test
- B. The Mundlak term in CRE  ← CORRECT
- C. Neither

**Answer:** B. The Mundlak term in CRE

**Settings:** `{"timeToAnswer": 20, "fastAnswerGetMorePoint": true}`

**Notes:** Answer: B. The Hausman formula needs random effects to be fully efficient, which fails with heteroskedastic or clustered errors. The t-test on the Mundlak term can use robust or clustered standard errors; here it gives p = 0.072 robust and 0.106 clustered. End the round on this before the podium.

---

## 64 — ★ N21 — Leaderboard (CORE, ~0.5 min)

**Answer:** none (unscored)

**Notes:** Final podium for the quiz points of the whole class. Congratulate the top three; the prize raffle at the end gives everyone else a chance as well.

---

## 65 — Act divider

**Title:** Let the within variation, not the pooled average, tell you what a treatment does.

**Image page:** 33 of 33

**Background:** `#141413`

**Notes:** The single takeaway. When selection on unobservables is plausible, the gap between 0.075 and 0.210 is the whole story — and CRE/Mundlak is the specification that recovers the within answer while keeping the RE machinery and an honest specification test.

---

## 66 — ★ N22 — Poll (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Now: which union premium would you report?

- A. 7.5 log points, from pooled OLS
- B. 21 log points, from the within estimators
- C. Both, each with the question it answers

**Answer:** none (prediction)

**Settings:** `{"hasTimeLimit": true, "timeToAnswer": 30, "multipleChoice": false, "limitChoice": 1, "typeChart": "barChart", "showPercentage": true}`

**Notes:** The opening poll again. Put the two bar charts side by side. The lecture argues for C: 0.075 answers how union and non-union workers differ, 0.21 answers what joining a union does for the 73 switchers, and an honest report gives both with their assumptions.

---

## 67 — ★ N23 — Word cloud (OPTIONAL, skip if behind, ~1 min)

**Prompt:** Again, in one word: what can panel data do that a single cross-section cannot?

**Answer:** none (unscored)

**Settings:** `{"entriesPerParticipant": 2}`

**Notes:** The opening prompt again. A good outcome is a shift toward words such as within, difference, switchers, demean, or fixed effects.

---

## 68 — ★ N24 — Rating scale (CORE, ~1 min)

**Prompt:** After class: how confident are you now?

Scale 1 (Not at all) to 5 (Completely):
- I can explain the difference between within and between variation
- I can say which variation each panel estimator uses
- I can choose between fixed effects and random effects

**Answer:** none (unscored)

**Notes:** The same three statements as the opening scale. Compare the averages with the baseline aloud. The statement with the smallest gain is the one to revisit at the start of the next class.

---

## 69 — ★ N25 — Open ended (CORE, ~2 min)

**Prompt:** Exit ticket: what is still unclear about panel methods? One sentence.

**Answer:** none (unscored)

**Settings:** `{"imageSubmission": false, "layout": "grid"}`

**Notes:** The exit ticket. Responses are named, because names are required on join, so they can be followed up individually. Skim them after class and open the next session with the two most common points of confusion.

---

## 70 — ★ N26 — Duck race (CORE, ~1 min)

**Answer:** none (unscored)

**Notes:** Prize raffle. Every joined student becomes a duck and the winner is pure luck, so students who scored low on the quizzes still have a chance. Students pick a duck design on their phones before the start.

---
