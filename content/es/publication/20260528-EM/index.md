---
title: "La ley de Okun y los regímenes espaciales en Indonesia: un enfoque de aprendizaje automático"
authors:
- Tifani Husna Siregar
- Harry Aginta
- admin


date: "2026-05-28T00:00:00Z"
doi: "10.1016/j.econmod.2026.107687"

# Schedule page publish date (NOT publication's date).
publishDate: "2026-05-28T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Economic Modelling*"
publication_short: ""

abstract: "Estudiamos cómo el crecimiento del producto se traduce en cambios del desempleo entre los distritos de Indonesia, durante el período 2011-2020. En lugar de imponer grupos geográficos predeterminados, aplicamos un enfoque guiado por los datos para identificar distritos con dinámicas similares de crecimiento y desempleo. Encontramos que la relación entre el crecimiento y el desempleo (la ley de Okun) varía notablemente entre distritos: el crecimiento reduce sustancialmente el desempleo en algunos, mientras que es insignificante o incluso se invierte en otros. Para tener en cuenta la dependencia espacial entre distritos, estimamos modelos espaciales que descomponen el efecto total en la respuesta propia de cada distrito y los desbordamientos provenientes de los distritos vecinos. Estos desbordamientos son a la vez estadísticamente significativos y económicamente considerables, lo que sugiere que los choques de crecimiento se difunden mucho más allá de las fronteras de cada distrito. En conjunto, nuestros hallazgos subrayan las limitaciones de las estimaciones agregadas de Okun y la necesidad de políticas adaptadas localmente y coordinadas entre regiones vecinas."

# Summary. An optional shortened abstract.
summary: "La ley de Okun varía notablemente entre los distritos de Indonesia, y los choques de crecimiento se desbordan hacia las regiones vecinas, lo que exige políticas laborales adaptadas localmente y coordinadas."

math: true
diagram: true

tags:
- Okun's law
- machine learning
- spatial Durbin model
- classify lasso
- labor heterogeneity
- Indonesia


featured: false

# Icons: https://fontawesome.com/search

links:
  - name: "Artículo publicado"
    url: "https://doi.org/10.1016/j.econmod.2026.107687"
    icon_pack: fas
    icon: university
  - icon: file-pdf
    icon_pack: fas
    name: Documento de trabajo
    url: working-paper.pdf
  - icon: podcast
    icon_pack: fas
    name: Pódcast con IA
    url: "/publication/20260528-em/#podcast-player"
url_poster: ''
url_project: ''



# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
#projects: []

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---



## El enigma

La ley de Okun es una de las regularidades más fiables de la macroeconomía: cuando el producto crece, el desempleo cae. Sin embargo, estimada para Indonesia como una sola economía, la relación no se sostiene. La razón es la agregación. Un archipiélago vasto y heterogéneo no es un único mercado laboral, y un promedio nacional cancela silenciosamente las regiones que se mueven en direcciones opuestas. La pregunta, entonces, no es *si* la ley de Okun se cumple en Indonesia, sino *dónde*.

---

## Un enfoque guiado por los datos en dos pasos

En lugar de imponer grupos geográficos de antemano (por ejemplo, "Oeste" frente a "Este"), los autores dejan que los datos ordenen los distritos en grupos con dinámicas similares de crecimiento y desempleo, y luego modelan cómo esas dinámicas se desbordan a través del espacio. El marco es descriptivo: mapea asociaciones, no efectos causales.

```mermaid
graph LR
    A["<b>Paso 1 — C-Lasso</b><br/>(aprendizaje automático)<br/><i>Ordena los distritos en regímenes latentes<br/>que comparten un patrón de crecimiento-desempleo</i>"]
    B["<b>Paso 2 — Modelo espacial de Durbin</b><br/><i>Divide la respuesta de cada régimen en una<br/>asociación directa (local) e indirecta (desbordamiento<br/>hacia los vecinos)</i>"]

    A --> B

    style A fill:#6a9bcc,stroke:#141413,color:#fff
    style B fill:#d97757,stroke:#141413,color:#fff
```

---

## Cuatro regímenes latentes

El clasificador descubre **cuatro regímenes distintos** que cruzan la geografía administrativa y física: los distritos del mismo grupo no tienen por qué ser vecinos. Cada uno cuenta una historia diferente sobre cómo el crecimiento se encuentra con el mercado laboral.

