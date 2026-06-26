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

**Explore, analice y aprenda datos de panel — de forma interactiva, en Python.**

`expdpy` combina funciones componibles que devuelven figuras interactivas de [Plotly](https://plotly.com/python/) y tablas con calidad de publicación de [Great Tables](https://posit-dev.github.io/great-tables/) con **econometría al estilo fixest**, una **capa pedagógica** integrada que interpreta y explica cada resultado, y **tres aplicaciones sin código**. Está pensada para estudiantes, docentes e investigadores aplicados por igual.

### 🔍 [Explorar](https://cmg777.github.io/expdpy/explore.html)

Describa y visualice su panel: tablas, distribuciones, mapas de valores faltantes, tendencias temporales, comparaciones por grupos, diagramas de dispersión, **variación intra/inter (within/between)** y **dinámicas de panel**.

[🚀 Abrir la app](https://expdpy-explore.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)

### 🧮 [Analizar](https://cmg777.github.io/expdpy/analyze.html)

Estime modelos: efectos fijos / aleatorios / **aleatorios correlacionados**, FWL, la prueba de Hausman, inferencia robusta, **estudio de eventos / DiD**, **convergencia β/σ/de clubes** y la curva de **ondas de Kuznets**.

[🚀 Abrir la app](https://expdpy-analyze.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/analyze.ipynb)

### 📚 [Aprender](https://cmg777.github.io/expdpy/learn.html)

Conozca las ideas detrás de los métodos: **9 entornos de práctica (sandboxes) ejecutables** donde usted ajusta una verdad conocida, un índice de explicadores de **27 temas** y una lectura en lenguaje sencillo de cada resultado.

[🚀 Abrir la app](https://expdpy-learn.streamlit.app/) · [▶ Abrir en Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/learn.ipynb)

## Pruebe las aplicaciones en su navegador

Sin instalación ni código: las tres aplicaciones `ExPdPy` ejecutan todo el flujo de trabajo en su navegador: una canalización de ejemplo, análisis con apuntar y hacer clic, tablas ordenables y exportación reproducible a cuadernos. Cada una es la versión sin código de un caso de estudio de la documentación.

[🔍 App Explorar](https://expdpy-explore.streamlit.app/) · [🧮 App Analizar](https://expdpy-analyze.streamlit.app/) · [📚 App Aprender](https://expdpy-learn.streamlit.app/)

## Qué incluye

**Explorar** — tablas descriptivas / de correlación / de observaciones extremas, histogramas y gráficos de barras, tendencias temporales y por cuantiles, vistas por grupos de barras / violín / tendencias, un mapa de calor de valores faltantes, diagramas de dispersión con un suavizado LOESS opcional, la descomposición intra/inter (`xtsum`), trayectorias por unidad, diagnósticos de estructura del panel, dinámicas de distribución y transición, y `treat_outliers`.

**Analizar** — MCO con **efectos fijos multidireccionales** y **errores estándar agrupados (clustered)** mediante [pyfixest](https://github.com/py-econometrics/pyfixest); un `analyze_estimation` más completo (por pasos / múltiples resultados, errores estándar de Newey–West y Driscoll–Kraay); estimadores **agrupado (pooled) / inter (between) / de efectos fijos / de efectos aleatorios** y el estimador de **efectos aleatorios correlacionados (Mundlak)**; la **prueba de Hausman**; posestimación (gráficos de efectos fijos, predicciones, pruebas conjuntas de Wald); **inferencia robusta** (inferencia por aleatorización, bootstrap de clúster salvaje); gráficos de **Frisch–Waugh–Lovell** y de **coeficientes**; **estudios de eventos / diferencias en diferencias escalonadas** modernos (`did2s`, Sun–Abraham, LP-DiD, TWFE dinámico); **convergencia β, σ y de clubes**; y la curva de **ondas de Kuznets** con estimadores agrupado / inter / intra.

**Aprender** — cada resultado habla en lenguaje sencillo: `.interpret()` ofrece una lectura **asociacional** (nunca una afirmación causal, salvo que el diseño lo permita) y `.explain()` / `explain(topic)` / `list_topics()` permiten explorar **27** explicadores de conceptos. **Nueve entornos de práctica (sandboxes)** simulan datos para que usted pueda *ver* y ajustar una verdad conocida: la identidad de primeras diferencias ≈ centrado en la media ≈ variables ficticias, los efectos fijos, el agrupamiento (clustering), el sesgo por variable omitida, la convergencia β/σ/de clubes y la onda de Kuznets.

**Conjuntos de datos incluidos** — `expdpy.data` incluye paneles listos para explorar: **`kuznets`** (la demostración insignia de la curva de Kuznets en forma de N), `gapminder`, **`staggered_did`** (estudio de eventos / DiD), **`productivity`** y **`bolivia112_gdppc`** (convergencia). Consulte la página del [conjunto de datos kuznets](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) para ver el diccionario de datos.

## Instalación

Instale la versión más reciente desde PyPI (los efectos aleatorios, el CRE y la prueba de Hausman funcionan de fábrica; las aplicaciones necesitan el extra `streamlit`):

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # the no-code ExPdPy apps (Streamlit)
```

Usando [uv](https://docs.astral.sh/uv/):

```bash
uv pip install expdpy
uv pip install "expdpy[streamlit]"
```

Para la versión más reciente sin publicar, instale directamente desde la rama `main`:

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

Requiere Python 3.10+.

## De un vistazo

El ejemplo principal a lo largo de esta documentación es el panel `kuznets` incluido (80 países × 2015–2025): un conjunto de datos sintético cuya desigualdad regional traza una **curva de Kuznets en forma de N** en el ingreso: primero asciende, luego desciende y vuelve a ascender con ingresos muy altos.

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()
# The N-shaped regional Kuznets curve: regional inequality vs (log) GDP per capita
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

**Ejecute una regresión y deje que se explique sola** — efectos fijos bidireccionales, errores estándar agrupados, una lectura en lenguaje sencillo y un gráfico de coeficientes:

```python
res = ex.analyze_regression_table(
    df,
    dvs="gini_regional",
    idvs=["log_gdp_pc", "log_gdp_pc_sq", "log_gdp_pc_cu"],
    feffects=["country", "year"],
    clusters=["country"],
)
print(res.interpret())            # plain-language, associational reading
ex.analyze_coefficient_plot(res)  # themed coefficient plot with confidence intervals
```

**Aprenda sobre la marcha** — entornos de práctica y explicadores de conceptos:

```python
ex.learn_first_differences()        # first differences ≈ demeaning ≈ dummy variables
print(ex.explain("fixed_effects"))  # a concept explainer; ex.list_topics() lists all 27
```

Diríjase a [Explorar](https://cmg777.github.io/expdpy/explore.html), [Analizar](https://cmg777.github.io/expdpy/analyze.html) y [Aprender](https://cmg777.github.io/expdpy/learn.html) para ver cada función en acción, o a la página del [conjunto de datos kuznets](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) para el diccionario de datos.

## Construido sobre

`expdpy` se apoya en la pila moderna de datos y econometría de Python:

- **[Plotly](https://plotly.com/python/)** — figuras interactivas
- **[pyfixest](https://github.com/py-econometrics/pyfixest)** — estimadores de efectos fijos y de diferencias en diferencias
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — tablas con calidad de publicación
- **[linearmodels](https://bashtage.github.io/linearmodels/)** — efectos aleatorios / inter / aleatorios correlacionados y la prueba de Hausman
- **[Streamlit](https://streamlit.io/)** — las aplicaciones `ExPdPy` sin código

## Agradecimiento

expdpy comenzó como una adaptación a Python del excelente paquete de R [ExPanDaR](https://github.com/trr266/ExPanDaR) de **Joachim Gassen** y el proyecto **TRR 266 Accounting for Transparency**, y sus cimientos siguen profundamente inspirados en ese trabajo. Con el tiempo, expdpy ha crecido mucho más allá del original — estimadores al estilo fixest, herramientas de estudio de eventos / diferencias en diferencias, modelos de panel de efectos aleatorios y aleatorios correlacionados, análisis de convergencia y una capa pedagógica integrada que interpreta y explica los resultados — y seguirá evolucionando.

Agradecemos a los autores de ExPanDaR. Por favor, cite el trabajo original al usar `expdpy` en investigaciones (consulte [`CITATION.cff`](https://github.com/cmg777/expdpy/blob/main/CITATION.cff)).
