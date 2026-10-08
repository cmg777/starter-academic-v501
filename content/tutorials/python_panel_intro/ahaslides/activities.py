"""The AhaSlides audience layer of the panel-data deck: every interactive slide.

This file is the source of truth for the 37 interactive slides (7 cue quizzes
kept from the first build, 30 added for the paid plan on 2026-10-06). The 33
content slides are images of ../slides/slides.qmd and are not defined here.
The design follows content/tutorials/python_fwl/ahaslides/, the paid-plan reference.

    python3 build_deck_json.py && python3 build_payload.py

Each activity is a dict:

    id        "I1".."I7" (cue quizzes), "N1".."N26" and "R1".."R4" (2026-10-06)
    after     page of the imported PDF this slide follows (1..33)
    tier      "core" (always run) or "opt" (skip live if the class runs late)
    minutes   rough classroom time, voting plus discussion
    slide     the create_slides body, exactly as AhaSlides takes it, minus notes
    props     update_slide_properties settings (timers, points, spinner fill)
    notes     presenter notes; build_payload.py prefixes the tier and minutes
    cue       True for I1..I7: options must repeat the cue slide verbatim

Options of `poll` and `pick_answer_quiz` are written here in A, B, C order and
WITHOUT letters. build_payload.py letters them and sends them reversed, because
AhaSlides displays options in reverse payload order.

Writing rules for new text (author preference): no em dashes, no contractions,
no possessive apostrophes. build_deck_json.py checks them.
"""

QUIZ_PROPS = {"timeToAnswer": 30, "fastAnswerGetMorePoint": True}
REVIEW_PROPS = {"timeToAnswer": 20, "fastAnswerGetMorePoint": True}
SPINNER_PROPS = {"metadata": {"autoFillParticipantName": True}}

# Three statements rated before and after class, so the two scale slides compare.
CONFIDENCE = [
    "I can explain the difference between within and between variation",
    "I can say which variation each panel estimator uses",
    "I can choose between fixed effects and random effects",
]
SCALE_CONFIG = {"low_label": "Not at all", "high_label": "Completely",
                "low_value": 1, "high_value": 5, "must_rate": True,
                "show_average": True, "show_mid_values": True}

WORD_PROMPT = ("In one word: what can panel data do that a single cross-section "
               "cannot?")
REPORT_OPTIONS = ["7.5 log points, from pooled OLS",
                  "21 log points, from the within estimators",
                  "Both, each with the question it answers"]

COLAB = ("https://colab.research.google.com/github/cmg777/starter-academic-v501/"
         "blob/master/content/tutorials/python_panel_intro/notebook.ipynb")


def true_false(claim, answer):
    """A scored true/false slide; points match the other quizzes (0 to 100)."""
    return {"slide_type": "marketplace/true-or-false", "title": claim,
            "slide_attributes": {"config": {
                "question": claim, "correctAnswer": answer, "hasTimeLimit": True,
                "timeLimitSeconds": 30, "maxPointsPerCorrect": 100,
                "minPoint": 0, "speedBonus": True}}}


