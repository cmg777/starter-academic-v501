"""The AhaSlides audience layer of "Introduction to regional development".

Source of truth for every interactive slide of the three parts (one 90-minute
lecture each). The content slides are images of ../intro-regional.pdf and the
video pages are YouTube slides; both are listed in pages.py, not here.

    python3 build_deck_json.py && python3 build_payload.py

Each activity is a dict:

    id        "A1".. (Part 1), "B1".. (Part 2), "C1".. (Part 3); review rounds
              are "AR1".."AR4", "BR1".., "CR1"..
    part      1, 2 or 3
    after     PDF page this slide follows (a page of that part; for a video
              page, the slide follows the YouTube slide)
    tier      "core" (always run) or "opt" (skip live if the class runs late)
    minutes   rough classroom time, voting plus discussion
    slide     the create_slides body, exactly as AhaSlides takes it, minus notes
    props     update_slide_properties settings (timers, points, spinner fill)
    notes     presenter notes; build_payload.py prefixes the tier and minutes

Options of `poll` and `pick_answer_quiz` are written here in A, B, C order and
WITHOUT letters. build_payload.py letters them and sends them reversed, because
AhaSlides displays options in reverse payload order (see the FWL deck README).

Writing rules for new text (author preference): no em dashes, no contractions,
no possessive apostrophes. build_deck_json.py checks them.
"""
import json
from pathlib import Path

from pages import TOOLS

IMAGES = json.loads((Path(__file__).parent / "images.json").read_text())

QUIZ_PROPS = {"timeToAnswer": 30, "fastAnswerGetMorePoint": True}
REVIEW_PROPS = {"timeToAnswer": 20, "fastAnswerGetMorePoint": True}
POLL_PROPS = {"hasTimeLimit": True, "timeToAnswer": 30, "multipleChoice": False,
              "typeChart": "barChart", "showPercentage": True}
SPIN_PROPS = {"metadata": {"autoFillParticipantName": True}}
SCALE_CONFIG = {"low_label": "Not at all", "high_label": "Completely",
                "low_value": 1, "high_value": 5, "must_rate": True,
                "show_average": True, "show_mid_values": True}

CONFIDENCE = {
    1: ["I can explain why development gaps within countries matter",
        "I can name three sources of subnational development data",
        "I can explain what a raster image is"],
    2: ["I can explain why satellite data help where official data are poor",
        "I can explain how night lights proxy economic activity",
        "I can name one limitation of night lights data"],
    3: ["I can explain what spatial data science adds to data science",
        "I can state the first law of geography",
        "I can name a free tool to start a geospatial analysis"],
}
WORD_PROMPT = {
    1: "In one word: what makes a region developed?",
    2: "In one word: what can a satellite see about development?",
    3: "In one word: which tool do you use for data analysis today?",
}
JOIN = {1: "X0CIY", 2: "PWCXU", 3: "ZTR2I"}


def true_false(claim, answer, seconds=30):
    return {"slide_type": "marketplace/true-or-false", "title": claim,
            "slide_attributes": {"config": {
                "question": claim, "correctAnswer": answer,
                "hasTimeLimit": True, "timeLimitSeconds": seconds,
                "maxPointsPerCorrect": 100, "minPoint": 0, "speedBonus": True}}}


def fill_in(title, text, blanks):
    """blanks: list of (answer, [dropdown options])."""
    return {"slide_type": "marketplace/fill-in-the-blanks", "title": title,
            "slide_attributes": {"config": {
                "question": text,
                "blanks": [{"id": f"b{i + 1}", "acceptedAnswers": [a],
                            "dropdownOptions": opts}
                           for i, (a, opts) in enumerate(blanks)],
                "answerType": "dropdown", "partialScoring": True}}}


def idea_board(title, groups, votes):
    ids = ["3f6c2a8e-1b4d-4c7a-9e2f-5a1b3c4d6e70",
           "7a1d4e9b-2c5f-4b8a-8d3e-6b2c4d5e7f81",
           "9c3e5f1a-4d6b-4e9c-af4b-7c3d5e6f8a92",
           "b5d7a2c4-6e8f-4fad-b05c-8d4e6f7a9ba3"]
    return {"slide_type": "ideaBoard", "title": title,
            "slide_attributes": {
                "groups": [{"id": i, "name": g} for i, g in zip(ids, groups)],
                "preSetGroupEnabled": True, "votesEnabled": True,
                "votesPerParticipant": votes}}


def pin(title, page, pins=1):
    return {"slide_type": "pinOnImage", "title": title,
            "slide_attributes": {"imageUrl": IMAGES[str(page)],
                                 "pinsPerParticipant": pins}}


def photo_share(title, layout="polaroid"):
    return {"slide_type": "marketplace/image-show", "title": title,
            "slide_attributes": {"config": {
                "title": title, "displayMode": "tiledWall",
                "wallMotion": "drift", "wallLayout": layout,
                "allowCaptions": True, "showParticipantNames": True}}}


def ranking(title, items, picks):
    return {"slide_type": "ranking", "title": title,
            "slide_attributes": {
                "rankingItems": [{"index": i, "text": t}
                                 for i, t in enumerate(items)],
                "rankingPicksPerParticipant": picks}}


