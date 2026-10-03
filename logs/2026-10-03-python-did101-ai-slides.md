# 2026-10-03 — python_did101: AI slides PDF

Fifth step of bringing `content/post/python_did101/` up to the `python_fwl` feature set. Still to
do: the Quarto bundle update (`tutorial.qmd`, `notebook.ipynb`, `python_did101.zip` do not yet
include the lab, cheat sheets, data and `analysis.do`, and their section numbers stop at the
pre-lab numbering).

- The author supplied `slides/ai-slides.pdf` (13 pages, 1376 × 768 pt, image-only, Gemini Notebook
  generated, 1.5 MB). Linked as **"AI Slides (PDF)"** (`fas file-pdf`) right after "Slides (HTML)",
  with the absolute URL `https://carlos-mendez.org/post/python_did101/slides/ai-slides.pdf`, as in
  `python_fwl` (opens in a new tab). The production build copies it byte-identical to
  `/post/python_did101/slides/ai-slides.pdf`.
- All 13 pages reviewed against `execution_log.txt`. Every number matches (36.20, 10.88, 25.32,
  25.315, 25.328, 43%, the 2×2 means, SEs 0.607 / 0.585 / 0.585 / 0.637, female_share −3.216 (8.700),
  the event-study coefficients, R² 0.995).
- **Not changed (image PDF; flagged to the author):** page 8 labels the pre-treatment periods
  "lags" and the post-treatment periods "leads", the reverse of the post's (standard) usage; page 4
  prints the parallel-trends formula as raw LaTeX (`Y_{i,1}(0)`); page 6 says t ≈ 40 (25.315 / 0.585
  ≈ 43).
