/* Slipfree (20-nov-2026): elegidor de antideslizante en 3 preguntas, con los productos, precios y rendimientos de sus fichas. */
(function () {
  'use strict';
  var D = window.SL_DATOS; if (!D) return;
  var zonaBox = document.getElementById('slZona'); if (!zonaBox) return;
  var CLAVE = 'cesta-slipfree';
  var $ = function (id) { return document.getElementById(id); };
  var eur = function (v) { return v.toFixed(2).replace('.', ',') + ' €'; };
  var zona = null, mat = null, combo = null;
  var metros = $('slMetros');

  function elegir(grupo, btn) {
    Array.prototype.forEach.call(grupo.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }
  /* Qué producto: las reglas salen de lo que dice cada ficha de slipfree.es */
  function familia() {
    if (zona === 'banera') return 'banos';
    if (!mat) return null;
    if (mat === 'otro') return 'no';
    if (mat === 'cemento') return 's3';
    if (mat === 'terrazo') return zona === 'mojada' ? 's2' : 's3';
    if (mat === 'barro') return 's1';
    return zona === 'mojada' ? 's2' : 's1';
  }
  /* La combinación de envases más barata que cubre los litros (o las bañeras) */
  function mejor(fam, cant) {
    var envases = D.familias[fam].envases, best = null;
    var max = envases.map(function (e) { return Math.ceil(cant / e.rinde) ; });
    (function prueba(i, usado, cubre, coste) {
      if (best && coste >= best.coste) return;
      if (cubre >= cant) { best = { coste: coste, usado: usado.slice() }; return; }
      if (i >= envases.length) return;
      for (var n = 0; n <= max[i]; n++) { usado[i] = n; prueba(i + 1, usado, cubre + n * envases[i].rinde, coste + n * envases[i].precio); }
      usado[i] = 0;
    })(0, envases.map(function () { return 0; }), 0, 0);
    return best;
  }
  function pintar() {
    var fam = familia();
    $('slPasoMaterial').hidden = !zona || zona === 'banera';
    $('slPasoMetros').hidden = !fam || fam === 'no';
    $('slRapidos').hidden = fam === 'banos';
    $('slVacio').hidden = !!fam;
    $('slNo').hidden = fam !== 'no';
    $('slLleno').hidden = !fam || fam === 'no';
    if (!fam || fam === 'no') return;
    var esBanera = fam === 'banos';
    $('slMetrosPregunta').textContent = esBanera ? '¿Cuántas bañeras o platos de ducha?' : '¿Cuántos metros tiene?';
    metros.max = esBanera ? 40 : 400;
    if (+metros.value > +metros.max) metros.value = metros.max;
    var cant = +metros.value;
    $('slMetrosTxt').textContent = esBanera ? cant + (cant === 1 ? ' bañera' : ' bañeras') : cant + ' m²';
    var F = D.familias[fam];
    var r = mejor(fam, esBanera ? cant : cant / 10);
    $('slImg').src = F.img; $('slImg').alt = F.nombre;
    $('slNombre').textContent = F.nombre;
    $('slPor').textContent = F.por;
    var lineas = $('slLineas'); lineas.innerHTML = '';
    combo = [];
    F.envases.forEach(function (e, i) {
      var n = r.usado[i]; if (!n) return;
      combo.push({ e: e, n: n });
      var li = document.createElement('li');
      li.innerHTML = '<span>' + n + ' × ' + e.formato + '</span><b>' + eur(n * e.precio) + '</b>';
      lineas.appendChild(li);
    });
    $('slTotal').textContent = eur(r.coste);
    // lo que costaría en envases pequeños, para enseñar el ahorro real
    var peq = F.envases[0], nPeq = Math.ceil((esBanera ? cant : cant / 10) / peq.rinde);
    var ahorro = nPeq * peq.precio - r.coste;
    $('slAhorro').textContent = ahorro > 0.5 ? 'Te ahorras ' + eur(ahorro) + ' frente a comprarlo en ' + peq.formato.replace(/^.*?de /, 'envases de ') + '.' : '';
    $('slAviso').textContent = '';
  }
  Array.prototype.forEach.call(zonaBox.querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () {
      var antes = zona; zona = b.dataset.zona; if (zona === 'banera' && antes !== 'banera') metros.value = 1; else if (antes === 'banera' && zona !== 'banera') metros.value = 20; elegir(zonaBox, b); pintar();
      var sig = zona === 'banera' ? $('slPasoMetros') : $('slPasoMaterial');
      if (window.innerWidth < 900 && sig) sig.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  var matBox = $('slMaterial');
  Array.prototype.forEach.call(matBox.querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () {
      mat = b.dataset.mat; elegir(matBox, b); pintar();
      if (window.innerWidth < 900) $('slResultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  metros.addEventListener('input', pintar);
  var rap = $('slRapidos');
  [['Un baño', 6], ['Una cocina', 12], ['Una terraza', 25], ['Una piscina', 60], ['Un local', 120]].forEach(function (x) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0] + ' · ' + x[1] + ' m²';
    b.addEventListener('click', function () { metros.value = x[1]; pintar(); });
    rap.appendChild(b);
  });
  $('slAnadir').addEventListener('click', function () {
    if (!combo || !combo.length) return;
    var c; try { c = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { c = []; }
    combo.forEach(function (x) {
      var ya = c.filter(function (y) { return y.id === x.e.slug; })[0];
      if (ya) ya.cant += x.n; else c.push({ id: x.e.slug, nombre: x.e.nombre, img: x.e.img, precio: x.e.precio.toFixed(2).replace('.', ','), cant: x.n });
    });
    try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { $('slAviso').textContent = 'Este navegador no deja guardar el carrito.'; return; }
    var n = c.reduce(function (a, x) { return a + x.cant; }, 0);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-n]'), function (el) { el.textContent = n; el.removeAttribute('hidden'); });
    $('slAviso').innerHTML = 'Añadido al carrito. <a href="cesta.html">Ver el carrito</a>';
  });
  // atajo desde las fichas: index.html#elige-mojada
  var m = (location.hash || '').match(/^#elige-(paso|mojada|banera)$/);
  if (m) { var bz = zonaBox.querySelector('[data-zona="' + m[1] + '"]'); if (bz) bz.click(); }
  pintar();
})();
