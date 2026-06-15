/* ──────────────────────────────────────────────────────────────
   GG Elcano · Banner de cookies (AEPD 2023 + LSSICE art. 22.2)
   Drop-in, sin dependencias.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var STORAGE_KEY = 'gg_cookie_consent';
  var VERSION = 1;
  var MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000;

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
    } catch (_) {}
  }

  function currentState() {
    return readState() || { v: VERSION, ts: 0, tecnicas: true, analiticas: false, terceros: false, decided: false };
  }

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

    var tpl = el.querySelector('template[data-consent-payload]');
    if (tpl && tpl.content) {
      var fb = el.querySelector('.ggc-consent-fallback');
      if (fb) fb.remove();
      el.appendChild(tpl.content.cloneNode(true));
      return;
    }

    var scripts = el.querySelectorAll('script[type="text/plain"][data-consent-src]');
    for (var i = 0; i < scripts.length; i++) {
      var s = document.createElement('script');
      s.src = scripts[i].getAttribute('data-consent-src');
      s.async = true;
      document.head.appendChild(s);
    }
  }

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
    root = h('div', { class: 'ggc-root', role: 'region', 'aria-label': 'Aviso de cookies' });
    document.body.appendChild(root);
    return root;
  }

  function buildBanner() {
    var linkCookies = h('a', { href: 'legal/politica-cookies.html' }, ['politica de cookies']);
    var linkPriv = h('a', { href: 'legal/politica-privacidad.html' }, ['politica de privacidad']);

    var text = h('div', null, [
      h('h2', null, ['Utilizamos cookies']),
      (function () {
        var p = h('p', null, [
          'Usamos cookies tecnicas propias (necesarias para el funcionamiento) y, solo con tu consentimiento, cookies de terceros (Google Maps). Consulta nuestra ',
          linkCookies,
          ' y la ',
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
    }, ['Aceptar todas']);

    var btnReject = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.rejectAll(); hideAll(); }
    }, ['Rechazar todas']);

    var btnConfig = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { showPanel(); }
    }, ['Configurar']);

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

    var rowTec = row('ggc-tec', 'Cookies tecnicas (obligatorias)',
      'Necesarias para el funcionamiento basico de la web. No se pueden desactivar.',
      true, true);

    var rowAna = row('ggc-ana', 'Cookies analiticas',
      'Nos ayudan a entender como se usa la web de forma agregada y anonima.',
      !!s.analiticas, false);

    var rowTer = row('ggc-ter', 'Cookies de terceros (Google Maps, fuentes)',
      'Permiten mostrar el mapa de Google y cargar recursos externos. Implican transferencia internacional a EE. UU. bajo clausulas contractuales tipo.',
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
    }, ['Guardar preferencias']);

    var btnAccept = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.acceptAll(); hideAll(); }
    }, ['Aceptar todas']);

    var btnReject = h('button', {
      class: 'ggc-btn',
      type: 'button',
      onclick: function () { API.rejectAll(); hideAll(); }
    }, ['Rechazar todas']);

    var actions = h('div', { class: 'ggc-panel-actions' }, [btnReject, btnSave, btnAccept]);

    var inner = h('div', { class: 'ggc-panel-inner' }, [
      h('h2', null, ['Configuracion de cookies']),
      h('p', { class: 'ggc-intro' }, [
        'Puedes aceptar, rechazar o elegir que categorias permites. Las cookies tecnicas son imprescindibles y siempre estan activas.'
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

  function decorateBlockedBlocks() {
    var nodes = document.querySelectorAll('[data-consent]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cat = el.getAttribute('data-consent');
      if (API.has(cat)) continue;
      if (el.querySelector('.ggc-consent-fallback')) continue;

      var fallbackMsg = el.getAttribute('data-fallback') ||
        'Este contenido requiere cookies de terceros. Activalas para verlo.';

      var btn = h('button', {
        type: 'button',
        onclick: (function (category) {
          return function () {
            var prev = readState() || { analiticas: false, terceros: false };
            var patch = { analiticas: !!prev.analiticas, terceros: !!prev.terceros };
            patch[category] = true;
            API.set(patch);
          };
        })(cat)
      }, ['Aceptar cookies y cargar']);

      var fb = h('div', { class: 'ggc-consent-fallback' }, [
        h('p', null, [fallbackMsg]),
        btn
      ]);
      el.appendChild(fb);
    }
  }

  function boot() {
    var s = readState();
    decorateBlockedBlocks();

    if (s && s.decided) {
      applyConsent(s);
      return;
    }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
