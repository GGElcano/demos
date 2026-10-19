/* ──────────────────────────────────────────────────────────────
   GG Elcano · Banner de cookies (AEPD 2023 + LSSICE art. 22.2)
   Requisitos que cumple:
     - Botones "Aceptar todas", "Rechazar todas" y "Configurar" con
       misma jerarquía visual (mismo tamaño y contraste en CSS).
     - Bloqueo real: hasta que el usuario no consienta, no se cargan
       recursos de terceros marcados con data-consent="terceros".
     - Persistencia en localStorage clave "gg_cookie_consent".
     - API global window.GGConsent con métodos has / set / revoke.
   Drop-in, sin dependencias.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var STORAGE_KEY = 'gg_cookie_consent';

  // Carpeta donde vive este script. Los enlaces legales se construyen desde
  // aqui para que valgan igual desde la portada, desde /en/ y desde las
  // propias paginas legales. Antes eran relativos y en /ar/ daban 404.
  var BASE = (function () {
    var el = document.currentScript;
    if (!el) {
      var todos = document.querySelectorAll('script[src]');
      for (var i = todos.length - 1; i >= 0; i--) {
        if (/cookie-banner\.js/.test(todos[i].src)) { el = todos[i]; break; }
      }
    }
    return el ? el.src.replace(/[^/]*$/, '') : 'legal/';
  })();

  // Idioma de la pagina: el banner habla el idioma en el que esta escrita.
  var EN = /^en/i.test(document.documentElement.getAttribute('lang') || '');
  function t(es, en) { return EN ? en : es; }
  var VERSION = 1;
  // Duración máxima del consentimiento (AEPD: máx 24 meses). 13 meses = patrón habitual.
  var MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000;

  // ── Estado ────────────────────────────────────────────────────
  function readState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== VERSION) return null;
      if (typeof obj.ts !== 'number') return null;
      if (Date.now() - obj.ts > MAX_AGE_MS) return null;
      return obj;
    } catch (_) {
      return null;
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* storage deshabilitado */ }
  }

  function currentState() {
    return readState() || { v: VERSION, ts: 0, tecnicas: true, analiticas: false, terceros: false, decided: false };
  }

  // ── API pública ───────────────────────────────────────────────
  var listeners = [];

  var API = {
    has: function (category) {
      var s = readState();
      if (!s) return category === 'tecnicas';
      return !!s[category];
    },
    get: function () {
      return readState();
    },
    set: function (partial) {
      var s = currentState();
      var next = {
        v: VERSION,
        ts: Date.now(),
        tecnicas: true,
        analiticas: partial.analiticas === true,
        terceros: partial.terceros === true,
        decided: true
      };
      writeState(next);
      applyConsent(next);
      notify(next);
    },
    acceptAll: function () {
      API.set({ analiticas: true, terceros: true });
    },
    rejectAll: function () {
      API.set({ analiticas: false, terceros: false });
    },
    revoke: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      location.reload();
    },
    open: function () { showPanel(); },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };

  function notify(state) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](state); } catch (_) {}
    }
  }

  window.GGConsent = API;

  // ── Activación diferida de recursos con data-consent ─────────
  function applyConsent(state) {
    var nodes = document.querySelectorAll('[data-consent]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cat = el.getAttribute('data-consent');
      if (state[cat]) {
        activateBlock(el);
      }
    }
  }

  function activateBlock(el) {
    if (el.getAttribute('data-consent-active') === '1') return;
    el.setAttribute('data-consent-active', '1');

    // 1) Si hay un <template> dentro, inyecta su contenido.
    var tpl = el.querySelector('template[data-consent-payload]');
    if (tpl && tpl.content) {
      // Limpia placeholder
      var fb = el.querySelector('.ggc-consent-fallback');
      if (fb) fb.remove();
      el.appendChild(tpl.content.cloneNode(true));
      return;
    }

    // 2) Si hay <script type="text/plain" data-consent-src>, cárgalos.
    var scripts = el.querySelectorAll('script[type="text/plain"][data-consent-src]');
    for (var i = 0; i < scripts.length; i++) {
      var s = document.createElement('script');
      s.src = scripts[i].getAttribute('data-consent-src');
      s.async = true;
      document.head.appendChild(s);
    }
  }

  // ── UI ────────────────────────────────────────────────────────
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'class') el.className = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
          el.addEventListener(k.substring(2), attrs[k]);
        } else {
          el.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c == null) continue;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return el;
  }

  var root, bannerEl, panelEl;

  function ensureRoot() {
    if (root) return root;
    root = h('div', { class: 'ggc-root', role: 'region', 'aria-label': t('Aviso de cookies', 'Cookie notice') });
    document.body.appendChild(root);
    return root;
  }

  function buildBanner() {
    var linkCookies = h('a', { href: BASE + 'politica-cookies.html' }, [t('política de cookies', 'cookie policy (in Spanish)')]);
    var linkPriv = h('a', { href: BASE + 'politica-privacidad.html' }, [t('política de privacidad', 'privacy policy (in Spanish)')]);

    var text = h('div', null, [
      h('h2', null, [t('Utilizamos cookies', 'We use cookies')]),
      (function () {
        var p = h('p', null, [
          t('Usamos cookies técnicas propias (necesarias para el funcionamiento) y, solo con tu consentimiento, cookies de terceros (fuentes de Google y vídeos de Instagram). Consulta nuestra ', 'We use our own technical cookies (needed for the site to work) and, only with your consent, third-party cookies (Google Fonts and Instagram videos). See our '),
          linkCookies,
          t(' y la ', ' and the '),
          linkPriv,
          '.'
        ]);
        return p;
      })()
    ]);

    var btnAccept = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.acceptAll(); hideAll(); }
    }, [t('Aceptar todas', 'Accept all')]);

    var btnReject = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.rejectAll(); hideAll(); }
    }, [t('Rechazar todas', 'Reject all')]);

    var btnConfig = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { showPanel(); }
    }, [t('Configurar', 'Settings')]);

    var actions = h('div', { class: 'ggc-actions' }, [btnAccept, btnReject, btnConfig]);

    var inner = h('div', { class: 'ggc-banner-inner' }, [text, actions]);
    return h('div', { class: 'ggc-banner', role: 'dialog', 'aria-labelledby': 'ggc-banner-title' }, [inner]);
  }

  function buildPanel() {
    var s = currentState();

    function row(id, title, desc, checked, disabled) {
      var inputAttrs = { type: 'checkbox', id: id };
      if (checked) inputAttrs.checked = 'checked';
      if (disabled) inputAttrs.disabled = 'disabled';
      var input = h('input', inputAttrs);
      var slider = h('span', { class: 'ggc-toggle-slider', 'aria-hidden': 'true' });
      var toggle = h('label', { class: 'ggc-toggle', for: id }, [input, slider]);
      return h('div', { class: 'ggc-category' }, [
        h('div', null, [
          h('h3', null, [title]),
          h('p', null, [desc])
        ]),
        toggle
      ]);
    }

    var rowTec = row('ggc-tec', t('Cookies técnicas (obligatorias)', 'Technical cookies (required)'),
      t('Necesarias para el funcionamiento básico de la web. No se pueden desactivar.', 'Needed for the basic functioning of the site. They cannot be switched off.'),
      true, true);

    var rowAna = row('ggc-ana', t('Cookies analíticas', 'Analytics cookies'),
      t('Nos ayudan a entender cómo se usa la web de forma agregada y anónima.', 'They help us understand how the site is used, in aggregate and anonymously.'),
      !!s.analiticas, false);

    var rowTer = row('ggc-ter', t('Cookies de terceros (Instagram, fuentes)', 'Third-party cookies (Instagram, fonts)'),
      t('Permiten ver los vídeos de Instagram y cargar recursos externos. Implican transferencia internacional a EE. UU. bajo cláusulas contractuales tipo.', 'They allow Instagram videos and external resources to load. They involve an international transfer to the USA under standard contractual clauses.'),
      !!s.terceros, false);

    var btnSave = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () {
        API.set({
          analiticas: document.getElementById('ggc-ana').checked,
          terceros: document.getElementById('ggc-ter').checked
        });
        hideAll();
      }
    }, [t('Guardar preferencias', 'Save preferences')]);

    var btnAccept = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.acceptAll(); hideAll(); }
    }, [t('Aceptar todas', 'Accept all')]);

    var btnReject = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.rejectAll(); hideAll(); }
    }, [t('Rechazar todas', 'Reject all')]);

    var actions = h('div', { class: 'ggc-panel-actions' }, [btnReject, btnSave, btnAccept]);

    var inner = h('div', { class: 'ggc-panel-inner' }, [
      h('h2', null, [t('Configuración de cookies', 'Cookie settings')]),
      h('p', { class: 'ggc-intro' }, [
        t('Puedes aceptar, rechazar o elegir qué categorías permites. Las cookies técnicas son imprescindibles y siempre están activas.', 'You can accept, reject or choose which categories you allow. Technical cookies are essential and always active.')
      ]),
      rowTec,
      rowAna,
      rowTer,
      actions
    ]);

    return h('div', { class: 'ggc-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ggc-panel-title' }, [inner]);
  }

  function showBanner() {
    ensureRoot();
    hideAll(true);
    bannerEl = buildBanner();
    root.appendChild(bannerEl);
    root.hidden = false;
  }

  function showPanel() {
    ensureRoot();
    hideAll(true);
    panelEl = buildPanel();
    root.appendChild(panelEl);
    root.hidden = false;
    // foco al primer toggle editable
    var first = panelEl.querySelector('input:not(:disabled)');
    if (first) first.focus();
  }

  function hideAll(keepRoot) {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    bannerEl = null;
    panelEl = null;
    if (root && !keepRoot) root.hidden = true;
  }

  // ── Fallback UI para bloques bloqueados (iframe Maps, etc.) ──
  function decorateBlockedBlocks() {
    var nodes = document.querySelectorAll('[data-consent]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cat = el.getAttribute('data-consent');
      if (API.has(cat)) continue;
      if (el.querySelector('.ggc-consent-fallback')) continue;

      var fallbackMsg = el.getAttribute('data-fallback') ||
        t('Este contenido requiere cookies de terceros. Actívalas para verlo.', 'This content needs third-party cookies. Turn them on to see it.');

      var btn = h('button', {
        type: 'button',
        onclick: (function (category, element) {
          return function () {
            // Activa SOLO la categoría de este bloque (manteniendo las demás)
            var prev = readState() || { analiticas: false, terceros: false };
            var patch = { analiticas: !!prev.analiticas, terceros: !!prev.terceros };
            patch[category] = true;
            API.set(patch);
          };
        })(cat, el)
      }, [t('Aceptar cookies y cargar', 'Accept cookies and load')]);

      var fb = h('div', { class: 'ggc-consent-fallback' }, [
        h('p', null, [fallbackMsg]),
        btn
      ]);
      el.appendChild(fb);
    }
  }

  // ── Arranque ─────────────────────────────────────────────────
  function boot() {
    var s = readState();
    decorateBlockedBlocks();

    if (s && s.decided) {
      applyConsent(s);
      return;
    }
    // Sin consentimiento válido: mostrar banner
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
