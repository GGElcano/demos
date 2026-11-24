/* San Marcos Evangelista (24-nov-2026): litros al año -> cuántas cajas de SUS formatos de picual y cuánto sale, con sus precios. */
(function () {
  'use strict';
  var D = window.SM_DATOS, r = document.getElementById('smL'); if (!D || !r) return;
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function calc() {
    var L = +r.value; document.getElementById('smOut').textContent = L + ' l';
    var ops = D.cajas.map(function (c) { var n = Math.ceil(L / c.litros - 1e-9); return { c: c, n: n, t: n * c.precio, lt: n * c.litros }; })
      .sort(function (a, b) { return a.c.precio / a.c.litros - b.c.precio / b.c.litros; });
    document.getElementById('smOps').innerHTML = ops.map(function (o, i) {
      var c = o.c, q = o.n + (o.n === 1 ? ' caja' : ' cajas');
      return '<a class="sm-o' + (i === 0 ? ' top' : '') + '" href="producto/' + c.slug + '.html"><img src="' + c.img + '" alt="" width="64" height="64">' +
        '<div><b>' + q + ' de ' + c.uds + ' ' + c.envase + ' de ' + c.l + ' l</b><small>' + o.lt + ' litros · ' + eur(c.precio / c.litros).replace(' €', '') + ' €/litro' + (i === 0 ? ' · el litro más barato' : '') + '</small></div>' +
        '<strong>' + eur(o.t) + '</strong></a>';
    }).join('');
  }
  r.addEventListener('input', calc); calc();
})();
