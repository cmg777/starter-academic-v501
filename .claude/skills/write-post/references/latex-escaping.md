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

## Constructs to avoid (deployed Hugo + MathJax breakage)

The patterns below render correctly on local Hugo 0.84.2 but break on the
deployed Netlify site (Hugo 0.89.4 + MathJax v3). Fixes verified empirically
on `content/post/python_EconML/index.md`. Do not use these in new posts.

| Avoid | Why it breaks | Use instead |
|-------|---------------|-------------|
| `\text{var\_name}` with escaped `_` inside `\text{}` | Goldmark emphasis pairing collides with the underscore even inside `\text{}` on the deployed stack; the rendered glyphs come out wrong or with stray backslashes | Pull variable names out of math into prose `code` spans. Example: write the math as `$\tau(\mathbf{x})$` and the conditioning as prose: "for a profile with `var_name = 6` and `other_var = 0.7`" |
| `\text{-}` for non-italic dashes inside math | Same family of escaping fragility | Move the literal text into prose: "the 1-vs-0 contrast is $\widehat{\mathrm{ATE}} = 0.240$" |
| `\big|`, `\Big|`, `\bigg|` followed by `_{...}` | Sized evaluation bars are not consistently parsed by deployed MathJax v3 when an immediate subscript follows | Use the `\left./\right.` form: `$\left.\partial\_\eta E[\psi]\right|\_{\eta=\eta\_0} = 0$` |
| `\underbrace{...}_{...}` and `\overbrace{...}_{...}` | Brace structures with subscripted labels render unreliably on the deployed stack | Split into multiple display equations: define the labelled quantity separately first, then state the identity that uses it. Pedagogically clearer too |
| `\\!`, `\\;` thin/negative/thick spaces in display math | The `\\` escape survives Goldmark on Hugo 0.84.2 but loses one backslash on Hugo 0.89.4, leaving literal `;` and `!` glyphs in the rendered math | Drop the cosmetic spacing entirely. If you really need spacing, prefer `\,` (which **does** survive — verified on the partial-linear-model display equations) or `\cdot` for explicit multiplication |

**Important nuance.** `\\,` (thin space) is the only `\\<punctuation>`
command empirically confirmed to survive on the deployed stack. The
breakage is specific to `\\!` and `\\;`. Conservative recommendation:
prefer `\,` and `\cdot` over any other backslash-punctuation cosmetic.

**Diagnostic cue.** If math on Netlify looks broken but the same source
renders fine on local Hugo, suspect one of these five. Symptoms:
literal `$` glyphs, stray `\\` characters, missing diacritics, unsized
bars, or labels not under their braces.
