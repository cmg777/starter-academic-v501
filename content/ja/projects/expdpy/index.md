---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: パネルデータをインタラクティブに探索するためのPythonライブラリ。Plotlyの図や出版品質の表を生成する組み合わせ可能な関数に加え、ノーコードのStreamlitおよびShinyのウェブアプリを提供します。
tags:
- python
- panel
title: "expdpy"

links:
  - name: "ウェブサイト"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "クイックスタート（Colab）"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb"
    icon_pack: fab
    icon: google
  - name: "Streamlit アプリ"
    url: "https://expdpy.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "API リファレンス"
    url: "https://cmg777.github.io/expdpy/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/cmg777/expdpy"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## expdpy — パネルデータをインタラクティブに探索

**expdpy** は、パネルデータおよびクロスセクションデータのための探索的データ分析ツールキットで、モダンなPythonツール（Plotly、pyfixest、Great Tables）の上に構築されています。組み合わせ可能な分析関数と2つのノーコードウェブアプリを兼ね備えており、R パッケージ ExPanDaR の Python 移植版です。

### はじめに

- **[クイックスタート用ノートブック（Colab）](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb)** — インストール不要で、ブラウザ上でパッケージを最初から最後まで実行できます。
- **[オンラインアプリ（Streamlit）](https://expdpy.streamlit.app/)** — 付属のデータセットを、コードを書かずに探索できます。
- **[API リファレンス](https://cmg777.github.io/expdpy/reference/)** — 関数レベルの完全なドキュメント。

### 主な機能

- **探索** — 記述統計、相関行列、極値の検出、ヒストグラム、時系列・分位点トレンド、グループ別の棒／バイオリングラフ、および LOESS 平滑化（任意）付きの散布図。
- **モデリング** — 多元固定効果とクラスター頑健標準誤差、出版品質の回帰表、Frisch–Waugh–Lovell 部分回帰プロット、外れ値処理（ウィンソライズ／切り捨て）。
- **再現** — 任意のセッションを Jupyter ノートブック、Python スクリプト、または整形済みデータセットとして書き出し、アプリ間で設定を引き継げます。

### 使用例

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # 80か国の合成パネル
ex.prepare_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).show()
```

### 2つのノーコードアプリ

同じ分析を、マルチページの **Streamlit** アプリ（クラウドにデプロイ可能）と単一ビューの **Shiny for Python** アプリを通じて、コードを書かずにブラウザ上で利用できます。

### サンプルデータ

expdpy には、N字型の格差曲線を示すための合成 **Kuznets** パネル（80か国、2015〜2025年）と、**Gapminder** データセットが付属しています。

### インストール

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy は、Joachim Gassen 氏と TRR 266 プロジェクトによる R パッケージ [ExPanDaR](https://github.com/joachim-gassen/ExPanDaR) の Python 移植版です。研究での利用の際は、原典を引用してください。MIT ライセンスの下で公開されています。
