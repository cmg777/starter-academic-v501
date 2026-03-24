# Companion Deliverables

> This file is part of the `data-science-post` skill. If you update this
> content, also update the summary in SKILL.md. Read this file when
> creating script.py, notebook.ipynb, or deciding about featured images.

## script.py (optional)

If the post warrants a standalone script, create
`content/post/python_<topic-slug>/script.py`:

```python
"""
<Tutorial Title>: <Topic> Case Study

<One-paragraph description>

Usage:
    python script.py

References:
    - <URL 1>
    - <URL 2>
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# ... full analysis pipeline ...
```

Include in front matter links:

```yaml
- icon: code
  icon_pack: fas
  name: "Python script"
  url: script.py
```

## notebook.ipynb (optional)

If the post would benefit from a companion Jupyter notebook, create
`content/post/python_<topic-slug>/notebook.ipynb` (nbformat 4, Python 3 kernel).

Structure the notebook as alternating markdown cells (explanations) and code
cells (matching the blog post code blocks). The notebook should be runnable
end-to-end in Google Colab.

**IMPORTANT:** LaTeX in Jupyter notebooks does **NOT** need Goldmark escaping.
Use raw `_` for subscripts, `\,` for thin space, `\%` for percent, etc.
The escaping rules in `references/latex-escaping.md` apply only to `index.md`.

Include the notebook in front matter links:

```yaml
- icon: book
  icon_pack: fas
  name: "Jupyter notebook"
  url: notebook.ipynb
```

If the notebook is pushed to the GitHub repo, add a Colab link:

```yaml
- icon: open-data
  icon_pack: ai
  name: "[Python] Google Colab"
  url: https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_<topic-slug>/notebook.ipynb
```

## Featured image

Do **not** generate a `featured.png`. The user will manually add a featured
image to the page bundle later. The script should not copy or create
`featured.png`.
