---
title: "インドネシアにおけるオークンの法則と空間レジーム：機械学習によるアプローチ"
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

abstract: "本研究は、2011年から2020年の期間において、産出の成長がインドネシアの各県の失業の変化へどのように波及するかを検討します。あらかじめ定められた地理的グループを課すのではなく、成長と失業の動態が類似する県を識別するために、データ駆動型のアプローチを適用します。その結果、成長と失業の関係（オークンの法則）は県によって著しく異なることが分かりました——成長が一部の県では失業を大幅に減少させる一方、別の県ではその効果が無視できるほど小さい、あるいは逆転さえします。県間の空間的依存性を考慮するため、空間モデルを推定し、総効果を各県自身の反応と近隣県からの波及効果へと分解します。これらの波及効果は統計的に有意であると同時に経済的にも相当の大きさを持っており、成長ショックが個々の県境をはるかに越えて拡散することを示唆しています。総じて、本研究の知見は、集計されたオークン推定値の限界と、地域の実情に合わせ近隣地域間で調整された政策の必要性を浮き彫りにします。"

# Summary. An optional shortened abstract.
summary: "オークンの法則はインドネシアの県ごとに著しく異なり、成長ショックは近隣地域へと波及します——地域の実情に合わせ調整された労働政策が求められます。"

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
  - name: "出版論文"
    url: "https://doi.org/10.1016/j.econmod.2026.107687"
    icon_pack: fas
    icon: university
  - icon: file-pdf
    icon_pack: fas
    name: ワーキングペーパー
    url: working-paper.pdf
  - icon: podcast
    icon_pack: fas
    name: AIポッドキャスト
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



## 問いの所在

オークンの法則は、マクロ経済学において最も信頼できる規則性の一つです——産出が成長すれば、失業は減少します。ところが、インドネシアを単一の経済として推定すると、この関係は成り立ちません。その理由は集計にあります。広大で多様な群島は一つの労働市場ではなく、全国平均は逆方向に動く地域同士を静かに打ち消してしまいます。したがって、問うべきはインドネシアでオークンの法則が成り立つ*かどうか*ではなく、*どこで*成り立つのか、ということなのです。

---

## 二段階のデータ駆動型アプローチ

著者らは、地理的グループ（たとえば「西部」対「東部」）をあらかじめ課すのではなく、成長と失業の動態が類似する県をデータに分類させ、その動態が空間をどのように波及するかをモデル化します。この枠組みは記述的なものであり——因果効果ではなく、関連性を描き出します。

```mermaid
graph LR
    A["<b>ステップ1 — C-Lasso</b><br/>（機械学習）<br/><i>成長と失業のパターンを共有する潜在<br/>レジームへ県を分類する</i>"]
    B["<b>ステップ2 — 空間ダービンモデル</b><br/><i>各レジームの反応を直接的（局所的）な<br/>関連と間接的（近隣への波及）な関連へ<br/>分割する</i>"]

    A --> B

    style A fill:#6a9bcc,stroke:#141413,color:#fff
    style B fill:#d97757,stroke:#141413,color:#fff
```

---

## 四つの潜在レジーム

分類器は、行政区分や自然地理を横断する**四つの異なるレジーム**を明らかにします——同じグループに属する県が必ずしも隣接しているとは限りません。それぞれが、成長が労働市場と出会うあり方について異なる物語を語っています。

| レジーム | 構造的プロファイル | 例 | オークンの挙動 |
| :--- | :--- | :--- | :--- |
| **グループ1** | 労働吸収型の中心地——大都市、工業地帯、小農プランテーション | ブカシ、北ジャカルタ、マカッサル、メダン | **強い、教科書どおり。** 成長が、局所的にも近隣においても失業の減少と連動する。 |
| **グループ2** | 資本集約型の拠点——資源地帯、機械化された企業農業 | バリクパパン、中央ジャカルタ、ジャワ農村部の一部 | **逆転。** より速い成長が、計測される*より高い*顕在的失業と並行して進む。 |
| **グループ3** | 移行期の中心地——農業からサービス業へ移行しつつある中核都市 | チラチャップ、インドラマユ、マラン | **弱い。** ベースラインの関連はわずかで、調整は解雇ではなく労働時間を通じて進む。 |
| **グループ4** | 周辺的な市場——薄く孤立した農村の島嶼経済 | パプアの遠隔地、東ヌサ・トゥンガラ | **無視できる。** 蔓延するインフォーマル性が、顕在的失業との結びつきを断ち切る。 |

