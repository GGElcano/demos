/* ============================================================
   Selector de variaciones en un paso — David Farré
   Los textos llegan desde cada página en la variable T (traducciones)
   y la estructura del producto en PRODUCTO. La lógica es la misma
   para los tres idiomas.
   ============================================================ */

var sel = { color:null, composicion:null, talla:null };
var recientes = [];

function nombreDe(ejeId, valor){
  if (ejeId === 'talla') return valor;
  return T.opciones[valor] || valor;
}

/* ¿Existe alguna combinación que cumpla estos filtros? */
function hayCombinacion(filtros){
  return PRODUCTO.combinaciones.some(function(c){
    for (var k in filtros){ if (filtros[k] && c[k] !== filtros[k]) return false; }
    return true;
  });
}

/* ¿Se puede elegir este valor manteniendo lo ya elegido en los OTROS ejes? */
function compatible(ejeId, valor){
  var f = {};
  for (var k in sel){ if (k !== ejeId && sel[k]) f[k] = sel[k]; }
  f[ejeId] = valor;
  return hayCombinacion(f);
}

/* ¿Este valor existe en ALGUNA combinación? (las tallas 44 y 46 no) */
function existeAlguna(ejeId, valor){
  var f = {}; f[ejeId] = valor;
  return hayCombinacion(f);
}

/* Al pulsar una opción incompatible se reancla alrededor de ella
   en vez de dejar al comprador en un callejón sin salida. */
function elegir(ejeId, valor){
  if (!existeAlguna(ejeId, valor)) return;

  if (sel[ejeId] === valor){ sel[ejeId] = null; }
  else { sel[ejeId] = valor; }

  recientes = recientes.filter(function(x){ return x !== ejeId; });
  if (sel[ejeId]) recientes.unshift(ejeId);

  if (sel[ejeId] && !hayCombinacion(sel)){
    var conservados = {}; conservados[ejeId] = sel[ejeId];
    recientes.forEach(function(otro){
      if (otro === ejeId || !sel[otro]) return;
      var prueba = {}; for (var k in conservados) prueba[k] = conservados[k];
      prueba[otro] = sel[otro];
      if (hayCombinacion(prueba)) conservados[otro] = sel[otro];
    });
    for (var k2 in sel){ sel[k2] = conservados[k2] || null; }
  }
  pintar();
}

function pintar(){
  var cont = document.getElementById('vistaNueva');
  cont.innerHTML = '';

  PRODUCTO.ejes.forEach(function(eje){
    var bloque = document.createElement('div');
    bloque.className = 'eje';

    var cab = document.createElement('div');
    cab.className = 'eje-cab';
    var h = document.createElement('h3'); h.textContent = T.ejes[eje.id];
    var el = document.createElement('span'); el.className = 'elegido';
    el.textContent = sel[eje.id] ? nombreDe(eje.id, sel[eje.id]) : '';
    cab.appendChild(h); cab.appendChild(el);
    bloque.appendChild(cab);

    var fila = document.createElement('div');
    fila.className = 'opciones';

    eje.opciones.forEach(function(valor){
      var b = document.createElement('button');
      var puede = compatible(eje.id, valor);
      var existe = existeAlguna(eje.id, valor);

      b.className = 'op ' + (eje.tipo === 'muestra' ? 'op-muestra' : 'op-texto');
      if (sel[eje.id] === valor) b.className += ' on';
      else if (!existe) b.className += ' muerta no';
      else if (!puede) b.className += ' no';

      if (eje.tipo === 'muestra'){
        b.innerHTML = '<span class="piel piel-' + valor + '"></span><span class="nombre">' +
                      nombreDe(eje.id, valor) + '</span>';
      } else {
        b.textContent = nombreDe(eje.id, valor);
      }

      var etiqueta = T.ejes[eje.id] + ' ' + nombreDe(eje.id, valor);
      if (!existe) etiqueta += ', ' + T.aria.noDisponible;
      else if (!puede) etiqueta += ', ' + T.aria.noSeFabrica;
      b.setAttribute('aria-label', etiqueta);
      b.setAttribute('aria-pressed', sel[eje.id] === valor ? 'true' : 'false');
      if (!existe) b.setAttribute('disabled', 'disabled');

      b.addEventListener('click', function(){ elegir(eje.id, valor); });
      fila.appendChild(b);
    });

    bloque.appendChild(fila);
    cont.appendChild(bloque);
  });

  actualizarEstado();
  sincronizarViejo();
}

