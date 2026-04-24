# SPRINT 10 — Configuración del VPS y Deploy Continuo

**Duración:** 5 días (Semana 12)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-09 completado.

## Objetivo

Configurar el VPS AlmaLinux 9.7 (con Webuzo Premium ya instalado) para servir el sitio Astro estático, configurar HTTPS, Cloudflare como CDN, GitHub Actions para CI/CD, backups automáticos y monitoreo. El sitio debe quedar listo en `staging.cuscomudanzas.com` para QA.

## Datos del VPS

- IP: `50.31.190.36`
- Hostname: `vps1.cuscomudanzas.com`
- OS: AlmaLinux 9.7
- Panel: Webuzo Premium 4.6.3
- Recursos: 4 CPU, 8GB RAM, 160GB SSD

## Tareas

### Tarea 10.1 — Conectarse al VPS por SSH

```bash
# Si no tienes clave SSH:
ssh-keygen -t ed25519 -C "tu-email@dominio.com"

# Copiar clave pública al VPS
ssh-copy-id root@50.31.190.36

# Conectar
ssh root@50.31.190.36

# Una vez dentro, verificar:
hostname
cat /etc/os-release
df -h
free -h
```

**IMPORTANTE:** Crear un usuario no-root para deploy:

```bash
useradd -m -s /bin/bash deploy
passwd deploy
usermod -aG wheel deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Probar: `ssh deploy@50.31.190.36`.

### Tarea 10.2 — Hardening básico de SSH

Editar `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # cambiar puerto SSH (custom)
```

```bash
systemctl reload sshd
```

Configurar Fail2ban:

```bash
dnf install -y fail2ban
systemctl enable --now fail2ban
```

### Tarea 10.3 — Instalar Nginx (independiente del Apache de Webuzo)

```bash
dnf install -y nginx
```

**Coexistencia con Webuzo:** Webuzo usa Apache en puertos 80/443 para los otros 13 dominios. Tenemos dos opciones:

**Opción A (recomendada):** Nginx delante como reverse proxy de Apache.
- Nginx escucha en :80 y :443.
- Para `cuscomudanzas.com` sirve directo los archivos estáticos.
- Para los demás dominios pasa al Apache de Webuzo (escuchando en :8080).

**Opción B:** Nginx solo para cuscomudanzas.com en un puerto interno y proxy desde Webuzo.

Aquí documentamos Opción A.

### Tarea 10.4 — Mover Apache de Webuzo a puerto interno

Ajustar configuración de Apache en Webuzo para que escuche en `:8080` en lugar de `:80`. Esto se hace desde el panel Webuzo.

**Backup primero:**
```bash
cp /usr/local/apps/apache/conf/httpd.conf /usr/local/apps/apache/conf/httpd.conf.bak
```

Cambiar `Listen 80` por `Listen 8080`. Ajustar VirtualHosts. Reiniciar Apache.

### Tarea 10.5 — Configuración de Nginx para cuscomudanzas.com

Crear `/etc/nginx/conf.d/cuscomudanzas.com.conf`:

```nginx
# Redirección HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name cuscomudanzas.com www.cuscomudanzas.com;
    return 301 https://cuscomudanzas.com$request_uri;
}

# Redirección www → no-www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.cuscomudanzas.com;

    ssl_certificate /etc/letsencrypt/live/cuscomudanzas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cuscomudanzas.com/privkey.pem;

    return 301 https://cuscomudanzas.com$request_uri;
}

# Sitio principal HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cuscomudanzas.com;

    root /var/www/cuscomudanzas/dist;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/cuscomudanzas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cuscomudanzas.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Compresión Brotli (si módulo disponible) o Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss image/svg+xml;
    gzip_min_length 1024;

    # Caché de assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|webp|avif|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML: caché corto
    location / {
        try_files $uri $uri/index.html $uri/ =404;
        add_header Cache-Control "public, max-age=300, must-revalidate";
    }

    # Sitemap, robots
    location = /sitemap-index.xml {
        add_header Cache-Control "public, max-age=3600";
    }
    location = /robots.txt {
        add_header Cache-Control "public, max-age=3600";
    }

    # Redirecciones SEO de URLs antiguas WordPress
    location = /feed/ { return 301 /blog/rss.xml; }
    location ~ ^/wp-login.php { return 410; }
    location ~ ^/wp-admin { return 410; }
    location = /comments/feed/ { return 410; }

    # Imágenes legacy de WordPress (preservar)
    # Las URLs /wp-content/uploads/... se sirven directo desde public/

    # 404 personalizada
    error_page 404 /404/index.html;
    error_page 500 502 503 504 /500/index.html;

    # Logs
    access_log /var/log/nginx/cuscomudanzas-access.log;
    error_log /var/log/nginx/cuscomudanzas-error.log;
}
```

### Tarea 10.6 — Crear estructura de carpetas en VPS

```bash
mkdir -p /var/www/cuscomudanzas/{dist,wp_backup,logs}
chown -R deploy:nginx /var/www/cuscomudanzas
chmod -R 755 /var/www/cuscomudanzas
```

### Tarea 10.7 — Instalar Certbot y obtener certificado SSL

```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d cuscomudanzas.com -d www.cuscomudanzas.com
```

Configurar renovación automática:

```bash
systemctl enable --now certbot-renew.timer
```

Verificar: `certbot renew --dry-run`.

### Tarea 10.8 — Configurar firewall

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=2222/tcp  # SSH custom
firewall-cmd --reload
```

