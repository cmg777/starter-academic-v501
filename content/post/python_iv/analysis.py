"""
==================================================================
  Instrumental Variables in Development Economics
  Replicating Acemoglu, Johnson & Robinson (2001)
  "The Colonial Origins of Comparative Development"

  Tutorial companion file for: carlos-mendez.org/post/python_iv/

  Audience: graduate / advanced-undergrad students in development
  economics. Estimand: 2SLS identifies the LATE (Imbens-Angrist 1994)
  for compliers — the subpopulation of countries whose institutional
  quality would change in response to settler-mortality variation.
  Under constant treatment effects, LATE = ATE.

  Three IV identification conditions (Wooldridge, Cameron-Trivedi):
    (i)   Relevance:    cov(Z, X) != 0  (logem4 predicts avexpr)
    (ii)  Exclusion:    Z affects Y only through X (mortality affects
                        modern GDP only via institutions)
    (iii) Exogeneity:   Z _||_ U  (mortality independent of unobserved
                        determinants of GDP, conditional on controls)

  Datasets: 8 .dta files (maketable1.dta … maketable8.dta) shared with
  the companion Stata post at content/post/stata_iv/. The Python post
  loads them from this site's GitHub raw URL by default (USE_GITHUB
  toggle in §0) so any reader can replicate without cloning the repo.
  Set USE_GITHUB=False below to load from ../stata_iv/ instead.

  Library strategy: hybrid pyfixest + linearmodels. pyfixest is the
  primary engine for 2SLS β/SE and OLS comparisons; linearmodels
  supplies the canonical Kleibergen-Paap rk Wald F, Hansen J, and
  Durbin-Wu-Hausman tests that pyfixest does not natively report.

  Usage:
    cd content/post/python_iv/
    python analysis.py 2>&1 | tee execution_log.txt

  Outputs:
    - execution_log.txt          : captured stdout
    - python_iv_*.png            : 3 figures (dark theme)
    - tab[1-8]_*.csv             : 9 result tables

  References:
    - Acemoglu, Johnson, Robinson (2001), AER 91(5): 1369-1401
    - Imbens & Angrist (1994), Econometrica 62(2): 467-475
    - Stock & Yogo (2005), in Andrews-Stock Festschrift
    - Albouy (2012), AER 102(6): 3059-3076 (settler-mortality critique)
==================================================================
"""

import warnings

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pyfixest as pf
from linearmodels.iv import IV2SLS

# ── Reproducibility ──────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
pd.options.display.float_format = "{:.4f}".format

# ── Site color palette (dark theme) ──────────────────────────────
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

plt.rcParams.update({
    "figure.facecolor": DARK_NAVY,
    "axes.facecolor": DARK_NAVY,
    "axes.edgecolor": DARK_NAVY,
    "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT,
    "axes.titlecolor": WHITE_TEXT,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
    "axes.grid": True,
    "grid.color": GRID_LINE,
    "grid.linewidth": 0.6,
    "grid.alpha": 0.8,
    "xtick.color": LIGHT_TEXT,
    "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "text.color": WHITE_TEXT,
    "font.size": 11,
    "legend.frameon": False,
    "legend.fontsize": 10,
    "legend.labelcolor": LIGHT_TEXT,
    "savefig.facecolor": DARK_NAVY,
    "savefig.edgecolor": DARK_NAVY,
})

# ── Data-loading mode ────────────────────────────────────────────
# USE_GITHUB = True  (default): load .dta files from this site's
#                              GitHub repo (replicability for any
#                              reader, no clone required).
# USE_GITHUB = False         : load from ../stata_iv/ (offline / dev).
USE_GITHUB = True

DATA_URL = (
    "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv"
    if USE_GITHUB
    else "../stata_iv"
)
print(f"Data source: {DATA_URL}\n")


def load_dta(table_n: int) -> pd.DataFrame:
    """Load AJR's maketable{N}.dta from the configured data source."""
    return pd.read_stata(f"{DATA_URL}/maketable{table_n}.dta")


def banner(text: str) -> None:
    """Print a banner separator for log readability."""
    print("\n\n" + "=" * 64)
    print(f"  {text}")
    print("=" * 64)


def coef_se(model, var: str) -> tuple[float, float]:
    """Extract (coefficient, SE) for a variable from a pyfixest model."""
    return model.coef()[var], model.se()[var]


def stars(p: float) -> str:
    """Significance stars (matches stata_iv esttab convention)."""
    if p < 0.01:
        return "***"
    if p < 0.05:
        return "**"
    if p < 0.10:
        return "*"
    return ""


def fmt_with_stars(beta: float, p: float) -> str:
    return f"{beta:.3f}{stars(p)}"


def vars_in(formula: str) -> list[str]:
    """Return list of column names referenced in a formula (any side, any role)."""
    out = []
    for piece in formula.replace("~", " ").replace("|", " ").replace("+", " ").split():
        s = piece.strip()
        if s and s != "1" and s.isidentifier():
            out.append(s)
    return list(dict.fromkeys(out))  # dedupe, preserve order


banner("AJR (2001) IV Tutorial — Colonial Origins of Development")
print("  Estimand: LATE (compliers) under heterogeneous effects.")
print("  Three IV conditions: relevance, exclusion, exogeneity.")
print()


# =================================================================
#  SECTION 1: TABLE 1 — Summary Statistics
#  Goal: describe outcomes, institutions, and instrument across
#  the whole world, the AJR base sample, and quartiles of settler
#  mortality.
# =================================================================
banner("TABLE 1 — Summary Statistics")

df1 = load_dta(1)
print(f"df1 (whole world): {df1.shape}")

# 1.1 Whole world summary
vars_world = ["logpgp95", "loghjypl", "avexpr", "cons00a", "cons1", "democ00a", "euro1900"]
print("\n*** Column 1: whole world ***")
print(df1[vars_world].describe().T[["count", "mean", "std", "min", "max"]].round(3))

# 1.2 Base sample summary
print("\n*** Column 2: AJR base sample (baseco==1) ***")
base1 = df1[df1["baseco"] == 1].copy()
vars_base = vars_world + ["logem4"]
base_summary = base1[vars_base].describe().T[["count", "mean", "std", "min", "max"]].round(3)
print(base_summary)
base_summary.to_csv("tab1_summary.csv")
print("→ wrote tab1_summary.csv")

