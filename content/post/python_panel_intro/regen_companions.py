"""Regenerate references/tutorial.qmd and notebook.ipynb from index.md.

Usage: python regen_companions.py            (run from anywhere)
Then run ./build_bundle.sh to refresh python_panel_intro.zip.

index.md is the single source of truth. The styled figure chunks, the
setup-packages chunk, the render callout and the "Source files" section are
carried over from the current tutorial.qmd, so the script is idempotent.
"""
import json
import re
import sys
from pathlib import Path

POST = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent
SLUG = POST.name
SITE = f"https://carlos-mendez.org/post/{SLUG}/"
RAW = f"https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/{SLUG}/"

md = (POST / "index.md").read_text()
old_qmd = (POST / "references/tutorial.qmd").read_text()

fm_end = md.index("\n---\n", 4)
front, body = md[4:fm_end], md[fm_end + 5:]
title = re.search(r'^title: "(.*)"$', front, re.M).group(1)
summary = re.search(r"^summary: (.*)$", front, re.M).group(1)


# ── pieces reused from the old qmd ──────────────────────────────────────────
def chunk(label):
    m = re.search(r"```\{python\}\n#\| label: " + re.escape(label) + r"\n(.*?)```", old_qmd, re.S)
    assert m, label
    lines = m.group(1).split("\n")
    opts = [l for l in lines if l.startswith("#|")]
    code = "\n".join(l for l in lines if not l.startswith("#|")).strip("\n")
    return opts, code


FIG = {
    "panel_intro_variation.png": "fig-variation",
    "panel_intro_trajectories.png": "fig-trajectories",
    "panel_intro_demeaning.png": "fig-demeaning",
    "panel_intro_coef_comparison.png": "fig-coef-comparison",
    "panel_intro_extended_models.png": "fig-extended-models",
}
FIGCODE = {}
for png, label in FIG.items():
    _, code = chunk(label)
    # keep the figures in sync with script.py
    code = code.replace('f"Hausman: χ²={H:.2f}, p={p_h:.3f}"', 'f"Hausman (classical): χ²={H:.2f}, p={p_h:.3f}"')
    code = code.replace("    if w > 8:", "    if w > 4:")
    if "set_xlim(right=" not in code:
      code = code.replace(
        'ax.set_title("Effect of Union on Log Wages: Six Panel Estimators",',
        "ax.set_xlim(right=max(c + 1.96 * s for c, s in zip(coefs, ses)) + 0.08)\n"
        'ax.set_title("Effect of Union on Log Wages: Six Panel Estimators",')
    code = code.replace(
        '''            ax.text(0, i, "absorbed", ha="center", va="center", fontsize=9,
                    color=LIGHT_TEXT, style="italic")''',
        '''            ax.text(0.5, i, "absorbed", ha="center", va="center", fontsize=10,
                    color=LIGHT_TEXT, style="italic",
                    transform=ax.get_yaxis_transform())''')
    if "locator_params" not in code:
      code = code.replace(
        '    ax.set_title(var.title(), fontsize=13, fontweight="bold", color=WHITE_TEXT)',
        '    ax.locator_params(axis="x", nbins=4)\n'
        '    ax.set_title(var.title(), fontsize=13, fontweight="bold", color=WHITE_TEXT)')
    FIGCODE[png] = code
assert "Hausman (classical)" in FIGCODE["panel_intro_coef_comparison.png"]
assert "w > 4" in FIGCODE["panel_intro_variation.png"]
assert "get_yaxis_transform" in FIGCODE["panel_intro_extended_models.png"]

_, SETUP_PACKAGES = chunk("setup-packages")
qmd_yaml = old_qmd[: old_qmd.index("\n---\n", 4) + 5]
qmd_yaml = re.sub(r'^date: ".*"$', 'date: "2026-10-02"', qmd_yaml, flags=re.M)
callout = re.search(r"(::: \{\.callout-important\}.*?\n:::\n)", old_qmd, re.S).group(1)
source_files = old_qmd[old_qmd.index("## Source files"):].rstrip() + "\n"
if "Cheat sheets:" not in source_files:
  source_files = source_files.replace(
    "- Published post:",
    "- Cheat sheets: [`cheatsheet_python.py`](" + RAW + "cheatsheet_python.py), "
    "[`cheatsheet_R.R`](" + RAW + "cheatsheet_R.R), "
    "[`cheatsheet_stata.do`](" + RAW + "cheatsheet_stata.do)\n- Published post:")


