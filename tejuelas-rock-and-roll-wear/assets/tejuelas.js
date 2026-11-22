/* Tejuelas (22-nov-2026): talla con la guía de cada prenda (½ contorno de pecho, tolerancia ±2 cm de su tabla). */
(function () {
  'use strict';
  var D = window.TJ_DATOS, sel = document.getElementById('tjPrenda'); if (!D || !sel || !D.prendas.length) return;
  var cm = document.getElementById('tjCm');
  D.prendas.forEach(function (p, i) { var o = document.createElement('option'); o.value = i; o.textContent = p.nombre; sel.appendChild(o); });
  function fmt(v) { return String(v).replace('.', ','); }
  function calc() {
    var p = D.prendas[+sel.value], m = +cm.value, g = p.guia;
    document.getElementById('tjCmTxt').textContent = fmt(m) + ' cm';
    var k = -1;
    for (var i = 0; i < g.pecho.length; i++) { if (m <= g.pecho[i] + 1) { k = i; break; } }
    var talla = k < 0 ? null : g.tallas[k];
    var norm = function (t) { return t.replace('2XL', 'XXL').replace('3XL', 'XXXL'); };
    var vende = talla && p.vendidas.map(norm).indexOf(norm(talla)) > -1;
    document.getElementById('tjTalla').textContent = talla ? norm(talla) : '—';
    document.getElementById('tjTxt').textContent = !talla ? 'Te queda pequeña hasta la talla más grande: escríbenos y lo vemos.'
      : (m < g.pecho[0] - 2 ? 'Es la más pequeña de esta prenda y te quedará holgada. ' : '') + (vende ? 'Esta prenda la tenemos en tu talla.' : 'Esta talla no está ahora en esta prenda: pregúntanos por WhatsApp.');
    document.getElementById('tjTabla').innerHTML = g.tallas.map(function (t, i) {
      var v = p.vendidas.map(norm).indexOf(norm(t)) > -1;
      return '<span class="' + (i === k ? 'si' : (v ? '' : 'no')) + '"><b>' + norm(t) + '</b>' + fmt(g.pecho[i]) + '</span>';
    }).join('');
    var img = document.getElementById('tjImg'); img.src = p.img; img.alt = p.nombre;
    document.getElementById('tjVer').href = 'producto/' + p.slug + '.html';
  }
  sel.addEventListener('change', calc); cm.addEventListener('input', calc); calc();
})();
