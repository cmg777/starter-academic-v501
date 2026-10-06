"""The page map of ../intro-regional.pdf (Canva, 75 pages) and the three AhaSlides parts.

The deck is taught in three 90-minute lectures, one per section of the outline,
and each lecture has its own AhaSlides presentation. Every part opens with the
title page and its own outline page and closes with the closing page.

Pages that hold a YouTube video in Canva become playable YouTube slides in
AhaSlides (added in the editor, because the MCP has no video type). They are
left out of the part PDFs, so the imported images are the other pages only.
"""

PDF = "../intro-regional.pdf"
N_PAGES = 75

PARTS = {
    1: {"title": "Introduction to regional development, Part 1: "
                 "Why study regional development",
        "pages": list(range(1, 29)) + [75]},
    2: {"title": "Introduction to regional development, Part 2: "
                 "Studying regional development from outer space",
        "pages": [1] + list(range(29, 48)) + [75]},
    3: {"title": "Introduction to regional development, Part 3: "
                 "Standing on the shoulders of geospatial data science",
        "pages": [1] + list(range(48, 76))},
}

# Short page labels for deck.md (the PDF has no speaker notes).
TITLES = {
    1: "Title: Introduction to Geospatial Development",
    2: "Video: what are the questions?",
    3: "Technological progress in the study of regional development",
    4: "Outline (section 1 highlighted)",
    5: "Large development gaps within countries (Rio de Janeiro)",
    6: "Gaps show clear geospatial patterns (Sao Paulo)",
    7: "Gaps can persist over time (Sao Paulo, 2004 and 2021)",
    8: "Dynamics observable from above (Las Vegas)",
    9: "Dynamics observable from above (Dubai, Playa del Carmen)",
    10: "Local development matters for several SDGs",
    11: "But... do we have enough data?",
    12: "Video: development across countries (Rosling)",
    13: "Video: development within countries (Rosling, China)",
    14: "The disaggregation of development (one bubble)",
    15: "The world through a regional microscope",
    16: "A new world of micro regions",
    17: "Micro regions as pixels: a raster is an array of values",
    18: "Video: geospatial data, why should I care? (GeoQuery)",
    19: "Where can we find data?",
    20: "AidData GeoQuery",
    21: "Global Data Lab",
    22: "NASA SEDAC",
    23: "World Bank geospatial poverty portal",
    24: "Earth Engine data catalog",
    25: "Awesome GEE community catalog",
    26: "SHRUG (India) in the community catalog",
    27: "... and many other new data projects",
    28: "Video: the new era of geospatial big data",
    29: "Outline (section 2 highlighted)",
    30: "Studying development from outer space",
    31: "Video: the view from above",
    32: "In many poor countries, data are poor",
    33: "New technologies, new data, new research opportunities",
    34: "Video: illuminating progress with nighttime images",
    35: "Satellite images are big data (world at night)",
    36: "Video: how one photo from space explains history",
    37: "Video: a useful proxy for economic activity (World Bank)",
    38: "Video: how one NASA image tells dozens of stories",
    39: "Explore the data yourself (night lights app)",
    40: "Why are the lights different? (East Asia)",
    41: "Why are the lights different? (RGB composite, 1993 to 2013)",
    42: "Video: better night lights data, for longer (Gibson)",
    43: "Video: shining a light on economic inequality",
    44: "Recommended books",
    45: "We can also use daytime images: why and how?",
    46: "Monitoring regional development from outer space",
    47: "Video: satellites to send cash (BBC)",
    48: "Outline (section 3 highlighted)",
    49: "If I have seen further... (Newton)",
    50: "Discovering truth by building on previous discoveries",
    51: "What is data science?",
    52: "What is spatial data science?",
    53: "The first law of geography (Tobler)",
    54: "We need easy-to-use open software",
    55: "A point-and-click approach",
    56: "Video: start your journey with GeoDa",
    57: "Video lectures of Prof. Anselin",
    58: "The GeoDa workbook",
    59: "We need free software for satellite images",
    60: "An AI-based programming approach with Google Earth Engine",
    61: "Video: a supercomputer for you (Earth Engine)",
    62: "Learn Earth Engine (EEFA book)",
    63: "I like R programming: what can I use?",
    64: "An AI-based programming approach with R",
    65: "R books",
    66: "I like Python programming: what can I use?",
    67: "An AI-based programming approach with Python",
    68: "Geographic Data Science with Python",
    69: "Tutorial: start your spatial data science journey",
    70: "Tutorial: monitoring subnational human development",
    71: "Tutorial: monitoring regional development in Bolivia",
    72: "Some final remarks",
    73: "Video: you are not alone (Geo for Good)",
    74: "Video: we discover together (Geo for Good keynote)",
    75: "Closing: join our research network",
}

