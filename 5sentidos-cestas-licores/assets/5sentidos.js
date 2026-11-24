/* 5Sentidos (24-nov-2026): cestas de Navidad para empresas: tipo + presupuesto por cesta + cuántas -> SUS cestas y total del pedido. */
(function () {
  'use strict';
  var D = window.CS_DATOS, mx = document.getElementById('csMax'); if (!D || !mx) return;
  var n = document.getElementById('csN'), tipo = 'todo';
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  var NT = { jamon: 'Con jamón', paleta: 'Con paleta', sin: 'Sin jamón ni paleta' };
  function calc() {
    var M = +mx.value, N = +n.value;
    document.getElementById('csMaxO').textContent = M + ' €'; document.getElementById('csNO').textContent = N;
    var C = D.cestas.filter(function (c) { return c.precio <= M && (tipo === 'todo' || c.tipo === tipo); }).sort(function (a, b) { return b.precio - a.precio; });
    document.getElementById('csRes').innerHTML = C.length ? C.map(function (c) {
      return '<a class="cs-c" href="producto/' + c.slug + '.html"><img src="' + c.img + '" alt="" width="200" height="200" loading="lazy"><div><small>' + NT[c.tipo] + '</small><b>' + c.n + '</b><p>' + c.txt + '</p></div>' +
        '<div class="cs-t"><span>' + eur(c.precio) + ' / cesta</span><strong>' + eur(c.precio * N) + '</strong><small>' + N + (N === 1 ? ' cesta' : ' cestas') + '</small></div></a>';
    }).join('') : '<p class="cs-vacio">Con ese presupuesto no hay cestas de este tipo. Sube el presupuesto o llámanos al 611 433 507 y te la preparamos.</p>';
  }
  document.getElementById('csTipo').addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return; tipo = t.dataset.t;
    [].forEach.call(this.children, function (x) { x.classList.toggle('on', x === t); }); calc();
  });
  [mx, n].forEach(function (e) { e.addEventListener('input', calc); }); calc();
})();
