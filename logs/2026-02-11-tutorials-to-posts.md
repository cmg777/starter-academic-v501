# Tutorials Merged into Posts & Search/Filter Added

**Date:** 2026-02-11

## What Changed

1. **Merged all 27 tutorials into the posts section** — eliminated the separate `content/tutorials/` content type
2. **Moved two students to alumni** — Hussein Suleiman and Minh Thu moved to "Alumni doctoral graduates (sub advisor)"
3. **Added search and filter to the Posts & Tutorials listing page** — matching the publication page pattern

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

### Alumni Move

- `content/authors/SuleimanHussein/_index.md` — **MODIFIED**: `user_groups` changed to "Alumni doctoral graduates (sub advisor)"
- `content/authors/MinhThu/_index.md` — **MODIFIED**: `user_groups` changed to "Alumni doctoral graduates (sub advisor)"

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

### Alumni Move

Changed `user_groups` in two author `_index.md` files from "Doctoral students (sub advisor)" to "Alumni doctoral graduates (sub advisor)". No other changes needed — the People widget auto-groups by `user_groups`.

## Current Status

### Navigation Menu (10 items)
AboutMe, ResearchLab, Publications, Presentations, Projects, Students, Courses, Events, Posts & Tutorials, Contact

### Homepage Widgets (by weight)
1. Slider (1)
2. Hero2 banner (2)
3. About (10)
4. Research Lab (15)
5. Featured Publications (20)
6. Presentations (30)
7. Projects (35)
8. Gallery carousel (66)
9. Events/Calendar (75)
10. Posts & Tutorials (80)
11. Tag Cloud (120)
12. Contact (130)

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
