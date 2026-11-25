/* Senda Vieja (25-nov-2026): «Elige tu formato» (precio por litro de cada pack) y «¿Cuántos invitados?» (packs de celebración), con SUS precios. */
(function () {
  'use strict';
  var D = window.SV_DATOS, c = document.getElementById('svFormatos'); if (!D || !c) return;
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  var min = Infinity;
  D.formatos.forEach(function (f) { f.ops.forEach(function (o) { o.l = o.precio / (o.n * f.litros); if (o.l < min) min = o.l; }); });
  c.innerHTML = D.formatos.map(function (f, i) {
    var top = f.ops.some(function (o) { return o.l === min; });
    return '<article class="sv-f' + (top ? ' top' : '') + '" data-i="' + i + '"><a href="producto/' + f.slug + '.html"><img src="' + f.img + '" alt="' + f.et + ' de aceite Senda Vieja" width="900" height="900" loading="lazy"></a>' +
      '<div class="sv-f-c">' + (top ? '<span class="sv-f-m">El litro más barato</span>' : '') + '<p class="sv-f-t">' + f.et + '</p>' +
      '<div class="sv-ops">' + f.ops.map(function (o, j) { return '<button type="button" data-j="' + j + '"' + (j === 0 ? ' class="on"' : '') + ' aria-pressed="' + (j === 0) + '">Pack de ' + o.n + '</button>'; }).join('') + '</div>' +
      '<p class="sv-f-p"><b></b><span></span></p><p class="sv-f-d"></p><a class="sv-f-b" href="producto/' + f.slug + '.html">Ver el pack</a></div></article>';
  }).join('');
  function pinta(art, j) {
    var f = D.formatos[+art.dataset.i], o = f.ops[j], lit = o.n * f.litros;
    art.querySelector('.sv-f-p b').textContent = eur(o.precio);
    art.querySelector('.sv-f-p span').textContent = eur(o.l) + ' el litro';
    art.querySelector('.sv-f-d').textContent = o.n + ' × ' + f.envase + ' = ' + String(lit).replace('.', ',') + ' litros · ' + eur(o.precio / o.n) + ' cada una';
    [].forEach.call(art.querySelectorAll('.sv-ops button'), function (b) { var on = +b.dataset.j === j; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  [].forEach.call(c.children, function (art) { pinta(art, 0); });
  c.addEventListener('click', function (e) { var b = e.target.closest('.sv-ops button'); if (b) pinta(b.closest('.sv-f'), +b.dataset.j); });

  var C = D.celebra, inp = document.getElementById('svInv'), res = document.getElementById('svCelRes');
  if (!C || !C.packs || !inp) return;
  document.getElementById('svCelImg').src = C.img;
  var maxPack = C.packs[C.packs.length - 1];
  function cel() {
    var n = Math.max(1, Math.min(999, parseInt(inp.value, 10) || 1));
    if (n > maxPack.n) {
      res.innerHTML = '<p class="sv-cel-pk">Más de ' + maxPack.n + ' botellas</p><p>Para más cantidad, consúltanos y te lo preparamos a medida.</p>' +
        '<a href="mailto:info@sendavieja.com?subject=' + encodeURIComponent('Botellas de 100 ml para ' + n + ' invitados') + '">Escribir a info@sendavieja.com</a>';
      return;
    }
    var p = C.packs.filter(function (x) { return x.n >= n; })[0], sobra = p.n - n;
    res.innerHTML = '<p class="sv-cel-pk">Pack de ' + p.n + ' botellas de 100 ml</p><p class="sv-cel-pr">' + eur(p.precio) + '<small>' + eur(p.precio / p.n) + ' cada botella</small></p>' +
      '<p>' + (sobra ? 'Os sobran ' + sobra + ' por si se apunta alguien más.' : 'Justo una para cada invitado.') + '</p><a href="producto/' + C.slug + '.html">Ver el pack de celebración</a>';
  }
  inp.addEventListener('input', cel);
  document.getElementById('svMenos').addEventListener('click', function () { inp.value = Math.max(1, (parseInt(inp.value, 10) || 0) - 10); cel(); });
  document.getElementById('svMas').addEventListener('click', function () { inp.value = Math.min(999, (parseInt(inp.value, 10) || 0) + 10); cel(); });
  cel();
})();
