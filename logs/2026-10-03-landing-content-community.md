# Landing page messaging, navigation, and community

## Requested refinements

- Ground the main messages in https://quarcs.netlify.app/ and its resources page,
  https://quarcs.netlify.app/portfolio/data-tutorials/.
- Emphasize the geography of development, development seen from outer space,
  geospatial development, sustainable regional development, structural change,
  and interdisciplinary science for economic, social, and environmental sustainability.
- Restore the original navigation items and remove the symbol beside Carlos's name.
- Show all current students' photos and restore the original photo carousel.
- Refer to the group as the QuaRCS lab throughout visible copy, rather than as
  a community, including translated member and gallery text.

## Changes

- Rewrote EN/ES/JA hero, research, learning, project, profile, community, and contact
  copy in `data/orbital.json`. Added the network's five research areas and a concise
  explanation of the methods. The existing scientific publication summaries remain
  sourced from their content bundles.
- Both navigation layouts now use `site.Menus.main`, preserving original item
  labels, weight order, translated menus, course destinations, and the Events link.
  Fragment links stay on the current language's homepage. Removed the brand SVG.
- Replaced the six-portrait preview and collapsed directory with photo cards for
  all 10 current students selected by the original People widget's group settings.
  Carlos's own portrait remains in the immediately preceding About section.
- Restored all 19 original gallery photos with optimized responsive WebP images.
  Full photos are contained rather than cropped. The carousel uses native scroll
  snapping plus previous/next, Home/End, and arrow-key navigation. No autoplay;
  smooth scrolling respects reduced motion. It remains scrollable without JS.
- Follow-up: all student portraits use equal circular masks and centered source
  crops to keep existing round portraits concentric and faces in frame. The
  gallery starts on photo 6 and continues to advance only on user input.
- Follow-up: moved Behind the Research immediately after The Research Questions.
  All three locales now number About as 02, publications as 03, projects as 04,
  and the learning section as 05. Navigation items retain their requested order.
- The previously removed NASA caption stays removed; imagery provenance remains
  in `static/media/orbital/CREDITS.txt`.

## Verification

- Hugo 0.111.3 production-style build succeeds for EN/ES/JA; existing legacy theme
  `.Path` deprecation warning remains.
- Browser checks at 320, 390, 768, 1024, 1200, and 1440 CSS pixels in all three
  languages: no horizontal overflow, no headline overflow, and no navigation overlap.
- Each locale renders 10 student portraits and 19 gallery slides.
- Browser carousel checks: next photo, previous-photo wraparound, Home and End;
  no console errors. All current student portrait images loaded successfully.

Changes remain local and uncommitted. No deployment or push was requested.

## Contact details and presentations follow-up

- Added phone, postal address, Office 111 directions, Tuesday 17:00–18:30 office
  hours and advance-booking reminder to “Continue the conversation.” Added the
  visible university email address plus appointment, Zoom, and X contact links.
- `orbital-contact.html` reads contact destinations, phone, email, and postal
  address from the existing site parameters. Localized labels, directions, and
  office-hour copy are in `data/orbital.json`. The displayed telephone number is
  preserved; its `tel:` link uses the international dialable format without the
  domestic trunk zero. The existing Zoom destination is preserved in full.
- Contact details use two columns on desktop and one below 700 px, with matching
  blue/gold accents and wrapping email text. No form or new browser dependency.
- Renamed “Research worth discussing” to “Recent presentations” and moved the
  section directly after “What satellite data can reveal,” before projects.
  Spanish and Japanese titles were updated; presentation entries are unchanged.
- Hugo production build passed. Checked generated contact destinations in EN/ES/JA
  and browser layout at 320/390/768 px; no horizontal overflow. DOM checks confirm
  `featured → talks → projects` in all three languages.
