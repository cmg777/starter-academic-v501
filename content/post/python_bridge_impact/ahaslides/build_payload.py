#!/usr/bin/env python3
"""deck.json -> AhaSlides create_slides payloads, using the NATIVE slide types.

    python3 build_payload.py        # writes payload.json next to this script

Feed the result to the ahaslides MCP `create_slides`, in ascending `_n` order,
in batches of 6-10. Strip the `_n` key first — it is a bookkeeping field, not
part of the API.

Why not content-v2: the MCP stores `slide_attributes.dsl` faithfully but never
compiles it into canvasBlocks, so those slides render BLANK for presenter and
audience with no error anywhere. The native types (`content`, `listing`,
`content_with_title_and_right_image`) render server-side and work first time.
See README.md, "The content-v2 trap", before changing this.

Cost of the native types: plain text only (no bold runs), and figures sit in a
620x720 right-hand column rather than full width.

Requires images.json — {source filename: AhaSlides CDN url} — produced by
uploading each figure with the MCP `upload_image` tool.
"""
import json, math, pathlib, re

HERE = pathlib.Path(__file__).parent
deck = json.loads((HERE / "deck.json").read_text())
IMG = json.loads((HERE / "images.json").read_text())

def plain(s):
    """Native slide fields are plain text — drop markdown emphasis."""
    return re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", s).strip()

TABLES = {
7: ["Big push — manufacturing up or flat, population up",
    "Backwash — manufacturing DOWN, population DOWN",
    "Comparative advantage — manufacturing DOWN, population UP or flat"],
22:["Nighttime lights — +10.9% (se 0.022)", "Rice yield — +6.3% (se 0.023)",
    "Services employment share — +2.3 pp (se 0.005)",
    "Manufacturing employment share — −1.0 pp (se 0.004)",
    "Population density — +2.5% (not significant)",
    "That manufacturing number looks negligible. The 1991 baseline share was 2.8%."],
24:["Nighttime lights — short run +4.9%, long run +11.2%",
    "Rice yield — short run +1.2% (n.s.), long run +7.9%",
    "Population density — short run −2.5%, long run +5.9%",
    "Manufacturing share — short run −0.6 pp (n.s.), long run −1.2 pp",
    "Services share — short run +2.0 pp, long run +2.4 pp"],
29:["Rice yield — nearest +4.9%, middle +6.5%, farthest +26.5%",
    "Services share — nearest −2.6 pp, middle +1.7 pp, farthest +5.9 pp",
    "Agriculture share — nearest +3.2 pp, middle +0.8 pp, farthest −5.7 pp",
    "But the nearest upazilas got the largest proportional cut in travel time "
    "— about 40%, against 17% at the far end."],
}
DIV = {2: ("The Question", "ACT I"), 8: ("The Design", "ACT II"),
       21: ("What The Data Say", "ACT III"),
       35: ("What Replication Taught Us", "ACT IV"),
       43: ("A region can lose its factories and still be better off.",
            "You only find that out if you measure the people too.")}

SUBS = {
 11: "Distance to each crossing separates the hinterlands.",
 13: "Treated +0.072, comparison +0.008. The gap is 0.064.",
 16: "Flat before 1998, then a climb for fifteen years.",
 20: "Distance starts at 0.40 std. KOBDR takes it to 0.054.",
 27: "Split by tercile and two sectors reverse sign.",
 31: "Twenty-one estimates. None significant at 5 percent.",
 32: "Rambachan-Roth bounds. Breakdown just under M = 1.",
 36: "All 122 coefficients. Maximum deviation 0.0005.",
 38: "One undefined macro drops every comparison unit.",
}

def split_body(s):
    bl = [plain(b) for b in s.get("bullets", [])]
    take = None
    if bl and bl[-1].startswith("TAKEAWAY"):
        take = re.sub(r"^TAKEAWAY:?\s*", "", bl.pop()).strip()
    return bl, take

INTER = {
 "poll": lambda s: {"slide_type": "poll", "heading": s["question"],
                    "options": [{"text": o["text"]} for o in s["options"]]},
 "quiz": lambda s: {"slide_type": "pick_answer_quiz", "heading": s["question"],
                    "options": [{"text": o["text"], "correct": o["correct"]}
                                for o in s["options"]]},
 "word_cloud": lambda s: {"slide_type": "word_cloud", "heading": s["question"]},
 "open_ended": lambda s: {"slide_type": "open_ended_survey", "heading": s["question"]},
 "scale": lambda s: {"slide_type": "scale", "heading": s["question"],
                     "options": [{"text": "How convinced are you by this result?"}],
                     "scale_config": {"low_label": s.get("minLabel", "Not convinced"),
                                      "high_label": s.get("maxLabel", "Fully convinced"),
                                      "low_value": s.get("min", 1),
                                      "high_value": s.get("max", 5),
                                      "must_rate": False, "show_average": True,
                                      "show_mid_values": True}},
}

out = []
for s in deck["slides"]:
    n, k = s["n"], s["kind"]
    if k in INTER:
        p = INTER[k](s)
    elif k == "title":
        p = {"slide_type": "content",
             "heading": "A Bridge, Two Rivers, and One Number That Settles It",
             "paragraphs": [
                 "What happens to a poor region when you finally connect it to a rich one",
                 "Carlos Mendez · Nagoya University (GSID) · carlos-mendez.org"]}
    elif k == "heading":
        h, sub = DIV[n]
        p = {"slide_type": "content", "heading": h, "paragraphs": [sub]}
    elif "image" in s:
        p = {"slide_type": "content_with_title_and_right_image",
             "heading": plain(s["title"]),
             "image_url": IMG[s["image"]],
             "image_description": plain(s["title"])}
        # sub_heading renders in a 564x96 box at 32px — about 60 chars before it
        # clips, so these are written to length rather than truncated.
        if n in SUBS:
            p["sub_heading"] = SUBS[n]
    else:
        bl, take = split_body(s)
        items = TABLES[n][:] if n in TABLES else bl
        if s.get("headline"):
            items = [s["headline"]] + items
        if take:
            items.append("→ " + take)
        p = {"slide_type": "listing", "heading": plain(s["title"]), "items": items}
    if s.get("notes"):
        p["notes"] = s["notes"]
    p["_n"] = n
    out.append(p)

(HERE / "payload.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
from collections import Counter
print(f"wrote payload.json: {len(out)} slides",
      dict(Counter(p["slide_type"] for p in out)))
long_items = [(p["_n"], len(i)) for p in out for i in p.get("items", []) if len(i) > 175]
print("items over 175 chars:", long_items or "none")
print("slides with notes:", sum("notes" in p for p in out))
