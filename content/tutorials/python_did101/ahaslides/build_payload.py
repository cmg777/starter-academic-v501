#!/usr/bin/env python3
"""deck.json -> AhaSlides `create_slides` payloads + the interleave plan.

    python3 build_payload.py        # writes payload.json next to this script

Under the image architecture the 33 content slides are pages of an imported PDF,
so this script emits payloads for the **interactive slides only** — they are the
only thing created through the MCP. Strip the bookkeeping keys (`_n`,
`_after_image`) before sending a payload.

`_after_image` is the 1-based page of the imported PDF each interactive slide
belongs after: for an interactive slide at final position P it is
count(non-interactive positions < P). Two ways to apply it (see
.claude/docs/ahaslides.md, step 5):

- preferred: one `create_slides` call per slide with
  `insert_after_slide_id=<id of image at that page>` — born in place, no moves;
- or create them all in one batch (they append after the 33 images) and then one
  `move_slide` each, mapping the returned IDs back **by heading**, never by array
  position — the response is not in input order.

The anchors are image slides, whose relative order never changes, so the calls
are independent and ascending order is not actually required.

Only `poll` and `pick_answer_quiz` are used. Word Cloud, Rating Scale and Open
Ended are separately premium. Even these two types count toward the free plan's
small allowance of interactive slides, so five of them cap this deck at 3 live
participants — accepted in advance; see README.md.

`load_slide_type_specs` documents only `heading` and `options` for both types —
per-question points and timers are NOT part of the create payload, so they keep
the presentation-level defaults and are changed in the editor if wanted. Do not
invent field names for them.
"""
import json
import pathlib
from collections import Counter

HERE = pathlib.Path(__file__).parent
deck = json.loads((HERE / "deck.json").read_text(encoding="utf-8"))

# Only these two types. Adding a premium type here is a plan change, not a
# code change — read the free-plan note in README.md first.
# AhaSlides does not keep option order. The API gives successive options
# order values 1, 0.5, 0.25, ... and every view sorts them ascending, so the
# options DISPLAY IN REVERSE payload order (verified on the python_fwl deck 10198190,
# 2026-09-28; get_presentation_detail_tool lists yet another order). So each
# option carries its letter -- the audience can always match it to the A/B/C
# cue slide and the notes ("Answer: B") -- and the lettered list is sent
# reversed, which makes it display A, B, C.
def lettered(opts):
    return [f"{chr(65 + i)}. {o['text']}" for i, o in enumerate(opts)]


def reversed_pairs(opts):
    return list(reversed(list(zip(lettered(opts), opts))))


BUILDERS = {
    "poll": lambda s: {
        "slide_type": "poll",
        "heading": s["question"],
        "options": [{"text": t} for t, _ in reversed_pairs(s["options"])],
    },
    "quiz": lambda s: {
        "slide_type": "pick_answer_quiz",
        "heading": s["question"],
        "options": [{"text": t, "correct": o["correct"]}
                    for t, o in reversed_pairs(s["options"])],
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

expected = deck["presentation"]["imagePages"]
if images_seen != expected:
    raise SystemExit(f"deck.json has {images_seen} content slides but the PDF "
                     f"has {expected} pages — rerun build_deck_json.py")

(HERE / "payload.json").write_text(
    json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

print(f"wrote payload.json: {len(out)} interactive slides",
      dict(Counter(p["slide_type"] for p in out)))
print(f"content slides supplied by the PDF import: {images_seen}")
print("\nInterleave plan — one call per row:")
print(f"  {'final':>5}  {'after image':>11}  type")
for p in out:
    print(f"  {p['_n']:>5}  {p['_after_image']:>11}  {p['slide_type']}")
print("\n  create_slides(..., insert_after_slide_id=<id of image at that page>)")
print("  or: move_slide(slide_id=<new slide>, presentation_id=<id>,")
print("                 insert_after_slide_id=<id of image at that page>)")
