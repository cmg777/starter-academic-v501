---
date: "2026-05-17T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: Una introducción a la evaluación de impacto regional mediante métodos modernos de inferencia causal, con ejemplos resueltos y datos de acceso público para una reproducibilidad completa.
tags:
- r
- causal
- regional
title: "Métricas causales comparativas"

links:
  - name: "Sitio web"
    url: "https://quarcs-lab.github.io/ccm"
    icon_pack: ai
    icon: open-data
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/ccm"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## ¡Bienvenido/a a Métricas causales comparativas! (En desarrollo)

*Una introducción a la evaluación de impacto regional*

Una introducción a la **evaluación de impacto regional** mediante métodos modernos de inferencia causal implementados en R y renderizados con Quarto. El recurso abarca técnicas cuasiexperimentales para evaluar los efectos de políticas e intervenciones sobre resultados regionales, con ejemplos resueltos y datos de acceso público para una reproducibilidad completa.

Este libro en desarrollo incluye:

- **Un recorrido comparativo por los métodos** — Desde las series temporales interrumpidas y las diferencias en diferencias hasta el control sintético, las series temporales estructurales bayesianas y los estimadores modernos de datos de panel, todo con un enfoque comparativo regional.
- **Cuadernos en R + Quarto** — Capítulos reproducibles con código plegable, listos para renderizarse localmente o ampliarse con sus propios datos.

El libro está organizado en dos partes:

- **Parte I — Unidad tratada única (capítulos 1 a 9)** desarrolla la intuición con un único caso de estudio: el impuesto al cigarrillo de la Proposición 99 de California (1989).
- **Parte II — Adopción escalonada (capítulos 10 a 12)** pasa a entornos en los que muchas unidades adoptan una política en momentos distintos, mediante un panel de condados sobre el salario mínimo de Callaway–Sant'Anna.


## Capítulos

**Parte I — Unidad tratada única**

1. [Introducción](https://quarcs-lab.github.io/ccm/01-introduction.html)
2. [Series temporales interrumpidas](https://quarcs-lab.github.io/ccm/02-interrupted-time-series.html)
3. [Diferencias en diferencias básicas](https://quarcs-lab.github.io/ccm/03-basic-diff-in-diff.html)
4. [Control sintético clásico](https://quarcs-lab.github.io/ccm/04-classical-synthetic-control.html)
5. [Control sintético aumentado](https://quarcs-lab.github.io/ccm/05-augmented-synthetic-control.html)
6. [Diferencias en diferencias sintéticas](https://quarcs-lab.github.io/ccm/06-synthetic-did.html)
7. [Series temporales estructurales bayesianas](https://quarcs-lab.github.io/ccm/07-structural-bayesian-ts.html)
8. [Control sintético con intervalos de predicción](https://quarcs-lab.github.io/ccm/08-synthetic-control-prediction-intervals.html)
9. [Control sintético espacial bayesiano](https://quarcs-lab.github.io/ccm/09-bayesian-spatial-sc.html)

**Parte II — Adopción escalonada**

10. [Diferencias en diferencias escalonadas](https://quarcs-lab.github.io/ccm/10-staggered-did.html)
11. [Efectos fijos interactivos y completado de matrices](https://quarcs-lab.github.io/ccm/11-matrix-completion-and-ife.html)
12. [Control sintético generalizado](https://quarcs-lab.github.io/ccm/12-gsynth.html)

Además: [Referencias](https://quarcs-lab.github.io/ccm/references.html)


Contribuya y deje sus comentarios en [https://github.com/quarcs-lab/ccm](https://github.com/quarcs-lab/ccm).


## Proyecto relacionado

Recurso complementario: [Dominando las métricas causales](/project/intro2causal/) — una guía de estudio en Python impulsada por IA basada en *Mastering 'Metrics* de Angrist & Pischke.
