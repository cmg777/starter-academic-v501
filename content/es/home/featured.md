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
  # Enlace "Ver todas". No existe una página de sección en español
  # (content/es/publication/ no tiene _index.md), por lo que el enlace apunta al
  # listado completo en inglés. Se usa una URL relativa al protocolo (// ...) a
  # propósito: relLangURL reescribiría una ruta relativa a /es/publication/ (404)
  # y también relativiza una URL absoluta con el mismo host que baseURL; en
  # cambio, deja intactas las URLs que empiezan por "//".
  archive:
    enable: true
    link: "//carlos-mendez.org/publication/"
    text: "Ver todas las publicaciones"
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
