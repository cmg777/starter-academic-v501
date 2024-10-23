---
title: "Exploring Economic Activity from Outer Space: A Python Notebook for Processing and Analyzing Satellite Nighttime Lights"
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

abstract: "Nighttime lights (NTL) data are increasingly used as a proxy for monitoring national, subnational, and supranational economic activity. These data offer advantages over traditional economic indicators such as GDP, including greater spatial granularity, timeliness, lower cost, and comparability between regions regardless of statistical capacity or political interference. Despite these benefits, the use of NTL data in regional science has been limited. This is in part due to the lack of accessible methods for processing and analyzing satellite images. To address this issue, this paper presents a user-friendly geocomputational notebook that illustrates how to process and analyze satellite NTL images. The evolution of regional disparities in India is presented as an illustrative example. The notebook first introduces a cloud-based Python environment for visualizing, analyzing, and transforming raster satellite images into tabular data. Next, it presents interactive tools for exploring the space-time patterns of the tabulated data. Finally, it describes methods for evaluating the usefulness of NTL data in terms of their cross-sectional predictions, time-series predictions, and regional inequality dynamics."

# Summary. An optional shortened abstract.
summary: "This paper introduces a user-friendly geocomputational notebook that illustrates how to process and analyze satellite NTL images."

tags:
- nighttime lights
- VIIRS data
- Python
- subnational GDP
- India


featured: true

# Icons: https://fontawesome.com/search

links:
  - name: "AI Video"
    url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
    icon_pack: fab
    icon: youtube
  - name: "AI Podcast"
    url: "https://soundcloud.com/user-562952877/mendez-2024-exploring-economic/s-oxNNkyMZQig?si=73478fdd84b343b1af240cc54f933bd8&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
    icon_pack: fas
    icon: headphones
  - name: "Slides"
    url: "https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration"
    icon_pack: fas
    icon: tv
  - name: "Colab notebook"
    url: "https://bit.ly/project2022p"
    icon_pack: ai
    icon: open-data
  - name: "Published article"
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
Access the computational notebook [HERE](https://bit.ly/project2022p).
{{% /callout %}}

</center>

{{% callout note %}}
AI Video
(made with Invideo AI)
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
Slides
(made with Canva PRO)
{{% /callout %}}


<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?utm_content=DAGCpV2wckk&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Slides</a> by Carlos Mendez

{{% callout note %}}
AI Podcast
(made with NotebookLM)
{{% /callout %}}

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1939257887%3Fsecret_token%3Ds-oxNNkyMZQig&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="cmg777" target="_blank" style="color: #cccccc; text-decoration: none;">cmg777</a> · <a href="https://soundcloud.com/user-562952877/mendez-2024-exploring-economic/s-oxNNkyMZQig" title="Mendez 2024 Exploring economic activity from outer space" target="_blank" style="color: #cccccc; text-decoration: none;">Mendez 2024 Exploring economic activity from outer space</a></div>

