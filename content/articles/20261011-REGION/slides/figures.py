"""Deterministic SVG teaching figures; estimates transcribed from the published paper.
No empirical re-estimation. Run with Python 3 (standard library only).
"""
from pathlib import Path
import html, math

OUT = Path(__file__).parent / 'images'
NAVY, INK, MUTED = '#0f1729', '#e6ebf3', '#aebfd8'
STEEL, TEAL, ORANGE = '#6a9bcc', '#00d4c8', '#d97757'
def txt(x,y,s,size=24,color=INK,anchor='start',weight='normal'):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial, sans-serif" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}">{html.escape(str(s))}</text>'
def line(x1,y1,x2,y2,color=MUTED,width=2,dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def circle(x,y,r,color):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'
def save(name,content,h=350):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="{h}" viewBox="0 0 1100 {h}"><rect width="1100" height="{h}" fill="{NAVY}"/>{content}</svg>')

def bars(name,values,maximum,ticks,unit):
    p=''
    x0,scale=310,660/maximum
    for t in ticks:
        x=x0+t*scale
        p+=line(x,35,x,250,'#314058',1)+txt(x,286,str(t),22,MUTED,'middle')
    for i,(label,value,color) in enumerate(values):
        y=65+i*118
        p+=txt(286,y+36,label,25,INK,'end')
        p+=f'<rect x="{x0}" y="{y}" width="{value*scale}" height="56" rx="4" fill="{color}"/>'
        label_value=f'{value:.1f}%' if unit=='Percent per year' else f'{value:g} years'
        p+=txt(x0+value*scale+16,y+38,label_value,30,color,weight='bold')
    p+=txt(640,329,unit,22,MUTED,'middle')
    save(name,p)
bars('convergence-speed.svg',[('OLS',3.0,STEEL),('Spatial Durbin',5.2,TEAL)],6,[0,1,2,3,4,5,6],'Percent per year')
bars('half-life.svg',[('OLS',23,STEEL),('Spatial Durbin',13,TEAL)],28,[0,5,10,15,20,25],'Years to close half the initial steady-state gap')

# Six neighbors: schematic graph, explicitly not an empirical geographic map.
p=''
cx,cy=365,172
for i in range(6):
    angle=math.pi/3*i
    x,y=cx+160*math.cos(angle),cy+125*math.sin(angle)
    p+=line(cx,cy,x,y,STEEL,3)+circle(x,y,24,STEEL)+txt(x,y+8,str(i+1),22,NAVY,'middle','bold')
p+=circle(cx,cy,40,TEAL)+txt(cx,cy+9,'i',30,NAVY,'middle','bold')
p+=txt(620,95,'Each district has six neighbors',28,TEAL,weight='bold')
p+=txt(620,150,'Selected by centroid distance',25)
p+=txt(620,210,'Row weights sum to one',25)
p+=txt(620,270,'A spatial lag is their average',25)
save('six-neighbors.svg',p)

# Impact interpretation: arrows show statistical feedback, not causal identification.
p=''
for x,label,sub,color in [(185,'District i','Initial luminosity',ORANGE),(540,'District i','Growth',TEAL),(920,'Other districts','Growth',STEEL)]:
    p+=f'<rect x="{x-150}" y="85" width="300" height="130" rx="14" fill="#18263e" stroke="{color}" stroke-width="3"/>'
    p+=txt(x,136,label,29,color,'middle','bold')+txt(x,177,sub,23,INK,'middle')
p+=line(340,150,375,150,TEAL,4)+f'<path d="M365,141 L378,150 L365,159 Z" fill="{TEAL}"/>'
p+=line(695,150,750,150,STEEL,4)+f'<path d="M740,141 L753,150 L740,159 Z" fill="{STEEL}"/>'
p+=txt(540,270,'Direct: within-district response',24,TEAL,'middle')
p+=txt(920,270,'Indirect: across districts',24,STEEL,'middle')
p+=txt(550,325,'Total impact = direct + indirect, including spatial feedback',24,MUTED,'middle')
save('impact-interpretation.svg',p)

# Seven total impacts; no invented uncertainty intervals.
rows=[('4 nearest neighbors',-.032),('6 nearest neighbors (base)',-.037),('8 nearest neighbors',-.036),('Queen contiguity',-.035),('Rook contiguity',-.034),('Inverse distance',-.041),('Inverse distance squared',-.037)]
p=''
def xpos(v): return 395+(v+.045)/.020*595
for t in [-.045,-.040,-.035,-.030,-.025]:
    x=xpos(t);p+=line(x,18,x,328,'#314058',1)+txt(x,365,f'{t:.3f}',22,MUTED,'middle')
base=xpos(-.037);p+=line(base,18,base,328,TEAL,2,'6 6')
for i,(label,v) in enumerate(rows):
    y=40+i*44;color=TEAL if i==1 else STEEL
    p+=txt(370,y+7,label,22,INK,'end')+circle(xpos(v),y,8,color)+txt(xpos(v)+18,y+8,f'{v:.3f}',23,color)
p+=txt(700,404,'Total impact of initial log luminosity',23,MUTED,'middle')
save('robustness.svg',p,420)
