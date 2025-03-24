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
/* Reset box model for our containers */
.initial-content, .iframe-wrapper, .iframe-wrapper iframe {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Style for the initial content */
.initial-content {
  max-width: 800px;
  margin: 0 auto 20px auto;
  padding: 0 15px;
}

/* Style for iframe container using absolute positioning technique */
.iframe-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

/* Full-width iframe styles */
.iframe-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* Use viewport height */
  min-height: 800px;
  border: none;
}
</style>

<div class="initial-content">
<h1>A geocomputational notebook to study Exploratory Spatial Data Analysis (ESDA)</h1>
<p>This notebook provides an interactive geocomputational tool to study spatial clusters and outliers. It includes features like map controls, dataset exploration, and visualizations. Use the controls below to explore the data.</p>
</div>

<div class="iframe-wrapper">
  <iframe
    src="https://esda101-bolivia339.streamlit.app/?embed=true"
    title="Streamlit App"
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>

<script>
// JavaScript to ensure iframe takes full width
document.addEventListener('DOMContentLoaded', function() {
  const iframe = document.querySelector('.iframe-wrapper iframe');
  const resizeIframe = function() {
    const windowWidth = window.innerWidth;
    iframe.style.width = windowWidth + 'px';
  };
  
  // Set initial size
  resizeIframe();
  
  // Update on window resize
  window.addEventListener('resize', resizeIframe);
});
</script>