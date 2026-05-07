#!/usr/bin/env python3
"""
Tutorial: Causal Machine Learning and the Resource Curse (EconML)
=================================================================
Pedagogical replication of the main findings from
Hodler, Lechner & Raschky (2023) using simulated data and
the EconML Causal Forest (CausalForestDML) estimator.

Uses the Double Machine Learning (DML) framework to estimate
heterogeneous treatment effects of mining and mineral prices
on economic development and conflict.

Runtime: ~3-8 minutes

Usage:
    python tutorial-econml-resource-curse.py
"""

import os
import time

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# ============================================================================
# Ground-truth parameters (from the data-generating process)
# ============================================================================
TRUE_PARAMS = {
    'ntl_mining_base': 0.25,          # Mining effect at mean institutions
    'ntl_mining_inst_mod': 0.15,      # Institutional moderation of mining
    'ntl_price_med': 0.05,            # Medium price premium (small)
    'ntl_price_high': 0.30,           # High price premium (large)
    'ntl_noise_sd': 0.25,             # Outcome noise
    'conflict_mining_base': 0.70,     # Mining increases conflict
    'conflict_mining_inst_mod': -0.50, # Institutions dampen mining-conflict
    'conflict_price_med': 0.15,
    'conflict_price_high': 0.50,
    'conflict_base_rate': 0.12,
}


def expected_ates():
    """Derive ground-truth ATEs from the DGP parameters."""
    p = TRUE_PARAMS
    return {
        'NTL': {
            '1-0': p['ntl_mining_base'],
            '2-0': p['ntl_mining_base'] + p['ntl_price_med'],
            '3-0': p['ntl_mining_base'] + p['ntl_price_high'],
            '2-1': p['ntl_price_med'],
            '3-1': p['ntl_price_high'],
            '3-2': p['ntl_price_high'] - p['ntl_price_med'],
        }
    }


# ============================================================================
# Site color palette and dark theme
# ============================================================================
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
    "font.size": 12,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "legend.labelcolor": LIGHT_TEXT,
    "figure.edgecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY,
    "savefig.edgecolor": DARK_NAVY,
})

# ============================================================================
# Configuration
# ============================================================================
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(_SCRIPT_DIR, 'tutorial_results')
os.makedirs(RESULTS_DIR, exist_ok=True)

DATA_URL = ("https://github.com/quarcs-lab/data-open"
            "/raw/master/stata19/sim_resource_curse.csv")
# Local fallback (for running before data is uploaded to GitHub)
_LOCAL_CSV = os.path.join(_SCRIPT_DIR, '..', '..', 'stata_cate2',
                          'sim_resource_curse.csv')

# Heterogeneity features (X): variables the causal forest can split on
# to discover treatment effect heterogeneity
X_COLS = [
    'exec_constraints', 'quality_of_govt', 'gdp_pc',
    'elevation', 'temperature', 'ruggedness',
    'distance_capital', 'agri_suitability', 'population', 'ethnic_frac',
]

# Additional controls (W): used only in the first-stage nuisance models
# (residualization) but NOT in the second-stage causal forest
W_COLS = ['country_id', 'year']

# Institutional variables for GATE analysis
Z_VARS = ['exec_constraints', 'quality_of_govt']


def _savefig(fig, name):
    """Save figure with dark theme settings."""
    fig.patch.set_linewidth(0)
    fig.savefig(
        os.path.join(RESULTS_DIR, name),
        dpi=300, bbox_inches='tight',
        facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0,
    )
    plt.close(fig)
    print(f"  Saved: {name}")


# ============================================================================
# Step 1: Load simulated data
# ============================================================================
def step_load_data():
    """Load the simulated panel dataset from GitHub."""
    print("\n" + "=" * 70)
    print("STEP 1: LOADING SIMULATED DATA")
    print("=" * 70)

    try:
        df = pd.read_csv(DATA_URL)
    except Exception:
        print("  (GitHub URL unavailable, loading local copy)")
        df = pd.read_csv(_LOCAL_CSV)

    print(f"  Dataset: {len(df):,} observations")
    print(f"  Districts: {df['district_id'].nunique()}, "
          f"Countries: {df['country_id'].nunique()}, "
          f"Years: {df['year'].min()}-{df['year'].max()}")
    print(f"  Mining districts: "
          f"{df.loc[df['mining']==1, 'district_id'].nunique()} "
          f"({df['mining'].mean():.0%} of total)")

    print(f"\n  Treatment distribution:")
    labels = {0: 'No mining', 1: 'Low prices',
              2: 'Med prices', 3: 'High prices'}
    for t, n in df['treatment'].value_counts().sort_index().items():
        print(f"    {t} ({labels[t]}): {n:,} ({n/len(df):.1%})")

    print(f"\n  Outcomes:")
    print(f"    NTL (log):  mean={df['ntl_log'].mean():.3f}, "
          f"std={df['ntl_log'].std():.3f}")
    print(f"    Conflict:   {df['conflict'].mean():.1%} of district-years")

    return df