# ── tokenize the post body ──────────────────────────────────────────────────
# Segments: ("md", text) | ("code", lang, text)
seg_re = re.compile(r"```(\w+)\n(.*?)```\n?", re.S)
segs, pos = [], 0
for m in seg_re.finditer(body):
    segs.append(("md", body[pos:m.start()]))
    segs.append(("code", m.group(1), m.group(2)))
    pos = m.end()
segs.append(("md", body[pos:]))


def fix_prose(t):
    # the podcast embed above the Abstract belongs to the web page only
    t = re.sub(r'<div style="background:#0e1545;[^>]*>\s*<iframe[^>]*open\.spotify\.com[^>]*></iframe>\s*</div>\n*', "", t)
    t = t.replace("\\_", "_")                       # Goldmark escapes -> raw LaTeX
    t = t.replace("](/post/", "](https://carlos-mendez.org/post/")
    t = t.replace("](web_app/index.html)", "](" + SITE + "web_app/index.html)")
    t = t.replace(
        "{{< panel-lab >}}",
        "*The interactive lab runs in the browser: open it on the "
        "[published post](" + SITE + "#17-an-interactive-panel-lab).*")
    t = t.replace(
        "The figures in this post use the dark-navy palette of the site. The corresponding "
        "`plt.rcParams` block appears in `script.py`. We omit it here because it does not "
        "affect any estimate.",
        "The figures use the dark-navy palette of the site. The palette and the "
        "`plt.rcParams` block are set in the first figure cell; they do not affect any estimate.")
    return t


SOLUTION_CODES = set(re.findall(
    r'<details class="learn-card solution-card">.*?```python\n(.*?)```', body, re.S))
IMG = re.compile(r"!\[([^\]]*)\]\(([^)]+\.png)\)")


# ── qmd conversion of the HTML learn-cards into Quarto callouts ─────────────
def cards_to_callouts(t):
    t = re.sub(r'<div class="concept-pair">\n(.*?)</div>\n', r"\1", t, flags=re.S)
    # concept cards
    t = re.sub(r'<details class="concept-card concept-(example|analogy)">\n<summary>(.*?)</summary>\n',
               lambda m: '::: {.callout-note collapse="true" appearance="simple"}\n## ' + m.group(2) + "\n",
               t)
    # predict cards
    t = re.sub(r'<div class="learn-card predict-card">\n<p class="learn-card-kicker">Predict first</p>\n',
               "::: {.callout-tip}\n## Predict first\n", t)
    t = re.sub(r'<details class="learn-card-reveal">\n<summary>(.*?)</summary>\n',
               lambda m: '::: {.callout-note collapse="true"}\n## ' + m.group(1) + "\n", t)
    # proof / misconception / solution cards
    kinds = {"proof-card": "callout-note", "misconception-card": "callout-warning",
             "solution-card": "callout-tip"}

    def card(m):
        cls, kicker, rest = m.group(1), m.group(2), m.group(3).strip()
        return ('::: {.' + kinds[cls] + ' collapse="true"}\n## ' + kicker + ": " + rest + "\n")
    t = re.sub(r'<details class="learn-card (proof-card|misconception-card|solution-card)">\n'
               r'<summary><span class="learn-card-kicker">(.*?)</span>(.*?)</summary>\n', card, t)
    t = t.replace("</details>", ":::")
    t = t.replace("</div>", ":::")
    return t


