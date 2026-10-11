"""Deterministic research infographic from published Table 2 posterior means.

Run: python build_infographic.py [output-directory]
Requires matplotlib, numpy and Pillow. No fitted observations or uncertainty
bands are synthesized. The underlying study data are available on request.
"""
import json
import os
from pathlib import Path
import sys

os.environ.setdefault('MPLCONFIGDIR', '/tmp/wealth-weight-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

SOURCE = Path(__file__).with_name('infographic-data.json')
data = json.loads(SOURCE.read_text())
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('output')
out.mkdir(parents=True, exist_ok=True)
BG, PANEL, INK = '#050a12', '#0a121d', '#edf2f6'
BLUE, GOLD, MUTED = '#88b9de', '#e9c184', '#9baaba'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'text.color': INK,
                     'axes.labelcolor': INK, 'xtick.color': MUTED, 'ytick.color': MUTED})
fig = plt.figure(figsize=(16, 9), dpi=160, facecolor=BG)
fig.text(.5, .87, 'Wealth up,', ha='center', fontsize=66, weight='bold', color=INK)
fig.text(.5, .755, 'obesity down?', ha='center', fontsize=66, weight='bold', color=BLUE)
fig.text(.5, .702, '84 COUNTRIES  ·  2000–2020  ·  BAYESIAN MODEL AVERAGING',
         ha='center', fontsize=16, color=MUTED)
ax = fig.add_axes([.125, .31, .80, .34], facecolor=PANEL)
income = np.geomspace(*data['gdp_per_capita_range'], 700)
x, x0 = np.log(income), np.log(data['reference_income'])
for model, color, style in zip(data['models'], [BLUE, GOLD], ['-', (0, (6, 3))]):
    b = np.array(model['coefficients'])
    y = sum(b[i] * (x ** (i+1) - x0 ** (i+1)) for i in range(3))
    ax.plot(income, y, color=color, linestyle=style, linewidth=4,
            label=model['label'], solid_capstyle='round')
ax.set_xscale('log')
ax.set_xlim(data['gdp_per_capita_range'])
ax.set_ylim(-6, 4)
ax.set_xticks([1000, 3000, 10000, 30000, 80000],
             ['1,000', '3,000', '10,000', '30,000', '80,000'])
ax.set_yticks([-6, -3, 0, 3], ['−6', '−3', '0', '+3'])
ax.tick_params(labelsize=14, length=5, pad=8)
ax.minorticks_off()
ax.axhline(0, color=MUTED, linewidth=1, alpha=.65)
ax.set_ylabel('Income component of obesity\n(pp relative to GDP/person = $10,000)',
              fontsize=14, labelpad=12)
ax.set_xlabel('GDP per person · constant 2015 US dollars · logarithmic scale',
              fontsize=15, labelpad=12)
for name, spine in ax.spines.items():
    spine.set_color(MUTED if name in ['bottom', 'left'] else PANEL)
ax.legend(loc='lower right', facecolor=PANEL, edgecolor='none', labelcolor=INK,
          fontsize=15, handlelength=3)
fig.text(.5, .20, 'Reconstructed from Table 2 posterior means · 1,195 observations · No uncertainty band shown',
         ha='center', color=MUTED, fontsize=13)
fig.text(.5, .09, 'Not at every income.', ha='center', color=GOLD,
         weight='bold', fontsize=53)
fig.text(.5, .045, 'Restrepo Gómez, Du & Mendez (2026) · Model associations, not causal effects',
         ha='center', color=MUTED, fontsize=13)
png = out / 'wealth-and-weight-infographic.png'
fig.savefig(png, dpi=160, facecolor=BG)
plt.close(fig)
with Image.open(png) as im:
    im.save(out/'featured.webp', format='WEBP', lossless=True, method=6)
    for width in [640, 320, 160, 96]:
        preview = im.resize((width, round(width*9/16)), Image.Resampling.LANCZOS)
        preview.save(out/f'preview-{width}.png')
print(json.dumps({p.name: {'bytes': p.stat().st_size, 'dimensions': Image.open(p).size}
                  for p in out.glob('*') if p.suffix in ['.webp', '.png']}, indent=2))