def opening(part):
    """QR join, word cloud, confidence scale and Q&A, after the title page."""
    p = "ABC"[part - 1]
    return [
        dict(id=f"{p}1", part=part, after=1, tier="core", minutes=1,
             slide={"slide_type": "qr_code"},
             notes=f"Students join at ahaslides.com with code {JOIN[part]} or by "
                   "scanning the QR code. Names are required on join, so the "
                   "leaderboard and the spinner wheels show real names. Keep this "
                   "slide up while the room settles and watch the count rise."),
        dict(id=f"{p}2", part=part, after=1, tier="core", minutes=1.5,
             slide={"slide_type": "word_cloud", "heading": WORD_PROMPT[part]},
             props={"entriesPerParticipant": 2},
             notes="Warm-up, no right answer. Do not correct anyone yet. The same "
                   "prompt returns at the end of class, so take a screenshot of "
                   "this cloud for the comparison."),
        dict(id=f"{p}3", part=part, after=1, tier="core", minutes=1,
             slide={"slide_type": "scale",
                    "heading": "Before we start: how confident are you?",
                    "options": [{"text": t} for t in CONFIDENCE[part]],
                    "scale_config": SCALE_CONFIG},
             notes="Baseline confidence on a 1 to 5 scale. The same three "
                   "statements return before the exit ticket, so the class can "
                   "see its own change. Read the averages aloud without comment."),
        dict(id=f"{p}4", part=part, after=1, tier="core", minutes=0.5,
             slide={"slide_type": "q&a",
                    "heading": "Questions? Ask them here at any time during class"},
             notes="Q&A stays open on every slide (presentation setting: Q&A on "
                   "all slides). Questions can be anonymous. Upvotes push a "
                   "question to the top. Check the Q&A at the leaderboard break "
                   "and at the end."),
    ]


def closing(part, review):
    """Review round, final leaderboard, word cloud again, scale, exit, raffle."""
    p = "ABC"[part - 1]
    rounds = [dict(id=f"{p}R{i + 1}", part=part, after=75, tier="core",
                   minutes=0.75,
                   slide={"slide_type": "pick_answer_quiz", "heading": h,
                          "options": opts, "correct": c},
                   props=REVIEW_PROPS, notes=n)
              for i, (h, opts, c, n) in enumerate(review)]
    rounds[0]["notes"] = ("Rapid-fire review: four questions, 20 seconds each, "
                          "speed bonus on. " + rounds[0]["notes"])
    return rounds + [
        dict(id=f"{p}90", part=part, after=75, tier="core", minutes=1,
             slide={"slide_type": "leaderboard"},
             notes="Final podium. Congratulate the top three by name and invite "
                   "everyone to the raffle at the end, where luck decides."),
        dict(id=f"{p}91", part=part, after=75, tier="opt", minutes=1.5,
             slide={"slide_type": "word_cloud",
                    "heading": "Again, i" + WORD_PROMPT[part][1:]},
             props={"entriesPerParticipant": 2},
             notes="The opening prompt again. Show the screenshot of the first "
                   "cloud next to this one and ask what changed."),
        dict(id=f"{p}92", part=part, after=75, tier="core", minutes=1,
             slide={"slide_type": "scale",
                    "heading": "After class: how confident are you now?",
                    "options": [{"text": t} for t in CONFIDENCE[part]],
                    "scale_config": SCALE_CONFIG},
             notes="The same three statements as the opening scale. Compare the "
                   "averages with the baseline aloud. The statement with the "
                   "smallest gain is the one to revisit next class."),
        dict(id=f"{p}93", part=part, after=75, tier="core", minutes=2,
             slide={"slide_type": "open_ended_survey",
                    "heading": "Exit ticket: what is still unclear after today? "
                               "One sentence."},
             notes="The exit ticket. Responses carry names, so they can be "
                   "followed up. Skim them after class and open the next session "
                   "with the two most common points."),
        dict(id=f"{p}94", part=part, after=75, tier="core", minutes=1,
             slide={"slide_type": "marketplace/duck-race",
                    "slide_attributes": {"config": {"durationSeconds": 20,
                                                    "resultMode": "winner"}}},
             notes="Prize raffle. Every joined student becomes a duck and the "
                   "winner is pure luck, so students who scored low on the "
                   "quizzes still have a chance."),
    ]