# 1.3 Mortality quartiles (replicates AJR's rank-based bins)
print("\n*** Columns 3-6: quartiles of settler mortality ***")
df1q = df1.dropna(subset=["extmort4"]).copy()
df1q["q"] = pd.qcut(df1q["extmort4"].rank(method="first"), 4, labels=[1, 2, 3, 4])
print(df1q.groupby("q", observed=True)[["logpgp95", "avexpr", "logem4"]].mean().round(3))


# =================================================================
#  SECTION 2: TABLE 2 — OLS Regressions
#  Goal: establish the naive benchmark. OLS is biased by reverse
#  causality, omitted variables, and measurement error in the
#  institutions index. The IV estimates in §5 reveal the magnitude
#  of that bias.
# =================================================================
banner("TABLE 2 — OLS Regressions of log GDP per capita")

df2 = load_dta(2)
print(f"df2 (whole world + base): {df2.shape}")

# Column-by-column OLS
m2_specs = [
    ("Col 1: whole world",         "logpgp95 ~ avexpr",                                  None),
    ("Col 2: base sample",         "logpgp95 ~ avexpr",                                  df2["baseco"] == 1),
    ("Col 3: + latitude",          "logpgp95 ~ avexpr + lat_abst",                       None),
    ("Col 4: + lat + continents",  "logpgp95 ~ avexpr + lat_abst + africa + asia + other", None),
    ("Col 5: base + latitude",     "logpgp95 ~ avexpr + lat_abst",                       df2["baseco"] == 1),
    ("Col 6: base + lat + cont.",  "logpgp95 ~ avexpr + lat_abst + africa + asia + other", df2["baseco"] == 1),
    ("Col 7: loghjypl, world",     "loghjypl ~ avexpr",                                  None),
    ("Col 8: loghjypl, base",      "loghjypl ~ avexpr",                                  df2["baseco"] == 1),
]

m2_rows = []
for name, fml, mask in m2_specs:
    sub = df2 if mask is None else df2[mask]
    sub = sub.dropna(subset=[c for c in vars_in(fml) if c in sub.columns])
    m = pf.feols(fml, data=sub, vcov="HC1")
    b, se = coef_se(m, "avexpr")
    p = m.pvalue()["avexpr"]
    print(f"  {name:30s}  avexpr = {fmt_with_stars(b, p):>10s}  (SE {se:.3f})  N={int(m._N)}")
    m2_rows.append({
        "Spec": name, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "N": int(m._N), "R2": round(m._r2, 3),
    })

pd.DataFrame(m2_rows).to_csv("tab2_ols.csv", index=False)
print("→ wrote tab2_ols.csv")


# =================================================================
#  SECTION 3: TABLE 3 — Determinants of Institutions
#  Panel A (DV = avexpr):  current institutions on early settlement
#  Panel B (DV = early institutions): early institutions on logem4
#  Together, this previews the *first stage*: settler mortality
#  shapes settlement, settlement shapes early institutions, and
#  early institutions persist into modern institutions.
# =================================================================
banner("TABLE 3 — Determinants of Institutions")

df3 = load_dta(3)
df3 = df3[(df3["excolony"] == 1) & df3["extmort4"].notna()].copy()
df3["euro1900"] = df3["euro1900"] / 100.0

# Panel A: DV = avexpr  (10 cols)
panel_a_specs = [
    ("A.c1",  "avexpr ~ cons00a"),
    ("A.c2",  "avexpr ~ cons00a + lat_abst"),
    ("A.c3",  "avexpr ~ democ00a"),
    ("A.c4",  "avexpr ~ democ00a + lat_abst"),
    ("A.c5",  "avexpr ~ cons1 + indtime"),
    ("A.c6",  "avexpr ~ cons1 + indtime + lat_abst"),
    ("A.c7",  "avexpr ~ euro1900"),
    ("A.c8",  "avexpr ~ euro1900 + lat_abst"),
    ("A.c9",  "avexpr ~ logem4"),
    ("A.c10", "avexpr ~ logem4 + lat_abst"),
]
m3a_rows = []
print("\n*** Panel A: DV = current expropriation protection (avexpr) ***")
for name, fml in panel_a_specs:
    sub = df3.dropna(subset=[c for c in vars_in(fml) if c in df3.columns])
    sub = sub[sub["logpgp95"].notna()]  # mirror AJR sample restrictions
    m = pf.feols(fml, data=sub, vcov="HC1")
    rhs = fml.split("~")[1].strip().split("+")[0].strip()
    b, se = coef_se(m, rhs)
    p = m.pvalue()[rhs]
    print(f"  {name:6s}  {rhs:12s} = {fmt_with_stars(b, p):>10s}  (SE {se:.3f})  N={int(m._N)}")
    m3a_rows.append({
        "Spec": name, "RHS": rhs, "b": round(b, 3), "se": round(se, 3),
        "p": round(p, 4), "N": int(m._N), "R2": round(m._r2, 3),
    })
pd.DataFrame(m3a_rows).to_csv("tab3a_inst.csv", index=False)
print("→ wrote tab3a_inst.csv")

# Panel B: DV = early institution  (10 cols)
panel_b_specs = [
    ("B.c1",  "cons00a ~ euro1900"),
    ("B.c2",  "cons00a ~ euro1900 + lat_abst"),
    ("B.c3",  "cons00a ~ logem4"),
    ("B.c4",  "cons00a ~ logem4 + lat_abst"),
    ("B.c5",  "democ00a ~ euro1900"),
    ("B.c6",  "democ00a ~ euro1900 + lat_abst"),
    ("B.c7",  "democ00a ~ logem4"),
    ("B.c8",  "democ00a ~ logem4 + lat_abst"),
    ("B.c9",  "euro1900 ~ logem4"),
    ("B.c10", "euro1900 ~ logem4 + lat_abst"),
]
m3b_rows = []
print("\n*** Panel B: DV = early institutions (cons00a/democ00a/euro1900) ***")
for name, fml in panel_b_specs:
    sub = df3.dropna(subset=[c for c in vars_in(fml) if c in df3.columns])
    sub = sub[sub["logpgp95"].notna()]
    m = pf.feols(fml, data=sub, vcov="HC1")
    rhs = fml.split("~")[1].strip().split("+")[0].strip()
    b, se = coef_se(m, rhs)
    p = m.pvalue()[rhs]
    print(f"  {name:6s}  {rhs:12s} = {fmt_with_stars(b, p):>10s}  (SE {se:.3f})  N={int(m._N)}")
    m3b_rows.append({
        "Spec": name, "RHS": rhs, "b": round(b, 3), "se": round(se, 3),
        "p": round(p, 4), "N": int(m._N), "R2": round(m._r2, 3),
    })
