/*
 * Helpers del flujo del conductor: obtener su(s) unidad(es) asignada(s) y
 * el daily_entry activo del día.
 */
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { driverAssignments, units, dailyEntries, preTripChecks } from '@db/schema';

export interface ActiveAssignment {
  assignmentId: string;
  unitId: string;
  plate: string;
  tonnage: number;
  alias: string | null;
  startsAt: string;
}

/** Unidades actualmente asignadas al conductor (endsAt IS NULL). */
export async function getActiveAssignments(userId: string): Promise<ActiveAssignment[]> {
  const rows = await db
    .select({
      assignmentId: driverAssignments.id,
      unitId: driverAssignments.unitId,
      plate: units.plate,
      tonnage: units.tonnage,
      alias: units.alias,
      startsAt: driverAssignments.startsAt,
    })
    .from(driverAssignments)
    .innerJoin(units, eq(units.id, driverAssignments.unitId))
    .where(
      and(
        eq(driverAssignments.userId, userId),
        isNull(driverAssignments.endsAt),
        eq(units.active, true),
      ),
    )
    .all();
  return rows;
}

/**
 * Devuelve el daily_entry activo para (userId, unitId, entryDate) o null.
 * "activo" = existe y aún no cerrado.
 */
export async function getDailyEntry(userId: string, unitId: string, entryDate: string) {
  return db
    .select()
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.driverId, userId),
        eq(dailyEntries.unitId, unitId),
        eq(dailyEntries.entryDate, entryDate),
      ),
    )
    .get();
}

/** Pre-trip check del día para una unidad, si existe. */
export async function getPreTripCheck(unitId: string, entryDate: string) {
  return db
    .select()
    .from(preTripChecks)
    .where(and(eq(preTripChecks.unitId, unitId), eq(preTripChecks.entryDate, entryDate)))
    .get();
}

/**
 * Catálogo fijo de ítems del pre-trip checklist.
 * Los primeros 5 son críticos (fail = blocker).
 * Admin puede extender en PANEL-03 (§3.x) sin tocar código.
 */
export const PRETRIP_ITEMS = [
  { key: 'llantas', label: 'Presión y estado de llantas (incluye repuesto)', critical: true },
  { key: 'luces', label: 'Luces (altas, bajas, direccionales, freno)', critical: true },
  { key: 'frenos', label: 'Frenos responden correctamente', critical: true },
  { key: 'soat', label: 'SOAT vigente a bordo', critical: true },
  { key: 'tarjeta', label: 'Tarjeta de propiedad a bordo', critical: true },
  { key: 'combustible', label: 'Nivel de combustible suficiente', critical: false },
  { key: 'mantas', label: 'Mantas operativas (mínimo 6)', critical: false },
  { key: 'correas', label: 'Correas (mínimo 4)', critical: false },
  { key: 'carretilla', label: 'Carretilla disponible', critical: false },
  { key: 'botiquin', label: 'Botiquín y triángulos de seguridad', critical: false },
] as const;

export type PreTripItemStatus = 'ok' | 'fail' | 'na';

export interface PreTripItemAnswer {
  key: string;
  status: PreTripItemStatus;
  note?: string;
}
