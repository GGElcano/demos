/* Carrusel de anuncios de la portada: pasa solo cada 5 s, se para si la persona lo toca. */
(function () {
  'use strict';
  var carril = document.querySelector('.tc-anuncios__carril');
  if (!carril) return;
  var puntos = document.querySelectorAll('.tc-anuncios__puntos i');
  var items = carril.querySelectorAll('.tc-anuncio');
  var parado = false;
  function actual() {
    var mejor = 0, d = Infinity;
    Array.prototype.forEach.call(items, function (it, i) { var x = Math.abs(it.offsetLeft - carril.scrollLeft); if (x < d) { d = x; mejor = i; } });
    return mejor;
  }
  function pintar() { var a = actual(); Array.prototype.forEach.call(puntos, function (p, i) { p.classList.toggle('on', i === a); }); }
  carril.addEventListener('scroll', function () { window.requestAnimationFrame(pintar); }, { passive: true });
  ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(function (e) { carril.addEventListener(e, function () { parado = true; }, { passive: true }); });
  setInterval(function () {
    if (parado || document.hidden) return;
    var sig = actual() + 1;
    if (sig >= items.length || carril.scrollLeft + carril.clientWidth >= carril.scrollWidth - 4) sig = 0;
    carril.scrollTo({ left: items[sig].offsetLeft - carril.offsetLeft, behavior: 'smooth' });
  }, 5000);
  pintar();
})();
