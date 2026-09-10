#!/usr/bin/env python3
"""Parse deck.md into deck.json.

deck.md is the source of truth for the AhaSlides deck; deck.json is the
machine-readable form fed to the AhaSlides MCP server. Regenerate after any
edit to deck.md:

    python3 build_deck_json.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "deck.md"
OUT = HERE / "deck.json"

SLIDE_RE = re.compile(r"^## (\d+) — (.*)$")
FIELD_RE = re.compile(r"^\*\*([A-Za-z][^:*]*):\*\*\s*(.*)$")
OPTION_RE = re.compile(r"^- ([A-Z])\.\s+(.*)$")
BULLET_RE = re.compile(r"^(?:- |\d+\. )(.*)$")
BACKTICK_RE = re.compile(r"`([^`]+)`")


def clean(text, keep_bold=False):
    """Strip markdown emphasis and the CORRECT marker.

    Bullets keep their `**bold**` runs — the source deck uses them to mark the
    key term on each line, and the slide renderer understands markdown.
    """
    text = text.replace("← CORRECT", "")
    if keep_bold:
        # shield ** pairs so the italic pass below cannot eat one of their stars
        text = text.replace("**", "\x00")
    else:
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"\1", text)
    return text.replace("\x00", "**").strip()


def kind_of(heading, type_line):
    if heading.strip() == "Title":
        return "title"
    if "divider" in heading:
        return "heading"
    t = type_line.lower()
    if "word cloud" in t:
        return "word_cloud"
    if "open ended" in t:
        return "open_ended"
    if "rating" in t or "scale" in t:
        return "scale"
    if "quiz" in t:
        return "quiz"
    if "poll" in t:
        return "poll"
    return "content"


def parse_blocks(lines):
    """Split the Slides section into (number, heading, body-lines) blocks."""
    start = lines.index("# Slides")
    blocks, cur = [], None
    for line in lines[start + 1:]:
        m = SLIDE_RE.match(line)
        if m:
            if cur:
                blocks.append(cur)
            cur = (int(m.group(1)), m.group(2), [])
        elif cur:
            cur[2].append(line)
    if cur:
        blocks.append(cur)
    return blocks


def parse_slide(number, heading, body):
    fields, lists, notes = {}, {}, []
    current = None
    for line in body:
        if line.strip() == "---":
            current = None
            continue
        m = FIELD_RE.match(line)
        if m:
            name, value = m.group(1).strip(), m.group(2).strip()
            key = name.split(" (")[0].strip().lower()
            current = key
            if key == "notes":
                if value:
                    notes.append(value)
            elif key == "body":
                pass  # the headline follows on the next line, in backticks
            elif key in ("bullets", "options"):
                # may carry an inline caption, e.g. "*(original table: ...)*";
                # the items themselves always follow on subsequent lines
                lists[key] = []
                if value:
                    fields[key + "_caption"] = clean(value)
            elif value:
                fields[key] = value
            else:
                lists[key] = []
            continue
        if current == "notes":
            notes.append(line.strip())
        elif current == "body" and line.strip().startswith("`"):
            fields["body"] = BACKTICK_RE.search(line.strip()).group(1)
        elif current in lists:
            om = OPTION_RE.match(line.strip())
            bm = BULLET_RE.match(line.strip())
            if om:
                lists[current].append(
                    {"text": clean(om.group(2)), "correct": "← CORRECT" in line}
                )
            elif bm:
                lists[current].append(clean(bm.group(1),
                                            keep_bold=(current == "bullets")))
            elif line.strip().startswith("`"):
                lists[current].append(line.strip())

    type_line = fields.get("type", "")
    slide = {"n": number, "kind": kind_of(heading, type_line)}

    for key in ("title", "subtitle", "byline", "question"):
        if key in fields:
            slide[key] = clean(fields[key])
    if "background" in fields:
        slide["background"] = BACKTICK_RE.search(fields["background"]).group(1)
    if "image" in fields:
        slide["image"] = BACKTICK_RE.search(fields["image"]).group(1)
    if "body" in fields:
        slide["headline"] = fields["body"]
    if lists.get("bullets"):
        slide["bullets"] = lists["bullets"]
    if "bullets_caption" in fields:
        slide["sourceNote"] = fields["bullets_caption"]
    if lists.get("options"):
        slide["options"] = lists["options"]

    if slide["kind"] == "quiz":
        pts = re.search(r"(\d+)\s*points", type_line)
        secs = re.search(r"(\d+)\s*second", type_line)
        slide["points"] = int(pts.group(1)) if pts else 1000
        slide["timeLimitSeconds"] = int(secs.group(1)) if secs else 30
    if slide["kind"] == "word_cloud":
        n = re.search(r"(\d+)\s*entries", type_line)
        slide["entriesPerParticipant"] = int(n.group(1)) if n else 1
    if slide["kind"] == "scale":
        rng = re.search(r"(\d+)\s*to\s*(\d+)", type_line)
        slide["min"], slide["max"] = (
            (int(rng.group(1)), int(rng.group(2))) if rng else (1, 5)
        )
        if "scale labels" in fields:
            parts = [clean(p) for p in fields["scale labels"].split("·")]
            if len(parts) == 2:
                slide["minLabel"], slide["maxLabel"] = parts
    if slide["kind"] in ("poll", "quiz", "word_cloud", "scale", "open_ended"):
        slide["interactive"] = True

    note = " ".join(n for n in notes if n).strip()
    if note:
        slide["notes"] = note
    return slide


def validate(slides):
    """Structural checks. These exist because each one caught a real bug."""
    bad = []
    numbers = [s["n"] for s in slides]
    if numbers != list(range(1, len(slides) + 1)):
        bad.append((0, f"slide numbers are not 1..{len(slides)} contiguous: "
                       f"{numbers[:8]}..."))
    for s in slides:
        n, k = s["n"], s["kind"]
        if k == "quiz":
            correct = sum(o["correct"] for o in s.get("options", []))
            if correct != 1:
                bad.append((n, f"quiz has {correct} correct answers, expected 1"))
            if len(s.get("options", [])) < 2:
                bad.append((n, "quiz needs at least 2 options"))
        if k == "poll":
            if any(o["correct"] for o in s.get("options", [])):
                bad.append((n, "poll must not mark an option correct"))
            if len(s.get("options", [])) < 2:
                bad.append((n, "poll needs at least 2 options"))
        if k in ("quiz", "poll", "word_cloud", "scale", "open_ended") \
                and not s.get("question"):
            bad.append((n, f"{k} slide has no question"))
        if "image" in s and not (HERE.parent / s["image"]).is_file():
            bad.append((n, f"figure not found on disk: {s['image']}"))
        if k == "content" and not (s.get("bullets") or s.get("image")
                                   or s.get("headline")):
            bad.append((n, "content slide has neither bullets nor an image"))
        if k in ("title", "heading", "content") and not s.get("title"):
            bad.append((n, f"{k} slide has no title"))
    return bad


def main():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    slides = [parse_slide(n, h, b) for n, h, b in parse_blocks(lines)]

    deck = {
        "presentation": {
            "title": "A Bridge, Two Rivers, and One Number That Settles It",
            "subtitle": "What happens to a poor region when you finally "
                        "connect it to a rich one",
            "author": "Carlos Mendez — Nagoya University (GSID)",
            "language": "en",
            "source": "content/post/python_bridge_impact/slides/slides.qmd",
            "post": "https://carlos-mendez.org/post/python_bridge_impact/",
            "presentationId": 10040213,
            "publicViewLink": "https://presenter.ahaslides.com/share/"
                              "1789007350719-n7drztywna",
            "editorUrl": "https://presenter.ahaslides.com/presentation/10040213",
            "palette": {
                "steel_blue": "#6a9bcc",
                "warm_orange": "#d97757",
                "near_black": "#141413",
                "teal": "#00d4c8",
                "heading_blue": "#1a3a8a",
            },
            "imageBaseDir": "..",
        },
        "slides": slides,
    }
    problems = validate(slides)
    if problems:
        print(f"{SRC.name}: {len(problems)} problem(s) — nothing written\n")
        for n, msg in problems:
            print(f"  slide {n}: {msg}")
        raise SystemExit(1)

    OUT.write_text(json.dumps(deck, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    kinds = {}
    for s in slides:
        kinds[s["kind"]] = kinds.get(s["kind"], 0) + 1
    print(f"wrote {OUT.name}: {len(slides)} slides")
    for k in sorted(kinds):
        print(f"  {k:12} {kinds[k]}")


if __name__ == "__main__":
    main()
