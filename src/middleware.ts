/*
 * Middleware global. Se ejecuta en cada request (estática o SSR).
 *
 * Para rutas bajo /panel/** y /api/panel/**:
 *  - Valida cookie de sesión
 *  - Deniega con 401/redirect si no autenticado
 *  - Verifica RBAC (matriz de permisos por rol)
 *  - Popula Astro.locals.user y Astro.locals.session
 *
 * Rutas públicas:
 *  - No toca cookies, no consulta DB
 *  - Deja Astro.locals.user = null
 *
 * Ver PANEL-INTERNO.md §7.
 */
import { defineMiddleware } from 'astro:middleware';
import { readSessionCookie, validateSession, clearSessionCookie } from '@lib/auth/session';
import { canAccess, dashboardPathFor } from '@lib/auth/rbac';
import { startCron } from '@lib/panel/cron';

// Arranca los cronjobs una sola vez al recibir la primera request SSR.
// En entornos tipo Astro dev el módulo puede recargarse; `startCron` es
// idempotente internamente.
let cronBooted = false;
function ensureCron(): void {
  if (cronBooted) return;
  cronBooted = true;
  try {
    startCron();
  } catch (err) {
    console.error('[middleware] cron bootstrap failed:', err);
  }
}

const PANEL_PREFIX = '/panel/';
const PANEL_API_PREFIX = '/api/panel/';
const LOGIN_PATH = '/panel/login/';

// Normaliza quitando trailing slash final para comparar (Astro puede agregarlo
// o no según `trailingSlash: 'always'`).
function normalize(pathname: string): string {
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

function isPanelRoute(pathname: string): boolean {
  return pathname.startsWith(PANEL_PREFIX) || pathname.startsWith(PANEL_API_PREFIX);
}

function isPublicPanelRoute(pathname: string): boolean {
  const n = normalize(pathname);
  return n === normalize(LOGIN_PATH) || n === '/api/panel/login';
}

function isLogoutRoute(pathname: string): boolean {
  return normalize(pathname) === '/api/panel/logout';
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.user = null;
  ctx.locals.session = null;

  const { pathname } = ctx.url;

  // Rutas que no son del panel: pasar sin auth.
  if (!isPanelRoute(pathname)) {
    return next();
  }

  ensureCron();

  const sessionId = readSessionCookie(ctx.cookies);
  const session = sessionId ? await validateSession(sessionId) : null;

  // Rutas públicas del panel (login) y logout (debe funcionar siempre).
  if (isPublicPanelRoute(pathname) || isLogoutRoute(pathname)) {
    if (session && normalize(pathname) === normalize(LOGIN_PATH)) {
      // Ya autenticado visitando /login/: redirigir al dashboard.
      return ctx.redirect(dashboardPathFor(session.user.role));
    }
    if (session) {
      ctx.locals.user = session.user;
      ctx.locals.session = session.session;
    }
    return next();
  }

  // Rutas protegidas: requieren sesión válida.
  if (!session) {
    clearSessionCookie(ctx.cookies);
    if (pathname.startsWith(PANEL_API_PREFIX)) {
      return new Response(JSON.stringify({ error: 'no autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const next_ = encodeURIComponent(pathname + ctx.url.search);
    return ctx.redirect(`${LOGIN_PATH}?next=${next_}`);
  }

  // RBAC: rol tiene permiso para este path.
  if (!canAccess(session.user.role, pathname)) {
    if (pathname.startsWith(PANEL_API_PREFIX)) {
      return new Response(JSON.stringify({ error: 'prohibido' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return ctx.redirect(dashboardPathFor(session.user.role));
  }

  // Forzar cambio de contraseña en el primer login si aplica.
  if (
    session.user.mustChangePassword &&
    !pathname.startsWith('/panel/mi-cuenta/cambiar-password') &&
    normalize(pathname) !== '/api/panel/change-password'
  ) {
    return ctx.redirect('/panel/mi-cuenta/cambiar-password/');
  }

  // Origin check para POST/PATCH/DELETE (mitigación CSRF dado SameSite=Strict).
  // Aceptamos el origen del propio request (siempre same-origin desde nuestros
  // forms) más cualquier alias declarado en SITE_URL (coma-separado opcional).
  // Si no hay header Origin (p.ej. tools de servidor), no bloqueamos.
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(ctx.request.method)) {
    const origin = ctx.request.headers.get('origin');
    if (origin) {
      const allowed = new Set<string>([ctx.url.origin]);
      const extra = process.env.SITE_URL;
      if (extra) {
        for (const u of extra.split(',')) {
          const t = u.trim();
          if (t) allowed.add(t.replace(/\/+$/, ''));
        }
      }
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (!allowed.has(normalizedOrigin)) {
        return new Response(JSON.stringify({ error: 'origen no válido' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  ctx.locals.user = session.user;
  ctx.locals.session = session.session;

  return next();
});
