/* Página de la cesta — David Farré */
(function () {
  'use strict';

  var WA = '34614460898';

  function opcionesTexto(l) {
    var op = l.opciones || {};
    var orden = ['color', 'composicion', 'talla'];
    var etq = { color: 'Color', composicion: 'Piel', talla: 'Talla' };
    return orden.filter(function (k) { return op[k]; })
                .map(function (k) { return etq[k] + ': ' + op[k]; })
                .join('  ·  ');
  }

  function pintar() {
    var lineas = GGCesta.leer();
    var caja = document.getElementById('cestaContenido');
    var resumen = document.getElementById('cestaResumen');
    caja.innerHTML = '';

    if (!lineas.length) {
      resumen.hidden = true;
      var vacia = document.createElement('div');
      vacia.className = 'cesta-vacia';
      vacia.innerHTML = '<p>Todavía no has añadido ninguna prenda.</p>' +
        '<a href="mujer.html" class="btn btn-primary">Ver colección de mujer</a> ' +
        '<a href="hombre.html" class="btn btn-primary" style="margin-left:10px">Ver colección de hombre</a>';
      caja.appendChild(vacia);
      return;
    }
    resumen.hidden = false;

    lineas.forEach(function (l, i) {
      var fila = document.createElement('div');
      fila.className = 'cesta-linea';

      var foto;
      if (l.imagen) {
        foto = document.createElement('img');
        foto.src = l.imagen;
        foto.alt = l.titulo;
        foto.loading = 'lazy';
      } else {
        foto = document.createElement('div');
        foto.className = 'cesta-sinfoto';
        foto.textContent = 'Foto en preparación';
      }
      fila.appendChild(foto);

      var centro = document.createElement('div');
      var modelo = document.createElement('div');
      modelo.className = 'cesta-modelo';
      modelo.textContent = 'Modelo ' + l.modelo;
      var h = document.createElement('h3');
      var enlace = document.createElement('a');
      enlace.href = l.url || '#';
      enlace.textContent = l.titulo;
      h.appendChild(enlace);
      var op = document.createElement('div');
      op.className = 'cesta-opciones';
      op.textContent = opcionesTexto(l) || 'Sin opciones';
      centro.appendChild(modelo);
      centro.appendChild(h);
      centro.appendChild(op);

      var cant = document.createElement('div');
      cant.className = 'cesta-cantidad';
      var menos = document.createElement('button');
      menos.type = 'button'; menos.textContent = '−';
      menos.setAttribute('aria-label', 'Quitar una unidad de ' + l.titulo);
      var num = document.createElement('span');
      num.textContent = l.cant || 1;
      var mas = document.createElement('button');
      mas.type = 'button'; mas.textContent = '+';
      mas.setAttribute('aria-label', 'Añadir una unidad de ' + l.titulo);
      menos.addEventListener('click', function () { GGCesta.cambiarCantidad(i, (l.cant || 1) - 1); });
      mas.addEventListener('click', function () { GGCesta.cambiarCantidad(i, (l.cant || 1) + 1); });
      cant.appendChild(menos); cant.appendChild(num); cant.appendChild(mas);

      var quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'cesta-quitar';
      quitar.textContent = 'Quitar';
      quitar.setAttribute('aria-label', 'Quitar ' + l.titulo + ' de la cesta');
      quitar.addEventListener('click', function () { GGCesta.quitar(i); });

      var pieCant = document.createElement('div');
      pieCant.appendChild(cant);
      pieCant.appendChild(quitar);
      centro.appendChild(pieCant);
      fila.appendChild(centro);

      var precio = document.createElement('div');
      precio.className = 'cesta-precio';
      precio.textContent = GGCesta.euros(l.precio * (l.cant || 1));
      fila.appendChild(precio);

      caja.appendChild(fila);
    });

    var uds = GGCesta.unidades();
    var texto = uds === 1 ? '1 prenda' : uds + ' prendas';
    document.getElementById('cestaUnidades').textContent = texto;
    document.getElementById('cestaSubtotalTxt').textContent = texto;
    document.getElementById('cestaTotal').textContent = GGCesta.euros(GGCesta.total());
  }

  /* Texto del pedido para mandarlo por WhatsApp */
  function textoPedido() {
    var lineas = GGCesta.leer();
    var t = 'Hola, quiero hacer este pedido:\n';
    lineas.forEach(function (l) {
      t += '\n· ' + l.titulo + ' (modelo ' + l.modelo + ')';
      var op = opcionesTexto(l);
      if (op) t += ' — ' + op.replace(/\s+·\s+/g, ', ');
      t += ' — ' + (l.cant || 1) + ' ud. — ' + GGCesta.euros(l.precio * (l.cant || 1));
    });
    t += '\n\nTotal: ' + GGCesta.euros(GGCesta.total());
    return t;
  }

  function abrirPago() {
    var m = document.getElementById('modalPago');
    document.getElementById('enlaceWaPedido').href =
      'https://wa.me/' + WA + '?text=' + encodeURIComponent(textoPedido());
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    m.querySelector('.modal-cerrar').focus();
  }
  function cerrarPago() {
    var m = document.getElementById('modalPago');
    if (m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  pintar();
  window.addEventListener('gg-cesta-cambia', pintar);
  document.getElementById('btnPagar').addEventListener('click', abrirPago);
  document.getElementById('btnVaciar').addEventListener('click', function () {
    GGCesta.vaciar();
  });
  var modal = document.getElementById('modalPago');
  modal.addEventListener('click', function (ev) {
    if (ev.target === modal || ev.target.classList.contains('modal-cerrar')) cerrarPago();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') cerrarPago(); });

  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mmClose = document.getElementById('mmClose');
  function closeMenu() { hamburger.classList.remove('active'); mobileMenu.classList.remove('open'); }
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active'); mobileMenu.classList.toggle('open');
  });
  mmClose.addEventListener('click', closeMenu);
  Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function (a) {
    a.addEventListener('click', closeMenu);
  });
})();
