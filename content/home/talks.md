---
# An instance of the Pages widget.
# Documentation: https://wowchemy.com/docs/page-builder/
widget: pages

# This file represents a page section.
headless: true

# Order that this section appears on the page.
weight: 30

title: 'Recent & Upcoming Presentations'
subtitle:

content:
  # Page type to display. E.g. post, event, publication...
  page_type: event
  # Choose how many pages you would like to display (0 = all pages)
  count: 15
  # Filter on criteria
  filters:
    author: ""
    category: ""
    tag: ""
    exclude_featured: false
    exclude_future: false
    exclude_past: false
    publication_type: ""
  # Choose how many pages you would like to offset by
  offset: 0
  # Page order: descending (desc) or ascending (asc) date.
  order: desc

design:
  background:
    # Name of image in `assets/media/`.
    image: websiteCover5.jpg
    # Darken the image? Range 0-1 where 0 is transparent and 1 is opaque.
    image_darken: 0
    #  Options are `cover` (default), `contain`, or `actual` size.
    image_size: cover
    # Options include `left`, `center` (default), or `right`.
    image_position: center
    # Use a fun parallax-like fixed background effect on desktop? true/false
    image_parallax: true
    # Text color (true=light, false=dark, or remove for the dynamic theme color).
    text_color_light: true
  # Choose how many columns the section has. Valid values: 1 or 2.
  # Choose a view for the listings:
  #   1 = List
  #   2 = Compact
  #   3 = Card
  #   4 = Citation (publication only)
  view: 2
---
