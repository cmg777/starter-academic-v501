---
date: "2026-01-14T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: ボリビアの地理空間的な開発を研究するためのデータサイエンス・リポジトリ
tags:
- spatial
- python
- regional
title: "DS4Bolivia"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/ds4bolivia"
    icon_pack: ai
    icon: open-data

url_code: "https://github.com/quarcs-lab/ds4bolivia"
url_pdf: ""
url_slides: "https://carlos-mendez.my.canva.site/ds4bolivia-introduction-pdf"
url_video: "https://youtu.be/kJ4Y6_hWadw"
---


# DS4Bolivia：ボリビアの地理空間的な開発を研究するためのデータサイエンス・リポジトリ


[**DS4Bolivia** へようこそ！](https://github.com/quarcs-lab/ds4bolivia) 本プロジェクトは、ボリビアの**339の自治体**に焦点を当て、空間データおよび社会経済データセット、インタラクティブなダッシュボード、計算ワークフローを集約したものです。空間分析と持続可能な開発目標（SDGs）との橋渡しをすることを目的に設計されています。

本リポジトリは、以下に関心を持つ研究者やデータサイエンス従事者向けに構成されています。

* **空間計量経済学：** 地域間の格差、成長、クラスタリングを理解する。
* **空間機械学習：** 衛星画像（地球観測）を予測モデリングに活用する。
* **持続可能な開発：** 細かな地域レベルでSDGs指標をモニタリングする。

---

## 🖥️ インタラクティブな地理空間ダッシュボード

コードを書かずにデータを探索できます。これらのアプリは、主要な開発指標の時空間ダイナミクスを可視化します。

* [人口、夜間光、土地被覆、GDPの時空間ダイナミクス（2013–2019年）](https://carlos-mendez.projects.earthengine.app/view/geoexplorer1v100bolivia)：2013年と2019年のボリビアの自治体における人口密度、夜間光、土地被覆の変化、GDP推計の推移を可視化します。

---

## 🐍 クラウド上の計算ノートブック

私たちの分析を再現するのに役立つ、ステップ・バイ・ステップのチュートリアルです。これらのノートブックは `GeoPandas` や `PySAL` といったPythonライブラリを使用します。

* **[空間探索的データ分析（ESDA）入門](https://colab.research.google.com/github/quarcs-lab/ds4bolivia/blob/master/notebooks/esda.ipynb)**
* *焦点：* 大域および局所のモランのIを用いて、空間的なクラスターや外れ値を検出する方法を学びます。
* *主要概念：* 空間的自己相関、LISA統計量、コロプレスマップ。

---

## 💾 空間的に明示的なデータセット

分析に使えるよう整備済みのデータセットです。これらのファイルは、ボリビアの自治体境界に合わせて前処理されています。

* **[SDGsと衛星埋め込み（2017年）](https://github.com/quarcs-lab/ds4bolivia/blob/master/datasets/sdgs_satelliteEmbeddings2017.csv)**
* *説明：* 社会経済指標（SDGs）と、衛星画像から抽出した高次元の特徴ベクトルを結合したデータセットです。
* *活用例：*　宇宙から捉えた視覚的パターンをもとに、貧困指標や開発指標を予測する機械学習モデルを訓練する。

---

## 📜 引用方法

研究で本リポジトリを利用する場合は、以下のメタデータで引用してください。

### APA形式
Mendez, C., Gonzales, E., Leoni, P., Andersen, L., Hendrix, P. (2024). DS4Bolivia: A Data Science Repository to Study GeoSpatial Development in Bolivia [Data set]. GitHub. https://github.com/quarcs-lab/ds4bolivia

### BibTeX形式

```bibtex
@misc{ds4bolivia2026,
  author = {Mendez, Carlos and Gonzales, Erick and Leoni, Pedro and Andersen, Lykke and Hendrix, Peralta},
  title = {{DS4Bolivia}: A Data Science Repository to Study GeoSpatial Development in Bolivia},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/quarcs-lab/ds4bolivia}}
}
```

---

## 🚀 独自のデータセットを構築する

データセットはモジュールごとに整理されており、すべてが一意の識別子（`asdf_id`）で結び付けられています。

| データセットの種類 | ファイルパス | 説明 | 結合キー |
| :--- | :--- | :--- | :--- |
| **地域名** | `/regionNames/regionNames.csv` | 行政上のメタデータ（自治体名および県名）。 | `asdf_id` |
| **社会経済** | `/sdg/sdg.csv` | 持続可能な開発目標（SDGs）の指標および貧困指標。 | `asdf_id` |
| **衛星特徴量** | `/satelliteEmbeddings/satelliteEmbeddings2017.csv` | 日中の衛星画像から抽出した特徴ベクトル（埋め込み）。 | `asdf_id` |
| **空間ベクター** | `/maps/bolivia339geoqueryOpt.geojson` | すべての自治体の幾何境界（ポリゴン）。 | `asdf_id` |

> **⚠️ 識別子に関する重要な注意：** > 本リポジトリのすべてのデータセットを結合するための主キーは **`asdf_id`** です。  
> `mun_id`（標準的な政府コード）も行政データに含まれていますが、`asdf_id` は、ここで提供する衛星埋め込みと最適化済みマップファイルとの整合性を保証します。結合する前に、両方のデータフレームでこの列を `int` または `string` として一貫して扱うよう常に確認してください。

---

下記の例は、[Google Colab](https://colab.research.google.com/notebooks/empty.ipynb) ですぐに実行できます。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/notebooks/empty.ipynb)

### 例1：属性データの統合
このスクリプトは、行政上の名称、社会経済指標、衛星機械学習の特徴量を1つの分析用データフレームに結合する方法を示します。

```python
import pandas as pd

# -----------------------------------------------------------------------------
# 1. SETUP: Define Source URLs
# We use the raw GitHub URL to stream data directly into Colab/Pandas.
# -----------------------------------------------------------------------------
REPO_URL = "https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master"

url_names = f"{REPO_URL}/regionNames/regionNames.csv"
url_sdg = f"{REPO_URL}/sdg/sdg.csv"
url_emb = f"{REPO_URL}/satelliteEmbeddings/satelliteEmbeddings2017.csv"

# -----------------------------------------------------------------------------
# 2. LOAD: Read CSVs
# -----------------------------------------------------------------------------
print("Loading datasets...")
df_names      = pd.read_csv(url_names)
df_sdg        = pd.read_csv(url_sdg)
df_embeddings = pd.read_csv(url_emb)

# -----------------------------------------------------------------------------
# 3. MERGE: Combine Dataframes
# -----------------------------------------------------------------------------
# Step A: Attach SDG data to Names
df_merged_step1 = pd.merge(df_names, df_sdg, on='asdf_id', how='inner')

# Step B: Attach Satellite Embeddings to the result
df_final = pd.merge(df_merged_step1, df_embeddings, on='asdf_id', how='inner')

# -----------------------------------------------------------------------------
# 4. VERIFY
# -----------------------------------------------------------------------------
print(f"Merge Complete.")
print(f"Original Municipalities: {len(df_names)}")
print(f"Final Merged Rows:       {len(df_final)}")
print(f"Total Columns:           {len(df_final.columns)}")

# Display the first few rows (names + first few embedding columns)
display(df_final[['mun', 'dep', 'index_sdg1', 'A00', 'A01', 'A02']].head())
```

### 例2：空間データと属性データの統合
このスクリプトは、例1で結合したデータを取り込み、空間分析や空間表現のために自治体のジオメトリ（GeoJSON）と結合します。

```python

import geopandas as gpd
import matplotlib.pyplot as plt

# -----------------------------------------------------------------------------
# 1. LOAD SPATIAL DATA
# We load the optimized GeoJSON file containing municipality boundaries.
# -----------------------------------------------------------------------------
geojson_url = f"{REPO_URL}/maps/bolivia339geoqueryOpt.geojson"
print("Loading GeoJSON map...")
gdf_boundaries = gpd.read_file(geojson_url)

# -----------------------------------------------------------------------------
# 2. SPATIAL DATA PREPARATION
# GeoJSON often loads IDs as objects/strings, while CSVs load as integers.
# -----------------------------------------------------------------------------
# Force 'asdf_id' to integer to match the pandas dataframe
gdf_boundaries['asdf_id'] = gdf_boundaries['asdf_id'].astype(int)

# -----------------------------------------------------------------------------
# 3. ATTRIBUTE JOIN
# Merge the spatial dataframe (gdf) with the attribute dataframe (df_final).
# This creates a 'GeoDataFrame' capable of spatial operations.
# -----------------------------------------------------------------------------
gdf_bolivia = gdf_boundaries.merge(df_final, on='asdf_id', how='inner')

# -----------------------------------------------------------------------------
# 4. VISUALIZATION (Choropleth Map)
# Plot the "No Poverty" SDG Index (SDG 1)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(1, 1, figsize=(12, 10))

gdf_bolivia.plot(
    column='index_sdg1',    # Variable to map
    cmap='viridis',         # Color palette (perceptually uniform)
    linewidth=0.1,          # Border width
    edgecolor='white',      # Border color
    legend=True,
    legend_kwds={'label': "SDG 1 Index (No Poverty)", 'orientation': "horizontal"},
    ax=ax
)

ax.set_title("Bolivia: SDG 1 Index by Municipality", fontsize=15)
ax.set_axis_off()           # Turn off lat/lon axis numbers for cleaner look
plt.show()
```



---

## データソース

- SDGs指標は、もともと [Andersen, L. E., Canelas, S., Gonzales, A., Peñaranda, L. (2020) Atlas municipal de los Objetivos de Desarrollo Sostenible en Bolivia 2020. La Paz: Universidad Privada Boliviana, SDSN Bolivia](https://atlas.sdsnbolivia.org) によって構築されたものです。




## 🤝 貢献方法

貢献を歓迎します！座標参照系（CRS）の問題の修正、新しい空間モデルの追加、新規データのアップロードのいずれであっても、[プルリクエストを送信してください](https://github.com/quarcs-lab/ds4bolivia/pulls)。
