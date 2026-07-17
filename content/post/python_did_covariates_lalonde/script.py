"""
Title:   Covariates in Difference-in-Differences — the LaLonde test in Python
Description:
    Reproduces Scott Cunningham's "Covariates, diff in diff and LaLonde test"
    (Scott's Mixtape Substack, 2026) in Python. On the LaLonde/Dehejia-Wahba
    non-experimental panel (185 NSW trainees + 15,992 CPS controls) we estimate
    the ATT of a job-training program eight different ways and compare each to the
    experimental benchmark of ~$1,794. The lesson: covariates rescue a
    difference-in-differences estimate ONLY when they enter the control group's
    counterfactual *trend* (X x post or first-difference saturation), not when
    they enter additively (the level) or interact only with treatment (the effect).

Estimators:
    Spec 0  Naive TWFE (no covariates)                 -> ~3,621   inert
    Spec A  Additive X (X in the level)                -> ~3,621   inert
    Spec BT X x treatment (levels; X in the effect)    -> ~3,621   inert
    Spec B  X x post (X x time; X in the trend)        -> ~1,711   corrected
    Spec C  Saturated FD (D x X) = HIT (1997)          -> ~1,770   corrected
    HIT     Heckman-Ichimura-Todd by hand              -> ~1,770   corrected
    IPW     Abadie (2005) by hand                      -> ~1,861   propensity
    DR      Sant'Anna & Zhao (2020) by hand            -> ~1,993   propensity

Regressions use pyfixest (HC1 robust SE = Stata ", robust"). IPW/DR are hand-coded
so they reproduce identically across languages. Spec BT / C / IPW / DR standard
errors are id-cluster bootstrap (199 reps, seed 90210). diff-diff (igerber) is
run as a package sanity check.

Usage:   python script.py
Outputs: 5 PNG figures, lalonde_results.csv, lalonde_results.md,
         did_covariates_lalonde_estimates.json (web-app data)
References:
    Cunningham (2026) https://causalinf.substack.com/p/covariates-diff-in-diff-and-lalonde
    LaLonde (1986, AER); Dehejia & Wahba (2002, REStat); Heckman-Ichimura-Todd
    (1997, REStud); Abadie (2005, REStud); Sant'Anna & Zhao (2020, J. Econometrics)
"""

import json
import warnings

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pyfixest as pf

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
RANDOM_SEED = 90210          # matches Scott's `set seed 90210`
N_BOOT = 199                 # bootstrap replications (matches the do-file)
BENCHMARK = 1794.0           # experimental ATT (Dehejia-Wahba); forest-plot line

# Canonical LaLonde covariate set (has agecube; no re75/u75)
XVARS = ["age", "agesq", "agecube", "educ", "educsq",
         "marr", "nodegree", "black", "hisp", "re74", "u74"]
XF = " + ".join(XVARS)

# Site palette
STEEL_BLUE = "#6a9bcc"       # trend-corrected specs
WARM_ORANGE = "#d97757"      # benchmark line
NEAR_BLACK = "#141413"
TEAL = "#00a89e"             # propensity specs (site teal #00d4c8, darkened for ink)
GREY = "#9aa0a6"             # inert specs
GROUP_COLORS = {"inert": GREY, "corrected": STEEL_BLUE, "propensity": TEAL}
GROUP_MARKERS = {"inert": "o", "corrected": "D", "propensity": "s"}

plt.rcParams.update({
    "figure.dpi": 110, "savefig.dpi": 300, "font.size": 11,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.edgecolor": "#555555", "axes.titlesize": 13, "axes.titleweight": "bold",
})


