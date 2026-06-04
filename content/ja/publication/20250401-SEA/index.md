---
title: "暴力の政治的・社会経済的地理について：ブラジルにおける空間的異質性とスケール効果"
authors:
- admin
- Mehak Sachdeva 



date: "2025-03-22T00:00:00Z"
doi: "10.1080/17421772.2025.2477571" 

# Schedule page publish date (NOT publication's date).
publishDate: "2025-03-22T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Spatial Economic Analysis*"
publication_short: ""

abstract: "Ingram and Marchesini da Costa（World Development、2019年）は、地理的加重回帰（GWR）を用いて、政治的・社会経済的要因がブラジルの暴力に及ぼす地域的に不均一な影響を研究しました。本稿は、クラウドベースのPython環境を用いて彼らの主要な知見を確認・拡張することで、その研究を発展させます。マルチスケール地理的加重回帰（MGWR）と更新された推測の枠組みを通じて、政治的・社会経済的要因が暴力に影響を及ぼす空間スケールを評価します。また、政治的・社会経済的要因の効果を考慮した後でもなお統計的に有意であり続ける、暴力の地理的クラスターを特定します。"

# Summary. An optional shortened abstract.
summary: "マルチスケール地理的加重回帰（MGWR）と更新された推測の枠組みを通じて、政治的・社会経済的要因が暴力に影響を及ぼす空間スケールを評価します。"

tags:
- GWR
- MGWR
- Spatial heterogeneity
- Scale effects
- Violence
- Python
- Cloud computing
- Brazil


featured: false

# Icons: https://fontawesome.com/search
links:
  - name: "論文"
    url: "https://doi.org/10.1080/17421772.2025.2477571"
    icon_pack: fas
    icon: university
  #- name: "AI動画"
  #  url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
  #  icon_pack: fab
  #  icon: youtube
  - name: "AIポッドキャスト"
    url: "https://on.soundcloud.com/gHnX8hpDdyt74Xr5A"
    icon_pack: fas
    icon: headphones
  #- name: "AIマインドマップ"
  #  url: "https://mapify.so/share-link/fGCoa7QgaP"
  #  icon_pack: fas
  #  icon: brain
  - name: "ノートブック：統計"
    url: "https://colab.research.google.com/drive/1JmRZNIqa8CPtPlOpcN66GkM-X45f2Lkb?usp=sharing"
    icon_pack: ai
    icon: open-data
  - name: "ノートブック：OLS"
    url: "https://colab.research.google.com/drive/1B7LHLfO5EWVsW_HAH6xebSmiJWi0_Xtv?usp=sharing"
    icon_pack: ai
    icon: open-data
  - name: "ノートブック：GWR"
    url: "https://colab.research.google.com/drive/19COBTQysC1UtsKh4cMxWsDFQm_eU4BBV?usp=sharing"
    icon_pack: ai
    icon: open-data
  - name: "ノートブック：MGWR"
    url: "https://colab.research.google.com/drive/1MO5FluSwc3JnJ3a-oegYkH3NQsEhJH0E?usp=sharing"
    icon_pack: ai
    icon: open-data
  - name: "ノートブック：GWR対MGWR"
    url: "https://colab.research.google.com/drive/14ZriYHYgyj8OxZUtn3rjoFZnsOrNcc2Q?usp=sharing"
    icon_pack: ai
    icon: open-data

#url_pdf: 'https://link.springer.com/article/10.1007/s12076-024-00375-x'
#url_preprint: "https://www.overleaf.com/read/bzqgsrrmbbhc#9f94fc"
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

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

**🤖 AIポッドキャストの要約**

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2060947180&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="QuaRCS-lab" target="_blank" style="color: #cccccc; text-decoration: none;">QuaRCS-lab</a> · <a href="https://soundcloud.com/user-562952877/on-the-political-and-socioeconomic-geography-of-violence-spatial-heterogeneity-and-scale-effects-in-brazil" title="On the political and socioeconomic geography of violence: Spatial heterogeneity and scale effects in Brazil" target="_blank" style="color: #cccccc; text-decoration: none;">On the political and socioeconomic geography of violence: Spatial heterogeneity and scale effects in Brazil</a></div>

---

### 💻 再現用ノートブック  

すべての分析は、Google Colabを通じて **クラウドベースのJupyterノートブックで完全に再現可能** です。  


