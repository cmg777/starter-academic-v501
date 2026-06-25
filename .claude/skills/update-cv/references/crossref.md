# Crossref lookup for coauthors & journal

Website publications store `authors: [admin]` only — no coauthors. The CV needs the full author
list and the journal. When a publication has a `doi` in its front matter, fetch it from Crossref;
otherwise ask the user to paste the coauthors.

## Recipe (by DOI)

```bash
# <doi> = front-matter doi with any "https://doi.org/" prefix stripped.
# The ?mailto= puts the request in Crossref's faster "polite pool".
curl -s "https://api.crossref.org/works/<doi>?mailto=carlosmendez777@gmail.com"
```

If `jq` is available, extract in one shot:

```bash
curl -s "https://api.crossref.org/works/<doi>?mailto=carlosmendez777@gmail.com" \
  | jq -r '.message
      | "JOURNAL: " + (."container-title"[0] // "")
      , "YEAR: "    + ((.issued."date-parts"[0][0] // .published."date-parts"[0][0] | tostring))
      , "AUTHORS: " + ([.author[]? | (.given // "") + " " + .family] | join(" | "))'
```

## Fields to use

| Crossref field | Use |
|---|---|
| `message.author[].given` + `.family` | coauthor list (in Crossref order) |
| `message.container-title[0]` | journal — **cross-check** the front-matter `publication`; prefer the user's `publication` string if they differ, since it's hand-curated |
| `message.issued.date-parts[0][0]` (or `published`) | publication year — **cross-check** the front-matter `date` year; the user confirms |

## Coauthor formatting

1. Drop the author whose family name is `Mendez` / `Méndez` (any given-name form) — that's Carlos.
2. Keep Crossref order.
3. Join with the Oxford "and" (matches the existing CV):
   - 1 coauthor → `with A`
   - 2 → `with A and B`
   - 3+ → `with A, B, and C`
4. Wrap as `(with …)` appended after `\textit{Journal}.` — e.g.
   `… \textit{Economic Modelling}. (with Tifani Siregar and Harry Aginta)`.
5. Apply the accent escaping from `latex-format.md` to every name (e.g. `Iván González` →
   `Iv\'an Gonz\'alez`).

## Always confirm, never auto-trust

Crossref author order, spelling, and accents are occasionally off, and `container-title` sometimes
carries an abbreviation. So in Phase 3 **show the fully drafted `\cvitem` line and wait for the
user to confirm or correct it** before inserting (this is the chosen "look up DOI, then ask me"
behavior). The only no-prompt path is none — every new entry is confirmed.

## Fallback (no DOI, offline, or empty result)

- No `doi` in front matter, `curl` fails, non-zero/empty Crossref response, or `404` →
  **prompt the user**: "Coauthors + journal for «<title>» (<year>)?" and build the line from their
  answer. Do not insert a placeholder and move on silently — either get the data or skip the item
  and note it in the final report.
- Be polite to the API: at most a few sequential requests; if you hit a rate limit, pause and retry
  once, otherwise fall back to prompting.
