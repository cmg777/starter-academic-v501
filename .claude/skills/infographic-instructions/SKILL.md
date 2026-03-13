---
name: infographic-instructions
description: Generate a chalkboard-style infographic instructions file that summarizes an existing blog post into 6 panels on a dark background with the site color palette. Produces an infographic_instructions.md file in the post's page bundle.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Infographic Instructions: Chalkboard Summary Generator

Read an existing blog post on this site and produce an `infographic_instructions.md`
file in the post's page bundle. The file contains design style guidance (chalkboard
aesthetic with dark background), the site color palette adapted for dark-background
contrast, layout specifications (landscape, 3x2 grid), and 6 panels of concise,
infographic-ready sentences summarizing the post's key ideas.

## Example invocations

```
/project:infographic-instructions python_partial_identification
/project:infographic-instructions python_dowhy
/project:infographic-instructions python_doubleml
/project:infographic-instructions python_ml_random_forest
```

## Reference output

Use `content/post/python_partial_identification/infographic_instructions.md` as
the reference for tone, structure, and level of detail.

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_dowhy`), resolve to `content/post/<slug>/index.md`.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Read the full post.** Read the entire `index.md` to understand the topic,
   case study, methods, key results, and takeaways.

4. **Read the reference output.** Read
   `content/post/python_partial_identification/infographic_instructions.md` to
   calibrate tone and structure.

---

## Step 1 -- Generate the infographic instructions file

Write `infographic_instructions.md` in the post's page bundle directory
(e.g. `content/post/<slug>/infographic_instructions.md`).

The file has three main sections (the second section contains four subsections):

### Section 1: Title (H1)

A single H1 heading that is a concise, descriptive summary of the post's topic.

**Rules:**
- Do NOT use generic titles like "Infographic Instructions" or the post's full title
- Capture the core idea in under 12 words
- Frame it as what the reader will learn, not what the post does

**Examples:**
- "Bounding Causal Effects When Confounders Are Hidden"
- "Predicting Housing Prices with Random Forests"
- "Estimating Causal Effects with Double Machine Learning"

### Section 2: Design Style and Layout

Include all four subsections exactly as shown below, adapting the illustration
suggestions to match the post's specific topic.

#### Design Style subsection

```markdown
## Design Style

- **Chalkboard sketchnote aesthetic**: dark background with chalk-drawn lettering, chalk-dust textures, and hand-sketched icons that look drawn in white or colored chalk
- Use simple chalk-style illustrations: <2-3 topic-specific icon suggestions>
- Panel borders: chalk-drawn rounded rectangles with slightly uneven edges (hand-drawn feel)
- Connectors: chalk arrows and dotted chalk lines between panels showing narrative flow
- Key numbers: oversized chalk-style numerals, optionally circled or underlined with a chalk swoosh
- Subtle chalk dust / smudge effects near text edges for realism
```

The illustration suggestions must be specific to the post's content. Examples:
- Partial identification: "stick figures for workers, magnifying glass for unmeasured, brackets for bounds"
- Random forest: "decision trees, forest of trees, feature importance bars"
- DoWhy: "DAG arrows, treatment/outcome nodes, refutation shields"

#### Color Palette subsection

This subsection is identical for every post -- copy it exactly:

```markdown
## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Navy blue | `#0e1545` |
| Body text / outlines | Chalk white | `#f0ece2` |
| Panel titles / headers | Steel blue (bright) | `#8bb8e0` |
| Accents / key numbers | Warm orange | `#e8956a` |
| Call-outs / positive emphasis | Teal | `#00d4c8` |
| Underlines / secondary accents | Muted chalk gray | `#b0a89a` |

- Use steel blue for panel titles and chalk-drawn borders
- Use warm orange for key numbers, bold callouts, and warning highlights (e.g., bias)
- Use teal for positive emphasis (e.g., "32% tighter", improvement metrics)
- Use chalk white for body text and sketch outlines
- Use muted gray for connectors, dotted lines, and de-emphasized annotations
- Never use pure white (`#ffffff`) -- chalk is always slightly warm/creamy
```

#### Visual Hierarchy subsection

This subsection is identical for every post -- copy it exactly:

```markdown
## Visual Hierarchy

