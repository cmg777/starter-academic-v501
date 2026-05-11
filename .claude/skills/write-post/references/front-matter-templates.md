# Front Matter Templates

> This file is part of the `write-post` skill. Read this file when
> creating the YAML front matter for index.md.

## Python post front matter

```yaml
---
authors:
  - admin
categories:
  - Python
  - <Method category: e.g., Causal Inference, Machine Learning, Spatial Analysis>
date: "<YYYY-MM-DDT00:00:00Z>"
draft: false
featured: false
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
  - icon: code
    icon_pack: fas
    name: "Python script"
    url: script.py
  - icon: book
    icon_pack: fas
    name: "Jupyter notebook"
    url: notebook.ipynb
  - icon: open-data
    icon_pack: ai
    name: "[Python] Google Colab"
    url: https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_<slug>/notebook.ipynb
  - icon: markdown
    icon_pack: fab
    name: "MD version"
    url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_<slug>/index.md
slides:
summary: "<Single-line case study summary -- no line breaks>"
tags:
  - python
  - <method tag>
  - <domain tag>
title: "<Tutorial Title>"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---
```

## Stata post front matter

```yaml
---
authors:
  - admin
categories:
  - Stata
  - <Method category>
date: "<YYYY-MM-DDT00:00:00Z>"
draft: false
featured: false
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
  - icon: code
    icon_pack: fas
    name: "Stata do-file"
    url: analysis.do
  - icon: file-alt
    icon_pack: fas
    name: "Stata log"
    url: analysis.log
  - icon: markdown
    icon_pack: fab
    name: "MD version"
    url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_<slug>/index.md
slides:
summary: "<Single-line case study summary>"
tags:
  - stata
  - <method tag>
  - <domain tag>
title: "<Tutorial Title>"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---
```

## R post front matter

```yaml
---
authors:
  - admin
categories:
  - R
  - <Method category>
date: "<YYYY-MM-DDT00:00:00Z>"
draft: false
featured: false
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
  - icon: code
    icon_pack: fas
    name: "R script"
    url: analysis.R
  - icon: markdown
    icon_pack: fab
    name: "MD version"
    url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_<slug>/index.md
slides:
summary: "<Single-line case study summary>"
tags:
  - r
  - <method tag>
  - <domain tag>
title: "<Tutorial Title>"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---
```

## Front matter conventions

- **date:** Set to yesterday's date to avoid Hugo's future-post exclusion
- **image.placement: 3** -- forces full-width featured image above the title
- **toc: true** -- activates the left-side sticky table of contents
- **diagram: true** -- enables Mermaid diagram rendering (include even if unsure; harmless if no diagrams)
- **summary:** Must be a single-line string (no line breaks in YAML)
- **links:** Only include links to files that exist in the page bundle. Remove notebook/Colab links if no notebook was created. The final **MD version** entry is always included — it points to the post's own `index.md` on GitHub raw and lets readers view or save the source.
- **icon_pack values:** `fas` (Font Awesome solid), `fab` (Font Awesome brands), `ai` (Academicons)
- **No emojis** in any front matter field
