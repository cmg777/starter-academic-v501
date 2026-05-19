# Transformations from `index.md` → `tutorial.qmd`

Every transformation the skill applies as it copies content from the
Hugo source into the Quarto notebook. Apply in order; later passes
assume earlier ones have run.

---

## 1. YAML front matter

Discard the entire Hugo front matter (everything between the opening
`---` and the matching `---` at the top of `index.md`). Replace with the
Quarto front matter from
[`language-conventions.md`](language-conventions.md).

Fields to *carry over* from the Hugo front matter:

- `title` → Quarto `title`
- `summary` → Quarto `subtitle` (truncated to ~80 characters)
- `date` → Quarto `date` (reformat to `YYYY-MM-DD` if needed)

Fields to *drop*:

- `authors`, `categories`, `tags`, `featured`, `draft`, `external_link`,
  `slides`, `url_*`, `image`, `links`, `toc`, `diagram` — all Hugo-specific.

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

Quarto renders Mermaid natively via its built-in `mermaid` fence. The
syntax is slightly different from Hugo's:

```
Before:           After:
``` mermaid       ``` {mermaid}
flowchart LR      flowchart LR
...               ...
```               ```
```

Mermaid block *contents* (the flowchart DSL itself) are copied verbatim.
Style declarations (`style A fill:#xxx`) work in Quarto.

**Edge case**: subgraph syntax. Some `index.md` files use `subgraph
"Title"` (quoted) which Quarto accepts; others use the older `subgraph
ID["Title"]` form which Quarto may flag. If the render fails on a
subgraph line, rewrite to the quoted form.

---

## 4. Internal site links

The rendered `tutorial.html` is opened locally by readers, not served
under `https://carlos-mendez.org/`. Relative Hugo links like
`/post/r_did/` won't resolve. Rewrite:

| Source pattern | Replacement |
|---|---|
| `(/post/<slug>/)` | `(https://carlos-mendez.org/post/<slug>/)` |
| `(/publication/<slug>/)` | `(https://carlos-mendez.org/publication/<slug>/)` |
| `(/event/<slug>/)` | `(https://carlos-mendez.org/event/<slug>/)` |
| `#section-anchor` (intra-doc) | leave as-is (Quarto generates anchors) |

External links (`https://...`) are left alone.

---

## 5. Code fences

