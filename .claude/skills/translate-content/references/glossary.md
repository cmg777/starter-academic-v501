# Translation glossary & style guide (EN → ES / JA)

Single source of truth for translating carlos-mendez.org content into Spanish
(`/es/`) and Japanese (`/ja/`). Consumed by the `/project:translate-content`
skill and by anyone hand-editing the translated trees. When a translation
coins a new recurring term, **add it here in the same commit**.

This file is reference data for the skill only. It is NOT Hugo `data/` and is
not loaded by the build.

---

## 1. Register

- **Spanish** — neutral Latin American Spanish, **formal `usted`**. Reader-facing
  imperatives use the `usted` form: `Descargue mi CV`, `Contribuya y deje sus
  comentarios`, `Bienvenido/a`. Avoid `tú`/`vosotros` and Iberian-only calques.
- **Japanese** — **です・ます** polite register throughout (`〜します`, `〜です`).
  Use full-width punctuation （、。） and full-width parentheses for
  parentheticals, e.g. `名古屋大学（日本）`, `博士課程学生（副指導）`.

## 2. Number localization (running prose only — NEVER front matter, DOIs, URLs, dates, `year`)

| EN form | Spanish | Japanese |
|---|---|---|
| `0.75` | `0,75` (comma decimal) | `0.75` (Western) |
| `17.8%` | `17,8 %` (comma decimal, **space before %**) | `17.8%` |
| `1,557` | `1557` (4 digits: no separator) | `1,557` |
| `71,682` | `71 682` (5+ digits: space thousands) | `71,682` |
| `USD 189` / `$189` | `189 USD` | `189米ドル` |
| `3.8M` | `3,8 millones` | `380万` (or keep `3.8M`) |

Spanish convention: **decimal comma always**; thousands separator = a space for
5+ digit numbers, no separator for 4-digit numbers (RAE). Some legacy ES files
use a period as thousands separator (`1.557`) — acceptable, but prefer the space
form going forward. Japanese keeps Western numerals with comma thousands.

## 3. Term mapping (EN | ES | JA)

### Link names (`links[].name`)
| EN | ES | JA |
|---|---|---|
| AI Video | Vídeo con IA | AI動画 |
| AI Chatbot | Chatbot de IA | AIチャットボット |
| AI Podcast | Pódcast con IA | AIポッドキャスト |
| AI Mindmap | Mapa mental con IA | AIマインドマップ |
| Podcast | Pódcast | ポッドキャスト |
| Slides | Diapositivas | スライド |
| Website | Sitio web | ウェブサイト |
| Videos | Vídeos | 動画 |
| Book | Libro | 書籍 |
| Learn by Coding | Aprende programando | プログラミングで学ぶ |
| Study Guide | Guía de estudio | 学習ガイド |
| Published article (Open Access) | Artículo publicado (acceso abierto) | 出版論文（オープンアクセス） |
| Poverty Mapping Tool | Herramienta de mapeo de pobreza | 貧困マッピングツール |
| GitHub | GitHub | GitHub |
| Code | Código | コード |
| Dataset | Conjunto de datos | データセット |
| Preprint | Preprint | プレプリント |

### `user_groups` — student groups (MUST match `content/<lang>/home/people.md`)
| EN | ES | JA |
|---|---|---|
| Doctoral students | Estudiantes de doctorado | 博士課程学生 |
| Doctoral students (sub advisor) | Estudiantes de doctorado (co-asesor) | 博士課程学生（副指導） |
| Master students | Estudiantes de maestría | 修士課程学生 |
| Master students (sub advisor) | Estudiantes de maestría (co-asesor) | 修士課程学生（副指導） |

Non-student groups (`Principal Investigators`, `Alumni doctoral graduates`,
`Alumni master graduates`, and any `(sub advisor)` variants of those) are **kept
in English** — the People widget does not filter them, so translating is a no-op
and the repo convention is to leave them as-is.

### Roles / titles
| EN | ES | JA |
|---|---|---|
| Associate Professor of Development Economics | Profesor Asociado de Economía del Desarrollo | 開発経済学 准教授 |
| Doctoral student / PhD student | Estudiante de doctorado | 博士課程学生 |
| Master's student | Estudiante de maestría | 修士課程学生 |
| Principal Investigator | Investigador principal | 主任研究者 |

For a student `role` that embeds years (e.g. `Doctoral student 2023-2026`),
translate the words and keep the years: `Estudiante de doctorado 2023-2026` /
`博士課程学生 2023-2026`.

