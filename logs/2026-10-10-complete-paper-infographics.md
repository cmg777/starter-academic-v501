# Complete the remaining article and chapter infographics

Completed the question → source-supported evidence → answer artwork for all 40
Articles entries, including three book chapters and the book review. This change
adds six remaining designs and refreshes two previously installed candidates.
Existing publication text, dates, DOI fields, buttons and layout are preserved.

All eight updates use identical 1920×1080 WebP artwork in EN/ES/JA, with localized
`image.alt_text`. The five Books entries, approved Okun infographic and approved
commuting infographic are unchanged. No skills or shared viewer templates changed.

| Bundle | Selected evidence | Full image bytes |
|---|---|---:|
| `20151001BOOKch` | Median relative output: 19%, 34%, 57%; separate accounting scenarios | 100,538 |
| `20200901-Industrial-Dev-and-Regional-Dev` | Table 18.1 regional-inequality accounting components | 98,086 |
| `20210701-Indonesia-regional-growth-covid` | Table 2 Moran’s I: +0.181 versus −0.285, overlapping periods | 82,756 |
| `20211030-StructuralChange` | Published Tables A4–A5, six transitions for each network community | 69,248 |
| `20220104-ComparativeEcoStud` | Published Tables 5–6; unchanged local coefficient ranges, updated source credit | 47,808 |
| `20220303-BIES` | Qualitative initial-neighbour-level associations with local growth | 102,566 |
| `20230802-SCED` | Opposite directional trends; corrected wording avoids claiming divergent levels | 84,154 |
| `20241219-AE` | Qualitative inequality trends: GDP/VIIRS versus DMSP | 108,424 |

The eight unique full-size files total 693,580 bytes. Exact source values and
positions are plotted deterministically. No paid image generation was used.
BIES, EU structural change and China use qualitative evidence with visible author
manuscript attribution; no unverified numerical journal estimates are substituted.
The Latin America and industrial-policy chapters credit their inspected author
proofs. Uncertainty, model scope and noncausal interpretation are retained.

## Validation

- Pinned Hugo 0.111.3 production build with `--gc --minify --buildFuture`.
- Article parity: 40/40 ES and 40/40 JA; no missing pages or assets.
- All 120 built article pages: source hashes, localized alt, full/page/archive
  WebP dimensions and delivered byte counts checked.
- All 24 updated bundle bodies and frontmatter fields other than `image.alt_text`
  preserved; South America alt text was already correct and remains unchanged.
- All 21 protected book/Okun/commuting image hashes unchanged.
- Browser checks: all 120 article pages at 1440px and 390px (240 combinations),
  full-image hash/alt/fit, dialog opening and Escape closing, and no overflow.
  Homepage and Articles catalog passed all six locale/viewport combinations;
  card images use contain with no filter or transform. Screenshots inspected.

Source PDFs, working plots and evidence ledgers stay outside the website content.
Existing source-link/page-range discrepancies were recorded for separate metadata
review rather than changed as part of the thumbnail update.
