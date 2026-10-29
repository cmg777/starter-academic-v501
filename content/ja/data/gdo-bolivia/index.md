---
data_type: portal
region: bolivia
date: "2026-10-29T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Center
summary: ボリビアの339自治体の貧困・人口・衛星データを、地域開発を理解するための分析ツールや研究とともに探索できます。
tags:
- spatial
- python
- regional
title: ボリビアのジオ開発観測所（GeoDevelopment Observatory）
links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
url_code: "https://github.com/quarcs-lab/geo4bolivia"
url_pdf: ""
url_slides: ""
url_video: ""
---

ボリビアの地域間で開発状況はどのように異なり、衛星からその違いをどこまで読み取れるのでしょうか。<strong>ボリビアのジオ開発観測所（GDO-Bolivia）</strong>は、これらの問いに取り組むために、一般公開データ、分析ツール、研究の知見をまとめたプラットフォームです。衛星画像、国勢調査、行政記録に基づく指標と再現可能な分析手順を結び付け、研究者、政策担当者、市民の利用を支援します。

## データを探索する

現在の指標コレクションは、**339自治体**の共通の地理区分を使用しています。対応する識別子によって、自治体を郡（province）や県（department）と結び付けられます。各データセットのページには、変数、出典、参照年、ライセンス条件が記載されています。

| コレクション | 現在の対象期間・内容 |
|---|---|
| [持続可能な開発目標の指標](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-sdg/) | 2010～2020年の異なる参照年を持つ64指標です。完全な年次系列ではなく、各指標はそれぞれの参照年に保存されています。 |
| [一人当たり夜間光](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-ntl/) | 2012～2020年です。地域の経済活動を捉える衛星由来の代理指標です。 |
| [人口](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-pop/) | 2001～2020年のグリッド人口推計と人口密度です。 |
| [衛星埋め込み表現](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-emb/) | 2017年の衛星由来の64特徴量です。面積加重版と人口加重版があります。 |

対象期間や利用可能な値は、コレクションと変数によって異なります。年を比較したり指標を結合したりする前に、説明資料を確認してください。地図は統計・情報提供を目的としており、公式の領土境界を定義するものではありません。

## 分析を始める

[geo4boliviaのクイックスタート](https://quarcs-lab.github.io/geo4bolivia/tools/geo4bolivia-quickstart/)では、データの読み込み、手元の表と共通の地理識別子との結合、地域区分をまたぐ指標の集計を学べます。[ツール集](https://quarcs-lab.github.io/geo4bolivia/#tools)には、Pythonパッケージ、Google Colabノートブック、対話型ウェブアプリがあり、貧困、空間的不平等、機械学習の分析例を提供しています。

研究の利用例として、[人的資本に関する解説](https://quarcs-lab.github.io/geo4bolivia/insights/human-capital-paper/)をご覧ください。質問、指標の提案、分析の共有には、[GitHub Discussions](https://github.com/quarcs-lab/geo4bolivia/discussions)をご利用ください。

## 観測所の引用方法

> Mendez, C. (2026). *GeoDevelopment Observatory of Bolivia*. https://quarcs-lab.github.io/geo4bolivia/

特定のデータセットを利用する場合は、そのページの案内に従い、データセットと元の資料も引用してください。

*表紙画像：GDO-Boliviaのサンタクルス表示のスクリーンショットです。衛星画像：EOX IT Services GmbHのSentinel-2 cloudless 2016（加工されたCopernicus Sentinelデータ、CC BY 4.0）とNASA Blue Marbleです。*
