# 2026-10-03 — python_did101: Spotify podcast embed and video overview buttons

Fourth step of bringing `content/post/python_did101/` up to the `python_fwl` feature set. Still to
do: the AI slides PDF and the Quarto bundle update.

- The author supplied a Spotify for Creators short link (`spotifycreators-web.app.link/e/…`). It
  redirects to the Creators episode page, which resolves to episode `7dxl297Eflm60F76p88MoF`
  ("Introduction to Difference-in-Differences (DiD) in Python", QuaRCS-lab). The embed URL returns
  200 and the episode title matches.
- Pattern B of `.claude/docs/ai-podcast-player.md`, as in `python_fwl`: a `fab spotify` "Podcast"
  button (in place of the old "AI Podcast" button) and the navy-framed Spotify iframe above
  `## Abstract`.
- The Pattern A inline player (a catbox `.wav`, `#podcast-player`) is removed: its `.podcast-*` CSS,
  the `podOverlay` div and its script.
- Video, as in `python_fwl`/`python_panel_intro`: the author supplied a new overview
  (`VnSwS0g-jTE`, "Introduction to Difference in Differences"), now the "Video overview" button. The
  older video that the inline "AI Video" overlay played (`qObP9bGU5rM`, "Difference in Differences:
  An Introduction") is kept as "Video overview (2)". Both are plain `youtube.com/watch` links, so the
  overlay (its CSS, `vidOverlay` div and script) and the trailing `---` are removed; the post body now
  ends with the references. Podcast and the two video buttons move to the top of `links:`.
- `.claude/docs/ai-podcast-player.md`: `stata_did` is now the Pattern A podcast + video reference,
  `python_did101` (and `python_fwl`, `python_panel_intro`) are listed under Pattern B, and the doc
  records how to resolve a short share link and how to replace an existing inline player.

Verified on a production build (`hugo --gc --minify`): the embed sits before the Abstract, no
`podOverlay`, `vidOverlay` or "AI Podcast"/"AI Video" remains, the three media buttons lead the
button row, and the page has no script errors (headless Chromium). Both YouTube IDs resolve
(oEmbed titles match).
