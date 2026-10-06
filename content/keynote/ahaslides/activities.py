"""The AhaSlides audience layer of the hero keynote, in English, Spanish and
Japanese. Source of truth for every interactive slide of the three decks.

    python3 build_deck_json.py && python3 build_payload.py

The decks are used two ways: self-paced from the website hero (the default
pace) and live at talks. Every slide therefore works without a presenter: polls
show results after voting, quizzes reveal the answer, and nothing depends on a
spinner, a raffle or names (the decks collect no names).

Each activity is a dict:

    id        "K1".. ; "K90" is the final leaderboard, "K91" the open question
    topic     a key of pages.TOPICS, or a list tried in order (the first topic
              that exists in a language anchors the slide there); a language
              without any of the topics skips the activity
    kind      poll | pick_answer_quiz | true_false | word_cloud | scale | pin |
              ranking | idea_board | leaderboard
    text      {lang: {...}} the wording of the slide in each language
    answer    the correct option letter (pick_answer_quiz) or "true"/"false"
    notes     presenter notes (English, for the author in all three decks)

Options are written in A, B, C order WITHOUT letters. build_payload.py letters
them and sends them reversed, because AhaSlides displays options in reverse
payload order (see the FWL deck README).

Writing rules for the English text (author preference): no em dashes, no
contractions, no possessive apostrophes. build_deck_json.py checks them.
"""

QUIZ_PROPS = {"timeToAnswer": 30, "fastAnswerGetMorePoint": True}
# Polls have no timer: website visitors answer whenever they reach the slide.
POLL_PROPS = {"hasTimeLimit": False, "multipleChoice": False,
              "typeChart": "barChart", "showPercentage": True}
TF_LABELS = {"es": ("Verdadero", "Falso"), "ja": ("正しい", "間違い")}
IDEA_GROUP_IDS = ["3f6c2a8e-1b4d-4c7a-9e2f-5a1b3c4d6e70",
                  "7a1d4e9b-2c5f-4b8a-8d3e-6b2c4d5e7f81",
                  "9c3e5f1a-4d6b-4e9c-af4b-7c3d5e6f8a92",
                  "b5d7a2c4-6e8f-4fad-b05c-8d4e6f7a9ba3"]

