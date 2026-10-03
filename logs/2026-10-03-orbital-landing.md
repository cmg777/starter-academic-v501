# Cinematic Earth-at-night landing page

## Agreed direction

The landing page serves researchers and students interested in understanding
regional development through satellite data. The user chose a dark, atmospheric,
futuristic scientific design with a globe showing real nighttime luminosity,
authentic NASA imagery with its year identified, and English, Spanish, and
Japanese support. They delegated layout, motion, scope, and framework choice.

## Implementation

- Kept Hugo 0.111.3 and existing Netlify publishing. A standalone `layouts/index.html`
  supplies the homepage without loading Wowchemy's legacy CSS/JS dependencies.
  Content pages and their URLs remain Hugo-generated.
- Added a dependency-free WebGL sphere projection of NASA's Black Marble 2016
  composite. Controls support region selection, drag, arrow keys, zoom, and pause.
  The atmosphere and orbital ring are decorative; light positions come from NASA.
- Added a 94 KiB mobile texture and a Hugo-optimized 53 KiB static globe fallback.
  The larger desktop map is 761 KiB. Imagery sources are recorded in
  `static/media/orbital/CREDITS.txt` and attributed on the page.
- Rendering caps device pixel ratio and canvas size, targets at most 30 fps,
  suspends offscreen/background work, and starts static for reduced motion.
  Failed image loads or unavailable/lost WebGL leave the static image visible.
- Reworked research discovery, selected satellite-data publications, projects,
  tutorials, researcher profile, student community, presentations, and contact.
  Research maps now have explicit links instead of loading three embedded apps.
- Translations and interface text live together in `data/orbital.json`. Existing
  localized content feeds cards and the full student directory. The former
  People widget remains the authoritative student-group configuration.
- Retained language preference cookies and reciprocal canonical/hreflang metadata.
- Existing unrelated edits under `content/post/python_did101/` were not modified.

## Verification

- Production-style Hugo build with `--minify --buildFuture` passes for EN/ES/JA.
  The theme still reports its pre-existing `.Path` deprecation warning.
- Eight Node behavioral tests pass: WebGL unavailable, image load failure, mobile
  and data-saver texture selection, automatic rotation/pause, reduced motion,
  region selection, keyboard rotation, offscreen/background suspension, changing
  motion preference, and context loss. Run `node --test tests/orbital.test.cjs`.
- In-browser layout checks at 320, 390, 768, and 1440 CSS pixels in all three
  languages show no horizontal or headline overflow. Mobile ES/JA visually checked.
- Real browser checks cover mobile navigation, region selection, pause state,
  console errors, and a static copy of the rendered HTML with scripts removed.
- Local links and assets on all three homepages resolve; each page has one h1,
  no duplicate IDs, and alt attributes on every image.
- Homepage runtime: two local scripts, approximately 8 KiB combined before gzip;
  a separate roughly 21 KiB stylesheet. Offscreen card/profile images are lazy.

## Delivery

Changes are local and uncommitted. The task did not request publication; no push
or deployment was performed. A local preview is served at http://127.0.0.1:8765/.
The legacy widget files are retained, but no longer control homepage layout.
See the README's Cinematic landing page section for maintenance entry points.
