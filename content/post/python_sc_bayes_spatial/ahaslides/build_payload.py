#!/usr/bin/env python3
"""deck.json -> AhaSlides `create_slides` payloads + the interleave plan.

    python3 build_payload.py        # writes payload.json next to this script

Under the image architecture the 36 content slides are pages of an imported PDF,
so this script emits payloads for the **interactive slides only** — they are the
only thing created through the MCP. Feed them to `create_slides` in ascending
`_n` order, stripping the bookkeeping keys (`_n`, `_after_image`) first.

`create_slides` appends, so the new slides land after the 36 images and then
have to be moved. `_after_image` is the 1-based page of the imported PDF each
interactive slide belongs after; the printed plan turns that into the
`move_slide` calls. Do them in ascending order — each move shifts everything
below it, and the arithmetic below already accounts for the earlier inserts.

Only free-plan slide types are used: `poll` and `pick_answer_quiz`. Word Cloud,
Rating Scale and Open Ended are premium and drop the deck to a 3-participant
cap. See .claude/docs/ahaslides.md.

`load_slide_type_specs` documents only `heading` and `options` for both types —
per-question points and timers are NOT part of the create payload, so they keep
the presentation-level defaults (100 points, no time limit) and are changed in
the editor if wanted. Do not invent field names for them.
"""
import json
import pathlib
from collections import Counter

HERE = pathlib.Path(__file__).parent
deck = json.loads((HERE / "deck.json").read_text(encoding="utf-8"))

# Only the two free types. Adding a premium type here is a plan change, not a
# code change — read the free-plan note in README.md first.
BUILDERS = {
    "poll": lambda s: {
        "slide_type": "poll",
        "heading": s["question"],
        "options": [{"text": o["text"]} for o in s["options"]],
    },
    "quiz": lambda s: {
        "slide_type": "pick_answer_quiz",
        "heading": s["question"],
        "options": [{"text": o["text"], "correct": o["correct"]}
                    for o in s["options"]],
    },
}

out = []
images_seen = 0
for s in deck["slides"]:
    if not s.get("interactive"):
        images_seen += 1          # a content/title/divider slide = one PDF page
        continue
    kind = s["kind"]
    if kind not in BUILDERS:
        raise SystemExit(f"slide {s['n']}: {kind!r} is not a free-plan type; "
                         "see the free-plan note in README.md")
    p = BUILDERS[kind](s)
    if s.get("notes"):
        p["notes"] = s["notes"]
    p["_n"] = s["n"]
    p["_after_image"] = images_seen
    out.append(p)

(HERE / "payload.json").write_text(
    json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

print(f"wrote payload.json: {len(out)} interactive slides",
      dict(Counter(p["slide_type"] for p in out)))
print(f"content slides supplied by the PDF import: {images_seen}")
print("\nInterleave plan — one move_slide per row, in this order:")
print(f"  {'final':>5}  {'after image':>11}  type")
for p in out:
    print(f"  {p['_n']:>5}  {p['_after_image']:>11}  {p['slide_type']}")
print("\n  move_slide(slide_id=<new slide>, presentation_id=<id>,")
print("             insert_after_slide_id=<id of image at that page>)")