ACTIVITIES = [
    dict(id="K1", topic="title", kind="word_cloud",
         text={"en": {"q": "In one word: what does development mean to you?"},
               "es": {"q": "En una palabra: ¿qué significa para usted el "
                           "desarrollo?"},
               "ja": {"q": "一言で：あなたにとって「開発」とは何ですか？"}},
         notes="Warm-up, no right answer. Read the three biggest words aloud. "
               "Most answers will be about income; the talk adds where and "
               "when development happens."),
    dict(id="K2", topic="gap_photo", kind="pin",
         text={"en": {"q": "Drop a pin on the poorest part of this photo"},
               "es": {"q": "Coloque un pin en la parte más pobre de esta foto"},
               "ja": {"q": "この写真の中で最も貧しい場所にピンを置いてください"}},
         notes="The Sao Paulo photo as a pin board. Most pins land on the "
               "favela on the left, a few on the towers. Ask what cues people "
               "used: roofs, density, green space, swimming pools. The same "
               "cues are what daytime satellite images measure."),
    dict(id="K3", topic="gap_photo", kind="poll",
         text={"en": {"q": "This photo is from 2004. By 2021, the gap between "
                           "the two neighborhoods was...",
                      "options": ["Much narrower", "About the same", "Wider"]},
               "es": {"q": "Esta foto es de 2004. Para 2021, la brecha entre "
                           "los dos barrios era...",
                      "options": ["Mucho menor", "Más o menos la misma",
                                  "Mayor"]},
               "ja": {"q": "この写真は2004年のものです。2021年には、2つの地区の"
                           "格差は…",
                      "options": ["大きく縮小した", "ほぼ同じだった",
                                  "拡大した"]}},
         notes="A prediction poll; do not reveal the answer. The next page "
               "shows the same spot in 2004 and 2021: the favela of "
               "Paraisopolis and the towers next to it look almost unchanged. "
               "The answer is B, about the same: gaps can persist for decades."),
    dict(id="K4", topic="outer_space", kind="scale",
         text={"en": {"q": "How much have you used satellite data?",
                      "items": ["I have looked at satellite images of my own "
                                "region",
                                "I have used satellite data in a study or a "
                                "project"],
                      "low": "Never", "high": "Often"},
               "es": {"q": "¿Cuánto ha usado datos satelitales?",
                      "items": ["He mirado imágenes satelitales de mi propia "
                                "región",
                                "He usado datos satelitales en un estudio o un "
                                "proyecto"],
                      "low": "Nunca", "high": "A menudo"},
               "ja": {"q": "衛星データをどのくらい使ったことがありますか？",
                      "items": ["自分の地域の衛星画像を見たことがある",
                                "研究やプロジェクトで衛星データを使ったことがある"],
                      "low": "まったくない", "high": "よくある"}},
         notes="A quick read of the room. The gap between the two averages "
               "is the point: many people have looked at satellite images, few "
               "have used them as data. The rest of the talk shows how."),
    dict(id="K5", topic="south_asia", kind="true_false", answer="false",
         text={"en": {"q": "Night lights measure income directly."},
               "es": {"q": "Las luces nocturnas miden directamente el "
                           "ingreso."},
               "ja": {"q": "夜間光は所得を直接測定している。"}},
         notes="False. Night lights are a proxy for economic activity, as the "
               "World Bank video says: they track electricity use, which moves "
               "with income but also with population, prices and access to the "
               "grid."),
    dict(id="K6", topic="lights_quiz", kind="pin",
         text={"en": {"q": "Drop a pin on North Korea"},
               "es": {"q": "Coloque un pin sobre Corea del Norte"},
               "ja": {"q": "北朝鮮の位置にピンを置いてください"}},
         notes="North Korea is the dark area between China and the bright "
               "South Korea. The border between the two Koreas is one of the "
               "sharpest development gaps visible from space."),
    dict(id="K7", topic="rgb_app", kind="pick_answer_quiz", answer="D",
         text={"en": {"q": "In this map, lights from 2013 are red, 2003 green "
                           "and 1993 blue. Why are some lights red?",
                      "options": ["They are the brightest cities",
                                  "They are gas flares",
                                  "They were lit only in 1993",
                                  "They were lit only in 2013, the latest year"]},
               "es": {"q": "En este mapa, las luces de 2013 son rojas, las de "
                           "2003 verdes y las de 1993 azules. ¿Por qué algunas "
                           "luces son rojas?",
                      "options": ["Son las ciudades más brillantes",
                                  "Son quemas de gas",
                                  "Solo estaban encendidas en 1993",
                                  "Solo estaban encendidas en 2013, el último "
                                  "año"]},
               "ja": {"q": "この地図では、2013年の光は赤、2003年は緑、1993年は青で"
                           "表示されています。一部の光が赤いのはなぜですか？",
                      "options": ["最も明るい都市だから",
                                  "ガスフレアだから",
                                  "1993年にだけ光っていたから",
                                  "最新の2013年にだけ光っていたから"]}},
         notes="D. Each year is one color channel (Howarth: red 2013, green "
               "2003, blue 1993). A place lit in all three years mixes to white; "
               "a place lit only in 2013 shows pure red, so red marks new "
               "electrification, for example in China."),
    dict(id="K8", topic=["worldcover", "daytime"], kind="pick_answer_quiz",
         answer="A",
         text={"en": {"q": "What can daytime images show that night lights "
                           "cannot?",
                      "options": ["Land cover, such as crops and forests",
                                  "The brightness of cities at night",
                                  "Gas flares at night",
                                  "Lit fishing boats at sea"]},
               "es": {"q": "¿Qué pueden mostrar las imágenes diurnas que las "
                           "luces nocturnas no?",
                      "options": ["La cobertura del suelo, como cultivos y "
                                  "bosques",
                                  "El brillo de las ciudades de noche",
                                  "La quema de gas de noche",
                                  "Los barcos pesqueros iluminados en el mar"]},
               "ja": {"q": "昼間の衛星画像では分かり、夜間光では分からないものは"
                           "どれですか？",
                      "options": ["農地や森林などの土地被覆",
                                  "夜の都市の明るさ",
                                  "夜間のガスフレア",
                                  "海上の漁船の明かり"]}},
         notes="A. The other three are all visible in night lights. Daytime "
               "images classify land cover (the ESA WorldCover map has 11 "
               "classes at 10 m), which matters most in rural areas where "
               "there are few lights."),
    dict(id="K9", topic="sdgs", kind="ranking",
         text={"en": {"q": "Which goals most need data for small regions? "
                           "Rank your top two",
                      "items": ["SDG 1: No poverty",
                                "SDG 8: Decent work and economic growth",
                                "SDG 10: Reduced inequalities",
                                "SDG 11: Sustainable cities and communities",
                                "SDG 13: Climate action"]},
               "es": {"q": "¿Qué objetivos necesitan más datos de regiones "
                           "pequeñas? Ordene sus dos principales",
                      "items": ["ODS 1: Fin de la pobreza",
                                "ODS 8: Trabajo decente y crecimiento "
                                "económico",
                                "ODS 10: Reducción de las desigualdades",
                                "ODS 11: Ciudades y comunidades sostenibles",
                                "ODS 13: Acción por el clima"]},
               "ja": {"q": "小さな地域のデータが最も必要な目標はどれですか？"
                           "上位2つを選んでください",
                      "items": ["SDG 1：貧困をなくそう",
                                "SDG 8：働きがいも経済成長も",
                                "SDG 10：人や国の不平等をなくそう",
                                "SDG 11：住み続けられるまちづくりを",
                                "SDG 13：気候変動に具体的な対策を"]}},
         notes="No right answer. The page highlights SDG 11, with goals 8, "
               "10 and 13 beside it. Ask why the top choice needs data below "
               "the national level."),
    dict(id="K10", topic="combine", kind="poll",
         text={"en": {"q": "Which data would you combine with satellite images "
                           "first?",
                      "options": ["Drone images", "Cell phone data",
                                  "Social media data", "Household surveys"]},
               "es": {"q": "¿Qué datos combinaría primero con las imágenes "
                           "satelitales?",
                      "options": ["Imágenes de drones",
                                  "Datos de teléfonos móviles",
                                  "Datos de redes sociales",
                                  "Encuestas de hogares"]},
               "ja": {"q": "衛星画像と最初に組み合わせたいデータはどれですか？",
                      "options": ["ドローン画像", "携帯電話データ",
                                  "ソーシャルメディアデータ", "世帯調査"]}},
         notes="No right answer. Household surveys are what most studies use "
               "to train and validate satellite predictions. In Togo, the "
               "government combined satellite images with cell phone data to "
               "target emergency cash (BBC, 2021)."),
    dict(id="K11", topic="bbc_cash", kind="pick_answer_quiz", answer="B",
         text={"en": {"q": "In the BBC video, which country used satellite "
                           "images to send emergency cash?",
                      "options": ["Kenya", "Togo", "Nigeria", "Ghana"]}},
         notes="B, Togo. During the pandemic the government searched satellite "
               "images for signs of poverty and sent cash through mobile "
               "phones (BBC, May 2021)."),
    dict(id="K12", topic="mckinsey", kind="pick_answer_quiz", answer="C",
         text={"en": {"q": "The animation zooms in from one bubble for the "
                           "whole world. How many micro regions does it end "
                           "with?",
                      "options": ["About 200", "About 4,000",
                                  "More than 40,000", "More than 4 million"]},
               "es": {"q": "La animación parte de una burbuja para todo el "
                           "mundo. ¿Con cuántas microrregiones termina?",
                      "options": ["Unas 200", "Unas 4.000", "Más de 40.000",
                                  "Más de 4 millones"]},
               "ja": {"q": "アニメーションは世界全体を1つのバブルで表すところから"
                           "始まります。最後にはいくつのミクロ地域になりますか？",
                      "options": ["約200", "約4,000", "40,000以上",
                                  "400万以上"]}},
         notes="C. The McKinsey Global Institute view (Pixels of Progress) "
               "splits the world into more than 40,000 micro regions, a 230 "
               "times increase in resolution over countries. Averages hide "
               "most of the variation."),
    dict(id="K90", topic="big_data", kind="leaderboard", text={},
         notes="Final leaderboard. Without names, players show as generated "
               "names; congratulate the top three."),
    dict(id="K91", topic="big_data", kind="idea_board",
         text={"en": {"q": "What would you study with satellite data in your "
                           "region?",
                      "groups": ["Cities and housing",
                                 "Rural areas and agriculture",
                                 "Environment and climate", "Other"]},
               "es": {"q": "¿Qué estudiaría con datos satelitales en su "
                           "región?",
                      "groups": ["Ciudades y vivienda",
                                 "Zonas rurales y agricultura",
                                 "Medio ambiente y clima", "Otro"]},
               "ja": {"q": "あなたの地域で衛星データを使って何を研究したいですか？",
                      "groups": ["都市と住宅", "農村と農業", "環境と気候",
                                 "その他"]}},
         notes="The open question that closes the talk. Ideas stay on the "
               "board for later visitors, who can add their own and vote "
               "(three votes each). Read the top ideas before the thank-you "
               "page."),
]