> **なぜグループ2では、成長が失業の*上昇*と連動するのでしょうか。**
> 資本集約型の産業や企業農業が支配的な地域では、成長はしばしば伝統的な農業労働を置き換える機械化を通じてもたらされます。職を失った労働者がインフォーマルな仕事や家族労働を離れ、フォーマルな賃金雇用を探し始めると、彼らは「顕在的失業者」として統計に計上されます。計測される失業は、探索の摩擦やスキルのミスマッチを通じて産出とともに上昇するのであって——成長そのものが雇用を破壊するからではありません。

---

## 州レベルでの頑健性

このパターンが県レベルのノイズの産物ではないことを確認するため、著者らはこの枠組みを34の州について再実行します。それは類似した構造を再現し、今度は三つのレジームとして現れます。

* **多角化された需要豊富な州**——急峻なオークン係数 $-0.262$ を持つ、工業と消費の拠点。
* **農業コモディティの中核地**——成長が局所的には「雇用なき」ものだが、近隣への波及を生み出す大規模企業プランテーション。
* **コモディティ・フロンティアの飛び地**——鉱業や重工業に結びついた薄い労働市場で、ほぼ平坦な係数 $-0.033$ を持つ。

---

## 空間的波及効果が重要である

労働市場の調整は県境で止まりません。失業の変化は近隣県の間で相関しており（$\rho = 0.135$）、ある場所で生じた成長ショックは隣へと届きます。

局所的な反応を波及効果から切り分けることが、これを可視化します。グループ1では、成長は自県における失業の低下（直接的関連 $-0.112$）*とともに*、隣県における失業の低下（間接的波及 $-0.077$）とも結びついています。波及効果を無視するモデルは、地域的な勢いが近隣に及ぼす影響のほぼ全体を見落としてしまうでしょう。

---

## 主要な知見

* **集計推定値は誤導する。** 単一の全国オークン係数は、成長と失業の関連が逆方向を指すレジーム同士を平均化してしまう。
* **多角化された拠点が原動力である。** 大都市や小農プランテーションの県（グループ1）では、産出の増加が、自県でも近隣でも最も確実に雇用創出へとつながる。
* **構造変化が吸収力を再形成する。** 家族農業から機械化された企業農業へ移行すると、地域経済が産出1単位あたりに吸収する労働者数が低下する。
* **インフォーマル性が遊休を覆い隠す。** 周辺地域（グループ4）では、人々が不完全就業やインフォーマルな仕事に頼るため、顕在的失業の数字が困窮を過小評価する。

---

## 残された問い

1. 資本集約型の成長（グループ2）が、職を失った農業労働者を顕在的失業へと押しやり続けるならば、地方政府は彼らを現代的なサービス業の職へ移行させる訓練の道筋をどのように構築できるでしょうか。
2. 労働吸収型の地域では総関連のかなりの部分が波及効果を通じて生じることを踏まえると、計画は孤立した県単位の目標から、調整された複数県の経済回廊へと転換すべきでしょうか。

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
      <h4>AI Podcast: Okun's Law and Spatial Regimes in Indonesia</h4>
      <span id="podDurationLabel">Click play to load</span>
    </div>
    <button class="podcast-close-btn" onclick="podClose()" title="Close player">
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
      <button class="podcast-btn podcast-btn-skip" onclick="podSkip(-15)" title="Back 15s">
        <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
        <span>15</span>
      </button>
      <button class="podcast-btn podcast-btn-play" id="podPlayBtn" onclick="podToggle()" title="Play">
        <svg id="podIconPlay" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="podIconPause" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <button class="podcast-btn podcast-btn-skip" onclick="podSkip(15)" title="Forward 15s">
        <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>
        <span>15</span>
      </button>
    </div>
    <div class="podcast-extras">
      <div class="podcast-volume-wrap">
        <svg id="podVolIcon" onclick="podMute()" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5zM14 3.23v2.06a6.51 6.51 0 0 1 0 13.42v2.06A8.51 8.51 0 0 0 14 3.23z"/></svg>
        <input type="range" class="podcast-volume-slider" id="podVolume" min="0" max="1" step="0.05" value="0.8">
      </div>
      <button class="podcast-speed-btn" id="podSpeedBtn" onclick="podCycleSpeed()" title="Playback speed">1x</button>
      <a class="podcast-download-btn" href="https://files.catbox.moe/i3g2l3.m4a" target="_blank" rel="noopener" title="Stream">
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
