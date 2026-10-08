#!/usr/bin/env python3
"""Write deck.md from ../slides/slides.qmd plus the quiz definitions below.

    python3 make_deck_md.py && python3 build_deck_json.py && python3 build_payload.py

slides.qmd supplies every content slide (title, act-divider color, speaker notes
verbatim) and every "Before you look" cue's A/B/C options; QUIZZES supplies what
only the AhaSlides layer has: the question, the correct letter and the presenter
notes of each interactive slide. Interactive k is placed right after the k-th cue.
build_deck_json.py then re-checks the result against slides.qmd.
"""
import re
from pathlib import Path

HERE = Path(__file__).parent
QMD = HERE.parent / "slides" / "slides.qmd"
OUT = HERE / "deck.md"
PAGES = 33

QUIZZES = [
    dict(q="Tutored schools rose by 36.20 GPA points. What did the 25 comparison "
           "schools do, and where does that leave the DiD effect?", c="B",
         notes="Answer: B. Comparison schools rose by 10.88 points (71.22 to 82.10) "
               "with no program at all. That region-wide drift is also part of the "
               "treated schools' 36.20, so DiD = 36.20 − 10.88 = 25.32. If A draws "
               "votes, that is the naive before-after in disguise: it assumes nothing "
               "else changed. The next slide shows the means table."),
    dict(q="Replace treated and post with school and period fixed effects, and "
           "cluster by school. What changes?", c="A",
         notes="Answer: A. In a balanced 2×2 panel the school effects absorb `treated` "
               "and the period effects absorb `post` without touching the "
               "interaction, so the coefficient stays 25.315. The standard error "
               "moves from 0.615 (HC1) to 0.585 (clustered by school) because each "
               "school's two observations may now be correlated. The next slide "
               "shows the two-way fixed-effects model."),
    dict(q="Add female_share, which varies a little within schools, to the two-way "
           "fixed-effects model. What happens to the DiD estimate of 25.315?", c="C",
         notes="Answer: C. It moves from 25.315 to 25.328, a shift of 0.013, and "
               "female_share itself is insignificant (p = 0.714). Stability is the "
               "reassuring part; it does not prove the fixed effects capture "
               "everything, and a covariate the program can change is a bad control. "
               "The next slide shows the three specifications side by side."),
    dict(q="Same model, same coefficient (25.315), four variance estimators. Which "
           "reports the largest standard error?", c="C",
         notes="Answer: C. CRV3, the leave-one-school-out jackknife, gives 0.637; then "
               "iid 0.607; HC1 and CRV1 are nearly identical at 0.585. Every "
               "t-statistic is above 39, so the choice cannot change the verdict here. "
               "With only 10 treated schools it would matter for smaller effects. The "
               "next slide shows the four standard errors."),
    dict(q="Eight periods, one coefficient per period, each relative to t = −1. If "
           "parallel trends holds, what should the event study show?", c="A",
         notes="Answer: A. The leads are 0.34, −0.32 and 0.59 (all p > 0.17) and the "
               "lags are 25.03, 24.71, 24.77 and 25.70: an effect that appears in the "
               "first treated period and stays roughly flat. Stress that quiet leads "
               "are consistent with parallel trends, not proof of it. The next slide "
               "shows the event-study plot."),
]

OPT_RE = re.compile(r"^\*\*([A-Z])\.\*\*(?:&nbsp;|\s)+(.*?)\s*$")


def pages():
    _, front, body = QMD.read_text(encoding="utf-8").split("---\n", 2)
    out = [dict(kind="title", bg=None, notes=[], opts=[],
                title=re.search(r'^title:\s*"(.*)"', front, re.M).group(1),
                sub=re.search(r'^subtitle:\s*"(.*)"', front, re.M).group(1))]
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
            continue
        if in_notes and s == ":::":
            in_notes = False
            continue
        if in_notes:
            if s:
                out[-1]["notes"].append(s)
            continue
        m = re.match(r"^(#{1,2}) (.*?)\s*(\{.*\})?\s*$", line)
        if m:
            bg = re.search(r'background-color="([^"]+)"', m.group(3) or "")
            kind = ("heading" if m.group(1) == "#" else
                    "cue" if m.group(2).startswith("Before you look") else "content")
            out.append(dict(kind=kind, title=m.group(2), notes=[], opts=[],
                            bg=bg.group(1) if bg else None))
            continue
        om = OPT_RE.match(s)
        if om:
            out[-1]["opts"].append(om.group(2))
    return out


