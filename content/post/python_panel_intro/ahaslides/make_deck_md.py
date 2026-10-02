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
    dict(q="What share of the variance of union status comes from workers who "
           "change status between 2010 and 2012?", c="A",
         notes="Answer: A. Only 6.1% of the variance of union status is within "
               "workers. The within SD, 0.0911, is not a share: the share is its "
               "square divided by the sum of the squared between and within SDs "
               "(0.0083 out of 0.1362). Just 73 of 2,199 workers switch, so almost "
               "all the variation comes from comparing different workers. If B draws "
               "votes, point out that the SD ratio 0.0911/0.369 looks like 25% only "
               "because SDs are not variances. The next slide shows the decomposition."),
    dict(q="Pooled OLS gave 0.0750 (SE 0.0231). How will the first-difference "
           "estimate compare?", c="C",
         notes="Answer: C. FD gives 0.2113 with SE 0.0792, almost three times the "
               "POLS estimate and about 3.4 times its standard error. Differencing "
               "removes the fixed worker traits that depress the cross-sectional "
               "comparison, but it also discards every worker who never changes "
               "status, which leaves only 73 informative workers. The next slide "
               "writes out the differenced model."),
    dict(q="With two periods, will the FE estimate equal the FD estimate of 0.2113?",
         c="B",
         notes="Answer: B. FE gives 0.2103, a gap of 0.001. The gap comes from the "
               "intercept in the FD regression, which absorbs the common wage growth "
               "of 0.0727; drop the intercept and FD returns exactly 0.2103. If anyone "
               "chose A, they have the right intuition about the identity; the "
               "intercept is the one detail that breaks it. The next slide shows "
               "three recipes that all give 0.2103."),
    dict(q="FE gave 0.2103 and FD gave 0.2113. Where will two-way FE land?", c="A",
         notes="Answer: A. Two-way FE gives 0.2113, identical to FD with an intercept "
               "to six decimals. With T = 2 the year effect plays exactly the role of "
               "the FD intercept, so the gap between FD and one-way FE closes. The "
               "next slide shows the code and output."),
    dict(q="Plug the robust SEs (0.0812 for FE, 0.0299 for RE) into the Hausman "
           "formula instead of the classical ones. What happens to H?", c="B",
         notes="Answer: B. H falls from 5.62 (p = 0.018) to 1.79 (p = 0.180), so the "
               "verdict flips from rejecting RE to not rejecting it. The robust FE "
               "standard error grows much more than the robust RE one, which inflates "
               "the denominator V_FE − V_RE. But stress that the plug-in number is not "
               "a valid test: with robust errors V_FE − V_RE is no longer the variance "
               "of the difference. The next slide shows the textbook test; the "
               "Mundlak alternative comes right after."),
    dict(q="Random effects gave 0.1092. After adding union_bar, the worker mean of "
           "union status, what is the coefficient on union?", c="A",
         notes="Answer: A, exactly 0.2103. Once the worker mean of union status is "
               "controlled for, the only variation left in union is within variation, "
               "so random effects has nothing else to use. This holds for any RE "
               "weight θ, which is the Mundlak (1978) result; the post proves it with "
               "FWL. The next slide shows the Mundlak model and its test."),
    dict(q="With controls, age raises log wages by about 0.02 per year in pooled OLS. "
           "What happens to the age coefficient under two-way FE?", c="B",
         notes="Answer: B. It turns negative, −0.0576. Between 2010 and 2012, age "
               "rises by exactly two years for 1,885 of the 2,199 workers, which the "
               "year effect absorbs completely, so the coefficient is identified only "
               "by the 314 workers whose age rose by one or three years, mostly "
               "because of interview timing. Read it as fragile, not as an age "
               "profile of wages. The next slide shows all four models with controls."),
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

**Presentation:** Introduction to Panel Data Methods
**Subtitle:** Seven estimators, one wage panel: why the union premium triples
**Author:** Carlos Mendez — Nagoya University (GSID)
**Source deck:** `../slides/slides.qmd` (Quarto reveal.js, {PAGES} printed pages: title, 4 act dividers, 21 content slides, 7 "Before you look" cues)
**Post:** https://carlos-mendez.org/post/python_panel_intro/
**Language:** English only
**Public view link:** https://presenter.ahaslides.com/share/1790911128481-t7x8a80cw2
**Editor:** https://presenter.ahaslides.com/presentation/10245137 (ID 10245137, join code V62EU)

Generated by `make_deck_md.py` from `slides.qmd` and its quiz definitions. Edit those,
not this file.

## Composition

| Kind | Count |
|---|---|
| Title | 1 |
| Act dividers (incl. the closing sentence) | 4 |
| Content slides (images of the Quarto slides), incl. 7 "Before you look" cues | 28 |
| Interactive slides (new) | 7 |
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
- **The 7 interactive slides** — question, options, correct answer — which are created
  natively through the MCP from `deck.json`.
- **The running order**, which `build_deck_json.py` validates against `slides.qmd`.

## Free-plan constraints — accepted in advance

Seven interactive slides put this deck over the free plan's small allowance, so it is
capped at **3 live participants**, as measured on `python_bridge_impact`,
`python_sc_bayes_spatial` and `python_fwl`. The author accepted this before the build.
All seven are scored quizzes (`pick_answer_quiz`): each has a right answer, so the quiz
reveal and leaderboard are worth more than a poll. Word Cloud, Rating Scale and Open Ended
are separately premium and are not used. The correct letters are spread (A ×3, B ×3,
C ×1) so the room cannot learn a pattern.

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
