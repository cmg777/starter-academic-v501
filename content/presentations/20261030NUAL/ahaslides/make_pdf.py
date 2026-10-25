#!/usr/bin/env python3
"""../slides.pdf -> build/import.pdf: the image pages to import into AhaSlides.

    python3 make_pdf.py

Video pages are left out (they become YouTube slides in the editor). build/ is
gitignored and regenerable.
"""
from pathlib import Path

from pypdf import PdfReader, PdfWriter

from pages import N_PAGES, PDF, image_pages

HERE = Path(__file__).parent
reader = PdfReader(str(HERE / PDF))
assert len(reader.pages) == N_PAGES, f"expected {N_PAGES} pages, got {len(reader.pages)}"

writer = PdfWriter()
for p in image_pages():
    writer.add_page(reader.pages[p - 1])
out = HERE / "build"
out.mkdir(exist_ok=True)
path = out / "import.pdf"
with open(path, "wb") as f:
    writer.write(f)
mb = path.stat().st_size / 1e6
print(f"{path.name}: {len(image_pages())} pages ({mb:.1f} MB)")
assert mb < 9.5, "the browser upload tool takes at most 10 MB per file"
