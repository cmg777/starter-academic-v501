# AhaSlides deck — source of truth

**Presentation:** A Bridge, Two Rivers, and One Number That Settles It
**Subtitle:** What happens to a poor region when you finally connect it to a rich one
**Author:** Carlos Mendez — Nagoya University (GSID)
**Source deck:** `../slides/slides.qmd` (Quarto reveal.js, 30 content slides)
**Post:** https://carlos-mendez.org/post/python_bridge_impact/
**Language:** English only
**Public view link:** https://presenter.ahaslides.com/share/1789007350719-n7drztywna
**Editor:** https://presenter.ahaslides.com/presentation/10040213 (ID 10040213, join code Q6U4S)

## Composition

| Kind | Count |
|---|---|
| Title | 1 |
| Act dividers (heading slides) | 5 |
| Content slides (1:1 with `slides.qmd`) | 30 |
| Interactive slides (new) | 8 |
| **Total** | **44** |

All 30 content slides from `slides.qmd` are carried over with their original titles, in
their original order, inside their original acts. Nothing was removed or reordered. The 8
interactive slides are **insertions** placed at points where the Quarto speaker notes
already instruct the presenter to work the room.

## How this file is used now

The live deck's **36 content slides are images** of the real Quarto slides (rendered to
PDF and imported), so the original typography, tables, maths, emphasis and act-divider
colours are preserved exactly. See `README.md`.

That changes what this file is for. It remains the source of truth for:

- **All speaker notes.** They cannot be attached to imported slides, so `deck.md` is the
  only place they live — keep it open on a second screen while presenting.
- **The 8 interactive slides** — question, options, correct answer, points — which are
  still created natively through the MCP from `deck.json`.
- **The slide inventory and running order**, which the generators validate.

The per-slide bullet text below is the editorial record of what each Quarto slide says.
It is no longer what the audience sees (they see the slide image), so the old caveats
about lost bold, flattened tables and Unicode maths no longer apply to the live deck.
The `**DARK**` markers and divider colours below record the original design, which the
images now reproduce faithfully.

## Figure map (9 uploads)

Upload each once to the AhaSlides media library, then attach to the slide named.
Source files sit one level up, in `content/post/python_bridge_impact/`.

| # | File | Slide |
|---|---|---|
| 1 | `python_bridge_impact_01_hinterland_geography.png` | 11 — The map draws itself without a shapefile |
| 2 | `python_bridge_impact_07_did_2x2.png` | 13 — The whole idea, in one picture |
| 3 | `python_bridge_impact_10_event_study_nightlights.png` | 16 — Every period gets its own coefficient |
| 4 | `python_bridge_impact_09_covariate_balance.png` | 20 — The reweighting closes a gap |
| 5 | `python_bridge_impact_12_heterogeneity_by_distance.png` | 27 — The average effect hides almost everything |
| 6 | `python_bridge_impact_13_public_goods_placebo.png` | 31 — Could it just have been politics? |
| 7 | `python_bridge_impact_15_honest_did_sensitivity.png` | 32 — How wrong could parallel trends be? |
| 8 | `python_bridge_impact_19_reproduction_audit.png` | 36 — All 122 published coefficients reproduce |
| 9 | `python_bridge_impact_18_trimL_forensics.png` | 38 — One undefined macro turned 0.109 into 1.064 |

---

# Slides

## 1 — Title

**Type:** title
**Title:** A Bridge, Two Rivers, and One Number That Settles It
**Subtitle:** What happens to a poor region when you finally connect it to a rich one
**Byline:** Carlos Mendez · Nagoya University (GSID) · carlos-mendez.org

**Notes:** Key results to have in your head before you start: +5.9% population density
(long run), −1.2 pp manufacturing share (long run), +26.5% rice yield (farthest from the
bridge).

---

## 2 — Act I divider

**Type:** heading
**Title:** The Question
**Subtitle:** Act I
**Background:** `#d97757`

---

## 3 — Content

**Title:** A country cut into three pieces by two of the largest rivers on earth

