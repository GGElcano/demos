/* ============================================================
   Cesta de la compra — David Farré
   Guarda el pedido en el propio navegador (localStorage). No hay
   servidor: en la tienda real esto lo lleva WooCommerce y el pago
   sale por el TPV del banco.
   ============================================================ */
(function (global) {
  'use strict';

  var CLAVE = 'gg-farre-cesta-v1';

  function leer() {
    try {
      var bruto = global.localStorage.getItem(CLAVE);
      var datos = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(datos) ? datos.filter(valida) : [];
    } catch (e) { return []; }   /* navegador en modo privado o dato corrupto */
  }

  function valida(l) {
    return l && typeof l.slug === 'string' && typeof l.precio === 'number' && l.precio > 0;
  }

  function guardar(lineas) {
    try { global.localStorage.setItem(CLAVE, JSON.stringify(lineas)); } catch (e) {}
    pintarContador();
    global.dispatchEvent(new CustomEvent('gg-cesta-cambia'));
  }

  /* Dos unidades del mismo modelo en distinta talla son líneas distintas. */
  function firma(linea) {
    var op = linea.opciones || {};
    return linea.slug + '|' + Object.keys(op).sort().map(function (k) {
      return k + '=' + op[k];
    }).join(',');
  }

  function anadir(linea, cantidad) {
    var lineas = leer();
    var n = Math.max(1, parseInt(cantidad, 10) || 1);
    var f = firma(linea);
    var existente = null;
    lineas.forEach(function (l) { if (firma(l) === f) existente = l; });
    if (existente) { existente.cant = Math.min(20, (existente.cant || 1) + n); }
    else { linea.cant = n; lineas.push(linea); }
    guardar(lineas);
    return lineas;
  }

  function quitar(indice) {
    var lineas = leer();
    lineas.splice(indice, 1);
    guardar(lineas);
  }

  function cambiarCantidad(indice, cantidad) {
    var lineas = leer();
    if (!lineas[indice]) return;
    var n = parseInt(cantidad, 10);
    if (!n || n < 1) { lineas.splice(indice, 1); }
    else { lineas[indice].cant = Math.min(20, n); }
    guardar(lineas);
  }

  function vaciar() { guardar([]); }

  function unidades() {
    return leer().reduce(function (s, l) { return s + (l.cant || 1); }, 0);
  }

  function total() {
    return leer().reduce(function (s, l) { return s + l.precio * (l.cant || 1); }, 0);
  }

  function euros(n) {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';
  }

  function pintarContador() {
    var n = unidades();
    Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-num]'), function (el) {
      el.textContent = n;
      el.parentNode.classList.toggle('con-cosas', n > 0);
      el.setAttribute('aria-label', n === 1 ? '1 prenda en la cesta' : n + ' prendas en la cesta');
    });
  }

  /* Aviso flotante al añadir, para que se vea que ha pasado algo. */
  function aviso(texto, hrefCesta) {
    var viejo = document.getElementById('ggToast');
    if (viejo) viejo.remove();
    var caja = document.createElement('div');
    caja.id = 'ggToast';
    caja.className = 'gg-toast';
    caja.setAttribute('role', 'status');
    var t = document.createElement('span');
    t.textContent = texto;
    caja.appendChild(t);
    if (hrefCesta) {
      var a = document.createElement('a');
      a.href = hrefCesta;
      a.textContent = 'Ver la cesta';
      caja.appendChild(a);
    }
    document.body.appendChild(caja);
    requestAnimationFrame(function () { caja.classList.add('visible'); });
    setTimeout(function () {
      caja.classList.remove('visible');
      setTimeout(function () { if (caja.parentNode) caja.remove(); }, 400);
    }, 5000);
  }

  global.GGCesta = {
    leer: leer, guardar: guardar, anadir: anadir, quitar: quitar,
    cambiarCantidad: cambiarCantidad, vaciar: vaciar,
    unidades: unidades, total: total, euros: euros,
    pintarContador: pintarContador, aviso: aviso, firma: firma
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarContador);
  } else { pintarContador(); }

  /* Si el cliente tiene la tienda abierta en dos pestañas, que cuadren. */
  global.addEventListener('storage', function (e) { if (e.key === CLAVE) pintarContador(); });
})(window);