def build_qmd():
    out = [qmd_yaml, "\n", callout, "\n"]
    i = 0
    skip_next_text = False
    while i < len(segs):
        s = segs[i]
        if s[0] == "md":
            t = fix_prose(s[1])
            t = cards_to_callouts(t)
            # images -> figure chunks
            def img(m):
                alt, png = m.group(1), m.group(2)
                if png == "panel_intro_trajectories.png":
                    return ""      # emitted with the trajectory code block
                return ("```{python}\n#| label: " + FIG[png] + '\n#| fig-cap: "' + alt.replace('"', "'")
                        + '"\n\n' + FIGCODE[png] + "\n```\n")
            t = IMG.sub(img, t)
            # drop the Colab badge (not meaningful in a local render)
            t = re.sub(r'<a href="https://colab[^\n]*</a>\n', "", t)
            out.append(t)
        else:
            lang, code = s[1], s[2]
            if lang == "text":
                pass           # outputs are regenerated by the render
            elif lang == "mermaid":
                out.append("```{mermaid}\n" + code + "```\n")
            elif lang == "python":
                if "panel_intro_trajectories.png" in code:
                    alt = "Individual wage trajectories for 30 sampled workers, colored by union-status pattern."
                    out.append("```{python}\n#| label: fig-trajectories\n#| fig-cap: \"" + alt + "\"\n\n"
                               + FIGCODE["panel_intro_trajectories.png"] + "\n```\n")
                else:
                    if code.startswith("import numpy as np"):
                        out.append("```{python}\n#| label: setup-packages\n\n" + SETUP_PACKAGES + "\n```\n\n")
                    out.append("```{python}\n" + code + "```\n")
        i += 1
    text = "".join(out)
    text = text.replace("## 22. References", "## 22. References", 1)
    text = text.rstrip() + "\n\n" + source_files
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


# ── notebook ────────────────────────────────────────────────────────────────
def build_ipynb():
    cells = []

    def mdcell(t):
        t = t.strip("\n")
        if t.strip():
            cells.append({"cell_type": "markdown", "metadata": {}, "source": t.splitlines(True)})

    def codecell(t):
        cells.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [],
                      "source": t.strip("\n").splitlines(True)})

    mdcell("# " + title + "\n\n*" + summary + "*\n\n"
           "Companion notebook to the post [" + title + "](" + SITE + "). "
           "The interactive lab of section 17 runs only on the published post.")
    buf = ""
    pending_close = 0

    def prev_md_had_solution(code):
        # a solution card holds exactly one code block
        return code in SOLUTION_CODES
    for s in segs:
        if s[0] == "md":
            t = fix_prose(s[1])
            t = re.sub(r'<a href="https://colab[^\n]*</a>\n', "", t)
            t = re.sub(r'<details class="learn-card solution-card">\n<summary>.*?</summary>\n',
                       "**Solution.**\n", t)
            if pending_close and "</details>" in t:
                t = t.replace("</details>", "", 1); pending_close -= 1

            parts = IMG.split(t)
            # IMG.split yields [text, alt, png, text, alt, png, ...]
            buf += parts[0]
            for k in range(1, len(parts), 3):
                png = parts[k + 1]
                if png != "panel_intro_trajectories.png":
                    mdcell(buf); buf = ""
                    codecell(FIGCODE[png])
                buf += parts[k + 2]
        else:
            lang, code = s[1], s[2]
            if lang == "text":
                continue
            if lang == "mermaid":
                buf += "```mermaid\n" + code + "```\n"
                continue
            # a code block inside an open <details> card: close the card text,
            # run the code as a normal cell, and keep the rest as markdown.
            mdcell(buf); buf = ""
            if prev_md_had_solution(code):
                pending_close += 1
            if "panel_intro_trajectories.png" in code:
                codecell(FIGCODE["panel_intro_trajectories.png"])
            else:
                if code.startswith("import numpy as np"):
                    codecell("!pip install pyfixest linearmodels -q")
                codecell(code)
    mdcell(buf)
    old = json.loads((POST / "notebook.ipynb").read_text())
    for k, c in enumerate(cells):
        c["id"] = f"cell-{k:03d}"
    nb = {"cells": cells, "metadata": old["metadata"], "nbformat": 4, "nbformat_minor": 5}
    return json.dumps(nb, indent=1, ensure_ascii=False) + "\n"


(POST / "references/tutorial.qmd").write_text(build_qmd())
(POST / "notebook.ipynb").write_text(build_ipynb())
print("wrote tutorial.qmd and notebook.ipynb")