**Bullets:**
- Bangladesh is a delta. Two rivers cut it into three.
- The **Jamuna** — the local name for the Brahmaputra, ninth in the world by discharge — separated the poor northwest from Dhaka.
- The **Ganges**, locally the **Padma**, cut off the south.
- **TAKEAWAY:** Two isolated hinterlands. One capital. And, until 1998, no bridge over either river.

**Notes:** Open with the geography, because the geography is the research design.
Bangladesh is a delta, and two enormous rivers slice it into three. The northwest and the
south are each cut off from Dhaka. That is not a metaphor — before 1998 there was no
bridge over either.

---

## 4 — Content

**Title:** In June 1998 one of the two got a bridge

**Bullets:**
- The Jamuna (Bangabandhu) Bridge — 4.8 km, about US$985 million, opened June 1998.
- Connected **26 million people**, a quarter of the 1991 population
- Freight costs fell roughly **50%**
- Ferry crossing: **3 hours**, and up to **36 hours** waiting at Eid
- Truck, Bogra to Dhaka: **20 hours → 6 hours**
- **TAKEAWAY:** This is about as close to a discontinuous change in trade costs as the real world offers.

**Notes:** The magnitudes here matter for the rest of the deck. This was not a marginal
improvement to an existing road. It was a discontinuous change in the cost of reaching
the capital.

---

## 5 — ★ INTERACTIVE 1 — Poll (no correct answer)

**Type:** multiple-choice poll · single selection · results as bar chart
**Question:** A poor region finally gets a bridge to the rich capital. What happens to its factories?

**Options:**
- A. They boom — new markets, new competition
- B. They hollow out — the capital captures everything
- C. They shrink, but the region still ends up better off
- D. Not much changes

**Correct answer:** none — this is a prediction poll, not a quiz.

**Notes:** Run this BEFORE naming the three theories on slide 6, so the room commits
before it has vocabulary to hide behind. Do not comment on the split. Screenshot the bar
chart, or leave the slide open in another tab — you come back to it at slide 25, and the
callback only works if you can show what the room originally said. In most audiences B
wins by a wide margin, and B is the answer the data reject.

---

## 6 — Content

**Title:** Economists disagree, sharply, about what should happen next

**Bullets:**
- **Big push.** Integration raises competition and efficiency. The lagging region revives.
- **Backwash.** Myrdal 1957, Krugman 1991. With increasing returns, the *core* captures the gains. The periphery is hollowed out.
- **Comparative advantage.** The region specialises in what it is relatively good at. Factories leave — as specialisation, not decay.
- **TAKEAWAY:** The policy implication flips completely between the first two. And the third looks exactly like the second.

**Notes:** Three theories, and this is the crux of the whole deck. Do not rush this slide.
The audience needs to feel that these are genuinely opposed predictions, not variations
on optimism.

---

## 7 — Content · DARK · was a table

**Title:** Two of the three theories make the same prediction about factories
**Background:** `#141413`

**Bullets:** *(original table: Theory × Manufacturing × Population)*
- **Big push** — manufacturing up or flat, population up
- **Backwash** — manufacturing **down**, population **down**
- **Comparative advantage** — manufacturing **down**, population **up or flat**
- **TAKEAWAY:** Measure only factories and you cannot tell decline from specialisation. The two stories separate on **people**.

**Notes:** This is the trap. A study that measured only manufacturing would see the share
fall, write the word "deindustrialisation," and declare backwash. It would be wrong, and
it would have no way of knowing.

---

## 8 — Act II divider

**Type:** heading
**Title:** The Design
**Subtitle:** Act II
**Background:** `#6a9bcc`

---

## 9 — Content

**Title:** The other hinterland is the comparison group, and it stayed isolated

**Bullets:**
- **Treated:** 123 upazilas in the Jamuna hinterland.
- **Comparison:** 125 upazilas in the Padma hinterland.
- The Padma hinterland had the same problem — cut off by a great river — and no solution. Its own bridge was not begun until **2015**.
- **TAKEAWAY:** The data end in 2013. The comparison region stayed isolated for the entire study window.

