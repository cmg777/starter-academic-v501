# Canonical Test Cases

Three posts cover the skill's input space. Re-run these whenever
`SKILL.md` or a reference file changes to confirm the contract still
holds.

---

## Test 1 — `r_double_lasso` (the reference)

This is the post the skill was built around. The original
`web_app/` lives in the repo; the test should reproduce it.

**Setup.**
```bash
mv content/post/r_double_lasso/web_app content/post/r_double_lasso/web_app.bak
```

**Invocation.**
```
/project:write-app r_double_lasso
```

**Expected Phase 1.**
- Slug found ✓
- Language = R
- Tags include `causal`, `lasso`
- Data pattern = A (results_table2.csv + selection_diagnostic.csv)
- Topic family = `causal-inference`
- Proposed tabs: Concept animation · DGP simulator · Forest plot ·
  Penalty slider (auto-added because `lasso` is in tags)

**Expected Phase 2.**
- Key takeaways: "Double LASSO is a method, not a panacea"; "The
  rigorous penalty matters"; "The regime determines the methodology"
  (or close paraphrases the user confirms).
- Tab structure: all 4 of the proposal kept.
- Data approach: Pattern A — use `results_table2.csv` and
  `selection_diagnostic.csv`.
- Performance caps: default (n ≤ 500, p ≤ 100).

**Expected Phase 3.**
- `web_app/styles.css`, `web_app/dgp.js`, `web_app/lasso.js` —
  byte-identical to templates.
- `web_app/data/results.json` — numerically identical to the
  pre-existing reference (modulo key ordering).
- `web_app/index.html` and `web_app/app.js` — structurally equivalent
  to the original (same tab IDs, same widget mount points).

**Expected Phase 4.**
- All static checks pass.
- YAML link points to `/post/r_double_lasso/web_app/index.html`.
- JS smoke test: 6/6 assertions pass.

**Cleanup.**
```bash
rm -rf content/post/r_double_lasso/web_app
mv content/post/r_double_lasso/web_app.bak content/post/r_double_lasso/web_app
git checkout content/post/r_double_lasso/index.md   # revert YAML change
```

---

## Test 2 — `python_doubleml` (Pattern B causal-inference)

A causal-inference post written in Python with no precomputed results
CSV at the post root.

**Invocation.**
```
/project:write-app python_doubleml
```

**Expected Phase 1.**
- Language = Python
- Data pattern = B (post has `script.py` but no
  `results_table*.csv` at the root; may or may not have a `data/`
  folder)
- Topic family = `causal-inference`
- Proposed tabs: Concept animation · DGP simulator · Forest plot
  (with warning that forest plot can't show real data on Pattern B)

**Expected Phase 2.**
- Round 1: takeaways extracted from the post's overview.
- Round 2: user keeps Concept animation + DGP simulator; drops Forest
  plot OR accepts the Pattern-B fallback (empty forest with simulator
  message).
- Round 3: Pattern-B fallback chosen.
- Round 4: defaults.

**Expected Phase 3.**
- `web_app/data/results.json` = `{"estimates": [], "selection": []}`
  (empty stubs).
- `web_app/app.js` includes only the two confirmed widgets.
- `web_app/index.html` has 3 tabs (Intro + 2 widgets).

**Expected Phase 4.** All static + JS checks pass.

---

## Test 3 — `r_convergence_clubs` (Pattern C landing page)

A landing-page post with no local script, no local data, only external
Colab/Deepnote links.

**Invocation.**
```
/project:write-app r_convergence_clubs
```

**Expected Phase 1.**
- Language = R (inferred from slug; even though there's no local
  `.R` file)
- Data pattern = C
- Topic family = `mixed` (probably no specific trigger keywords from
  the catalog; could also detect `panel` if "convergence" is added
  to the trigger list)
- Proposed tabs: Concept animation · DGP simulator

**Expected Phase 2.**
- Round 1: takeaways from the post's first paragraph and the linked
  external notebook descriptions.
- Round 2: user accepts the 2-tab proposal.
- Round 3 (Pattern C): user picks "Mimic the post's topic" — DGP for
  cross-country convergence simulation.

**Expected Phase 3.**
- Two-tab app written; no forest plot.

**Expected Phase 4.** All static + JS checks pass; the smoke test
includes only assertions about `DGP.simulate_lasso` (since
`results.json` is empty).

---

## Test 4 — `--no-link` invariant

Run on any post with `--no-link`. After Phase 3:

```bash
diff <(git show HEAD:content/post/<slug>/index.md) content/post/<slug>/index.md
# should be empty
```

The skill must not touch `index.md` when `--no-link` is set.

---

## Test 5 — `--no-verify` exit code

Run on any post with `--no-verify`. Phase 4 prints
`[~] Phase 4 skipped (--no-verify)` and Phase 5's overall verdict is
`SKIPPED`, not `PASS` or `FAIL`. The user is told to re-run without
the flag if they want validation.

---

## Test 6 — Hugo URL quirk regression

After running on any post, fetch `/post/<slug>/` from a Hugo dev
server and confirm the rendered HTML contains:

```html
href="/post/<slug>/web_app/index.html"
```

Anywhere — never `/web_app/` (missing the post-path prefix) and never
`/post/<slug>/web_app/` (trailing-slash bug). This single check is
load-bearing; the entire YAML link contract depends on it.

---

## Test 7 — Idempotent re-run

```
/project:write-app r_double_lasso    # initial run
/project:write-app r_double_lasso    # re-run
```

The second invocation must detect the existing `web_app/` and ask
before overwriting. On `y`, produce byte-identical templates and
structurally equivalent generated files.

---

## Recording results

After running tests, append a one-line entry to this file under "Test
log":

```
2026-MM-DD <test #> <PASS|FAIL> <notes>
```

Failures: file an issue in the catalogue's `render-and-fix.md` with
the exact symptom + fix.

---

## Test log

(empty — populate as tests run)
