/* IdeaHome (22-nov-2026): «¿Cabe en tu salón?» con las medidas de cada modelo (deja 10 cm de holgura). */
(function () {
  'use strict';
  var D = window.IH_DATOS, lista = document.getElementById('ihLista'); if (!D || !lista) return;
  var r = document.getElementById('ihPared');
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function pintar() {
    var pared = +r.value, hueco = pared - 10;
    document.getElementById('ihCm').textContent = pared + ' cm'; document.getElementById('ihParedTxt').textContent = pared + ' cm';
    var caben = [];
    D.sofas.forEach(function (s) {
      var ok = s.med.filter(function (m) { return m.cm <= hueco; }).sort(function (a, b) { return b.cm - a.cm; });
      if (ok.length) caben.push({ s: s, m: ok[0] });
    });
    caben.sort(function (a, b) { return b.m.cm - a.m.cm; });
    var sofa = document.getElementById('ihSofa'), mayor = caben.length ? caben[0].m.cm : 0, ancho = document.querySelector('.ih-plano').clientWidth;
    sofa.style.width = (mayor ? mayor / pared * 100 : 30) + '%'; sofa.style.left = (mayor ? (pared - mayor) / 2 / pared * 100 : 35) + '%';
    sofa.dataset.cm = mayor ? 'Hasta ' + mayor + ' cm' : 'No cabe ninguno'; sofa.classList.toggle('no', !mayor);
    document.getElementById('ihCuenta').innerHTML = caben.length ? 'Te caben <b>' + caben.length + ' modelos</b> (dejando 10 cm de holgura).' : 'Con esa pared no cabe ninguno de estos: prueba un sillón o escríbenos.';
    lista.innerHTML = caben.slice(0, 12).map(function (c) {
      return '<a class="ih-prod" href="producto/' + c.s.slug + '.html"><img src="' + c.s.img + '" alt="" width="600" height="450" loading="lazy"><b>' + c.s.nombre + '</b><span>' + c.m.txt + '</span><small>' + (c.s.precio ? (c.s.desde ? 'desde ' : '') + eur(c.s.precio) : 'Consultar') + '</small></a>';
    }).join('') + (caben.length > 12 ? '<p class="ih-mas">Y ' + (caben.length - 12) + ' modelos más en la tienda.</p>' : '');
  }
  r.addEventListener('input', pintar); window.addEventListener('resize', pintar); pintar();
})();