Hugo uses bare-language fences (`/```r`/, `/```python`/, `/```stata`/);
Quarto needs curly-brace executable fences for chunks it should run.

| Source fence | Quarto fence |
|---|---|
| ```` ```r ```` | ```` ```{r} ```` |
| ```` ```python ```` | ```` ```{python} ```` |
| ```` ```stata ```` | ```` ```{stata} ```` |
| ```` ```text ```` (output block) | **drop entirely** |
| ```` ```bash ```` (shell commands) | leave as ```` ```bash ```` (non-executable) |
| ```` ```yaml ```` | leave as ```` ```yaml ```` (non-executable) |

Every executable chunk gets a `#| label:` line immediately after the
opening fence. Labels are kebab-case and predictable:

- `setup-packages` — first executable chunk; installs deps.
- `data-download` — fetches data from GitHub raw URL.
- `data-<entity>` — derived datasets (`data-california`, `data-imputed`).
- `fit-<method>` — model fits (`fit-naive`, `fit-did`, `fit-its-arima`,
  `fit-rdd`, `sc-fit`).
- `<topic>-<role>` — non-model chunks (`its-arima-gap`, `sc-balance`,
  `sc-significance`).
- `fig-<purpose>` — figure-producing chunks (`fig-raw-series`,
  `fig-did-trends`, `fig-forest`).

If two chunks would collide on a label, suffix with `-2`, `-3` (never
copy a label across chunks).

---

## 6. Output blocks ` ```text `

The Hugo `index.md` pairs each ` ```r ` chunk with a static
` ```text ` output block showing what the code printed when the post was
written. Quarto re-executes everything, so these become stale by
construction. Drop them entirely.

The text after the output block (the "Reading the output" interpretation
paragraph) is **kept** verbatim --- it's prose, not stale numbers.

---

## 7. Figure references

Source pattern: a markdown line of the form

```
![alt text describing the figure](figN_name.png)
```

In `index.md` these are images that were pre-rendered by `analysis.R` /
`script.py`. In the `.qmd` we want Quarto to *regenerate* them, so:

1. Find the chunk in the companion script that produces the figure with
   matching name (`save_png(p1, "fig1_raw_series.png")` →
   `fig1_raw_series.png`). This is the canonical implementation.
2. If the same chunk also exists in `index.md` (a simplified didactic
   version, often without the dark-theme styling), prefer the
   `index.md` version --- it is the audience-facing form.
3. If neither version exists (e.g., figure was hand-edited), fall back
   to lifting the chunk from `analysis.R` and *removing*
   `theme_site()` / `save_png()` calls.
4. Wrap as an executable chunk:

````markdown
```{r}
#| label: fig-raw-series
#| fig-cap: "Per-capita cigarette sales for all 39 states 1970–2000, with California highlighted in orange and a dashed vertical line at the 1989 policy threshold."

# (the chunk that produces the plot, with the last expression being a
# bare plot object or print(plot) so Quarto displays it)
```
````

The `fig-cap` text is the *alt text* from the original markdown image
reference, lightly polished (strip trailing punctuation, expand abbreviations).

The `#| label:` slug should be a stable identifier — strip the
`figN_` prefix and any underscores: `fig1_raw_series.png` → `fig-raw-series`.

**Special case: built-in plot helpers** (tidysynth, CausalImpact).

For `plot_trends(prop99_syn)` and similar one-liners, the chunk body is
just the function call --- Quarto prints the returned ggplot. Do not
wrap in any `print()`.

For `CausalImpact`'s `plot(impact_full)`, same pattern: bare call,
Quarto prints the figure.

---

## 8. Hugo shortcodes

If the source `index.md` contains Hugo shortcodes (rare in the
data-science posts, common in dashboard pages), apply these rules:

| Shortcode | Action |
|---|---|
| `{{< fullwidth-iframe ... >}}` | Drop with `<!-- iframe omitted in Quarto -->`. The embedded app may not work outside the site. |
| `{{% callout note %}}...{{% /callout %}}` | Rewrite to a Quarto callout: `:::{.callout-note}\n...\n:::` |
| `{{< youtube ... >}}` | Rewrite to the raw embed URL inside a `<iframe>` tag (HTML pass-through). |
| `{{< github-link ... >}}` | Drop or convert to a markdown link manually. |
| any other Hugo shortcode | Drop with a comment, surface in the Phase 2 scope block ambiguities. |

---

## 9. Concept cards (custom HTML)

Some posts use `<details class="concept-pair"><details class="concept-card concept-example">` blocks for click-to-expand example/analogy cards (see `r_causalpolicy_workshop/index.md` §1 "Key concepts"). Quarto renders raw HTML by default, so these usually work as-is. But:

- The CSS rules that style these blocks live in
  `assets/scss/custom.scss` and won't be present in the standalone
  rendered `tutorial.html`. The cards will display ugly.
- **Mitigation**: flatten to plain markdown. Replace
  `<details><summary>Example</summary>...body...</details>` with
  `**Example.** ...body...`. Same for `Analogy`.

This loses the click-to-expand interaction, but the content is now
visible and readable.

---

## 10. Drop list

These artifacts of the published post have no place in the `.qmd` and
should be omitted entirely:

- AI podcast player block (`<style>...<script>` HTML at the end of the
  post body, inserted by the `Add AI Podcast` workflow).
- Disqus comments div (if present).
- Tag-cloud links.
- Hugo image-caption shortcodes that reference `featured.jpg`.
- `<!-- more -->` Hugo comment.

---

## 11. Source-files footer

After all of the above, append a short "Source files" section at the end
of the `.qmd`:

```markdown
## Source files

- Companion script: [`<script>`](<raw URL>)
- Published post: <https://carlos-mendez.org/post/<slug>/>
- GitHub repo: <https://github.com/cmg777/starter-academic-v501>
```

This helps the reader pivot back to the official rendered version of the
post and to the source repository if anything in the `.qmd` is unclear.

---

## 12. `_quarto.yml` handling (Phase 4.5 prep)

The Phase-4.5 ZIP bundle needs a `_quarto.yml` inside the `<slug>/`
folder so Positron / RStudio open it as a Quarto project. The skill
follows a **preserve-if-present** rule:

- **If the post bundle already contains a `_quarto.yml`** (sibling
  of `tutorial.qmd` — root for R, `references/` for Python and
  Stata), copy it into the ZIP working dir verbatim. Do **not**
  modify the file in the bundle. This preserves any
  `pre-render:` hooks the author added by hand (example:
  `python_pyfixest/references/_quarto.yml` runs
  `python3 setup_env.py` before each render).

- **If no `_quarto.yml` exists in the bundle**, generate the
  minimal 2-line stub in the ZIP working dir only — do **not**
  write it into the bundle:

  ```yaml
  project:
    type: default
  ```

Either way, the bundle's `_quarto.yml` (or its absence) is left
unchanged after the skill runs. The ZIP is the user-facing
deliverable; the bundle stays minimal.

See `references/zip-bundle.md` for the full recipe.
