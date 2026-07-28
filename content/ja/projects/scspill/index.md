---
date: "2026-07-28T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: 処理が漏れ出す状況におけるベイズ的合成コントロールのためのPythonライブラリ。空間自己回帰チャネルを通じてSUTVAを緩め、処理群への効果と各ドナーが受け取るスピルオーバーの双方を、完全なベイズ的不確実性とともに推定します。
tags:
- python
- causal
- spatial
title: "scspill"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/scspill/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/scspill/"
    icon_pack: fab
    icon: python
  - name: "クイックスタート（Colab）"
    url: "https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb"
    icon_pack: fab
    icon: google
  - name: "はじめに"
    url: "https://quarcs-lab.github.io/scspill/get-started.html"
    icon_pack: fas
    icon: rocket
  - name: "手法"
    url: "https://quarcs-lab.github.io/scspill/articles/method.html"
    icon_pack: fas
    icon: square-root-alt
  - name: "検証"
    url: "https://quarcs-lab.github.io/scspill/articles/validation.html"
    icon_pack: fas
    icon: flask
  - name: "API リファレンス"
    url: "https://quarcs-lab.github.io/scspill/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/scspill"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**処理が漏れ出すときの合成コントロール — 政策効果と、各ドナーが受け取るスピルオーバーを。**

