# Image-First Layout, Colab Badge Cleanup, and Partial Identification Notebook

**Date:** 2026-03-14

## Page header template override (`layouts/partials/page_header.html`)

Overrode the Wowchemy theme `page_header.html` to render the featured image **above** the title, metadata, and link buttons. The theme default places the title first, then the image.

### Changes from theme default
- Featured image `<div>` moved before the title/metadata `<div>`
- Removed `mt-4` margin class from image wrapper so it sits flush against the navbar
- No other template logic changed

## Image placement: full-width for all data science posts

Added `image.placement: 3` to front matter in all five data science posts:
- `content/post/python_ml_random_forest/index.md`
- `content/post/python_dowhy/index.md`
- `content/post/python_doubleml/index.md`
- `content/post/python_fwl/index.md`
- `content/post/python_partial_identification/index.md`

This makes Hugo use `Fit "2560x2560"` instead of `Resize "720x"`, rendering featured images at full width without blurry upscaling.

## Colab badge removal

Removed the inline `<a href="...colab..."><img src="...colab-badge.svg"...></a>` HTML from the body of four posts:
- `python_ml_random_forest`
- `python_dowhy`
- `python_doubleml`
- `python_fwl`

The Colab link is already available in the `links:` front matter section, which renders as metadata buttons below the title. The duplicate badge was redundant.

## Partial identification notebook

- Created `content/post/python_partial_identification/notebook.ipynb` — 46 cells (31 markdown + 15 code)
- Added Google Colab and Jupyter notebook links to the post's `links:` front matter

## Documentation updates

- Added page header override and `placement: 3` convention to `CLAUDE.md` and `README.md`
- Added `layouts/partials/` to the directory tree in `README.md`
