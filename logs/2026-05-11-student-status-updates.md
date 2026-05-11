# Student status updates (May 2026)

**Date:** 2026-05-11

## Motivation

Three students changed academic status this term and their author profiles
needed to be updated so they appear in the correct section of the site
(the Students widget on the homepage versus the Alumni page):

1. **Li Jiaqi (China)** — completed her PhD (2023–2026) and is now an
   alumni doctoral graduate.
2. **Prieto Laura (Colombia)** — completed her master's (2024–2026) and is
   starting a PhD (2026–2029). She needs to appear as both an alumni master
   graduate and a current doctoral student.
3. **Kanyama Yuna (Japan)** — completed her master's (2024–2026) and is now
   an alumni master graduate (not continuing to PhD).

The site already follows a clean split-folder pattern when a single person
exists in two stages: a "current" folder (e.g. `JianqiLi`, `HeDu`) and an
alumni master folder with the `_Master` suffix (e.g. `JianqiLi_Master`,
`HeDu_Master`). The `user_groups` field on each profile decides which
people-widget it appears in. The Students widget
(`content/home/people.md`) aggregates the current-student groups; the
Alumni page (`content/alumni/people.md`) aggregates the alumni groups.
That's why no widget files needed editing — updating `user_groups` on the
profile is sufficient.

## Changes

### `content/authors/JianqiLi/_index.md`
- `role: "PhD student 2023-2026"` → `"PhD in International Development 2026"`
- `user_groups: Doctoral students` → `Alumni doctoral graduates`

The existing `content/authors/JianqiLi_Master/_index.md` (her alumni
master record from 2022) is left untouched.

### `content/authors/PrietoLaura/_index.md` (now her PhD record)
- `role: "Master student 2024-2026"` → `"PhD student 2026-2029"`
- `user_groups: Master students` → `Doctoral students`

Bio line still reads "Master's student in International Development at
Nagoya University" — left untouched per the agreed scope (status fields
only). Update when Laura provides revised copy.

### `content/authors/PrietoLaura_Master/_index.md` (new — her alumni master record)
- Full copy of the pre-edit Laura profile.
- `role: "Master in International Development 2026"`
- `user_groups: Alumni master graduates`

Mirrors the `HeDu` / `HeDu_Master` pattern.

### `content/authors/KanyamaYuna/_index.md`
- `role: "Master student 2024-2026"` → `"Master in International Development 2026"`
- `user_groups: Master students` → `Alumni master graduates`

Not continuing to PhD, so no split into two profiles.

## Verification

Local Hugo dev server:

```
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender
```

- `http://localhost:1313/#people` (Students widget):
  - Li Jiaqi no longer under Doctoral students.
  - Prieto Laura now under Doctoral students as "PhD student 2026-2029".
  - Kanyama Yuna no longer under Master students.
- `http://localhost:1313/alumni/`:
  - Li Jiaqi under Alumni doctoral graduates as "PhD in International Development 2026".
  - Prieto Laura under Alumni master graduates as "Master in International Development 2026" (from the new `PrietoLaura_Master` folder).
  - Kanyama Yuna under Alumni master graduates as "Master in International Development 2026".
  - Existing `JianqiLi_Master` alumni-master record (2022) renders unchanged.

## Follow-up (optional)

- Laura's PhD profile bio still says "Master's student in International
  Development". Refresh when she sends updated copy.
- Profile placeholder fields (`bio: "ADD a longer bio here"`, `email: "x"`)
  on Li Jiaqi's PhD record were not touched — same scope rule.
