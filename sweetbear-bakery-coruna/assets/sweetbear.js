/* Sweet Bear Bakery (20-nov-2026): mesa dulce para pedir la propuesta de un evento por WhatsApp. */
(function () {
  'use strict';
  var D = window.SB_DATOS, carta = document.getElementById('sbCarta'); if (!D || !carta) return;
  var elegidos = [], evento = 'Boda íntima';
  D.ops.forEach(function (o, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sb-op'; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<img src="' + o.img + '" alt="" width="600" height="600" loading="lazy"><span>' + o.nombre + '</span>';
    b.addEventListener('click', function () { var k = elegidos.indexOf(i); if (k > -1) elegidos.splice(k, 1); else elegidos.push(i); pintar(k === -1 ? i : null); });
    carta.appendChild(b);
  });
  Array.prototype.forEach.call(document.querySelectorAll('#sbEvento button'), function (b) {
    b.addEventListener('click', function () { evento = b.textContent; Array.prototype.forEach.call(document.querySelectorAll('#sbEvento button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); pintar(null); });
  });
  var inv = document.getElementById('sbInvitados'), fecha = document.getElementById('sbFecha');
  inv.addEventListener('input', function () { pintar(null); }); fecha.addEventListener('input', function () { pintar(null); });
  function fechaTxt() { if (!fecha.value) return ''; var p = fecha.value.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function pintar(nuevo) {
    Array.prototype.forEach.call(carta.children, function (b, i) { b.setAttribute('aria-pressed', elegidos.indexOf(i) > -1 ? 'true' : 'false'); });
    var m = document.getElementById('sbMantel');
    if (!elegidos.length) m.innerHTML = '<p class="sb-vacia">Tu mesa está vacía: toca una tarta o unas cookies.</p>';
    else {
      m.innerHTML = '';
      elegidos.forEach(function (i) { var d = document.createElement('div'); d.className = 'sb-pieza'; if (i !== nuevo) d.style.animation = 'none'; d.innerHTML = '<img src="' + D.ops[i].img + '" alt="' + D.ops[i].nombre + '" title="' + D.ops[i].nombre + '">'; m.appendChild(d); });
    }
    var n = Math.max(1, +inv.value || 0), f = fechaTxt();
    document.getElementById('sbResumen').textContent = evento + ' · ' + n + ' invitados' + (f ? ' · ' + f : '') + (elegidos.length ? ' · ' + elegidos.length + (elegidos.length === 1 ? ' cosa elegida' : ' cosas elegidas') : '');
    var txt = 'Hola, quería una mesa dulce para ' + evento.toLowerCase() + ', ' + n + ' invitados' + (f ? ', el ' + f : '') + '.' +
      (elegidos.length ? ' Me gustaría: ' + elegidos.map(function (i) { return D.ops[i].nombre; }).join(', ') + '.' : '') + ' ¿Me hacéis una propuesta?';
    document.getElementById('sbPedir').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(txt);
  }
  pintar(null);
})();