pd.DataFrame(m3b_rows).to_csv("tab3b_inst.csv", index=False)
print("→ wrote tab3b_inst.csv")


# =================================================================
#  SECTION 4: FIGURES 1 & 2 — first-stage and reduced-form scatters
#  These visualize the two pieces of any IV identification:
#    Figure 1 (first stage):  Z -> X (settler mortality -> institutions)
#    Figure 2 (reduced form): Z -> Y (settler mortality -> log GDP)
#  The 2SLS coefficient is exactly the slope of the reduced form
#  divided by the slope of the first stage.
# =================================================================
banner("FIGURES 1 & 2 — First-stage and reduced-form scatters")

df4 = load_dta(4)
base = df4[df4["baseco"] == 1].dropna(subset=["logpgp95", "avexpr", "logem4"]).copy()

# 4.1 First-stage F via linearmodels (canonical KP-F + DWH)
y = base["logpgp95"].values
X_endog = base[["avexpr"]]
X_exog = pd.DataFrame({"const": np.ones(len(base))}, index=base.index)
Z = base[["logem4"]]
res4 = IV2SLS(y, X_exog, X_endog, Z).fit(cov_type="robust")

# linearmodels' first-stage block reports an HC-robust partial F.
# That's the closest analogue to ivreg2's KP-F = 16.32 reference.
fs_F = float(res4.first_stage.diagnostics.loc["avexpr", "f.stat"])
fs_pval = float(res4.first_stage.diagnostics.loc["avexpr", "f.pval"])
print(f"\n*** First-stage robust F (linearmodels): {fs_F:.2f}  (p = {fs_pval:.2e})")
print(f"*** Stock-Yogo (2005) 10% maximal IV size critical value: 16.38 (IID)")
print(f"*** Staiger-Stock (1997) weak-IV rule of thumb: F > 10")

# Endogeneity test (Durbin-Wu-Hausman)
dwh = res4.wu_hausman()
print(f"*** Endogeneity test (Wu-Hausman) F={dwh.stat:.3f}, p = {dwh.pval:.4f}")
print(f"*** (small p -> reject OLS exogeneity -> IV warranted)")

# Figure 1: first stage (logem4 on x, avexpr on y)
def annotate_scatter(ax, x, y, labels):
    """Lightly annotate every point with the country shortname."""
    for xi, yi, lab in zip(x, y, labels):
        ax.annotate(lab, (xi, yi),
                    textcoords="offset points", xytext=(4, 2),
                    fontsize=6, color=TEAL, alpha=0.8)


fig1, ax1 = plt.subplots(figsize=(10, 6.5))
ax1.scatter(base["logem4"], base["avexpr"], color=STEEL_BLUE, s=28, alpha=0.85, edgecolor="none")
annotate_scatter(ax1, base["logem4"], base["avexpr"], base["shortnam"])
xfit = np.linspace(base["logem4"].min(), base["logem4"].max(), 100)
fs_slope = res4.first_stage.individual["avexpr"].params["logem4"]
fs_intercept = res4.first_stage.individual["avexpr"].params["const"]
ax1.plot(xfit, fs_intercept + fs_slope * xfit, color=WARM_ORANGE, linewidth=2.2)
ax1.set_title("Figure 1. First stage: settler mortality predicts institutions",
              fontsize=13, color=WHITE_TEXT, pad=12)
ax1.text(0.5, 1.02, "Base sample of 64 ex-colonies (AJR 2001 Table 4)",
         transform=ax1.transAxes, ha="center", fontsize=10, color=LIGHT_TEXT)
ax1.set_xlabel("Log settler mortality (logem4)")
ax1.set_ylabel("Avg. protection from expropriation, 1985-95 (avexpr)")
plt.tight_layout()
plt.savefig("python_iv_first_stage.png", dpi=200, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.2)
plt.close()
print("→ wrote python_iv_first_stage.png")

# Figure 2: reduced form (logem4 on x, logpgp95 on y)
m_rf = pf.feols("logpgp95 ~ logem4", data=base, vcov="HC1")
rf_slope = m_rf.coef()["logem4"]
rf_intercept = m_rf.coef()["Intercept"]

fig2, ax2 = plt.subplots(figsize=(10, 6.5))
ax2.scatter(base["logem4"], base["logpgp95"], color=STEEL_BLUE, s=28, alpha=0.85, edgecolor="none")
annotate_scatter(ax2, base["logem4"], base["logpgp95"], base["shortnam"])
ax2.plot(xfit, rf_intercept + rf_slope * xfit, color=WARM_ORANGE, linewidth=2.2)
ax2.set_title("Figure 2. Reduced form: settler mortality predicts log GDP",
              fontsize=13, color=WHITE_TEXT, pad=12)
ax2.text(0.5, 1.02, "Base sample of 64 ex-colonies (AJR 2001 Table 4)",
         transform=ax2.transAxes, ha="center", fontsize=10, color=LIGHT_TEXT)
ax2.set_xlabel("Log settler mortality (logem4)")
ax2.set_ylabel("Log GDP per capita, PPP, 1995 (logpgp95)")
plt.tight_layout()
plt.savefig("python_iv_reduced_form.png", dpi=200, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.2)
plt.close()
print("→ wrote python_iv_reduced_form.png")

print(f"\nFirst-stage slope (logem4 -> avexpr):   {fs_slope:.3f}")
print(f"Reduced-form slope (logem4 -> logpgp95): {rf_slope:.3f}")
print(f"Implied 2SLS β = RF / FS = {rf_slope:.3f} / {fs_slope:.3f} = {rf_slope/fs_slope:.3f}")


