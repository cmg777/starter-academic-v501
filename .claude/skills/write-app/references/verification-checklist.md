# Verification Checklist (Phase 4)

Phase 4 verifies the generated app via two layers:

1. **Static checks** — HTTP-200s from a Hugo dev server.
2. **JS smoke test** — Node `vm.runInThisContext` on `dgp.js` +
   `lasso.js` with sanity assertions.

Both layers run unless `--no-verify` was passed.

---

## Static checks (always)

Start Hugo on a free port (`for p in 1316 1317 1318 ...; do lsof
-iTCP:$p -sTCP:LISTEN -t || break; done`). Then assert HTTP 200 for:

| URL pattern                                          | Required? |
|------------------------------------------------------|-----------|
| `/post/<slug>/web_app/`                              | ✓         |
| `/post/<slug>/web_app/styles.css`                    | ✓         |
| `/post/<slug>/web_app/dgp.js`                        | ✓         |
| `/post/<slug>/web_app/lasso.js`                      | ✓         |
| `/post/<slug>/web_app/charts.js`                     | ✓         |
| `/post/<slug>/web_app/app.js`                        | ✓         |
| `/post/<slug>/web_app/data/results.json`             | ✓         |
| `/post/<slug>/`                                      | ✓ (post itself still renders) |

After verifying assets, **kill the Hugo process** before reporting.

---

## YAML link check (unless `--no-link`)

The skill injects a `Web app` link entry into `index.md`'s `links:`
array. After Hugo renders, scrape `/post/<slug>/` for an `<a>` whose
`href` is exactly `/post/<slug>/web_app/index.html`.

**Critical:** the href must end with `/index.html`. The Wowchemy theme
rewrites a trailing-slash URL (`url: web_app/`) into an absolute
`/web_app/`, which 404s. See `render-and-fix.md` entry "Hugo trailing
slash URL rewrite".

---

## JS smoke test (unless `--no-verify`)

Copy `templates/smoke-test.js` into a tempdir, point its `BASE`
constant at the new `web_app/`, and run with `node smoke-test.js`. The
script must exit 0 and produce output like:

```
[✓] lambda_max bound: at λ > λ_max all coefficients are zero
[✓] OLS recovery: at λ ≈ 0 all coefficients are nonzero
[✓] qnorm(0.975) = 1.9600  (expect 1.96)
[✓] qnorm(0.99975) = 3.4808  (expect 3.48)
[✓] DGP simulate_lasso shape: y.length == n
[✓] lasso_path n=500, p=100 took NN ms  (< 300 ms target)
```

Any `[✗]` line is a Phase-4 failure. The skill aborts to Phase 5 with
the failure surfaced.

If the chosen archetypes include a forest-plot widget, add one extra
assertion:

```
[✓] data/results.json parses, has `estimates` array of length N > 0
```

If they include the DGP-simulator widget:

```
[✓] simulate_dl(asymmetry=0.85) produces k_d > k_y (the §9 fingerprint)
```

---

## Report template

After both layers run, print this block. Substitute every `<placeholder>`.

```
VERIFICATION REPORT
===================
Web app:      content/post/<slug>/web_app/
Hugo port:    <port>
Smoke test:   <PASS | FAIL>

Static checks
  [✓] /post/<slug>/web_app/                                   (200)
  [✓] /post/<slug>/web_app/styles.css                         (200)
  [✓] /post/<slug>/web_app/dgp.js                             (200)
  [✓] /post/<slug>/web_app/lasso.js                           (200)
  [✓] /post/<slug>/web_app/charts.js                          (200)
  [✓] /post/<slug>/web_app/app.js                             (200)
  [✓] /post/<slug>/web_app/data/results.json                  (200)

YAML link check
  [✓] /post/<slug>/  links to web_app/index.html (no trailing-slash bug)
  OR [~] Skipped (--no-link)

JS smoke test
  [✓] lambda_max bound
  [✓] OLS recovery at low λ
  [✓] qnorm precision
  [✓] Performance under 300 ms (NN ms measured)
  [✓] data/results.json parses correctly
  OR [~] Skipped (--no-verify)

Widget status
  [✓] concept-animation   (READY)
  [✓] penalty-slider      (READY)
  [✓] forest-plot         (READY)
  [✓] dgp-simulator       (READY)
  [~] did-event-study     (STUB — placeholder rendered)

Overall: <PASS | FAIL>
```

`[~]` rows are warnings — the run is still PASS if all `[✗]` rows are
absent.

---

## Failure protocol

If any `[✗]` is present:

1. **Do not modify `index.md`** beyond what Phase 3 already did.
   Specifically: do not remove the `Web app` link entry. The user
   might want to inspect.
2. Surface the failed assertion verbatim with the file path and line
   number where it originated.
3. Suggest the fix from
   [`render-and-fix.md`](render-and-fix.md) if the failure matches a
   catalogued pattern.
4. Offer a re-run after the user investigates.

---

## Verifying a `--no-verify` run

Even with `--no-verify`, do a minimal sanity check:

- Every expected file exists at the expected path.
- `index.html` is non-empty (> 1 KB).
- `app.js` does not contain literal `{{` substitution markers
  (catches template-rendering bugs).
- If `--no-link` is also off: `index.md` contains `name: "Web app"`.

These checks are cheap and prevent the most embarrassing failures.