**Notes:** The Padma bridge is what makes this design work. It was needed, it was
discussed since before independence, and it was not built. Construction started in 2015 —
two years after the data end.

---

## 10 — Content

**Title:** Which river got a bridge first was decided by politics, not economics

**Bullets:**
- President Ershad's base: **Rangpur** — Jamuna hinterland
- Prime Minister Khaleda Zia's base: **Bogra** — Jamuna hinterland
- The Padma bridge began only under a PM whose home district is **Gopalganj** — Padma hinterland
- Latitude separation between the two hinterlands: **under 3 degrees**. Florida spans more than five.
- **TAKEAWAY:** Idiosyncratic political geography, not economic prospects.

**Notes:** This is the identification argument. If bridge priority had tracked economic
shocks in the northwest, and those shocks persisted, parallel trends would fail. The
historical record says it tracked personal geography instead.

---

## 11 — Content · IMAGE

**Title:** The map draws itself without a shapefile
**Image:** `python_bridge_impact_01_hinterland_geography.png` (full bleed, no body text)

**Notes:** Every upazila plotted by its distance to each of the two crossings. The
equidistance diagonal separates the two hinterlands cleanly, and the excluded
Dhaka-Chittagong core sits away from both. Note the symmetry: both hinterlands span 8 to
270 km from their own river.

---

## 12 — Content · MATH

**Title:** Difference-in-differences is four numbers and two subtractions

**Body (headline line, set large and centred):**
`τ̂ = ( Ȳ_Jamuna,post − Ȳ_Jamuna,pre ) − ( Ȳ_Padma,post − Ȳ_Padma,pre )`

**Bullets:**
- The **first** difference removes anything permanent about a place — its soil, its size, its distance from the capital.
- The **second** removes anything that hit the whole country — a fertiliser subsidy, a monsoon, a satellite recalibration.
- **TAKEAWAY:** What survives both subtractions is the bridge.

**Notes:** Always show the hand computation before the estimator. If the regression later
disagrees wildly with this, one of them is wrong and you need to know which.

---

## 13 — Content · IMAGE

**Title:** The whole idea, in one picture
**Image:** `python_bridge_impact_07_did_2x2.png` (full bleed, no body text)

**Notes:** Treated group up 0.072 log points, comparison up 0.008. The teal dashed line is
where the treated group would have landed at the comparison group's growth rate. The gap
is the estimate: 0.064.

---

## 14 — Content · MATH

**Title:** The assumption is about trends, not levels — and it is untestable

**Body (headline line, set large and centred):**
`E[ Y_it(0) − Y_i,t−1(0) | Jamuna ] = E[ Y_it(0) − Y_i,t−1(0) | Padma ]`

**Bullets:**
- Two hikers on parallel ridges, one a hundred metres higher. As long as the *terrain* runs parallel, you can measure what a helicopter lift did to one of them.
- **TAKEAWAY:** It says nothing about levels. And because it describes a world that never happened, no test can confirm it.

**Notes:** Spend a moment on this. The most common misunderstanding in applied DiD is that
the two groups have to look alike. They do not. They have to *move* alike.

---

## 15 — ★ INTERACTIVE 2 — Quiz (scored)

**Type:** multiple choice quiz · single correct · 1000 points · 30 second limit
**Question:** Which of these would actually violate parallel trends?

**Options:**
- A. The Jamuna hinterland was poorer than the Padma hinterland in 1992
- B. The two regions had very different population densities before the bridge
- C. **A fertiliser subsidy aimed only at the northwest, starting in 1998** ← CORRECT
- D. The two hinterlands are more than 100 km apart

**Notes:** A and B are the misconception slide 14 just warned about — both are statements
about *levels*, and neither violates anything. D is irrelevant. Only C describes a shock
that changes one group's *trend* at the moment of treatment. If a large share of the room
picks A or B, go back to slide 14 and run the hikers analogy again before moving on;
everything in Act III depends on the room having this straight.