# ============================================================================
# Step 2: Descriptive statistics
# ============================================================================
def step_descriptive_stats(df):
    """Print summary statistics and treatment distribution chart."""
    print("\n" + "=" * 70)
    print("STEP 2: DESCRIPTIVE STATISTICS")
    print("=" * 70)

    desc_vars = {
        'NTL (log)': 'ntl_log',
        'Conflict': 'conflict',
        'Exec. Constraints': 'exec_constraints',
        'Quality of Govt.': 'quality_of_govt',
        'GDP per capita': 'gdp_pc',
        'Elevation': 'elevation',
        'Temperature': 'temperature',
        'Ruggedness': 'ruggedness',
        'Dist. to Capital': 'distance_capital',
        'Agri. Suitability': 'agri_suitability',
        'Population': 'population',
        'Ethnic Frac.': 'ethnic_frac',
    }

    rows = []
    for label, var in desc_vars.items():
        s = df[var]
        rows.append({'Variable': label, 'Mean': s.mean(), 'Std': s.std(),
                     'Min': s.min(), 'Max': s.max()})

    stats = pd.DataFrame(rows)
    print(stats.to_string(index=False, float_format='{:.3f}'.format))

    # Outcomes by treatment group
    labels = {0: 'No mining', 1: 'Low prices',
              2: 'Med prices', 3: 'High prices'}
    print(f"\n  Outcomes by treatment group:")
    print(f"  {'Treatment':<20s} {'Mean NTL':>10s} {'Conflict Rate':>15s}")
    print(f"  {'-'*47}")
    for t in sorted(df['treatment'].unique()):
        mask = df['treatment'] == t
        m_ntl = df.loc[mask, 'ntl_log'].mean()
        m_conf = df.loc[mask, 'conflict'].mean()
        print(f"  {t} ({labels[t]:<13s})  {m_ntl:>10.3f} {m_conf:>14.1%}")

    # Treatment distribution chart
    fig, ax = plt.subplots(figsize=(8, 3))
    colors = [LIGHT_TEXT, STEEL_BLUE, TEAL, WARM_ORANGE]
    counts = df['treatment'].value_counts().sort_index()
    bars = ax.barh(
        [labels[t] for t in counts.index], counts.values,
        color=colors, edgecolor=DARK_NAVY, linewidth=0.8,
    )
    for bar, count in zip(bars, counts.values):
        ax.text(bar.get_width() + 20, bar.get_y() + bar.get_height()/2,
                f'{count:,} ({count/len(df):.1%})',
                va='center', fontsize=9, color=LIGHT_TEXT)
    ax.set_xlabel('Number of observations')
    ax.set_title('Treatment Distribution (M=4)')
    _savefig(fig, 'python_econml_treatment_dist.png')

    stats.to_csv(os.path.join(RESULTS_DIR, 'descriptive-stats.csv'),
                 index=False)


# ============================================================================
# Step 2b: Naive comparison (motivating causal ML)
# ============================================================================
def step_naive_comparison(df):
    """Compare naive difference-in-means to ground truth."""
    print("\n" + "=" * 70)
    print("STEP 2b: NAIVE COMPARISON (why we need causal ML)")
    print("=" * 70)

    gt = expected_ates()['NTL']

    print(f"\n  Simple difference-in-means (no confounder adjustment):")
    print(f"  {'Comparison':<15s} {'Naive':>8s} {'Ground Truth':>14s} {'Bias':>8s}")
    print(f"  {'-'*47}")

    for comp in ['1-0', '2-1', '3-1']:
        a, b = int(comp[0]), int(comp[2])
        mean_a = df.loc[df['treatment'] == a, 'ntl_log'].mean()
        mean_b = df.loc[df['treatment'] == b, 'ntl_log'].mean()
        naive = mean_a - mean_b
        truth = gt[comp]
        bias = naive - truth
        print(f"  {comp:<15s} {naive:>8.3f} {truth:>14.3f} {bias:>+8.3f}")

    print(f"\n  The naive 1-0 estimate is biased because mining districts")
    print(f"  differ systematically from non-mining districts (geography,")
    print(f"  institutions). The Causal Forest controls for these confounders")
    print(f"  via the Double Machine Learning residualization step.")


