---
title: "Predicting subnational GDP in Vietnam with remote sensing data: a machine learning approach"
authors:
- Hussein Suleiman
- Minh-Thu Thi Nguyen
- admin


date: "2025-03-20T00:00:00Z"
doi: "10.1007/s12076-025-00397-z"

# Schedule page publish date (NOT publication's date).
publishDate: "2025-03-20T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Letters in Spatial and Resource Sciences*"
publication_short: ""

abstract: "Official subnational Gross Domestic Product (GDP) data in Vietnam has been available only since 2010, hindering the analysis of long-term dynamics of local development. Based on remote sensing data and machine learning methods, we construct a subnational GDP indicator for the 63 Vietnamese provinces from 1992 to 2009. Specifically, we rely on nighttime lights (NTL), agricultural land, and climate datasets and employ six machine learning algorithms to construct the GDP dataset. We compare the accuracy of several machine learning algorithms and compare the predicted subnational GDP of the best-performing algorithm using two nighttime lights datasets. We show consistent predictions using both datasets, and construct the subnational GDP dataset using the NTL data with the longer temporal coverage. This new dataset allows researchers and policymakers to analyze long-term economic trends at the subnational level in Vietnam, filling a critical gap in historical economic data."

# Summary. An optional shortened abstract.
summary: "This study constructs a novel subnational GDP dataset for Vietnam by integrating nighttime lights, agricultural land, and climate data through machine learning methods"

tags:
- satellite data
- subnational GDP
- Vietnam


featured: false

# Icons: https://fontawesome.com/search
links:
  #- name: "AI Video"
  #  url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
  #  icon_pack: fab
  #  icon: youtube
  - name: "AI Podcast"
    url: "https://on.soundcloud.com/J3ZaFc9kGWYcN5cF9"
    icon_pack: fas
    icon: headphones
  #- name: "AI Mindmap"
  #  url: "https://mapify.so/share-link/fGCoa7QgaP"
  #  icon_pack: fas
  #  icon: brain
  - name: "Open access article"
    url: "https://doi.org/10.1007/s12076-025-00397-z"
    icon_pack: fas
    icon: university


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

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2059684160&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="QuaRCS-lab" target="_blank" style="color: #cccccc; text-decoration: none;">QuaRCS-lab</a> · <a href="https://soundcloud.com/user-562952877/vietnam-subnational-gdp" title="Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning" target="_blank" style="color: #cccccc; text-decoration: none;">Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning</a></div>



**🛰️ Introduction & Context**
- Challenge: Limited subnational GDP data in Vietnam before 2010
- Need: Long-term data for economic development analysis
- Solution: Predict GDP using remote sensing & machine learning

**🌌 Data Sources Used**
- Official GDP data (2010-2020)
- Nighttime Lights (NTL): Harmonized DMSP & VIIRS-like datasets
- Agricultural land data (ESA)
- Climate data: Temperature & precipitation (CRU)

**🧠 Machine Learning Approach**
- Six algorithms compared:
  - Artificial Neural Networks (ANN)
  - Random Forest (RF)
  - Support Vector Machines (SVM)
  - K-Nearest Neighbors (KNN)
  - Ridge Regression
  - eXtreme Gradient Boosting (XGBoost)

**📈 Algorithm Evaluation Results**
- Ridge Regression outperformed other models
- Accuracy:
  - Harmonized DMSP: 99.15% accuracy
  - VIIRS-like: 99.17% accuracy

**🔦 Key Findings**
- Predictions consistent across different nighttime datasets
- Ridge Regression chosen for final model
- Important features: Temperature & Agricultural Land more influential than NTL

**🌍 Application & Significance**
- Created GDP data from 1992-2009
- Enables detailed long-term analysis of regional economic trends
- Assists policymakers and researchers in addressing inequality and economic development

**⚠️ Limitations**
- Remote sensing measurement/calibration discrepancies
- Dependence on official GDP benchmarks (potential biases)
- Interpretability challenges of machine learning methods

**🚀 Future Research Directions**
- Explore additional remote sensing datasets
- Estimate broader socioeconomic indicators
- Improve models with larger datasets

**🎯 Conclusion**
- Machine learning + Remote sensing effectively address subnational data gaps
- New dataset supports informed economic policy decisions
- Potentially replicable method for other developing countries


