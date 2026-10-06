#!/usr/bin/env python3
"""../intro-regional.pdf -> build/part{1,2,3}.pdf, the PDFs to import into AhaSlides.

    python3 make_part_pdfs.py

Each part PDF holds that part's pages in order, without the video pages (those
become YouTube slides in the editor). build/ is gitignored and regenerable.
"""
from pathlib import Path

from pypdf import PdfReader, PdfWriter

from pages import N_PAGES, PARTS, PDF, image_pages

HERE = Path(__file__).parent
reader = PdfReader(str(HERE / PDF))
assert len(reader.pages) == N_PAGES, f"expected {N_PAGES} pages, got {len(reader.pages)}"

MAX_MB = 9.5   # the browser upload tool takes at most 10 MB per file


def write(pages, path):
    writer = PdfWriter()
    for p in pages:
        writer.add_page(reader.pages[p - 1])
    with open(path, "wb") as f:
        writer.write(f)
    return path.stat().st_size / 1e6


out = HERE / "build"
out.mkdir(exist_ok=True)
for part in PARTS:
    pages = image_pages(part)
    path = out / f"part{part}.pdf"
    mb = write(pages, path)
    print(f"{path.name}: {len(pages)} pages ({mb:.1f} MB) = {pages}")
    if mb > MAX_MB:
        # Too big for one upload: split in two halves, imported one after the
        # other (select the last slide of the first import before the second).
        half = len(pages) // 2
        for tag, chunk in (("a", pages[:half]), ("b", pages[half:])):
            p = out / f"part{part}{tag}.pdf"
            print(f"  {p.name}: {len(chunk)} pages ({write(chunk, p):.1f} MB) "
                  f"= {chunk}")
