---
title: "Riqueza y peso, una revisión: un enfoque de promedio bayesiano de modelos para la curva de Kuznets de la obesidad"
authors: ["Katerine Restrepo Gómez", "He Du", "admin"]
date: "2026-10-08T00:00:00Z"
publishDate: "2026-10-08T00:00:00Z"
doi: "10.1007/s10198-026-01998-1"
publication_types: ["2"]
publication: "*The European Journal of Health Economics*"
publication_short: "European Journal of Health Economics"
abstract: "La amplia literatura sobre la existencia de una relación en forma de U invertida entre la prevalencia de la obesidad y el crecimiento económico, conocida como curva de Kuznets de la obesidad (OKC), ha producido evidencia mixta debido a la incertidumbre en la selección de modelos y variables. Abordamos este problema utilizando un panel de 84 países entre 2000 y 2020. Nuestros modelos de efectos fijos de país y año (TWFE) sugieren que la OKC sigue una forma de N invertida, con múltiples puntos de transición en la relación entre obesidad y riqueza. Para considerar la incertidumbre del modelo, empleamos el promedio bayesiano de modelos (BMA) sobre un amplio conjunto de posibles determinantes. La forma de N invertida se mantiene robusta y el BMA identifica predictores clave en los ámbitos económico, sociocultural y ambiental. Nuestros resultados sugieren que un único «punto de giro» simplifica excesivamente la transición de la obesidad y que las intervenciones focalizadas deben considerar las múltiples etapas del desarrollo económico."
summary: "¿Disminuye la obesidad a medida que los países se enriquecen? La evidencia de 84 países apunta a una relación más compleja, con múltiples puntos de giro en lugar de un único umbral de ingreso."
tags: ["Obesity", "Obesity Kuznets Curve", "Economic growth", "Model uncertainty", "Bayesian model averaging"]
featured: false
links:
- name: "Artículo publicado (acceso abierto)"
  url: "https://doi.org/10.1007/s10198-026-01998-1"
  icon_pack: fas
  icon: university
url_pdf: "https://link.springer.com/content/pdf/10.1007/s10198-026-01998-1.pdf"
url_code: ""
url_dataset: ""
url_preprint: ""
url_slides: ""
url_video: ""
url_poster: ""
url_project: ""
image:
  caption: ""
  alt_text: "¿Más riqueza, menos obesidad? Dos curvas reconstruidas a partir de las medias posteriores con distribuciones previas fija y robusta del Cuadro 2 descienden, ascienden y vuelven a descender en el rango de ingresos observado. El eje vertical muestra el componente del ingreso de la obesidad adulta en puntos porcentuales respecto a un PIB por persona de 10 000 dólares constantes de 2015; el eje horizontal muestra el PIB por persona en escala logarítmica. Ambos modelos utilizan 1195 observaciones de 84 países entre 2000 y 2020. No se muestra una banda de incertidumbre. La respuesta depende del nivel de ingreso: son asociaciones de modelos, no efectos causales."
  focal_point: ""
  preview_only: false
---

## La pregunta

¿Disminuye finalmente la obesidad cuando un país se vuelve más rico? La conocida **curva de Kuznets de la obesidad** plantea un aumento seguido de una caída. Este artículo pregunta si ese patrón sencillo se mantiene cuando se consideran muchas explicaciones posibles en lugar de elegir un único modelo estadístico.

El estudio abarca **84 países durante 2000–2020**. Combina estimaciones de obesidad adulta estandarizadas por edad de la Organización Mundial de la Salud con indicadores económicos, sociales y ambientales del Banco Mundial. La prevalencia de la obesidad es la proporción de personas de 18 años o más con un índice de masa corporal de al menos 30 kg/m². El ingreso se mide como PIB por persona en dólares constantes de 2015.

## Qué encuentra el análisis

El **promedio bayesiano de modelos** combina evidencia de modelos alternativos y pondera cada uno según el respaldo que recibe de los datos. Los efectos fijos de país y año se mantienen en todos los modelos, mientras que otras 61 posibles variables explicativas entran en el proceso de selección.

