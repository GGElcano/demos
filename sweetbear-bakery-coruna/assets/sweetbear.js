/* Sweet Bear Bakery (20-nov-2026): mesa dulce con cuenta de raciones por invitado y propuesta por WhatsApp. */
(function () {
  'use strict';
  var D = window.SB_DATOS, carta = document.getElementById('sbCarta'); if (!D || !carta) return;
  var cant = D.ops.map(function () { return 0; }), orden = [], evento = 'Boda íntima', ultimo = null;
  D.ops.forEach(function (o, i) {
    var cel = document.createElement('div'); cel.className = 'sb-cel';
    cel.innerHTML = '<button type="button" class="sb-op" aria-pressed="false" aria-label="Añadir ' + o.nombre + '"><img src="' + o.img + '" alt="" width="600" height="600" loading="lazy"><b></b><span>' + o.nombre + '</span></button>' +
      '<button type="button" class="sb-menos" aria-label="Quitar una ' + o.nombre + '" hidden>−</button>';
    cel.querySelector('.sb-op').addEventListener('click', function () { poner(i, 1); });
    cel.querySelector('.sb-menos').addEventListener('click', function () { poner(i, -1); });
    carta.appendChild(cel);
  });
  function poner(i, n) {
    if (n > 0) { cant[i] += n; for (var k = 0; k < n; k++) orden.push(i); ultimo = i; }
    else if (cant[i] > 0) { cant[i]--; orden.splice(orden.lastIndexOf(i), 1); ultimo = null; }
    pintar();
  }
  Array.prototype.forEach.call(document.querySelectorAll('#sbEvento button'), function (b) {
    b.addEventListener('click', function () { evento = b.textContent; Array.prototype.forEach.call(document.querySelectorAll('#sbEvento button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); ultimo = null; pintar(); });
  });
  var inv = document.getElementById('sbInvitados'), fecha = document.getElementById('sbFecha'), completar = document.getElementById('sbCompletar');
  inv.addEventListener('input', function () { ultimo = null; pintar(); }); fecha.addEventListener('input', function () { ultimo = null; pintar(); });
  function fechaTxt() { if (!fecha.value) return ''; var p = fecha.value.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function raciones() { return cant.reduce(function (a, c, i) { return a + c * D.ops[i].rac; }, 0); }
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
  /* lo que falta: tartas enteras mientras falten 8 o más raciones; el resto, en cookies */
  function propuesta(falta) {
    var tarta = -1, cookie = -1;
    orden.slice().reverse().forEach(function (i) { if (tarta < 0 && D.ops[i].tipo === 'tarta' && D.ops[i].rac === 12) tarta = i; if (cookie < 0 && D.ops[i].tipo === 'cookie') cookie = i; });
    if (tarta < 0) tarta = 0; if (cookie < 0) cookie = D.ops.map(function (o) { return o.tipo; }).indexOf('cookie');
    var t = falta >= 8 ? Math.floor(falta / 12) + (falta % 12 >= 8 ? 1 : 0) : 0, c = Math.max(0, falta - t * 12);
    return { tarta: tarta, t: t, cookie: cookie, c: c };
  }
  function pintar() {
    Array.prototype.forEach.call(carta.children, function (cel, i) {
      cel.querySelector('.sb-op').setAttribute('aria-pressed', cant[i] ? 'true' : 'false');
      cel.querySelector('b').textContent = cant[i] ? '×' + cant[i] : '';
      if (cant[i]) cel.querySelector('.sb-menos').removeAttribute('hidden'); else cel.querySelector('.sb-menos').setAttribute('hidden', '');
    });
    var m = document.getElementById('sbMantel');
    if (!orden.length) m.innerHTML = '<p class="sb-vacia">Tu mesa está vacía: toca una tarta o unas cookies.</p>';
    else {
      m.innerHTML = ''; var MAX = 14;
      orden.slice(0, MAX).forEach(function (i, k) { var d = document.createElement('div'); d.className = 'sb-pieza'; if (!(i === ultimo && k === orden.lastIndexOf(i))) d.style.animation = 'none'; d.innerHTML = '<img src="' + D.ops[i].img + '" alt="' + D.ops[i].nombre + '" title="' + D.ops[i].nombre + '">'; m.appendChild(d); });
      if (orden.length > MAX) { var mas = document.createElement('div'); mas.className = 'sb-mas'; mas.textContent = '+' + (orden.length - MAX); m.appendChild(mas); }
    }
    var n = Math.max(1, Math.min(500, +inv.value || 0)), r = raciones(), falta = Math.max(0, n - r), pct = Math.min(100, Math.round(r / n * 100));
    document.getElementById('sbRacTxt').textContent = r + ' de ' + n + ' raciones';
    document.getElementById('sbRacPct').textContent = pct + ' %';
    document.getElementById('sbBarra').style.width = pct + '%';
    var caja = document.querySelector('.sb-raciones'); caja.classList.toggle('lleno', !falta && r > 0);
    var consejo = document.getElementById('sbConsejo');
    if (!r) { consejo.textContent = 'Para ' + n + ' personas calcula unas ' + Math.ceil(n / 12) + (Math.ceil(n / 12) === 1 ? ' tarta entera' : ' tartas enteras') + ', o combina tartas y cookies.'; completar.setAttribute('hidden', ''); }
    else if (falta) {
      var pr = propuesta(falta), partes = [];
      if (pr.t) partes.push(plural(pr.t, 'tarta', 'tartas') + ' más (' + D.ops[pr.tarta].nombre + ')');
      if (pr.c) partes.push(plural(pr.c, 'cookie', 'cookies') + ' (' + D.ops[pr.cookie].nombre + ')');
      consejo.innerHTML = 'Te faltan <b>' + plural(falta, 'ración', 'raciones') + '</b> para que llegue a todos: con ' + partes.join(' y ') + ' lo tienes.';
      completar.textContent = 'Completar la mesa con eso'; completar.removeAttribute('hidden');
      completar.onclick = function () { if (pr.t) poner(pr.tarta, pr.t); if (pr.c) poner(pr.cookie, pr.c); };
    } else {
      var sobra = r - n;
      consejo.innerHTML = '✓ Hay para todos' + (sobra ? ': sobran unas ' + sobra + ' raciones para repetir.' : ', justo.');
      completar.setAttribute('hidden', '');
    }
    var f = fechaTxt(), lista = cant.map(function (c, i) { return c ? c + ' × ' + D.ops[i].nombre : null; }).filter(Boolean);
    document.getElementById('sbResumen').textContent = evento + ' · ' + n + ' invitados' + (f ? ' · ' + f : '');
    var txt = 'Hola, quería una mesa dulce para ' + evento.toLowerCase() + ', ' + n + ' invitados' + (f ? ', el ' + f : '') + '.' +
      (lista.length ? ' Me gustaría: ' + lista.join(', ') + ' (unas ' + r + ' raciones).' : '') + ' ¿Me hacéis una propuesta?';
    document.getElementById('sbPedir').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(txt);
  }
  /* en el móvil la cuenta queda debajo de la carta: una píldora fija la enseña mientras se elige */
  var flota = document.createElement('a'); flota.className = 'sb-flota'; flota.href = '#sbMantel';
  flota.innerHTML = '<b></b><span><i></i></span>'; document.body.appendChild(flota);
  var enCarta = false, enCaja = false;
  function verFlota() { flota.classList.toggle('ver', enCarta && !enCaja && window.innerWidth <= 900); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { enCarta = e[0].isIntersecting; verFlota(); }).observe(carta);
    new IntersectionObserver(function (e) { enCaja = e[0].isIntersecting; verFlota(); }).observe(document.querySelector('.sb-raciones'));
  }
  var pintarBase = pintar;
  pintar = function () { pintarBase(); var n = Math.max(1, Math.min(500, +inv.value || 0)), r = raciones();
    flota.querySelector('b').textContent = r + ' de ' + n + ' raciones'; flota.querySelector('i').style.width = Math.min(100, Math.round(r / n * 100)) + '%'; flota.classList.toggle('lleno', r >= n && r > 0); };
  pintar();
})();