---

## 16 — Content · IMAGE · DARK

**Title:** Every period gets its own coefficient, and the ones before the bridge are a test
**Background:** `#141413`
**Image:** `python_bridge_impact_10_event_study_nightlights.png` (full bleed, no body text)

**Notes:** This is the most persuasive figure in the whole analysis, and the original paper
never drew it. Pre-bridge coefficient sits on zero. Then a monotone climb across all five
post-bridge periods.

---

## 17 — Content

**Title:** What would a confounder have to look like?

**Bullets:**
- Pre-bridge: **−0.008** (se 0.017). On zero.
- Then: **+0.7% → +3.3% → +5.0% → +8.3% → +12.8%**
- A confounder producing this would have to be **absent before June 1998**, appear at exactly the right moment, and then **grow steadily for fifteen years** without reversing.
- **TAKEAWAY:** Such things exist. The list is short.

**Notes:** Make the audience do the work here. Ask them to design a confounder that
produces this shape. The list of candidates is short, and every one of them is easier to
argue about with this figure on screen.

---

## 18 — ★ INTERACTIVE 3 — Word cloud

**Type:** word cloud · 2 entries per participant · ~25 character limit
**Question:** Name something absent before June 1998, that appeared exactly then and grew for fifteen years — and is not the bridge.

**Notes:** This is slide 17's speaker note turned into a slide: the qmd literally says
"Make the audience do the work here." Give it 90 seconds. The point is not to find a real
confounder — it is for the room to discover how hard the shape is to fake. Expect
"mobile phones", "microfinance", "garment boom", "China". Take the two most popular and
ask out loud whether each one stops at the Jamuna. They generally do not — they are
national, so the Padma hinterland differences them out. That is the whole argument, and
the room builds it instead of being told it.

---

## 19 — Content

**Title:** Reweight the comparison group so it resembles the treated one

**Bullets:**
- **LWDR** — weight each comparison unit by its odds of having been treated
- **KOBDR** — Kline's Oaxaca-Blinder projection of the treated covariate mean onto the comparison design
- Both put weight **exactly 1** on treated units. That is what makes them **ATT** weights.
- Both also enter the covariates in the regression — hence *doubly* robust
- **TAKEAWAY:** A main chute and a reserve. Only if both models fail does the estimate fail. But two chutes do not help if you jumped over the wrong country.

**Notes:** Two doubly robust estimators, both rebuilt by hand in NumPy for the tutorial.
The key line in both is that treated units get weight exactly one — that is what makes
them ATT weights rather than ATE weights.

---

## 20 — Content · IMAGE

**Title:** The reweighting closes a gap that was genuinely open
**Image:** `python_bridge_impact_09_covariate_balance.png` (full bleed, no body text)

**Notes:** Distance starts at a standardised difference of 0.40 — well above the 0.10 rule
of thumb — because Jamuna upazilas sit systematically farther from their bridge foot than
Padma upazilas do from theirs. KOBDR takes it to 0.054.

---

## 21 — Act III divider

**Type:** heading
**Title:** What The Data Say
**Subtitle:** Act III
**Background:** `#00d4c8`

---

## 22 — Content · was a table

**Title:** The bridge raised activity across the board

**Bullets:** *(original table: Outcome × Effect × se)*
- Nighttime lights — **+10.9%** (se 0.022)
- Rice yield — **+6.3%** (se 0.023)
- Services employment share — **+2.3 pp** (se 0.005)
- Manufacturing employment share — **−1.0 pp** (se 0.004)
- Population density — +2.5% (not significant)
- That manufacturing number looks negligible. The 1991 baseline share was **2.8%**.
- **TAKEAWAY:** A 1.0 point fall removes roughly a third of the sector.

**Notes:** Read these as the average over the whole post-bridge period, under the paper's
preferred doubly robust estimator. Note the manufacturing number looks small until you
check the base.

---

## 23 — ★ INTERACTIVE 4 — Quiz (scored)

