# 2026-11-20 — GDO-Bolivia links and the geo4bolivia software page

The observatory's repository was split on 2026-11-20: the observatory (data, notebooks, website) moved to `quarcs-lab/gdo4bolivia` (https://quarcs-lab.github.io/gdo4bolivia/), and `quarcs-lab/geo4bolivia` now holds only the Python package (0.6.0 on PyPI) and its documentation site (https://quarcs-lab.github.io/geo4bolivia/). The old observatory address now serves the package documentation.

- `data/gdo-bolivia` (EN/ES/JA):
  - **Links:** the Website button, `url_code`, the body links and the citation now point to gdo4bolivia, and a new "Package docs" button points to the package documentation.
  - **Coverage table:** rewritten for the current data, the SDG Atlas of Bolivia 2026 (343 municipalities, ~2012 and ~2024, 15 goals, 81 indicators) and the `municipalities343-*` indicator pages (the `municipalities339-*` pages no longer exist).
  - **"Start an analysis":** now describes geo4bolivia 0.6 and its documentation.
- New `software/geo4bolivia` (EN/ES/JA):
  - **Links:** documentation, PyPI, Colab quick start, reference, observatory and GitHub.
  - **Body:** the families of analyses with links to the documentation's articles, installation with extras, and one example (`geo.lisa`).
  - **Image:** `featured.webp` is the package's AI-generated hero (no map), cropped to 16:9.
- **Checks:**
  - Hugo 0.111.3 build passed and `i18n-parity` reports 0 missing.
  - `audit-site.py`: its only findings are the 6 broken references inside `post/python_dynamic_panel/referenceMaterials`, which this change did not touch.
  - Every new external link returns 200.

## Later the same day: new geo4bolivia hero

- The three `software/geo4bolivia/featured.webp` files are the package's new hero (spatial data science elements plus the SDG colour wheel), cropped to 16:9.
