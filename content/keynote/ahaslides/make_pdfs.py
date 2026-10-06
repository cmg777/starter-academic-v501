#!/usr/bin/env python3
"""build/<lang>/pNN.png (capture.mjs) -> build/<lang>.pdf, the file imported in
the AhaSlides editor ("Import slides").

The video pages are left out: each becomes a YouTube slide at the same
position. Pages are downscaled from the 3840x2160 capture to 1920x1080 JPEG,
which keeps each PDF under the 10 MB limit of the browser upload tool.
"""
from pathlib import Path

from PIL import Image

from pages import DECKS, image_pages

HERE = Path(__file__).parent
LIMIT = 9.5e6
QUALITY = 92

for lang in DECKS:
    frames = [Image.open(HERE / "build" / lang / f"p{page:02d}.png")
              .convert("RGB").resize((1920, 1080), Image.LANCZOS)
              for page in image_pages(lang)]
    out = HERE / "build" / f"{lang}.pdf"
    frames[0].save(out, save_all=True, append_images=frames[1:], resolution=144,
                   quality=QUALITY)
    size = out.stat().st_size
    print(f"{lang}: {len(frames)} pages, {size / 1e6:.1f} MB -> {out.name}")
    if size > LIMIT:
        raise SystemExit(f"{out.name} is over {LIMIT / 1e6:g} MB")
