---
title: "On the political and socioeconomic geography of violence: Spatial heterogeneity and scale effects in Brazil"
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

abstract: "Using a geographically weighted regression (GWR), Ingram and Marchesini da Costa (World Development, 2019) studied the territorially uneven effects of political and socioeconomic factors on violence in Brazil. This article builds on their work by confirming and extending their main findings using a cloud-based Python environment.  Through the lens of a multiscale geographically weighted regression (MGWR) and an updated inference framework, we assess the spatial scale at which political and socioeconomic factors affect violence. We also identify geographical clusters of violence that remain statistically significant, even after considering the effects of political and socioeconomic factors.  "

# Summary. An optional shortened abstract.
summary: "Through the lens of a multiscale geographically weighted regression (MGWR) and an updated inference framework, we assess the spatial scale at which political and socioeconomic factors affect violence."

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
  - name: "Article"
    url: "https://doi.org/10.1080/17421772.2025.2477571"
    icon_pack: fas
    icon: university
  #- name: "AI Video"
  #  url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
  #  icon_pack: fab
  #  icon: youtube
  - name: "AI Podcast"
    url: "https://on.soundcloud.com/gHnX8hpDdyt74Xr5A"
    icon_pack: fas
    icon: headphones
  #- name: "AI Mindmap"
  #  url: "https://mapify.so/share-link/fGCoa7QgaP"
  #  icon_pack: fas
  #  icon: brain
  - name: "Notebook: "
    url: "https://bit.ly/project2022p"
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

**🤖 AI Podcast Summary**

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2060947180&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="QuaRCS-lab" target="_blank" style="color: #cccccc; text-decoration: none;">QuaRCS-lab</a> · <a href="https://soundcloud.com/user-562952877/on-the-political-and-socioeconomic-geography-of-violence-spatial-heterogeneity-and-scale-effects-in-brazil" title="On the political and socioeconomic geography of violence: Spatial heterogeneity and scale effects in Brazil" target="_blank" style="color: #cccccc; text-decoration: none;">On the political and socioeconomic geography of violence: Spatial heterogeneity and scale effects in Brazil</a></div>

---

### 🌍 Introduction  
- Territorial violence in Brazil exhibits strong spatial patterns.  
- Builds on Ingram & Marchesini da Costa (2019) using MGWR.  
- Goal: Explore spatial heterogeneity & scale effects on lethal violence.  

---

### 🧪 Methodological Innovations  
- ✅ Replicated R-based results using Python (Cloud-based jupyter notebooks).  
- ✅ Adopted **Multiscale Geographically Weighted Regression (MGWR)**.  
- ✅ Identified persistent **geographical violence clusters**.  
- ✅ Applied a **multiple testing correction** to ensure robustness.  

---

### 📊 Data Overview  
- Unit of analysis: 5,562 municipalities (2007–2012).  
- 🔺 Violence proxied by change in homicide rate.  
- 🔸 Political variables: Party ID, alignment, abstention, etc.  
- 🔹 Socioeconomic variables: Population density, HDI, GINI, Bolsa Família, etc.  

---

### 🧭 Modeling Frameworks  
- **OLS**: Global effect estimates.  
- **GWR**: Localized effect estimates, single spatial scale.  
- **MGWR**: Variable-specific scales, greater accuracy.  

---

### 📌 Key Descriptive Insights  
- High variance in homicide rate across municipalities.  
- **Brazilian Democratic Movement Party (PMDB)** was dominant;  
  **Workers' Party (PT)** and **Brazilian Social Democracy Party (PSDB)** followed.  
- Young male %, single-mother households, and population density linked to higher violence.  

---

### 🔍 OLS Results Highlights  
- 📈 **PMDB** mayors → Increased violence.  
- 📉 **PT** & **PSDB** → No consistent effect.  
- 📊 Vote abstention → Strongly linked to higher homicide rates.  
- ⚠️ Unexpected: GINI index showed negative correlation.  

---

### 🗺️ GWR Findings: Political Variables  
- **PMDB**: Positive correlation in the northeast.  
- **PT**: Violence-reducing in many regions.  
- **PSDB**: Mixed effects—north (↑), south (↓).  
- Abstention: Violence-increasing in several regions.  

---

### 🧮 GWR Findings: Socioeconomic Variables  
- Population density & Bolsa Família → Heterogeneous effects.  
- Young male % & single mothers → Generally increased violence.  
- Effect direction & significance vary spatially.  

---

### 📐 MGWR Advantages & Insights  
- MGWR applies **individual bandwidths** per variable.  
- Enables better capture of spatial heterogeneity and scale.  
- More realistic modeling of violence determinants.  

---

### 🗺️ MGWR: Political Variables  
- **PMDB** still ↑ violence in northeast.  
- **PSDB** now only ↓ violence in southern Brazil.  
- **PT** effect mostly disappears after statistical corrections.  
- Abstention: Consistent with GWR in some regions.  

---

### 🌆 MGWR: Socioeconomic Variables  
- Bolsa Família: No significant impact.  
- Young male %: Significant across more areas due to large spatial scale.  
- Population density & single mothers: Small-scale, heterogeneous influence.  

---

### 📌 Mapping Residual Clusters  
- Intercept mapping (MGWR): Reveals **unexplained clusters**.  
- Central Brazil: Positive residuals → unobserved structural factors?  
- South & Central-East: Negative residuals.  

---

### 🧩 Conclusion  
- MGWR provides nuanced spatial insights.  
- Confirms heterogeneity in violence determinants.  
- Suggests need for regional, tailored policy interventions.  
- Further investigation needed into residual violence clusters.  





