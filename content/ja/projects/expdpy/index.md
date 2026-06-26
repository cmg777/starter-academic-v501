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

**パネルデータをインタラクティブに探索・分析・学習 — Pythonで。**

`expdpy` は、インタラクティブな [Plotly](https://plotly.com/python/) の図と出版品質の [Great Tables](https://posit-dev.github.io/great-tables/) を返す組み合わせ可能な関数に、**fixest スタイルの計量経済学**、すべての結果を解釈・説明する組み込みの**学習レイヤー**、そして**3つのノーコードアプリ**を組み合わせています。学生、教員、応用研究者のいずれにも役立つように作られています。

### 🔍 [探索](https://cmg777.github.io/expdpy/explore.html)

パネルを記述・可視化します。表、分布、欠損値マップ、時系列トレンド、グループ比較、散布図、**級内／級間（within／between）変動**、**パネルダイナミクス**。

[🚀 アプリを開く](https://expdpy-explore.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)

### 🧮 [分析](https://cmg777.github.io/expdpy/analyze.html)

モデルを推定します。固定効果／変量効果／**相関変量効果**、FWL、ハウスマン検定、頑健な推測、**イベントスタディ／DiD**、**β／σ／クラブ収束**、**クズネッツ波形**曲線。

[🚀 アプリを開く](https://expdpy-analyze.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/analyze.ipynb)

### 📚 [学習](https://cmg777.github.io/expdpy/learn.html)

手法の背後にある考え方を確かめます。既知の真実を自分で調整できる**9つの実行可能な概念サンドボックス**、**27トピック**の解説インデックス、そしてすべての結果に対する平易な言葉での解説。

[🚀 アプリを開く](https://expdpy-learn.streamlit.app/) · [▶ Colabで開く](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/learn.ipynb)

## ブラウザでアプリを試す

インストールもコードも不要 — 3つの `ExPdPy` アプリが、ワークフロー全体をブラウザ上で実行します。サンプルパイプライン、ポイント＆クリックの分析、ソート可能な表、再現可能なノートブックのエクスポート。それぞれがドキュメントのケーススタディに対応するノーコード版です。

[🔍 探索アプリ](https://expdpy-explore.streamlit.app/) · [🧮 分析アプリ](https://expdpy-analyze.streamlit.app/) · [📚 学習アプリ](https://expdpy-learn.streamlit.app/)

## 機能の概要

**探索** — 記述・相関・極値の表、ヒストグラムと棒グラフ、時系列・分位点トレンド、グループ別の棒／バイオリン／トレンドビュー、欠損値ヒートマップ、LOESS 平滑化（任意）付きの散布図、級内／級間（`xtsum`）分解、ユニット別の軌跡、パネル構造の診断、分布・遷移ダイナミクス、`treat_outliers`。

**分析** — [pyfixest](https://github.com/py-econometrics/pyfixest) による**多元固定効果**と**クラスター頑健標準誤差**付きの OLS、より充実した `analyze_estimation`（ステップワイズ／複数アウトカム、Newey–West・Driscoll–Kraay 標準誤差）、**プールド（pooled）／級間（between）／固定効果／変量効果**と**相関変量効果（Mundlak）**推定量、**ハウスマン検定**、推定後ツール（固定効果プロット、予測、Wald 同時検定）、**頑健な推測**（ランダム化推測、ワイルドクラスターブートストラップ）、**Frisch–Waugh–Lovell** プロットと**係数**プロット、最新の**イベントスタディ／時差のある差分の差分法**（`did2s`、Sun–Abraham、LP-DiD、動的 TWFE）、**β・σ・クラブ収束**、そしてプールド／級間／級内推定量による**クズネッツ波形**曲線。

**学習** — すべての結果が平易な言葉で語ります。`.interpret()` は**連関的（associational）**な解説を返し（デザインが裏付けない限り因果的な主張はしません）、`.explain()` ／ `explain(topic)` ／ `list_topics()` で**27**の概念解説を閲覧できます。**9つの概念サンドボックス**がデータをシミュレートし、既知の真実を*見て*調整できます — 一階差分 ≈ 平均除去 ≈ ダミー変数の恒等関係、固定効果、クラスタリング、欠落変数バイアス、β／σ／クラブ収束、クズネッツ波。

**付属データセット** — `expdpy.data` には、すぐに探索できるパネルが付属しています。**`kuznets`**（N字型クズネッツ曲線の代表的なデモ）、`gapminder`、**`staggered_did`**（イベントスタディ／DiD）、**`productivity`**、**`bolivia112_gdppc`**（収束）。データ辞書については [kuznets データセット](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) のページをご覧ください。

## インストール

最新リリースを PyPI からインストールします（変量効果、CRE、ハウスマン検定はそのまま利用できます。アプリには `streamlit` エクストラが必要です）。

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # the no-code ExPdPy apps (Streamlit)
```

[uv](https://docs.astral.sh/uv/) を使う場合：

```bash
uv pip install expdpy
uv pip install "expdpy[streamlit]"
```

最新の未公開バージョンは、`main` ブランチから直接インストールできます。

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

Python 3.10 以上が必要です。

## ひと目で

このドキュメント全体を通じた主要な例は、付属の `kuznets` パネル（80か国 × 2015〜2025年）です。地域間の格差が所得に対して **N字型のクズネッツ曲線**を描く合成データセットで、上昇し、下降し、非常に高い所得で再び上昇します。

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()
# The N-shaped regional Kuznets curve: regional inequality vs (log) GDP per capita
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

**回帰を実行し、それ自身に説明させる** — 二元固定効果、クラスター頑健標準誤差、平易な言葉での解説、係数プロット。

```python
res = ex.analyze_regression_table(
    df,
    dvs="gini_regional",
    idvs=["log_gdp_pc", "log_gdp_pc_sq", "log_gdp_pc_cu"],
    feffects=["country", "year"],
    clusters=["country"],
)
print(res.interpret())            # plain-language, associational reading
ex.analyze_coefficient_plot(res)  # themed coefficient plot with confidence intervals
```

**学びながら進む** — 概念サンドボックスと解説。

```python
ex.learn_first_differences()        # first differences ≈ demeaning ≈ dummy variables
print(ex.explain("fixed_effects"))  # a concept explainer; ex.list_topics() lists all 27
```

[探索](https://cmg777.github.io/expdpy/explore.html)、[分析](https://cmg777.github.io/expdpy/analyze.html)、[学習](https://cmg777.github.io/expdpy/learn.html) で各関数の動作を確認するか、[kuznets データセット](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) のページでデータ辞書をご覧ください。

## 基盤

`expdpy` は、モダンな Python のデータ・計量経済学スタックの上に成り立っています。

- **[Plotly](https://plotly.com/python/)** — インタラクティブな図
- **[pyfixest](https://github.com/py-econometrics/pyfixest)** — 固定効果および差分の差分法の推定量
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — 出版品質の表
- **[linearmodels](https://bashtage.github.io/linearmodels/)** — 変量効果／級間／相関変量効果とハウスマン検定
- **[Streamlit](https://streamlit.io/)** — ノーコードの `ExPdPy` アプリ

## 謝辞

expdpy は、**Joachim Gassen** 氏と **TRR 266 Accounting for Transparency** プロジェクトによる優れた R パッケージ [ExPanDaR](https://github.com/trr266/ExPanDaR) の Python 移植版として始まり、その基盤は今もその成果に深く着想を得ています。時を経て、expdpy は元のパッケージをはるかに超えて成長しました — fixest スタイルの推定量、イベントスタディ／差分の差分法のツール、変量効果・相関変量効果のパネルモデル、収束分析、結果を解釈・説明する組み込みの学習レイヤー — そして今後も進化を続けます。

ExPanDaR の作者の皆様に感謝します。研究で `expdpy` を使用する際は、原典を引用してください（[`CITATION.cff`](https://github.com/cmg777/expdpy/blob/main/CITATION.cff) を参照）。
