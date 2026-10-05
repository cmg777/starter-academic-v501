#!/usr/bin/env python3
"""Parse deck.md into deck.json, after checking it against slides.qmd.

deck.md is the source of truth for the AhaSlides deck, and deck.json is the
machine-readable form that build_payload.py reads. Regenerate after any edit:

    python3 build_deck_json.py                  # check deck.md, write deck.json
    python3 build_deck_json.py /path/deck.pdf   # also check the PDF to import

Under the image architecture the content slides are pages of an imported PDF,
so a content slide here carries only a title, its page number, and its speaker
notes. Only the quizzes are created through the MCP; see
.claude/docs/ahaslides.md.

The optional PDF check needs pdfinfo and pdftotext (poppler). It confirms the
page count, that every page opens with the title that slides.qmd gives it, and
that every cue page shows the options of its quiz.

Adapted from content/post/python_did101/ahaslides/build_deck_json.py. Here the
fields of deck.md are list items, notes keep their paragraphs, the title slide
has notes, and the checks also cover the cue and reveal conventions.
"""
import json
import re
import shutil
import subprocess
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "deck.md"
OUT = HERE / "deck.json"
QMD = HERE.parent / "slides" / "slides.qmd"   # the deck the images come from

# The shape of the deck, asserted by validate(). IMAGE_PAGES must equal the
# page count of the rendered PDF (pdfinfo deck.pdf). Quiz k sits right after
# its "Before you look" cue on source page p_k, so its final position is
# p_k + k: cue pages 4, 12, 14, 20, 25 give 5, 14, 17, 24, 30.
IMAGE_PAGES = 36
INTERACTIVE_POSITIONS = [5, 14, 17, 24, 30]
MAX_QUESTION = 120   # a quiz question is short UI text on a phone
IMAGE_KINDS = ("title", "divider", "cue", "content")

SLIDE_RE = re.compile(r"^## (\d+)\. (.*)$")
FIELD_RE = re.compile(r"^(?:- )?\*\*([A-Za-z][^:*]*):\*\*\s*(.*)$")
OPTION_RE = re.compile(r"^\s+- ([A-Z])\. (.*?)\s*(← CORRECT)?\s*$")
META_RE = re.compile(r"^\| \*\*(.+?)\*\* \| (.*?) \|$")
BACKTICK_RE = re.compile(r"`([^`]+)`")
# A "Before you look" cue option in slides.qmd:  **A.**&nbsp; Smaller: ...
QMD_OPTION_RE = re.compile(r"^\*\*([A-Z])\.\*\*(?:&nbsp;|\s)+(.*?)\s*$")
QMD_HEAD_RE = re.compile(r"^(#{1,2}) (.*?)\s*(\{.*\})?\s*$")
# Writing rules for quiz text: no em dash, and no apostrophe at all, which
# rules out both possessives and contractions.
UI_RULES = re.compile("[—'’]")


