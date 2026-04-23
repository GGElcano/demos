# Plantilla legal reutilizable — G&G Elcano

Juego mínimo de páginas legales y banner de cookies para demos de presencia web (B2C) cuyo titular es un autónomo persona física sin comercio electrónico.

Cumple:

- **LSSICE** (Ley 34/2002) art. 10 — datos del prestador.
- **RGPD** (UE 2016/679) + **LOPDGDD** (3/2018) — información al interesado.
- **LSSICE** art. 22.2 + **Guía AEPD 2023** — banner con botones "Aceptar todas" / "Rechazar todas" / "Configurar" con idéntica jerarquía visual y bloqueo real hasta consentimiento.

## Archivos

| Archivo | Qué es |
|---|---|
| `aviso-legal.html` | Aviso legal LSSICE — identificación del titular, uso, propiedad intelectual, enlaces, jurisdicción. |
| `politica-privacidad.html` | Política de privacidad RGPD — finalidades, base legal, destinatarios, derechos ARCO-POL, AEPD. |
| `politica-cookies.html` | Política de cookies AEPD 2023 — qué son, tabla de cookies propias y de terceros, gestión. |
| `legal.css` | Hoja de estilos común (sobria, accesible, sin dependencias). |
| `cookie-banner.css` | Estilos del banner y del panel de configuración. |
| `cookie-banner.js` | Lógica del banner: persistencia, 3 botones con misma jerarquía, API `window.GGConsent`, bloqueo de iframes. |

## Cómo aplicar a una demo

1. **Copiar** todo el directorio `plantillas/legal/` a `demos/{slug}/legal/` y dejar `legal.css`, `cookie-banner.css` y `cookie-banner.js` dentro.
2. **Buscar y reemplazar** los siguientes placeholders en los 3 HTML:
   - `{{NOMBRE_COMPLETO}}` — nombre y apellidos del autónomo.
   - `{{NIF}}` — NIF del autónomo.
   - `{{DOMICILIO}}` — domicilio fiscal.
   - `{{EMAIL}}` — correo de contacto.
   - `{{TELEFONO}}` — teléfono de contacto.
   - `{{NOMBRE_COMERCIAL}}` — marca comercial.
   - `{{DOMINIO}}` — dominio público donde se aloja la web.
   - `{{ACTIVIDAD_IAE}}` — descripción + epígrafe IAE.
   - `{{FECHA_ACTUALIZACION}}` — fecha de publicación (ej. "20 de abril de 2026").
   - Si aún no se dispone de `{{NOMBRE_COMPLETO}}` o `{{NIF}}`, dejar el literal `[Pendiente de facilitar por el titular]`; la nota al pie ya avisa de que se completará antes de publicar.
3. **En `index.html` de la demo**:
   - Añadir en el `<head>`:
     ```html
     <link rel="stylesheet" href="legal/cookie-banner.css">
     ```
   - Añadir antes de `</body>`:
     ```html
     <script defer src="legal/cookie-banner.js"></script>
     ```
   - Actualizar el footer: enlaces `Aviso Legal`, `Privacidad` y `Cookies` apuntando a `legal/aviso-legal.html`, `legal/politica-privacidad.html`, `legal/politica-cookies.html`. Añadir un enlace o botón `Configurar cookies` que llame a `window.GGConsent.open()`.
4. **Envolver todo recurso de terceros** (iframes de Google Maps, vídeos de YouTube, píxeles analíticos) en un contenedor con `data-consent="terceros"`. El script sustituirá el iframe por un placeholder con botón de aceptación mientras no haya consentimiento. Patrón:

   ```html
   <div class="contact-map" data-consent="terceros"
        data-fallback="Para ver el mapa de ubicación debes aceptar las cookies de terceros.">
     <template data-consent-payload>
       <iframe title="Mapa de ubicación" src="https://www.google.com/maps/embed/..." ...></iframe>
     </template>
   </div>
   ```

   La primera vez que el usuario acepta cookies de terceros (sea desde el banner, desde el panel "Configurar" o desde el propio botón del placeholder), el `<template>` se clona y el iframe se carga sin recargar la página.

5. **No cargar** `fonts.googleapis.com` directamente desde el `<head>` si el proyecto quiere ser estricto. Para máxima pulcritud, las Google Fonts podrían cargarse también diferidas con el mismo mecanismo `data-consent="terceros"`. Si el diseño las necesita para el primer paint, dejarlas en `<head>` documentándolo en la política como "interés legítimo técnico, sin cookies propias".

## API JavaScript

Una vez cargado `cookie-banner.js`, está disponible `window.GGConsent`:

| Método | Uso |
|---|---|
| `GGConsent.has('terceros')` | `true` si el usuario aceptó la categoría. |
| `GGConsent.get()` | Objeto completo del consentimiento (o `null` si no decidió). |
| `GGConsent.acceptAll()` | Acepta todas las categorías. |
| `GGConsent.rejectAll()` | Rechaza todas las categorías opcionales. |
| `GGConsent.set({ analiticas:true, terceros:false })` | Establece preferencias mixtas. |
| `GGConsent.revoke()` | Borra el consentimiento y recarga. |
| `GGConsent.open()` | Reabre el panel de configuración. |
| `GGConsent.onChange(fn)` | Registra un callback al cambiar el consentimiento. |

## Verificación antes de publicar

```bash
bash scripts/validate-accessibility.sh demos/{slug}/legal/aviso-legal.html
bash scripts/validate-accessibility.sh demos/{slug}/legal/politica-privacidad.html
bash scripts/validate-accessibility.sh demos/{slug}/legal/politica-cookies.html
bash scripts/validate-accessibility.sh demos/{slug}/index.html
```

Y un grep rápido para cazar pérdidas de tildes:

```bash
grep -E "\banos\b|\bpolitica\b|\binformacion\b|\bmas\b" demos/{slug}/legal/*.html
```

No debe haber matches.
