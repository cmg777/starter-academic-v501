# LaTeX Math in Hugo/Goldmark

> This file is part of the `review-post` skill. Read this file when
> verifying math rendering in a post.

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

## What to check during review

- Every `_` inside `$...$` or `$$...$$` must be escaped as `\_`
- Every LaTeX punctuation command (`\,` `\;` `\%` `\!` `\quad`) must be double-escaped (`\\,` etc.) UNLESS it is a letter command like `\quad` (which needs no escaping)
- Currency dollar signs in prose use `\\$` (not `&#36;`)
- Notation is consistent throughout (same symbol = same concept)
- Each display equation has a plain-language explanation and variable mapping
- Minimum 2 display-math equations for quantitative method posts
