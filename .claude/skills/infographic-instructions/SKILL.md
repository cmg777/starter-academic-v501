---
name: infographic-instructions
description: Generate a sketchnote-style infographic instructions file that summarizes an existing blog post into 6 panels with the site color palette. Produces an infographic_instructions.md file in the post's page bundle.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Infographic Instructions: Sketchnote Summary Generator

Read an existing blog post on this site and produce an `infographic_instructions.md`
file in the post's page bundle. The file contains design style guidance (sketchnote
aesthetic), the site color palette with role assignments, and 6 panels of concise,
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

The file has three sections:

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

### Section 2: Design Style

Include both subsections exactly as shown below, adapting the illustration
suggestions to match the post's specific topic.

#### Design Style subsection

```markdown
## Design Style

- **Sketchnote aesthetic**: hand-drawn feel with informal lettering, doodle-style icons, and hand-sketched arrows connecting ideas
- Use simple illustrations: <2-3 topic-specific icon suggestions>
- Panels flow top-to-bottom or left-to-right with visual connectors (arrows, dotted lines)
- Key numbers should be large and bold; supporting text should be compact
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
| Primary / headers | Steel blue | `#6a9bcc` |
| Accents / highlights | Warm orange | `#d97757` |
| Text / outlines | Near black | `#141413` |
| Call-outs / emphasis | Teal | `#00d4c8` |
| Panel titles | Heading blue | `#1a3a8a` |

- Use steel blue for panel borders and section headers
- Use warm orange for key numbers and warning highlights (e.g., bias)
- Use teal for positive emphasis (e.g., "32% tighter")
- Use near black for body text and sketch outlines
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
6. **Check illustrations:** are the suggested icons specific to this post's topic?

---

## Quality checklist

- [ ] Title is a concise, descriptive summary of the post topic (not "Infographic Instructions")
- [ ] Design Style section includes topic-specific illustration suggestions
- [ ] Color Palette table is present with all 5 site colors
- [ ] Exactly 6 panels with descriptive titles
- [ ] Each panel has 2-3 bullet point sentences
- [ ] Sentences are short, punchy, and self-contained
- [ ] At least 6 sentences contain specific numbers from the post
- [ ] No emojis
- [ ] Em dashes (--) used, not double hyphens
- [ ] File saved as `infographic_instructions.md` in the post's page bundle