### Tarea 10.9 — Configurar Cloudflare

1. Crear cuenta gratuita en cloudflare.com.
2. Agregar dominio `cuscomudanzas.com`.
3. Cambiar nameservers en el registrar del dominio.
4. Configurar:
   - DNS A record: `cuscomudanzas.com` → `50.31.190.36` (proxied: orange cloud ON)
   - DNS A record: `www.cuscomudanzas.com` → `50.31.190.36` (proxied)
   - SSL/TLS mode: **Full (strict)**
   - Always Use HTTPS: ON
   - Auto Minify: HTML, CSS, JS
   - Brotli: ON
   - Browser Cache TTL: 4 hours
   - Page Rule (opcional): cache HTML por 5 minutos

### Tarea 10.10 — GitHub Actions deploy workflow

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          PUBLIC_PHONE: ${{ secrets.PUBLIC_PHONE }}
          PUBLIC_WHATSAPP: ${{ secrets.PUBLIC_WHATSAPP }}
          PUBLIC_GA4_ID: ${{ secrets.PUBLIC_GA4_ID }}
          PUBLIC_META_PIXEL_ID: ${{ secrets.PUBLIC_META_PIXEL_ID }}
          WEB3FORMS_ACCESS_KEY: ${{ secrets.WEB3FORMS_ACCESS_KEY }}

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avzr --delete
          path: dist/
          remote_path: /var/www/cuscomudanzas/dist/
          remote_host: ${{ secrets.SSH_HOST }}
          remote_port: ${{ secrets.SSH_PORT }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Notify success
        if: success()
        run: echo "Deploy completado a producción"
```

Configurar secrets en GitHub: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, y todas las variables `PUBLIC_*`.

### Tarea 10.11 — Setup de staging

Crear subdominio `staging.cuscomudanzas.com` apuntando al VPS, con su propia config Nginx en `/etc/nginx/conf.d/staging.cuscomudanzas.com.conf`.

Carpeta `/var/www/cuscomudanzas-staging/dist/`.

Workflow GitHub Actions separado que se dispara con push a rama `develop`.

**IMPORTANTE:** Staging debe tener `robots.txt` con `Disallow: /` para no ser indexado.

### Tarea 10.12 — Backups automáticos

Crear `/usr/local/bin/backup-cuscomudanzas.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/var/backups/cuscomudanzas

mkdir -p $BACKUP_DIR

# Backup del sitio compilado
tar -czf $BACKUP_DIR/site-$DATE.tar.gz /var/www/cuscomudanzas/dist /etc/nginx/conf.d/cuscomudanzas.com.conf

# Mantener solo últimos 30 backups locales
ls -t $BACKUP_DIR/site-*.tar.gz | tail -n +31 | xargs -r rm

# Subir a Backblaze B2 (configurar b2 cli previamente)
# b2 upload-file mi-bucket $BACKUP_DIR/site-$DATE.tar.gz site-$DATE.tar.gz

echo "Backup completado: $BACKUP_DIR/site-$DATE.tar.gz"
```

```bash
chmod +x /usr/local/bin/backup-cuscomudanzas.sh

# Cron diario a las 3 AM
echo "0 3 * * * /usr/local/bin/backup-cuscomudanzas.sh >> /var/log/backup-cuscomudanzas.log 2>&1" | crontab -
```

### Tarea 10.13 — UptimeRobot

1. Crear cuenta gratuita en uptimerobot.com.
2. Agregar monitor HTTPS para `https://cuscomudanzas.com` (intervalo 5 min).
3. Configurar alertas a email + WhatsApp (vía webhook a Twilio o similar).

### Tarea 10.14 — Probar deploy completo

```bash
# Desde local
git push origin develop  # → debe disparar deploy a staging
git push origin main     # → debe disparar deploy a producción

# Verificar
curl -I https://staging.cuscomudanzas.com
curl -I https://cuscomudanzas.com
```

## Criterios de Aceptación

- [ ] SSH endurecido (sin root, sin password, puerto custom)
- [ ] Nginx funcional, coexistiendo con Webuzo/Apache
- [ ] HTTPS con Let's Encrypt, renovación automática
- [ ] Cloudflare configurado con SSL Full Strict
- [ ] Headers de seguridad (probado en securityheaders.com → A o A+)
- [ ] Compresión Brotli/Gzip activa
- [ ] Caché de assets configurado
- [ ] GitHub Actions deploy a staging y producción funcional
- [ ] Backup diario automático probado (restauración exitosa de prueba)
- [ ] UptimeRobot monitoreando 24/7
- [ ] Staging accesible y NO indexable
- [ ] Producción aún sirviendo el WordPress actual (NO se ha cambiado raíz aún)

## Siguiente Sprint

**[SPRINT-11 — QA y Pre-Lanzamiento](SPRINT-11-qa-prelaunch.md)**
