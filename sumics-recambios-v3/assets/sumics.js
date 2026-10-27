/* Sumics Parts · maqueta de G&G Elcano
   Buscador al instante, carrito con precios y pago de prueba (todo en este navegador), vitrina del hero, carrusel,
   tapas, selector de dureza, catálogo con filtros, ficha con zoom y chat con Sumi. */
(function () {
  'use strict';
  var d = document, raiz = d.documentElement;
  raiz.classList.add('js');
  var CAT = window.SUMICS_CAT || { productos: [], familias: [] };
  var BASE = d.body.getAttribute('data-base') || '';
  var WA = '34675568839';
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reducido = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var conRaton = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var FLECHA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var EQUIS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var famNombre = {}; CAT.familias.forEach(function (f) { famNombre[f.id] = f.nombre; });
  var porRef = {}; CAT.productos.forEach(function (p) { porRef[p.r] = p; });
  var foto = function (p, grande) {
    var u = grande ? p.i : (p.t || p.i);
    return u ? '<img src="' + esc(u) + '" alt="" loading="lazy" decoding="async" width="600" height="600"' + (p.a === 'contener' ? ' class="contener"' : '') + '>' : '';
  };

  /* Si una foto de sumics-parts.com no llega a la primera (su servidor corta cuando se piden muchas), se reintenta */
  d.addEventListener('error', function (e) {
    var im = e.target;
    if (!im || im.tagName !== 'IMG' || im.getAttribute('data-reintento') || !/sumics-parts\.com/.test(im.src)) return;
    im.setAttribute('data-reintento', '1');
    setTimeout(function () { im.src = im.src.split('?')[0] + '?r=' + Date.now(); }, 1200 + Math.random() * 1200);
  }, true);

  /* ── Carrito (solo en este navegador) ── */
  var CLAVE = 'sumics-carrito-v3';
  var leer = function () { try { var l = JSON.parse(localStorage.getItem(CLAVE)); return Array.isArray(l) ? l.filter(function (x) { return porRef[x.r]; }) : []; } catch (e) { return []; } };
  var unidades = function (l) { return (l || leer()).reduce(function (a, x) { return a + x.n; }, 0); };
  function pintarContadores(bote) {
    var n = unidades();
    $$('[data-presu-n]').forEach(function (el) { el.textContent = n; if (bote) { el.classList.remove('bote'); void el.offsetWidth; el.classList.add('bote'); } });
  }
  function guardar(l, bote) { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) {} pintarContadores(bote !== false); }
  function anadir(ref, n) {
    if (!porRef[ref]) return;
    var l = leer(), x = l.filter(function (y) { return y.r === ref; })[0];
    if (x) x.n = Math.min(999, x.n + n); else l.push({ r: ref, n: n });
    guardar(l);
    avisar('Añadido al carrito: <b>' + esc(ref) + '</b> × ' + n, true);
  }
  pintarContadores(false);

  var aviso, tAviso;
  function avisar(html, conEnlace) {
    if (!aviso) { aviso = d.createElement('div'); aviso.className = 'aviso'; aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite'); d.body.appendChild(aviso); }
    aviso.innerHTML = '<span>' + html + '</span>' + (conEnlace && !d.querySelector('[data-carrito]') ? '<a href="' + BASE + 'carrito.html">Ver carrito</a>' : '');
    requestAnimationFrame(function () { aviso.classList.add('visible'); });
    clearTimeout(tAviso); tAviso = setTimeout(function () { aviso.classList.remove('visible'); }, 3400);
  }

  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-anadir]');
    if (!b) return;
    e.preventDefault();
    var n = 1, sel = b.getAttribute('data-cantidad-de');
    if (sel) { var inp = $(sel); n = Math.max(1, Math.min(999, parseInt(inp && inp.value, 10) || 1)); }
    anadir(b.getAttribute('data-anadir'), n);
    if (b.classList.contains('pieza__mas')) {
      var t = $('span', b), orig = t ? t.textContent : '';
      b.classList.add('hecho'); if (t) t.textContent = 'Añadida';
      setTimeout(function () { b.classList.remove('hecho'); if (t) t.textContent = orig; }, 1600);
    }
  });

  /* Selectores de cantidad (− / +) */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-menos],[data-mas]');
    if (!b) return;
    var i = $('input', b.closest('.cantidad'));
    i.value = Math.max(1, Math.min(999, (parseInt(i.value, 10) || 1) + (b.hasAttribute('data-mas') ? 1 : -1)));
    i.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ── Cabecera ── */
  var cab = $('.cabecera');
  if (cab) {
    var alScroll = function () { cab.classList.toggle('con-sombra', window.scrollY > 40); };
    window.addEventListener('scroll', alScroll, { passive: true }); alScroll();
    var medir = function () { raiz.style.setProperty('--alto-cab', cab.offsetHeight + 'px'); };
    medir(); window.addEventListener('resize', medir);
  }
  $$('[data-lupa]').forEach(function (b) {
    b.addEventListener('click', function () { var c = $('.cab'); c.classList.toggle('busca'); if (c.classList.contains('busca')) $('.cab .buscador input').focus(); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key !== '/' || /INPUT|TEXTAREA|SELECT/.test((d.activeElement || {}).tagName || '')) return;
    var i = $('.cab .buscador input');
    if (i && i.offsetParent) { e.preventDefault(); i.focus(); }
  });

  /* Menú desplegable por familia (se llena al abrirlo) */
  $$('.nav__item[data-fam]').forEach(function (li) {
    var t, mega = $('.mega', li), lleno = false;
    var llenar = function () {
      if (lleno) return; lleno = true;
      var f = li.getAttribute('data-fam');
      var ps = CAT.productos.filter(function (p) { return p.f === f && p.i; }).sort(function (a, b) { return (b.k ? 1 : 0) - (a.k ? 1 : 0); });
      $('.mega__grid', mega).innerHTML = ps.slice(0, 4).map(function (p) {
        return '<a class="mega__pieza" href="' + BASE + 'producto/' + p.s + '.html"><span class="placa">' + foto(p, true) + '</span><b>' + esc(p.n) + '</b><small>' + esc(p.r) + '</small></a>';
      }).join('');
    };
    var abrir = function () { clearTimeout(t); llenar(); $$('.nav__item.abierto').forEach(function (o) { if (o !== li) o.classList.remove('abierto'); }); li.classList.add('abierto'); };
    var cerrar = function () { t = setTimeout(function () { li.classList.remove('abierto'); }, 160); };
    li.addEventListener('mouseenter', abrir); li.addEventListener('mouseleave', cerrar);
    li.addEventListener('focusin', abrir);
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) cerrar(); });
  });

  /* Cajón del móvil */
  var cajon = $('.cajon');
  if (cajon) {
    var alternar = function (abrir) { cajon.classList.toggle('abierto', abrir); cajon.setAttribute('aria-hidden', abrir ? 'false' : 'true'); d.body.style.overflow = abrir ? 'hidden' : ''; };
    $$('[data-cajon]').forEach(function (b) { b.addEventListener('click', function () { alternar(true); }); });
    $$('[data-cajon-cerrar]').forEach(function (b) { b.addEventListener('click', function () { alternar(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') alternar(false); });
  }

  /* ── Buscador al instante ── */
  var normal = function (s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[×*]/g, 'x').replace(/[^a-z0-9.,x\s-]/g, ' ');
  };
  function buscar(q) {
    var t = normal(q).split(/\s+/).filter(Boolean);
    if (!t.length) return [];
    var out = [];
    CAT.productos.forEach(function (p) {
      var h = p._h || (p._h = normal(p.r + ' ' + p.n + ' ' + (famNombre[p.f] || '') + ' ' + (p.u || '') + ' ' + (p.d || '')));
      var nn = p._n || (p._n = normal(p.r + ' ' + p.n));
      var s = 0;
      for (var i = 0; i < t.length; i++) {
        if (h.indexOf(t[i]) < 0) return;
        var k = nn.indexOf(t[i]);
        s += k >= 0 ? 20 - Math.min(k, 30) * 0.3 : 2;
      }
      if (normal(p.r).indexOf(t[0]) === 0 || normal(p.r).replace('su', '').indexOf(t[0]) === 0) s += 100;
      out.push({ p: p, s: s });
    });
    out.sort(function (a, b) { return b.s - a.s || a.p.r.localeCompare(b.p.r, 'es', { numeric: true }); });
    return out.map(function (x) { return x.p; });
  }
  function resaltar(texto, q) {
    var nt = normal(texto), t = normal(q).split(/\s+/).filter(function (x) { return x.length > 1; }), m = [];
    if (nt.length !== texto.length || !t.length) return esc(texto);
    t.forEach(function (k) { var i = nt.indexOf(k); while (i >= 0) { m.push([i, i + k.length]); i = nt.indexOf(k, i + k.length); } });
    if (!m.length) return esc(texto);
    m.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    m.forEach(function (r) {
      var ini = Math.max(r[0], pos);
      if (r[1] <= ini) return;
      out += esc(texto.slice(pos, ini)) + '<mark>' + esc(texto.slice(ini, r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(texto.slice(pos));
  }
  $$('form[data-buscador]').forEach(function (caja) {
    var input = $('input', caja), lista = $('.resultados', caja), activo = -1;
    if (caja.getAttribute('data-buscador') === 'catalogo') { caja.addEventListener('submit', function (e) { e.preventDefault(); input.blur(); }); return; }
    var pintar = function () {
      var q = input.value.trim(); activo = -1;
      if (q.length < 2) { lista.classList.remove('abierto'); lista.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      var r = buscar(q);
      if (!r.length) {
        lista.innerHTML = '<div class="res-vacio">Ninguna referencia coincide con «' + esc(q) + '». <button type="button" data-chat-pregunta="Busco esto: ' + esc(q) + '">Pregúntale a Sumi</button>: te dice qué pieza es o te pide una foto.</div>';
      } else {
        lista.innerHTML = r.slice(0, 6).map(function (p) {
          return '<a class="res" role="option" href="' + BASE + 'producto/' + p.s + '.html"><span class="res__img">' + foto(p) + '</span><span><span class="res__ref">' + resaltar(p.r, q) + '</span><span class="res__nombre">' + resaltar(p.n, q) + '</span></span><span class="res__fam">' + esc(famNombre[p.f] || '') + '</span></a>';
        }).join('') + '<a class="res-todos" href="' + BASE + 'tienda.html#buscar:' + encodeURIComponent(q) + '"><span>' + (r.length === 1 ? 'Ver el resultado en el catálogo' : 'Ver los ' + r.length + ' resultados en el catálogo') + '</span>' + FLECHA + '</a>';
      }
      lista.classList.add('abierto'); input.setAttribute('aria-expanded', 'true');
    };
    input.addEventListener('input', pintar);
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2) pintar(); });
    input.addEventListener('keydown', function (e) {
      var enl = $$('.res', lista);
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && enl.length) {
        e.preventDefault();
        activo = (activo + (e.key === 'ArrowDown' ? 1 : -1) + enl.length) % enl.length;
        enl.forEach(function (a, i) { a.classList.toggle('activo', i === activo); });
      } else if (e.key === 'Escape') { lista.classList.remove('abierto'); }
    });
    caja.addEventListener('submit', function (e) {
      e.preventDefault();
      var enl = $$('.res', lista);
      if (activo >= 0 && enl[activo]) { location.href = enl[activo].href; return; }
      var q = input.value.trim();
      if (q) location.href = BASE + 'tienda.html#buscar:' + encodeURIComponent(q);
    });
    d.addEventListener('click', function (e) { if (!caja.contains(e.target)) lista.classList.remove('abierto'); });
  });
  $$('[data-ejemplo]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $('.buscador--hero input'); if (!i) return;
      i.value = b.getAttribute('data-ejemplo'); i.focus(); i.dispatchEvent(new Event('input'));
    });
  });

  /* ── Revelado al hacer scroll y contadores ── */
  var revs = $$('[data-revelar]');
  if ('IntersectionObserver' in window && !reducido) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revs.forEach(function (el) { io.observe(el); });
  } else revs.forEach(function (el) { el.classList.add('visto'); });

  $$('[data-contar]').forEach(function (el) {
    if (reducido || !('IntersectionObserver' in window)) return;
    var fin = parseInt(el.getAttribute('data-contar'), 10), pre = el.getAttribute('data-pre') || '';
    el.textContent = pre + '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now();
      (function paso(t) {
        var k = Math.min(1, (t - t0) / 1500); k = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(fin * k);
        if (k < 1) requestAnimationFrame(paso);
      })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* ── Vitrina del hero: una pieza tras otra ── */
  var vit = $('.vitrina');
  if (vit) {
    var slides = $$('.vitrina__slide', vit), pasos = $$('.vitrina__pasos button', vit), txt = $('.vitrina__texto', vit);
    var datosV = JSON.parse($('#vitrina-datos').textContent), iV = 0;
    var cargar = function (k) { var im = $('img[data-src]', slides[(k + slides.length) % slides.length]); if (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); } };
    window.addEventListener('load', function () { cargar(1); });
    var irA = function (n) {
      slides[iV].classList.remove('activa');
      iV = (n + slides.length) % slides.length;
      cargar(iV); cargar(iV + 1);
      slides[iV].classList.add('activa');
      pasos.forEach(function (b, k) { b.classList.toggle('hecho', k < iV); b.classList.remove('activa'); b.setAttribute('aria-current', k === iV ? 'true' : 'false'); });
      if (!reducido) { void pasos[iV].offsetWidth; pasos[iV].classList.add('activa'); }
      txt.classList.add('cambia');
      setTimeout(function () {
        var x = datosV[iV];
        $('.ref', txt).textContent = x.r;
        var a = $('.vitrina__nombre', txt); a.textContent = x.n; a.href = x.u;
        $('.vitrina__fam', txt).textContent = x.f;
        var st = $('.stock', txt); st.className = 'stock' + (x.k ? ' stock--si' : ''); st.textContent = x.k ? 'En stock' : 'Bajo consulta';
        txt.classList.remove('cambia');
      }, 320);
    };
    pasos.forEach(function (b, k) {
      b.addEventListener('click', function () { irA(k); });
      if (!reducido) $('i', b).addEventListener('animationend', function () { if (k === iV) irA(iV + 1); });
    });
    if (!reducido) pasos[0].classList.add('activa');
    vit.addEventListener('mouseenter', function () { vit.classList.add('pausada'); });
    vit.addEventListener('mouseleave', function () { vit.classList.remove('pausada'); });
    var marco = $('.vitrina__marco', vit);
    if (!reducido && conRaton) {
      vit.addEventListener('mousemove', function (e) {
        var r = vit.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        marco.style.transform = 'rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      });
      vit.addEventListener('mouseleave', function () { marco.style.transform = ''; });
    }
  }

  /* ── Carruseles ── */
  $$('[data-carrusel]').forEach(function (c) {
    var pista = $('.carrusel__pista', c), prev = $('[data-prev]', c), next = $('[data-next]', c), barra = $('.carrusel__barra span', c);
    var estado = function () {
      var max = pista.scrollWidth - pista.clientWidth;
      if (prev) prev.disabled = pista.scrollLeft < 4;
      if (next) next.disabled = pista.scrollLeft > max - 4;
      if (barra) {
        var w = Math.min(1, pista.clientWidth / pista.scrollWidth);
        barra.style.width = (w * 100) + '%';
        barra.style.transform = 'translateX(' + (max > 0 ? (pista.scrollLeft / max) * (1 / w - 1) * 100 : 0) + '%)';
      }
    };
    if (prev) prev.addEventListener('click', function () { pista.scrollBy({ left: -pista.clientWidth * 0.9, behavior: reducido ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { pista.scrollBy({ left: pista.clientWidth * 0.9, behavior: reducido ? 'auto' : 'smooth' }); });
    pista.addEventListener('scroll', estado, { passive: true });
    window.addEventListener('resize', estado); window.addEventListener('load', estado); estado();
    var x0 = 0, s0 = 0, pulsado = false, movido = false;
    pista.addEventListener('dragstart', function (e) { e.preventDefault(); });
    pista.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; x0 = e.clientX; s0 = pista.scrollLeft; pulsado = true; movido = false; });
    window.addEventListener('pointermove', function (e) {
      if (!pulsado) return;
      var dx = e.clientX - x0;
      if (!movido && Math.abs(dx) > 6) { movido = true; pista.classList.add('arrastrando'); }
      if (movido) pista.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () { if (!pulsado) return; pulsado = false; setTimeout(function () { pista.classList.remove('arrastrando'); }, 0); });
    pista.addEventListener('click', function (e) { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } }, true);
  });

  /* ── Tapas DuraFlex: la fila elegida cambia la foto ── */
  var visor = $('.tapas__visor');
  if (visor) {
    var imgsT = $$('img', visor), filas = $$('.tabla-tapas tbody tr'), iT = 0, tocado = false, enVista = false;
    var activar = function (k) { iT = k; imgsT.forEach(function (im, j) { im.classList.toggle('activa', j === k); }); filas.forEach(function (f, j) { f.classList.toggle('activa', j === k); }); };
    filas.forEach(function (f, k) {
      f.addEventListener('mouseenter', function () { tocado = true; activar(k); });
      f.addEventListener('focusin', function () { tocado = true; activar(k); });
      f.addEventListener('click', function (e) { if (e.target.closest('a')) return; var a = $('a', f); if (a) location.href = a.href; });
    });
    var seccionT = visor.closest('section');
    if (!reducido && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { enVista = es[0].isIntersecting; }).observe(seccionT);
      seccionT.addEventListener('mouseleave', function () { tocado = false; });
      setInterval(function () { if (enVista && !tocado) activar((iT + 1) % filas.length); }, 3200);
    }
  }

  /* ── Perfil hermético: selector de dureza ── */
  var dz = $('.dureza');
  if (dz) {
    var opciones = JSON.parse($('#dureza-datos').textContent), bts = $$('.selector button', dz), info = $('.dureza__info', dz), imD = $('.dureza__panel .placa img', dz), marca = $('.escala__marca', dz);
    var elegir = function (k) {
      var o = opciones[k];
      bts.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      marca.style.left = o.pos + '%';
      info.classList.add('cambia'); imD.style.opacity = 0;
      setTimeout(function () {
        $('h3', info).textContent = o.n;
        $('.dureza__uso', info).textContent = o.uso;
        $('[data-d-ref]', info).textContent = o.r;
        $('[data-d-rollo]', info).textContent = o.rollo;
        $('[data-d-stock]', info).innerHTML = o.k ? '<span class="stock stock--si">En stock</span>' : '<span class="stock">Bajo consulta</span>';
        $('[data-d-ficha]', info).href = o.u;
        $('[data-anadir]', info).setAttribute('data-anadir', o.r);
        $('[data-d-precio]', info).innerHTML = '<b>' + esc(o.pr) + '</b>';
        imD.src = o.i; imD.className = o.a === 'contener' ? 'contener' : '';
        imD.style.opacity = 1; info.classList.remove('cambia');
      }, 260);
    };
    bts.forEach(function (b, k) { b.addEventListener('click', function () { elegir(k); }); });
    marca.style.left = opciones[0].pos + '%';
  }

  /* ── Catálogo: familia, búsqueda, stock, orden y vista ── */
  var catal = $('[data-catalogo]');
  if (catal) {
    var rejilla = $('.rejilla', catal), piezas = $$('.pieza', rejilla), nEl = $('[data-listado-n]', catal), inputQ = $('.buscador--catalogo input', catal);
    var sel = $('.orden', catal), soloStock = $('[data-solo-stock]', catal), activos = $('.activos', catal), vacio = $('.vacio', catal);
    var est = { fam: '', q: '', stock: false, orden: 'familia', vista: 'rejilla' }, tq;
    try { est.vista = localStorage.getItem('sumics-vista') || 'rejilla'; } catch (e) {}
    var leerHash = function () {
      var h = '';
      try { h = decodeURIComponent((location.hash || '').slice(1)); } catch (e) {}
      est.fam = ''; est.q = '';
      if (h.indexOf('buscar:') === 0) est.q = h.slice(7);
      else if (famNombre[h]) est.fam = h;
      inputQ.value = est.q;
    };
    var ponerHash = function () {
      var q = est.q.trim(), h = q ? '#buscar:' + encodeURIComponent(q) : (est.fam ? '#' + est.fam : '');
      history.replaceState(null, '', h || location.pathname);
    };
    var aplicar = function (animar) {
      var q = est.q.trim(), res = q ? buscar(q) : null, orden = {}, vis = [];
      if (res) res.forEach(function (p, k) { orden[p.r] = k; });
      piezas.forEach(function (el) {
        var ok = (!est.fam || el.dataset.fam === est.fam) && (!est.stock || el.dataset.stock === '1') && (!res || el.dataset.ref in orden);
        el.hidden = !ok; if (ok) vis.push(el);
      });
      var cmp = {
        familia: function (a, b) { return res ? orden[a.dataset.ref] - orden[b.dataset.ref] : a.dataset.i - b.dataset.i; },
        ref: function (a, b) { return a.dataset.ref.localeCompare(b.dataset.ref, 'es', { numeric: true }); },
        nombre: function (a, b) { return a.dataset.nombre.localeCompare(b.dataset.nombre, 'es'); },
        stock: function (a, b) { return (b.dataset.stock - a.dataset.stock) || (a.dataset.i - b.dataset.i); }
      }[est.orden];
      vis.sort(cmp);
      vis.forEach(function (el, k) {
        rejilla.appendChild(el);
        if (animar && !reducido) { el.classList.remove('entra'); el.style.setProperty('--i', Math.min(k, 14)); void el.offsetWidth; el.classList.add('entra'); }
      });
      rejilla.appendChild(vacio);
      vacio.hidden = vis.length > 0;
      nEl.textContent = vis.length;
      $('[data-listado-txt]', catal).textContent = vis.length === 1 ? 'referencia' : 'referencias';
      $$('[data-filtro-fam]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filtro-fam') === est.fam ? 'true' : 'false'); });
      var ch = [];
      if (est.fam) ch.push('<button type="button" data-quitar="fam">' + esc(famNombre[est.fam]) + EQUIS + '</button>');
      if (q) ch.push('<button type="button" data-quitar="q">«' + esc(q) + '»' + EQUIS + '</button>');
      if (est.stock) ch.push('<button type="button" data-quitar="stock">Solo en stock' + EQUIS + '</button>');
      activos.innerHTML = ch.join('');
      $('[data-vacio-q]', vacio).textContent = q ? '«' + q + '»' : 'estos filtros';
      var b = $('[data-vacio-sumi]', vacio); if (b) b.setAttribute('data-chat-pregunta', q ? 'Busco esto: ' + q : 'No encuentro la pieza que necesito, ¿me ayudas?');
    };
    $$('[data-filtro-fam]').forEach(function (b) {
      b.addEventListener('click', function () {
        est.fam = b.getAttribute('data-filtro-fam'); est.q = ''; inputQ.value = '';
        ponerHash(); aplicar(true);
        var top = rejilla.getBoundingClientRect().top + window.scrollY - (cab ? cab.offsetHeight : 0) - 90;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reducido ? 'auto' : 'smooth' });
      });
    });
    inputQ.addEventListener('input', function () { est.q = inputQ.value; aplicar(false); clearTimeout(tq); tq = setTimeout(ponerHash, 450); });
    soloStock.addEventListener('change', function () { est.stock = soloStock.checked; aplicar(true); });
    sel.addEventListener('change', function () { est.orden = sel.value; aplicar(true); });
    var pintarVista = function () {
      rejilla.classList.toggle('lista', est.vista === 'lista');
      $$('[data-vista]', catal).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-vista') === est.vista ? 'true' : 'false'); });
    };
    $$('[data-vista]', catal).forEach(function (b) {
      b.addEventListener('click', function () { est.vista = b.getAttribute('data-vista'); try { localStorage.setItem('sumics-vista', est.vista); } catch (e) {} pintarVista(); aplicar(true); });
    });
    activos.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quitar]'); if (!b) return;
      var k = b.getAttribute('data-quitar');
      if (k === 'fam') est.fam = ''; if (k === 'q') { est.q = ''; inputQ.value = ''; } if (k === 'stock') { est.stock = false; soloStock.checked = false; }
      ponerHash(); aplicar(true);
    });
    window.addEventListener('hashchange', function () { leerHash(); aplicar(true); });
    leerHash(); pintarVista(); aplicar(false);
  }

  /* ── Ficha: galería con zoom y copiar referencia ── */
  var gal = $('.galeria');
  if (gal) {
    var princ = $('.galeria__principal', gal), pim = $('img', princ), mins = $$('.galeria__miniaturas button', gal);
    mins.forEach(function (b) {
      b.addEventListener('click', function () {
        mins.forEach(function (x) { x.setAttribute('aria-current', x === b ? 'true' : 'false'); });
        pim.style.opacity = 0;
        setTimeout(function () { pim.src = b.getAttribute('data-src'); pim.className = b.getAttribute('data-ajuste') === 'contener' ? 'contener' : ''; pim.style.opacity = 1; }, 160);
      });
    });
    if (conRaton && pim) {
      princ.addEventListener('mousemove', function (e) {
        var r = princ.getBoundingClientRect();
        pim.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
      });
      princ.addEventListener('mouseenter', function () { princ.classList.add('zoom'); });
      princ.addEventListener('mouseleave', function () { princ.classList.remove('zoom'); });
    }
  }
  $$('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copiar'), ok = function () { b.textContent = 'Referencia copiada'; setTimeout(function () { b.textContent = 'Copiar referencia'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, ok); else ok();
    });
  });
  if ($('.barra-movil')) d.body.classList.add('con-barra');

  /* ── Carrito ── */
  var euros = function (c) {
    if (c == null) return 'Consultar';
    var ent = Math.floor(c / 100), dec = c % 100;
    return String(ent).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + (dec < 10 ? '0' : '') + dec + ' €';
  };
  var subtotal = function (l) { return (l || leer()).reduce(function (a, x) { var p = porRef[x.r]; return a + (p && p.p ? p.p * x.n : 0); }, 0); };
  var pintarTotales = function (cont) {
    var l = leer(), s = subtotal(l);
    $$('[data-subtotal]', cont).forEach(function (el) { el.textContent = euros(s); });
    $$('[data-total]', cont).forEach(function (el) { el.textContent = euros(s); });
    $$('[data-total-boton]', cont).forEach(function (el) { el.textContent = '· ' + euros(s); });
    return l;
  };

  var pz = $('[data-carrito]');
  if (pz) {
    var listaP = $('[data-presu-lista]', pz), vacioP = $('.presu__vacio', pz), cabP = $('.presu__cab', pz), irPago = $('[data-ir-pago]', pz);
    var actualizar = function () {
      var l = pintarTotales(pz), hay = l.length > 0;
      $('[data-presu-total]', pz).textContent = l.length + (l.length === 1 ? ' referencia' : ' referencias') + ' · ' + unidades(l) + ' uds.';
      irPago.setAttribute('aria-disabled', hay ? 'false' : 'true'); irPago.style.pointerEvents = hay ? '' : 'none'; irPago.style.opacity = hay ? '' : '.4';
      l.forEach(function (x) { var t = $('.linea-presu[data-r="' + x.r + '"] [data-linea-total]', listaP); if (t) t.textContent = euros(porRef[x.r].p * x.n); });
    };
    var pintarP = function () {
      var l = leer();
      listaP.innerHTML = l.map(function (x) {
        var p = porRef[x.r], u = BASE + 'producto/' + p.s + '.html';
        return '<div class="linea-presu linea-carrito" data-r="' + esc(p.r) + '"><a class="placa" href="' + u + '" tabindex="-1" aria-hidden="true">' + foto(p) + '</a><div><span class="ref">' + esc(p.r) + '</span><a href="' + u + '">' + esc(p.n) + '</a><small class="linea-carrito__ud">' + euros(p.p) + ' / ud.</small></div><div class="cantidad"><button type="button" data-menos aria-label="Una menos">−</button><input type="number" inputmode="numeric" min="1" max="999" value="' + x.n + '" aria-label="Cantidad de ' + esc(p.r) + '"><button type="button" data-mas aria-label="Una más">+</button></div><b class="linea-carrito__total" data-linea-total>' + euros(p.p * x.n) + '</b><button class="quitar" type="button" data-quitar-r="' + esc(p.r) + '" aria-label="Quitar ' + esc(p.r) + '">' + EQUIS + '</button></div>';
      }).join('');
      var hay = l.length > 0;
      vacioP.hidden = hay; listaP.hidden = !hay; cabP.hidden = !hay;
      actualizar();
    };
    listaP.addEventListener('change', function (e) {
      var i = e.target; if (i.tagName !== 'INPUT') return;
      var r = i.closest('.linea-presu').getAttribute('data-r'), l = leer();
      l.forEach(function (x) { if (x.r === r) x.n = Math.max(1, Math.min(999, parseInt(i.value, 10) || 1)); });
      guardar(l); actualizar();
    });
    listaP.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quitar-r]'); if (!b) return;
      var r = b.getAttribute('data-quitar-r');
      guardar(leer().filter(function (x) { return x.r !== r; })); pintarP();
    });
    $('[data-vaciar]', pz).addEventListener('click', function () { guardar([]); pintarP(); });
    pintarP();
  }

  /* ── Pago de prueba: nada sale del navegador ── */
  var pg = $('[data-pago]');
  if (pg) {
    var formP = $('[data-pago-form]', pg), resumenL = $('[data-resumen-lineas]', pg), errorP = $('[data-pago-error]', pg), hecho = $('[data-pedido-hecho]', pg), asideP = $('.resumen', pg);
    var pintarResumen = function () {
      var l = pintarTotales(pg);
      resumenL.innerHTML = l.length ? l.map(function (x) {
        var p = porRef[x.r];
        return '<div class="resumen__linea"><span><span class="ref">' + esc(p.r) + '</span> ' + esc(p.n) + ' <small>× ' + x.n + '</small></span><b>' + euros(p.p * x.n) + '</b></div>';
      }).join('') : '<p class="formulario__nota">El carrito está vacío. <a href="' + BASE + 'tienda.html">Ir al catálogo</a></p>';
      return l;
    };
    pintarResumen();
    formP.addEventListener('submit', function (e) {
      e.preventDefault();
      var l = leer();
      if (!l.length) { errorP.textContent = 'El carrito está vacío: añade alguna pieza antes de pagar.'; errorP.hidden = false; return; }
      var mal = $$('[required]', formP).filter(function (c) { return c.type === 'checkbox' ? !c.checked : !c.value.trim() || (c.checkValidity && !c.checkValidity()); });
      $$('[required]', formP).forEach(function (c) { if (mal.indexOf(c) > -1) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid'); });
      if (mal.length) {
        errorP.textContent = mal[0].type === 'checkbox' ? 'Falta aceptar las condiciones de venta.' : 'Revisa los campos marcados: falta alguno o no está bien escrito.';
        errorP.hidden = false; mal[0].focus(); return;
      }
      errorP.hidden = true;
      guardar([], false);
      formP.hidden = true; asideP.hidden = true; hecho.hidden = false; hecho.focus();
      window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
    });
  }

  /* ── Chat con Sumi ── */
  var panel = $('.chat');
  if (panel) {
    var API = panel.getAttribute('data-chat-api'), msgs = $('[data-chat-msgs]', panel), form = $('[data-chat-form]', panel), input = $('[data-chat-input]', panel), enviar = $('[data-chat-enviar]', panel), dock = $('.dock');
    var historial = [], ocupado = false, saludado = false;
    var formatear = function (t) {
      var h = esc(t);
      h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      h = h.replace(/(https?:\/\/[^\s)<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 44) + (u.length > 52 ? '…' : '') + '</a>'; });
      return h;
    };
    var pintarMsg = function (rol, texto, extra) {
      var el = d.createElement('div');
      el.className = 'msg msg--' + rol + (extra ? ' ' + extra : '');
      el.innerHTML = rol === 'yo' ? esc(texto) : formatear(texto);
      msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; return el;
    };
    var abrirChat = function () {
      panel.classList.add('abierto'); panel.setAttribute('aria-hidden', 'false');
      if (dock) dock.classList.add('oculto');
      if (!saludado) { saludado = true; pintarMsg('bot', panel.getAttribute('data-chat-saludo')); }
      setTimeout(function () { input.focus(); }, 350);
    };
    var cerrarChat = function () { panel.classList.remove('abierto'); panel.setAttribute('aria-hidden', 'true'); if (dock) dock.classList.remove('oculto'); };
    var preguntar = function (texto) {
      texto = (texto || '').trim(); if (!texto || ocupado) return;
      abrirChat(); pintarMsg('yo', texto); historial.push({ role: 'user', content: texto }); input.value = ''; ocupado = true; enviar.disabled = true;
      var pensando = pintarMsg('bot', 'Un momento, lo miro…', 'msg--pensando');
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: historial }) })
        .then(function (r) { return r.json(); })
        .then(function (dd) { var reply = dd.reply || dd.error || panel.getAttribute('data-chat-fallback'); pensando.remove(); pintarMsg('bot', reply); historial.push({ role: 'assistant', content: reply }); })
        .catch(function () { pensando.remove(); pintarMsg('bot', panel.getAttribute('data-chat-fallback')); })
        .then(function () { ocupado = false; enviar.disabled = false; input.focus(); });
    };
    form.addEventListener('submit', function (e) { e.preventDefault(); preguntar(input.value); });
    d.addEventListener('click', function (e) {
      var a = e.target.closest('[data-chat-abrir]'); if (a) { e.preventDefault(); abrirChat(); return; }
      var c = e.target.closest('[data-chat-cerrar]'); if (c) { cerrarChat(); return; }
      var p = e.target.closest('[data-chat-pregunta]'); if (p) { e.preventDefault(); preguntar(p.getAttribute('data-chat-pregunta')); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) cerrarChat(); });
  }
})();
