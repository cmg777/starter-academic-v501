# Post stub-card template

Canonical `content/<lang>/post/<slug>/index.md` for a tutorial post. Front
matter only, empty body. Translate `<TITLE>` and `<SUMMARY>` (apply glossary +
register); copy `<DATE>` and `<CATEGORIES>` verbatim from the English post.

The leading comment is the language-appropriate explanation (translate it for
`ja`). `<EN-TITLE-NOTE>` describes that the card links to the English original.

## Spanish (`es`)

```yaml
---
# Stub de tarjeta (es): alimenta el teaser de "Publicaciones y tutoriales" del
# home en español con título/resumen traducidos, pero la tarjeta enlaza al
# tutorial original en inglés (card_url). El cuerpo no se traduce.
title: "<TITLE-ES>"
summary: "<SUMMARY-ES>"
date: "<DATE>"
categories:
  - <CATEGORY-1>
  - <CATEGORY-2>
card_url: "/post/<slug>/"
featured: false
_build:
  render: never
  list: always
  publishResources: false
---
```

## Japanese (`ja`)

```yaml
---
# カードのスタブ（ja）：日本語ホームの「出版物とチュートリアル」ティーザーに
# 翻訳済みのタイトル／要約を供給しますが、カードは英語版の元チュートリアルに
# リンクします（card_url）。本文は翻訳しません。
title: "<TITLE-JA>"
summary: "<SUMMARY-JA>"
date: "<DATE>"
categories:
  - <CATEGORY-1>
  - <CATEGORY-2>
card_url: "/post/<slug>/"
featured: false
_build:
  render: never
  list: always
  publishResources: false
---
```

Rules:
- `categories` are English **query keys** — copy them exactly from the EN post
  (do not translate, do not reorder).
- `card_url` path is the English slug, unchanged.
- Never add a `url:` key (it relocates the page and collides with the English URL).
- No body, no asset copying.
