# .claude/docs — on-demand reference docs

Agent-facing operational recipes that `CLAUDE.md` points to but does not inline, so the always-loaded `CLAUDE.md` stays lean (progressive disclosure). Load the relevant file only when its trigger applies. Human-facing documentation lives in the root `README.md`; project history lives in `logs/`.

- [dashboards-gallery.md](dashboards-gallery.md) — "Add dashboard app" recipe + the gallery shortcodes/capture-script architecture.
- [ai-podcast-player.md](ai-podcast-player.md) — "Add AI Podcast to `<post>`" recipe: the inline HTML5 player (raw audio file) or the Spotify embed (Spotify-hosted episode, incl. resolving a Creators share link).
- [learning-components.md](learning-components.md) — "Add learning components to `<post>`" recipe: predict / solution / misconception / proof cards (`custom.scss` §24, pure `<details>`), graded exercises, lint + browser-check scripts, and the interactive-widget (shortcode + fingerprinted JS/CSS) pattern from `fwl-lab`.
- [post-resource-buttons.md](post-resource-buttons.md) — Slides (PDF) / Slides (HTML) `links:` buttons + tutorial `.zip` bundle convention.
- [ahaslides.md](ahaslides.md) — "Make an AhaSlides deck for `<post>`" recipe: render the Quarto deck to PDF, import it as full-bleed slide images, add native interactive slides via the MCP.
- [i18n.md](i18n.md) — detailed trilingual (ES/JA) mechanics, per-section field rules, geolocation, and the "add another language" recipe.
