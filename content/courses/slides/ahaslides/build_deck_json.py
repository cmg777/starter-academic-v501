#!/usr/bin/env python3
"""pages.py + activities.py -> deck_part{1,2,3}.json + deck_part{1,2,3}.md.

    python3 build_deck_json.py && python3 build_payload.py

Each part is the list of its PDF pages (image slides, or YouTube slides for
video pages) with the interactive slides of activities.py placed after their
anchor page, in list order. deck_partN.md is the presenter copy: a run-of-show
with answers, tiers and minutes, then every slide in order.

Validation (nothing is written on any failure):
  - the PDF still has 75 pages; every part starts with page 1 and ends with 75
  - activity IDs unique; every anchor is a page of its part
  - pick-answer quizzes: 2 to 6 options, one valid correct letter; polls none
  - shape rules per type (match pairs 2 to 4, categorise items unique, fill-in
    markers equal blanks with the answer in the drop-down, mirrored titles of
    marketplace slides, hotspots at most 8 with short texts, ranking picks in
    range, budget options 2 to 8, pin images present, 2x2 labels short)
  - every slide has notes and every scored quiz a timer
  - the writing rules on all new text: no em dashes, contractions or possessives
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

from pypdf import PdfReader

from activities import ACTIVITIES
from pages import N_PAGES, PARTS, PDF, TITLES, VIDEOS, video_url

HERE = Path(__file__).parent
errors = []

# Video notes: tier and how much to play. Read by deck_partN.md only (the
# YouTube slides are not editable through the MCP, so they carry no notes).
VIDEO_PLAN = {
    2: ("opt", "Play the first 2 minutes."),
    12: ("core", "Play in full, about 4 minutes."),
    13: ("core", "Starts at 3:40; stop after the China provinces, about 1 minute."),
    18: ("core", "Play the first 2 minutes."),
    28: ("opt", "Play 1 to 2 minutes."),
    31: ("opt", "Play 2 minutes."),
    34: ("opt", "Play 2 minutes."),
    36: ("core", "Starts at 0:21; play 2 minutes."),
    37: ("core", "Play the first 2 minutes."),
    38: ("opt", "Play 2 minutes. Japanese documentaries in the notes."),
    42: ("core", "Play 2 minutes."),
    43: ("opt", "Play 1 to 2 minutes."),
    47: ("core", "Play in full, about 2 minutes."),
    56: ("core", "Play 1 minute."),
    61: ("core", "Play 2 minutes."),
    73: ("opt", "Play 1 minute as a closing montage."),
    74: ("opt", "Starts at 1:52; play 1 to 2 minutes."),
}

QUIZ_TYPES = {"pick_answer_quiz", "short_answer_quiz", "match_pairs_quiz",
              "categorise_quiz", "correct_order_quiz"}


def texts(obj):
    """Every string inside a slide body (for the writing-rule checks)."""
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k not in ("imageUrl", "backgroundImageUrl", "id", "correctAnswer",
                         "answerType", "displayMode", "wallMotion", "wallLayout",
                         "unit", "resultsChartType", "resultMode", "slide_type",
                         "correct"):
                yield from texts(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from texts(v)


CONTRACTION = re.compile(r"\b\w+n't\b|\b\w+'(re|ll|ve|m|d)\b", re.I)
POSSESSIVE = re.compile(r"\b\w+'s\b|\b\w+s'(\s|$)")


def check_writing(aid, s):
    if "—" in s:
        errors.append(f"{aid}: em dash in {s[:60]!r}")
    if CONTRACTION.search(s):
        errors.append(f"{aid}: contraction in {s[:60]!r}")
    if POSSESSIVE.search(s.replace("’", "'")):
        errors.append(f"{aid}: possessive in {s[:60]!r}")


def check(a):
    aid, sl, t = a["id"], a["slide"], a["slide"]["slide_type"]
    if a["after"] not in PARTS[a["part"]]["pages"]:
        errors.append(f"{aid}: page {a['after']} is not in part {a['part']}")
    if a["tier"] not in ("core", "opt"):
        errors.append(f"{aid}: bad tier")
    if not a.get("notes"):
        errors.append(f"{aid}: no notes")
    for s in list(texts(sl)) + [a.get("notes") or ""]:
        check_writing(aid, s)
    props = a.get("props") or {}
    if t == "pick_answer_quiz":
        n = len(sl["options"])
        if not 2 <= n <= 6:
            errors.append(f"{aid}: {n} options")
        if sl.get("correct") not in [chr(65 + i) for i in range(n)]:
            errors.append(f"{aid}: bad correct letter {sl.get('correct')!r}")
    if t == "poll" and "correct" in sl:
        errors.append(f"{aid}: a poll has no correct answer")
    if t in QUIZ_TYPES and "timeToAnswer" not in props:
        errors.append(f"{aid}: scored quiz without a timer")
    if t == "match_pairs_quiz" and not 2 <= len(sl["pairs"]) <= 4:
        errors.append(f"{aid}: match pairs must be 2 to 4")
    if t == "categorise_quiz":
        items = [i for c in sl["options"] for i in c["items"]]
        if len(items) != len(set(items)):
            errors.append(f"{aid}: duplicate categorise items")
    cfg = sl.get("slide_attributes", {}).get("config", {})
    if t == "marketplace/fill-in-the-blanks":
        if cfg["question"].count("[blank]") != len(cfg["blanks"]):
            errors.append(f"{aid}: blank markers do not match blanks")
        for b in cfg["blanks"]:
            if b["acceptedAnswers"][0] not in b["dropdownOptions"]:
                errors.append(f"{aid}: answer missing from drop-down")
    if t in ("marketplace/true-or-false", "marketplace/two-by-two-grid-v2"):
        if cfg.get("question") != sl.get("title"):
            errors.append(f"{aid}: title not mirrored in config.question")
    if t == "marketplace/true-or-false" and cfg.get("correctAnswer") not in (
            "true", "false"):
        errors.append(f"{aid}: true/false answer missing")
    if t in ("marketplace/image-show", "marketplace/interactive-images"):
        if cfg.get("title") != sl.get("title"):
            errors.append(f"{aid}: title not mirrored in config.title")
    if t == "marketplace/interactive-images":
        hs = cfg["hotspots"]
        if len(hs) > 8 or len({h["id"] for h in hs}) != len(hs):
            errors.append(f"{aid}: hotspots over 8 or ids repeated")
        for h in hs:
            if len(h["title"]) > 40 or len(h["description"]) > 150:
                errors.append(f"{aid}: hotspot text too long ({h['id']})")
            if not (0 <= h["x"] <= 100 and 0 <= h["y"] <= 100):
                errors.append(f"{aid}: hotspot outside the image")
        if not cfg.get("backgroundImageUrl"):
            errors.append(f"{aid}: no background image")
    if t == "marketplace/two-by-two-grid-v2":
        for k in ("xAxisLabel", "yAxisLabel"):
            if len(cfg[k]) > 30:
                errors.append(f"{aid}: {k} over 30 characters")
    if t == "marketplace/budget-allocation-v2":
        if cfg.get("prompt") != sl.get("title"):
            errors.append(f"{aid}: title not mirrored in config.prompt")
        if not 2 <= len(cfg["options"]) <= 8 or any(
                len(o["label"]) > 30 for o in cfg["options"]):
            errors.append(f"{aid}: budget options must be 2 to 8, labels <= 30")
    if t == "ranking":
        at = sl["slide_attributes"]
        if not 2 <= at["rankingPicksPerParticipant"] <= len(at["rankingItems"]):
            errors.append(f"{aid}: ranking picks out of range")
    if t == "pinOnImage" and not sl["slide_attributes"].get("imageUrl"):
        errors.append(f"{aid}: pin slide without an image")
    if t == "spinner_wheel" and not props.get("metadata", {}).get(
            "autoFillParticipantName"):
        errors.append(f"{aid}: spinner without name auto-fill")


if len(PdfReader(str(HERE / PDF)).pages) != N_PAGES:
    errors.append(f"{PDF} no longer has {N_PAGES} pages")
for part, spec in PARTS.items():
    if spec["pages"][0] != 1 or spec["pages"][-1] != 75:
        errors.append(f"part {part} must start with page 1 and end with 75")
dups = [k for k, v in Counter(a["id"] for a in ACTIVITIES).items() if v > 1]
if dups:
    errors.append(f"duplicate activity IDs: {dups}")
for a in ACTIVITIES:
    check(a)

if errors:
    print("FAILED:\n  " + "\n  ".join(errors))
    sys.exit(1)


def label(a):
    sl = a["slide"]
    return (sl.get("heading") or sl.get("title")
            or {"qr_code": "QR code: join", "leaderboard": "Leaderboard",
                "marketplace/duck-race": "Duck race raffle"}[sl["slide_type"]])


def answer(a):
    sl, t = a["slide"], a["slide"]["slide_type"]
    cfg = sl.get("slide_attributes", {}).get("config", {})
    if t == "pick_answer_quiz":
        i = ord(sl["correct"]) - 65
        return f"{sl['correct']}. {sl['options'][i]}"
    if t == "short_answer_quiz":
        return sl["correct_answer"]
    if t == "marketplace/true-or-false":
        return cfg["correctAnswer"].capitalize()
    if t == "marketplace/fill-in-the-blanks":
        return ", ".join(b["acceptedAnswers"][0] for b in cfg["blanks"])
    if t == "match_pairs_quiz":
        return "; ".join(f"{p['left_item']} = {p['right_item']}"
                         for p in sl["pairs"])
    if t == "categorise_quiz":
        return "; ".join(f"{c['name']}: {', '.join(c['items'])}"
                         for c in sl["options"])
    return ""


for part, spec in PARTS.items():
    slides = []
    for page in spec["pages"]:
        if page in VIDEOS:
            tier, plan = VIDEO_PLAN[page]
            slides.append({"kind": "video", "page": page, "tier": tier,
                           "title": VIDEOS[page]["title"], "url": video_url(page),
                           "notes": plan})
        else:
            slides.append({"kind": "image", "page": page,
                           "title": TITLES[page]})
        for a in ACTIVITIES:
            if a["part"] == part and a["after"] == page:
                slides.append({"kind": "interactive", "id": a["id"],
                               "afterPage": page, "tier": a["tier"],
                               "minutes": a["minutes"],
                               "slideType": a["slide"]["slide_type"],
                               "slide": a["slide"], "props": a.get("props"),
                               "notes": a["notes"], "title": label(a),
                               "answer": answer(a)})
    inter = [s for s in slides if s["kind"] == "interactive"]
    core = sum(s["minutes"] for s in inter if s["tier"] == "core")
    opt = sum(s["minutes"] for s in inter if s["tier"] == "opt")
    deck = {"part": part, "title": spec["title"], "slides": slides,
            "counts": {"total": len(slides),
                       "image": sum(s["kind"] == "image" for s in slides),
                       "video": sum(s["kind"] == "video" for s in slides),
                       "interactive": len(inter)},
            "minutes": {"core": core, "optional": opt}}
    (HERE / f"deck_part{part}.json").write_text(
        json.dumps(deck, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [f"# {spec['title']}", "",
          "Generated by `build_deck_json.py` from `pages.py` and "
          "`activities.py`. Do not edit by hand.", "",
          f"**{len(slides)} slides:** {deck['counts']['image']} page images, "
          f"{deck['counts']['video']} YouTube videos, {len(inter)} interactive. "
          f"Core activities about **{core:g} min**, optional about "
          f"**{opt:g} min** (videos not included).", "",
          "## Run of show", "",
          "| # | Page | Slide | Tier | Min | Answer |",
          "|---|---|---|---|---|---|"]
    for i, s in enumerate(slides, 1):
        if s["kind"] == "image":
            md.append(f"| {i} | {s['page']} | {s['title']} | | | |")
        elif s["kind"] == "video":
            md.append(f"| {i} | {s['page']} | **Video:** [{s['title']}]"
                      f"({s['url']}) | {s['tier']} | | {s['notes']} |")
        else:
            md.append(f"| {i} | after {s['afterPage']} | **{s['id']}** "
                      f"`{s['slideType']}`: {s['title']} | {s['tier']} | "
                      f"{s['minutes']:g} | {s['answer']} |")
    md += ["", "## Presenter notes of the interactive slides", ""]
    for s in inter:
        md += [f"### {s['id']} ({s['tier']}, about {s['minutes']:g} min, "
               f"after page {s['afterPage']})", "", f"**{s['title']}**", "",
               s["notes"], ""]
    (HERE / f"deck_part{part}.md").write_text("\n".join(md) + "\n",
                                              encoding="utf-8")
    print(f"part {part}: {len(slides)} slides ({deck['counts']}), core "
          f"{core:g} min, optional {opt:g} min")
