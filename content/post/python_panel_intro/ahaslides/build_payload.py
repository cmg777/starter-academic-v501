#!/usr/bin/env python3
"""deck.json -> payload.json: the AhaSlides MCP calls that build the audience layer.

    python3 build_deck_json.py && python3 build_payload.py

payload.json (gitignored) holds three lists:

- `create`: one `create_slides` call per anchor page. Send `slides` with
  `insert_after_slide_id` = the ID of the image slide at `after_image` (map page
  to ID by rank among the image slides in `slides_with_id_and_order`). Several
  slides after one page go in ONE call, in display order, so they land in order.
- `update_content`: `update_slide_content` bodies for kept slides whose text
  changed (none on this deck). Each carries the slide's AhaSlides `id`.
- `update_props`: `update_slide_properties` bodies (timers, speed points, poll
  single choice, spinner name auto-fill). New slides get `id` only after they
  exist, so each entry names its `activity`; map it to the created slide ID.

Option order. AhaSlides gives successive options `order` 1, 0.5, 0.25, ... and
every view sorts ascending, so options DISPLAY IN REVERSE payload order. Poll
and pick-answer options are lettered ("A. ...") and sent reversed, so they show
A, B, C and match the cue slides and the notes. Verified on python_fwl
(2026-09-28) and on this deck (2026-10-02).

Notes. New slides get their tier and time as a prefix ("CORE, about 1 min." or
"OPTIONAL: skip if behind, about 2 min."), so the presenter view shows which
slides can be dropped on the day.
"""
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
deck = json.loads((HERE / "deck.json").read_text(encoding="utf-8"))

# AhaSlides IDs of the seven slides kept from the first build (stable: their
# type never changes, and a type conversion is what changes a slide ID).
KEPT_IDS = {"I1": 160952923, "I2": 160952924, "I3": 160952925, "I4": 160952926,
            "I5": 160952927, "I6": 160952929, "I7": 160952930}
# Kept slides whose text changed and must be resent (none on this deck: the cue
# quizzes keep their text and notes; only their timers change).
CONTENT_UPDATES = set()

# slide_type -> the API type name update_slide_properties expects.
PROPS_TYPE = {
    "poll": "pollQuestion",
    "pick_answer_quiz": "multipleChoiceQuizQuestion",
    "short_answer_quiz": "shortAnswerQuizQuestion",
    "correct_order_quiz": "correctOrderQuizQuestion",
    "match_pairs_quiz": "matchPairsQuizQuestion",
    "categorise_quiz": "categoriseQuizQuestion",
    "word_cloud": "wordCloudQuestion",
    "scale": "scaleQuestion",
    "open_ended_survey": "openEndedQuestion",
    "spinner_wheel": "spinnerWheelQuestion",
}


def lettered_reversed(options, correct=None):
    rows = [(f"{chr(65 + i)}. {t}", chr(65 + i) == correct)
            for i, t in enumerate(options)]
    return list(reversed(rows))


def body(s):
    """The create/update body of one interactive slide, notes included."""
    sl = dict(s["slide"])
    t = sl["slide_type"]
    if t == "poll":
        sl["options"] = [{"text": txt} for txt, _ in lettered_reversed(sl["options"])]
    elif t == "pick_answer_quiz":
        sl["options"] = [{"text": txt, "correct": ok} for txt, ok in
                         lettered_reversed(sl["options"], sl.pop("correct"))]
    notes = s["notes"]
    if not s["legacy"] or s["id"] in CONTENT_UPDATES:
        prefix = ("CORE" if s["tier"] == "core" else "OPTIONAL: skip if behind")
        notes = f"{prefix}, about {s['minutes']:g} min. {notes}"
    sl["notes"] = notes
    return sl


inter = [s for s in deck["slides"] if s["kind"] == "interactive"]
create, update_content, update_props = [], [], []
for s in inter:
    if s["legacy"]:
        if s["id"] in CONTENT_UPDATES:
            update_content.append({"id": KEPT_IDS[s["id"]], **body(s)})
    else:
        if not create or create[-1]["after_image"] != s["afterImage"]:
            create.append({"after_image": s["afterImage"], "activities": [],
                           "slides": []})
        create[-1]["activities"].append(s["id"])
        create[-1]["slides"].append(body(s))
    if s["props"]:
        if s["slideType"] not in PROPS_TYPE:
            raise SystemExit(f"{s['id']}: no update_slide_properties type for "
                             f"{s['slideType']}")
        entry = {"activity": s["id"], "type": PROPS_TYPE[s["slideType"]],
                 **s["props"]}
        if s["legacy"]:
            entry["id"] = KEPT_IDS[s["id"]]
        update_props.append(entry)

payload = {"create": create, "update_content": update_content,
           "update_props": update_props}
(HERE / "payload.json").write_text(json.dumps(payload, indent=1, ensure_ascii=False)
                                   + "\n", encoding="utf-8")

n_new = sum(len(c["slides"]) for c in create)
print(f"wrote payload.json: {n_new} new slides in {len(create)} create calls, "
      f"{len(update_content)} content update(s), {len(update_props)} property "
      "updates")
print("  new types:", dict(Counter(sl["slide_type"] for c in create
                                    for sl in c["slides"])))
print("\nCreate plan (insert after the image slide at this page):")
for c in create:
    print(f"  page {c['after_image']:>2}: {', '.join(c['activities'])}")
