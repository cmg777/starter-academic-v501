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
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
url_code: "https://github.com/quarcs-lab/geo4bolivia"
url_pdf: ""
url_slides: ""
url_video: ""
---

El **Observatorio de GeoDesarrollo de Bolivia (GDO-Bolivia)** reúne datos de acceso público, herramientas de análisis y resultados de investigación para el seguimiento del desarrollo subnacional a distintas escalas geográficas. Conecta indicadores de imágenes satelitales, censos y registros administrativos con flujos de trabajo reproducibles para la investigación, la toma de decisiones y la ciudadanía.

## Explore los datos

El observatorio vincula unidades geográficas mediante identificadores comunes, lo que permite conectar y agregar datos a distintas escalas, incluidos municipios, provincias y departamentos. La cobertura disponible depende del conjunto de datos; cada página documenta sus variables, fuentes, años de referencia y condiciones de licencia.

| Colección | Cobertura actual |
|---|---|
| [Indicadores de los Objetivos de Desarrollo Sostenible](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-sdg/) | 64 indicadores con distintos años de referencia entre 2010 y 2020; cada uno se almacena en su propio año de referencia, en lugar de formar una serie anual completa. |
| [Luces nocturnas per cápita](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-ntl/) | 2012–2020; una aproximación satelital de la actividad económica local. |
| [Población](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-pop/) | Estimaciones de población en cuadrículas y densidad, 2001–2020. |
| [Representaciones vectoriales satelitales](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-emb/) | 64 características derivadas de satélites para 2017, con versiones ponderadas por superficie y por población. |

La cobertura varía según la colección y la variable. Consulte la documentación antes de comparar años o combinar indicadores. Los mapas tienen fines estadísticos e informativos; no definen límites territoriales oficiales.

## Inicie un análisis

La [guía de inicio de geo4bolivia](https://quarcs-lab.github.io/geo4bolivia/tools/geo4bolivia-quickstart/) muestra cómo cargar datos, vincular una tabla con los identificadores geográficos comunes y agregar indicadores entre escalas. La [colección de herramientas](https://quarcs-lab.github.io/geo4bolivia/#tools) incluye paquetes de Python, cuadernos de Google Colab y una aplicación web interactiva, con ejemplos de pobreza, desigualdad espacial y aprendizaje automático.

Como introducción a la investigación, explore el [análisis sobre capital humano](https://quarcs-lab.github.io/geo4bolivia/insights/human-capital-paper/). Para hacer una pregunta, proponer un indicador o compartir un análisis, participe en las [discusiones de GitHub](https://github.com/quarcs-lab/geo4bolivia/discussions).

## Cite el observatorio

> Mendez, C. (2026). *GeoDevelopment Observatory of Bolivia*. https://quarcs-lab.github.io/geo4bolivia/

Cuando utilice un conjunto de datos específico, cite también ese conjunto y sus fuentes originales según lo indicado en su página.

*Imagen de portada: captura de la vista de Santa Cruz de GDO-Bolivia. Imágenes satelitales: Sentinel-2 cloudless 2016 de EOX IT Services GmbH (datos modificados de Copernicus Sentinel, CC BY 4.0), sobre NASA Blue Marble.*
