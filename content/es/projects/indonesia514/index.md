---
date: "2026-06-10T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: Un repositorio de ciencia de datos para estudiar el desarrollo regional en los 514 distritos de Indonesia
tags:
- spatial
- python
- regional
title: "Indonesia514"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/indonesia514/"
    icon_pack: ai
    icon: open-data

url_code: "https://github.com/quarcs-lab/indonesia514"
url_pdf: ""
url_slides: ""
url_video: ""
---


# Indonesia514: un repositorio de ciencia de datos para estudiar el desarrollo regional en los 514 distritos de Indonesia


[¡Bienvenido/a a **Indonesia514**!](https://github.com/quarcs-lab/indonesia514) Este proyecto centraliza datos geoespaciales e indicadores económicos regionales —incluidos el PIB, la inversión y el gasto público— de los **514 distritos** de Indonesia. Todos los conjuntos de datos comparten un identificador común, `districtID`, de modo que pueden fusionarse en una única tabla analítica.

Este repositorio está organizado para personas dedicadas a la investigación y a la ciencia de datos interesadas en:

* **Economía regional:** medir el crecimiento, la formación de capital y la política fiscal a nivel distrital.
* **Análisis espacial:** vincular los indicadores económicos con las geometrías de los distritos para la cartografía y la econometría espacial.
* **Flujos de trabajo reproducibles:** transmitir conjuntos de datos abiertos directamente a Python mediante una única clave de unión.

> **⚙️ En desarrollo activo.** Este repositorio es un borrador en etapa inicial. Los límites de los distritos están completos en formato GeoJSON y el sitio web bilingüe (inglés / bahasa indonesio) está disponible, pero los conjuntos de datos económicos contienen actualmente **datos de muestra de 16 distritos**: las series completas de los 514 distritos están pendientes. Los paneles interactivos y los cuadernos analíticos están planificados y aún no se han publicado.

---

## 💾 Conjuntos de datos

Conjuntos de datos curados y organizados en módulos, todos vinculados por un identificador único (`districtID`).

| Conjunto de datos | Ruta del archivo | Descripción | Clave de unión |
| :--- | :--- | :--- | :--- |
| **PIB** | `/gdp/gdp.csv` | Producto interno bruto a nivel distrital (2010-2022). | `districtID` |
| **GFCF** | `/gfcf/gfcf.csv` | Formación bruta de capital fijo, una medida de la inversión (2010-2022). | `districtID` |
| **Gasto público** | `/gs/gs.csv` | Gasto público y distribución de la política fiscal (2010-2022). | `districtID` |
| **Vector espacial** | `/maps/mapIdonesia514tp.geojson` | Límites geométricos (polígonos) de los 514 distritos. | `districtID` |

> **⚠️ Nota importante sobre los identificadores:** la clave principal para unir todos los conjuntos de datos de este repositorio es **`districtID`**. Los archivos de PIB, GFCF y gasto público contienen actualmente una muestra de 16 distritos; se están añadiendo los datos completos de los 514 distritos. Trate siempre `districtID` de forma coherente (como `int` o `string`) en ambos dataframes antes de fusionarlos.

---

## 🐍 Inicio rápido

Transmita los conjuntos de datos directamente desde GitHub y fusiónelos por `districtID` con `pandas`. Puede ejecutar el código siguiente en un [borrador de Google Colab](https://colab.research.google.com/notebooks/empty.ipynb) en blanco, sin necesidad de configuración ni instalación.

```python
import pandas as pd

# -----------------------------------------------------------------------------
# 1. SETUP: Define the raw GitHub URL to stream data directly into Pandas.
# -----------------------------------------------------------------------------
REPO_URL = "https://raw.githubusercontent.com/quarcs-lab/indonesia514/main"

# -----------------------------------------------------------------------------
# 2. LOAD: Read the economic CSVs.
# -----------------------------------------------------------------------------
df_gdp  = pd.read_csv(f"{REPO_URL}/gdp/gdp.csv")
df_gfcf = pd.read_csv(f"{REPO_URL}/gfcf/gfcf.csv")
df_gs   = pd.read_csv(f"{REPO_URL}/gs/gs.csv")

# -----------------------------------------------------------------------------
# 3. MERGE: Combine the indicators on the common district identifier.
# -----------------------------------------------------------------------------
df = pd.merge(df_gdp,  df_gfcf[['districtID', 'gfcf_2022']], on='districtID')
df = pd.merge(df,      df_gs[['districtID', 'gs_2022']],     on='districtID')
```

---

## 📜 Cómo citar

Si utiliza este repositorio en su investigación, cítelo con los siguientes metadatos.

### Formato APA
Mendez, C., Abdulah, R., Arvianto, B., & Leiva, F. (2026). Indonesia514: A data science repository to study regional development in Indonesia. GitHub. https://github.com/quarcs-lab/indonesia514

### Formato BibTeX

```bibtex
@misc{indonesia5142026,
  author = {Mendez, Carlos and Abdulah, Rusli and Arvianto, Bimo and Leiva, Favio},
  title = {{Indonesia514}: A Data Science Repository to Study Regional Development in Indonesia},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/quarcs-lab/indonesia514}}
}
```

---

## Licencia

Este repositorio se distribuye bajo la **Licencia MIT**, que permite una amplia reutilización con la atribución adecuada.

---

## 🤝 Cómo contribuir

¡Las contribuciones son bienvenidas! Si va a añadir los datos completos de los distritos, corregir un problema con el sistema de referencia de coordenadas (CRS), crear un nuevo cuaderno o integrar indicadores nuevos, [envíe un Pull Request](https://github.com/quarcs-lab/indonesia514/pulls).
