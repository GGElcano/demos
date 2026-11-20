/* Sugacon (20-nov-2026): pedido rápido con su catálogo real (nombre, código, precio y existencias de sugacon.es). */
(function () {
  'use strict';
  var D = window.SG_DATOS; var filas = document.getElementById('sgFilas');
  if (!D || !filas) return;
  var CLAVE = 'cesta-sugacon', HAB = 'sugacon-pedido-habitual';
  var $ = function (id) { return document.getElementById(id); };
  var eur = function (v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; };
  var quitar = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var P = D.productos, porSlug = {};
  P.forEach(function (p) { porSlug[p.s] = p; p.q = quitar(p.n + ' ' + (p.k || '') + ' ' + (D.cats[p.c] || '')); });
  var ped = {};            // slug -> cantidad
  var cat = '', texto = '', limite = 40;
  var leer = function (k, d) { try { return JSON.parse(localStorage.getItem(k) || d); } catch (e) { return JSON.parse(d); } };

  /* chips de familias */
  var chips = $('sgCats');
  [['', 'Todo']].concat(D.orden.map(function (k) { return [k, D.cats[k]]; })).forEach(function (x) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[1]; b.dataset.c = x[0];
    b.setAttribute('aria-pressed', x[0] === '' ? 'true' : 'false');
    b.addEventListener('click', function () { cat = x[0]; limite = 40; Array.prototype.forEach.call(chips.children, function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); }); lista(); });
    chips.appendChild(b);
  });

  function fila(p) {
    var li = document.createElement('li'); li.className = 'sg-fila' + (p.st ? '' : ' sg-agotado');
    var n = ped[p.s] || 0;
    li.innerHTML = '<img src="' + p.i + '" alt="" width="64" height="64" loading="lazy">' +
      '<div class="sg-f-txt"><b>' + p.n + '</b><small>' + (p.k ? 'Cód. ' + p.k + ' · ' : '') + (p.pk ? p.pk + ' · ' : '') + (p.st ? 'En stock' : 'Consultar disponibilidad') + '</small></div>' +
      '<span class="sg-f-precio">' + eur(p.p) + '</span>' +
      '<div class="sg-cant"><button type="button" aria-label="Quitar uno">−</button><input type="number" min="0" max="999" inputmode="numeric" value="' + (n || '') + '" placeholder="0" aria-label="Cantidad de ' + p.n.replace(/"/g, '') + '"><button type="button" aria-label="Añadir uno">+</button></div>';
    var inp = li.querySelector('input'), bs = li.querySelectorAll('button');
    var poner = function (v) { v = Math.max(0, Math.min(999, v | 0)); if (v) ped[p.s] = v; else delete ped[p.s]; inp.value = v || ''; li.classList.toggle('sg-con', !!v); resumen(); };
    bs[0].addEventListener('click', function () { poner((ped[p.s] || 0) - 1); });
    bs[1].addEventListener('click', function () { poner((ped[p.s] || 0) + 1); });
    inp.addEventListener('change', function () { poner(+inp.value); });
    if (n) li.classList.add('sg-con');
    return li;
  }
  function lista() {
    var t = quitar(texto.trim()), partes = t.split(/\s+/).filter(Boolean);
    var r = P.filter(function (p) { return (!cat || p.c === cat) && partes.every(function (w) { return p.q.indexOf(w) >= 0; }); });
    // primero lo que hay en stock
    r.sort(function (a, b) { return (b.st - a.st) || 0; });
    filas.innerHTML = '';
    r.slice(0, limite).forEach(function (p) { filas.appendChild(fila(p)); });
    $('sgCuenta').textContent = r.length ? r.length + (r.length === 1 ? ' producto' : ' productos') : 'No encontramos nada con «' + texto + '». Prueba con otra palabra o pregúntanos por WhatsApp.';
    $('sgMas').hidden = r.length <= limite;
  }
  $('sgMas').addEventListener('click', function () { limite += 40; lista(); });
  var tm; $('sgBuscar').addEventListener('input', function (e) { clearTimeout(tm); tm = setTimeout(function () { texto = e.target.value; limite = 40; lista(); }, 150); });

  function resumen() {
    var ks = Object.keys(ped), total = 0, uds = 0, ul = $('sgLineas');
    ul.innerHTML = '';
    ks.forEach(function (s) {
      var p = porSlug[s], n = ped[s]; total += p.p * n; uds += n;
      var li = document.createElement('li');
      li.innerHTML = '<span>' + n + ' × ' + p.n + (p.st ? '' : ' <em>(consultar)</em>') + '</span><b>' + eur(p.p * n) + '</b>';
      ul.appendChild(li);
    });
    if (!ks.length) ul.innerHTML = '<li class="sg-vacio">Aún no has añadido nada.</li>';
    $('sgNum').textContent = ks.length + (ks.length === 1 ? ' producto' : ' productos');
    $('sgTotal').textContent = eur(total);
    $('sgCarrito').disabled = !ks.length; $('sgGuardar').disabled = !ks.length;
    var wa = $('sgWa');
    if (ks.length) {
      var txt = 'Hola, quiero hacer este pedido:\n' + ks.map(function (s) { var p = porSlug[s]; return '- ' + ped[s] + ' x ' + p.n + (p.k ? ' (' + p.k + ')' : ''); }).join('\n') + '\nTotal aprox.: ' + eur(total);
      wa.href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(txt); wa.removeAttribute('aria-disabled');
    } else { wa.href = '#'; wa.setAttribute('aria-disabled', 'true'); }
    $('sgAviso').textContent = '';
  }
  $('sgWa').addEventListener('click', function (e) { if (this.getAttribute('aria-disabled')) e.preventDefault(); });
  $('sgCarrito').addEventListener('click', function () {
    var c = leer(CLAVE, '[]'), fuera = 0;
    Object.keys(ped).forEach(function (s) {
      var p = porSlug[s];
      if (!p.st) { fuera++; return; }
      var ya = c.filter(function (x) { return x.id === s; })[0];
      if (ya) ya.cant += ped[s]; else c.push({ id: s, nombre: p.n, img: p.i, precio: p.p.toFixed(2).replace('.', ','), cant: ped[s] });
    });
    try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { $('sgAviso').textContent = 'Este navegador no deja guardar el carrito: mándalo por WhatsApp.'; return; }
    var n = c.reduce(function (a, x) { return a + x.cant; }, 0);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-n]'), function (el) { el.textContent = n; el.removeAttribute('hidden'); });
    $('sgAviso').innerHTML = 'Añadido al carrito.' + (fuera ? ' ' + fuera + (fuera === 1 ? ' producto sin stock va' : ' productos sin stock van') + ' mejor por WhatsApp.' : '') + ' <a href="cesta.html">Ver el carrito</a>';
  });
  $('sgGuardar').addEventListener('click', function () {
    try { localStorage.setItem(HAB, JSON.stringify(ped)); } catch (e) { return; }
    $('sgHabitual').hidden = false;
    $('sgAviso').textContent = 'Guardado. La próxima vez pulsa «Repetir mi pedido de siempre».';
  });
  $('sgRepetir').addEventListener('click', function () {
    var h = leer(HAB, '{}'); ped = {};
    Object.keys(h).forEach(function (s) { if (porSlug[s]) ped[s] = h[s]; });
    lista(); resumen();
  });
  if (Object.keys(leer(HAB, '{}')).length) $('sgHabitual').hidden = false;
  // atajo: pedido.html#lejia busca esa palabra
  var h0 = decodeURIComponent((location.hash || '').slice(1));
  if (h0 && D.cats[h0]) { var b0 = chips.querySelector('[data-c="' + h0 + '"]'); if (b0) b0.click(); }
  lista(); resumen();
})();