# ============================================================================
# Step 3: EconML Causal Forest Estimation
# ============================================================================
def step_econml_estimation(df, outcome, label):
    """Run CausalForestDML for one outcome variable."""
    from econml.dml import CausalForestDML
    from sklearn.ensemble import (GradientBoostingRegressor,
                                  GradientBoostingClassifier)

    print(f"\n{'=' * 70}")
    print(f"STEP 3: CAUSAL FOREST DML — {label}")
    print(f"  Outcome: {outcome}  |  Treatment: treatment (M=4)")
    print(f"  Observations: {len(df):,}  |  Trees: 500")
    print(f"{'=' * 70}")

    Y = df[outcome].values
    T = df['treatment'].values
    X = df[X_COLS].values
    W = df[W_COLS].values

    print("  Configuring CausalForestDML...")
    print("    - discrete_treatment=True (4 treatment levels)")
    print("    - DML: GradientBoosting for both nuisance models")
    print("    - 500 honest causal trees (separate split/estimation samples)")
    print("    - BLB inference (bootstrap of little bags)")
    print("    - GroupKFold CV by district_id (prevents within-district")
    print("      data leakage in cross-fitting; does NOT cluster SEs)")

    est = CausalForestDML(
        # Nuisance models (first stage: residualize Y and T)
        model_y=GradientBoostingRegressor(
            n_estimators=200, max_depth=4, random_state=42),
        model_t=GradientBoostingClassifier(
            n_estimators=200, max_depth=4, random_state=42),

        # Treatment
        discrete_treatment=True,
        categories=[0, 1, 2, 3],

        # Causal forest (second stage)
        n_estimators=500,
        min_samples_leaf=10,
        max_depth=None,         # Fully grown trees
        honest=True,            # Honesty for valid inference

        # Inference
        inference=True,         # BLB (bootstrap of little bags)

        # Cross-validation
        cv=5,

        # Computation
        n_jobs=1,               # Single-threaded for reproducibility
        random_state=42,
    )

    t0 = time.time()
    print("  Fitting (first-stage residualization + causal forest)...")
    est.fit(Y, T, X=X, W=W, groups=df['district_id'].values)

    elapsed = time.time() - t0
    print(f"  Done in {elapsed/60:.1f} minutes")

    return est


# ============================================================================
# Step 4: Extract and display ATEs
# ============================================================================
def step_ate_table(est_ntl, est_conf, df):
    """Print ATEs and compare to ground truth."""
    print("\n" + "=" * 70)
    print("STEP 4: AVERAGE TREATMENT EFFECTS")
    print("=" * 70)

    X = df[X_COLS].values
    gt = expected_ates()['NTL']

    # All pairwise comparisons — ate_inference gives proper BLB CIs
    all_comparisons = [
        ('1-0', 0, 1), ('2-0', 0, 2), ('3-0', 0, 3),
        ('2-1', 1, 2), ('3-1', 1, 3), ('3-2', 2, 3),
    ]

    rows = []
    for comp_label, t0, t1 in all_comparisons:
        ntl_res = est_ntl.ate_inference(X, T0=t0, T1=t1)
        ntl_lo, ntl_hi = ntl_res.conf_int_mean(alpha=0.1)  # 90% CI
        conf_res = est_conf.ate_inference(X, T0=t0, T1=t1)

        rows.append({
            'Comparison': comp_label,
            'NTL Effect': ntl_res.mean_point,
            'NTL SE': ntl_res.stderr_mean,
            'NTL 90% CI': f'[{ntl_lo:.3f}, {ntl_hi:.3f}]',
            'NTL Ground Truth': gt.get(comp_label, np.nan),
            'Conflict Effect': conf_res.mean_point,
            'Conflict SE': conf_res.stderr_mean,
        })

    table = pd.DataFrame(rows)

    # Print formatted table
    print(f"\n  {'Comp':<8s} {'NTL Effect':>11s} {'NTL SE':>8s} "
          f"{'Ground Truth':>13s} {'Conflict':>10s}")
    print(f"  {'-'*55}")
    for _, r in table.iterrows():
        sig = ''
        if r['NTL SE'] > 0:
            z = abs(r['NTL Effect'] / r['NTL SE'])
            if z > 2.576: sig = '***'
            elif z > 1.96: sig = '**'
            elif z > 1.645: sig = '*'
        print(f"  {r['Comparison']:<8s} {r['NTL Effect']:>8.4f}{sig:<3s} "
              f"{r['NTL SE']:>8.4f} {r['NTL Ground Truth']:>13.3f} "
              f"{r['Conflict Effect']:>10.4f}")

    # Interpretation
    print("\n  Key findings:")
    eff_10 = table.loc[table['Comparison'] == '1-0', 'NTL Effect'].iloc[0]
    eff_21 = table.loc[table['Comparison'] == '2-1', 'NTL Effect'].iloc[0]
    eff_31 = table.loc[table['Comparison'] == '3-1', 'NTL Effect'].iloc[0]
    print(f"    Finding 1: Mining increases NTL (1-0 effect = {eff_10:.3f})")
    print(f"    Finding 2: Non-linear prices — "
          f"2-1 = {eff_21:.3f} (small) vs 3-1 = {eff_31:.3f} (large)")
    print(f"\n    * p<0.10, ** p<0.05, *** p<0.01")

    table.to_csv(os.path.join(RESULTS_DIR, 'ate-table.csv'), index=False)
    return table


