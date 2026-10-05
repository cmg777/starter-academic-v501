#!/usr/bin/env python3
"""Write deck.md from ../slides/slides.qmd and the quiz definitions below.

    python3 make_deck_md.py && python3 build_deck_json.py && python3 build_payload.py

slides.qmd supplies every printed page: its title, its divider color, its
speaker notes (verbatim, with paragraph breaks kept), and the A, B, and C
options of each "Before you look" cue. QUIZZES supplies what only the
AhaSlides layer has: the question, the correct letter, and the presenter notes
of each quiz. Quiz k is placed right after the k-th cue, and
build_deck_json.py then checks the result against slides.qmd again.

Adapted from content/post/python_did101/ahaslides/make_deck_md.py, with two
additions for this deck: the title slide has notes (data-notes under
title-slide-attributes in the YAML header), and some notes have two
paragraphs. Headings and fields avoid em dashes, so that deck.md follows the
writing rules of the post.
"""
import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
QMD = HERE.parent / "slides" / "slides.qmd"
OUT = HERE / "deck.md"
PAGES = 36  # pdfinfo deck.pdf: 1 title, 5 dividers, 25 content slides, 5 cues

# Set these once the presentation exists, then rerun the three scripts.
PRESENTATION_ID = 10267450  # integer returned by create_presentation
SHARE_LINK = "https://presenter.ahaslides.com/share/1791196372251-qpgn4k0rq1"  # Share, then "Share slides view link", with notes off
JOIN_CODE = "KROUI"

# One quiz per cue, in deck order. The options are not repeated here: they are
# read from the cue slide, so the quiz always shows exactly what the room saw.
QUIZZES = [
    dict(q="In 1970, California sold 2.92 packs per capita more than the "
           "average donor state. How large is the gap in 1988?", c="C",
         notes="Answer: C. California sat 23.72 packs below the donor average "
               "in 1988, after starting 2.92 packs above it in 1970. By 1988, "
               "California sold 90.1 packs per capita against 113.82 for the "
               "average of the 38 donor states. Votes for A or B assume "
               "parallel paths, which these years contradict. The naive "
               "difference-in-differences estimate of −27.35 packs rests on "
               "that same assumption. The next slide shows the raw trends."),
    dict(q="Five of the 38 donor states receive positive weight, led by Utah. "
           "How much of synthetic California does Utah supply?", c="B",
         notes="Answer: B. Utah receives 0.335, about one third of the recipe, "
               "and the other four shares range from 0.236 for Nevada to 0.068 "
               "for Connecticut. The other 33 donor states receive exactly "
               "zero. Utah earns the largest share because its low sales pull "
               "the weighted average down toward the level of California. The "
               "next slide shows the five donor weights next to the Stata "
               "weights."),
    dict(q="Stata and mlsynth agree on the donor weights within 0.002. What "
           "will mlsynth report for the predictor weights?", c="A",
         notes="Answer: A. The mlsynth fit splits V almost evenly among the age "
               "share (0.332), the retail price (0.334), and sales in 1975 "
               "(0.334). Stata instead puts 0.546 on the age share and 0.422 on "
               "sales in 1975, yet both programs reach almost the same donor "
               "weights. When a few predictors are matched exactly, many V "
               "select the same W, so V is not identified and neither program "
               "contains an error. The next slide shows the predictor gaps and "
               "both V vectors."),
    dict(q="California has the largest MSPE ratio of the 39 states. Which "
           "states rank just below it?", c="C",
         notes="Answer: C. Georgia, Virginia, and Missouri rank second to "
               "fourth, and each fits better than California before 1989. "
               "Their pre-treatment MSPEs are 1.41, 2.74, and 1.09, against "
               "3.08 for California. A poor fit inflates the denominator of "
               "the ratio, so badly fitted states rarely rank high. "
               "California still ranks first, so p = 1/39 = 0.026, the "
               "smallest p-value that 39 states allow. The next slide shows "
               "the ratio table and the bar chart."),
    dict(q="Drop Utah, which supplies one third of the recipe, and refit with "
           "the other 37 donors. What happens?", c="A",
         notes="Answer: A. New Mexico, which has zero weight in the baseline, "
               "becomes the leading donor with 0.614, and Montana drops out. "
               "The pre-treatment RMSE worsens from 1.754 to 2.584, yet the ATT "
               "stays close to the baseline, at −17.52 packs against −18.98. "
               "Across all five leave-one-out refits, the ATT stays between "
               "−19.29 and −17.52 packs, so no single donor drives the result. "
               "The next slide shows the five refits."),
]

OPT_RE = re.compile(r"^\*\*([A-Z])\.\*\*(?:&nbsp;|\s)+(.*?)\s*$")
HEAD_RE = re.compile(r"^(#{1,2}) (.*?)\s*(\{.*\})?\s*$")
LABEL = {"title": "Title slide", "divider": "Divider",
         "cue": "Cue slide (Before you look)", "content": "Content"}
