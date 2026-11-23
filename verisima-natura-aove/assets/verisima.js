/* Verísima Natura (23-nov-2026): precio por litro de cada formato con sus precios reales. */
(function () {
  'use strict';
  var D = window.VN_DATOS, c = document.getElementById('vnBarras'); if (!D || !c) return;
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  var F = D.formatos.map(function (f) { return { f: f, l: f.precio / f.litros }; }).sort(function (a, b) { return a.l - b.l; });
  var max = Math.max.apply(null, F.map(function (x) { return x.l; }));
  c.innerHTML = F.map(function (x, i) {
    var lit = x.f.litros >= 1 ? String(x.f.litros).replace('.', ',') + ' l' : (x.f.litros * 1000) + ' ml';
    return '<a class="vn-b' + (i === 0 ? ' top' : '') + '" href="producto/' + x.f.slug + '.html"><img src="' + x.f.img + '" alt="" width="56" height="56"><div class="vn-bt"><b>' + x.f.et + '</b><small>' + lit + ' por ' + eur(x.f.precio) + (x.f.bio ? ' · biodinámico Demeter' : '') + '</small>' +
      '<span class="vn-bar"><i style="width:' + Math.round(x.l / max * 100) + '%"></i></span></div><strong>' + eur(x.l) + '<small>/litro</small></strong></a>';
  }).join('');
})();
