"""The 34 pages of ../slides.pdf (Canva export) and the video map.

The Canva original is
https://carlos-mendez.my.canva.site/ai-assisted-learning-and-research-tool-integration-and-verification
(design DAHOj5QvYrY). Four pages embed a YouTube video; they are left out of
the imported PDF and become playable YouTube slides at the same position.
Page 16 only shows a screenshot of the metricsAI video page, so it stays an
image.
"""
PDF = "../slides.pdf"
N_PAGES = 34

LABELS = {
    1: "Title", 2: "Agenda", 3: "Section 1: A conceptual framework",
    4: "Production and verification costs", 5: "Section 2: AI-assisted learning",
    6: "Challenges of teaching econometrics", 7: "Accessible and interactive learning",
    8: "Python in Google Colab", 9: "metricsAI book", 10: "Video: AI in Colab",
    11: "Other AI products", 12: "AI tutors (1)", 13: "AI tutors (2)",
    14: "AI tutors (3)", 15: "AI tutors (4)", 16: "Short video overviews",
    17: "Video: s01 Analysis of Economics Data", 18: "AI podcast series",
    19: "Key lesson: agent skills", 20: "Video: Claude Skills",
    21: "A workflow example", 22: "Section 3: AI-assisted research",
    23: "The prompt and the result", 24: "The transparent pipeline",
    25: "Claude Code + GitHub + Overleaf", 26: "Prompt, checkpoint, result",
    27: "Changing the unit of verification", 28: "GitHub and the manuscript",
    29: "A work environment built for verification", 30: "Git is easier with AI",
    31: "The accountability imperative", 32: "Video: Goldsmith-Pinkham interview",
    33: "Concluding remarks", 34: "Thank you",
}

# page -> (YouTube ID, title confirmed through YouTube oEmbed on 2026-10-25)
VIDEOS = {
    10: ("V7RXyqFUR98", "Supercharge your Programming in Colab with AI-Powered tools"),
    17: ("RyE01v-zliM", "s01 Analysis of Economics Data"),
    20: ("wc54-e6Dt68", "Ultimate Guide To Claude Skills"),
    32: ("EcloxLPcRsY", "Integration & Collaboration: Claude Code for Econ. "
                        "w/ P. Goldsmith-Pinkham"),
}


def image_pages():
    return [p for p in range(1, N_PAGES + 1) if p not in VIDEOS]


def youtube_url(page):
    return f"https://www.youtube.com/watch?v={VIDEOS[page][0]}"
