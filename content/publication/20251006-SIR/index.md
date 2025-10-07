---
title: "Mapping the dimensions of poverty through big data, socioeconomic surveys and machine learning in Cambodia"
authors:
- Khoun, T.
- Poortinga, A.
- Thwal, N. S.
- González de Alba, I.
- McMahon, A.
- Mendez, C.


date: "2025-10-06T00:00:00Z"
doi: "10.1007/s11205-025-03718-3"

# Schedule page publish date (NOT publication's date).
publishDate: "2025-10-06T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Social Indicators Research*"
publication_short: ""

abstract: "Cambodia has witnessed rapid economic growth in recent years; however, it remains one of the most economically vulnerable nations in Southeast Asia, grappling with persistent poverty challenges. Accurately understanding the multiple dimensions of poverty is essential for promoting sustainable development and guiding targeted policy interventions. Yet, traditional poverty data are often outdated and lack the granularity needed for effective subnational planning. To address this gap, this study leverages new big data sources, machine learning techniques, and the Cambodia Socio-Economic Survey (CSES) to predict and map multidimensional poverty across 10 indicators in three dimensions based on the Global Multidimensional Poverty Index (MPI): education, health, and living standard dimensions at fine spatial scales. By integrating deprivation probabilities across a gridded landscape with building footprint information, the study estimates household-level deprivations. Using a random forest algorithm, the study achieves high predictive accuracy for indicators such as clean water, sanitation, food consumption, housing materials, cooking fuel, and access to electricity. However, challenges remain, including the need for unbiased training data and the limited capacity to capture disparities within regional aggregates (provinces, districts, townships). Despite these limitations, the study identifies nighttime lights, population density, and road network data as key predictors of poverty. The findings demonstrate the feasibility of using big-earth observation data and machine learning to complement traditional socioeconomic surveys, enabling a more detailed and dynamic understanding of multidimensional poverty at various geographical scales."

# Summary. An optional shortened abstract.
summary: "We use new big data sources, the Cambodia Socio-Economic Survey, and machine learning methods to predict and map multidimensional poverty in Cambodia."

tags:
- big data
- machine learning
- multidimensional poverty
- Cambodia
- socioeconomic surveys


featured: true

# Icons: https://fontawesome.com/search

links:
  - name: "AI Video"
    url: "https://youtu.be/Nt5lrCl_hRE?si=VYmxc_kRqSOcaPHr"
    icon_pack: fab
    icon: youtube
  - name: "AI Chatbot"
    url: "https://app.edcafe.ai/chatbots/68ad8ae401555d7da378a190"
    icon_pack: fas
    icon: comments
#  - name: "AI Podcast"
#    url: "https://youtu.be/K1yj-Aw2Vlg"
#    icon_pack: fas
#    icon: headphones
#  - name: "AI Mindmap"
#    url: "https://mapify.so/share-link/yhlCs1IOO2"
#    icon_pack: fas
#    icon: brain
#  - name: "Slides"
#    url: "https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration"
#    icon_pack: fas
#    icon: tv
#  - name: "Colab notebook"
#    url: "https://bit.ly/project2022p"
#    icon_pack: ai
#    icon: open-data
  - name: "Published article (Open Access)"
    url: "https://doi.org/10.1007/s11205-025-03718-3"
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

<iframe width="560" height="315" src="https://www.youtube.com/embed/Nt5lrCl_hRE?si=VYmxc_kRqSOcaPHr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


### 🌏 Introduction

- Rapid economic growth, yet persistent poverty (17.8% below national line in 2019)
- Traditional poverty data: outdated, costly, and coarse
- Poverty: not only income but health, education, and living standards (MPI framework)

Notes: Cambodia has seen strong growth but poverty remains. The study applies a multidimensional approach aligned with the Global MPI to capture deprivations beyond income, focusing on education, health, and living standards.

---

### 📊 Research Objectives

- Use **big earth data** + **CSES survey** + **machine learning**
- Map **10 poverty indicators** across **3 MPI dimensions**
- Generate **high-resolution poverty maps**
- Support **targeted, cost-effective policy interventions**

Notes: The aim is to integrate spatial and survey data using AI/ML to produce detailed poverty maps. This helps policymakers allocate resources efficiently and identify local vulnerabilities.

---

### 📚 Literature & Motivation

- Household surveys = costly, infrequent, spatially coarse
- Nighttime lights & satellite imagery → proxies for poverty
- Machine Learning (RF, XGBoost, CNNs) improve predictions
- Gap: Few studies integrate **survey + EO data** for **multidimensional poverty**

Notes: Prior research shows satellites and ML can help predict poverty, but integration with socioeconomic surveys for multidimensional poverty is limited. This study fills that gap.

---

### 🗂️ Data Sources

- **CSES survey** (10k households) – health, education, housing, income
- **Satellite & EO data** – nightlights, land cover, population density
- **Infrastructure data** – roads, schools, hospitals, utilities
- **Building footprints** – 3.8M residential/commercial buildings

Notes: A wide set of data was used: CSES for household info, EO data for environment and infrastructure, and building footprints to scale down predictions to household level.

---

### ⚙️ Methodology

- **Random Forest** model for classification
- Predicts **deprivation probability** for each indicator
- Training & validation split (90/10)
- Outputs: household & regional deprivation maps

Notes: The Random Forest algorithm was selected due to robustness and ability to process mixed data types. Models produce probability maps that can be aggregated at township, district, or province level.

---

### 📑 MPI Indicators

**Health (2):** Food consumption, access to healthcare

**Education (2):** Attainment, school attendance

**Living Standards (6):** Cooking fuel, sanitation, water, electricity, housing, assets

Notes:

Ten indicators were chosen following the Global MPI. Equal weights applied across three main dimensions. These indicators reflect SDG priorities like education, health, clean water, and energy.

---

### 📈 Results – Variable Importance

- **Nighttime lights** = key predictor across indicators
- **Population density** & **road networks** also significant
- Strongest predictions: **cooking fuel, clean water, sanitation, electricity**
- Weak predictions: **school attendance, healthcare, assets**

Notes: Nightlights and population density best explain deprivation. Infrastructure access is also crucial. Indicators with spatial correlation (e.g., utilities) performed better than those tied to household-specific conditions.

---

### 🗺️ Results – Spatial Poverty Patterns

- **Urban centers**: Phnom Penh, Siem Reap, Battambang → low deprivation
- **Remote provinces**: Preah Vihear, Ratanakiri, Mondulkiri → high deprivation
- Poverty lower near **main roads & borders** (trade effects)

Notes: Spatial maps show concentration of deprivation in remote, poorly connected regions. Urban and border areas with infrastructure show lower poverty.

---

### 💡 Discussion

- Spatial ML useful but limited for indicators with weak spatial signals
- Household survey data not designed for ML → location approximation issues
- Need for richer survey integration (e.g., accessibility questions)
- EO + ML offer **granular, dynamic poverty mapping**

Notes: While promising, ML struggles when data lack spatial correlation. Improved survey design can enhance integration. This hybrid approach shows potential for real-time, fine-grained poverty monitoring.

---

### ✅ Conclusion

- **10 MPI indicators mapped** using EO + survey + ML
- Best results for **infrastructure-related deprivations**
- Enables **household-level poverty estimates**
- Supports **SDGs**: No Poverty, Quality Education, Health, Clean Water, Energy
- Future research: spatial autocorrelation, inequality decomposition, advanced AI

Notes: This work shows how AI and EO data complement traditional surveys to map multidimensional poverty. Future directions include advanced spatial analysis and deep learning models for better accuracy.