---
date: "2026-07-02T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Una biblioteca de Python para explorar, analizar y aprender sobre el crecimiento, la convergencia y la desigualdad regionales, con métodos espaciales explícitos, figuras interactivas de Plotly y tablas con calidad de publicación, además de tres aplicaciones web sin código en Streamlit (Explorar, Analizar y Aprender)."
tags:
- python
- spatial
- regional
title: "geometrics"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/geometrics/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geometrics/"
    icon_pack: fab
    icon: python
  - name: "Inicio rápido (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "App Explorar"
    url: "https://geometrics-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "App Analizar"
    url: "https://geometrics-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "App Aprender"
    url: "https://geometrics-learn.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Referencia de la API"
    url: "https://quarcs-lab.github.io/geometrics/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geometrics"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Explore, analice y aprenda sobre el crecimiento, la convergencia y la desigualdad regionales — de forma espacial, en Python.**

`geometrics` se apoya en la familia [PySAL](https://pysal.org/) y traduce los análisis estándar de la literatura de convergencia regional en funciones fáciles de aplicar que devuelven figuras interactivas de [Plotly](https://plotly.com/python/), tablas con calidad de publicación de [Great Tables](https://posit-dev.github.io/great-tables/) y DataFrames ordenados (tidy). Combina un flujo de trabajo **Explorar / Analizar / Aprender** con una **capa pedagógica** integrada que interpreta y explica cada resultado, y **tres aplicaciones sin código**. Está pensada para estudiantes, docentes e investigadores aplicados por igual.

### 🗺️ [Explorar](https://quarcs-lab.github.io/geometrics/explore.html)

Cartografíe y describa sus regiones: mapas coropléticos clasificados y animados, conectividad de pesos espaciales, **diagramas de dispersión de Moran y mapas de conglomerados LISA**, y vistas espaciotemporales.

[🚀 Abrir la app](https://geometrics-explore.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb)

### 🧮 [Analizar](https://quarcs-lab.github.io/geometrics/analyze.html)

Estime los modelos: **convergencia β, σ y de clubes**, modelos econométricos espaciales con impactos, dinámicas de Markov y de Markov espacial, **desigualdad de Gini/Theil** con descomposición espacial, y GWR / GWR multiescala.

[🚀 Abrir la app](https://geometrics-analyze.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/analyze.ipynb)

### 📚 [Aprender](https://quarcs-lab.github.io/geometrics/learn.html)

Conozca las ideas detrás de los métodos: **11 entornos de práctica (sandboxes) ejecutables** donde usted ajusta una verdad conocida, un índice de explicadores de **30 temas** y una lectura en lenguaje sencillo de cada resultado.

[🚀 Abrir la app](https://geometrics-learn.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/learn.ipynb)

## Pruebe las aplicaciones en su navegador

Sin instalación ni código: las tres aplicaciones de `geometrics` ejecutan todo el flujo de trabajo en su navegador: mapas y modelos con apuntar y hacer clic, tablas ordenables y exportaciones reproducibles. Cada una es la versión sin código de un caso de estudio de la documentación.

[🗺️ App Explorar](https://geometrics-explore.streamlit.app/) · [🧮 App Analizar](https://geometrics-analyze.streamlit.app/) · [📚 App Aprender](https://geometrics-learn.streamlit.app/)

## Qué incluye

**Mapas y ESDA** — mapas coropléticos clasificados / animados, conectividad de pesos espaciales, diagramas de dispersión de Moran, mapas de conglomerados LISA y la I de Moran a lo largo del tiempo.

**Dinámicas espaciotemporales** — evolución de la distribución transversal y mapas de calor por entidad y tiempo.

**Convergencia** — convergencia β con estimadores MCO o espaciales, convergencia σ y clubes de convergencia de Phillips–Sul con sus mapas.

**Econometría espacial** — el conjunto `spreg`, diagnósticos LM con recomendación de modelo y robustez ante pesos alternativos.

**Dinámicas de distribución** — análisis de transiciones de Markov y de Markov espacial.

**Desigualdad** — tendencias de Gini / Theil con descomposición espacial y descomposición de Theil entre/dentro (between/within).

**Modelos locales** — GWR y GWR multiescala con coeficientes locales cartografiados.

**Entornos de práctica (sandboxes)** — 11 funciones pedagógicas que simulan datos a partir de procesos generadores conocidos.

## Casos de estudio incluidos

`geometrics.data` incluye dos casos de estudio listos para analizar:

- **India** — 520 distritos, luces nocturnas satelitales (1996–2010): `gm.data.load_india()`, `load_india_states()`.
- **Bolivia** — PIB local anclado en las PWT (US\\$ en PPA de 2021, 2012–2022) a tres escalas geográficas: `gm.data.load_bolivia()` (112 provincias), `load_bolivia_departments()` (9 departamentos) y `load_bolivia_grid()` (1603 celdas).

## Instalación

Instale la versión más reciente desde PyPI (la instalación básica cubre la mayoría de los flujos de trabajo; los extras añaden las dinámicas de Markov, las aplicaciones sin código y la exportación a PNG):

```bash
pip install geometrics                 # core
pip install "geometrics[dynamics]"     # + Markov / spatial Markov (giddy)
pip install "geometrics[streamlit]"    # + the three no-code apps
pip install "geometrics[all]"          # everything, incl. PNG export
```

Requiere Python 3.11 o superior.

## De un vistazo

Cargue un caso de estudio incluido, asigne las etiquetas de sus variables y cartografíelo: cada figura es un objeto interactivo de Plotly.

```python
import geometrics as gm

# India — 520 districts, satellite nighttime lights (1996–2010)
gdf, df, df_dict = gm.data.load_india()
df = gm.set_labels(df, df_dict, set_panel=True)

# A classified choropleth of nighttime lights in 2010
gm.explore_choropleth_map(df, "ntl_total", gdf=gdf, period=2010).fig
```

**Estime la convergencia y deje que se explique sola** — convergencia β y σ, cada una con una lectura en lenguaje sencillo:

```python
beta = gm.analyze_beta_convergence(df, "ntl_total", model="ols")
print(beta.interpret())          # plain-language, associational reading

sigma = gm.analyze_sigma_convergence(df, "ntl_total")
```

**Aprenda sobre la marcha** — entornos de práctica y explicadores de conceptos:

```python
gm.learn_beta_convergence(convergence_rate=0.02)  # a runnable concept sandbox
print(gm.explain("spatial_autocorrelation"))      # a concept explainer; gm.list_topics() lists all 30
```

Diríjase a [Explorar](https://quarcs-lab.github.io/geometrics/explore.html), [Analizar](https://quarcs-lab.github.io/geometrics/analyze.html) y [Aprender](https://quarcs-lab.github.io/geometrics/learn.html) para ver cada función en acción.

## Construido sobre

`geometrics` se apoya en el ecosistema de análisis espacial [PySAL](https://pysal.org/) y en la pila moderna de datos de Python:

- **[PySAL](https://pysal.org/)** — `libpysal` (pesos), `esda` (I de Moran / LISA), `giddy` (dinámicas de distribución), `inequality` (Gini / Theil), `mapclassify` (clasificación de mapas coropléticos), `spreg` (regresión espacial) y `mgwr` (GWR multiescala)
- **[geopandas](https://geopandas.org/)** — marcos de datos geoespaciales
- **[Plotly](https://plotly.com/python/)** — figuras interactivas
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — tablas con calidad de publicación

## Agradecimiento

`geometrics` se desarrolla en el [QuaRCS Lab](https://quarcs-lab.org) (Ciencia Regional Cuantitativa y Computacional) y se apoya en el proyecto [PySAL](https://pysal.org/), geopandas, Plotly y Great Tables. Si utiliza `geometrics` en su investigación, cite el repositorio (consulte [`CITATION.cff`](https://github.com/quarcs-lab/geometrics/blob/main/CITATION.cff)) y los paquetes subyacentes de PySAL.
