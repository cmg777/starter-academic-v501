---
date: "2026-07-28T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Un paquete de Python con modelos de control sintético que abandonan el supuesto SUTVA sobre el grupo de donantes: se permite que el tratamiento alcance a los controles y cada modelo informa dos estimandos, el efecto sobre la unidad tratada, libre de contaminación, y el desbordamiento (spillover) que recibe cada donante."
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
  - name: "Modelos"
    url: "https://quarcs-lab.github.io/scspill/models/"
    icon_pack: fas
    icon: layer-group
  - name: "Validación"
    url: "https://quarcs-lab.github.io/scspill/articles/validation.html"
    icon_pack: fas
    icon: flask
  - name: "Referencia de la API"
    url: "https://quarcs-lab.github.io/scspill/reference/"
    icon_pack: fas
    icon: book
  - name: "Para IA / LLM"
    url: "https://quarcs-lab.github.io/scspill/use-with-llms.html"
    icon_pack: fas
    icon: robot
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/scspill"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Control sintético cuando el tratamiento se filtra: el efecto sobre la unidad tratada *y* el desbordamiento que recibe cada donante.**

`scspill` es un paquete de Python con modelos de control sintético que abandonan el supuesto SUTVA sobre el grupo de donantes. Se permite que el tratamiento alcance a los controles y cada modelo informa dos estimandos: el efecto sobre la unidad tratada, libre de contaminación, y el efecto de desbordamiento que recibe cada donante, algo que el control sintético clásico no puede expresar en absoluto. El modelo disponible hoy, `sar`, canaliza los desbordamientos a través de los pesos espaciales que usted defina, escalados por una única intensidad ρ que se **estima en lugar de suponerse**; ajusta pesos sintéticos con contracción de tipo herradura (horseshoe) y sin restricciones, de modo que los donantes pueden quedar excluidos, entrar con signo negativo o extrapolar, y devuelve incertidumbre bayesiana completa para ambos estimandos. Cuando ρ = 0 se reduce exactamente al control sintético bayesiano de tipo herradura. La arquitectura del estimador sigue a [mlsynth](https://github.com/jgreathouse9/mlsynth) —una configuración de pydantic a la entrada y un objeto de resultados estandarizado a la salida— y los nombres de `method` coinciden con los de su despachador `SPILLSYNTH`, por lo que ambas bibliotecas se combinan con naturalidad.

### 🚀 [Primeros pasos](https://quarcs-lab.github.io/scspill/get-started.html)

Estime un modelo con la Proposición 99 de California en unas diez líneas: el **ATT con un intervalo de credibilidad del 95 %**, la intensidad del desbordamiento ρ, el desbordamiento año por año que recibe cada donante, los diagnósticos MCMC y los gráficos contrafactuales.

[▶ Abrir en Colab](https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb)

### 🧬 [Modelos](https://quarcs-lab.github.io/scspill/models/)

Hoy se distribuye un modelo: [`sar`](https://quarcs-lab.github.io/scspill/models/sar.html), el control sintético bayesiano con desbordamiento autorregresivo espacial de [Sakaguchi y Tagawa (2026)](https://doi.org/10.1093/ectj/utag006). Otros tres modelos que incorporan desbordamientos están en la [hoja de ruta](https://quarcs-lab.github.io/scspill/models/#planned): el de Cao y Dowd, el control sintético inclusivo de Di Stefano y Mellace, y el SCG con interferencia parcial de Grossi y coautores. **No están implementados**, y `SCSPILLConfig` rechaza sus nombres en lugar de recurrir a otro modelo de forma silenciosa.

### 🧪 [Validación](https://quarcs-lab.github.io/scspill/articles/validation.html)

La evidencia de que el muestreador de `sar` es correcto: la **prueba de distribución conjunta de Geweke (2004)**, cuadrículas de sensibilidad a las distribuciones a priori, verificaciones predictivas a priori y validación cruzada frente a los intervalos de credibilidad congelados del código en R de los autores.

## Qué incluye

**`scspill`** — la capa de modelos. `SCSPILL(config).fit()` devuelve el ATT y su intervalo de credibilidad, la trayectoria contrafactual, la distribución posterior de ρ, un panel de desbordamientos por tiempo y donante, y los diagnósticos MCMC.

**`scspill.validation`** — la validación del muestreador de `sar`: la prueba de distribución conjunta de Geweke, las cuadrículas de sensibilidad a las distribuciones a priori y las verificaciones predictivas a priori.

**`scspill.simulate`** — el [motor de Monte Carlo](https://quarcs-lab.github.io/scspill/articles/simulation-study.html) de `sar`: un proceso generador de datos SAR sobre una retícula de contigüidad tipo torre y la comparación SCM / BSCM / SCSPILL que sustenta los cuadros 1 y 2 del artículo.

**`scspill.data`** — los paneles de desbordamiento que se describen más abajo. Son independientes del modelo, así que cualquier modelo que se añada más adelante podrá usarlos sin cambios.

**`sar` está validado, no solo implementado** — se contrasta con el paquete de replicación en R de los autores: las distribuciones posteriores de California y Sudán frente a los intervalos de credibilidad congelados en R, la cuadrícula de Monte Carlo frente a los cuadros congelados del artículo, y los estadísticos predictivos a priori hasta el tercer decimal. Las opciones por defecto son *fieles al artículo*: se corrigen varios errores documentados de la implementación de referencia, cada uno con una vía de escape o una comparación que cuantifica la diferencia. Véase la [página del modelo `sar`](https://quarcs-lab.github.io/scspill/models/sar.html).

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

Cargue un caso de estudio incluido, ajuste el muestreador y lea ambos estimandos:

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

Diríjase a [Primeros pasos](https://quarcs-lab.github.io/scspill/get-started.html), [Modelos](https://quarcs-lab.github.io/scspill/models/) y [Validación](https://quarcs-lab.github.io/scspill/articles/validation.html) para ver los estimadores en acción.

## Construido sobre

`scspill` mantiene sus dependencias deliberadamente ligeras: la pila científica moderna de Python y nada más.

- **[NumPy](https://numpy.org)** y **[SciPy](https://scipy.org)** — el motor del muestreador
- **[pandas](https://pandas.pydata.org)** — los paneles y las tablas de desbordamientos
- **[pydantic](https://docs.pydantic.dev)** — la configuración validada del estimador
- **[matplotlib](https://matplotlib.org)** — las figuras de diagnóstico y contrafactuales
- **[numba](https://numba.pydata.org)** — muestreadores opcionales compilados con JIT

## Agradecimiento

`scspill` es obra de Carlos Mendez, Shosei Sakaguchi y Hayato Tagawa. El paquete de Python está escrito y es mantenido por Carlos Mendez; el modelo `sar` y su implementación original en R/C++ son obra de Shosei Sakaguchi y Hayato Tagawa. Su [paquete de replicación](https://doi.org/10.5281/zenodo.19066186) se distribuye bajo licencia MIT, su aviso de derechos de autor se conserva en el archivo `LICENSE` de la biblioteca, y cada versión de `scspill` se valida de forma cruzada frente a sus resultados congelados. La arquitectura del estimador sigue a [mlsynth](https://github.com/jgreathouse9/mlsynth), de Jared Greathouse; la infraestructura de documentación sigue al paquete [geometrics](https://github.com/quarcs-lab/geometrics) del QuaRCS Lab.

Si utiliza `scspill`, cite el software (los metadatos legibles por máquina están en [`CITATION.cff`](https://github.com/quarcs-lab/scspill/blob/main/CITATION.cff)):

> Mendez, C., Sakaguchi, S., & Tagawa, H. (2026). *Synthetic Control Models with Spillovers in Python* (version 0.2.1). <https://github.com/quarcs-lab/scspill>

Distribuido bajo la licencia MIT.