# ── Part 1: Why study regional development ──────────────────────────────────
PART1 = opening(1) + [
    dict(id="A5", part=1, after=2, tier="opt", minutes=1.5,
         slide={"slide_type": "poll",
                "heading": "After the video: in your country, which problem "
                           "would better maps help most?",
                "options": ["Health crises and pandemics", "Natural disasters",
                            "Poverty and food security", "Climate change"]},
         props=POLL_PROPS,
         notes="No right answer. The Esri video shows maps answering questions "
               "in a crisis: where, how many, who is affected. Ask one or two "
               "students why they chose their answer, then move to the outline."),
    dict(id="A6", part=1, after=4, tier="core", minutes=2,
         slide=ranking("Why study regional development? Rank your top three "
                       "reasons",
                       ["Target poverty programs to the right places",
                        "Reduce inequality between regions",
                        "Plan cities and infrastructure",
                        "Monitor the SDGs locally",
                        "Evaluate place-based policies"], 3),
         notes="Each student ranks three of five reasons; the result uses a "
               "Borda count. Use the top reason as the thread of the lecture: "
               "every section that follows returns to it. Section 1 answers why "
               "regions matter, section 2 how to measure them from space, and "
               "section 3 which tools to use."),
    dict(id="A7", part=1, after=5, tier="core", minutes=1.5,
         slide=pin("Drop a pin on the poorest part of this photo", 5),
         notes="The Rio de Janeiro photo, now as a pin board. Most pins should "
               "land on the informal settlement in the foreground, a few on "
               "the high-rise blocks. Ask the room what visual cues they used: "
               "roofs, density, roads, green space. Those cues are exactly what "
               "daytime satellite images measure in section 2."),
    dict(id="A8", part=1, after=5, tier="core", minutes=2,
         slide=idea_board("How would you measure the development gap in this "
                          "photo? Name one indicator",
                          ["Income and consumption", "Housing and "
                           "infrastructure", "Health and education", "Other"],
                          2),
         notes="The slide asked how we can measure, predict and explain these "
               "gaps. Collect indicators for 90 seconds, then open voting (two "
               "votes each) and read the top three. Point out which ones need a "
               "survey and which ones can be seen from above."),
    dict(id="A9", part=1, after=6, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "This Sao Paulo photo was taken in 2004. By 2021, "
                           "the gap between the two neighborhoods was...",
                "options": ["Much narrower", "About the same", "Wider"]},
         props=POLL_PROPS,
         notes="A prediction poll; do not reveal the answer. The next slide shows "
               "the same spot in 2004 and 2021: the favela of Paraisopolis and "
               "the luxury towers next to it look almost unchanged, and El Pais "
               "(2022) reported that little has changed in nearly 20 years. The "
               "answer is B, about the same: gaps can persist for decades."),
    dict(id="A10", part=1, after=7, tier="core", minutes=3,
         slide=photo_share("Share a photo of a development gap you have seen "
                           "in your home region"),
         notes="Students upload one photo from their phone, with a caption that "
               "names the place. Photos from the internet are fine if they have "
               "none of their own. Pick two photos and ask their owners what the "
               "gap is and whether it shows a geographic pattern."),
    dict(id="A11", part=1, after=9, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: what can the view from above show that a "
                           "GDP table cannot?",
                "options": []},
         props=SPIN_PROPS,
         notes="Spin the wheel; it fills itself with joined names. Good answers: "
               "where growth happens inside a city or country, how fast cities "
               "expand, change over time without waiting for a census, and places "
               "with no official statistics at all."),
    dict(id="A12", part=1, after=10, tier="opt", minutes=1.5,
         slide={"slide_type": "marketplace/interactive-images",
                "title": "Tap each goal: why does it need local data?",
                "slide_attributes": {"config": {
                    "title": "Tap each goal: why does it need local data?",
                    "backgroundImageUrl": IMAGES["10"],
                    "hotspots": [
                        {"id": "hs_1", "x": 26, "y": 50,
                         "title": "SDG 11: Cities and communities",
                         "description": "Slums, transport and housing differ "
                                        "block by block, so a national average "
                                        "hides the neighborhoods in need."},
                        {"id": "hs_2", "x": 52, "y": 52,
                         "title": "Leave no one behind",
                         "description": "The 2030 Agenda asks for data "
                                        "disaggregated by location, not only by "
                                        "country."},
                        {"id": "hs_3", "x": 70, "y": 41,
                         "title": "SDG 10: Reduced inequalities",
                         "description": "Inequality between regions is part of "
                                        "total inequality and only shows up in "
                                        "subnational data."},
                        {"id": "hs_4", "x": 81, "y": 41,
                         "title": "SDG 13: Climate action",
                         "description": "Floods, droughts and heat hit specific "
                                        "places, so adaptation needs local "
                                        "exposure maps."},
                        {"id": "hs_5", "x": 76, "y": 60,
                         "title": "SDG 8: Decent work and growth",
                         "description": "Growth is uneven across regions; local "
                                        "data show where jobs and income are "
                                        "rising or falling."}]}}},
         notes="Students tap the numbered pins on their phones and read at their "
               "own pace while you talk through the slide. No scoring. Ask which "
               "goal matters most in their own country, which leads into the "
               "next ranking."),
    dict(id="A13", part=1, after=10, tier="opt", minutes=1.5,
         slide=ranking("Which goal most needs data for small regions? Rank "
                       "your top three",
                       ["SDG 1: No poverty", "SDG 8: Decent work and growth",
                        "SDG 10: Reduced inequalities",
                        "SDG 11: Sustainable cities",
                        "SDG 13: Climate action"], 3),
         notes="No right answer. Many students put SDG 1 first: poverty maps "
               "are the classic use of subnational data. Note the goal that "
               "ranks last and ask one student to argue for it."),
    dict(id="A14", part=1, after=11, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Do we have enough data to study regional "
                           "development in your country?",
                "options": ["Yes, for most regions",
                            "Only for large regions such as states",
                            "No, data are scarce or outdated",
                            "I do not know"]},
         props=POLL_PROPS,
         notes="An honest answer from the room before the data tour. Students "
               "from countries with recent censuses tend to answer A or B. "
               "Keep the result in mind: section 2 argues that satellites fill "
               "exactly the gap behind answers B and C."),
    dict(id="A15", part=1, after=11, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Next video: Rosling starts in 1810. In that year, "
                           "life expectancy in every country was below...",
                "options": ["40 years", "60 years", "25 years"],
                "correct": "A"},
         props=QUIZ_PROPS,
         notes="Answer: A, 40 years. In 1810 all countries were poor and sick, "
               "with life expectancy below 40. The four-minute video that follows "
               "shows 200 years of divergence and then convergence. Play it in "
               "full (core)."),
    dict(id="A16", part=1, after=12, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Now Rosling splits China into provinces. Rich "
                           "Shanghai matches which country in health and "
                           "wealth?",
                "options": ["Pakistan", "Italy", "Ghana"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes="Answer: B, Italy. The next video starts at 3:40, where Rosling "
               "splits China: Shanghai has the health and wealth of Italy, the "
               "inland province Guizhou is like Pakistan, and the poorest rural "
               "west is like Ghana. One country holds the whole world inside it."),
    dict(id="A17", part=1, after=13, tier="core", minutes=1,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each part of China to the country it "
                           "resembles (Rosling, 2009)",
                "pairs": [
                    {"left_item": "Shanghai", "right_item": "Italy"},
                    {"left_item": "Guizhou province", "right_item": "Pakistan"},
                    {"left_item": "The poorest rural west",
                     "right_item": "Ghana"}]},
         props=QUIZ_PROPS,
         notes="Answer: Shanghai is Italy, Guizhou is Pakistan, the rural west is "
               "Ghana. The point for the course: a national average for China "
               "describes none of these places. That is the case for "
               "subnational data."),
    dict(id="A18", part=1, after=13, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "The McKinsey study Pixels of Progress splits the "
                           "world into how many micro regions?",
                "options": ["About 200", "About 4,000", "More than 40,000"],
                "correct": "C"},
         props=QUIZ_PROPS,
         notes="Answer: C. Pixels of Progress (McKinsey Global Institute) "
               "uses more than 40,000 micro regions, about 230 times more "
               "granular than a country view; each averages about 180,000 "
               "people. Night lights helped build it. The next two slides show "
               "one bubble for the world and then the world through a regional "
               "microscope."),
    dict(id="A19", part=1, after=14, tier="opt", minutes=1,
         slide=true_false("A world average of 73 years of life and USD 16,800 "
                          "of income per person describes most places well.",
                          "false"),
         notes="Answer: False. The single bubble on the previous slide hides a "
               "wide cloud of micro regions, far above and below the average in "
               "both life expectancy and income, as the next slide shows. "
               "Averages are a summary, not a description."),
    dict(id="A20", part=1, after=17, tier="core", minutes=1,
         slide=fill_in("Complete the definition of a raster image",
                       "A raster image is a grid of [blank], and each one "
                       "stores a [blank].",
                       [("pixels", ["polygons", "pixels", "points"]),
                        ("value", ["border", "name", "value"])]),
         notes="Answer: pixels, value. A raster is a set of pixels and also an "
               "array of numbers, which is why satellite images can enter a "
               "regression like any other data. Polygons and points are vector "
               "data, the other main type of spatial data."),
    dict(id="A21", part=1, after=17, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="Halfway leaderboard. Then the GeoQuery video and the data tour."),
    dict(id="A22", part=1, after=18, tier="core", minutes=1,
         slide=true_false("GeoQuery requires coding or mapping software.",
                          "false"),
         notes="Answer: False. GeoQuery (AidData) filters and aggregates "
               "geospatial data to provinces or districts and returns a "
               "spreadsheet, without code or mapping software. That makes it the "
               "easiest entry point for the portal stop that follows the tour."),
    dict(id="A23", part=1, after=26, tier="core", minutes=8,
         slide={"slide_type": "open_ended_survey",
                "heading": "Portal stop: find one subnational indicator for "
                           "your country. Write the indicator, the portal and "
                           "the level (state, district or pixel)."},
         notes="The hands-on stop, about eight minutes on laptops. Portals: "
               + ", ".join(TOOLS["portals"]) + ". Suggest GeoQuery or Global "
               "Data Lab for beginners. Walk around and help. Close by reading "
               "three answers that use different levels, and ask which level "
               "would be best for their own research question."),
    dict(id="A24", part=1, after=26, tier="core", minutes=1.5,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each portal to what it offers",
                "pairs": [
                    {"left_item": "AidData GeoQuery",
                     "right_item": "Data aggregated to provinces and "
                                   "districts, no code"},
                    {"left_item": "Global Data Lab",
                     "right_item": "A subnational Human Development Index"},
                    {"left_item": "NASA SEDAC",
                     "right_item": "Population and socioeconomic grids"},
                    {"left_item": "World Bank poverty portal",
                     "right_item": "Subnational poverty maps from surveys"}]},
         props=QUIZ_PROPS,
         notes="Answer as listed. Earth Engine and the community catalog are the "
               "raster archives behind many of these products; they return in "
               "Part 3 with Earth Engine itself."),
    dict(id="A25", part=1, after=27, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/budget-allocation-v2",
                "title": "Split 100 points of research time across these data "
                         "sources",
                "slide_attributes": {"config": {
                    "prompt": "Split 100 points of research time across these "
                              "data sources",
                    "unit": "points", "total": 100, "resultsChartType": "bars",
                    "options": [
                        {"id": "surveys", "label": "Household surveys"},
                        {"id": "admin", "label": "Census and admin records"},
                        {"id": "satellite", "label": "Satellite images"},
                        {"id": "mobile", "label": "Mobile phone and web data"}]}}},
         notes="No right answer. Compare the average split with the room "
               "answers to the data poll earlier: rooms that said data are "
               "scarce often give satellites more points. The next video argues "
               "for geospatial big data."),
] + closing(1, [
    ("In the Rosling video, which Chinese province looks like Pakistan?",
     ["Shanghai", "Guizhou", "Beijing"], "B",
     "Answer: B, Guizhou, the poor inland province."),
    ("A raster image is best described as...",
     ["A grid of pixels, each with a value", "A set of country borders",
      "A table of survey answers"], "A",
     "Answer: A. Borders are vector data; survey tables are not spatial at all."),
    ("The Sao Paulo photos from 2004 and 2021 show that the gap...",
     ["Closed completely", "Moved to another city", "Has hardly changed"], "C",
     "Answer: C. Regional gaps can persist for decades."),
    ("Which portal offers a subnational Human Development Index?",
     ["NASA SEDAC", "Global Data Lab", "Earth Engine catalog"], "B",
     "Answer: B, Global Data Lab."),
])

