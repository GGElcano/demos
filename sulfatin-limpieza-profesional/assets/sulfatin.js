/* Sulfatín (20-nov-2026): pack de 4 garrafas a elegir y calculadora de mezcla con las diluciones de sus fichas. */
(function () {
  'use strict';
  var D = window.SF_DATOS; if (!D) return;
  var CLAVE = 'cesta-sulfatin';
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  function fmt(v) { var r = Math.round(v * 10) / 10; return String(r).replace('.', ','); }
  /* ── Pack ── */
  var huecos = document.getElementById('sfHuecos'), ops = document.getElementById('sfOpciones');
  if (huecos && ops) {
    var pack = [];
    D.pack.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sf-op';
      b.innerHTML = '<img src="' + o.img + '" alt="" width="64" height="64" loading="lazy"><span>' + o.nombre + '<small>Garrafa de 5 L · 39 € suelta</small></span><b></b>';
      b.addEventListener('click', function () { if (pack.length < 4) { pack.push(i); pintar(true); } else avisar('El pack ya tiene 4 garrafas: quita una para cambiarla.'); });
      ops.appendChild(b);
    });
    var anadir = document.getElementById('sfPackAnadir'), aviso = document.getElementById('sfPackAviso');
    function avisar(t) { aviso.innerHTML = t; }
    function pintar(nueva) {
      huecos.innerHTML = '';
      for (var k = 0; k < 4; k++) {
        var h = document.createElement('div'); h.className = 'sf-hueco';
        if (pack[k] !== undefined) {
          var o = D.pack[pack[k]]; h.className += ' lleno';
          if (!(nueva && k === pack.length - 1)) h.style.animation = 'none';
          h.innerHTML = '<img src="' + o.img + '" alt="' + o.nombre + '"><small>' + o.nombre + '</small><button type="button" aria-label="Quitar ' + o.nombre + '">✕</button>';
          (function (kk) { h.querySelector('button').addEventListener('click', function () { pack.splice(kk, 1); pintar(false); }); })(k);
        } else h.textContent = 'Garrafa ' + (k + 1);
        huecos.appendChild(h);
      }
      Array.prototype.forEach.call(ops.children, function (b, i) { var n = pack.filter(function (x) { return x === i; }).length; b.querySelector('b').textContent = n ? '×' + n : ''; });
      document.getElementById('sfSueltas').textContent = eur(39 * pack.length);
      var falta = 4 - pack.length;
      anadir.disabled = !!falta;
      anadir.textContent = falta ? (falta === 4 ? 'Elige 4 garrafas' : 'Faltan ' + falta) : 'Añadir el pack al carrito · 134,95 €';
      avisar('');
    }
    anadir.addEventListener('click', function () {
      if (pack.length !== 4) return;
      var cuenta = {}; pack.forEach(function (i) { var n = D.pack[i].nombre; cuenta[n] = (cuenta[n] || 0) + 1; });
      var nombres = Object.keys(cuenta).map(function (n) { return cuenta[n] > 1 ? n + ' ×' + cuenta[n] : n; });
      var c; try { c = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { c = []; }
      c.push({ id: 'pack::' + nombres.join('::') + '::' + Date.now(), nombre: 'Pack 4x5L (' + nombres.join(', ') + ')', img: D.imgPack, precio: D.precioPack, cant: 1 });
      try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ }
      var n = c.reduce(function (a, x) { return a + x.cant; }, 0);
      Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-n]'), function (el) { el.textContent = n; el.removeAttribute('hidden'); });
      avisar('Pack añadido. <a href="cesta.html">Ver el carrito</a>');
      pack = []; pintar(false); avisar('Pack añadido. <a href="cesta.html">Ver el carrito</a>');
    });
    pintar(false);
  }
  /* ── Calculadora ── */
  var cp = document.getElementById('sfProd');
  if (cp) {
    var sel = 0, nivel = 'media', agua = document.getElementById('sfAgua');
    D.calc.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o.nombre;
      b.addEventListener('click', function () { sel = i; calc(); }); cp.appendChild(b);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#sfNivel button'), function (b) { b.addEventListener('click', function () { nivel = b.dataset.n; calc(); }); });
    agua.addEventListener('input', calc);
    function calc() {
      var o = D.calc[sel], unica = !!o.dil.unica, d = o.dil[unica ? 'unica' : nivel];
      Array.prototype.forEach.call(cp.children, function (b, i) { b.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); });
      Array.prototype.forEach.call(document.querySelectorAll('#sfNivel button'), function (b) { b.setAttribute('aria-pressed', b.dataset.n === nivel ? 'true' : 'false'); });
      document.getElementById('sfNivelPaso').style.display = unica ? 'none' : '';
      var w = +agua.value; document.getElementById('sfAguaTxt').textContent = w + ' L';
      var max = w * d[0] / d[1], min = w * d[0] / d[2];
      document.getElementById('sfLitros').textContent = (Math.abs(max - min) < 0.05 ? fmt(max) : fmt(min) + ' a ' + fmt(max)) + ' L';
      document.getElementById('sfDetalle').textContent = 'de ' + o.nombre.toLowerCase() + ' en ' + w + ' L de agua. Ficha: ' + d[0] + ' L de producto por cada ' + (d[1] === d[2] ? d[1] : d[1] + '-' + d[2]) + ' L de agua.';
      var veces = Math.floor(5 / max);
      document.getElementById('sfGarrafa').textContent = veces >= 1 ? 'Con una garrafa de 5 L te da para ' + veces + (veces === 1 ? ' mezcla' : ' mezclas') + ' como esta.' : 'Para esta mezcla necesitas ' + Math.ceil(max / 5) + ' garrafas de 5 L: mira el pack de 4.';
      var img = document.getElementById('sfProdImg'); img.src = o.img; img.alt = o.nombre;
    }
    calc();
  }
})();
