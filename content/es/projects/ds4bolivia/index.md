---
date: "2026-01-14T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: Un repositorio de ciencia de datos para estudiar el desarrollo geoespacial en Bolivia
tags:
- spatial
- python
- regional
title: "DS4Bolivia"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/ds4bolivia"
    icon_pack: ai
    icon: open-data

url_code: "https://github.com/quarcs-lab/ds4bolivia"
url_pdf: ""
url_slides: "https://carlos-mendez.my.canva.site/ds4bolivia-introduction-pdf"
url_video: "https://youtu.be/kJ4Y6_hWadw"
---


# DS4Bolivia: un repositorio de ciencia de datos para estudiar el desarrollo geoespacial en Bolivia


[¡Bienvenido/a a **DS4Bolivia**!](https://github.com/quarcs-lab/ds4bolivia) Este proyecto reúne conjuntos de datos espaciales y socioeconómicos, paneles interactivos y flujos de trabajo computacionales centrados en los **339 municipios** de Bolivia. Está diseñado para tender un puente entre el análisis espacial y los Objetivos de Desarrollo Sostenible (ODS).

Este repositorio está organizado para personas dedicadas a la investigación y a la ciencia de datos interesadas en:

* **Econometría espacial:** comprender las disparidades, el crecimiento y la agrupación regionales.
* **Aprendizaje automático espacial:** aprovechar las imágenes satelitales (observación de la Tierra) para el modelado predictivo.
* **Desarrollo sostenible:** hacer seguimiento de los indicadores de los ODS a un nivel local granular.

---

## 🖥️ Paneles geoespaciales interactivos

Explora los datos sin escribir código. Estas aplicaciones visualizan la dinámica espacio-temporal de indicadores clave del desarrollo.

* [Dinámica espacio-temporal de la población, la luminosidad, la cobertura del suelo y el PIB (2013-2019)](https://carlos-mendez.projects.earthengine.app/view/geoexplorer1v100bolivia): visualiza la evolución de la densidad de población, las luces nocturnas, los cambios en la cobertura del suelo y las estimaciones del PIB en los municipios bolivianos en 2013 y 2019.

---

## 🐍 Cuadernos computacionales en la nube

Tutoriales paso a paso que te ayudan a reproducir nuestro análisis. Estos cuadernos utilizan bibliotecas de Python como `GeoPandas` y `PySAL`.

* **[Introducción al análisis exploratorio de datos espaciales (ESDA)](https://colab.research.google.com/github/quarcs-lab/ds4bolivia/blob/master/notebooks/esda.ipynb)**
* *Enfoque:* aprende a detectar agrupaciones y valores atípicos espaciales mediante la I de Moran global y local.
* *Conceptos clave:* autocorrelación espacial, estadísticos LISA, mapas coropléticos.

---

## 💾 Conjuntos de datos espacialmente explícitos

Conjuntos de datos curados y listos para el análisis. Estos archivos están preprocesados para ajustarse a los límites municipales de Bolivia.

* **[ODS e incrustaciones satelitales (2017)](https://github.com/quarcs-lab/ds4bolivia/blob/master/datasets/sdgs_satelliteEmbeddings2017.csv)**
* *Descripción:* un conjunto de datos combinado que une indicadores socioeconómicos (ODS) con vectores de características de alta dimensión extraídos de imágenes satelitales.
* *Caso de uso:*　entrenar modelos de aprendizaje automático para predecir índices de pobreza o de desarrollo a partir de patrones visuales desde el espacio.

---

## 📜 Cómo citar

Si utilizas este repositorio en tu investigación, cítalo con los siguientes metadatos.

### Formato APA
Mendez, C., Gonzales, E., Leoni, P., Andersen, L., Hendrix, P. (2024). DS4Bolivia: A Data Science Repository to Study GeoSpatial Development in Bolivia [Data set]. GitHub. https://github.com/quarcs-lab/ds4bolivia

### Formato BibTeX

```bibtex
@misc{ds4bolivia2026,
  author = {Mendez, Carlos and Gonzales, Erick and Leoni, Pedro and Andersen, Lykke and Hendrix, Peralta},
  title = {{DS4Bolivia}: A Data Science Repository to Study GeoSpatial Development in Bolivia},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/quarcs-lab/ds4bolivia}}
}
```

---

## 🚀 Construye tu propio conjunto de datos

Los conjuntos de datos están organizados en módulos, todos vinculados por un identificador único (`asdf_id`).

| Categoría del conjunto de datos | Ruta del archivo | Descripción | Clave de unión |
| :--- | :--- | :--- | :--- |
| **Nombres de regiones** | `/regionNames/regionNames.csv` | Metadatos administrativos (nombres de municipios y de departamentos). | `asdf_id` |
| **Socioeconómico** | `/sdg/sdg.csv` | Índices de los Objetivos de Desarrollo Sostenible (ODS) y métricas de pobreza. | `asdf_id` |
| **Características satelitales** | `/satelliteEmbeddings/satelliteEmbeddings2017.csv` | Vectores de características (incrustaciones) extraídos de imágenes satelitales diurnas. | `asdf_id` |
| **Vector espacial** | `/maps/bolivia339geoqueryOpt.geojson` | Límites geométricos (polígonos) de todos los municipios. | `asdf_id` |

> **⚠️ Nota importante sobre los identificadores:** > La clave principal para unir todos los conjuntos de datos de este repositorio es **`asdf_id`**.  
> Aunque `mun_id` (el código gubernamental estándar) está presente en los datos administrativos, `asdf_id` garantiza la coherencia entre las incrustaciones satelitales y los archivos de mapas optimizados que se proporcionan aquí. Asegúrate siempre de que esta columna se trate de forma coherente como `int` o `string` en ambos dataframes antes de fusionarlos.

---

Puedes ejecutar los ejemplos de abajo de inmediato en [Google Colab](https://colab.research.google.com/notebooks/empty.ipynb).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/notebooks/empty.ipynb)

### Ejemplo 1: integración de datos de atributos
Este script muestra cómo fusionar los nombres administrativos, los indicadores socioeconómicos y las características de aprendizaje automático satelitales en un único dataframe analítico.

```python
import pandas as pd

# -----------------------------------------------------------------------------
# 1. SETUP: Define Source URLs
# We use the raw GitHub URL to stream data directly into Colab/Pandas.
# -----------------------------------------------------------------------------
REPO_URL = "https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master"

url_names = f"{REPO_URL}/regionNames/regionNames.csv"
url_sdg = f"{REPO_URL}/sdg/sdg.csv"
url_emb = f"{REPO_URL}/satelliteEmbeddings/satelliteEmbeddings2017.csv"

# -----------------------------------------------------------------------------
# 2. LOAD: Read CSVs
# -----------------------------------------------------------------------------
print("Loading datasets...")
df_names      = pd.read_csv(url_names)
df_sdg        = pd.read_csv(url_sdg)
df_embeddings = pd.read_csv(url_emb)

# -----------------------------------------------------------------------------
# 3. MERGE: Combine Dataframes
# -----------------------------------------------------------------------------
# Step A: Attach SDG data to Names
df_merged_step1 = pd.merge(df_names, df_sdg, on='asdf_id', how='inner')

# Step B: Attach Satellite Embeddings to the result
df_final = pd.merge(df_merged_step1, df_embeddings, on='asdf_id', how='inner')

# -----------------------------------------------------------------------------
# 4. VERIFY
# -----------------------------------------------------------------------------
print(f"Merge Complete.")
print(f"Original Municipalities: {len(df_names)}")
print(f"Final Merged Rows:       {len(df_final)}")
print(f"Total Columns:           {len(df_final.columns)}")

# Display the first few rows (names + first few embedding columns)
display(df_final[['mun', 'dep', 'index_sdg1', 'A00', 'A01', 'A02']].head())
```

### Ejemplo 2: integración de datos espaciales y de atributos
Este script toma los datos fusionados del Ejemplo 1 y los une a las geometrías de los municipios (GeoJSON) para el análisis y la representación espacial.

```python

import geopandas as gpd
import matplotlib.pyplot as plt

# -----------------------------------------------------------------------------
# 1. LOAD SPATIAL DATA
# We load the optimized GeoJSON file containing municipality boundaries.
# -----------------------------------------------------------------------------
geojson_url = f"{REPO_URL}/maps/bolivia339geoqueryOpt.geojson"
print("Loading GeoJSON map...")
gdf_boundaries = gpd.read_file(geojson_url)

# -----------------------------------------------------------------------------
# 2. SPATIAL DATA PREPARATION
# GeoJSON often loads IDs as objects/strings, while CSVs load as integers.
# -----------------------------------------------------------------------------
# Force 'asdf_id' to integer to match the pandas dataframe
gdf_boundaries['asdf_id'] = gdf_boundaries['asdf_id'].astype(int)

# -----------------------------------------------------------------------------
# 3. ATTRIBUTE JOIN
# Merge the spatial dataframe (gdf) with the attribute dataframe (df_final).
# This creates a 'GeoDataFrame' capable of spatial operations.
# -----------------------------------------------------------------------------
gdf_bolivia = gdf_boundaries.merge(df_final, on='asdf_id', how='inner')

# -----------------------------------------------------------------------------
# 4. VISUALIZATION (Choropleth Map)
# Plot the "No Poverty" SDG Index (SDG 1)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(1, 1, figsize=(12, 10))

gdf_bolivia.plot(
    column='index_sdg1',    # Variable to map
    cmap='viridis',         # Color palette (perceptually uniform)
    linewidth=0.1,          # Border width
    edgecolor='white',      # Border color
    legend=True,
    legend_kwds={'label': "SDG 1 Index (No Poverty)", 'orientation': "horizontal"},
    ax=ax
)

ax.set_title("Bolivia: SDG 1 Index by Municipality", fontsize=15)
ax.set_axis_off()           # Turn off lat/lon axis numbers for cleaner look
plt.show()
```



---

## Fuentes de datos

- Los indicadores de los ODS fueron construidos originalmente por [Andersen, L. E., Canelas, S., Gonzales, A., Peñaranda, L. (2020) Atlas municipal de los Objetivos de Desarrollo Sostenible en Bolivia 2020. La Paz: Universidad Privada Boliviana, SDSN Bolivia](https://atlas.sdsnbolivia.org)




## 🤝 Cómo contribuir

¡Las contribuciones son bienvenidas! Si vas a corregir un problema con el sistema de referencia de coordenadas (CRS), añadir un nuevo modelo espacial o subir datos nuevos, [envía un Pull Request](https://github.com/quarcs-lab/ds4bolivia/pulls).