# Canva video embeds, read from the public Canva view on 2026-10-06.
# start = seconds into the video where Canva starts it (None = from the top).
VIDEOS = {
    2: {"id": "42eFnLZ6bXM", "title": "The Power of Smart Maps in Times of "
        "Crises (Esri)", "start": None},
    12: {"id": "jbkSRLYSojo", "title": "200 Countries, 200 Years, 4 Minutes "
         "(Hans Rosling, BBC)", "start": None},
    13: {"id": "jbkSRLYSojo", "title": "200 Countries, 200 Years: China "
         "provinces segment (Hans Rosling, BBC)", "start": 220},
    18: {"id": "7o5Faom5uRU", "title": "An Introduction to Geospatial Data "
         "and GeoQuery (AidData)", "start": None},
    28: {"id": "zQfy1K_vMU0", "title": "Can a billion maps help save the "
         "planet? (Esri)", "start": None},
    31: {"id": "Hy-b7kjLFds", "title": "The View from Above (QuaRCS)",
         "start": None},
    34: {"id": "srNtOUf_e_w", "title": "Illuminating Progress: Satellite "
         "Nighttime Images for Economic Monitoring (QuaRCS)", "start": None},
    36: {"id": "ki-hoy-3ea8", "title": "How 1 Photo From Space Explains ALL "
         "of History (RealLifeLore)", "start": 21},
    37: {"id": "rm1gCLfaZnE", "title": "Measuring the South Asia Economy from "
         "Outer Space (World Bank)", "start": None},
    38: {"id": "ZYGd-llxHJE", "title": "How one NASA image tells dozens of "
         "stories (neo)", "start": None},
    42: {"id": "9P7BYy5mSa8", "title": "Better Night Lights Data, For Longer "
         "(John Gibson)", "start": None},
    43: {"id": "8GLqofy7K-8", "title": "Shining a light on economic "
         "inequality (University of Waikato)", "start": None},
    47: {"id": "e60QXzkFhc0", "title": "How satellite images are helping one "
         "country hand out cash (BBC)", "start": None},
    56: {"id": "--8vhhmpgdM", "title": "GeoDa Intro (GeoDa Software)",
         "start": None},
    61: {"id": "MnCf9Gjz720", "title": "Google Earth Engine Overview (Google)",
         "start": None},
    73: {"id": "eHEKQHhl4T0", "title": "Geo for Good 2022 Highlights "
         "(Google Earth)", "start": None},
    74: {"id": "SpOjPLMOmEk", "title": "Geo for Good 2022: Welcoming Remarks "
         "and Keynote (Google Earth)", "start": 112},
}

# Japanese documentaries linked from page 38, mentioned in its notes only.
EXTRA_LINKS = {
    38: ["https://youtu.be/TFEwZqA3VpU", "https://youtu.be/ESGzie_i6mM"],
}

# Live tools for the hands-on stops.
TOOLS = {
    "portals": ["http://geo.aiddata.org", "https://globaldatalab.org",
                "https://sedac.ciesin.columbia.edu",
                "https://pipmaps.worldbank.org/en/data/datatopics/"
                "poverty-portal/home",
                "https://developers.google.com/earth-engine/datasets",
                "https://gee-community-catalog.org"],
    "lights_app": "https://carlosmendez777.users.earthengine.app/view/"
                  "worldviirs-like",
    "rgb_app": "https://jhowarth.users.earthengine.app/view/"
               "rgb-nighttime-lights",
    "colab_bolivia": "https://colab.research.google.com/github/quarcs-lab/"
                     "project2021o-notebook/blob/main/notebookColab.ipynb",
    "colab_hdi": "https://colab.research.google.com/drive/"
                 "1MtUkRi8Q27KPC67qJmD-c-lER6-47Jjx?usp=sharing",
}


def video_url(page):
    v = VIDEOS[page]
    url = f"https://www.youtube.com/watch?v={v['id']}"
    return url + (f"&t={v['start']}s" if v["start"] else "")


def image_pages(part):
    """Pages imported as images in a part, in order (video pages left out)."""
    return [p for p in PARTS[part]["pages"] if p not in VIDEOS]
