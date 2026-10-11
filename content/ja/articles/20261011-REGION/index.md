---
title: "インドの地域成長・収束・空間的波及効果：宇宙から捉える再現可能な分析"
authors:
- admin
- Sujana Kabiraj
- Jiaqi Li
date: "2026-10-11T00:00:00Z"
publishDate: "2026-10-11T00:00:00Z"
doi: "10.18335/region.v13i2.676"
publication_types: ["2"]
publication: "*REGION*, 13(2), 173–196"
publication_short: ""
abstract: "ChandaとKabiraj（2020, World Development）は、衛星夜間光データを経済活動の代理指標として用い、インドの520地区における地域成長と収束を研究しました。本論文は、再現可能なオープンサイエンスのアプローチに基づき、その主要な知見を実証面の三つの方向に拡張します。第一に、衛星画像のインタラクティブな可視化ツールを用いて地域収束のパターンを示します。第二に、先行研究の主要な計量経済モデルにおける空間的依存の程度を評価します。第三に、空間ダービンモデルを用いて、収束過程における空間的波及効果の役割を測定します。分析結果は、空間的波及効果を考慮すると地域収束の推定速度が高まることを示しています。すべての要素を含むモデルでは、波及効果によって収束速度が年率約3.0%から約5.2%に上昇し、地域格差の半減期が約23年から13年に短縮されます。最後に、インドの州における光の明るさと文化活動への参加の関係を探索的に分析し、同じ再現可能なワークフローが経済産出以外にも適用できることを示します。"
summary: "衛星夜間光から、インドの貧しい地区がどのように格差を縮めるかを調べます。近隣地区とのつながりを考慮すると推定される収束速度が高まり、格差の半分を縮めるために必要な期間は約23年から13年になります。"
tags:
- Regional convergence
- Spatial dependence
- Spatial Durbin model
- Nighttime lights
- Reproducible research
- India
featured: true
links:
- name: "出版論文（オープンアクセス）"
  url: "https://doi.org/10.18335/region.v13i2.676"
  icon_pack: fas
  icon: university
- name: "夜間光のインタラクティブ地図"
  url: "https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl"
  icon_pack: fas
  icon: globe
- name: "論文・ノートブック"
  url: "https://quarcs-lab.github.io/project2025s-py/index-preview.html"
  icon_pack: fas
  icon: book-open
url_pdf: "https://openjournals.wu.ac.at/ojs/index.php/region/article/download/676/542"
url_code: "https://github.com/quarcs-lab/project2025s-py"
url_dataset: ""
url_preprint: ""
url_slides: "https://carlos-mendez.org/articles/20261011-region/slides/index.html"
url_video: ""
url_poster: ""
url_project: ""
image:
  caption: ""
  alt_text: "インドの地区はどのくらいの速さで収束するのでしょうか。公表された地図は1996年と2010年の夜間光を比較しています。520地区を対象とするモデル4では、年間収束速度は通常の最小二乗法で3.0%、空間ダービンモデルで5.2%、対応する半減期は23年と13年です。波及効果を含めると推定される収束は速まりますが、これらはモデルの推定値であり、政策の因果効果ではありません。"
  focal_point: ""
  preview_only: false
---

## 研究の問い

貧しい地区は豊かな地区に追いついているのでしょうか。また、近隣地区とのつながりを考慮すると答えは変わるのでしょうか。本論文は、1人当たりの衛星夜間光を経済活動の代理指標として用い、**1996～2010年のインド520地区**の成長を再検討します。インタラクティブな可視化、空間的依存の検定、空間的波及効果のモデル化によって、ChandaとKabiraj（2020）の研究を拡張します。

## 近隣地区をモデルに含めると何が変わるのでしょうか

推奨するモデルには統制変数と州固定効果が含まれます。通常の最小二乗法と**空間ダービンモデルの総効果**を比較すると、モデルが示す収束速度は変化します。

