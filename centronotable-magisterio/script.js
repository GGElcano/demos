/* Notable Formación · Magisterio — interacciones */
(function () {
  "use strict";

  /* ---- Nav: sombra al scroll + menú móvil ---- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".burger");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---- Marquee: duplicar contenido para loop continuo ---- */
  document.querySelectorAll(".marquee__track").forEach(function (tr) {
    tr.innerHTML += tr.innerHTML;
  });

  /* ---- Contadores ---- */
  var counters = document.querySelectorAll("[data-count]");
  function animate(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (target % 1 !== 0) ? 1 : 0;
    var start = null, dur = 1500;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick); else el.firstChild.nodeValue = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) {
      if (!el.firstChild || el.firstChild.nodeType !== 3) el.insertBefore(document.createTextNode("0"), el.firstChild || null);
      cio.observe(el);
    });
  }

  /* ---- Horario: resaltar el día de hoy (1=Lun..7=Dom) ---- */
  (function () {
    var rows = document.querySelectorAll(".schedule tr[data-day]");
    if (!rows.length) return;
    var js = new Date().getDay();
    var today = js === 0 ? 7 : js;
    rows.forEach(function (tr) {
      if (parseInt(tr.getAttribute("data-day"), 10) === today) tr.classList.add("horario-hoy");
    });
  })();

  /* ---- Formulario (demo: sin backend) ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var note = form.querySelector(".formnote");
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = "Solicitar información"; }
        if (note) {
          note.innerHTML = "✓ <b>¡Gracias!</b> Hemos recibido tu solicitud. Te contactaremos muy pronto. <span style='opacity:.7'>(Demo: el envío real se conectará al email/CRM del centro.)</span>";
          note.style.color = "var(--magenta)";
        }
      }, 700);
    });
  }

  /* ---- Año ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