def main():
    ps = pages()
    if len(ps) != PAGES:
        raise SystemExit(f"slides.qmd has {len(ps)} pages, expected {PAGES}")
    cues = [i for i, p in enumerate(ps, start=1) if p["kind"] == "cue"]
    if len(cues) != len(QUIZZES):
        raise SystemExit(f"{len(cues)} cue slides but {len(QUIZZES)} quizzes")

    for k, cp in enumerate(cues):
        said = re.search(r"Answer on the next slide: ([A-C])", " ".join(ps[cp - 1]["notes"]))
        if not said or said.group(1) != QUIZZES[k]["c"]:
            raise SystemExit(f"quiz I{k + 1}: correct letter {QUIZZES[k]['c']} does not "
                             f"match the cue notes on page {cp}")

    rows = []
    for k, cp in enumerate(cues):
        o = ps[cp - 1]["opts"]
        c = QUIZZES[k]["c"]
        title = re.sub(r"\*(.+?)\*", r"\1", ps[cp - 1]["title"])
        rows.append(f"| I{k + 1} | {cp + k + 1} | quiz | {cp} — {title} | "
                    f"{c}. {o['ABC'.index(c)]} |")

    head = f"""# AhaSlides deck — source of truth

**Presentation:** Introduction to Difference-in-Differences in Python
**Subtitle:** Does after-school tutoring raise GPA? Separating the program from the trend
**Author:** Carlos Mendez — Nagoya University (GSID)
**Source deck:** `../slides/slides.qmd` (Quarto reveal.js, {PAGES} printed pages: title, 5 dividers, 22 content slides, 5 "Before you look" cues)
**Post:** https://carlos-mendez.org/tutorials/python_did101/
**Language:** English only
**Public view link:** https://presenter.ahaslides.com/share/1790995456625-cj6th2dfd9
**Editor:** https://presenter.ahaslides.com/presentation/10254213 (ID 10254213, join code KYSMB)

Generated by `make_deck_md.py` from `slides.qmd` and its quiz definitions. Edit those,
not this file.

## Composition

| Kind | Count |
|---|---|
| Title | 1 |
| Dividers (3 acts, misconceptions, closing sentence) | 5 |
| Content slides (images of the Quarto slides), incl. 5 "Before you look" cues | 27 |
| Interactive slides (new) | 5 |
| **Total** | **{PAGES + len(QUIZZES)}** |

**Content slides are images.** All {PAGES} pages of the Quarto deck are rendered to PDF and
imported, so the typography, tables, LaTeX, code highlighting, the `.takeaway` boxes and
the act-divider colors are preserved exactly. AhaSlides supplies only the audience layer.
The procedure is in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md);
this deck's specifics are in `README.md`.

## What this file is for

Because the content slides are images, this file is the **only** place three things live:

- **All speaker notes**, carried over verbatim from `slides.qmd`. They cannot be attached
  to imported slides, so keep this file open on a second screen while presenting.
- **The 5 interactive slides** — question, options, correct answer — which are created
  natively through the MCP from `deck.json`.
- **The running order**, which `build_deck_json.py` validates against `slides.qmd`.

## Free-plan constraints — accepted in advance

Five interactive slides put this deck over the free plan's small allowance, so it is
capped at **3 live participants**, as measured on `python_bridge_impact`,
`python_sc_bayes_spatial`, `python_fwl` and `python_panel_intro`. The author accepted this
before the build. All five are scored quizzes (`pick_answer_quiz`): each has a right answer, so the quiz
reveal and leaderboard are worth more than a poll. Word Cloud, Rating Scale and Open Ended
are separately premium and are not used. The correct letters are spread (A ×2, B ×1,
C ×2) so the room cannot learn a pattern.

## Interactive slides at a glance

| # | Position | Type | Follows source page | Correct |
|---|---|---|---|---|
""" + "\n".join(rows) + """

**How a cue works in the room.** Each interactive slide answers the "Before you look" cue
slide right before it, and repeats that cue's A/B/C options verbatim (the build checks
it). Show the cue image, advance to the quiz to open voting, then the next image is the
reveal; its notes begin with "The answer to the vote".

# Slides
"""
    blocks, n = [head], 0
    for pi, p in enumerate(ps, start=1):
        n += 1
        if p["kind"] == "title":
            b = (f"## {n} — Title\n\n**Title:** {p['title']}\n\n"
                 f"**Subtitle:** {p['sub']}\n\n**Image page:** {pi} of {PAGES}\n")
        else:
            label = {"heading": "Act divider", "cue": "Cue slide (Before you look)",
                     "content": "Content"}[p["kind"]]
            b = (f"## {n} — {label}\n\n**Title:** {p['title']}\n\n"
                 f"**Image page:** {pi} of {PAGES}\n")
            if p["bg"]:
                b += f"\n**Background:** `{p['bg']}`\n"
        if p["notes"]:
            b += f"\n**Notes:** {' '.join(p['notes'])}\n"
        blocks.append(b + "\n---\n")
        if pi in cues:
            k = cues.index(pi)
            d, n = QUIZZES[k], n + 1
            opts = "\n".join(
                f"- {L}. {t}{'  ← CORRECT' if L == d['c'] else ''}"
                for L, t in zip("ABC", p["opts"]))
            blocks.append(
                f"## {n} — ★ INTERACTIVE {k + 1} — Quiz (scored)\n\n"
                f"**Type:** multiple choice quiz · scored · presentation default "
                f"points and timer\n\n**Question:** {d['q']}\n\n**Options:**\n\n"
                f"{opts}\n\n**Notes:** {d['notes']}\n\n---\n")
    OUT.write_text("\n".join(blocks), encoding="utf-8")
    print(f"wrote {OUT.name}: {n} slides")


if __name__ == "__main__":
    main()
