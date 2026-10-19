/* Código compartido por la página en español y la inglesa.
   Cada página define antes VIDEOS (lista de reels) y TXT (textos en su idioma). */

// Reels de Instagram: carrusel vertical; el vídeo se carga solo al tocarlo.
(function(){
  var pista = document.getElementById("reels");
  if(!pista || typeof VIDEOS === "undefined") return;
  var zona = pista.closest(".reels-zona"), nota = document.querySelector(".nota-reels");
  if(!VIDEOS.length){
    if(zona) zona.hidden = true;
    if(nota) nota.hidden = true;
    return;
  }

  var PLAY = '<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>';

  var visor = document.createElement("div");
  visor.className = "visor";
  visor.innerHTML = '<button class="visor-cerrar" aria-label="' + TXT.cerrar + '">&times;</button><div class="visor-caja"></div>';
  document.body.appendChild(visor);
  var caja = visor.querySelector(".visor-caja");
  function cerrar(){ visor.classList.remove("abierto"); caja.innerHTML = ""; document.body.style.overflow = ""; }
  visor.querySelector(".visor-cerrar").addEventListener("click", cerrar);
  visor.addEventListener("click", function(e){ if(e.target === visor) cerrar(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") cerrar(); });

  function abrir(v){
    if(v.archivo){
      caja.innerHTML = '<video src="' + v.archivo + '" controls autoplay playsinline></video>';
    } else {
      var limpio = String(v.instagram).split("?")[0].replace(/\/$/, "");
      caja.innerHTML = '<iframe src="' + limpio + '/embed" allowfullscreen scrolling="no" ' +
                       'allow="autoplay; encrypted-media" title="' + TXT.iframe + '"></iframe>';
    }
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";
  }

  VIDEOS.forEach(function(v){
    var el = document.createElement("div");
    el.className = "reel";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", TXT.ver + (v.pie ? ": " + v.pie : ""));
    var fondo = v.archivo
      ? '<video src="' + v.archivo + '" muted loop playsinline autoplay preload="metadata"' + (v.portada ? ' poster="' + v.portada + '"' : '') + '></video>'
      : '<img src="' + (v.portada || "") + '" alt="' + TXT.ver + ': ' + (v.pie || "Dámaris Toro") + '" loading="lazy">';
    el.innerHTML = fondo +
      '<span class="capa">' + (v.archivo ? "" : PLAY) + '</span>' +
      (v.pie ? '<span class="pie">' + v.pie + '</span>' : '');
    el.addEventListener("click", function(){ abrir(v); });
    el.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); abrir(v); }
    });
    pista.appendChild(el);
  });

  // Flechas de escritorio
  var izq = document.getElementById("reel-izq"), der = document.getElementById("reel-der");
  function paso(){ var p = pista.querySelector(".reel"); return p ? p.offsetWidth + 14 : 260; }
  function estado(){
    var fin = pista.scrollWidth - pista.clientWidth - 4;
    izq.disabled = pista.scrollLeft <= 4;
    der.disabled = pista.scrollLeft >= fin;
  }
  if(izq && der){
    izq.addEventListener("click", function(){ pista.scrollBy({ left: -paso(), behavior: "smooth" }); });
    der.addEventListener("click", function(){ pista.scrollBy({ left:  paso(), behavior: "smooth" }); });
    pista.addEventListener("scroll", estado);
    setTimeout(estado, 60);
  }
})();

// Botón compartir: menú nativo del móvil si existe; si no, copia el enlace.
(function(){
  var btn = document.getElementById("btn-compartir");
  if(!btn) return;
  var aviso = document.createElement("div");
  aviso.className = "toast-compartir";
  aviso.setAttribute("role","status");
  aviso.textContent = TXT.copiado;
  document.body.appendChild(aviso);
  var t;
  function copiado(){
    aviso.classList.add("ver");
    clearTimeout(t);
    t = setTimeout(function(){ aviso.classList.remove("ver"); }, 2200);
  }
  function aMano(){ window.prompt(TXT.copia, location.href); }
  btn.addEventListener("click", function(){
    if(navigator.share){
      navigator.share({ title: document.title, url: location.href }).catch(function(){});
    } else if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(location.href).then(copiado, aMano);
    } else {
      aMano();
    }
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
