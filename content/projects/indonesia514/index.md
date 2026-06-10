---
date: "2026-06-10T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: A Data Science Repository to Study Regional Development across 514 Districts in Indonesia
tags:
- spatial
- python
- regional
title: "Indonesia514"

links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/indonesia514/"
    icon_pack: ai
    icon: open-data

url_code: "https://github.com/quarcs-lab/indonesia514"
url_pdf: ""
url_slides: ""
url_video: ""
---


# Indonesia514: A Data Science Repository to Study Regional Development across 514 Districts in Indonesia


[Welcome to **Indonesia514**!](https://github.com/quarcs-lab/indonesia514) This project centralizes geospatial data and regional-economic indicators — including GDP, investment, and government spending — for the **514 districts** of Indonesia. All datasets share a single common identifier, `districtID`, so they can be merged into a unified analytical table.

This repository is organized for researchers and data scientists interested in:

* **Regional Economics:** Measuring district-level growth, capital formation, and fiscal policy.
* **Spatial Analysis:** Linking economic indicators to district geometries for mapping and spatial econometrics.
* **Reproducible Workflows:** Streaming open datasets directly into Python via a single join key.

> **⚙️ Active development.** This repository is an early-stage draft. The district boundaries are complete in GeoJSON format and the bilingual website (English / Bahasa Indonesia) is live, but the economic datasets currently ship **sample data for 16 districts** — the full 514-district series are pending. Interactive dashboards and analytical notebooks are planned and not yet published.

---

## 💾 Datasets

Curated datasets organized into modules, all linked by a unique identifier (`districtID`).

| Dataset | File Path | Description | Join Key |
| :--- | :--- | :--- | :--- |
| **GDP** | `/gdp/gdp.csv` | District-level gross domestic product (2010–2022). | `districtID` |
| **GFCF** | `/gfcf/gfcf.csv` | Gross Fixed Capital Formation, a measure of investment (2010–2022). | `districtID` |
| **Government Spending** | `/gs/gs.csv` | Government spending and fiscal-policy distribution (2010–2022). | `districtID` |
| **Spatial Vector** | `/maps/mapIdonesia514tp.geojson` | Geometric boundaries (polygons) for all 514 districts. | `districtID` |

> **⚠️ Important Note on Identifiers:** The primary key for joining all datasets in this repository is **`districtID`**. The GDP, GFCF, and government-spending files currently contain a 16-district sample; the full 514-district data are being added. Always treat `districtID` consistently (as an `int` or `string`) across both dataframes before merging.

---

## 🐍 Quick start

Stream the datasets directly from GitHub and merge them on `districtID` with `pandas`.

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

## 📜 Citation

If you use this repository in your research, please cite it using the following metadata.

### APA Format
Mendez, C., Abdulah, R., Arvianto, B., & Leiva, F. (2026). Indonesia514: A data science repository to study regional development in Indonesia. GitHub. https://github.com/quarcs-lab/indonesia514

### BibTeX Format

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

## License

This repository is released under the **MIT License**, permitting broad reuse with proper attribution.

---

## 🤝 Contributing

We welcome contributions! If you are adding full-district data, fixing a Coordinate Reference System (CRS) issue, building a new notebook, or integrating fresh indicators, please [submit a Pull Request](https://github.com/quarcs-lab/indonesia514/pulls).