| モデル4の推定値 | 通常の最小二乗法 | 空間ダービンモデル |
| :--- | ---: | ---: |
| 年間収束速度 | 3.0% | 5.2% |
| 格差の半減期 | 23年 | 13年 |

これらの丸められた数値は、出版論文の**184ページ、表3**に掲載されています。半減期とは、モデル上で定常状態までの初期格差の半分を縮めるのに必要な期間です。すべての地区が13年後に同じ所得水準に達するという意味ではありません。

空間モデルは、自地区と近隣地区に関する関連性を捉えます。頑健性の確認では、最も近い6地区を用いる基本設定と、六つの代替的な空間重み行列を比較しています。収束の直接効果と総効果は、七つすべての設定で負かつ統計的に有意です（表4）。

## この証拠から分かること

空間的なつながりは収束の測定に関わります。この分析は、ある地区の条件を変えることが別の地区の成長に与える因果効果を**識別するものではありません**。共通する地理、制度、インフラ、欠落変数、地区境界を越える光の広がりも、空間的依存の要因となりえます。また、推定値は14年間の単一の成長期間を要約しており、年ごとの変化を捉えるものではありません。

最後の探索的分析では、インドの州における光の明るさと文化活動への参加を関連づけています。再現可能なワークフローを経済産出以外にも利用できることを示すもので、夜間光は電化や都市化も反映しています。

## 分析を再現して学ぶ

[オンライン論文と学習資料](https://quarcs-lab.github.io/project2025s-py/)では、各結果とその出典を確認できます。五つの分析用PythonノートブックはGoogle Colaboratoryで実行できます。最初のノートブックはインタラクティブな可視化とGoogle Earth Engineのスクリプトを提供します。

1. [**N1: 宇宙からの眺め**](https://quarcs-lab.github.io/project2025s-py/notebooks/c01_view_from_space-preview.html) — Google Earth Engineで夜間光を探索します。
2. [**N2: 地域収束**](https://quarcs-lab.github.io/project2025s-py/notebooks/c02_regional_convergence_sc-preview.html) — 収束の程度、速度、半減期を推定します。
3. [**N3: 空間的依存**](https://quarcs-lab.github.io/project2025s-py/notebooks/c03_spatial_dependence_lisa-preview.html) — 空間重みを作成し、MoranのI統計量と局所的なクラスターを調べます。
4. [**N4: 波及効果のモデル化**](https://quarcs-lab.github.io/project2025s-py/notebooks/c04_spillover_modeling_6nn-preview.html) — 直接効果・間接効果・総効果を含めて、通常の最小二乗法と空間ダービンモデルを比較します。
5. [**N5: 頑健性**](https://quarcs-lab.github.io/project2025s-py/notebooks/c07_alternative_w_matrices-preview.html) — 代替的な空間重み行列を用いて推奨モデルを確認します。
6. [**N6: 空間と文化**](https://quarcs-lab.github.io/project2025s-py/notebooks/c06_spatial_culture-preview.html) — インドの州における夜間光と文化活動への参加を探索します。

[GitHubリポジトリ](https://github.com/quarcs-lab/project2025s-py)には、ノートブック、データ、原稿のソースが収録されています。[夜間光のインタラクティブ地図](https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl)では、衛星画像を直接探索できます。

## 出版情報と画像の出典

Carlos Mendez、Sujana Kabiraj、Jiaqi Li（2026）。“Regional growth, convergence, and spatial spillovers in India: A reproducible view from outer space.” *REGION*, **13**(2), 173–196。2026年10月11日公開。[DOI: 10.18335/region.v13i2.676](https://doi.org/10.18335/region.v13i2.676)。

インフォグラフィックは、著者による[図1の夜間光地図](https://quarcs-lab.github.io/project2025s-py/images/luminosity_map.png)を再掲し、表3のモデル4の公表値をグラフにしています。地図の色、地理、尺度は原図を維持し、その周囲のレイアウトと比較グラフを新たに作成しました。論文と元の地図：Mendez、Kabiraj、Li（2026）、[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
