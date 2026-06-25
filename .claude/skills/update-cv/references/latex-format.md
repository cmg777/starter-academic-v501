# LaTeX formatting, escaping, insertion & dedupe

The CV uses **moderncv** (`casual` style, `blue`). Match the existing idioms in `main.tex` exactly.

## Entry templates

Copy the spacing/style of the surrounding entries. Each new line gets trailing source comments.

**Peer-reviewed article** (most common):
```latex
\cvitem{<YEAR>}{<Title>, \textit{<Journal>}. (with <Coauthors>)}
% Published on <YYYY-MM-DD>
% https://doi.org/<doi>
```
- Single author (no coauthors) → drop the `(with …)` clause entirely.
- `<Coauthors>` is the Crossref author list **minus Carlos Mendez**, formatted per `crossref.md`.

**Book:**
```latex
\cvitem{<YEAR>}{\textit{<Title>}. <Publisher>}
```

**Book chapter:**
```latex
\cvitem{<YEAR>}{<Chapter title>. In <Editors> (Ed.), \textit{<Book title>}. <Publisher>}
```

**Report / Dissertation:**
```latex
\cvitem{<YEAR>}{<Title>, \textit{<Type>}, <Institution>}
```

**Presentation:**
```latex
\cventry{<YEAR>}{<Talk title>}{<Event>}{<City>}{<Country>}{}
% <YYYY.MM.DD>
% <optional url>
```

**Software / Database / Web app:**
```latex
\cvitem{<YEAR>}{<Short description>. \url{<url>}}
```

## Escaping catalog (apply to every title/name/journal before inserting)

`main.tex` loads `\usepackage[utf8]{inputenc}`, but the existing entries **escape accents** (e.g.
`Cat\'olica`) — match that style for consistency and portability.

**Must-escape special characters** (break compilation otherwise):

| Char | Replace with | | Char | Replace with |
|---|---|---|---|---|
| `&` | `\&` | | `#` | `\#` |
| `%` | `\%` | | `_` | `\_` |
| `$` | `\$` | | `{` `}` | `\{` `\}` |

`~` → `\textasciitilde{}`, `^` → `\textasciicircum{}`, `\` → `\textbackslash{}`.

**Accents** (escape to the classic form):

| Letter | LaTeX | | Letter | LaTeX |
|---|---|---|---|---|
| á í ó ú é | `\'a \'i \'o \'u \'e` | | ñ | `\~n` |
| à è ì ò ù | `` \`a `` … | | ü ö ä | `\"u \"o \"a` |
| â ê î ô û | `\^a` … | | ç | `\c{c}` |

**Unicode normalization** (titles copied from the web often carry these — fix first):

| In | Out |
|---|---|
| `“ ” ‘ ’` curly quotes | `"` `'` straight |
| `‑` non-breaking hyphen (U+2011) | `-` |
| `–` en dash / `—` em dash | `--` / `---` (or keep `–` in year ranges as the file does) |
| `：` `（` `）` full-width punctuation | `:` `(` `)` |
| ` ` non-breaking space (U+00A0) | normal space |

Apostrophes in titles (`Okun's`) are plain ASCII `'` — fine as-is.

## Chronological insertion

1. Find the target `\subsection{…}` (or `\section{Recent Presentations}`).
2. Walk its `\cvitem`/`\cventry` lines top-to-bottom (they are newest-first).
3. Insert the new block **immediately before** the first existing entry whose year is **≤** the new
   year. If none (new entry is the oldest), insert before the next `\subsection`/`\section`.
4. Anchor the `Edit` on that neighbouring entry's exact line so the insertion is unambiguous. Keep
   one blank line between entries, matching the file.

## Dedupe — "is this already in the CV?"

A website item is **already present** if **either** test matches an existing in-scope CV entry:

- **DOI match.** Collect every DOI in `main.tex` from `% https://doi.org/<doi>` (and bare
  `https://doi.org/…`) comment lines. Lowercase. Compare to the publication's front-matter `doi`
  (strip any `https://doi.org/` prefix, lowercase). Exact match ⇒ present.
- **Title match.** Normalize both sides and compare: lowercase → strip LaTeX (`\textit{}`, `\'`,
  `\"`, `\~`, `\^`, `\c{}`, `\url{}`, braces) → strip all non-alphanumerics → collapse spaces. If the
  normalized website title is a prefix of (or equals) a normalized CV entry title (first ~50 chars),
  treat as present. (Prefix handling absorbs the CV appending `, \textit{Journal}` after the title.)

An item present by **neither** test is **new**. When in doubt (fuzzy near-match), surface it in the
SCOPE block as "possible duplicate — confirm" rather than silently adding or skipping.