# ============================================================================
# Step 5: GATE plots by institutional quality
# ============================================================================
def compute_gate(est, df, z_var, t0, t1):
    """Compute Group Average Treatment Effects by a grouping variable.

    Uses effect_inference() for proper BLB standard errors that capture
    estimation uncertainty, not just within-group heterogeneity.
    """
    X = df[X_COLS].values
    inf = est.effect_inference(X, T0=t0, T1=t1)
    ite = inf.point_estimate
    ite_se = inf.stderr

    z_vals = sorted(df[z_var].unique())
    gate_data = []
    for z in z_vals:
        mask = df[z_var].values == z
        n = mask.sum()
        gate_mean = ite[mask].mean()
        # SE of group mean: sqrt(mean(se_i^2) / n) — accounts for
        # estimation uncertainty in each individual CATE
        gate_se = np.sqrt(np.mean(ite_se[mask] ** 2) / n)
        gate_data.append({
            'z_value': z,
            'gate': gate_mean,
            'se': gate_se,
            'lower': gate_mean - 1.645 * gate_se,  # 90% CI
            'upper': gate_mean + 1.645 * gate_se,
            'n': n,
        })
    return pd.DataFrame(gate_data), ite


def _plot_single_gate(est, df, z_var, z_label, t0, t1, title, color, fname):
    """Plot a single GATE panel and save to file."""
    gate_df, ite = compute_gate(est, df, z_var, t0, t1)

    fig, ax = plt.subplots(figsize=(8, 6))
    fig.patch.set_linewidth(0)

    ax.fill_between(gate_df['z_value'], gate_df['lower'],
                    gate_df['upper'], alpha=0.25, color=color)
    ax.plot(gate_df['z_value'], gate_df['gate'], 'o-',
            color=WHITE_TEXT, markersize=7, linewidth=1.5,
            markeredgecolor=DARK_NAVY, markeredgewidth=0.8, zorder=3)

    ate_val = ite.mean()
    ax.axhline(ate_val, color=WARM_ORANGE, linewidth=1.5, linestyle='--',
               alpha=0.8, label=f'ATE = {ate_val:.3f}')

    ax.set_xlabel(z_label, fontsize=13)
    ax.set_ylabel('GATE', fontsize=13)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=12)
    ax.legend(fontsize=11)

    _savefig(fig, fname)
    return gate_df


