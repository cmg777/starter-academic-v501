# AI Podcast Player

An embedded audio player overlay for AI-generated podcast summaries of blog posts. The player is self-contained inline HTML/CSS/JS appended to each post's `index.md` — no external dependencies or shared templates.

## Trigger: "Add AI Podcast to `<post slug>`"

1. **Front matter** — add a podcast link entry to the `links:` section:
   ```yaml
   - icon: podcast
     icon_pack: fas
     name: AI Podcast
     url: "/post/<post-slug>/#podcast-player"
   ```

2. **Post body** — append the podcast player block at the very end of the file, after a `---` separator. Copy the full `<style>` + `<div>` + `<script>` block from an existing post (e.g., `content/post/python_dowhy_intro/index.md`) and customize three things:
   - **Audio `src`**: the URL the user provides (typically a catbox.moe link, `.m4a` or `.wav`)
   - **Title text**: update the `<h4>` inside `.podcast-title-block` (e.g., "AI Podcast: Topic Name")
   - **Stream link `href`**: same audio URL, with `target="_blank"` (no `download` attribute — stream, don't download)

## Reference implementations

- `content/post/python_dowhy_intro/index.md` — podcast only (m4a, stream link)
- `content/post/python_did101/index.md` — podcast + video player (wav, download link)
- `content/post/r_sc_multi_country/index.md` — podcast only (m4a, stream link; R post)

## Player features

Play/pause, skip ±15s, progress bar with buffering, time display, volume slider, playback speed (0.75x–2x), stream/download button. Dark gradient UI using site colors (`#d97757` orange accent, `#6a9bcc`/`#00d4c8` progress gradient). Slides up from bottom on click, auto-opens if URL hash is `#podcast-player`.
