# SPRINT 03 — Páginas de Servicios

**Duración:** 5 días (Semana 5)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-02 completado.

## Objetivo

Crear las 7 páginas de servicios principales, todas con SEO optimizado, Schema.org Service y CTAs con mensajes WhatsApp pre-armados específicos por servicio.

## URLs a crear

| URL | Tipo | Servicio |
|-----|------|----------|
| `/servicio-de-caraga-flete-y-mudanza-cusco/` | Preservada (*) | Hub de servicios |
| `/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/` | Preservada (*) | Mudanzas locales |
| `/mudanza-provincia/` | Preservada (*) | Mudanzas inter-provincia |
| `/mudanzas-de-o/` | Preservada (*) | Mudanzas de oficina |
| `/servicio-de-embalaje-cusco/` | Nueva | Embalaje y empaque |
| `/servicio-de-flete-cusco/` | Nueva | Flete y carga |
| `/armado-y-desarmado-de-muebles-cusco/` | Nueva | Armado/desarmado |
| `/mudanzas-estudiantes-cusco/` | Nueva | Para estudiantes UNSAAC |
| `/flete-comercial-cusco/` | Nueva | Flete comercial recurrente |

## Plantilla común para cada página de servicio

Crear `src/layouts/ServiceLayout.astro` que envuelva todas las páginas de servicio con:

1. Hero específico del servicio
2. Breadcrumbs
3. Descripción detallada (600-1500 palabras según servicio)
4. Lista "Qué incluye / Qué no incluye"
5. Tabla de precios referenciales
6. Galería específica (4-6 fotos)
7. FAQs específicas (4-6) con Schema FAQPage
8. Servicios relacionados (3 cards)
9. CTA WhatsApp con mensaje pre-armado del servicio
10. Schema.org `Service` con provider = LocalBusiness

## Tareas

### Tarea 3.1 — Crear `ServiceLayout.astro`

Layout reutilizable que reciba props: `title`, `subtitle`, `description`, `whatsappMessage`, `relatedServices[]`, `faqs[]`, `priceTable`.

### Tarea 3.2 — Hub de servicios `/servicio-de-caraga-flete-y-mudanza-cusco/`

Página overview con cards de los 8 servicios. Cada card enlaza a su página dedicada.

**Meta:**
```
Title: Servicios de Mudanza, Flete y Carga en Cusco | Expresos Ñan
Description: Mudanzas locales y provinciales, flete, embalaje, almacenaje y mudanzas de oficina en Cusco. Cotiza por WhatsApp.
```

### Tarea 3.3 — `/mudanzas-locales-en-cusco-...`

Servicio principal. Word count mínimo: 1200 palabras.

Contenido específico:
- Áreas atendidas (todos los distritos)
- Tipos de mudanza local (departamento pequeño, casa familiar, oficina pequeña)
- Proceso paso a paso
- Tiempos estimados según tamaño
- Tabla de precios referenciales por tipo
- Mención de flota (1, 2, 4 toneladas)

**WhatsApp message:** "Hola, necesito cotización para mudanza local en Cusco. Mi origen es [...] y destino [...]"

### Tarea 3.4 — `/mudanza-provincia/`

Hub de mudanzas inter-provinciales. Lista las 9 rutas activas con enlace a cada landing específica (Sprint 6).

Mencionar también las rutas próximamente (Arequipa, Juliaca, Puno) con badge "Próximamente".

### Tarea 3.5 — `/mudanzas-de-o/` (Mudanzas de Oficina)

Enfocado en persona Carlos (empresa). Énfasis en:
- Servicio fin de semana / nocturno
- Embalaje de equipos sensibles
- Confidencialidad
- Factura electrónica con RUC
- Caso de éxito empresarial
- Formulario empresarial extendido

**WhatsApp message:** "Hola, necesito cotización para mudanza de oficina. Somos una empresa con [X] empleados, ubicada en [...]"

### Tarea 3.6 — `/servicio-de-embalaje-cusco/` (NUEVA)

Servicio de embalaje profesional. Incluir:
- Tipos de materiales usados (cajas, plástico burbuja, mantas, etc.)
- Embalaje de objetos delicados (vajilla, electrónicos, obras de arte)
- Servicio de empaque a domicilio
- Tarifas por hora o por proyecto

### Tarea 3.7 — `/servicio-de-flete-cusco/` (NUEVA)

Flete y carga general. Diferenciado de mudanzas. Incluir:
- Tipos de carga (mercadería, electrodomésticos, muebles individuales)
- Servicio express
- Flota disponible
- Cobertura local y provincial

### Tarea 3.8 — `/armado-y-desarmado-de-muebles-cusco/` (NUEVA)

Servicio especializado. Incluir:
- Muebles que armamos (camas, roperos, escritorios, racks de TV, mesas)
- Servicio independiente de la mudanza
- Tarifas por mueble
- Garantía de armado

### Tarea 3.9 — `/mudanzas-estudiantes-cusco/` (NUEVA)

Enfocado en persona Diego. Incluir:
- Tarifas económicas referenciales
- Servicio express mismo día
- Flexibilidad de horarios
- Mención específica UNSAAC y otras universidades
- Casos típicos: cuarto, mini-departamento, cambio de pensión

**WhatsApp message:** "Hola, soy estudiante UNSAAC y necesito mudar mis cosas de [origen] a [destino]"

### Tarea 3.10 — `/flete-comercial-cusco/` (NUEVA)

Enfocado en persona Rosa (comerciante). Incluir:
- Servicios recurrentes (semanales, mensuales)
- Descuentos por frecuencia
- Choferes asignados
- Cobertura de mercados y zonas comerciales
- Testimonio de comerciante

### Tarea 3.11 — Implementar dropdown "Servicios" en Header

Actualizar Header del Sprint 01 para que el menú "Servicios" muestre las 7 páginas en dropdown.

## Criterios de Aceptación

- [ ] 7 páginas de servicio publicadas en staging
- [ ] Cada una con Lighthouse SEO = 100
- [ ] Schema Service + FAQPage validados
- [ ] CTAs WhatsApp con mensajes específicos funcionando
- [ ] URLs preservadas tienen el contenido equivalente al WP actual o mejor
- [ ] Internal linking entre servicios relacionados
- [ ] Word count mínimo cumplido por servicio

## Verificación

```bash
# Crawlear staging y comparar con producción actual
npx screaming-frog-cli crawl https://staging.cuscomudanzas.com
```

## Siguiente Sprint

**[SPRINT-04 — Almacenaje y Flota](SPRINT-04-storage-fleet.md)**
