---
date: "2026-07-02T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: 地域の成長・収束・格差を空間的に探索・分析・学習するためのPythonライブラリ。明示的な空間手法、インタラクティブなPlotlyの図や出版品質の表に加え、ノーコードの3つのStreamlitウェブアプリ（探索・分析・学習）を提供します。
tags:
- python
- spatial
- regional
title: "geometrics"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/geometrics/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geometrics/"
    icon_pack: fab
    icon: python
  - name: "クイックスタート（Colab）"
    url: "https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "探索アプリ"
    url: "https://geometrics-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "分析アプリ"
    url: "https://geometrics-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "学習アプリ"
    url: "https://geometrics-learn.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "API リファレンス"
    url: "https://quarcs-lab.github.io/geometrics/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geometrics"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**地域の成長・収束・格差 — 空間的に、Pythonで。**

`geometrics` は [PySAL](https://pysal.org/) ファミリーを基盤とし、地域収束の文献における標準的な分析を、インタラクティブな [Plotly](https://plotly.com/python/) の図、出版品質の [Great Tables](https://posit-dev.github.io/great-tables/)、整然とした（tidy）DataFrame を返す適用しやすい関数にまとめています。**探索／分析／学習**のワークフローに、すべての結果を解釈・説明する組み込みの**学習レイヤー**と**3つのノーコードアプリ**を組み合わせています。学生、教員、応用研究者のいずれにも役立つように作られています。

### 🗺️ [探索](https://quarcs-lab.github.io/geometrics/explore.html)

地域を地図化し記述します。分類・アニメーション化されたコロプレス図、空間重みの接続性、**モランの散布図と LISA クラスターマップ**、時空間ビュー。

[🚀 アプリを開く](https://geometrics-explore.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb)

### 🧮 [分析](https://quarcs-lab.github.io/geometrics/analyze.html)

モデルを推定します。**β・σ・クラブ収束**、インパクトを伴う空間計量経済モデル、マルコフおよび空間マルコフのダイナミクス、空間分解を伴う**ジニ／タイルの格差**、GWR／マルチスケール GWR。

[🚀 アプリを開く](https://geometrics-analyze.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/analyze.ipynb)

### 📚 [学習](https://quarcs-lab.github.io/geometrics/learn.html)

手法の背後にある考え方を確かめます。既知の真実を自分で調整できる**11個の実行可能な概念サンドボックス**、**30トピック**の解説インデックス、そしてすべての結果に対する平易な言葉での解説。

[🚀 アプリを開く](https://geometrics-learn.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/learn.ipynb)

## ブラウザでアプリを試す

インストールもコードも不要 — 3つの `geometrics` アプリが、ワークフロー全体をブラウザ上で実行します。ポイント＆クリックの地図とモデル、ソート可能な表、再現可能なエクスポート。それぞれがドキュメントのケーススタディに対応するノーコード版です。

[🗺️ 探索アプリ](https://geometrics-explore.streamlit.app/) · [🧮 分析アプリ](https://geometrics-analyze.streamlit.app/) · [📚 学習アプリ](https://geometrics-learn.streamlit.app/)

## 機能の概要

**地図と ESDA** — 分類／アニメーション化されたコロプレス図、空間重みの接続性、モランの散布図、LISA クラスターマップ、時系列でのモランの I。

**時空間ダイナミクス** — 横断面分布の推移とエンティティ×時間のヒートマップ。

**収束** — OLS または空間推定量による β 収束、σ 収束、そしてクラブマップ付きの Phillips–Sul 収束クラブ。

**空間計量経済学** — `spreg` スイート、モデル推奨付きの LM 診断、代替的な重みによる頑健性。

**分布ダイナミクス** — マルコフおよび空間マルコフの遷移分析。

**格差** — 空間分解を伴うジニ／タイルのトレンド、タイルの級間／級内分解。

**局所モデル** — 局所係数を地図化した GWR とマルチスケール GWR。

**概念サンドボックス** — 既知のデータ生成過程からデータをシミュレートする11個の教育用関数。

## 付属のケーススタディ

`geometrics.data` には、すぐに分析できる2つのケーススタディが付属しています。

- **インド** — 520の地区、衛星による夜間光（1996〜2010年）：`gm.data.load_india()`、`load_india_states()`。
- **ボリビア** — PWT に基づく地域 GDP（2021年購買力平価の米ドル、2012〜2022年）を3つの地理的スケールで：`gm.data.load_bolivia()`（112の郡）、`load_bolivia_departments()`（9の県）、`load_bolivia_grid()`（1,603のグリッドセル）。

## インストール

最新リリースを PyPI からインストールします（基本インストールでほとんどのワークフローに対応します。エクストラでマルコフのダイナミクス、ノーコードアプリ、PNG エクスポートを追加できます）。

```bash
pip install geometrics                 # core
pip install "geometrics[dynamics]"     # + Markov / spatial Markov (giddy)
pip install "geometrics[streamlit]"    # + the three no-code apps
pip install "geometrics[all]"          # everything, incl. PNG export
```

Python 3.11 以上が必要です。

## ひと目で

付属のケーススタディを読み込み、変数ラベルを付与して地図化します — すべての図はインタラクティブな Plotly オブジェクトです。

```python
import geometrics as gm

# India — 520 districts, satellite nighttime lights (1996–2010)
gdf, df, df_dict = gm.data.load_india()
df = gm.set_labels(df, df_dict, set_panel=True)

# A classified choropleth of nighttime lights in 2010
gm.explore_choropleth_map(df, "ntl_total", gdf=gdf, period=2010).fig
```

**収束を推定し、それ自身に説明させる** — β 収束と σ 収束、それぞれに平易な言葉での解説を添えて。

```python
beta = gm.analyze_beta_convergence(df, "ntl_total", model="ols")
print(beta.interpret())          # plain-language, associational reading

sigma = gm.analyze_sigma_convergence(df, "ntl_total")
```

**学びながら進む** — 概念サンドボックスと解説。

```python
gm.learn_beta_convergence(convergence_rate=0.02)  # a runnable concept sandbox
print(gm.explain("spatial_autocorrelation"))      # a concept explainer; gm.list_topics() lists all 30
```

[探索](https://quarcs-lab.github.io/geometrics/explore.html)、[分析](https://quarcs-lab.github.io/geometrics/analyze.html)、[学習](https://quarcs-lab.github.io/geometrics/learn.html) で各関数の動作をご覧ください。

## 基盤

`geometrics` は、空間分析エコシステム [PySAL](https://pysal.org/) とモダンな Python のデータスタックの上に成り立っています。

- **[PySAL](https://pysal.org/)** — `libpysal`（重み）、`esda`（モランの I／LISA）、`giddy`（分布ダイナミクス）、`inequality`（ジニ／タイル）、`mapclassify`（コロプレス図の分類）、`spreg`（空間回帰）、`mgwr`（マルチスケール GWR）
- **[geopandas](https://geopandas.org/)** — 地理空間データフレーム
- **[Plotly](https://plotly.com/python/)** — インタラクティブな図
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — 出版品質の表

## 謝辞

`geometrics` は [QuaRCS Lab](https://quarcs-lab.org)（定量地域・計算科学）で開発されており、[PySAL](https://pysal.org/) プロジェクト、geopandas、Plotly、Great Tables の上に成り立っています。研究で `geometrics` を使用する際は、リポジトリ（[`CITATION.cff`](https://github.com/quarcs-lab/geometrics/blob/main/CITATION.cff) を参照）および基盤となる PySAL パッケージを引用してください。
