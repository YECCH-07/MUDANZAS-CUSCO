# SPRINT 12 — Lanzamiento y Monitoreo Intensivo

**Duración:** 5 días (Semana 13 + monitoreo de las primeras 72h)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-11 completado y sign-off del cliente.

## Objetivo

Lanzar la nueva web a producción sustituyendo al WordPress actual, sin perder posicionamiento SEO, sin downtime apreciable, con monitoreo intensivo de las primeras 72 horas y reporte completo a 30 días.

## Día D — Cronograma del Lanzamiento

### 08:00 — Preparativos

```bash
# Verificar staging por última vez
curl -I https://staging.cuscomudanzas.com

# Confirmar backup full del WordPress
ls -lh /var/backups/wordpress-cuscomudanzas-*.tar.gz

# Notificar al cliente y al equipo
echo "Iniciamos migración a las 09:00. ETA: 8 horas de trabajo."
```

### 08:30 — Pausa de publicaciones en WP

- Coordinar con cliente para no publicar contenido nuevo en WP durante la migración.
- Tomar último snapshot de la base de datos MySQL del WP.

### 09:00 — Cambio de raíz del dominio (CRÍTICO)

En el VPS, editar `/etc/nginx/conf.d/cuscomudanzas.com.conf`:

```nginx
# ANTES:
# root /home/cuscomudanzas/public_html;  # WordPress

# DESPUÉS:
root /var/www/cuscomudanzas/dist;  # Astro
index index.html;
```

```bash
# Verificar configuración
nginx -t

# Recargar Nginx (sin downtime)
systemctl reload nginx
```

### 09:15 — Verificación inmediata

```bash
# Probar el sitio
curl -I https://cuscomudanzas.com

# Verificar contenido
curl https://cuscomudanzas.com/ | head -50

# Verificar URLs preservadas
curl -I https://cuscomudanzas.com/about/
curl -I https://cuscomudanzas.com/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/
curl -I https://cuscomudanzas.com/mudanza-provincia/
curl -I https://cuscomudanzas.com/mudanzas-de-o/
```

Todas deben retornar `200 OK`.

### 09:30 — Verificación HTTPS

```bash
curl -vI https://cuscomudanzas.com 2>&1 | grep -i "ssl\|tls\|HTTP/"
```

Verificar headers de seguridad:
```bash
curl -I https://cuscomudanzas.com 2>&1 | grep -E "Strict-Transport|X-Frame|X-Content|Referrer"
```

### 09:45 — Sitemap

```bash
curl https://cuscomudanzas.com/sitemap-index.xml
```

Debe ser válido y listar todas las URLs.

### 10:00 — Subir sitemap en Search Console

1. Ir a https://search.google.com/search-console
2. Propiedad cuscomudanzas.com
3. Sitemaps → Agregar nuevo: `sitemap-index.xml`
4. Verificar que se procesa sin errores

### 10:15 — Subir sitemap en Bing Webmaster

https://www.bing.com/webmasters → Agregar sitemap.

### 10:30 — Solicitar reindexación de TOP 10 URLs

En Search Console, para cada URL crítica:
1. URL Inspection → pegar URL
2. Request Indexing

URLs prioritarias:
- `/`
- `/about/`
- `/contact/`
- `/projects/`
- `/preguntas-frecuentes/`
- `/servicio-de-caraga-flete-y-mudanza-cusco/`
- `/mudanzas-locales-en-cusco-...`
- `/mudanza-provincia/`
- `/mudanzas-de-o/`
- `/almacenaje-y-custodia-cusco/`

### 11:00 — Crawl de validación

```bash
# Desde local (Screaming Frog o similar)
# Crawlear https://cuscomudanzas.com
# Comparar contra crawl pre-lanzamiento
```

Verificar que NO aparecieron URLs 404 nuevas.

### 11:30 — Schema.org en producción

https://search.google.com/test/rich-results

Probar:
- `https://cuscomudanzas.com/` → debe detectar LocalBusiness
- `https://cuscomudanzas.com/preguntas-frecuentes/` → debe detectar FAQPage
- Cualquier landing → debe detectar Service y Breadcrumb

### 12:00 — Lighthouse en producción real

```bash
npx lighthouse https://cuscomudanzas.com --view
npx lighthouse https://cuscomudanzas.com/mudanzas-locales-en-cusco-... --view
```

Resultado esperado: Performance ≥ 95, SEO = 100.

### 12:30 — PageSpeed Insights real

https://pagespeed.web.dev/?url=https%3A%2F%2Fcuscomudanzas.com

Core Web Vitals todos en verde.

### 13:00 — Pausa para lunch + monitoreo continuo

Mantener un terminal abierto con `tail -f /var/log/nginx/cuscomudanzas-access.log` y `tail -f /var/log/nginx/cuscomudanzas-error.log` para detectar cualquier 404, 500 o error inesperado.

### 14:00 — Verificar Google Analytics 4

Abrir GA4 en tiempo real y confirmar que se reciben pageviews del nuevo sitio.