Los resultados principales respaldan una **relación en forma de N invertida**: el componente estimado del ingreso primero desciende, luego aumenta y finalmente vuelve a descender. Los tres términos del ingreso tienen una probabilidad posterior de inclusión de 1,00 con ambas distribuciones previas. El patrón de signos también aparece en las estimaciones con efectos fijos de país y año.

| Término del ingreso | Previa fija: media posterior | Previa robusta: media posterior |
| :--- | ---: | ---: |
| Logaritmo del PIB por persona | −189,358 | −187,464 |
| Cuadrado del logaritmo del PIB por persona | 21,620 | 21,405 |
| Cubo del logaritmo del PIB por persona | −0,804 | −0,796 |

Estos son los **coeficientes del Cuadro 2**, estimados con 1195 observaciones de país-año. Los términos deben interpretarse conjuntamente; un coeficiente aislado no es el efecto de un aumento de un dólar en el ingreso. Los modelos también identifican asociaciones robustas con indicadores como la superficie forestal, el uso de energía renovable, la densidad de población y la estructura agrícola.

## Cómo leer la infografía

La imagen representa el componente del ingreso directamente a partir de las medias posteriores del Cuadro 2 para ambas distribuciones previas. Cada curva se centra en un PIB por persona de **10 000 dólares constantes de 2015**, por lo que el eje vertical mide una diferencia en puntos porcentuales, no el nivel predicho de obesidad. El eje horizontal es logarítmico y abarca el rango de ingresos observado que aparece en el Cuadro 7. Este centrado no modifica la forma ni los puntos de giro.

Las curvas muestran únicamente medias posteriores. El artículo presenta desviaciones estándar marginales de los coeficientes, pero una banda válida de incertidumbre para la curva conjunta requeriría su distribución posterior conjunta o su covarianza. Por ello, la infografía no añade una banda. Es una reconstrucción original de las estimaciones de panel, no una reproducción de las curvas descriptivas agrupadas de las Figuras 1–2.

## Qué permite concluir la evidencia

Los resultados describen **asociaciones, no efectos causales**. Los promedios nacionales no permiten establecer cómo responde el peso de una persona a su ingreso. El extremo de ingresos bajos de la curva se apoya en menos países y en datos de vigilancia de la obesidad menos fiables. Una prueba con predictores rezagados cinco años conserva los términos del ingreso y sus signos, pero no elimina los factores de confusión que cambian con el tiempo ni la causalidad inversa.

El mensaje práctico es mirar más allá de un único umbral de ingreso. El desarrollo económico y la obesidad se relacionan en varias etapas, y un mayor ingreso por sí solo no garantiza una menor obesidad.

## Consulte la evidencia

- **Cuadro 2:** compare las dos distribuciones previas bayesianas y las probabilidades posteriores de inclusión.
- **Cuadros 3–4:** examine la evidencia de dos puntos de giro y distinga las estimaciones de panel dentro de cada país de las descripciones agrupadas entre países.
- **Cuadro 11:** consulte la prueba de robustez con predictores rezagados cinco años.

El [artículo publicado de acceso abierto](https://doi.org/10.1007/s10198-026-01998-1) incluye los métodos, los cuadros y el apéndice. Su declaración de disponibilidad de datos indica que el conjunto completo utilizado en el estudio puede solicitarse al autor de correspondencia mediante una petición razonable.

## Publicación y fuentes de la imagen

Restrepo Gómez, K., Du, H. y Mendez, C. (2026). “Wealth and weight revisited: A Bayesian model averaging approach to the Obesity Kuznets Curve”. *The European Journal of Health Economics*. Publicado el 8 de octubre de 2026. [DOI: 10.1007/s10198-026-01998-1](https://doi.org/10.1007/s10198-026-01998-1). Publicación anticipada en línea; aún no se han asignado volumen, número ni páginas.

La infografía es un gráfico original de los resultados numéricos del Cuadro 2 (página 5 del PDF), con el rango de ingresos del Cuadro 7 (página 13 del PDF). El artículo está disponible bajo la licencia [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Aquí no se modifican ni reproducen las figuras de la editorial.
