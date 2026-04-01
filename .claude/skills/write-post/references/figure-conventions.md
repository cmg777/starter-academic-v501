# Figure Conventions

> This file is part of the `write-post` skill. Read this file when
> writing figure references and Mermaid diagrams in index.md.

## Basic figure conventions

In code blocks, save figures with:

```python
plt.savefig("<slug>_<name>.png", dpi=300, bbox_inches="tight")
plt.show()
```

After the code block, reference the figure with:

```markdown
![Descriptive alt text.](<slug>_<name>.png)
```

Hugo resolves images from the page bundle, so use just the filename. Use the
site color palette (see below) for all matplotlib plots.
At least 3 figures total.

**Figure placement:** Place the figure image reference (`![alt](file.png)`)
immediately after the code block that generates it, before the
interpretation paragraph. The figure serves as visual output; the
interpretation paragraph then explains what the reader is seeing.

**CSS note:** `.article-style img` has no `border` or `box-shadow` -- just
`border-radius: 4px` and margins. Dark-background figures render cleanly
without any visible border artifacts.

## Site color palette

- Steel blue: `#6a9bcc` (primary data)
- Warm orange: `#d97757` (reference lines, secondary)
- Near black: `#141413` (tertiary, text)
- Teal: `#00d4c8` (highlights, sparingly)

## Dark theme figures

For posts where dark-background figures better match the site aesthetic, use
the dark theme palette and spine-free styling. Set rcParams once at the top
of the script:

```python
# Dark theme palette
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

plt.rcParams.update({
    "figure.facecolor": DARK_NAVY,
    "axes.facecolor": DARK_NAVY,
    "axes.edgecolor": DARK_NAVY,
    "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT,
    "axes.titlecolor": WHITE_TEXT,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
    "axes.grid": True,
    "grid.color": GRID_LINE,
    "grid.linewidth": 0.6,
    "grid.alpha": 0.8,
    "xtick.color": LIGHT_TEXT,
    "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "text.color": WHITE_TEXT,
    "font.size": 12,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "legend.labelcolor": LIGHT_TEXT,
    "figure.edgecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY,
    "savefig.edgecolor": DARK_NAVY,
})
```

**Critical for dark theme figures:**

1. After every `plt.subplots()` call, add `fig.patch.set_linewidth(0)`
2. Save with matching facecolor/edgecolor and `pad_inches=0`
3. Use `edgecolors=DARK_NAVY` on scatter points

Reference implementation: `content/post/python_fwl/script.py`

## Mermaid diagrams

If the method has a causal, structural, or multi-step framework, include
at least one diagram to visualize the structure. Examples: a DAG for
causal inference, a flowchart for a multi-step pipeline, an architecture
diagram for an ensemble model.

**Placement rules for Mermaid diagrams:**

1. Every Mermaid diagram MUST have an explanatory paragraph immediately
   before it (introducing what the diagram shows) AND an explanatory
   paragraph immediately after it (interpreting the diagram and connecting
   it to the narrative). No "orphan" diagrams without surrounding text.
2. If a Mermaid diagram serves as a methodological overview/roadmap, place
   it at the END of the Overview/Introduction section (after learning
   objectives), not in the middle of the section.
3. The pre-diagram paragraph should tell the reader what the diagram
   represents. The post-diagram paragraph should explain the key
   takeaway or connect the diagram to the case study question.

**Options for diagrams:**

- **Mermaid diagrams** (preferred for flowcharts and DAGs) -- Hugo supports
  Mermaid natively. Add `diagram: true` to front matter, then use fenced
  code blocks with the `mermaid` language tag. Use site colors in `style`
  directives (e.g., `style A fill:#6a9bcc,stroke:#141413,color:#fff`).
- **Matplotlib** -- for quantitative diagrams that need precise layout.
- **Pre-made image** -- include in the page bundle.

## Color families for related methods

When comparing multiple related methods, use a **color family** to visually
group them in comparison charts.

**Example (6 estimation methods):**

| Method | Color | Rationale |
|--------|-------|-----------|
| Naive (baseline) | `#999999` (gray) | Distinct: not a causal method |
| Regression Adjustment | `#6a9bcc` (steel blue) | Outcome modeling paradigm |
| IPW | `#d97757` (warm orange) | Treatment modeling paradigm |
| AIPW | `#00d4c8` (teal) | Doubly robust paradigm |
| PS Stratification | `#e8956a` (light orange) | Treatment modeling family |
| PS Matching | `#c4623d` (dark orange) | Treatment modeling family |
