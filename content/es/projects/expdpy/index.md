---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Una biblioteca de Python para explorar datos de panel de forma interactiva: funciones componibles que generan figuras de Plotly y tablas con calidad de publicación, además de aplicaciones web sin código en Streamlit y Shiny."
tags:
- python
- panel
title: "expdpy"

links:
  - name: "Sitio web"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "Inicio rápido (Colab)"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb"
    icon_pack: fab
    icon: google
  - name: "Aplicación de Streamlit"
    url: "https://expdpy.streamlit.app/"
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

## expdpy: explorar datos de panel de forma interactiva

**expdpy** es un conjunto de herramientas de análisis exploratorio de datos para datos de panel y de corte transversal, construido sobre herramientas modernas de Python (Plotly, pyfixest y Great Tables). Combina funciones analíticas componibles con dos aplicaciones web sin código, y es una adaptación a Python del paquete de R ExPanDaR.

### Primeros pasos

- **[Cuaderno de inicio rápido (Colab)](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb)** — ejecute el paquete de principio a fin en su navegador, sin necesidad de instalación.
- **[Aplicación en línea (Streamlit)](https://expdpy.streamlit.app/)** — explore los conjuntos de datos incluidos sin escribir código.
- **[Referencia de la API](https://cmg777.github.io/expdpy/reference/)** — documentación completa a nivel de funciones.

### Qué hace

- **Explorar** — estadísticas descriptivas, matrices de correlación, observaciones extremas, histogramas, tendencias temporales y por cuantiles, gráficos de barras/violín por grupos y diagramas de dispersión con suavizado LOESS opcional.
- **Modelar** — efectos fijos multidireccionales con errores estándar agrupados (clustered), tablas de regresión con calidad de publicación, gráficos de regresión parcial de Frisch–Waugh–Lovell y tratamiento de valores atípicos (winsorización/truncamiento).
- **Reproducir** — exporte cualquier sesión como cuaderno de Jupyter, script de Python o conjunto de datos preparado, y traslade las configuraciones entre las aplicaciones.

### Una muestra rápida

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # panel sintético de 80 países
ex.prepare_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).show()
```

### Dos aplicaciones sin código

Los mismos análisis están disponibles en el navegador mediante una aplicación **Streamlit** multipágina (desplegable en la nube) y una aplicación **Shiny para Python** de vista única, sin necesidad de programar.

### Datos de ejemplo

expdpy incluye un panel sintético **Kuznets** (80 países, 2015–2025) para ilustrar curvas de desigualdad en forma de N, además del conjunto de datos **Gapminder**.

### Instalación

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy es una adaptación a Python del paquete de R [ExPanDaR](https://github.com/joachim-gassen/ExPanDaR) de Joachim Gassen y el proyecto TRR 266; por favor, cite el trabajo original en sus investigaciones. Distribuido bajo la Licencia MIT.