# ---------------------------------------------------------------------------
# 1. Data construction
# ---------------------------------------------------------------------------
def load_data():
    """Build the LaLonde-DW non-experimental sample and its 2-period panel.

    Non-experimental sample = 185 NSW *treated* + 15,992 CPS controls.
    The 260 NSW experimental controls are held out for the benchmark only.
    """
    from causaldata import nsw_mixtape, cps_mixtape

    nsw = nsw_mixtape.load_pandas().data          # 445 rows: 185 treated + 260 ctrl
    cps = cps_mixtape.load_pandas().data          # 15,992 CPS controls (treat=0)

    wide = pd.concat([nsw[nsw.treat == 1].copy(), cps], ignore_index=True)
    wide["ever_treated"] = wide["treat"].astype(int)
    wide["id"] = np.arange(len(wide))
    wide = add_covariates(wide)
    wide["dy"] = wide["re78"] - wide["re75"]       # first difference (pre=75, post=78)

    # Long 2-period panel: post=0 -> re75, post=1 -> re78
    pre = wide.assign(re=wide["re75"], post=0.0)
    post = wide.assign(re=wide["re78"], post=1.0)
    keep = ["id", "ever_treated", "re", "post"] + XVARS
    panel = pd.concat([pre, post], ignore_index=True)[keep]

    # Experimental benchmark frame (185 treated vs 260 experimental controls)
    exp = nsw.copy()
    for c in ["re74", "re75", "re78"]:
        exp[c] = exp[c].astype(float)
    exp = add_covariates(exp)

    return wide, panel, exp


def add_covariates(df):
    """Construct the time-invariant baseline covariates as floats."""
    df = df.copy()
    for c in ["age", "educ", "marr", "nodegree", "black", "hisp",
              "re74", "re75", "re78", "treat"]:
        if c in df.columns:
            df[c] = df[c].astype(float)
    df["agesq"] = df["age"] ** 2
    df["agecube"] = df["age"] ** 3
    df["educsq"] = df["educ"] ** 2
    df["u74"] = (df["re74"] == 0).astype(float)    # unemployed in 1974
    return df


def att_from_interaction(fit):
    """Pull the post x ever_treated DiD coefficient + HC1 SE from a pyfixest fit."""
    td = fit.tidy()
    key = [k for k in td.index
           if "post" in k.lower() and "ever_treated" in k.lower()][0]
    return float(td.loc[key, "Estimate"]), float(td.loc[key, "Std. Error"])


# ---------------------------------------------------------------------------
# 2. Fast numpy estimators (used for point estimates cross-check + bootstrap)
# ---------------------------------------------------------------------------
def _ols(Xmat, y):
    beta, *_ = np.linalg.lstsq(Xmat, y, rcond=None)
    return beta


def estimators_from_wide(wd):
    """All g-computation / by-hand ATTs from a wide (one-row-per-unit) frame.

    Returns a dict for Spec BT, Spec C, HIT, IPW, DR. Formulas mirror the
    reference do-file/R script line-for-line.
    """
    D = wd["ever_treated"].values.astype(float)
    Xm = wd[XVARS].values.astype(float)
    dy = wd["dy"].values.astype(float)
    n = len(wd)
    ones = np.ones(n)
    p = D.mean()
    k = len(XVARS)

    # -- Spec C: dy ~ [1, X, D*X, D]; ATT = mean_{treated}(beta_D + X @ beta_DX) --
    Dc = np.column_stack([ones, Xm, D[:, None] * Xm, D])
    bC = _ols(Dc, dy)
    bDX, bD = bC[1 + k:1 + 2 * k], bC[-1]
    attC = float(np.mean((bD + Xm @ bDX)[D == 1]))

    # -- Outcome regression on CONTROLS only: dy ~ [1, X] (used by HIT and DR) --
    Xc = np.column_stack([ones, Xm])
    ctrl = D == 0
    bOR = _ols(Xc[ctrl], dy[ctrl])
    dyhat = Xc @ bOR
    attHIT = float(np.mean((dy - dyhat)[D == 1]))

    # -- IPW (Abadie 2005): un-normalized ATT weights --
    phat = sm.Logit(D, Xc).fit(disp=0, maxiter=200).predict(Xc)
    w_ipw = (D - phat) / (1 - phat) / p
    attIPW = float(np.mean(w_ipw * dy))

    # -- DR (Sant'Anna-Zhao 2020): OR on controls + IPW-weighted residual --
    dr_t = np.mean(D * (dy - dyhat) / p)
    dr_c = np.mean((1 - D) * (phat / (1 - phat)) * (dy - dyhat) / p)
    attDR = float(dr_t - dr_c)

    # -- Spec BT: levels panel, X x treatment-switch T; ATT over treated-post --
    y = np.concatenate([wd["re75"].values, wd["re78"].values]).astype(float)
    post = np.concatenate([np.zeros(n), np.ones(n)])
    Dd = np.concatenate([D, D])
    Xx = np.vstack([Xm, Xm])
    T = post * Dd
    des = np.column_stack([ones.repeat(2)[:2 * n], post, Dd, T, Xx, T[:, None] * Xx])
    bBT = _ols(des, y)
    bT, bTX = bBT[3], bBT[4 + k:4 + 2 * k]
    attBT = float(bT + np.mean(Xm[D == 1] @ bTX))

    return {"BT": attBT, "C": attC, "HIT": attHIT, "IPW": attIPW, "DR": attDR}


