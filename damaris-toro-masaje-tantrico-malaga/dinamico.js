/* ═══════════════════════════════════════════════════════════════════════
   CAPA DINÁMICA · Dámaris Toro (kit premium de la casa)
   Piezas: preloader, scroll suave (Lenis), estela fluida, cursor, hero
   coreografiado, marquee vivo, manifiesto palabra a palabra, cifra que
   cuenta, LOTO Y SIETE CHAKRAS (pieza singular), zoom del gabinete,
   rejillas que suben escalonadas, vídeo que se abre y botón magnético.
   Compartido por todas las páginas (ES y EN): el idioma sale de <html lang>
   y cada pieza solo se monta si su bloque está en la página.
   No se frena con prefers-reduced-motion (el Chrome de Sergio lo tiene
   puesto y la web le salía quieta). El botón «Reducir animaciones» del pie
   la deja estática para quien lo pida.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';
(function(){
  var raiz = document.documentElement;
  var EN = /^en/i.test(raiz.lang || '');

  /* botón del pie: alterna entre animado y estático */
  var bQuieto = document.querySelector('[data-quietud]');
  function quieto(){ try { return localStorage.getItem('dt-quieto') === '1'; } catch(e){ return false; } }
  if (bQuieto) {
    bQuieto.textContent = quieto() ? (EN ? 'Turn animations on' : 'Activar animaciones')
                                   : (EN ? 'Reduce animations' : 'Reducir animaciones');
    bQuieto.addEventListener('click', function(){
      try { localStorage.setItem('dt-quieto', quieto() ? '0' : '1'); } catch(e){}
      location.reload();
    });
  }

  /* Red de seguridad: sin librerías (sin internet, bloqueador, CDN caída)
     o por elección, la página queda estática con todo a la vista. */
  function estatico(){
    raiz.classList.remove('dinamico');
    var pre = document.querySelector('.preloader'); if (pre) pre.style.display = 'none';
    document.querySelectorAll('.rv').forEach(function(e){ e.classList.add('visible'); });
    document.querySelectorAll('[data-cuenta]').forEach(function(el){ el.textContent = formato(+el.dataset.cuenta, +el.dataset.dec || 0); });
  }
  function formato(v, dec){ return v.toLocaleString(EN ? 'en-GB' : 'es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

  if (quieto() || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' ||
      typeof window.SplitText === 'undefined' || typeof window.Lenis === 'undefined') { estatico(); return; }
  /* seguro: si algo se tuerce, el preloader no se queda tapando la pantalla */
  setTimeout(function(){
    var pre = document.querySelector('.preloader');
    if (pre && getComputedStyle(pre).display !== 'none') pre.style.display = 'none';
    gsap.set('[data-reveal],[data-hero-reveal]', { visibility: 'visible' });
  }, 9000);

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('hop', '0.56, 0, 0.35, 0.98');

  var FINE   = matchMedia('(pointer: fine)').matches && matchMedia('(any-hover: hover)').matches;
  var MOBILE = matchMedia('(pointer: coarse)').matches || innerWidth < 900;
  var DPR    = Math.min(devicePixelRatio || 1, 2);

  /* ── 1) Lenis <-> ScrollTrigger, un solo reloj ── */
  var lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  /* los enlaces a #ancla bajan suaves, contando con la cabecera fija */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var dest = document.querySelector(id);
    if (!dest) return;
    e.preventDefault();
    lenis.scrollTo(dest, { offset: -70, duration: 1.4 });
  });

  /* ── 2) Estela fluida (receta aprobada, con los arreglos de móvil) ── */
  var fluidEl = document.getElementById('fluid');
  if (fluidEl) {
    import('https://cdn.jsdelivr.net/npm/webgl-fluid-enhanced@0.8.0/+esm').then(function(mod){
      var sim = new mod.default(fluidEl);
      Object.assign(fluidEl.style, { position:'fixed', inset:'0', width:'100%', height:'100%', zIndex:'9000', pointerEvents:'none' });
      dispatchEvent(new Event('resize'));
      sim.setConfig({
        simResolution: MOBILE ? 96 : 128, dyeResolution: MOBILE ? 512 : 1024,
        densityDissipation: 2.2, velocityDissipation: 1.4,
        pressureIterations: MOBILE ? 8 : 10, curl: 24,
        splatRadius: MOBILE ? 0.12 : 0.1, splatForce: 5000,
        hover: false, colorful: false,
        colorPalette: ['#E0785C', '#F0A47E', '#C9583F'],  /* «como el fuego» (le encantó a Dámaris, audio 21-oct): coral y ámbar vivos */
        transparent: true, bloom: false, sunrays: false,
      });
      sim.start();
      var pausado = false, idleT = 0;
      /* al pausar, la estela se funde (si no, el último fotograma se quedaría congelado en pantalla) */
      function setFluid(run){
        if (run === !pausado) return;
        if (run) { fluidEl.style.opacity = ''; pausado = sim.togglePause(); }
        else { fluidEl.style.opacity = '0'; setTimeout(function(){ if (fluidEl.style.opacity === '0' && !pausado) pausado = sim.togglePause(); }, 450); }
      }
      function wake(){ setFluid(true); clearTimeout(idleT); idleT = setTimeout(function(){ setFluid(false); }, 3000); /* que dé tiempo a desvanecerse antes de pausar */ }
      wake();
      var fcv = fluidEl.querySelector('canvas');
      function sx(){ return (fcv && fcv.clientWidth) ? fcv.width / fcv.clientWidth : (devicePixelRatio || 1); }
      var lastX = null, lastY = null, accX = 0, accY = 0, curX = 0, curY = 0, pend = false;
      function flush(){
        pend = false;
        if (Math.abs(accX) + Math.abs(accY) > 4) { wake(); sim.splatAtLocation(curX * sx(), curY, accX, accY); }
        accX = accY = 0;
      }
      function feed(x, y){
        if (lastX !== null) { accX += (x - lastX) * 2.5; accY += (y - lastY) * 2.5; }
        lastX = x; lastY = y; curX = x; curY = y;
        if (!pend) { pend = true; requestAnimationFrame(flush); }
      }
      function reset(){ lastX = lastY = null; accX = accY = 0; }
      addEventListener('pointermove', function(e){ if (e.pointerType !== 'touch') feed(e.clientX, e.clientY); }, { passive: true });
      addEventListener('touchstart', function(e){ var t = e.touches[0]; if (t) { lastX = t.clientX; lastY = t.clientY; } }, { passive: true });
      addEventListener('touchmove', function(e){ var t = e.touches[0]; if (t) feed(t.clientX, t.clientY); }, { passive: true });
      addEventListener('touchend', reset, { passive: true });
      addEventListener('touchcancel', reset, { passive: true });
      document.addEventListener('visibilitychange', function(){ document.hidden ? setFluid(false) : wake(); });
      /* ráfaga de bienvenida al soltar el preloader */
      window.__fluidBurst = function(){
        var W = innerWidth, H = innerHeight;
        for (var i = 0; i <= 5; i++) (function(i){
          var t = i / 5;
          setTimeout(function(){
            wake();
            sim.splatAtLocation(W * (0.15 + t * 0.7) * sx(), H * (0.62 - Math.sin(t * Math.PI) * 0.24),
                                190 * (1 - t * 0.4), -80 * Math.cos(t * Math.PI));
          }, i * 70);
        })(i);
      };
    }).catch(function(){});
  }

  /* ── 3) Cursor dot + ring (decorativo) ── */
  if (FINE) (function(){
    var dot = document.querySelector('.cursor-dot'), ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    var visto = false;
    addEventListener('pointermove', function(e){
      if (!visto) { gsap.to([dot, ring], { opacity: 1, duration: 0.4 }); visto = true; }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseenter', function(e){
      if (e.target.closest && e.target.closest('a, button')) gsap.to(ring, { scale: 1.9, duration: 0.35, ease: 'power3.out' });
    }, true);
    document.addEventListener('mouseleave', function(e){
      if (e.target.closest && e.target.closest('a, button')) gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' });
    }, true);
  })();

  /* ── 4) PIEZA SINGULAR: el loto se abre y los siete chakras se encienden ──
     Figura y trazos reutilizados de la demo de Tantra Málaga (verificada a
     ojo al 30/60/95 %). Las cuatro fases son los cuatro pasos de la sesión
     de Dámaris, con sus palabras. */
  var energia = (function(){
    var seccion = document.querySelector('.energia');
    if (!seccion) return null;
    var pinEl = seccion.querySelector('.energia__pin');
    var canvas = seccion.querySelector('.energia__lienzo');
    var ctx = canvas.getContext('2d');
    var elNum = seccion.querySelector('[data-energia-num]');
    var elFase = seccion.querySelector('[data-energia-fase]');
    var elFrase = seccion.querySelector('[data-energia-frase]');
    var VELA = 'rgba(142,69,56,.82)', TENUE = 'rgba(178,92,77,.36)';

    function petalo(angDeg, len, anchura, n){
      n = n || 14;
      var a = angDeg * Math.PI / 180, bx = 500, by = 520;
      var tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len, px = -Math.sin(a), py = Math.cos(a), pts = [], i, u, w;
      for (i = 0; i <= n; i++){ u = i / n; w = Math.sin(u * Math.PI) * anchura; pts.push([bx + (tx - bx) * u + px * w, by + (ty - by) * u + py * w]); }
      for (i = n; i >= 0; i--){ u = i / n; w = Math.sin(u * Math.PI) * anchura; pts.push([bx + (tx - bx) * u - px * w, by + (ty - by) * u - py * w]); }
      return pts;
    }
    function vapor(x0, y0, alto, ondas, n){
      n = n || 24; var pts = [];
      for (var i = 0; i <= n; i++){ var u = i / n; pts.push([x0 + Math.sin(u * Math.PI * ondas) * 13 * (1 - u * 0.4), y0 - alto * u]); }
      return pts;
    }
    function columna(n){
      n = n || 40; var pts = [];
      for (var i = 0; i <= n; i++){ var u = i / n; pts.push([500 + Math.sin(u * Math.PI * 3) * 9, 505 - 370 * u]); }
      return pts;
    }
    /* vela: cuerpo y llama (fase I, «antes de recibirte enciendo una vela») */
    function vela(x, y){
      return [[x - 16, y], [x - 16, y - 46], [x + 16, y - 46], [x + 16, y], [x - 16, y]];
    }
    /* gota con la punta arriba: base en (x, y), 26 de alto */
    function llama(x, y){
      var pts = [], n = 28;
      for (var i = 0; i <= n; i++){ var a = i / n * Math.PI * 2; pts.push([x + 8 * Math.sin(a) * Math.sin(a / 2), y - 26 * (1 + Math.cos(a)) / 2]); }
      return pts;
    }
    var CHAKRAS = [
      [500, 500, '#C0392B', 'Raíz', 'Root'], [500, 440, '#E67E22', 'Sacro', 'Sacral'],
      [500, 380, '#F1C40F', 'Plexo solar', 'Solar plexus'], [500, 320, '#2ECC71', 'Corazón', 'Heart'],
      [500, 260, '#3498DB', 'Garganta', 'Throat'], [500, 200, '#5B4BAF', 'Tercer ojo', 'Third eye'],
      [500, 140, '#9B59B6', 'Corona', 'Crown'],
    ];
    var trazos = [
      /* I · preparo la sala: suelo, dos velas y su humo */
      { t:[0.00,0.07], w:1.8, c:TENUE, p:[[180,560],[380,552],[620,554],[820,560]] },
      { t:[0.03,0.09], w:1.5, c:VELA,  p: vela(250, 552) },
      { t:[0.05,0.11], w:1.5, c:VELA,  p: vela(750, 552) },
      { t:[0.09,0.13], w:1.6, c:VELA,  llama:[250, 500] },
      { t:[0.10,0.14], w:1.6, c:VELA,  llama:[750, 500] },
      { t:[0.11,0.18], w:1.2, c:TENUE, p: vapor(250, 470, 130, 2.5) },
      { t:[0.12,0.19], w:1.2, c:TENUE, p: vapor(750, 470, 150, 3) },
      /* II · hablamos y respiramos: el loto se abre pétalo a pétalo */
      { t:[0.20,0.27], w:1.7, c:VELA,  p: petalo(-45, 150, 34) },
      { t:[0.22,0.29], w:1.7, c:VELA,  p: petalo(-135, 150, 34) },
      { t:[0.26,0.33], w:1.5, c:VELA,  p: petalo(-22, 124, 27) },
      { t:[0.28,0.35], w:1.5, c:VELA,  p: petalo(-158, 124, 27) },
      { t:[0.32,0.39], w:1.3, c:TENUE, p: petalo(-6, 98, 21) },
      { t:[0.34,0.41], w:1.3, c:TENUE, p: petalo(-174, 98, 21) },
      /* III · el tacto: la energía sube y se encienden los siete centros */
      { t:[0.42,0.54], w:1.4, c:TENUE, p: columna() },
      { t:[0.46,0.52], chakra:0 }, { t:[0.52,0.58], chakra:1 }, { t:[0.58,0.64], chakra:2 },
      { t:[0.64,0.70], chakra:3 }, { t:[0.70,0.76], chakra:4 }, { t:[0.76,0.82], chakra:5 },
      { t:[0.82,0.87], chakra:6 },
      /* IV · volver a ti: halo de corona y firma */
      { t:[0.87,0.95], w:1.6, c:VELA, circulo:[500, 140, 74] },
      { t:[0.93,0.99], w:1.1, c:TENUE, p:[[330,600],[670,600]], cota: EN ? 'Dámaris Toro · The art of touch · Málaga' : 'Dámaris Toro · El arte del tacto · Málaga' },
    ];
    var FASES = EN ? [
      [0.00, 'I · I prepare the room', 'Before I receive you, I settle into presence. Lighting a candle opens a temple.'],
      [0.20, 'II · We talk and breathe', 'What you are looking for and where your boundaries are. Your pace matters most.'],
      [0.42, 'III · Touch', 'Your nervous system doesn’t listen to your affirmations. It listens to your breath.'],
      [0.87, 'IV · Coming back to you', 'When the body feels safe, it starts to release what it has been holding in silence.'],
    ] : [
      [0.00, 'I · Preparo la sala', 'Antes de recibirte, habito la presencia. Encender una vela es inaugurar un templo.'],
      [0.20, 'II · Hablamos y respiramos', 'Qué buscas y dónde están tus límites. Tus límites y tu ritmo son lo más importante.'],
      [0.42, 'III · El tacto', 'El sistema nervioso no escucha tus afirmaciones. Escucha tu respiración.'],
      [0.87, 'IV · Volver a ti', 'Cuando el cuerpo se siente seguro, empieza a soltar lo que llevaba sosteniendo en silencio.'],
    ];
    function longitudes(p){ var acc = [0]; for (var i = 1; i < p.length; i++) acc.push(acc[i-1] + Math.hypot(p[i][0]-p[i-1][0], p[i][1]-p[i-1][1])); return acc; }
    trazos.forEach(function(tr){ if (tr.llama) tr.p = llama(tr.llama[0], tr.llama[1]); if (tr.p) tr.len = longitudes(tr.p); });

    var escala = 1, offX = 0, offY = 0, prog = { v: 0 };
    function medir(){
      var w = pinEl.clientWidth, h = pinEl.clientHeight;
      if (!w || !h) return;
      canvas.width = w * DPR; canvas.height = h * DPR;
      var movil = w < 700;
      /* en móvil se encuadra solo la figura (x 230-770), no todo el lienzo */
      escala = movil ? Math.min(w / 640, h / 760) : Math.min(w / 1000, h / 660) * 0.86;
      offX = (w - 1000 * escala) / 2;
      offY = (h - 660 * escala) / 2 + h * (movil ? 0.01 : 0.04);
      pintar(prog.v, true);
    }
    function parcial(p, len, f){
      var obj = len[len.length-1] * f;
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (var i = 1; i < p.length; i++){
        if (len[i] <= obj) { ctx.lineTo(p[i][0], p[i][1]); continue; }
        var r = (obj - len[i-1]) / (len[i] - len[i-1]);
        if (r > 0) ctx.lineTo(p[i-1][0] + (p[i][0]-p[i-1][0]) * r, p[i-1][1] + (p[i][1]-p[i-1][1]) * r);
        break;
      }
      ctx.stroke();
    }
    function chakra(i, f){
      var c = CHAKRAS[i], cx = c[0], cy = c[1], color = c[2], r = 15;
      var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4.2);
      halo.addColorStop(0, color + 'cc'); halo.addColorStop(0.35, color + '44'); halo.addColorStop(1, color + '00');
      ctx.globalAlpha = f; ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, r * 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*f); ctx.stroke();
      ctx.globalAlpha = f; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, Math.PI*2); ctx.fill();
      if (f > 0.55){
        ctx.globalAlpha = (f - 0.55) / 0.45;
        ctx.fillStyle = 'rgba(59,43,39,.78)'; ctx.font = '300 19px Jost, sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(EN ? c[4] : c[3], cx + r * 3.1, cy + 6);
      }
      ctx.globalAlpha = 1;
    }
    var ultimo = -1;
    function pintar(t, forzar){
      var tick = Math.round(t * 900);
      if (!forzar && tick === ultimo) return;
      ultimo = tick;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
      ctx.translate(offX, offY); ctx.scale(escala, escala);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      trazos.forEach(function(tr){
        var f = gsap.utils.clamp(0, 1, (t - tr.t[0]) / (tr.t[1] - tr.t[0]));
        if (f <= 0) return;
        if (tr.chakra !== undefined) { chakra(tr.chakra, f); return; }
        ctx.strokeStyle = tr.c; ctx.lineWidth = tr.w;
        if (tr.circulo){
          ctx.beginPath(); ctx.arc(tr.circulo[0], tr.circulo[1], tr.circulo[2], -Math.PI/2, -Math.PI/2 + Math.PI*2*f); ctx.stroke();
          return;
        }
        if (tr.llama){
          /* resplandor de la llama */
          var g = ctx.createRadialGradient(tr.llama[0], tr.llama[1] - 12, 0, tr.llama[0], tr.llama[1] - 12, 46);
          g.addColorStop(0, 'rgba(240,150,100,' + (0.5 * f) + ')'); g.addColorStop(1, 'rgba(240,150,100,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tr.llama[0], tr.llama[1] - 12, 46, 0, Math.PI * 2); ctx.fill();
        }
        parcial(tr.p, tr.len, f);
        if (tr.cota && f >= 1){
          ctx.fillStyle = 'rgba(142,69,56,.8)'; ctx.font = '300 20px Jost, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(tr.cota, 500, 636);
        }
      });
      elNum.textContent = Math.round(t * 100);
      var fase = FASES[0];
      FASES.forEach(function(fs){ if (t >= fs[0]) fase = fs; });
      if (elFase.textContent !== fase[1]){
        elFase.textContent = fase[1];
        gsap.timeline()
          .to(elFrase, { autoAlpha: 0, duration: 0.18, ease: 'power1.in' })
          .add(function(){ elFrase.textContent = fase[2]; })
          .to(elFrase, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
      }
    }
    addEventListener('resize', medir);
    return {
      montar: function(){
        medir();
        gsap.to(prog, { v: 1, ease: 'none', onUpdate: function(){ pintar(prog.v); },
          scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', pin: pinEl, pinSpacing: false, scrub: 1, anticipatePin: 1 } });
      },
    };
  })();

  /* ── 5) Coreografía de la página ── */
  function coreografia(){
    /* hero (solo en la portada): la foto se acerca y el texto se retira al bajar */
    if (document.querySelector('.hero')) {
      gsap.to('[data-hero-media] img', { scale: 1.14, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      /* fromTo con opacity fija: con autoAlpha tomaba el «oculto» del arranque como punto de partida y el texto se quedaba invisible */
      gsap.fromTo('.hero__contenido', { yPercent: 0, opacity: 1 }, { yPercent: -14, opacity: 0.25, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: true } });
    }

    /* marquee vivo: corre solo y acelera (o se da la vuelta) con el scroll */
    var track = document.querySelector('.marquee__track');
    if (track) {
      var marq = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
      marq.totalTime(28 * 1000);
      var objetivo = 1;
      ScrollTrigger.create({ onUpdate: function(self){
        var v = self.getVelocity();
        objetivo = gsap.utils.clamp(-6, 6, (v < 0 ? -1 : 1) * Math.max(1, Math.abs(v) / 500));
      } });
      gsap.ticker.add(function(){
        marq.timeScale(gsap.utils.interpolate(marq.timeScale(), objetivo, 0.06));
        objetivo += (1 - objetivo) * 0.04;
      });
    }

    /* cifra que cuenta (seguidores reales de Instagram) */
    document.querySelectorAll('[data-cuenta]').forEach(function(el){
      var fin = +el.dataset.cuenta, dec = +el.dataset.dec || 0, c = { v: 0 };
      el.textContent = formato(0, dec);
      gsap.to(c, { v: fin, duration: 2.2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function(){ el.textContent = formato(c.v, dec); } });
    });

    /* manifiesto: su frase se enciende palabra a palabra al bajar */
    var manif = document.querySelector('[data-manifiesto]');
    if (manif) SplitText.create(manif, { type: 'words', onSplit: function(self){
      return gsap.from(self.words, { opacity: 0.12, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: manif, start: 'top 85%', end: 'bottom 50%', scrub: true } });
    } });
    /* fotos a distinta profundidad */
    document.querySelectorAll('[data-speed]').forEach(function(el){
      var sp = +el.dataset.speed || 1;
      gsap.fromTo(el, { yPercent: 12 * sp }, { yPercent: -12 * sp, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    /* fotos que se destapan de abajo arriba */
    document.querySelectorAll('[data-img-reveal]').forEach(function(m){
      var img = m.querySelector('img');
      gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 90%', once: true }, defaults: { duration: 1.3, ease: 'power4.out' } })
        .fromTo(m, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' })
        .fromTo(img, { scale: 1.22 }, { scale: 1 }, 0);
    });

    /* tarjetas de sesiones: entran escalonadas */
    var tarjetas = gsap.utils.toArray('.tarjeta');
    if (tarjetas.length) gsap.fromTo(tarjetas, { y: 90, autoAlpha: 0, rotate: function(i){ return (i - 1) * 2.5; } },
      { y: 0, autoAlpha: 1, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.14,
        scrollTrigger: { trigger: '.tarjetas', start: 'top 85%', once: true } });

    /* la pieza singular */
    if (energia) energia.montar();

    /* zoom: la foto del gabinete se come la pantalla y emerge la frase */
    var zoom = document.querySelector('.zoom');
    if (zoom) {
      var zs = SplitText.create(zoom.querySelector('[data-zoom-texto]'), { type: 'words' });
      gsap.timeline({ scrollTrigger: { trigger: zoom, start: 'top top', end: 'bottom bottom', pin: '.zoom__pin', pinSpacing: false, scrub: 1, anticipatePin: 1 } })
        .fromTo('.zoom__marco', { clipPath: 'inset(34% 34% 34% 34% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 0.6 }, 0)
        .fromTo('.zoom__marco img', { scale: 1.4 }, { scale: 1, ease: 'none', duration: 0.85 }, 0)
        .fromTo(zs.words, { opacity: 0, yPercent: 70 }, { opacity: 1, yPercent: 0, stagger: 0.05, duration: 0.3, ease: 'none' }, 0.55);
    }

    /* tiras gigantes a contra-scroll */
    document.querySelectorAll('[data-tira]').forEach(function(el){
      var dir = +el.dataset.tira;
      gsap.fromTo(el, { xPercent: dir * 8 }, { xPercent: dir * -8, ease: 'none',
        scrollTrigger: { trigger: '.tiras', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });


    /* bloques en rejilla (lo que hago, pilares, pasos, entradas del blog): suben escalonados */
    ['.haceres', '.pilares__grid', '.camino__lista', '.pasos', '.citas', '.entradas'].forEach(function(sel){
      var caja = document.querySelector(sel);
      if (!caja || !caja.children.length) return;
      gsap.fromTo(caja.children, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: caja, start: 'top 88%', once: true } });
    });
    /* vídeo de la portada: se abre como una cortina */
    var vcaja = document.querySelector('.video__caja');
    if (vcaja) gsap.fromTo(vcaja, { clipPath: 'inset(18% 18% 18% 18% round 22px)', scale: 0.92 },
      { clipPath: 'inset(0% 0% 0% 0% round 22px)', scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.video', start: 'top 85%', end: 'center 55%', scrub: 1 } });

    /* títulos: suben línea a línea desde una máscara */
    document.querySelectorAll('[data-reveal]').forEach(function(el){
      if (el.dataset.reveal === 'lineas') {
        SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function(self){
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.07,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        } });
      } else {
        gsap.fromTo(el, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      }
    });

    /* botón magnético (solo con ratón) */
    if (FINE) document.querySelectorAll('[data-magnetico]').forEach(function(el){
      var lab = el.querySelector('.magnetico__label') || el;
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      var lx = gsap.quickTo(lab, 'x', { duration: 0.6, ease: 'power3.out' }), ly = gsap.quickTo(lab, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.35); yTo(dy * 0.35); if (lab !== el) { lx(dx * 0.25); ly(dy * 0.25); }
      });
      el.addEventListener('mouseleave', function(){ gsap.to([el, lab], { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' }); });
    });

    /* barra de progreso lateral */
    gsap.to('.progreso span', { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });

    ScrollTrigger.refresh();
  }

  /* ── 6) Arranque: preloader → cortina → hero coreografiado ── */
  function revealHero(){
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.set('[data-hero-reveal]', { visibility: 'visible' }, 0);
    if (!raiz.classList.contains('visto')) tl.from('.barra', { autoAlpha: 0, y: -16, duration: 0.8 }, 0.5);
    if (document.querySelector('.hero')) {
      tl.fromTo('[data-hero-media]', { clipPath: 'inset(100% 0 0 0 round 999px 999px 18px 18px)' },
        { clipPath: 'inset(0% 0 0 0 round 999px 999px 18px 18px)', duration: 1.5, ease: 'hop' }, 0);
      tl.fromTo('[data-hero-media] img', { scale: 1.3 }, { scale: 1, duration: 1.9, ease: 'power4.out' }, 0);
      var tit = SplitText.create('.hero .h1-grande', { type: 'words, chars', mask: 'chars' });
      tl.from(tit.chars, { yPercent: 120, duration: 1, stagger: 0.02 }, 0.35);
      tl.from('.hero .h1-sub', { autoAlpha: 0, y: 14, duration: 0.9 }, 0.75);
      var cl = SplitText.create('.hero .claim', { type: 'lines', mask: 'lines' });
      tl.from(cl.lines, { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.8);
      tl.from('.hero .hoy', { autoAlpha: 0, y: 18, duration: 0.8 }, 0.5);
      /* la caja y no el botón: el botón es magnético y las dos animaciones se pisarían (se quedaba 24 px abajo) */
      tl.from('.hero .acciones', { autoAlpha: 0, y: 24, duration: 0.9 }, 1.0);
      tl.from('.hero .redes-mini', { autoAlpha: 0, duration: 0.9 }, 1.15);
    } else if (document.querySelector('.cabecera h1')) {
      var ct = SplitText.create('.cabecera h1', { type: 'lines', mask: 'lines' });
      tl.from(ct.lines, { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.2);
      tl.from('.cabecera .rotulo, .cabecera .entradilla', { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.45);
    }
    return tl;
  }

  /* «visto» lo pone el <head> si ya se abrió otra página en esta visita */
  var visto = raiz.classList.contains('visto');
  try { sessionStorage.setItem('dt-visto', '1'); } catch(e){}
  document.fonts.ready.then(function(){
    var num = document.querySelector('.preloader__num');
    var p = { v: 0 };
    var minimo = new Promise(function(res){
      if (visto) { res(); return; }
      gsap.to(p, { v: 100, duration: 1.8, ease: 'steps(14)', onUpdate: function(){ num.firstChild.textContent = Math.round(p.v); }, onComplete: res });
    });
    /* la primera vez se espera a que cargue todo (lo tapa la cortina); al cambiar de página, no:
       la página ya está a la vista y esperar a las fotos la dejaba congelada */
    var real = new Promise(function(res){ if (visto || document.readyState === 'complete') res(); else addEventListener('load', res, { once: true }); });
    Promise.all([minimo, real]).then(function(){
      if (visto) {
        coreografia();
        revealHero();
        lenis.start();
        addEventListener('load', function(){ ScrollTrigger.refresh(); }, { once: true });
        return;
      }
      coreografia();
      gsap.timeline()
        .to('.preloader__num', { yPercent: -110, duration: 0.6, ease: 'expo.in' })
        .to('.preloader__brand > *', { yPercent: -140, autoAlpha: 0, duration: 0.6, ease: 'expo.in', stagger: 0.05 }, '<')
        .to('.preloader__curtain', { clipPath: 'inset(0 0 100% 0)', duration: visto ? 0.8 : 1.1, ease: 'hop' }, '-=0.1')
        .set('.preloader', { display: 'none' })
        .add(revealHero(), '-=0.75')
        .call(function(){ lenis.start(); }, null, '-=1.2')
        .call(function(){ if (window.__fluidBurst) window.__fluidBurst(); }, null, '-=0.9')
        .call(function(){ ScrollTrigger.refresh(); }, null, '-=0.3');
    });
  });
})();
