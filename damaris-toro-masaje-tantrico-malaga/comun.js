/* Código compartido por todas las páginas (español e inglés).
   El idioma sale de <html lang>. */
var EN_PAG = /^en/i.test(document.documentElement.lang || "");
var TXT = EN_PAG
  ? { ver: "Watch the video", cerrar: "Close", iframe: "Instagram video", copiado: "Link copied", copia: "Copy the link:", menu: "Menu", cerrarMenu: "Close menu" }
  : { ver: "Ver el vídeo", cerrar: "Cerrar", iframe: "Vídeo de Instagram", copiado: "Enlace copiado", copia: "Copia el enlace:", menu: "Menú", cerrarMenu: "Cerrar menú" };

var anio = document.getElementById("anio");
if(anio) anio.textContent = String(new Date().getFullYear());

// Menú del móvil
(function(){
  var btn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
  if(!btn || !menu) return;
  btn.addEventListener("click", function(){
    var abierto = menu.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    btn.setAttribute("aria-label", abierto ? TXT.cerrarMenu : TXT.menu);
  });
  menu.addEventListener("click", function(e){
    if(e.target.closest("a")){ menu.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false"); }
  });
})();

// WhatsApp flotante: se esconde mientras se ve un botón grande de WhatsApp (en el móvil se pisaban)
(function(){
  var flota = document.querySelector(".wa-flota"), grandes = document.querySelectorAll(".hero .acciones, .cierre .acciones");
  if(!flota || !grandes.length || !("IntersectionObserver" in window)) return;
  var vistos = new Set();
  var io = new IntersectionObserver(function(en){
    en.forEach(function(e){ if(e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
    flota.classList.toggle("oculta", vistos.size > 0);
  });
  grandes.forEach(function(g){ io.observe(g); });
})();

// Cambio de página suave en navegadores sin fundido propio (el resto lo hace solo, ver dinamico.css)
(function(){
  if("onpagereveal" in window) return;
  var raiz = document.documentElement;
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a[href]");
    if(!a || a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    var url = new URL(a.href, location.href);
    if(url.origin !== location.origin || url.hash && url.pathname === location.pathname || !/(\/|\.html)$/.test(url.pathname)) return;
    e.preventDefault();
    raiz.classList.add("saliendo");
    setTimeout(function(){ location.href = a.href; }, 280);
  });
  // al volver con «atrás» la página sale de la memoria del navegador aún desvanecida
  addEventListener("pageshow", function(){ raiz.classList.remove("saliendo"); });
})();

// Visor de vídeos: cualquier elemento con data-video (enlace de Instagram o un .mp4 propio).
// El vídeo de Instagram NO se carga hasta que el visitante lo toca (sin cookies de terceros antes).
(function(){
  var lanzadores = document.querySelectorAll("[data-video]");
  if(!lanzadores.length) return;
  var visor = document.createElement("div");
  visor.className = "visor";
  visor.innerHTML = '<button class="visor-cerrar" aria-label="' + TXT.cerrar + '">&times;</button><div class="visor-caja"></div>';
  document.body.appendChild(visor);
  var caja = visor.querySelector(".visor-caja");
  function cerrar(){ visor.classList.remove("abierto"); caja.innerHTML = ""; document.body.style.overflow = ""; }
  visor.querySelector(".visor-cerrar").addEventListener("click", cerrar);
  visor.addEventListener("click", function(e){ if(e.target === visor) cerrar(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") cerrar(); });

  function abrir(url){
    if(/\.mp4$/i.test(url)){
      caja.innerHTML = '<video src="' + url + '" controls autoplay playsinline></video>';
    } else {
      var limpio = String(url).split("?")[0].replace(/\/$/, "");
      caja.innerHTML = '<iframe src="' + limpio + '/embed" allowfullscreen scrolling="no" ' +
                       'allow="autoplay; encrypted-media" title="' + TXT.iframe + '"></iframe>';
    }
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";
  }
  lanzadores.forEach(function(el){
    el.addEventListener("click", function(){ abrir(el.getAttribute("data-video")); });
  });
})();

// Blog: filtros por tipo de entrada (reflexiones, talleres, eventos)
(function(){
  var filtros = document.querySelectorAll(".filtros button");
  if(!filtros.length) return;
  var entradas = document.querySelectorAll(".entrada"), vacio = document.querySelector(".vacio");
  filtros.forEach(function(b){
    b.addEventListener("click", function(){
      var cat = b.getAttribute("data-cat"), hay = 0;
      filtros.forEach(function(o){ o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      entradas.forEach(function(e){
        var ver = cat === "todo" || (" " + e.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") >= 0;
        e.hidden = !ver;
        if(ver) hay++;
      });
      if(vacio) vacio.hidden = hay > 0;
      if(window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });
})();

// Aparición suave al bajar. Sin librerías.
(function(){
  var els = document.querySelectorAll(".rv");
  if(!("IntersectionObserver" in window)){
    for(var i=0;i<els.length;i++) els[i].classList.add("visible");
    return;
  }
  var io = new IntersectionObserver(function(entradas){
    entradas.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add("visible"); io.unobserve(en.target); }
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:.08});
  els.forEach(function(e){ io.observe(e); });
})();

// Vídeo de fondo de la portada: se mueve siempre (aunque el sistema pida menos movimiento) y
// tiene botón de pausa. Solo arranca parado si la visita pulsó «Reducir animaciones» en el pie.
(function(){
  var v = document.querySelector(".hero__video"); if(!v) return;
  var fondo = v.parentNode, b = document.querySelector(".hero__pausa");
  var quieto = false; try { quieto = localStorage.getItem("dt-quieto") === "1"; } catch(e){}
  var L = EN_PAG ? ["Pause the background video", "Play the background video"] : ["Pausar el vídeo de fondo", "Reproducir el vídeo de fondo"];
  function marcar(parado){ if(!b) return; b.setAttribute("aria-pressed", parado ? "true" : "false"); b.setAttribute("aria-label", parado ? L[1] : L[0]); }
  function arrancar(){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
  v.muted = true;
  v.addEventListener("playing", function(){ fondo.classList.add("en-marcha"); });
  if(!v.paused && v.currentTime > 0) fondo.classList.add("en-marcha");
  if(quieto){ v.removeAttribute("autoplay"); v.pause(); marcar(true); } else { arrancar(); marcar(false); }
  if(b) b.addEventListener("click", function(){ if(v.paused){ arrancar(); marcar(false); } else { v.pause(); marcar(true); } });
})();
