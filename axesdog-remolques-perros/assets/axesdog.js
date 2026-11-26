/* AxesDog: galerías de fotos, «Monta tu remolque» y buscador de boxes por coche (26-nov-2026). */
(function () {
  'use strict';
  var D = window.AX_DATOS || null;
  var eur = function (v) {
    var dec = Math.abs(v - Math.round(v)) < 0.005 ? 0 : 2;
    return v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: true }) + ' €';
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ── galerías: la miniatura cambia la foto grande ──
  document.querySelectorAll('[data-galeria]').forEach(function (g) {
    var grande = g.querySelector('.ax-galeria-grande img');
    g.querySelectorAll('[data-foto]').forEach(function (b) {
      b.addEventListener('click', function () {
        grande.src = b.getAttribute('data-foto');
        g.querySelectorAll('[data-foto]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  });

  if (!D) return;

  // ── Monta tu remolque ──
  var cajaGamas = document.querySelector('[data-gamas]');
  if (cajaGamas) {
    var st = { linea: null, plazas: null, extras: {} };
    var porId = {}; D.lineas.forEach(function (l) { porId[l.id] = l; });
    var exPorId = {}; D.extras.forEach(function (e) { exPorId[e.id] = e; });
    var hash = (location.hash || '').slice(1);
    st.linea = porId[hash] ? hash : 'standard';

    cajaGamas.innerHTML = D.lineas.map(function (l) {
      return '<button type="button" class="ax-opcion" data-linea="' + l.id + '" aria-pressed="false"><img src="' + l.imgs[0] + '" alt="" width="1000" height="1000">' +
        '<span><b>' + esc(l.nombre) + '</b><small>' + esc(l.sub) + '</small><small>desde ' + eur(l.desde) + '</small></span></button>';
    }).join('');
    var grupos = [];
    D.extras.forEach(function (e) { if (grupos.indexOf(e.grupo) < 0) grupos.push(e.grupo); });
    document.querySelector('[data-extras]').innerHTML = grupos.map(function (g) {
      return '<div class="ax-ex-grupo"><h3>' + esc(g) + '</h3><div class="ax-ex-lista">' + D.extras.filter(function (e) { return e.grupo === g; }).map(function (e) {
        return '<div class="ax-ex" data-ex="' + e.id + '"><img src="' + e.foto + '" alt="" width="64" height="64" loading="lazy"><div><b>' + esc(e.nombre) + '</b><small>' + eur(e.precio) + (e.por_box ? ' por box' : '') + '</small>' +
          '<div class="ax-ex-ctrl"><button type="button" data-menos aria-label="Quitar ' + esc(e.nombre) + '">−</button><output aria-label="Cantidad">0</output><button type="button" data-mas aria-label="Añadir ' + esc(e.nombre) + '">+</button></div>' +
          '<span class="ax-ex-incl" hidden>Incluido de serie</span></div></div>';
      }).join('') + '</div></div>';
    }).join('');

    var pintarPlazas = function () {
      var l = porId[st.linea];
      var hay = l.precios.some(function (p) { return p[0] === st.plazas; });
      if (!hay) st.plazas = l.precios[0][0];
      document.querySelector('[data-plazas]').innerHTML = l.precios.map(function (p) {
        return '<button type="button" class="ax-plaza" data-pl="' + p[0] + '" aria-pressed="' + (p[0] === st.plazas) + '"><b>' + p[0] + ' plazas</b><small>' + eur(p[1]) + '</small></button>';
      }).join('');
    };
    var pintar = function () {
      var l = porId[st.linea];
      cajaGamas.querySelectorAll('[data-linea]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-linea') === st.linea ? 'true' : 'false'); });
      document.querySelectorAll('.ax-ex').forEach(function (n) {
        var id = n.getAttribute('data-ex'), incl = l.incluye.indexOf(id) >= 0;
        if (incl) delete st.extras[id];
        var q = st.extras[id] || 0;
        n.classList.toggle('incluido', incl); n.classList.toggle('on', q > 0);
        n.querySelector('.ax-ex-ctrl').hidden = incl; n.querySelector('.ax-ex-incl').hidden = !incl;
        n.querySelector('output').textContent = q;
      });
      var base = 0; l.precios.forEach(function (p) { if (p[0] === st.plazas) base = p[1]; });
      var lineas = [['Remolque ' + l.nombre + ', ' + st.plazas + ' plazas', base]], total = base;
      Object.keys(st.extras).forEach(function (id) {
        var e = exPorId[id], q = st.extras[id]; if (!q) return;
        lineas.push([(q > 1 ? q + ' × ' : '') + e.nombre, e.precio * q]); total += e.precio * q;
      });
      document.querySelector('[data-resumen-foto]').src = l.imgs[0];
      document.querySelector('[data-resumen-foto]').alt = 'Remolque ' + l.nombre;
      document.querySelector('[data-resumen-titulo]').textContent = l.nombre + ' · ' + st.plazas + ' plazas';
      document.querySelector('[data-resumen-lineas]').innerHTML = lineas.map(function (x) { return '<li><span>' + esc(x[0]) + '</span><span>' + eur(x[1]) + '</span></li>'; }).join('') +
        (l.incluye.length ? '<li><span>De serie: ' + esc(l.serie.join(', ').toLowerCase()) + '</span><span></span></li>' : '');
      document.querySelector('[data-resumen-total]').textContent = eur(total);
      var bt = document.querySelector('[data-barra-total]'); if (bt) bt.textContent = eur(total);
      var txt = 'Hola, he montado mi remolque en vuestra web y quería el presupuesto cerrado:\n' +
        lineas.map(function (x) { return '- ' + x[0] + ': ' + eur(x[1]); }).join('\n') + '\nTotal orientativo: ' + eur(total) + ' (IVA incluido)';
      document.querySelector('[data-resumen-wa]').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(txt);
      document.querySelector('[data-resumen-copiar]').dataset.txt = txt;
    };
    cajaGamas.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-linea]'); if (!b) return;
      st.linea = b.getAttribute('data-linea'); pintarPlazas(); pintar();
      try { history.replaceState(null, '', '#' + st.linea); } catch (e) {}
    });
    document.querySelector('[data-plazas]').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-pl]'); if (!b) return;
      st.plazas = +b.getAttribute('data-pl'); pintarPlazas(); pintar();
    });
    document.querySelector('[data-extras]').addEventListener('click', function (ev) {
      var n = ev.target.closest('.ax-ex'); if (!n) return;
      var id = n.getAttribute('data-ex'), q = st.extras[id] || 0, tope = exPorId[id].por_box ? 10 : 4;
      if (ev.target.closest('[data-mas]')) q = Math.min(tope, q + 1);
      else if (ev.target.closest('[data-menos]')) q = Math.max(0, q - 1);
      else return;
      if (q) st.extras[id] = q; else delete st.extras[id];
      pintar();
    });
    document.querySelector('[data-resumen-copiar]').addEventListener('click', function (ev) {
      var b = ev.currentTarget, t = b.dataset.txt || '';
      var ok = function () { var o = b.textContent; b.textContent = 'Copiado'; setTimeout(function () { b.textContent = o; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, function () {});
    });
    pintarPlazas(); pintar();
  }

  // ── Buscador de boxes por coche ──
  var selMarca = document.querySelector('[data-marca]');
  if (selMarca && D.marcas) {
    var selMod = document.querySelector('[data-modelo]'), res = document.querySelector('[data-resultado]');
    selMarca.innerHTML += D.marcas.map(function (m, i) { return '<option value="' + i + '">' + esc(m.m) + '</option>'; }).join('');
    selMarca.addEventListener('change', function () {
      var m = D.marcas[selMarca.value];
      selMod.disabled = !m;
      selMod.innerHTML = '<option value="">' + (m ? 'Elige el modelo' : 'Primero, la marca') + '</option>' +
        (m ? m.modelos.map(function (x, i) { return '<option value="' + i + '">' + esc(x.n) + '</option>'; }).join('') : '');
      if (m) selMod.focus();
    });
    selMod.addEventListener('change', function () {
      var m = D.marcas[selMarca.value], x = m && m.modelos[selMod.value];
      if (!x) return;
      var coche = m.m + ' ' + x.n.replace(new RegExp('^(' + m.m + '|VW|Mercedes|Peugeot) ', 'i'), '');
      var msg = 'Hola, quería presupuesto de un box para perros para mi ' + coche;
      var wa = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(msg);
      res.innerHTML = '<h3>Boxes para ' + esc(coche) + '</h3>' + (x.boxes.length
        ? '<ul class="ax-res-lista">' + x.boxes.map(function (b) { return '<li><span>' + esc(b.n) + '</span><b>' + eur(b.p) + '</b></li>'; }).join('') + '</ul>' +
          '<p class="ax-nota">Precio con IVA. Se fabrica a la medida de tu maletero; dinos si lo quieres individual o doble y si llevas extras.</p>'
        : '<p>Fabricamos boxes a medida para este coche. Dinos si lo quieres individual o doble y te pasamos el precio cerrado.</p>') +
        '<div class="ax-botones"><a class="ax-btn ax-btn-rojo" href="' + wa + '" target="_blank" rel="noopener">Pedir presupuesto por WhatsApp</a></div>';
    });
  }
})();
