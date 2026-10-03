# Pre-design-update snapshot — 2026-10-03

**Purpose:** freeze a known-good restore point of carlos-mendez.org before a large **design/layout update** (SCSS, homepage widgets, hero, partials). If the update goes wrong, this file explains how to get back to this exact version.

| | |
|---|---|
| **Git tag** | `pre-design-update-2026-10-03` (annotated, pushed to GitHub) |
| **Backup branch** | `backup/pre-design-update-2026-10-03` (pushed to GitHub) |
| **Points at** | the commit that adds this file. Site content is byte-identical to `59d321aab1ef65c58e9c8696d86b8a6ab3272962` (2026-10-03 16:47 +0900, "chore: bare-render kernel fix and exact CSV parsing, site-wide"). |
| **Commits on master** | 1,850 at `59d321aa` (1,851 including this log) |
| **Live site** | https://carlos-mendez.org/ — Netlify auto-deploy from `master` |

---

## 1. Verify the restore point exists

```bash
git fetch origin --tags
git show --stat pre-design-update-2026-10-03          # annotated tag + commit
git ls-remote origin | grep pre-design-update          # both tag and branch on GitHub
git diff --stat 59d321aa pre-design-update-2026-10-03  # only this log file
```

The tag and the branch point to the same commit. The tag is immutable by convention. The branch is the same thing in a form you can see on GitHub and deploy from.

---

## 2. Rollback recipes (least → most invasive)

### A. Netlify instant rollback (live site only, ~1 minute)

1. Netlify dashboard → site **carlos-mendez.org** → **Deploys**.
2. Find the production deploy whose commit message is `docs(logs): pre-design-update snapshot and rollback guide`, or the one just before it (`59d321aa`). Both produce the identical site.
3. Open it → **Publish deploy**.

This changes only what visitors see. The repo is untouched, and the **next push to `master` redeploys the new design**. Follow up with **B** to make the rollback permanent.

### B. Restore all files on master, keeping history (recommended)

```bash
git checkout master && git pull
git rm -r -q .                                         # stage removal of everything tracked
git checkout pre-design-update-2026-10-03 -- .          # bring back the snapshot tree
git status                                              # review: files the update ADDED show as deleted
git commit -m "revert: restore pre-design-update-2026-10-03 snapshot"
git push origin master                                  # Netlify redeploys the old site
```

- This brings back the exact tree, including deleting files the update added. History is kept, so the update can be revisited later.
- Untracked/ignored files (section 6) are not affected.
- **Caveat (Projects widget order):** the homepage Projects widget sorts by git last-modified date (`enableGitInfo: true`, `layouts/shortcodes/showcase.html`). If the update changed anything under `content/projects/`, restoring those files gives them a new commit date, which can reorder the widget. Check the homepage after restoring.

### C. Restore only specific parts

```bash
git checkout pre-design-update-2026-10-03 -- assets/scss/custom.scss
git checkout pre-design-update-2026-10-03 -- layouts/ content/home/ content/es/home/ content/ja/home/
git checkout pre-design-update-2026-10-03 -- config/_default/params.yaml
```

Note: `git checkout <tag> -- <dir>` restores files that existed in the snapshot but does **not** delete files the update added inside that directory. Delete those by hand: `git diff --name-status pre-design-update-2026-10-03 HEAD -- <dir>` lists them as `A`.

### D. Inspect / compare without changing anything

```bash
git diff --stat pre-design-update-2026-10-03 HEAD -- layouts assets config content/home
git diff pre-design-update-2026-10-03 HEAD -- assets/scss/custom.scss

# Run the OLD site side by side with the new one:
git worktree add ../site-snapshot pre-design-update-2026-10-03
cd ../site-snapshot && "$HOME/Library/Application Support/Hugo/0.111.3/hugo" server --disableFastRender -p 1314
# when done:  cd - && git worktree remove ../site-snapshot
```

### E. Hard reset (DESTRUCTIVE — last resort)

```bash
git checkout master
git reset --hard pre-design-update-2026-10-03
git push --force-with-lease origin master
```

⚠ This **erases every commit made after the snapshot** from `master`, both locally and on GitHub. Prefer **B** unless the update's history is truly unwanted. Before doing this, save the new work with `git branch archive/design-update HEAD`.

