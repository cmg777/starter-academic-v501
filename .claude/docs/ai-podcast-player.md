# AI Podcast Player

Two patterns attach an AI-generated podcast summary to a post. Pick by **where the audio lives**:

| Audio source | Pattern | Posts using it |
|---|---|---|
| Raw audio file URL (`.m4a` / `.wav`, e.g. a catbox.moe link) | **A. Inline HTML5 player** — self-contained `<style>` + `<div>` + `<script>` overlay appended to the post | `python_dowhy_intro`, `stata_did`, `r_sc_multi_country`, … |
| Episode published on Spotify (an `open.spotify.com/episode/…` link, or a Spotify for Creators share link) | **B. Spotify embed** — `links:` button + Spotify iframe above the Abstract | `python_bridge_impact`, `python_dowhy`, `python_fwl`, `python_panel_intro`, `python_did101`, `python_sc_dsc_sdid`, `python_sc_bayes_spatial`, `r_sc_dsc_sdid`, `r_estimateW` (button only) |

The two are not interchangeable: the inline player needs a direct audio file and cannot play a Spotify episode, and the Spotify iframe cannot play a raw audio URL. If the user gives a Spotify link, use Pattern B; if they give a file URL, use Pattern A.

## Pattern A — Inline HTML5 player

An embedded audio player overlay. The player is self-contained inline HTML/CSS/JS appended to each post's `index.md` — no external dependencies or shared templates.

### Trigger: "Add AI Podcast to `<post slug>`" (with an audio-file URL)

1. **Front matter** — add a podcast link entry to the `links:` section:
   ```yaml
   - icon: podcast
     icon_pack: fas
     name: AI Podcast
     url: "/tutorials/<post-slug>/#podcast-player"
   ```

2. **Post body** — append the podcast player block at the very end of the file, after a `---` separator. Copy the full `<style>` + `<div>` + `<script>` block from an existing post (e.g., `content/tutorials/python_dowhy_intro/index.md`) and customize three things:
   - **Audio `src`**: the URL the user provides (typically a catbox.moe link, `.m4a` or `.wav`)
   - **Title text**: update the `<h4>` inside `.podcast-title-block` (e.g., "AI Podcast: Topic Name")
   - **Stream link `href`**: same audio URL, with `target="_blank"` (no `download` attribute — stream, don't download)

### Reference implementations

- `content/tutorials/python_dowhy_intro/index.md` — podcast only (m4a, stream link)
- `content/tutorials/stata_did/index.md` — podcast + video player (wav, download link)
- `content/tutorials/r_sc_multi_country/index.md` — podcast only (m4a, stream link; R post)

### Player features

Play/pause, skip ±15s, progress bar with buffering, time display, volume slider, playback speed (0.75x–2x), stream/download button. Dark gradient UI using site colors (`#d97757` orange accent, `#6a9bcc`/`#00d4c8` progress gradient). Slides up from bottom on click, auto-opens if URL hash is `#podcast-player`.

## Pattern B — Spotify embed

Trigger: the same **"Add AI Podcast to `<post slug>`"**, when the link supplied is a Spotify episode or Spotify for Creators link. Two pieces, both keyed on the 22-character episode ID (`<ID>`):

1. **Front matter** — add one `links:` entry. In a new post, make it the first entry, as in `python_bridge_impact`. Older posts list it near the end, just before "MD version":
   ```yaml
   - icon: spotify
     icon_pack: fab
     name: "Podcast"
     url: https://open.spotify.com/episode/<ID>
   ```

2. **Post body** — immediately after the closing `---` of the front matter and **before `## Abstract`**, insert this block (copied from `content/tutorials/python_bridge_impact/index.md`, lines 87–89), with one blank line after it:
   ```html
   <div style="background:#0e1545; border-radius:12px; padding:8px;">
   <iframe style="border-radius:8px" src="https://open.spotify.com/embed/episode/<ID>?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
   </div>
   ```
   The navy wrapper (`#0e1545`) keeps the dark `theme=0` player visually framed in both site themes; keep `loading="lazy"` (site rule for all iframes).

### Resolving a Spotify for Creators share link

The user often pastes a **Spotify for Creators** link (`https://creators.spotify.com/pod/profile/<show>/episodes/<Title-slug>-<code>/a-<hash>`). That URL is not an episode ID and cannot go in the embed `src`. Resolve it to the `open.spotify.com/episode/<ID>` form first. The Creators page embeds JSON that pairs each episode's `shareLinkPath` with its `spotifyUrl`; the page lists several episodes, so match on this episode's slug:

```bash
LINK="https://creators.spotify.com/pod/profile/<show>/episodes/<Title-slug>-<code>/a-<hash>"
SLUG=$(echo "$LINK" | sed -E 's#.*/episodes/([^/]+).*#\1#')
curl -sL -A "Mozilla/5.0" "$LINK" | sed 's/\\u002F/\//g' \
  | grep -oE "\"shareLinkPath\":\"[^\"]*${SLUG}\"[^}]*\"spotifyUrl\":\"https://open.spotify.com/episode/[A-Za-z0-9]{22}" \
  | grep -oE '[A-Za-z0-9]{22}$'
```

(Verified 2026-09-28 on the `r_estimateW` link — it resolves to `6Fa4vFJBGEdUV7QvQu8FFm`.)

If it prints nothing (the Creators page layout changed), ask the user for the episode's `open.spotify.com/episode/…` link instead of guessing. Then confirm:
- `https://open.spotify.com/embed/episode/<ID>?utm_source=generator&theme=0` returns HTTP 200, and
- the `<title>` of `https://open.spotify.com/episode/<ID>` matches the post's topic.

Use the resolved `open.spotify.com/episode/<ID>` URL in the `links:` button as well. Two buttons still point at raw Creators links. They are legacy exceptions, not a pattern to copy. One is `r_estimateW`, which has the button only and no embed. The other is the secondary "Podcast (2)" button in `python_sc_dsc_sdid`, a second episode that resolves to `7jwAgiW5XOeGFThLk4jsWV` (checked 2026-09-28). A new post gets exactly one "Podcast" button, with the resolved URL.

A **short share link** (`https://spotifycreators-web.app.link/e/…`) is a Branch redirect: `curl -sL -A "Mozilla/5.0" "$SHORT" | sed 's/\\u002F/\//g' | grep -oE 'creators.spotify.com/pod/profile/[^/]+/episodes/[^?"]+' | head -1` yields the Creators URL (prefix `https://`); then run the command above on it. (Verified 2026-10-03 on the `python_did101` link → `7dxl297Eflm60F76p88MoF`.)

If the post already has a Pattern A inline player for the same episode, **replace** it: swap the `AI Podcast` button for the Spotify one and delete the `.podcast-*` CSS, the `podOverlay` div and its `<script>` — any `video-*` CSS and `vidOverlay` block can stay, since its click handler matches only `AI Video`. Video overviews in the newer posts (`python_fwl`, `python_panel_intro`, `python_did101`) are plain `fab youtube` "Video overview" buttons to `youtube.com/watch?v=…`, listed right after "Podcast"; a second video is "Video overview (2)".

### Reference implementations

- `content/tutorials/python_bridge_impact/index.md` — button (line 17) + embed (lines 87–89)
- `content/tutorials/python_sc_bayes_spatial/index.md`, `content/tutorials/python_sc_dsc_sdid/index.md`, `content/tutorials/r_sc_dsc_sdid/index.md`, `content/tutorials/python_dowhy/index.md` — same pattern
