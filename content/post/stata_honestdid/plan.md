# Plan: Stata HonestDiD Sensitivity Analysis Tutorial

## Context

DiD is among the most popular causal inference methods, but it relies on the untestable parallel trends assumption. With only two periods of data, researchers **cannot even test** this assumption --- they must simply assume it holds. With multiple periods, researchers can run pre-trends tests, but Roth (2022) showed these have low power and create "pre-test bias." The `honestdid` package (Rambachan & Roth 2023) offers formal sensitivity analysis for both settings --- it quantifies *how much* parallel trends can be violated before conclusions change.

This tutorial is structured in **two self-contained parts**, each with its own DiD estimation and sensitivity analysis:
- **Part 1 (Simple 2x2 DiD):** Hook = you can't test parallel trends with only 2 periods; honestdid provides a way forward via relative magnitudes
- **Part 2 (Multi-period DiD):** Hook = even with multiple periods, pre-trends tests are insufficient; honestdid offers both relative magnitudes and smoothness restrictions

## Deliverables

| File | Description |
|------|-------------|
| `content/post/stata_honestdid/index.md` | Main tutorial (~6,500 words) |
| `content/post/stata_honestdid/analysis.do` | Companion Stata do-file |
| `content/post/stata_honestdid/analysis.log` | Stata execution log |
| `content/post/stata_honestdid/stata_honestdid_*.png` | At least 6 figures |

## Dataset

- **Source:** `ehec_data.dta` from Mixtape Sessions Advanced-DID
- **URL:** `https://raw.githubusercontent.com/Mixtape-Sessions/Advanced-DID/main/Exercises/Data/ehec_data.dta`
- **Variables:** `dins` (insurance share), `year` (2008--2015), `yexp2` (expansion year), `stfips` (state FIPS)
- **Treatment:** States expanding Medicaid in 2014; Control: never-treated states

## Two-Part Structure

### Part 1: Simple 2x2 DiD + Sensitivity
- Collapse multi-period data to pre/post for textbook 2x2
- Use 3-year window (2012--2014) for event study with numpre(1)
- Apply DeltaRM only (DeltaSD requires 2+ pre-periods)
- Hook: can't test parallel trends with only 2 periods

### Part 2: Multi-period DiD + Sensitivity
- Full panel (2008--2015), 5 pre-periods
- Apply both DeltaRM and DeltaSD
- Extension: staggered DiD with csdid
- Hook: pre-trends tests have low power (Roth 2022)

## Key Pedagogical Strategies

- Progressive complexity: 2x2 -> event study -> sensitivity -> staggered
- Analogies before formalism: runners (PT problem), bridge stress test (breakdown value), smoke detector (pre-tests), speed vs acceleration (RM vs SD)
- Breakdown value as the central concept
- Cross-part comparison: what more data buys you
