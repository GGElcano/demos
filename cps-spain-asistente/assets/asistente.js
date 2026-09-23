/**
 * Widget del asistente para la muestra de CPS Spain (G&G Elcano, 23-sep-2026).
 *
 * Habla con el cerebro del dependiente: POST <api>/chat/cps-spain con {messages} → {reply}.
 * En local usa data-chat-local; publicado, data-chat-api.
 *
 * LA CONVERSACIÓN SE GUARDA EN EL NAVEGADOR DEL VISITANTE (localStorage, 30 días):
 * si minimiza el chat, cambia de ficha o vuelve mañana, sigue donde lo dejó. No es una cookie
 * de rastreo: no se manda a ningún servidor, no identifica a nadie y el propio visitante puede
 * borrarla con "Borrar conversación". En incógnito o con el almacenamiento bloqueado, el chat
 * funciona igual pero sin memoria (todo va dentro de try/catch).
 *
 * El aspa MINIMIZA: guarda el hilo y deja el botón flotante. Solo "Borrar conversación" lo tira.
 */
(function () {
  const raiz = document.querySelector('[data-chat]');
  if (!raiz) return;

  const esLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const API = (esLocal && raiz.dataset.chatLocal) ? raiz.dataset.chatLocal : raiz.dataset.chatApi;
  const SALUDO = raiz.dataset.chatSaludo || 'Hola, ¿en qué te ayudo?';
  const FALLO = raiz.dataset.chatFallback || 'Ahora mismo no puedo contestar.';
  // Una sola conversación para toda la muestra: si pasa de una ficha a otra, el hilo sigue.
  const CLAVE = 'cps-chat';
  const CLAVE_ABIERTO = 'cps-chat-abierto';
  // DEMO: quién ha "iniciado sesión". En la tienda de verdad esto lo dice WooCommerce con un pase
  // firmado por la propia web; aquí es un cliente de ejemplo para que se vea el efecto.
  const CLAVE_CLIENTE = 'cps-chat-cliente';
  const CLIENTE_DEMO = raiz.dataset.chatClienteDemo || 'taller-aranda';
  const CLIENTE_NOMBRE = raiz.dataset.chatClienteNombre || 'Marta · Serigrafía Aranda';
  const DIAS = 30;

  const panel = raiz.querySelector('.chat-panel');
  const lista = raiz.querySelector('.chat-mensajes');
  const form = raiz.querySelector('.chat-form');
  const input = raiz.querySelector('.chat-input');
  const boton = raiz.querySelector('.chat-lanzador');
  const minimizar = raiz.querySelector('.chat-minimizar');
  const borrar = raiz.querySelector('.chat-borrar');
  const sugerencias = document.querySelectorAll('.chat-sugerencia');

  function leeGuardado() {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return [];
      const d = JSON.parse(crudo);
      if (!d || !Array.isArray(d.mensajes)) return [];
      if (d.at && (Date.now() - d.at) > DIAS * 86400000) { localStorage.removeItem(CLAVE); return []; }
      return d.mensajes;
    } catch (e) { return []; }
  }
  function guarda() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ at: Date.now(), mensajes: historial.slice(-30) })); } catch (e) { /* incógnito */ }
  }
  function recuerdaEstado(abierto) {
    try { localStorage.setItem(CLAVE_ABIERTO, abierto ? '1' : '0'); } catch (e) { /* incógnito */ }
  }

  let historial = leeGuardado();
  let pintado = false;
  let cliente = null;
  try { cliente = localStorage.getItem(CLAVE_CLIENTE) || null; } catch (e) { cliente = null; }

  const quien = raiz.querySelector('.chat-quien');
  const sesionBtn = document.querySelectorAll('[data-chat-sesion]');

  function pintaSesion() {
    const dentro = Boolean(cliente);
    raiz.classList.toggle('chat--con-cliente', dentro);
    if (quien) quien.textContent = dentro ? ('Cepe · ' + CLIENTE_NOMBRE) : 'Cepe · asistente de CPS Spain';
    sesionBtn.forEach((b) => {
      b.textContent = dentro ? 'Salir de la cuenta de ejemplo' : 'Entrar como cliente de ejemplo';
      b.classList.toggle('sesion--dentro', dentro);
    });
  }

  function cambiaSesion() {
    cliente = cliente ? null : CLIENTE_DEMO;
    try {
      if (cliente) localStorage.setItem(CLAVE_CLIENTE, cliente);
      else localStorage.removeItem(CLAVE_CLIENTE);
    } catch (e) { /* incógnito */ }
    // Al entrar o salir de la cuenta se empieza conversación limpia: el asistente ya no sabe lo mismo.
    historial = [];
    try { localStorage.removeItem(CLAVE); } catch (e) { /* incógnito */ }
    lista.innerHTML = '';
    pintado = false;
    pintaSesion();
    abrir();
    if (cliente) pinta('assistant', 'Has entrado como ' + CLIENTE_NOMBRE + '. Ahora veo tus pedidos y lo que has comprado: pregúntame por el último pedido, pídeme que te repita una compra o consulta una factura.');
  }

  function pinta(role, texto, extra) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + (role === 'user' ? 'yo' : 'bot') + (extra ? ' ' + extra : '');
    div.textContent = texto;
    lista.appendChild(div);
    lista.scrollTop = lista.scrollHeight;
    return div;
  }

  function separador(texto) {
    const div = document.createElement('div');
    div.className = 'chat-separador';
    div.textContent = texto;
    lista.appendChild(div);
  }

  function pintaTodo() {
    if (pintado) return;
    pintado = true;
    pinta('assistant', cliente ? ('Hola de nuevo, ' + CLIENTE_NOMBRE.split(' ·')[0] + '. Puedo ver tus pedidos y lo que has comprado. ¿Qué necesitas?') : SALUDO);
    if (historial.length) {
      separador('Seguimos donde lo dejaste');
      historial.forEach((m) => pinta(m.role, m.content));
    }
    lista.scrollTop = lista.scrollHeight;
  }

  function abrir() {
    pintaTodo();
    raiz.classList.add('chat--abierto');
    panel.setAttribute('aria-hidden', 'false');
    boton.setAttribute('aria-expanded', 'true');
    boton.textContent = historial.length ? 'Seguir con Cepe' : 'Pregúntale a Cepe';
    recuerdaEstado(true);
    setTimeout(() => input.focus(), 120);
  }

  // Minimizar: se esconde el panel y se guarda todo. La conversación NO se pierde.
  function minimiza() {
    raiz.classList.remove('chat--abierto');
    panel.setAttribute('aria-hidden', 'true');
    boton.setAttribute('aria-expanded', 'false');
    boton.textContent = historial.length ? 'Seguir con Cepe' : 'Pregúntale a Cepe';
    recuerdaEstado(false);
  }

  function borraConversacion() {
    historial = [];
    try { localStorage.removeItem(CLAVE); } catch (e) { /* incógnito */ }
    lista.innerHTML = '';
    pintado = false;
    pintaTodo();
    boton.textContent = 'Pregúntale a Cepe';
    input.focus();
  }

  boton.addEventListener('click', () => (raiz.classList.contains('chat--abierto') ? minimiza() : abrir()));
  sesionBtn.forEach((b) => b.addEventListener('click', cambiaSesion));
  pintaSesion();
  minimizar.addEventListener('click', minimiza);
  if (borrar) borrar.addEventListener('click', borraConversacion);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && raiz.classList.contains('chat--abierto')) minimiza(); });

  sugerencias.forEach((s) => s.addEventListener('click', () => {
    abrir();
    input.value = s.textContent.trim();
    form.dispatchEvent(new Event('submit'));
  }));

  let enviando = false;
  form.addEventListener('submit', async (e) => {
    if (e.preventDefault) e.preventDefault();
    const texto = (input.value || '').trim();
    if (!texto || enviando) return;
    enviando = true;
    input.value = '';
    pinta('user', texto);
    historial.push({ role: 'user', content: texto });
    guarda();
    const esperando = pinta('assistant', 'Escribiendo…', 'chat-msg--esperando');
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial.slice(-14), cliente: cliente || undefined }),
      });
      const d = await r.json();
      esperando.remove();
      const reply = (d && d.reply) || FALLO;
      pinta('assistant', reply);
      historial.push({ role: 'assistant', content: reply });
      guarda();
    } catch (err) {
      esperando.remove();
      pinta('assistant', FALLO);
    } finally {
      enviando = false;
      input.focus();
    }
  });

  // Al cargar la página: si venía abierto (o hay conversación a medias), se abre solo.
  let veniaAbierto = false;
  try { veniaAbierto = localStorage.getItem(CLAVE_ABIERTO) === '1'; } catch (e) { /* incógnito */ }
  if (historial.length) boton.textContent = 'Seguir con Cepe';
  if (veniaAbierto || (raiz.dataset.chatAuto === 'si' && !historial.length)) {
    setTimeout(abrir, veniaAbierto ? 150 : 2000);
  }
})();