---

## 3. Build / tech fingerprint

| Item | Value at snapshot |
|---|---|
| Hugo (Netlify) | `HUGO_VERSION = "0.111.3"` in `netlify.toml` (no UI override) |
| Hugo (local) | `$HOME/Library/Application Support/Hugo/0.111.3/hugo` — `hugo v0.111.3-5d4eb515…+extended darwin/amd64` |
| Hugo window | requires ≥ 0.96 (`continue` in `layouts/section/event.html`); safe up to ~0.119 |
| Theme | Wowchemy v5 via Hugo Modules, `go.mod` pin `v0.0.0-20210324194200-fda9f39d872e` (`wowchemy` + `wowchemy-cms`) |
| Theme params | `theme: nightlights`, `day_night: true`, `font: 'Native'`, `font_size: M` (`config/_default/params.yaml`) |
| Default appearance | dark theme on first visit (`layouts/partials/custom_head.html`); day/night toggle persists via `localStorage.wcTheme` |
| Languages | EN at `/` (`content/`), ES at `/es/`, JA at `/ja/` (`config/_default/languages.yaml`); `hasCJKLanguage: true` |
| Config files | `config/_default/config.yaml`, `languages.yaml`, `menus.yaml`, `params.yaml` |
| Git info | `enableGitInfo: true` (config) + `HUGO_ENABLEGITINFO = "true"` (netlify.toml) |
| Production build cmd | `hugo --gc --minify --buildFuture -b $URL` (deploy-preview and branch-deploy use `$DEPLOY_PRIME_URL`) |
| Netlify extras | plugin `netlify-plugin-hugo-cache-resources`; edge function `netlify/edge-functions/geo-lang.ts` (geolocation language redirect, honours `lang_pref` cookie); cache headers for webp/jpg/png/css/js; `.qmd` served as download; `.do` served as inline text |
| Security headers | `layouts/index.headers` (CSP + Permissions-Policy from `params.security`) |

### Local build check at snapshot (2026-10-03)

`hugo --gc --minify --buildFuture -d <scratch>/public` → **exit 0, no errors**, 10.3 s. One deprecation warning (`.Path` on file-backed pages) that is harmless on 0.111.3.

|                  |  EN   | ES  | JA  |
|------------------|------:|----:|----:|
| Pages            | 1172  | 553 | 553 |
| Paginator pages  |   71  |  36 |  36 |
| Non-page files   | 12109 | 315 | 315 |
| Static files     |   11  |  11 |  11 |
| Processed images |  496  | 340 | 342 |
| Aliases          |  231  | 150 | 150 |

After a rollback, rebuilding should give the same table. That is a quick way to check the restore worked.

---

## 4. Design layer at snapshot

These are the files the design update is expected to touch. Line counts are as of the snapshot.

### Homepage widgets (`content/home/`, sorted by `weight`)

| File | Widget | Weight | Active |
|---|---|---:|:---:|
| `slider.md` | slider | 1 | no |
| `hero2-new.md` | blank (native hero, rotating insight pillars) | 2 | **yes** |
| `hero2.md` | blank (old Canva-GIF hero) | 2 | no |
| `demo.md` | blank | 2 | no |
| `hero.md` | hero | 3 | no |
| `about.md` | about | 10 | **yes** |
| `researchLab.md` | blank | 15 | **yes** |
| `featured.md` | featured | 20 | default (yes) |
| `publications.md` | pages | 21 | no |
| `talks.md` | blank (showcase shortcode, events) | 30 | **yes** |
| `skills.md` | featurette | 30 | no |
| `posts.md` | blank (tutorial-teaser shortcode) | 31 | **yes** |
| `projects.md` | blank (showcase shortcode, projects by lastmod) | 35 | **yes** |
| `experience.md` | experience | 40 | no |
| `people.md` | people | 50 | **yes** |
| `accomplishments.md` | accomplishments | 50 | no |
| `alumni-link.md` | blank | 51 | **yes** |
| `eventsOnline.md` | blank | 75 | no |
| `tags.md` | tag_cloud | 120 | no |
| `contact.md` | contact | 130 | default (yes) |
| `index.md` | (section index) | — | — |

