/* Ystán Miel (23-nov-2026): las 4 variedades de suave a intensa con los datos de sus fichas y los formatos con €/kg. */
(function () {
  'use strict';
  var V = window.YM_DATOS, esc = document.getElementById('ymEscala'); if (!V || !esc) return;
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  esc.innerHTML = V.map(function (v, i) { return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-i="' + i + '"><i style="background:' + v.tono + '"></i><span>' + v.n + '</span></button>'; }).join('');
  esc.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return;
    esc.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); pinta(+b.dataset.i); });
  function pinta(i) {
    var v = V[i], kilo = v.formatos.filter(function (f) { return f.g === 1000 && !f.sens; })[0], medio = v.formatos.filter(function (f) { return f.g === 500 && !f.sens; })[0];
    var ahorro = kilo && medio ? 2 * medio.precio - kilo.precio : 0;
    document.getElementById('ymFicha').innerHTML =
      '<div class="ym-foto"><img src="' + v.img + '" alt="Miel de ' + v.n.toLowerCase() + ' Ystán" width="1100" height="813"></div>' +
      '<div class="ym-datos"><h3>Miel de ' + v.n.toLowerCase() + '</h3><p class="ym-sabor">' + v.sabor + '.</p>' +
      '<dl><div><dt>Color</dt><dd><i style="background:' + v.tono + '"></i>' + v.color + '</dd></div><div><dt>Aroma</dt><dd>' + v.aroma + '</dd></div>' +
      '<div><dt>Textura</dt><dd>' + v.textura + '</dd></div><div><dt>Origen</dt><dd>' + v.origen + '</dd></div></dl>' +
      '<p class="ym-esencia">Esencia Sensorial: «' + v.esencia + '»</p>' +
      '<div class="ym-fmts">' + v.formatos.map(function (f) {
        return '<a href="producto/' + f.slug + '.html"' + (f.sens ? ' class="sens"' : '') + '><b>' + f.f + '</b><span>' + eur(f.precio) + '</span><small>' + eur(f.precio * 1000 / f.g) + '/kg</small></a>';
      }).join('') + '</div>' + (ahorro > 0 ? '<p class="ym-ahorro">Con el bote de 1 kg te ahorras ' + eur(ahorro) + ' frente a dos de 500 g.</p>' : '') + '</div>';
  }
  pinta(0);
})();
