/* Tejidos Lavitex (23-nov-2026): pedido por metros de sus tejidos con foto, para particular o profesional, por WhatsApp. */
(function () {
  'use strict';
  var D = window.LV_DATOS, cont = document.getElementById('lvTej'); if (!D || !cont) return;
  var sel = {};
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  cont.innerHTML = D.tejidos.map(function (t, i) {
    return '<button type="button" class="lv-t" aria-pressed="false" data-i="' + i + '"><img src="' + t.img + '" alt="" width="160" height="160" loading="lazy"><b>' + t.nombre + '</b><small>' + (t.ancho ? 'Ancho ' + t.ancho + ' cm' : '') + '</small></button>';
  }).join('');
  cont.addEventListener('click', function (e) { var b = e.target.closest('.lv-t'); if (!b) return; var i = +b.dataset.i;
    if (sel[i]) delete sel[i]; else sel[i] = 2; b.setAttribute('aria-pressed', !!sel[i]); pinta(); });
  document.getElementById('lvLista').addEventListener('input', function (e) { var i = e.target.dataset.i; if (i == null) return;
    sel[i] = Math.max(0.5, parseFloat(String(e.target.value).replace(',', '.')) || 0.5); enlace(); });
  document.querySelectorAll('input[name="lvQ"]').forEach(function (r) { r.addEventListener('change', enlace); });
  function pinta() {
    var ks = Object.keys(sel), l = document.getElementById('lvLista');
    l.innerHTML = ks.length ? ks.map(function (i) { var t = D.tejidos[i];
      return '<div class="lv-f"><img src="' + t.img + '" alt="" width="44" height="44"><span>' + t.nombre + (t.precio ? '<small>' + eur(t.precio) + ' en la web</small>' : '') + '</span><label>m<input type="number" min="0.5" step="0.5" value="' + sel[i] + '" data-i="' + i + '" inputmode="decimal"></label></div>'; }).join('')
      : '<p class="lv-vacio">Marca un tejido para empezar.</p>';
    enlace();
  }
  function enlace() {
    var ks = Object.keys(sel), a = document.getElementById('lvWa'), q = (document.querySelector('input[name="lvQ"]:checked') || {}).value;
    a.setAttribute('aria-disabled', ks.length ? 'false' : 'true');
    var txt = 'Hola, quería hacer este pedido' + (q === 'profesional' ? ' (soy profesional, ¿me dais precio de mayorista?)' : '') + ':\n' +
      ks.map(function (i) { return '- ' + D.tejidos[i].nombre + ': ' + String(sel[i]).replace('.', ',') + ' m'; }).join('\n');
    a.href = ks.length ? 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(txt) : '#pedido';
  }
})();
