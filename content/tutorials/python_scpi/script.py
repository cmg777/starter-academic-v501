"""
Synthetic Control with Prediction Intervals: Germany's Reunification Impact

Estimates the economic impact of German reunification (1990) on West Germany's
GDP per capita using the synthetic control method with prediction intervals
(Cattaneo, Feng, and Titiunik, 2021).

Usage:
    python script.py

References:
    - Cattaneo, Feng, and Titiunik (2021). Prediction Intervals for Synthetic
      Control Methods. Journal of the American Statistical Association.
    - Abadie, Diamond, and Hainmueller (2015). Comparative Politics and the
      Synthetic Control Method. American Journal of Political Science.
    - Abadie (2021). Using Synthetic Controls: Feasibility, Data Requirements,
      and Methodological Aspects. Journal of Economic Literature.
    - scpi_pkg documentation: https://nppackages.github.io/scpi/
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Adapted from scpi_pkg illustration scripts:
# https://github.com/nppackages/scpi/tree/main/Python/scpi_illustration
from scpi_pkg.scdata import scdata
from scpi_pkg.scest import scest
from scpi_pkg.scpi import scpi

# Reproducibility
RANDOM_SEED = 8894
np.random.seed(RANDOM_SEED)

# ── Site color palette ──────────────────────────────────────────────────
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

# Plot defaults — minimal, spine-free, dark background
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


# ── 1. Load and explore data ───────────────────────────────────────────

data = pd.read_csv("data.csv")
print("=" * 60)
print("DATASET OVERVIEW")
print("=" * 60)
print(f"Shape: {data.shape}")
print(f"\nCountries ({data['country'].nunique()}):")
print(sorted(data['country'].unique()))
print(f"\nYear range: {data['year'].min()} – {data['year'].max()}")
print(f"\nGDP per capita (thousand USD):")
print(data['gdp'].describe().round(3))

# West Germany summary
wg = data[data['country'] == 'West Germany']
print(f"\nWest Germany GDP range: {wg['gdp'].min():.3f} – {wg['gdp'].max():.3f}")
print(f"West Germany pre-reunification (1990): {wg[wg['year'] == 1990]['gdp'].values[0]:.3f}")


# ── 2. Figure 1: GDP trajectories ──────────────────────────────────────

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

countries = sorted(data['country'].unique())
for country in countries:
    cdata = data[data['country'] == country]
    if country == 'West Germany':
        ax.plot(cdata['year'], cdata['gdp'], color=WARM_ORANGE, linewidth=2.5,
                label='West Germany', zorder=10)
    else:
        ax.plot(cdata['year'], cdata['gdp'], color=STEEL_BLUE, alpha=0.3,
                linewidth=1)

ax.axvline(x=1990, color=TEAL, linestyle='--', linewidth=1.5, alpha=0.8,
           label='Reunification (1990)')
ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('GDP per Capita (thousand USD)', fontsize=13)
ax.set_title('GDP Trajectories: West Germany vs. Donor Pool', fontsize=15,
             pad=12)
ax.legend(loc='upper left', fontsize=11)

plt.savefig("scpi_gdp_trajectories.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 3. Prepare data for SCPI ───────────────────────────────────────────

id_var = 'country'
outcome_var = 'gdp'
time_var = 'year'
period_pre = np.arange(1960, 1991)   # 1960–1990 (31 years)
period_post = np.arange(1991, 2004)  # 1991–2003 (13 years)
unit_tr = 'West Germany'
unit_co = [c for c in sorted(data[id_var].unique()) if c != unit_tr]
cointegrated_data = True
constant = False

print("\n" + "=" * 60)
print("DATA PREPARATION")
print("=" * 60)
print(f"Treated unit: {unit_tr}")
print(f"Donor pool ({len(unit_co)} countries): {unit_co}")
print(f"Pre-treatment period: {period_pre[0]}–{period_pre[-1]} ({len(period_pre)} years)")
print(f"Post-treatment period: {period_post[0]}–{period_post[-1]} ({len(period_post)} years)")
print(f"Cointegrated data: {cointegrated_data}")

data_prep = scdata(df=data, id_var=id_var, time_var=time_var,
                   outcome_var=outcome_var, period_pre=period_pre,
                   period_post=period_post, unit_tr=unit_tr,
                   unit_co=unit_co, features=None, cov_adj=None,
                   cointegrated_data=cointegrated_data, constant=constant)


# ── 4. Point estimation: simplex (classic SC) ──────────────────────────

print("\n" + "=" * 60)
print("POINT ESTIMATION: SIMPLEX (CLASSIC SC)")
print("=" * 60)
est_si = scest(data_prep, w_constr={'name': "simplex"})
print(est_si)


# ── 5. Figure 2: Actual vs Synthetic West Germany ──────────────────────

# Extract fitted values
y_pre_actual = est_si.Y_pre.values.flatten()
y_post_actual = est_si.Y_post.values.flatten()
y_pre_fit = est_si.Y_pre_fit.values.flatten()
y_post_fit = est_si.Y_post_fit.values.flatten()

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

# Bridge pre/post by appending last pre-treatment point to post arrays
time_actual = np.concatenate([period_pre, period_post])
y_all_actual = np.concatenate([y_pre_actual, y_post_actual])
time_fit = np.concatenate([period_pre, period_post])
y_all_fit = np.concatenate([y_pre_fit, y_post_fit])

ax.plot(time_actual, y_all_actual, color=WARM_ORANGE, linewidth=2.2,
        label='West Germany (actual)')
ax.plot(time_fit, y_all_fit, color=STEEL_BLUE, linewidth=2.2,
        linestyle='--', label='Synthetic West Germany')
ax.axvline(x=1990, color=TEAL, linestyle='--', linewidth=1.5, alpha=0.8,
           label='Reunification (1990)')

ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('GDP per Capita (thousand USD)', fontsize=13)
ax.set_title('Actual vs. Synthetic West Germany', fontsize=15, pad=12)
ax.legend(loc='upper left', fontsize=11)

plt.savefig("scpi_actual_vs_synthetic.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 6. Figure 3: SC weights ────────────────────────────────────────────

# Extract weights
w_df = est_si.w.copy()
w_df.columns = ['weight']
w_df = w_df[w_df['weight'] > 0.001].sort_values('weight', ascending=True)

print("\n" + "=" * 60)
print("SYNTHETIC CONTROL WEIGHTS")
print("=" * 60)
print(w_df.round(4))
print(f"\nTotal weight: {w_df['weight'].sum():.4f}")
print(f"Countries with non-zero weight: {len(w_df)}")

fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_linewidth(0)

countries_w = [idx[1] if isinstance(idx, tuple) and len(idx) > 1 else idx for idx in w_df.index]
weights = w_df['weight'].values

bars = ax.barh(range(len(countries_w)), weights, color=STEEL_BLUE,
               edgecolor=DARK_NAVY, height=0.6)

# Highlight the largest weight
max_idx = np.argmax(weights)
bars[max_idx].set_color(WARM_ORANGE)

ax.set_yticks(range(len(countries_w)))
ax.set_yticklabels(countries_w, fontsize=11)
ax.set_xlabel('Weight', fontsize=13)
ax.set_title('Synthetic Control Weights (Simplex)', fontsize=15, pad=12)

for i, w in enumerate(weights):
    ax.text(w + 0.005, i, f'{w:.3f}', va='center', fontsize=10,
            color=LIGHT_TEXT)

plt.savefig("scpi_weights.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 7. Figure 4: Treatment effect gap ──────────────────────────────────

gap_post = y_post_actual - y_post_fit

print("\n" + "=" * 60)
print("TREATMENT EFFECT (GAP: ACTUAL - SYNTHETIC)")
print("=" * 60)
gap_df = pd.DataFrame({
    'Year': period_post,
    'Actual': y_post_actual.round(3),
    'Synthetic': y_post_fit.round(3),
    'Gap': gap_post.round(3)
})
print(gap_df.to_string(index=False))
print(f"\nAverage gap (1991–2003): {gap_post.mean():.3f} thousand USD")
print(f"Gap in 2003 (final year): {gap_post[-1]:.3f} thousand USD")

fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_linewidth(0)

ax.bar(period_post, gap_post, color=[WARM_ORANGE if g < 0 else TEAL for g in gap_post],
       edgecolor=DARK_NAVY, width=0.7)
ax.axhline(y=0, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5)
ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('Gap (Actual - Synthetic, thousand USD)', fontsize=13)
ax.set_title('Estimated Treatment Effect of Reunification', fontsize=15, pad=12)

plt.savefig("scpi_treatment_gap.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 8. Prediction intervals ────────────────────────────────────────────

print("\n" + "=" * 60)
print("PREDICTION INTERVALS (GAUSSIAN METHOD)")
print("=" * 60)

w_constr = {'name': 'simplex', 'Q': 1}
pi_si = scpi(data_prep, sims=200, w_constr=w_constr,
             u_order=1, u_lags=0,
             e_order=1, e_lags=0,
             e_method="gaussian",
             u_missp=True, u_sigma="HC1",
             cores=1, e_alpha=0.05, u_alpha=0.05)
print(pi_si)


# ── 9. Figure 5: SC with prediction intervals ──────────────────────────

# Extract prediction interval bounds
ci_all = pi_si.CI_all_gaussian
ci_lower = ci_all.iloc[:, 0].values
ci_upper = ci_all.iloc[:, 1].values
ci_years = ci_all.index.get_level_values(1).tolist()

# Pre-treatment fitted values
y_pre_fit_pi = pi_si.Y_pre_fit.values.flatten()
y_post_fit_pi = pi_si.Y_post_fit.values.flatten()
y_pre_actual_pi = pi_si.Y_pre.values.flatten()
y_post_actual_pi = pi_si.Y_post.values.flatten()

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

# Plot continuous lines (bridge pre/post to avoid gap at 1990–1991)
time_all = np.concatenate([period_pre, period_post])
ax.plot(time_all, np.concatenate([y_pre_actual_pi, y_post_actual_pi]),
        color=WARM_ORANGE, linewidth=2.2, label='West Germany (actual)')
ax.plot(time_all, np.concatenate([y_pre_fit_pi, y_post_fit_pi]),
        color=STEEL_BLUE, linewidth=2.2, linestyle='--',
        label='Synthetic West Germany')

# Anchor PI band at last pre-treatment point (1990) where uncertainty ~ 0,
# so the band starts as a thin wedge and widens into post-treatment
last_pre_fit = y_pre_fit_pi[-1]  # synthetic value at 1990
pi_time = np.concatenate([[period_pre[-1]], period_post])
pi_lower = [last_pre_fit]  # zero-width anchor at 1990
pi_upper = [last_pre_fit]
for yr in period_post:
    if yr in ci_years:
        idx = ci_years.index(yr)
        pi_lower.append(ci_lower[idx])
        pi_upper.append(ci_upper[idx])
    else:
        pi_lower.append(np.nan)
        pi_upper.append(np.nan)

ax.fill_between(pi_time, pi_lower, pi_upper,
                color=STEEL_BLUE, alpha=0.2, label='95% Prediction Interval')

ax.axvline(x=1990, color=TEAL, linestyle='--', linewidth=1.5, alpha=0.8,
           label='Reunification (1990)')

ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('GDP per Capita (thousand USD)', fontsize=13)
ax.set_title('Synthetic Control with Prediction Intervals', fontsize=15, pad=12)
ax.legend(loc='upper left', fontsize=10)

plt.savefig("scpi_prediction_intervals.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 10. Compare weight constraint methods ──────────────────────────────

print("\n" + "=" * 60)
print("COMPARING WEIGHT CONSTRAINT METHODS")
print("=" * 60)

# Lasso
est_lasso = scest(data_prep, w_constr={'name': "lasso"})
# Ridge
est_ridge = scest(data_prep, w_constr={'name': "ridge"})
# OLS
est_ls = scest(data_prep, w_constr={'name': "ols"})

# Compute pre-treatment RMSE for each method
methods = {
    'Simplex': est_si,
    'Lasso': est_lasso,
    'Ridge': est_ridge,
    'OLS': est_ls
}

print(f"\n{'Method':<12} {'Pre-RMSE':<12} {'Gap 2003':<12} {'Avg Gap':<12}")
print("-" * 48)
for name, est in methods.items():
    pre_resid = est.Y_pre.values.flatten() - est.Y_pre_fit.values.flatten()
    pre_rmse = np.sqrt(np.mean(pre_resid**2))
    post_gap = est.Y_post.values.flatten() - est.Y_post_fit.values.flatten()
    avg_gap = post_gap.mean()
    gap_2003 = post_gap[-1]
    print(f"{name:<12} {pre_rmse:<12.3f} {gap_2003:<12.3f} {avg_gap:<12.3f}")


# ── 11. Figure 6: Comparison of methods ────────────────────────────────

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.patch.set_linewidth(0)

colors_methods = {
    'Simplex': STEEL_BLUE,
    'Lasso': WARM_ORANGE,
    'Ridge': TEAL,
    'OLS': LIGHT_TEXT
}

for ax, (name, est) in zip(axes.flatten(), methods.items()):
    color = colors_methods[name]

    y_pre_a = est.Y_pre.values.flatten()
    y_post_a = est.Y_post.values.flatten()
    y_pre_f = est.Y_pre_fit.values.flatten()
    y_post_f = est.Y_post_fit.values.flatten()

    # Continuous lines (bridge pre/post)
    t_all = np.concatenate([period_pre, period_post])
    ax.plot(t_all, np.concatenate([y_pre_a, y_post_a]),
            color=WARM_ORANGE, linewidth=1.8, label='Actual')
    ax.plot(t_all, np.concatenate([y_pre_f, y_post_f]),
            color=color, linewidth=1.8, linestyle='--',
            label=f'Synthetic ({name})')
    ax.axvline(x=1990, color=TEAL if name != 'Ridge' else WARM_ORANGE,
               linestyle=':', linewidth=1, alpha=0.6)

    pre_resid = y_pre_a - y_pre_f
    pre_rmse = np.sqrt(np.mean(pre_resid**2))
    post_gap = y_post_a - y_post_f
    ax.set_title(f'{name}  (Pre-RMSE: {pre_rmse:.2f}, Gap 2003: {post_gap[-1]:.1f})',
                 fontsize=12, pad=8)
    ax.legend(loc='upper left', fontsize=9)
    ax.set_xlabel('Year', fontsize=10)
    ax.set_ylabel('GDP per Capita', fontsize=10)

fig.suptitle('Comparing Weight Constraint Methods', fontsize=16, y=1.01,
             color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("scpi_method_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


# ── 12. Sensitivity analysis ───────────────────────────────────────────

print("\n" + "=" * 60)
print("SENSITIVITY ANALYSIS")
print("=" * 60)
print("Varying out-of-sample uncertainty multiplier...")

# Run PI with different e_alpha levels to show sensitivity
# We'll vary the e_method between gaussian at different alpha levels
alphas = [0.01, 0.05, 0.10, 0.20]
sensitivity_results = {}

for alpha in alphas:
    np.random.seed(RANDOM_SEED)
    pi_temp = scpi(data_prep, sims=200, w_constr={'name': 'simplex', 'Q': 1},
                   u_order=1, u_lags=0,
                   e_order=1, e_lags=0,
                   e_method="gaussian",
                   u_missp=True, u_sigma="HC1",
                   cores=1, e_alpha=alpha, u_alpha=alpha)
    ci_temp = pi_temp.CI_all_gaussian
    sensitivity_results[alpha] = {
        'lower': ci_temp.iloc[:, 0].values,
        'upper': ci_temp.iloc[:, 1].values,
        'years': ci_temp.index.get_level_values(1).tolist()
    }

print(f"\n{'Alpha':<10} {'Coverage':<12} {'Avg PI Width':<15}")
print("-" * 37)
for alpha, res in sensitivity_results.items():
    widths = res['upper'] - res['lower']
    # Check how many post-treatment actuals fall within PI
    post_actual_vals = y_post_actual_pi
    post_years_in_ci = [yr for yr in period_post if yr in res['years']]
    inside = 0
    total = 0
    for yr in post_years_in_ci:
        yr_idx_ci = res['years'].index(yr)
        yr_idx_post = list(period_post).index(yr)
        if res['lower'][yr_idx_ci] <= post_actual_vals[yr_idx_post] <= res['upper'][yr_idx_ci]:
            inside += 1
        total += 1
    coverage = f"{inside}/{total}"
    # Only post-treatment widths
    post_widths = []
    for yr in post_years_in_ci:
        idx = res['years'].index(yr)
        post_widths.append(res['upper'][idx] - res['lower'][idx])
    avg_width = np.mean(post_widths) if post_widths else 0
    print(f"{1-alpha:<10.0%} {coverage:<12} {avg_width:<15.3f}")


# ── 13. Figure 7: Sensitivity — PI width across confidence levels ──────

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

colors_alpha = {0.01: TEAL, 0.05: STEEL_BLUE, 0.10: WARM_ORANGE, 0.20: LIGHT_TEXT}
labels_alpha = {0.01: '99% PI', 0.05: '95% PI', 0.10: '90% PI', 0.20: '80% PI'}

# Plot actual and synthetic (continuous lines bridging pre/post)
t_all = np.concatenate([period_pre, period_post])
ax.plot(t_all, np.concatenate([y_pre_actual_pi, y_post_actual_pi]),
        color=WARM_ORANGE, linewidth=2, label='West Germany (actual)')
ax.plot(t_all, np.concatenate([y_pre_fit_pi, y_post_fit_pi]),
        color=STEEL_BLUE, linewidth=1.5, linestyle='--', alpha=0.5,
        label='Synthetic')

# Overlay PI bands from widest to narrowest, anchored at 1990
last_pre_fit_sens = y_pre_fit_pi[-1]  # synthetic value at 1990
pi_time_sens = np.concatenate([[period_pre[-1]], period_post])
for alpha in [0.01, 0.05, 0.10, 0.20]:
    res = sensitivity_results[alpha]
    band_lower = [last_pre_fit_sens]  # zero-width anchor at 1990
    band_upper = [last_pre_fit_sens]
    for yr in period_post:
        if yr in res['years']:
            idx = res['years'].index(yr)
            band_lower.append(res['lower'][idx])
            band_upper.append(res['upper'][idx])
        else:
            band_lower.append(np.nan)
            band_upper.append(np.nan)

    ax.fill_between(pi_time_sens, band_lower, band_upper,
                    color=colors_alpha[alpha], alpha=0.15,
                    label=labels_alpha[alpha])

ax.axvline(x=1990, color=TEAL, linestyle='--', linewidth=1.5, alpha=0.6)
ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('GDP per Capita (thousand USD)', fontsize=13)
ax.set_title('Sensitivity Analysis: Prediction Intervals at Different Confidence Levels',
             fontsize=14, pad=12)
ax.legend(loc='upper left', fontsize=9)

plt.savefig("scpi_sensitivity.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()


print("\n" + "=" * 60)
print("SCRIPT COMPLETE — all figures saved.")
print("=" * 60)
