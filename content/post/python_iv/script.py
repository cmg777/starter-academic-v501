"""Auto-generated from index.md for Quarto bundle on 2026-05-20.
Review before publication; this was extracted without execution."""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pyfixest as pf
import warnings
from linearmodels.iv import IV2SLS


# %% Section 1: 2. Setup and dependencies
# pip install pyfixest linearmodels pandas numpy matplotlib

warnings.filterwarnings("ignore")

np.random.seed(42)


# %% Section 2: 2. Setup and dependencies
# Site color palette (dark theme)
STEEL_BLUE  = "#6a9bcc"
WARM_ORANGE = "#d97757"
TEAL        = "#00d4c8"
DARK_NAVY   = "#0f1729"
GRID_LINE   = "#1f2b5e"
LIGHT_TEXT  = "#c8d0e0"
WHITE_TEXT  = "#e8ecf2"

plt.rcParams.update({
    "figure.facecolor": DARK_NAVY,
    "axes.facecolor":   DARK_NAVY,
    "axes.labelcolor":  LIGHT_TEXT,
    "axes.titlecolor":  WHITE_TEXT,
    "axes.grid":        True,
    "grid.color":       GRID_LINE,
    "xtick.color":      LIGHT_TEXT,
    "ytick.color":      LIGHT_TEXT,
    "text.color":       WHITE_TEXT,
})

# Data-loading mode: True = GitHub raw URL (replicable), False = local folder
USE_GITHUB = True
DATA_URL = (
    "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv"
    if USE_GITHUB
    else "../stata_iv"
)


# %% Section 3: 3. Data overview
df1 = pd.read_stata(f"{DATA_URL}/maketable1.dta")

print("*** Whole world ***")
print(df1[["logpgp95", "avexpr", "euro1900"]].describe().T)

print("*** AJR base sample (baseco==1) ***")
base = df1[df1["baseco"] == 1]
print(base[["logpgp95", "avexpr", "euro1900", "logem4"]].describe().T)

base_summary = base[["logpgp95", "loghjypl", "avexpr", "cons00a", "cons1",
                     "democ00a", "euro1900", "logem4"]].describe().T
base_summary[["count", "mean", "std", "min", "max"]].to_csv("tab1_summary.csv")


# %% Section 4: 4. The naive OLS benchmark (Table 2)
df2 = pd.read_stata(f"{DATA_URL}/maketable2.dta")

m_full  = pf.feols("logpgp95 ~ avexpr",                                    data=df2,                       vcov="HC1")
m_base  = pf.feols("logpgp95 ~ avexpr",                                    data=df2[df2["baseco"] == 1],   vcov="HC1")
m_lat   = pf.feols("logpgp95 ~ avexpr + lat_abst",                         data=df2,                       vcov="HC1")
m_cont  = pf.feols("logpgp95 ~ avexpr + lat_abst + africa + asia + other", data=df2,                       vcov="HC1")

for name, m in [("Col 1: Full",        m_full),
                ("Col 2: Base",        m_base),
                ("Col 3: +Latitude",   m_lat),
                ("Col 4: +Continents", m_cont)]:
    b, se = m.coef()["avexpr"], m.se()["avexpr"]
    print(f"{name:24s}  avexpr = {b:.3f}  (SE {se:.3f})  N = {int(m._N)}")


# %% Section 5: 5. The first stage and the reduced form (Table 3 and Figures 1–2)
df4 = pd.read_stata(f"{DATA_URL}/maketable4.dta")
base = df4[df4["baseco"] == 1].dropna(subset=["logpgp95", "avexpr", "logem4"])

# linearmodels.IV2SLS gives the canonical Kleibergen-Paap-style first-stage F
y       = base["logpgp95"].values
X_endog = base[["avexpr"]]
X_exog  = pd.DataFrame({"const": np.ones(len(base))}, index=base.index)
Z       = base[["logem4"]]
res = IV2SLS(y, X_exog, X_endog, Z).fit(cov_type="robust")

fs_F   = float(res.first_stage.diagnostics.loc["avexpr", "f.stat"])
fs_pv  = float(res.first_stage.diagnostics.loc["avexpr", "f.pval"])
print(f"First-stage robust F (~Kleibergen-Paap):  {fs_F:.2f}  (p = {fs_pv:.2e})")
print(f"Stock-Yogo 10% maximal IV size threshold:  16.38 (IID)")


