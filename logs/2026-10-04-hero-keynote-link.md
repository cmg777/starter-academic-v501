# Hero actions point to the Canva keynote and the tools section

**Date:** 2026-10-04

## What changed

The homepage hero's two non-video actions were retargeted.

1. The primary button is now **Keynote presentation** and links out to a Canva
   deck in a new tab (`target="_blank" rel="noopener"`, matching the house
   pattern used by the Earth Engine links at `layouts/index.html:100`). Each
   locale has its own deck, so the URL is data-driven per language. It previously
   read "Explore the research" and scrolled to `#researchLab`
   (`01 / THE RESEARCH QUESTIONS`).
2. The **Learn the methods** text link keeps its label but now scrolls to
   `#projects` (`04 / TOOLS FOR DISCOVERY`) instead of `#posts`
   (`05 / THE OPEN CLASSROOM`).

The hero's **Video Overview** modal was localized in the same pass: its YouTube
embed was hardcoded for English, and each language now plays its own recording.

Section `01` is still reachable from the hero through the `↓ Explore the
questions` cue at `layouts/index.html:114`, and the tutorials section stays
reachable from the main menu, so no navigation path was lost.

## Files

- `layouts/index.html:77` — the hero `.actions` block. Hrefs are hardcoded here;
  there is no actions array in the data file.
- `layouts/index.html:116` — the `<dialog id="video-overview">` `data-video-src`
  attribute, read by `assets/js/orbital-cinema.js:161` when the modal opens. It
  now reads `{{ $t.videoUrl }}` instead of a literal English embed URL.
- `data/orbital.json` — the `explore` key was renamed to `keynote` in all three
  locales, since `layouts/index.html:77` is its only consumer:
  EN "Keynote presentation", ES "Presentación principal", JA "基調講演". A new
  `keynoteUrl` key holds the per-locale deck, because the three languages have
  separate Canva presentations:

  | locale | deck |
  |---|---|
  | en | `https://canva.link/n0fk7iia8hvmy61` |
  | es | `https://canva.link/d8cqmp2vuqp2ag1` |
  | ja | `https://canva.link/9l4tum0urflm6mu` |

  A matching `videoUrl` key holds each locale's Video Overview embed:

  | locale | video overview |
  |---|---|
  | en | `https://www.youtube-nocookie.com/embed/Hy-b7kjLFds?autoplay=1&rel=0` |
  | es | `https://www.youtube-nocookie.com/embed/6_ZhisUyDR4?autoplay=1&rel=0` |
  | ja | `https://www.youtube-nocookie.com/embed/SJF_pLOMNVE?autoplay=1&rel=0` |

  Store the `youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` form, not the
  `youtu.be/<id>?si=…` share link — the share form will not load in an iframe,
  and the `si` tracking parameter is dropped deliberately. Write a bare `&` in
  the JSON; Hugo escapes it to `&amp;` in the attribute and the browser hands
  `dataset.videoSrc` the unescaped URL.

  The `learn` labels and the separate `scroll` cue key are untouched. When a deck
  or recording is replaced, edit `keynoteUrl` / `videoUrl` in
  `data/orbital.json` — the template no longer carries a hardcoded URL.

No JS or CSS change was needed. Nothing on the landing page intercepts clicks on
these anchors, and `.hero-action-buttons` already has `flex-wrap: wrap`
(`assets/css/orbital.css:306`); the Spanish label is shorter than the adjacent
"Ver el resumen en video", so narrow widths gained no new worst case.

## Verification

- Hugo 0.111.3 `--gc --minify`: exit 0, EN 1148 / ES 553 / JA 553 pages. The only
  warning is the pre-existing Wowchemy `.Path` deprecation.
- `grep '\$t\.explore\b' layouts/` returns nothing — the rename is complete.
- Rendered output in `public/index.html`, `public/es/index.html`, and
  `public/ja/index.html`: each page carries its own Canva href with
  `target=_blank rel=noopener` and the correct localized label; the text link
  resolves to `href=#projects`, and `id=projects` exists exactly once per page.
  `data-video-src` resolves to each locale's embed, and the English value is
  byte-identical to the pre-change markup.
- `node --test tests/orbital.test.cjs`: 9/9 pass.

## Note on the local Hugo install

The pinned `0.111.3` binary documented in `CLAUDE.md` was missing from
`~/Library/Application Support/Hugo/` on this machine (only 0.73.0, 0.80.0, and
0.89.4 were present). It was reinstalled from the
[v0.111.3 release](https://github.com/gohugoio/hugo/releases/tag/v0.111.3)
(`hugo_extended_0.111.3_darwin-universal.tar.gz`) into the documented
`<version>/hugo` layout. The Homebrew `hugo` on `PATH` is 0.155.3, which is above
the repo's tested 0.96–0.119 window and fails the build on the removed
`site.GoogleAnalytics` and `paginate` keys — do not use it.
