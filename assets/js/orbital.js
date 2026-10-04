/* The globe is a ray/sphere projection of NASA's equirectangular image.
 * One quad, one texture, no third-party runtime, and no invented light points.
 * Stop rendering offscreen, in background tabs, and when a static view settles.
 */
(() => {
  'use strict';
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    document.addEventListener('click', e => { if (!menu.contains(e.target)) menu.open = false; });
  }
  const earth = document.querySelector('[data-earth]');
  if (!earth) return;
  const canvas = earth.querySelector('canvas');
  const fallback = earth.querySelector('.earth-fallback');
  const controls = earth.querySelector('.earth-controls');
  const hint = earth.querySelector('[data-globe-hint]');
  const staticHint = hint.textContent;
  const status = earth.querySelector('[data-globe-status]');
  const pause = earth.querySelector('[data-action="pause"]');
  const regions = [...earth.querySelectorAll('[data-region]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const radians = Math.PI / 180;
  const positions = [[105, 22], [20, 25], [-80, 15]];
  let gl, program, texture, frame = 0, ready = false, visible = true, failed = false;
  let yaw = 105 * radians, pitch = 22 * radians, zoom = 1;
  let targetYaw = yaw, targetPitch = pitch, targetZoom = zoom;
  let playing = !reduce.matches, previousTime = 0, previousDraw = 0, dragging = null;
  let uniforms;

  function fallbackOnly() {
    failed = true; ready = false; cancelAnimationFrame(frame); frame = 0;
    earth.classList.remove('is-ready'); canvas.hidden = true;
    canvas.removeAttribute('tabindex'); controls.hidden = true;
    fallback.removeAttribute('aria-hidden'); hint.textContent = staticHint;
  }
  function updatePause() {
    pause.setAttribute('aria-label', playing ? pause.dataset.pause : pause.dataset.play);
    pause.querySelector('span').textContent = playing ? 'Ⅱ' : '▷';
  }
  function clearRegion() { regions.forEach(b => b.setAttribute('aria-pressed', 'false')); }
  function stop() { playing = false; updatePause(); }
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Globe shader unavailable'); }
    return shader;
  }
  function resize() {
    if (!ready) return;
    const side = Math.max(1, Math.min(1100, Math.round(canvas.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 1.5))));
    if (canvas.width !== side || canvas.height !== side) { canvas.width = side; canvas.height = side; }
    draw();
  }
  function draw() {
    if (!ready || failed) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.size, canvas.width, canvas.height);
    gl.uniform2f(uniforms.angle, yaw, pitch); gl.uniform1f(uniforms.zoom, zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // Decorative overlays (orbital-cinema.js) follow the same projection.
    if (typeof earth.onGlobeDraw === 'function') earth.onGlobeDraw(yaw, pitch, zoom, playing && !reduce.matches);
  }
  function tick(time) {
    frame = 0;
    if (!ready || failed || !visible || document.hidden) { previousTime = 0; return; }
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .06) : 0;
    previousTime = time;
    if (playing && !dragging) targetYaw += dt * .025;
    const blend = reduce.matches ? 1 : 1 - Math.exp(-dt * 9);
    yaw += (targetYaw - yaw) * blend; pitch += (targetPitch - pitch) * blend; zoom += (targetZoom - zoom) * blend;
    const unsettled = Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) + Math.abs(targetZoom - zoom) > .0001;
    if (time - previousDraw > 32 || !unsettled) { draw(); previousDraw = time; }
    if (playing || unsettled) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }
  function wake() {
    if (ready && !failed && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  }
  function setZoom(next) {
    targetZoom = Math.max(.85, Math.min(1.18, next));
    earth.querySelector('[data-action="in"]').disabled = targetZoom >= 1.18;
    earth.querySelector('[data-action="out"]').disabled = targetZoom <= .85;
    stop(); wake();
  }
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) { fallbackOnly(); return; }
    const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}');
    const fragment = compile(gl.FRAGMENT_SHADER, `
      precision highp float;
      uniform vec2 size;
      uniform vec2 angle;
      uniform float zoom;
      uniform sampler2D earthMap;
      const float PI=3.141592653589793;
      float gridLine(float a,float step,float scale){
        float d=abs(fract(a/step+.5)-.5)*step*scale;
        return 1.-smoothstep(0.,.0045,d);
      }
      void main(){
        vec2 p=(gl_FragCoord.xy/size*2.-1.)*1.27/zoom;
        float r2=dot(p,p);
        // Cinematic key light from the upper left: a brighter atmospheric limb on that side.
        vec2 key=normalize(vec2(-.62,.78));
        if(r2>1.){
          float r=sqrt(r2);
          float side=.55+.45*dot(p/r,key);
          float glow=exp(-(r-1.)*30.)*.5*side+exp(-(r-1.)*9.)*.12;
          vec3 halo=mix(vec3(.10,.30,.62),vec3(.36,.72,.95),exp(-(r-1.)*42.));
          gl_FragColor=vec4(halo,clamp(glow,0.,1.));
          return;
        }
        float z=sqrt(1.-r2);
        vec3 n=vec3(p,z);
        float cp=cos(angle.y),sp=sin(angle.y);
        vec3 globe=vec3(n.x,n.y*cp+n.z*sp,-n.y*sp+n.z*cp);
        float lon=atan(globe.x,globe.z)+angle.x;
        float lat=asin(clamp(globe.y,-1.,1.));
        vec2 uv=vec2(fract(lon/(2.*PI)+.5),lat/PI+.5);
        vec3 color=texture2D(earthMap,uv).rgb;
        float shade=.5+.5*pow(z,.35);
        color=pow(color,vec3(.9))*shade;
        // Let NASA's brightest city pixels bloom warmly; positions are unchanged.
        float lum=dot(color,vec3(.299,.587,.114));
        color+=vec3(1.,.72,.38)*smoothstep(.28,.9,lum)*.55;
        // Faint 30-degree graticule, fading towards the limb.
        float g=max(gridLine(lat,PI/6.,1.),gridLine(lon,PI/6.,cos(lat)));
        color+=vec3(.32,.55,.85)*g*.075*z;
        float rim=pow(1.-z,3.);
        float side=.45+.55*dot(normalize(p+1e-5),key);
        color+=vec3(.09,.27,.48)*rim*(.55+.6*side);
        gl_FragColor=vec4(color,1.);
      }
    `);
    program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Globe program unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(['size','angle','zoom'].map(key => [key, gl.getUniformLocation(program, key)]));
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'earthMap'), 0);
    const image = new Image();
    image.onload = () => {
      if (failed) return;
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        if (gl.getError() !== gl.NO_ERROR) throw new Error('Globe texture unavailable');
        ready = true; canvas.hidden = false; canvas.tabIndex = 0;
        controls.hidden = false; fallback.setAttribute('aria-hidden', 'true');
        hint.textContent = hint.dataset.interactive; earth.classList.add('is-ready');
        resize(); updatePause(); wake();
      } catch (_) { fallbackOnly(); }
    };
    image.onerror = fallbackOnly;
    const small = matchMedia('(max-width: 679px)').matches || navigator.connection?.saveData || gl.getParameter(gl.MAX_TEXTURE_SIZE) < 3600;
    image.src = small ? earth.dataset.mobileTexture : earth.dataset.texture;
  } catch (_) { fallbackOnly(); return; }

  regions.forEach((button, i) => button.addEventListener('click', () => {
    stop(); clearRegion(); button.setAttribute('aria-pressed', 'true');
    const desired = positions[i][0] * radians;
    const delta = Math.atan2(Math.sin(desired - yaw), Math.cos(desired - yaw));
    targetYaw = yaw + delta; targetPitch = positions[i][1] * radians;
    status.textContent = button.textContent; wake();
  }));
  controls.addEventListener('click', e => {
    const button = e.target.closest('[data-action]'); if (!button) return;
    switch (button.dataset.action) {
      case 'pause': playing = !playing; clearRegion(); updatePause(); wake(); break;
      case 'west': stop(); clearRegion(); targetYaw -= 20 * radians; wake(); break;
      case 'east': stop(); clearRegion(); targetYaw += 20 * radians; wake(); break;
      case 'in': setZoom(targetZoom + .1); break;
      case 'out': setZoom(targetZoom - .1); break;
    }
  });
  canvas.addEventListener('pointerdown', e => {
    if (!ready || (e.pointerType === 'mouse' && e.button !== 0)) return;
    stop(); clearRegion(); dragging = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: targetYaw, pitch: targetPitch, touch: e.pointerType === 'touch' };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const sensitivity = 3 / canvas.clientWidth;
    targetYaw = dragging.yaw - (e.clientX - dragging.x) * sensitivity;
    if (!dragging.touch) targetPitch = Math.max(-1.2, Math.min(1.2, dragging.pitch + (e.clientY - dragging.y) * sensitivity));
    wake();
  });
  const release = e => { if (dragging && e.pointerId === dragging.id) { dragging = null; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } };
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', () => { dragging = null; });
  canvas.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','-',' '].includes(e.key)) return;
    e.preventDefault(); stop(); clearRegion();
    if (e.key === 'ArrowLeft') targetYaw -= 15 * radians;
    if (e.key === 'ArrowRight') targetYaw += 15 * radians;
    if (e.key === 'ArrowUp') targetPitch = Math.min(1.2, targetPitch + .15);
    if (e.key === 'ArrowDown') targetPitch = Math.max(-1.2, targetPitch - .15);
    if (e.key === 'Home') { targetYaw = yaw + Math.atan2(Math.sin(105 * radians - yaw), Math.cos(105 * radians - yaw)); targetPitch = 22 * radians; setZoom(1); }
    if (e.key === '+') setZoom(targetZoom + .1);
    if (e.key === '-') setZoom(targetZoom - .1);
    wake();
  });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fallbackOnly(); });
  const motionChange = () => { if (reduce.matches) { stop(); targetYaw = yaw; targetPitch = pitch; targetZoom = zoom; } wake(); };
  reduce.addEventListener('change', motionChange);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; } else wake(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; } else wake();
  }, { threshold: 0 }).observe(earth);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize, { passive: true });
})();