**Type:** multiple choice quiz · single correct · 1000 points · 30 second limit
**Question:** Pooled over the whole post-bridge period, population density is +2.5% and not significant. Most likely reason?

**Options:**
- A. The bridge genuinely did not change where people live
- B. **It averages a negative short run and a positive long run** ← CORRECT
- C. The sample is too small to detect an effect
- D. Population density is measured too noisily

**Notes:** Ask this BEFORE revealing slide 24 — the whole payoff of that slide is watching
a null turn into a sign reversal. A is the honest reading of the pooled number and most
rooms pick it, which is exactly the lesson: an insignificant average is not evidence of
no effect. C is worth a word — 248 upazilas is not a small sample.

---

## 24 — Content · DARK · was a table

**Title:** Then split the post-bridge period in two, and one outcome reverses sign
**Background:** `#141413`

**Bullets:** *(original table: Outcome × Short run × Long run)*
- Nighttime lights — short run +4.9%, long run **+11.2%**
- Rice yield — short run +1.2% (n.s.), long run **+7.9%**
- **Population density — short run −2.5%, long run +5.9%**
- Manufacturing share — short run −0.6 pp (n.s.), long run **−1.2 pp**
- Services share — short run **+2.0 pp**, long run **+2.4 pp**
- **TAKEAWAY:** People left first. Then more came than had left.

**Notes:** This is the payoff slide. The pooled density effect was insignificant because it
averaged a negative and a positive. Migration and adjustment take time.

---

## 25 — ★ INTERACTIVE 5 — Quiz (scored)

**Type:** multiple choice quiz · single correct · 1000 points · 30 second limit
**Question:** Manufacturing fell — backwash and comparative advantage both predicted that. Which single extra outcome tells them apart?

**Options:**
- A. Rice yield
- B. Nighttime lights
- C. **Population density** ← CORRECT
- D. Services employment share

**Notes:** THE callback slide. Before revealing the answer, bring up the slide 5 poll
results and show the room what it predicted an hour ago. Then reveal C and move straight
to slide 26. B is the tempting distractor — lights are the headline outcome of the paper,
but both theories are content with lights rising. D is closer than it looks and worth
naming out loud: services rising is consistent with both stories too. Only *people*
separate them, and that is the entire argument of the deck.

---

## 26 — Content

**Title:** The discriminating test

**Bullets:**
- Manufacturing fell **1.2 percentage points**. Backwash predicted that. So did comparative advantage.
- Backwash *also* requires the region to be **emptying** — capital and labour both leaving for the core.
- Population density: **+5.9%**, se 0.016, significant at the 0.1% level.
- **TAKEAWAY:** The region gained people while losing factories. **Backwash is rejected.** The Jamuna hinterland did not decline — it specialised.

**Notes:** Now close the loop opened in Act I. Manufacturing fell, which both theories
predicted. Density rose, which only one of them can accommodate.

---

## 27 — Content · IMAGE

**Title:** The average effect hides almost everything interesting
**Image:** `python_bridge_impact_12_heterogeneity_by_distance.png` (full bleed, no body text)

**Notes:** Split by distance tercile and the agriculture and services rows reverse sign
across bands. Near the bridge, labour moves INTO agriculture. Far from it, out of
agriculture and into services, three times harder.

---

## 28 — ★ INTERACTIVE 6 — Quiz (scored)

**Type:** multiple choice quiz · single correct · 1000 points · 20 second limit
**Question:** Long-run rice yield rose in every distance band. Which band gained the most?

**Options:**
- A. The upazilas nearest the bridge
- B. The middle band
- C. **The upazilas farthest from the bridge** ← CORRECT (+26.5%)

**Notes:** Slide 29's speaker note says "Ask the audience to explain it before you do" —
this is that ask, made votable. Nearly every room picks A, because nearest obviously
gained the largest *proportional* cut in travel time (about 40%, against 17% at the far
end). Reveal C, let the contradiction sit for a beat, then go to slide 29 and 30. Do not
explain it yet — slide 30 is the explanation and it lands much harder after the room has
been wrong.

