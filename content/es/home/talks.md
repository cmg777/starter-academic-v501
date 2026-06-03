---
# Widget "blank": muestra las 5 presentaciones más recientes como filas
# alternas imagen/texto mediante el shortcode `showcase` (igual que Proyectos).
# Traducción de content/home/talks.md.
widget: blank

# ¿Activar este widget? true/false
active: true

# Esta página representa una sección.
headless: true

# Orden en que aparece esta sección.
weight: 30

title: 'Presentaciones recientes y próximas'
subtitle:

design:
  # Banda de encabezado a todo el ancho.
  columns: '1'
---

{{< showcase type="event" count="5" browse_url="/event/" browse_label="Ver todas las presentaciones" >}}
