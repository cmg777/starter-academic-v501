"""Pages of the three hero keynotes (EN, ES, JA) as they appear in Canva.

The source is the public Canva view of each deck (the hero "Keynote presentation"
button before the AhaSlides version). capture.mjs renders every page into
build/<lang>/pNN.png; the page numbers below are Canva page numbers.

    TOPICS    the content of each page, keyed by a short topic name, so that
              activities.py can anchor one activity to the same content in all
              three languages (the decks differ in length and order)
    VIDEOS    pages that embed a video; they become YouTube slides in AhaSlides
    GIFS      pages with animated GIFs, with the boxes read from the Canva
              design data (see animate_pages.py)
"""

DECKS = {
    "en": {"canva": "https://canva.link/n0fk7iia8hvmy61", "pages": 24,
           "title": "On the geography of development (interactive keynote)"},
    "es": {"canva": "https://canva.link/d8cqmp2vuqp2ag1", "pages": 21,
           "title": "Desarrollo sostenible, tecnología espacial y ciencia de "
                    "datos (presentación interactiva)"},
    "ja": {"canva": "https://canva.link/9l4tum0urflm6mu", "pages": 20,
           "title": "開発の地理学に関する考察（インタラクティブ版）"},
}

# topic -> page in each language (None: the deck has no such page).
TOPICS = {
    "title":        {"en": 1,  "es": 1,  "ja": 1},
    "gap_photo":    {"en": 2,  "es": 2,  "ja": 2},
    "gap_2004_2021": {"en": 3, "es": 3,  "ja": 3},
    "las_vegas":    {"en": 4,  "es": 4,  "ja": 4},
    "dubai_carmen": {"en": 5,  "es": 5,  "ja": 5},
    "outer_space":  {"en": 6,  "es": 6,  "ja": 6},
    "data_sources": {"en": None, "es": 7, "ja": None},
    "view_above":   {"en": 7,  "es": 9,  "ja": 7},
    "nasa_image":   {"en": 9,  "es": 10, "ja": 9},
    "south_asia":   {"en": 8,  "es": 11, "ja": 8},
    "lights_quiz":  {"en": 10, "es": 12, "ja": 10},
    "colors":       {"en": None, "es": 13, "ja": None},
    "rgb_app":      {"en": 11, "es": 14, "ja": 11},
    "daytime":      {"en": 12, "es": 15, "ja": 12},
    "worldcover":   {"en": 13, "es": None, "ja": 13},
    "overview":     {"en": 14, "es": 16, "ja": 14},
    "sdgs":         {"en": 15, "es": 8,  "ja": 15},
    "combine":      {"en": 16, "es": 17, "ja": 16},
    "bbc_cash":     {"en": 17, "es": None, "ja": None},
    "poverty_map":  {"en": 18, "es": None, "ja": None},
    "mckinsey":     {"en": 19, "es": 18, "ja": 17},
    "microscope":   {"en": 20, "es": 19, "ja": 18},
    "big_data":     {"en": 21, "es": 20, "ja": 19},
    "thanks":       {"en": 22, "es": 21, "ja": 20},
    "appendix":     {"en": 23, "es": None, "ja": None},
    "tasks":        {"en": 24, "es": None, "ja": None},
}

LABELS = {
    "title": "Title", "gap_photo": "Sao Paulo: poor and rich neighborhoods",
    "gap_2004_2021": "Sao Paulo, 2004 and 2021", "las_vegas": "Las Vegas (GIF)",
    "dubai_carmen": "Dubai and Playa del Carmen (GIFs)",
    "outer_space": "Development from outer space",
    "data_sources": "Data to study the economy",
    "view_above": "Video: The View from Above", "nasa_image": "Video: one NASA image",
    "south_asia": "Video: South Asia from outer space",
    "lights_quiz": "Quiz page: why are the lights different?",
    "colors": "Colors are a research decision", "rgb_app": "Howarth RGB app",
    "daytime": "Daytime images: why and how?", "worldcover": "ESA WorldCover",
    "overview": "Monitoring regional development from outer space",
    "sdgs": "Multiple SDGs", "combine": "Combining satellite and other data",
    "bbc_cash": "Video: satellites to send cash", "poverty_map": "Poverty map",
    "mckinsey": "McKinsey: the disaggregation of development (GIF)",
    "microscope": "The world through a regional microscope",
    "big_data": "Big Data and AI", "thanks": "Thank you",
    "appendix": "Additional slides", "tasks": "Research tasks",
}

# page -> YouTube video. Titles checked with YouTube oEmbed on 2026-10-06.
VIDEOS = {
    "en": {7: ("Hy-b7kjLFds", "The View from Above"),
           8: ("rm1gCLfaZnE", "Measuring South Asia's Economy from Outer Space"),
           9: ("ZYGd-llxHJE", "How one NASA image tells dozens of stories"),
           17: ("e60QXzkFhc0", "How satellite images are helping one country "
                               "hand out cash (BBC)")},
    # The Spanish deck plays dubbed MP4 uploads in Canva; the author uploaded
    # the same dubbed videos to YouTube for AhaSlides.
    "es": {9: ("6_ZhisUyDR4", "The View from Above (ESP)"),
           10: ("1pgcTBuY1qg", "How one NASA image tells dozens of stories (ESP)"),
           11: ("39or8GgZgaU", "Measuring South Asia's Economy from Outer Space (ESP)")},
    "ja": {7: ("SJF_pLOMNVE", "The View from Above (JPN)"),
           8: ("MCBxUQGKgiU", "Measuring South Asia's Economy from Outer Space (JPN)"),
           9: ("I3QKlEiXOOU", "How one NTL image can tell dozens of stories (Japanese)")},
}

# The GIF elements are identical in the three decks; only their page differs.
GIF_PAGES = {"las_vegas": "lasVegas", "dubai_carmen": "dubai_carmen",
             "mckinsey": "micro_regions"}


def video_url(lang, page):
    return f"https://youtu.be/{VIDEOS[lang][page][0]}"


def image_pages(lang):
    """Pages imported as images (the video pages are left out)."""
    return [p for p in range(1, DECKS[lang]["pages"] + 1)
            if p not in VIDEOS[lang]]


def topic_of(lang, page):
    for t, by in TOPICS.items():
        if by[lang] == page:
            return t
    raise KeyError(f"{lang} page {page} has no topic")