Also in `content/home/`: `gallery/` (carousel images) and `websiteCover1.jpg`. ES and JA each have the active subset: `about, alumni-link, contact, featured, hero2-new, index, people, posts, projects, researchLab, talks` + `gallery/`.

### `assets/scss/custom.scss` — 3,436 lines, section map

| § | Topic | Line |
|---|---|---:|
| 0 / 0a | Scroll offset for fixed navbar; native dark `color-scheme` | 1 |
| 1 | Homepage fix (hero 2) | 17 |
| 2 | Global project breakout (`dashboards`) | 29 |
| 3 | Collapsible dashboard sections | 54 |
| 4 | Nightlights theme accent refinements | 71 |
| 5 / 7 | Navbar centering; brand/search overlap fix | 76 |
| 6 | Dark-section button styling | 116 |
| 8 | Gallery carousel | 134 |
| 9 | Mobile-friendly iframes | 221 |
| 10 | Full-width stacked post cards | 244 |
| 11 | Notebook-style post styling (code, figures, tables, blockquotes, headings) | 286 |
| 12 | Python syntax highlighting | 576 |
| 13 | Left-side Table of Contents | 591 |
| 14 | Image lightbox modal (14a–14h) | 670 |
| 15 | Dark-mode overrides (15a–15f) | 937 |
| 16–20 | Post card metadata; course grid; citation year color; back-to-top; toggle cards | 1158 |
| 21 | Native hero panels (`hero2-new`): Ken Burns bg, panels, title, subtitle, tagline, author, scroll indicator | 1375 |
| 12/13/12f | Tutorial gallery (layout, SVG placeholder, dark mode) | 1841 |
| 14 | Homepage tutorial teaser strip | 2469 |
| 22 | **Cinematic homepage layer** (22.0 tokens → 22.14 uppercase headings: glass cards, section headers, showcase rows, people, contact, navbar, footer, light-theme identity, mobile, projects grid) | 2506 |
| 23 | Mermaid dark-mode contrast fix | 3092 |
| 24 | Learning components (predict / solution / misconception / proof cards) | 3268 |

### Layout overrides (`layouts/`)

| File | Lines | Role |
|---|---:|---|
| `partials/custom_head.html` | 28 | default to dark theme on first visit |
| `partials/page_header.html` | 107 | featured image **above** title (image-first); `links:` buttons |
| `partials/site_footer.html` | 47 | cinematic footer (`.cz-footer`) |
| `partials/li_compact.html` | 240 | compact list item override |
| `partials/publication_showcase.html` | 86 | alternating rows on `/publication/` |
| `partials/project_card.html` | 22 | 16:9 captioned card for `/projects/` grid |
| `partials/event_card.html` | 22 | 16:9 card with talk date |
| `partials/tutorial_card.html` / `_auto.html` / `tutorial_placeholder.html` / `tutorial_topic_row.html` | 51 / 50 / 16 / 21 | `/post/` tutorial gallery cards and topic strips |
| `section/post.html` | 164 | Posts & Tutorials gallery (topics from `data/tutorial_topics.yaml`) |
| `section/projects.html` | 21 | Projects grid |
| `section/event.html` | 114 | Presentations showcase (uses `continue` → Hugo ≥ 0.96) |
| `section/publication.html` | 96 | fork of Wowchemy `fda9f39d872e` with filters on top + showcase |
| `post/single.html` | 240 | post single template |
| `shortcodes/showcase.html` | 59 | homepage Projects/Talks rows (projects sorted `.ByLastmod.Reverse`) |
| `shortcodes/tutorial-teaser.html` | 37 | homepage tutorial strip |
| `shortcodes/fullwidth-iframe.html`, `include-html.html`, `gallery-carousel.html` | 8 / 11 / 87 | embeds |
| `shortcodes/dashboard-gallery.html` / `dashboard-card.html` | 13 / 52 | dashboards gallery |
| `shortcodes/fwl-lab.html`, `panel-lab.html`, `did-lab.html` | 159 / 168 / 191 | interactive labs (+ `assets/js/*-lab.js`, `assets/css/*-lab.css`) |
| `index.headers` | — | Netlify `_headers` (CSP / Permissions-Policy) |