| Régimen | Perfil estructural | Ejemplos | Comportamiento de Okun |
| :--- | :--- | :--- | :--- |
| **Grupo 1** | Centros que absorben mano de obra: metrópolis, cinturones industriales, plantaciones de pequeños productores | Bekasi, Yakarta Norte, Makassar, Medan | **Fuerte, de manual.** El crecimiento se mueve junto con la caída del desempleo, tanto a nivel local como en los vecinos. |
| **Grupo 2** | Polos intensivos en capital: zonas de recursos, agricultura corporativa mecanizada | Balikpapan, Yakarta Central, focos rurales de Java | **Invertido.** Un crecimiento más rápido se asocia con un desempleo abierto medido *más alto*. |
| **Grupo 3** | Centros en transición: ciudades secundarias que pasan de la agricultura a los servicios | Cilacap, Indramayu, Malang | **Débil.** Escaso vínculo de base; el ajuste opera a través de las horas trabajadas, no de los despidos. |
| **Grupo 4** | Mercados periféricos: economías rurales insulares delgadas y aisladas | Papúa remota, Nusa Tenggara Oriental | **Insignificante.** La informalidad generalizada corta el vínculo con el desempleo formal. |

> **¿Por qué el crecimiento se mueve junto con un desempleo *creciente* en el Grupo 2?**
> Donde predominan la industria intensiva en capital y la agricultura corporativa, el crecimiento suele llegar a través de la mecanización que desplaza a la mano de obra agrícola tradicional. A medida que los trabajadores desplazados abandonan el trabajo informal o familiar para buscar empleos asalariados formales, entran en las estadísticas como "desempleados abiertos". El desempleo medido aumenta junto con el producto debido a las fricciones de búsqueda y al desajuste de competencias, no porque el crecimiento en sí destruya empleos.

---

## Robustez a nivel provincial

Para comprobar que el patrón no es un artefacto del ruido a nivel de distrito, los autores vuelven a aplicar el marco a 34 provincias. Este reproduce una estructura similar, ahora en tres regímenes:

* **Provincias diversificadas y con demanda abundante**: polos industriales y de consumo con un pronunciado coeficiente de Okun de $-0.262$.
* **Corazones de productos básicos agrícolas**: grandes plantaciones corporativas donde el crecimiento es localmente "sin empleo" pero genera desbordamientos hacia los vecinos.
* **Enclaves de frontera de productos básicos**: mercados laborales delgados ligados a la minería y la industria pesada, con un coeficiente casi plano de $-0.033$.

---

## Los desbordamientos espaciales importan

El ajuste del mercado laboral no se detiene en las fronteras de los distritos. Los cambios en el desempleo están correlacionados entre distritos vecinos ($\rho = 0.135$), de modo que un choque de crecimiento en un lugar alcanza al siguiente.

Separar las respuestas locales de los desbordamientos es lo que hace visible este fenómeno. En el Grupo 1, el crecimiento se asocia con un menor desempleo en el propio distrito (asociación directa $-0.112$) *y* con un menor desempleo en el vecino (desbordamiento indirecto $-0.077$). Un modelo que ignore los desbordamientos pasaría por alto prácticamente toda la huella vecina del impulso regional.

---

## Conclusiones clave

* **Las estimaciones agregadas inducen a error.** Un único coeficiente de Okun nacional promedia regímenes cuyas asociaciones entre crecimiento y desempleo apuntan en direcciones opuestas.
* **Los polos diversificados son el motor.** En los distritos metropolitanos y de plantaciones de pequeños productores (Grupo 1), las ganancias de producto se traducen de la manera más fiable en creación de empleo, tanto en el propio distrito como en los cercanos.
* **El cambio estructural reconfigura la absorción.** Pasar de la agricultura familiar a la agricultura corporativa mecanizada reduce la cantidad de trabajadores que la economía local absorbe por unidad de producto.
* **La informalidad oculta la holgura.** En las regiones periféricas (Grupo 4), las cifras de desempleo abierto subestiman las dificultades porque la gente recurre al subempleo y al trabajo informal.

---

## Preguntas abiertas

1. Si el crecimiento intensivo en capital (Grupo 2) sigue empujando a los trabajadores agrícolas desplazados hacia el desempleo abierto, ¿cómo pueden los gobiernos locales crear canales de capacitación que los reorienten hacia empleos modernos en los servicios?
2. Dado cuánto de la asociación total opera a través de los desbordamientos en las zonas que absorben mano de obra, ¿debería la planificación pasar de metas distritales aisladas hacia corredores económicos coordinados de varios distritos?

---

