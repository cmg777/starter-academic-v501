# Books ordered by update date

- The shared Books section template now sorts all three language catalogs by update time descending: explicit front-matter `lastmod`, otherwise Hugo `.Lastmod` (Git commit time, falling back to publication `date`). Equal update times retain publication-date order.
- Mastering Causal Metrics has `lastmod: "2026-10-23T09:09:51+09:00"` in EN/ES/JA, matching the button-update commit. Original publication dates and publication-year filters are unchanged.
- Existing older books retain their metadata. There is no separate Books list in the current homepage template.
- README and CLAUDE.md document how future updates move a book automatically by changing `lastmod` in all three language copies.

Validation: Hugo 0.111.3 production build passed (existing theme `.Path` warning only); i18n parity has 0 missing/stale items; all 12 responsive catalog checks passed at 360, 390, 768, and 1440px. All three generated catalogs match explicit/Git update metadata; all original publication dates are unchanged. Order: intro2causal, macro102, ccm, metricsai, convergence-clubs, essays-productivity.