function actualizarEstado(){
  var caja = document.getElementById('estado');
  var btn = document.getElementById('btnComprar');

  /* Modo "como está hoy": lo único que se puede elegir es la talla.
     El color y la piel no son elegibles, así que el pedido entra sin ellos. */
  if (!modoNuevoActivo){
    caja.className = 'estado';
    if (sel.talla){
      caja.innerHTML = T.estado.soloTalla.replace('{talla}', '<b>' + sel.talla + '</b>');
      btn.disabled = false;
      btn.innerHTML = T.boton.cesta + ' &middot; ' + PRODUCTO.precio + ' &euro;';
    } else {
      caja.innerHTML = T.estado.eligeTalla;
      btn.disabled = true;
      btn.innerHTML = T.boton.cesta;
    }
    return;
  }

  var faltan = [];
  PRODUCTO.ejes.forEach(function(e){ if (!sel[e.id]) faltan.push(T.ejesMinuscula[e.id]); });

  if (faltan.length === 0){
    caja.className = 'estado';
    caja.innerHTML = T.estado.disponible
      .replace('{combinacion}', '<b>' + nombreDe('color', sel.color) + ' &middot; ' +
               nombreDe('composicion', sel.composicion) + ' &middot; ' +
               T.ejesMinuscula.talla + ' ' + sel.talla + '</b>');
    btn.disabled = false;
    btn.innerHTML = T.boton.cesta + ' &middot; ' + PRODUCTO.precio + ' &euro;';
  } else {
    caja.className = 'estado';
    caja.innerHTML = (faltan.length === PRODUCTO.ejes.length)
      ? T.estado.elegirTodo
      : T.estado.falta.replace('{que}', '<b>' + faltan.join('</b> ' + T.y + ' <b>') + '</b>');
    btn.disabled = true;
    btn.innerHTML = T.boton.cesta;
  }
}

/* ---------- MODO VIEJO: tres desplegables encadenados ---------- */
function opcionesPara(ejeId, filtros){
  var eje = PRODUCTO.ejes.filter(function(e){ return e.id === ejeId; })[0];
  return eje.opciones.filter(function(valor){
    var f = {}; for (var k in filtros){ if (filtros[k]) f[k] = filtros[k]; }
    f[ejeId] = valor;
    return hayCombinacion(f);
  });
}

function rellenar(selectEl, ejeId, filtros, textoVacio){
  selectEl.innerHTML = '';
  var v = document.createElement('option');
  v.value = ''; v.textContent = textoVacio;
  selectEl.appendChild(v);
  opcionesPara(ejeId, filtros).forEach(function(valor){
    var o = document.createElement('option');
    o.value = valor; o.textContent = nombreDe(ejeId, valor);
    selectEl.appendChild(o);
  });
  selectEl.value = sel[ejeId] || '';
}

/* En la web actual el único desplegable es el de la talla:
   el color y la piel no se pueden elegir. */
function sincronizarViejo(){
  rellenar(document.getElementById('selTalla'), 'talla', {}, T.selects.eligeTalla);
}

function cambioViejo(ejeId, valor){
  sel[ejeId] = valor || null;
  recientes = sel.talla ? ['talla'] : [];
  pintar();
}

/* ---------- conmutador de modos ---------- */
var modoNuevoActivo = true;

function modo(nuevo){
  modoNuevoActivo = nuevo;
  /* Al pasar al modo actual se sueltan color y piel: allí no son elegibles. */
  if (!nuevo){
    sel.color = null; sel.composicion = null;
    if (sel.talla && !existeAlguna('talla', sel.talla)) sel.talla = null;
    recientes = sel.talla ? ['talla'] : [];
  }
  document.getElementById('vistaNueva').hidden = !nuevo;
  document.getElementById('vistaVieja').hidden = nuevo;
  document.getElementById('modoNuevo').classList.toggle('on', nuevo);
  document.getElementById('modoViejo').classList.toggle('on', !nuevo);
  document.getElementById('modoNuevo').setAttribute('aria-selected', nuevo ? 'true' : 'false');
  document.getElementById('modoViejo').setAttribute('aria-selected', nuevo ? 'false' : 'true');
  document.getElementById('modosPie').textContent = nuevo ? T.pie.nuevo : T.pie.viejo;
  pintar();
}

/* ---------- galería ---------- */
function montarGaleria(){
  var tiras = document.getElementById('tiras');
  var grande = document.getElementById('fotoGrande');
  PRODUCTO.fotos.forEach(function(src, i){
    var b = document.createElement('button');
    b.setAttribute('aria-label', T.aria.verFoto + ' ' + (i + 1));
    if (i === 0) b.className = 'on';
    var img = document.createElement('img');
    img.src = src;
    img.alt = T.aria.altFoto + ' ' + (i + 1);
    img.loading = 'lazy';
    b.appendChild(img);
    b.addEventListener('click', function(){
      grande.src = src;
      Array.prototype.forEach.call(tiras.children, function(x){ x.classList.remove('on'); });
      b.classList.add('on');
    });
    tiras.appendChild(b);
  });
}

/* ---------- arranque ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('modoNuevo').addEventListener('click', function(){ modo(true); });
document.getElementById('modoViejo').addEventListener('click', function(){ modo(false); });
document.getElementById('selTalla').addEventListener('change', function(e){ cambioViejo('talla', e.target.value); });
montarGaleria();
pintar();

var hamburger = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');
var mmClose = document.getElementById('mmClose');
function closeMenu(){ hamburger.classList.remove('active'); mobileMenu.classList.remove('open'); }
hamburger.addEventListener('click', function(){ hamburger.classList.toggle('active'); mobileMenu.classList.toggle('open'); });
mmClose.addEventListener('click', closeMenu);
Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function(a){ a.addEventListener('click', closeMenu); });
