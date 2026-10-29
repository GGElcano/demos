/* Casa King · demo de G&G Elcano (29-oct-2026). En inglés (raíz) y castellano (es/): T(en, es).
 * Una sola pieza para todas las páginas: menú, letra grande, cesta (en el navegador), listado con
 * filtros sobre el catálogo entero (assets/catalog.js), ficha de cada artículo (item.html#id),
 * «Sell to us» y el asistente. La demo no cobra ni envía nada: los pedidos y formularios se quedan
 * en el navegador o abren un WhatsApp que escribe la propia persona. */
(function () {
  'use strict';
  var TEL = '602 610 103', WA = '34602610103';
  var UP = 'https://www.casaking.es/wp-content/uploads/';
  var DEMO = 'https://ggelcano.github.io/demos/casaking-muebles-alhaurin/';
  var CLAVE_CESTA = 'ck-basket', CLAVE_LETRA = 'ck-letra', CLAVE_CHAT = 'ck-chat';
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var CHAT_API = local ? 'http://localhost:8787/chat/casaking' : 'https://dependiente-demo.ggelcano.workers.dev/chat/casaking';
  var ES = document.documentElement.lang === 'es';   // la versión en castellano vive en es/
  function T(en, es) { return ES ? es : en; }
  var LOCALE = T('en-GB', 'es-ES');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function eur(v) { var n = Number(v), t = n % 1 ? n.toFixed(2) : String(n); return ES ? t.replace('.', ',') + ' €' : '€' + t; }
  // búsqueda sin tildes ni mayúsculas: «sofa» encuentra «Sofá»
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function lee(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function guarda(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* incógnito */ } }
  function waLink(texto) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto); }

  /* ── letra grande ─────────────────────────────────────────────── */
  var botonLetra = $('[data-letra]');
  function ponLetra(on) {
    document.documentElement.classList.toggle('letra-grande', on);
    if (botonLetra) botonLetra.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  ponLetra(!!lee(CLAVE_LETRA, false));
  if (botonLetra) botonLetra.addEventListener('click', function () {
    var on = !document.documentElement.classList.contains('letra-grande');
    ponLetra(on); guarda(CLAVE_LETRA, on);
  });

  /* ── menú en el móvil ─────────────────────────────────────────── */
  var botonMenu = $('[data-menu-btn]'), nav = $('.nav');
  if (botonMenu && nav) botonMenu.addEventListener('click', function () {
    var on = !nav.classList.contains('abierto');
    nav.classList.toggle('abierto', on); botonMenu.setAttribute('aria-expanded', on ? 'true' : 'false');
  });

  /* ── cambiar de idioma sin perder el artículo o el filtro ─────── */
  $$('[data-idioma]').forEach(function (a) { a.addEventListener('click', function () { a.href = a.href.split('#')[0] + location.hash; }); });

  /* ── buscador de la cabecera ──────────────────────────────────── */
  $$('[data-buscar]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = f.querySelector('input').value.trim();
      location.href = 'shop.html' + (q ? '#s-' + encodeURIComponent(q) : '');
    });
  });

  /* ── abierto / cerrado (hora de España) ───────────────────────── */
  function horaMadrid() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return { dia: o.weekday, min: Number(o.hour) * 60 + Number(o.minute) };
  }
  $$('[data-abierto]').forEach(function (el) {
    var h = horaMadrid(), dias = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var abre = dias.indexOf(h.dia) >= 0 && h.min >= 600 && h.min < 840;
    var finde = h.dia === 'Sat' || h.dia === 'Sun';
    el.textContent = abre ? T('Open now · until 2 pm', 'Abierto ahora · hasta las 14 h')
      : dias.indexOf(h.dia) >= 0 && h.min < 600 ? T('Closed now · opens today at 10 am', 'Cerrado ahora · abre hoy a las 10 h')
      : T('Closed now · opens ' + (finde ? 'Monday' : 'tomorrow') + ' at 10 am', 'Cerrado ahora · abre ' + (finde ? 'el lunes' : 'mañana') + ' a las 10 h');
    el.classList.toggle('si', abre);
    var fila = $('[data-dia="' + h.dia + '"]'); if (fila) fila.classList.add('hoy');
  });

  /* ── cesta ────────────────────────────────────────────────────── */
  function cesta() { return lee(CLAVE_CESTA, []); }
  function pintaContador() { $$('[data-cesta-n]').forEach(function (b) { var n = cesta().length; b.textContent = n ? String(n) : ''; }); }
  pintaContador();
  function anade(p) {
    var c = cesta();
    if (c.some(function (x) { return x.i === p.i; })) return false;
    c.push({ i: p.i, n: p.n, p: p.p, t: p.t, s: p.s }); guarda(CLAVE_CESTA, c); pintaContador(); return true;
  }

  /* ── catálogo ─────────────────────────────────────────────────── */
  var CAT = window.CK_CATALOGO || [], CATS = window.CK_CATEGORIAS || {}, GRUPOS = window.CK_GRUPOS || [];
  var porId = {}, porCodigo = {}; CAT.forEach(function (p) { porId[p.i] = p; if (p.s) porCodigo[p.s.toUpperCase()] = p; });
  function tarjeta(p) {
    return '<article class="tarjeta">' +
      '<a class="tarjeta-foto" href="item.html#' + p.i + '"><img src="' + esc(UP + p.t) + '" alt="' + esc(p.n) + '" width="300" height="300" loading="lazy"></a>' +
      '<div class="tarjeta-txt">' + (p.nw ? '<span class="etq-nuevo">' + T('New in', 'Novedad') + '</span>' : '') +
      '<a class="tarjeta-nombre" href="item.html#' + p.i + '">' + esc(p.n) + '</a>' +
      '<span class="tarjeta-desc">' + esc((p.d || []).join(' · ')) + '</span>' +
      '<span class="tarjeta-precio">' + eur(p.p) + '</span></div></article>';
  }

  /* ── listado: shop.html#g-furniture · #c-mirrors · #new · #s-lamp ── */
  var VISTOS = 48, mostrados = VISTOS;
  function estado() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    var e = { g: '', c: '', nuevo: false, q: '' };
    if (h.indexOf('g-') === 0) e.g = h.slice(2);
    else if (h.indexOf('c-') === 0) { e.c = h.slice(2); e.g = (CATS[e.c] || {}).g || ''; }
    else if (h === 'new') e.nuevo = true;
    else if (h.indexOf('s-') === 0) e.q = h.slice(2);
    return e;
  }
  function pintaListado() {
    var rej = $('[data-rejilla]'); if (!rej) return;
    var e = estado(), orden = ($('[data-orden]') || {}).value || 'nuevo';
    var q = norm(e.q).split(/\s+/).filter(Boolean);
    var lista = CAT.filter(function (p) {
      if (e.c && p.c !== e.c) return false;
      if (e.g && !e.c && (CATS[p.c] || {}).g !== e.g) return false;
      if (e.nuevo && !p.nw) return false;
      if (q.length) { var txt = norm(p.n + ' ' + (p.e || '') + ' ' + (p.d || []).join(' ') + ' ' + p.s + ' ' + (CATS[p.c] || {}).n); return q.every(function (w) { return txt.indexOf(w) >= 0; }); }
      return true;
    });
    if (orden === 'barato') lista.sort(function (a, b) { return a.p - b.p; });
    else if (orden === 'caro') lista.sort(function (a, b) { return b.p - a.p; });
    else lista.sort(function (a, b) { return b.i - a.i; });
    var titulo = e.c ? CATS[e.c].n : e.g ? (GRUPOS.filter(function (g) { return g.id === e.g; })[0] || {}).n : e.nuevo ? T('New in this month', 'Novedades de este mes') : e.q ? T('Results for “', 'Resultados de «') + e.q + T('”', '»') : T('Everything in the shop', 'Todo lo que hay en la tienda');
    $('[data-titulo]').textContent = titulo || T('Everything in the shop', 'Todo lo que hay en la tienda');
    $('[data-n]').textContent = lista.length.toLocaleString(LOCALE) + (lista.length === 1 ? T(' item', ' artículo') : T(' items', ' artículos'));
    var campo = $('[data-filtro-q]'); if (campo && document.activeElement !== campo) campo.value = e.q;
    // chips: grupos arriba; dentro de un grupo, sus secciones
    var chips = '<button type="button" class="chip" data-ir="" aria-pressed="' + (!e.g && !e.nuevo && !e.q) + '">' + T('Everything', 'Todo') + '</button>' +
      '<button type="button" class="chip" data-ir="new" aria-pressed="' + e.nuevo + '">' + T('New in', 'Novedades') + '</button>';
    if (e.g) {
      var g = GRUPOS.filter(function (x) { return x.id === e.g; })[0];
      chips += '<button type="button" class="chip" data-ir="g-' + g.id + '" aria-pressed="' + !e.c + '">' + T('All ', 'Todo: ') + esc(g.n.toLowerCase()) + '</button>';
      g.cats.forEach(function (c) { chips += '<button type="button" class="chip" data-ir="c-' + c + '" aria-pressed="' + (e.c === c) + '">' + esc(CATS[c].n) + '</button>'; });
    } else GRUPOS.forEach(function (g) { chips += '<button type="button" class="chip" data-ir="g-' + g.id + '" aria-pressed="false">' + esc(g.n) + '</button>'; });
    $('[data-chips]').innerHTML = chips;
    rej.innerHTML = lista.slice(0, mostrados).map(tarjeta).join('');
    $('[data-vacio]').hidden = lista.length > 0;
    var mas = $('[data-mas]');
    mas.hidden = lista.length <= mostrados;
    $('[data-mas-txt]').textContent = T('Showing ', 'Viendo ') + Math.min(mostrados, lista.length) + T(' of ', ' de ') + lista.length.toLocaleString(LOCALE);
    document.title = (titulo || T('Shop', 'Tienda')) + ' · Casa King';
  }
  if ($('[data-rejilla]')) {
    pintaListado();
    window.addEventListener('hashchange', function () { mostrados = VISTOS; pintaListado(); window.scrollTo(0, 0); });
    $('[data-chips]').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ir]'); if (!b) return;
      if (b.dataset.ir) { location.hash = b.dataset.ir; return; }
      history.replaceState(null, '', location.pathname); mostrados = VISTOS; pintaListado();
    });
    $('[data-orden]').addEventListener('change', function () { mostrados = VISTOS; pintaListado(); });
    $('[data-mas] button').addEventListener('click', function () { mostrados += VISTOS; pintaListado(); });
    var fq = $('[data-filtro-q]'), t;
    fq.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { var v = fq.value.trim(); history.replaceState(null, '', v ? '#s-' + encodeURIComponent(v) : location.pathname); mostrados = VISTOS; pintaListado(); }, 250); });
  }

  /* ── ficha: item.html#38360 ───────────────────────────────────── */
  function pintaFicha() {
    var caja = $('[data-ficha]'); if (!caja) return;
    var h = decodeURIComponent(location.hash.slice(1)).trim();
    var p = porId[Number(h)] || porCodigo[h.toUpperCase()];  // item.html#38360 o item.html#CK23007ST (enlaces del asistente)
    if (!p) { caja.innerHTML = '<div class="vacio">' + T('This item is no longer in the list. Stock changes every day: <a href="shop.html">see everything in the shop</a> or call ', 'Este artículo ya no está en la lista. El género cambia cada día: <a href="shop.html">mira todo lo que hay en la tienda</a> o llama al ') + TEL + '.</div>'; return; }
    var cat = CATS[p.c] || { n: '', g: '' }, grupo = GRUPOS.filter(function (g) { return g.id === cat.g; })[0];
    var fotos = p.f.map(function (f) { return UP + f; });
    var enlace = DEMO + T('', 'es/') + 'item.html#' + p.i;
    var msg = T('Hello Casa King, I am interested in the ' + p.n + ' (' + p.s + ', ' + eur(p.p) + '). Is it still available? ',
                'Hola, Casa King. Me interesa este artículo: ' + p.n + ' (' + p.s + ', ' + eur(p.p) + '). ¿Sigue disponible? ') + enlace;
    caja.innerHTML =
      '<p class="migas"><a href="index.html">' + T('Home', 'Inicio') + '</a> / ' + (grupo ? '<a href="shop.html#g-' + grupo.id + '">' + esc(grupo.n) + '</a> / ' : '') + '<a href="shop.html#c-' + p.c + '">' + esc(cat.n) + '</a></p>' +
      '<div class="ficha"><div><div class="ficha-foto"><img src="' + esc(fotos[0]) + '" alt="' + esc(p.n) + '" width="900" height="600" data-foto-grande></div>' +
      (fotos.length > 1 ? '<div class="miniaturas">' + fotos.map(function (f, k) { return '<button type="button" aria-label="' + T('Photo ', 'Foto ') + (k + 1) + '" aria-pressed="' + (k === 0) + '" data-foto="' + esc(f) + '"><img src="' + esc(f) + '" alt="" width="84" height="84" loading="lazy"></button>'; }).join('') + '</div>' : '') +
      '</div><div>' + (p.nw ? '<span class="etq-nuevo">' + T('New in', 'Novedad') + '</span>' : '') +
      '<h1>' + esc(p.n) + '</h1><div class="ficha-precio">' + eur(p.p) + '</div>' +
      '<p class="ficha-unico">' + T('Only one available · stock changes every day', 'Pieza única · el género cambia cada día') + '</p>' +
      (p.d && p.d.length ? '<ul class="ficha-medidas">' + p.d.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="ficha-botones"><button type="button" class="btn btn-navy" data-anadir>' + T('Add to basket', 'Añadir a la cesta') + '</button>' +
      '<a class="btn btn-verde" href="' + esc(waLink(msg)) + '" target="_blank" rel="noopener">' + T('Ask about it on WhatsApp', 'Preguntar por WhatsApp') + '</a>' +
      '<a class="btn btn-borde" href="tel:+34602610103">' + T('Call the shop', 'Llamar a la tienda') + ' · ' + TEL + '</a></div>' +
      '<p class="aviso-ok" data-aviso aria-live="polite"></p>' +
      '<div class="ficha-nota"><p>' + T('<b>Delivery:</b> we deliver, assemble and install all over the Costa del Sol. We confirm the price for your address.', '<b>Entrega:</b> lo llevamos, lo montamos y lo dejamos instalado en toda la Costa del Sol. Te confirmamos el precio para tu dirección.') + '</p>' +
      '<p>' + T('<b>Collect:</b> from the shop in Alhaurín el Grande, Monday to Saturday, 10 am to 2 pm.', '<b>Recogida:</b> en la tienda de Alhaurín el Grande, de lunes a sábado de 10 a 14 h.') + '</p>' +
      '<p class="ficha-codigo">' + T('Item code ', 'Código del artículo ') + esc(p.s) + ' · <a href="' + esc(p.u) + '" target="_blank" rel="noopener">' + T('see it on the current website', 'verlo en la web actual') + '</a></p></div>' +
      '</div></div>';
    $$('[data-foto]', caja).forEach(function (b) {
      b.addEventListener('click', function () { $('[data-foto-grande]').src = b.dataset.foto; $$('[data-foto]', caja).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
    });
    $('[data-anadir]', caja).addEventListener('click', function () {
      $('[data-aviso]').innerHTML = (anade(p) ? T('Added to your basket. ', 'Añadido a tu cesta. ') : T('It is already in your basket. ', 'Ya está en tu cesta. ')) + '<a href="basket.html">' + T('See basket', 'Ver la cesta') + '</a>';
    });
    var rel = CAT.filter(function (q) { return q.c === p.c && q.i !== p.i; }).sort(function (a, b) { return b.i - a.i; }).slice(0, 8);
    $('[data-relacionados]').innerHTML = rel.length ? '<h2>' + T('More ', 'Más: ') + esc(cat.n.toLowerCase()) + '</h2><div class="rejilla">' + rel.map(tarjeta).join('') + '</div>' : '';
    document.title = p.n + ' ' + eur(p.p) + ' · Casa King';
  }
  if ($('[data-ficha]')) { pintaFicha(); window.addEventListener('hashchange', function () { pintaFicha(); window.scrollTo(0, 0); }); }

  /* ── cesta.html ───────────────────────────────────────────────── */
  function pintaCesta() {
    var caja = $('[data-cesta]'); if (!caja) return;
    var c = cesta().map(function (x) { return porId[x.i] ? { i: x.i, n: porId[x.i].n, p: x.p, t: x.t, s: x.s } : x; });
    if (!c.length) { caja.innerHTML = '<div class="vacio">' + T('Your basket is empty. <a href="shop.html">See everything in the shop</a>.', 'Tu cesta está vacía. <a href="shop.html">Mira todo lo que hay en la tienda</a>.') + '</div>'; return; }
    var total = c.reduce(function (s, x) { return s + Number(x.p); }, 0);
    var pedido = T('Hello Casa King, I would like to order:\n', 'Hola, Casa King. Quiero pedir:\n') + c.map(function (x) { return '- ' + x.n + ' (' + x.s + ') ' + eur(x.p); }).join('\n') + '\nTotal ' + eur(total) + T('. Please tell me the delivery price for my address.', '. ¿Me decís cuánto cuesta la entrega a mi dirección?');
    caja.innerHTML = c.map(function (x) {
      return '<div class="cesta-linea"><img src="' + esc(UP + x.t) + '" alt="" width="96" height="96"><div><a href="item.html#' + x.i + '"><b>' + esc(x.n) + '</b></a><br><small>' + T('Code ', 'Código ') + esc(x.s) + T(' · only one', ' · pieza única') + '</small></div><b>' + eur(x.p) + '</b><button type="button" class="cesta-quitar" data-quitar="' + x.i + '">' + T('Remove', 'Quitar') + '</button></div>';
    }).join('') +
      '<div class="cesta-tot"><div><span>' + T('Items', 'Artículos') + '</span><span>' + eur(total) + '</span></div><div><span>' + T('Delivery and assembly', 'Entrega y montaje') + '</span><span>' + T('We confirm it for your address', 'Te lo confirmamos según tu dirección') + '</span></div>' +
      '<div class="cesta-total"><span>Total</span><span>' + eur(total) + '</span></div>' +
      '<button type="button" class="btn btn-navy" data-pagar>' + T('Go to checkout', 'Ir a pagar') + '</button>' +
      '<a class="btn btn-verde" href="' + esc(waLink(pedido)) + '" target="_blank" rel="noopener">' + T('Or send this order by WhatsApp', 'O mandar este pedido por WhatsApp') + '</a>' +
      '<p class="aviso-ok" data-aviso-pago aria-live="polite"></p></div>';
    $$('[data-quitar]', caja).forEach(function (b) { b.addEventListener('click', function () { guarda(CLAVE_CESTA, cesta().filter(function (x) { return x.i !== Number(b.dataset.quitar); })); pintaContador(); pintaCesta(); }); });
    $('[data-pagar]', caja).addEventListener('click', function () { $('[data-aviso-pago]').textContent = T('This is a demo, so nothing is charged. In the real shop this step is the secure card payment of your website.', 'Esto es una demo y no se cobra nada. En la tienda de verdad, aquí va el pago seguro con tarjeta de la web.'); });
  }
  pintaCesta();

  /* ── Sell to us: fotos en vista previa; la demo no envía nada ─── */
  var fVender = $('[data-vender]');
  if (fVender) {
    var entrada = $('input[type=file]', fVender), previa = $('[data-previa]', fVender);
    entrada.addEventListener('change', function () {
      previa.innerHTML = '';
      Array.prototype.slice.call(entrada.files, 0, 8).forEach(function (f) { var img = document.createElement('img'); img.alt = ''; img.src = URL.createObjectURL(f); previa.appendChild(img); });
    });
    fVender.addEventListener('submit', function (e) {
      e.preventDefault();
      $('[data-vender-ok]').textContent = T('Thank you. This is a demo, so nothing has been sent. In the real website your photos and details reach Casa King straight away and they call you back.', 'Gracias. Esto es una demo y no se ha enviado nada. En la web de verdad, las fotos y los datos le llegan a Casa King al momento y te llaman.');
    });
  }

  /* ── portada: fotos del hero que se van turnando ──────────────── */
  var fotosHero = $$('.hero-fotos a');
  if (fotosHero.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var k = 0; setInterval(function () { fotosHero[k].classList.remove('on'); k = (k + 1) % fotosHero.length; fotosHero[k].classList.add('on'); }, 4500);
  }

  /* ── asistente ────────────────────────────────────────────────── */
  var boton = $('[data-chat-boton]'), panel = $('[data-chat-panel]');
  if (!boton || !panel) return;
  var msgs = $('.chat-msgs', panel), form = $('.chat-form', panel), input = $('input', form), sug = $('.chat-sugerencias', panel);
  var hist = lee(CLAVE_CHAT, []), enviando = false;
  var SALUDO = T('Hello, I am Kingsley, the virtual assistant of Casa King. Tell me what you are looking for (and the space you have, if it is furniture) and I will show you what we have in the shop today.',
                 'Hola, soy Kingsley, el asistente virtual de Casa King. Dime qué buscas (y el hueco que tienes, si es un mueble) y te enseño lo que hay hoy en la tienda.');
  var FALLO = T('Sorry, I cannot answer right now. Please call or WhatsApp the shop on ' + TEL + ' (Monday to Saturday, 10 am to 2 pm).',
                'Perdona, ahora mismo no puedo contestar. Llama o escribe por WhatsApp a la tienda al ' + TEL + ' (de lunes a sábado, de 10 a 14 h).');
  function enlaza(t) {
    return esc(t).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, function (u) {
      // los enlaces del asistente apuntan a la ficha en inglés; en es/ se abre la ficha en castellano
      var href = local ? u.replace(DEMO, '').replace(/^es\//, '') : (ES ? u.replace(DEMO + 'item.html', DEMO + 'es/item.html') : u);
      return '<a href="' + href + '">' + (u.indexOf(DEMO) === 0 ? T('see it here', 'verlo aquí') : u) + '</a>';
    }).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  function pinta(rol, texto, clase) {
    var d = document.createElement('div'); d.className = 'chat-msg ' + (rol === 'user' ? 'yo' : 'el') + (clase ? ' ' + clase : '');
    d.innerHTML = enlaza(texto); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function repinta() { msgs.innerHTML = ''; pinta('assistant', SALUDO); hist.forEach(function (m) { pinta(m.role, m.content); }); sug.hidden = hist.length > 0; }
  function abre() { panel.classList.add('abierto'); boton.hidden = true; boton.setAttribute('aria-expanded', 'true'); repinta(); input.focus(); }
  function cierra() { panel.classList.remove('abierto'); boton.hidden = false; boton.setAttribute('aria-expanded', 'false'); boton.focus(); }
  boton.addEventListener('click', abre);
  $('.chat-cerrar', panel).addEventListener('click', cierra);
  $('[data-chat-borrar]', panel).addEventListener('click', function () { hist = []; guarda(CLAVE_CHAT, hist); repinta(); });
  $$('[data-chat-abrir]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); abre(); if (a.dataset.chatAbrir) envia(a.dataset.chatAbrir); }); });
  sug.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) envia(b.textContent); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value.trim(); if (t && !enviando) { input.value = ''; envia(t); } });
  function envia(texto) {
    enviando = true; sug.hidden = true;
    pinta('user', texto); hist.push({ role: 'user', content: texto.slice(0, 600) }); guarda(CLAVE_CHAT, hist);
    var esperando = pinta('assistant', T('Writing…', 'Escribiendo…'), 'esperando');
    fetch(CHAT_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-14) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { var r = (d && d.reply) || FALLO; esperando.remove(); pinta('assistant', r); hist.push({ role: 'assistant', content: r }); guarda(CLAVE_CHAT, hist); })
      .catch(function () { esperando.remove(); pinta('assistant', FALLO); })
      .then(function () { enviando = false; });
  }
})();