📊 [1. 記述統計](https://colab.research.google.com/drive/1JmRZNIqa8CPtPlOpcN66GkM-X45f2Lkb?usp=sharing)

📈 [2. 最小二乗法（OLS）](https://colab.research.google.com/drive/1B7LHLfO5EWVsW_HAH6xebSmiJWi0_Xtv?usp=sharing)

🗺️ [3. 地理的加重回帰（GWR）](https://colab.research.google.com/drive/19COBTQysC1UtsKh4cMxWsDFQm_eU4BBV?usp=sharing)

📐 [4. マルチスケールGWR（MGWR）](https://colab.research.google.com/drive/1MO5FluSwc3JnJ3a-oegYkH3NQsEhJH0E?usp=sharing)

🔄 [5. GWRとMGWRの係数の比較](https://colab.research.google.com/drive/14ZriYHYgyj8OxZUtn3rjoFZnsOrNcc2Q?usp=sharing)


---

### 🌍 はじめに  
- ブラジルにおける地域的な暴力は、強い空間的パターンを示します。  
- Ingram & Marchesini da Costa（2019年）の研究をMGWRを用いて発展させます。  
- 目的：致死的な暴力に対する空間的異質性とスケール効果を探究すること。  

---

### 🧪 方法論上の革新  
- 完全な再現とオープンサイエンスのために **クラウドベースの計算ノートブック** を用いました。  
- **マルチスケール地理的加重回帰（MGWR）** を採用しました。  
- 持続的な **地理的な暴力クラスター** を特定しました。  
- 頑健性を確保するために **多重検定の補正** を適用しました。  

---

### 📊 データの概要  
- **分析単位**：5,562の自治体（2007〜2012年）  
- **従属変数**：殺人率の変化（2011〜2012年 対 2007〜2008年のΔ）  

**政治変数**  
- 勝利のマージン（%）  
- 州知事との政党の連携  
- 投票棄権（%）  
- 市長の政党所属：  
  - **ブラジル民主運動党（PMDB）**  
  - **ブラジル社会民主党（PSDB）**  
  - **労働者党（PT）**  

**社会経済変数**  
- 人口密度 
- 若年男性人口（%） 
- ジニ係数（所得格差）  
- 人間開発指数（HDI）  
- 母子家庭の世帯（%）  
- 成人就業率（%）  
- ボルサ・ファミリア受給資格（%）  


---

### 🧭 モデリングの枠組み  
- **OLS**：グローバルな効果の推定。  
- **GWR**：単一の空間スケールによる局所的な効果の推定。  
- **MGWR**：複数の空間スケールによる局所的な効果の推定。  

---

### 🔍 OLSの結果 
- **PMDB** の市長 → 暴力の増加。  
- **PT** と **PSDB** → 一貫した効果なし。  
- 投票棄権 → 高い殺人率と強く結びつく。  
- 予想外：ジニ係数は負の相関を示しました。  

---

### 🗺️ GWRの結果：政治変数  
- **PMDB**：北東部で正の相関。  
- **PT**：多くの地域で暴力を低減。  
- **PSDB**：効果は混在——北部（↑）、南部（↓）。  
- 棄権：いくつかの地域で暴力を増加。  

---

### 🧮 GWRの結果：社会経済変数  
- 人口密度とボルサ・ファミリア → 異質な効果。  
- 若年男性%と母子家庭 → 概して暴力を増加。  
- 効果の方向と有意性は空間的に変動します。  

---

### 🗺️ MGWRの結果：政治変数  
- **PMDB** は依然として北東部で暴力を↑。  
- **PSDB** は現在、ブラジル南部でのみ暴力を↓。  
- **PT** の効果は統計的補正の後にほぼ消失します。  
- 棄権：一部の地域でGWRと整合的。  

---

### 🌆 MGWRの結果：社会経済変数  
- ボルサ・ファミリア：有意な影響なし。  
- 若年男性%：大きな空間スケールゆえに、より多くの地域で有意。  
- 人口密度と母子家庭：小スケールで異質な影響。  

---

### 📌 残差クラスターのマッピング  
- 切片のマッピング（MGWR）：**説明されないクラスター** を明らかにします。  
- 中央ブラジル：正の残差 → 観測されない構造的要因か？  
- 南部・中東部：負の残差。  

---

### 🧩 結論  
- MGWRは微妙な空間的洞察を提供します。  
- 暴力の決定要因における異質性を確認します。  
- 地域に応じた、対象を絞った政策介入の必要性を示唆します。  
- 残差の暴力クラスターについては、さらなる調査が必要です。  

