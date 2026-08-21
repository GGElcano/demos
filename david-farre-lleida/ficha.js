/* ============================================================
   Ficha de producto — David Farré
   Todo a la vista: color, piel y talla en una sola pantalla.
   Los datos de la prenda llegan en PRODUCTO desde la propia página.
   ============================================================ */
(function () {
  'use strict';

  var P = window.PRODUCTO;
  var sel = {};
  var recientes = [];
  P.ejes.forEach(function (e) { sel[e.id] = null; });

  var NOMBRE_EJE = { color: 'Color', composicion: 'Piel', talla: 'Talla' };
  var NOMBRE_EJE_MIN = { color: 'el color', composicion: 'la piel', talla: 'la talla' };

  function nombreDe(ejeId, valor) {
    if (ejeId === 'talla') return (P.nombres[valor] || valor).toUpperCase();
    return P.nombres[valor] || valor;
  }

  /* ---------- combinaciones ---------- */
  function casa(combo, filtros) {
    for (var k in filtros) { if (filtros[k] && combo[k] !== filtros[k]) return false; }
    return true;
  }
  function combinacionesQue(filtros) {
    return P.combinaciones.filter(function (c) { return casa(c, filtros); });
  }
  function hayCombinacion(filtros) { return combinacionesQue(filtros).length > 0; }

  function combinacionElegida() {
    var completo = P.ejes.every(function (e) { return sel[e.id]; });
    if (!completo) return null;
    return combinacionesQue(sel)[0] || null;
  }

  /* ¿Este valor existe en alguna combinación del catálogo? */
  function existeAlguna(ejeId, valor) {
    var f = {}; f[ejeId] = valor;
    return hayCombinacion(f);
  }
  /* ¿Y encaja con lo que ya está elegido en los demás ejes? */
  function compatible(ejeId, valor) {
    var f = {};
    for (var k in sel) { if (k !== ejeId && sel[k]) f[k] = sel[k]; }
    f[ejeId] = valor;
    return hayCombinacion(f);
  }
  /* ¿Queda alguna unidad de ese valor, o todo lo que lo lleva está agotado? */
  function hayStock(ejeId, valor) {
    var f = {};
    for (var k in sel) { if (k !== ejeId && sel[k]) f[k] = sel[k]; }
    f[ejeId] = valor;
    return combinacionesQue(f).some(function (c) { return c.stock; });
  }

  /* Al pulsar algo incompatible se reordena la elección alrededor de lo
     último pulsado, en vez de dejar al comprador en un callejón sin salida. */
  function elegir(ejeId, valor) {
    if (!existeAlguna(ejeId, valor)) return;
    sel[ejeId] = (sel[ejeId] === valor) ? null : valor;

    recientes = recientes.filter(function (x) { return x !== ejeId; });
    if (sel[ejeId]) recientes.unshift(ejeId);

    if (sel[ejeId] && !hayCombinacion(sel)) {
      var conservados = {}; conservados[ejeId] = sel[ejeId];
      recientes.forEach(function (otro) {
        if (otro === ejeId || !sel[otro]) return;
        var prueba = {};
        for (var k in conservados) prueba[k] = conservados[k];
        prueba[otro] = sel[otro];
        if (hayCombinacion(prueba)) conservados[otro] = sel[otro];
      });
      for (var k2 in sel) { sel[k2] = conservados[k2] || null; }
    }
    pintar();
  }

  /* ---------- pintar la rejilla ---------- */
  function pintar() {
    var cont = document.getElementById('vistaNueva');
    if (!cont) return;
    cont.innerHTML = '';

    P.ejes.forEach(function (eje) {
      var bloque = document.createElement('div');
      bloque.className = 'eje';

      var cab = document.createElement('div');
      cab.className = 'eje-cab';
      var h = document.createElement('h3');
      h.id = 'eje-' + eje.id;
      h.textContent = NOMBRE_EJE[eje.id] || eje.id;
      cab.appendChild(h);

      if (eje.id === 'talla' && document.getElementById('guiaTallas')) {
        var g = document.createElement('button');
        g.type = 'button';
        g.className = 'eje-guia';
        g.textContent = 'Guía de tallas';
        g.addEventListener('click', abrirGuia);
        cab.appendChild(g);
      }

      var el = document.createElement('span');
      el.className = 'elegido';
      el.textContent = sel[eje.id] ? nombreDe(eje.id, sel[eje.id]) : '';
      cab.appendChild(el);
      bloque.appendChild(cab);

      var fila = document.createElement('div');
      fila.className = 'opciones';
      fila.setAttribute('role', 'radiogroup');
      fila.setAttribute('aria-labelledby', 'eje-' + eje.id);

      eje.opciones.forEach(function (valor) {
        var b = document.createElement('button');
        b.type = 'button';
        var existe = existeAlguna(eje.id, valor);
        var puede = compatible(eje.id, valor);
        var stock = hayStock(eje.id, valor);

        b.className = 'op ' + (eje.tipo === 'muestra' ? 'op-muestra' : 'op-texto');
        if (sel[eje.id] === valor) b.className += ' on';
        else if (!existe) b.className += ' muerta no';
        else if (!puede) b.className += ' no';
        else if (!stock) b.className += ' agotada';

        if (eje.tipo === 'muestra') {
          b.innerHTML = '<span class="piel piel-' + valor + '"></span>' +
                        '<span class="nombre">' + nombreDe(eje.id, valor) + '</span>';
        } else {
          b.textContent = nombreDe(eje.id, valor);
        }

        var etiqueta = (NOMBRE_EJE[eje.id] || eje.id) + ' ' + nombreDe(eje.id, valor);
        if (!existe) etiqueta += ', no disponible';
        else if (!puede) etiqueta += ', no se fabrica con lo que has elegido';
        else if (!stock) etiqueta += ', agotada ahora mismo';
        b.setAttribute('aria-label', etiqueta);
        b.setAttribute('data-eje', eje.id);
        b.setAttribute('data-valor', valor);
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', sel[eje.id] === valor ? 'true' : 'false');
        if (!existe) b.disabled = true;

        b.addEventListener('click', function () { elegir(eje.id, valor); });
        fila.appendChild(b);
      });

      bloque.appendChild(fila);
      cont.appendChild(bloque);
    });

    actualizarEstado();
  }

  /* ---------- estado y botones ---------- */
  function actualizarEstado() {
    var caja = document.getElementById('estado');
    var btnCesta = document.getElementById('btnCesta');
    var btnYa = document.getElementById('btnComprarYa');
    var elPrecio = document.getElementById('fichaPrecio');
    var agotado = document.getElementById('avisoAgotado');

    var faltan = P.ejes.filter(function (e) { return !sel[e.id]; })
                       .map(function (e) { return NOMBRE_EJE_MIN[e.id] || e.id; });

    /* "el color, la piel y la talla", no "el color y la piel y la talla" */
    function enumera(xs, envuelve) {
      var v = envuelve ? xs.map(function (x) { return '<b>' + x + '</b>'; }) : xs.slice();
      if (v.length < 2) return v.join('');
      return v.slice(0, -1).join(', ') + ' y ' + v[v.length - 1];
    }
    var combo = combinacionElegida();

    if (combo && elPrecio) elPrecio.textContent = GGCesta.euros(combo.precio);

    function apagar(texto) {
      btnCesta.disabled = true; btnYa.disabled = true;
      btnCesta.textContent = texto || 'Añadir a la cesta';
      btnYa.textContent = 'Comprar ahora';
    }

    if (!P.ejes.length) {                       /* prenda sin tallas cargadas */
      caja.className = 'estado';
      caja.innerHTML = 'Esta prenda todavía <b>no tiene tallas publicadas</b> en la web. ' +
                       'Escríbenos y te decimos qué hay disponible.';
      apagar('Consultar disponibilidad');
      if (agotado) agotado.hidden = false;
      return;
    }

    if (faltan.length) {
      caja.className = 'estado';
      caja.innerHTML = (faltan.length === P.ejes.length)
        ? 'Elige ' + enumera(faltan, false) + '. Solo se pueden pulsar las combinaciones que existen.'
        : 'Te falta elegir ' + enumera(faltan, true) + '.';
      apagar();
      if (agotado) agotado.hidden = true;
      return;
    }

    if (!combo) {                                /* combinación que no se fabrica */
      caja.className = 'estado estado-no';
      caja.innerHTML = 'Esa combinación <b>no se fabrica</b>. Prueba otra talla o otro color.';
      apagar();
      if (agotado) agotado.hidden = true;
      return;
    }

    var descripcion = P.ejes.map(function (e) { return nombreDe(e.id, sel[e.id]); }).join(' · ');

    if (!combo.stock) {
      caja.className = 'estado estado-no';
      caja.innerHTML = '<b>' + descripcion + '</b>: agotada ahora mismo. ' +
                       'La hacemos bajo encargo en el taller — escríbenos y te decimos el plazo.';
      apagar('Agotada');
      if (agotado) agotado.hidden = false;
      return;
    }

    caja.className = 'estado estado-si';
    caja.innerHTML = 'Disponible: <b>' + descripcion + '</b>. Sale del taller en 24-48 h.';
    btnCesta.disabled = false; btnYa.disabled = false;
    btnCesta.innerHTML = 'Añadir a la cesta &middot; ' + GGCesta.euros(combo.precio);
    btnYa.textContent = 'Comprar ahora';
    if (agotado) agotado.hidden = true;
  }

  /* ---------- cesta ---------- */
  function lineaActual() {
    var combo = combinacionElegida();
    if (!combo || !combo.stock) return null;
    var opciones = {};
    P.ejes.forEach(function (e) { opciones[e.id] = nombreDe(e.id, sel[e.id]); });
    return {
      slug: P.slug, modelo: P.modelo, titulo: P.titulo,
      precio: combo.precio, imagen: P.imagenCesta, url: P.urlCesta,
      sku: combo.sku || '', opciones: opciones
    };
  }

  function alAnadir(irACesta) {
    var linea = lineaActual();
    if (!linea) return;
    GGCesta.anadir(linea, 1);
    if (irACesta) { window.location.href = '../cesta.html'; return; }
    GGCesta.aviso(P.titulo + ' añadida a la cesta', '../cesta.html');
  }

  /* ---------- guía de tallas ---------- */
  var ultimoFoco = null;
  function abrirGuia() {
    var m = document.getElementById('guiaTallas');
    if (!m) return;
    ultimoFoco = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    var cerrar = m.querySelector('.modal-cerrar');
    if (cerrar) cerrar.focus();
  }
  function cerrarGuia() {
    var m = document.getElementById('guiaTallas');
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  /* ---------- galería ---------- */
  function montarGaleria() {
    var tiras = document.getElementById('tiras');
    var grande = document.getElementById('fotoGrande');
    if (!tiras || !grande || P.fotos.length < 2) return;
    P.fotos.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ver foto ' + (i + 1));
      if (i === 0) b.className = 'on';
      var img = document.createElement('img');
      /* la tira carga la versión pequeña; la grande solo al pulsarla */
      img.src = f.tira || f.grande;
      img.alt = f.alt || (P.titulo + ', foto ' + (i + 1));
      img.loading = 'lazy';
      b.appendChild(img);
      b.addEventListener('click', function () {
        grande.src = f.grande;
        grande.alt = f.alt || P.titulo;
        Array.prototype.forEach.call(tiras.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
      tiras.appendChild(b);
    });
  }

  /* ---------- arranque ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Un desplegable con UNA sola opción no decide nada: se da por elegido.
     Si la prenda solo existe en una combinación, se compra con CERO clics —
     que es justo la queja de David con su web actual. */
  P.ejes.forEach(function (e) {
    if (e.opciones.length === 1) sel[e.id] = e.opciones[0];
  });

  montarGaleria();
  pintar();

  document.getElementById('btnCesta').addEventListener('click', function () { alAnadir(false); });
  document.getElementById('btnComprarYa').addEventListener('click', function () { alAnadir(true); });

  var abridores = document.querySelectorAll('[data-abre-guia]');
  Array.prototype.forEach.call(abridores, function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); abrirGuia(); });
  });
  var modal = document.getElementById('guiaTallas');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('modal-cerrar')) cerrarGuia();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarGuia(); });
  }

  /* menú móvil */
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
