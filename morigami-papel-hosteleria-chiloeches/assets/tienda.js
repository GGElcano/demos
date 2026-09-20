/* Tienda de demostración (estructura gg-farre) · JS común.
   Menú móvil, buscador, filtros del listado, cesta en el navegador y chat.
   Sin dependencias. Nada de diálogos: los avisos se pintan en la página. */
(function () {
  'use strict';
  var CLAVE = "cesta-morigami";                 // dónde guarda la cesta este navegador
  var ENVIO_GRATIS = 50;
  var ENVIO_TXT = "Se calcula en el pago";

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* ── Menú móvil ── */
  var hamburger = document.getElementById('hamburger'), mobileMenu = document.getElementById('mobileMenu'), mmClose = document.getElementById('mmClose');
  if (hamburger && mobileMenu && mmClose) {
    var closeMenu = function () { hamburger.classList.remove('active'); mobileMenu.classList.remove('open'); document.body.classList.remove('gg-menu-abierto'); hamburger.setAttribute('aria-expanded', 'false'); };
    hamburger.addEventListener('click', function () { hamburger.classList.toggle('active'); var abierto = mobileMenu.classList.toggle('open'); document.body.classList.toggle('gg-menu-abierto', abierto); hamburger.setAttribute('aria-expanded', abierto ? 'true' : 'false'); });
    mmClose.addEventListener('click', closeMenu);
    Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { closeMenu(); hamburger.focus(); } });
  }
  /* ── Buscador de la cabecera ── */
  var bBtn = document.getElementById('ggBuscarBtn'), bBar = document.getElementById('ggBuscador');
  if (bBtn && bBar) {
    bBtn.addEventListener('click', function () { var abierto = bBar.hasAttribute('hidden'); if (abierto) bBar.removeAttribute('hidden'); else bBar.setAttribute('hidden', ''); bBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false'); if (abierto) { var i = bBar.querySelector('input[type=search]'); if (i) i.focus(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !bBar.hasAttribute('hidden')) { bBar.setAttribute('hidden', ''); bBtn.setAttribute('aria-expanded', 'false'); bBtn.focus(); } });
  }

  /* ── Cesta (localStorage) ── */
  function leerCesta() { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { return []; } }
  function guardarCesta(c) { try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { console.warn('cesta: no se pudo guardar', e); } pintarContador(); }
  function num(s) { var v = parseFloat(String(s).replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; }
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  function pintarContador() {
    var n = leerCesta().reduce(function (a, x) { return a + x.cant; }, 0);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-n]'), function (el) { el.textContent = n; if (n) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); });
  }
  pintarContador();

  var btnAnadir = document.querySelector('[data-anadir]');
  if (btnAnadir) {
    var cant = document.querySelector('[data-cant]');
    var menos = document.querySelector('[data-menos]'), mas = document.querySelector('[data-mas]');
    if (menos) menos.addEventListener('click', function () { cant.value = Math.max(1, (+cant.value || 1) - 1); });
    if (mas) mas.addEventListener('click', function () { cant.value = Math.min(99, (+cant.value || 1) + 1); });
    /* variantes: cambian el precio mostrado y el que va a la cesta */
    var variantes = document.querySelector('[data-variantes]');
    var precioEl = document.querySelector('[data-precio]');
    var varianteActual = null;
    if (variantes) {
      var primero = variantes.querySelector('.gg-variante[aria-pressed="true"]');
      if (primero) { varianteActual = primero.dataset.nombre; if (precioEl && primero.dataset.precio) precioEl.textContent = primero.dataset.precio; }
      Array.prototype.forEach.call(variantes.querySelectorAll('.gg-variante'), function (b) {
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(variantes.querySelectorAll('.gg-variante'), function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true'); varianteActual = b.dataset.nombre;
          if (precioEl && b.dataset.precio) precioEl.textContent = b.dataset.precio;
        });
      });
    }
    btnAnadir.addEventListener('click', function () {
      var c = leerCesta();
      var precio = precioEl ? precioEl.textContent : btnAnadir.dataset.precio;
      var id = btnAnadir.dataset.slug + (varianteActual ? '::' + varianteActual : '');
      var nombre = btnAnadir.dataset.nombre + (varianteActual ? ' · ' + varianteActual : '');
      var n = Math.max(1, +cant.value || 1);
      var ya = c.filter(function (x) { return x.id === id; })[0];
      if (ya) ya.cant += n; else c.push({ id: id, nombre: nombre, img: btnAnadir.dataset.img, precio: precio, cant: n });
      guardarCesta(c);
      var aviso = document.querySelector('[data-aviso-cesta]');
      if (aviso) aviso.innerHTML = 'Añadido al carrito. <a href="../cesta.html" style="text-decoration:underline">Ver el carrito</a>';
    });
  }

  var filas = document.querySelector('[data-cesta-filas]');
  if (filas) {
    var pintarCesta = function () {
      var c = leerCesta();
      var vacia = document.querySelector('[data-cesta-vacia]'), tabla = document.querySelector('[data-cesta-tabla]'), tot = document.querySelector('[data-cesta-tot]');
      if (!c.length) { vacia.removeAttribute('hidden'); tabla.setAttribute('hidden', ''); tot.setAttribute('hidden', ''); return; }
      vacia.setAttribute('hidden', ''); tabla.removeAttribute('hidden'); tot.removeAttribute('hidden');
      filas.innerHTML = '';
      var sub = 0;
      c.forEach(function (x, i) {
        var p = num(x.precio), t = p * x.cant; sub += t;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="gg-cesta-prod"><img src="' + x.img + '" alt=""><b>' + x.nombre.replace(/</g, '&lt;') + '</b></div></td><td>' + (p ? eur(p) : 'Consultar') + '</td><td>' + x.cant + '</td><td>' + (p ? eur(t) : '') + '</td><td><button type="button" class="gg-cesta-quitar" data-quitar="' + i + '">Quitar</button></td>';
        filas.appendChild(tr);
      });
      var envio = (ENVIO_GRATIS && sub >= ENVIO_GRATIS) ? 'Gratis' : ENVIO_TXT;
      document.querySelector('[data-subtotal]').textContent = eur(sub);
      document.querySelector('[data-envio]').textContent = envio;
      document.querySelector('[data-total]').textContent = eur(sub) + (envio === 'Gratis' ? '' : ' + envío');
      Array.prototype.forEach.call(filas.querySelectorAll('[data-quitar]'), function (b) { b.addEventListener('click', function () { var cc = leerCesta(); cc.splice(+b.dataset.quitar, 1); guardarCesta(cc); pintarCesta(); }); });
    };
    pintarCesta();
  }

  /* ── Listado: chips por categoría + búsqueda (?q=) + #categoria ── */
  var rejilla = document.querySelector('[data-rejilla]');
  if (rejilla) {
    var tarjetas = Array.prototype.slice.call(rejilla.querySelectorAll('.gg-prenda'));
    var chips = document.querySelector('[data-chips]');
    var nEl = document.querySelector('[data-listado-n]'), vacio = document.querySelector('[data-vacio]'), tit = document.querySelector('[data-listado-titulo]');
    var q = (new URLSearchParams(location.search).get('q') || '').toLowerCase().trim();
    var cat = (location.hash || '').replace('#', '');
    function aplicar() {
      var n = 0;
      tarjetas.forEach(function (t) {
        var ok = (!cat || (' ' + t.dataset.cats + ' ').indexOf(' ' + cat + ' ') >= 0) && (!q || t.dataset.nombre.indexOf(q) >= 0);
        if (ok) { t.removeAttribute('hidden'); n++; } else t.setAttribute('hidden', '');
      });
      if (nEl) nEl.textContent = n;
      if (vacio) { if (n) vacio.setAttribute('hidden', ''); else vacio.removeAttribute('hidden'); }
      if (chips) Array.prototype.forEach.call(chips.querySelectorAll('.gg-chip'), function (ch) { ch.classList.toggle('gg-chip-on', ch.dataset.cat === cat); });
      if (tit && q) tit.textContent = 'Resultados para «' + q + '»';
      var activa = chips && chips.querySelector('.gg-chip-on');
      if (activa && chips.scrollWidth > chips.clientWidth) chips.scrollLeft = Math.max(0, activa.offsetLeft - (chips.clientWidth - activa.offsetWidth) / 2);
    }
    if (chips) chips.addEventListener('click', function (e) { var ch = e.target.closest('.gg-chip'); if (!ch) return; cat = ch.dataset.cat; history.replaceState(null, '', cat ? '#' + cat : location.pathname + location.search); aplicar(); });
    window.addEventListener('hashchange', function () { cat = (location.hash || '').replace('#', ''); aplicar(); });
    aplicar();
  }

  /* ── Chat con el dependiente (solo si la tienda lo lleva) ── */
  var panel = document.querySelector('.chat');
  if (panel) {
    var LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    var API = LOCAL ? panel.dataset.chatLocal : panel.dataset.chatApi;
    var msgs = panel.querySelector('[data-chat-msgs]'), form = panel.querySelector('[data-chat-form]'), input = panel.querySelector('[data-chat-input]'), enviar = panel.querySelector('[data-chat-enviar]');
    var btnFlot = document.querySelector('.chat-btn');
    var historial = [], ocupado = false, saludado = false;
    var escapar = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var formatear = function (t) { var h = escapar(t); h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); h = h.replace(/(https?:\/\/[^\s)<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 44) + (u.length > 52 ? '…' : '') + '</a>'; }); return h; };
    var pintar = function (rol, texto, extra) { var el = document.createElement('div'); el.className = 'msg msg--' + rol + (extra ? ' ' + extra : ''); el.innerHTML = rol === 'yo' ? escapar(texto) : formatear(texto); msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; return el; };
    var abrir = function () { panel.classList.add('abierto'); panel.setAttribute('aria-hidden', 'false'); if (btnFlot) btnFlot.style.display = 'none'; if (!saludado) { saludado = true; pintar('bot', panel.dataset.chatSaludo); } setTimeout(function () { input.focus(); }, 350); };
    var cerrar = function () { panel.classList.remove('abierto'); panel.setAttribute('aria-hidden', 'true'); if (btnFlot) btnFlot.style.display = ''; };
    var preguntar = function (texto) {
      texto = (texto || '').trim(); if (!texto || ocupado) return;
      abrir(); pintar('yo', texto); historial.push({ role: 'user', content: texto }); input.value = ''; ocupado = true; enviar.disabled = true;
      var pensando = pintar('bot', 'Un momento, lo miro…', 'msg--pensando');
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: historial }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { var reply = d.reply || d.error || panel.dataset.chatFallback; pensando.remove(); pintar('bot', reply); historial.push({ role: 'assistant', content: reply }); })
        .catch(function () { pensando.remove(); pintar('bot', panel.dataset.chatFallback); })
        .then(function () { ocupado = false; enviar.disabled = false; input.focus(); });
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-chat-abrir]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); abrir(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-chat-cerrar]'), function (b) { b.addEventListener('click', cerrar); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-chat-pregunta]'), function (b) { b.addEventListener('click', function () { preguntar(b.dataset.chatPregunta); }); });
    form.addEventListener('submit', function (e) { e.preventDefault(); preguntar(input.value); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) cerrar(); });
  }
})();
