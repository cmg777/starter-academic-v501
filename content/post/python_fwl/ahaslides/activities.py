"""The AhaSlides audience layer of the FWL deck: every interactive slide.

This file is the source of truth for the 35 interactive slides (7 cue quizzes
kept from the first build, 28 added for the paid plan on 2026-10-06). The 34
content slides are images of ../slides/slides.qmd and are not defined here.

    python3 build_deck_json.py && python3 build_payload.py

Each activity is a dict:

    id        "I1".."I7" (cue quizzes) or "N1".."N25" and "R1".."R4" (added 2026-10-06)
    after     page of the imported PDF this slide follows (1..34)
    tier      "core" (always run) or "opt" (skip live if the class runs late)
    minutes   rough classroom time, voting plus discussion
    slide     the create_slides body, exactly as AhaSlides takes it, minus notes
    props     update_slide_properties settings (timers, points, spinner fill)
    notes     presenter notes; build_payload.py prefixes the tier and minutes
    cue       True for I1..I7: options must repeat the cue slide verbatim

Options of `poll` and `pick_answer_quiz` are written here in A, B, C order and
WITHOUT letters. build_payload.py letters them and sends them reversed, because
AhaSlides displays options in reverse payload order (see README.md).

Writing rules for new text (author preference): no em dashes, no contractions,
no possessive apostrophes. build_deck_json.py checks them.
"""

QUIZ_PROPS = {"timeToAnswer": 30, "fastAnswerGetMorePoint": True}
REVIEW_PROPS = {"timeToAnswer": 20, "fastAnswerGetMorePoint": True}

# Three statements rated before and after class, so the two scale slides compare.
CONFIDENCE = [
    "I can explain what controlling for a variable does to a coefficient",
    "I can predict the sign of omitted-variable bias",
    "I can draw a picture of a multivariate regression coefficient",
]
SCALE_CONFIG = {"low_label": "Not at all", "high_label": "Completely",
                "low_value": 1, "high_value": 5, "must_rate": True,
                "show_average": True, "show_mid_values": True}

WORD_PROMPT = "In one word: what does controlling for income do to a regression?"

COLAB = ("https://colab.research.google.com/github/cmg777/starter-academic-v501/"
         "blob/master/content/post/python_fwl/notebook.ipynb")

