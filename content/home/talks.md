---
# Blank widget: renders the 5 latest events as alternating image/text
# "showcase" rows via the `showcase` shortcode — matching the Projects look
# (larger images, sequential image + text).
widget: blank

# Activate this widget? true/false
active: true

# This file represents a page section.
headless: true

# Order that this section appears on the page.
weight: 30

title: 'Recent & Upcoming Presentations'
subtitle:

design:
  # Full-width heading band.
  columns: '1'
---

{{< showcase type="event" count="5" browse_url="/event/" browse_label="Browse all presentations" >}}
