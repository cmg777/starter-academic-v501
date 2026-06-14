# 2026-06-14 — Homepage Projects widget ordered by most-recently-updated

The homepage Projects widget now lists the most-recently-updated project first, so that
adding or editing any project under `content/projects/` automatically surfaces it at the
top of the widget.

## What changed and why

Previously the Projects widget ordered by the `date` front-matter field (newest first), so
an actively-updated project would not move up unless its `date` was manually bumped. The
request was that any updated project lead the widget. The site already does exactly this for
the Posts & Tutorials teaser (`tutorial-teaser.html`, `.ByLastmod.Reverse`, shipped in
commit `d394ac65`), so the projects widget now follows the same git-`Lastmod` pattern.

### `layouts/shortcodes/showcase.html`
- The `showcase` shortcode renders both the Projects widget (`type="project"` → section
  `projects`) and the Talks/Presentations widget (`type="event"` → section `event`).
- Changed the sort so the **projects** section uses `.ByLastmod.Reverse` (most-recently
  git-committed `index.md` first; `.Lastmod` falls back to `date` when no git info), while
  **events** keep `.ByDate.Reverse` (talk date). The projects-only behavior is guarded by
  `{{ if eq $section "projects" }}`.
- Relies on `enableGitInfo: true` (`config/_default/config.yaml`) + `HUGO_ENABLEGITINFO=true`
  (`netlify.toml`), already in place and proven by the tutorial teaser.

### `CLAUDE.md`
- Documented the convention under **Homepage Architecture → Projects widget ordering** so the
  behavior is the persistent, every-session source of truth: editing + committing a project
  (with its ES/JA counterparts) makes it appear first; events stay date-ordered.

## i18n

No per-language template work. The ES/JA homepage Projects widgets call the same `showcase`
shortcode against their own language's `site.RegularPages`. Project edits are committed across
EN+ES+JA together, so all three bundles' `.Lastmod` bump together and stay consistent. No
project content files were modified.

## Resulting order

Top-3 (by last commit of `content/projects/*/index.md`) becomes: **dashboards** (2026-06-14)
→ **metricsai** (2026-06-11) → **indonesia514** (2026-06-11), replacing the prior date-based
top-3 (indonesia514 / ccm / intro2causal). The `dashboards` project added earlier today now
leads the widget automatically.

## Verification

No local Hugo binary is installed, so the definitive check runs on the Netlify deploy
(Hugo 0.111.3, `HUGO_ENABLEGITINFO=true`): the homepage and `/es/`, `/ja/` Projects sections
should list `dashboards` first, and the Talks/Presentations widget order should be unchanged.