def cluster_bootstrap(wide, reps=N_BOOT, seed=RANDOM_SEED):
    """id-cluster bootstrap SE for the g-computation / by-hand estimators.

    Each unit is its own cluster (one row per unit in `wide`), so we resample
    units with replacement and re-estimate everything, refitting the propensity
    logit inside each draw. Non-convergent draws are skipped and counted.
    """
    rng = np.random.default_rng(seed)
    n = len(wide)
    keys = ["BT", "C", "HIT", "IPW", "DR"]
    draws = {k: [] for k in keys}
    fails = 0
    for _ in range(reps):
        idx = rng.integers(0, n, size=n)
        try:
            est = estimators_from_wide(wide.iloc[idx])
            for k in keys:
                draws[k].append(est[k])
        except Exception:
            fails += 1
    se = {k: float(np.std(draws[k], ddof=1)) for k in keys}
    return se, fails


# ---------------------------------------------------------------------------
# 3. Run all specifications
# ---------------------------------------------------------------------------
def run_all(wide, panel, exp):
    res = {}

    # Experimental benchmark: re78 ~ treat on the 445-row experimental sample
    bxs = pf.feols("re78 ~ treat", data=exp, vcov="HC1").tidy()
    res["benchmark_xs"] = float(bxs.loc["treat", "Estimate"])
    res["benchmark_xs_se"] = float(bxs.loc["treat", "Std. Error"])
    exp_dy = exp.assign(dy=exp["re78"] - exp["re75"])
    bdd = pf.feols("dy ~ treat", data=exp_dy, vcov="HC1").tidy()
    res["benchmark_did"] = float(bdd.loc["treat", "Estimate"])

    # Spec 0 / A / B via pyfixest (direct DiD coefficient, HC1)
    res["s0"], res["s0_se"] = att_from_interaction(
        pf.feols("re ~ post * ever_treated", data=panel, vcov="HC1"))
    res["sA"], res["sA_se"] = att_from_interaction(
        pf.feols(f"re ~ post * ever_treated + {XF}", data=panel, vcov="HC1"))
    post_ints = " + ".join(f"post:{x}" for x in XVARS)
    res["sB"], res["sB_se"] = att_from_interaction(pf.feols(
        f"re ~ post * ever_treated + {XF} + {post_ints}", data=panel, vcov="HC1"))

    # Spec BT / C via pyfixest g-computation (predict with the switch on/off)
    res["sBT"] = _gcomp_BT(panel)
    res["sC"] = _gcomp_C(wide)

    # HIT / IPW / DR by hand (numpy formulas) — the reported point estimates
    hand = estimators_from_wide(wide)
    res["hit"], res["ipw"], res["dr"] = hand["HIT"], hand["IPW"], hand["DR"]

    # Internal consistency: numpy BT/C must equal the pyfixest g-computation
    assert abs(hand["BT"] - res["sBT"]) < 1.0, (hand["BT"], res["sBT"])
    assert abs(hand["C"] - res["sC"]) < 1.0, (hand["C"], res["sC"])

    # Bootstrap SEs for BT / C / HIT / IPW / DR
    se, fails = cluster_bootstrap(wide)
    res["sBT_se"], res["sC_se"] = se["BT"], se["C"]
    res["hit_se"], res["ipw_se"], res["dr_se"] = se["HIT"], se["IPW"], se["DR"]
    res["boot_fails"] = fails

    return res


def _gcomp_BT(panel):
    """Spec BT ATT via pyfixest predict: mean over treated-post of yhat(T=1)-yhat(T=0)."""
    d = panel.copy()
    d["T"] = d["post"] * d["ever_treated"]
    T_ints = " + ".join(f"T:{x}" for x in XVARS)
    fit = pf.feols(f"re ~ post + ever_treated + T + {XF} + {T_ints}", data=d, vcov="HC1")
    tau = fit.predict(newdata=d.assign(T=1.0)) - fit.predict(newdata=d.assign(T=0.0))
    mask = ((d["ever_treated"] == 1) & (d["post"] == 1)).values
    assert not np.isnan(tau).any()
    return float(np.mean(tau[mask]))


