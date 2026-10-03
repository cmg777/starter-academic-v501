# Post-redesign project status — 2026-10-03

**Summary:** the cinematic **Earth-at-night ("orbital") landing page** and a **shared dark website theme** are now committed and pushed to `master`. This entry records the site state after the redesign and how to get back to the version before it.

| | |
|---|---|
| **Redesign commit** | the commit that adds this file (`feat(design): …` on `master`) |
| **Previous version** | tag `pre-design-update-2026-10-03` / branch `backup/pre-design-update-2026-10-03` (commit `c8c6a6f6`, site content = `59d321aa`) |
| **Rollback guide** | `logs/2026-10-03-pre-design-update-snapshot.md` |
| **Detailed design logs** | `2026-10-03-orbital-landing.md`, `2026-10-03-shared-website-theme.md`, `2026-10-03-landing-polish.md`, `2026-10-03-landing-content-community.md`, `2026-10-03-cesar-portrait.md` |

---

## 1. What changed since the snapshot

27 paths in total: 5 modified files and 22 new files/directories. No content pages (posts, publications, events, projects, authors) were changed.

### Modified

| File | Change |
|---|---|
| `layouts/partials/custom_head.html` | Removed the old dark-by-default `localStorage.wcTheme` pre-paint script. Now emits `<meta name="color-scheme" content="dark">` and loads `orbital-palette.css` + `orbital-subpages.css` (concatenated, minified, fingerprinted, with SRI) after Wowchemy. The SEO `x-default` hreflang block is unchanged. |
| `config/_default/params.yaml` | `day_night: false`, `main_menu.show_day_night: false`. The site is dark only and the light/dark toggle is gone. |
| `data/themes/nightlights.toml` | Build-time palette synced to the orbital tokens; dark is rendered on the server (`light = false`). |
| `CLAUDE.md` | "Homepage Architecture" rewritten for `layouts/index.html`; new site palette under Shared conventions; `featured:` flag noted as legacy. |
| `README.md` | New "Cinematic landing page" section; homepage-widget section replaced. |

### New

| Path | Role |
|---|---|
| `layouts/index.html` | Standalone homepage template. Doesn't load Wowchemy's legacy CSS/JS. |
| `layouts/partials/orbital-{card,community,contact,gallery,talks,thumbnail}.html` | Homepage sections: cards, student community, contact panel, photo carousel, presentations, `*featured*` thumbnails (`object-fit: contain`) |
| `data/orbital.json` | All EN/ES/JA landing-page copy and interface text. Keep the three locales in sync. |
| `data/orbital_portraits.json` | Portrait overrides for the landing page (Cesar Echevarria enhanced portrait) |
| `assets/css/orbital-palette.css` | Shared color/font tokens, the single source for both page systems |
| `assets/css/orbital.css` | Landing-page design (~32 KB source) |
| `assets/css/orbital-subpages.css` | Restyles all Wowchemy content pages with the shared palette |
| `assets/js/orbital.js` | Dependency-free WebGL globe (NASA Black Marble 2016): region selection, drag, arrow keys, zoom, pause; 30 fps cap, pauses offscreen, reduced-motion aware, static fallback |
| `assets/js/orbital-gallery.js` | Native scroll-snap photo carousel (19 photos, no autoplay) |
| `assets/media/orbital/` | `earth-at-night-asia.png` (812 KB), `cesar-echevarria-enhanced.png` (1.9 MB, AI focus restoration; original `avatar.jpg` untouched) |
| `static/media/orbital/` | `black-marble-2016.jpg` (764 KB desktop), `black-marble-2016-mobile.jpg` (96 KB), `CREDITS.txt` (NASA imagery attribution) |
| `tests/orbital.test.cjs` | 8 Node behavioral tests for the globe. Run with `node --test tests/orbital.test.cjs`. |
| `logs/2026-10-03-{orbital-landing,shared-website-theme,landing-polish,landing-content-community,cesar-portrait}.md` | Design decisions and verification notes |

---

## 2. Architecture now

