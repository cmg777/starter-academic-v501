# NUAL keynote — AhaSlides deck

Built the interactive AhaSlides version of the 2026-10-30 keynote (`content/presentations/20261030NUAL/slides.pdf`, 34-page Canva export): presentation `10482865` (folder Website, theme Meeting, language English, join code `MKY1F`).

- 30 image slides imported from the PDF with the video pages removed. Pages 10, 17, 20 and 32 are playable YouTube slides, with IDs taken from the Canva site and confirmed through oEmbed.
- 6 anonymous, untimed activities: join QR, word cloud, trade-off poll, rating scale, take-away and Q&A. Total: 40 slides, with the order verified by API against `deck.md`.
- Lead is set to Presenter for the live talk. After the talk it switches to self-paced (see the build folder README).
- Build files live in `content/presentations/20261030NUAL/ahaslides/`, excluded from Hugo in `config/_default/config.yaml`.
- An "Interactive slides (AhaSlides)" button with the audience link was added to the EN/ES/JA presentation pages.

Finding: `poll` options must now be `{"text": ...}` objects, and they display in payload order, not reversed as `.claude/docs/ahaslides.md` recorded. The doc was updated.