def _gcomp_C(wide):
    """Spec C ATT via pyfixest predict on the first-differenced outcome."""
    D_ints = " + ".join(f"ever_treated:{x}" for x in XVARS)
    fit = pf.feols(f"dy ~ {XF} + {D_ints} + ever_treated", data=wide, vcov="HC1")
    tau = (fit.predict(newdata=wide.assign(ever_treated=1.0))
           - fit.predict(newdata=wide.assign(ever_treated=0.0)))
    assert not np.isnan(tau).any()
    return float(np.mean(tau[wide["ever_treated"].values == 1]))


# ---------------------------------------------------------------------------
# 4. diff-diff cross-check
# ---------------------------------------------------------------------------
def diff_diff_crosscheck(panel):
    """Package sanity check with igerber/diff-diff (naive, covariate, DR)."""
    from diff_diff import DifferenceInDifferences, CallawaySantAnna
    out = {}

    naive = DifferenceInDifferences(cluster="id", seed=RANDOM_SEED).fit(
        panel, outcome="re", treatment="ever_treated", time="post", unit="id")
    out["dd_naive"] = (float(naive.att), float(naive.se))

    cov = DifferenceInDifferences(cluster="id", seed=RANDOM_SEED).fit(
        panel, outcome="re", treatment="ever_treated", time="post", unit="id",
        covariates=XVARS)
    out["dd_cov"] = (float(cov.att), float(cov.se))

    try:  # Callaway-Sant'Anna doubly-robust (single cohort, 2 periods)
        cs_df = panel.copy()
        cs_df["first_treat"] = np.where(cs_df["ever_treated"] == 1, 1, 0)
        cs = CallawaySantAnna(estimation_method="dr", control_group="never_treated",
                              seed=RANDOM_SEED).fit(
            cs_df, outcome="re", unit="id", time="post", first_treat="first_treat",
            covariates=XVARS)
        att = getattr(cs, "att", None)
        if att is None and hasattr(cs, "overall_att"):
            att = cs.overall_att
        se = getattr(cs, "se", np.nan)
        out["dd_dr"] = (float(np.atleast_1d(att)[0]), float(np.atleast_1d(se)[0]))
    except Exception as e:
        out["dd_dr"] = None
        out["dd_dr_error"] = str(e)
    return out


# ---------------------------------------------------------------------------
# 5. Assemble results table
# ---------------------------------------------------------------------------
def build_table(res):
    rows = [
        ("0",  "No covariates (naive TWFE)", res["s0"],  res["s0_se"],  "inert",      "pyfixest (HC1)"),
        ("A",  "Additive X (level)",          res["sA"],  res["sA_se"],  "inert",      "pyfixest (HC1)"),
        ("BT", "X x treatment (effect)",       res["sBT"], res["sBT_se"], "inert",      "pyfixest g-comp / boot"),
        ("B",  "X x post (trend)",             res["sB"],  res["sB_se"],  "corrected",  "pyfixest (HC1)"),
        ("C",  "Saturated FD = HIT",           res["sC"],  res["sC_se"],  "corrected",  "pyfixest g-comp / boot"),
        ("-",  "HIT by hand (1997)",           res["hit"], res["hit_se"], "corrected",  "by hand / boot"),
        ("-",  "IPW (Abadie 2005)",            res["ipw"], res["ipw_se"], "propensity", "by hand / boot"),
        ("-",  "DR (Sant'Anna-Zhao 2020)",     res["dr"],  res["dr_se"],  "propensity", "by hand / boot"),
    ]
    df = pd.DataFrame(rows, columns=["spec", "estimator", "att", "se", "class", "source"])
    df["ci_low"] = df["att"] - 1.96 * df["se"]
    df["ci_high"] = df["att"] + 1.96 * df["se"]
    df["gap_vs_benchmark"] = df["att"] - BENCHMARK
    return df


