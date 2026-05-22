# Render-and-Fix Catalog

Common failure modes encountered during `write-app` runs, with the
fix that ships in the skill. Each entry shows the failing symptom,
the root cause, and the fix.

---

## 1. Hugo trailing-slash URL rewrite

**Symptom.** Phase 4.2 YAML link check fails: rendered HTML contains
`href="/web_app/"` (absolute path) instead of
`/post/<slug>/web_app/index.html`. Clicking the button 404s.

**Root cause.** The Wowchemy theme's link template processes a YAML
`url: web_app/` (with trailing slash) through `relURL` differently
than a non-slash URL. Trailing slash gets prepended with `/`, making it
absolute.

**Fix.** Always emit `url: web_app/index.html` in the injected YAML
entry. Phase 3.7 enforces this. Verified by the
`r_double_lasso` reference implementation.

---

## 2. results.json schema mismatch with widgets

**Symptom.** Forest plot tab renders an empty SVG. Browser console:
`Cannot read property 'estimate' of undefined`.

**Root cause.** The CSV parsed in Phase 3.6 used non-standard column
names (e.g. `point` instead of `estimate`, `lower_ci` instead of
`ci_lo`).

**Fix.** Pattern-A CSV parsing must produce keys matching the schema
in `data-handling.md`:
- `method`, `outcome`, `estimate`, `se`, `ci_lo`, `ci_hi`,
  `n_selected`

If the source CSV uses different column names, rename during parsing.
If columns are missing, compute (e.g. `ci_lo = estimate - 1.96 * se`)
or set `null`. Never let widgets see unexpected key names.

---

## 3. Near-singular X'X in JS Cholesky

**Symptom.** `cholSolve` returns `null` during the post-OLS step. The
α̂ stat shows `—` instead of a number.

**Root cause.** When the selected support is too large relative to n,
columns of the design matrix become near-collinear and the Cholesky
factorisation fails on the (positive-definite-but-ill-conditioned)
matrix.

**Fix.** Already in `lasso.js`: if `cholSolve` returns `null`, the
code adds a tiny ridge (`1e-8 * I`) to `X'X` and retries. This is the
same trick the R analysis uses (`MASS::ginv`). No additional change
needed.

---

## 4. CDN failure for d3.js

**Symptom.** App page is blank. Browser console: `d3 is not defined`.

**Root cause.** Network failure on the `<script
src="https://d3js.org/d3.v7.min.js">` tag, or the user is offline.

**Fix (current).** The skill ships a `<noscript>`/error fallback in
`index.html` that displays a clear "Failed to load D3" message with
the CDN URL the student can verify.

**Fix (future, not yet implemented).** Bundle D3 v7 locally
(`web_app/d3.v7.min.js`) and serve from the page bundle. Adds ~250 KB
per app but removes the CDN dependency. Promote when offline use cases
become common.

---

## 5. Hugo dev server port collision

**Symptom.** Phase 4 cannot start Hugo: "address already in use".

**Root cause.** The user has Hugo running on the default port 1313 (or
1314, 1315, etc.) in another terminal.

**Fix.** Phase 4 must scan ports starting at 1316 and find the first
unbound one via `lsof -iTCP:$p -sTCP:LISTEN -t`. Use that port; report
it in the verification block. Always kill the started Hugo after
verification.

---

## 6. JS smoke test timeout on large p

**Symptom.** `lasso_path n=500, p=100` exceeds 300 ms.

**Root cause.** The user's laptop is slower than the dev machine.
Could also be: the smoke test ran with `maxIter` too high.

**Fix.** Phase 4 smoke test uses `maxIter=60, tol=1e-5` matching the
in-app defaults; do not tighten these. If a specific machine still
exceeds 300 ms, surface as `[~]` (warning) rather than `[✗]` (failure)
— the math is still correct, just slower.

---

## 7. Template substitution markers leaked into output

**Symptom.** `app.js` contains literal `{{WIDGET_INIT}}` in production.

**Root cause.** Phase 3.5 forgot to substitute, or a widget fragment
referenced a placeholder name that doesn't match the template.

**Fix.** Phase 4 minimal sanity check: grep generated `app.js` and
`index.html` for `{{`. Any match is a failure.

---

## 8. Phase 2 user picks STUB widget

**Symptom.** App ships a card saying "this widget is not yet
implemented" — the user reviewing the deployment is confused.

**Root cause.** Phase 2 didn't surface the trade-off clearly.

**Fix.** Round 2's question text must mark STUB widgets with `(stub)`
in the option label. Round 5 acknowledges the trade-off explicitly.
If both checks happened and the user still chose the stub, the
placeholder card is the intentional outcome — not a failure.

---

## 9. Post has no Learning Objectives section

**Symptom.** Phase 1's "key takeaways" extraction yields nothing.

**Root cause.** The post predates the convention or is intentionally
free-form.

**Fix.** Fall back to the **conclusion / takeaways** section. If that
also doesn't exist, fall back to the **post's opening paragraph plus
the spoiler-figure caption**. If still nothing, ask the user in
Phase 2 Round 1 to articulate 2–3 takeaways in free-form text.

---

## 10. Two-CSV results files with overlapping methods

**Symptom.** Phase 3.6 produces a `results.json` with duplicate
`(method, outcome)` rows. Forest plot draws two overlapping CIs.

**Root cause.** Two CSVs in the post folder both contain the same
method-outcome combo with slightly different numbers (e.g. one with
state-clustering, one without).

**Fix.** Phase 2 Round 3 must ask the user which CSV is the primary
when both are present, and offer "Use both, but tag methods with a
suffix" as an option for posts that intentionally show two
specifications side-by-side.

---

## 11. R script writes results with R's special-character escaping

**Symptom.** `results.json` contains keys like `|I_y∩I_d|` (the
intersection symbol U+2229 escaped). Forest plot renders gibberish in
the tooltip.

**Root cause.** The CSV was written by R with `Encoding(UTF-8)` and
the JSON conversion didn't decode.

**Fix.** Phase 3.6 CSV parser must:
1. Read the CSV as UTF-8.
2. Decode any `\uXXXX` escapes before writing to JSON.
3. Validate by parsing the resulting JSON back and checking that
   string fields are renderable Unicode (no surrogate pairs).

---

## 12. The post has changed since Phase 1

**Symptom.** Phase 3 errors with "key takeaway not found in
index.md". User had edited the post mid-run.

**Root cause.** Long Phase-2 interview gave the user time to edit
`index.md`.

**Fix.** Phase 3 re-reads `index.md` to confirm the title and front
matter still match what Phase 1 read. If they differ, surface the
diff and ask the user whether to abort or proceed. Do not silently
use stale Phase-1 data.

---

This catalog grows over time. Add entries as new failure modes are
encountered, with the symptom verbatim from the error output.
