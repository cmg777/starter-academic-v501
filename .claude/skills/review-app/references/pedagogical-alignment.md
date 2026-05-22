# Pedagogical Alignment (Dimension 7)

The most subtle audit question is: **does the app emphasize what the
post emphasizes?** A technically correct app that misses the post's
central lesson is a pedagogy failure. This file documents the
post↔app cross-read.

---

## Inputs

### From `content/post/<slug>/index.md`

Extract three text sources:

1. **Learning objectives** — the bulleted block under a heading
   matching `^#{1,3} Learning objectives?` (case-insensitive). Many
   posts have this; some don't.
2. **Conclusion / takeaways** — content under a heading matching
   `^#{1,3} (Conclusion|Takeaways?|Key takeaways)`. Usually the final
   numbered list ("First, …", "Second, …", "Third, …") or a bulleted
   block.
3. **Spoiler-figure caption** — the alt text of the first
   `![...](...)` image after `## 1.` or the opening section. Many
   data-science posts state the headline finding in this caption.

If none of the three exist, fall back to the post's **first
paragraph** of §1. That is the absolute minimum; flag as a LOW issue
under Dim 7 ("post lacks an explicit learning-objectives or
conclusion section — alignment audit used the opening paragraph as a
proxy").

### From `content/post/<slug>/web_app/index.html`

Extract three text sources:

1. **Tab 1 `<p class="lede">`** — the lede paragraph of the intro
   tab.
2. **Each tab's `<h2>`** — the heading of every interactive tab
   (typically 4).
3. **Every `<div class="pedagogy">` `<li>`** — the "what to look for"
   bullets across all tabs.

---

## Algorithm

### Step 1 — Tokenise to key-phrase sets

For each text source (post side and app side):

1. Lowercase.
2. Remove punctuation except hyphens and apostrophes.
3. Remove stopwords from a standard English stoplist (≈ 100 entries).
4. Generate n-grams of length 3, 4, and 5 (sliding window across the
   remaining tokens).
5. Filter to n-grams whose components include at least one
   **content noun** — a word ≥ 5 characters that is not on the
   stoplist. This drops fluff n-grams like "we will see that".
6. Deduplicate.

The result is a bag of "key phrases" per source.

### Step 2 — Identify the post's top 3 takeaways

Rank n-grams from the post side by:

1. Whether they appear in the conclusion (weight 3).
2. Whether they appear in the learning objectives (weight 2).
3. Whether they appear in the spoiler-figure caption (weight 2).
4. Otherwise, weight 1.

Sum weights per n-gram. Take the **top 3 distinct n-grams** after
de-overlapping (don't count "double LASSO" and "double LASSO
procedure" as different).

Call these `T1`, `T2`, `T3`.

### Step 3 — Check coverage in the app

For each `Ti`:

- **Match** if `Ti` (or a near-equivalent — Levenshtein distance ≤ 2
  on each component word) appears in any of:
  - Tab 1 lede.
  - Any tab's `<h2>`.
  - Any pedagogy bullet.
- **Match** also counts if the app's text uses a known synonym from a
  small hardcoded list:
  - "estimator" ↔ "method"
  - "shrinkage" ↔ "regularisation" ↔ "regularization"
  - "DiD" ↔ "difference-in-differences"
  - "α" ↔ "alpha" ↔ "treatment effect"
  - "λ" ↔ "lambda" ↔ "penalty"

Count matches: `M ∈ {0, 1, 2, 3}`.

### Step 4 — Score and report

Coverage `M/3` sets the Dim-7 score floor:

| Coverage | Floor for Dim 7 score | Issue raised |
|----------|-----------------------|--------------|
| 3/3      | 9                     | none         |
| 2/3      | 8                     | none         |
| 1/3      | 6                     | MED (verdict can still be MINOR) |
| 0/3      | 4                     | HIGH (verdict cannot be ACCEPT) |

Other Dim-7 checks (glossary count, pedagogy panel presence, STUB
widget flag) can lower the actual score below the floor's upper
bound, but cannot raise it above.

---

## Glossary cross-check

If the post has a `## ... Key concepts at a glance` section (a
convention used in tutorials), extract the term list from its
`<details>` summaries. Compare against the app glossary in
`index.html`. Missing terms in the app glossary → one MED issue per
missing term, capped at 2 issues total.

---

## Examples

### Example 1 — perfect alignment

**Post:** `r_double_lasso`. Conclusion section says (paraphrased):
"First, **Double LASSO is a method, not a panacea**. Second, **the
rigorous penalty matters**. Third, **the regime determines the
methodology**."

**Top 3 takeaways:** `T1 = "double LASSO method panacea"`,
`T2 = "rigorous penalty matters"`,
`T3 = "regime determines methodology"`.

**App:**
- Tab 1 lede: "Double LASSO automates the choice... The rigorous
  penalty differs from cross-validated... The regime determines the
  methodology."
- Tab 2 heading: "LASSO Lab"
- Tab 3 heading: "Penalty Showdown — rigorous vs. cross-validated"
- Tab 4 heading: "Forest Plot — interactively"

**Matches:** `T1` ✓ (Tab 1), `T2` ✓ (Tab 1 + Tab 3 heading),
`T3` ✓ (Tab 1).

**Coverage:** 3/3 ⇒ Dim 7 floor = 9.

### Example 2 — partial alignment

**Post:** Some hypothetical ML post emphasising "feature
importance reveals nonlinearity", "cross-validation prevents
overfitting", "subgroup analyses matter".

**App:** Tab 1 lede only discusses "how random forests work
internally". No mention of the three takeaways.

**Coverage:** 0/3 ⇒ HIGH issue ⇒ verdict ≠ ACCEPT.

The fix: rewrite the Tab 1 lede so it foregrounds the three actual
takeaways. The skill suggests this verbatim in the issues table.

---

## Implementation notes

- The n-gram extraction can be implemented with a 50-line Python
  snippet (no external deps) — the skill emits it on the fly to a
  tempfile, runs it under `python3`, and reads back JSON.
- Synonyms list lives inline in this file's "Step 3" — add new
  synonyms here when the catalog grows.
- Levenshtein component matching is intentionally loose to forgive
  pluralisation ("estimator" ↔ "estimators") and minor typos. It
  must NOT be loose enough to match "λ" with "λ_min" — distance ≤ 2
  on each word, not on the whole phrase.
- The audit reports both the extracted takeaways AND the matched
  app sentences in REVIEW.md's "Pedagogical alignment" section, so
  the user can verify the algorithm's decisions.
