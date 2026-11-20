---
data_type: portal
region: bolivia
date: "2026-10-29T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Center
summary: Un observatorio del desarrollo subnacional para el seguimiento del desarrollo regional de Bolivia a distintas escalas geográficas, con datos abiertos, herramientas de análisis y resultados de investigación.
tags:
- spatial
- python
- regional
title: Observatorio de GeoDesarrollo de Bolivia
links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/gdo4bolivia/"
    icon_pack: ai
    icon: open-data
  - name: "Documentación del paquete"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: fas
    icon: book
url_code: "https://github.com/quarcs-lab/gdo4bolivia"
url_pdf: ""
url_slides: ""
url_video: ""
---

El **Observatorio de GeoDesarrollo de Bolivia (GDO-Bolivia)** reúne datos de acceso público, herramientas de análisis y resultados de investigación para el seguimiento del desarrollo subnacional a distintas escalas geográficas. Conecta indicadores de imágenes satelitales, censos y registros administrativos con flujos de trabajo reproducibles para la investigación, la toma de decisiones y la ciudadanía.

## Explore los datos

El observatorio vincula unidades geográficas mediante identificadores comunes, lo que permite conectar y agregar datos a distintas escalas: municipios, provincias y departamentos. Su mapa municipal es el de SDSN Bolivia de 2025, con 343 municipios y autonomías indígenas. La cobertura disponible depende del conjunto de datos; cada página documenta sus variables, fuentes, años de referencia y condiciones de licencia.

| Colección | Cobertura actual |
|---|---|
| [Índice de Desarrollo Sostenible y objetivos de los ODS](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-sdg/) | El Atlas de los ODS en Bolivia 2026 (SDSN Bolivia): el Índice de Desarrollo Sostenible y su ranking, además de un conjunto de datos por objetivo (15 objetivos, 81 indicadores), para los 343 municipios en dos periodos, cerca de 2012 y cerca de 2024. |
| [Luces nocturnas per cápita](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-ntl/) | 2012–2020 para 333 municipios; una aproximación satelital de la actividad económica local. |
| [Población](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-pop/) | Estimaciones de población en cuadrículas y densidad, 2001–2020, para 333 municipios. |
| [Representaciones vectoriales satelitales](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-emb/) | 64 características derivadas de satélites para 2017, con versiones ponderadas por superficie y por población, para 333 municipios. |

La cobertura varía según la colección y la variable. Consulte la documentación antes de comparar años o combinar indicadores. Los mapas tienen fines estadísticos e informativos; no definen límites territoriales oficiales.

## Inicie un análisis

El paquete de Python [geo4bolivia](https://quarcs-lab.github.io/geo4bolivia/) carga cualquier indicador en una línea, lo traslada entre escalas y ejecuta los análisis fundamentales de la ciencia de datos espaciales con una sola llamada cada uno: mapas, agrupamiento espacial (I de Moran y LISA), convergencia, transiciones y movilidad, desigualdad, regresión y modelos espaciales, y regresión geográficamente ponderada multiescala. Su [documentación](https://quarcs-lab.github.io/geo4bolivia/) (en inglés) incluye una [guía de inicio](https://quarcs-lab.github.io/geo4bolivia/get-started.html), un artículo por método desarrollado con datos de Bolivia y una [referencia de funciones](https://quarcs-lab.github.io/geo4bolivia/reference/) con un ejemplo para cada función.

En el observatorio, la [guía de inicio de geo4bolivia](https://quarcs-lab.github.io/gdo4bolivia/tools/geo4bolivia-quickstart/) es un cuaderno listo para ejecutar, y la [colección de herramientas](https://quarcs-lab.github.io/gdo4bolivia/#tools) incluye paquetes de Python, cuadernos de Google Colab y una aplicación web interactiva, con ejemplos de pobreza, desigualdad espacial, desarrollo sostenible y aprendizaje automático.

Como introducción a la investigación, explore el [análisis sobre capital humano](https://quarcs-lab.github.io/gdo4bolivia/insights/human-capital-paper/). Para hacer una pregunta, proponer un indicador o compartir un análisis, participe en las [discusiones de GitHub](https://github.com/quarcs-lab/gdo4bolivia/discussions).

## Cite el observatorio

> Mendez, C. (2026). *GeoDevelopment Observatory of Bolivia*. https://quarcs-lab.github.io/gdo4bolivia/

Cuando utilice un conjunto de datos específico, cite también ese conjunto y sus fuentes originales según lo indicado en su página.

*Imagen de portada: captura de la vista de Santa Cruz de GDO-Bolivia. Imágenes satelitales: Sentinel-2 cloudless 2016 de EOX IT Services GmbH (datos modificados de Copernicus Sentinel, CC BY 4.0), sobre NASA Blue Marble.*