### Scripts and data

- `assets/js/`: `copy-code.js` (code copy button), `custom-scroll.js` (navbar anchor fix), `lang-pref.js` (language cookie), `mathjax-config.js` (`processEscapes`), `fwl-lab.js` / `panel-lab.js` / `did-lab.js`.
- `assets/css/`: `fwl-lab.css`, `panel-lab.css`, `did-lab.css`.
- `static/js/tutorial-gallery.js` (search + language chips on `/post/`).
- `data/themes/nightlights.toml` (color theme), `data/tutorial_topics.yaml` (gallery topics), `data/page_sharer.toml`.
- `assets/media/`: homepage background images `websiteCover{0,1,2,4,5,6}.{jpg,webp}`, `open-book.jpg`, `icon.png`.

### File manifest (git blob hashes, first 12 chars)

To check whether a file is unchanged later: `git rev-parse HEAD:<path>` should start with the hash below. Or diff against the tag (section 2D).

<details>
<summary>185 design-layer files — click to expand</summary>

```text
6511d44fe9a4  assets/css/did-lab.css
6627fef21045  assets/css/fwl-lab.css
4f66fea9d56f  assets/css/panel-lab.css
66a8acc21f8d  assets/js/copy-code.js
8fa0a2832d56  assets/js/custom-scroll.js
b726a3baef15  assets/js/did-lab.js
9e4c0379de67  assets/js/fwl-lab.js
7eee6d10518a  assets/js/lang-pref.js
7ba49ffcae7e  assets/js/mathjax-config.js
ac09894a874b  assets/js/panel-lab.js
e69de29bb2d1  assets/media/icon-pack/.gitkeep
0e9da1b6bcf9  assets/media/icon.png
a15444768437  assets/media/open-book.jpg
74bdcedace3e  assets/media/websiteCover0.jpg
802d0c33e5a7  assets/media/websiteCover0.webp
36ba1e2db80f  assets/media/websiteCover1.jpg
cf339f20f245  assets/media/websiteCover1.webp
2d025d91135e  assets/media/websiteCover2.jpg
a82be6c0f117  assets/media/websiteCover2.webp
06165cbe3cd5  assets/media/websiteCover4.jpg
2382ba6d2297  assets/media/websiteCover4.webp
d58f8f61104d  assets/media/websiteCover5.jpg
b391af8e4ecd  assets/media/websiteCover5.webp
741c1763c0c4  assets/media/websiteCover6.jpg
1bde74d7918b  assets/media/websiteCover6.webp
d85ac8c76d5e  assets/scss/custom.scss
2aab32134c42  config/_default/config.yaml
5294dadb275e  config/_default/languages.yaml
05de83402284  config/_default/menus.yaml
bea62fc15c75  config/_default/params.yaml
88dc73434fcc  content/es/home/about.md
2610435fb22a  content/es/home/alumni-link.md
faadbe3aa0da  content/es/home/contact.md
a04cf754d3cf  content/es/home/featured.md
c613d590981f  content/es/home/gallery/gallery/pic494-20260925.jpg
968bc9c86f8c  content/es/home/gallery/gallery/pic495-20250625.jpg
d355635f9603  content/es/home/gallery/gallery/pic496-20250929.jpg
1506b641779d  content/es/home/gallery/gallery/pic497-20250407.JPG
079c35c7c6db  content/es/home/gallery/gallery/pic498-20250407.jpg
8cd76274782e  content/es/home/gallery/gallery/pic499-20250325.jpg
6ce27e4b1a32  content/es/home/gallery/gallery/pic500-20240417.jpg
c8f77a13938a  content/es/home/gallery/gallery/pic501-20240325.jpg
ea03857a61dc  content/es/home/gallery/gallery/pic502-20230927b.jpg
29e85ccf8d9b  content/es/home/gallery/gallery/pic503-20230927.jpg
645b25feb081  content/es/home/gallery/gallery/pic504-20230727.jpg
4f6a3ec5ab82  content/es/home/gallery/gallery/pic505-20230713.jpg
56ab853998a8  content/es/home/gallery/gallery/pic506-20230712.jpg
1569a7eb0028  content/es/home/gallery/gallery/pic507-20230328.jpg
3f5c0a2bf7d3  content/es/home/gallery/gallery/pic508-20220804.jpg
b622d576704d  content/es/home/gallery/gallery/pic508-20230327.jpg
a1bc52a46b52  content/es/home/gallery/gallery/pic509-20220623.jpg
b402e2676147  content/es/home/gallery/gallery/pic510-20220325.jpg
2a38e9e4b452  content/es/home/gallery/gallery/pic511-20210325.jpg
c8c1b50e1529  content/es/home/gallery/index.md
b69930f53130  content/es/home/hero2-new.md
e452378ad609  content/es/home/index.md
1a2ea6e428f1  content/es/home/people.md
fa3950a9ae75  content/es/home/posts.md
7e9cb4e8a1d0  content/es/home/projects.md
669af84adae0  content/es/home/researchLab.md
41a0241411ec  content/es/home/talks.md
e2187dddce31  content/home/.DS_Store
7c5ac9b11eab  content/home/about.md
0c20fbf4bc1e  content/home/accomplishments.md
2e58491999bd  content/home/alumni-link.md
593587fe8605  content/home/contact.md
2451b6c7b2a4  content/home/demo.md
e8ae97215fbc  content/home/eventsOnline.md
3b4306b036da  content/home/experience.md
8f89ef7a86a7  content/home/featured.md
e2187dddce31  content/home/gallery/.DS_Store
c613d590981f  content/home/gallery/gallery/pic494-20260925.jpg
968bc9c86f8c  content/home/gallery/gallery/pic495-20250625.jpg
d355635f9603  content/home/gallery/gallery/pic496-20250929.jpg
1506b641779d  content/home/gallery/gallery/pic497-20250407.JPG
079c35c7c6db  content/home/gallery/gallery/pic498-20250407.jpg
8cd76274782e  content/home/gallery/gallery/pic499-20250325.jpg
6ce27e4b1a32  content/home/gallery/gallery/pic500-20240417.jpg
c8f77a13938a  content/home/gallery/gallery/pic501-20240325.jpg
ea03857a61dc  content/home/gallery/gallery/pic502-20230927b.jpg
29e85ccf8d9b  content/home/gallery/gallery/pic503-20230927.jpg
645b25feb081  content/home/gallery/gallery/pic504-20230727.jpg
4f6a3ec5ab82  content/home/gallery/gallery/pic505-20230713.jpg
56ab853998a8  content/home/gallery/gallery/pic506-20230712.jpg
1569a7eb0028  content/home/gallery/gallery/pic507-20230328.jpg
3f5c0a2bf7d3  content/home/gallery/gallery/pic508-20220804.jpg
b622d576704d  content/home/gallery/gallery/pic508-20230327.jpg
a1bc52a46b52  content/home/gallery/gallery/pic509-20220623.jpg
b402e2676147  content/home/gallery/gallery/pic510-20220325.jpg
2a38e9e4b452  content/home/gallery/gallery/pic511-20210325.jpg
c8c1b50e1529  content/home/gallery/index.md
44b15061fc14  content/home/hero.md
0dc55af4301f  content/home/hero2-new.md
3cc38f6a7a0d  content/home/hero2.md
7fa0d2aca37b  content/home/index.md
c9f7cec325a2  content/home/people.md
1cf4703963ba  content/home/posts.md
da455c919f8e  content/home/projects.md
9a59c1a6fbac  content/home/publications.md
57bf0cd3fdcd  content/home/researchLab.md
10170d7e299a  content/home/skills.md
8977357b5f5a  content/home/slider.md
aaa72158a73d  content/home/tags.md
f8c6298bdf7d  content/home/talks.md
36ba1e2db80f  content/home/websiteCover1.jpg
caf27b98a540  content/ja/home/about.md
daa4d9a941be  content/ja/home/alumni-link.md
116881bc1fee  content/ja/home/contact.md
d2b0d8116379  content/ja/home/featured.md
c613d590981f  content/ja/home/gallery/gallery/pic494-20260925.jpg
968bc9c86f8c  content/ja/home/gallery/gallery/pic495-20250625.jpg
d355635f9603  content/ja/home/gallery/gallery/pic496-20250929.jpg
1506b641779d  content/ja/home/gallery/gallery/pic497-20250407.JPG
079c35c7c6db  content/ja/home/gallery/gallery/pic498-20250407.jpg
8cd76274782e  content/ja/home/gallery/gallery/pic499-20250325.jpg
6ce27e4b1a32  content/ja/home/gallery/gallery/pic500-20240417.jpg
c8f77a13938a  content/ja/home/gallery/gallery/pic501-20240325.jpg
ea03857a61dc  content/ja/home/gallery/gallery/pic502-20230927b.jpg
29e85ccf8d9b  content/ja/home/gallery/gallery/pic503-20230927.jpg
645b25feb081  content/ja/home/gallery/gallery/pic504-20230727.jpg
4f6a3ec5ab82  content/ja/home/gallery/gallery/pic505-20230713.jpg
56ab853998a8  content/ja/home/gallery/gallery/pic506-20230712.jpg
1569a7eb0028  content/ja/home/gallery/gallery/pic507-20230328.jpg
3f5c0a2bf7d3  content/ja/home/gallery/gallery/pic508-20220804.jpg
b622d576704d  content/ja/home/gallery/gallery/pic508-20230327.jpg
a1bc52a46b52  content/ja/home/gallery/gallery/pic509-20220623.jpg
b402e2676147  content/ja/home/gallery/gallery/pic510-20220325.jpg
2a38e9e4b452  content/ja/home/gallery/gallery/pic511-20210325.jpg
c8c1b50e1529  content/ja/home/gallery/index.md
51ed407c6f69  content/ja/home/hero2-new.md
721934b97aac  content/ja/home/index.md
3c9243d6bdfd  content/ja/home/people.md
ec793f00df39  content/ja/home/posts.md
1a9e47100a11  content/ja/home/projects.md
aa1318bd1a42  content/ja/home/researchLab.md
fab110e841ba  content/ja/home/talks.md
e69de29bb2d1  data/fonts/.gitkeep
0bb29b98f90f  data/page_sharer.toml
e69de29bb2d1  data/themes/.gitkeep
87b2c771448f  data/themes/nightlights.toml
2da1f9cae055  data/tutorial_topics.yaml
389308e759ae  go.mod
2926ed4432f4  go.sum
aca4a05d2423  layouts/.DS_Store
b947be33183d  layouts/index.headers
68a40ef24059  layouts/partials/custom_head.html
138dd57914e8  layouts/partials/event_card.html
38ee2d373133  layouts/partials/li_compact.html
c381c6044e16  layouts/partials/page_header.html
a45c0a56228e  layouts/partials/project_card.html
bb57f52d9025  layouts/partials/publication_showcase.html
b8f7d27f8573  layouts/partials/site_footer.html
8e339778a294  layouts/partials/tutorial_card.html
2e93403d6890  layouts/partials/tutorial_card_auto.html
c52fbbd6a01a  layouts/partials/tutorial_placeholder.html
4141103fdc61  layouts/partials/tutorial_topic_row.html
a0a478459801  layouts/post/single.html
94d466f4facc  layouts/section/event.html
b783bc9e441e  layouts/section/post.html
21870cb32012  layouts/section/projects.html
426d416a65e7  layouts/section/publication.html
b94973128ffd  layouts/shortcodes/dashboard-card.html
bc0e95685df2  layouts/shortcodes/dashboard-gallery.html
34a31616bb16  layouts/shortcodes/did-lab.html
f0b8a53e3e1c  layouts/shortcodes/fullwidth-iframe.html
c525472465ed  layouts/shortcodes/fwl-lab.html
61f7b94be0db  layouts/shortcodes/gallery-carousel.html
5f56fc119e00  layouts/shortcodes/include-html.html
5becc081b0a3  layouts/shortcodes/panel-lab.html
e435b5ebb3c6  layouts/shortcodes/showcase.html
cad46b7bd73b  layouts/shortcodes/tutorial-teaser.html
70ebb21e5762  netlify.toml
3c4c10c42491  netlify/edge-functions/geo-lang.ts
d19cc4264f54  static/.DS_Store
ea11835893c8  static/js/tutorial-gallery.js
0833329522f6  static/media/CV.pdf
fdde290f45e7  static/media/boards.jpg
97d5c0552d33  static/media/canva-hero.jpg
abacf840597d  static/media/headers/bubbles-wide.jpg
b9616c61c4ed  static/media/hero.gif
a15444768437  static/media/open-book.jpg
20026ec7657c  static/post/2015-07-23-r-rmarkdown_files/figure-html/pie-1.png
e69de29bb2d1  static/uploads/.gitkeep
caf3ed86a3f0  static/uploads/python_pyfixest_tutorial.zip
c0f7fdb0d8f7  theme.toml
```