---

## 29 — Content · was a table

**Title:** The gains land at the end of the line, not next to the bridge

**Bullets:** *(original table: Outcome, long run × Nearest × Middle × Farthest)*
- Rice yield — nearest +4.9%, middle +6.5%, **farthest +26.5%**
- Services share — nearest **−2.6 pp**, middle +1.7 pp, **farthest +5.9 pp**
- Agriculture share — nearest **+3.2 pp**, middle +0.8 pp, **farthest −5.7 pp**
- But the nearest upazilas got the **largest** proportional cut in travel time — about 40%, against 17% at the far end.
- **TAKEAWAY:** Why do the distant places gain more?

**Notes:** The counterintuitive result. Ask the audience to explain it before you do.

---

## 30 — Content

**Title:** Because trade responds to the level of the barrier, not the percentage change in it

**Bullets:**
- A **40%** cut on a ten-dollar taxi ride saves four dollars.
- A **17%** cut on a five-hundred-dollar flight saves **eighty-five**.
- Upazilas near the bridge foot were already reasonably connected — the ferry was an inconvenience, not a wall.
- Upazilas 250 km out were close to **autarky**, where fertiliser rarely arrived and rice rarely left.
- **TAKEAWAY:** An evaluation reporting only the average tells a minister to build near the demand centre. The heterogeneity says the payoff was at the end of the line.

**Notes:** The taxi-versus-flight analogy lands well. Give it a beat.

---

## 31 — Content · IMAGE · DARK

**Title:** Could it just have been politics?
**Background:** `#141413`
**Image:** `python_bridge_impact_13_public_goods_placebo.png` (full bleed, no body text)

**Notes:** The rival explanation: a prime minister with roots in the Jamuna hinterland
simply sent more schools, clinics and electricity there. Twenty-one estimates, zero
significant at 5 percent. The closest is high schools getting FARTHER away — wrong sign
for the story.

---

## 32 — Content · IMAGE

**Title:** How wrong could parallel trends be before this dies?
**Image:** `python_bridge_impact_15_honest_did_sensitivity.png` (full bleed, no body text)

**Notes:** Rambachan and Roth bounds. Be honest here: the breakdown value is just under M
equals 1. That is moderate, not spectacular, and saying so is more useful than dressing
it up.

---

## 33 — Content

**Title:** The honest answer is "moderately"

**Bullets:**
- Breakdown value: just under **M = 1**
- The post-bridge violation would have to be **as large as the largest pre-bridge violation** to overturn the result
- Randomisation inference over 500 placebo assignments: **not one draw** reaches the real estimate
- Placebo timing, moving the bridge one period early: **+0.008** against the real **+0.064**
- **TAKEAWAY:** A result surviving to M = 3 would be much stronger. One breaking at M = 0.3 would be fragile. This sits in between — and that is worth saying out loud.

---

## 34 — ★ INTERACTIVE 7 — Rating scale *(optional — drop for a 43-slide deck)*

**Type:** rating / scale · 1 to 5 · anonymous
**Question:** Knowing the result breaks down just under M = 1 — how convinced are you?
**Scale labels:** 1 = not convinced · 5 = fully convinced

**Notes:** Optional, and the first slide to cut if you are short of time. Its value is that
it makes "moderately" a number the room owns rather than a hedge the speaker offered. A
spread centred on 3 is the honest answer and worth saying so. Do not argue with a low
score — slide 33 already conceded the point, and conceding it twice is more persuasive
than defending it once.

---

## 35 — Act IV divider

**Type:** heading
**Title:** What Replication Taught Us
**Subtitle:** Act IV
**Background:** `#1a3a8a`

---

## 36 — Content · IMAGE · DARK

**Title:** All 122 published coefficients reproduce
**Background:** `#141413`
**Image:** `python_bridge_impact_19_reproduction_audit.png` (full bleed, no body text)

**Notes:** Every headline coefficient in the paper's four tables, reproduced in Python to
the printed three decimals. Maximum deviation 0.0005.

---

