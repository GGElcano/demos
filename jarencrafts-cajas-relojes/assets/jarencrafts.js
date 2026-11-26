/* JarénCrafts (26-nov-2026): «¿Cuántos relojes tienes?». Sus cajas son un producto por cada tamaño y color;
   aquí se agrupan por modelo: eliges cuántos relojes guardas y sale, de cada modelo, el tamaño más pequeño donde
   caben, con sus colores para elegir (cambia la foto, el precio y el enlace a esa caja). Datos: window.JC_CAJAS. */
(function () {
  var sec = document.getElementById('tu-caja');
  if (!sec || !window.JC_CAJAS) return;
  var C = window.JC_CAJAS, COL = window.JC_COLORES || {};
  var eur = function (v) { return v.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var tamanos = [];
  C.forEach(function (x) { if (!x.w && tamanos.indexOf(x.n) < 0) tamanos.push(x.n); });
  tamanos.sort(function (a, b) { return a - b; });
  var chips = sec.querySelector('[data-jc-chips]'), auto = sec.querySelector('[data-jc-auto]');
  var res = sec.querySelector('[data-jc-res]'), nTxt = sec.querySelector('[data-jc-n]');
  var elegido = 6;
  chips.innerHTML = tamanos.map(function (n) { return '<button type="button" data-n="' + n + '" aria-pressed="' + (n === elegido) + '">' + n + '</button>'; }).join('');

  function pinta() {
    var modelos = {};
    C.forEach(function (x) {
      if (x.w && !auto.checked) return;
      if (x.n < elegido) return;
      var m = modelos[x.m] = modelos[x.m] || { m: x.m, items: [] };
      m.items.push(x);
    });
    var lista = Object.keys(modelos).map(function (k) {
      var m = modelos[k];
      var minN = Math.min.apply(null, m.items.map(function (x) { return x.n; }));
      m.items = m.items.filter(function (x) { return x.n === minN; });
      m.desde = Math.min.apply(null, m.items.map(function (x) { return x.p; }));
      return m;
    }).sort(function (a, b) { return a.desde - b.desde; });
    nTxt.textContent = lista.length ? (lista.length === 1 ? 'Te cabe en 1 modelo' : 'Te caben en ' + lista.length + ' modelos') + ':' : 'Para tantos relojes, escríbenos y te lo hacemos a medida.';
    res.innerHTML = lista.map(function (m, i) {
      var x = m.items[0];
      var bolas = m.items.map(function (y, j) {
        return '<button type="button" class="jc-bola" style="--c:' + (COL[y.c] || '#999') + '" data-k="' + i + '-' + j + '" aria-pressed="' + (j === 0) + '" aria-label="' + esc(y.c) + '" title="' + esc(y.c) + '"></button>';
      }).join('');
      return '<article class="jc-caja" data-i="' + i + '"><a class="jc-foto" href="' + esc(x.s) + '"><img src="' + esc(x.i) + '" alt="' + esc(x.t) + '" loading="lazy" width="600" height="600"></a>' +
        '<div class="jc-txt"><h3>' + esc(m.m) + '</h3><p class="jc-cap">' + (x.w ? esc(x.cap) : 'Para ' + x.n + ' relojes') + ' · <span data-col>' + esc(x.c) + '</span></p>' +
        '<p class="jc-precio" data-pr>' + eur(x.p) + '</p>' + (m.items.length > 1 ? '<div class="jc-bolas" role="group" aria-label="Color">' + bolas + '</div>' : '') +
        '<a class="btn-carrito" href="' + esc(x.s) + '" data-ver>Ver esta caja</a></div></article>';
    }).join('');
    Array.prototype.forEach.call(res.querySelectorAll('.jc-bola'), function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.k.split('-'), m = lista[+k[0]], y = m.items[+k[1]], card = b.closest('.jc-caja');
        Array.prototype.forEach.call(card.querySelectorAll('.jc-bola'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        var img = card.querySelector('img'); img.src = y.i; img.alt = y.t;
        card.querySelector('[data-col]').textContent = y.c;
        card.querySelector('[data-pr]').textContent = eur(y.p);
        card.querySelector('.jc-foto').href = y.s; card.querySelector('[data-ver]').href = y.s;
      });
    });
  }
  Array.prototype.forEach.call(chips.querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () {
      elegido = +b.dataset.n;
      Array.prototype.forEach.call(chips.querySelectorAll('button'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      pinta();
    });
  });
  auto.addEventListener('change', pinta);
  pinta();
})();
