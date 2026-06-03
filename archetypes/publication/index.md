---
# Carlos Mendez publication archetype.
# Used when you run: hugo new content/publication/<slug>/index.md
# Tip: add a `featured.jpg`, `featured.png`, or `featured.webp` to this folder
# so the publication shows an image on /publication/. Without one, the page
# falls back to a Font Awesome icon picked from `publication_types[0]`.

title: "{{ replace .Name "-" " " | title }}"
authors:
- admin

date: {{ .Date }}
# Schedule page publish date (NOT the publication's date).
publishDate: {{ .Date }}

# DOI accepts either a bare "10.xxxx/xxxx" string or a full
# "https://doi.org/10.xxxx/xxxx" URL — the showcase template auto-prefixes
# bare DOIs to a valid https://doi.org/ link.
doi: ""

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Venue / journal / conference name. Wrap the actual name in *italics* so
# the showcase row and citation list render it correctly.
publication: "*Journal Name*"
publication_short: ""

abstract: ""

# Summary. An optional shortened abstract shown in card / list views.
summary: ""

tags: []
categories: []
featured: false

# Custom link buttons (optional). Icons: https://fontawesome.com/search
# links:
# - name: "Published article"
#   url: "https://doi.org/10.xxxx/xxxxx"
#   icon_pack: fas
#   icon: university
# - name: "AI Podcast"
#   url: "https://example.com/podcast"
#   icon_pack: fas
#   icon: headphones

url_pdf: ""
url_code: ""
url_dataset: ""
url_preprint: ""
url_poster: ""
url_project: ""
url_slides: ""
url_source: ""
url_video: ""

# Featured image.
# To use, add an image named `featured.jpg`, `featured.png`, or `featured.webp`
# to this page's folder. Focal points: Smart, Center, TopLeft, Top, TopRight,
# Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Associated projects (optional). Enter project folder names (no extension),
# e.g. projects: ["convergence", "clusters"]. Otherwise leave empty.
projects: []

# Associated slide deck (optional). Enter the deck's filename without extension,
# e.g. slides: "example" references content/slides/example/index.md.
slides: ""
---
