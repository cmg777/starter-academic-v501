---
title: "パネルデータに対する古典的推定量のベイズ的平均化：地域版クズネッツ曲線の形状をめぐる謎は解明できるか"
authors:
- Ramirez-Hassan Andres
- admin
- Rueda-Ramirez Estephania


date: "2025-06-05T00:00:00Z"
doi: "10.1007/s00181-025-02755-8"
  
# Schedule page publish date (NOT publication's date).
publishDate: "2025-06-05T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Empirical Economics*"
publication_short: ""

abstract: "本研究では、パネルデータに対する古典的推定量のベイズ的平均化を用いて地域版クズネッツ曲線の頑健性を評価し、地域間格差の頑健な決定要因を特定します。シミュレーション実験は、この手法が真のデータ生成過程の基礎となる変数を復元することを示唆しています。結果から、線形項および二次項としての実質一人当たりGDPに加えて、地域間格差の最も頑健な決定要因が天然資源収入、耕作可能地、民族的格差であることが示されました。地域間格差と国家的発展との間には、189〜71,682米ドルの範囲で逆U字型の関係が見出されました。この閾値を超えると、格差が安定化することを示唆する証拠が存在します。"

# Summary. An optional shortened abstract.
summary: "パネルデータに対する古典的推定量のベイズ的平均化を用いて、地域間格差の頑健な決定要因を研究します。"

tags:
- nighttime lights
- Kuznets curve
- regional inequality
- subnational GDP
- Bayesian model averaging

featured: true

# Icons: https://fontawesome.com/search

links:
#  - name: "AI Video"
#    url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
#    icon_pack: fab
#    icon: youtube
  - name: "AIチャットボット"
    url: "https://notebooklm.google.com/notebook/1c806ac1-e15b-4e67-a575-bf5bf3080fb6"
    icon_pack: fas
    icon: comments
  - name: "AIポッドキャスト"
    url: "https://youtu.be/K1yj-Aw2Vlg"
    icon_pack: fas
    icon: headphones
  - name: "AIマインドマップ"
    url: "https://mapify.so/share-link/yhlCs1IOO2"
    icon_pack: fas
    icon: brain
#  - name: "Slides"
#    url: "https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration"
#    icon_pack: fas
#    icon: tv
#  - name: "Colab notebook"
#    url: "https://bit.ly/project2022p"
#    icon_pack: ai
#    icon: open-data
  - name: "出版論文（オープンアクセス）"
    url: "https://doi.org/10.1007/s00181-025-02755-8"
    icon_pack: fas
    icon: university
#url_pdf: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493/457'
#url_preprint: "https://bit.ly/project2022p"
#url_code: 'https://bit.ly/project2022p'
#url_dataset: 'https://bit.ly/project2022p'
url_poster: ''
url_project: ''
#url_slides: 'https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration'
#url_source: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493'
#url_video: 'https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag'



# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
#projects: [convergence, clusters]

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/K1yj-Aw2Vlg?si=iMlgTPuVHk9twxPQ"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## 🗺️ 研究の動機

* 地域間格差は社会的結束、移住、政治的安定を形作ります
* クズネッツ（1955）：発展と格差の間の逆U字型の関連
* 近年の証拠は、より複雑なパターン（N字型）を示唆しています
* 「形状」をめぐる論争に決着をつけるには、頑健な計量経済学的手法が必要です

---

## 📚 文献の概観

* 逆U字型を支持：List and Gallet（1999）、Thornton（2001）
* 混在した証拠／非U字型：Tam（2008）、Huang（2012）
* N字型の擁護：Lessmann（2014）、Lessmann and Seidel（2017）
* 課題：モデルの不確実性が明示的に扱われることはまれです

---

## 🎯 研究の目的

* 古典的推定量のベイズ的平均化（BACE）を固定効果付きパネルへ拡張する
* モデルの不確実性のもとでクズネッツ曲線の形状の頑健性を検証する
* 地域間格差を一貫して押し上げる決定要因を特定する

---

## 🛠️ 手法のハイライト

* **探索空間：** 14個の候補説明変数 → 2¹⁴ = **16,384** モデルを、それぞれ二元固定効果（国＋期間）で推定。
* **頑健性スイープ：** 固定効果の4つの選択肢（なし、時間、国、二元）を許容すると、対象は **65,536** モデルへ拡大します。事後モデル確率（PMP）は完全に二元固定効果の定式化に集中します。
* **古典的推定量のベイズ的平均化（BACE）：**

  * 各モデルについて単純なFE-OLSを維持し、コストのかかるMCMCを用いません。
  * 各モデルのBICを近似的な周辺尤度へ変換します。
  * 一様事前分布を用いてPMPの和を1とし、その後すべての係数、予測値、導関数について**確率で重み付けした平均**を形成します。
* **変数のスクリーニング：** 事後包含確率（PIP）が頑健な決定要因を浮かび上がらせます——PIP ≥ 0.75 で「実質的な証拠」、PIP ≥ 0.90 で「強い証拠」とします。
* **曲線のピーク：** 格差の変曲点は、GDPの三次多項式のBACEで重み付けした導関数から得られ、信用区間のための解析的標準誤差を伴います。
* **検証：** 既知のデータ生成過程を用いたモンテカルロ実験は、BACEが正しい固定効果構造と真の駆動要因を精度よく特定することを示し、この手法の信頼性を裏付けます。


---

## 📈 データの概観

* 180か国、5年区切りの5つの期間（1990〜2013年）
* 被説明変数：衛星夜間光から求めた人口加重ジニ係数
* 主要な共変量（14個）：一人当たりGDP（線形から五次まで）、資源収入、耕作可能地、民族ジニ、貿易、対内直接投資など

---

## 🧪 シミュレーションによる確認

* 既知のデータ生成過程を用いたシミュレーション・パネル
* BACEは次を復元しました：

  * 正しい二元固定効果の定式化（PMP ≈ 100%）
  * 真の駆動要因（一人当たりGDP、資源収入、土地、民族ジニ）

---

## 🔍 決定要因の頑健性（実データ）

**高PIP（> 0.75）**

* 天然資源収入は格差を↑
* 耕作可能地の比率は格差を↓
* 民族ジニは格差を↑
  **クズネッツ項**
* 一人当たりGDP（線形および二次）は頑健
* 三次項は頑健ではない（PIP ≈ 0.48）

---

## 📐 曲線の形状

* 格差は**上昇**：189 → 2,189米ドル
* **安定化**：2,189 → 3,935米ドル
* **低下**：3,935 → 71,682米ドル
* 71,682米ドルを超えると再び**安定化**

> 証拠は、豊かな経済におけるプラトーを伴う逆U字型を支持しており、完全なN字型では**ありません**。

---

## 🧭 政策的含意

* 天然資源収入を地域間で再分配する
* 農業生産性と土地への公平なアクセスへ投資する
* 空間的な格差を抑えるために民族的包摂を目指す
* 成長だけではピーク後の格差は縮まりません。能動的な地域政策が必要です

---

## 🏁 結論

* パネル向けBACEは、格差の駆動要因について透明かつ確率的な視点を提供します
* 頑健な逆U字型が確認され、格差は高所得下で反転せず安定化します
* 今後の課題：技術の普及と制度をクズネッツの枠組みに組み込むこと



