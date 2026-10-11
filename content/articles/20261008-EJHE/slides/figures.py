"""Original slide figures from published numerical facts, not publisher artwork.

Run with Python + numpy/matplotlib: python figures.py
All source numbers are from doi:10.1007/s10198-026-01998-1.
Table 2: posterior means; Table 4 column 5: reported TWFE turning points;
Table 7: observed GDP per capita support, constant 2015 USD.
No raw study observations, estimated model weights, or intervals are fabricated.
"""
import os
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR', '/tmp/ejhe-slides-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

OUT = Path(__file__).parent / 'images'
OUT.mkdir(exist_ok=True)
BG, PANEL, INK = '#050a12', '#0a121d', '#edf2f6'
BLUE, GOLD, MUTED = '#88b9de', '#e9c184', '#9baaba'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':18,'text.color':INK,
 'axes.labelcolor':INK,'xtick.color':MUTED,'ytick.color':MUTED,'svg.fonttype':'path'})
lo, hi = 620.560, 84611.100
income = np.geomspace(lo, hi, 700)
x, x0 = np.log(income), np.log(10000)
fig, ax = plt.subplots(figsize=(14,5.1), facecolor=BG)
ax.set_facecolor(PANEL)
for b, color, style, label in [([-189.358,21.620,-.804],BLUE,'-','Fixed prior (UIP)'),
                              ([-187.464,21.405,-.796],GOLD,(0,(6,3)),'Robust prior')]:
    y = sum(b[i]*(x**(i+1)-x0**(i+1)) for i in range(3))
    ax.plot(income,y,lw=3.8,color=color,ls=style,label=label)
ax.set_xscale('log'); ax.set_xlim(lo,hi); ax.set_ylim(-6,4)
ax.set_xticks([1000,3000,10000,30000,80000], ['1,000','3,000','10,000','30,000','80,000'])
ax.set_yticks([-6,-3,0,3],['−6','−3','0','+3']); ax.minorticks_off()
ax.axhline(0,color=MUTED,lw=1,alpha=.5)
ax.set_xlabel('GDP per person · constant 2015 USD · log scale',labelpad=12)
ax.set_ylabel('Income component\n(pp vs. income = $10,000)',labelpad=12)
for name, spine in ax.spines.items(): spine.set_color(MUTED if name in ['bottom','left'] else PANEL)
ax.legend(loc='lower right',frameon=False,labelcolor=INK,fontsize=17)
fig.tight_layout(pad=1.1); fig.savefig(OUT/'income-curve.svg',facecolor=BG); plt.close(fig)

fig, ax = plt.subplots(figsize=(14,4.4),facecolor=BG)
ax.set_facecolor(BG); ax.set_xscale('log'); ax.set_xlim(lo,hi); ax.set_ylim(-.8,1)
ax.plot([lo,hi],[0,0],lw=5,color=MUTED)
for t, cap, color in [(2445.66,'First bend\n$2,445.66',BLUE),(24983.24,'Second bend\n$24,983.24',GOLD)]:
    ax.scatter(t,0,s=240,color=color,zorder=3)
    ax.annotate(cap,(t,0),xytext=(0,35),textcoords='offset points',ha='center',color=color,fontsize=23,weight='bold')
ax.text(lo,-.35,'Observed minimum\n$620.56',ha='left',color=MUTED,fontsize=18)
ax.text(hi,-.35,'Observed maximum\n$84,611.10',ha='right',color=MUTED,fontsize=18)
ax.set_yticks([]); ax.set_xticks([1000,3000,10000,30000],['1,000','3,000','10,000','30,000'])
ax.minorticks_off(); ax.set_xlabel('GDP per person · constant 2015 USD · log scale',labelpad=18)
for s in ax.spines.values(): s.set_visible(False)
fig.tight_layout(pad=1.4); fig.savefig(OUT/'turning-points.svg',facecolor=BG); plt.close(fig)

# Plain, explicitly conceptual diagram. Equal box sizes encode no probabilities.
svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="380" viewBox="0 0 1400 380" role="img" aria-label="Conceptual model averaging workflow">
<rect width="1400" height="380" fill="#050a12"/>
<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#9baaba"/></marker></defs>
<g font-family="Arial,sans-serif" text-anchor="middle">
<rect x="20" y="80" width="380" height="220" rx="18" fill="#0a121d" stroke="#88b9de" stroke-width="2"/>
<rect x="510" y="80" width="380" height="220" rx="18" fill="#0a121d" stroke="#88b9de" stroke-width="2"/>
<rect x="1000" y="80" width="380" height="220" rx="18" fill="#0a121d" stroke="#e9c184" stroke-width="2"/>
<g fill="#edf2f6" font-size="36" font-weight="bold"><text x="210" y="145">Compare</text><text x="700" y="145">Weight</text><text x="1190" y="145">Average</text></g>
<g fill="#9baaba" font-size="29"><text x="210" y="208">Different predictor sets</text><text x="210" y="250">Same outcome</text><text x="700" y="208">Posterior model</text><text x="700" y="250">probabilities</text><text x="1190" y="208">Evidence across</text><text x="1190" y="250">plausible models</text></g>
<path d="M420 190H485" stroke="#9baaba" stroke-width="4" marker-end="url(#arrow)"/>
<path d="M910 190H975" stroke="#9baaba" stroke-width="4" marker-end="url(#arrow)"/>
<text x="700" y="355" font-size="24" fill="#9baaba">Conceptual schematic · not fitted model weights</text>
</g></svg>'''
(OUT/'model-averaging.svg').write_text(svg)
print('Generated 3 original SVG figures with explicit source quantities.')
