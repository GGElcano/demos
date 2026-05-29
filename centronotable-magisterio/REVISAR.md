# Notable Formación · Magisterio — Demo web (PENDIENTE DE VALIDAR)

Web multipágina para el apartado de **Magisterio** de Notable Formación (Centro Notable).
Slug: `centronotable-magisterio` → publicable en `ggelcano.github.io/demos/centronotable-magisterio/`.

## Páginas
- `index.html` · `especialidades.html` (anclas #infantil…#al) · `metodologia.html` · `precios.html` · `nosotros.html` · `contacto.html`
- `styles.css` / `script.js` compartidos · `img/logo-notable.png` (logo oficial descargado)

## ✅ MARCA REAL (extraída del CSS y el logo del sitio de Magisterio)
- **Logo oficial**: "Notable Formación" (descargado de la plataforma y usado en cabecera/footer).
- **Colores reales**: azul **`#285598`** (primario) + magenta **`#da148f`** (secundario). *(Corregido: la 1ª versión usaba naranja por error, eran colores del page-builder de la home, no de la marca.)*
- **Tipografía**: Open Sans (cuerpo, la real del sitio) + Bricolage Grotesque (display, para titulares editoriales).
- **Motivo de marca**: trazo ondulado/swoosh (del logo) usado como acento, subrayado y olas entre secciones.
- Claims reales: "Prepárate con éxito…", "Somos tu mayor apoyo para conseguir tu plaza", "Clases presenciales y online".
- Especialidades (de la plataforma Moodle): Infantil, Primaria, Inglés, PT, EF, Audición y Lenguaje.
- Grupos por días (Infantil: martes/viernes/sábados; Primaria: jueves; Inglés: jueves/viernes/Madrid).
- Contacto: info@centronotable.es · 614 442 456 · WhatsApp 607 427 159 · Sedes Tomelloso/Albacete/Jaén · L-V 10:30–13:30 y 16:00–21:00 · IG/TikTok/FB @centronotable.

## ⚠️ CONTENIDO INVENTADO / PLACEHOLDER — confirmar o sustituir
1. **PRECIOS** (`precios.html`): "desde 95€/110€/120€/mes" son **ejemplo** (banner + asterisco avisan). → Pasar precios reales o decidir ocultarlos.
2. **TESTIMONIOS** (`index.html`): Laura M., David R., Nerea S. son **ficticios** (nota visible). → Sustituir por reseñas reales o quitar.
3. **ESTADÍSTICAS**: "98% repetiría", "100% especialistas", "1:1 tutor" → confirmar cifras (el 98% lleva asterisco).
4. **Modalidades** (Online/Presencial/Mixta) y "sin permanencia" → confirmar que existen tal cual.
5. **Textos descriptivos** de cada especialidad → redactados genéricos pero realistas; revisar que encajen (p.ej. horarios concretos de EF y AL).
6. **Aviso legal / Privacidad**: enlaces a `#` vacíos → añadir páginas legales reales (obligatorio RGPD por el formulario).
7. **Formulario**: demo (no envía; muestra confirmación en pantalla) → conectar a email/CRM/servicio de formularios.
8. **¿"Notable Formación" o "Centro Notable"?** En la web uso "Notable Formación" (el del logo). Confirmar el nombre comercial preferido para el apartado de Magisterio.
9. **Orientación Educativa / Secundaria-Inglés**: mencionadas como "también disponibles" al pie de especialidades. Confirmar si entran en "Magisterio".

## Notas técnicas
- Estático. Fuentes vía Google Fonts (Bricolage Grotesque + Open Sans).
- WhatsApp `wa.me/34607427159` con mensaje prerelleno. Botón flotante en todas las páginas.
- Horario: la fila del día actual se resalta en magenta automáticamente (JS `highlightToday`).
- Animaciones: entrada del hero escalonada, reveal al hacer scroll, marquee de especialidades, contadores, microinteracciones en tarjetas. Respeta `prefers-reduced-motion`.
- Responsive completo + menú móvil.

## 🤖 Optimización para que la IA recomiende la web (GEO/AEO)
- **JSON-LD** (datos estructurados) en las 6 páginas: organización educativa (EducationalOrganization + LocalBusiness con sedes, teléfono, email, horario, redes), lista de **Cursos** por especialidad, **FAQPage** (inicio y precios) y **BreadcrumbList**. 10 bloques, todos validados.
- **`llms.txt`** (raíz): resumen en markdown para que los modelos de IA entiendan y citen el centro.
- **`robots.txt`**: permite explícitamente a GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot, etc.
- **`sitemap.xml`** + Open Graph + Twitter Card + canonical en todas las páginas.
- ⚠️ **URL BASE**: todo el JSON-LD/canonical/sitemap usa `https://www.centronotable.es/magisterio` como dominio de producción **provisional**. Al publicar en la URL definitiva hay que sustituir esa base (buscar/reemplazar `https://www.centronotable.es/magisterio` en los `.html`, `sitemap.xml`, `robots.txt` y `llms.txt`).
- ⚠️ **Imagen OG**: ahora apunta al logo; conviene crear una imagen social 1200×630 dedicada.