# ---------------------------------------------------------------------------
# 6. Figures
# ---------------------------------------------------------------------------
def fig_balance(wide, exp):
    """Fig 1 — standardized mean differences: treated vs CPS vs experimental control."""
    treated = wide[wide.ever_treated == 1]
    cps = wide[wide.ever_treated == 0]
    exp_ctrl = exp[exp.treat == 0]
    show = ["age", "educ", "black", "hisp", "marr", "nodegree", "re74", "re75", "u74"]
    labels = {"age": "Age", "educ": "Education", "black": "Black", "hisp": "Hispanic",
              "marr": "Married", "nodegree": "No degree", "re74": "Earnings 1974",
              "re75": "Earnings 1975", "u74": "Unemployed 1974"}

    def smd(a, b, col):
        va, vb = a[col].var(), b[col].var()
        s = np.sqrt((va + vb) / 2)
        return 0.0 if s == 0 else (a[col].mean() - b[col].mean()) / s

    d_cps = [smd(treated, cps, c) for c in show]
    d_exp = [smd(treated, exp_ctrl, c) for c in show]
    y = np.arange(len(show))

    fig, ax = plt.subplots(figsize=(8.2, 5.0))
    ax.axvline(0, color="#888", lw=1)
    for x in (0.1, 0.25):
        ax.axvline(x, color="#ccc", ls=":", lw=1)
        ax.axvline(-x, color="#ccc", ls=":", lw=1)
    ax.scatter(d_cps, y + 0.14, s=90, color=WARM_ORANGE, zorder=3,
               label="Treated vs CPS controls (observational)")
    ax.scatter(d_exp, y - 0.14, s=90, color=STEEL_BLUE, zorder=3,
               label="Treated vs experimental controls (RCT)")
    for yi, xc, xe in zip(y, d_cps, d_exp):
        ax.plot([0, xc], [yi + 0.14, yi + 0.14], color=WARM_ORANGE, lw=2, zorder=2)
        ax.plot([0, xe], [yi - 0.14, yi - 0.14], color=STEEL_BLUE, lw=2, zorder=2)
    ax.set_yticks(y)
    ax.set_yticklabels([labels[c] for c in show])
    ax.set_xlabel("Standardized mean difference (treated minus control)")
    ax.set_title("Covariate imbalance: CPS controls are far from the trainees,\n"
                 "the randomized controls are not")
    ax.legend(loc="lower right", frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig("did_covariates_lalonde_balance.png", bbox_inches="tight")
    plt.close(fig)


def fig_trends(wide, exp):
    """Fig 2 — mean earnings 1974/75/78 by group: non-parallel raw trends."""
    years = [1974, 1975, 1978]
    cols = ["re74", "re75", "re78"]
    treated = wide[wide.ever_treated == 1][cols].mean().values
    cps = wide[wide.ever_treated == 0][cols].mean().values
    exp_ctrl = exp[exp.treat == 0][cols].mean().values

    fig, ax = plt.subplots(figsize=(8.2, 5.0))
    ax.plot(years, treated, "-o", color=WARM_ORANGE, lw=2.5, ms=8, label="NSW trainees (treated)")
    ax.plot(years, cps, "-s", color=NEAR_BLACK, lw=2.5, ms=8, label="CPS controls (observational)")
    ax.plot(years, exp_ctrl, "-D", color=STEEL_BLUE, lw=2.5, ms=8, label="Experimental controls (RCT)")
    ax.axvspan(1975, 1978, color="#f4f4f2", zorder=0)
    ax.set_xticks(years)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, p: f"${v:,.0f}"))
    ax.set_ylabel("Mean real earnings")
    ax.set_xlabel("Year")
    ax.set_title("Raw earnings trends: the CPS control sits on a different path\n"
                 "than the trainees — the randomized control does not")
    ax.legend(loc="center left", bbox_to_anchor=(0.02, 0.55), frameon=False, fontsize=9)
    ax.annotate("DiD window\n(pre 1975 -> post 1978)", xy=(1976.5, ax.get_ylim()[0]),
                xytext=(1976.5, ax.get_ylim()[0] + 0.06 * (ax.get_ylim()[1] - ax.get_ylim()[0])),
                ha="center", fontsize=8, color="#777")
    fig.tight_layout()
    fig.savefig("did_covariates_lalonde_trends.png", bbox_inches="tight")
    plt.close(fig)