- **Panel titles**: largest text, steel blue, all caps or small caps chalk lettering
- **Key numbers**: second largest, warm orange, optionally circled or underlined
- **Body sentences**: chalk white, compact hand-lettered style
- **Annotations / labels**: muted chalk gray, smaller size
- **Icons / illustrations**: chalk white outlines with occasional color fills (teal or orange)
```

#### Panel Layout subsection

This subsection is identical for every post -- copy it exactly:

```markdown
## Panel Layout

- **Landscape orientation** (e.g., 1920x1080 or 16:9 aspect ratio)
- 6 panels arranged in a 3x2 grid (3 columns x 2 rows)
- Each panel: chalk-drawn rounded rectangle border in steel blue
- Panels connected by chalk arrows or dotted lines showing the narrative flow (1->2->3->4->5->6)
- Small panel number in top-left corner of each panel (warm orange, circled)
- Leave breathing room between panels -- the dark background itself is a design element
```

### Section 3: Panel Content (6 Panels)

Six panels, each with an H3 heading (`### Panel N -- <Title>`) and 2-3 bullet
point sentences.

#### Panel structure

| Panel | Purpose | What to extract from the post |
|-------|---------|-------------------------------|
| 1 | **The Problem** | Why this topic matters, what gap it addresses, what question it answers |
| 2 | **Case Study** | The dataset/scenario, key setup numbers (sample size, variables, treatment/outcome) |
| 3 | **Core Method** | The main technique, how it works in one sentence, its key result with numbers |
| 4 | **Extensions / Comparisons** | Alternative methods tried, how they compare, which performed better and by how much |
| 5 | **Key Insight** | The single most surprising or important takeaway -- the "aha" moment |
| 6 | **Bottom Line** | Practical implications, when to use this method, decision guidance |

#### Panel title rules

- Panel titles should be descriptive and specific to the post content
- Do NOT use generic titles like "Results" or "Analysis"
- Include the method name or key concept in the title
- Examples: "Manski Bounds (No Assumptions)", "Random Forest vs. Gradient Boosting", "The Backdoor Criterion"

#### Sentence quality rules

- Each sentence must be **self-contained** -- readable without the surrounding context
- Each sentence must be **infographic-ready** -- short, punchy, quotable
- Include **specific numbers** from the post (percentages, coefficients, sample sizes, bounds)
- Do NOT write vague summaries like "the method performed well"
- Use em dashes (--) not double hyphens
- Do NOT use emojis
- Target: 15-30 words per sentence
- Each panel should have exactly 2-3 bullet points (not more, not fewer)

---

## Step 2 -- Verify

After writing the file:

1. **Read it back** to verify it was written correctly
2. **Check panel count:** exactly 6 panels
3. **Check sentence count:** 2-3 sentences per panel (12-18 total)
4. **Check for specific numbers:** at least 6 of the sentences should contain a specific number from the post
5. **Check title:** is it a concise summary, not "Infographic Instructions"?
6. **Check illustrations:** are the suggested chalk icons specific to this post's topic?
7. **Check all four design subsections are present:** Design Style, Color Palette, Visual Hierarchy, Panel Layout
8. **Check landscape orientation** is specified in Panel Layout

---

## Quality checklist

- [ ] Title is a concise, descriptive summary of the post topic (not "Infographic Instructions")
- [ ] Design Style section specifies chalkboard aesthetic with topic-specific chalk illustration suggestions
- [ ] Color Palette table is present with all 6 dark-background colors (background, chalk white, steel blue, warm orange, teal, muted gray)
- [ ] Visual Hierarchy section is present with 5 text levels
- [ ] Panel Layout section specifies landscape orientation, 3x2 grid
- [ ] Exactly 6 panels with descriptive titles
- [ ] Each panel has 2-3 bullet point sentences
- [ ] Sentences are short, punchy, and self-contained
- [ ] At least 6 sentences contain specific numbers from the post
- [ ] No emojis
- [ ] Em dashes (--) used, not double hyphens
- [ ] File saved as `infographic_instructions.md` in the post's page bundle
