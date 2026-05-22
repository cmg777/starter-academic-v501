# Focus Modes

When the user passes `focus: <keyword[, keyword...]>`, only the
named dimensions are audited; others print `[~] Not audited (focus
subset)` in the report.

---

## Keyword → dimensions

| Keyword         | Dimensions audited     |
|-----------------|------------------------|
| `pedagogy`      | 7                      |
| `code`          | 3, 4                   |
| `accessibility` | 5                      |
| `data`          | 4                      |
| `hugo`          | 8                      |
| `visual`        | 9, 10                  |
| `all` (default) | All 10                 |

---

## Parsing rules

- Lowercase the entire `focus:` value before matching.
- Split on `,` and ` and ` (with optional whitespace).
- Trim each token.
- Unknown tokens → warn and skip (do not error). Print:
  `Warning: ignored unrecognized focus keyword "<token>"`.
- Empty list after parsing → fall back to "all 10".

### Examples

| `focus:` argument                | Resolved dimensions          |
|----------------------------------|------------------------------|
| `focus: pedagogy`                | {7}                          |
| `focus: code and accessibility`  | {3, 4, 5}                    |
| `focus: code, data`              | {3, 4}        (data is a subset of code) |
| `focus: visual and hugo`         | {8, 9, 10}                   |
| `focus: foo and pedagogy`        | {7}  + warning about `foo`   |
| `focus:`                         | All 10 (empty after parsing) |

When the same dimension is named twice (e.g. `code` and `data`
both touch Dim 4), no duplication — the set semantics handle it.

---

## Behaviour in the report

A `focus:` run still emits the full template; non-audited rows show:

```
| 2 | HTML structure      | —     | not audited (focus subset)            |
```

And the audit metadata block notes:

```
Focus: pedagogy and accessibility
Audited 3 of 10 dimensions (5, 7, plus dependencies).
```

The verdict computation uses only the audited dimensions (see
`scoring-and-criteria.md` → "Skipped dimensions"). A `focus: pedagogy`
run can therefore reach ACCEPT even if HTML structure has issues —
but the audit metadata explicitly states "audited subset".

---

## When NOT to use focus

The full audit is fast (under 30 s after Chromium is cached). Use
`focus:` mainly:

- During iteration on a single dimension (e.g. you just rewrote the
  Tab-1 lede; run `focus: pedagogy`).
- In CI where one dimension is the gating check.
- When the full audit's Playwright pass keeps failing for unrelated
  reasons and you want to surface non-browser issues.

For pre-ship review or one-time audits, run the full set.
