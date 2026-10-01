# 2026-10-01 — Doctoral graduates: Restrepo Katerine and Theara Khoun

## Status moves (EN/ES/JA)

Restrepo Katerine (Colombia) and Theara Khoun (Cambodia) completed the PhD in 2026 (main advisor). Same pattern as Li Jiaqi (`2026-05-11-student-status-updates.md`): only `role` and `user_groups` changed. Bio, education, interests, organizations and social links were left untouched.

| Lang | `role` | `user_groups` |
|---|---|---|
| EN | `PhD in International Development 2026` | `Alumni doctoral graduates` |
| ES | `Doctorado en Desarrollo Internacional 2026` | `Alumni doctoral graduates` (alumni groups stay in English) |
| JA | `国際開発学 博士 2026` | `Alumni doctoral graduates` |

No widget edits were needed. Both now render on `/alumni/`, `/es/alumni/` and `/ja/alumni/`, and no longer in the homepage Students widget.

## Alumni role cleanup

- **JA wording normalized** to `国際開発学 博士 <year>` (previously `博士課程学生 <year>`, which means "doctoral student"): JianqiLi (2026), AgintaHarry (2023), ChenYilin (2025), HuaZheng (2025). `博士課程学生` now appears only on current students.
- **MinhThu, SuleimanHussein** (sub-advisor doctoral alumni, graduated 2025): role changed from "PhD student 2022-2025" to "PhD in International Development 2025" in EN, with matching ES and JA.
- **KpoviessiOthniel** EN typo fixed: "Inteenational" → "International".

## Known issues (not changed)

- KhounTheara: the ResearchGate, ORCID and GitHub icons all link to a LinkedIn URL. Bio, education, interests and body are still "TBA" in all three languages.
- `content/cv/main.tex` has no supervision section, so the CV is unaffected.

## Verification

Built with Hugo 0.111.3 (`--gc --minify --buildFuture`). `scripts/i18n-parity.sh` reports 0 missing and 0 stale. Rendered alumni pages contain both graduates in EN, ES and JA, and the homepages no longer do.
