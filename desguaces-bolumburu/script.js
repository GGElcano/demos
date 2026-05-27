// ============================================================
// Desguaces Bolumburu — interacciones
// ============================================================

// Año en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Header scrolled
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Burger menu (mobile)
const burger = document.getElementById('burger');
burger.addEventListener('click', () => header.classList.toggle('nav-open'));
header.querySelectorAll('.nav a').forEach(a =>
  a.addEventListener('click', () => header.classList.remove('nav-open'))
);

// Día actual destacado en horario
function highlightToday() {
  const today = new Date().getDay(); // 0 dom, 1 lun ... 6 sab
  document.querySelectorAll('.hours tr').forEach(tr => {
    if (Number(tr.dataset.day) === today) tr.classList.add('horario-hoy');
  });
}
highlightToday();

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.section, .service, .floating-card, .hours-card, .contact-form').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// Formulario — demo: validamos y mostramos mensaje (sin backend)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  note.hidden = false;
  form.querySelector('button[type="submit"]').textContent = 'Mensaje preparado ✓';
  form.querySelector('button[type="submit"]').disabled = true;
});
