---
date: "2026-07-28T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: ドナープールに対するSUTVAを外した合成コントロールモデルのPythonパッケージ。処理がコントロール群に及ぶことを許し、いずれのモデルも2つの推定対象——汚染を取り除いた処理群への効果と、各ドナーが受け取るスピルオーバー——を報告します。
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
  - name: "モデル"
    url: "https://quarcs-lab.github.io/scspill/models/"
    icon_pack: fas
    icon: layer-group
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

**処理が漏れ出すときの合成コントロール — 処理群への効果と、各ドナーが受け取るスピルオーバーを。**

`scspill` は、ドナープールに対するSUTVAを外した合成コントロールモデルのPythonパッケージです。処理がコントロール群に及ぶことを許し、いずれのモデルも2つの推定対象を報告します。すなわち、汚染を取り除いた処理群への効果と、各ドナーが受け取るスピルオーバー効果です。後者は従来の合成コントロールでは表現すること自体ができません。現在利用できるモデル `sar` は、ユーザーが指定した空間重みを通じてスピルオーバーを伝え、その大きさを単一の強度パラメータ ρ で調整します。この ρ は**仮定するのではなく推定されます**。合成ウェイトは制約を課さないホースシュー（horseshoe）縮小推定で求めるため、ドナーは除外されることも、負の値をとることも、外挿することもできます。そして2つの推定対象いずれについても完全なベイズ的不確実性を返します。ρ = 0 のとき、モデルはベイズ的ホースシュー合成コントロールに厳密に一致します。推定器のアーキテクチャは [mlsynth](https://github.com/jgreathouse9/mlsynth)（pydanticの設定を入力とし、標準化された結果オブジェクトを出力する）に従い、`method` の名称は同ライブラリの `SPILLSYNTH` ディスパッチャと一致するため、両者は自然に組み合わせられます。

### 🚀 [はじめに](https://quarcs-lab.github.io/scspill/get-started.html)

カリフォルニア州の提案99（Proposition 99）を対象に、およそ10行でモデルを推定します。**95%信用区間付きのATT**、スピルオーバー強度 ρ、各ドナーが年ごとに受け取るスピルオーバー、MCMC診断、反事実プロットが得られます。

[▶ Colab で開く](https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb)

### 🧬 [モデル](https://quarcs-lab.github.io/scspill/models/)

現在提供されているモデルは1つ、[`sar`](https://quarcs-lab.github.io/scspill/models/sar.html) です。[Sakaguchi・Tagawa (2026)](https://doi.org/10.1093/ectj/utag006) による、空間自己回帰型スピルオーバーを備えたベイズ合成コントロールです。さらに3つのスピルオーバー対応モデルが[ロードマップ](https://quarcs-lab.github.io/scspill/models/#planned)にあります。Cao・Dowd のモデル、Di Stefano・Mellace の包括的合成コントロール、Grossi ほかによる部分干渉SCGです。これらは**未実装**であり、`SCSPILLConfig` はこれらの名称を黙って別のモデルで代替せず、明示的に拒否します。

### 🧪 [検証](https://quarcs-lab.github.io/scspill/articles/validation.html)

`sar` のサンプラーが正しいことを示す証拠です。**Geweke (2004) の同時分布検定**、事前分布の感度グリッド、事前予測チェック、そして著者らのR実装による固定済み信用区間との交差検証。

## 機能の概要

**`scspill`** — モデル層。`SCSPILL(config).fit()` は、ATTとその信用区間、反事実の経路、ρ の事後分布、時点×ドナーのスピルオーバーパネル、MCMC診断を返します。

**`scspill.validation`** — `sar` のサンプラー検証。Gewekeの同時分布検定、事前分布の感度グリッド、事前予測チェック。

**`scspill.simulate`** — `sar` の[モンテカルロエンジン](https://quarcs-lab.github.io/scspill/articles/simulation-study.html)。ルーク型格子によるSARデータ生成過程と、論文の表1・表2の基礎となる SCM / BSCM / SCSPILL の比較です。

**`scspill.data`** — 以下のスピルオーバーパネル。モデルに依存しない形式のため、今後追加されるモデルでもそのまま利用できます。

**`sar` は実装されているだけでなく検証されています** — 著者らのRレプリケーションパッケージと交差検証されています。カリフォルニアとスーダンの事後分布は固定済みのR信用区間と、モンテカルロのグリッドは論文の固定済みの表と、事前予測統計量は小数第3位まで照合されています。既定の設定は*論文に忠実*で、参照実装に残る複数の既知の不具合が修正されており、それぞれに従来挙動へ戻す手段か差分を定量化したベンチマークが用意されています。詳しくは [`sar` モデルのページ](https://quarcs-lab.github.io/scspill/models/sar.html)をご覧ください。

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

付属のケーススタディを読み込み、サンプラーを実行して、2つの推定対象を確認します。

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

推定器の動きは、[はじめに](https://quarcs-lab.github.io/scspill/get-started.html)、[モデル](https://quarcs-lab.github.io/scspill/models/)、[検証](https://quarcs-lab.github.io/scspill/articles/validation.html)でご覧いただけます。

## 基盤

`scspill` は依存関係を意図的に軽く保っています。現代的なPythonの科学計算スタックのみで構成されています。

- **[NumPy](https://numpy.org)** と **[SciPy](https://scipy.org)** — サンプラーの計算基盤
- **[pandas](https://pandas.pydata.org)** — パネルとスピルオーバーの表
- **[pydantic](https://docs.pydantic.dev)** — 検証付きの推定器設定
- **[matplotlib](https://matplotlib.org)** — 診断図と反事実の図
- **[numba](https://numba.pydata.org)** — オプションのJITコンパイル済みサンプラー

## 謝辞

本Pythonパッケージは Carlos Mendez が執筆し、保守しています。`sar` モデルとそのオリジナルのR/C++実装は Shosei Sakaguchi 氏と Hayato Tagawa 氏によるものです。同モデルを利用する際は、両氏の論文を引用してください。両氏の[レプリケーションパッケージ](https://doi.org/10.5281/zenodo.19066186)はMITライセンスで公開されており、その著作権表示は本ライブラリの `LICENSE` に保持されています。また `scspill` の各リリースは、その固定済みの結果と交差検証されています。推定器のアーキテクチャは Jared Greathouse 氏の [mlsynth](https://github.com/jgreathouse9/mlsynth) に、ドキュメント基盤は QuaRCS Lab の [geometrics](https://github.com/quarcs-lab/geometrics) パッケージに倣っています。

`scspill` をご利用の際は、ソフトウェアと方法論の論文の両方を引用してください（機械可読なメタデータは [`CITATION.cff`](https://github.com/quarcs-lab/scspill/blob/main/CITATION.cff) にあります）。

> Mendez, C. (2026). *Synthetic Control Models with Spillovers in Python* (version 0.2.1). <https://github.com/quarcs-lab/scspill>

> Sakaguchi, S., & Tagawa, H. (2026). Identification and Bayesian Inference for Synthetic Control Methods with Spillover Effects. *The Econometrics Journal*. <https://doi.org/10.1093/ectj/utag006>

MITライセンスで公開されています。
