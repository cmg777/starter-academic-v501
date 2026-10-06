#!/usr/bin/env python3
"""Rebuild the GIF pages of the keynotes as full-slide animated GIFs.

    python3 animate_pages.py              # every GIF page of every language
    python3 animate_pages.py en           # one language

Adapted from content/courses/slides/ahaslides/animate_pages.py, which documents
the method. Two differences:

- The base page is the Canva capture (build/<lang>/pNN.png, from capture.mjs),
  taken with the GIF paused on its first frame, not a PDF render.
- The base shows the same first frame as the clip, so elements drawn over the
  GIF (banners, titles) are the pixels that differ from the first composite.
  The comparison is still limited to "keep" boxes around those elements: the
  Canva render and the rescaled clip differ slightly along every sharp edge
  (coastlines, the chart labels of the McKinsey clip), and freezing those
  pixels would garble the animation. The boxes are wide enough for the
  English, Spanish and Japanese titles.

The clips are the MP4 files Canva keeps for the author GIF uploads, already
downloaded for the course deck into content/courses/slides/ahaslides/build/clips/
(gitignored there too). The GIF elements and their boxes are identical in the
three keynotes; only their page numbers differ (pages.TOPICS).
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from pages import DECKS, TOPICS

HERE = Path(__file__).parent
CLIPS = HERE.parent.parent / "courses" / "slides" / "ahaslides" / "build" / "clips"
OUT = HERE / "build" / "animated"
W, H = 1280, 720
K = W / 1920

# topic -> "clips" as (file, frame box (top, left, w, h), image box (offset
# top, offset left, w, h)) in Canva coordinates on a 1920x1080 page, and
# "keep" boxes (x0, y0, x1, y1) on the 1280x720 slide.
ANIMATIONS = {
    "las_vegas": {
        "clips": [("lasVegas.mp4", (118.71, 137.31, 1645.39, 877.33),
                   (0, 0, 1645.39, 877.33))],
        "keep": [(0, 0, 1280, 95), (0, 650, 1280, 720)]},     # the two banners
    "dubai_carmen": {
        "clips": [("dubai.mp4", (222.19, 46.37, 863.34, 618.84),
                   (0, 0, 863.34, 618.84)),
                  ("carmen.mp4", (222.19, 909.70, 977.91, 618.84),
                   (0, 0, 977.91, 618.84))],
        "keep": []},                                          # nothing on top
    "mckinsey": {
        "clips": [("micro_regions.mp4", (0, 170.47, 1749.53, 1072.29),
                   (0, -13.78, 1777.09, 1072.29))],
        "keep": [(113, 0, 600, 150), (113, 670, 940, 720)]},  # title, source
}
FPS = 10
OVERLAY_THRESHOLD = 60   # max channel difference that marks an overlay pixel
OVERLAY_GROW = 3         # dilate the overlay mask by this many pixels
DITHER = "bayer:bayer_scale=4"
STILL_THRESHOLD = 24     # per-pixel change below this is held from the last frame


def frames(clip, tmp):
    d = tmp / clip.stem
    d.mkdir()
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(clip), "-vf",
                    f"fps={FPS}", str(d / "f%04d.png")], check=True)
    return sorted(d.glob("f*.png"))


def placement(frame_box, image_box):
    top, left, width, height = frame_box
    itop, ileft, iwidth, iheight = image_box
    fr = (round(left * K), round(top * K), round((left + width) * K),
          round((top + height) * K))
    ir = (round((left + ileft) * K), round((top + itop) * K), round(iwidth * K),
          round(iheight * K))
    return fr, ir


def paste(canvas, img, frame_rect, image_rect):
    """Paste img scaled into image_rect, clipped to frame_rect."""
    ix0, iy0, iw, ih = image_rect
    layer = img.convert("RGB").resize((iw, ih), Image.LANCZOS)
    fx0, fy0, fx1, fy1 = frame_rect
    canvas.paste(layer.crop((fx0 - ix0, fy0 - iy0, fx1 - ix0, fy1 - iy0)),
                 (fx0, fy0))


def build(lang, topic, preview=False):
    page = TOPICS[topic][lang]
    base = Image.open(HERE / "build" / lang / f"p{page:02d}.png").convert(
        "RGB").resize((W, H), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        clips = [(frames(CLIPS / f, tmp), *placement(fb, ib))
                 for f, fb, ib in ANIMATIONS[topic]["clips"]]

        first = base.copy()
        for fs, fr, ir in clips:
            paste(first, Image.open(fs[0]), fr, ir)
        diff = np.abs(np.asarray(base, int) - np.asarray(first, int)).max(axis=2)
        inside = np.zeros_like(diff, dtype=bool)
        for x0, y0, x1, y1 in ANIMATIONS[topic]["keep"]:
            inside[y0:y1, x0:x1] = True
        mask = Image.fromarray((((diff > OVERLAY_THRESHOLD) & inside) * 255)
                               .astype("uint8"))
        mask = mask.filter(ImageFilter.MaxFilter(2 * OVERLAY_GROW + 1))
        if preview:
            Image.composite(Image.new("RGB", (W, H), "magenta"), first,
                            mask).save(OUT / f"{lang}_p{page}_mask.png")

        n = max(len(fs) for fs, _, _ in clips)
        seq = tmp / "seq"
        seq.mkdir()
        prev = None
        for i in range(n):
            canvas = base.copy()
            for fs, fr, ir in clips:
                paste(canvas, Image.open(fs[i % len(fs)]), fr, ir)
            canvas.paste(base, (0, 0), mask)      # overlays stay on top
            if prev is not None:
                cur = np.asarray(canvas, int)
                still = np.abs(cur - prev).max(axis=2) < STILL_THRESHOLD
                cur[still] = prev[still]
                canvas = Image.fromarray(cur.astype("uint8"))
            prev = np.asarray(canvas, int)
            canvas.save(seq / f"s{i:04d}.png")

        out = OUT / f"{lang}_p{page}.gif"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i",
             str(seq / "s%04d.png"), "-filter_complex",
             "[0:v]split[a][b];[a]palettegen=stats_mode=diff:max_colors=256[p];"
             f"[b][p]paletteuse=dither={DITHER}:diff_mode=rectangle",
             "-loop", "0", str(out)], check=True)
        print(f"{lang} p{page} ({topic}): {n} frames, {n / FPS:.1f} s, "
              f"{out.stat().st_size / 1e6:.2f} MB, overlay "
              f"{(np.asarray(mask) > 0).mean():.1%} -> {out.name}")


if __name__ == "__main__":
    preview = "--preview" in sys.argv
    langs = [a for a in sys.argv[1:] if a in DECKS] or list(DECKS)
    for lang in langs:
        for topic in ANIMATIONS:
            build(lang, topic, preview)
