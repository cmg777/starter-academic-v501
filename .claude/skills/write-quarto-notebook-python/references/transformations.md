# Transformations from `index.md` → `tutorial.qmd` (Python)

Every transformation the skill applies as it copies content from the
Hugo source into the Quarto notebook. Apply in order; later passes
assume earlier ones have run.

This is the Python-only variant of the corresponding file in
`write-quarto-notebook/references/transformations.md`. The math escape,
mermaid, internal-link, and figure rules are identical; the YAML
header and code-fence rules are Python-specific.

---

## 1. YAML front matter

Discard the entire Hugo front matter (everything between the opening
`---` and the matching `---` at the top of `index.md`). Replace with
the template in `templates/tutorial.qmd.partial.yaml`, substituting:

- `<TITLE>` ← Hugo `title`
- `<SUBTITLE>` ← Hugo `summary` (truncated to ~80 chars; strip
  trailing punctuation if any)
- `<DATE>` ← Hugo `date` reformatted to `YYYY-MM-DD`
- `<KERNEL_NAME>` ← `<slug>-tutorial` (e.g. `pyfixest-tutorial`,
  `python-pca-tutorial`)

Fields to *drop*: `authors`, `categories`, `tags`, `featured`, `draft`,
`external_link`, `slides`, `url_*`, `image`, `links`, `toc`, `diagram` —
all Hugo-specific.

The template includes:

- `theme: cosmo` (Bootstrap light theme — no dark override).
- `embed-resources: true` so figures embed as base64 in `tutorial.html`.
- `fig-dpi: 150` (not 300) so embedded base64 PNGs are ~half the size.
- `include-in-header` `<style>` block enforcing
  `img, .cell-output-display img { max-width: 100%; height: auto }` —
  prevents figure overflow on narrow viewports.

---

## 2. Math escape

Hugo's Goldmark renderer with MathJax `processEscapes: true` (set in
`assets/js/mathjax-config.js`) means `\\` inside `$$...$$` is rendered as
a literal `\`. Quarto's MathJax does not apply that override, so we must
convert.

| Source pattern | Replacement |
|---|---|
| `\\,` | `\,` (thin space) |
| `\\;` | `\;` (medium space) |
| `\\!` | `\!` (negative space) |
| `\\*` | `*` (literal asterisk) |
| `\\{` | `\{` |
| `\\}` | `\}` |
| `\\big`, `\\Big`, `\\bigg`, `\\Bigg` | `\big`, `\Big`, `\bigg`, `\Bigg` |
| `\\^\*` | `^*` |
| `\\_` (inside math) | `_` |
| `\\$` (inside math) | `\$` (escape stays — MathJax needs it) |
| `\\$` (in prose, currency) | `$` (Quarto doesn't apply Hugo's processEscapes override) |

**Apply to**: every `$...$` inline math span and every `$$...$$` display
math block. Do **not** apply to ordinary backslashes outside math
(e.g., file paths).

**Edge case**: when math sits inside a markdown table cell, the table
parser may need additional escaping. Test the render and back off if a
table breaks.

---

## 3. Mermaid blocks

Quarto renders Mermaid natively via its built-in `mermaid` fence:

```
Before:           After:
``` mermaid       ``` {mermaid}
flowchart LR      flowchart LR
...               ...
```               ```
```

Block *contents* are copied verbatim. Style declarations
(`style A fill:#xxx`) work in Quarto.

**Edge case**: subgraph syntax. If Quarto flags `subgraph ID["Title"]`,
rewrite to the quoted form `subgraph "Title"`.

---

## 4. Internal site links

The rendered `tutorial.html` is opened locally by readers, not served
under `https://carlos-mendez.org/`. Relative Hugo links won't resolve.
Rewrite:

| Source pattern | Replacement |
|---|---|
| `(/post/<slug>/)` | `(https://carlos-mendez.org/post/<slug>/)` |
| `(/publication/<slug>/)` | `(https://carlos-mendez.org/publication/<slug>/)` |
| `(/event/<slug>/)` | `(https://carlos-mendez.org/event/<slug>/)` |
| `#section-anchor` (intra-doc) | leave as-is (Quarto generates anchors) |

External `https://...` links are left alone.

---

## 5. Code fences

Hugo uses bare-language fences; Quarto needs curly-brace executable
fences for chunks it should run.

| Source fence | Quarto fence |
|---|---|
| ```` ```python ```` | ```` ```{python} ```` |
| ```` ```text ```` (output block) | **drop entirely** |
| ```` ```bash ```` (shell commands) | leave as ```` ```bash ```` (non-executable) |
| ```` ```yaml ```` | leave as ```` ```yaml ```` (non-executable) |
| ```` ```r ```` / ```` ```stata ```` | leave as bare fence (non-executable; rendered as-is for cross-language reference posts) |

Every `{python}` chunk gets a `#| label:` line immediately after the
opening fence. Labels are kebab-case and predictable:

- `setup-packages` — first executable chunk (verification-only;
  actual installs happen in `setup_env.py`).
