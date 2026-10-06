#!/usr/bin/env python3
"""Rebuild the animated pages of the Canva deck as full-slide GIFs for AhaSlides.

    python3 animate_pages.py            # all pages in ANIMATIONS
    python3 animate_pages.py 8          # one page

The PDF export of the Canva deck freezes every animated GIF on its first frame.
Canva keeps the author's original GIF uploads as short MP4 clips; download them
from the design (see README.md) into build/clips/ with the names below.

For each animated page the script renders the page (1280x720, the size of an
imported AhaSlides slide), plays each clip inside its box, and keeps the page's
own pixels wherever something is drawn on top of the GIF (titles, banners,
labels). Those overlay pixels are found by comparing the page with the clip's
first frame, which is exactly what the PDF shows. The result is written to
build/animated/pageN.gif, ready to replace the static image in the editor.

Boxes are Canva coordinates on a 1920x1080 page, read from the design data:
(top, left, width, height) of the element frame, and the image inside it as an
offset (top, left) and size (width, height) relative to the frame. "keep" lists
the boxes (x0, y0, x1, y1, on the 1280x720 slide) of elements drawn over the
GIF; only there are page pixels restored. Elsewhere the PDF frame can differ
from the clip (labels that change, a different poster frame), and freezing
those pixels would garble the animation.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from pages import PDF

HERE = Path(__file__).parent
CLIPS = HERE / "build" / "clips"
OUT = HERE / "build" / "animated"
W, H = 1280, 720
K = W / 1920

ANIMATIONS = {
    8: {"fps": 10, "keep": [(86, 0, 1194, 90), (480, 652, 790, 720)],
        "elements": [
        ("lasVegas.mp4", (118.71, 137.31, 1645.39, 877.33), (0, 0, 1645.39, 877.33))]},
    9: {"fps": 10, "elements": [
        ("dubai.mp4", (222.19, 46.37, 863.34, 618.84), (0, 0, 863.34, 618.84)),
        ("carmen.mp4", (222.19, 909.70, 977.91, 618.84), (0, 0, 977.91, 618.84))]},
    14: {"fps": 10, "keep": [(70, 30, 520, 140), (110, 672, 450, 716)],
         "elements": [
        ("micro_regions.mp4", (7.71, 97.54, 1749.53, 1072.29),
         (0, -13.78, 1777.09, 1072.29))]},
    25: {"fps": 10, "elements": [
        ("educationRaster.mp4", (366.15, 28.51, 1439.93, 568.94),
         (0, 0, 1439.93, 568.94))]},
}
OVERLAY_THRESHOLD = 60   # max channel difference that marks an overlay pixel
OVERLAY_GROW = 5         # dilate the overlay mask by this many pixels
# Error diffusion makes every frame of a photo differ, which blows up the size
# of satellite clips; an ordered (bayer) dither keeps unchanged pixels stable.
DITHER = "bayer:bayer_scale=4"
STILL_THRESHOLD = 24     # per-pixel change below this is held from the last frame


def render_page(page, path):
    subprocess.run(["pdftoppm", "-png", "-scale-to-x", str(W), "-scale-to-y",
                    str(H), "-f", str(page), "-l", str(page), "-singlefile",
                    str(HERE / PDF), str(path.with_suffix(""))],
                   check=True, stderr=subprocess.DEVNULL)
    return Image.open(path).convert("RGB")


def frames(clip, fps, tmp):
    d = tmp / clip.stem
    d.mkdir()
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(clip), "-vf",
                    f"fps={fps}", str(d / "f%04d.png")], check=True)
    return sorted(d.glob("f*.png"))


def placement(frame_box, image_box):
    top, left, width, height = frame_box
    itop, ileft, iwidth, iheight = image_box
    fx0, fy0 = round(left * K), round(top * K)
    fx1, fy1 = round((left + width) * K), round((top + height) * K)
    ix0, iy0 = round((left + ileft) * K), round((top + itop) * K)
    iw, ih = round(iwidth * K), round(iheight * K)
    return (fx0, fy0, fx1, fy1), (ix0, iy0, iw, ih)


def paste(canvas, img, frame_rect, image_rect):
    """Paste img scaled into image_rect, clipped to frame_rect."""
    ix0, iy0, iw, ih = image_rect
    layer = img.convert("RGB").resize((iw, ih), Image.LANCZOS)
    fx0, fy0, fx1, fy1 = frame_rect
    crop = layer.crop((fx0 - ix0, fy0 - iy0, fx1 - ix0, fy1 - iy0))
    canvas.paste(crop, (fx0, fy0))


def build(page):
    spec = ANIMATIONS[page]
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        base = render_page(page, tmp / "page.png")
        clips = []
        for name, frame_box, image_box in spec["elements"]:
            fr, ir = placement(frame_box, image_box)
            clips.append((frames(CLIPS / name, spec["fps"], tmp), fr, ir))

        # Overlay mask: where the page differs from the clips' first frames.
        first = base.copy()
        for fs, fr, ir in clips:
            paste(first, Image.open(fs[0]), fr, ir)
        diff = np.abs(np.asarray(base, int) - np.asarray(first, int)).max(axis=2)
        inside = np.zeros_like(diff, dtype=bool)
        for x0, y0, x1, y1 in spec.get("keep", []):
            inside[y0:y1, x0:x1] = True
        mask = Image.fromarray((((diff > OVERLAY_THRESHOLD) & inside) * 255)
                               .astype("uint8"))
        mask = mask.filter(ImageFilter.MaxFilter(2 * OVERLAY_GROW + 1))

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
                # Hold pixels that barely changed, so the GIF encoder can
                # skip them (video compression noise otherwise repaints the
                # whole clip every frame).
                cur = np.asarray(canvas, int)
                still = np.abs(cur - prev).max(axis=2) < STILL_THRESHOLD
                cur[still] = prev[still]
                canvas = Image.fromarray(cur.astype("uint8"))
            prev = np.asarray(canvas, int)
            canvas.save(seq / f"s{i:04d}.png")

        out = OUT / f"page{page}.gif"
        fps = spec["fps"]
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i",
             str(seq / "s%04d.png"), "-filter_complex",
             "[0:v]split[a][b];[a]palettegen=stats_mode=diff:max_colors=256[p];"
             f"[b][p]paletteuse=dither={spec.get('dither', DITHER)}:diff_mode=rectangle",
             "-loop", "0", str(out)], check=True)
        print(f"page {page}: {n} frames at {fps} fps, {n / fps:.1f} s, "
              f"{out.stat().st_size / 1e6:.2f} MB, overlay "
              f"{(np.asarray(mask) > 0).mean():.1%} of the slide -> {out}")


if __name__ == "__main__":
    for p in (map(int, sys.argv[1:]) if sys.argv[1:] else ANIMATIONS):
        build(p)
