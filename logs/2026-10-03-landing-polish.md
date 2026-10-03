# Final homepage layout polish

Refined the cinematic homepage after the content and section order were approved.

- Reduced the oversized hero and section gaps while retaining comfortable spacing.
- Corrected the biography image's intrinsic-height bug: it now scales proportionally instead of retaining a 760px display height at narrower widths.
- Balanced the globe and opening copy, increased supporting text sizes, and aligned the research card links.
- Made the lab directory more consistent, with centered circular portraits and aligned name areas.
- Reduced the gallery's excess height and matched its heading layout to the other sections.
- Arranged the contact introduction and details in aligned desktop columns, with a stacked mobile layout.
- Collapsed navigation below 1200px and enlarged the mobile menu control to keep all ten original links usable.

The shared templates apply to English, Spanish, and Japanese. Existing copy, section order, links, colors, globe behavior, and the manual carousel starting at photo 6 were preserved.

## Verification

- Built successfully with Hugo Extended 0.111.3, `--minify --buildFuture`, into `/private/tmp/carlos-landing-preview`. The existing Wowchemy `.Path` deprecation warning remains.
- Checked all three languages at widths 320, 390, 768, 1024, 1200, and 1440px: no document or headline horizontal overflow.
- Verified desktop navigation spacing at 1200px in all three languages and opened the mobile menu to confirm all ten links are accessible.
- Verified ten circular lab portraits, nineteen carousel photos, default photo 6, and the approved section order in all eighteen responsive cases.
- Exercised globe pause/resume and region selection, plus carousel next/previous (6 → 7 → 6).
- Visually reviewed desktop and mobile layouts, including the hero, research cards, portrait, lab directory, gallery, and contact section.

No deployment was performed. Unrelated work in `content/post/python_did101/` was left untouched.

## Circular profile portrait

At the user's request, changed Carlos's homepage portrait to a centered 640×640 image with a circular CSS mask, matching the student portraits. Centered its coordinate caption below the circle. Confirmed 370×370 desktop and 260×260 mobile rendering in all three languages, with no horizontal overflow. Hugo 0.111.3 build passed; desktop and mobile crops were visually checked.

## Closer portrait and expanded biography

- Increased the portrait to 420px on wide screens and 280px on mobile, with proportional shrinking on smaller screens.
- Centered the biography within a 1100px maximum width and reduced the actual desktop portrait-to-text gap from approximately 157px to 56px. The tablet gap is 40px; the stacked mobile gap is 20px. Tablet portraits align with the start of the biography.
- Added the user's supplied education in Bolivia, Chile, and Japan, consulting experience with Pro-Mujer International, the World Bank, DANIDA, and JICA, and four current research areas. Kept the introduction focused on the integration of development economics, spatial data science, and applied econometrics.
- Added complete Spanish and Japanese versions. Research areas use two columns on desktop and one on tablet/mobile.
- Hugo 0.111.3 build passed. Checked all three languages at 320, 768, and 1440px for circular portraits, complete biography content, four research areas, and no horizontal overflow; visually reviewed English desktop, tablet, and 390px mobile layouts.

## Mission and research question wording

Replaced the English research heading with “Why do subnational regions follow different development paths?” and the hero paragraph with the user's exact “Our mission…” wording about integrating spatial data science, machine learning, and development economics. Updated the Spanish and Japanese translations. Removed the research heading's fixed line break so the longer question wraps naturally. Hugo build passed; the new paragraph and question fit without horizontal overflow at 320, 768, and 1440px in all three languages.

## Shorter profile and three research areas

Removed the education and consulting paragraph from the homepage profile in all three languages, including its template markup and unused styles. Replaced the four research areas with the user's three items, in the requested order: geospatial inequality, poverty, and growth interactions; geospatial big data analytics and impact evaluation; regional infrastructure and spatial structural change. Displayed the three items as a consistent single-column list. Hugo build passed; verified the removed paragraph, exact English wording, translated lists, and absence of overflow on 390px and 1440px layouts. The circular portrait remains in place pending a decision on the subsequently discussed vertical portrait option.

## Approved vertical portrait

Applied the user's approved 4:5 portrait recommendation with an explicit centered 640×800 Hugo crop and an 8px corner radius. Kept the established close spacing beside the biography. The image renders at 420×525px on wide screens and up to 280×350px on mobile, centered above the text. Student portraits remain circular.

Hugo 0.111.3 build passed. Verified the 4:5 ratio, rounded corners, ten circular student portraits, and no horizontal overflow in English, Spanish, and Japanese at widths 320, 390, 768, and 1440px. Visually checked the full crop and surrounding biography on desktop and mobile; confirmed the mobile AboutMe link closes the menu and scrolls to the profile.

## Recent research

Renamed the publication section to “Recent research,” with matching Spanish and Japanese headings. Replaced the fixed satellite-paper selection with the three latest academic papers from each locale's publication records, sorted by publication date. The selection includes conference papers, journal articles, and preprints (types 1–3), excluding books and future-dated entries.

Current selection, newest first:

1. **2026-05-28** — Okun's law and spatial regimes in Indonesia: A machine learning approach (*Economic Modelling*).
2. **2026-02-16** — Minimum wage differentials and commuting across districts (*Asia-Pacific Journal of Regional Science*).
3. **2025-10-06** — Mapping the dimensions of poverty through big data, socioeconomic surveys and machine learning in Cambodia (*Social Indicators Research*).

Hugo 0.111.3 build passed. Checked the exact three publication links and ordering in all three languages at 390px and 1440px, with no horizontal overflow. Recent presentations remains immediately after this section. Updated CLAUDE.md to document the automatic selection rule.

## Research and presentation thumbnails

- Added a shared thumbnail partial that creates optimized WebP previews from each paper's or presentation's featured image. Preserves the complete image instead of cropping diagrams or slide titles; loads thumbnails lazily with explicit dimensions.
- Desktop rows show 160×90px thumbnails. Mobile rows use 96×54px thumbnails beside the journal/date, with titles below at a comfortable full width. Missing-image rows retain a text layout.
- Matched presentation titles to publication titles using the same font size, weight, line height, and letter spacing. Sizes are 27px on wide desktop screens, 20px at the tested tablet width, and 21px on mobile.
- Kept the existing selected papers, presentation dates/TBA label, links, and ordering.

Hugo 0.111.3 build passed. Checked all three languages at 320, 390, 768, and 1440px: three research thumbnails and three presentation thumbnails, matching title typography, and no horizontal overflow. Confirmed all eighteen generated thumbnail files exist; the six thumbnails total about 118 KiB per language. Visually reviewed desktop and mobile rows.