### 14:30 — Verificar Meta Pixel

https://www.facebook.com/business/help/449646839087411 → "Test Events"

Confirmar que el pixel se dispara correctamente.

### 15:00 — Probar formularios desde IP externa

Llenar el formulario de contacto desde una conexión móvil (no Wi-Fi de la oficina). Confirmar email recibido.

### 15:30 — Probar WhatsApp en móvil real

Hacer clic en el botón flotante de WhatsApp desde un celular. Verificar que abre WhatsApp con número y mensaje correctos.

### 16:00 — Comunicación oficial

- Publicar en Facebook, Instagram y TikTok: "¡Hemos renovado nuestra web!"
- Enviar email a clientes recurrentes (si hay base).
- Pedir a clientes recientes que dejen reseñas en Google Business.

### 17:00 — Cierre del día con reporte

Enviar al cliente:
- ✅ Migración completada exitosamente
- ✅ URLs preservadas funcionando
- ✅ Sitemap enviado a Google y Bing
- ✅ Lighthouse 95+ en home
- ✅ Schema.org validado
- ✅ Sin errores en logs
- 📊 Resumen de pageviews del día
- 🔍 Próximas 72 horas: monitoreo intensivo

## Días D+1 a D+3 — Monitoreo Intensivo (72 horas)

### Cada 2 horas

```bash
# Verificar uptime
curl -I https://cuscomudanzas.com | head -1

# Revisar errores en logs
tail -100 /var/log/nginx/cuscomudanzas-error.log

# Verificar Search Console
# → Coverage → ¿hay nuevos errores?
# → Performance → ¿impresiones se mantienen?
```

### Cada día

- Reporte diario al cliente con métricas
- Revisar Search Console para errores 404 nuevos
- Revisar Analytics para anomalías de tráfico
- Si tráfico orgánico cae > 30% sin causa externa identificable → considerar rollback

## Días D+4 a D+30 — Monitoreo Diario

- Reporte semanal al cliente
- Identificar páginas que pierdan posiciones para investigar
- Resolver cualquier 404 que aparezca con redirección 301

## Día D+30 — Reporte de 30 días

Generar reporte completo:
- Tráfico orgánico vs WP anterior (mismo periodo)
- Posiciones de top 20 keywords
- Páginas indexadas vs sitemap enviado
- Core Web Vitals reales
- Conversiones (clics WhatsApp, formularios)
- Errores resueltos
- Errores pendientes
- Próximos pasos

## Plan de Rollback (si fuera necesario en las primeras 72h)

**Cuándo ejecutar:**
- Caída de tráfico orgánico > 30% no explicable por algoritmo de Google
- Errores 500 sistemáticos
- Search Console reporta > 50 URLs no indexables nuevas
- Cliente solicita rollback formal

**Procedimiento (15-30 minutos):**

```bash
# 1. Cambiar raíz del dominio de vuelta a WordPress
sudo nano /etc/nginx/conf.d/cuscomudanzas.com.conf
# Restaurar root al path del WP

# 2. Verificar configuración
sudo nginx -t

# 3. Recargar
sudo systemctl reload nginx

# 4. Verificar que WP responde
curl -I https://cuscomudanzas.com

# 5. Notificar al cliente
echo "Rollback completado. Sitio sirviendo desde WordPress respaldado."

# 6. Mantener Astro dist/ intacto para análisis post-mortem
```

## Día D+90 — Cierre Formal del Proyecto

- Reporte final con conclusiones
- Comparativa de KPIs vs metas del DRU
- Liberación del backup del WordPress (mover a archivo histórico, no en producción)
- Capacitación al cliente para mantenimiento continuo del sitio
- Acta de cierre firmada por ambas partes
- Pago final liberado (si aplica)

## Criterios de Aceptación del Sprint

- [ ] Lanzamiento ejecutado sin downtime apreciable
- [ ] URLs preservadas funcionando 100%
- [ ] Sitemap enviado a Google + Bing
- [ ] Top 10 URLs reindexadas
- [ ] Schema.org válido en producción
- [ ] Lighthouse 95+ en producción
- [ ] Sin errores 500 en las primeras 72h
- [ ] Tráfico orgánico mantiene niveles esperados
- [ ] Cliente satisfecho con migración

## Post-Lanzamiento (Semanas 14-26)

- Producción de 2-4 artículos de blog/mes
- Reportes mensuales SEO
- Monitoreo continuo
- Optimización iterativa
- Eventual apertura de rutas próximamente cuando operación lo permita

🎉 **¡Felicidades! El proyecto está en producción y posicionado para crecer.**

## Siguientes Sprints (post-lanzamiento, no incluidos en el plan original)

- **SPRINT-13:** Optimización post-lanzamiento basada en datos reales
- **SPRINT-14:** Apertura de ruta Cusco-Arequipa (cuando operación esté lista)
- **SPRINT-15:** Expansión del blog a 30+ artículos
- **SPRINT-16:** Implementación de panel de cliente (opcional)
