# Interview Questions (Phase 2)

The Phase-2 interview is the load-bearing feature of `write-app`. The
skill must keep asking `AskUserQuestion` rounds until it can name
every tab, every chart, every data source, and every key takeaway
without guessing. This file gives canonical question templates; adapt
the wording to the specific post.

**Cap each `AskUserQuestion` call at 4 questions, with each question
having 2–4 options.** That is the hard limit of the tool. Run multiple
`AskUserQuestion` rounds in sequence if needed.

---

## Round 1 (always run): Key takeaways

Open with:

> I read the post and extracted these key takeaways. The web app's
> Tab-1 lede will be built from these, and every subsequent tab
> should reinforce at least one. Confirm or amend.

**Question template (single question, 2–4 options):**

```
Q: Which key takeaway should the app foreground?

Header: Takeaway 1
Options (single-select):
  1. [Recommended] <takeaway extracted from post §1 or §<conclusion>>
  2. <alternative extracted from learning objectives, if different>
  3. <alternative extracted from the post's spoiler figure caption>
```

If the post has 3+ candidate takeaways, run this as a multiSelect
question with 4 options and ask the user to pick 2–3.

---

## Round 2 (always run): Tab structure

Open with:

> Based on the topic family (`<family>`) I propose the following
> tab archetypes. Confirm the set or swap individual tabs.

**Two questions in one `AskUserQuestion` call:**

```
Q1: Which tabs should the app include?

Header: Tabs
multiSelect: true
Options:
  1. [Recommended] <archetype 1 from default map>
  2. [Recommended] <archetype 2 from default map>
  3. [Recommended] <archetype 3 from default map>
  4. <one extra option from the catalog not in the default map>

Q2: Tab 1 is always the concept animation. Which intuition should it
visualise?

Header: Tab-1 metaphor
Options:
  1. [Recommended] <topic-appropriate default — e.g. L1 vs L2 for ML,
     parallel trends for DiD, etc.>
  2. <alternative variant>
  3. None — start the app on Tab 2
```

If the user selects a STUB widget in Q1, follow up with a single-
question round acknowledging the stub status (see Round 5 below).

---

## Round 3 (always run): Data approach

The wording branches on the detected pattern (A / B / C).

**Pattern A — precomputed CSV(s) present:**

```
Q: I found these results CSVs in the post folder:
   - <file 1>  (<rows> rows, columns: <list>)
   - <file 2>  (<rows> rows, columns: <list>)

Header: Data source
Options:
  1. [Recommended] Use <file 1> to populate the forest-plot tab
  2. Use <file 2> instead
  3. Bake both — first as forest plot, second as selection-bar chart
  4. Skip real data; use the DGP simulator only
```

**Pattern B — only raw data folder:**

```
Q: The post has a `data/` folder but no precomputed results table.
Generating estimates from raw data in JS is too slow for live
interaction. How should the app handle this?

Header: Pattern-B fallback
Options:
  1. [Recommended] Use simulated DGP only — skip the forest plot tab
  2. Use simulated DGP for tabs 2-3; I will manually paste numbers
     into data/results.json after the run
  3. Cancel — run /project:write-results-report first to generate a
     results CSV, then re-invoke this skill
```

**Pattern C — landing page:**

```
Q: No local data or script — this post is a landing page linking to
external notebooks. The app will be 100% simulated. Should the DGP
mimic the post's topic or use a generic toy model?

Header: DGP style
Options:
  1. [Recommended] Mimic the post's topic (e.g., <topic-specific DGP
     name from the catalog>)
  2. Generic toy DGP (y = α·d + X·θ + ε)
  3. Cancel — I'd rather link out to the external app instead
```

---

## Round 4 (always run): Performance caps

```
Q: To keep slider interactions responsive (target ~300 ms), I'll
cap the live JS computation at:
  - sample size n ≤ <default>
  - number of controls p ≤ <default>
  - simulations per Monte Carlo run ≤ <default>

Header: Performance caps
Options:
  1. [Recommended] Defaults (n ≤ 500, p ≤ 100, sims ≤ 100)
  2. Larger caps (n ≤ 1000, p ≤ 250) — sliders feel less snappy
  3. Smaller caps (n ≤ 300, p ≤ 50) — extra responsiveness for
     beginner-heavy posts
```

---

## Round 5 (conditional): Stub widget acknowledgement

Trigger: any tab in the confirmed list maps to a STUB widget.

```
Q: You selected <stub widget name>, which is currently a stub
(catalog entry only — no working implementation yet). The app will
render a "to be implemented" card for that tab. Proceed, swap, or
skip?

Header: Stub trade-off
Options:
  1. [Recommended] Swap with the closest READY widget: <name>
  2. Keep the stub — placeholder card is fine
  3. Drop the tab — go from 4 tabs to 3
```

---

## Round 6 (conditional): Widget-specific knobs

Trigger: chosen widget has degrees of freedom not covered above. Ask
one at a time; bundle into a single `AskUserQuestion` call if possible.

### Forest plot

```
Q: The forest plot will show these estimators by default. Confirm or
trim.

Header: Forest-plot rows
multiSelect: true
Options: <list of methods present in the CSV>
```

### DGP simulator

```
Q: The DGP simulator has one "headline" slider that changes the
estimator's behaviour most dramatically. Which slider should we make
the focal one?

Header: Focal slider
Options:
  1. [Recommended] <topic-appropriate default — λ for LASSO,
     asymmetry for confounder strength, etc.>
  2. <alternative>
  3. <alternative>
```

### DiD event-study

```
Q: How many pre/post periods around treatment should the event-study
panel show?

Header: Event window
Options:
  1. [Recommended] ±5 periods
  2. ±10 periods
  3. ±3 periods
```

### Feature importance

```
Q: How many features should the importance bar chart show?

Header: Top-K
Options:
  1. [Recommended] Top 10
  2. Top 20
  3. All features
```

---

## Final confirmation prompt

After all rounds are complete, print the final SCOPE block (with every
field resolved) and ask:

```
Proceed to write the app? (y / explain change / cancel)
```

Use a plain text wait — not `AskUserQuestion` — so the user can type a
free-form "explain change" message. Do not proceed without `y`.

---

## Anti-patterns to avoid

- **Do not ask "is the plan ok?".** That's what the final
  confirmation is for.
- **Do not chain more than 4 `AskUserQuestion` rounds** before the
  final confirmation. If you're past round 4 and still uncertain,
  state the ambiguity in plain text and ask the user to clarify in
  prose.
- **Do not propose tabs the catalog doesn't define.** If a post needs
  a novel widget, surface it as a STUB and document the gap.
- **Do not skip Round 1** (key takeaways) — without confirmed
  takeaways the app has no narrative spine.
- **Do not collapse Round 3 with Round 2.** Data approach is the
  decision most likely to invalidate the tab list, so it gets its
  own round.
