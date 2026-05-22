# Canonical Test Cases

Six tests cover the skill's input space and its failure modes.
Re-run whenever `SKILL.md` or any reference file changes.

The reference app is `content/post/r_double_lasso/web_app/`, which
was the validation target for `write-app`. Sabotage tests modify a
single file at a time and revert before the next test.

---

## Test 1 — Reference app, no changes (the happy path)

**Setup:** none.

**Invocation:**
```
/project:review-app r_double_lasso
```

**Expected:**
- Verdict **ACCEPT**.
- Every dimension ≥ 8.
- Smoke test: 7/7 assertions pass.
- Playwright pass: 4 tabs cycle; no console errors; mobile passes.
- `content/post/r_double_lasso/web_app/REVIEW.md` written with full
  template populated.
- No screenshots committed (cleanup deletes them on ACCEPT).
- Stdout summary names: ACCEPT verdict, zero HIGH issues.

---

## Test 2 — Sabotage: delete `dgp.js`

**Setup:**
```bash
mv content/post/r_double_lasso/web_app/dgp.js /tmp/dgp.js.bak
```

**Invocation:** `/project:review-app r_double_lasso`

**Expected:**
- Dim 1 = 3 (file missing is HIGH).
- Dim 3 = 1 (smoke test cannot run; depends on dgp.js).
- Verdict: **MAJOR REVISION**.
- Issues table: "missing required file dgp.js" as #1.
- Suggested fix: "Restore dgp.js or re-run `/project:write-app r_double_lasso`."

**Cleanup:**
```bash
mv /tmp/dgp.js.bak content/post/r_double_lasso/web_app/dgp.js
git checkout content/post/r_double_lasso/web_app/REVIEW.md
```

---

## Test 3 — Sabotage: trailing-slash YAML link

**Setup:** edit `content/post/r_double_lasso/index.md`'s YAML link
from `url: web_app/index.html` to `url: web_app/`.

**Invocation:** `/project:review-app r_double_lasso focus: hugo`

**Expected:**
- Dim 8 = 4 (HIGH; trailing-slash bug per `scoring-and-criteria.md`
  verdict-changing rules).
- Verdict: **MAJOR REVISION**.
- Fix suggestion cites the catalogued entry "Hugo trailing-slash URL
  rewrite" from `write-app/references/render-and-fix.md`.

**Cleanup:** `git checkout content/post/r_double_lasso/index.md`

---

## Test 4 — Sabotage: remove all aria-labels from sliders

**Setup:** `sed -i '' 's/aria-label="[^"]*"//g' content/post/r_double_lasso/web_app/index.html`

**Invocation:** `/project:review-app r_double_lasso focus: accessibility`

**Expected:**
- Dim 5 ≤ 5 (HIGH per failing slider).
- Verdict: **MAJOR REVISION** if multiple sliders failed, or **MINOR
  REVISION** if only one.
- Issues table lists each affected slider by `id`.

**Cleanup:** `git checkout content/post/r_double_lasso/web_app/index.html`

---

## Test 5 — Sabotage: replace Tab-1 lede with Lorem Ipsum

**Setup:** edit `index.html` and replace the contents of
`<p class="lede">…</p>` with Lorem Ipsum placeholder text.

**Invocation:** `/project:review-app r_double_lasso focus: pedagogy`

**Expected:**
- N-gram alignment 0/3 ⇒ Dim 7 = 4, HIGH issue.
- Verdict: **MAJOR REVISION** (n-gram 0/3 is verdict-changing rule).
- Issues table includes "Tab-1 lede does not foreground the post's
  top 3 takeaways" with the extracted takeaway list quoted.
- Report's "Pedagogical alignment" section shows the takeaway list,
  the extracted app messaging (Lorem Ipsum), and explicit 0/3.

**Cleanup:** `git checkout content/post/r_double_lasso/web_app/index.html`

---

## Test 6 — `--no-browser` flag

**Setup:** none.

**Invocation:** `/project:review-app r_double_lasso --no-browser`

**Expected:**
- Phase 4.2 skipped; Dims 9 + 10 report `—  not audited (browser pass
  skipped)`.
- Static HTTP + smoke test still run.
- Verdict still ACCEPT (8 dimensions all pass).
- Audit metadata block notes "Browser pass: skipped (--no-browser)".

---

## Test 7 — Focus subset

**Setup:** none.

**Invocation:** `/project:review-app r_double_lasso focus: code and accessibility`

**Expected:**
- Only Dims 3, 4, 5 audited.
- Dims 1, 2, 6, 7, 8, 9, 10 marked `[~] Not audited (focus subset)`.
- Verdict computed from 3 dimensions only.

---

## Test 8 — Idempotent re-run

**Setup:** none.

**Invocation:** run Test 1 twice.

**Expected:** Two REVIEW.md files differ only in the audit date
field. All other content identical. No flakiness in scores.

---

## Test 9 — First-run Playwright bootstrap

**Setup:** uninstall Chromium:
```bash
npx playwright uninstall chromium
```

**Invocation:** `/project:review-app r_double_lasso`

**Expected:**
- Phase 0.3 prints "First-run bootstrap: installing Playwright
  Chromium…".
- Bootstrap completes (90–120 s).
- Audit proceeds normally.
- Subsequent runs use the cached Chromium and are fast.

---

## Test 10 — Missing `web_app/`

**Setup:** pick a post without an app (e.g. `r_did`).

**Invocation:** `/project:review-app r_did`

**Expected:**
- Skill exits Phase 0 with clear message: "No web_app/ folder found
  at content/post/r_did/web_app/. Run `/project:write-app r_did`
  first."
- No REVIEW.md written.
- Exit code non-zero.

---

## Test log

Record results inline. Format: `YYYY-MM-DD  test #  PASS|FAIL  notes`.

```
(empty — populate as tests run)
```