# %% Section 6: 5. The first stage and the reduced form (Table 3 and Figures 1–2)
fig, ax = plt.subplots(figsize=(10, 6.5))
ax.scatter(base["logem4"], base["avexpr"], color=STEEL_BLUE, s=28, alpha=0.85)
for x_, y_, lab in zip(base["logem4"], base["avexpr"], base["shortnam"]):
    ax.annotate(lab, (x_, y_), xytext=(4, 2), textcoords="offset points",
                fontsize=6, color=TEAL, alpha=0.8)
slope = res.first_stage.individual["avexpr"].params["logem4"]
intercept = res.first_stage.individual["avexpr"].params["const"]
xfit = np.linspace(base["logem4"].min(), base["logem4"].max(), 100)
ax.plot(xfit, intercept + slope * xfit, color=WARM_ORANGE, linewidth=2.2)
ax.set_title("Figure 1. First stage: settler mortality predicts institutions")
ax.set_xlabel("Log settler mortality (logem4)")
ax.set_ylabel("Avg. protection from expropriation (avexpr)")
plt.savefig("python_iv_first_stage.png", dpi=200, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY)


# %% Section 7: 6. The main 2SLS estimate (Table 4)
# pyfixest: the structural 2SLS estimate (β, SE, CI)
m_iv = pf.feols("logpgp95 ~ 1 | avexpr ~ logem4", data=base, vcov="HC1")
b_pf, se_pf = m_iv.coef()["avexpr"], m_iv.se()["avexpr"]
print(f"pyfixest IV β = {b_pf:.4f}  (SE {se_pf:.4f})")

# linearmodels: the same β + Kleibergen-Paap-style first-stage F + Wu-Hausman
res = IV2SLS(base["logpgp95"], X_exog, base[["avexpr"]],
             base[["logem4"]]).fit(cov_type="robust")
ci = res.conf_int().loc["avexpr"]
dwh = res.wu_hausman()
print(f"linearmodels IV β = {res.params['avexpr']:.4f}  (SE {res.std_errors['avexpr']:.4f})")
print(f"95% CI: [{ci['lower']:.3f}, {ci['upper']:.3f}]")
print(f"First-stage robust F (~KP): {fs_F:.2f}")
print(f"Wu-Hausman endogeneity F = {dwh.stat:.3f}, p = {dwh.pval:.4f}")


# %% Section 8: 7. Robustness 1: colonial, legal, and religious controls (Table 5)
df5 = pd.read_stata(f"{DATA_URL}/maketable5.dta")
df5 = df5[df5["baseco"] == 1]

m5_brit  = pf.feols("logpgp95 ~ f_brit + f_french | avexpr ~ logem4",                       data=df5, vcov="HC1")
m5_legal = pf.feols("logpgp95 ~ sjlofr | avexpr ~ logem4",                                  data=df5, vcov="HC1")
m5_relig = pf.feols("logpgp95 ~ catho80 + muslim80 + no_cpm80 | avexpr ~ logem4",           data=df5, vcov="HC1")

for name, m in [("Col 1: +Brit/French", m5_brit),
                ("Col 5: +Legal",       m5_legal),
                ("Col 7: +Religion",    m5_relig)]:
    b, se = m.coef()["avexpr"], m.se()["avexpr"]
    print(f"{name:25s} avexpr = {b:.3f} (SE {se:.3f}) N = {int(m._N)}")


# %% Section 9: 8. Robustness 2: geography and climate (Table 6)
df6 = pd.read_stata(f"{DATA_URL}/maketable6.dta")
df6 = df6[df6["baseco"] == 1]
temp_humid = [c for c in df6.columns if c.startswith(("temp", "humid"))]

m6_climate = pf.feols(f"logpgp95 ~ {' + '.join(temp_humid)} | avexpr ~ logem4", data=df6, vcov="HC1")
m6_avelf   = pf.feols("logpgp95 ~ avelf | avexpr ~ logem4",                     data=df6, vcov="HC1")

for name, m in [("Col 1: +Climate", m6_climate),
                ("Col 7: +Ethnic frag (avelf)", m6_avelf)]:
    b, se = m.coef()["avexpr"], m.se()["avexpr"]
    print(f"{name:30s} avexpr = {b:.3f} (SE {se:.3f}) N = {int(m._N)}")


