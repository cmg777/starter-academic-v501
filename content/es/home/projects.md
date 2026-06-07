---
# Widget "blank": muestra los 3 proyectos más recientes como filas alternas
# imagen/texto mediante el shortcode `showcase`, con un enlace "Ver todos
# los proyectos" a la galería /projects/. Traducción de content/home/projects.md.
widget: blank

# ¿Activar este widget? true/false
active: true

# Esta página representa una sección.
headless: true

# Orden en que aparece esta sección.
weight: 35

title: Proyectos
subtitle: ''

design:
  # Banda de encabezado a todo el ancho.
  columns: '1'
---

{{< showcase type="project" count="3" browse_url="/projects/" browse_label="Ver todos los proyectos" >}}