## 37 — Content

**Title:** Getting there took three specific pieces of care

**Bullets:**
1. **`ln(0)` must become missing, not `-inf`.** Twenty-four rows have zero rainfall. Stata drops them; NumPy keeps them, and nothing matches.
2. **The dof correction excludes the fixed effects.** Counting them inflates every standard error by about 20 percent.
3. **Distance terciles are cut at different points in different do-files.** One drops missing rows first; the other does not. That alone moves every heterogeneity coefficient in the third decimal.
- **TAKEAWAY:** None of these produce an error. All three produce wrong numbers quietly.

---

## 38 — Content · IMAGE · DARK

**Title:** One undefined macro turned 0.109 into 1.064
**Background:** `#141413`
**Image:** `python_bridge_impact_18_trimL_forensics.png` (full bleed, no body text)

**Notes:** The single most instructive thing in the replication package. An undefined Stata
global, a missing cutoff, and Stata's rule that any number is less than missing — and
every comparison unit silently loses its weight.

---

## 39 — Content

**Title:** Every step is legal Stata and nothing warns

**Bullets:**
- `global trimL` is never defined in that do-file
- `gen cut11 = r(p$trimL)` expands to `r(p)`, which does not exist → **cut11 is missing**
- `replace ipw4 = . if p < cut11` — in Stata, **any number is less than missing** → fires for **every** comparison unit
- The regression runs on **treated units only**
- It prints **1.064 (se 0.710)**
- **TAKEAWAY:** The tell is not the coefficient. It is the footer: **124 upazilas** where there should be **239**.

**Notes:** Walk the chain slowly. This is the part people remember.

---

## 40 — Content

**Title:** The paper's conclusions all survive — and that is the point

**Bullets:**
- Nothing found in the package changes a single conclusion of the paper.
- But notice what made each finding *possible*: the authors shipped the buggy output **and** the corrected output. They shipped the intermediate tables. They shipped the data.
- **TAKEAWAY:** A paper that published only its conclusions would be opaque on every count. This one is unusually **checkable** — which is exactly why a 122-of-122 reproduction was possible at all.

**Notes:** End this act generously and accurately. Nothing found here changes a conclusion.
And every one of these findings was only findable because the authors shipped a complete
package.

---

## 41 — Content · DARK

**Title:** Four things to take away
**Background:** `#141413`

**Bullets:**
1. **The assumption is about trends, not levels** — and no test can confirm it. Bound the violation instead of testing for it.
2. **Averages hide reversals.** Density was insignificant on average because it was negative then positive. Split by time and by space before believing a null.
3. **When two theories predict the same sign on your headline outcome, go find the outcome where they disagree.** Here it was one extra variable from a census already sitting there.
4. **Read the sample size first.** It is the only thing that would have caught the worst bug in this package.

---

## 42 — Content

**Title:** Everything here is runnable today

**Bullets:**
- **`diff-diff`** — the DiD engine used throughout: 2x2, TWFE, event study, HonestDiD, placebo suite
- **`pyfixest`** — the independent cross-check. All three engines agree to nine decimals.
- **Five datasets**, tidy CSVs, committed with the post
- **A Colab notebook**, a Quarto bundle, an interactive web app, and a Stata companion
- **The full post:** carlos-mendez.org/post/python_bridge_impact

**Notes:** Point at the resources and stop. Do not summarise again.

---

## 43 — Closing divider

**Type:** heading
**Title:** A region can lose its factories and still be better off. You only find that out if you measure the people too.
**Background:** `#00d4c8`

---

## 44 — ★ INTERACTIVE 8 — Open ended

**Type:** open ended · 1 submission per participant · moderated before display
**Question:** You open a replication package tomorrow. What is the first thing you check?

**Notes:** Closing slide, and the one that converts the deck into a habit. Slide 41's
fourth takeaway already gives the answer the deck argues for — read the sample size first
— so watch for whether anyone says it unprompted. Leave the responses on screen while
you take questions. If the room is small, read three aloud and say which one you would
actually do first.
