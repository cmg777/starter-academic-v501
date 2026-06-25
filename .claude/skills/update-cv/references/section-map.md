# Section map — website source → CV section

The CV (`content/cv/main.tex`) has **three website-driven sections** and many hand-maintained ones.
This skill **only** ever inserts into the three below. Everything else is off-limits.

| # | Website source | CV `\section{…}` | What feeds it |
|---|---|---|---|
| 1 | `content/publication/*/index.md` | `Publications and Research` (subsections) | new publications, routed by `publication_types` |
| 2 | `content/event/*/index.md` | `Recent Presentations` | new talks newer than the latest already listed |
| 3 | `content/projects/*/index.md` | `Software, Databases, and Web Applications` | flagged candidates only (fuzzy mapping) |

**Hand-maintained — NEVER touch:** `Academic Positions`, `Education`, `Research and Teaching Fields`,
`Teaching Experience`, `Other Experience`, `Awards`, `Research Grants`, `Professional Activities`.

---

## 1. Publications → `Publications and Research`

Route each new publication to the subsection matching its `publication_types` (Wowchemy codes):

| `publication_types` | Meaning | CV `\subsection{…}` |
|---|---|---|
| `["2"]` | Journal article | `Peer-reviewed Articles` |
| `["5"]` | Book | `Books` |
| `["6"]` | Book section / chapter | `Book Chapters` |
| `["4"]` | Report | `Reports` |
| `["7"]` | Thesis | `Dissertations` |
| `["3"]` | Preprint / working paper | `Working Papers` (currently commented in main.tex — uncomment the header if a preprint is added; confirm with the user first) |
| `["1"]` | Conference paper | usually already covered by `Recent Presentations`; **ask** before adding as a paper |
| `["0"]`,`["8"]` | Uncategorized / Patent | **ask** the user where it belongs |

Within a subsection, entries run **newest year first**. Insert a new entry **above** the first
existing entry whose year is ≤ the new entry's year (i.e. keep reverse-chronological order; new ties
go on top).

### Front-matter field → LaTeX argument (articles)

| Front-matter | Used for | Notes |
|---|---|---|
| `title` | the entry title (authoritative) | normalize Unicode + escape — see `latex-format.md` |
| `publication` | the journal name | strip markdown `*…*`; drop the trailing `, vol(issue)`; cross-check against Crossref `container-title` |
| `date` (year) | the `\cvitem{<year>}{…}` label + sort key | the user may override (online-first vs print year) — confirm |
| `doi` | Crossref lookup key + the `% https://doi.org/<doi>` trailing comment | absent ⇒ prompt for coauthors |
| `authors` | **ignored for coauthors** (always just `[admin]`) | coauthors come from Crossref or the user |

Books / chapters / reports / dissertations follow the same idea but with the templates in
`latex-format.md` (book → `\textit{Title}. Publisher`; chapter → `Title. In <Eds> (Ed.),
\textit{Book}. Publisher`). Their coauthors/editors are usually not on Crossref — **ask**.

## 2. Events → `Recent Presentations`

Each new talk becomes one `\cventry{<year>}{<title>}{<event>}{<city>}{<country>}{}`.

| Front-matter | LaTeX arg | Notes |
|---|---|---|
| `title` | arg 2 (talk title) | escape; drop a trailing subtitle unless it's short and useful |
| `event` | arg 3 (the meeting) | keynote/invited prefix (e.g. "Keynote speaker, …") if the talk was such — ask |
| `location` | args 4–5 (city, country) | `location` is one string like "Tsukuba University, Ibaraki, Japan" → split into a venue/city arg and a country arg; **confirm the split with the user** |
| `date` (year) | arg 1 | sort key |

**Curation filter (important):** the CV keeps only *recent* talks (older `\cventry`s are commented
out on purpose). So only propose events whose year is **≥ the most recent talk already present** in
Recent Presentations, and that aren't already listed. Never re-add historical talks the user pruned.

## 3. Projects → `Software, Databases, and Web Applications`

This mapping is **fuzzy** — many `content/projects/` items are teaching resources, not software. Do
**not** auto-insert. Instead list each unmatched project as a **candidate** in the SCOPE block with
its `title` + primary `links[].url`, and let the user pick which (if any) to add and to which
subsection (`Software` / `Databases` / `Web Applications`), using the `\cvitem{<year>}{<desc>. \url{<url>}}`
template in `latex-format.md`.