def slide(a, lang, image_url=None):
    """The create_slides body of activity a in one language (no notes)."""
    t, k = a["text"].get(lang, {}), a["kind"]
    if k == "word_cloud":
        return {"slide_type": "word_cloud", "heading": t["q"]}
    if k == "poll":
        return {"slide_type": "poll", "heading": t["q"],
                "options": list(t["options"])}
    if k == "pick_answer_quiz":
        return {"slide_type": "pick_answer_quiz", "heading": t["q"],
                "options": list(t["options"]), "correct": a["answer"]}
    if k == "true_false":
        cfg = {"question": t["q"], "correctAnswer": a["answer"],
               "hasTimeLimit": True, "timeLimitSeconds": 30,
               "maxPointsPerCorrect": 100, "minPoint": 50, "speedBonus": True}
        if lang in TF_LABELS:
            cfg["trueLabel"], cfg["falseLabel"] = TF_LABELS[lang]
        return {"slide_type": "marketplace/true-or-false", "title": t["q"],
                "slide_attributes": {"config": cfg}}
    if k == "scale":
        return {"slide_type": "scale", "heading": t["q"],
                "options": [{"text": s} for s in t["items"]],
                "scale_config": {"low_label": t["low"], "high_label": t["high"],
                                 "low_value": 1, "high_value": 5,
                                 "must_rate": True, "show_average": True,
                                 "show_mid_values": True}}
    if k == "pin":
        return {"slide_type": "pinOnImage", "title": t["q"],
                "slide_attributes": {"imageUrl": image_url,
                                     "pinsPerParticipant": 1}}
    if k == "ranking":
        return {"slide_type": "ranking", "title": t["q"],
                "slide_attributes": {
                    "rankingItems": [{"index": i, "text": s}
                                     for i, s in enumerate(t["items"])],
                    "rankingPicksPerParticipant": 2}}
    if k == "idea_board":
        return {"slide_type": "ideaBoard", "title": t["q"],
                "slide_attributes": {
                    "groups": [{"id": i, "name": g}
                               for i, g in zip(IDEA_GROUP_IDS, t["groups"])],
                    "preSetGroupEnabled": True, "votesEnabled": True,
                    "votesPerParticipant": 3}}
    if k == "leaderboard":
        return {"slide_type": "leaderboard"}
    raise ValueError(f"{a['id']}: unknown kind {k}")


def props(a):
    """update_slide_properties settings, or None."""
    return {"pick_answer_quiz": QUIZ_PROPS, "poll": POLL_PROPS,
            "word_cloud": {"entriesPerParticipant": 2}}.get(a["kind"])
