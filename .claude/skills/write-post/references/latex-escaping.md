# LaTeX Math in Hugo/Goldmark

> This file is part of the `write-post` skill. Read this file when
> writing equations in index.md.

Hugo's Goldmark renderer processes markdown **before** KaTeX renders math.
Goldmark treats `\` + any ASCII punctuation character as an escape sequence,
stripping the backslash. This breaks LaTeX commands that use punctuation.

## Escaping rules

- **Subscripts** (`_`): Write `\_` -- Goldmark strips `\`, KaTeX sees `_`
- **LaTeX punctuation commands** (`\,` `\;` `\%` `\!`): Write `\\,` `\\;` `\\%` `\\!` -- Goldmark converts `\\` to `\`, preserving the LaTeX command
- **LaTeX letter commands** (`\theta` `\hat` `\text` `\frac` `\sum`): No escaping needed -- Goldmark only escapes `\` + punctuation, not `\` + letter
- **Display math** (`$$...$$`): Same escaping rules apply -- Goldmark does NOT treat `$$` as a protected block
- **Multiple underscores**: Goldmark pairs `_` across an entire paragraph for emphasis. Even separate inline math like `$\theta_0$` and `$g_0(X)$` on the same line can have their underscores paired as `<em>` tags. Always escape every `_` in math as `\_`
- **Currency dollar signs**: MathJax treats `$...$` as inline math. Use `\\$` for literal dollar signs in prose (Goldmark outputs `\$`, MathJax treats as literal thanks to `processEscapes: true` in `assets/js/mathjax-config.js`). Do NOT use `&#36;` -- it does not work. In notebook `.ipynb`, use `\$` instead (no Goldmark layer)

## Quick reference

| Want | Write in markdown | Goldmark produces | KaTeX sees |
|------|-------------------|-------------------|------------|
| Subscript `x_i` | `$x\_i$` | `$x_i$` | subscript |
| Thin space | `$D \\, \theta\_0$` | `$D \, \theta_0$` | thin space |
| Percent `95%` | `$\text{CI}\_{95\\%}$` | `$\text{CI}_{95\%}$` | percent |
| Thick space | `$[-0.14, \\; -0.00]$` | `$[-0.14, \; -0.00]$` | thick space |

## Worked example

What you want rendered:
$$Y_i = \theta_0 \, D_i + g_0(X_i) + U_i, \quad E[U_i | D_i, X_i] = 0$$

What you write in `index.md`:
```
$$Y\_i = \theta\_0 \\, D\_i + g\_0(X\_i) + U\_i, \\quad E[U\_i | D\_i, X\_i] = 0$$
```

Key escaping applied: every `_` -> `\_`, every `\,` -> `\\,`, every `\quad` is fine (letter command).

**WARNING:** Always visually verify math rendering in the Hugo dev server.
LaTeX errors are silent -- broken math renders as raw text or wrong symbols.

## Equation requirements

Every post that introduces a quantitative method must present its key
equations. Equations ground intuition in formal notation and connect
the math to the code.

**Minimum:** 2 display-math equations for any post introducing a
quantitative method.

**For each equation:**

1. **Plain-language explanation.** Immediately after the equation, write
   a sentence starting with "In words, this says..." or equivalent.
   Example: "In words, this equation says that the outcome $Y$ equals
   the treatment effect $\theta$ times the treatment $D$, plus
   everything else that affects $Y$ through the controls $X$."

2. **Variable mapping.** Map math symbols to code variables so beginners
   can connect the formula to the implementation. Example: "$Y$
   corresponds to our `inuidur1` column, $D$ is the `tg` treatment
   indicator, and $X$ includes the 15 covariate columns."

3. **Notation consistency.** Use the same symbol for the same concept
   throughout the entire post. Do not switch between $Y$ and $y$, or
   $D$ and $T$, without explicit explanation.
