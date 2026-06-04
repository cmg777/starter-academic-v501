---
title: "Explorando la actividad económica desde el espacio: un cuaderno de Python para procesar y analizar luces nocturnas satelitales"
authors:
- admin
- Ayush Patnaik


date: "2024-04-17T00:00:00Z"
doi: "10.18335/region.v11i1.493"

# Schedule page publish date (NOT publication's date).
publishDate: "2024-04-17T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*REGION*"
publication_short: ""

abstract: "Los datos de luces nocturnas (NTL) se utilizan cada vez más como una variable indirecta para monitorear la actividad económica nacional, subnacional y supranacional. Estos datos ofrecen ventajas frente a los indicadores económicos tradicionales, como el PIB, entre ellas una mayor granularidad espacial, oportunidad, menor costo y comparabilidad entre regiones con independencia de la capacidad estadística o la interferencia política. A pesar de estos beneficios, el uso de los datos de NTL en la ciencia regional ha sido limitado. Esto se debe, en parte, a la falta de métodos accesibles para procesar y analizar imágenes satelitales. Para abordar este problema, este artículo presenta un cuaderno geocomputacional de fácil uso que ilustra cómo procesar y analizar imágenes satelitales de NTL. La evolución de las disparidades regionales en la India se presenta como un ejemplo ilustrativo. El cuaderno introduce primero un entorno de Python basado en la nube para visualizar, analizar y transformar imágenes satelitales ráster en datos tabulares. A continuación, presenta herramientas interactivas para explorar los patrones espacio-temporales de los datos tabulados. Por último, describe métodos para evaluar la utilidad de los datos de NTL en términos de sus predicciones transversales, sus predicciones de series de tiempo y la dinámica de la desigualdad regional."

# Summary. An optional shortened abstract.
summary: "Este artículo presenta un cuaderno geocomputacional de fácil uso que ilustra cómo procesar y analizar imágenes satelitales de NTL."

tags:
- nighttime lights
- VIIRS data
- Python
- subnational GDP
- India


featured: true

# Icons: https://fontawesome.com/search

links:
  - name: "Vídeo con IA"
    url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
    icon_pack: fab
    icon: youtube
  - name: "Pódcast con IA"
    url: "https://soundcloud.com/user-562952877/mendez-2024-exploring-economic/s-oxNNkyMZQig?si=73478fdd84b343b1af240cc54f933bd8&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
    icon_pack: fas
    icon: headphones
  - name: "Mapa mental con IA"
    url: "https://mapify.so/share-link/Vw5YkbadTW"
    icon_pack: fas
    icon: brain
  - name: "Diapositivas"
    url: "https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration"
    icon_pack: fas
    icon: tv
  - name: "Colab notebook"
    url: "https://bit.ly/project2022p"
    icon_pack: ai
    icon: open-data
  - name: "Artículo publicado"
    url: "https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493"
    icon_pack: fas
    icon: university
#url_pdf: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493/457'
#url_preprint: "https://bit.ly/project2022p"
#url_code: 'https://bit.ly/project2022p'
#url_dataset: 'https://bit.ly/project2022p'
url_poster: ''
url_project: ''
#url_slides: 'https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration'
#url_source: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493'
#url_video: 'https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag'



# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
#projects: [convergence, clusters]

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---

<center>

{{% callout note %}}
Acceda al cuaderno computacional [AQUÍ](https://bit.ly/project2022p).
{{% /callout %}}

</center>


{{% callout note %}}
Vídeo con IA
(creado con Invideo AI)
{{% /callout %}}


<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; height: auto;">
  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    src="https://www.youtube-nocookie.com/embed/srNtOUf_e_w?si=gIkHVwyI1wNayJb8&amp;controls=0" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen>
  </iframe>
</div>



{{% callout note %}}
Diapositivas
(creadas con Canva PRO)
{{% /callout %}}


<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?utm_content=DAGCpV2wckk&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Diapositivas</a> por Carlos Mendez


{{% callout note %}}
Pódcast con IA
(creado con NotebookLM)
{{% /callout %}}


<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1939257887%3Fsecret_token%3Ds-oxNNkyMZQig&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="cmg777" target="_blank" style="color: #cccccc; text-decoration: none;">cmg777</a> · <a href="https://soundcloud.com/user-562952877/mendez-2024-exploring-economic/s-oxNNkyMZQig" title="Mendez 2024 Exploring economic activity from outer space" target="_blank" style="color: #cccccc; text-decoration: none;">Mendez 2024 Exploring economic activity from outer space</a></div>
