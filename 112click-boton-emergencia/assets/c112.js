/* 112 Click (22-nov-2026): «¿Para quién es?» con sus usos y simulación de la pulsación. */
(function () {
  'use strict';
  var D = window.C112, cont = document.getElementById('c1Usos');
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  if (D && cont) {
    var sel = 0;
    D.usos.forEach(function (u, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'c1-uso'; b.setAttribute('aria-pressed', i === sel ? 'true' : 'false');
      b.innerHTML = '<img src="' + u.foto + '" alt="" width="600" height="420" loading="lazy"><span>' + u.nombre + '</span>';
      b.addEventListener('click', function () { sel = i; pintar(); }); cont.appendChild(b);
    });
    var pintar = function () {
      Array.prototype.forEach.call(cont.children, function (b, i) { b.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); });
      var u = D.usos[sel], r = document.getElementById('c1Rec');
      r.style.animation = 'none'; void r.offsetWidth; r.style.animation = '';
      r.innerHTML = '<div><h3>' + u.nombre + '</h3><p>' + u.texto + '</p><p>' + u.porque + '</p></div><div class="c1-prods">' + u.prods.map(function (p, i) {
        return '<a class="c1-prod" href="producto/' + p.slug + '.html"><img src="' + p.img + '" alt="" width="64" height="64"><div><b>' + p.nombre + '</b><small>' + (p.precio ? eur(p.precio) : '') + '</small></div>' + (i === 0 ? '<em>Recomendado</em>' : '<span></span>') + '</a>';
      }).join('') + '</div>';
    };
    pintar();
  }
  var bt = document.getElementById('c1Pulsa'), pasos = document.querySelectorAll('#c1Pasos li');
  if (bt) bt.addEventListener('click', function () {
    bt.classList.remove('pulsado'); void bt.offsetWidth; bt.classList.add('pulsado');
    Array.prototype.forEach.call(pasos, function (li) { li.classList.remove('on'); });
    Array.prototype.forEach.call(pasos, function (li, i) { setTimeout(function () { li.classList.add('on'); }, 500 + i * 900); });
  });
})();
