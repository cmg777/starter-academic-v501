# Conditional compact view: cards for posts, classic list for talks

**Date:** 2026-03-14

## Summary

The `li_compact.html` template now renders conditionally based on content type:

- **Posts** (`type == "post"`): Full-width stacked cards with 800px images on top, title and summary below, teal accent border. Uses `.post-card` CSS class.
- **Everything else** (events, publications, projects): Classic Wowchemy compact layout with small 350px thumbnails on the right, metadata (dates, location, authors) below the title. Uses `.media` CSS class.

## Why

The previous commit (dd0ce44) redesigned `li_compact.html` to use stacked cards for all content types. This made the "Recent & Upcoming Presentations" section show oversized featured images, which looked poor for talk listings that benefit from a dense, scannable format.

## Files modified

- `layouts/partials/li_compact.html` — Added `{{ if eq $item.Type "post" }}` conditional to branch between card and classic layouts
