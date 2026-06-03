---
# Widget "Featured" (publicaciones destacadas). Traducción de content/home/featured.md.
widget: featured

# Esta página representa una sección.
headless: true

# Orden en que aparece esta sección.
weight: 20

title: Publicaciones destacadas
subtitle: ""

content:
  # Tipo de página a mostrar. Ej.: post, talk, publication...
  page_type: publication
  # Cuántas páginas mostrar (0 = todas)
  count: 3
  # Filtros
  filters:
    author: ""
    category: ""
    publication_type: ""
    tag: ""
  # Orden: descendente (desc) o ascendente (asc) por fecha.
  order: desc

design:
  background:
    # Nombre de la imagen en `assets/media/`.
    image: websiteCover5.jpg
    image_darken: 0
    image_size: cover
    image_position: center
    image_parallax: false
  # Vista de los listados: 1=Lista, 2=Compacta, 3=Tarjeta, 4=Cita
  view: 3
---
