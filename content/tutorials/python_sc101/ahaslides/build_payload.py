#!/usr/bin/env python3
"""deck.json to AhaSlides create_slides payloads, plus the interleave plan.

    python3 build_payload.py        # writes payload.json next to this script

Under the image architecture the 36 content slides are pages of an imported
PDF, so this script emits payloads for the five quizzes only: they are the
only slides created through the MCP. payload.json holds:

- quizzes: for each quiz, create_slides (the slide dict to send, exactly as
  the python_did101 builder shaped it), after_image_page (the page of its
  cue, whose image the quiz goes after), final_position, correct, and
  display_order (the options as the audience will see them);
- plan: all 41 positions of the finished deck, images and quizzes.

Apply it with one call per quiz (see .claude/docs/ahaslides.md, step 5):

    create_slides(presentation_id=<id>, slides=[<create_slides of quiz k>],
                  insert_after_slide_id=<id of the image at after_image_page>)

The anchors are image slides, whose relative order never changes, so the five
calls are independent and need no particular order. The alternative is one
batch call followed by one move_slide per quiz; then map the returned IDs back
by heading, never by array position, because the response is not in input
order.

Options display in REVERSE payload order. The API gives successive options
the order values 1, 0.5, 0.25, and every view sorts them ascending (verified
on the python_fwl deck 10198190). So each option carries its letter, which
keeps it matched to the cue slide and to the notes ("Answer: C."), and the
lettered list is sent reversed, which makes it display A, B, C.

Only pick_answer_quiz and poll are allowed, because Word Cloud, Rating Scale,
and Open Ended are separately premium. load_slide_type_specs documents only
heading and options for pick_answer_quiz (options are text plus correct),
and every slide accepts optional notes. Points and timers are not part of the
create payload, so they keep the presentation defaults. Do not invent field
names for them.
"""
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
deck = json.loads((HERE / "deck.json").read_text(encoding="utf-8"))
expected = deck["presentation"]["imagePages"]


def lettered(opts):
    """Each option as the audience sees it, such as "A. Smaller: ..."."""
    return [f"{o['letter']}. {o['text']}" for o in opts]


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

quizzes, plan, titles = [], [], {}
images_seen = 0
for s in deck["slides"]:
    if not s.get("interactive"):
        images_seen += 1   # a title, divider, cue, or content slide: one PDF page
        titles[s["imagePage"]] = s["title"]
        plan.append({"position": s["n"], "kind": "image",
                     "page": s["imagePage"], "title": s["title"]})
        continue
    kind = s["kind"]
    if kind not in BUILDERS:
        raise SystemExit(f"slide {s['n']}: {kind!r} is not a free-plan type")
    body = BUILDERS[kind](s)
    if s.get("notes"):
        body["notes"] = s["notes"]

    # Guards: the anchor is the cue right before the quiz, the options
    # display A, B, C after the reversal, and one of them is correct.
    label = f"Q{len(quizzes) + 1}"
    shown = [o["text"] for o in reversed(body["options"])]
    letters = [t.split(".", 1)[0] for t in shown]
    if letters != [chr(65 + i) for i in range(len(shown))]:
        raise SystemExit(f"{label}: options would display as {letters}")
    right = [t[0] for t, o in zip(shown, reversed(body["options"]))
             if o.get("correct")]
    if kind == "quiz" and right != [s["correct"]]:
        raise SystemExit(f"{label}: correct options {right}, expected "
                         f"{s['correct']}")
    if s.get("afterImage") != images_seen:
        raise SystemExit(f"{label}: deck.json anchors it after image "
                         f"{s.get('afterImage')}, but it follows image "
                         f"{images_seen}")
    if s["n"] != images_seen + len(quizzes) + 1:
        raise SystemExit(f"{label}: final position {s['n']} does not follow "
                         f"image {images_seen}")

    quizzes.append({
        "quiz": label,
        "after_image_page": images_seen,
        "after_image_title": titles[images_seen],
        "final_position": s["n"],
        "correct": s.get("correct"),
        "display_order": shown,
        "create_slides": body,
    })
    plan.append({"position": s["n"], "kind": "quiz", "quiz": label,
                 "after_image_page": images_seen, "heading": body["heading"]})

if images_seen != expected:
    raise SystemExit(f"deck.json has {images_seen} content slides but the PDF "
                     f"has {expected} pages; rerun build_deck_json.py")
if [p["position"] for p in plan] != list(range(1, len(plan) + 1)):
    raise SystemExit("the plan does not run 1..N without gaps")

out = {
    "presentation_id": deck["presentation"]["presentationId"],
    "image_pages": images_seen,
    "quiz_count": len(quizzes),
    "total_slides": len(plan),
    "quizzes": quizzes,
    "plan": plan,
}
(HERE / "payload.json").write_text(
    json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

types = dict(Counter(q["create_slides"]["slide_type"] for q in quizzes))
print(f"wrote payload.json: {len(quizzes)} interactive slides {types}")
print(f"images from the PDF import: {images_seen}; final deck: "
      f"{images_seen} + {len(quizzes)} = {len(plan)} slides")
if out["presentation_id"] is None:
    print("presentation_id is pending: set PRESENTATION_ID in make_deck_md.py "
          "once the presentation exists, then rerun the three scripts")

print("\nInsert plan, one create_slides call per quiz:")
print(f"  {'quiz':4}  {'after image':>11}  {'final':>5}  {'correct':7}  "
      f"options as displayed")
for q in quizzes:
    first, *rest = q["display_order"]
    tag, after, final = q["quiz"], q["after_image_page"], q["final_position"]
    print(f"  {tag:4}  {after:>11}  {final:>5}  {q['correct']:7}  {first}")
    for line in rest:
        print(f"  {'':4}  {'':>11}  {'':>5}  {'':7}  {line}")

print(f"\nFinal running order ({len(plan)} slides):")
for p in plan:
    pos = p["position"]
    if p["kind"] == "image":
        page, title = p["page"], p["title"]
        print(f"  {pos:>3}  image p{page:<3} {title}")
    else:
        tag, heading = p["quiz"], p["heading"]
        print(f"  {pos:>3}  QUIZ  {tag:<4} {heading}")
