# Data Source Handling

> This file is part of the `data-science-post` skill. If you update this
> content, also update the summary in SKILL.md. Read this file during
> pre-flight when parsing the dataset argument.

The user specifies the dataset. Design the data loading code to match.

## URL to a CSV or data file

```python
DATA_URL = "https://example.com/path/to/data.csv"
CACHE_PATH = Path("data.csv")

if CACHE_PATH.exists():
    df = pd.read_csv(CACHE_PATH)
else:
    df = pd.read_csv(DATA_URL)
    df.to_csv(CACHE_PATH, index=False)
```

## Named dataset from a well-known source

- **scikit-learn**: `from sklearn.datasets import load_iris; df = pd.DataFrame(...)`
- **Seaborn**: `df = sns.load_dataset("penguins")`
- **World Bank / FRED**: Use `pandas_datareader` or direct URL download
- **GitHub-hosted CSV**: Download via raw URL

## DS4Bolivia

**Base URL:** `https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master`

| Dataset | Path | Key columns |
|---------|------|-------------|
| SDG indices | `/sdg/sdg.csv` | `asdf_id`, `imds`, `sdg1`-`sdg15` |
| Satellite embeddings | `/satelliteEmbeddings/satelliteEmbeddings2017.csv` | `asdf_id`, `A00`-`A63` |
| Region names | `/regionNames/regionNames.csv` | `asdf_id`, municipality/department names |

Join on `asdf_id` (339 Bolivian municipalities). Select columns by topic:
supervised -> SDG target + embedding features; unsupervised -> embeddings;
causal -> SDG outcome + treatment; spatial -> add region identifiers.

## Simulated data (DGP)

When the topic is about a statistical or causal inference method (e.g., FWL
theorem, instrumental variables, regression discontinuity), a transparent
**data generating process** is often better than a real dataset. The reader
can verify results against known true parameters.

```python
def simulate_data(n=50, seed=42):
    """Simulate data with known causal structure.

    True DGP:
        confounder ~ N(50, 10)
        treatment  = f(confounder) + noise
        outcome    = true_effect * treatment + g(confounder) + noise

    The true causal effect of treatment on outcome is <true_effect>.
    """
    rng = np.random.default_rng(seed)
    confounder = rng.normal(50, 10, n)
    treatment = ...  # function of confounder + noise
    outcome = ...    # function of treatment + confounder + noise
    return pd.DataFrame({...})
```

Key conventions for simulated data:
- Document the true DGP in the docstring (exact equations)
- State the **true causal effect** so readers can verify estimates
- Use `np.random.default_rng(seed)` (modern NumPy API) for the DGP function
- Keep N small enough for clear scatter plots (50-200), large enough for stable estimates
- Print shape, head, and descriptive stats after generation (same as real data)

## User-described dataset

If the user describes data without a URL or name, ask: format? access method? key variables?

## General principles

- Always cache downloaded data locally
- Print dataset shape and basic stats after loading
- Define `TARGET`, `FEATURE_COLS`, and config variables near the top
- Use `RANDOM_SEED = 42` for reproducibility