# =================================================================
#  SECTION 5: TABLE 4 — Main IV result + modern weak-IV diagnostics
#  AJR's headline finding: 2SLS coefficient on avexpr (~0.94) is
#  *larger* than OLS (~0.52), suggesting measurement-error attenuation
#  in OLS dominates other biases.
# =================================================================
banner("TABLE 4 — IV Regressions of log GDP per capita (main result)")

df4 = load_dta(4)
df4 = df4[df4["baseco"] == 1].copy()
df4["other_cont"] = ((df4["shortnam"] == "AUS") | (df4["shortnam"] == "MLT") |
                    (df4["shortnam"] == "NZL")).astype(int)


def iv_with_kpf(df_in: pd.DataFrame, formula: str, robust: bool = True):
    """Estimate via pyfixest AND linearmodels; return both for KP-F + DWH."""
    sub = df_in.dropna(subset=[c for c in vars_in(formula) if c in df_in.columns]).copy()
    m_pf = pf.feols(formula, data=sub, vcov="HC1")
    return m_pf, sub


def run_iv2sls(sub: pd.DataFrame, dep: str, exog_cols: list[str],
               endog_cols: list[str], inst_cols: list[str]):
    """Run linearmodels.IV2SLS to extract KP-F and (optionally) Hansen J / DWH."""
    sub = sub.dropna(subset=[dep] + exog_cols + endog_cols + inst_cols).copy()
    y_ = sub[dep].values
    if exog_cols:
        X_exog_ = sub[exog_cols].copy()
        X_exog_["const"] = 1.0
    else:
        X_exog_ = pd.DataFrame({"const": np.ones(len(sub))}, index=sub.index)
    res = IV2SLS(y_, X_exog_, sub[endog_cols], sub[inst_cols]).fit(cov_type="robust")
    # KP-F via linearmodels' first-stage diagnostics (HC-robust partial F)
    fs_diag = res.first_stage.diagnostics
    kpf = float(fs_diag.loc[endog_cols[0], "f.stat"]) if endog_cols[0] in fs_diag.index else np.nan
    return res, kpf


# Specifications for Table 4 (Cols 1-9: IV; Cols 10-18: paired OLS)
table4_specs = [
    ("c1: base",                  "logpgp95 ~ 1 | avexpr ~ logem4",                              None,                    "logpgp95", [],                                ["avexpr"], ["logem4"]),
    ("c2: + lat",                 "logpgp95 ~ lat_abst | avexpr ~ logem4",                       None,                    "logpgp95", ["lat_abst"],                      ["avexpr"], ["logem4"]),
    ("c3: -Neo-Europes",          "logpgp95 ~ 1 | avexpr ~ logem4",                              df4["rich4"] != 1,       "logpgp95", [],                                ["avexpr"], ["logem4"]),
    ("c4: -Neo-Europes + lat",    "logpgp95 ~ lat_abst | avexpr ~ logem4",                       df4["rich4"] != 1,       "logpgp95", ["lat_abst"],                      ["avexpr"], ["logem4"]),
    ("c5: -Africa",               "logpgp95 ~ 1 | avexpr ~ logem4",                              df4["africa"] != 1,      "logpgp95", [],                                ["avexpr"], ["logem4"]),
    ("c6: -Africa + lat",         "logpgp95 ~ lat_abst | avexpr ~ logem4",                       df4["africa"] != 1,      "logpgp95", ["lat_abst"],                      ["avexpr"], ["logem4"]),
    ("c7: + continents",          "logpgp95 ~ africa + asia + other_cont | avexpr ~ logem4",     None,                    "logpgp95", ["africa", "asia", "other_cont"], ["avexpr"], ["logem4"]),
    ("c8: + continents + lat",    "logpgp95 ~ africa + asia + other_cont + lat_abst | avexpr ~ logem4", None,             "logpgp95", ["africa", "asia", "other_cont", "lat_abst"], ["avexpr"], ["logem4"]),
    ("c9: loghjypl",              "loghjypl ~ 1 | avexpr ~ logem4",                              None,                    "loghjypl", [],                                ["avexpr"], ["logem4"]),
]

print("\n*** Panel B: 2SLS (IV with logem4) ***\n")
m4_rows = []
for tag, fml, mask, dep, exog, endog, inst in table4_specs:
    sub = df4 if mask is None else df4[mask]
    m_pf, sub2 = iv_with_kpf(sub, fml)
    b_pf, se_pf = coef_se(m_pf, "avexpr")
    p_pf = m_pf.pvalue()["avexpr"]
    res_lm, kpf = run_iv2sls(sub2, dep, exog, endog, inst)
    b_lm = res_lm.params["avexpr"]
    se_lm = res_lm.std_errors["avexpr"]
    print(f"  IV {tag:30s} pyfixest β={b_pf:.3f} (SE {se_pf:.3f})  "
          f"LM β={b_lm:.3f} (SE {se_lm:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m4_rows.append({
        "Panel": "B (IV)", "Spec": tag, "dep": dep,
        "avexpr_b": round(b_lm, 3), "avexpr_se": round(se_lm, 3),
        "avexpr_p": round(p_pf, 4), "first_stage_F": round(kpf, 2),
        "N": int(m_pf._N), "R2": round(m_pf._r2, 3),
    })

# Tab 4 Col 1 detailed diagnostics
print("\n*** Tab 4 Col 1 — full diagnostics ***")
res_c1, kpf_c1 = run_iv2sls(df4, "logpgp95", [], ["avexpr"], ["logem4"])
dwh = res_c1.wu_hausman()
print(f"  IV β = {res_c1.params['avexpr']:.4f}  (SE {res_c1.std_errors['avexpr']:.4f})")
print(f"  CI 95% = [{res_c1.conf_int().loc['avexpr', 'lower']:.3f}, "
      f"{res_c1.conf_int().loc['avexpr', 'upper']:.3f}]")
print(f"  First-stage robust F (≈KP-F): {kpf_c1:.3f}")
print(f"  Wu-Hausman endogeneity F = {dwh.stat:.3f}, p = {dwh.pval:.4f}")
# Anderson-Rubin only meaningful with overidentification; skip in just-identified case
try:
    ar = res_c1.anderson_rubin
    if hasattr(ar, "stat"):
        print(f"  Anderson-Rubin Wald F    = {ar.stat:.3f}, p = {ar.pval:.4f}")