### Institutions
| EN | ES | JA |
|---|---|---|
| Nagoya University, JAPAN | Universidad de Nagoya, JAPÓN | 名古屋大学（日本） |
| Nagoya University | Universidad de Nagoya | 名古屋大学 |
| International University of Japan | Universidad Internacional de Japón | 国際大学（日本） |
| Bolivian Catholic University | Universidad Católica Boliviana | ボリビア・カトリカ大学 |

### Degrees (`education.courses[].course`)
| EN | ES | JA |
|---|---|---|
| PhD in International Development | Doctorado en Desarrollo Internacional | 国際開発学 博士 |
| MA / Master in International Development | Maestría en Desarrollo Internacional | 国際開発学 修士 |
| Master in Economics | Maestría en Economía | 経済学 修士 |
| Lic. in Commercial Engineering | Licenciatura en Ingeniería Comercial | 商業工学 学士 |

### Academic terms
| EN | ES | JA |
|---|---|---|
| machine learning | aprendizaje automático | 機械学習 |
| spatial machine learning | aprendizaje automático espacial | 空間機械学習 |
| big data | macrodatos | ビッグデータ |
| spatial big data analytics | analítica de macrodatos espaciales | 空間ビッグデータ分析 |
| regional development | desarrollo regional | 地域開発 |
| applied econometrics | econometría aplicada | 応用計量経済学 |
| development economics | economía del desarrollo | 開発経済学 |
| development macroeconomics | macroeconomía del desarrollo | 開発マクロ経済学 |
| regional inequality | desigualdad regional | 地域格差 |
| nighttime lights (NTL) | luces nocturnas (NTL) | 夜間光（NTL） |
| multidimensional poverty | pobreza multidimensional | 多次元貧困 |
| socioeconomic survey | encuesta socioeconómica | 社会経済調査 |
| Earth observation (EO) data | datos de observación de la Tierra | 地球観測データ |
| causal inference | inferencia causal | 因果推論 |
| spatial data science | ciencia de datos espaciales | 空間データサイエンス |
| fixed effects | efectos fijos | 固定効果 |
| random forest | random forest | ランダムフォレスト |
| convergence | convergencia | 収束 |
| subnational GDP | PIB subnacional | サブナショナルGDP |
| structural change | cambio estructural | 構造変化 |

### Recurring UI / sentence patterns
| EN | ES | JA |
|---|---|---|
| Welcome to … | ¡Bienvenido/a a …! | …へようこそ |
| Work in Progress / In development | En desarrollo | 作成中 |
| Download my CV | Descargue mi CV | CV（履歴書）をダウンロードできます |
| Slides by Carlos Mendez | Diapositivas por Carlos Mendez | スライド：カルロス・メンデス |

### Person-name transliteration (JA only)
Spanish keeps Latin-script names verbatim. Japanese transliterates the
principal investigator's display name where the repo already does so:
`Carlos Mendez` → `カルロス・メンデス`. Co-author / student names in author
`title` are kept in Latin script in JA too **except** a trailing country
parenthetical, which is localized: `Abdulah Rusli (Indonesia)` →
ES `Abdulah Rusli (Indonesia)` → JA `Abdulah Rusli（インドネシア）`.

## 4. DO NOT translate (keep byte-for-byte)

Front-matter keys that are query keys, identifiers, or proper data:
`authors`, `tags`, `categories`, `date`, `publishDate`, `date_end`, `all_day`,
`doi`, `publication_types`, the `publication` journal name (e.g.
`*Empirical Economics*`), `publication_short`, `featured`, `superuser`,
`highlight_name`, `math`, `weight`, `_build`, `year`, `slug`, `aliases`,
`projects[]`, `slides`.

URLs and asset/icon references: `links[].url`, all `url_*`, `event_url`,
`organizations[].url`, `social[].link`, `card_url`, the `image:` block,
`icon`/`icon_pack`, internal cross-reference **paths** (e.g.
`/project/intro2causal/` — translate only the visible link text, never the path),
shortcode invocations (`{{< staticref … >}}`, `{{< icon … >}}`).

Other: software / library / product names (DoubleML, XGBoost, RandomForest,
VIIRS, DMSP, Quarto, R, Python, Stata, pyfixest), folder/slug names, raw HTML
and iframe blocks (copied verbatim), code fences, and math.

## 5. Maintenance

- Keep the four student `user_groups` rows synchronized with
  `content/es/home/people.md` and `content/ja/home/people.md`. If those change,
  update this table and every affected author profile in the same commit.
- When EN content is ambiguous, this file is the arbiter.
- Add new recurring terms here as they are coined, so future translations stay
  consistent.
