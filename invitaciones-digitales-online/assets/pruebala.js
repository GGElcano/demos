/* «Pruébala con vuestros nombres» (Invitaciones Digitales, 6-nov-2026).
   Todo pasa en este navegador: nada se envía. La foto se lee en local (FileReader). Sin diálogos. */
(function () {
  'use strict';
  var form = document.getElementById('prForm');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var pantalla = $('prPantalla'), portada = $('prPortada');
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var TIPOS = { boda: 'Nos casamos', comunion: 'Mi Primera Comunión', bautizo: 'Mi bautizo', xv: 'Mis XV años' };
  var CAT = { boda: 'boda', comunion: 'comunion', bautizo: 'bautizo', xv: 'xv' };
  var CLAVE = 'cesta-invitacionesdigitales';
  var fotoURL = null;

  // fecha por defecto: un sábado dentro de ~7 meses
  var d0 = new Date(); d0.setMonth(d0.getMonth() + 7); d0.setDate(d0.getDate() + (6 - d0.getDay()));
  form.fecha.value = d0.toISOString().slice(0, 10);

  function v(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function radio(n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
  function fechaObj() { var f = v('fecha'), h = v('hora') || '12:00'; if (!f) return null; var d = new Date(f + 'T' + h + ':00'); return isNaN(d) ? null : d; }
  function fechaLarga(d) { return d ? DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear() : ''; }
  function nombres() { var ev = radio('evento'), a = v('n1') || 'Lucía', b = v('n2'); return ev === 'boda' && b ? [a, b] : [a]; }

  function pintar() {
    var ev = radio('evento'), ns = nombres(), d = fechaObj();
    pantalla.dataset.estilo = radio('estilo');
    Array.prototype.forEach.call(form.querySelectorAll('[data-solo-boda]'), function (el) { el.hidden = ev !== 'boda'; });
    $('prTipo').textContent = TIPOS[ev];
    var h2 = $('prNombres'); h2.textContent = '';
    h2.appendChild(document.createTextNode(ns[0]));
    if (ns[1]) { var i = document.createElement('i'); i.textContent = ' & '; h2.appendChild(i); h2.appendChild(document.createTextNode(ns[1])); }
    $('prIniciales').textContent = ns.map(function (n) { return n.charAt(0).toUpperCase(); }).join('&');
    $('prFecha').textContent = fechaLarga(d);
    $('prFrase').textContent = v('frase');
    $('prL1').textContent = v('lugar1') || 'Por confirmar';
    $('prL2').textContent = v('lugar2') || 'Por confirmar';
    $('prHora').textContent = v('hora') ? 'A las ' + v('hora') + ' h' : '';
    if (fotoURL) { portada.classList.add('con-foto'); portada.style.backgroundImage = 'linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.6)),url("' + fotoURL + '")'; }
    else { portada.classList.remove('con-foto'); portada.style.backgroundImage = ''; }
    cuenta(); resumen();
  }

  function cuenta() {
    var d = fechaObj(), b = $('prCuenta').querySelectorAll('b');
    var s = d ? Math.max(0, Math.floor((d - new Date()) / 1000)) : 0;
    var vals = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
    for (var i = 0; i < 4; i++) b[i].textContent = vals[i];
  }
  setInterval(cuenta, 1000);

  form.addEventListener('input', pintar);
  form.addEventListener('change', function (e) {
    if (e.target.name === 'foto') {
      var f = e.target.files && e.target.files[0];
      if (fotoURL) { URL.revokeObjectURL(fotoURL); fotoURL = null; }
      if (f && /^image\//.test(f.type)) fotoURL = URL.createObjectURL(f);
    }
    if (e.target.name === 'evento') llenarModelos();
    pintar();
  });

  // sobre
  function abrir() { pantalla.classList.add('abierta'); $('prInv').scrollTop = 0; }
  $('prSello').addEventListener('click', abrir);
  $('prCerrar').addEventListener('click', function () { pantalla.classList.remove('abierta'); });

  // botones simulados dentro del móvil
  var toast = $('prToast'), tt;
  function aviso(t) { toast.textContent = t; toast.hidden = false; clearTimeout(tt); tt = setTimeout(function () { toast.hidden = true; }, 3600); }
  Array.prototype.forEach.call(pantalla.querySelectorAll('[data-sim]'), function (b) { b.addEventListener('click', function () { aviso('En vuestra invitación: ' + b.dataset.sim); }); });
  $('prRsvpBtn').addEventListener('click', function () {
    var n = ($('prRsvpNombre').value || '').trim();
    if (!n) { aviso('Escribe tu nombre para confirmar.'); $('prRsvpNombre').focus(); return; }
    var g = $('prGracias'); g.textContent = '¡Gracias, ' + n + '! ' + nombres().join(' y ') + ' ya saben que venís (' + $('prRsvpN').value + ').';
    g.hidden = false; $('prRsvp').hidden = true;
    aviso('En la tienda en marcha, cada confirmación os llega al momento con el nombre, cuántos vienen y el menú.');
  });

  // pedir con estos datos
  var MODELOS = window.PR_MODELOS || [], sel = $('prModelo');
  var pre = (location.hash || '').replace('#', '');
  var inicial = MODELOS.filter(function (m) { return m.slug === pre; })[0];
  if (inicial) { var r = form.querySelector('input[name="evento"][value="' + inicial.cat + '"]'); if (r) r.checked = true; }
  function eur(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
  function llenarModelos() {
    var ev = radio('evento'), lista = MODELOS.filter(function (m) { return m.cat === CAT[ev]; }), prev = sel.value || (inicial && inicial.slug);
    sel.innerHTML = '';
    lista.forEach(function (m) { var o = document.createElement('option'); o.value = m.slug; o.textContent = m.nombre + ' · ' + (m.precio ? eur(m.precio) : 'consultar'); sel.appendChild(o); });
    if (lista.some(function (m) { return m.slug === prev; })) sel.value = prev;
    modelo();
  }
  function actual() { return MODELOS.filter(function (m) { return m.slug === sel.value; })[0]; }
  function modelo() {
    var m = actual(); if (!m) return;
    $('prPrecio').innerHTML = (m.antes ? '<s>' + eur(m.antes) + '</s>' : '') + (m.precio ? eur(m.precio) : 'Precio a consultar');
    var img = $('prModeloImg'); img.src = m.img; img.alt = 'Modelo ' + m.nombre;
    resumen();
  }
  function resumen() {
    var m = actual(), d = fechaObj(), ns = nombres();
    $('prResumen').textContent = 'Pedido nuevo · ' + (m ? m.nombre : '') + '\n' +
      'Evento: ' + TIPOS[radio('evento')].replace('Nos casamos', 'Boda') + ' de ' + ns.join(' y ') + '\n' +
      'Fecha: ' + fechaLarga(d) + (v('hora') ? ', ' + v('hora') + ' h' : '') + '\n' +
      'Ceremonia: ' + (v('lugar1') || '-') + '\n' + 'Celebración: ' + (v('lugar2') || '-') + '\n' +
      'Frase: ' + (v('frase') || '-') + '\n' + 'Estilo elegido en la prueba: ' + radio('estilo') + '\n' +
      'Foto: ' + (fotoURL ? 'adjunta' : 'la mandan después');
  }
  sel.addEventListener('change', modelo);
  $('prAnadir').addEventListener('click', function () {
    var m = actual(); if (!m) return;
    var d = fechaObj(), ns = nombres();
    var c; try { c = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { c = []; }
    var nombre = m.nombre + ' · ' + ns.join(' y ') + (d ? ' · ' + d.toLocaleDateString('es-ES') : '');
    c.push({ id: m.slug + '::' + ns.join('-') + '::' + Date.now(), nombre: nombre, img: m.img, precio: m.precio ? m.precio.toFixed(2).replace('.', ',') : '', cant: 1 });
    try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { /* modo privado: sigue sin cesta */ }
    var tot = c.reduce(function (s, x) { return s + x.cant; }, 0);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cesta-n]'), function (el) { el.textContent = tot; el.removeAttribute('hidden'); });
    $('prAviso').innerHTML = 'Añadida al carrito con vuestros datos. <a href="cesta.html" style="text-decoration:underline">Ver el carrito</a>';
  });

  llenarModelos();
  pintar();
})();
