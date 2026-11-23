/* Viok Sport (23-nov-2026): medidas de la sala -> unidades de SUS suelos de caucho (losetas, packs, rollos) y packs de sala si encaja. */
(function () {
  'use strict';
  var D = window.VK_DATOS, l = document.getElementById('vkL'); if (!D || !l) return;
  var a = document.getElementById('vkA');
  function n(e) { return Math.max(0, parseFloat(String(e.value).replace(',', '.')) || 0); }
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function calc() {
    var L = n(l), A = n(a), m2 = Math.round(L * A * 100) / 100;
    document.getElementById('vkM2').textContent = String(m2).replace('.', ',') + ' m²';
    var cols = Math.min(30, Math.ceil(L)), filas = Math.min(20, Math.ceil(A)), rej = document.getElementById('vkRej');
    rej.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; rej.style.aspectRatio = cols + '/' + filas;
    rej.innerHTML = new Array(cols * filas + 1).join('<i></i>');
    var ops = D.suelos.map(function (s) { var u = Math.ceil(m2 / s.m2 - 1e-9); return { s: s, u: u, t: u * s.precio }; }).sort(function (x, y) { return x.t - y.t; });
    document.getElementById('vkLista').innerHTML = ops.map(function (o, i) {
      var q = o.u + ' ' + (o.s.tipo === 'rollo' ? (o.u === 1 ? 'rollo' : 'rollos') : o.s.tipo === 'pack' ? (o.u === 1 ? 'pack' : 'packs') : 'losetas');
      return '<a class="vk-o' + (i === 0 ? ' top' : '') + '" href="producto/' + o.s.slug + '.html"><img src="' + o.s.img + '" alt="" width="56" height="56"><div><b>' + q + '</b><small>' + o.s.nombre + (i === 0 ? ' · la más económica' : '') + '</small></div><span>desde ' + eur(o.t) + '</span></a>';
    }).join('');
    var salas = D.salas.filter(function (s) { return m2 >= s.m2 * 0.75 && m2 <= s.m2 * 1.35; });
    document.getElementById('vkSalas').innerHTML = salas.length ? '<p class="vk-sal-t">¿La quieres equipada entera? Packs de sala ya montados</p>'<div class="vk-sal">' + salas.map(function (s) {
      return '<a href="producto/' + s.slug + '.html"><img src="' + s.img + '" alt="" width="120" height="120"><b>' + s.nombre + '</b><span>' + eur(s.precio) + '</span></a>'; }).join('') + '</div>' : '';
  }
  [l, a].forEach(function (e) { e.addEventListener('input', calc); }); calc();
})();
