// 01 Informática y Gestión — interacciones compartidas
(function(){
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menú móvil
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mmClose = document.getElementById('mmClose');
  function closeMenu(){ if(hamburger) hamburger.classList.remove('active'); if(mobileMenu) mobileMenu.classList.remove('open'); }
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function(){
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    if (mmClose) mmClose.addEventListener('click', closeMenu);
    Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function(a){
      a.addEventListener('click', closeMenu);
    });
  }

  // Animaciones de entrada
  var faders = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    faders.forEach(function(el){ io.observe(el); });
  } else {
    faders.forEach(function(el){ el.classList.add('visible'); });
  }

  // Destacar el día de hoy en la tabla de horarios (si existe)
  function highlightToday(){
    var rows = document.querySelectorAll('[data-dia]');
    if (!rows.length) return;
    var hoy = String(new Date().getDay());
    Array.prototype.forEach.call(rows, function(r){
      if (r.getAttribute('data-dia') === hoy) r.classList.add('horario-hoy');
    });
  }
  highlightToday();

  // Cursor decorativo (escritorio)
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var rx = 0, ry = 0, dx = 0, dy = 0;
    window.addEventListener('mousemove', function(e){
      dx = e.clientX; dy = e.clientY;
      cursorDot.style.left = dx + 'px';
      cursorDot.style.top = dy + 'px';
    });
    function ring(){
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top = ry + 'px';
      requestAnimationFrame(ring);
    }
    ring();
    Array.prototype.forEach.call(document.querySelectorAll('a,button,.disc-card,.cat-card'), function(el){
      el.addEventListener('mouseenter', function(){ cursorRing.classList.add('hovering'); });
      el.addEventListener('mouseleave', function(){ cursorRing.classList.remove('hovering'); });
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }
})();
