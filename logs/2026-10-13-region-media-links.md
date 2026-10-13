# REGION paper: public media links — 2026-10-13

Added AI Video and AI Podcast resource buttons to the English, Spanish, and Japanese REGION article. The shared front matter also exposes both buttons on the localized homepage cards.

- Video: https://youtu.be/9GmT_xPkaQQ — public YouTube watch page and oEmbed return 200; anonymous player metadata reports `OK`, `isPrivate: false`, and 411 seconds. Title and author match Carlos’s India paper video.
- Podcast: https://open.spotify.com/episode/4tZtxdevtotJsNf7pjjfTW — resolved the supplied Spotify Creators short link to this episode; anonymous episode page and oEmbed return 200 with the matching title and QuaRCS-lab show. Public listening UI shows 21 minutes 48 seconds.
- Labels follow the existing article conventions in each language; YouTube and headphones icons are supported by both page templates.
- Kept the Quarto Slides link and single consolidated Online article & notebooks button. No individual notebook buttons were added. Article bodies, publication metadata, CV, figures, slides, and newer EJHE additions are unchanged.

Validation: the pinned Hugo production build passed; all 22 existing tests passed; i18n parity reported zero missing, stale, or asset warnings. Six generated EN/ES/JA homepage/article pages each contain both media links once with the correct labels and safe new-tab attributes. Twelve browser checks at 1440px and 390px verified that the buttons stay within the viewport with no horizontal page overflow. Article bodies match the baseline byte for byte. Exact-commit deployment is verified after the scoped commit is pushed.
