/* ==========================================================================
   Foto Soria Digital, landing de bodas. Interacciones.

   Este archivo hace dos cosas y nada más:
   1. Convierte el formulario en un mensaje de WhatsApp ya escrito.
   2. Hace que los bloques aparezcan suavemente al bajar por la página.

   Si borras este archivo, la página sigue funcionando: solo se pierde
   el formulario rápido y la animación.
   ========================================================================== */

/* EL NÚMERO DE WHATSAPP. Cámbialo aquí si algún día cambia.
   Va con el prefijo del país y sin espacios ni signos. */
var TELEFONO_WHATSAPP = '34645120519';


/* --------------------------------------------------------------------------
   1. Formulario que abre WhatsApp con el mensaje escrito
   -------------------------------------------------------------------------- */
(function () {
  var formulario = document.getElementById('formularioFecha');
  if (!formulario) { return; }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var nombre  = (document.getElementById('nombre').value  || '').trim();
    var fecha   = (document.getElementById('fecha').value   || '').trim();
    var lugar   = (document.getElementById('lugar').value   || '').trim();
    var interes = (document.getElementById('interes').value || '').trim();

    /* La fecha llega como 2027-06-19 y la pasamos a 19/06/2027 */
    if (fecha.indexOf('-') === 4) {
      var trozos = fecha.split('-');
      fecha = trozos[2] + '/' + trozos[1] + '/' + trozos[0];
    }

    var mensaje = 'Hola Álvaro. Somos ' + (nombre || 'una pareja de Soria') + '.';
    if (fecha) { mensaje += ' Nos casamos el ' + fecha + '.'; }
    if (lugar) { mensaje += ' La boda es en ' + lugar + '.'; }
    if (interes) { mensaje += ' Nos interesa: ' + interes + '.'; }
    mensaje += ' ¿Tienes libre esa fecha?';

    window.open('https://wa.me/' + TELEFONO_WHATSAPP + '?text=' + encodeURIComponent(mensaje), '_blank');
  });
})();


/* --------------------------------------------------------------------------
   2. Aparición suave de los bloques
   -------------------------------------------------------------------------- */
(function () {
  /* Si el navegador no entiende esto, no pasa nada: se ve todo directamente */
  if (!('IntersectionObserver' in window)) { return; }

  var piezas = document.querySelectorAll(
    '.card, .stat, figure, ul.check li, table, .reserva'
  );

  var i;
  for (i = 0; i < piezas.length; i++) {
    piezas[i].setAttribute('data-aparece', '');
  }

  var vigilante = new IntersectionObserver(function (entradas) {
    var j;
    for (j = 0; j < entradas.length; j++) {
      if (entradas[j].isIntersecting) {
        entradas[j].target.className += ' visible';
        vigilante.unobserve(entradas[j].target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  for (i = 0; i < piezas.length; i++) {
    vigilante.observe(piezas[i]);
  }
})();
