/*
 * Calculadora de precios. Lee `calc_config.rules_json` con TTL in-memory.
 * Ver PANEL-INTERNO.md §5.4.
 *
 * La calculadora es sugerencia. El cotizador puede ignorarla y digitar un
 * total manual. `quotes.used_calculator` registra si se usó o no.
 */
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { calcConfig } from '@db/schema';

export interface ServiceRule {
  baseCents: number;
  perKmCents: number;
  perM3Cents?: number;
  perCrewCents?: number; // extra por persona sobre 1
  perFloorWithoutElevatorCents?: number;
  minCents: number;
}

export interface CalcRules {
  flete: ServiceRule;
  mudanza_personal: ServiceRule;
  mudanza_embalaje: ServiceRule;
  embalaje_solo: ServiceRule;
  armado_desarmado: ServiceRule;
  almacenaje: ServiceRule;
  solo_vehiculo_personal: ServiceRule;
  otro: ServiceRule;
  surcharges: {
    weekendPct: number;
    holidayPct: number;
    overnightRouteFlatCents: number;
  };
}

export const DEFAULT_RULES: CalcRules = {
  flete: { baseCents: 10000, perKmCents: 300, perM3Cents: 1500, minCents: 15000 },
  mudanza_personal: {
    baseCents: 20000,
    perKmCents: 500,
    perM3Cents: 3000,
    perCrewCents: 8000,
    perFloorWithoutElevatorCents: 3000,
    minCents: 30000,
  },
  mudanza_embalaje: {
    baseCents: 30000,
    perKmCents: 500,
    perM3Cents: 4500,
    perCrewCents: 8000,
    perFloorWithoutElevatorCents: 3000,
    minCents: 45000,
  },
  embalaje_solo: { baseCents: 15000, perKmCents: 0, perM3Cents: 4000, minCents: 20000 },
  armado_desarmado: { baseCents: 12000, perKmCents: 0, minCents: 15000 },
  almacenaje: { baseCents: 10000, perKmCents: 0, perM3Cents: 2500, minCents: 10000 },
  solo_vehiculo_personal: {
    baseCents: 15000,
    perKmCents: 400,
    perCrewCents: 7000,
    minCents: 20000,
  },
  otro: { baseCents: 10000, perKmCents: 300, minCents: 10000 },
  surcharges: {
    weekendPct: 10,
    holidayPct: 15,
    overnightRouteFlatCents: 20000,
  },
};

interface CacheSlot {
  rules: CalcRules;
  loadedAt: number;
}
const TTL_MS = 5 * 60 * 1000;
let cache: CacheSlot | null = null;

export async function loadRules(): Promise<CalcRules> {
  if (cache && Date.now() - cache.loadedAt < TTL_MS) return cache.rules;
  const row = await db.select().from(calcConfig).where(eq(calcConfig.id, 'current')).get();
  if (!row) {
    cache = { rules: DEFAULT_RULES, loadedAt: Date.now() };
    return DEFAULT_RULES;
  }
  try {
    const parsed = JSON.parse(row.rulesJson) as CalcRules;
    cache = { rules: parsed, loadedAt: Date.now() };
    return parsed;
  } catch {
    cache = { rules: DEFAULT_RULES, loadedAt: Date.now() };
    return DEFAULT_RULES;
  }
}

export function invalidateCache(): void {
  cache = null;
}

export interface QuoteInput {
  serviceType: keyof Omit<CalcRules, 'surcharges'>;
  distanceKm?: number;
  volumeM3?: number;
  floorsOrigin?: number;
  floorsDest?: number;
  hasElevator?: boolean;
  crewSize?: number;
  tentativeDate?: string; // yyyy-mm-dd
  isOvernightRoute?: boolean;
}

export interface BreakdownLine {
  label: string;
  amountCents: number;
}

export interface EstimateResult {
  totalCents: number;
  breakdown: BreakdownLine[];
}

function isWeekend(date: string): boolean {
  const d = new Date(date + 'T00:00:00');
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

export function estimate(input: QuoteInput, rules: CalcRules): EstimateResult {
  const rule = rules[input.serviceType];
  const breakdown: BreakdownLine[] = [];

  breakdown.push({ label: 'Tarifa base', amountCents: rule.baseCents });
  let subtotal = rule.baseCents;

  if (input.distanceKm && rule.perKmCents) {
    const c = input.distanceKm * rule.perKmCents;
    breakdown.push({ label: `Distancia (${input.distanceKm} km)`, amountCents: c });
    subtotal += c;
  }

  if (input.volumeM3 && rule.perM3Cents) {
    const c = input.volumeM3 * rule.perM3Cents;
    breakdown.push({ label: `Volumen (${input.volumeM3} m³)`, amountCents: c });
    subtotal += c;
  }

  if (input.crewSize && input.crewSize > 1 && rule.perCrewCents) {
    const extras = input.crewSize - 1;
    const c = extras * rule.perCrewCents;
    breakdown.push({ label: `Personal adicional (+${extras})`, amountCents: c });
    subtotal += c;
  }

  if (!input.hasElevator && rule.perFloorWithoutElevatorCents) {
    const floors = (input.floorsOrigin ?? 0) + (input.floorsDest ?? 0);
    if (floors > 0) {
      const c = floors * rule.perFloorWithoutElevatorCents;
      breakdown.push({ label: `Pisos sin ascensor (${floors})`, amountCents: c });
      subtotal += c;
    }
  }

  if (input.tentativeDate && isWeekend(input.tentativeDate)) {
    const c = Math.round((subtotal * rules.surcharges.weekendPct) / 100);
    breakdown.push({
      label: `Recargo fin de semana (${rules.surcharges.weekendPct}%)`,
      amountCents: c,
    });
    subtotal += c;
  }

  if (input.isOvernightRoute && rules.surcharges.overnightRouteFlatCents > 0) {
    const c = rules.surcharges.overnightRouteFlatCents;
    breakdown.push({ label: 'Recargo ruta nocturna (pernocte)', amountCents: c });
    subtotal += c;
  }

  const total = Math.max(subtotal, rule.minCents);
  if (total > subtotal) {
    breakdown.push({ label: `Ajuste al mínimo`, amountCents: total - subtotal });
  }

  return { totalCents: total, breakdown };
}
