# .claude/docs — on-demand reference docs

Agent-facing operational recipes that `CLAUDE.md` points to but does not inline, so the always-loaded `CLAUDE.md` stays lean (progressive disclosure). Load the relevant file only when its trigger applies. Human-facing documentation lives in the root `README.md`; project history lives in `logs/`.

- [design-system.md](design-system.md) — the design reference: two page systems, palette tokens, homepage architecture and performance guardrails, catalog layout, responsive and menu rules (collapse below 1200px), and the homepage thumbnail quality standard.
- [theme-overrides.md](theme-overrides.md) — every forked Wowchemy template and non-template override (i18n, manifest, cascade types), why each exists, and what to re-check after a theme update.
- [site-audit.md](site-audit.md) — how to re-run the site audit: `scripts/audit-site.py` (links, anchors, language links, redirects vs an older commit), `scripts/audit-nav.cjs` (menu and overflow at six widths), manual and live checks.
- [webapps.md](webapps.md) — "Add web app" recipe: one `content/webapps/<slug>/` bundle per standalone app (+ ES/JA), the auto-listed tutorial `web_app/` folders, the shared `catalog.html` filters and the thumbnail capture script.
- [ai-podcast-player.md](ai-podcast-player.md) — "Add AI Podcast to `<post>`" recipe: the inline HTML5 player (raw audio file) or the Spotify embed (Spotify-hosted episode, incl. resolving a Creators share link).
- [learning-components.md](learning-components.md) — "Add learning components to `<post>`" recipe: predict / solution / misconception / proof cards (`custom.scss` §24, pure `<details>`), graded exercises, lint + browser-check scripts, and the interactive-widget (shortcode + fingerprinted JS/CSS) pattern from `fwl-lab`.
- [post-resource-buttons.md](post-resource-buttons.md) — Slides (PDF) / Slides (HTML) `links:` buttons + tutorial `.zip` bundle convention.
- [ahaslides.md](ahaslides.md) — "Make an AhaSlides deck for `<post>`" recipe: render the Quarto deck to PDF, import it as full-bleed slide images, add native interactive slides via the MCP.
- [i18n.md](i18n.md) — detailed trilingual (ES/JA) mechanics, per-section field rules, geolocation, and the "add another language" recipe.
- [adding-content.md](adding-content.md) — intake guide: what the user hands over (paper PDF, slides, app URL, package, data portal) → which skill or recipe → what a finished trilingual entry contains; software and data recipes.
