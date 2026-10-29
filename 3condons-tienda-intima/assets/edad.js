/* Aviso de mayoría de edad al entrar (tienda para adultos). Se recuerda en este navegador. */
(function () {
  'use strict';
  var CLAVE = 'tc-mayor-18';
  try { if (localStorage.getItem(CLAVE) === '1') return; } catch (e) { /* sin almacenamiento: se pregunta cada vez */ }
  var capa = document.createElement('div');
  capa.className = 'tc-edad';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-labelledby', 'tcEdadTit');
  capa.innerHTML = '<div class="tc-edad__caja">' +
    '<img src="' + (document.querySelector('.brand-logo') || {}).src + '" alt="3CONDONS" class="tc-edad__logo">' +
    '<h2 id="tcEdadTit">Tienda íntima para mayores de 18 años</h2>' +
    '<p>Aquí hay preservativos, lencería y juguetes para adultos. Para entrar, confirma que eres mayor de edad.</p>' +
    '<div class="tc-edad__botones"><button type="button" class="btn btn-primary" data-edad-si>Soy mayor de 18</button>' +
    '<a class="btn btn-ghost" href="https://www.google.es/" rel="noopener">Salir</a></div></div>';
  document.body.appendChild(capa);
  document.documentElement.classList.add('tc-edad-abierta');
  var si = capa.querySelector('[data-edad-si]');
  si.focus();
  si.addEventListener('click', function () {
    try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* se volverá a preguntar */ }
    capa.remove();
    document.documentElement.classList.remove('tc-edad-abierta');
  });
})();