NEW = [
    # ── Opening, after the title page ────────────────────────────────────────
    dict(id="N1", after=1, tier="core", minutes=1,
         slide={"slide_type": "qr_code"},
         notes="Students join at ahaslides.com with code V62EU or by scanning "
               "the QR code. Names are required on join, so the leaderboard and "
               "the spinner wheels show real names. Ask everyone to open the "
               "Colab notebook now and run its first cell, which installs "
               "pyfixest and linearmodels; the Colab stop in Act II then runs "
               "without waiting."),
    dict(id="N2", after=1, tier="core", minutes=1.5,
         slide={"slide_type": "word_cloud", "heading": WORD_PROMPT},
         props={"entriesPerParticipant": 2},
         notes="Warm-up, no right answer. Expect words such as track, compare, "
               "change, control or difference. Do not correct anyone yet. The "
               "same prompt returns at the end of class, so keep this cloud in "
               "mind (or screenshot it) for the comparison."),
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
    dict(id="N5", after=3, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Gut call: which union premium would you report?",
                "options": REPORT_OPTIONS},
         props={"hasTimeLimit": True, "timeToAnswer": 30, "multipleChoice": False,
                "limitChoice": 1, "typeChart": "barChart",
                "showPercentage": True},
         notes="An opinion poll with no right answer at this point. The slide "
               "just asked which number to report; this is where the room "
               "commits before any method is explained. Do not comment on the "
               "split. The same poll returns after the closing sentence, and "
               "the lecture argues for C: each number answers a different "
               "question, so report both with their estimands."),

    # ── Act II: the investigation ────────────────────────────────────────────
    dict(id="N6", after=6, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/draw-answer-v2",
                "title": "Draw the 2010 to 2012 wage path of a worker who joins "
                         "a union",
                "slide_attributes": {"config": {
                    "question": "Draw the 2010 to 2012 wage path of a worker "
                                "who joins a union",
                    "allowMultipleSubmissions": False, "clearToken": 0}}},
         notes="Give 60 seconds. Most drawings will show a line that rises "
               "between the two years. Ask what the line of a comparable worker "
               "who never joins would look like: the within estimators compare "
               "these changes, not the levels. Keep two or three drawings in "
               "mind for the trajectories slide, which shows 30 real workers."),
    dict(id="N7", after=10, tier="opt", minutes=1,
         slide=true_false("Fixed effects can estimate the wage return to "
                          "schooling in this panel.", "false"),
         notes="Answer: False. Schooling has zero within variation: no worker "
               "changes education between 2010 and 2012, so the worker effect "
               "absorbs it and fixed effects drop it mechanically. This is the "
               "price of within identification, and the reason the CRE model "
               "returns at the end of Act II."),
    dict(id="N8", after=11, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: why do only the teal lines identify "
                           "fixed effects?",
                "options": []},
         props=SPINNER_PROPS,
         notes="Spin the wheel; it fills itself with the names of joined "
               "students. A good answer: a worker whose union status never "
               "changes has no within-worker contrast, so the worker effect "
               "absorbs everything about that worker. Only the 73 switchers, "
               "the teal lines, show a wage change alongside a union change."),
    dict(id="N9", after=12, tier="opt", minutes=1,
         slide=true_false("Pooled OLS is highly significant (t = 3.25), so its "
                          "7.5-log-point premium is unbiased.", "false"),
         notes="Answer: False. Significance measures noise, not bias. If "
               "workers with higher unobserved ability are less likely to hold "
               "union jobs, pooled OLS mixes the union effect with that "
               "selection, however small its standard error. The rest of Act II "
               "is a tour of ways to remove the fixed part of that selection."),
    dict(id="N10", after=14, tier="core", minutes=1,
         slide={"slide_type": "marketplace/fill-in-the-blanks",
                "title": "Complete the logic of first differences",
                "slide_attributes": {"config": {
                    "question": "First differencing removes the worker effect "
                                "because it does not change over [blank]. The "
                                "estimate is identified only by workers who "
                                "[blank] union status.",
                    "blanks": [
                        {"id": "b1", "acceptedAnswers": ["time"],
                         "dropdownOptions": ["workers", "time", "industries"]},
                        {"id": "b2", "acceptedAnswers": ["switch"],
                         "dropdownOptions": ["keep", "report", "switch"]}],
                    "answerType": "dropdown", "partialScoring": True}}},
         notes="Answer: time, switch. The worker effect is constant over the "
               "two years, so it cancels when we subtract the 2010 row from the "
               "2012 row. A worker who never changes union status has a change "
               "of zero in the regressor, so only the 73 switchers move the "
               "estimate. That is why the standard error is 3.4 times larger "
               "than in pooled OLS."),
    dict(id="N11", after=17, tier="core", minutes=1,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each fixed-effects recipe to what it does",
                "pairs": [
                    {"left_item": "First differences",
                     "right_item": "Subtract the 2010 row from the 2012 row"},
                    {"left_item": "Within (demeaning)",
                     "right_item": "Subtract the mean of each worker"},
                    {"left_item": "Dummy-variable FE",
                     "right_item": "Add one dummy per worker, 2,198 in all"},
                    {"left_item": "Absorbed FE (| ID)",
                     "right_item": "The fast software route to the same "
                                   "estimate"}]},
         props=QUIZ_PROPS,
         notes="Answer: first differences subtract periods, demeaning subtracts "
               "worker means, dummy-variable FE adds 2,198 worker dummies, and "
               "absorption is the fast computational route. With T = 2 all of "
               "them return 0.2103, except that FD with an intercept gives "
               "0.2113 because the intercept absorbs the common wage trend."),
    dict(id="N12", after=17, tier="core", minutes=5,
         slide={"slide_type": "short_answer_quiz",
                "heading": "Colab stop: run the notebook from the top through "
                           "Section 10. What union coefficient does fixed "
                           "effects print?",
                "correct_answer": "0.2103"},
         props={"timeToAnswer": 300, "fastAnswerGetMorePoint": True},
         notes="The single live-coding stop, about five minutes. Students open "
               "the Google Colab button on the post (" + COLAB + ") and run the "
               "cells from the top through Section 10, Within / Fixed effects. "
               "The first cell installs pyfixest and linearmodels, and Section 4 "
               "downloads the data from GitHub, so students who started the "
               "install at the beginning of class finish first. The cell prints "
               "Union coefficient: 0.2103 (SE 0.0812) and, on the next line, the "
               "FD slope without an intercept, also 0.2103. Type the answer "
               "with four decimals. Students who finish early can explain to a "
               "neighbor why the two printed numbers agree."),
    dict(id="N13", after=19, tier="opt", minutes=1,
         slide=true_false("Two-way fixed effects can estimate the wage gap "
                          "between women and men.", "false"),
         notes="Answer: False. Being female never changes within a worker, so "
               "the worker effect absorbs it silently, exactly like schooling. "
               "The female penalty of −27.3 log points comes from the "
               "cross-sectional camp (POLS, RE, CRE), which is one reason "
               "researchers reach for CRE when they want both kinds of "
               "coefficient."),
    dict(id="N14", after=20, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: why does random effects land closer to "
                           "pooled OLS than to fixed effects?",
                "options": []},
         props=SPINNER_PROPS,
         notes="Spin and ask the student to explain the slide in their own "
               "words. A good answer: random effects is a precision-weighted "
               "blend of the between and within estimators, and only 6.1% of "
               "the union variance is within workers, so the between comparison "
               "gets most of the weight. That is why RE lands at 0.109, much "
               "closer to 0.075 than to 0.210."),
    dict(id="N15", after=24, tier="core", minutes=1,
         slide={"slide_type": "categorise_quiz",
                "heading": "Sort the estimators by the variation they use",
                "options": [
                    {"name": "Cross-sectional camp",
                     "items": ["Pooled OLS", "Between", "Random effects"]},
                    {"name": "Within camp",
                     "items": ["First differences", "Fixed effects",
                               "Two-way fixed effects"]}]},
         props=QUIZ_PROPS,
         notes="Answer: pooled OLS, between and random effects lean on "
               "comparisons across workers; first differences, fixed effects "
               "and two-way FE use only changes within a worker. CRE was left "
               "out on purpose: it is the bridge, with a within coefficient "
               "equal to FE inside a random-effects model. Ask where the room "
               "would put it and why."),
    dict(id="N16", after=24, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="End of Act II checkpoint. Read the top five aloud, then check "
               "the Q&A for questions that collected upvotes before moving on "
               "to the resolution."),

    # ── Act III: the resolution ──────────────────────────────────────────────
    dict(id="N17", after=25, tier="opt", minutes=1,
         slide={"slide_type": "correct_order_quiz",
                "heading": "Order these union estimates from smallest to "
                           "largest",
                "options": [
                    {"position": 1, "text": "Between estimator"},
                    {"position": 2, "text": "Pooled OLS"},
                    {"position": 3, "text": "Random effects"},
                    {"position": 4, "text": "Fixed effects"}]},
         props=QUIZ_PROPS,
         notes="Answer: Between 0.0662, pooled OLS 0.0750, random effects "
               "0.1092, fixed effects 0.2103. The order is the whole story: the "
               "more an estimator leans on comparisons across workers, the "
               "smaller the premium, which is the signature of negative "
               "selection into union jobs. The next slides make that case."),
    dict(id="N18", after=27, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: why are the within-camp standard errors "
                           "so much larger?",
                "options": []},
         props=SPINNER_PROPS,
         notes="Spin and ask. A good answer: the within estimators throw away "
               "every comparison across workers and keep only the 73 "
               "switchers, so they estimate the premium from a thin 6.1% slice "
               "of the union variance. The cross-sectional standard errors are "
               "2.6 to 3.5 times smaller, but they buy precision with bias if "
               "selection is real."),
    dict(id="N19", after=30, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/two-by-two-grid-v2",
                "title": "Where does each threat to the within estimate land?",
                "slide_attributes": {"config": {
                    "question": "Where does each threat to the within estimate "
                                "land?",
                    "xAxisLabel": "How likely in real data",
                    "yAxisLabel": "How much bias it causes",
                    "items": [
                        {"id": "i1", "label": "A promotion that coincides with "
                                              "joining a union", "color": ""},
                        {"id": "i2", "label": "Fixed ability differences "
                                              "across workers", "color": ""},
                        {"id": "i3", "label": "Only 73 switchers",
                         "color": ""},
                        {"id": "i4", "label": "Joiners and leavers respond "
                                              "differently", "color": ""},
                        {"id": "i5", "label": "Only two waves, 2010 and 2012",
                         "color": ""}],
                    "canSkip": False}}},
         notes="Unscored; it sets up a discussion. The reference answers come "
               "from the slides. A time-varying shock such as a promotion that "
               "coincides with joining biases every within estimator. Fixed "
               "ability differences are exactly what fixed effects remove, so "
               "they cause no bias here. Seventy-three switchers mean noise and "
               "a local estimand, not bias. Joiners (0.345) and leavers (0.081) "
               "respond differently, so the symmetric model averages two "
               "effects. With all five waves two-way FE falls to 0.040, so the "
               "two-wave number is fragile. Ask which dot the room placed "
               "furthest from these answers."),
    dict(id="N20", after=30, tier="opt", minutes=3,
         slide={"slide_type": "ideaBoard",
                "title": "A panel question from your research: unit, "
                         "treatment, and a fixed confounder",
                "slide_attributes": {
                    "groups": [
                        {"id": "4a7c1e2b-3d5f-4a8b-9c1d-2e3f4a5b6c71",
                         "name": "Development and growth"},
                        {"id": "5b8d2f3c-4e6a-4b9c-8d2e-3f4a5b6c7d82",
                         "name": "Policy and public economics"},
                        {"id": "6c9e3a4d-5f7b-4cad-9e3f-4a5b6c7d8e93",
                         "name": "Health, education and labor"},
                        {"id": "7daf4b5e-6a8c-4dbe-af4a-5b6c7d8e9fa4",
                         "name": "Other fields"}],
                    "preSetGroupEnabled": True, "votesEnabled": True,
                    "votesPerParticipant": 3}},
         notes="Ask each student for one example in the form unit, treatment, "
               "fixed confounder (for example: districts, a cash-transfer "
               "rollout, local institutions). After two minutes, open the "
               "voting round and discuss the top two. For each, ask whether "
               "the treatment varies within units over time; if it does not, "
               "fixed effects cannot identify it."),
    dict(id="R1", after=32, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 1 of 4: fixed effects identify the union "
                           "premium from which workers?",
                "options": ["Workers who are always in a union",
                            "Workers who switch union status",
                            "Workers who are never in a union"],
                "correct": "B"},
         props=REVIEW_PROPS,
         notes="Final review round, question 1 of 4, with a 20-second timer. "
               "Answer: B. Only the 73 switchers (36 joined, 37 left) have a "
               "within-worker change in union status; for everyone else the "
               "worker effect absorbs union status completely."),
    dict(id="R2", after=32, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 2 of 4: random effects is consistent only "
                           "if the worker effect is",
                "options": ["constant over time",
                            "larger than the idiosyncratic error",
                            "uncorrelated with union status"],
                "correct": "C"},
         props=REVIEW_PROPS,
         notes="Answer: C. Every model here assumes the worker effect is "
               "constant over time; random effects adds that it is "
               "uncorrelated with the regressors. The gap between FE (0.210) "
               "and RE (0.109) suggests that assumption fails in this panel."),
    dict(id="R3", after=32, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 3 of 4: with T = 2, two-way fixed effects "
                           "equals which estimator exactly?",
                "options": ["First differences with an intercept",
                            "One-way fixed effects", "Pooled OLS"],
                "correct": "A"},
         props=REVIEW_PROPS,
         notes="Answer: A, both give 0.2113. The year effect in two-way FE "
               "plays the role of the intercept in the differenced regression. "
               "One-way FE (0.2103) equals FD without an intercept instead."),
    dict(id="R4", after=32, tier="core", minutes=0.75,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Review 4 of 4: with robust errors, which "
                           "specification test stays valid?",
                "options": ["The textbook Hausman test",
                            "The Mundlak term in CRE", "Neither"],
                "correct": "B"},
         props=REVIEW_PROPS,
         notes="Answer: B. The Hausman formula needs random effects to be "
               "fully efficient, which fails with heteroskedastic or clustered "
               "errors. The t-test on the Mundlak term can use robust or "
               "clustered standard errors; here it gives p = 0.072 robust and "
               "0.106 clustered. End the round on this before the podium."),
    dict(id="N21", after=32, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="Final podium for the quiz points of the whole class. "
               "Congratulate the top three; the prize raffle at the end gives "
               "everyone else a chance as well."),

    # ── Closing, after the final sentence ────────────────────────────────────
    dict(id="N22", after=33, tier="opt", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Now: which union premium would you report?",
                "options": REPORT_OPTIONS},
         props={"hasTimeLimit": True, "timeToAnswer": 30, "multipleChoice": False,
                "limitChoice": 1, "typeChart": "barChart",
                "showPercentage": True},
         notes="The opening poll again. Put the two bar charts side by side. The "
               "lecture argues for C: 0.075 answers how union and non-union "
               "workers differ, 0.21 answers what joining a union does for the "
               "73 switchers, and an honest report gives both with their "
               "assumptions."),
    dict(id="N23", after=33, tier="opt", minutes=1,
         slide={"slide_type": "word_cloud",
                "heading": "Again, i" + WORD_PROMPT[1:]},
         props={"entriesPerParticipant": 2},
         notes="The opening prompt again. A good outcome is a shift toward "
               "words such as within, difference, switchers, demean, or fixed "
               "effects."),
    dict(id="N24", after=33, tier="core", minutes=1,
         slide={"slide_type": "scale",
                "heading": "After class: how confident are you now?",
                "options": [{"text": t} for t in CONFIDENCE],
                "scale_config": SCALE_CONFIG},
         notes="The same three statements as the opening scale. Compare the "
               "averages with the baseline aloud. The statement with the "
               "smallest gain is the one to revisit at the start of the next "
               "class."),
    dict(id="N25", after=33, tier="core", minutes=2,
         slide={"slide_type": "open_ended_survey",
                "heading": "Exit ticket: what is still unclear about panel "
                           "methods? One sentence."},
         props={"imageSubmission": False, "layout": "grid"},
         notes="The exit ticket. Responses are named, because names are "
               "required on join, so they can be followed up individually. Skim "
               "them after class and open the next session with the two most "
               "common points of confusion."),
    dict(id="N26", after=33, tier="core", minutes=1,
         slide={"slide_type": "marketplace/duck-race",
                "slide_attributes": {"config": {"durationSeconds": 20,
                                                "resultMode": "winner"}}},
         notes="Prize raffle. Every joined student becomes a duck and the "
               "winner is pure luck, so students who scored low on the quizzes "
               "still have a chance. Students pick a duck design on their "
               "phones before the start."),
]