# %% Section 10: 9. Robustness 3: the trickiest case — health channels (Table 7)
df7 = pd.read_stata(f"{DATA_URL}/maketable7.dta")
df7 = df7[df7["baseco"] == 1]

# Cols 1, 3, 5: just-identified, single endog (pyfixest works fine)
m7_mal = pf.feols("logpgp95 ~ malfal94 | avexpr ~ logem4", data=df7, vcov="HC1")
m7_leb = pf.feols("logpgp95 ~ leb95    | avexpr ~ logem4", data=df7, vcov="HC1")
m7_imr = pf.feols("logpgp95 ~ imr95    | avexpr ~ logem4", data=df7, vcov="HC1")

# Cols 7-9: 2 endog, 4 instruments => Hansen J meaningful (linearmodels only)
sub = df7.dropna(subset=["logpgp95", "avexpr", "malfal94", "logem4",
                          "latabs", "lt100km", "meantemp"])
X_exog = pd.DataFrame({"const": np.ones(len(sub))}, index=sub.index)
res_overid = IV2SLS(
    sub["logpgp95"], X_exog,
    sub[["avexpr", "malfal94"]],
    sub[["logem4", "latabs", "lt100km", "meantemp"]],
).fit(cov_type="robust")
print(f"Col 7 avexpr: β = {res_overid.params['avexpr']:.3f} "
      f"(SE {res_overid.std_errors['avexpr']:.3f})")
print(f"Sargan/Hansen J = {res_overid.sargan.stat:.2f}, p = {res_overid.sargan.pval:.3f}")


# %% Section 11: 10. Overidentification and alternative instruments (Table 8)
df8 = pd.read_stata(f"{DATA_URL}/maketable8.dta")
df8 = df8[df8["baseco"] == 1]

# Panel C: 2 instruments per regression -> Hansen J meaningful
def panel_C(alt_inst, exog=None):
    cols = ["logpgp95", "avexpr", "logem4", alt_inst] + (exog or [])
    sub = df8.dropna(subset=cols)
    X_exog = sub[exog].assign(const=1.0) if exog else pd.DataFrame(
        {"const": np.ones(len(sub))}, index=sub.index)
    res = IV2SLS(sub["logpgp95"], X_exog, sub[["avexpr"]],
                 sub[["logem4", alt_inst]]).fit(cov_type="robust")
    return res.params["avexpr"], res.sargan.stat, res.sargan.pval

for inst in ["euro1900", "cons00a", "democ00a"]:
    b, j, p = panel_C(inst)
    print(f"Panel C with {inst:12s}: β = {b:.3f}  Hansen J = {j:.2f} (p = {p:.3f})")

# Panel D: logem4 as exogenous control, alt instrument identifies
def panel_D(alt_inst):
    sub = df8.dropna(subset=["logpgp95", "avexpr", "logem4", alt_inst])
    return pf.feols(f"logpgp95 ~ logem4 | avexpr ~ {alt_inst}", data=sub, vcov="HC1")

for inst in ["euro1900", "cons00a", "democ00a"]:
    m = panel_D(inst)
    print(f"Panel D with {inst:12s}: β = {m.coef()['avexpr']:.3f}")


# %% Section 12: 11. The visual summary: OLS vs IV across specifications (Figure 3)
def iv_b_ci(df_, exog, endog, inst):
    sub = df_.dropna(subset=["logpgp95"] + exog + endog + inst)
    X_e = sub[exog].assign(const=1.0) if exog else pd.DataFrame(
        {"const": np.ones(len(sub))}, index=sub.index)
    r = IV2SLS(sub["logpgp95"], X_e, sub[endog], sub[inst]).fit(cov_type="robust")
    return r.params["avexpr"], r.conf_int().loc["avexpr"]

specs = [
    ("OLS (Tab 2)",             None,                       None,           None,          WARM_ORANGE),
    ("IV: settler mortality",   df4,                        [],             ["logem4"],    STEEL_BLUE),
    ("IV + colonial controls",  df5,                        ["f_brit", "f_french"], ["logem4"], STEEL_BLUE),
    ("IV + geography controls", df6,                        temp_humid,     ["logem4"],    STEEL_BLUE),
    ("IV + malaria control",    df7,                        ["malfal94"],   ["logem4"],    STEEL_BLUE),
    ("IV: alt inst euro1900",   df8,                        [],             ["euro1900"],  TEAL),
]
# ... (build error-bar plot, save as python_iv_ols_vs_iv.png)
