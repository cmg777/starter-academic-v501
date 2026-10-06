# AhaSlides presentations filed into topic folders

**Date:** 2026-10-07

The AhaSlides account had 15 presentations and no folders. They are now filed into four
top-level folders by use, and the three dated backups are deleted. The filing rule for
new decks is in `.claude/docs/ahaslides.md` (*Folders in the account*).

## Decisions (from the author)

- Four flat folders with English names; the Spanish Class folder is for the Spanish
  language class only and starts empty.
- The econometrics tutorial decks belong to the Applied Econometrics class, except the
  two spatial ones (Bayesian spatial SC, bridge impact), which belong to Regional
  Development (moved on author request after the first filing).
- The three keynote languages sit directly in Website.
- The backups are deleted.

## Result

| Folder | ID | Presentations |
|---|---|---|
| Regional Development | 141828 | 10276514 Part 1, 10276515 Part 2, 10276516 Part 3, 10042312 Bayesian Spatial SC, 10040213 A Bridge, Two Rivers |
| Applied Econometrics | 141829 | 10198190 FWL, 10245137 Panel Data, 10254213 DiD, 10267450 Synthetic Control (mlsynth) |
| Website | 141830 | 10280670 keynote EN, 10280671 ES, 10280672 JA |
| Spanish Class | 141831 | (empty) |

Deleted (soft delete, recoverable with `recover_presentations`): 10274743 (Panel Data
backup), 10274590 (FWL backup), 10220004 (FWL retail-store backup).

## Verification

- `list_folders` shows the four folders with 5, 4, 3 and 0 presentations.
- `list_presentations` returns 12 decks, each with the expected folder ID, and no backup.
- The three keynote audience links (hero `keynoteUrl`) still return 200.
