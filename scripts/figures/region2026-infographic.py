#!/usr/bin/env python3
"""Render the REGION 2026 infographic from the published Figure 1 and Table 3.

Usage: python3 scripts/figures/region2026-infographic.py --map luminosity_map.png --output-dir /tmp/region2026
Requirements: rsvg-convert and cwebp. Python standard library only.
Map: https://quarcs-lab.github.io/project2025s-py/images/luminosity_map.png
Evidence: https://doi.org/10.18335/region.v13i2.676, Figure 1 p.179; Table 3 p.184, Model 4.
The map's colors, geography, legend and aspect ratio are preserved. Quantitative
marks use a common linear 0–6% axis and the published rounded speeds, not values
recalculated from rounded regression coefficients. No intervals are asserted.
"""
import argparse
import base64
from pathlib import Path
import subprocess

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--map',required=True,type=Path)
p.add_argument('--output-dir',required=True,type=Path)
a=p.parse_args(); a.output_dir.mkdir(parents=True,exist_ok=True)
# Table 3, preferred Model 4: controls and state fixed effects, 520 districts.
results=[('OLS · without spillovers',3.0,23,'#88b9de',487),
         ('Spatial Durbin · total effect',5.2,13,'#e9c184',644)]
map_data=base64.b64encode(a.map.read_bytes()).decode()
svg=['''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
<rect width="1920" height="1080" fill="#050a12"/>
<style>text{font-family:Helvetica,Arial,sans-serif;fill:#edf2f6}.bold{font-weight:700}.muted{fill:#9baaba}</style>
<text class="bold" x="960" y="151" text-anchor="middle" font-size="124">How fast is India</text>
<text class="bold" x="960" y="277" text-anchor="middle" font-size="124" style="fill:#88b9de">catching up?</text>
<text class="muted" x="960" y="337" text-anchor="middle" font-size="34">520 DISTRICTS · 1996–2010 · NIGHTTIME LIGHTS PER PERSON</text>
<text x="96" y="397" font-size="28">Published satellite view · Figure 1</text>
''',f'<image x="96" y="423" width="810" height="461" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,{map_data}"/>',
'''<text x="1052" y="397" font-size="33" class="bold">Estimated annual convergence</text>
''']
# Both marks begin at zero; 110 pixels per percentage point.
x0=1052; scale=110
for label,speed,half,color,y in results:
 svg.extend([f'<text x="{x0}" y="{y-27}" font-size="29">{label}</text>',
 f'<rect x="{x0}" y="{y}" width="{speed*scale}" height="32" fill="{color}"/>',
 f'<text x="{x0+speed*scale+24}" y="{y+34}" font-size="57" class="bold" style="fill:{color}">{speed:.1f}%</text>'])
svg.append(f'<line x1="{x0}" y1="731" x2="{x0+6*scale}" y2="731" stroke="#9baaba" stroke-width="2"/>')
for tick in [0,2,4,6]:
 x=x0+tick*scale
 svg.append(f'<line x1="{x}" y1="731" x2="{x}" y2="741" stroke="#9baaba" stroke-width="2"/><text x="{x}" y="778" text-anchor="middle" class="muted" font-size="29">{tick}%</text>')
svg.extend(['''<text x="1052" y="836" font-size="37">Implied half-life: <tspan style="fill:#88b9de">23</tspan> → <tspan style="fill:#e9c184">13</tspan> years</text>
<text class="muted" x="1052" y="875" font-size="25">Table 3 · Model 4 · controls + state fixed effects</text>
<text class="bold" x="960" y="980" text-anchor="middle" font-size="98" style="fill:#e9c184">Faster estimated catch-up.</text>
<text class="muted" x="960" y="1032" text-anchor="middle" font-size="25">Mendez, Kabiraj &amp; Li (2026), REGION · CC BY 4.0 · Model estimates, not causal policy effects</text>
</svg>'''])
source=a.output_dir/'region2026-infographic.svg'; source.write_text('\n'.join(svg))
png=a.output_dir/'region2026-infographic.png'
webp=a.output_dir/'featured.webp'
subprocess.run(['rsvg-convert','-o',str(png),str(source)],check=True)
subprocess.run(['cwebp','-quiet','-q','92','-m','6',str(png),'-o',str(webp)],check=True)
print(f'{webp}: {webp.stat().st_size} bytes, 1920x1080')
