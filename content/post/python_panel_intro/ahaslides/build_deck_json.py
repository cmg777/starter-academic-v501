#!/usr/bin/env python3
"""Build deck.json and deck.md from slides.qmd plus activities.py, with validation.

    python3 build_deck_json.py && python3 build_payload.py

The deck has two layers (see .claude/docs/ahaslides.md):

- 33 content slides: pages of ../slides/slides.qmd, rendered to PDF and imported
  as images. Their titles and speaker notes are read from slides.qmd verbatim, so
  deck.md can never drift from the images.
- 37 interactive slides: defined in activities.py, each placed after a page.

deck.md is the presenter copy: the full running order, every speaker note (the
imported images cannot carry notes in AhaSlides), every activity with its answer,
and the run-of-show timing. Nothing is written if any check fails.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
QMD = HERE.parent / "slides" / "slides.qmd"
sys.path.insert(0, str(HERE))
from activities import ACTIVITIES  # noqa: E402

IMAGE_PAGES = 33
N_INTERACTIVE = 37

PRESENTATION = {
    "title": "Introduction to Panel Data Methods",
    "subtitle": "Seven estimators, one wage panel: why the union premium triples",
    "author": "Carlos Mendez — Nagoya University (GSID)",
    "language": "en",
    "source": "content/post/python_panel_intro/slides/slides.qmd",
    "post": "https://carlos-mendez.org/post/python_panel_intro/",
    "presentationId": 10245137,
    "backupPresentationId": 10274743,
    "publicViewLink": "https://presenter.ahaslides.com/share/1790911128481-t7x8a80cw2",
    "editorUrl": "https://presenter.ahaslides.com/presentation/10245137",
    "joinCode": "V62EU",
    "plan": "AhaSlides Education Large (paid, from 2026-10-06)",
    "architecture": "content slides are imported PDF pages; only the "
                    "interactive slides are created through the MCP",
    "imagePages": IMAGE_PAGES,
}

QMD_OPTION_RE = re.compile(r"^\*\*([A-Z])\.\*\*(?:&nbsp;|\s)+(.*?)\s*$")
BG_RE = re.compile(r'background-color="([^"]+)"')

TYPE_LABEL = {
    "qr_code": "QR code (join)",
    "word_cloud": "Word cloud",
    "scale": "Rating scale",
    "q&a": "Live Q&A",
    "poll": "Poll",
    "pick_answer_quiz": "Quiz: pick answer",
    "short_answer_quiz": "Quiz: short answer",
    "correct_order_quiz": "Quiz: correct order",
    "match_pairs_quiz": "Quiz: match pairs",
    "categorise_quiz": "Quiz: categorise",
    "spinner_wheel": "Spinner wheel",
    "leaderboard": "Leaderboard",
    "open_ended_survey": "Open ended",
    "ideaBoard": "Idea board",
    "marketplace/draw-answer-v2": "Draw answer",
    "marketplace/true-or-false": "Quiz: true or false",
    "marketplace/fill-in-the-blanks": "Quiz: fill in the blanks",
    "marketplace/two-by-two-grid-v2": "2x2 matrix",
    "marketplace/escape-room-v2": "Escape room",
    "marketplace/duck-race": "Duck race",
}
SCORED = {"pick_answer_quiz", "short_answer_quiz", "correct_order_quiz",
          "match_pairs_quiz", "categorise_quiz", "marketplace/true-or-false",
          "marketplace/fill-in-the-blanks"}

# Author writing rules for NEW text: no em dashes, no contractions, no
# possessive apostrophes. Proper names are exempt.
EM_DASH = "—"
APOSTROPHE_RE = re.compile(r"\b\w+['’](?:s|t|re|ve|ll|d|m)\b", re.I)
EXEMPT = set()


def clean(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"\1", text)
    return text.strip()


def qmd_pages():
    """One dict per printed page of slides.qmd: title, notes, options, background.

    Page 1 is the title slide (built from YAML, no heading). Every `#` and `##`
    after the front matter is one printed page; headings inside fenced code are
    Python comments and are skipped.
    """
    _, front, body = QMD.read_text(encoding="utf-8").split("---\n", 2)
    title = re.search(r'^title:\s*"(.*)"\s*$', front, re.M)
    subtitle = re.search(r'^subtitle:\s*"(.*)"\s*$', front, re.M)
    pages = [{"kind": "title", "title": clean(title.group(1)) if title else "",
              "subtitle": clean(subtitle.group(1)) if subtitle else "",
              "notes": [], "options": []}]
    in_notes = in_code = False
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if s.startswith("::: {.notes}"):
            in_notes = True
        elif in_notes and s == ":::":
            in_notes = False
        elif in_notes:
            if s:
                pages[-1]["notes"].append(s)
        else:
            m = re.match(r"^(#{1,2}) (.*?)\s*(\{.*\})?\s*$", line)
            if m:
                ttl = clean(m.group(2))
                kind = ("divider" if m.group(1) == "#" else
                        "cue" if ttl.startswith("Before you look") else "content")
                bg = BG_RE.search(m.group(3) or "")
                pages.append({"kind": kind, "title": ttl, "notes": [],
                              "options": [],
                              "background": bg.group(1) if bg else None})
                continue
            om = QMD_OPTION_RE.match(s)
            if om:
                pages[-1]["options"].append(clean(om.group(2)))
    for p in pages:
        p["notes"] = " ".join(p["notes"])
    return pages


def notes_of(a):
    return a.get("notes")


def prompt_of(a):
    s = a["slide"]
    return s.get("heading") or s.get("title") or ""


def answer_of(a):
    """One-line answer key for the run-of-show table."""
    s, t = a["slide"], a["slide"]["slide_type"]
    if t == "pick_answer_quiz":
        i = ord(s["correct"]) - 65
        return f'{s["correct"]}. {s["options"][i]}'
    if t == "short_answer_quiz":
        return s["correct_answer"]
    if t == "correct_order_quiz":
        return " → ".join(o["text"] for o in sorted(s["options"],
                                                    key=lambda o: o["position"]))
    if t == "match_pairs_quiz":
        return "; ".join(f'{p["left_item"]} = {p["right_item"]}' for p in s["pairs"])
    if t == "categorise_quiz":
        return "; ".join(f'{c["name"]}: {", ".join(c["items"])}' for c in s["options"])
    if t == "marketplace/true-or-false":
        return s["slide_attributes"]["config"]["correctAnswer"].capitalize()
    if t == "marketplace/fill-in-the-blanks":
        return ", ".join(b["acceptedAnswers"][0]
                         for b in s["slide_attributes"]["config"]["blanks"])
    if t == "marketplace/escape-room-v2":
        rooms = s["slide_attributes"]["config"]["rooms"]
        return f"{len(rooms)} rooms, {sum(len(r['clues']) for r in rooms)} clues"
    if t == "poll":
        return "none (prediction)"
    return "none (unscored)"


def validate(pages, acts):
    bad = []
    if len(pages) != IMAGE_PAGES:
        bad.append(f"{QMD.name} has {len(pages)} pages, not {IMAGE_PAGES}: "
                   "re-render the PDF and re-import")
    ids = [a["id"] for a in acts]
    if len(set(ids)) != len(ids):
        bad.append(f"duplicate activity ids: {ids}")
    if len(acts) != N_INTERACTIVE:
        bad.append(f"{len(acts)} activities, expected {N_INTERACTIVE}")
    if sorted(a["after"] for a in acts) != [a["after"] for a in acts]:
        bad.append("activities are not listed in page order")
    cue_pages = [i + 1 for i, p in enumerate(pages) if p["kind"] == "cue"]
    cue_acts = [a["after"] for a in acts if a.get("cue")]
    if cue_acts != cue_pages:
        bad.append(f"cue quizzes follow pages {cue_acts}, cue slides are {cue_pages}")

    for a in acts:
        aid, s = a["id"], a["slide"]
        t = s.get("slide_type")
        err = lambda m: bad.append(f"{aid}: {m}")  # noqa: E731
        if t not in TYPE_LABEL:
            err(f"unknown slide_type {t!r}")
            continue
        if not 1 <= a["after"] <= IMAGE_PAGES:
            err(f"after={a['after']} is outside 1..{IMAGE_PAGES}")
        if a["tier"] not in ("core", "opt"):
            err(f"tier {a['tier']!r}")
        if not notes_of(a):
            err("no presenter notes")
        if t in SCORED and t.startswith(("pick", "short", "correct", "match",
                                         "categ")):
            if a.get("props", {}).get("timeToAnswer") is None:
                err("scored quiz without a timer in props")
        cfg = s.get("slide_attributes", {}).get("config", {})

        if t in ("poll", "pick_answer_quiz"):
            opts = s["options"]
            if not 2 <= len(opts) <= 6 or not all(isinstance(o, str) for o in opts):
                err("needs 2-6 plain-string options (letters are added later)")
            if t == "pick_answer_quiz" and not (
                    "A" <= s.get("correct", "") <= chr(64 + len(opts))):
                err(f"correct letter {s.get('correct')!r} not among the options")
            if t == "poll" and "correct" in s:
                err("a poll must not mark a correct option")
            if a.get("cue"):
                page = pages[a["after"] - 1]
                if page["options"] and opts != page["options"]:
                    err(f"options do not repeat the cue on page {a['after']} "
                        f"verbatim: {opts} vs {page['options']}")
        elif t == "categorise_quiz":
            items = [i for c in s["options"] for i in c["items"]]
            if len(s["options"]) < 2 or len(items) != len(set(items)) or not all(
                    c["items"] for c in s["options"]):
                err("categorise needs 2+ non-empty categories with unique items")
        elif t == "match_pairs_quiz":
            L = [p["left_item"] for p in s["pairs"]]
            R = [p["right_item"] for p in s["pairs"]]
            if not 2 <= len(L) <= 4 or len(set(L)) != len(L) or len(set(R)) != len(R):
                err("match pairs needs 2-4 pairs with unique sides")
        elif t == "correct_order_quiz":
            pos = sorted(o["position"] for o in s["options"])
            if not 2 <= len(pos) <= 7 or pos != list(range(1, len(pos) + 1)):
                err(f"correct order positions must be 1..n, n <= 7: {pos}")
        elif t == "short_answer_quiz":
            if not s.get("correct_answer"):
                err("short answer needs correct_answer")
        elif t == "scale":
            sc = s["scale_config"]
            if not s["options"] or sc["low_value"] >= sc["high_value"]:
                err("scale needs statements and low < high")
        elif t == "marketplace/true-or-false":
            if cfg.get("correctAnswer") not in ("true", "false"):
                err("true/false needs correctAnswer 'true' or 'false'")
            if cfg.get("question") != s.get("title"):
                err("true/false: title and config.question must match")
        elif t == "marketplace/fill-in-the-blanks":
            q, blanks = cfg["question"], cfg["blanks"]
            if q.count("[blank]") != len(blanks) or not 1 <= len(blanks) <= 4:
                err("fill-in: [blank] markers and blanks differ, or not 1-4")
            for b in blanks:
                if not b["acceptedAnswers"]:
                    err(f"fill-in {b['id']}: no accepted answer")
                if cfg["answerType"] == "dropdown" and (
                        not 2 <= len(b["dropdownOptions"]) <= 4 or
                        not set(b["acceptedAnswers"]) <= set(b["dropdownOptions"])):
                    err(f"fill-in {b['id']}: drop-down needs 2-4 options incl. "
                        "every accepted answer")
        elif t in ("marketplace/draw-answer-v2", "marketplace/two-by-two-grid-v2"):
            if cfg.get("question") != s.get("title"):
                err("title and config.question must match")
            if t.endswith("two-by-two-grid-v2"):
                iid = [i["id"] for i in cfg["items"]]
                if not 1 <= len(iid) <= 8 or len(set(iid)) != len(iid):
                    err("2x2 needs 1-8 items with unique ids")
                if max(len(cfg["xAxisLabel"]), len(cfg["yAxisLabel"])) > 30:
                    err("2x2 axis labels must be <= 30 characters")
        elif t == "ideaBoard":
            g = [x["id"] for x in s["slide_attributes"]["groups"]]
            if len(g) != len(set(g)) or len(g) > 10:
                err("idea board groups need unique ids, at most 10")
        elif t == "marketplace/escape-room-v2":
            rooms = cfg["rooms"]
            clues = [c for r in rooms for c in r["clues"]]
            if not 2 <= len(rooms) <= 6 or len(clues) > 15 or not all(
                    r["clues"] for r in rooms):
                err("escape room needs 2-6 rooms, each with clues, <= 15 clues")
            all_ids = [r["id"] for r in rooms] + [c["id"] for c in clues] + [
                ch["id"] for c in clues for ch in c["choices"]]
            if len(all_ids) != len(set(all_ids)):
                err("escape room ids are not unique")
            for c in clues:
                if sum(ch["correct"] for ch in c["choices"]) != 1:
                    err(f"escape clue {c['id']} needs exactly one correct choice")
                if len(c["prompt"]) > 140 or any(len(ch["text"]) > 40
                                                 for ch in c["choices"]):
                    err(f"escape clue {c['id']}: prompt > 140 or choice > 40 chars")
            pieces = [p["clueId"] for p in cfg["codePuzzle"]["pieces"]]
            if len(set(pieces)) != len(pieces) or not set(pieces) <= {
                    c["id"] for c in clues}:
                err("escape room code pieces must be distinct existing clues")
        elif t == "marketplace/duck-race":
            if "title" in s:
                err("duck race must not set a slide title")

        # Writing rules apply to text written for this rebuild (not the seven
        # cue quizzes kept verbatim from the first build).
        if not a.get("cue"):
            text = json.dumps(s, ensure_ascii=False) + " " + (a.get("notes") or "")
            if EM_DASH in text:
                err("em dash in new text")
            hits = [h for h in APOSTROPHE_RE.findall(text) if h not in EXEMPT]
            words = [w for w in re.findall(r"\b\w+['’]\w+\b", text)
                     if w not in EXEMPT]
            if hits or words:
                err(f"contraction or possessive in new text: {words or hits}")
    return bad


def build():
    pages = qmd_pages()
    problems = validate(pages, ACTIVITIES)
    if problems:
        print(f"{len(problems)} problem(s), nothing written:\n")
        for p in problems:
            print("  " + p)
        raise SystemExit(1)

    by_page = {}
    for a in ACTIVITIES:
        by_page.setdefault(a["after"], []).append(a)

    slides, n = [], 0
    for page_no, page in enumerate(pages, start=1):
        n += 1
        sl = {"n": n, "kind": page["kind"], "imagePage": page_no,
              "title": page["title"]}
        if page.get("subtitle"):
            sl["subtitle"] = page["subtitle"]
        if page.get("background"):
            sl["background"] = page["background"]
        if page["notes"]:
            sl["notes"] = page["notes"]
        slides.append(sl)
        for a in by_page.get(page_no, []):
            n += 1
            slides.append({
                "n": n, "kind": "interactive", "id": a["id"],
                "tier": a["tier"], "minutes": a["minutes"],
                "afterImage": page_no, "slideType": a["slide"]["slide_type"],
                "prompt": prompt_of(a), "answer": answer_of(a),
                "slide": a["slide"], "props": a.get("props", {}),
                "notes": notes_of(a), "legacy": a["id"].startswith("I"),
            })
    deck = {"presentation": {**PRESENTATION,
                             "interactivePositions": [s["n"] for s in slides
                                                      if s["kind"] == "interactive"]},
            "slides": slides}
    (HERE / "deck.json").write_text(json.dumps(deck, indent=1, ensure_ascii=False)
                                    + "\n", encoding="utf-8")
    (HERE / "deck.md").write_text(render_md(deck), encoding="utf-8")

    inter = [s for s in slides if s["kind"] == "interactive"]
    core = sum(s["minutes"] for s in inter if s["tier"] == "core")
    opt = sum(s["minutes"] for s in inter if s["tier"] == "opt")
    print(f"wrote deck.json and deck.md: {len(slides)} slides = "
          f"{IMAGE_PAGES} images + {len(inter)} interactive")
    print(f"  activity time: core {core:g} min, optional {opt:g} min")


def bullet_body(s):
    """Markdown lines showing what the audience sees for one activity."""
    sl, t = s["slide"], s["slideType"]
    cfg = sl.get("slide_attributes", {}).get("config", {})
    out = []
    if t in ("poll", "pick_answer_quiz"):
        for i, o in enumerate(sl["options"]):
            mark = "  ← CORRECT" if t != "poll" and chr(65 + i) == sl.get("correct") else ""
            out.append(f"- {chr(65 + i)}. {o}{mark}")
    elif t == "scale":
        c = sl["scale_config"]
        out.append(f"Scale {c['low_value']} ({c['low_label']}) to "
                   f"{c['high_value']} ({c['high_label']}):")
        out += [f"- {o['text']}" for o in sl["options"]]
    elif t == "categorise_quiz":
        out += [f"- **{c['name']}:** {', '.join(c['items'])}" for c in sl["options"]]
    elif t == "match_pairs_quiz":
        out += [f"- {p['left_item']} ↔ {p['right_item']}" for p in sl["pairs"]]
    elif t == "correct_order_quiz":
        out += [f"{o['position']}. {o['text']}" for o in
                sorted(sl["options"], key=lambda o: o["position"])]
    elif t == "marketplace/fill-in-the-blanks":
        out.append(f"> {cfg['question']}")
        out += [f"- blank {i + 1}: options {', '.join(b['dropdownOptions'])} → "
                f"**{b['acceptedAnswers'][0]}**" for i, b in enumerate(cfg["blanks"])]
    elif t == "marketplace/two-by-two-grid-v2":
        out.append(f"X axis: {cfg['xAxisLabel']} · Y axis: {cfg['yAxisLabel']}")
        out += [f"- {i['label']}" for i in cfg["items"]]
    elif t == "ideaBoard":
        out.append("Groups: " + ", ".join(g["name"] for g in
                                          sl["slide_attributes"]["groups"]))
    elif t == "marketplace/escape-room-v2":
        out.append(f"Theme: {cfg['theme']} · door code from clues "
                   + ", ".join(p["clueId"] for p in cfg["codePuzzle"]["pieces"]))
        for r in cfg["rooms"]:
            out.append(f"- **{r['name']}**")
            for c in r["clues"]:
                right = next(ch["text"] for ch in c["choices"] if ch["correct"])
                out.append(f"  - {c['prompt']} → **{right}** "
                           f"(choices: {' / '.join(ch['text'] for ch in c['choices'])})")
    return out


def render_md(deck):
    P = deck["presentation"]
    slides = deck["slides"]
    inter = [s for s in slides if s["kind"] == "interactive"]
    core = sum(s["minutes"] for s in inter if s["tier"] == "core")
    opt = sum(s["minutes"] for s in inter if s["tier"] == "opt")
    L = [
        "# AhaSlides deck: presenter copy",
        "",
        "> **Generated** by `build_deck_json.py` from `../slides/slides.qmd` (content "
        "slides, speaker notes) and `activities.py` (interactive slides). Do not "
        "edit by hand: edit those two files and regenerate.",
        "",
        f"**Presentation:** {P['title']}  ",
        f"**Editor:** {P['editorUrl']} (ID {P['presentationId']}, join code "
        f"**{P['joinCode']}**)  ",
        f"**Public view link:** {P['publicViewLink']}  ",
        f"**Plan:** {P['plan']}  ",
        f"**Backup of the free-plan version:** presentation {P['backupPresentationId']}",
        "",
        "## Composition",
        "",
        "| Kind | Count |",
        "|---|---|",
        f"| Content slides (images of the Quarto deck) | {P['imagePages']} |",
        f"| Interactive slides, core | {sum(s['tier'] == 'core' for s in inter)} |",
        f"| Interactive slides, optional (skip live if behind) | "
        f"{sum(s['tier'] == 'opt' for s in inter)} |",
        f"| **Total** | **{len(slides)}** |",
        "",
        f"Activity time: about **{core:g} min** for the core slides, plus "
        f"**{opt:g} min** if every optional slide runs. Quizzes use 30-second "
        "timers with faster answers earning more points (the Colab stop has "
        "five minutes).",
        "",
        "## Run of show",
        "",
        "| Pos | ID | After page | Type | Tier | Min | Answer |",
        "|---|---|---|---|---|---|---|",
    ]
    for s in inter:
        tier = "core" if s["tier"] == "core" else "*optional*"
        ans = s["answer"].replace("|", "/")
        L.append(f"| {s['n']} | {s['id']} | {s['afterImage']} | "
                 f"{TYPE_LABEL[s['slideType']]} | {tier} | {s['minutes']:g} | {ans} |")
    L += ["", "# Slides", ""]
    for s in slides:
        if s["kind"] == "interactive":
            tier = "CORE" if s["tier"] == "core" else "OPTIONAL, skip if behind"
            L.append(f"## {s['n']} — ★ {s['id']} — {TYPE_LABEL[s['slideType']]} "
                     f"({tier}, ~{s['minutes']:g} min)")
            L.append("")
            if s["prompt"]:
                L += [f"**Prompt:** {s['prompt']}", ""]
            body = bullet_body(s)
            if body:
                L += body + [""]
            L += [f"**Answer:** {s['answer']}", ""]
            if s["props"]:
                L += [f"**Settings:** `{json.dumps(s['props'], ensure_ascii=False)}`", ""]
        else:
            label = {"title": "Title", "divider": "Act divider",
                     "cue": "Cue slide (Before you look)",
                     "content": "Content"}[s["kind"]]
            L += [f"## {s['n']} — {label}", "", f"**Title:** {s['title']}", ""]
            if s.get("subtitle"):
                L += [f"**Subtitle:** {s['subtitle']}", ""]
            L += [f"**Image page:** {s['imagePage']} of {P['imagePages']}", ""]
            if s.get("background"):
                L += [f"**Background:** `{s['background']}`", ""]
        if s.get("notes"):
            L += [f"**Notes:** {s['notes']}", ""]
        L += ["---", ""]
    return "\n".join(L)


if __name__ == "__main__":
    build()
