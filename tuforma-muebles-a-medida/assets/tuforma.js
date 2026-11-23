/* Tu Forma (23-nov-2026): plano al momento con las medidas del cliente y envío por WhatsApp a la tienda elegida. */
(function () {
  'use strict';
  var svg = document.getElementById('tfSvg'); if (!svg) return;
  var TIPOS = [
    { n: 'Armario', a: 200, h: 240, f: 60, mod: 50, puertas: true },
    { n: 'Vestidor', a: 260, h: 240, f: 55, mod: 65, abierto: true },
    { n: 'Aparador', a: 160, h: 85, f: 45, mod: 50, puertas: true, patas: true },
    { n: 'Mueble de salón', a: 220, h: 55, f: 45, mod: 55, cajones: true, patas: true },
    { n: 'Estantería', a: 120, h: 200, f: 35, mod: 60, abierto: true },
    { n: 'Escritorio', a: 140, h: 75, f: 60, mesa: true }];
  var ACAB = [['Roble natural', '#C9A27A'], ['Nogal', '#7A5338'], ['Blanco', '#F3F1EC'], ['Grafito', '#3D4247']];
  var t = 0, c = 0, $ = function (i) { return document.getElementById(i); };
  $('tfTipos').innerHTML = TIPOS.map(function (x, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-i="' + i + '">' + x.n + '</button>'; }).join('');
  $('tfAcab').innerHTML = ACAB.map(function (x, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-i="' + i + '"><i style="background:' + x[1] + '"></i>' + x[0] + '</button>'; }).join('');
  function grupo(id, cb) { $(id).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return;
    $(id).querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); cb(+b.dataset.i); }); }
  grupo('tfTipos', function (i) { t = i; var x = TIPOS[i]; $('tfA').value = x.a; $('tfH').value = x.h; $('tfF').value = x.f; dib(); });
  grupo('tfAcab', function (i) { c = i; dib(); });
  function r(x, y, w, h, extra) { return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" ' + (extra || '') + '/>'; }
  function cota(x1, y1, x2, y2, txt, vert) {
    var s = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="tf-c"/>';
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return s + (vert ? '<text x="' + (mx - 8) + '" y="' + my + '" class="tf-t" transform="rotate(-90 ' + (mx - 8) + ' ' + my + ')">' + txt + '</text>'
      : '<text x="' + mx + '" y="' + (my - 8) + '" class="tf-t">' + txt + '</text>');
  }
  function dib() {
    var x = TIPOS[t], A = +$('tfA').value, H = +$('tfH').value, F = +$('tfF').value, col = ACAB[c][1];
    $('tfAo').textContent = A + ' cm'; $('tfHo').textContent = H + ' cm'; $('tfFo').textContent = F + ' cm';
    var k = Math.min(400 / A, 330 / H), w = A * k, h = H * k, x0 = 70 + (400 - w) / 2, y0 = 30 + (330 - h);
    var o = '<defs><pattern id="tfVeta" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width="14" height="14" fill="' + col + '"/><line x1="0" y1="7" x2="14" y2="7" stroke="rgba(0,0,0,.06)"/></pattern></defs>';
    o += '<line x1="40" y1="' + (y0 + h) + '" x2="500" y2="' + (y0 + h) + '" class="tf-suelo"/>';
    var claro = c === 2, borde = claro ? '#9A938A' : 'rgba(0,0,0,.45)';
    if (x.mesa) {
      var g = Math.max(4, 3 * k);
      o += r(x0, y0, w, g * 1.4, 'fill="url(#tfVeta)" stroke="' + borde + '"') + r(x0 + 4, y0 + g * 1.4, g, h - g * 1.4, 'fill="' + col + '" stroke="' + borde + '"') + r(x0 + w - 4 - g, y0 + g * 1.4, g, h - g * 1.4, 'fill="' + col + '" stroke="' + borde + '"');
      if (A >= 100) o += r(x0 + w - 4 - g - w * .3, y0 + g * 1.4, w * .3, h * .3, 'fill="url(#tfVeta)" stroke="' + borde + '"');
    } else {
      var pat = x.patas ? Math.min(12 * k, h * .15) : 0, hc = h - pat, n = Math.max(1, Math.round(A / x.mod)), mw = w / n;
      o += r(x0, y0, w, hc, 'fill="url(#tfVeta)" stroke="' + borde + '" stroke-width="1.5"');
      for (var i = 0; i < n; i++) {
        var mx = x0 + i * mw;
        if (i) o += '<line x1="' + mx + '" y1="' + y0 + '" x2="' + mx + '" y2="' + (y0 + hc) + '" stroke="' + borde + '"/>';
        if (x.abierto) { var bal = Math.max(2, Math.round(H / 38)); for (var j = 1; j < bal; j++) o += '<line x1="' + (mx + 3) + '" y1="' + (y0 + hc * j / bal) + '" x2="' + (mx + mw - 3) + '" y2="' + (y0 + hc * j / bal) + '" stroke="' + borde + '" stroke-width="2"/>';
          if (t === 1 && i % 2 === 0) o += '<line x1="' + (mx + 6) + '" y1="' + (y0 + hc * .12) + '" x2="' + (mx + mw - 6) + '" y2="' + (y0 + hc * .12) + '" stroke="#555" stroke-width="2.5"/>'; }
        else if (x.cajones) { o += '<line x1="' + mx + '" y1="' + (y0 + hc / 2) + '" x2="' + (mx + mw) + '" y2="' + (y0 + hc / 2) + '" stroke="' + borde + '"/>' + r(mx + mw / 2 - 10, y0 + hc / 4 - 1.5, 20, 3, 'fill="#2a2a2a"') + r(mx + mw / 2 - 10, y0 + hc * .75 - 1.5, 20, 3, 'fill="#2a2a2a"'); }
        else { var hx = i % 2 ? mx + 7 : mx + mw - 9; o += r(hx, y0 + hc * .42, 2.5, Math.min(60, hc * .16), 'fill="#B08A5A"'); }
      }
      if (pat) { o += r(x0 + 6, y0 + hc, 4, pat, 'fill="#2a2a2a"') + r(x0 + w - 10, y0 + hc, 4, pat, 'fill="#2a2a2a"'); }
    }
    o += cota(x0, y0 + h + 22, x0 + w, y0 + h + 22, A + ' cm') + cota(x0 - 18, y0, x0 - 18, y0 + h, H + ' cm', true);
    o += '<text x="' + (x0 + w) + '" y="' + (y0 - 8) + '" class="tf-t tf-tf" text-anchor="end">fondo ' + F + ' cm</text>';
    svg.innerHTML = o;
    var res = x.n + ' de ' + A + ' × ' + H + ' cm y ' + F + ' cm de fondo, en ' + ACAB[c][0].toLowerCase() + '.';
    $('tfRes').textContent = res;
    var tel = (document.querySelector('input[name="tfT"]:checked') || {}).value || '34697161246';
    $('tfWa').href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent('Hola, quiero presupuesto para un mueble a medida: ' + res);
  }
  ['tfA', 'tfH', 'tfF'].forEach(function (i) { $(i).addEventListener('input', dib); });
  document.querySelectorAll('input[name="tfT"]').forEach(function (e) { e.addEventListener('change', dib); });
  dib();
})();