`scspill` は、[Sakaguchi・Tagawa](https://quarcs-lab.github.io/scspill/articles/method.html)（*Identification and Bayesian Inference for Synthetic Control Methods with Spillover Effects*, The Econometrics Journal）による空間スピルオーバー付きベイズ合成コントロールのPython実装です。従来の合成コントロールは、ドナーが政策の影響を受けないと仮定します。しかし処理が国境や貿易ネットワークを越えて漏れ出すと、この仮定は成り立たず推定値にバイアスが生じます。`scspill` は、ユーザーが指定した重みによる**空間自己回帰チャネル**を通じて処理がドナープールへ波及することを許し、SUTVAを緩めます。そのうえで、処理群への効果、各ドナーが受け取るスピルオーバー、スピルオーバーの強度を、いずれも完全なベイズ的不確実性とともに報告します。合成ウェイトには**単体制約を課さないホースシュー（horseshoe）正則化**を用いるため、ドナーは除外されることも、負の値をとることも、外挿することもできます。推定器は [mlsynth](https://github.com/jgreathouse9/mlsynth) のアーキテクチャ（pydanticの設定を入力とし、標準化された結果オブジェクトを出力する）に従っており、両ライブラリは自然に組み合わせられます。

### 🚀 [はじめに](https://quarcs-lab.github.io/scspill/get-started.html)

カリフォルニア州の提案99（Proposition 99）を対象に、およそ10行でモデルを推定します。**95%信用区間付きのATT**、スピルオーバー強度 ρ、各ドナーが年ごとに受け取るスピルオーバー、MCMC診断、反事実プロットが得られます。

[▶ Colab で開く](https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb)

### 📐 [手法](https://quarcs-lab.github.io/scspill/articles/method.html)

識別と**2段階のベイズサンプラー**を解説します。ホースシュー合成ウェイト、SARスピルオーバーブロック、スピルオーバー強度に対する適応的メトロポリス法。さらに、R版の参照実装と異なる既定の設定についても記載しており、それぞれに従来挙動へ戻す手段と差分を定量化したベンチマークが用意されています。

### 🧪 [検証](https://quarcs-lab.github.io/scspill/articles/validation.html)

サンプラーが正しいことを示す証拠です。**Geweke (2004) の同時分布検定**、事前分布の感度グリッド、事前予測チェック、そして著者らのR実装による固定済み信用区間との交差検証。

## 機能の概要

**推定** — `SCSPILL(config).fit()` は、ATTとその信用区間、反事実の経路、ρ の事後分布、時点×ドナーのスピルオーバーパネル、MCMC診断を返します。

**検証** — `scspill.validation` は、Gewekeの同時分布検定、事前分布の感度グリッド、事前予測チェックを実装します。

**シミュレーション** — `scspill.simulate` は、論文の[モンテカルロ研究](https://quarcs-lab.github.io/scspill/articles/simulation-study.html)を再現します。ルーク型格子によるSARデータ生成過程と、表1・表2の基礎となる SCM / BSCM / SCSPILL の比較です。

**データ** — `scspill.data` には、以下の2つのケーススタディが、パネルと空間重み行列とともに同梱されています。

**R版レプリケーションパッケージとの交差検証** — カリフォルニアとスーダンの事後分布は著者らのR版の固定済み信用区間と、モンテカルロのグリッドは論文の固定済み表と、事前予測統計量は小数第3位まで照合されています。

## 付属のケーススタディ

`scspill.data` には、すぐに推定できる2つの[データセット](https://quarcs-lab.github.io/scspill/articles/datasets.html)が含まれています。

- **カリフォルニア** — 提案99、39州（1970–2000年）。一人当たり紙巻たばこ販売量とルーク型隣接重み。`scspill.data.load_california()` で読み込みます。
- **スーダン** — 2011年の分離独立、アフリカ34か国（2000–2015年）。一人当たりGDPと貿易ネットワーク重み。`scspill.data.load_sudan()` で読み込みます。[スーダンのケーススタディ](https://quarcs-lab.github.io/scspill/sudan.html)で詳しく扱っています。

## インストール

最新リリースはPyPIから入手できます（基本のインストールはNumPy/SciPyのみ。`numba` エクストラでJITコンパイル済みサンプラーが追加されます）。

```bash
pip install scspill              # NumPy/SciPy sampler backend
pip install "scspill[numba]"     # + JIT-compiled samplers (~10x faster)
pip install "scspill @ git+https://github.com/quarcs-lab/scspill.git"   # latest
```

Python 3.10 以上が必要です。

## ひと目で

付属のケーススタディを読み込み、サンプラーを実行して、処理効果とスピルオーバーの双方を確認します。

```python
from scspill import SCSPILL
from scspill.data import load_california

panel = load_california()        # Prop 99 panel + rook-contiguity weights
result = SCSPILL(
    {**panel.config_kwargs(), "m_iter": 20_000, "burn": 10_000, "seed": 42}
).fit()

result.att, result.att_ci          # treatment effect on California + 95% CrI
result.rho_hat, result.rho_ci      # spillover intensity posterior
result.spillover_panel["Nevada"]   # the effect received by Nevada, per year
result.diagnostics()               # ESS / R-hat / MCSE per chain
result.plot(kind="panel")          # counterfactual | effect | top spillovers
```

推定器の動きは、[はじめに](https://quarcs-lab.github.io/scspill/get-started.html)、[手法](https://quarcs-lab.github.io/scspill/articles/method.html)、[検証](https://quarcs-lab.github.io/scspill/articles/validation.html)でご覧いただけます。

## 基盤

`scspill` は依存関係を意図的に軽く保っています。現代的なPythonの科学計算スタックのみで構成されています。

- **[NumPy](https://numpy.org)** と **[SciPy](https://scipy.org)** — サンプラーの計算基盤
- **[pandas](https://pandas.pydata.org)** — パネルとスピルオーバーの表
- **[pydantic](https://docs.pydantic.dev)** — 検証付きの推定器設定
- **[matplotlib](https://matplotlib.org)** — 診断図と反事実の図
- **[numba](https://numba.pydata.org)** — オプションのJITコンパイル済みサンプラー

## 謝辞

手法とその参照実装は Shosei Sakaguchi 氏と Hayato Tagawa 氏によるものです。推定器のアーキテクチャは Jared Greathouse 氏の [mlsynth](https://github.com/jgreathouse9/mlsynth) に倣っています。本パッケージは [QuaRCS Lab](https://quarcs-lab.org)（計量地域・計算科学）で開発された独立のPython移植版であり、MITライセンスで公開されています。研究で `scspill` をご利用の際は、方法論の論文とソフトウェア（[`CITATION.cff`](https://github.com/quarcs-lab/scspill/blob/main/CITATION.cff) を参照）を引用してください。
