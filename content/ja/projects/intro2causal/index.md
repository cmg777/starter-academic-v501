---
date: "2026-04-22T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: AIを活用した因果推論の実践的な学習ガイド。Pythonノートブック付き
tags:
- python
- causal
title: "因果メトリクスをマスターする"

links:
  - name: "ウェブサイト"
    url: "https://cmg777.github.io/intro2causal/"
    icon_pack: ai
    icon: open-data
  - name: "学習ガイド"
    url: "https://cmg777.github.io/intro2causal/book/_book/index.html"
    icon_pack: fas
    icon: book

url_pdf: ""
url_slides: ""
url_video: ""
---

## 因果メトリクスをマスターするへようこそ！

**因果メトリクスをマスターする**のための、AIを活用した学習ガイドです。Angrist & Pischke の基礎的な教科書 [*Mastering 'Metrics: The Path from Cause to Effect*](https://www.masteringmetrics.com/) をもとに、インタラクティブなPythonノートブックとAIツールを使って因果推論の基礎を学びます。

本プラットフォームには以下が含まれます。

- **基礎的な手法** -- Angrist & Pischke の *Mastering 'Metrics* に基づきます。ランダム化試験から差分の差分法まで、因果推論を学びます。
- **Pythonノートブック** -- インストール不要のGoogle Colabノートブック。実データ、動作するコード、各手法の完全な実装を備えています。
- **AIを活用した学習** -- 異なる教育スタイルを持つ複数のAIチューター。


## インタラクティブなGoogle Colabノートブック

下記のいずれかのバッジをクリックすると、ブラウザ上で即座に開いて実行できます。

### 第I部：概念的枠組み

| 章 | タイトル | トピック | Colabノートブック |
|---------|-------|--------|----------------|
| **1** | ランダム化試験 | 選択バイアス、潜在的結果、RAND HIE | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/01-randomized-trials.ipynb) |

### 第II部：5つのツール

| 章 | タイトル | トピック | Colabノートブック |
|---------|-------|--------|----------------|
| **2** | 回帰 | OLS、欠落変数バイアス、不適切な統制変数 | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/02-regression.ipynb) |
| **3** | 操作変数 | LATE、コンプライアー、ミネアポリスの家庭内暴力実験 | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/03-instrumental-variables.ipynb) |
| **4** | 回帰不連続デザイン | シャープRD、バンド幅、飲酒の法定年齢と死亡率 | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/04-regression-discontinuity.ipynb) |
| **5** | 差分の差分法 | 平行トレンド、双方向固定効果、大恐慌期の銀行 | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/05-differences-in-differences.ipynb) |

### 第III部：総合

| 章 | タイトル | トピック | Colabノートブック |
|---------|-------|--------|----------------|
| **6** | 教育の収益 | 双子、出生四半期、学位の効果 | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/intro2causal/blob/main/notebooks_colab/06-wages-of-schooling.ipynb) |


### ノートブックの使い方

1. 上記のいずれかの **「Open in Colab」バッジをクリックします**
2. Googleアカウント（無料）で **ログインします**
3. ランタイムメニューの **「すべて実行」をクリックします**（または各セルを個別に実行します）
4. **探索して変更します** -- パラメータを変えたり、別のモデルを試したり、データで実験したりできます
5. **作業を保存します** -- ファイル ＞ ドライブにコピーを保存 で、変更内容を保持できます

**インストール不要、ダウンロード不要、設定不要！**


## 著者とクレジット

**Carlos Mendez** -- Pythonでの実装および教育用ノートブックの開発

**Joshua D. Angrist & Jorn-Steffen Pischke** -- 原著教科書 [*Mastering 'Metrics*](https://www.masteringmetrics.com/)