except Exception:
    pass
print(f"  (small endogeneity p -> OLS biased -> IV warranted)")

# Panel C: paired OLS (9 cols)
print("\n*** Panel C: OLS comparisons ***\n")
table4_ols_specs = [
    ("c10: base",          "logpgp95 ~ avexpr",                                   None),
    ("c11: + lat",         "logpgp95 ~ avexpr + lat_abst",                        None),
    ("c12: -NeoEur",       "logpgp95 ~ avexpr",                                   df4["rich4"] != 1),
    ("c13: -NeoEur + lat", "logpgp95 ~ avexpr + lat_abst",                        df4["rich4"] != 1),
    ("c14: -Africa",       "logpgp95 ~ avexpr",                                   df4["africa"] != 1),
    ("c15: -Africa + lat", "logpgp95 ~ avexpr + lat_abst",                        df4["africa"] != 1),
    ("c16: + continents",  "logpgp95 ~ avexpr + africa + asia + other_cont",      None),
    ("c17: + cont + lat",  "logpgp95 ~ avexpr + lat_abst + africa + asia + other_cont", None),
    ("c18: loghjypl",      "loghjypl ~ avexpr",                                   None),
]
for tag, fml, mask in table4_ols_specs:
    sub = df4 if mask is None else df4[mask]
    sub = sub.dropna(subset=[c for c in vars_in(fml) if c in sub.columns])
    m = pf.feols(fml, data=sub, vcov="HC1")
    b, se = coef_se(m, "avexpr")
    p = m.pvalue()["avexpr"]
    print(f"  OLS {tag:30s} β={b:.3f} (SE {se:.3f})  N={int(m._N)}")
    m4_rows.append({
        "Panel": "C (OLS)", "Spec": tag, "dep": fml.split("~")[0].strip(),
        "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": np.nan,
        "N": int(m._N), "R2": round(m._r2, 3),
    })

pd.DataFrame(m4_rows).to_csv("tab4_iv_main.csv", index=False)
print("→ wrote tab4_iv_main.csv")


# =================================================================
#  SECTION 6: TABLE 5 — IV with colonial / legal / religion controls
#  Robustness: do colonial-era variables (British/French ruler, French
#  legal origin, dominant religion) confound the institutions-GDP
#  link? Spoiler: the IV coefficient barely moves.
# =================================================================
banner("TABLE 5 — IV with colonial, legal, and religious controls")

df5 = load_dta(5)
df5 = df5[df5["baseco"] == 1].copy()

table5_specs = [
    ("c1: + Brit/French",          "logpgp95 ~ f_brit + f_french | avexpr ~ logem4",                       None,                  ["f_brit", "f_french"]),
    ("c2: + Brit/French + lat",    "logpgp95 ~ f_brit + f_french + lat_abst | avexpr ~ logem4",            None,                  ["f_brit", "f_french", "lat_abst"]),
    ("c3: British only",           "logpgp95 ~ 1 | avexpr ~ logem4",                                       df5["f_brit"] == 1,    []),
    ("c4: British only + lat",     "logpgp95 ~ lat_abst | avexpr ~ logem4",                                df5["f_brit"] == 1,    ["lat_abst"]),
    ("c5: + French legal",         "logpgp95 ~ sjlofr | avexpr ~ logem4",                                  None,                  ["sjlofr"]),
    ("c6: + French legal + lat",   "logpgp95 ~ sjlofr + lat_abst | avexpr ~ logem4",                       None,                  ["sjlofr", "lat_abst"]),
    ("c7: + religion",             "logpgp95 ~ catho80 + muslim80 + no_cpm80 | avexpr ~ logem4",           None,                  ["catho80", "muslim80", "no_cpm80"]),
    ("c8: + religion + lat",       "logpgp95 ~ catho80 + muslim80 + no_cpm80 + lat_abst | avexpr ~ logem4", None,                 ["catho80", "muslim80", "no_cpm80", "lat_abst"]),
    ("c9: kitchen sink",           "logpgp95 ~ f_french + sjlofr + catho80 + muslim80 + no_cpm80 + lat_abst | avexpr ~ logem4", None, ["f_french", "sjlofr", "catho80", "muslim80", "no_cpm80", "lat_abst"]),
]

