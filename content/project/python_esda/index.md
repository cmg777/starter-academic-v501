---
date: "2024-03-01T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
links:
- icon: open-data
  icon_pack: ai
  name: "[Python] GoogleColab"
  url: https://colab.research.google.com/drive/1JHf8wPxSxBdKKhXaKQZUzhEpVznKGiep?usp=sharing
- icon: open-data
  icon_pack: ai
  name: "Streamlit web app"
  url: https://esda101-bolivia339.streamlit.app/
slides:
summary: An interactive geocomputational notebook to study spatial clusters and outliers
tags:
- spatial
- python
- regional
title: Exploratory Spatial Data Analysis (ESDA)
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
---

# A geocomputational notebook to study Exploratory Spatial Data Analysis (ESDA)

This notebook provides an interactive geocomputational tool to study spatial clusters and outliers. It includes features like map controls, dataset exploration, and visualizations.  Use the controls below to explore the data.

{{< iframe-container src="https://esda101-bolivia339.streamlit.app/?embed=true" title="ESDA Streamlit App" >}}

{{/* Define the shortcode inline */}}
{{ $_hugo_config := `{ "version": 1 }` }}
{{ define "iframe-container" }}
<div class="iframe-container" style="position: relative; width: 100%; padding-bottom: {{ .Get "aspect-ratio" | default "56.25%" }}; height: 0; overflow: hidden;">
    <iframe src="{{ .Get "src" }}" title="{{ .Get "title" | default "Embedded Content" }}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>
</div>
{{ end }}

<style>
.iframe-container {
    position: relative;
    width: 100%;
    /* padding-bottom is controlled by the shortcode */
    height: 0;
    overflow: hidden;
}

.iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}
</style>