def step_gate_plots(est_ntl, est_conf, df):
    """Create composite and individual GATE plots by institutional quality."""
    print("\n" + "=" * 70)
    print("STEP 5: GATEs BY INSTITUTIONAL QUALITY")
    print("=" * 70)

    # Panel specs: (estimator, T0, T1, short title, color)
    panel_specs = [
        (est_ntl, 0, 1, 'NTL: Mining vs No Mining (1-0)', STEEL_BLUE),
        (est_ntl, 1, 3, 'NTL: High vs Low Prices (3-1)', STEEL_BLUE),
        (est_conf, 0, 1, 'Conflict: Mining vs No Mining (1-0)', TEAL),
        (est_conf, 1, 3, 'Conflict: High vs Low Prices (3-1)', TEAL),
    ]

    z_specs = [
        ('exec_constraints', 'Constraints on the Executive', 'exec'),
        ('quality_of_govt', 'Quality of Government', 'qog'),
    ]

    # Individual GATE panels for blog post
    individual_specs = [
        (est_ntl, 0, 1, 'NTL: Mining vs No Mining (1-0)', STEEL_BLUE, 'ntl_1v0'),
        (est_ntl, 1, 3, 'NTL: High vs Low Prices (3-1)', STEEL_BLUE, 'ntl_3v1'),
    ]

    for z_var, z_label, z_short in z_specs:
        for est, t0, t1, title, color, comp_short in individual_specs:
            fname = f'python_econml_gate_{comp_short}_{z_short}.png'
            _plot_single_gate(est, df, z_var, z_label, t0, t1,
                              title, color, fname)

    # Composite 4-panel figures
    for z_var, z_label, z_short in z_specs:
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.patch.set_linewidth(0)
        ax_list = [axes[0, 0], axes[0, 1], axes[1, 0], axes[1, 1]]

        for (est, t0, t1, title, color), ax in zip(panel_specs, ax_list):
            gate_df, ite = compute_gate(est, df, z_var, t0, t1)

            ax.fill_between(gate_df['z_value'], gate_df['lower'],
                            gate_df['upper'], alpha=0.25, color=color)
            ax.plot(gate_df['z_value'], gate_df['gate'], 'o-',
                    color=WHITE_TEXT, markersize=6, linewidth=1.5,
                    markeredgecolor=DARK_NAVY, markeredgewidth=0.8, zorder=3)

            ate_val = ite.mean()
            ax.axhline(ate_val, color=WARM_ORANGE, linewidth=1.5,
                       linestyle='--', alpha=0.8,
                       label=f'ATE = {ate_val:.3f}')

            ax.set_xlabel(z_label)
            ax.set_ylabel('GATE')
            ax.set_title(title)
            ax.legend(fontsize=9)

        plt.suptitle(f'GATEs by {z_label} (EconML CausalForestDML)',
                     fontsize=14, fontweight='bold', color=WHITE_TEXT,
                     y=1.02)
        plt.tight_layout()
        _savefig(fig, f'python_econml_gate_{z_short}.png')

    # GATE values walkthrough
    print(f"\n  GATE values for NTL by Executive Constraints:")
    print(f"  {'='*65}")
    for (t0, t1), comp_label in [((0, 1), 'Mining vs No Mining (1-0)'),
                                  ((1, 3), 'High vs Low Prices (3-1)')]:
        gate_df, _ = compute_gate(est_ntl, df, 'exec_constraints', t0, t1)
        print(f"\n    {t1}-{t0} ({comp_label}):")
        print(f"    {'Exec. Constr.':<15s} {'GATE':>8s} {'90% CI':>20s}"
              f" {'N':>6s}")
        print(f"    {'-'*52}")
        for _, row in gate_df.iterrows():
            print(f"    {row['z_value']:>13.0f}   {row['gate']:>8.3f}   "
                  f"[{row['lower']:.3f}, {row['upper']:.3f}]"
                  f" {row['n']:>6.0f}")
        rng = gate_df['gate'].max() - gate_df['gate'].min()
        print(f"    Range: {rng:.3f}")

    print(f"\n    Finding 3a: 1-0 effects vary with institutions")
    print(f"    Finding 3b: 3-1 effects are FLAT across institutions")


# ============================================================================
# Step 5b: Variable importance
# ============================================================================
def step_variable_importance(est_ntl):
    """Display and plot feature importances from the causal forest."""
    print("\n" + "=" * 70)
    print("STEP 5b: VARIABLE IMPORTANCE")
    print("=" * 70)

    importances = est_ntl.feature_importances_
    vim_data = sorted(zip(X_COLS, importances),
                      key=lambda x: x[1], reverse=True)

    print(f"\n  Feature importances (heterogeneity drivers):")
    for var, imp in vim_data:
        bar = '#' * int(imp * 100)
        print(f"    {var:<25s} {imp:>6.3f}  {bar}")

    print(f"\n  Note: These measure how much each feature contributes to")
    print(f"  treatment effect HETEROGENEITY, not to outcome prediction.")

    # Bar chart
    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_linewidth(0)
    vars_, imps = zip(*reversed(vim_data))
    ax.barh(vars_, imps, color=STEEL_BLUE, edgecolor=DARK_NAVY,
            linewidth=0.8, alpha=0.9)
    ax.set_xlabel('Feature Importance (heterogeneity contribution)',
                  fontsize=13)
    ax.set_title('Treatment Effect Heterogeneity Drivers (NTL)',
                 fontsize=14, fontweight='bold', pad=12)
    _savefig(fig, 'python_econml_var_importance.png')


