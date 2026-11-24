/* AOVE Carrasqueño (24-nov-2026): «¿Para casa o para regalar?» con SUS precios: €/litro por formato y regalos por presupuesto. */
(function () {
  'use strict';
  var D = window.CQ_DATOS, c = document.getElementById('cqBarras'); if (!D || !c) return;
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function lit(l) { return l >= 1 ? String(l).replace('.', ',') + ' l' : Math.round(l * 1000) + ' ml'; }
  var gama = 'todo', a = 0, b = 9999;
  function casa() {
    var F = D.casa.filter(function (f) { return gama === 'todo' || f.gama === gama; }).map(function (f) { return { f: f, l: f.precio / f.litros }; }).sort(function (x, y) { return x.l - y.l; });
    var max = Math.max.apply(null, F.map(function (x) { return x.l; }));
    c.innerHTML = F.map(function (x, i) {
      return '<a class="cq-b' + (i === 0 ? ' top' : '') + '" href="producto/' + x.f.slug + '.html"><img src="' + x.f.img + '" alt="" width="56" height="56"><div class="cq-bt"><b>' + x.f.et + '</b><small>' + lit(x.f.litros) + ' por ' + eur(x.f.precio) + (i === 0 ? ' · el litro más barato' : '') + '</small>' +
        '<span class="cq-bar"><i style="width:' + Math.round(x.l / max * 100) + '%"></i></span></div><strong>' + eur(x.l) + '<small>/litro</small></strong></a>';
    }).join('');
  }
  function regalo() {
    var R = D.regalos.filter(function (r) { return r.precio > a && r.precio <= b || (a === 0 && r.precio <= b); }).sort(function (x, y) { return x.precio - y.precio; });
    document.getElementById('cqReg').innerHTML = R.map(function (r) {
      return '<a class="cq-r" href="producto/' + r.slug + '.html"><img src="' + r.img + '" alt="" width="160" height="160" loading="lazy"><b>' + r.n + '</b><span>' + eur(r.precio) + '</span></a>';
    }).join('');
  }
  function chips(id, fn) {
    var w = document.getElementById(id);
    w.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return;
      [].forEach.call(w.children, function (x) { x.classList.toggle('on', x === t); }); fn(t); });
  }
  chips('cqGama', function (t) { gama = t.dataset.g; casa(); });
  chips('cqPres', function (t) { a = +t.dataset.a; b = +t.dataset.b; regalo(); });
  [].forEach.call(document.querySelectorAll('.cq-tabs button'), function (t) {
    t.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('.cq-tabs button'), function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
      document.getElementById('cqCasa').hidden = t.dataset.t !== 'casa'; document.getElementById('cqRegalo').hidden = t.dataset.t !== 'regalo';
    });
  });
  casa(); regalo();
})();
