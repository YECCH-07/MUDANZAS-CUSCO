# Comandos Frecuentes — Cheatsheet

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4321)
npm run dev

# Build de producción (genera /dist)
npm run build

# Servir build localmente
npm run preview

# Build + preview en un comando
npm run build && npm run preview
```

## Calidad de Código

```bash
# Linter
npm run lint

# Linter con auto-fix
npm run lint:fix

# Formateador
npm run format

# TypeScript check
npm run typecheck

# Todo (lint + typecheck + build)
npm run ci
```

## Git

```bash
# Crear rama nueva
git checkout -b feat/nombre-feature

# Commits con formato Conventional Commits
git commit -m "feat: agregar página de almacenaje"
git commit -m "fix: corregir mensaje WhatsApp en página inglés"
git commit -m "docs: actualizar README"
git commit -m "refactor: extraer ServiceCard a componente"
git commit -m "test: agregar test para calculadora de espacio"
git commit -m "chore: actualizar dependencias"

# Push (dispara CI)
git push origin feat/nombre-feature

# Merge a develop (staging)
git checkout develop
git merge feat/nombre-feature
git push origin develop

# Merge a main (producción)
git checkout main
git merge develop
git push origin main  # → dispara deploy a producción
```

## Astro

```bash
# Agregar integración
npx astro add tailwind
npx astro add sitemap
npx astro add mdx

# Verificar tipos del proyecto
npx astro check

# Información del proyecto
npx astro info
```

## Auditoría SEO

```bash
# Lighthouse CLI (instalar con: npm i -g lighthouse)
lighthouse https://staging.cuscomudanzas.com --view

# Solo SEO category
lighthouse https://staging.cuscomudanzas.com --only-categories=seo --view

# Múltiples páginas
for url in / /about/ /contact/ /mudanzas-wanchaq/; do
  lighthouse https://staging.cuscomudanzas.com$url --output html --output-path "./audits/${url//\//_}.html" --quiet
done

# Validar Schema.org
# https://search.google.com/test/rich-results

# Validar hreflang
# https://technicalseo.com/tools/hreflang/

# Validar Open Graph
# https://www.opengraph.xyz/

# Test de velocidad PageSpeed Insights
# https://pagespeed.web.dev/?url=https%3A%2F%2Fstaging.cuscomudanzas.com
```

## Servidor (VPS) — Operaciones Frecuentes

```bash
# Conectarse al VPS
ssh deploy@50.31.190.36 -p 2222

# Logs de Nginx
sudo tail -f /var/log/nginx/cuscomudanzas-access.log
sudo tail -f /var/log/nginx/cuscomudanzas-error.log

# Verificar configuración Nginx
sudo nginx -t

# Recargar Nginx (sin downtime)
sudo systemctl reload nginx

# Reiniciar Nginx (con downtime breve)
sudo systemctl restart nginx

# Estado de servicios
sudo systemctl status nginx
sudo systemctl status fail2ban
sudo systemctl status certbot-renew.timer

# Renovar SSL manualmente
sudo certbot renew

# Probar renovación SSL
sudo certbot renew --dry-run

# Espacio en disco
df -h

# Memoria
free -h

# Procesos top
top
htop

# Verificar puertos abiertos
sudo ss -tulnp

# Firewall status
sudo firewall-cmd --list-all
```

## Backup y Restauración

```bash
# Crear backup manual
sudo /usr/local/bin/backup-cuscomudanzas.sh

# Listar backups
ls -lht /var/backups/cuscomudanzas/

# Restaurar backup específico
sudo tar -xzf /var/backups/cuscomudanzas/site-20260423-150000.tar.gz -C /

# Backup de base de datos WP (si aún existe)
mysqldump -u user -p wp_database > wp-backup-$(date +%Y%m%d).sql
```

## Cloudflare (vía API o Dashboard)

```bash
# Purgar caché completo (manual: dashboard → Caching → Configuration → Purge everything)

# Purgar URL específica vía API
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://cuscomudanzas.com/blog/"]}'

# Modo bajo desarrollo (deshabilita caché por 3h)
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/development_mode" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"on"}'
```

## Formularios (Web3Forms)

```bash
# Probar formulario manualmente
curl -X POST https://api.web3forms.com/submit \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "TU_KEY",
    "name": "Test",
    "email": "test@test.com",
    "message": "Mensaje de prueba"
  }'
```

## Monitoreo

```bash
# Verificar uptime (curl simple)
curl -I https://cuscomudanzas.com | head -1

# Verificar SSL expiration
echo | openssl s_client -servername cuscomudanzas.com -connect cuscomudanzas.com:443 2>/dev/null | openssl x509 -noout -dates

# Verificar headers de seguridad
curl -I https://cuscomudanzas.com 2>&1 | grep -E "Strict-Transport|X-Frame|X-Content|Referrer|Permissions"

# Verificar redirección
curl -IL https://cuscomudanzas.com 2>&1 | grep -i "Location\|HTTP"

# Verificar tiempo de respuesta
curl -w "@-" -o /dev/null -s https://cuscomudanzas.com <<< 'time_total: %{time_total}\n'
```

## Búsqueda en Logs

```bash
# Errores 4xx
sudo grep -E " 4[0-9]{2} " /var/log/nginx/cuscomudanzas-access.log | tail -50

# Errores 5xx
sudo grep -E " 5[0-9]{2} " /var/log/nginx/cuscomudanzas-access.log | tail -50

# Top URLs visitadas (último día)
sudo awk '{print $7}' /var/log/nginx/cuscomudanzas-access.log | sort | uniq -c | sort -rn | head -20

# IPs más activas
sudo awk '{print $1}' /var/log/nginx/cuscomudanzas-access.log | sort | uniq -c | sort -rn | head -20

# Bots de Google que visitaron
sudo grep -i "googlebot" /var/log/nginx/cuscomudanzas-access.log | tail -50
```

## Search Console (URLs útiles)

```
https://search.google.com/search-console
  → Performance: ver impresiones, clics, CTR
  → Coverage: páginas indexadas vs errores
  → Sitemaps: estado de procesamiento
  → URL Inspection: estado de cualquier URL específica
  → Removals: solicitar eliminación de URL
```

## Astro Content Collections

```bash
# Generar tipos automáticos para Content Collections
npx astro sync

# Validar contenido contra schema
npx astro check
```

## Deploy Manual de Emergencia

```bash
# Si CI/CD falla, deploy manual desde local:

# 1. Build local
npm run build

# 2. Subir vía rsync
rsync -avz --delete dist/ deploy@50.31.190.36:/var/www/cuscomudanzas/dist/ -e "ssh -p 2222"

# 3. Verificar
curl -I https://cuscomudanzas.com
```

## Atajos de Claude Code

```
> Lee el SPRINT-XX y empieza a ejecutar las tareas
> Muéstrame el estado del proyecto según ROADMAP.md
> Genera el componente <ServiceCard> según la spec del SPRINT-02
> Audita esta página con Lighthouse y reporta hallazgos
> Crea redirección 301 para [URL antigua] → [URL nueva]
> Valida el Schema.org de esta página
```
