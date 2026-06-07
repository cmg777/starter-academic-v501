---
# Blank widget: renders the 3 latest projects as alternating image/text
# "showcase" rows via the `showcase` shortcode, plus a "Browse all projects"
# link to the /projects/ gallery.
widget: blank

# Activate this widget? true/false
active: true

# This file represents a page section.
headless: true

# Order that this section appears on the page.
weight: 35

title: Projects
subtitle: ''

design:
  # Full-width heading band.
  columns: '1'
---

{{< showcase type="project" count="3" browse_url="/projects/" browse_label="Browse all projects" >}}