# ============================================================================
# Step 5c: CATE Interpreter (EconML-specific feature)
# ============================================================================
def step_cate_interpreter(est_ntl, df):
    """Use SingleTreeCateInterpreter to find interpretable subgroups."""
    from econml.cate_interpreter import SingleTreeCateInterpreter

    print("\n" + "=" * 70)
    print("STEP 5c: CATE INTERPRETER (EconML-specific feature)")
    print("=" * 70)

    X = df[X_COLS].values

    # Interpret the 1-0 contrast (mining vs no mining)
    intrp = SingleTreeCateInterpreter(max_depth=2, min_samples_leaf=100)
    intrp.interpret(est_ntl, X)

    print(f"\n  The SingleTreeCateInterpreter fits a shallow decision tree")
    print(f"  to the estimated CATEs to find interpretable subgroups.")

    # Save the tree plot — use a white-background inset for tree readability
    fig, ax = plt.subplots(figsize=(12, 6))
    fig.patch.set_linewidth(0)

    # Tree nodes are hard to read on dark backgrounds, so we use a light
    # inset for the tree itself while keeping the figure frame dark
    ax.set_facecolor('#f8f9fa')
    intrp.plot(feature_names=X_COLS, ax=ax)
    ax.set_title('Interpretable CATE Subgroups: Mining vs No Mining (1-0)',
                 fontsize=14, fontweight='bold', color=NEAR_BLACK, pad=12)
    _savefig(fig, 'python_econml_cate_tree.png')


# ============================================================================
# Step 6: Summary and comparison
# ============================================================================
def step_summary():
    """Print final summary with ground-truth comparison."""
    print("\n" + "=" * 70)
    print("SUMMARY: EconML CAUSAL FOREST vs GROUND TRUTH")
    print("=" * 70)

    gt = expected_ates()['NTL']
    print("\n  Expected ATEs (from DGP):")
    for comp, val in gt.items():
        print(f"    {comp}: {val:.3f}")

    print("\n  Three key findings to verify:")
    print("    1. Mining -> positive NTL and conflict (all x-0 > 0)")
    print("    2. Non-linear prices: 2-1 ~ 0, 3-1 >> 0, 3-2 >> 0")
    print("    3. GATEs by institutions:")
    print("       - 1-0: slope (institutions moderate mining effect)")
    print("       - 3-1: flat (institutions don't affect price effects)")

    print(f"\n  Results saved to: {RESULTS_DIR}/")
    print("  Figures: python_econml_*.png")
    print("  Tables:  descriptive-stats.csv, ate-table.csv")


# ============================================================================
# Main
# ============================================================================
def main():
    print("=" * 70)
    print("TUTORIAL: CAUSAL MACHINE LEARNING AND THE RESOURCE CURSE")
    print("EconML CausalForestDML — Replicating Hodler, Lechner & Raschky (2023)")
    print("=" * 70)

    t_start = time.time()

    # Step 1: Load data
    df = step_load_data()

    # Step 2: Descriptive statistics
    step_descriptive_stats(df)

    # Step 2b: Naive comparison
    step_naive_comparison(df)

    # Step 3: Causal Forest estimation (two runs: NTL and Conflict)
    est_ntl = step_econml_estimation(df, 'ntl_log', 'NTL')
    est_conf = step_econml_estimation(df, 'conflict', 'Conflict')

    # Step 4: ATEs (all pairwise comparisons with BLB inference)
    step_ate_table(est_ntl, est_conf, df)

    # Step 5: GATE plots by institutional quality
    step_gate_plots(est_ntl, est_conf, df)

    # Step 5b: Variable importance
    step_variable_importance(est_ntl)

    # Step 5c: CATE interpreter (EconML-specific)
    step_cate_interpreter(est_ntl, df)

    # Step 6: Summary
    step_summary()

    total = time.time() - t_start
    print(f"\n  Total runtime: {total/60:.1f} minutes")
    print("\n" + "=" * 70)
    print("Tutorial complete.")
    print("=" * 70)


if __name__ == '__main__':
    main()
