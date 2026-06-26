---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: パネルデータをインタラクティブに探索・分析・学習するためのPythonライブラリ。Plotlyの図や出版品質の表を生成する組み合わせ可能な関数に加え、ノーコードの3つのStreamlitウェブアプリ（探索・分析・学習）を提供します。
tags:
- python
- panel
title: "expdpy"

links:
  - name: "ウェブサイト"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/expdpy/"
    icon_pack: fab
    icon: python
  - name: "クイックスタート（Colab）"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "探索アプリ"
    url: "https://expdpy-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "分析アプリ"
    url: "https://expdpy-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "学習アプリ"
    url: "https://expdpy-learn.streamlit.app/"
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

## expdpy — パネルデータをインタラクティブに探索・分析・学習

**expdpy** は、パネルデータおよびクロスセクションデータのための探索的データ分析ツールキットで、モダンなPythonツール（Plotly、pyfixest、Great Tables）の上に構築されています。組み合わせ可能な分析関数と3つのノーコードStreamlitウェブアプリを兼ね備えており、R パッケージ ExPanDaR の Python 移植版です。

### はじめに

- **[クイックスタート用ノートブック（Colab）](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)** — インストール不要で、ブラウザ上でパッケージを最初から最後まで実行できます。
- **ノーコードアプリ（Streamlit）** — 付属のデータセットを、コードを書かずに[探索](https://expdpy-explore.streamlit.app/)・[分析](https://expdpy-analyze.streamlit.app/)・[学習](https://expdpy-learn.streamlit.app/)できます。
- **[API リファレンス](https://cmg777.github.io/expdpy/reference/)** — 関数レベルの完全なドキュメント。

### 主な機能

- **探索** — 記述統計・相関・極値の表、ヒストグラム、棒グラフ、時系列・分位点トレンド、グループ別ビュー、欠損値ヒートマップ、LOESS 平滑化付きの散布図、級内／級間（within／between）分解、ユニット別の軌跡、パネル構造の診断、分布・遷移ダイナミクス、外れ値処理。
- **分析** — pyfixest による多元固定効果とクラスター頑健標準誤差、プールド（pooled）・級間（between）・固定効果・変量効果の各推定量、相関変量効果（Mundlak）推定量とハウスマン検定、推定後ツール（固定効果プロット、予測、Wald 検定）、頑健な推測（ランダム化推測、ワイルドクラスターブートストラップ）、Frisch–Waugh–Lovell プロットと係数プロット、イベントスタディ／時差のある差分の差分法、β・σ・クラブ収束、クズネッツ波形曲線。
- **学習** — `.interpret()` と `.explain()` メソッドを備えた27の概念解説に加え、データをシミュレートして一階差分、固定効果、クラスタリング、欠落変数バイアス、収束分析を学べる9つの概念サンドボックス。

### 使用例

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # 80か国の合成パネル
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

### 3つのノーコードアプリ

同じ分析を、マルチページの3つの **Streamlit** アプリ — **探索**・**分析**・**学習**（クラウドにデプロイ可能） — を通じて、コードを書かずにブラウザ上で利用できます。

### サンプルデータ

expdpy には複数の組み込みデータセットが付属しています。N字型の格差曲線を示すための合成 **kuznets** パネル（80か国、2015〜2025年）、**gapminder**、**staggered_did**、**productivity**、**bolivia112_gdppc** です。

### インストール

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # ノーコードの Streamlit アプリを追加
```

expdpy は Python 3.10 以上が必要です。最新の未公開バージョンは GitHub からインストールできます。

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy は、Joachim Gassen 氏と TRR 266 プロジェクトによる R パッケージ [ExPanDaR](https://github.com/trr266/ExPanDaR) の Python 移植版です。研究での利用の際は、原典を引用してください。MIT ライセンスの下で公開されています。
