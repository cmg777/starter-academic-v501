#!/usr/bin/env python3
"""Parse deck.md into deck.json.

deck.md is the source of truth for the AhaSlides deck; deck.json is the
machine-readable form fed to the AhaSlides MCP server. Regenerate after any
edit to deck.md:

    python3 build_deck_json.py

Under the image architecture the content slides are pages of an imported PDF,
not text built through the API, so a content slide here carries only a title,
its source page number and its speaker notes. Only the interactive slides are
actually created through the MCP; see .claude/docs/ahaslides.md.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "deck.md"
OUT = HERE / "deck.json"
QMD = HERE.parent / "slides" / "slides.qmd"   # the deck the images come from

# The deck's shape, asserted by validate(). IMAGE_PAGES must equal the page
# count of the rendered PDF (pdfinfo deck.pdf); INTERACTIVE_POSITIONS is the
# final running order the move_slide calls reproduce.
IMAGE_PAGES = 36
INTERACTIVE_POSITIONS = [6, 13, 17, 20, 25, 29, 32, 42]

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


def qmd_pages():
    """Titles, in page order, of the Quarto deck the images were rendered from.

    Page 1 is the title slide (built from YAML by a template partial, so it has
    no heading); every `#` and `##` after the front matter is one printed page,
    because the PDF is rendered with pdfSeparateFragments=false.
    """
    if not QMD.is_file():
        return None
    body = QMD.read_text(encoding="utf-8").split("---" + chr(10), 2)[2]
    titles, in_notes = ["Who Else Was Treated?"], False
    for line in body.splitlines():
        if line.strip().startswith("::: {.notes}"):
            in_notes = True
        elif in_notes and line.strip() == ":::":
            in_notes = False
        elif not in_notes:
            m = re.match(r"^#{1,2} (.*?)\s*(\{.*\})?\s*$", line)
            if m:
                titles.append(clean(m.group(1)))
    return titles


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
        elif current in fields and line.strip():
            # a wrapped scalar field (Title, Question, Subtitle) continues on
            # the next line — without this the value is silently truncated at
            # the first line break, which is exactly how it shipped once.
            fields[current] += " " + line.strip()
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
    if "image page" in fields:
        # "12 of 36" -> 12, the page of the imported PDF this slide is
        slide["imagePage"] = int(fields["image page"].split()[0])
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
        if k in ("title", "heading", "content") and not s.get("title"):
            bad.append((n, f"{k} slide has no title"))
        if k in ("title", "heading", "content") and not s.get("imagePage"):
            bad.append((n, f"{k} slide declares no source image page"))
        if s.get("interactive") and s.get("imagePage"):
            bad.append((n, "interactive slide must not claim an image page"))

    # The imported PDF supplies the content slides in page order, so the image
    # pages must run 1..N with nothing missing, duplicated or out of sequence —
    # every interleave offset downstream depends on it.
    seen = [s["imagePage"] for s in slides if s.get("imagePage")]
    if seen != list(range(1, len(seen) + 1)):
        dupes = {p for p in seen if seen.count(p) > 1}
        bad.append((0, f"image pages are not 1..{len(seen)} in order "
                       f"(duplicated: {sorted(dupes) or 'none'})"))
    if len(seen) != IMAGE_PAGES:
        bad.append((0, f"expected {IMAGE_PAGES} imported pages, found {len(seen)}"))

    # deck.md records the Quarto deck's titles; if slides.qmd is edited and the
    # deck re-rendered, the images change but deck.md does not. Catch that.
    titles = qmd_pages()
    if titles is None:
        bad.append((0, f"source deck not found at {QMD}"))
    else:
        if len(titles) != IMAGE_PAGES:
            bad.append((0, f"{QMD.name} now has {len(titles)} pages, not "
                           f"{IMAGE_PAGES} - re-render the PDF and re-import"))
        for sl in slides:
            page = sl.get("imagePage")
            if page and page <= len(titles) and sl.get("title") != titles[page - 1]:
                bad.append((sl["n"], f"title drifted from {QMD.name} page {page}: "
                                     f"deck.md has {sl.get('title')!r}, "
                                     f"slides.qmd has {titles[page - 1]!r}"))

    positions = [s["n"] for s in slides if s.get("interactive")]
    if positions != INTERACTIVE_POSITIONS:
        bad.append((0, f"interactive slides sit at {positions}, "
                       f"expected {INTERACTIVE_POSITIONS}"))
    return bad


def main():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    slides = [parse_slide(n, h, b) for n, h, b in parse_blocks(lines)]

    deck = {
        "presentation": {
            "title": "Who Else Was Treated?",
            "subtitle": "Three synthetic controls, one policy, and the "
                        "interval that was 33 times too narrow",
            "author": "Carlos Mendez — Nagoya University (GSID)",
            "language": "en",
            "source": "content/post/python_sc_bayes_spatial/slides/slides.qmd",
            "post": "https://carlos-mendez.org/post/python_sc_bayes_spatial/",
            "presentationId": 10042312,
            "publicViewLink": "https://presenter.ahaslides.com/share/1789021577046-xkh2lwuly9",
            "editorUrl": "https://presenter.ahaslides.com/presentation/10042312",
            "architecture": "content slides are imported PDF pages; only the "
                            "interactive slides are created through the MCP",
            "imagePages": IMAGE_PAGES,
            "interactivePositions": INTERACTIVE_POSITIONS,
            "freePlanTypesOnly": True,
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
