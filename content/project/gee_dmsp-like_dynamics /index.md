---
date: "2025-03-14T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
links:
- icon: open-data
  icon_pack: ai
  name: "[GEE] Google Earth Engine App"
  url: https://carlos-mendez.projects.earthengine.app/view/dynamics-dmsp-like
slides:
summary: "An interactive exploration of the space-time dynamics of mean luminosity using the DMSP-like data over the 1992-2019 period."
tags:
- spatial
- gee
- regional
title: "Regional dynamics of DMPS-like nighttime lights 1992-2019"
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

**Title Slide**
- **A Harmonized Global Nighttime Light Dataset (1992–2018)**
- Authors: Xuecao Li, Yuyu Zhou, Min Zhao, & Xia Zhao
- Published in: Scientific Data (2020)
- DOI: [https://doi.org/10.1038/s41597-020-0510-y](https://doi.org/10.1038/s41597-020-0510-y)

---

**🌍 Introduction**
- Nighttime light (NTL) data provide insights into human activity, urbanization, and economic development.
- Two primary sources: **DMSP/OLS (1992–2013)** & **VIIRS (2012–2018)**.
- Challenge: Significant inconsistency between DMSP and VIIRS data.
- Objective: Develop a **harmonized global NTL dataset** for long-term analysis.

---

**👩‍💻 Data Collection**
- **DMSP/OLS NTL Data (1992–2013):**
  - Downloaded from the Payne Institute for Public Policy.
  - Digital number (DN) values range from **0 to 63**.
  - Spatial resolution: **30 arc-seconds**.
- **VIIRS/DNB Data (2012–2018):**
  - Higher spatial & radiometric resolution.
  - Monthly composites were processed into annual data.
  - Spatial resolution: **15 arc-seconds**.

---

**🔄 Methodology**
- **Three-step harmonization process:**
  1. **Annual Composition of VIIRS Data:**
     - Used cloud-free coverage data as a weighting factor.
     - Removed noise from aurora, fires, and temporary sources using thresholding techniques.
     - Applied a **weighted averaging approach** to generate annual composite images from monthly VIIRS data.
  2. **Conversion of VIIRS to DMSP-like Data:**
     - **Kernel Density (KD) Approach:**
       - Aggregated VIIRS radiance data (15 arc-seconds) to match DMSP resolution (30 arc-seconds).
       - Used a Gaussian point-spread function to reduce differences in radiance distribution.
     - **Logarithmic Transformation:**
       - Applied logarithmic transformation to adjust radiance variations in urban, suburban, and rural areas.
       - Reduced differences in brightness levels between high and low radiance pixels.
     - **Sigmoid Function Conversion:**
       - Developed a **sigmoid function** based on 2013 data to map transformed VIIRS data to DMSP-like DN values.
       - Parameters of the function were optimized at a global scale and validated at continental and national levels.
  3. **Integration of DMSP & VIIRS Data:**
     - Inter-calibrated DMSP data (1992–2013) using a **stepwise calibration approach**.
     - Applied derived sigmoid function to convert VIIRS data (2014–2018) into DMSP-like DN values.
     - Merged both datasets to create a **consistent 27-year global NTL dataset**.

---

**🌍 Technical Validation**
- **Histogram Comparison:**
  - Compared DN distributions of inter-calibrated DMSP and VIIRS-derived DMSP-like data.
  - Verified similarity in data distributions for overlapping years (2012–2013).
  - Identified a slight increase in high DN values (>60) due to DMSP saturation effects.
- **Temporal Consistency (1992–2018):**
  - Assessed trends in total nighttime light (NTL) intensity and number of lit pixels.
  - Conducted analysis using different DN thresholds (7, 20, 30) to minimize low-luminance noise.
  - Observed a stable and continuous trend in high-luminance areas (DN > 20).
- **Spatial Validation:**
  - Evaluated spatial accuracy using major metropolitan areas (e.g., Beijing, New York).
  - Compared observed DMSP, raw VIIRS radiance, and DMSP-like VIIRS data.
  - Verified agreement in urban spatial patterns, indicating robustness of the integration approach.
- **Independent Socioeconomic Correlations:**
  - Compared trends with external socioeconomic indicators (e.g., GDP, electricity consumption).
  - Strong correlations between harmonized NTL dataset and economic development patterns.
  - Ensures reliability of dataset for studies on urbanization and economic growth.

---

**🏰 Applications of the Dataset**
- Urban expansion analysis (e.g., Beijing-Tianjin region).
- Socioeconomic studies (e.g., GDP estimation, electricity consumption).
- Environmental monitoring (e.g., light pollution, carbon emissions).
- Disaster impact assessments (e.g., conflict zones, power outages).

---

**📊 Key Findings & Conclusion**
- The **harmonized NTL dataset** enables **long-term analysis (1992–2018)**.
- Overcomes DMSP-VIIRS inconsistencies using a **systematic integration approach**.
- Provides a valuable resource for **urbanization, economics, and environmental studies**.
- **Dataset Access:** [Original data repository](https://doi.org/10.6084/m9.figshare.9828827.v2)
- **GEE dataset Access:** [Awesomme GEE community catalog](https://gee-community-catalog.org/projects/hntl/?h=dmsp)
- **Exploratory Tool:** [GEE web app by Carlos Mendez](https://carlos-mendez.projects.earthengine.app/view/dynamics-dmsp-like) 
---




<br>

<div class="full-width-iframe">
  <iframe height="600" width="100%" frameborder="no" src="https://carlos-mendez.projects.earthengine.app/view/dynamics-dmsp-like?height=600"> </iframe>
</div>

<br>

See web app in [full screen HERE](https://carlos-mendez.projects.earthengine.app/view/dynamics-dmsp-like)



