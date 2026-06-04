---
title: "Predicción del PIB subnacional en Vietnam con datos de teledetección: un enfoque de aprendizaje automático"
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

abstract: "En Vietnam, los datos oficiales del Producto Interno Bruto (PIB) subnacional solo están disponibles desde 2010, lo que dificulta el análisis de la dinámica de largo plazo del desarrollo local. A partir de datos de teledetección y métodos de aprendizaje automático, construimos un indicador del PIB subnacional para las 63 provincias vietnamitas desde 1992 hasta 2009. En concreto, nos basamos en datos de luces nocturnas (NTL), tierras agrícolas y conjuntos de datos climáticos, y empleamos seis algoritmos de aprendizaje automático para construir el conjunto de datos del PIB. Comparamos la precisión de varios algoritmos de aprendizaje automático y contrastamos el PIB subnacional predicho por el algoritmo de mejor desempeño utilizando dos conjuntos de datos de luces nocturnas. Mostramos predicciones consistentes con ambos conjuntos de datos y construimos el conjunto de datos del PIB subnacional empleando los datos de NTL con la cobertura temporal más extensa. Este nuevo conjunto de datos permite a investigadores y responsables de las políticas analizar las tendencias económicas de largo plazo a nivel subnacional en Vietnam, cubriendo una carencia crítica de datos económicos históricos."

# Summary. An optional shortened abstract.
summary: "Este estudio construye un nuevo conjunto de datos del PIB subnacional para Vietnam integrando luces nocturnas, tierras agrícolas y datos climáticos mediante métodos de aprendizaje automático."

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
  - name: "Pódcast con IA"
    url: "https://on.soundcloud.com/J3ZaFc9kGWYcN5cF9"
    icon_pack: fas
    icon: headphones
  #- name: "AI Mindmap"
  #  url: "https://mapify.so/share-link/fGCoa7QgaP"
  #  icon_pack: fas
  #  icon: brain
  - name: "Artículo de acceso abierto"
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

**🤖 Resumen en pódcast con IA**

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2059684160&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="QuaRCS-lab" target="_blank" style="color: #cccccc; text-decoration: none;">QuaRCS-lab</a> · <a href="https://soundcloud.com/user-562952877/vietnam-subnational-gdp" title="Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning" target="_blank" style="color: #cccccc; text-decoration: none;">Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning</a></div>


**🛰️ Introducción y contexto**
- Desafío: datos limitados del PIB subnacional en Vietnam antes de 2010
- Necesidad: datos de largo plazo para el análisis del desarrollo económico
- Solución: predecir el PIB mediante teledetección y aprendizaje automático

**🌌 Fuentes de datos utilizadas**
- Datos oficiales del PIB (2010-2020)
- Luces nocturnas (NTL): conjuntos de datos armonizados DMSP y tipo VIIRS
- Datos de tierras agrícolas (ESA)
- Datos climáticos: temperatura y precipitación (CRU)

**🧠 Enfoque de aprendizaje automático**
- Seis algoritmos comparados:
  - Redes neuronales artificiales (ANN)
  - Random Forest (RF)
  - Máquinas de vectores de soporte (SVM)
  - K vecinos más cercanos (KNN)
  - Regresión ridge
  - eXtreme Gradient Boosting (XGBoost)

**🔦 Hallazgos clave**
- Predicciones consistentes entre los distintos conjuntos de datos nocturnos
- Se eligió la regresión ridge para el modelo final
- Variables importantes: la temperatura y las tierras agrícolas resultaron más influyentes que las NTL

**🌍 Aplicación e importancia**
- Se generaron datos del PIB para 1992-2009
- Permite un análisis detallado de largo plazo de las tendencias económicas regionales
- Ayuda a responsables de las políticas e investigadores a abordar la desigualdad y el crecimiento regionales

**⚠️ Limitaciones**
- Discrepancias de medición y calibración en la teledetección
- Dependencia de los valores de referencia del PIB oficial
- Desafíos de interpretabilidad de los métodos de aprendizaje automático

**🚀 Líneas de investigación futuras**
- Explorar conjuntos de datos de teledetección adicionales
- Estimar indicadores socioeconómicos más amplios
- Mejorar los modelos con conjuntos de datos más grandes

**🎯 Conclusión**
- El aprendizaje automático y la teledetección abordan eficazmente las carencias de datos subnacionales
- El nuevo conjunto de datos respalda decisiones de política económica informadas
- Método potencialmente replicable para otros países en desarrollo
