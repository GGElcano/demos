/* Conekta (22-nov-2026): m³ de la piscina y filtros de su tienda por caudal (orientativo: toda el agua en 5 h). */
(function () {
  'use strict';
  var D = window.CK_DATOS, l = document.getElementById('ckLargo'); if (!D || !l) return;
  var a = document.getElementById('ckAncho'), p = document.getElementById('ckProf');
  function n(e) { return Math.max(0, parseFloat(String(e.value).replace(',', '.')) || 0); }
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function fmt(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function calc() {
    var m3 = n(l) * n(a) * n(p), lh = m3 * 1000 / 5;
    document.getElementById('ckM3').textContent = (Math.round(m3 * 10) / 10).toString().replace('.', ',') + ' m³';
    document.getElementById('ckNecesita').textContent = fmt(m3 * 1000) + ' litros. Necesitas un filtro de al menos ' + fmt(lh) + ' l/h.';
    document.getElementById('ckOla').style.height = Math.min(85, 20 + m3 / 2) + '%';
    var ok = D.filtros.filter(function (f) { return f.lh >= lh; }).slice(0, 4);
    document.getElementById('ckLista').innerHTML = ok.length ? ok.map(function (f, i) {
      return '<a class="ck-f' + (i === 0 ? ' top' : '') + '" href="producto/' + f.slug + '.html"><img src="' + f.img + '" alt="" width="56" height="56"><div><b>' + f.nombre + '</b><small>' + (i === 0 ? 'El justo para tu piscina' : 'Con más margen') + '</small></div><span>' + eur(f.precio) + '</span></a>';
    }).join('') : '<p>Para una piscina así necesitas un equipo a medida: llámanos al 932 11 09 57.</p>';
  }
  [l, a, p].forEach(function (e) { e.addEventListener('input', calc); }); calc();
})();
