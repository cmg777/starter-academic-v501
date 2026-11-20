---
date: "2026-11-20T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "¿Cómo ha cambiado el desarrollo en los municipios de Bolivia y dónde se concentra? geo4bolivia carga los datos del observatorio en una línea y responde con mapas y análisis espaciales en Python."
tags:
- python
- spatial
- regional
title: "geo4bolivia"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geo4bolivia/"
    icon_pack: fab
    icon: python
  - name: "Inicio rápido (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/geo4bolivia/blob/main/notebooks/get-started.ipynb"
    icon_pack: fab
    icon: google
  - name: "Referencia de la API"
    url: "https://quarcs-lab.github.io/geo4bolivia/reference/"
    icon_pack: fas
    icon: book
  - name: "Observatorio"
    url: "https://quarcs-lab.github.io/gdo4bolivia/"
    icon_pack: fas
    icon: globe-americas
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geo4bolivia"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Los datos subnacionales de Bolivia y los análisis fundamentales de la ciencia de datos espaciales, en un paquete de Python.**

`geo4bolivia` es el paquete de Python del [Observatorio de GeoDesarrollo de Bolivia](/es/data/gdo-bolivia/). Encuentra variables en todos los conjuntos de datos del observatorio y las explica (fuentes, licencias, años efectivos, cómo citarlas), carga cualquier indicador en una línea como un panel ordenado con nombres y límites de las unidades, y lo traslada entre municipios, provincias y departamentos con la regla propia de cada variable. Luego ejecuta los análisis fundamentales con una sola llamada cada uno. Cada análisis devuelve una figura interactiva de [Plotly](https://plotly.com/python/), una tabla y una lectura del resultado en lenguaje sencillo.

## Contenido

**[Explorar](https://quarcs-lab.github.io/geo4bolivia/explore.html)**: correlaciones, valores extremos, distribuciones, diagramas de dispersión y tendencias, y mapas por clases de uno o varios periodos o de su cambio.

**[Dependencia espacial](https://quarcs-lab.github.io/geo4bolivia/articles/spatial-dependence.html)**: pesos espaciales, I de Moran y mapas de clústeres LISA.

**[Convergencia](https://quarcs-lab.github.io/geo4bolivia/articles/convergence.html)**: convergencia β (MCO o modelos espaciales), convergencia σ y clubes de convergencia.

**[Transiciones y movilidad](https://quarcs-lab.github.io/geo4bolivia/articles/transitions.html)**: cadenas de Markov y de Markov espaciales, transiciones LISA y movilidad en el ranking.

**[Desigualdad regional](https://quarcs-lab.github.io/geo4bolivia/articles/inequality.html)**: índices de Gini y Theil, y la descomposición de Theil entre grupos y dentro de ellos.

**[Modelos](https://quarcs-lab.github.io/geo4bolivia/articles/models.html)**: regresión con efectos fijos, modelos de panel, diagnósticos espaciales y modelos espaciales con impactos directos e indirectos.

**[Heterogeneidad espacial](https://quarcs-lab.github.io/geo4bolivia/articles/heterogeneity.html)**: regresión geográficamente ponderada multiescala (MGWR).

**[Sus propios indicadores](https://quarcs-lab.github.io/geo4bolivia/articles/own-indicators.html)**: vincule sus tablas por códigos municipales, resuma rásteres por unidad, agregue y guarde en el formato del observatorio.

## Instalación

Instale la versión más reciente desde PyPI (Python 3.11+):

```bash
pip install geo4bolivia                 # data, maps and the core analyses
pip install "geo4bolivia[dynamics]"     # + Markov transitions (giddy)
pip install "geo4bolivia[panel]"        # + panel models (linearmodels)
pip install "geo4bolivia[mgwr]"         # + multiscale GWR
pip install "geo4bolivia[all]"          # everything, incl. raster zonal statistics
```

## Un vistazo

```python
!pip install -q geo4bolivia
import geo4bolivia as geo

# Multidimensional poverty in Bolivia's 343 municipalities, ~2012 and ~2024
mpi = geo.load("sdg01", variables="sdg1_2_mpi")

res = geo.lisa(mpi, "sdg1_2_mpi", year=2024)   # where poverty clusters
print(res.interpret())
res.fig
```

La [guía de inicio](https://quarcs-lab.github.io/geo4bolivia/get-started.html), los [artículos](https://quarcs-lab.github.io/geo4bolivia/articles/) y la [referencia de funciones](https://quarcs-lab.github.io/geo4bolivia/reference/) (en inglés) muestran cada función con datos de Bolivia, cada una con un cuaderno de Colab. Una [página para LLM](https://quarcs-lab.github.io/geo4bolivia/use-with-llms.html) y el archivo `llms.txt` ayudan a los asistentes de IA a escribir código correcto con el paquete.

## Agradecimientos

`geo4bolivia` se desarrolla en el [QuaRCS Lab](https://quarcs-lab.org). Sus análisis se adaptan de sus paquetes hermanos, [geometrics](/es/software/geometrics/) y [expdpy](/es/software/expdpy/), que siguen siendo los complementos para métodos especializados, y se basan en [PySAL](https://pysal.org/), geopandas, statsmodels, Plotly y Great Tables. Los datos del Atlas de los ODS en Bolivia 2026 y los límites municipales provienen de SDSN Bolivia y se utilizan con su permiso.