</details>

---

## 5. Repository shape at snapshot

- Tracked files: 13,562 (13,028 under `content/`). `.git` is 884 MB. The working folder is 8.5 GB, mostly untracked (section 6).
- Docs and tooling that are part of the restore point: `CLAUDE.md`, `README.md`, `.claude/` (18 skills + `docs/`), `logs/`, `scripts/` (incl. `i18n-parity.sh`), `update_wowchemy.sh`, `pyproject.toml` + `uv.lock`, `.python-version`.
- CV: sources in `content/cv/` (excluded from the Hugo build), published PDF `static/media/CV.pdf`.

---

## 6. NOT included in the restore point (untracked / gitignored)

Git does not store these, so restoring the tag/branch will **not** bring them back. They were deliberately left out of the backup because a design/layout update shouldn't touch them. Everything listed can be regenerated (venvs, Quarto caches, `public/`, `resources/`, LaTeX artifacts) or re-downloaded (reference PDFs) — except `.claude/settings.local.json` (local Claude Code permissions) and the hand-made reference notes, which exist only on this Mac.

| Size | Path |
|---:|---|
| 2.3G | `public/` (Hugo output — regenerated by every build) |
| 1.9G | `.venv/` (root Python env — `uv sync` recreates it from `uv.lock`) |
| 1.2G | `content/post/python_sc_bayes_spatial/references/.venv/` |
| 510M | `content/post/r_double_lasso/references/` |
| 145M | `content/post/r_sc_bayes_spatial/replication-package/` |
| 42M | `resources/` (Hugo image cache) |
| 18M | `content/post/python_mgwrfer/mgwpr_repo/` |
| 20K | `.claude/settings.local.json` |
| 1.8M | `content/cv/main.pdf` + `main.{aux,fdb_latexmk,fls,log,out}` (LaTeX artifacts) |
| ~81M | 53 smaller entries: reference PDFs/notes (`python_did_industrial_park`, `python_did_sc_tsunami`, `r_sc_multi_country`, `r_kuznets`, `stata_iv`, `stata_sdid_staggered`, `r_augsynth`, `r_sc_dsc_sdid`, `python_bridge_impact`), Quarto caches (`.quarto/`, `_freeze/`, `*_files/`, `tutorial.html`, `tutorial_cache/`), AhaSlides `payload.json` (bridge_impact, did101, fwl, panel_intro, sc_bayes_spatial), `__pycache__/`, `cache/`, `assets/jsconfig.json`, `stata.log`, `np_cs_bw.rds` |

Full list at snapshot time: `git status --ignored --porcelain` (67 entries).

---

## 7. Other branches at snapshot time (for reference)

| Branch | Commit | Date |
|---|---|---|
| `master` = `origin/master` | `59d321aa` | 2026-10-03 |
| `feat/python-fwl-upgrade` (local) | `7039bc92` | 2026-09-28 |
| `slides-dark-mode` (local + origin) | `70c154bf` | 2026-07-08 |
| `slides-dark-theme-takeaway` (local `650eb590`, origin `fac7d659`) | — | 2026-07-08 |
| `origin/dashboards-gallery-view` | `354c4666` | 2026-06-15 |
| `i18n-remaining-pages` (local + origin) | `a0b166cc` | 2026-06-05 |
| `i18n-auto-translate` (local + origin) | `756e6bb9` | 2026-06-04 |
| `origin/feature/spanish-i18n` | `2cf0d673` | 2026-06-04 |

No git tags existed before this snapshot. `pre-design-update-2026-10-03` is the first.