<style>
.podcast-overlay {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  animation: podSlideUp 0.35s ease-out;
}
@keyframes podSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.podcast-overlay.pod-closing {
  animation: podSlideDown 0.3s ease-in forwards;
}
@keyframes podSlideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
.podcast-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 18px 24px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 -4px 32px rgba(0,0,0,0.5);
  border-top: 1px solid rgba(106,155,204,0.2);
}
.podcast-inner {
  max-width: 800px;
  margin: 0 auto;
}
.podcast-top-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.podcast-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #d97757, #e8956a);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.podcast-icon svg {
  width: 22px;
  height: 22px;
  fill: #fff;
}
.podcast-title-block {
  flex: 1;
  min-width: 0;
}
.podcast-title-block h4 {
  margin: 0 0 1px 0;
  color: #f0ece2;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.podcast-title-block span {
  color: #8b9dc3;
  font-size: 11px;
}
.podcast-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.podcast-close-btn:hover {
  background: rgba(255,255,255,0.1);
}
.podcast-close-btn svg {
  width: 20px;
  height: 20px;
  fill: #8b9dc3;
}
.podcast-progress-wrap {
  margin-bottom: 12px;
}
.podcast-time-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8b9dc3;
  margin-bottom: 5px;
  font-variant-numeric: tabular-nums;
}
.podcast-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: height 0.15s;
}
.podcast-bar-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(106,155,204,0.25);
  border-radius: 3px;
  transition: width 0.3s;
}
.podcast-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #6a9bcc, #00d4c8);
  border-radius: 3px;
  transition: width 0.1s linear;
}
.podcast-bar-bg:hover {
  height: 10px;
  margin-top: -2px;
}
.podcast-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.podcast-transport {
  display: flex;
  align-items: center;
  gap: 8px;
}
.podcast-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.podcast-btn svg {
  fill: #c8d0e0;
  transition: fill 0.2s;
}
.podcast-btn:hover svg {
  fill: #f0ece2;
}
.podcast-btn-skip {
  position: relative;
}
.podcast-btn-skip span {
  position: absolute;
  font-size: 7px;
  font-weight: 700;
  color: #c8d0e0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  margin-top: 1px;
}
.podcast-btn-play {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d97757, #e8956a);
  border-radius: 50%;
  box-shadow: 0 3px 12px rgba(217,119,87,0.4);
  transition: all 0.2s;
}
.podcast-btn-play:hover {
  transform: scale(1.08);
  box-shadow: 0 5px 20px rgba(217,119,87,0.5);
}
.podcast-btn-play svg {
  fill: #fff;
  width: 22px;
  height: 22px;
}
.podcast-extras {
  display: flex;
  align-items: center;
  gap: 10px;
}
.podcast-volume-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}
.podcast-volume-wrap svg {
  fill: #8b9dc3;
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.podcast-volume-wrap svg:hover {
  fill: #c8d0e0;
}
.podcast-volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 60px;
  height: 4px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.podcast-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #6a9bcc;
  border-radius: 50%;
  cursor: pointer;
}
.podcast-speed-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #c8d0e0;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  min-width: 40px;
  text-align: center;
}
.podcast-speed-btn:hover {
  background: rgba(106,155,204,0.2);
  border-color: #6a9bcc;
  color: #f0ece2;
}
.podcast-download-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8b9dc3;
  font-size: 11px;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.2s;
}
.podcast-download-btn:hover {
  border-color: #6a9bcc;
  color: #f0ece2;
  background: rgba(106,155,204,0.1);
}
.podcast-download-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
@media (max-width: 600px) {
  .podcast-container { padding: 14px 16px 16px; }
  .podcast-volume-wrap { display: none; }
  .podcast-title-block h4 { font-size: 13px; }
  .podcast-extras { gap: 8px; }
}
</style>

<div class="podcast-overlay" id="podOverlay">
<div class="podcast-container">
<div class="podcast-inner">
  <audio id="podAudio" preload="none" src="https://files.catbox.moe/i3g2l3.m4a"></audio>

  <div class="podcast-top-row">
    <div class="podcast-icon">
      <svg viewBox="0 0 24 24"><path d="M12 1a5 5 0 0 0-5 5v4a5 5 0 0 0 10 0V6a5 5 0 0 0-5-5zm0 16a7 7 0 0 1-7-7H3a9 9 0 0 0 8 8.94V22h2v-3.06A9 9 0 0 0 21 10h-2a7 7 0 0 1-7 7z"/></svg>
    </div>
    <div class="podcast-title-block">
      <h4>Pódcast con IA: la ley de Okun y los regímenes espaciales en Indonesia</h4>
      <span id="podDurationLabel">Haga clic en reproducir para cargar</span>
    </div>
    <button class="podcast-close-btn" onclick="podClose()" title="Cerrar reproductor">
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
  </div>

  <div class="podcast-progress-wrap">
    <div class="podcast-time-row">
      <span id="podCurrent">0:00</span>
      <span id="podDuration">0:00</span>
    </div>
    <div class="podcast-bar-bg" id="podBarBg" onclick="podSeek(event)">
      <div class="podcast-bar-buffered" id="podBuffered"></div>
      <div class="podcast-bar-progress" id="podProgress"></div>
    </div>
  </div>

  <div class="podcast-controls-row">
    <div class="podcast-transport">
      <button class="podcast-btn podcast-btn-skip" onclick="podSkip(-15)" title="Retroceder 15s">
        <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
        <span>15</span>
      </button>
      <button class="podcast-btn podcast-btn-play" id="podPlayBtn" onclick="podToggle()" title="Reproducir">
        <svg id="podIconPlay" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="podIconPause" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <button class="podcast-btn podcast-btn-skip" onclick="podSkip(15)" title="Avanzar 15s">
        <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>
        <span>15</span>
      </button>
    </div>
    <div class="podcast-extras">
      <div class="podcast-volume-wrap">
        <svg id="podVolIcon" onclick="podMute()" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5zM14 3.23v2.06a6.51 6.51 0 0 1 0 13.42v2.06A8.51 8.51 0 0 0 14 3.23z"/></svg>
        <input type="range" class="podcast-volume-slider" id="podVolume" min="0" max="1" step="0.05" value="0.8">
      </div>
      <button class="podcast-speed-btn" id="podSpeedBtn" onclick="podCycleSpeed()" title="Velocidad de reproducción">1x</button>
      <a class="podcast-download-btn" href="https://files.catbox.moe/i3g2l3.m4a" target="_blank" rel="noopener" title="Transmitir">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
      </a>
    </div>
  </div>
