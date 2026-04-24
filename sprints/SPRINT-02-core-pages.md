# SPRINT 02 — Páginas Core (Home, Nosotros, Contacto)

**Duración:** 10 días (Semanas 3-4)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-01 completado.

## Objetivo

Construir las 4 páginas más importantes del sitio: Home, Nosotros, Contacto y páginas de error (404, 500). Estas páginas reciben el grueso del tráfico y deben cumplir todos los estándares de SEO, accesibilidad y rendimiento.

## URLs a crear

- `/` → Home
- `/about/` → Nosotros (URL preservada del WP actual)
- `/contact/` → Contacto (URL preservada)
- `/404` → Error 404 personalizada
- `/500` → Error 500 personalizada

## Tareas

### Tarea 2.1 — Crear `src/pages/index.astro` (Home)

Estructura obligatoria de bloques (orden de arriba a abajo):

1. **Hero principal**
   - Título H1: "Mudanzas Profesionales en Cusco - Transporte Seguro y Confiable"
   - Subtítulo descriptivo
   - 2 CTAs: WhatsApp principal + "Ver servicios"
   - Imagen/video de fondo del equipo trabajando

2. **Servicios destacados** (4 tarjetas)
   - Mudanza Completa (`/mudanzas-locales-...`)
   - Servicio de Flete (`/servicio-de-flete-cusco/`)
   - Almacenaje y Custodia (`/almacenaje-y-custodia-cusco/`)
   - Mudanzas de Oficina (`/mudanzas-de-o/`)

3. **Cobertura visual**
   - Mapa o lista de distritos de Cusco
   - Lista de rutas activas: Sicuani, Abancay, Challhuahuacho, Tambobamba, Haquira, Mara, Coyllurqui, Colquemarca, Capacmarca

4. **¿Por qué elegirnos?** (5-6 ventajas con iconos)
   - Puntualidad
   - Seguridad
   - Eficiencia
   - Profesionalismo
   - Cobertura amplia
   - Flota propia (1, 2, 4 toneladas)

5. **Galería abreviada** (carrusel/grid de 8 fotos)

6. **Testimonios** (carrusel de 3-5)

7. **Bloque blog reciente** (3 últimos artículos)

8. **CTA final** (banner grande con WhatsApp)

**Meta tags:**
```html
<title>Servicio De Mudanza En Cusco | Expresos Ñan</title>
<meta name="description" content="Ofrecemos un servicio de mudanza completo que incluye embalaje, transporte, carga y descarga de tus pertenencias. Cobertura local y provincial. Cotiza por WhatsApp." />
```

**Schema.org JSON-LD:** `LocalBusiness` + `WebSite` + `Organization` (ver `docs/SCHEMA-EXAMPLES.md`).

### Tarea 2.2 — Página `/about/` (Nosotros)

Contenido:
- Historia de Expresos Ñan
- Misión, visión y valores
- Equipo (fotos del personal si disponibles)
- Trayectoria y experiencia
- Estadísticas (años en el mercado, mudanzas realizadas, distritos cubiertos)
- CTA WhatsApp con mensaje: "Hola, vi su página de nosotros y quisiera más información"

**Meta tags:**
```html
<title>Nosotros - Expresos Ñan | Empresa de Mudanzas en Cusco</title>
<meta name="description" content="Conoce a Expresos Ñan, empresa peruana de mudanzas profesionales en Cusco. Trayectoria, equipo y compromiso con cada cliente." />
```

**Schema.org:** `Organization` + `BreadcrumbList`.

### Tarea 2.3 — Página `/contact/` (Contacto)

Contenido:
- Información de contacto destacada arriba
  - Teléfono click-to-call: 925 671 052
  - WhatsApp con botón
  - Email: mudanzasexpresoqhapaq@gmail.com
  - Dirección con enlace a Google Maps
  - Horario de atención
- Formulario general (nombre, email, teléfono, asunto, mensaje)
- Formulario empresarial extendido (con campo de RUC, fecha tentativa, etc.)
- Mapa Google Maps embebido

**Schema.org:** `ContactPage` + `LocalBusiness`.

### Tarea 2.4 — Componentes reutilizables nuevos

Crear estos componentes que se usarán en muchas páginas:

- `src/components/Hero.astro` — Hero genérico con título, subtítulo, CTAs y imagen
- `src/components/ServiceCard.astro` — Tarjeta de servicio
- `src/components/TestimonialCarousel.astro` — Carrusel de testimonios
- `src/components/CTASection.astro` — Sección de llamada a la acción final
- `src/components/Breadcrumbs.astro` — Breadcrumbs con Schema.org BreadcrumbList
- `src/components/ContactForm.astro` — Formulario de contacto
- `src/components/SchemaLocalBusiness.astro` — JSON-LD reutilizable

### Tarea 2.5 — Páginas de error 404 y 500

Crear `src/pages/404.astro`:

- Mensaje amigable: "Esta página se mudó (¡como nosotros!)"
- Buscador opcional
- Enlaces a páginas principales
- CTA WhatsApp: "Si necesitas ayuda, contáctanos"

Crear `src/pages/500.astro` similar.

### Tarea 2.6 — Implementar formulario de contacto funcional

Opción recomendada: Web3Forms (gratis hasta 250 envíos/mes).

```astro
<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value={import.meta.env.WEB3FORMS_ACCESS_KEY} />
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <input type="tel" name="phone" />
  <textarea name="message" required></textarea>
  <input type="hidden" name="botcheck" /> <!-- honeypot -->
  <button type="submit">Enviar</button>
</form>
```

Configurar redirección de éxito y manejo de errores.

### Tarea 2.7 — Optimización de imágenes existentes

Usar las imágenes del WordPress actual descargadas previamente. Colocarlas en `public/wp-content/uploads/2024/05/` para preservar URLs SEO.

Para uso en componentes Astro, importarlas y procesarlas con `<Image>`:

```astro
---
import { Image } from 'astro:assets';
import camionGrande from '@/assets/camion-mudanza.jpg';
---

<Image src={camionGrande} alt="Camión de mudanzas Expreso Ñan en Cusco" widths={[400, 800, 1200]} />
```

## Criterios de Aceptación del Sprint

- [ ] Las 5 páginas (`/`, `/about/`, `/contact/`, `/404`, `/500`) están en staging
- [ ] Todas con Lighthouse Performance ≥ 95, SEO = 100
- [ ] Schema.org sin errores en Rich Results Test
- [ ] Meta tags exactos del WordPress preservados
- [ ] Formulario de contacto funcional (envío de prueba exitoso)
- [ ] WhatsApp button con mensajes contextuales por página
- [ ] Diseño aprobado visualmente por el cliente
- [ ] Responsive verificado en móvil real (no solo DevTools)

## Verificación

```bash
npm run build
npm run preview
# Probar cada URL, llenar formulario, validar Schema en https://search.google.com/test/rich-results
```

## Siguiente Sprint

**[SPRINT-03 — Páginas de Servicios](SPRINT-03-services.md)**
