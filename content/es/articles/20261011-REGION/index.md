---
title: "Crecimiento regional, convergencia y efectos de desbordamiento espacial en India: una perspectiva reproducible desde el espacio"
authors:
- admin
- Sujana Kabiraj
- Jiaqi Li
date: "2026-10-11T00:00:00Z"
publishDate: "2026-10-11T00:00:00Z"
doi: "10.18335/region.v13i2.676"
publication_types: ["2"]
publication: "*REGION*, 13(2), 173–196"
publication_short: ""
abstract: "Utilizando datos satelitales de luces nocturnas como indicador aproximado de la actividad económica, Chanda y Kabiraj (2020, World Development) estudiaron el crecimiento regional y la convergencia en 520 distritos de India. Mediante un enfoque reproducible de ciencia abierta, este artículo amplía sus principales hallazgos en tres frentes empíricos. Primero, ilustramos los patrones de convergencia regional con una herramienta interactiva de visualización de imágenes satelitales. Segundo, evaluamos el grado de dependencia espacial en su principal especificación econométrica. Tercero, empleamos un modelo espacial de Durbin para medir el papel de los efectos de desbordamiento espacial en el proceso de convergencia. Nuestros resultados indican que estos efectos aumentan la velocidad estimada de convergencia regional. En nuestro modelo con la especificación completa, los desbordamientos elevan la velocidad de convergencia de aproximadamente 3,0 % a aproximadamente 5,2 % anual, lo que reduce el tiempo necesario para cerrar la mitad de las disparidades regionales de unos 23 a 13 años. Concluimos mostrando cómo el mismo flujo de trabajo reproducible se extiende más allá de la producción económica, mediante un análisis exploratorio de la relación entre luminosidad y participación cultural en los estados de India."
summary: "Las luces nocturnas satelitales muestran cómo los distritos más pobres de India acortan las brechas. Considerar las conexiones entre distritos vecinos eleva el ritmo estimado de convergencia y reduce de unos 23 a 13 años el tiempo necesario para cerrar la mitad de la brecha."
tags:
- Regional convergence
- Spatial dependence
- Spatial Durbin model
- Nighttime lights
- Reproducible research
- India
featured: true
links:
- name: "Artículo publicado (acceso abierto)"
  url: "https://doi.org/10.18335/region.v13i2.676"
  icon_pack: fas
  icon: university
- name: "Aprenda programando"
  url: "https://quarcs-lab.github.io/project2025s-py/"
  icon_pack: fas
  icon: laptop-code
- name: "Mapa interactivo de luminosidad"
  url: "https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl"
  icon_pack: fas
  icon: globe
- name: "Artículo en línea"
  url: "https://quarcs-lab.github.io/project2025s-py/index-preview.html"
  icon_pack: fas
  icon: book-open
- name: "N1: Vista desde el espacio"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c01_view_from_space-preview.html"
  icon_pack: fas
  icon: laptop-code
- name: "N2: Convergencia regional"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c02_regional_convergence_sc-preview.html"
  icon_pack: fas
  icon: laptop-code
- name: "N3: Dependencia espacial"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c03_spatial_dependence_lisa-preview.html"
  icon_pack: fas
  icon: laptop-code
- name: "N4: Modelación de desbordamientos"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c04_spillover_modeling_6nn-preview.html"
  icon_pack: fas
  icon: laptop-code
- name: "N5: Robustez"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c07_alternative_w_matrices-preview.html"
  icon_pack: fas
  icon: laptop-code
- name: "N6: Cultura espacial"
  url: "https://quarcs-lab.github.io/project2025s-py/notebooks/c06_spatial_culture-preview.html"
  icon_pack: fas
  icon: laptop-code
url_pdf: "https://openjournals.wu.ac.at/ojs/index.php/region/article/download/676/542"
url_code: "https://github.com/quarcs-lab/project2025s-py"
url_dataset: ""
url_preprint: ""
url_slides: ""
url_video: ""
url_poster: ""
url_project: ""
image:
  caption: ""
  alt_text: "¿A qué velocidad convergen los distritos de India? Los mapas publicados comparan la luminosidad nocturna de 1996 y 2010. Para 520 distritos, el Modelo 4 estima una convergencia anual de 3,0 % con mínimos cuadrados ordinarios y 5,2 % con un modelo espacial de Durbin, con tiempos implícitos para cerrar la mitad de la brecha de 23 y 13 años. La convergencia estimada es más rápida al incluir los desbordamientos; son estimaciones de modelos, no efectos causales de políticas."
  focal_point: ""
  preview_only: false
---

## La pregunta

¿Los distritos más pobres convergen hacia los más ricos y cambia la respuesta al considerar las conexiones entre distritos vecinos? Este artículo reexamina el crecimiento en **520 distritos de India durante 1996–2010**, utilizando las luces nocturnas satelitales por habitante como indicador aproximado de la actividad económica. Amplía el trabajo de Chanda y Kabiraj (2020) mediante visualización interactiva, pruebas de dependencia espacial y modelación de efectos de desbordamiento espacial.

