# Plantillas Premium G&G Elcano

Moldes base WCAG 2.2 AA para generar webs B2B personalizadas.

## Cómo usarlas

Estas 6 plantillas tienen **155 placeholders `{{...}}`** que se rellenan con los datos de cada lead. **No abrir directamente en el navegador** — se ven como un molde con huecos.

El flujo correcto es:

1. Identificar el lead en el CRM (https://gg-crm.ggelcano.workers.dev)
2. Pedir a Claude (Code o web) que genere la demo: "rellena la plantilla `restaurante-premium` con los datos del lead Aretxondo del CRM"
3. Claude busca los datos del lead, descarga fotos del Maps, sustituye placeholders
4. Resultado: web personalizada lista para deploy

## Catálogo

| Plantilla | Sector |
|---|---|
| `restaurante-premium` | Hostelería (restaurantes, asadores, bares de tapas) |
| `servicios-por-cita-premium` | Salud y belleza (peluquerías, clínicas dentales, veterinarias) |
| `comercio-premium` | Comercio (ferreterías, floristerías, tiendas) |
| `taller-premium` | Motor (talleres mecánicos) |
| `formacion-premium` | Formación (academias, autoescuelas) |
| `profesional-premium` | Servicios profesionales (abogados, gestorías, inmobiliarias) |

## Cumplimiento WCAG 2.2 AA

Todas las plantillas incluyen los fixes de accesibilidad obligatorios bajo el European Accessibility Act (vigente desde 28 jun 2025):

- `:focus-visible`, `prefers-reduced-motion`
- `<main>`, skip-link, role=region+aria-label, role=dialog en mobile menu
- ESC handler, hamburger aria-expanded, video aria-label, iframe title
- text-shadow en hero sobre foto (WCAG 1.4.3 — legibilidad sobre imagen)
- Contraste >= 4.5:1 en todos los textos
- Botones accent: texto adaptado al contraste (negro o blanco según luminancia)

## Validación

Antes de desplegar cualquier web generada a partir de estas plantillas, ejecutar:

```bash
bash scripts/validate-accessibility.sh demos/{slug}/index.html
```

Y pasar por el agente `accessibility-auditor` para conseguir 10/10 con riesgo legal BAJO.
