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
<style>
/* Style for the initial content */
.initial-content {
  max-width: 800px; /* Constrain the width for readability */
  margin: auto; /* Center align */
  padding-bottom: 20px; /* Add spacing below the content */
}
/* Full-width iframe container - fixed to ensure it takes full width */
.full-width-container {
  position: relative;
  width: 100vw !important; /* Force full viewport width */
  left: 50%;
  right: 50%;
  margin-left: -50vw !important;
  margin-right: -50vw !important;
  max-width: 100vw !important; /* Ensure no constraints from parent elements */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}
.full-width-container iframe {
  display: block; /* Remove inline spacing */
  width: 100% !important; /* Force full width */
  height: 800px; /* Adjust height as needed */
  border: none; /* Remove border for clean look */
}
</style>
<div class="initial-content">
# **A geocomputational notebook to study Exploratory Spatial Data Analysis (ESDA)**
This notebook provides an interactive geocomputational tool to study spatial clusters and outliers. It includes features like map controls, dataset exploration, and visualizations. Use the controls below to explore the data.
</div>
<div class="full-width-container">
  <iframe
    src="https://esda101-bolivia339.streamlit.app/?embed=true"
    title="Streamlit App"
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>