## ¿Qué cambia al incorporar a los vecinos en el modelo?

La especificación preferida incluye variables de control y efectos fijos estatales. Comparar mínimos cuadrados ordinarios con los **efectos totales de un modelo espacial de Durbin** cambia la velocidad implícita de convergencia:

| Estimación del Modelo 4 | Mínimos cuadrados ordinarios | Modelo espacial de Durbin |
| :--- | ---: | ---: |
| Velocidad anual de convergencia | 3,0 % | 5,2 % |
| Tiempo implícito para cerrar la mitad de la brecha | 23 años | 13 años |

Estos valores redondeados aparecen en el **Cuadro 3, página 184**, del artículo publicado. El tiempo de semiconvergencia indica cuánto se necesita para cerrar la mitad de la brecha inicial respecto al estado estacionario según el modelo. No significa que todos los distritos alcancen el mismo nivel de ingreso después de 13 años.

El modelo espacial capta asociaciones locales y con los vecinos. Las pruebas de robustez comparan la especificación base de los seis vecinos más cercanos con seis matrices alternativas de ponderación espacial: los efectos directos y totales de convergencia permanecen negativos y estadísticamente significativos en las siete especificaciones (Cuadro 4).

## Qué permite concluir la evidencia

Las conexiones espaciales importan para medir la convergencia. El análisis **no** identifica el efecto causal de cambiar las condiciones de un distrito sobre el crecimiento de otro. La geografía, las instituciones y la infraestructura compartidas, las variables omitidas y la difusión de la luz a través de los límites distritales pueden contribuir a la dependencia espacial. Las estimaciones también resumen un único período de crecimiento de 14 años, en lugar de cambios año a año.

Un análisis exploratorio final relaciona la luminosidad con la participación cultural en los estados de India. Ilustra cómo utilizar el flujo de trabajo reproducible más allá de la producción económica; las luces nocturnas también reflejan electrificación y urbanización.

## Aprenda reproduciendo el análisis

El [artículo en línea y los materiales de aprendizaje](https://quarcs-lab.github.io/project2025s-py/) vinculan cada resultado con su fuente. Cinco cuadernos analíticos de Python se ejecutan en Google Colaboratory; el primer cuaderno ofrece la visualización interactiva y su script de Google Earth Engine.

1. [**N1: Vista desde el espacio**](https://quarcs-lab.github.io/project2025s-py/notebooks/c01_view_from_space-preview.html) — Explore las luces nocturnas con Google Earth Engine.
2. [**N2: Convergencia regional**](https://quarcs-lab.github.io/project2025s-py/notebooks/c02_regional_convergence_sc-preview.html) — Estime la convergencia, su velocidad y el tiempo para cerrar la mitad de la brecha.
3. [**N3: Dependencia espacial**](https://quarcs-lab.github.io/project2025s-py/notebooks/c03_spatial_dependence_lisa-preview.html) — Construya ponderaciones espaciales y examine el índice I de Moran y los conglomerados locales.
4. [**N4: Modelación de desbordamientos**](https://quarcs-lab.github.io/project2025s-py/notebooks/c04_spillover_modeling_6nn-preview.html) — Compare mínimos cuadrados ordinarios y modelos espaciales de Durbin, incluidos los efectos directos, indirectos y totales.
5. [**N5: Robustez**](https://quarcs-lab.github.io/project2025s-py/notebooks/c07_alternative_w_matrices-preview.html) — Evalúe el modelo preferido con matrices alternativas de ponderación espacial.
6. [**N6: Cultura espacial**](https://quarcs-lab.github.io/project2025s-py/notebooks/c06_spatial_culture-preview.html) — Explore la luminosidad y la participación cultural en los estados de India.

El [repositorio de GitHub](https://github.com/quarcs-lab/project2025s-py) contiene los cuadernos, los datos y el código fuente del manuscrito. El [mapa interactivo de luminosidad](https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl) le permite explorar directamente las imágenes satelitales.

## Publicación y fuentes de la imagen

Carlos Mendez, Sujana Kabiraj y Jiaqi Li (2026). “Regional growth, convergence, and spatial spillovers in India: A reproducible view from outer space”. *REGION*, **13**(2), 173–196. Publicado el 11 de octubre de 2026. [DOI: 10.18335/region.v13i2.676](https://doi.org/10.18335/region.v13i2.676).

La infografía reproduce el [mapa de luminosidad de la Figura 1](https://quarcs-lab.github.io/project2025s-py/images/luminosity_map.png) de los autores y representa los valores del Modelo 4 publicados en el Cuadro 3. El mapa conserva sus colores, geografía y escala originales; el diseño que lo rodea y el gráfico comparativo son nuevos. Artículo y mapa fuente: Mendez, Kabiraj y Li (2026), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
