---
title: "Promedio bayesiano de estimaciones clásicas para datos de panel: ¿puede resolverse el enigma de la forma de la curva de Kuznets regional?"
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

abstract: "Evaluamos la robustez de la curva de Kuznets regional mediante el promedio bayesiano de estimaciones clásicas para datos de panel e identificamos los determinantes robustos de la desigualdad regional. Nuestro ejercicio de simulación sugiere que este método recupera las variables subyacentes al verdadero proceso generador de datos. Nuestros resultados indican que, además del PIB real per cápita en sus términos lineal y cuadrático, los determinantes más robustos de la desigualdad regional son las rentas de los recursos naturales, la tierra cultivable y la desigualdad étnica. Encontramos una relación en forma de U invertida entre la desigualdad regional y el desarrollo nacional en el rango de 189 a 71 682 USD. Más allá de este umbral, existe evidencia que sugiere una estabilización de la desigualdad."

# Summary. An optional shortened abstract.
summary: "Estudiamos los determinantes robustos de la desigualdad regional mediante un promedio bayesiano de estimaciones clásicas para datos de panel."

tags:
- nighttime lights
- Kuznets curve
- regional inequality
- subnational GDP
- Bayesian model avaraging 


featured: true

# Icons: https://fontawesome.com/search

links:
#  - name: "AI Video"
#    url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
#    icon_pack: fab
#    icon: youtube
  - name: "Chatbot de IA"
    url: "https://notebooklm.google.com/notebook/1c806ac1-e15b-4e67-a575-bf5bf3080fb6"
    icon_pack: fas
    icon: comments
  - name: "Pódcast con IA"
    url: "https://youtu.be/K1yj-Aw2Vlg"
    icon_pack: fas
    icon: headphones
  - name: "Mapa mental con IA"
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
  - name: "Artículo publicado (acceso abierto)"
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

## 🗺️ Motivación

* La desigualdad regional moldea la cohesión social, la migración y la estabilidad política
* Kuznets (1955): vínculo en forma de U invertida entre desarrollo y desigualdad
* La evidencia reciente apunta a patrones más complejos (en forma de N)
* Se necesitan herramientas econométricas robustas para zanjar el debate sobre la “forma”

---

## 📚 Panorama de la literatura

* A favor de la U invertida: List y Gallet (1999); Thornton (2001)
* Evidencia mixta / no en forma de U: Tam (2008); Huang (2012)
* Defensa de la forma de N: Lessmann (2014); Lessmann y Seidel (2017)
* Carencia: la incertidumbre de modelo rara vez se aborda de forma explícita

---

## 🎯 Objetivos de la investigación

* Extender el promedio bayesiano de estimaciones clásicas (BACE) a paneles con efectos fijos
* Probar la robustez de la forma de la curva de Kuznets bajo incertidumbre de modelo
* Identificar los determinantes que impulsan de forma consistente la desigualdad regional

---

## 🛠️ Aspectos destacados de la metodología

* **Espacio de búsqueda:** 14 regresores candidatos → 2¹⁴ = **16 384** modelos, cada uno estimado con efectos fijos bidireccionales (país + período).
* **Barrido de robustez:** al permitir cuatro opciones de efectos fijos (ninguno, tiempo, país, bidireccional), el universo se amplía a **65 536** modelos; las probabilidades posteriores de modelo (PMP) se concentran por completo en la especificación bidireccional.
* **Promedio bayesiano de estimaciones clásicas (BACE):**

  * Mantiene un sencillo FE-OLS para cada modelo, sin un MCMC costoso.
  * Traduce el BIC de cada modelo en una verosimilitud marginal aproximada.
  * Emplea una distribución a priori uniforme para que las PMP sumen 1, y luego forma **promedios ponderados por probabilidad** para todos los coeficientes, predicciones y derivadas.
* **Cribado de variables:** la probabilidad de inclusión posterior (PIP) destaca los determinantes robustos —“evidencia sustancial” con PIP ≥ 0,75, “fuerte” con PIP ≥ 0,90.
* **Picos de la curva:** los puntos de inflexión de la desigualdad provienen de la derivada ponderada por BACE del polinomio cúbico del PIB, con errores estándar analíticos para las bandas de credibilidad.
* **Validación:** los experimentos de Monte-Carlo con un proceso generador de datos conocido muestran que BACE identifica con precisión la estructura correcta de efectos fijos y los verdaderos impulsores, lo que subraya la fiabilidad del método.


---

## 📈 Panorama de los datos

* 180 países, cinco ventanas de 5 años (1990-2013)
* Variable dependiente: índice de Gini ponderado por población a partir de luces nocturnas satelitales
* Covariables clave (14): PIB pc (de lineal a quíntico), rentas de recursos, tierra cultivable, Gini étnico, comercio, IED, etc.

---

## 🧪 Comprobación mediante simulación

* Panel simulado con un proceso generador de datos conocido
* BACE recuperó:

  * La especificación correcta de efectos fijos bidireccionales (PMP ≈ 100 %)
  * Los verdaderos impulsores (PIB pc, rentas, tierra, Gini étnico)

---

## 🔍 Robustez de los determinantes (datos reales)

**PIP alto (> 0,75)**

* Las rentas de los recursos naturales ↑ la desigualdad
* La proporción de tierra cultivable ↓ la desigualdad
* El Gini étnico ↑ la desigualdad
  **Términos de Kuznets**
* PIB pc (lineal y cuadrático) robusto
* El término cúbico no es robusto (PIP ≈ 0,48)

---

## 📐 Forma de la curva

* La desigualdad **aumenta**: 189 → 2 189 USD
* Se **estabiliza**: 2 189 → 3 935 USD
* **Disminuye**: 3 935 → 71 682 USD
* Se **estabiliza** de nuevo más allá de 71 682 USD

> La evidencia favorece una U invertida con una meseta en las economías ricas, **no** una forma de N completa.

---

## 🧭 Implicaciones de política

* Redistribuir las rentas de los recursos naturales entre las regiones
* Invertir en productividad agrícola y en un acceso equitativo a la tierra
* Apuntar a la inclusión étnica para frenar las disparidades espaciales
* El crecimiento por sí solo no cerrará las brechas tras el pico: se requiere una política regional activa

---

## 🏁 Conclusión

* El BACE para panel ofrece una visión transparente y probabilística de los impulsores de la desigualdad
* Se confirma una U invertida robusta; la desigualdad se estabiliza, no repunta, con ingresos altos
* Trabajo futuro: incorporar la difusión tecnológica y las instituciones en el marco de Kuznets



