"""The audience layer of the NUAL keynote (2026-10-30). Source of truth for
every interactive slide.

    python3 build.py

A light, anonymous, low-stakes set for an alumni audience of 50 to 200: no
scores, no leaderboard, no names. The deck is presented live first and then
switched to self-paced for the website, so every slide also works without a
presenter (no timers, results shown after answering).

Each activity: id, after (the page it follows; activities that share a page
are listed in display order), slide (the exact create_slides body), props
(update_slide_properties settings), notes (presenter notes, kept in deck.md
because image slides cannot carry notes).

Writing rules for the deck text (author preference): no em dashes, no
contractions, no possessive apostrophes. build.py checks them.
"""

OPEN_PROPS = {"hasTimeLimit": False}
POLL_PROPS = {"hasTimeLimit": False, "multipleChoice": False,
              "typeChart": "barChart", "showPercentage": True}
SCALE_CONFIG = {"low_label": "Not at all", "high_label": "Completely",
                "low_value": 1, "high_value": 5, "must_rate": True,
                "show_average": True, "show_mid_values": True}

ACTIVITIES = [
    dict(id="N0", after=1,
         slide={"slide_type": "qr_code"},
         props={},
         notes="Join slide. The audience scans the code or types the join code "
               "at ahaslides.com. No names are asked. Keep it up while people "
               "settle, then move to the agenda."),
    dict(id="N1", after=2,
         slide={"slide_type": "word_cloud",
                "heading": "In one word: how do you use AI in your work today?"},
         props={**OPEN_PROPS, "entriesPerParticipant": 3},
         notes="Warm-up, no right answer. Read the three biggest words aloud. "
               "Words such as writing, coding or searching set up the point of "
               "Section 1: AI makes production cheap."),
    dict(id="N2", after=4,
         slide={"slide_type": "poll",
                "heading": "Where does most of your AI-assisted work sit today?",
                # Poll options must be {"text": ...} objects (plain strings
                # are rejected since 2026-10).
                "options": [{"text": t} for t in [
                    "Old world: I still produce mostly by hand",
                    "Cheap to make, and I verify it carefully",
                    "Cheap to make, and I rarely verify it",
                    "I do not use AI tools yet"]]},
         props=POLL_PROPS,
         notes="Ask right after the trade-off chart. The third option (cheap "
               "to make, rarely verified) is the danger zone: cheap to make, "
               "expensive to confirm. Honest answers are the point, so stress "
               "that the poll is anonymous. Whatever its share, the rest of the "
               "talk is about moving that bar to the second option."),
    dict(id="N3", after=21,
         slide={"slide_type": "scale",
                "heading": "Before we move to research: where do you stand?",
                "options": [{"text": "I can verify AI output in my own field"},
                            {"text": "I will try planning mode or agent skills "
                                     "this month"}],
                "scale_config": SCALE_CONFIG},
         props=OPEN_PROPS,
         notes="Closes the learning section. Read both averages aloud. A gap "
               "between the two (willing to try, less sure about verifying) is "
               "the bridge to Section 3, where GitHub makes verification "
               "concrete."),
    dict(id="N4", after=33,
         slide={"slide_type": "open_ended_survey",
                "heading": "One thing you will try after today"},
         props=OPEN_PROPS,
         notes="Take-away. Give a minute, then read three or four answers. "
               "Answers are anonymous."),
    dict(id="N5", after=33,
         slide={"slide_type": "q&a",
                "heading": "Your questions"},
         props={},
         notes="Q&A is open on all slides, so questions asked during the talk "
               "are already here. Upvotes push a question to the top. Answer "
               "the top three, then close on the Thank You slide."),
]