- `data-download` — fetches data from GitHub raw URL.
- `data-<entity>` — derived datasets.
- `fit-<method>` — model fits.
- `<topic>-<role>` — non-model chunks.
- `fig-<purpose>` — figure-producing chunks.

If two chunks would collide on a label, suffix with `-2`, `-3` (never
copy a label across chunks).

### The `setup-packages` chunk

Unlike the parent `write-quarto-notebook` skill (which puts the install
loop inside this chunk), `write-quarto-notebook-python` performs all
installs via `setup_env.py` BEFORE Quarto runs. So this chunk is
verification-only:

````markdown
```{python}
#| label: setup-packages

import sys, importlib.metadata
from pathlib import Path

# Pinned versions used to produce the published numbers. The notebook's
# .venv/ was created and populated by `setup_env.py` (see _quarto.yml
# pre-render hook). This chunk verifies that the kernel is running inside
# that .venv/ and that the installed versions match.

PINNED = {
    "<pkg>": "<version>",
    # ... headline packages only; not the bootstrap or Intel-override pins ...
}

py = Path(sys.executable).resolve()
assert ".venv" in py.parts, (
    f"Kernel is running outside the tutorial .venv (sys.executable={py}). "
    "Re-render from Positron so the pre-render hook activates the venv kernel."
)
print(f"Python: {py}")

for pkg, want in PINNED.items():
    have = importlib.metadata.version(pkg)
    status = "OK" if have == want else f"MISMATCH (want {want})"
    print(f"  {pkg:18s} {have:10s}  [{status}]")
```
````

`PINNED` in the chunk lists **headline packages only** (the user-facing
imports from `script.py`). The bootstrap (`jupyter`, `ipykernel`) and
Intel-override (`numba`, `llvmlite`) entries are infrastructure, not
didactic — they belong in `setup_env.py`'s `PINNED`, not in the
notebook's verification chunk.

---

## 6. Output blocks ` ```text `

The Hugo `index.md` pairs each ` ```python ` chunk with a static
` ```text ` output block. Quarto re-executes everything, so these
become stale by construction. Drop them entirely.

The text after the output block (the "Reading the output"
interpretation paragraph) is **kept** verbatim — it's prose, not
stale numbers.

---

## 7. Figure references

Source pattern: a markdown line of the form

```
![alt text describing the figure](figN_name.png)
```

In `index.md` these are images that were pre-rendered by `script.py`.
In the `.qmd` we want Quarto to *regenerate* them, so:

1. Find the chunk in the companion script that produces the figure
   with matching name. This is the canonical implementation.
2. If the same chunk also exists in `index.md` (a simplified didactic
   version), prefer the `index.md` version — it is the audience-facing
   form.
3. If neither version exists (figure was hand-edited), fall back to
   lifting the chunk from `script.py` and *removing*
   `plt.savefig(...)` calls.
4. Wrap as an executable chunk:

````markdown
```{python}
#| label: fig-<purpose>
#| fig-cap: "<alt text from index.md, lightly polished>"

import matplotlib.pyplot as plt
# ... plotting code ...
plt.show()
```
````

The `#| label:` slug should be a stable identifier — strip the
`figN_` prefix: `fig1_scree_plot.png` → `fig-scree-plot`.

---

## 8. Hugo shortcodes

If the source `index.md` contains Hugo shortcodes (rare in Python
posts):

| Shortcode | Action |
|---|---|
| `{{< fullwidth-iframe ... >}}` | Drop with `<!-- iframe omitted in Quarto -->`. |
| `{{% callout note %}}...{{% /callout %}}` | Rewrite to a Quarto callout: `:::{.callout-note}\n...\n:::` |
| `{{< youtube ... >}}` | Rewrite to the raw embed URL inside an `<iframe>` tag. |
| any other Hugo shortcode | Drop with a comment, surface in the Phase 2 scope block ambiguities. |

---

## 9. AI Podcast / Disqus / tag-cloud blocks

These artifacts of the published post have no place in the `.qmd` and
should be omitted entirely:

- AI podcast player block (`<style>...<script>` HTML at the end of the
  post body).
- Disqus comments div.
- Tag-cloud links.
- Hugo image-caption shortcodes that reference `featured.jpg`.
- `<!-- more -->` Hugo comment.

---

## 10. Source-files footer

After all of the above, append a short "Source files" section at the
end of the `.qmd`:

```markdown
## Source files

- Companion script: [`script.py`](https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/script.py)
- Published post: <https://carlos-mendez.org/post/<slug>/>
- GitHub repo: <https://github.com/cmg777/starter-academic-v501>
```

---

## 11. Currency dollar signs in prose

Hugo posts use `\\$` for literal dollar signs (e.g. `\\$1,736`) to
defeat MathJax's `processEscapes`. Quarto's MathJax does not enable
`processEscapes` by default, so currency rendering works without
escaping:

| Source pattern | Replacement |
|---|---|
| `\\$1,736` (Hugo currency) | `$1,736` (bare dollar; Quarto MathJax leaves it alone) |
| `\\$X` where X is a math expression | `\$X` (escape stays — MathJax needs it inside math contexts) |

When in doubt, render and inspect — broken currency is highly visible.
