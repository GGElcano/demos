/* Agrolabor Altiplano (25-nov-2026): busca la pieza por su referencia (con o sin puntos, o un trozo) o por el nombre. */
(function () {
  'use strict';
  var P = window.AG_PIEZAS, q = document.getElementById('agQ'); if (!P || !q) return;
  var lista = document.getElementById('agLista'), n = document.getElementById('agN'), no = document.getElementById('agNo'), wa = document.getElementById('agWa');
  var base = wa.getAttribute('href');
  function lim(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); }
  function pal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  P.forEach(function (p) { p._r = lim(p.r); p._n = pal(p.n); });
  function eur(v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function buscar() {
    var t = q.value.trim(), r = lim(t), w = pal(t).split(/\s+/).filter(function (x) { return x.length > 1; });
    if (!r) { lista.innerHTML = ''; n.textContent = 'Escribe arriba la referencia'; no.hidden = true; return; }
    var res = P.filter(function (p) {
      if (r.length >= 3 && /\d/.test(r) && p._r.indexOf(r) >= 0) return true;
      return w.length && w.every(function (x) { return p._n.indexOf(x) >= 0 || p._r.indexOf(lim(x)) >= 0; });
    });
    res.sort(function (a, b) { return (b._r === r) - (a._r === r) || (b._r.indexOf(r) === 0) - (a._r.indexOf(r) === 0); });
    n.textContent = res.length ? (res.length === 1 ? '1 pieza' : res.length + ' piezas') + (res.length > 8 ? ' · te enseñamos 8' : '') : 'No la tenemos en la web';
    lista.innerHTML = res.slice(0, 8).map(function (p) {
      return '<a class="ag-o" href="producto/' + p.s + '.html"><img src="' + p.i + '" alt="" width="56" height="56" loading="lazy"><div><b>' + esc(p.r ? p.n.replace(' · ' + p.r, '') : p.n) + '</b><small>Ref. ' + esc(p.r) + '</small></div><span>' + (p.p ? eur(p.p) : 'Consultar') + '</span></a>';
    }).join('');
    no.hidden = false; no.querySelector('b').textContent = res.length === 1 ? '¿No es esta?' : res.length ? '¿No es ninguna de estas?' : '¿No te sale?';
    wa.setAttribute('href', base + encodeURIComponent(t));
  }
  q.addEventListener('input', buscar);
  Array.prototype.forEach.call(document.querySelectorAll('[data-ej]'), function (b) { b.addEventListener('click', function () { q.value = b.getAttribute('data-ej'); buscar(); q.focus(); }); });
})();
