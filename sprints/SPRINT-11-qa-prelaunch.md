# SPRINT 11 — QA Exhaustivo y Pre-Lanzamiento

**Duración:** 5 días (Semana 12-13)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-10 completado.

## Objetivo

Auditoría completa y exhaustiva del sitio en staging antes del lanzamiento. Resolver TODOS los hallazgos. Comparar URL por URL con producción actual para garantizar que el SEO no se rompe. Preparar el día D.

## Tareas

### Tarea 11.1 — Auditoría técnica con Screaming Frog

```bash
# Instalar Screaming Frog SEO Spider (versión gratis hasta 500 URLs)
# https://www.screamingfrog.co.uk/seo-spider/

# Crawlear staging
# Configurar para usar la robots.txt de staging (que permite crawl interno)
```

Exportar:
- URLs con sus status codes
- Títulos y meta descriptions
- H1, H2, H3
- Imágenes con/sin alt
- Enlaces rotos
- Redirecciones

**Comparar con crawl previo de producción (WordPress actual):**
- Toda URL preservada debe seguir respondiendo 200
- Toda meta debe coincidir o ser mejor
- No debe haber URLs 404

### Tarea 11.2 — Lighthouse en 20 páginas críticas

Ejecutar en cada página:
- Home (`/`)
- Servicios principales (4)
- Cada página con URL preservada (8)
- Almacenaje, Flota
- 5 landings de distritos
- 5 landings de rutas activas
- Algunos artículos de blog
- Versión inglesa principal

Cada página debe cumplir:
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO = 100

**Documentar en planilla de QA cada resultado.**

### Tarea 11.3 — PageSpeed Insights con Field Data

Esperar 28 días después de tener tráfico en staging (o usar Chrome User Experience Report).

Para cada página crítica:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

### Tarea 11.4 — Validación Schema.org

Para CADA página, validar en:
- https://search.google.com/test/rich-results
- https://validator.schema.org/

Confirmar que se reconocen:
- LocalBusiness/MovingCompany
- Service (en páginas de servicio)
- BreadcrumbList (en todas excepto home)
- FAQPage (en FAQs)
- Article/BlogPosting (en blog)

### Tarea 11.5 — Validación hreflang

https://technicalseo.com/tools/hreflang/

Subir lista de URLs ES y EN, confirmar que cada par está correctamente vinculado.

### Tarea 11.6 — Mobile-Friendly Test

Para cada página: https://search.google.com/test/mobile-friendly

Cero hallazgos de "Page is not mobile-friendly".

### Tarea 11.7 — Testing de formularios

Probar TODOS los formularios:
- Formulario de contacto general
- Formulario empresarial
- Formularios de pre-registro de rutas próximamente (4)
- Formulario en página de almacenaje

Para cada uno:
- Llenar y enviar de prueba
- Verificar email recibido en bandeja real
- Validar que el honeypot funciona (no debe bloquear envíos legítimos)
- Probar validación de campos requeridos

### Tarea 11.8 — Testing de WhatsApp CTAs

Probar EN MÓVIL REAL (no solo emulador):

1. Hacer clic en cada botón WhatsApp principal
2. Verificar que abre WhatsApp con número correcto: `+51 925 671 052`
3. Verificar que el mensaje pre-armado coincide con el contexto de la página
4. Repetir en versión inglés (mensajes en inglés)

### Tarea 11.9 — Testing en navegadores reales

- Chrome (Android + Windows)
- Safari (iOS + macOS)
- Firefox (Windows)
- Edge (Windows)

Verificar visualmente:
- Header no se rompe
- Footer no se rompe
- Imágenes cargan
- Animaciones funcionan
- Formularios envían

### Tarea 11.10 — Testing de accesibilidad

```bash
npm install -g pa11y
pa11y https://staging.cuscomudanzas.com/ --reporter html > pa11y-report.html
```

Resolver TODOS los hallazgos críticos.

Probar manualmente con teclado:
- Tab navigation funciona
- Focus visible
- Skip link funciona
- Lector de pantalla (NVDA/VoiceOver) lee correctamente

### Tarea 11.11 — Testing de seguridad

https://securityheaders.com/?q=staging.cuscomudanzas.com

Debe dar grado **A** o **A+**.

Si CSP da problemas, ajustar para permitir solo dominios necesarios (Cloudflare, GA, Meta Pixel, WhatsApp).

### Tarea 11.12 — Comparación URL por URL

Crear hoja de cálculo con dos columnas:
- URL en producción (WordPress actual)
- URL equivalente en staging (Astro nuevo)

Para cada par:
- Title coincide ✓
- Meta description coincide ✓
- H1 coincide ✓
- Word count nuevo ≥ actual ✓
- Status 200 ✓

**Aprobación formal del cliente** antes de proceder al lanzamiento.

### Tarea 11.13 — Plan del Día D documentado

Cronograma detallado del día del lanzamiento (ya descrito en DRU sección 10.4):

```
08:00 — Backup final del WordPress
08:30 — Notificar inicio
09:00 — Cambiar raíz del dominio
09:15-13:00 — Verificaciones
14:00-17:00 — Monitoreo
17:00 — Reporte de cierre
```

### Tarea 11.14 — Rollback drill

Practicar el procedimiento de reversión:

1. Cambiar raíz del dominio de vuelta al WordPress respaldado.
2. Verificar que WordPress sirve correctamente.
3. Cronometrar: debe completarse en < 30 minutos.

Documentar comandos exactos en `docs/ROLLBACK.md`.

### Tarea 11.15 — Checklist final (sign-off)

- [ ] Todos los criterios técnicos aprobados
- [ ] Todos los criterios SEO aprobados
- [ ] Cliente firma aprobación visual
- [ ] Cliente firma aprobación de contenido
- [ ] Backup del WordPress actual confirmado
- [ ] Equipo confirma disponibilidad para Día D
- [ ] Plan de rollback ensayado y documentado
- [ ] Fecha de lanzamiento confirmada con cliente

## Criterios de Aceptación

- [ ] Todas las pruebas anteriores ejecutadas y documentadas
- [ ] Cero hallazgos críticos pendientes
- [ ] Sign-off formal del cliente
- [ ] Plan del Día D listo
- [ ] Backup actual del WordPress
- [ ] Equipo en stand-by para Día D

## Siguiente Sprint

**[SPRINT-12 — Lanzamiento](SPRINT-12-launch.md)**
