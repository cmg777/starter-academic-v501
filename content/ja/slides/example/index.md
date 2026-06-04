---
title: スライド
summary: Wowchemy のスライド機能の使い方の紹介。
authors: []
tags: []
categories: []
date: "2019-02-05T00:00:00Z"
slides:
  # Choose a theme from https://github.com/hakimel/reveal.js#theming
  theme: black
  # Choose a code highlighting style (if highlighting enabled in `params.toml`)
  #   Light style: github. Dark style: dracula (default).
  highlight_style: dracula
---

# Wowchemy で Markdown を使ってスライドを作成する

[Wowchemy](https://wowchemy.com/) | [ドキュメント](https://owchemy.com/docs/managing-content/#create-slides)

---

## 機能

- Markdown で効率的にスライドを書けます
- 3-in-1：スライドの作成・発表・公開ができます
- 発表者ノートに対応しています
- モバイル対応のスライド

---

## 操作

- 次へ：`Right Arrow` または `Space`
- 前へ：`Left Arrow`
- 最初：`Home`
- 最後：`End`
- 概要：`Esc`
- 発表者ノート：`S`
- 全画面：`F`
- ズーム：`Alt + Click`
- [PDF エクスポート](https://github.com/hakimel/reveal.js#pdf-export)：`E`

---

## コードハイライト

インラインコード：`variable`

コードブロック：
```python
porridge = "blueberry"
if porridge == "blueberry":
    print("Eating...")
```

---

## 数式

インライン数式：$x + y = z$

ブロック数式：

$$
f\left( x \right) = \;\frac{{2\left( {x + 4} \right)\left( {x - 4} \right)}}{{\left( {x + 4} \right)\left( {x + 1} \right)}}
$$

---

## フラグメント

コンテンツを少しずつ表示します

```
{{%/* fragment */%}} One {{%/* /fragment */%}}
{{%/* fragment */%}} **Two** {{%/* /fragment */%}}
{{%/* fragment */%}} Three {{%/* /fragment */%}}
```

`Space` を押して再生してください！

{{% fragment %}} 1つ目 {{% /fragment %}}
{{% fragment %}} **2つ目** {{% /fragment %}}
{{% fragment %}} 3つ目 {{% /fragment %}}

---

フラグメントは2つの任意パラメータを受け取れます：

- `class`：カスタムスタイルを使用します（カスタム CSS での定義が必要です）
- `weight`：フラグメントが表示される順序を設定します

---

## 発表者ノート

プレゼンテーションに発表者ノートを追加します

```markdown
{{%/* speaker_note */%}}
- Only the speaker can read these notes
- Press `S` key to view
{{%/* /speaker_note */%}}
```

`S` キーを押すと発表者ノートを表示できます！

{{< speaker_note >}}
- このノートは発表者だけが読めます
- `S` キーを押すと表示されます
{{< /speaker_note >}}

---

## テーマ

- black：黒い背景、白い文字、青いリンク（デフォルト）
- white：白い背景、黒い文字、青いリンク
- league：灰色の背景、白い文字、青いリンク
- beige：ベージュの背景、濃い文字、茶色のリンク
- sky：青い背景、細い濃色の文字、青いリンク

---

- night：黒い背景、太い白い文字、オレンジのリンク
- serif：カプチーノ色の背景、灰色の文字、茶色のリンク
- simple：白い背景、黒い文字、青いリンク
- solarized：クリーム色の背景、濃い緑の文字、青いリンク

---

{{< slide background-image="/media/boards.jpg" >}}

## カスタムスライド

スライドのスタイルと背景をカスタマイズします

```markdown
{{</* slide background-image="/media/boards.jpg" */>}}
{{</* slide background-color="#0000FF" */>}}
{{</* slide class="my-style" */>}}
```

---

## カスタム CSS の例

見出しを濃紺（navy）にしてみましょう。

`assets/css/reveal_custom.css` を作成し、次を記述します：

```css
.reveal section h1,
.reveal section h2,
.reveal section h3 {
  color: navy;
}
```

---

# 質問はありますか？

[質問する](https://github.com/wowchemy/wowchemy-hugo-modules/discussions)

[ドキュメント](https://wowchemy.com/docs/managing-content/#create-slides)