ACTIVITIES = [
    # ── Opening, after the title page ────────────────────────────────────────
    dict(id="N1", after=1, tier="core", minutes=1,
         slide={"slide_type": "qr_code"},
         notes="Students join at ahaslides.com with code VSXHY or by scanning "
               "the QR code. Names are required on join, so the leaderboard and "
               "the spinner wheels show real names. Keep this slide up while the "
               "room settles and watch the participant count rise."),
    dict(id="N2", after=1, tier="core", minutes=1.5,
         slide={"slide_type": "word_cloud", "heading": WORD_PROMPT},
         props={"entriesPerParticipant": 2},
         notes="Warm-up, no right answer. Expect words such as hold constant, "
               "remove, adjust, isolate or fix. Do not correct anyone yet. The "
               "same prompt returns at the very end of class, so keep this cloud "
               "in mind (or screenshot it) for the comparison."),
    dict(id="N3", after=1, tier="core", minutes=1,
         slide={"slide_type": "scale",
                "heading": "Before we start: how confident are you?",
                "options": [{"text": t} for t in CONFIDENCE],
                "scale_config": SCALE_CONFIG},
         notes="Baseline confidence on a 1 to 5 scale. The same three statements "
               "return after the exit ticket, so the class can see its own "
               "change. Read the averages aloud without comment."),
    dict(id="N4", after=1, tier="core", minutes=0.5,
         slide={"slide_type": "q&a",
                "heading": "Questions? Ask them here at any time during class"},
         notes="Q&A stays open on every slide (presentation setting: Q&A on all "
               "slides). Questions are anonymous unless students choose to sign "
               "them. Point out that upvoting a question pushes it to the top. "
               "Check the Q&A at each leaderboard break and at the end."),

    # ── Act I: the tension ───────────────────────────────────────────────────
    dict(id="I1", after=4, tier="core", minutes=1, cue=True,
         slide={"slide_type": "poll",
                "heading": "Regress sales on coupons alone. What sign will "
                           "the slope take?",
                "options": ["Positive, close to the true +0.2",
                            "Roughly zero", "Negative"]},
         props={"hasTimeLimit": True, "timeToAnswer": 30, "multipleChoice": False,
                "typeChart": "barChart", "showPercentage": True},
         notes="A pure prediction poll: there is no right answer to score, and "
               "nobody should be told they were wrong. The previous slide asked "
               "the question; this is where the room commits. Give 30 seconds, "
               "then close the vote and do not comment on the split. The true "
               "effect is +0.2, so most people expect the naive slope to land "
               "near it (A) or to wash out (B). The next slide answers it: C, "
               "negative, with a slope of −0.1059, because income confounds the "
               "comparison. If B draws votes, grant the fair part: the naive "
               "slope is not significant (p = 0.365). Its sign is still the "
               "opposite of the planted +0.2, and that is the point. The results "
               "return at the Simpson paradox slide in Act III, where the "
               "spinner cold call starts by showing the room this bar chart "
               "again."),

    # ── Act II: the investigation ────────────────────────────────────────────
    dict(id="N5", after=7, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/draw-answer-v2",
                "title": "Draw the arrows: what causes what among coupons, "
                         "income and sales?",
                "slide_attributes": {"config": {
                    "question": "Draw the arrows: what causes what among "
                                "coupons, income and sales?",
                    "allowMultipleSubmissions": False, "clearToken": 0}}},
         notes="Give 60 seconds. The target picture has three arrows: income to "
               "coupons, income to sales, and coupons to sales. Pick two or three "
               "drawings to discuss. Common slips are an arrow from sales to "
               "income, or a missing arrow from income to coupons. The next slide "
               "names income as the confounder that opens the backdoor path."),
    dict(id="N6", after=9, tier="core", minutes=1,
         slide={"slide_type": "categorise_quiz",
                "heading": "Sort each variable by its role in the coupon study",
                "options": [
                    {"name": "Treatment", "items": ["Coupon redemption rate"]},
                    {"name": "Outcome", "items": ["Monthly sales"]},
                    {"name": "Confounder", "items": ["Neighborhood income"]},
                    {"name": "Affects the outcome only",
                     "items": ["Day of week"]}]},
         props=QUIZ_PROPS,
         notes="Answer: coupons are the treatment, sales the outcome, income the "
               "confounder, and day of week affects sales only. Day of week is "
               "the instructive one. It raises sales but is drawn independently "
               "of income and coupons, so leaving it out does not bias the "
               "coupon effect in the population. It returns in Act II as the "
               "second control."),
    dict(id="N7", after=10, tier="opt", minutes=1,
         slide={"slide_type": "marketplace/true-or-false",
                "title": "The naive slope is not significant (p = 0.365), so "
                         "coupons have no effect on sales.",
                "slide_attributes": {"config": {
                    "question": "The naive slope is not significant (p = 0.365), "
                                "so coupons have no effect on sales.",
                    "correctAnswer": "false", "hasTimeLimit": True,
                    "timeLimitSeconds": 30, "maxPointsPerCorrect": 100,
                    "minPoint": 0, "speedBonus": True}}},
         notes="Answer: False. A large p-value is an absence of evidence, not "
               "evidence of no effect. Here the problem is worse than noise: the "
               "naive slope is confounded by income, and the true effect is +0.2 "
               "by construction. The next slide adds income as a control and the "
               "slope flips to +0.267."),
    dict(id="N8", after=11, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: why did adding income flip the sign?",
                "options": []},
         props={"metadata": {"autoFillParticipantName": True}},
         notes="Spin the wheel; it fills itself with the names of joined "
               "students. A good answer: richer neighborhoods redeem fewer "
               "coupons but spend more, so without income the coupon slope "
               "absorbs the negative link between coupons and income. Holding "
               "income fixed removes that backdoor, and the slope turns positive. "
               "The next slide asks which regression measures the bias."),
    dict(id="I2", after=12, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "The naive-minus-full gap is −0.3732 = γ̂ × δ̂, with "
                           "γ̂ = 0.3836. Which regression gives δ̂?",
                "options": ["income on coupons", "coupons on income",
                            "sales on income"],
                "correct": "A"},
         props=QUIZ_PROPS, notes=None),
    dict(id="N9", after=13, tier="core", minutes=1,
         slide={"slide_type": "marketplace/fill-in-the-blanks",
                "title": "Complete the omitted-variable bias identity",
                "slide_attributes": {"config": {
                    "question": "Naive slope = full slope + γ̂ × δ̂. Here γ̂ is "
                                "the effect of [blank] on sales, and δ̂ is the "
                                "slope from regressing [blank] on [blank].",
                    "blanks": [
                        {"id": "b1", "acceptedAnswers": ["income"],
                         "dropdownOptions": ["income", "coupons", "day of week"]},
                        {"id": "b2", "acceptedAnswers": ["income"],
                         "dropdownOptions": ["coupons", "income", "sales"]},
                        {"id": "b3", "acceptedAnswers": ["coupons"],
                         "dropdownOptions": ["sales", "income", "coupons"]}],
                    "answerType": "dropdown", "partialScoring": True}}},
         notes="Answer: income, income, coupons. γ̂ is the coefficient of the "
               "omitted variable (income) in the full model, 0.3836. δ̂ comes "
               "from regressing the omitted variable on the treatment, slope "
               "−0.9730. Their product, −0.3732, is the whole gap between the "
               "naive −0.1059 and the full 0.2673. The direction of the "
               "auxiliary regression matters, as the previous quiz showed."),
    dict(id="N10", after=14, tier="core", minutes=1,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each symbol to its meaning",
                "pairs": [
                    {"left_item": "γ̂ (gamma-hat)",
                     "right_item": "Income coefficient in the full model, 0.3836"},
                    {"left_item": "δ̂ (delta-hat)",
                     "right_item": "Slope of income on coupons, −0.9730"},
                    {"left_item": "x̃₁ (x1-tilde)",
                     "right_item": "Coupons after partialling out income"},
                    {"left_item": "M₂",
                     "right_item": "Matrix that residualizes on the controls"}]},
         props=QUIZ_PROPS,
         notes="Answer: γ̂ is the income coefficient (0.3836), δ̂ the slope of "
               "income on coupons (−0.9730), x̃₁ the coupon residual after "
               "partialling out income, and M₂ the residual-maker matrix that "
               "does the partialling out inside the matrix formula. If x̃₁ and M₂ "
               "get mixed up, stress that M₂ is the operator and x̃₁ = M₂x₁ is "
               "its output. The next slide computes the FWL slope by hand."),
    dict(id="N11", after=15, tier="core", minutes=1,
         slide={"slide_type": "correct_order_quiz",
                "heading": "Put the FWL-by-hand recipe in order",
                "options": [
                    {"position": 1, "text": "Regress coupons and sales on "
                                            "income, with an intercept"},
                    {"position": 2, "text": "Keep the two residual series, "
                                            "x̃ and ỹ"},
                    {"position": 3, "text": "Compute Cov(x̃, ỹ) / Var(x̃) with "
                                            "the same divisor"},
                    {"position": 4, "text": "Check that it equals the full-OLS "
                                            "coefficient, 0.2673"}]},
         props=QUIZ_PROPS,
         notes="Answer: regress on income, keep the residuals, divide the "
               "covariance by the variance, then compare with full OLS. The "
               "third step hides the trap from the slide: np.cov divides by n − 1 "
               "and np.var by n unless ddof=1, and mixing them inflates the slope "
               "by 50/49 to 0.2728. The Colab stop that follows lets everyone see "
               "both numbers."),
    dict(id="N12", after=16, tier="core", minutes=5,
         slide={"slide_type": "short_answer_quiz",
                "heading": "Colab stop: run the notebook from the top through "
                           "Section 9. What does beta_1 = Cov / Var print?",
                "correct_answer": "0.2673"},
         props={"timeToAnswer": 300, "fastAnswerGetMorePoint": True},
         notes="The single live-coding stop, about five minutes. Students open "
               "the Google Colab button on the post (" + COLAB + ") and run the "
               "cells from the top through Section 9, FWL by hand in NumPy. The "
               "cell prints beta_1 = Cov / Var = 0.2673, the full-regression "
               "coefficient, and on the next line the wrong value 0.2728 that "
               "comes from mixing divisors. Type the answer with four decimals. "
               "Students who finish early can explain to a neighbor why the two "
               "printed numbers differ."),
    dict(id="I3", after=17, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Step 1 regresses raw sales on residualized coupons, "
                           "with no intercept. Does the shortcut keep both "
                           "numbers?",
                "options": ["Same coefficient (0.2673) and the same SE, "
                            "about 0.12",
                            "Same coefficient, but a much larger SE",
                            "A different coefficient"],
                "correct": "B"},
         props=QUIZ_PROPS, notes=None),
    dict(id="N14", after=18, tier="opt", minutes=1,
         slide={"slide_type": "marketplace/true-or-false",
                "title": "Adding an intercept to Step 1 brings its SE all the "
                         "way back to the full model, 0.1203.",
                "slide_attributes": {"config": {
                    "question": "Adding an intercept to Step 1 brings its SE all "
                                "the way back to the full model, 0.1203.",
                    "correctAnswer": "false", "hasTimeLimit": True,
                    "timeLimitSeconds": 30, "maxPointsPerCorrect": 100,
                    "minPoint": 0, "speedBonus": True}}},
         notes="Answer: False. The intercept closes 98% of the gap, from 1.2715 "
               "down to 0.1437, but not all of it. The rest is the variation in "
               "sales that income explains and that Step 1 leaves in the "
               "residuals. Residualizing sales on income cuts the sum of squared "
               "residuals from 715 to 491 and brings the SE to the full-model "
               "value. The next slide takes the jump apart."),
    dict(id="N13", after=19, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: why does dropping the intercept blow up "
                           "the SE?",
                "options": []},
         props={"metadata": {"autoFillParticipantName": True}},
         notes="Spin and ask the student to explain the slide in their own "
               "words. A good answer: a line forced through the origin must also "
               "explain the level of sales, whose mean is 33.6, so that level "
               "stays in the residuals and inflates the residual variance. The "
               "coefficient survives because residualized coupons are orthogonal "
               "to the constant; the SE does not."),
    dict(id="I4", after=20, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Step 2 residualizes sales too, then regresses "
                           "residual on residual with no intercept. Will its SE "
                           "equal the full model's 0.1203?",
                "options": ["Yes, exactly 0.1203", "Close, but slightly smaller",
                            "Close, but slightly larger"],
                "correct": "B"},
         props=QUIZ_PROPS, notes=None),
    dict(id="I5", after=24, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Shift each residual by its variable's sample mean, "
                           "so every point moves up and to the right. Does the "
                           "slope change?",
                "options": ["No, the slope is unchanged",
                            "Yes, the slope gets steeper",
                            "Yes, the slope gets flatter"],
                "correct": "A"},
         props=QUIZ_PROPS, notes=None),
    dict(id="I6", after=26, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Add day of week as a second control. In the DGP it "
                           "is independent of both coupons and income. Does the "
                           "coupon coefficient move?",
                "options": ["Not at all: it stays exactly 0.2673", "Slightly",
                            "A lot: day of week is a second confounder"],
                "correct": "B"},
         props=QUIZ_PROPS, notes=None),
    dict(id="N15", after=27, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="End of Act II checkpoint. Read the top five aloud, then check "
               "the Q&A for questions that collected upvotes before moving on "
               "to the resolution."),

    # ── Act III: the resolution ──────────────────────────────────────────────
    dict(id="N16", after=28, tier="opt", minutes=1,
         slide={"slide_type": "correct_order_quiz",
                "heading": "Order these coupon estimates from smallest to "
                           "largest",
                "options": [
                    {"position": 1, "text": "Naive slope, no controls"},
                    {"position": 2, "text": "True effect planted in the "
                                            "simulation"},
                    {"position": 3, "text": "FWL slope after partialling out "
                                            "income"},
                    {"position": 4, "text": "FWL slope after partialling out "
                                            "income and day of week"}]},
         props=QUIZ_PROPS,
         notes="Answer: naive −0.1059, true 0.2000, FWL with income 0.2673, FWL "
               "with income and day of week 0.2706. The order shows the whole "
               "story in one line: the confounded estimate has the wrong sign, "
               "conditioning recovers the right sign, and the remaining gap to "
               "0.2 is sampling noise in 50 restaurants. The next slides make "
               "that case with pictures."),
    dict(id="N17", after=30, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: explain Simpson's paradox in this "
                           "example in one sentence",
                "options": []},
         props={"metadata": {"autoFillParticipantName": True}},
         notes="Before spinning, go back to the results of the first poll (I1) "
               "and show the room what it predicted for the naive slope. Then "
               "spin. A good sentence: across all restaurants coupons and sales "
               "move in opposite directions, but among restaurants with similar "
               "income they move together, because income drives both."),
    dict(id="N18", after=32, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/two-by-two-grid-v2",
                "title": "Where does each threat to a causal FWL estimate "
                         "land?",
                "slide_attributes": {"config": {
                    "question": "Where does each threat to a causal FWL "
                                "estimate land?",
                    "xAxisLabel": "How likely in real data",
                    "yAxisLabel": "How much bias it causes",
                    "items": [
                        {"id": "i1", "label": "An unmeasured second confounder",
                         "color": ""},
                        {"id": "i2", "label": "Sales depend on income squared, "
                                              "but we control linearly",
                         "color": ""},
                        {"id": "i3", "label": "Coupons depend on income "
                                              "squared, but we control linearly",
                         "color": ""},
                        {"id": "i4", "label": "Only 50 restaurants",
                         "color": ""},
                        {"id": "i5", "label": "Day of week left out",
                         "color": ""}],
                    "canSkip": False}}},
         notes="Unscored; it sets up a discussion. The post gives the reference "
               "answers. An unmeasured confounder can bias the estimate without "
               "limit and is common in real data. A curve in the sales equation "
               "that the linear control misses biases it (0.127 instead of "
               "0.200). A curve in the coupon equation alone is harmless "
               "(0.200). Fifty restaurants add noise, not bias. Leaving out day "
               "of week adds no bias here, because it is independent of coupons "
               "and income. Ask which dot the room placed furthest from these "
               "answers."),
    dict(id="N19", after=32, tier="opt", minutes=3,
         slide={"slide_type": "ideaBoard",
                "title": "Name a confounder from your own research: "
                         "treatment, outcome, confounder",
                "slide_attributes": {
                    "groups": [
                        {"id": "3f6c2a8e-1b4d-4c7a-9e2f-5a1b3c4d6e70",
                         "name": "Development and growth"},
                        {"id": "7a1d4e9b-2c5f-4b8a-8d3e-6b2c4d5e7f81",
                         "name": "Policy and public economics"},
                        {"id": "9c3e5f1a-4d6b-4e9c-af4b-7c3d5e6f8a92",
                         "name": "Health, education and labor"},
                        {"id": "b5d7a2c4-6e8f-4fad-b05c-8d4e6f7a9ba3",
                         "name": "Other fields"}],
                    "preSetGroupEnabled": True, "votesEnabled": True,
                    "votesPerParticipant": 3}},
         notes="Ask each student for one example in the form treatment, "
               "outcome, confounder (for example: microcredit, household "
               "income, entrepreneurial ability). After two minutes, open the "
               "voting round and discuss the top two. For each, ask whether the "
               "confounder can be measured; if it cannot, FWL and DML cannot "
               "remove it."),
    dict(id="I7", after=33, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "What does Double Machine Learning replace in the "
                           "FWL recipe?",
                "options": ["The two OLS partialling-out regressions (with "
                            "flexible ML learners, plus cross-fitting)",
                            "The final residual-on-residual regression",
                            "The confounder itself"],
                "correct": "A"},
         props=QUIZ_PROPS, notes=None),
    # Final review round. It replaced an escape-room slide on 2026-10-06: the
    # API accepts `marketplace/escape-room-v2`, but this account's editor does
    # not offer the type, and the editor, Preview and share view all showed it
    # blank. Four quick scored quizzes do the same job and feed the leaderboard.
    dict(id="R1", after=33, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 1 of 4: income raises sales and lowers "
                           "coupon use. In this study, income is",
                "options": ["a mediator", "a confounder", "an instrument"],
                "correct": "B"},
         props=REVIEW_PROPS,
         notes="Final review round, question 1 of 4, with a 20-second timer. "
               "Answer: B, a confounder. Income causes both the treatment and "
               "the outcome, which opens the backdoor path that biased the "
               "naive slope. A mediator would sit between coupons and sales, "
               "and an instrument would move coupons without affecting sales "
               "directly."),
    dict(id="R2", after=33, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 2 of 4: the coupon coefficient equals the "
                           "slope of residualized sales on residualized",
                "options": ["income", "day of week", "coupons"],
                "correct": "C"},
         props=REVIEW_PROPS,
         notes="Answer: C, coupons. This is the FWL theorem in one line: "
               "partial income out of both coupons and sales, then regress one "
               "residual on the other. The slope is 0.2673, identical to the "
               "coefficient in the full regression."),
    dict(id="R3", after=33, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 3 of 4: the Step 2 SE is 0.1178 and the "
                           "full-model SE is 0.1203. Why do they differ?",
                "options": ["Degrees of freedom: 49 vs 47",
                            "Different residuals", "A different coefficient"],
                "correct": "A"},
         props=REVIEW_PROPS,
         notes="Answer: A. The residuals and the coefficient are identical; "
               "only the divisor changes. The software counts 49 residual "
               "degrees of freedom in Step 2 instead of 47, because it does not "
               "know that the intercept and income were already estimated. "
               "Report the full-model 0.1203."),
    dict(id="R4", after=33, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 4 of 4: can FWL or DML remove the bias from "
                           "an unmeasured confounder?",
                "options": ["Yes, with enough data", "Only with cross-fitting",
                            "No, the confounder must be measured"],
                "correct": "C"},
         props=REVIEW_PROPS,
         notes="Answer: C. Both methods condition only on the controls you "
               "give them. More data and flexible learners help with "
               "functional form, not with a confounder that is missing from "
               "the data. This is the main caveat of the lecture, so end the "
               "round on it before the final podium."),
    dict(id="N21", after=33, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="Final podium for the quiz points of the whole class. Congratulate "
               "the top three; the prize raffle at the end gives everyone else a "
               "chance as well."),

    # ── Closing, after the final sentence ────────────────────────────────────
    dict(id="N22", after=34, tier="opt", minutes=1,
         slide={"slide_type": "word_cloud", "heading": "Again, i" + WORD_PROMPT[1:]},
         props={"entriesPerParticipant": 2},
         notes="The opening prompt again. Put the two clouds side by side if "
               "time allows. A good outcome is a shift from hold constant and "
               "remove toward words such as residualize, partial out, isolate, "
               "or condition."),
    dict(id="N23", after=34, tier="core", minutes=1,
         slide={"slide_type": "scale",
                "heading": "After class: how confident are you now?",
                "options": [{"text": t} for t in CONFIDENCE],
                "scale_config": SCALE_CONFIG},
         notes="The same three statements as the opening scale. Compare the "
               "averages with the baseline aloud. The statement with the smallest "
               "gain is the one to revisit at the start of the next class."),
    dict(id="N24", after=34, tier="core", minutes=2,
         slide={"slide_type": "open_ended_survey",
                "heading": "Exit ticket: what is still unclear about FWL? One "
                           "sentence."},
         notes="The exit ticket. Responses are named, because names are required "
               "on join, so they can be followed up individually. Skim them "
               "after class and open the next session with the two most common "
               "points of confusion."),
    dict(id="N25", after=34, tier="core", minutes=1,
         slide={"slide_type": "marketplace/duck-race",
                "slide_attributes": {"config": {"durationSeconds": 20,
                                                "resultMode": "winner"}}},
         notes="Prize raffle. Every joined student becomes a duck and the winner "
               "is pure luck, so students who scored low on the quizzes still "
               "have a chance. Students pick a duck design on their phones "
               "before the start."),
]

