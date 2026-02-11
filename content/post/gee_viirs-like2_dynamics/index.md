---
authors:
  - admin
categories:
  - Tutorial
draft: false
featured: false
date: "2025-03-14T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
links:
- icon: open-data
  icon_pack: ai
  name: "[GEE] Google Earth Engine App"
  url: https://carlos-mendez.projects.earthengine.app/view/viirs-like2-dynamics
slides:
summary: "An interactive exploration of the space-time dynamics of mean luminosity using the VIIRS-like data over the 1992-2023 period."
tags:
- spatial
- gee
- regional
title: "Regional dynamics of VIIRS-like nighttime lights 1992-2023"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
---

<style>
  .full-width-iframe {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .full-width-iframe iframe {
    display: block !important;
    width: 100% !important;
    height: 600px !important;
    border: none !important;
  }
</style>

<center>
{{% callout note %}}
When the sun goes down and the lights turn on, [there’s still a lot to explore.](https://earth.app.goo.gl/oZzBfT)
<br>
Let's study regional development from outer space!
<br>
{{% /callout %}}
</center>


### 🌐  A Global Annual Simulated VIIRS Nighttime Light Dataset (1992-2023)
- **Authors:** Xiuxiu Chen, Zeyu Wang, Feng Zhang, Guoqiang Shen, Qiuxiao Chen
- **Published in:** *Scientific Data (2024)*
- **DOI:** [https://doi.org/10.1038/s41597-024-04228-6](https://doi.org/10.1038/s41597-024-04228-6)

---

### 🔬 Background & Summary
- **Nighttime light (NTL) data** is widely used to measure human activity, urbanization, and socioeconomic trends.
- Existing NTL datasets (DMSP-OLS & NPP-VIIRS) have **limited temporal coverage and inconsistencies.**
- The study presents a new dataset, **SVNL (Simulated VIIRS NTL),** using deep learning to provide a **continuous, high-resolution (500m) dataset from 1992-2023.**
- SVNL allows for **long-term monitoring** of human activity and urbanization trends.

---

### 📚 Data Collection
- **DMSP-OLS Stable NTL (1992-2013)**: Oldest available nighttime light dataset.
- **NPP-VIIRS Annual VNL V2 (2012-2023)**: Higher resolution and more accurate than DMSP.
- **Landsat NDVI (1992-2013)**: Used to improve calibration and reduce saturation.
- **Other datasets:** Extended NTL datasets (ChenVNL, LiDNL), GDP data, and administrative boundaries.

---

### 🎯 Research Framework
- **Step 1:** Preprocess and calibrate **DMSP-OLS NTL data** for consistency.
- **Step 2:** Develop and train a **U-Net super-resolution network (NTLSRU-Net)** for cross-sensor calibration.
- **Step 3:** Apply the trained model to **convert DMSP NTL into VIIRS-like data (1992-2011).**
- **Step 4:** Merge simulated VIIRS data (1992-2011) with real VIIRS data (2012-2023) to create **SVNL dataset.**

---

### 🤖 U-Net Super-Resolution Model
- The model enhances **spatial resolution** and corrects inconsistencies between DMSP & VIIRS.
- **Modifications:**
  - Removed pooling layers to **preserve spatial details.**
  - Used **transposed convolutions** for up-sampling.
  - Integrated **Landsat NDVI data** to correct for saturation.
- Model trained using **DMSP & VIIRS data from 2012-2013** and then applied for historical reconstruction.

---

### 🌍 Evaluation & Validation
- **Accuracy Assessment:**
  - Histogram and scatter plot comparisons between **SVNL & real VIIRS data (2012-2013).**
  - High correlation observed at **pixel, city, province, and national levels.**
- **Spatial Pattern Validation:**
  - SVNL data **closely matches real VIIRS data**, avoiding saturation issues in urban areas.
- **Temporal Trend Validation:**
  - SVNL aligns well with **economic indicators (GDP growth)** and **urban expansion patterns.**

---

### 🔄 Key Findings
- **SVNL dataset provides a high-resolution, long-term global record of nighttime lights.**
- **Outperforms previous datasets** by maintaining **spatial and temporal consistency.**
- Enables **more accurate studies on urbanization, socioeconomic trends, and environmental monitoring.**
- Publicly accessible for researchers and policymakers.

---

### 💡 Conclusion
- The SVNL dataset fills a **crucial gap in long-term nighttime light data.**
- Facilitates **detailed analysis of human activities** from 1992-2023.
- Future work includes **further refinements using additional remote sensing data.**
- **Dataset Access:** [Original data repository](https://doi.org/10.6084/m9.figshare.22262545.v8)
- **GEE dataset Access:** [Awesomme GEE community catalog](https://gee-community-catalog.org/projects/srunet_npp_viirs_ntl/)
- **Exploratory Tool:** [GEE web app by Carlos Mendez](https://carlos-mendez.projects.earthengine.app/view/viirs-like2-dynamics) 


<br>

<div class="full-width-iframe">
  <iframe height="600" width="100%" frameborder="no" src="https://carlos-mendez.projects.earthengine.app/view/viirs-like2-dynamics?height=600"> </iframe>
</div>

<br>

See web app in [full screen HERE](https://carlos-mendez.projects.earthengine.app/view/viirs-like2-dynamics)



