# Tutorials to Posts, Alumni Page, and Events Redirect

**Date:** 2026-02-11

## What Changed

1. **Merged all 27 tutorials into the posts section** — eliminated the separate `content/tutorials/` content type
2. **Moved two students to alumni** — Hussein Suleiman and Minh Thu moved to "Alumni doctoral graduates (sub advisor)"
3. **Added search and filter to the Posts & Tutorials listing page** — matching the publication page pattern
4. **Separated alumni to dedicated `/alumni/` page** — homepage Students section shows only current students (14 people); alumni (26 people) displayed on a new widget page at `/alumni/`
5. **Removed Events widget from homepage** — deactivated the embedded lu.ma calendar; Events nav link now redirects to external `https://lu.ma/cmg`

## Files Modified / Created / Deleted

### Tutorials-to-Posts Migration

- `content/tutorials/*` (27 folders) — **MOVED** to `content/post/`
- Each tutorial `index.md` — **MODIFIED** to add `authors: [admin]`, `categories: [Tutorial]`, `draft: false`, `featured: false`
- `content/home/tutorials.md` — **DELETED** (homepage widget removed)
- `content/tutorials/_index.md` — **DELETED** (listing page removed)
- `content/tutorials/` — **DELETED** (empty directory)
- `content/home/posts.md` — **MODIFIED**: title "Posts & Tutorials", Compact view (2), callout linking to `/post/`
- `content/post/_index.md` — **MODIFIED**: title "Posts & Tutorials", Compact view (2)
- `config/_default/menus.yaml` — **MODIFIED**: removed Tutorials nav entry, renamed Posts to "Posts & Tutorials"
- `CLAUDE.md` — **MODIFIED**: updated content conventions
- `README.md` — **MODIFIED**: updated directory structure, widgets table, content conventions, adding content instructions

### Search & Filter

- `layouts/section/post.html` — **CREATED**: custom section template with Isotope.js search + filter UI

### Alumni Separation

- `content/home/people.md` — **MODIFIED**: removed 4 alumni user_groups, renamed title "Students and alumni" to "Students"
- `content/home/alumni-link.md` — **CREATED**: blank widget (weight 51) with callout "See the alumni here" linking to `/alumni/`
- `content/alumni/index.md` — **CREATED**: widget page wrapper (`type: widget_page`)
- `content/alumni/people.md` — **CREATED**: People widget showing 4 alumni user_groups
- `content/authors/SuleimanHussein/_index.md` — **MODIFIED**: `user_groups` changed to "Alumni doctoral graduates (sub advisor)"
- `content/authors/MinhThu/_index.md` — **MODIFIED**: `user_groups` changed to "Alumni doctoral graduates (sub advisor)"

### Events Redirect

- `content/home/eventsOnline.md` — **MODIFIED**: `active: true` changed to `active: false`
- `config/_default/menus.yaml` — **MODIFIED**: Events URL changed from `#eventsOnline` to `https://lu.ma/cmg`

## Technical Details

### Tutorials-to-Posts Migration

All 27 tutorial folders were moved from `content/tutorials/` to `content/post/`, keeping their original descriptive-slug folder names. Front matter was updated to include post-standard fields (`authors`, `categories`, `draft`, `featured`). All tutorials received `categories: [Tutorial]` for filtering.

The homepage now has a single "Posts & Tutorials" section (weight 80) using the `pages` widget with `count: 5` in Compact view. The separate Tutorials section (weight 70, `portfolio` widget) was removed.

**URL changes:** All tutorial URLs changed from `/tutorials/slug/` to `/post/slug/`.

### Search & Filter (`layouts/section/post.html`)

Custom Hugo section template that overrides the default post listing page. Generates the same HTML structure as Wowchemy's publication listing so the theme's bundled JavaScript (Isotope.js + Fuse.js) works without modification.

**Filter UI:**
- Text search input (`.filter-search`) — real-time text filtering via Fuse.js
- Category dropdown (`.pub-filters`, `data-filter-group="pubtype"`) — Demo, Post, Tutorial
- Year dropdown (`.pub-filters`, `data-filter-group="year"`) — dynamically collected from post dates

**Key implementation details:**
- Reuses `#container-publications` ID so Wowchemy's bundled JS initializes Isotope on this container
- Each item gets CSS classes: `isotope-item pubtype-{N} year-{YYYY}` matching the publication pattern
- Categories are sorted alphabetically and assigned stable numeric indices (`pubtype-1` = Demo, `pubtype-2` = Post, `pubtype-3` = Tutorial)
- All 30 items rendered on one page (no pagination) so Isotope filtering works across all items
- Items rendered in Compact view: thumbnail (150x150), title, summary, date, category badge

### Alumni Separation

Moved all alumni from the homepage Students section to a dedicated `/alumni/` page. The homepage People widget (`content/home/people.md`) now lists only 4 current student groups (14 people). Alumni (26 people across 4 groups) are displayed on a new widget page at `/alumni/`.

**Key technical details:**
- Widget pages outside the homepage must use `index.md` (leaf bundle), not `_index.md` (branch bundle), with `type: widget_page`
- The People widget renders markdown content BEFORE the people grid, so the "See the alumni here" callout was placed in a separate blank widget (`alumni-link.md`, weight 51) immediately after the People widget (weight 50)

Also moved Hussein Suleiman and Minh Thu from "Doctoral students (sub advisor)" to "Alumni doctoral graduates (sub advisor)".

### Events Redirect

Deactivated the Events widget on the homepage (embedded lu.ma calendar iframe) and changed the navigation bar Events link from the homepage anchor (`#eventsOnline`) to the external lu.ma page (`https://lu.ma/cmg`). The widget file is preserved (not deleted) with `active: false` in case it needs to be re-enabled later.

## Current Status

### Navigation Menu (10 items)
AboutMe, ResearchLab, Publications, Presentations, Projects, Students, Courses, Events (external: lu.ma/cmg), Posts & Tutorials, Contact

### Homepage Widgets (by weight)
1. Slider (1)
2. Hero2 banner (2)
3. About (10)
4. Research Lab (15)
5. Featured Publications (20)
6. Presentations (30)
7. Projects (35)
8. Students (50) — current students only
9. Alumni link callout (51)
10. Gallery carousel (66)
11. Posts & Tutorials (80)
12. Tag Cloud (120)
13. Contact (130)

### Standalone Pages
- `/alumni/` — widget page showing 26 alumni profiles across 4 groups

### Custom SCSS Sections (9 total)
1. Hero2 full-width fix
2. Full-width iframe breakout
3. Collapsible dashboard sections
4. Nightlights callout accent
5. Navbar menu centering
6. Dark-section button styling
7. Navbar brand/search overlap fix
8. Gallery carousel styling
9. Mobile-friendly iframes and embeds

### Custom Layouts
- `layouts/shortcodes/fullwidth-iframe.html` — full-viewport-width iframe
- `layouts/shortcodes/gallery-carousel.html` — Bootstrap Carousel from page bundle images
- `layouts/section/post.html` — Posts & Tutorials listing with search + filter
