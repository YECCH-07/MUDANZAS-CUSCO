/*
 * Matriz de permisos rol ↔ rutas del panel.
 * Superadmin implícitamente puede todo; los demás roles solo sus prefijos.
 */
import type { UserRole } from '@db/schema';

/**
 * Prefijos que cada rol puede visitar. El chequeo es por startsWith.
 * `/panel/` (raíz) siempre accesible para cualquiera autenticado — redirige
 * al dashboard apropiado.
 */
const ROLE_PREFIXES: Record<UserRole, readonly string[]> = {
  superadmin: ['/panel/', '/api/panel/'],
  cotizador: [
    '/panel/',
    '/panel/cotizador/',
    '/panel/mi-cuenta/',
    '/api/panel/cotizador/',
    '/api/panel/customers/',
    '/api/panel/quotes/',
    '/api/panel/quote-templates/',
    '/api/panel/jobs/',
    '/api/panel/receipts/',
    '/api/panel/logout/',
    '/api/panel/upload-url/',
    '/api/panel/search/',
    '/api/panel/sessions/',
    '/api/panel/change-password/',
  ],
  conductor: [
    '/panel/',
    '/panel/conductor/',
    '/panel/mi-cuenta/',
    '/api/panel/conductor/',
    '/api/panel/daily-entries/',
    '/api/panel/entry-items/',
    '/api/panel/trips/',
    '/api/panel/pre-trip/',
    '/api/panel/route-status/',
    '/api/panel/logout/',
    '/api/panel/upload-url/',
    '/api/panel/sessions/',
    '/api/panel/change-password/',
  ],
};

/**
 * @returns true si el usuario con `role` puede acceder a `pathname`.
 *   Convención: rutas bajo /panel/admin/ solo superadmin.
 */
export function canAccess(role: UserRole, pathname: string): boolean {
  // Áreas admin explícitas: solo superadmin.
  if (pathname.startsWith('/panel/admin/') || pathname.startsWith('/api/panel/admin/')) {
    return role === 'superadmin';
  }
  if (role === 'superadmin') return true;
  return ROLE_PREFIXES[role].some((prefix) => pathname.startsWith(prefix));
}

/**
 * Dashboard por rol al que redirigir desde `/panel/` o tras login.
 */
export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case 'superadmin':
      return '/panel/admin/';
    case 'cotizador':
      return '/panel/cotizador/';
    case 'conductor':
      return '/panel/conductor/hoy/';
  }
}
