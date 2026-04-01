# Figure Conventions for Scripts

> This file is part of the `write-script` skill. Read this file when
> the script generates matplotlib figures.

## Basic figure conventions

Save figures with:

```python
plt.savefig("<slug>_<name>.png", dpi=300, bbox_inches="tight")
plt.show()
```

Use the site color palette for all matplotlib plots. At least 3 figures total.

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

1. After every `plt.subplots()` call, add `fig.patch.set_linewidth(0)` to
   eliminate any residual figure border
2. Save with matching facecolor/edgecolor and `pad_inches=0`:
   ```python
   fig, ax = plt.subplots(figsize=(8, 6))
   fig.patch.set_linewidth(0)
   # ... plot code ...
   plt.savefig("<slug>_<name>.png", dpi=300, bbox_inches="tight",
               facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
   ```
3. Use site palette colors for data: steel blue for points, warm orange for
   fit lines, teal for highlighted series
4. Use `edgecolors=DARK_NAVY` on scatter points for clean edges against the
   dark background

Reference implementation: `content/post/python_fwl/script.py`

## R ggplot2 dark theme

For R scripts with dark-background figures, define a custom `theme_site()`
function at the top of the script using the same dark palette:

```r
# Dark theme palette
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text             = element_text(color = LIGHTER_TEXT),
      plot.title       = element_text(color = LIGHTER_TEXT, face = "bold", size = rel(1.1)),
      plot.subtitle    = element_text(color = LIGHT_TEXT, size = rel(0.85)),
      plot.background  = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text        = element_text(color = LIGHT_TEXT),
      legend.position  = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key       = element_rect(fill = DARK_BG, color = NA),
      legend.text      = element_text(color = LIGHT_TEXT),
      legend.title     = element_text(color = LIGHTER_TEXT),
      strip.text       = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}
```

**Critical for R dark theme figures:**

1. Apply `theme_site()` to every ggplot2 figure
2. Save with `ggsave(..., bg = DARK_BG)` to set the background color
3. Use site palette colors for data: steel blue for primary, warm orange for
   secondary, teal for highlights
4. Use `scale_fill_manual()` / `scale_color_manual()` with named values

Reference implementation: `content/post/r_dynamic_bma2/analysis.R`

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
| PS Stratification | `#e8956a` (light orange) | Treatment modeling -- warm orange family |
| PS Matching | `#c4623d` (dark orange) | Treatment modeling -- warm orange family |