def fig_forest(df):
    """Fig 3 — the hero forest plot: the covariate arc vs the $1,794 benchmark."""
    order = df.iloc[::-1].reset_index(drop=True)   # first estimator on top
    y = np.arange(len(order))
    fig, ax = plt.subplots(figsize=(8.6, 5.4))
    ax.axvline(BENCHMARK, color=WARM_ORANGE, ls="--", lw=2,
               label=f"RCT benchmark  ${BENCHMARK:,.0f}")
    seen = set()
    for yi, row in zip(y, order.itertuples()):
        c = GROUP_COLORS[row._5]      # class column
        m = GROUP_MARKERS[row._5]
        lbl = {"inert": "In the level / effect (inert)",
               "corrected": "In the trend (corrected)",
               "propensity": "Propensity-based"}[row._5]
        ax.errorbar(row.att, yi, xerr=1.96 * row.se, fmt=m, color=c, ms=11,
                    capsize=4, lw=2, mec="white", mew=0.8,
                    label=lbl if row._5 not in seen else None)
        seen.add(row._5)
    ax.set_yticks(y)
    ax.set_yticklabels(order["estimator"])
    ax.set_xlim(0, 4200)
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda v, p: f"${v:,.0f}"))
    ax.set_xlabel("ATT estimate (95% CI)")
    ax.set_title("Covariates rescue LaLonde only when they enter the trend")
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.12), ncol=2,
              frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig("did_covariates_lalonde_forest.png", bbox_inches="tight")
    plt.close(fig)