- **Homepage**: `layouts/index.html`. It replaces the Wowchemy widget homepage. Its sections pull from existing Hugo content:
  - **Recent research**: the 3 newest publications of types 1–3, by `date`. Books and future-dated papers are excluded, and `featured:` flags are not used.
  - **Recent presentations**: events.
  - **Projects**: sorted `.ByLastmod.Reverse` (git date), as before.
  - **Tutorials**.
  - **Researcher profile**.
  - **Students**: 10 current students, selected by `content/home/people.md`'s group settings.
  - **Gallery**: the 19 original photos.
  - **Contact**: reads `params.yaml` contact fields.
- **Content pages** (posts, publications, events, projects, courses, authors, …) are still rendered by Wowchemy, now restyled by `orbital-subpages.css`. URLs are unchanged.
- **`content/home/*.md` widget files are kept** but no longer control homepage layout or order. The exception is `people.md`, which is still the student-group source.
- **Navigation** on desktop and mobile reads the existing localized `site.Menus.main`.
- **Out of scope** (designs unchanged): standalone teaching apps, Quarto slide decks, external course/dashboard sites, scientific figures, code syntax colors.
- **New site palette**: background `#050a12`, panels `#0a121d`, text `#edf2f6`, secondary `#9baaba`, borders `#22303e`, blue `#88b9de`, gold `#e9c184`.

---

## 3. Verification at commit time

- `hugo --gc --minify --buildFuture` (0.111.3 extended): **exit 0, no errors**. The only warning is the old `.Path` deprecation, which was already there before the redesign. Page counts are **identical to the pre-design snapshot**: EN 1172 / ES 553 / JA 553.
- `node --test tests/orbital.test.cjs`: **8 / 8 pass**.
- Responsive browser checks (320–1440 px, EN/ES/JA): recorded in the design logs above, not re-run here.

---

## 4. Files deliberately NOT committed

The working tree for this update also contained changes that were not part of the redesign. They looked like it had been copied in from an older copy of the repo. On the user's decision these were **restored to their `master` versions** and are not part of this commit:

- **197 post files** (`references/setup_env.py`, `references/README.md`, `data/*.dta`, `data/build_data_dictionary.py`, `<slug>.zip` / `data/<slug>_data.zip` bundles, `static/uploads/python_pyfixest_tutorial.zip`). These were the pre-`59d321aa` versions and would have undone the site-wide "bare-render kernel fix and exact CSV parsing" commit.
- **7 deleted logs**: `pre-design-update-snapshot`, the 5 `python-did101-*` logs, and `site-setup-env-and-dta-precision`. All are kept.

If a future edit is made from an older copy of the repo, check `git status` for the same pattern before committing.

---

## 5. How to roll back the redesign

The full guide is in `logs/2026-10-03-pre-design-update-snapshot.md`, section 2. Quick reference:

```bash
# Whole site back to the pre-design version (keeps history; recommended)
git checkout master && git pull
git rm -r -q . && git checkout pre-design-update-2026-10-03 -- .
git commit -m "revert: restore pre-design-update snapshot" && git push origin master
```

This also removes this log and the 5 design logs. To keep the documentation, run `git checkout HEAD -- logs/` before the commit step (HEAD is still the redesign at that point).

```bash
# Old homepage only, keeping the new subpage theme:
git rm layouts/index.html                       # Wowchemy widget homepage returns
# Old look everywhere, but keep the landing page files in the repo:
git checkout pre-design-update-2026-10-03 -- layouts/partials/custom_head.html \
    config/_default/params.yaml data/themes/nightlights.toml
git rm layouts/index.html
```

For an immediate live-site rollback: Netlify → Deploys → publish the deploy of `c8c6a6f6` ("docs(logs): pre-design-update snapshot and rollback guide").

---

## 6. Follow-ups

- After Netlify deploys, check the live homepage in all three languages (globe, carousel, contact panel, navigation) and a few content pages (post, publication, course).
- Translation rule: any change to landing-page copy goes in all three locales of `data/orbital.json`.
- Visitors who chose light mode before will now see dark. The old `wcTheme` value in their browser is ignored.
