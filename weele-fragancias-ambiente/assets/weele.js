/* Weele (23-nov-2026): espacio + metros -> difusor por cobertura de su ficha y fragancias que Weele recomienda para ese negocio. */
(function () {
  'use strict';
  var D = window.WE_DATOS, chips = document.getElementById('weChips'); if (!D || !chips) return;
  var ESP = [['Hotel', /hotel/i], ['Clínica', /cl[ií]nica/i], ['Clínica dental', /dental/i], ['Spa y masajes', /spa|masaje|sauna/i], ['Tienda', /tienda/i],
    ['Oficina', /oficina/i], ['Gimnasio', /gimnasio/i], ['Farmacia', /farmacia/i], ['Residencia', /residencia/i], ['Hostelería', /hosteler|helader/i],
    ['Pastelería', /pasteler/i], ['Ocio infantil', /infantil|cine|casino|juego/i], ['Bodas', /boda/i], ['Mi casa', /hogar|casa/i]];
  var sel = 0, m2 = document.getElementById('weM2');
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  chips.innerHTML = ESP.map(function (e, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-i="' + i + '">' + e[0] + '</button>'; }).join('');
  chips.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; sel = +b.dataset.i;
    chips.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); calc(); });
  function difusor(m2v) {
    var L = Object.keys(D.difusores).map(function (k) { return D.difusores[k]; }).filter(function (d) { return d.cub; }).sort(function (a, b) { return a.cub - b.cub || a.precio - b.precio; });
    return L.filter(function (d) { return d.cub >= m2v; })[0] || L[L.length - 1];
  }
  function calc() {
    var v = +m2.value, m3 = Math.round(v * 2.7), e = ESP[sel];
    document.getElementById('weM2o').textContent = v + ' m²';
    var d = difusor(v);
    document.getElementById('weDif').innerHTML = '<img src="' + d.img + '" alt="" width="96" height="96"><div><small>Tu difusor · ' + m3 + ' m³</small><b>' + d.nombre + '</b><span>' + d.txt + '</span>' +
      '<a href="producto/' + d.slug + '.html">Ver difusor · ' + eur(d.precio) + '</a></div>';
    var ok = D.aromas.filter(function (a) { return e[1].test(a.rec); });
    document.getElementById('weTit').textContent = ok.length ? 'Las que recomendamos para ' + e[0].toLowerCase() : 'Fragancias';
    document.getElementById('weLista').innerHTML = (ok.length ? ok : D.aromas).slice(0, 4).map(function (a) {
      return '<a class="we-a" href="producto/' + a.slug + '.html"><img src="' + a.img + '" alt="" width="64" height="64"><div><b>' + a.nombre + '</b><small>' + a.frase + '</small></div><span>desde ' + eur(a.precio) + '</span></a>';
    }).join('');
    document.getElementById('weWa').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent('Hola, tengo un espacio de ' + v + ' m² (' + e[0].toLowerCase() + ') y quería consejo sobre el ' + d.nombre + ' y las fragancias.');
  }
  m2.addEventListener('input', calc); calc();
})();
