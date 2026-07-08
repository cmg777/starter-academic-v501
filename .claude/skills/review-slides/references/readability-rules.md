# Readability Rules

Readability is the heart of this review. A slide is a **visual anchor for
speech**, not a document. The audience reads it in two seconds while listening to
the speaker. Clear, short, plain language wins; clever, dense, complex language
loses. Every finding in Dimension 5 ships a concrete `Before:` / `After:` rewrite —
the rewritten line *is* the deliverable.

---

## Concrete thresholds (quantitative)

Apply these as the first pass. They are guides, not laws — a deliberate dense
slide for effect is allowed (note it), but it must be the exception.

| Check                         | Threshold                          | Severity if exceeded |
|-------------------------------|------------------------------------|----------------------|
| On-slide sentence length      | > ~15 words → flag; > ~25 → MED     | LOW → MED            |
| Bullets per slide             | > 5 bullets                         | MED                  |
| Words per bullet              | > ~12 words                         | LOW → MED            |
| Prose sentences stacked       | > 1 full sentence of body prose     | MED (move to notes)  |
| Fragment advances per slide   | > 4                                 | MED                  |
| Sub-clauses per sentence      | > 1 subordinate clause              | LOW → MED            |
| Distinct ideas per slide      | > 1 (needs the word "also")         | MED (split slide)    |

The browser pass (`headless-browser.md`) measures words/bullets per rendered
slide; use its numbers, not just a source-text estimate.

---

## Qualitative judgment

Beyond the counts, ask of each slide:

1. **Can the point be stated in one sentence?** If it takes two, the slide holds
   two ideas — split it.
2. **Would a listener understand this at a glance?** If the eye has to hunt or the
   mind has to unpack a clause, simplify.
3. **Is every word earning its place?** Cut filler ("in order to" → "to", "due to
   the fact that" → "because").
4. **Does the slide read aloud as natural speech**, or as written academic prose?
   Prefer the spoken register.

---

## Complex → simple substitutions

Flag the left form on a slide; suggest the right. (Extend as needed; this is the
core list.)

| Complex / academic        | Simple / spoken          |
|---------------------------|--------------------------|
| utilize                   | use                      |
| methodology               | method                   |
| demonstrate               | show                     |
| facilitate                | help                     |
| in order to               | to                       |
| due to the fact that      | because                  |
| subsequent to             | after                    |
| prior to                  | before                   |
| a number of               | several / many           |
| with respect to           | for / about              |
| in the event that         | if                       |
| approximately             | about                    |
| sufficient                | enough                   |
| commence                  | start                    |
| terminate                 | end / stop               |
| endeavor                  | try                      |
| ascertain                 | find out                 |
| heterogeneity (loose use) | differences across …     |
| leverage (as verb)        | use                      |
| necessitate               | need                     |

Keep precise technical terms when they are the right word (e.g. "estimand",
"unconfoundedness", "instrument") — but define them on first use for
Teaching/Working audiences. The substitution list targets *needless* complexity,
not domain vocabulary.

---

## Passive → active

Flag passive constructions on slides; rewrite active. The active version is
shorter and names the actor.

- Before: "The coefficient was estimated using OLS."
  After: "OLS estimates the coefficient."
- Before: "Bias is introduced by the omitted variable."
  After: "The omitted variable biases the estimate."
- Before: "It was found that the effect is small."
  After: "The effect is small."

Passive voice in speaker notes is fine — the rule is for on-slide text.

---

## Split nested clauses

One idea, one short sentence. Break long sentences at the conjunction.

- Before: "Because the tariff ceiling binds mechanically, which makes it
  unrelated to local demand shocks, we can treat it as a dose that identifies the
  causal effect." (33 words, 2 sub-clauses)
- After (two lines):
  "The tariff ceiling binds mechanically."
  "So it is a clean dose — unrelated to local demand."

---

## Walls of prose → anchor + notes

If a slide stacks several sentences, keep one anchor line on the slide and move
the rest to `::: {.notes}`.

- Before (on slide): three sentences explaining the DGP.
- After: on slide — "We simulate a known effect of −0.10."; in notes — the three
  explanatory sentences the speaker says aloud.

---

## What is acceptable (do not over-flag)

- A single labeled setup line.
- A single concluding sentence — typically the slide's `[…]{.takeaway .fragment}`
  card (the orange accent card each content slide ends on). This is expected, not a
  wall of prose; do not over-flag it.
- Structured content: a short list (≤5), a table, a two-item contrast, an equation
  with a one-line gloss.
- Domain terms used correctly and defined for the audience.
- A deliberate dense "jump scare" slide used once for rhetorical effect — note it,
  don't fail it.

The goal is fewer words, shorter sentences, simpler words — without stripping the
precision the topic needs.