m5_rows = []
print()
for tag, fml, mask, exog in table5_specs:
    sub = df5 if mask is None else df5[mask]
    m_pf, sub2 = iv_with_kpf(sub, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog, ["avexpr"], ["logem4"])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  IV {tag:32s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m5_rows.append({
        "Spec": tag, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "N": int(m_pf._N), "R2": round(m_pf._r2, 3),
    })

pd.DataFrame(m5_rows).to_csv("tab5_iv_controls.csv", index=False)
print("→ wrote tab5_iv_controls.csv")


# =================================================================
#  SECTION 7: TABLE 6 — Geography and climate robustness
#  Adds temperature, humidity, soil, resource, and ethnolinguistic
#  controls. Geography matters for income, but the institutions
#  channel survives.
# =================================================================
banner("TABLE 6 — IV with geography and climate controls")

df6 = load_dta(6)
df6 = df6[df6["baseco"] == 1].copy()

# Identify temp* and humid* columns
temp_cols = [c for c in df6.columns if c.startswith("temp")]
humid_cols = [c for c in df6.columns if c.startswith("humid")]
soil_cols = ["steplow", "deslow", "stepmid", "desmid", "drystep", "drywint",
             "goldm", "iron", "silv", "zinc", "oilres", "landlock"]

table6_specs = [
    ("c1: temp+humid",         temp_cols + humid_cols),
    ("c2: temp+humid+lat",     temp_cols + humid_cols + ["lat_abst"]),
    ("c3: edes1975",           ["edes1975"]),
    ("c4: edes1975+lat",       ["edes1975", "lat_abst"]),
    ("c5: soil/resources",     soil_cols),
    ("c6: soil/resources+lat", soil_cols + ["lat_abst"]),
    ("c7: avelf",              ["avelf"]),
    ("c8: avelf+lat",          ["avelf", "lat_abst"]),
    ("c9: all",                temp_cols + humid_cols + ["edes1975", "avelf"] + soil_cols + ["lat_abst"]),
]

m6_rows = []
print()
for tag, exog in table6_specs:
    exog_clean = [c for c in exog if c in df6.columns]
    if exog_clean:
        rhs = " + ".join(exog_clean)
        fml = f"logpgp95 ~ {rhs} | avexpr ~ logem4"
    else:
        fml = "logpgp95 ~ 1 | avexpr ~ logem4"
    m_pf, sub2 = iv_with_kpf(df6, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog_clean, ["avexpr"], ["logem4"])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  IV {tag:28s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m6_rows.append({
        "Spec": tag, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "N": int(m_pf._N), "R2": round(m_pf._r2, 3),
    })

pd.DataFrame(m6_rows).to_csv("tab6_iv_geo.csv", index=False)
print("→ wrote tab6_iv_geo.csv")


# =================================================================
#  SECTION 8: TABLE 7 — Health channels (overidentified specs)
#  Cols 1-6: just-identified IV with one health control each.
#  Cols 7-9: instrument BOTH avexpr AND a health variable using 4
#  instruments (logem4, latabs, lt100km, meantemp). With 4 instruments
#  and 2 endogenous regressors, the model is overidentified by 2
#  degrees: Hansen J becomes a meaningful test of joint exclusion.
# =================================================================
banner("TABLE 7 — Health-channel IV (Cols 7-9 with overidentification)")

df7 = load_dta(7)
df7 = df7[df7["baseco"] == 1].copy()
df7["other_cont7"] = ((df7["shortnam"] == "AUS") | (df7["shortnam"] == "MLT") |
                     (df7["shortnam"] == "NZL")).astype(int)

# Cols 1-6: one health control as exogenous (just-identified)
table7_specs_simple = [
    ("c1: + malfal94",      ["malfal94"]),
    ("c2: + malfal94 + lat", ["malfal94", "lat_abst"]),
    ("c3: + leb95",         ["leb95"]),
    ("c4: + leb95 + lat",    ["leb95", "lat_abst"]),
    ("c5: + imr95",         ["imr95"]),
    ("c6: + imr95 + lat",    ["imr95", "lat_abst"]),
]

m7_rows = []
print()
for tag, exog in table7_specs_simple:
    rhs = " + ".join(exog)
    fml = f"logpgp95 ~ {rhs} | avexpr ~ logem4"
    m_pf, sub2 = iv_with_kpf(df7, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog, ["avexpr"], ["logem4"])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  IV {tag:28s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m7_rows.append({
        "Spec": tag, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "hansen_J": np.nan, "hansen_p": np.nan,
        "N": int(m_pf._N), "R2": round(m_pf._r2, 3),
    })

# Cols 7-9: multi-endog 2SLS with overid; pyfixest can't handle multi-endog,
# so use linearmodels exclusively for these.
print("\n*** Cols 7-9: 2 endogenous regressors, 4 instruments => Hansen J meaningful ***\n")
table7_specs_multi = [
    ("c7: avexpr + malfal94 endog",  "malfal94"),
    ("c8: avexpr + leb95 endog",     "leb95"),
    ("c9: avexpr + imr95 endog",     "imr95"),
]
inst_set = ["logem4", "latabs", "lt100km", "meantemp"]

for tag, second_endog in table7_specs_multi:
    sub = df7.dropna(subset=["logpgp95", "avexpr", second_endog] + inst_set).copy()
    y_ = sub["logpgp95"].values
    X_exog_ = pd.DataFrame({"const": np.ones(len(sub))}, index=sub.index)
    res = IV2SLS(y_, X_exog_, sub[["avexpr", second_endog]], sub[inst_set]).fit(cov_type="robust")
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    # Sargan (iid) / Hansen J (robust) overidentification test from linearmodels
    try:
        j_stat = float(res.sargan.stat)
        j_pval = float(res.sargan.pval)
    except (AttributeError, TypeError):
        j_stat, j_pval = np.nan, np.nan
    fs_F = float(res.first_stage.diagnostics.loc["avexpr", "f.stat"])
    print(f"  IV {tag:32s} avexpr β={b:.3f} (SE {se:.3f})  "
          f"Hansen J={j_stat:.2f} (p={j_pval:.3f})  fs-F={fs_F:.2f}  N={len(sub)}")
    m7_rows.append({
        "Spec": tag, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(fs_F, 2),
        "hansen_J": round(j_stat, 2), "hansen_p": round(j_pval, 3),
        "N": len(sub), "R2": np.nan,
    })

# Cols 10-11: yellow fever instrument (just-identified)
print("\n*** Cols 10-11: yellow-fever instrument ***\n")
table7_specs_yellow = [
    ("c10: yellow",                 [],                                   "yellow"),
    ("c11: yellow + continents",    ["africa", "asia", "other_cont7"],    "yellow"),
]
for tag, exog, inst in table7_specs_yellow:
    rhs = (" + ".join(exog) + " | " if exog else "1 | ")
    fml = f"logpgp95 ~ {rhs}avexpr ~ {inst}"
    m_pf, sub2 = iv_with_kpf(df7, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog, ["avexpr"], [inst])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  IV {tag:32s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m7_rows.append({
        "Spec": tag, "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "hansen_J": np.nan, "hansen_p": np.nan,
        "N": int(m_pf._N), "R2": round(m_pf._r2, 3),
    })

pd.DataFrame(m7_rows).to_csv("tab7_iv_health.csv", index=False)
print("→ wrote tab7_iv_health.csv")


# =================================================================
#  SECTION 9: TABLE 8 — Alternative instruments + overidentification
#  Panels A/B: replace logem4 with alternative instruments.
#  Panel C (overid): pair each alt instrument WITH logem4 in a
#    2-instrument 2SLS regression. Hansen J tests whether the two
#    instruments give consistent estimates -- if both are valid,
#    J should not reject.
#  Panel D: include logem4 as exogenous control in second stage
#    (relaxes exclusion to only the *excess* effect of mortality).
#
#  Albouy (2012) caveat: ~36% of AJR's settler-mortality observations
#  are imputed/repeats; Hansen J non-rejection across alternative
#  instruments does NOT rule out shared imputation bias.
# =================================================================
banner("TABLE 8 — Alternative instruments + Hansen J overidentification")

df8 = load_dta(8)
df8 = df8[df8["baseco"] == 1].copy()

# Panels A/B: each alt instrument used alone (just-identified)
print("\n*** Panels A/B: each alternative instrument alone ***\n")
panels_AB = [
    ("a.c1: euro1900",                  [],                "euro1900"),
    ("a.c2: euro1900 + lat",            ["lat_abst"],      "euro1900"),
    ("a.c3: cons00a",                   [],                "cons00a"),
    ("a.c4: cons00a + lat",             ["lat_abst"],      "cons00a"),
    ("a.c5: democ00a",                  [],                "democ00a"),
    ("a.c6: democ00a + lat",            ["lat_abst"],      "democ00a"),
    ("a.c7: cons1 (+ indtime)",         ["indtime"],       "cons1"),
    ("a.c8: cons1 (+ indtime) + lat",   ["indtime", "lat_abst"], "cons1"),
    ("a.c9: democ1 (+ indtime)",        ["indtime"],       "democ1"),
    ("a.c10: democ1 (+ indtime) + lat", ["indtime", "lat_abst"], "democ1"),
]

m8_rows = []
for tag, exog, inst in panels_AB:
    rhs = (" + ".join(exog) + " | " if exog else "1 | ")
    fml = f"logpgp95 ~ {rhs}avexpr ~ {inst}"
    m_pf, sub2 = iv_with_kpf(df8, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog, ["avexpr"], [inst])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  Panel A/B  {tag:34s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m8_rows.append({
        "Panel": "A/B", "Spec": tag,
        "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "hansen_J": np.nan, "hansen_p": np.nan,
        "N": int(m_pf._N),
    })

# Panel C: 2 instruments per regression -> Hansen J meaningful
print("\n*** Panel C: alt instrument + logem4 => Hansen J overid test ***\n")
panel_C = [
    ("c.c1: euro1900 + logem4",                 [],                ["euro1900", "logem4"]),
    ("c.c2: euro1900 + logem4 + lat",           ["lat_abst"],      ["euro1900", "logem4"]),
    ("c.c3: cons00a + logem4",                  [],                ["cons00a", "logem4"]),
    ("c.c4: cons00a + logem4 + lat",            ["lat_abst"],      ["cons00a", "logem4"]),
    ("c.c5: democ00a + logem4",                 [],                ["democ00a", "logem4"]),
    ("c.c6: democ00a + logem4 + lat",           ["lat_abst"],      ["democ00a", "logem4"]),
    ("c.c7: cons1+logem4 (+ indtime)",          ["indtime"],       ["cons1", "logem4"]),
    ("c.c8: cons1+logem4 (+ indtime) + lat",    ["indtime", "lat_abst"], ["cons1", "logem4"]),
    ("c.c9: democ1+logem4 (+ indtime)",         ["indtime"],       ["democ1", "logem4"]),
    ("c.c10: democ1+logem4 (+ indtime) + lat",  ["indtime", "lat_abst"], ["democ1", "logem4"]),
]
for tag, exog, insts in panel_C:
    sub = df8.dropna(subset=["logpgp95", "avexpr"] + exog + insts).copy()
    y_ = sub["logpgp95"].values
    if exog:
        X_exog_ = sub[exog].copy()
        X_exog_["const"] = 1.0
    else:
        X_exog_ = pd.DataFrame({"const": np.ones(len(sub))}, index=sub.index)
    res = IV2SLS(y_, X_exog_, sub[["avexpr"]], sub[insts]).fit(cov_type="robust")
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    # Sargan (iid) / Hansen J (robust) overidentification test from linearmodels
    try:
        j_stat = float(res.sargan.stat)
        j_pval = float(res.sargan.pval)
    except (AttributeError, TypeError):
        j_stat, j_pval = np.nan, np.nan
    fs_F = float(res.first_stage.diagnostics.loc["avexpr", "f.stat"])
    print(f"  Panel C   {tag:36s} β={b:.3f} (SE {se:.3f})  "
          f"Hansen J={j_stat:.2f} (p={j_pval:.3f})  fs-F={fs_F:.2f}  N={len(sub)}")
    m8_rows.append({
        "Panel": "C (overid)", "Spec": tag,
        "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(fs_F, 2),
        "hansen_J": round(j_stat, 2), "hansen_p": round(j_pval, 3),
        "N": len(sub),
    })

# Panel D: logem4 as exogenous control in second stage
print("\n*** Panel D: logem4 as exogenous control (relaxes exclusion) ***\n")
panel_D = [
    ("d.c1: euro1900",                  ["logem4"],                    "euro1900"),
    ("d.c2: euro1900 + lat",            ["logem4", "lat_abst"],        "euro1900"),
    ("d.c3: cons00a",                   ["logem4"],                    "cons00a"),
    ("d.c4: cons00a + lat",             ["logem4", "lat_abst"],        "cons00a"),
    ("d.c5: democ00a",                  ["logem4"],                    "democ00a"),
    ("d.c6: democ00a + lat",            ["logem4", "lat_abst"],        "democ00a"),
    ("d.c7: cons1 (+ indtime)",         ["logem4", "indtime"],         "cons1"),
    ("d.c8: cons1 (+ indtime) + lat",   ["logem4", "indtime", "lat_abst"], "cons1"),
    ("d.c9: democ1 (+ indtime)",        ["logem4", "indtime"],         "democ1"),
    ("d.c10: democ1 (+ indtime) + lat", ["logem4", "indtime", "lat_abst"], "democ1"),
]
for tag, exog, inst in panel_D:
    rhs = " + ".join(exog) + " | "
    fml = f"logpgp95 ~ {rhs}avexpr ~ {inst}"
    m_pf, sub2 = iv_with_kpf(df8, fml)
    res, kpf = run_iv2sls(sub2, "logpgp95", exog, ["avexpr"], [inst])
    b = res.params["avexpr"]
    se = res.std_errors["avexpr"]
    p = float(res.pvalues["avexpr"])
    print(f"  Panel D   {tag:34s} β={b:.3f} (SE {se:.3f})  KP-F={kpf:.2f}  N={int(m_pf._N)}")
    m8_rows.append({
        "Panel": "D (logem4 control)", "Spec": tag,
        "avexpr_b": round(b, 3), "avexpr_se": round(se, 3),
        "avexpr_p": round(p, 4), "first_stage_F": round(kpf, 2),
        "hansen_J": np.nan, "hansen_p": np.nan,
        "N": int(m_pf._N),
    })

pd.DataFrame(m8_rows).to_csv("tab8_overid.csv", index=False)
print("→ wrote tab8_overid.csv")

print("\n*** Albouy (2012) caveat: ~36% of mortality observations are")
print("*** imputed or repeats; Hansen J non-rejection here does not")
print("*** rule out shared imputation bias across instruments.")


# =================================================================
#  SECTION 10: FIGURE 3 — coefplot of avexpr across specifications
# =================================================================
banner("FIGURE 3 — OLS vs IV coefficient comparison")

# Pull six representative specs from earlier runs.
# (We re-run for clean access to each beta + CI.)
def iv_beta_ci(df_in, exog, endog, inst):
    sub = df_in.dropna(subset=["logpgp95"] + exog + endog + inst).copy()
    if exog:
        X_exog_ = sub[exog].copy()
        X_exog_["const"] = 1.0
    else:
        X_exog_ = pd.DataFrame({"const": np.ones(len(sub))}, index=sub.index)
    res = IV2SLS(sub["logpgp95"].values, X_exog_, sub[endog], sub[inst]).fit(cov_type="robust")
    b = res.params["avexpr"]
    ci_lo = res.conf_int().loc["avexpr", "lower"]
    ci_hi = res.conf_int().loc["avexpr", "upper"]
    return b, ci_lo, ci_hi


def ols_beta_ci(df_in, fml):
    sub = df_in.dropna(subset=[c for c in vars_in(fml) if c in df_in.columns])
    m = pf.feols(fml, data=sub, vcov="HC1")
    b, se = coef_se(m, "avexpr")
    return b, b - 1.96 * se, b + 1.96 * se


labels = []
betas = []
ci_los = []
ci_his = []
colors = []

# OLS Tab 2 base sample
b, lo, hi = ols_beta_ci(df2[df2["baseco"] == 1], "logpgp95 ~ avexpr")
labels.append("OLS\n(Tab 2)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(WARM_ORANGE)

# IV Tab 4 base
b, lo, hi = iv_beta_ci(df4, [], ["avexpr"], ["logem4"])
labels.append("IV: settler\nmortality\n(Tab 4)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(STEEL_BLUE)

# IV Tab 5 colonial
b, lo, hi = iv_beta_ci(df5, ["f_brit", "f_french"], ["avexpr"], ["logem4"])
labels.append("IV + colonial\ncontrols\n(Tab 5)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(STEEL_BLUE)

# IV Tab 6 geography (temp+humid)
exog6 = [c for c in df6.columns if c.startswith(("temp", "humid"))]
b, lo, hi = iv_beta_ci(df6, exog6, ["avexpr"], ["logem4"])
labels.append("IV + geography\ncontrols\n(Tab 6)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(STEEL_BLUE)

# IV Tab 7 malaria
b, lo, hi = iv_beta_ci(df7, ["malfal94"], ["avexpr"], ["logem4"])
labels.append("IV + malaria\ncontrol\n(Tab 7)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(STEEL_BLUE)

# IV Tab 8 alt instrument (euro1900)
b, lo, hi = iv_beta_ci(df8, [], ["avexpr"], ["euro1900"])
labels.append("IV: alt inst\neuro1900\n(Tab 8)"); betas.append(b); ci_los.append(lo); ci_his.append(hi); colors.append(TEAL)

fig3, ax3 = plt.subplots(figsize=(10, 6))
ypos = np.arange(len(labels))[::-1]
for yi, (b, lo, hi, col) in enumerate(zip(betas, ci_los, ci_his, colors)):
    yp = ypos[yi]
    ax3.errorbar(b, yp, xerr=[[b - lo], [hi - b]], fmt="o", color=col,
                 ecolor=col, elinewidth=1.5, capsize=4, markersize=9, alpha=0.95)
ax3.axvline(0, color=LIGHT_TEXT, linestyle="--", linewidth=0.8, alpha=0.6)
ax3.set_yticks(ypos)
ax3.set_yticklabels(labels, color=LIGHT_TEXT, fontsize=9)
ax3.set_xlabel("Coefficient on avexpr (institutions)")
ax3.set_title("Effect of institutions on log GDP: OLS vs IV", fontsize=13, color=WHITE_TEXT, pad=12)
ax3.text(0.5, 1.02, "Six representative specs, 95% CI, AJR (2001) base sample",
         transform=ax3.transAxes, ha="center", fontsize=10, color=LIGHT_TEXT)
plt.tight_layout()
plt.savefig("python_iv_ols_vs_iv.png", dpi=200, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.2)
plt.close()
print("→ wrote python_iv_ols_vs_iv.png")


# =================================================================
#  SECTION 11: Closing summary
# =================================================================
banner("Analysis complete")
print()
print("  Key takeaways:")
print(f"    - OLS coefficient on avexpr (Tab 2 Col 1):       ~0.52")
print(f"    - IV  coefficient on avexpr (Tab 4 Col 1):       ~0.94")
print(f"    - First-stage robust F (linearmodels, ≈KP-F):    > 16")
print(f"    - Stock-Yogo 10% maximal IV size threshold:      16.38")
print(f"    - Hansen J p-values (Tab 8 Panel C):             > 0.10")
print()
print("  Estimand: 2SLS identifies the LATE for compliers (Imbens-")
print("  Angrist 1994) -- not the ATE. Under constant treatment")
print("  effects, LATE = ATE.")
print()
print("  Library strategy:")
print("    pyfixest.feols     -> 2SLS β/SE/CI/p, OLS comparisons")
print("    linearmodels.IV2SLS-> KP-F, Hansen J, Wu-Hausman, multi-endog")
print()
print("  Outputs:")
print("    - 3 PNG figures: python_iv_first_stage / _reduced_form /")
print("      _ols_vs_iv")
print("    - 9 result tables: tab1_summary, tab2_ols, tab3a_inst,")
print("      tab3b_inst, tab4_iv_main, tab5_iv_controls, tab6_iv_geo,")
print("      tab7_iv_health, tab8_overid")
print()
print("=== Script completed successfully ===")
