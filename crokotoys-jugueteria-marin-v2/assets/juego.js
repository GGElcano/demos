/* Croko Toys v2 · capa de juego (19-oct-2026).
   Cajas sorpresa con las novedades, estrella para la carta a los Reyes, confeti y sonidos al
   añadir, mundos con su color, mascota que habla y barra del envío gratis.
   Todo se mueve SIEMPRE (el Chrome de Sergio tiene «reducir movimiento» y lo veía quieto);
   a cambio hay un botón de «Modo tranquilo» que lo para todo y quita el sonido.
   Sin dependencias. Los sonidos se sintetizan aquí: no hay archivos de audio. */
(function () {
  'use strict';
  var ID = 'crokotoys-v2', CLAVE_CESTA = 'cesta-' + ID, CLAVE_CARTA = 'carta-' + ID;
  var CLAVE_NOMBRE = 'carta-nombre-' + ID, CLAVE_SON = 'sonido-' + ID, CLAVE_TRANQ = 'tranquilo-' + ID;
  var ENVIO_GRATIS = 300;
  var EN_FICHA = location.pathname.indexOf('/producto/') >= 0, PREF = EN_FICHA ? '../' : '';
  var COLORES = ['#0A9A38', '#F6B73C', '#E9483F', '#3BA7F0', '#B66DF0', '#FF8FB1', '#FFD84D'];
  var raiz = document.documentElement;

  function leer(k, def) { try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado: la página sigue funcionando */ } }
  function num(s) { var m = String(s).match(/\d[\d.]*,\d+|\d+/); if (!m) return 0; var v = parseFloat(m[0].replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; }
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var tranquilo = leer(CLAVE_TRANQ, false), sonido = leer(CLAVE_SON, true);
  raiz.classList.toggle('croko-tranquilo', tranquilo);
  raiz.classList.add('croko-juego');

  /* ── Sonidos (Web Audio, cortos y bajitos) ── */
  var ctx = null;
  function nota(f, t0, dur, tipo, vol, fFin) {
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t);
    if (fFin) o.frequency.exponentialRampToValueAtTime(fFin, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function suena(tipo) {
    if (!sonido || tranquilo) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return; }
    if (tipo === 'pop') nota(520, 0, 0.12, 'sine', 0.14, 1250);
    else if (tipo === 'ding') { nota(1318, 0, 0.18, 'triangle', 0.1); nota(1760, 0.07, 0.28, 'triangle', 0.09); }
    else if (tipo === 'caja') { nota(300, 0, 0.09, 'square', 0.04, 600); nota(784, 0.08, 0.14, 'triangle', 0.1); nota(1046, 0.16, 0.14, 'triangle', 0.1); nota(1568, 0.24, 0.3, 'triangle', 0.09); }
    else if (tipo === 'fanfarria') { [523, 659, 784, 1046].forEach(function (f, i) { nota(f, i * 0.085, 0.22, 'triangle', 0.1); }); nota(1046, 0.36, 0.5, 'sine', 0.08); }
    else if (tipo === 'quitar') nota(600, 0, 0.16, 'sine', 0.08, 260);
  }

  /* ── Confeti y estrellas (un canvas fijo encima de todo, sin bloquear clics) ── */
  var lienzo = null, c2d = null, piezas = [], animando = false;
  function preparaLienzo() {
    if (lienzo) return;
    lienzo = document.createElement('canvas'); lienzo.className = 'croko-confeti'; lienzo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lienzo); c2d = lienzo.getContext('2d');
    var ajusta = function () { var r = window.devicePixelRatio || 1; lienzo.width = innerWidth * r; lienzo.height = innerHeight * r; c2d.setTransform(r, 0, 0, r, 0, 0); };
    ajusta(); window.addEventListener('resize', ajusta);
  }
  function estrella(x, y, r) { c2d.beginPath(); for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; c2d.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c2d.closePath(); c2d.fill(); }
  function confeti(x, y, n, soloEstrellas) {
    if (tranquilo) return;
    preparaLienzo();
    for (var i = 0; i < (n || 60); i++) {
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 7;
      piezas.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, g: 0.28, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        t: soloEstrellas || Math.random() < 0.25 ? 'e' : 'p', s: soloEstrellas ? 7 + Math.random() * 6 : 5 + Math.random() * 6, c: soloEstrellas ? (Math.random() < 0.7 ? '#F6B73C' : '#FFD84D') : COLORES[i % COLORES.length], vida: 0 });
    }
    if (!animando) { animando = true; requestAnimationFrame(paso); }
  }
  function confetiDe(el, n, est) { var r = el.getBoundingClientRect(); confeti(r.left + r.width / 2, r.top + r.height / 2, n, est); }
  function paso() {
    c2d.clearRect(0, 0, innerWidth, innerHeight);
    piezas = piezas.filter(function (p) { return p.vida < 140 && p.y < innerHeight + 40; });
    piezas.forEach(function (p) {
      p.vida++; p.vx *= 0.985; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      c2d.save(); c2d.globalAlpha = Math.max(0, 1 - p.vida / 140); c2d.fillStyle = p.c; c2d.translate(p.x, p.y); c2d.rotate(p.rot);
      if (p.t === 'e') estrella(0, 0, p.s); else c2d.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      c2d.restore();
    });
    if (piezas.length) requestAnimationFrame(paso); else { animando = false; c2d.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ── Algo que vuela hasta el carrito o la carta ── */
  function vuela(desdeEl, hastaEl, html, clase) {
    if (tranquilo || !desdeEl || !hastaEl) return;
    var a = desdeEl.getBoundingClientRect(), b = hastaEl.getBoundingClientRect();
    if (!b.width) return;
    var v = document.createElement('div'); v.className = 'croko-vuela ' + (clase || ''); v.innerHTML = html;
    var lado = Math.min(120, a.width, a.height) || 60;
    v.style.cssText = 'left:' + (a.left + a.width / 2 - lado / 2) + 'px;top:' + (a.top + a.height / 2 - lado / 2) + 'px;width:' + lado + 'px;height:' + lado + 'px';
    document.body.appendChild(v);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    v.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 120) + 'px) scale(.7) rotate(-20deg)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.15) rotate(30deg)', opacity: 0.4 }], { duration: 750, easing: 'cubic-bezier(.5,0,.6,1)' }).onfinish = function () { v.remove(); bota(hastaEl); };
  }
  function bota(el) { if (!el || tranquilo) return; el.classList.remove('croko-bota'); void el.offsetWidth; el.classList.add('croko-bota'); }

  /* ── Croko, la mascota (es el botón del chat) dice cosas ── */
  var bocadillo = null, tBoca = null;
  function dice(texto, ms) {
    var btn = document.querySelector('.chat-btn');
    if (!btn || getComputedStyle(btn).display === 'none') return;
    if (!bocadillo) {
      bocadillo = document.createElement('div'); bocadillo.className = 'croko-bocadillo'; bocadillo.setAttribute('role', 'status');
      bocadillo.addEventListener('click', function () { bocadillo.classList.remove('visible'); });
      document.body.appendChild(bocadillo);
    }
    bocadillo.textContent = texto; bocadillo.classList.add('visible'); bota(btn);
    clearTimeout(tBoca); tBoca = setTimeout(function () { bocadillo.classList.remove('visible'); }, ms || 4200);
  }

  /* ── Botones flotantes: sonido y modo tranquilo ── */
  var panel = document.createElement('div'); panel.className = 'croko-panel';
  panel.innerHTML = '<button type="button" data-son aria-pressed="' + (sonido ? 'true' : 'false') + '"></button><button type="button" data-tranq aria-pressed="' + (tranquilo ? 'true' : 'false') + '">Modo tranquilo</button>';
  document.body.appendChild(panel);
  var bSon = panel.querySelector('[data-son]'), bTranq = panel.querySelector('[data-tranq]');
  function pintaPanel() {
    bSon.innerHTML = sonido && !tranquilo ? '<span aria-hidden="true">🔊</span> Sonido' : '<span aria-hidden="true">🔇</span> Sin sonido';
    bSon.setAttribute('aria-pressed', sonido ? 'true' : 'false'); bSon.disabled = tranquilo;
    bTranq.setAttribute('aria-pressed', tranquilo ? 'true' : 'false');
  }
  pintaPanel();
  bSon.addEventListener('click', function () { sonido = !sonido; guardar(CLAVE_SON, sonido); pintaPanel(); suena('pop'); });
  bTranq.addEventListener('click', function () { tranquilo = !tranquilo; guardar(CLAVE_TRANQ, tranquilo); raiz.classList.toggle('croko-tranquilo', tranquilo); pintaPanel(); });

  /* ── Carta a los Reyes: la estrella ── */
  function carta() { return leer(CLAVE_CARTA, []); }
  function enCarta(slug) { return carta().some(function (x) { return x.slug === slug; }); }
  var navCarta = null;
  (function () {
    var cesta = document.querySelector('.gg-nav-cesta');
    if (cesta) {
      navCarta = document.createElement('a'); navCarta.className = 'croko-nav-carta'; navCarta.href = PREF + 'carta.html';
      navCarta.innerHTML = '<span class="croko-nav-carta__e" aria-hidden="true">★</span><span class="croko-nav-carta__t">Mi carta</span><b data-carta-n hidden>0</b>';
      navCarta.setAttribute('aria-label', 'Mi carta a los Reyes');
      cesta.parentNode.insertBefore(navCarta, cesta);
    }
    var mm = document.querySelector('.mobile-menu .mm-cta');
    if (mm) { var a = document.createElement('a'); a.href = PREF + 'carta.html'; a.textContent = '★ Mi carta a los Reyes'; mm.parentNode.insertBefore(a, mm); }
  })();
  function pintaN() {
    var n = carta().length;
    Array.prototype.forEach.call(document.querySelectorAll('[data-carta-n]'), function (el) { el.textContent = n; if (n) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); });
  }
  pintaN();

  function pintaEstrella(b, si) {
    b.classList.toggle('on', si); b.setAttribute('aria-pressed', si ? 'true' : 'false');
    var t = b.querySelector('.croko-estrella__t'); if (t) t.textContent = si ? 'En mi carta' : 'A mi carta';
    b.setAttribute('aria-label', si ? 'Quitar de mi carta a los Reyes' : 'Apuntar en mi carta a los Reyes');
  }
  function alternaCarta(b, prod) {
    var c = carta(), ya = c.some(function (x) { return x.slug === prod.slug; });
    if (ya) { c = c.filter(function (x) { return x.slug !== prod.slug; }); suena('quitar'); }
    else {
      c.push(prod); suena('ding'); confetiDe(b, 26, true);
      vuela(b, navCarta, '<span class="croko-vuela__e">★</span>', 'croko-vuela--e');
      dice(c.length === 1 ? '¡Apuntado! Ya tienes tu primer juguete en la carta.' : '¡Apuntado en la carta! Ya llevas ' + c.length + '.');
    }
    guardar(CLAVE_CARTA, c); pintaEstrella(b, !ya); setTimeout(pintaN, ya ? 0 : 700);
  }
  function botonEstrella(prod, conTexto) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'croko-estrella' + (conTexto ? ' croko-estrella--grande' : '');
    b.innerHTML = '<span class="croko-estrella__i" aria-hidden="true">★</span>' + (conTexto ? '<span class="croko-estrella__t"></span>' : '');
    pintaEstrella(b, enCarta(prod.slug));
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); alternaCarta(b, prod); });
    return b;
  }
  function prodDeTarjeta(t) {
    var a = t.querySelector('a[href*="producto/"]'), img = t.querySelector('img'), nom = t.querySelector('.gg-prenda-nombre, .croko-caja__nombre'), pr = t.querySelector('.gg-prenda-precio, .croko-caja__precio');
    if (!a || !nom) return null;
    var slug = (a.getAttribute('href').match(/producto\/([^/]+)\.html/) || [])[1];
    return { slug: slug, nombre: nom.textContent.trim(), img: (img ? img.getAttribute('src') : '').replace(/^\.\.\//, ''), precio: pr ? eur(num(pr.textContent)) : '' };
  }
  Array.prototype.forEach.call(document.querySelectorAll('.gg-prenda, .croko-caja__premio'), function (t) {
    var p = prodDeTarjeta(t); if (!p || !p.slug) return;
    (t.querySelector('.gg-prenda-foto, .croko-caja__foto') || t).appendChild(botonEstrella(p, false));
  });
  var anadir = document.querySelector('[data-anadir]');
  if (anadir) {
    var pf = { slug: anadir.dataset.slug, nombre: anadir.dataset.nombre, img: anadir.dataset.img, precio: anadir.dataset.precio ? anadir.dataset.precio + ' €' : '' };
    var compra = anadir.closest('.gg-compra');
    if (compra) compra.parentNode.insertBefore(botonEstrella(pf, true), compra.nextSibling);
  }

  /* ── Añadir al carrito: confeti, el juguete vuela al carrito y la barra del envío gratis ── */
  function subtotal() { return leer(CLAVE_CESTA, []).reduce(function (a, x) { return a + num(x.precio) * x.cant; }, 0); }
  function textoEnvio(s) { return s >= ENVIO_GRATIS ? '¡Envío gratis conseguido!' : 'Te faltan ' + eur(ENVIO_GRATIS - s) + ' para el envío gratis'; }
  function barra(s) {
    var p = Math.min(100, s / ENVIO_GRATIS * 100);
    return '<div class="croko-barra' + (s >= ENVIO_GRATIS ? ' llena' : '') + '"><div class="croko-barra__txt">' + textoEnvio(s) + '</div><div class="croko-barra__riel"><i style="width:' + p + '%"></i><span class="croko-barra__coche" style="left:' + p + '%" aria-hidden="true"><img src="' + PREF + 'assets/logo-crokotoys.webp" alt=""></span></div></div>';
  }
  if (anadir) {
    anadir.addEventListener('click', function () {
      setTimeout(function () {
        var aviso = document.querySelector('[data-aviso-cesta]');
        if (!aviso || aviso.textContent.indexOf('Añadido') !== 0) return;
        suena('fanfarria'); confetiDe(anadir, 70);
        vuela(document.querySelector('[data-ficha-img]'), document.querySelector('.gg-nav-cesta'), '<img src="' + esc(document.querySelector('[data-ficha-img]').getAttribute('src')) + '" alt="">');
        aviso.insertAdjacentHTML('beforeend', barra(subtotal()));
        dice(subtotal() >= ENVIO_GRATIS ? '¡Al carrito! Y con envío gratis.' : '¡Al carrito!');
      }, 0);
    });
  }
  var tot = document.querySelector('[data-cesta-tot]');
  if (tot) {
    var hueco = document.createElement('div'); hueco.className = 'croko-barra-cesta'; tot.parentNode.insertBefore(hueco, tot);
    var antes = subtotal() >= ENVIO_GRATIS;
    var repinta = function () {
      var s = subtotal(); hueco.innerHTML = s ? barra(s) : '';
      if (s >= ENVIO_GRATIS && !antes) { suena('fanfarria'); confetiDe(hueco, 90); }
      antes = s >= ENVIO_GRATIS;
    };
    repinta();
    var sub = document.querySelector('[data-subtotal]');
    if (sub && window.MutationObserver) new MutationObserver(repinta).observe(sub, { childList: true, characterData: true, subtree: true });
  }

  /* ── Cajas sorpresa de la portada ── */
  var cajas = Array.prototype.slice.call(document.querySelectorAll('[data-caja]'));
  if (cajas.length) {
    var cuenta = document.querySelector('[data-cajas-cuenta]'), abiertas = 0;
    var abre = function (caja, silencio) {
      if (caja.classList.contains('abierta')) return;
      caja.classList.add('abierta'); abiertas++;
      var premio = caja.querySelector('.croko-caja__premio'); premio.removeAttribute('hidden');
      if (!silencio) { suena('caja'); confetiDe(caja, 45); }
      if (cuenta) cuenta.textContent = abiertas === cajas.length ? '¡Las has abierto todas!' : 'Has abierto ' + abiertas + ' de ' + cajas.length;
      if (abiertas === cajas.length) { setTimeout(function () { suena('fanfarria'); confeti(innerWidth / 2, innerHeight / 3, 140); dice('¡Todas abiertas! Marca con la estrella las que más te gusten.', 5200); }, 350); }
      var foco = premio.querySelector('a'); if (foco && document.activeElement && document.activeElement.closest('[data-caja]') === caja) foco.focus();
    };
    cajas.forEach(function (caja) { caja.querySelector('[data-caja-abrir]').addEventListener('click', function () { abre(caja); }); });
    var todas = document.querySelector('[data-cajas-todas]');
    if (todas) todas.addEventListener('click', function () { var k = 0; cajas.forEach(function (c) { if (c.classList.contains('abierta')) return; var j = k++; setTimeout(function () { abre(c, j % 3 !== 0); }, tranquilo ? 0 : j * 140); }); });
    // Croko saluda cuando las cajas ya se ven (si saludara al entrar, taparía los botones de la portada)
    var saludo = function () { if (!abiertas) dice('¡Hola! Soy Croko. Hay ' + cajas.length + ' cajas con novedades. ¿Abrimos una?', 5200); };
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(saludo, 600); } }, { threshold: 0.35 });
      io.observe(document.querySelector('.croko-cajas__rejilla'));
    } else setTimeout(saludo, 2200);
  }

  /* ── Mundos: la tienda se pinta del color del mundo elegido ── */
  if (document.querySelector('[data-rejilla]')) {
    var mundo = function () { document.body.setAttribute('data-mundo', (location.hash || '').replace('#', '') || 'todo'); };
    mundo();
    window.addEventListener('hashchange', mundo);
    var chips = document.querySelector('[data-chips]');
    if (chips) chips.addEventListener('click', function (e) { var ch = e.target.closest('.gg-chip'); if (!ch) return; setTimeout(mundo, 0); suena('pop'); bota(ch); });
  }

  /* ── La foto de la ficha se inclina siguiendo el dedo o el ratón ── */
  var fotoFicha = document.querySelector('.gg-ficha-foto');
  if (fotoFicha) {
    fotoFicha.addEventListener('pointermove', function (e) {
      if (tranquilo) return;
      var r = fotoFicha.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      fotoFicha.style.transform = 'perspective(900px) rotateY(' + x * 14 + 'deg) rotateX(' + -y * 14 + 'deg) scale(1.02)';
    });
    fotoFicha.addEventListener('pointerleave', function () { fotoFicha.style.transform = ''; });
  }

  /* ── Página de la carta ── */
  var lista = document.querySelector('[data-carta-lista]');
  if (lista) {
    var vacia = document.querySelector('[data-carta-vacia]'), acciones = document.querySelector('[data-carta-acciones]'), aviso = document.querySelector('[data-carta-aviso]');
    var nombre = document.querySelector('[data-carta-nombre]'), wa = document.querySelector('[data-carta-wa]'), hoja = document.querySelector('[data-carta]');
    nombre.value = leer(CLAVE_NOMBRE, '');
    var base = location.href.replace(/carta\.html.*$/, '');
    var pintaCarta = function () {
      var c = carta();
      lista.innerHTML = c.map(function (x, i) {
        return '<li style="--i:' + i + '"><a href="producto/' + esc(x.slug) + '.html" class="croko-carta__foto"><img src="' + esc(x.img) + '" alt="" loading="lazy"></a><div><a href="producto/' + esc(x.slug) + '.html" class="croko-carta__nom">' + esc(x.nombre) + '</a><span class="croko-carta__pr">' + esc(x.precio) + '</span></div><button type="button" class="croko-carta__quitar" data-quitar="' + esc(x.slug) + '" aria-label="Quitar ' + esc(x.nombre) + ' de la carta">&times;</button></li>';
      }).join('');
      vacia.hidden = !!c.length; acciones.hidden = !c.length;
      var txt = 'Queridos Reyes Magos: ' + (nombre.value ? 'me llamo ' + nombre.value + ' y ' : '') + 'este año me gustaría:\n' + c.map(function (x) { return '★ ' + x.nombre + ' (' + x.precio + ')\n' + base + 'producto/' + x.slug + '.html'; }).join('\n') + '\n¡Gracias, Reyes!';
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(txt);
      pintaN();
    };
    pintaCarta();
    nombre.addEventListener('input', function () { guardar(CLAVE_NOMBRE, nombre.value.trim()); pintaCarta(); });
    lista.addEventListener('click', function (e) {
      var q = e.target.closest('[data-quitar]'); if (!q) return;
      guardar(CLAVE_CARTA, carta().filter(function (x) { return x.slug !== q.dataset.quitar; })); suena('quitar'); pintaCarta();
    });
    document.querySelector('[data-carta-imprimir]').addEventListener('click', function () { window.print(); });
    document.querySelector('[data-carta-sellar]').addEventListener('click', function () {
      hoja.classList.remove('sellada'); void hoja.offsetWidth; hoja.classList.add('sellada');
      suena('fanfarria'); confetiDe(hoja, 110);
      aviso.textContent = '¡Carta cerrada con el sello de Croko! Ya se puede imprimir o mandar a la familia.';
      dice('¡Qué carta más bonita!');
    });
    document.querySelector('[data-carta-cesta]').addEventListener('click', function () {
      var cesta = leer(CLAVE_CESTA, []), n = 0;
      carta().forEach(function (x) { var ya = cesta.filter(function (y) { return y.id === x.slug; })[0]; if (ya) ya.cant += 1; else cesta.push({ id: x.slug, nombre: x.nombre, img: x.img, precio: x.precio.replace(' €', ''), cant: 1 }); n++; });
      guardar(CLAVE_CESTA, cesta);
      var cn = document.querySelectorAll('[data-cesta-n]'), tot = cesta.reduce(function (a, x) { return a + x.cant; }, 0);
      Array.prototype.forEach.call(cn, function (el) { el.textContent = tot; el.removeAttribute('hidden'); });
      suena('fanfarria'); confetiDe(this, 60); bota(document.querySelector('.gg-nav-cesta'));
      aviso.innerHTML = n + (n === 1 ? ' juguete pasado' : ' juguetes pasados') + ' al carrito. <a href="cesta.html">Ver el carrito</a>';
    });
    setTimeout(function () { dice(carta().length ? '¡Mira tu carta! Puedes cerrarla con mi sello.' : 'Marca juguetes con la estrella y aparecerán aquí.', 5000); }, 1200);
  }

  /* Escape cierra el bocadillo */
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bocadillo) bocadillo.classList.remove('visible'); });
})();
