---
date: "2026-11-20T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "ボリビアの自治体の開発はどのように変化し、どこに集まっているのか？geo4boliviaは観測所のデータを1行で読み込み、Pythonの地図と空間分析で答えます。"
tags:
- python
- spatial
- regional
title: "geo4bolivia"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geo4bolivia/"
    icon_pack: fab
    icon: python
  - name: "クイックスタート（Colab）"
    url: "https://colab.research.google.com/github/quarcs-lab/geo4bolivia/blob/main/notebooks/get-started.ipynb"
    icon_pack: fab
    icon: google
  - name: "APIリファレンス"
    url: "https://quarcs-lab.github.io/geo4bolivia/reference/"
    icon_pack: fas
    icon: book
  - name: "観測所"
    url: "https://quarcs-lab.github.io/gdo4bolivia/"
    icon_pack: fas
    icon: globe-americas
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geo4bolivia"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

<strong>ボリビアの地域データと空間データサイエンスの基本的な分析を、1つのPythonパッケージで。</strong>

`geo4bolivia`は、[ボリビアのジオ開発観測所](/ja/data/gdo-bolivia/)のPythonパッケージです。観測所のすべてのデータセットから変数を探して説明し（出典、ライセンス、実際の年、引用方法）、どの指標も地域名と境界付きの整然としたパネルとして1行で読み込み、変数ごとの規則に従って自治体、郡、県の間で集計します。さらに、基本的な分析をそれぞれ1回の呼び出しで実行します。各分析は、対話型の[Plotly](https://plotly.com/python/)図、表、結果の平易な解説を返します。

## 主な機能

**[探索](https://quarcs-lab.github.io/geo4bolivia/explore.html)**：相関、上位・下位の地域、分布、散布図、推移、そして1時点・複数時点・変化の階級区分図です。

**[空間的依存](https://quarcs-lab.github.io/geo4bolivia/articles/spatial-dependence.html)**：空間重み、モランのI、LISAクラスター地図です。

**[収束](https://quarcs-lab.github.io/geo4bolivia/articles/convergence.html)**：β収束（OLSまたは空間モデル）、σ収束、収束クラブです。

**[推移と移動性](https://quarcs-lab.github.io/geo4bolivia/articles/transitions.html)**：マルコフ連鎖と空間マルコフ連鎖、LISAの推移、順位の移動性です。

**[地域間不平等](https://quarcs-lab.github.io/geo4bolivia/articles/inequality.html)**：ジニ係数とタイル指数、グループ間・グループ内のタイル分解です。

**[モデル](https://quarcs-lab.github.io/geo4bolivia/articles/models.html)**：固定効果付き回帰、パネルモデル、空間診断、直接・間接効果を伴う空間モデルです。

**[空間的異質性](https://quarcs-lab.github.io/geo4bolivia/articles/heterogeneity.html)**：マルチスケール地理的加重回帰（MGWR）です。

**[独自の指標](https://quarcs-lab.github.io/geo4bolivia/articles/own-indicators.html)**：自治体コードによる表の結合、ラスターの地域別集計、集計と観測所形式での保存です。

## インストール

PyPIから最新版をインストールします（Python 3.11以上）：

```bash
pip install geo4bolivia                 # data, maps and the core analyses
pip install "geo4bolivia[dynamics]"     # + Markov transitions (giddy)
pip install "geo4bolivia[panel]"        # + panel models (linearmodels)
pip install "geo4bolivia[mgwr]"         # + multiscale GWR
pip install "geo4bolivia[all]"          # everything, incl. raster zonal statistics
```

## 使用例

```python
!pip install -q geo4bolivia
import geo4bolivia as geo

# Multidimensional poverty in Bolivia's 343 municipalities, ~2012 and ~2024
mpi = geo.load("sdg01", variables="sdg1_2_mpi")

res = geo.lisa(mpi, "sdg1_2_mpi", year=2024)   # where poverty clusters
print(res.interpret())
res.fig
```

[入門ガイド](https://quarcs-lab.github.io/geo4bolivia/get-started.html)、[記事](https://quarcs-lab.github.io/geo4bolivia/articles/)、[関数リファレンス](https://quarcs-lab.github.io/geo4bolivia/reference/)（英語）では、すべての関数をボリビアのデータで紹介しており、それぞれにColabノートブックがあります。[LLM向けページ](https://quarcs-lab.github.io/geo4bolivia/use-with-llms.html)と`llms.txt`は、AIアシスタントがこのパッケージで正しいコードを書くのに役立ちます。

## 謝辞

`geo4bolivia`は[QuaRCS Lab](https://quarcs-lab.org)で開発されています。分析機能は姉妹パッケージの[geometrics](/ja/software/geometrics/)と[expdpy](/ja/software/expdpy/)から移植したもので、両パッケージは引き続き専門的な手法のための補完ツールです。また、[PySAL](https://pysal.org/)、geopandas、statsmodels、Plotly、Great Tablesを基盤としています。ボリビアSDGアトラス2026のデータと自治体境界はSDSNボリビアによるもので、許可を得て使用しています。