def fig_ladder(df):
    """Fig 4 — the spec ladder: watch the estimate snap from $3,621 to ~$1,794."""
    order = df.reset_index(drop=True)
    x = np.arange(len(order))
    fig, ax = plt.subplots(figsize=(9.0, 5.0))
    ax.axhline(BENCHMARK, color=WARM_ORANGE, ls="--", lw=2, zorder=1,
               label=f"RCT benchmark ${BENCHMARK:,.0f}")
    ax.plot(x, order["att"], color="#bbb", lw=1.5, zorder=1)
    for xi, row in zip(x, order.itertuples()):
        ax.scatter(xi, row.att, s=150, color=GROUP_COLORS[row._5],
                   marker=GROUP_MARKERS[row._5], zorder=3, edgecolor="white")
        ax.annotate(f"${row.att:,.0f}", (xi, row.att), textcoords="offset points",
                    xytext=(0, 12), ha="center", fontsize=8.5, color="#333")
    ax.set_xticks(x)
    ax.set_xticklabels(order["estimator"], rotation=35, ha="right", fontsize=9)
    ax.set_ylim(1400, 4000)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, p: f"${v:,.0f}"))
    ax.set_ylabel("ATT estimate")
    ax.set_title("The estimate stays inert at $3,621 until covariates touch the trend")
    ax.legend(loc="upper right", frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig("did_covariates_lalonde_ladder.png", bbox_inches="tight")
    plt.close(fig)


def fig_crosscheck(res, dd):
    """Fig 5 — by-hand vs diff-diff package sanity check."""
    pairs = [("Naive 2x2", res["s0"], dd["dd_naive"][0]),
             ("Additive X", res["sA"], dd["dd_cov"][0])]
    if dd.get("dd_dr"):
        pairs.append(("Doubly robust", res["dr"], dd["dd_dr"][0]))
    labels = [p[0] for p in pairs]
    byhand = [p[1] for p in pairs]
    pkg = [p[2] for p in pairs]
    x = np.arange(len(pairs))
    w = 0.36
    fig, ax = plt.subplots(figsize=(8.0, 5.0))
    ax.axhline(BENCHMARK, color=WARM_ORANGE, ls="--", lw=1.5, label=f"Benchmark ${BENCHMARK:,.0f}")
    ax.bar(x - w / 2, byhand, w, color=STEEL_BLUE, label="This post (pyfixest / by hand)")
    ax.bar(x + w / 2, pkg, w, color=NEAR_BLACK, label="diff-diff package")
    for xi, a, b in zip(x, byhand, pkg):
        ax.text(xi - w / 2, a + 40, f"${a:,.0f}", ha="center", fontsize=8)
        ax.text(xi + w / 2, b + 40, f"${b:,.0f}", ha="center", fontsize=8)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, p: f"${v:,.0f}"))
    ax.set_ylabel("ATT estimate")
    ax.set_title("Cross-check: our estimators agree with the diff-diff package")
    ax.legend(loc="upper right", frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig("did_covariates_lalonde_crosscheck.png", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------------
# 7. Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 70)
    print(" Covariates in Difference-in-Differences — the LaLonde test in Python")
    print("=" * 70)
    print(f"pyfixest {pf.__version__} | numpy {np.__version__} | pandas {pd.__version__}")

    wide, panel, exp = load_data()
    print(f"\nNon-experimental sample: {len(wide):,} units "
          f"({int(wide.ever_treated.sum())} treated, "
          f"{int((wide.ever_treated == 0).sum()):,} CPS controls)")
    print("Cell counts (ever_treated x post):")
    print(pd.crosstab(panel.ever_treated, panel.post).to_string())

    res = run_all(wide, panel, exp)
    dd = diff_diff_crosscheck(panel)
    df = build_table(res)

    # --- console summary ---
    print(f"\nExperimental benchmark (re78 ~ treat) = ${res['benchmark_xs']:,.0f} "
          f"(SE {res['benchmark_xs_se']:,.0f}); DiD form = ${res['benchmark_did']:,.0f}")
    print(f"Bootstrap: {N_BOOT} reps, seed {RANDOM_SEED}, "
          f"{res['boot_fails']} failed draw(s)\n")
    print(f"{'Spec':<4}{'Estimator':<30}{'ATT':>9}{'SE':>8}   class")
    print("-" * 62)
    for r in df.itertuples():
        print(f"{r.spec:<4}{r.estimator:<30}{r.att:>9,.0f}{r.se:>8,.0f}   {r._5}")
    print("-" * 62)
    print(f"{'':4}{'RCT benchmark (target)':<30}{BENCHMARK:>9,.0f}")

    print("\ndiff-diff cross-check:")
    print(f"  naive 2x2      by pyfixest ${res['s0']:,.0f}  vs diff-diff ${dd['dd_naive'][0]:,.0f}")
    print(f"  additive X     by pyfixest ${res['sA']:,.0f}  vs diff-diff ${dd['dd_cov'][0]:,.0f}")
    if dd.get("dd_dr"):
        print(f"  doubly robust  by hand   ${res['dr']:,.0f}  vs diff-diff CS ${dd['dd_dr'][0]:,.0f}")
    else:
        print(f"  Callaway-Sant'Anna skipped: {dd.get('dd_dr_error', 'n/a')}")

    # --- write tables ---
    df_out = df[["spec", "estimator", "att", "se", "ci_low", "ci_high",
                 "gap_vs_benchmark", "class", "source"]].round(1)
    df_out.to_csv("lalonde_results.csv", index=False)
    with open("lalonde_results.md", "w") as f:
        f.write("| Spec | Estimator | ATT | SE | 95% CI | Class |\n")
        f.write("|---|---|---|---|---|---|\n")
        for r in df.itertuples():
            f.write(f"| {r.spec} | {r.estimator} | ${r.att:,.0f} | {r.se:,.0f} | "
                    f"[{r.ci_low:,.0f}, {r.ci_high:,.0f}] | {r._5} |\n")
        f.write(f"| — | **RCT benchmark** | **${BENCHMARK:,.0f}** | | | benchmark |\n")

    # --- web-app data ---
    payload = {
        "benchmark": BENCHMARK,
        "benchmark_se": round(res["benchmark_xs_se"], 1),
        "estimators": [
            {"spec": r.spec, "label": r.estimator, "att": round(r.att, 1),
             "se": round(r.se, 1), "group": r._5} for r in df.itertuples()
        ],
        "group_trend_means": {
            "years": [1974, 1975, 1978],
            "treated": [round(float(wide[wide.ever_treated == 1][c].mean()), 1)
                        for c in ["re74", "re75", "re78"]],
            "cps": [round(float(wide[wide.ever_treated == 0][c].mean()), 1)
                    for c in ["re74", "re75", "re78"]],
            "experimental": [round(float(exp[exp.treat == 0][c].mean()), 1)
                             for c in ["re74", "re75", "re78"]],
        },
    }
    with open("did_covariates_lalonde_estimates.json", "w") as f:
        json.dump(payload, f, indent=2)

    # --- figures ---
    fig_balance(wide, exp)
    fig_trends(wide, exp)
    fig_forest(df)
    fig_ladder(df)
    fig_crosscheck(res, dd)
    print("\nSaved 5 figures, lalonde_results.csv, lalonde_results.md, "
          "did_covariates_lalonde_estimates.json")
    print("=== Script completed successfully ===")


if __name__ == "__main__":
    main()
