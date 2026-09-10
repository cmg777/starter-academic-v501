# AhaSlides interactive deck for `python_bridge_impact`

**Date:** 2026-09-10
**Scope:** `content/post/python_bridge_impact/ahaslides/` (new), `index.md` (one `links:` entry)

## What was built

A 44-slide interactive AhaSlides deck mirroring the post's Quarto reveal.js deck
(`slides/slides.qmd`), created through the official AhaSlides MCP server.

- **Public view link:** https://presenter.ahaslides.com/share/1789007350719-n7drztywna
- **Editor:** https://presenter.ahaslides.com/presentation/10040213 · join code `Q6U4S`

All **30 content slides** of the Quarto deck are carried over 1:1 — verified by diff
that the titles match exactly and in order — plus 5 act dividers, a cover, and
**8 new interactive slides** placed where the Quarto speaker notes already ask the
presenter to work the room (e.g. slide 17's "Make the audience do the work here"
became the confounder word cloud). The opening prediction poll (slide 5) is
deliberately replayed at the discriminating-outcome quiz (slide 25).

Nine figures were uploaded to the AhaSlides CDN via `upload_image`. All 19
`.takeaway` lines from the qmd survive as `→`-prefixed closing bullets.

## Repo artifacts

| File | Role |
|---|---|
| `ahaslides/deck.md` | Editorial source of truth — every slide, with speaker notes |
| `ahaslides/deck.json` | Generated machine-readable form fed to the MCP |
| `ahaslides/build_deck_json.py` | `deck.md` → `deck.json`; also validates quizzes and figures |

`deck.md` and `README.md` are page-bundle resources inside a leaf bundle, so Hugo
never publishes them (`README.md` is additionally in `ignoreFiles`). Verified against
a full build: nothing new in the sitemap or search index.

## The one thing worth remembering: do not use `content-v2`

The MCP server's instructions strongly recommend `content-v2` for static slides. It
does not work through the MCP. `create_slides` and `update_slide_content` both store
`slide_attributes.dsl` faithfully, but nothing compiles it into `canvasBlocks`, and
the slide renders **blank** for presenter and audience — with no error in the API
response or the browser console. It renders only after a human opens the slide and
applies a Layout by hand.

The **native types render server-side and work first time**: `content` (heading +
`paragraphs`), `listing` (heading + `items`), `content_with_title_and_right_image`,
and the interactive types. Diagnostic: a good response has a populated
`canvasBlocks`; a content-v2 one has `canvasBlocks: null`.

Two further gotchas: `update_slide_content` replaces the whole slide, so `notes` must
be resent or they are wiped; and `sub_heading` clips silently past ~60 characters.

## Free-plan limits observed (differ from the marketplace page)

- At 44 slides the editor reports **"You have reached the free slide limit."** The deck
  is complete and renders, but no further slides can be added without upgrading.
- Three interactive slides are 👑 **premium**: Word Cloud (18), Rating Scale (34),
  Open Ended (44). `poll` and `pick_answer_quiz` are free.
- The participant counter reads **0 / 3**, not the 50 the marketplace page advertises.

None of this blocks the published view link, which is self-paced and works today.
It does mean a live session on the free plan should be tested first.

## Post change

One `links:` entry after **Slides (PDF)**, absolute URL so it opens in a new tab
(`layouts/partials/page_links.html` only adds `target="_blank"` for `http(s)` URLs):

```yaml
  - icon: poll
    icon_pack: fas
    name: "Interactive slides (AhaSlides)"
    url: https://presenter.ahaslides.com/share/1789007350719-n7drztywna
```

`fa-poll` was checked against the Font Awesome build the site actually loads
(**Free 5.14.0** from cdnjs) — it exists. No i18n change: ES/JA post counterparts are
card-only stubs that link back to the English post.

## Unrelated defect noticed

`.claude/docs/post-resource-buttons.md` recommends `icon: person-chalkboard` for the
"Slides (HTML)" button, but that icon is **FA6-only** and absent from FA 5.14, so it
renders as blank space on `python_did_industrial_park`, `python_kuznets_dmsp`,
`r_double_lasso` and `r_kuznets`. Not fixed here.
