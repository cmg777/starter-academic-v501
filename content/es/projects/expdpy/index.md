---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Una biblioteca de Python para explorar, analizar y aprender datos de panel de forma interactiva: funciones componibles que generan figuras de Plotly y tablas con calidad de publicación, además de tres aplicaciones web sin código en Streamlit (Explorar, Analizar y Aprender)."
tags:
- python
- panel
title: "expdpy"

links:
  - name: "Sitio web"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/expdpy/"
    icon_pack: fab
    icon: python
  - name: "Inicio rápido (Colab)"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "App Explorar"
    url: "https://expdpy-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "App Analizar"
    url: "https://expdpy-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "App Aprender"
    url: "https://expdpy-learn.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Referencia de la API"
    url: "https://cmg777.github.io/expdpy/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/cmg777/expdpy"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## expdpy: explorar, analizar y aprender datos de panel de forma interactiva

**expdpy** es un conjunto de herramientas de análisis exploratorio de datos para datos de panel y de corte transversal, construido sobre herramientas modernas de Python (Plotly, pyfixest y Great Tables). Combina funciones analíticas componibles con tres aplicaciones web sin código en Streamlit, y es una adaptación a Python del paquete de R ExPanDaR.

### Primeros pasos

- **[Cuaderno de inicio rápido (Colab)](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)** — ejecute el paquete de principio a fin en su navegador, sin necesidad de instalación.
- **Aplicaciones sin código (Streamlit)** — [Explorar](https://expdpy-explore.streamlit.app/), [Analizar](https://expdpy-analyze.streamlit.app/) y [Aprender](https://expdpy-learn.streamlit.app/) con los conjuntos de datos incluidos, sin escribir código.
- **[Referencia de la API](https://cmg777.github.io/expdpy/reference/)** — documentación completa a nivel de funciones.

### Qué hace

- **Explorar** — tablas descriptivas, de correlación y de observaciones extremas; histogramas, gráficos de barras, tendencias temporales y por cuantiles, vistas por grupos y mapas de calor de valores faltantes; diagramas de dispersión con suavizado LOESS, descomposición intra/inter (within/between), trayectorias por unidad, diagnósticos de estructura del panel, dinámicas de distribución y transición, y tratamiento de valores atípicos.
- **Analizar** — efectos fijos multidireccionales y errores estándar agrupados (clustered) mediante pyfixest; estimadores agrupado (pooled), inter (between), de efectos fijos y de efectos aleatorios; el estimador de efectos aleatorios correlacionados (Mundlak) y la prueba de Hausman; herramientas de posestimación (gráficos de efectos fijos, predicciones, pruebas de Wald); inferencia robusta (inferencia por aleatorización, bootstrap de clúster salvaje); gráficos de Frisch–Waugh–Lovell y de coeficientes; estudios de eventos / diferencias en diferencias escalonadas; convergencia β, σ y de clubes; y la curva de ondas de Kuznets.
- **Aprender** — 27 explicadores de conceptos con los métodos `.interpret()` y `.explain()`, además de nueve entornos de práctica (sandboxes) que simulan datos para enseñar primeras diferencias, efectos fijos, agrupamiento (clustering), sesgo por variable omitida y análisis de convergencia.

### Una muestra rápida

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # panel sintético de 80 países
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

### Tres aplicaciones sin código

Los mismos análisis están disponibles en el navegador mediante tres aplicaciones **Streamlit** multipágina — **Explorar**, **Analizar** y **Aprender** (desplegables en la nube) —, sin necesidad de programar.

### Datos de ejemplo

expdpy incluye varios conjuntos de datos integrados: un panel sintético **kuznets** (80 países, 2015–2025) para ilustrar curvas de desigualdad en forma de N, **gapminder**, **staggered_did**, **productivity** y **bolivia112_gdppc**.

### Instalación

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # agrega las aplicaciones sin código de Streamlit
```

expdpy requiere Python 3.10+. Para la versión más reciente sin publicar, instale desde GitHub:

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy es una adaptación a Python del paquete de R [ExPanDaR](https://github.com/trr266/ExPanDaR) de Joachim Gassen y el proyecto TRR 266; por favor, cite el trabajo original en sus investigaciones. Distribuido bajo la Licencia MIT.
