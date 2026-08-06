# Analítica de Google — Royale Beauty

El cliente pidió (6-ago-2026): *«necesitaría un acceso a las analíticas de Google
para estrategizar»*. Esto es lo que hay que decidir antes de tocar nada.

---

## Lo primero: hoy no hay nada que medir

La web está en **nuestro dominio de demos** (`ggelcano.github.io/demos/...`).
Si se instala la analítica ahí, lo que se mide son las visitas a la demo —
casi todas nuestras y del propio cliente mirándola. **No son sus clientes.**

La analítica empieza a valer el día que la web esté publicada en **su dominio**
(`royalebeauty.es`). Antes de eso es un número bonito y vacío.

Conviene decírselo tal cual: queda mejor que prometer un panel que no dice nada.

## Segundo: ¿de quién es la cuenta?

Son dos cosas distintas y hay que separarlas:

| | Quién es el dueño | Qué ve el cliente |
|---|---|---|
| **Opción A (recomendada)** | La propiedad se crea en la cuenta de G&G Elcano | Se le invita como **lector** con su email. Entra, mira sus datos, no puede borrar nada |
| **Opción B** | La propiedad se crea en la cuenta del cliente | Manda él. Si un día se va, se lleva el histórico y nosotros perdemos el acceso |

La A es la de siempre en este tipo de servicio y además da pie a cobrar el
mantenimiento: el informe mensual se lo damos nosotros.

## Tercero: qué pasa con las cookies

El banner de esta web **ya trae la casilla de «Cookies analíticas»** — está
hecho y funcionando. Pero:

> ⚠️ **La página `legal/politica-cookies.html` NO menciona la analítica.**
> Si se instala Google Analytics hay que añadir ese apartado. Sin eso, el
> banner ofrece algo que la política no explica, y eso es lo que multa la AEPD.

---

## Cómo se instala (cuando haya decisión y un identificador)

1. Crear la propiedad en Google Analytics → sale un identificador tipo `G-XXXXXXXXXX`.
2. Pegar este bloque **justo antes de `</body>`** en `index.html` **y** en `ar/index.html`
   (en la árabe, las rutas de `legal/` llevan `../` delante):

```html
<!-- Google Analytics 4. No se carga hasta que el visitante acepta
     las cookies analíticas: lo gestiona legal/cookie-banner.js. -->
<div data-consent="analiticas" hidden>
  <script type="text/plain" data-consent-src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <template data-consent-payload>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>
  </template>
</div>
```

3. Sustituir las **dos** apariciones de `G-XXXXXXXXXX` por el identificador real.
4. Añadir el apartado de analítica a `legal/politica-cookies.html`.
5. Comprobar: abrir la web, **rechazar** cookies y verificar que no se carga
   `googletagmanager.com` (pestaña Red del navegador). Luego aceptar y ver que sí.

## Un extra que vale más que Analytics para «estrategizar»

**Google Search Console** (gratis, distinta de Analytics): dice **por qué frases
la busca la gente en Google** y en qué puesto sale. Para un hammam en Las Palmas
eso vale más que las visitas — enseña qué escribir en la web para aparecer.
Se pide la verificación del dominio y en 48 h empieza a dar datos.

Su ficha de Google Business también trae sus propias estadísticas (llamadas,
peticiones de cómo llegar, búsquedas) sin instalar nada. Con **4,9 sobre 102
reseñas**, esa ficha es probablemente su mejor canal de entrada.
