# 2026-08-07 — `scspill` project page: unified three-author citation

## What changed upstream

The `scspill` docs site (<https://quarcs-lab.github.io/scspill/>) changed its
authorship and citation policy after the project page was written on 2026-07-28.
Per the `Unreleased` entry of the upstream
[`CHANGELOG.md`](https://github.com/quarcs-lab/scspill/blob/main/CHANGELOG.md) —
authorship and citation metadata only, **no functional change**:

- **Three authors, one citation.** Shosei Sakaguchi and Hayato Tagawa joined as
  co-authors of the *software*. `CITATION.cff`, the package metadata and
  `LICENSE` now list Carlos Mendez, Shosei Sakaguchi and Hayato Tagawa. This
  supersedes the v0.2.1 decision that made Carlos Mendez the sole author.
- **The "Citing" sections now ask for a single reference** — the software. The
  article and replication-package entries were removed from `references` in
  `CITATION.cff`, which now describes only the software.
- **The article is still cited where it is a reference** — the models table, the
  `sar` model page, the estimator docstrings, and the "Paper (sar model)"
  project URL.

Everything else verified unchanged on 2026-08-07: version **0.2.1** (also the
latest PyPI release), Python 3.10+, identical install commands, one implemented
model (`sar`) with three on the roadmap, both bundled datasets (California
Proposition 99, 2011 Sudan secession).

## What changed on the site

Three files, `content/projects/scspill/index.md` plus its ES and JA
counterparts:

1. **Single unified citation.** The two block quotes in the Acknowledgement
   became one, verbatim from upstream:

   > Mendez, C., Sakaguchi, S., & Tagawa, H. (2026). *Synthetic Control Models with Spillovers in Python* (version 0.2.1). <https://github.com/quarcs-lab/scspill>

   The standalone Sakaguchi & Tagawa (2026) article block quote was removed from
   the Citing block. The article remains cited in the **Models** section, where
   it is the `sar` method reference, with its DOI link intact.
2. **Acknowledgement reframed to co-authorship.** It now opens by stating that
   `scspill` is authored by all three, then attributes the Python package to
   Carlos Mendez and the `sar` method plus its original R/C++ implementation to
   Shosei Sakaguchi and Hayato Tagawa. The "please cite their article whenever
   you fit that model" sentence is gone, replaced by the single-citation policy.
   The MIT/`LICENSE`, replication-package, cross-validation, mlsynth and
   geometrics credits are unchanged.
3. **New link button — "For AI / LLMs"** →
   <https://quarcs-lab.github.io/scspill/use-with-llms.html> (`fas` `robot`),
   the docs page serving `llms.txt` and `llms-full.txt`. Localized as
   "Para IA / LLM" (ES) and "AI / LLM 向け" (JA).

`date:` was deliberately **not** bumped — the Projects widget sorts by
`.ByLastmod.Reverse` (git commit date), so committing surfaces the project first
on its own.

## Deliberately left alone

The tutorial posts still carry the superseded sole-author form and were out of
scope for this change:

- `content/post/python_sc_bayes_spatial/index.md:1632` — reference 18,
  `Mendez, C. (2026). scspill: synthetic control models with spillover effects.`
- `content/post/python_sc_bayes_spatial/references/tutorial.qmd:1401` — the same
  line in the Quarto source.

Updating those would also mean re-exporting the `.zip` bundle and the notebook,
so it is a separate task.

## Verification

- `hugo --gc --minify` (0.111.3 extended) — clean build, no new warnings.
- No `Mendez, C. (2026)` sole-author string remains under any
  `projects/scspill/`; the `10.1093/ectj/utag006` DOI link is still present in
  all three language versions.