# ── Part 2: Studying regional development from outer space ──────────────────
PART2 = opening(2) + [
    dict(id="B5", part=2, after=30, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Have you ever worked with satellite data?",
                "options": ["Never", "I have seen it in papers or reports",
                            "I have used it myself"]},
         props=POLL_PROPS,
         notes="A quick baseline. If most answer A, slow down at the night "
               "lights apps; if many answer C, ask one of them to help a "
               "neighbor during the hands-on stops."),
    dict(id="B6", part=2, after=31, tier="core", minutes=1.5,
         slide={"slide_type": "word_cloud",
                "heading": "In one word: why are official statistics weak in "
                           "many poor countries?"},
         props={"entriesPerParticipant": 2},
         notes="Collect words for a minute. The next slide gives the answer in "
               "three words: data are unavailable, unreliable and uncomparable. "
               "Check how many of the three words the cloud already holds."),
    dict(id="B7", part=2, after=32, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: give an example of missing or "
                           "unreliable data from your country",
                "options": []},
         props=SPIN_PROPS,
         notes="Spin; the wheel holds the joined names. Typical examples: an old "
               "census, GDP rebased by a large amount, no data below the state "
               "level, or a conflict area with no surveys. Poor Numbers (Jerven, "
               "2013) on the slide tells this story for Africa."),
    dict(id="B8", part=2, after=33, tier="core", minutes=1,
         slide=fill_in("Complete the case for satellite data",
                       "In many poor countries, satellite data are [blank], "
                       "[blank] and [blank].",
                       [("reliable", ["expensive", "reliable", "secret"]),
                        ("available", ["available", "rare", "private"]),
                        ("comparable", ["local", "unique", "comparable"])]),
         notes="Answer: reliable, available and comparable, the mirror image of "
               "the previous slide. The papers on the slide, many of them "
               "highly cited, use these data to measure growth, convergence and "
               "inequality across regions."),
    dict(id="B9", part=2, after=35, tier="core", minutes=1.5,
         slide=pin("Drop a pin on your home region", 35),
         notes="The world at night as a pin board. The heatmap shows where the "
               "class comes from. Ask two students whether their home region "
               "is brighter or darker than they expected, and why."),
    dict(id="B10", part=2, after=35, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: name a bright place and a dark place on "
                           "this map. Why the difference?",
                "options": []},
         props=SPIN_PROPS,
         notes="Expected answers: income, population density, electrification, "
               "and also deserts, forests and ice with nobody living there. The "
               "next video makes the same point: dark is not always poor."),
    dict(id="B11", part=2, after=37, tier="core", minutes=1,
         slide=true_false("Night lights measure income directly.", "false"),
         notes="Answer: False. Night lights are a proxy: they track economic "
               "activity, population and electricity use together. They work "
               "well where official data are weak, but they need calibration "
               "against data on income or output, as the World Bank video "
               "shows for South Asia."),
    dict(id="B12", part=2, after=39, tier="core", minutes=8,
         slide=photo_share("Lights app stop: share a screenshot of the most "
                           "striking change, with the place in the caption",
                           layout="masonry"),
         notes="The first hands-on stop, about eight minutes. Students open "
               + TOOLS["lights_app"] + " on their laptops, move the slider "
               "between the two years, and upload a screenshot with the place "
               "and their explanation in the caption. Show the wall at the end "
               "and ask two students to explain theirs."),
    dict(id="B13", part=2, after=40, tier="core", minutes=1.5,
         slide=pin("Drop a pin on North Korea", 40),
         notes="No labels on the map. Most pins should land in the dark area "
               "north of the bright South Korea. The border is a light border: "
               "same geography, very different economies. Ask what else, besides "
               "income, could make a country this dark."),
    dict(id="B14", part=2, after=40, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "The next map mixes three years as colors: red = "
                           "2013, green = 2003, blue = 1993. A place lit in "
                           "all three years looks...",
                "options": ["Red", "White", "Blue"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes="Answer: B, white. Red, green and blue at full brightness add up "
               "to white, so stable old lights are white. The next quiz asks "
               "about new lights."),
    dict(id="B15", part=2, after=40, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Same map. A place dark in 1993 and 2003 but lit in "
                           "2013 looks...",
                "options": ["White", "Blue", "Red"],
                "correct": "C"},
         props=QUIZ_PROPS,
         notes="Answer: C, red, because red is 2013 only. Yellow (red plus green) "
               "means lit since 2003. On the next slide, much of China is red and "
               "yellow, Japan is white, and North Korea stays dark."),
    dict(id="B16", part=2, after=41, tier="core", minutes=6,
         slide={"slide_type": "open_ended_survey",
                "heading": "RGB app stop: name a city or region that lit up "
                           "recently (red or yellow) and its country."},
         notes="The second hands-on stop, about six minutes. Students open "
               + TOOLS["rgb_app"] + " and look for red or yellow places. Good "
               "finds: inland China, parts of India, the Gulf, West Africa. Ask "
               "what changed there between 1993 and 2013."),
    dict(id="B17", part=2, after=42, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Which sensor gives sharper night lights, with "
                           "less blurring and no top-coding in city centers?",
                "options": ["DMSP (1992 to 2013)", "VIIRS (since 2012)",
                            "Landsat"],
                "correct": "B"},
         props=QUIZ_PROPS,
         notes="Answer: B, VIIRS. DMSP blurs light into nearby areas and caps "
               "bright city centers, so it understates inequality and growth in "
               "dense places. Gibson argues for VIIRS, and for VIIRS-like series "
               "that extend it back in time. Landsat is a daytime sensor."),
    dict(id="B18", part=2, after=42, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="Halfway leaderboard."),
    dict(id="B19", part=2, after=43, tier="opt", minutes=1,
         slide=true_false("Night lights work equally well in dense cities and "
                          "in sparsely populated rural areas.", "false"),
         notes="Answer: False. In sparse rural areas, much economic activity "
               "(farming) emits little light, so lights understate rural output. "
               "The Waikato video makes this point with the United States."),
    dict(id="B20", part=2, after=44, tier="opt", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Which recommended book will you open first?",
                "options": ["Power and the Vote (Min)", "Earth at Night (NASA)",
                            "Nighttime Lights as a Proxy for Regions",
                            "Pixels of Progress (McKinsey)",
                            "Growth out of the Blue (World Bank)",
                            "Mapping poverty with AI (ADB)"]},
         props=POLL_PROPS,
         notes="All six are free. The links are on the slide in the Canva "
               "version of the deck."),
    dict(id="B21", part=2, after=45, tier="core", minutes=2.5,
         slide=idea_board("What can daytime images show that night lights "
                          "cannot?",
                          ["Housing and roofs", "Roads and infrastructure",
                           "Farms and land use", "Other"], 2),
         notes="Two minutes of ideas, then voting. Expected: roof materials, "
               "building size, roads, crops, water and green space, all visible "
               "in rural areas where night lights are dark. Machine learning "
               "turns these features into poverty estimates (next slides)."),
    dict(id="B22", part=2, after=46, tier="core", minutes=1.5,
         slide={"slide_type": "categorise_quiz",
                "heading": "Which images fit each task best?",
                "options": [
                    {"name": "Nighttime images",
                     "items": ["Brightness of a growing city",
                               "Electrification of towns"]},
                    {"name": "Daytime images",
                     "items": ["Roof materials in a village",
                               "Crop fields and farmland"]}]},
         props=QUIZ_PROPS,
         notes="Answer: nighttime images for city brightness and electrification; "
               "daytime images for roofs and crops. The slide summary pairs "
               "nighttime images with urban development and daytime images with "
               "rural development."),
    dict(id="B23", part=2, after=46, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Should a government use satellite images to decide "
                           "who receives cash transfers?",
                "options": ["Yes", "Yes, but only with other data", "No",
                            "Not sure"]},
         props=POLL_PROPS,
         notes="Opinion poll before the BBC video on Togo, where satellite images "
               "and phone data targeted cash during the pandemic. Do not discuss "
               "yet; the 2x2 after the video does."),
    dict(id="B24", part=2, after=47, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/two-by-two-grid-v2",
                "title": "Targeting cash with satellite data: where does each "
                         "risk land?",
                "slide_attributes": {"config": {
                    "question": "Targeting cash with satellite data: where does "
                                "each risk land?",
                    "xAxisLabel": "How likely",
                    "yAxisLabel": "How much harm",
                    "items": [
                        {"id": "i1", "label": "Poor families in rich-looking "
                                              "areas are missed", "color": ""},
                        {"id": "i2", "label": "People without a phone cannot "
                                              "receive cash", "color": ""},
                        {"id": "i3", "label": "The images are out of date",
                         "color": ""},
                        {"id": "i4", "label": "Household privacy is exposed",
                         "color": ""}],
                    "canSkip": False}}},
         notes="Unscored. Compare with the poll before the video: did the video "
               "change minds? Missed poor households in rich-looking areas is the "
               "classic error of area-based targeting."),
] + closing(2, [
    ("Satellite data help in data-poor countries because they are...",
     ["Reliable, available and comparable", "Cheaper than any survey",
      "Collected by national governments"], "A",
     "Answer: A."),
    ("In the RGB night lights map, a place lit in all three years looks...",
     ["Red", "Blue", "White"], "C",
     "Answer: C, white."),
    ("Which country is almost dark at night next to bright neighbors?",
     ["Japan", "North Korea", "South Korea"], "B",
     "Answer: B, North Korea."),
    ("Night lights are best described as...",
     ["A proxy for economic activity", "A direct measure of income",
      "A census of the population"], "A",
     "Answer: A, a proxy."),
])

