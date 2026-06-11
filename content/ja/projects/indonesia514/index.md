---
date: "2026-06-10T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: インドネシアの514地区における地域開発を研究するためのデータサイエンス・リポジトリ
tags:
- spatial
- python
- regional
title: "Indonesia514"

links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/indonesia514/"
    icon_pack: ai
    icon: open-data

url_code: "https://github.com/quarcs-lab/indonesia514"
url_pdf: ""
url_slides: ""
url_video: ""
---


# Indonesia514：インドネシアの514地区における地域開発を研究するためのデータサイエンス・リポジトリ


[**Indonesia514** へようこそ！](https://github.com/quarcs-lab/indonesia514) 本プロジェクトは、インドネシアの**514の地区**を対象に、GDP、投資、政府支出などの地域経済指標と地理空間データを集約したものです。すべてのデータセットは共通の識別子 `districtID` を共有しているため、1つの分析用テーブルに統合できます。

本リポジトリは、以下に関心を持つ研究者やデータサイエンス従事者向けに構成されています。

* **地域経済：** 地区レベルの成長、資本形成、財政政策を測定する。
* **空間分析：** 経済指標を地区のジオメトリと結び付け、地図作成や空間計量経済学に活用する。
* **再現可能なワークフロー：** 単一の結合キーを用いて、オープンデータセットを直接Pythonに読み込む。

> **⚙️ 開発中。** 本リポジトリは初期段階のドラフトです。地区の境界はGeoJSON形式で完成しており、バイリンガル（英語／インドネシア語）のウェブサイトも公開されていますが、経済データセットは現在**16地区分のサンプルデータ**のみを収録しています。514地区すべての完全な系列は準備中です。インタラクティブなダッシュボードや分析ノートブックは計画段階であり、まだ公開されていません。

---

## 💾 データセット

モジュールごとに整理され、すべてが一意の識別子（`districtID`）で結び付けられた、整備済みのデータセットです。

| データセット | ファイルパス | 説明 | 結合キー |
| :--- | :--- | :--- | :--- |
| **GDP** | `/gdp/gdp.csv` | 地区レベルの国内総生産（2010–2022年）。 | `districtID` |
| **GFCF** | `/gfcf/gfcf.csv` | 総固定資本形成（投資の指標）（2010–2022年）。 | `districtID` |
| **政府支出** | `/gs/gs.csv` | 政府支出および財政政策の分布（2010–2022年）。 | `districtID` |
| **空間ベクター** | `/maps/mapIdonesia514tp.geojson` | 514地区すべての幾何境界（ポリゴン）。 | `districtID` |

> **⚠️ 識別子に関する重要な注意：** 本リポジトリのすべてのデータセットを結合するための主キーは **`districtID`** です。GDP、GFCF、政府支出のファイルは現在16地区分のサンプルを収録しており、514地区すべての完全なデータを追加中です。結合する前に、両方のデータフレームで `districtID` を `int` または `string` として一貫して扱うよう常に確認してください。

---

## 🐍 クイックスタート

データセットをGitHubから直接読み込み、`pandas` で `districtID` をキーに結合します。以下のコードは、空の [Google Colab スクラッチパッド](https://colab.research.google.com/notebooks/empty.ipynb) で実行できます。設定やインストールは不要です。

```python
import pandas as pd

# -----------------------------------------------------------------------------
# 1. SETUP: Define the raw GitHub URL to stream data directly into Pandas.
# -----------------------------------------------------------------------------
REPO_URL = "https://raw.githubusercontent.com/quarcs-lab/indonesia514/main"

# -----------------------------------------------------------------------------
# 2. LOAD: Read the economic CSVs.
# -----------------------------------------------------------------------------
df_gdp  = pd.read_csv(f"{REPO_URL}/gdp/gdp.csv")
df_gfcf = pd.read_csv(f"{REPO_URL}/gfcf/gfcf.csv")
df_gs   = pd.read_csv(f"{REPO_URL}/gs/gs.csv")

# -----------------------------------------------------------------------------
# 3. MERGE: Combine the indicators on the common district identifier.
# -----------------------------------------------------------------------------
df = pd.merge(df_gdp,  df_gfcf[['districtID', 'gfcf_2022']], on='districtID')
df = pd.merge(df,      df_gs[['districtID', 'gs_2022']],     on='districtID')
```

---

## 📜 引用方法

研究で本リポジトリを利用する場合は、以下のメタデータで引用してください。

### APA形式
Mendez, C., Abdulah, R., Arvianto, B., & Leiva, F. (2026). Indonesia514: A data science repository to study regional development in Indonesia. GitHub. https://github.com/quarcs-lab/indonesia514

### BibTeX形式

```bibtex
@misc{indonesia5142026,
  author = {Mendez, Carlos and Abdulah, Rusli and Arvianto, Bimo and Leiva, Favio},
  title = {{Indonesia514}: A Data Science Repository to Study Regional Development in Indonesia},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/quarcs-lab/indonesia514}}
}
```

---

## ライセンス

本リポジトリは **MITライセンス** の下で公開されており、適切な帰属表示のもとで幅広い再利用が認められています。

---

## 🤝 貢献方法

貢献を歓迎します！全地区データの追加、座標参照系（CRS）の問題の修正、新しいノートブックの作成、新規指標の統合のいずれであっても、[プルリクエストを送信してください](https://github.com/quarcs-lab/indonesia514/pulls)。