def clean(text):
    """Strip markdown emphasis, so titles compare as plain text."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"\1", text)
    return text.strip()


def squash(text):
    """Collapse all whitespace runs, so wrapped and one-line text compare."""
    return " ".join((text or "").split())


def sentences(text):
    """A rough sentence split, enough to count the sentences of a note."""
    text = re.sub(r"(?<=\d)\.(?=\d)", "", squash(text))   # decimals
    return [t for t in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9−(])", text) if t]


def words(text):
    """Lowercase letters and digits only, to compare a title with PDF text."""
    return re.findall(r"[a-z0-9]+", text.lower())


def yaml_string(front, key):
    """Value of a double-quoted YAML scalar; its escapes decode as JSON."""
    m = re.search(rf'^{key}:\s*"(.*)"\s*$', front, re.M)
    return json.loads(f'"{m.group(1)}"') if m else ""


def qmd_pages():
    """The Quarto deck the images were rendered from, one dict per printed page.

    Each dict holds the kind of the page (title, divider, cue, or content),
    its title, its background, its speaker notes (verbatim, paragraphs joined
    by a blank line) and, for a "Before you look" cue, its lettered options.

    Page 1 is the title slide, built from the YAML header by a template
    partial; its notes are data-notes under title-slide-attributes. Every #
    and ## heading after the header is one printed page, because the PDF is
    rendered with pdfSeparateFragments=false. Headings inside fenced code
    blocks are Python comments, not slides, and are skipped.
    """
    if not QMD.is_file():
        return None
    _, front, body = QMD.read_text(encoding="utf-8").split("---\n", 2)
    title_notes = yaml_string(front, r"\s+data-notes")
    pages = [{"kind": "title", "title": clean(yaml_string(front, "title")),
              "subtitle": clean(yaml_string(front, "subtitle")),
              "background": None, "options": [],
              "notes": [title_notes] if title_notes else []}]
    para, in_notes, in_code = [], False, False
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if s.startswith("::: {.notes}"):
            in_notes, para = True, []
        elif in_notes:
            if s and s != ":::":
                para.append(s)
                continue
            if para:   # a blank line or the closing fence ends a paragraph
                pages[-1]["notes"].append(" ".join(para))
            para, in_notes = [], s != ":::"
        else:
            m = QMD_HEAD_RE.match(line)
            if m:
                bg = re.search(r'background-color="([^"]+)"', m.group(3) or "")
                kind = ("divider" if m.group(1) == "#" else
                        "cue" if m.group(2).startswith("Before you look") else
                        "content")
                pages.append({"kind": kind, "title": clean(m.group(2)),
                              "background": bg.group(1) if bg else None,
                              "options": [], "notes": []})
                continue
            om = QMD_OPTION_RE.match(s)
            if om:
                pages[-1]["options"].append(
                    {"letter": om.group(1), "text": clean(om.group(2))})
    for p in pages:
        p["notes"] = "\n\n".join(p["notes"])
    return pages


def kind_of(heading, type_line):
    if heading == "Title slide":
        return "title"
    if heading == "Divider":
        return "divider"
    if heading.startswith("Cue slide"):
        return "cue"
    if heading == "Content":
        return "content"
    t = type_line.lower()
    if "quiz" in t:
        return "quiz"
    if "poll" in t:
        return "poll"
    return "unknown"


def parse_meta(lines):
    """The header table of deck.md: presentation, links, and join code."""
    meta = {}
    for line in lines:
        if line.startswith("## "):
            break
        m = META_RE.match(line)
        if m:
            value = m.group(2).strip()
            meta[m.group(1)] = None if value in ("", "pending") else value
    return meta


def parse_blocks(lines):
    """Split the Slides section into (number, heading, body lines) blocks."""
    start = lines.index("# Slides")
    blocks, cur = [], None
    for line in lines[start + 1:]:
        m = SLIDE_RE.match(line)
        if m:
            if cur:
                blocks.append(cur)
            cur = (int(m.group(1)), m.group(2).strip(), [])
        elif cur:
            cur[2].append(line)
    if cur:
        blocks.append(cur)
    return blocks


def parse_slide(number, heading, body):
    fields, options, notes = {}, [], []
    current = None
    for line in body:
        if line.strip() == "---":
            current = None
            continue
        m = FIELD_RE.match(line)
        if m:
            current = m.group(1).strip().lower()
            value = m.group(2).strip()
            if current == "notes":
                notes = [value]
            elif value:
                fields[current] = value
            continue
        if current == "notes":
            notes.append(line.strip())   # an empty line marks a new paragraph
        elif current == "options":
            om = OPTION_RE.match(line)
            if om:
                options.append({"letter": om.group(1), "text": om.group(2),
                                "correct": bool(om.group(3))})
        elif current in fields and line.startswith("  ") and line.strip():
            # a wrapped list item continues on an indented line; without this
            # the value would be cut at the first line break
            fields[current] += " " + line.strip()

    heading = heading.replace("★", "").strip()
    slide = {"n": number, "kind": kind_of(heading, fields.get("type", ""))}
    for key in ("title", "subtitle", "question"):
        if key in fields:
            slide[key] = clean(fields[key])
    if "background" in fields:
        slide["background"] = BACKTICK_RE.search(fields["background"]).group(1)
    if "image page" in fields:
        page, _, of = fields["image page"].partition(" of ")
        slide["imagePage"] = int(page)
        slide["imagePagesInPdf"] = int(of) if of.isdigit() else None
    if "after image page" in fields:
        slide["afterImage"] = int(fields["after image page"])
    if "correct" in fields:
        slide["correct"] = fields["correct"]
    if options:
        slide["options"] = options
    if slide["kind"] in ("quiz", "poll"):
        slide["interactive"] = True

    paras, para = [], []
    for s in notes + [""]:
        if s:
            para.append(s)
        elif para:
            paras.append(" ".join(para))
            para = []
    if paras:
        slide["notes"] = "\n\n".join(paras)
    return slide


def check_quiz(s, slides, i, pages, bad):
    """A quiz must answer the cue right before it and match that cue exactly."""
    n, opts = s["n"], s.get("options", [])
    marked = [o["letter"] for o in opts if o["correct"]]
    correct = s.get("correct")
    if len(marked) != 1:
        bad.append((n, f"quiz has {len(marked)} correct options, expected 1"))
    elif correct != marked[0]:
        bad.append((n, f"Correct says {correct} but option {marked[0]} is "
                       f"marked correct"))
    question = s.get("question", "")
    if not question:
        bad.append((n, "quiz has no question"))
    elif len(question) > MAX_QUESTION:
        bad.append((n, f"question has {len(question)} characters, the limit "
                       f"is {MAX_QUESTION}"))
    for text in [question, s.get("notes", "")] + [o["text"] for o in opts]:
        if UI_RULES.search(text):
            bad.append((n, f"quiz text breaks the writing rules (em dash or "
                           f"apostrophe): {text[:60]!r}"))
    notes = s.get("notes", "")
    if not notes.startswith(f"Answer: {correct}."):
        bad.append((n, f"quiz notes must open with 'Answer: {correct}.'"))
    if len(sentences(notes)) < 4:
        bad.append((n, "quiz notes need at least three sentences after the "
                       "answer"))

    prev = slides[i - 1] if i else {}
    nxt = slides[i + 1] if i + 1 < len(slides) else {}
    cue_page = s.get("afterImage")
    if not cue_page or prev.get("imagePage") != cue_page:
        bad.append((n, f"After image page {cue_page} is not the image right "
                       f"before this quiz"))
        return
    if prev.get("kind") != "cue" or cue_page > len(pages):
        bad.append((n, f"image page {cue_page} before this quiz is not a cue"))
        return
    src = pages[cue_page - 1]
    mine = [(o["letter"], o["text"]) for o in opts]
    cue = [(o["letter"], o["text"]) for o in src["options"]]
    if mine != cue:
        bad.append((n, f"options do not repeat the cue on {QMD.name} page "
                       f"{cue_page} verbatim: {mine} vs {cue}"))
    said = re.search(r"Answer on the next slide: ([A-Z])\.", src["notes"])
    if not said or said.group(1) != correct:
        bad.append((n, f"the cue notes on page {cue_page} give "
                       f"{said.group(1) if said else 'no answer'}, the quiz "
                       f"gives {correct}"))
    if not src["notes"].endswith("(AhaSlides interactive follows.)"):
        bad.append((n, f"the cue notes on page {cue_page} must end with "
                       f"'(AhaSlides interactive follows.)'"))
    if nxt.get("imagePage") != cue_page + 1:
        bad.append((n, "a quiz must be followed by the reveal image"))
    elif not nxt.get("notes", "").startswith(
            f"The answer to the vote: {correct}."):
        bad.append((n, f"the reveal notes on page {cue_page + 1} must open "
                       f"with 'The answer to the vote: {correct}.'"))


def validate(slides, pages, meta):
    """Structural checks. Each one guards against a mistake that is easy to make."""
    bad = []
    numbers = [s["n"] for s in slides]
    if numbers != list(range(1, len(slides) + 1)):
        bad.append((0, f"slide numbers are not 1..{len(slides)} contiguous"))
    if len(slides) != IMAGE_PAGES + len(INTERACTIVE_POSITIONS):
        bad.append((0, f"deck.md has {len(slides)} slides, expected "
                       f"{IMAGE_PAGES} images + {len(INTERACTIVE_POSITIONS)} "
                       f"quizzes"))

    # The imported PDF supplies the images in page order, so the image pages
    # must run 1..N with nothing missing, repeated, or out of sequence: every
    # interleave anchor downstream depends on it.
    seen = [s["imagePage"] for s in slides if "imagePage" in s]
    if seen != list(range(1, IMAGE_PAGES + 1)):
        dupes = sorted({p for p in seen if seen.count(p) > 1})
        bad.append((0, f"image pages are not 1..{IMAGE_PAGES} in order "
                       f"(repeated: {dupes or 'none'})"))
    for s in slides:
        if s.get("imagePagesInPdf") not in (None, IMAGE_PAGES):
            bad.append((s["n"], f"says {s['imagePagesInPdf']} pages in the "
                                f"PDF, expected {IMAGE_PAGES}"))

    if pages is None:
        bad.append((0, f"source deck not found at {QMD}"))
        return bad
    if len(pages) != IMAGE_PAGES:
        bad.append((0, f"{QMD.name} now has {len(pages)} pages, not "
                       f"{IMAGE_PAGES}; re-render the PDF and re-import"))
    if (meta.get("Presentation"), meta.get("Subtitle")) != (
            pages[0]["title"], pages[0]["subtitle"]):
        bad.append((0, "the header table does not repeat the title and "
                       "subtitle of slides.qmd"))

    # deck.md records the titles and speaker notes of the Quarto deck. If
    # slides.qmd is edited and the deck re-rendered, the images change but
    # deck.md does not, so compare everything that the images also show.
    for i, s in enumerate(slides):
        n, k = s["n"], s["kind"]
        page = s.get("imagePage")
        if k in IMAGE_KINDS:
            if not s.get("title"):
                bad.append((n, f"{k} slide has no title"))
            if not page:
                bad.append((n, f"{k} slide declares no image page"))
                continue
            if page > len(pages):
                continue
            src = pages[page - 1]
            if k != src["kind"]:
                bad.append((n, f"is labeled {k}, but {QMD.name} page {page} "
                               f"is a {src['kind']} slide"))
            if s.get("title") != src["title"]:
                bad.append((n, f"title drifted from {QMD.name} page {page}: "
                               f"{s.get('title')!r} vs {src['title']!r}"))
            if s.get("background") != src["background"]:
                bad.append((n, f"background differs from {QMD.name} page "
                               f"{page}"))
            if k == "title" and s.get("subtitle") != src["subtitle"]:
                bad.append((n, "subtitle drifted from slides.qmd"))
            if squash(s.get("notes")) != squash(src["notes"]):
                bad.append((n, f"speaker notes differ from {QMD.name} page "
                               f"{page}; copy them over verbatim"))
            if k == "cue" and not (i + 1 < len(slides)
                                   and slides[i + 1].get("interactive")):
                bad.append((n, f"the cue on image page {page} has no quiz "
                               f"right after it"))
        elif k == "quiz":
            if page:
                bad.append((n, "an interactive slide must not claim an image "
                               "page"))
            check_quiz(s, slides, i, pages, bad)
        elif k == "poll":
            if any(o["correct"] for o in s.get("options", [])):
                bad.append((n, "a poll must not mark an option correct"))
        else:
            bad.append((n, f"unknown slide kind; check its heading and Type"))

    positions = [s["n"] for s in slides if s.get("interactive")]
    if positions != INTERACTIVE_POSITIONS:
        bad.append((0, f"interactive slides sit at {positions}, expected "
                       f"{INTERACTIVE_POSITIONS}"))
    return bad


def check_pdf(pdf, pages):
    """Compare the PDF to import with slides.qmd, page by page."""
    if not (shutil.which("pdfinfo") and shutil.which("pdftotext")):
        return [(0, "the PDF check needs pdfinfo and pdftotext (poppler)")]
    if not Path(pdf).is_file():
        return [(0, f"PDF not found: {pdf}")]
    info = subprocess.run(["pdfinfo", pdf], capture_output=True,
                          text=True).stdout
    m = re.search(r"^Pages:\s+(\d+)", info, re.M)
    count = int(m.group(1)) if m else 0
    bad = []
    if count != IMAGE_PAGES:
        bad.append((0, f"{Path(pdf).name} has {count} pages, expected "
                       f"{IMAGE_PAGES}"))
    for p, src in enumerate(pages[:count], start=1):
        text = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), pdf,
                               "-"], capture_output=True, text=True).stdout
        have, want = words(text), words(src["title"])
        if have[:len(want)] != want:
            bad.append((0, f"PDF page {p} does not open with the title "
                           f"{src['title']!r}"))
        flat = " ".join(have)
        for o in src["options"]:
            if " ".join(words(o["letter"] + ". " + o["text"])) not in flat:
                bad.append((0, f"PDF page {p} does not show option "
                               f"{o['letter']} of its cue"))
    return bad


def main():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    meta = parse_meta(lines)
    slides = [parse_slide(n, h, b) for n, h, b in parse_blocks(lines)]
    pages = qmd_pages()
    problems = validate(slides, pages, meta)
    pdf = sys.argv[1] if len(sys.argv) > 1 else None
    if pdf and pages:
        problems += check_pdf(pdf, pages)
    if problems:
        print(f"{SRC.name}: {len(problems)} problem(s), nothing written\n")
        for n, msg in problems:
            print(f"  slide {n}: {msg}")
        raise SystemExit(1)

    pid = meta.get("Presentation ID")
    deck = {
        "presentation": {
            "title": meta.get("Presentation"),
            "subtitle": meta.get("Subtitle"),
            "author": meta.get("Author"),
            "language": "en",
            "source": "content/post/python_sc101/slides/slides.qmd",
            "post": meta.get("Post"),
            "presentationId": int(pid) if pid and pid.isdigit() else None,
            "publicViewLink": meta.get("Public view link"),
            "editorUrl": meta.get("Editor"),
            "joinCode": meta.get("Join code"),
            "architecture": "content slides are imported PDF pages; only the "
                            "interactive slides are created through the MCP",
            "imagePages": IMAGE_PAGES,
            "interactivePositions": INTERACTIVE_POSITIONS,
            "totalSlides": len(slides),
            # poll and pick_answer_quiz only; Word Cloud, Rating Scale, and
            # Open Ended are separately premium
            "freePlanTypesOnly": True,
        },
        "slides": [{k: v for k, v in s.items() if k != "imagePagesInPdf"}
                   for s in slides],
    }
    OUT.write_text(json.dumps(deck, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    kinds = Counter(s["kind"] for s in slides)
    print(f"wrote {OUT.name}: {len(slides)} slides")
    for k in sorted(kinds):
        print(f"  {k:10} {kinds[k]}")
    print(f"checked against {QMD.name}: {len(pages)} pages, titles, notes, "
          f"backgrounds, cue options, and positions {INTERACTIVE_POSITIONS}")
    if pdf:
        print(f"checked {Path(pdf).name}: {IMAGE_PAGES} pages, every title "
              f"and every cue option in place")


if __name__ == "__main__":
    main()
