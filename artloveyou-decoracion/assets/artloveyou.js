/* ArtLoveYou (26-nov-2026): «¿Cuánto papel necesita tu pared?». Las cuentas son las de su web:
   papel en rollos de 64 cm útiles (ancho / 64 redondeando hacia arriba, mínimo 2) y alto de 260, 280 o 310 cm
   dejando unos centímetros de margen; murales de medida cerrada (132, 193, 257, 321 o 385 cm de ancho por 260 de alto).
   En la portada dibuja la pared; en la ficha elige la opción y la cantidad y lo mete en el carrito. */
(function () {
  var PAPEL = [{ alto: 260, n: '260 cm de alto' }, { alto: 280, n: '280 cm de alto' }, { alto: 310, n: '310 cm de alto' }];
  var MURAL = [132, 193, 257, 321, 385].map(function (a) { return { ancho: a, n: a + ' × 260 cm' }; });
  var MARGEN = 5;
  var PRECIO_BASE = { papel: { 260: 52.5, 280: 58, 310: 63 }, mural: { 132: 105, 193: 158, 257: 205, 321: 265, 385: 315 } };
  var eur = function (v) { return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; };
  var num = function (el) { var v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };

  function calcular(modo, ancho, alto, precios) {
    precios = precios && Object.keys(precios).length ? precios : PRECIO_BASE[modo];
    var hay = function (k) { return precios[k] != null; };
    if (!ancho || !alto) return { ok: false, txt: 'Pon el ancho y el alto de tu pared.' };
    if (modo === 'papel') {
      var uds = Math.max(2, Math.ceil(ancho / 64));
      var op = PAPEL.filter(function (o) { return hay(o.alto) && o.alto >= alto + MARGEN; })[0];
      if (!op) return { ok: false, medida: true, uds: uds, txt: 'Tu pared mide más de 3 metros de alto: te lo hacemos a medida, escríbenos con las medidas.' };
      var pu = precios[op.alto];
      return { ok: true, uds: uds, op: op, cubre: uds * 64, total: pu ? uds * pu : null, pu: pu,
               tit: uds + ' rollos de ' + op.alto + ' cm' + (pu ? ' · ' + eur(uds * pu) : ''),
               txt: 'Cubren ' + (uds * 64) + ' cm de ancho' + (uds * 64 - Math.round(ancho) > 0 ? ' y te sobran ' + (uds * 64 - Math.round(ancho)) + ' cm para recortar. ' : ', justo tu pared. ') +(uds === 2 && ancho <= 128 ? 'Es el mínimo: 2 rollos. ' : '') + 'Envío gratis a la península.' };
    }
    if (alto > 260 - MARGEN) return { ok: false, medida: true, txt: 'Los murales miden 260 cm de alto. Para una pared más alta lo hacemos a medida: escríbenos con las medidas.' };
    var m = MURAL.filter(function (o) { return hay(o.ancho) && o.ancho >= ancho; })[0];
    if (!m) return { ok: false, medida: true, txt: 'Tu pared pasa de 385 cm: el mural se hace a medida. Escríbenos con las medidas y te decimos el precio.' };
    var pm = precios[m.ancho];
    return { ok: true, uds: 1, op: m, cubre: m.ancho, total: pm || null, pu: pm,
             tit: 'Mural de ' + m.n + (pm ? ' · ' + eur(pm) : ''),
             txt: 'Es la medida que cubre tu pared' + (m.ancho - Math.round(ancho) > 0 ? '; recortas ' + (m.ancho - Math.round(ancho)) + ' cm por los lados. ' : '. ') + 'Llega en piezas de 65 cm numeradas para colocarlo fácil. Envío gratis a la península.' };
  }

  /* Dibujo de la pared a escala, con las tiras o el mural encima */
  function dibujar(caja, modo, ancho, alto, r) {
    if (!caja) return;
    var W = 320, H = 200, pad = 14;
    var anchoTotal = Math.max(ancho, r && r.ok ? r.cubre : ancho), altoTotal = Math.max(alto, r && r.ok && r.op.alto ? r.op.alto : (modo === 'mural' ? 260 : alto));
    var k = Math.min((W - 2 * pad) / anchoTotal, (H - 2 * pad) / altoTotal);
    var x0 = (W - anchoTotal * k) / 2, y0 = H - pad - alto * k;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Tu pared a escala">';
    if (r && r.ok) {
      var hpieza = (r.op.alto || 260) * k, ytop = H - pad - hpieza;
      if (modo === 'papel') {
        for (var i = 0; i < r.uds; i++) s += '<rect x="' + (x0 + i * 64 * k).toFixed(1) + '" y="' + ytop.toFixed(1) + '" width="' + (64 * k - 1.5).toFixed(1) + '" height="' + hpieza.toFixed(1) + '" class="al-tira"/>';
      } else {
        var piezas = r.op.ancho === 132 ? 1 : Math.round(r.op.ancho / 65);
        var ap = r.op.ancho / piezas;
        for (var j = 0; j < piezas; j++) s += '<rect x="' + (x0 + j * ap * k).toFixed(1) + '" y="' + ytop.toFixed(1) + '" width="' + (ap * k - 1.5).toFixed(1) + '" height="' + hpieza.toFixed(1) + '" class="al-tira"/>';
      }
    }
    s += '<rect x="' + x0.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + (ancho * k).toFixed(1) + '" height="' + (alto * k).toFixed(1) + '" class="al-pared"/>';
    s += '<text x="' + (x0 + ancho * k / 2).toFixed(1) + '" y="' + (y0 + alto * k / 2 + 5).toFixed(1) + '" class="al-cota">Tu pared ' + Math.round(ancho) + ' × ' + Math.round(alto) + ' cm</text>';
    s += '<line x1="6" y1="' + (H - pad) + '" x2="' + (W - 6) + '" y2="' + (H - pad) + '" class="al-suelo"/></svg>';
    caja.innerHTML = s;
  }

  /* Portada */
  var sec = document.getElementById('calcula');
  if (sec) {
    var modo = 'papel';
    var ia = sec.querySelector('[data-al-ancho]'), ih = sec.querySelector('[data-al-alto]');
    var pinta = function () {
      var a = num(ia), h = num(ih), r = calcular(modo, a, h);
      sec.querySelector('[data-al-tit]').textContent = r.ok ? r.tit : (r.medida ? 'A medida' : '');
      sec.querySelector('[data-al-txt]').textContent = r.txt;
      var ir = sec.querySelector('[data-al-ir]');
      ir.textContent = modo === 'papel' ? 'Elegir papel pintado' : 'Elegir mural';
      ir.href = 'tienda.html#' + (modo === 'papel' ? 'papeles' : 'murales');
      if (a && h) dibujar(sec.querySelector('[data-al-dibujo]'), modo, a, h, r);
    };
    Array.prototype.forEach.call(sec.querySelectorAll('[data-al-modo]'), function (b) {
      b.addEventListener('click', function () {
        modo = b.dataset.alModo;
        Array.prototype.forEach.call(sec.querySelectorAll('[data-al-modo]'), function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        pinta();
      });
    });
    ia.addEventListener('input', pinta); ih.addEventListener('input', pinta);
    pinta();
  }

  /* Ficha de un papel o un mural */
  var fc = document.querySelector('[data-al-ficha]');
  if (fc) {
    var fmodo = fc.dataset.alFicha;
    var precios = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-variantes] .gg-variante'), function (b) {
      var m = b.dataset.nombre.match(/^(\d+)/); if (m && b.dataset.precio) precios[m[1]] = parseFloat(b.dataset.precio.replace(/\./g, '').replace(',', '.'));
    });
    var fa = fc.querySelector('[data-al-ancho]'), fh = fc.querySelector('[data-al-alto]');
    var bot = fc.querySelector('[data-al-poner]'), res = fc.querySelector('[data-al-res]');
    var ult = null;
    var fpinta = function () {
      ult = calcular(fmodo, num(fa), num(fh), precios);
      res.innerHTML = ult.ok ? '<b>' + ult.tit + '</b><br>' + ult.txt : ult.txt;
      bot.hidden = !ult.ok;
      bot.textContent = ult.ok ? (fmodo === 'papel' ? 'Añadir ' + ult.uds + ' rollos de ' + ult.op.alto + ' cm al carrito' : 'Añadir el mural de ' + ult.op.n + ' al carrito') : '';
    };
    fa.addEventListener('input', fpinta); fh.addEventListener('input', fpinta);
    bot.addEventListener('click', function () {
      if (!ult || !ult.ok) return;
      var b = document.querySelector('[data-variantes] .gg-variante[data-nombre="' + ult.op.n + '"]');
      if (b) b.click();
      var cant = document.querySelector('[data-cant]'); if (cant) cant.value = ult.uds;
      var anadir = document.querySelector('[data-anadir]'); if (anadir) anadir.click();
    });
    fpinta();
  }
})();
