---
date: "2026-05-17T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: 現代的な因果推論の手法を用いた地域インパクト評価への入門。完全な再現性を実現するため、解説付きの実例と一般公開データを提供します。
tags:
- r
- causal
- regional
title: "比較因果メトリクス（Comparative Causal Metrics）"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/ccm"
    icon_pack: ai
    icon: open-data
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/ccm"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## 比較因果メトリクスへようこそ！（開発中）

*地域インパクト評価への入門*

RとQuartoで実装・レンダリングされた現代的な因果推論の手法を用いた**地域インパクト評価**への入門です。本リソースは、政策や介入が地域の成果に及ぼす効果を評価するための準実験的手法を扱い、完全な再現性を実現するため解説付きの実例と一般公開データを提供します。

開発中の本書には以下が含まれます。

- **手法の比較ツアー** — 分割時系列分析や差分の差分法から、合成コントロール、ベイズ構造時系列、そして最新のパネルデータ推定量まで、地域比較の視点に基づいて解説します。
- **R + Quarto ノートブック** — 折りたたみ可能なコードを備えた再現可能な各章。ローカルでレンダリングしたり、ご自身のデータで拡張したりできます。

本書は2つの部で構成されています。

- **第I部 — 単一処置ユニット（第1〜9章）** では、カリフォルニア州の1989年「提案99」たばこ税という単一の事例を用いて直観を養います。
- **第II部 — 段階的導入（第10〜12章）** では、多数のユニットが異なる時点で政策を導入する状況へと進み、Callaway–Sant'Anna の最低賃金に関する郡パネルを用います。


## 章構成

**第I部 — 単一処置ユニット**

1. [はじめに](https://quarcs-lab.github.io/ccm/01-introduction.html)
2. [分割時系列分析](https://quarcs-lab.github.io/ccm/02-interrupted-time-series.html)
3. [基本的な差分の差分法](https://quarcs-lab.github.io/ccm/03-basic-diff-in-diff.html)
4. [古典的な合成コントロール](https://quarcs-lab.github.io/ccm/04-classical-synthetic-control.html)
5. [拡張合成コントロール](https://quarcs-lab.github.io/ccm/05-augmented-synthetic-control.html)
6. [合成差分の差分法](https://quarcs-lab.github.io/ccm/06-synthetic-did.html)
7. [ベイズ構造時系列](https://quarcs-lab.github.io/ccm/07-structural-bayesian-ts.html)
8. [予測区間付き合成コントロール](https://quarcs-lab.github.io/ccm/08-synthetic-control-prediction-intervals.html)
9. [ベイズ空間合成コントロール](https://quarcs-lab.github.io/ccm/09-bayesian-spatial-sc.html)

**第II部 — 段階的導入**

10. [段階的差分の差分法](https://quarcs-lab.github.io/ccm/10-staggered-did.html)
11. [交互作用固定効果と行列補完](https://quarcs-lab.github.io/ccm/11-matrix-completion-and-ife.html)
12. [一般化合成コントロール](https://quarcs-lab.github.io/ccm/12-gsynth.html)

さらに：[参考文献](https://quarcs-lab.github.io/ccm/references.html)


[https://github.com/quarcs-lab/ccm](https://github.com/quarcs-lab/ccm) で貢献やコメントをお寄せください。


## 関連プロジェクト

補完リソース：[因果メトリクスをマスターする](/project/intro2causal/) — Angrist & Pischke の *Mastering 'Metrics* に基づく、AIを活用したPythonの学習ガイドです。
