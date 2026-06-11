# Focus Modes

When the user passes `focus: <keyword[, keyword...]>`, only the named dimensions
are audited; others print `— not audited (focus subset)` in the report and are
excluded from the verdict (see `scoring-and-criteria.md` → "Skipped dimensions").

---

## Keyword → dimensions

| Keyword         | Dimensions audited            |
|-----------------|-------------------------------|
| `fidelity`      | 1                             |
| `correctness`   | 2, 3                          |
| `readability`   | 5, 6                          |
| `consistency`   | 4                             |
| `design`        | 7                             |
| `branding`      | 8                             |
| `accessibility` | 9                             |
| `render`        | 3, 10                         |
| `deliverables`  | 10                            |
| `all` (default) | All 10                        |

---

## Parsing rules

- Lowercase the entire `focus:` value before matching.
- Split on `,` and ` and ` (with optional whitespace).
- Trim each token.
- Unknown tokens → warn and skip (do not error):
  `Warning: ignored unrecognized focus keyword "<token>"`.
- Empty list after parsing → fall back to "all 10".
- Set semantics — a dimension named by two keywords is audited once.

### Examples

| `focus:` argument                   | Resolved dimensions                |
|-------------------------------------|------------------------------------|
| `focus: readability`                | {5, 6}                             |
| `focus: fidelity and correctness`   | {1, 2, 3}                         |
| `focus: design, branding`           | {7, 8}                            |
| `focus: render`                     | {3, 10}                           |
| `focus: foo and readability`        | {5, 6} + warning about `foo`      |
| `focus:`                            | All 10 (empty after parsing)      |

---

## Behaviour in the report

A `focus:` run still emits the full template; non-audited rows show:

```
| 7 | write-slides design adherence | —   | not audited (focus subset)        |
```

And the audit metadata block notes:

```
Focus: readability and fidelity
Audited 3 of 10 dimensions (1, 5, 6).
```

The verdict computation uses only the audited dimensions. A `focus: readability`
run can therefore reach ACCEPT even if branding has drift — but the metadata
states "audited subset", so the result is not mistaken for a full pass.

---

## Interaction with `--no-browser`

`--no-browser` and `focus:` compose. With `--no-browser`, the browser-only checks
inside Dimensions 3 (math-render) and 9 (overflow/density) are marked `[~]` and
excluded; the static parts of those dimensions still run if they are in the focus
subset.

---

## When NOT to use focus

The full audit is fast (well under a minute after Chromium is cached). Use
`focus:` mainly:

- During iteration on one dimension (e.g. you just shortened the prose — run
  `focus: readability`).
- When the browser pass keeps failing for unrelated reasons and you want the
  static findings (`focus: fidelity and correctness and consistency`).

For pre-ship review or a first audit, run the full set.
