#!/usr/bin/env python3
"""deck_<lang>.json + slide_ids.json + images.json -> payload_<lang>.json
(gitignored).

    python3 build_deck_json.py && python3 build_payload.py

Each payload holds:

- `create`: one `create_slides` call per anchor page, with
  `insert_after_slide_id` resolved from slide_ids.json (the image or YouTube
  slide of that page). Several slides after one page go in ONE call, in display
  order, so they land in order.
- `update_props`: `update_slide_properties` bodies (quiz timers and speed
  points, poll single choice without a timer, word-cloud entries). Each entry
  names its `activity`; map it to the created slide ID (recorded in
  slide_ids.json under "interactive").

Pin slides use the imported page image as background: its AhaSlides CDN URL is
read from images.json ({lang: {page: url}}), taken from get_presentation_detail
(curated_slides[].canvasBlocks) after the import.

Option order: AhaSlides displays poll and pick-answer options in REVERSE payload
order, so they are lettered ("A. ...") and sent reversed (see the FWL README).
"""
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
IDS = json.loads((HERE / "slide_ids.json").read_text(encoding="utf-8"))
IMAGES = json.loads((HERE / "images.json").read_text(encoding="utf-8"))

PROPS_TYPE = {"poll": "pollQuestion",
              "pick_answer_quiz": "multipleChoiceQuizQuestion",
              "word_cloud": "wordCloudQuestion"}


def lettered_reversed(options, correct=None):
    rows = [(f"{chr(65 + i)}. {t}", chr(65 + i) == correct)
            for i, t in enumerate(options)]
    return list(reversed(rows))


def body(s, lang):
    sl = json.loads(json.dumps(s["slide"]))
    t = sl["slide_type"]
    if t == "poll":
        sl["options"] = [{"text": x} for x, _ in lettered_reversed(sl["options"])]
    elif t == "pick_answer_quiz":
        sl["options"] = [{"text": x, "correct": ok} for x, ok in
                         lettered_reversed(sl["options"], sl.pop("correct"))]
    elif t == "pinOnImage":
        url = IMAGES.get(lang, {}).get(str(s["afterPage"]))
        if not url:
            raise SystemExit(f"{s['id']} {lang}: no image URL for page "
                             f"{s['afterPage']} in images.json")
        sl["slide_attributes"]["imageUrl"] = url
    sl["notes"] = s["notes"]
    return sl


for lang in ("en", "es", "ja"):
    if lang not in IDS:
        print(f"{lang}: no slide IDs yet, skipped")
        continue
    deck = json.loads((HERE / f"deck_{lang}.json").read_text(encoding="utf-8"))
    pages = IDS[lang]["pages"]
    create, update_props = [], []
    for s in deck["slides"]:
        if s["kind"] != "interactive":
            continue
        if not create or create[-1]["after_page"] != s["afterPage"]:
            create.append({"after_page": s["afterPage"],
                           "insert_after_slide_id": pages[str(s["afterPage"])],
                           "activities": [], "slides": []})
        create[-1]["activities"].append(s["id"])
        create[-1]["slides"].append(body(s, lang))
        if s["props"]:
            update_props.append({"activity": s["id"],
                                 "type": PROPS_TYPE[s["activityKind"]],
                                 **s["props"]})
    payload = {"presentation_id": IDS[lang]["presentation"],
               "create": create, "update_props": update_props}
    (HERE / f"payload_{lang}.json").write_text(
        json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    n = sum(len(c["slides"]) for c in create)
    print(f"{lang}: {n} new slides in {len(create)} create calls, "
          f"{len(update_props)} property updates; types "
          f"{dict(Counter(sl['slide_type'] for c in create for sl in c['slides']))}")
