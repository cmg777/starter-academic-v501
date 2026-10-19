# AI-powered subtitle and appendix refresh — local review

Reviewed source commit and push authorized by Carlos. Separate book publication remains pending approval.

## Personal website

Updated `books/macro102` in EN/ES/JA to the current preface and eight-appendix order. D–F now cover growth/development accounting, convergence and the augmented Solow model; G–H cover DSGE modeling and Smets–Wouters. All three entries now include 29 readable chapter/appendix links, 29 computational Colab notebooks and 29 slide decks. Removed the old missing-slides note. All 87 external resource targets were checked; notebook files are valid JSON with code cells and slide pages contain presentation markup. Current live preface and source configuration both already use A–H, so no preface lag was observed.

Changed the bibliographic subtitle to exactly `An AI-powered Python companion to intermediate macroeconomics` in the English entry and CV, with aligned ES/JA display subtitles and the exact English subtitle in their original-title citations. Rebuilt the 11-page CV; the edited Books citation remains readable on page 6. The main title, primary Website button, optimized learning-cycle SVG and all unrelated entries remain unchanged.

## Cover and thumbnail

Used the built-in imagegen skill in text-localization edit mode on the actual source PNGs. Replaced only the subtitle, preserving the established portrait/landscape design, main title, author, notebook/graph content and palette. Original PNGs are retained. New optimized assets:

- Portrait: source PNG 1,715,720 bytes, edited PNG 1,697,227 bytes; WebP 170,624 bytes at 1024×1536.
- Landscape: source PNG 1,164,626 bytes, edited PNG 1,760,964 bytes; WebP 109,894 bytes at 1280×720.

The original book configuration selects `images/book-cover-ai-powered-python.webp`. The matching landscape derivative is saved in the book source and copied to all three personal-website bundles. Prompt set and visual previews are in the task workspace (`book-assets/ai-subtitle-prompts.json`).

## Verification

Personal Hugo build, translation parity (zero missing/stale/asset warnings), resource coverage, button and appendix-order checks passed. Desktop/mobile previews at 1440/360px show loaded artwork and the preserved cycle figure with no horizontal page overflow. Whitespace checks passed. The complete original book render (`quarto render --no-execute`) passed for all 30 inputs. Desktop/mobile previews confirm the exact new subtitle, loaded portrait cover and no page overflow. Its source/metadata checks are recorded in the task review report.