TIMES = {1: "once", 2: "twice", 3: "three times", 4: "four times",
         5: "five times"}
WORDS = {3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight"}


def yaml_string(front, key):
    """Value of a double-quoted YAML scalar, such as title: "...".

    The escapes of a YAML double-quoted scalar that can occur here are also
    JSON escapes, so json.loads decodes them.
    """
    m = re.search(rf'^{key}:\s*"(.*)"\s*$', front, re.M)
    return json.loads(f'"{m.group(1)}"') if m else ""


def pages():
    """One dict per printed page: the title slide, then every # and ## heading.

    Notes are a list of paragraphs. Headings inside fenced code blocks are
    Python comments, not slides, and are skipped.
    """
    _, front, body = QMD.read_text(encoding="utf-8").split("---\n", 2)
    title_notes = yaml_string(front, r"\s+data-notes")
    out = [dict(kind="title", title=yaml_string(front, "title"),
                sub=yaml_string(front, "subtitle"), bg=None, opts=[],
                notes=[title_notes] if title_notes else [])]
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
            continue
        if in_notes:
            if s and s != ":::":
                para.append(s)
                continue
            if para:  # a blank line or the closing fence ends a paragraph
                out[-1]["notes"].append(" ".join(para))
            para, in_notes = [], s != ":::"
            continue
        m = HEAD_RE.match(line)
        if m:
            bg = re.search(r'background-color="([^"]+)"', m.group(3) or "")
            kind = ("divider" if m.group(1) == "#" else
                    "cue" if m.group(2).startswith("Before you look") else
                    "content")
            out.append(dict(kind=kind, title=m.group(2), sub=None, opts=[],
                            notes=[], bg=bg.group(1) if bg else None))
            continue
        om = OPT_RE.match(s)
        if om:
            out[-1]["opts"].append((om.group(1), om.group(2)))
    return out


def main():
    ps = pages()
    if len(ps) != PAGES:
        raise SystemExit(f"slides.qmd has {len(ps)} pages, expected {PAGES}")
    cues = [i for i, p in enumerate(ps, start=1) if p["kind"] == "cue"]
    if len(cues) != len(QUIZZES):
        raise SystemExit(f"{len(cues)} cue slides but {len(QUIZZES)} quizzes")

    for k, cp in enumerate(cues):
        cue, quiz = ps[cp - 1], QUIZZES[k]
        letters = "".join(letter for letter, _ in cue["opts"])
        if len(letters) < 2 or letters != "ABCDEF"[:len(letters)]:
            raise SystemExit(f"page {cp}: cue options are lettered "
                             f"{letters!r}, expected A, B, C")
        said = re.search(r"Answer on the next slide: ([A-Z])\.",
                         " ".join(cue["notes"]))
        if not said or said.group(1) != quiz["c"] or quiz["c"] not in letters:
            raise SystemExit(f"Q{k + 1}: correct letter {quiz['c']} does not "
                             f"match the cue notes on page {cp}")

    rows = []
    for k, cp in enumerate(cues):
        c, cue = QUIZZES[k]["c"], ps[cp - 1]
        rows.append(f"| Q{k + 1} | {cp + k + 1} | {cp} | {cue['title']} | "
                    f"{c}. {dict(cue['opts'])[c]} |")

    count = Counter(p["kind"] for p in ps)
    spread = [f"{letter} {TIMES[n]}" for letter, n
              in sorted(Counter(q["c"] for q in QUIZZES).items())]
    spread = (", ".join(spread[:-1]) + ", and " + spread[-1]
              if len(spread) > 1 else spread[0])
    title, sub = ps[0]["title"], ps[0]["sub"]
    total = PAGES + len(QUIZZES)
    n_quiz = WORDS.get(len(QUIZZES), str(len(QUIZZES)))
    pid = str(PRESENTATION_ID) if PRESENTATION_ID else "pending"
    editor = (f"https://presenter.ahaslides.com/presentation/{PRESENTATION_ID}"
              if PRESENTATION_ID else "pending")
    share = SHARE_LINK or "pending"
    join = JOIN_CODE or "pending"
    glance = "\n".join(rows)
    pending = ""
    if not (PRESENTATION_ID and SHARE_LINK and JOIN_CODE):
        pending = (
            "\nThe presentation ID, the two links, and the join code read pending\n"
            "until the presentation exists. Set them at the top of\n"
            "`make_deck_md.py` and rerun the three scripts. The build then carries\n"
            "them into `deck.json` and `payload.json`.\n")

    head = f"""\
# AhaSlides deck: source of truth

| Field | Value |
|---|---|
| **Presentation** | {title} |
| **Subtitle** | {sub} |
| **Author** | Carlos Mendez, Nagoya University (GSID) |
| **Source deck** | `../slides/slides.qmd` (Quarto reveal.js, {PAGES} printed pages) |
| **Post** | https://carlos-mendez.org/post/python_sc101/ |
| **Language** | English only |
| **Presentation ID** | {pid} |
| **Editor** | {editor} |
| **Public view link** | {share} |
| **Join code** | {join} |

This file is generated by `make_deck_md.py` from `slides.qmd` and the quiz
definitions in that script. Edit those two sources rather than this file, and
rerun the three scripts. The build checks every title, note, and quiz option
here against `slides.qmd`.
{pending}
## Composition

| Kind | Count |
|---|---|
| Title slide | {count["title"]} |
| Dividers (three acts, the misconceptions, and the closing sentence) | {count["divider"]} |
| Content slides (images of the Quarto slides) | {count["content"]} |
| "Before you look" cue slides (images) | {count["cue"]} |
| Interactive slides (new, native quizzes) | {len(QUIZZES)} |
| **Total** | **{total}** |

The content slides are images. All {PAGES} pages of the Quarto deck are
rendered to one PDF and imported through the editor, so the typography,
tables, equations, code, takeaway boxes, and divider colors survive exactly.
AhaSlides supplies only the audience layer. The procedure is in
`.claude/docs/ahaslides.md`, and the specifics of this deck are in
`README.md`.

## What this file is for

Because the content slides are images, this file is the only home of three
things. Imported slides cannot carry speaker notes, so every note lives here.
Keep this file open on a second screen while presenting.

- **Speaker notes:** every note of `slides.qmd`, copied verbatim with its paragraphs, which `build_deck_json.py` checks.
- **Interactive slides:** the {n_quiz} quizzes with question, options, and correct letter, created through the MCP from `payload.json`.
- **Running order:** the {total} positions of the final deck, which `build_payload.py` turns into one insert call per quiz.

## Free-plan note

Every interactive slide counts toward a small free-plan allowance, and a deck
above that allowance is capped at 3 live participants. Earlier decks with
seven or eight interactive slides were capped, while the `python_did101` deck
still read 0 / 50 with five quizzes. After the build, reload the editor, read
the participant badge, and test a live session before teaching from this deck.

All {n_quiz} interactive slides are scored quizzes (`pick_answer_quiz`),
because each cue has one right answer. A quiz reveals the answer and keeps a
leaderboard, which a poll does not. Word Cloud, Rating Scale, and Open Ended
are separately premium and are not used. The correct letters are spread
({spread}), so the room cannot learn a pattern.

## Interactive slides at a glance

| Quiz | Final position | After image page | Cue slide | Correct answer |
|---|---|---|---|---|
{glance}

Each quiz answers the cue slide right before it and repeats the A, B, and C
options of that cue verbatim. Show the cue image, then advance to the quiz to
open voting. The next image is the reveal, and its notes begin with the words
"The answer to the vote". In AhaSlides the options display as A, B, C, because
`build_payload.py` letters them and sends them in reverse order.

# Slides"""

    blocks, n = [head + "\n"], 0
    for pi, p in enumerate(ps, start=1):
        n += 1
        lines = [f"## {n}. {LABEL[p['kind']]}", "",
                 f"- **Title:** {p['title']}"]
        if p["sub"]:
            lines.append(f"- **Subtitle:** {p['sub']}")
        lines.append(f"- **Image page:** {pi} of {PAGES}")
        if p["bg"]:
            lines.append(f"- **Background:** `{p['bg']}`")
        if p["notes"]:
            lines += ["", "**Notes:** " + "\n\n".join(p["notes"])]
        blocks.append("\n".join(lines) + "\n\n---\n")
        if pi in cues:
            k = cues.index(pi)
            d, n = QUIZZES[k], n + 1
            opts = [f"  - {letter}. {text}"
                    + ("  ← CORRECT" if letter == d["c"] else "")
                    for letter, text in p["opts"]]
            lines = [f"## {n}. ★ Interactive quiz Q{k + 1}", "",
                     "- **Type:** multiple choice quiz (`pick_answer_quiz`), "
                     "scored, with the default points and timer of the "
                     "presentation",
                     f"- **After image page:** {pi}",
                     f"- **Question:** {d['q']}",
                     "- **Options:**", *opts,
                     f"- **Correct:** {d['c']}",
                     "", f"**Notes:** {d['notes']}"]
            blocks.append("\n".join(lines) + "\n\n---\n")
    OUT.write_text("\n".join(blocks), encoding="utf-8")
    print(f"wrote {OUT.name}: {n} slides ({PAGES} images, {len(QUIZZES)} quizzes)")


if __name__ == "__main__":
    main()