# ── Part 3: Standing on the shoulders of geospatial data science ────────────
PART3 = opening(3) + [
    dict(id="C5", part=3, after=50, tier="opt", minutes=2,
         slide={"slide_type": "open_ended_survey",
                "heading": "Whose shoulders do you stand on? Name a researcher, "
                           "book or course that shaped your work."},
         notes="A warm, personal opener after the two quotes. Read three answers "
               "aloud. Science is cumulative, and so is this course: the tools "
               "in this lecture were built by others for us to reuse."),
    dict(id="C6", part=3, after=50, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Data science needs domain knowledge, coding and "
                           "statistics. Which is your strongest?",
                "options": ["Domain knowledge", "Coding", "Statistics"]},
         props=POLL_PROPS,
         notes="Most master students in development pick domain knowledge. The "
               "Venn diagram on the next slide puts data science where all three "
               "meet; the tools at the end of the lecture lower the coding bar."),
    dict(id="C7", part=3, after=52, tier="core", minutes=1,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each field to its focus",
                "pairs": [
                    {"left_item": "GIS",
                     "right_item": "Storing, mapping and managing geographic "
                                   "data"},
                    {"left_item": "Data science",
                     "right_item": "Learning from data with coding and "
                                   "statistics"},
                    {"left_item": "Spatial data science",
                     "right_item": "Data science where location and space "
                                   "matter"}]},
         props=QUIZ_PROPS,
         notes="Answer as listed. Spatial data science sits in the overlap on the "
               "slide: it treats location as information, not only as a label."),
    dict(id="C8", part=3, after=52, tier="core", minutes=1,
         slide=fill_in("Guess the first law of geography",
                       "Everything is related to everything else, but [blank] "
                       "things are more related than [blank] things.",
                       [("near", ["near", "large", "old"]),
                        ("distant", ["small", "distant", "new"])]),
         notes="Answer: near, distant. Waldo Tobler, 1970. The next slide shows "
               "the quote. It is the reason for spatial dependence: neighboring "
               "regions share markets, climate and policy, so their outcomes "
               "move together."),
    dict(id="C9", part=3, after=53, tier="opt", minutes=1.5,
         slide={"slide_type": "spinner_wheel",
                "heading": "Cold call: give an example of the first law of "
                           "geography from your country",
                "options": []},
         props=SPIN_PROPS,
         notes="Good examples: poverty clusters in neighboring districts, house "
               "prices, crime, disease spread, growth spilling over from a big "
               "city to its neighbors."),
    dict(id="C10", part=3, after=55, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "GeoDa is free point-and-click software. How many "
                           "users did it have by 2020?",
                "options": ["About 3,600", "About 36,000", "About 360,000"],
                "correct": "C"},
         props=QUIZ_PROPS,
         notes="Answer: C, about 360,000 users as of September 2020, shown at "
               "the start of the next video. GeoDa comes from the Center for "
               "Spatial Data Science (Luc Anselin)."),
    dict(id="C11", part=3, after=58, tier="opt", minutes=1,
         slide=true_false("GeoDa requires programming skills.", "false"),
         notes="Answer: False. GeoDa is point-and-click, which makes it the "
               "easiest first step. The free video lectures of Prof. Anselin and "
               "the two-volume GeoDa workbook teach it from scratch."),
    dict(id="C12", part=3, after=60, tier="core", minutes=1,
         slide={"slide_type": "pick_answer_quiz",
                "heading": "Why is Google Earth Engine called a supercomputer "
                           "for you?",
                "options": ["It runs the analysis on Google servers, so you do "
                            "not download the images",
                            "It makes your own laptop faster",
                            "It works offline, without internet"],
                "correct": "A"},
         props=QUIZ_PROPS,
         notes="Answer: A. Earth Engine stores petabytes of satellite images and "
               "runs your code in the cloud; your laptop only sends the script "
               "and receives the result. The video that follows shows it."),
    dict(id="C13", part=3, after=62, tier="core", minutes=0.5,
         slide={"slide_type": "leaderboard"},
         notes="Halfway leaderboard."),
    dict(id="C19", part=3, after=64, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Have you used an AI assistant to write code for "
                           "your research?",
                "options": ["Yes, often", "A few times", "Never"]},
         props=POLL_PROPS,
         notes="Sets up the AI-based programming slides. If most answer C, show "
               "one example prompt live: ask an assistant for R or Python code "
               "that maps a variable by district, then read the code together "
               "before running it. The point is to read and check the code, not "
               "only to run it."),
    dict(id="C20", part=3, after=68, tier="opt", minutes=2,
         slide={"slide_type": "marketplace/two-by-two-grid-v2",
                "title": "Place each tool: how easy to start, and how strong "
                         "with satellite images?",
                "slide_attributes": {"config": {
                    "question": "Place each tool: how easy to start, and how "
                                "strong with satellite images?",
                    "xAxisLabel": "Easy to start",
                    "yAxisLabel": "Strong with satellite images",
                    "items": [
                        {"id": "i1", "label": "GeoDa", "color": ""},
                        {"id": "i2", "label": "Google Earth Engine",
                         "color": ""},
                        {"id": "i3", "label": "R", "color": ""},
                        {"id": "i4", "label": "Python", "color": ""},
                        {"id": "i5", "label": "Excel", "color": ""}],
                    "canSkip": False}}},
         notes="Unscored. A reasonable picture: GeoDa and Excel easy but weak "
               "with images; Earth Engine strongest with images and moderate to "
               "start; R and Python flexible, harder to start, strong once "
               "learned. There is no single best tool; it depends on the "
               "question."),
    dict(id="C14", part=3, after=68, tier="core", minutes=1.5,
         slide={"slide_type": "match_pairs_quiz",
                "heading": "Match each tool to a free resource to learn it",
                "pairs": [
                    {"left_item": "GeoDa",
                     "right_item": "An Introduction to Spatial Data Science "
                                   "with GeoDa"},
                    {"left_item": "Google Earth Engine",
                     "right_item": "Cloud-Based Remote Sensing with Google "
                                   "Earth Engine"},
                    {"left_item": "R",
                     "right_item": "Spatial Data Science with Applications "
                                   "in R"},
                    {"left_item": "Python",
                     "right_item": "Geographic Data Science with Python"}]},
         props=QUIZ_PROPS,
         notes="Answer as listed; all four books are on the previous slides and "
               "free to read online."),
    dict(id="C15", part=3, after=68, tier="core", minutes=1,
         slide={"slide_type": "poll",
                "heading": "Which tool will you try first after this class?",
                "options": ["GeoDa", "Google Earth Engine", "R", "Python"]},
         props=POLL_PROPS,
         notes="No right answer. Point out that the AI-based approach on the "
               "previous slides (asking an assistant to draft code) makes R and "
               "Python much easier to start than a few years ago."),
    dict(id="C16", part=3, after=68, tier="opt", minutes=1.5,
         slide=ranking("Rank these tools from easiest to hardest to start "
                       "with", ["GeoDa", "Google Earth Engine", "R", "Python"],
                       4),
         notes="Borda count result. GeoDa usually ranks easiest. Ask a student "
               "who ranked Python or R first why."),
    dict(id="C21", part=3, after=69, tier="core", minutes=1,
         slide={"slide_type": "correct_order_quiz",
                "heading": "Put the steps of a geospatial notebook in order",
                "options": [
                    {"position": 1, "text": "Install and import the libraries"},
                    {"position": 2, "text": "Load the map and the data"},
                    {"position": 3, "text": "Explore the indicator with tables "
                                            "and charts"},
                    {"position": 4, "text": "Map it and test for spatial "
                                            "dependence"}]},
         props=QUIZ_PROPS,
         notes="Answer: install, load, explore, then map and test. These are the "
               "sections of the Bolivia notebook that students open in the Colab "
               "stop: setup, import data, exploratory data analysis, then "
               "exploratory spatial data analysis."),
    dict(id="C17", part=3, after=71, tier="core", minutes=8,
         slide={"slide_type": "short_answer_quiz",
                "heading": "Colab stop: run the Bolivia notebook through "
                           "Section 4. Which municipality has the LOWEST "
                           "development index (imds)?",
                "correct_answer": "Poroma"},
         props={"timeToAnswer": 480, "fastAnswerGetMorePoint": True},
         notes="The coding stop, about eight minutes. Students open "
               + TOOLS["colab_bolivia"] + " (the Link to the tutorial on the "
               "slide), run the setup cells, load the data and run the table "
               "sorted by imds in Section 4. The last row is Poroma (35.7), the "
               "least developed of the 339 municipalities; La Paz is first "
               "(80.2). Students who finish early can open the maps in Section "
               "5 and look for clusters of low imds: the first law of geography "
               "again."),
    dict(id="C18", part=3, after=72, tier="core", minutes=3,
         slide=idea_board("A regional development question you want to study "
                          "with geospatial data",
                          ["Poverty and inequality", "Cities and "
                           "infrastructure", "Environment and climate",
                           "Other"], 3),
         notes="The final remarks, made concrete. Two minutes to post, then three "
               "votes each. Discuss the top two: which data and which tool from "
               "this course would answer them? These can become term paper "
               "topics."),
] + closing(3, [
    ("The first law of geography says that near things are...",
     ["Less related than distant things", "More related than distant things",
      "Unrelated to distant things"], "B",
     "Answer: B (Tobler, 1970)."),
    ("Which free tool is point-and-click?",
     ["Google Earth Engine", "Python", "GeoDa"], "C",
     "Answer: C, GeoDa."),
    ("Spatial data science is best described as...",
     ["Data science where location matters", "GIS without any data",
      "Statistics without coding"], "A",
     "Answer: A."),
    ("In the Bolivia notebook, which municipality has the lowest development "
     "index?", ["La Paz", "Poroma", "Cochabamba"], "B",
     "Answer: B, Poroma. La Paz has the highest."),
])

ACTIVITIES = PART1 + PART2 + PART3
