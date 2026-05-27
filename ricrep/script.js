// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Header scrolled
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Burger menu
const burger = document.getElementById('burger');
burger.addEventListener('click', () => header.classList.toggle('nav-open'));
header.querySelectorAll('.nav a').forEach(a =>
  a.addEventListener('click', () => header.classList.remove('nav-open'))
);

// Día actual en horario
function highlightToday() {
  const today = new Date().getDay();
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
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
document.querySelectorAll('.section, .service, .aud, .process li, .hours-card, .contact-form, .coverage-card').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// Formulario (demo, sin backend)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  note.hidden = false;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Solicitud enviada ✓';
  btn.disabled = true;
});
