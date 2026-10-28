"""Draw every data figure of the ADBI workshop deck, in the deck's dark theme.

Reads   : data/*.csv, data/boundaries_simplified.geojson   (this folder only)
Writes  : ../img/*.png                                       (the deck's figures)

The data files are extracts of the derived outputs of the chapter repository
quarcs-lab/project2026i at commit 111def8 (see README.md). The plotting logic is
adapted from that repository's code/03_figures.py, 06_scm_figures.py and
08_sdgi_figures.py, restyled for a navy slide canvas. Like those stages, this
script estimates nothing: every plotted number arrives through a CSV.

Run:  python make_figures.py      (from this folder)
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
OUT = HERE.parent / "img"
OUT.mkdir(exist_ok=True)

# Deck palette (site-brand.scss). Identity is never carried by colour alone:
# each series also has its own line style or marker and a direct label.
NAVY, INK, MUTED = "#0f1729", "#e6ebf3", "#aebfd8"
STEEL, ORANGE, TEAL, GOLD = "#6a9bcc", "#d97757", "#00d4c8", "#e9c184"
GRID, MISSING = "#2c3a52", "#2a3446"

TREATED = ("Fukushima", "Miyagi", "Iwate")
UNIT_KEY = "ADM1_CODE"
EXTENT = {"ASEAN": (91.5, 142.0, -11.5, 29.0), "Japan": (127.0, 146.5, 23.5, 46.0)}
EXTENT_ALL = (91.5, 146.5, -11.5, 46.0)
EPOCH_YEAR = 1992          # month index 0 = 1992-01 (as in the chapter code)

plt.rcParams.update({
    "figure.facecolor": NAVY, "axes.facecolor": NAVY, "savefig.facecolor": NAVY,
    "text.color": INK, "axes.labelcolor": MUTED, "axes.edgecolor": GRID,
    "xtick.color": MUTED, "ytick.color": MUTED, "axes.titlecolor": INK,
    "font.size": 12, "axes.titlesize": 14, "axes.labelsize": 12,
    "legend.fontsize": 11, "legend.labelcolor": INK,
    "font.family": "DejaVu Sans",
})


def save(fig, name: str) -> None:
    path = OUT / name
    fig.savefig(path, dpi=200, bbox_inches="tight", pad_inches=0.12,
                metadata={"Software": None})
    plt.close(fig)
    print(f"wrote img/{name} ({path.stat().st_size / 1024:.0f} KB)")


def style(ax, grid_axis: str = "both") -> None:
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.grid(True, axis=grid_axis, color=GRID, lw=0.7)
    ax.set_axisbelow(True)


def month_index(year: int, month: int) -> int:
    return (year - EPOCH_YEAR) * 12 + month - 1


def month_label(idx: int) -> str:
    return f"{EPOCH_YEAR + idx // 12:04d}-{idx % 12 + 1:02d}"


def boundaries():
    import geopandas as gpd
    return gpd.read_file(DATA / "boundaries_simplified.geojson")


# ------------------------------------------------------------ Section 2 ---- #

PANEL = {
    "elec":    ("Access to electricity", "% of population"),
    "rai":     ("Rural access to roads", "% of rural population"),
    "transit": ("Urban access to transport", "% of urban population"),
    "space":   ("Urban open public space", "% of built-up area"),
}


def fig_sdgi_map() -> None:
    d = pd.read_csv(DATA / "sdgi_adm1.csv")
    m = boundaries().merge(d, on=UNIT_KEY, how="left").sort_values(UNIT_KEY)
    x0, x1, y0, y1 = EXTENT_ALL
    fig, axes = plt.subplots(1, 4, figsize=(16, 5.2))
    for ax, (key, (title, unit)) in zip(axes, PANEL.items()):
        col = f"{key}_pct"
        n_missing = int(m[col].isna().sum())
        m.plot(column=col, cmap="viridis", ax=ax, linewidth=0.05, edgecolor=NAVY,
               missing_kwds={"color": MISSING}, legend=True,
               legend_kwds={"orientation": "horizontal", "shrink": 0.8,
                            "pad": 0.02, "aspect": 28, "label": unit})
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_axis_off()
        sub = (f"{len(m) - n_missing} of {len(m)} regions" if n_missing
               else f"all {len(m)} regions")
        ax.set_title(f"{title}\n", fontsize=14)
        ax.text(0.5, 1.0, sub, transform=ax.transAxes, ha="center", va="bottom",
                fontsize=10.5, color=MUTED)
    for cax in fig.axes[4:]:
        cax.tick_params(colors=MUTED, labelsize=9)
        cax.xaxis.label.set_color(MUTED)
        cax.xaxis.label.set_size(10)
    save(fig, "sdgi_map.png")


def fig_sdgi_scatter() -> None:
    d = pd.read_csv(DATA / "sdgi_adm1.csv")
    fits = pd.read_csv(DATA / "sdgi_fits.csv").set_index("key")
    fig, axes = plt.subplots(1, 4, figsize=(16, 4.6))
    for ax, (key, (title, unit)) in zip(axes, PANEL.items()):
        s = d[d["PWMean_NTL"].gt(0) & d[f"{key}_pct"].notna()]
        f = fits.loc[key]
        circular = bool(f.ntl_derived)
        alpha = 0.25 if circular else 0.7
        for grp, colour, marker, size in (("ASEAN", STEEL, "o", 16),
                                          ("Japan", ORANGE, "^", 22)):
            g = s[s["Group"] == grp]
            ax.scatter(g["PWMean_NTL"], g[f"{key}_pct"], s=size, c=colour,
                       marker=marker, alpha=alpha, linewidths=0,
                       label="Japan" if grp == "Japan" else "ASEAN",
                       zorder=3 if grp == "Japan" else 2)
        y = s[f"{key}_pct"]
        pad = 0.05 * (y.max() - y.min())
        ax.set_ylim(max(0.0, y.min() - pad), min(100.0, y.max() + pad))
        ax.plot([np.exp(f.x_lo), np.exp(f.x_hi)], [f.y_lo, f.y_hi],
                color=INK if not circular else MUTED, lw=1.5, ls="--", zorder=4)
        ax.set_xscale("log")
        ax.set_xlabel("Brightness (log scale)")
        if ax is axes[0]:
            ax.set_ylabel("Share with access (%)")
        ax.set_title(title, fontsize=13, color=MUTED if circular else INK)
        label = f"r = {f.r:.2f}" + ("\nbuilt from lights:\ncircular" if circular else "")
        ax.text(0.04, 0.96, label, transform=ax.transAxes, ha="left", va="top",
                fontsize=13 if not circular else 11,
                color=GOLD if not circular else MUTED, fontweight="bold",
                bbox=dict(facecolor=NAVY, alpha=0.85, edgecolor="none", pad=2))
        style(ax)
    axes[1].legend(frameon=False, loc="lower right", markerscale=1.6)
    fig.tight_layout(w_pad=1.6)
    save(fig, "sdgi_scatter.png")


# ------------------------------------------------------------ Section 3 ---- #

def fig_night_map() -> None:
    r = pd.read_csv(DATA / "radiance_2014_2024.csv")
    wide = r.pivot(index=UNIT_KEY, columns="year", values="radiance").reset_index()
    wide.columns = [str(c) for c in wide.columns]
    gini = pd.read_csv(DATA / "gini_series.csv").set_index("year")
    m = boundaries().merge(wide, on=UNIT_KEY, how="left").sort_values(UNIT_KEY)
    vals = wide[["2014", "2024"]].to_numpy(float)
    norm = LogNorm(vmin=float(vals[vals > 0].min()), vmax=float(vals.max()))

    widths = [EXTENT["ASEAN"][1] - EXTENT["ASEAN"][0]] * 2 + \
             [(EXTENT["Japan"][1] - EXTENT["Japan"][0]) * 1.35] * 2
    fig = plt.figure(figsize=(16, 5.6))
    gs = fig.add_gridspec(2, 4, width_ratios=widths, height_ratios=[1, 0.04],
                          wspace=0.04, hspace=0.08)
    for i, (grp, year) in enumerate([("ASEAN", 2014), ("ASEAN", 2024),
                                     ("Japan", 2014), ("Japan", 2024)]):
        ax = fig.add_subplot(gs[0, i])
        x0, x1, y0, y1 = EXTENT[grp]
        block = m[m["Group"] == grp]
        block.plot(column=str(year), cmap="inferno", norm=norm, ax=ax,
                   linewidth=0.05, edgecolor="#000000",
                   missing_kwds={"color": MISSING})
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_axis_off()
        ax.set_title(f"{grp} {year}", fontsize=15)
        key = "asean" if grp == "ASEAN" else "japan"
        ax.text(0.03, 0.03, f"Gini {gini.loc[year, key]:.3f}",
                transform=ax.transAxes, fontsize=13, color=GOLD,
                fontweight="bold", ha="left", va="bottom")
    cax = fig.add_subplot(gs[1, 1:3])
    cb = fig.colorbar(plt.cm.ScalarMappable(cmap="inferno", norm=norm), cax=cax,
                      orientation="horizontal")
    cb.set_label("Brightness around the average resident (log scale)", color=MUTED)
    cb.ax.tick_params(colors=MUTED)
    cb.outline.set_edgecolor(GRID)
    save(fig, "night_map.png")


def fig_gini_paths() -> None:
    g = pd.read_csv(DATA / "gini_series.csv")
    series = {"asean": ("ASEAN", STEEL, "-"),
              "japan": ("Japan (benchmark)", ORANGE, "--")}
    fig, ax = plt.subplots(figsize=(11, 5.4))
    for col, (label, colour, ls) in series.items():
        ax.fill_between(g.year, g[f"{col}_lo"], g[f"{col}_hi"], color=colour,
                        alpha=0.16, linewidth=0)
        ax.plot(g.year, g[col], color=colour, lw=3, ls=ls)
        ax.annotate(label, xy=(g.year.iloc[-1], g[col].iloc[-1]),
                    xytext=(10, 0), textcoords="offset points", va="center",
                    color=colour, fontsize=14, fontweight="bold")
        for idx in (0, -1):
            ax.plot(g.year.iloc[idx], g[col].iloc[idx], "o", color=colour, ms=8)
            ax.annotate(f"{g[col].iloc[idx]:.3f}",
                        xy=(g.year.iloc[idx], g[col].iloc[idx]),
                        xytext=(0, 14 if col == "asean" else -22),
                        textcoords="offset points", ha="center",
                        color=INK, fontsize=13, fontweight="bold")
    ax.set_xlim(g.year.min() - 0.5, g.year.max() + 2.6)
    ax.set_ylim(0.2, 0.7)
    ax.set_xticks(g.year[::2])
    ax.set_ylabel("Gap score: population-weighted Gini")
    ax.text(0.0, -0.16, "Shaded: 95% range from 2,000 resamples of regions",
            transform=ax.transAxes, color=MUTED, fontsize=10.5)
    style(ax)
    save(fig, "gini_paths.png")


def fig_gini_by_country() -> None:
    d = pd.read_csv(DATA / "gini_change.csv")
    d = d[d["group"] != "aggregate"].iloc[::-1].reset_index(drop=True)
    y = np.arange(len(d))
    colours = [ORANGE if grp == "Japan" else STEEL for grp in d["group"]]
    fig, ax = plt.subplots(figsize=(10, 5.6))
    for i, c in enumerate(colours):
        ax.plot([d.start[i], d.end[i]], [y[i], y[i]], color=c, lw=2, alpha=0.6)
    ax.scatter(d.start, y, s=70, facecolor=NAVY, edgecolor=colours, linewidth=2,
               zorder=3, label="2014")
    ax.scatter(d.end, y, s=70, color=colours, zorder=4, label="2024")
    labels = [f"{p} (benchmark)" if grp == "Japan" else
              (f"{p} *" if n < 10 else p)
              for p, grp, n in zip(d.panel, d.group, d.n)]
    ax.set_yticks(y)
    ax.set_yticklabels(labels, color=INK)
    ax.set_xlabel("Population-weighted Gini across the regions of each country")
    ax.legend(frameon=False, loc="lower right")
    ax.text(0.0, -0.17, "* fewer than 10 regions: fragile", transform=ax.transAxes,
            color=MUTED, fontsize=10.5)
    style(ax, "x")
    ax.spines["left"].set_visible(False)
    save(fig, "gini_by_country.png")


# ------------------------------------------------------------ Section 4 ---- #

def _shared_headroom(axes, top=0.18, bottom=0.08) -> None:
    ys = [y for ax in axes for ln in ax.get_lines()
          if len(set(np.asarray(ln.get_xdata()).tolist())) > 1
          for y in ln.get_ydata() if np.isfinite(y)]
    lo, hi = float(np.min(ys)), float(np.max(ys))
    rng = (hi - lo) or 1.0
    for ax in axes:
        ax.set_ylim(lo - bottom * rng, hi + top * rng)


def _quake(ax, x) -> None:
    ax.axvline(x, color=MUTED, lw=1.2, ls=":")
    ax.annotate("earthquake", xy=(x, 0.97), xycoords=("data", "axes fraction"),
                xytext=(4, 0), textcoords="offset points", fontsize=10.5,
                color=MUTED, va="top")


def fig_tohoku_official() -> None:
    p = pd.read_csv(DATA / "tohoku_paths.csv")
    p = p[p.spec == "offLevel"]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), sharey=True)
    for ax, unit in zip(axes, TREATED):
        g = p[p.treated == unit].sort_values("year")
        base = float(g.loc[g.year == 2010, "observed"].iloc[0])
        ax.plot(g.year, 100 * g.observed / base, color=STEEL, lw=2.6,
                label="what happened")
        ax.plot(g.year, 100 * g.counterfactual / base, color=MUTED, lw=2,
                ls="--", label="synthetic control")
        ax.set_title(unit, fontsize=15)
        style(ax)
    _shared_headroom(axes)
    for ax in axes:
        _quake(ax, 2010.5)
    axes[0].set_ylabel("Real value added (2010 = 100)")
    axes[0].legend(frameon=False, loc="upper left")
    fig.tight_layout()
    save(fig, "tohoku_official.png")


def _mticks(ax, lo, hi, every, start=None) -> None:
    start = lo if start is None else start
    ticks = list(range(start, hi + 1, every))
    ax.set_xticks(ticks)
    ax.set_xticklabels([month_label(t)[:4] if every >= 12 else month_label(t)
                        for t in ticks], fontsize=10)


def fig_tohoku_monthly() -> None:
    d = pd.read_csv(DATA / "tohoku_monthly_paths.csv")
    d = d[d.spec == "mean"]
    lo, hi = month_index(2009, 1), month_index(2012, 3)
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), sharey=True)
    for ax, unit in zip(axes, TREATED):
        g = d[(d.treated == unit) & d.t.between(lo, hi)].sort_values("t")
        t0 = int(g.t0.iloc[0])
        base = float(np.exp(g.loc[g.t.between(t0 - 12, t0 - 1), "observed"]).mean())
        ax.plot(g.t, 100 * np.exp(g.observed) / base, color=GOLD, lw=2.2,
                label="observed light")
        ax.plot(g.t, 100 * np.exp(g.counterfactual) / base, color=MUTED, lw=1.8,
                ls="--", label="synthetic control")
        ax.set_title(unit, fontsize=15)
        _mticks(ax, lo, hi, 12)
        style(ax)
    _shared_headroom(axes)
    for ax, unit in zip(axes, TREATED):
        _quake(ax, int(d.t0.iloc[0]) - 0.5)
    axes[0].set_ylabel("Brightness per km² (year before = 100)")
    axes[0].legend(frameon=False, loc="lower left")
    fig.tight_layout()
    save(fig, "tohoku_monthly.png")


def fig_tohoku_resilience() -> None:
    d = pd.read_csv(DATA / "tohoku_monthly_paths.csv")
    d = d[d.spec == "mean"]
    sens = pd.read_csv(DATA / "tohoku_monthly_resilience.csv")
    sens = sens[(sens.spec == "mean") & (sens.k == 3) & (sens.band_mult == 1.0)]
    t0 = int(d.t0.iloc[0])
    hi = month_index(2012, 3)
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), sharey=True)
    for ax, unit in zip(axes, TREATED):
        g = d[(d.treated == unit) & (d.t >= t0) & (d.t <= hi)].sort_values("t")
        row = sens[sens.treated == unit].iloc[0]
        band = float(row.band_pct)
        ax.axhspan(-band, band, color=MUTED, alpha=0.15, lw=0)
        ax.axhline(0, color=MUTED, lw=0.9)
        ax.plot(g.t, g.gap_pct, color=GOLD, lw=1, alpha=0.4)
        ax.plot(g.t, g.gap_smooth_pct, color=GOLD, lw=2.6, label="3-month mean")
        ti = int(g.gap_pct.values.argmin())
        frac = (g.t.values[ti] - t0) / max(hi - t0, 1)
        ha = "left" if frac < 0.15 else "right" if frac > 0.85 else "center"
        dx = {"left": 8, "right": -8, "center": 0}[ha]
        ax.plot(g.t.values[ti], g.gap_pct.values[ti], "o", ms=7, color=ORANGE)
        ax.annotate(f"{g.gap_pct.values[ti]:.1f}%",
                    xy=(g.t.values[ti], g.gap_pct.values[ti]),
                    xytext=(dx, -18), textcoords="offset points", ha=ha,
                    fontsize=12.5, color=ORANGE, fontweight="bold")
        if row.state == "recovered":
            y, mth = int(row.back_month[:4]), int(row.back_month[5:])
            bt = month_index(y, mth)
            ax.axvline(bt, color=TEAL, lw=1.4, ls="-.")
            ax.annotate(f"back {row.back_month}", xy=(bt, 0.96),
                        xycoords=("data", "axes fraction"), xytext=(-4, 0),
                        textcoords="offset points", fontsize=11, color=TEAL,
                        ha="right", va="top")
        else:
            ax.text(0.97, 0.96, "not back by 2012-03", transform=ax.transAxes,
                    fontsize=11, color=ORANGE, ha="right", va="top")
        ax.text(0.03, 0.04, f"{int(row.months_below)} of {int(row.n_post)} months below",
                transform=ax.transAxes, fontsize=11.5, color=INK, ha="left")
        ax.set_title(unit, fontsize=15)
        _mticks(ax, t0, hi, 6, start=t0)
        style(ax)
    _shared_headroom(axes, top=0.16, bottom=0.25)
    axes[0].set_ylabel("Gap from synthetic control (%)\nshaded: normal error")
    axes[1].legend(frameon=False, loc="lower right")
    fig.tight_layout()
    save(fig, "tohoku_resilience.png")


def fig_tohoku_effects() -> None:
    p = pd.read_csv(DATA / "tohoku_paths.csv")
    series = [("offLevel", "official output", STEEL, "-", "o"),
              ("ntlMean", "night light", GOLD, "--", "s")]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), sharey=True)
    for ax, unit in zip(axes, TREATED):
        for spec, label, colour, ls, mk in series:
            g = p[(p.spec == spec) & (p.treated == unit)].sort_values("year")
            post = g[g.year >= int(g.t0.iloc[0])]
            ax.plot(post.year, 100 * post.gap / post.counterfactual, color=colour,
                    lw=2.6, ls=ls, marker=mk, ms=6, label=label)
        ax.axhline(0, color=INK, lw=1)
        ax.set_title(unit, fontsize=15)
        ax.set_xticks(range(2011, 2019, 2))
        style(ax)
    axes[0].set_ylabel("Gap, % of synthetic control")
    axes[0].legend(frameon=False, loc="lower right")
    fig.tight_layout()
    save(fig, "tohoku_effects.png")


def fig_tohoku_placebos() -> None:
    p = pd.read_csv(DATA / "tohoku_paths.csv")
    pl = pd.read_csv(DATA / "tohoku_placebos.csv")
    spec = "offLevel"
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), sharey=True)
    for ax, unit in zip(axes, TREATED):
        q = pl[(pl.spec == spec) & (pl.treated == unit)]
        g = p[(p.spec == spec) & (p.treated == unit)].sort_values("year")
        t0 = int(g.t0.iloc[0])
        for _, dd in q.groupby("unit"):
            dd = dd.sort_values("year")
            s = float(np.sqrt((dd.loc[dd.year < t0, "gap"] ** 2).mean()))
            ax.plot(dd.year, dd.gap / s, color=MUTED, lw=0.8, alpha=0.35)
        rmspe = float(np.sqrt((g.loc[g.year < t0, "gap"] ** 2).mean()))
        ax.plot(g.year, g.gap / rmspe, color=STEEL, lw=2.8, label=unit)
        ax.axhline(0, color=INK, lw=0.9)
        ax.set_title(unit, fontsize=15)
        style(ax)
    _shared_headroom(axes)
    for ax in axes:
        _quake(ax, 2010.5)
    axes[0].set_ylabel("Output gap, in own\nprediction errors")
    fig.tight_layout()
    save(fig, "tohoku_placebos.png")


def main() -> None:
    fig_sdgi_map()
    fig_sdgi_scatter()
    fig_night_map()
    fig_gini_paths()
    fig_gini_by_country()
    fig_tohoku_official()
    fig_tohoku_monthly()
    fig_tohoku_resilience()
    fig_tohoku_effects()
    fig_tohoku_placebos()


if __name__ == "__main__":
    main()
