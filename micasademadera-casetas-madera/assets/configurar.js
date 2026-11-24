/* Configurador de casetas · muestra para Micasademadera (24-nov-2026). Modelos, medidas, extras, fotos y precios
   leídos de micasademadera.com (sus fichas con «Selecciona los componentes del producto»). */
(function () {
  var D = window.CF_DATOS; if (!D || !document.querySelector('[data-cf-modelos]')) return;
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var eur = function (n) { var t = n.toFixed(2).split('.'), e = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return e + (t[1] === '00' ? '' : ',' + t[1]) + ' €'; };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var st = { grupo: 'todos', modelo: null, medida: null, extras: {}, montaje: false, foto: 0 };

  function modelo() { return D.modelos.filter(function (m) { return m.id === st.modelo; })[0]; }
  function medida() { var m = modelo(); return m.medidas.filter(function (x) { return x.pid === st.medida; })[0] || m.medidas[0]; }
  function desde(m) { return Math.min.apply(null, m.medidas.map(function (x) { return x.precio; })); }

  // 1 · filtros y modelos
  var grupos = [['todos', 'Todos']].concat(D.grupos.filter(function (g) { return D.modelos.some(function (m) { return m.grupo === g[0]; }); }));
  $('[data-cf-filtros]').innerHTML = grupos.map(function (g) { return '<button type="button" role="tab" data-g="' + g[0] + '">' + esc(g[1]) + '</button>'; }).join('');
  $$('[data-cf-filtros] button').forEach(function (b) { b.addEventListener('click', function () { st.grupo = b.dataset.g; pintarModelos(); }); });
  function pintarModelos() {
    $$('[data-cf-filtros] button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.g === st.grupo); });
    $('[data-cf-modelos]').innerHTML = D.modelos.filter(function (m) { return st.grupo === 'todos' || m.grupo === st.grupo; }).map(function (m) {
      return '<button type="button" class="cf-modelo' + (m.id === st.modelo ? ' activo' : '') + '" data-m="' + m.id + '"><img src="' + m.medidas[0].img + '" alt="" loading="lazy" width="300" height="225">' +
        '<b>' + esc(m.corto) + '</b><span>' + (m.medidas.length > 1 ? m.medidas.length + ' medidas · desde ' : '') + eur(desde(m)) + '</span></button>';
    }).join('');
    $$('.cf-modelo').forEach(function (b) { b.addEventListener('click', function () { elegirModelo(b.dataset.m); }); });
  }
  function elegirModelo(id, pid) {
    st.modelo = id; var m = modelo(); st.medida = pid || m.medidas[0].pid; st.extras = {}; st.foto = 0;
    pintarModelos(); pintarMedidas(); pintarExtras(); pintar();
    if (history.replaceState) try { history.replaceState(null, '', '#' + id + (pid ? '-' + pid : '')); } catch (e) {}
  }

  // 2 · medidas
  function pintarMedidas() {
    var m = modelo();
    $('[data-cf-medidas]').innerHTML = m.medidas.map(function (x) {
      return '<button type="button" class="cf-medida' + (x.pid === st.medida ? ' activo' : '') + '" data-p="' + x.pid + '"><b>' + esc(x.medida) + '</b><span>' + eur(x.precio) +
        (x.antes ? ' <s>' + eur(x.antes) + '</s>' : '') + '</span></button>';
    }).join('');
    $$('.cf-medida').forEach(function (b) { b.addEventListener('click', function () { st.medida = +b.dataset.p; st.extras = {}; st.foto = 0; pintarMedidas(); pintarExtras(); pintar(); }); });
  }

  // 3 · extras (los apartados que tiene esa medida en su web)
  function pintarExtras() {
    var x = medida(), n = 3;
    $('[data-cf-extras]').innerHTML = x.comps.map(function (c, i) {
      var ops = c.ops.map(function (o, j) {
        return '<label class="cf-op"><input type="radio" name="cf-c' + i + '" value="' + j + '"' + ((st.extras[i] === j) || (st.extras[i] == null && c.obligatorio && j === 0) ? ' checked' : '') + '>' +
          (o.img ? '<img src="' + o.img + '" alt="" loading="lazy" width="72" height="72">' : '') +
          '<span class="cf-op-txt"><b>' + esc(o.n) + '</b><small>' + (o.precio ? '+ ' + eur(o.precio) : 'Incluido') + '</small></span></label>';
      }).join('');
      var no = c.obligatorio ? '' : '<label class="cf-op cf-op-no"><input type="radio" name="cf-c' + i + '" value="-1"' + (st.extras[i] == null ? ' checked' : '') + '><span class="cf-op-txt"><b>No, gracias</b><small>Sin este extra</small></span></label>';
      return '<section class="cf-paso"><h2><i>' + (n + i) + '</i> ' + esc(c.n) + '</h2>' + (c.ayuda ? '<p class="cf-ayuda">' + esc(c.ayuda) + '</p>' : '') + '<div class="cf-ops">' + no + ops + '</div></section>';
    }).join('');
    $('[data-cf-n-montaje]').textContent = n + x.comps.length;
    x.comps.forEach(function (c, i) {
      if (c.obligatorio && st.extras[i] == null) st.extras[i] = 0;
      $$('input[name="cf-c' + i + '"]').forEach(function (r) { r.addEventListener('change', function () { var v = +r.value; if (v < 0) delete st.extras[i]; else st.extras[i] = v; pintar(); }); });
    });
  }

  function lineas() {
    var m = modelo(), x = medida(), out = [{ n: m.nombre + ' · ' + x.medida, p: x.precio }];
    x.comps.forEach(function (c, i) { var o = c.ops[st.extras[i]]; if (o) out.push({ n: c.n + ': ' + o.n, p: o.precio }); });
    if (st.montaje) out.push({ n: 'Montaje: lo presupuestamos aparte', p: null });
    return out;
  }
  function total() { return lineas().reduce(function (a, l) { return a + (l.p || 0); }, 0); }
  function textoPedido() {
    return 'Hola, me interesa esta caseta configurada en vuestra web:\n' + lineas().map(function (l) { return '· ' + l.n + (l.p ? ' (' + eur(l.p) + ')' : ''); }).join('\n') +
      '\nTotal: ' + eur(total()) + ' IVA incluido\n' + location.href.split('#')[0] + '#' + st.modelo + '-' + st.medida;
  }

  function pintar() {
    var m = modelo(), x = medida(), fotos = x.galeria.length ? x.galeria : [x.img];
    var f = $('[data-cf-foto]'); f.src = fotos[st.foto] || fotos[0]; f.alt = m.nombre + ' ' + x.medida;
    $('[data-cf-foto-pie]').textContent = m.nombre + ' · ' + x.medida;
    $('[data-cf-galeria]').innerHTML = fotos.length > 1 ? fotos.map(function (u, i) { return '<button type="button" class="' + (i === st.foto ? 'activo' : '') + '" data-i="' + i + '" aria-label="Foto ' + (i + 1) + '"><img src="' + u + '" alt="" loading="lazy" width="120" height="90"></button>'; }).join('') : '';
    $$('[data-cf-galeria] button').forEach(function (b) { b.addEventListener('click', function () { st.foto = +b.dataset.i; pintar(); }); });
    $('[data-cf-lineas]').innerHTML = lineas().map(function (l) { return '<li><span>' + esc(l.n) + '</span><b>' + (l.p == null ? '' : l.p ? eur(l.p) : 'incluido') + '</b></li>'; }).join('');
    var t = eur(total()); $('[data-cf-total]').textContent = t; $('[data-cf-total-barra]').textContent = t;
    var ah = $('[data-cf-ahorro]'); if (x.antes) { ah.hidden = false; ah.textContent = 'La caseta está rebajada: antes ' + eur(x.antes) + ', ahora ' + eur(x.precio) + '.'; } else ah.hidden = true;
    $('[data-cf-wa]').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(textoPedido());
    $('[data-cf-ok]').textContent = '';
  }

  $('[data-cf-montaje]').addEventListener('change', function (e) { st.montaje = e.target.checked; pintar(); });
  function alCarrito() {
    var m = modelo(), x = medida(), c = [];
    try { c = JSON.parse(localStorage.getItem(D.clave_cesta) || '[]'); } catch (e) {}
    var extras = lineas().slice(1).map(function (l) { return l.n; });
    c.push({ id: 'config::' + x.pid + '::' + Date.now(), nombre: m.nombre + ' · ' + x.medida + (extras.length ? ' · ' + extras.length + (extras.length > 1 ? ' extras' : ' extra') : ''),
      img: x.img, precio: total().toFixed(2).replace('.', ','), cant: 1, nota: textoPedido() });
    var ok = $('[data-cf-ok]');
    try { localStorage.setItem(D.clave_cesta, JSON.stringify(c)); } catch (e) { ok.textContent = 'Este navegador no deja guardar el carrito. Usa el botón de WhatsApp.'; return; }
    var n = c.reduce(function (a, y) { return a + (y.cant || 1); }, 0);
    $$('[data-cesta-n]').forEach(function (el) { el.textContent = n; el.removeAttribute('hidden'); });
    ok.innerHTML = 'Añadida al carrito con tus extras. <a href="cesta.html">Ver el carrito</a>';
    if (window.innerWidth < 900) ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $('[data-cf-cesta]').addEventListener('click', alCarrito);
  $('[data-cf-cesta-barra]').addEventListener('click', alCarrito);

  // entrada: #modelo o #modelo-pid (desde la ficha de cada caseta)
  var h = decodeURIComponent(location.hash.slice(1)), ini = D.modelos[0].id, pid;
  D.modelos.forEach(function (m) { m.medidas.forEach(function (x) { if (h === m.id + '-' + x.pid || h === String(x.pid)) { ini = m.id; pid = x.pid; } }); if (h === m.id) ini = m.id; });
  elegirModelo(ini, pid);
})();
