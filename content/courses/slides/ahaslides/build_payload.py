#!/usr/bin/env python3
"""deck_part{1,2,3}.json + slide_ids.json -> payload_part{1,2,3}.json (gitignored).

    python3 build_deck_json.py && python3 build_payload.py

Each payload holds:

- `create`: one `create_slides` call per anchor page, with
  `insert_after_slide_id` already resolved from slide_ids.json (the image or
  YouTube slide of that page). Several slides after one page go in ONE call, in
  display order, so they land in order.
- `update_props`: `update_slide_properties` bodies (timers, speed points, poll
  single choice, spinner name auto-fill, word-cloud entries). New slides get an
  `id` only after they exist, so each entry names its `activity`; map it to the
  created slide ID (record those in slide_ids.json under "interactive").

Option order. AhaSlides displays poll and pick-answer options in REVERSE payload
order, so they are lettered ("A. ...") and sent reversed (see the FWL README).

Notes. Every slide gets its tier and time as a prefix ("CORE, about 1 min." or
"OPTIONAL: skip if behind, about 2 min.").
"""
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
IDS = json.loads((HERE / "slide_ids.json").read_text(encoding="utf-8"))

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
    """The create body of one interactive slide, notes included."""
    sl = json.loads(json.dumps(s["slide"]))
    t = sl["slide_type"]
    if t == "poll":
        sl["options"] = [{"text": txt} for txt, _ in lettered_reversed(sl["options"])]
    elif t == "pick_answer_quiz":
        sl["options"] = [{"text": txt, "correct": ok} for txt, ok in
                         lettered_reversed(sl["options"], sl.pop("correct"))]
    prefix = "CORE" if s["tier"] == "core" else "OPTIONAL: skip if behind"
    sl["notes"] = f"{prefix}, about {s['minutes']:g} min. {s['notes']}"
    return sl


for part in (1, 2, 3):
    deck = json.loads((HERE / f"deck_part{part}.json").read_text(encoding="utf-8"))
    pages = IDS[str(part)]["pages"]
    create, update_props = [], []
    for s in deck["slides"]:
        if s["kind"] != "interactive":
            continue
        if not create or create[-1]["after_page"] != s["afterPage"]:
            create.append({"after_page": s["afterPage"],
                           "insert_after_slide_id": pages[str(s["afterPage"])],
                           "activities": [], "slides": []})
        create[-1]["activities"].append(s["id"])
        create[-1]["slides"].append(body(s))
        if s["props"]:
            if s["slideType"] not in PROPS_TYPE:
                raise SystemExit(f"{s['id']}: no update_slide_properties type "
                                 f"for {s['slideType']}")
            update_props.append({"activity": s["id"],
                                 "type": PROPS_TYPE[s["slideType"]],
                                 **s["props"]})
    payload = {"presentation_id": IDS[str(part)]["presentation"],
               "create": create, "update_props": update_props}
    (HERE / f"payload_part{part}.json").write_text(
        json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    n = sum(len(c["slides"]) for c in create)
    print(f"part {part}: {n} new slides in {len(create)} create calls, "
          f"{len(update_props)} property updates; types "
          f"{dict(Counter(sl['slide_type'] for c in create for sl in c['slides']))}")
