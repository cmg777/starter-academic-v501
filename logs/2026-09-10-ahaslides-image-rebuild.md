# AhaSlides deck rebuilt as slide images + native interactivity

**Date:** 2026-09-10 (same day as `2026-09-10-ahaslides-bridge-impact.md`, which this supersedes in method)
**Scope:** presentation `10040213`; `content/post/python_bridge_impact/ahaslides/` docs

## Why

The first build expressed the Quarto deck through AhaSlides' native content types. That
renders, but it strips almost everything that makes the deck readable: bold runs, the
four tables (flattened to bullets), the LaTeX, the serif display typography, the
takeaway boxes, and the five act-divider colours from the site palette.

The fix: **content slides become images of the real Quarto slides; AhaSlides contributes
only the interactive layer**, which is the one thing it is actually good at.

## Result

Presentation `10040213` — same ID, so the share link in the post is unchanged:

- **36 content slides**, each a full-bleed 1280×720 image of the corresponding Quarto
  slide, fragments flattened to final state.
- **8 native interactive slides** at their original positions (5, 15, 18, 23, 25, 28,
  34, 44), with speaker notes intact.
- Backup of the previous text version: presentation `10041434`.

Verified: 44 slides, interactive positions match `deck.md` exactly, share link returns
200, and a spot-check of slide 22 shows the real Outcome/Effect table with the orange
rule and coloured figures — the slide that had previously been reduced to plain bullets.

## Method

1. `slides.qmd` → PDF via headless Chrome using reveal's own print mode
   (`?print-pdf&pdfSeparateFragments=false`) → **36 pages, one per slide**, 16:9.
2. Backup the deck (`duplicate_presentation`), then soft-delete its 36 content slides.
3. Import the PDF through the editor's **Import → "Import slides"** (not the AI
   variants, which rewrite the content). 50 MB / 100 slide limit; this was 2.35 MB / 36.
4. Interleave the 8 interactive slides with `move_slide` — one call each, because the
   imported images are already in page order.

Rendered PDF and PNGs were deleted afterwards; nothing large is committed.

## Constraints discovered

- **`upload_image` rejects PDFs** (`content-type: application/pdf`) — a PDF can only
  enter through the editor UI, not the MCP.
- **No full-bleed image slide type exists in the MCP.**
  `content_with_title_and_right_image` pins the image to a 620×720 right column; there
  is no background-image type or tool. This is what forced the import route.
- **Speaker notes cannot be attached to imported slides.** `update_slide_content`
  requires `heading` + `paragraphs`, which would replace the image with a text slide.
  Notes for the 36 image slides now live only in `deck.md`. Accepted deliberately —
  the formatting was judged worth more.
- **`get_presentation_detail_tool` never returns `notes`**, so absence there proves
  nothing; `move_slide` and `update_slide_content` responses do return it.
- **Slide IDs change** when a slide's type is converted, so the live list must be
  fetched before any destructive operation rather than trusting recorded IDs.

## Correction to the previous log

That entry stated the free tier caps live participants at 3, contradicting AhaSlides'
own marketing. Both readings were incomplete. A deck of imported images alone reports
**"up to 50 live participants"**; this deck, which contains the premium (👑) Word Cloud,
Rating Scale and Open Ended slides, reports **0 / 3** and shows *"You have reached the
free slide limit"* — the same message it showed when it held only 8 slides. So that
message tracks **premium slide types, not slide count**. The correlation is clear, the
exact rule is not documented, and a live session should be tested before teaching.

## Docs

`ahaslides/README.md` rewritten around the image-import architecture: the render
command, the import steps, the rebuild-in-place procedure, what the MCP cannot do
(full-bleed, PDF ingest, notes on imported slides), and an updated new-deck recipe.
`deck.md` reframed — it is now the source of truth for speaker notes and the interactive
slides rather than for what the audience reads.