# The seven cue quizzes of the first build (2026-10-02), copied verbatim from
# the old deck.json: question, options and correct letter. Their notes are
# already stored on the AhaSlides slides and are not resent.
CUE_QUIZZES = [
    dict(id="I1", after=9, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "What share of the variance of union status comes from workers who "
                    "change status between 2010 and 2012?"),
                "options": [
                    "Less than 10%",
                    "About 25%",
                    "About 50%"],
                "correct": "A"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: A. Only 6.1% of the variance of union status is within "
             "workers. The within SD, 0.0911, is not a share: the share is its "
             "square divided by the sum of the squared between and within SDs "
             "(0.0083 out of 0.1362). Just 73 of 2,199 workers switch, so almost "
             "all the variation comes from comparing different workers. If B "
             "draws votes, point out that the SD ratio 0.0911/0.369 looks like "
             "25% only because SDs are not variances. The next slide shows the "
             "decomposition.")),
    dict(id="I2", after=13, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "Pooled OLS gave 0.0750 (SE 0.0231). How will the first-difference "
                    "estimate compare?"),
                "options": [
                    "Smaller than 0.075",
                    "About the same",
                    "Larger, with a larger standard error"],
                "correct": "C"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: C. FD gives 0.2113 with SE 0.0792, almost three times the "
             "POLS estimate and about 3.4 times its standard error. Differencing "
             "removes the fixed worker traits that depress the cross-sectional "
             "comparison, but it also discards every worker who never changes "
             "status, which leaves only 73 informative workers. The next slide "
             "writes out the differenced model.")),
    dict(id="I3", after=16, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "With two periods, will the FE estimate equal the FD estimate of "
                    "0.2113?"),
                "options": [
                    "Exactly equal",
                    "Slightly different",
                    "Very different"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: B. FE gives 0.2103, a gap of 0.001. The gap comes from the "
             "intercept in the FD regression, which absorbs the common wage "
             "growth of 0.0727; drop the intercept and FD returns exactly "
             "0.2103. If anyone chose A, they have the right intuition about the "
             "identity; the intercept is the one detail that breaks it. The next "
             "slide shows three recipes that all give 0.2103.")),
    dict(id="I4", after=18, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "FE gave 0.2103 and FD gave 0.2113. Where will two-way FE land?"),
                "options": [
                    "Exactly equal to FD, 0.2113",
                    "Equal to FE, 0.2103",
                    "Somewhere else"],
                "correct": "A"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: A. Two-way FE gives 0.2113, identical to FD with an "
             "intercept to six decimals. With T = 2 the year effect plays "
             "exactly the role of the FD intercept, so the gap between FD and "
             "one-way FE closes. The next slide shows the code and output.")),
    dict(id="I5", after=21, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "Plug the robust SEs (0.0812 for FE, 0.0299 for RE) into the "
                    "Hausman formula instead of the classical ones. What happens to H?"),
                "options": [
                    "Rise, so the test rejects more strongly",
                    "Fall enough to flip the verdict",
                    "Fall, but still reject at 5%"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: B. H falls from 5.62 (p = 0.018) to 1.79 (p = 0.180), so "
             "the verdict flips from rejecting RE to not rejecting it. The "
             "robust FE standard error grows much more than the robust RE one, "
             "which inflates the denominator V_FE − V_RE. But stress that the "
             "plug-in number is not a valid test: with robust errors V_FE − V_RE "
             "is no longer the variance of the difference. The next slide shows "
             "the textbook test; the Mundlak alternative comes right after.")),
    dict(id="I6", after=23, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "Random effects gave 0.1092. After adding union_bar, the worker "
                    "mean of union status, what is the coefficient on union?"),
                "options": [
                    "It equals the FE value, 0.2103",
                    "It stays near 0.11",
                    "It moves between 0.11 and 0.21"],
                "correct": "A"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: A, exactly 0.2103. Once the worker mean of union status is "
             "controlled for, the only variation left in union is within "
             "variation, so random effects has nothing else to use. This holds "
             "for any RE weight θ, which is the Mundlak (1978) result; the post "
             "proves it with FWL. The next slide shows the Mundlak model and its "
             "test.")),
    dict(id="I7", after=28, tier="core", minutes=1, cue=True,
         slide={"slide_type": "pick_answer_quiz",
                "heading": (
                    "With controls, age raises log wages by about 0.02 per year in "
                    "pooled OLS. What happens to the age coefficient under two-way FE?"),
                "options": [
                    "Stay near +0.02",
                    "Change sign",
                    "Shrink toward zero"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes=(
             "Answer: B. It turns negative, −0.0576. Between 2010 and 2012, age "
             "rises by exactly two years for 1,885 of the 2,199 workers, which "
             "the year effect absorbs completely, so the coefficient is "
             "identified only by the 314 workers whose age rose by one or three "
             "years, mostly because of interview timing. Read it as fragile, not "
             "as an age profile of wages. The next slide shows all four models "
             "with controls.")),
]

# Cue quizzes and new slides never share an anchor page, so a stable sort by
# page gives the running order; slides after one page keep their listed order.
ACTIVITIES = sorted(CUE_QUIZZES + NEW, key=lambda a: a["after"])
