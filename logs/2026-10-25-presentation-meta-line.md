# Presentations — standardized list line

The first line of each talk on the homepage ("Recent presentations") and on `/presentations/` is now `DATE / EVENT / COUNTRY` in EN, ES and JA. Before, it showed the free-text `event:` field, which mixed roles, sessions, institutions and cities.

- New front matter in all 36 talks × 3 languages: `event_name` (official name + acronym when one exists; same text in every language), `country` (full common name, translated), `attendance: online|hybrid`, and `date_precision: month` (UCB talk, day still unknown).
- `layouts/partials/functions/talk_meta.html` builds the line; `orbital-talks.html` and `section/presentations.html` use it. Online/hybrid markers are in `i18n/{en,es,ja}.yaml` (`i18n/en.yaml` is new).
- Dates: `2 Jan 2006` (EN), localized `11 nov. 2026` (ES), `2026年11月11日` (JA).
- `event:` and `location:` are unchanged so talk pages keep role and session. The list page shows the new line in place of date + location.
- Fixes: JSRSAI 2022 `event_url` pointed at ERSA 2022 (removed); EN typos "62st" → "62nd", "Phenom Penh" → "Phnom Penh".
- Defaults chosen with the user: RSAI 2021, SEA 2021, PRSCO 2022 show "Online" (host country unknown); folder/`date:` mismatches (CSEAS 2020, JSLA 2020, JSRSAI 2020) keep `date:`.
- Follow-up (same day): UCB lecture date set to Mon 9 Nov 2026, 18:00 La Paz time (`-04:00`); folder renamed `20261199UCB` → `20261109UCB` (URL comes from the title, so unchanged) and `date_precision` dropped.
- Follow-up (same day): the 32 summaries that only repeated the event name were replaced with plain-language summaries (at most two sentences, no acronyms) written from each talk's abstract, in EN/ES/JA. Repeat talks of the same paper share the same summary. CSEAS 2020 and GDSL 2024 have no abstract, so their summaries are short and based on the title and subtitle.
