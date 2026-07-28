---
date: "2026-07-28T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Una biblioteca de Python para el control sintético bayesiano cuando el tratamiento se filtra: relaja el supuesto SUTVA mediante un canal autorregresivo espacial y estima tanto el efecto sobre la unidad tratada como el desbordamiento (spillover) que recibe cada donante, con incertidumbre bayesiana completa."
tags:
- python
- causal
- spatial
title: "scspill"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/scspill/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/scspill/"
    icon_pack: fab
    icon: python
  - name: "Inicio rápido (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb"
    icon_pack: fab
    icon: google
  - name: "Primeros pasos"
    url: "https://quarcs-lab.github.io/scspill/get-started.html"
    icon_pack: fas
    icon: rocket
  - name: "El método"
    url: "https://quarcs-lab.github.io/scspill/articles/method.html"
    icon_pack: fas
    icon: square-root-alt
  - name: "Validación"
    url: "https://quarcs-lab.github.io/scspill/articles/validation.html"
    icon_pack: fas
    icon: flask
  - name: "Referencia de la API"
    url: "https://quarcs-lab.github.io/scspill/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/scspill"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Control sintético cuando el tratamiento se filtra: el efecto de la política *y* el desbordamiento que recibe cada donante.**

`scspill` es una implementación en Python del control sintético bayesiano con desbordamientos espaciales de [Sakaguchi y Tagawa](https://quarcs-lab.github.io/scspill/articles/method.html) (*Identification and Bayesian Inference for Synthetic Control Methods with Spillover Effects*, The Econometrics Journal). El control sintético clásico supone que los donantes no son afectados por la política; cuando el tratamiento se filtra a través de fronteras o redes comerciales, ese supuesto se incumple y la estimación queda sesgada. `scspill` relaja el supuesto SUTVA permitiendo que el tratamiento se desborde hacia el grupo de donantes mediante un **canal autorregresivo espacial** con pesos definidos por usted, e informa el efecto sobre la unidad tratada, el desbordamiento que recibe cada donante y la intensidad del desbordamiento, cada uno con incertidumbre bayesiana completa. Los pesos sintéticos emplean **regularización de tipo herradura (horseshoe) sin restricción de símplex**, de modo que los donantes pueden quedar excluidos, entrar con signo negativo o extrapolar. El estimador sigue la arquitectura de [mlsynth](https://github.com/jgreathouse9/mlsynth) —una configuración de pydantic a la entrada y un objeto de resultados estandarizado a la salida—, por lo que ambas bibliotecas se combinan con naturalidad.

### 🚀 [Primeros pasos](https://quarcs-lab.github.io/scspill/get-started.html)

Estime el modelo con la Proposición 99 de California en unas diez líneas: el **ATT con un intervalo de credibilidad del 95 %**, la intensidad del desbordamiento ρ, el desbordamiento año por año que recibe cada donante, los diagnósticos MCMC y los gráficos contrafactuales.

[▶ Abrir en Colab](https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb)

### 📐 [El método](https://quarcs-lab.github.io/scspill/articles/method.html)

La identificación y el **muestreador bayesiano de dos etapas**: pesos sintéticos de tipo herradura, el bloque de desbordamiento SAR y Metropolis adaptativo para la intensidad del desbordamiento. También documenta las opciones por defecto que se apartan de la implementación de referencia en R: cada una cuenta con una vía de escape y una comparación que cuantifica la diferencia.

### 🧪 [Validación](https://quarcs-lab.github.io/scspill/articles/validation.html)

La evidencia de que el muestreador es correcto: la **prueba de distribución conjunta de Geweke (2004)**, cuadrículas de sensibilidad a las distribuciones a priori, verificaciones predictivas a priori y validación cruzada frente a los intervalos de credibilidad congelados del código en R de los autores.

## Qué incluye

**Estimación** — `SCSPILL(config).fit()` devuelve el ATT y su intervalo de credibilidad, la trayectoria contrafactual, la distribución posterior de ρ, un panel de desbordamientos por tiempo y donante, y los diagnósticos MCMC.

**Validación** — `scspill.validation` implementa la prueba de distribución conjunta de Geweke, las cuadrículas de sensibilidad a las distribuciones a priori y las verificaciones predictivas a priori.

**Simulación** — `scspill.simulate` reproduce el [estudio de Monte Carlo](https://quarcs-lab.github.io/scspill/articles/simulation-study.html) del artículo: un proceso generador de datos SAR sobre una retícula de contigüidad tipo torre y la comparación SCM / BSCM / SCSPILL que sustenta los cuadros 1 y 2.

**Datos** — `scspill.data` incluye los dos casos de estudio que se describen a continuación, cada uno con su panel y sus matrices de pesos espaciales.

**Validación cruzada con el paquete de replicación en R** — las distribuciones posteriores de California y Sudán se contrastan con los intervalos de credibilidad congelados en R de los autores, la cuadrícula de Monte Carlo con los cuadros congelados del artículo, y los estadísticos predictivos a priori hasta el tercer decimal.

## Casos de estudio incluidos

`scspill.data` incluye dos [conjuntos de datos](https://quarcs-lab.github.io/scspill/articles/datasets.html) listos para estimar:

- **California** — la Proposición 99, 39 estados (1970–2000): ventas de cigarrillos per cápita con pesos de contigüidad tipo torre, mediante `scspill.data.load_california()`.
- **Sudán** — la secesión de 2011, 34 países africanos (2000–2015): PIB per cápita con pesos de red comercial, mediante `scspill.data.load_sudan()`. Se desarrolla en el [caso de estudio de Sudán](https://quarcs-lab.github.io/scspill/sudan.html).

## Instalación

Instale la versión más reciente desde PyPI (la instalación básica usa solo NumPy/SciPy; el extra `numba` añade muestreadores compilados con JIT):

```bash
pip install scspill              # NumPy/SciPy sampler backend
pip install "scspill[numba]"     # + JIT-compiled samplers (~10x faster)
pip install "scspill @ git+https://github.com/quarcs-lab/scspill.git"   # latest
```

Requiere Python 3.10 o superior.

## De un vistazo

Cargue un caso de estudio incluido, ajuste el muestreador y lea tanto el efecto del tratamiento como los desbordamientos:

```python
from scspill import SCSPILL
from scspill.data import load_california

panel = load_california()        # Prop 99 panel + rook-contiguity weights
result = SCSPILL(
    {**panel.config_kwargs(), "m_iter": 20_000, "burn": 10_000, "seed": 42}
).fit()

result.att, result.att_ci          # treatment effect on California + 95% CrI
result.rho_hat, result.rho_ci      # spillover intensity posterior
result.spillover_panel["Nevada"]   # the effect received by Nevada, per year
result.diagnostics()               # ESS / R-hat / MCSE per chain
result.plot(kind="panel")          # counterfactual | effect | top spillovers
```

Diríjase a [Primeros pasos](https://quarcs-lab.github.io/scspill/get-started.html), [El método](https://quarcs-lab.github.io/scspill/articles/method.html) y [Validación](https://quarcs-lab.github.io/scspill/articles/validation.html) para ver el estimador en acción.

## Construido sobre

`scspill` mantiene sus dependencias deliberadamente ligeras: la pila científica moderna de Python y nada más.

- **[NumPy](https://numpy.org)** y **[SciPy](https://scipy.org)** — el motor del muestreador
- **[pandas](https://pandas.pydata.org)** — los paneles y las tablas de desbordamientos
- **[pydantic](https://docs.pydantic.dev)** — la configuración validada del estimador
- **[matplotlib](https://matplotlib.org)** — las figuras de diagnóstico y contrafactuales
- **[numba](https://numba.pydata.org)** — muestreadores opcionales compilados con JIT

## Agradecimiento

El método y su implementación de referencia son de Shosei Sakaguchi y Hayato Tagawa; la arquitectura del estimador sigue a [mlsynth](https://github.com/jgreathouse9/mlsynth), de Jared Greathouse. Este paquete es una adaptación independiente a Python desarrollada en el [QuaRCS Lab](https://quarcs-lab.org) (Ciencia Regional Cuantitativa y Computacional) y se distribuye bajo la licencia MIT. Si utiliza `scspill` en su investigación, cite el artículo metodológico y el software (consulte [`CITATION.cff`](https://github.com/quarcs-lab/scspill/blob/main/CITATION.cff)).
