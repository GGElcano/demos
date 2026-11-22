/* THINKCAR (22-nov-2026): elegidor de equipo con sus categorías reales. */
(function () {
  'use strict';
  var D = window.TC_DATOS, res = document.getElementById('tcRes'); if (!D || !res) return;
  var veh = 'termicos', trab = 'diag';
  var NOM = { termicos: 'gasolina, diésel e híbridos', electricos: 'eléctricos', camiones: 'camiones', motos: 'motos' };
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function elegir() {
    var cat = trab === 'diag' ? veh : trab;
    var lista = D.ops.filter(function (o) { return o.cats.indexOf(cat) > -1; });
    if (trab === 'diag' && veh === 'electricos') lista = lista.concat(D.ops.filter(function (o) { return o.cats.indexOf('prueba') > -1 && /aislamiento|EV/i.test(o.nombre) && lista.indexOf(o) < 0; }));
    if (trab === 'diag') { var eq = /EVD|EURO|EXPERT|T78|MASTER|\bCV\b|TRUCK|MOTO|\b39\d\b|\b19\d\b/i; lista.sort(function (a, b) { return (eq.test(b.nombre) ? 1 : 0) - (eq.test(a.nombre) ? 1 : 0); }); }
    return lista.slice(0, 8);
  }
  function pintar() {
    Array.prototype.forEach.call(document.querySelectorAll('#tcVeh button'), function (b) { b.setAttribute('aria-pressed', b.dataset.v === veh ? 'true' : 'false'); });
    Array.prototype.forEach.call(document.querySelectorAll('#tcTrab button'), function (b) { b.setAttribute('aria-pressed', b.dataset.t === trab ? 'true' : 'false'); });
    var l = elegir();
    res.innerHTML = l.length ? l.map(function (o, i) {
      return '<a class="tc-prod" style="animation-delay:' + (i * 0.05) + 's" href="producto/' + o.slug + '.html"><img src="' + o.img + '" alt="" width="600" height="600" loading="lazy"><em>' + (i === 0 ? 'Recomendado' : 'También encaja') + '</em><b>' + o.nombre + '</b><small>' + (o.precio ? (o.desde ? 'desde ' : '') + eur(o.precio) : 'Consultar precio') + '</small></a>';
    }).join('') : '<p class="tc-vacio">Para esto te asesoramos mejor por WhatsApp: cuéntanos qué vehículos tienes y qué trabajo quieres hacer.</p>';
    var tTxt = document.querySelector('#tcTrab button[data-t="' + trab + '"]').textContent.toLowerCase();
    document.getElementById('tcWa').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent('Hola, tengo un taller con ' + NOM[veh] + ' y busco un equipo para ' + tTxt + '. ¿Cuál me recomendáis?');
  }
  Array.prototype.forEach.call(document.querySelectorAll('#tcVeh button'), function (b) { b.addEventListener('click', function () { veh = b.dataset.v; pintar(); }); });
  Array.prototype.forEach.call(document.querySelectorAll('#tcTrab button'), function (b) { b.addEventListener('click', function () { trab = b.dataset.t; pintar(); }); });
  pintar();
})();