# Presenter notes of the six cue quizzes, kept verbatim from the first build
# (2026-09-28). They are already stored on the AhaSlides slides, so a rebuild
# leaves them alone; I1 has new notes because its timer and the slide it
# points back to changed.
LEGACY_NOTES = {
    "I2": (
        "Answer: A. Regress the omitted variable (income) on the treatment "
        "(coupons): its slope is δ̂ = −0.9730, and 0.3836 × (−0.9730) = −0.3732 "
        "— the whole gap between the naive −0.1059 and the full 0.2673, to the "
        "last digit. B is the reverse regression: slope −0.3935, a bias term of "
        "−0.151, and an implied naive slope of +0.116 that reconciles nothing. "
        "C, sales on income, is the partialling-out regression for the outcome, "
        "not an OVB regression. If anyone assumes the two directions are "
        "interchangeable, name the trap: both slopes share the same covariance, "
        "but one divides it by the variance of coupons and the other by the "
        "variance of income, so they differ. The next slide writes the identity "
        "out in full."
    ),
    "I3": (
        "Answer: B. The coefficient is exactly 0.2673 — residualized coupons "
        "are orthogonal to both the constant and income, so the part of raw "
        "sales those two explain drops out of the slope. The SE does not "
        "survive: it jumps to 1.2715, more than ten times the full model's "
        "0.1203, and p rises to 0.834 — stop here and you would conclude "
        "coupons do nothing. The culprit is the missing intercept: raw sales "
        "has a mean of 33.61, and a line forced through the origin must explain "
        "that level too. Add the intercept back and the SE falls to 0.1437, "
        "closing 98% of the gap; the rest is income's variation still left in "
        "sales. C is the one to rule out firmly: full OLS, residualize-X-only "
        "and residualize-both all return the same coefficient."
    ),
    "I4": (
        "Answer: B — 0.1178. Step 2 leaves exactly the full model's residuals, "
        "so the sum of squared residuals is identical; only the divisor "
        "changes. The software sees 49 residual degrees of freedom where the "
        "full model has 47, because it does not know that two parameters — the "
        "intercept and income — were already spent in the partialling-out step. "
        "The SE ratio is √(47/49) = 0.9794, and 0.1203 × 0.9794 = 0.1178. So "
        "Step 2 slightly overstates precision: report the full-model 0.1203. If "
        "A wins, it is the useful mistake — the coefficient matches exactly, so "
        "people assume the SE does too."
    ),
    "I5": (
        "Answer: A — the slope is 0.2673 again. Adding a constant to either "
        "axis moves the cloud, not its tilt; the intercept absorbs the shift. "
        "What the shift buys is readable units: a residual of −5 means five "
        "points below what income predicts, while the shifted axes read roughly "
        "34% coupons and 33.6 thousand dollars of sales. The SE moves a hair, "
        "0.119 against Step 2's 0.118, because this regression estimates an "
        "intercept and keeps 48 residual degrees of freedom instead of 49. It "
        "is a display device: for inference, still report the full-model "
        "0.1203."
    ),
    "I6": (
        "Answer: B — from 0.2673 to 0.2706, a shift of about 0.003. "
        "Independence in the DGP is a population statement; in a sample of 50 "
        "restaurants, day of week has a small chance partial association with "
        "coupons given income (regress day of week on coupons and income: slope "
        "−0.0101; partial correlation −0.021), and the OVB identity accounts "
        "for the shift exactly: 0.2673 = 0.2706 + 0.3195 × (−0.0101). A is the "
        "tempting answer and the one worth discussing: it is what the "
        "population says, and the shift would vanish in large samples. C is "
        "ruled out by construction — day of week is not a confounder here, and "
        "it is not even significant itself (0.3195, p = 0.198). Precision is a "
        "separate story, told by the SE: 0.1203 → 0.1194."
    ),
    "I7": (
        "A recap quiz on the bridge slide; it has no cue slide of its own, so "
        "ask it straight after the two-column comparison. Answer: A. DML keeps "
        "the residualize-then-regress logic and swaps only the mop: the outcome "
        "and the treatment are each residualized with flexible learners (a "
        "forest, a lasso) instead of OLS, and cross-fitting means each "
        "restaurant's residuals come from models fit on the other folds. B is "
        "the step DML leaves untouched — the final regression of residual y on "
        "residual d runs exactly as in FWL. C is the trap worth naming: nothing "
        "replaces the confounder. DML still needs every confounder measured, "
        "and it offers no protection against an unmeasured one. Close the loop: "
        "the residual-on-residual scatter this deck drew at slope 0.2673 is the "
        "same picture DML draws, learned with a smarter mop."
    ),
}