</div>
</div>
</div>

<script>
(function(){
  var overlay = document.getElementById('podOverlay');
  var a = document.getElementById('podAudio');
  var speeds = [0.75, 1, 1.25, 1.5, 2];
  var si = 1;
  var opened = false;
  function fmt(s){
    if(isNaN(s)) return '0:00';
    var m=Math.floor(s/60), sec=Math.floor(s%60);
    return m+':'+(sec<10?'0':'')+sec;
  }
  document.addEventListener('click', function(e){
    var link = e.target.closest('a.btn-page-header');
    if(!link) return;
    var text = link.textContent.trim();
    if(text.indexOf('AI Podcast') === -1) return;
    e.preventDefault();
    e.stopPropagation();
    overlay.style.display = 'block';
    overlay.classList.remove('pod-closing');
    if(!opened){
      a.preload = 'metadata';
      a.load();
      opened = true;
    }
  });
  a.volume = 0.8;
  a.addEventListener('loadedmetadata', function(){
    document.getElementById('podDuration').textContent = fmt(a.duration);
    document.getElementById('podDurationLabel').textContent = fmt(a.duration) + ' minutes';
  });
  a.addEventListener('timeupdate', function(){
    document.getElementById('podCurrent').textContent = fmt(a.currentTime);
    var pct = a.duration ? (a.currentTime/a.duration)*100 : 0;
    document.getElementById('podProgress').style.width = pct+'%';
  });
  a.addEventListener('progress', function(){
    if(a.buffered.length>0){
      var pct = (a.buffered.end(a.buffered.length-1)/a.duration)*100;
      document.getElementById('podBuffered').style.width = pct+'%';
    }
  });
  a.addEventListener('ended', function(){
    document.getElementById('podIconPlay').style.display='';
    document.getElementById('podIconPause').style.display='none';
  });
  window.podToggle = function(){
    if(a.paused){a.play();document.getElementById('podIconPlay').style.display='none';document.getElementById('podIconPause').style.display='';}
    else{a.pause();document.getElementById('podIconPlay').style.display='';document.getElementById('podIconPause').style.display='none';}
  };
  window.podSkip = function(s){a.currentTime = Math.max(0,Math.min(a.duration||0,a.currentTime+s));};
  window.podSeek = function(e){
    var rect = document.getElementById('podBarBg').getBoundingClientRect();
    var pct = (e.clientX - rect.left)/rect.width;
    a.currentTime = pct * (a.duration||0);
  };
  window.podMute = function(){
    a.muted = !a.muted;
    document.getElementById('podVolume').value = a.muted ? 0 : a.volume;
  };
  window.podCycleSpeed = function(){
    si = (si+1) % speeds.length;
    a.playbackRate = speeds[si];
    document.getElementById('podSpeedBtn').textContent = speeds[si]+'x';
  };
  window.podClose = function(){
    overlay.classList.add('pod-closing');
    setTimeout(function(){ overlay.style.display='none'; }, 300);
    a.pause();
    document.getElementById('podIconPlay').style.display='';
    document.getElementById('podIconPause').style.display='none';
  };
  document.getElementById('podVolume').addEventListener('input', function(){
    a.volume = this.value;
    a.muted = false;
  });
  if(window.location.hash === '#podcast-player'){
    overlay.style.display = 'block';
    a.preload = 'metadata';
    a.load();
    opened = true;
  }
})();
</script>
