#!/usr/bin/env python3
"""pages.py + activities.py -> deck_{en,es,ja}.json + deck_{en,es,ja}.md.

    python3 build_deck_json.py && python3 build_payload.py

Each deck is the list of its Canva pages (image slides, or YouTube slides for
video pages) with the interactive slides of activities.py placed after their
anchor page, in list order. deck_<lang>.md is the presenter copy: the run of
show with answers, then the notes.

Validation (nothing is written on any failure), adapted from the course
builder (content/courses/slides/ahaslides/build_deck_json.py):
  - every page of every deck has exactly one topic; captures exist
  - activity IDs unique; every topic exists; every activity lands in English
  - every language has the text of every activity it shows
  - pick-answer quizzes: 2 to 6 options and a valid correct letter, the same
    number of options in every language; polls have no answer
  - true/false: answer "true" or "false"; ranking: 2 to 10 items
  - between 10 and 14 interactive slides per deck, a leaderboard before the
    final open question
  - every slide has notes
  - the writing rules on all English text and the notes: no em dashes,
    contractions or possessives
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

from activities import ACTIVITIES, props, slide
from pages import DECKS, LABELS, TOPICS, VIDEOS, topic_of, video_url

HERE = Path(__file__).parent
errors = []

CONTRACTION = re.compile(r"\b\w+n't\b|\b\w+'(re|ll|ve|m|d)\b", re.I)
POSSESSIVE = re.compile(r"\b\w+'s\b|\b\w+s'(\s|$)")


def strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings(v)


def check_writing(aid, s):
    if "—" in s:
        errors.append(f"{aid}: em dash in {s[:60]!r}")
    if CONTRACTION.search(s):
        errors.append(f"{aid}: contraction in {s[:60]!r}")
    if POSSESSIVE.search(s.replace("’", "'")):
        errors.append(f"{aid}: possessive in {s[:60]!r}")


def anchor(a, lang):
    """Page of activity a in lang, or None when the deck has no such page."""
    topics = a["topic"] if isinstance(a["topic"], list) else [a["topic"]]
    for t in topics:
        if t not in TOPICS:
            errors.append(f"{a['id']}: unknown topic {t}")
            return None
        if TOPICS[t][lang]:
            return TOPICS[t][lang]
    return None


for lang, spec in DECKS.items():
    pages = [p[lang] for p in TOPICS.values() if p[lang]]
    if sorted(pages) != list(range(1, spec["pages"] + 1)):
        errors.append(f"{lang}: topics do not cover pages 1..{spec['pages']} "
                      "exactly once")
    for page in range(1, spec["pages"] + 1):
        if not (HERE / "build" / lang / f"p{page:02d}.png").exists():
            errors.append(f"{lang}: capture of page {page} missing "
                          "(run capture.mjs)")
    for page in VIDEOS[lang]:
        if page > spec["pages"]:
            errors.append(f"{lang}: video page {page} out of range")

dups = [k for k, v in Counter(a["id"] for a in ACTIVITIES).items() if v > 1]
if dups:
    errors.append(f"duplicate activity IDs: {dups}")
for a in ACTIVITIES:
    aid, k = a["id"], a["kind"]
    if not a.get("notes"):
        errors.append(f"{aid}: no notes")
    check_writing(aid, a["notes"])
    check_writing(aid, " ".join(strings(a["text"].get("en", {}))))
    if anchor(a, "en") is None:
        errors.append(f"{aid}: not in the English deck")
    n_opts = set()
    for lang in DECKS:
        if anchor(a, lang) is None:
            continue
        if k != "leaderboard" and lang not in a["text"]:
            errors.append(f"{aid}: no {lang} text")
            continue
        t = a["text"].get(lang, {})
        if k in ("poll", "pick_answer_quiz"):
            n_opts.add(len(t["options"]))
            if not 2 <= len(t["options"]) <= 6:
                errors.append(f"{aid} {lang}: {len(t['options'])} options")
        if k == "ranking" and not 2 <= len(t["items"]) <= 10:
            errors.append(f"{aid} {lang}: ranking needs 2 to 10 items")
    if len(n_opts) > 1:
        errors.append(f"{aid}: option counts differ between languages")
    if k == "pick_answer_quiz" and a.get("answer") not in [
            chr(65 + i) for i in range(min(n_opts or {0}))]:
        errors.append(f"{aid}: bad correct letter {a.get('answer')!r}")
    if k == "poll" and "answer" in a:
        errors.append(f"{aid}: a poll has no correct answer")
    if k == "true_false" and a.get("answer") not in ("true", "false"):
        errors.append(f"{aid}: true/false answer missing")

if errors:
    print("FAILED:\n  " + "\n  ".join(errors))
    sys.exit(1)


def answer(a, lang):
    if a["kind"] == "pick_answer_quiz":
        i = ord(a["answer"]) - 65
        return f"{a['answer']}. {a['text'][lang]['options'][i]}"
    if a["kind"] == "true_false":
        return a["answer"].capitalize()
    return ""


def label(a, lang):
    return a["text"].get(lang, {}).get("q", "Leaderboard")


outputs = []
for lang, spec in DECKS.items():
    slides = []
    for page in range(1, spec["pages"] + 1):
        topic = topic_of(lang, page)
        if page in VIDEOS[lang]:
            slides.append({"kind": "video", "page": page, "topic": topic,
                           "title": VIDEOS[lang][page][1],
                           "url": video_url(lang, page)})
        else:
            slides.append({"kind": "image", "page": page, "topic": topic,
                           "title": LABELS[topic]})
        for a in ACTIVITIES:
            if anchor(a, lang) == page:
                slides.append({"kind": "interactive", "id": a["id"],
                               "afterPage": page, "activityKind": a["kind"],
                               "slide": slide(a, lang), "props": props(a),
                               "notes": a["notes"], "title": label(a, lang),
                               "answer": answer(a, lang)})
    inter = [s for s in slides if s["kind"] == "interactive"]
    if not 10 <= len(inter) <= 14:
        errors.append(f"{lang}: {len(inter)} interactive slides, not 10 to 14")
    if [s["id"] for s in inter[-2:]] != ["K90", "K91"]:
        errors.append(f"{lang}: the deck must end with K90 then K91")
    deck = {"lang": lang, "title": spec["title"], "canva": spec["canva"],
            "slides": slides,
            "counts": {"total": len(slides),
                       "image": sum(s["kind"] == "image" for s in slides),
                       "video": sum(s["kind"] == "video" for s in slides),
                       "interactive": len(inter)}}
    outputs.append((f"deck_{lang}.json",
                    json.dumps(deck, indent=1, ensure_ascii=False) + "\n"))

    md = [f"# {spec['title']}", "",
          "Generated by `build_deck_json.py` from `pages.py` and "
          "`activities.py`. Do not edit by hand.", "",
          f"Source: {spec['canva']}. **{len(slides)} slides:** "
          f"{deck['counts']['image']} page images, {deck['counts']['video']} "
          f"YouTube videos, {len(inter)} interactive.", "",
          "## Run of show", "",
          "| # | Page | Slide | Answer |", "|---|---|---|---|"]
    for i, s in enumerate(slides, 1):
        if s["kind"] == "image":
            md.append(f"| {i} | {s['page']} | {s['title']} | |")
        elif s["kind"] == "video":
            md.append(f"| {i} | {s['page']} | **Video:** [{s['title']}]"
                      f"({s['url']}) | |")
        else:
            md.append(f"| {i} | after {s['afterPage']} | **{s['id']}** "
                      f"`{s['activityKind']}`: {s['title']} | {s['answer']} |")
    md += ["", "## Presenter notes", ""]
    for s in inter:
        md += [f"### {s['id']} (after page {s['afterPage']})", "",
               f"**{s['title']}**", "", s["notes"], ""]
    outputs.append((f"deck_{lang}.md", "\n".join(md) + "\n"))
    print(f"{lang}: {len(slides)} slides {deck['counts']}")

if errors:
    print("FAILED:\n  " + "\n  ".join(errors))
    sys.exit(1)
for name, text in outputs:
    (HERE / name).write_text(text, encoding="utf-8")
