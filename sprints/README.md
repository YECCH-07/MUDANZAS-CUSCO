# Sprints del Panel Interno

Mapa cronológico de sprints específicos del panel interno
(`/panel/**`). El roadmap general del sitio público vive en
[../ROADMAP.md](../ROADMAP.md).

## Estado actual (2026-04-25)

| Sprint                                          | Estado         | Resumen                                                 |
| ----------------------------------------------- | -------------- | ------------------------------------------------------- |
| [PANEL-01](./PANEL-01-auth-conductores.md)      | ✅ Completo    | Auth + sesiones + conductores + parte diario + fotos B2 |
| [PANEL-02](./PANEL-02-cotizaciones-recibos.md)  | ✅ Completo    | Cotizaciones, jobs, recibos PDF + verificador           |
| [PANEL-03](./PANEL-03-admin-reportes.md)        | ✅ Completo    | Admin completo, balances, audit, calculadora            |
| [PANEL-04](./PANEL-04-rediseno-visual.md)       | 🟡 Planificado | Rediseño visual completo + sistema de diseño            |
| [PANEL-05](./PANEL-05-documentos-pro.md)        | 🟡 Planificado | PDFs multipágina, firma digital, multi-idioma           |
| [PANEL-06](./PANEL-06-portal-cliente.md)        | 🟡 Planificado | Portal cliente self-service con tracking en vivo        |
| [PANEL-07](./PANEL-07-marketing-automation.md)  | 🟡 Planificado | Campañas, segmentación, automatizaciones, lead scoring  |
| [PANEL-08](./PANEL-08-operaciones-avanzadas.md) | 🟡 Planificado | Calendario maestro, optimización rutas, P&L, comisiones |

## Recomendación de orden

1. **Antes del lanzamiento público** (bloqueantes para Yeison):
   - PANEL-01 ✅ → PANEL-02 ✅ → PANEL-03 ✅
   - **PANEL-04 (rediseño visual)** ← este es el que el cliente está pidiendo ahora
   - SPRINT-10 deploy del sitio público (correr en paralelo)

2. **Después del lanzamiento** (mejoras incrementales):
   - PANEL-05 documentos pro (cuando aparezca el primer cliente empresarial grande)
   - PANEL-06 portal cliente (cuando los cotizadores no den abasto)
   - PANEL-07 marketing automation (cuando haya >100 clientes en BD)
   - PANEL-08 operaciones avanzadas (cuando >30 servicios/semana)

## Quick wins ya entregados (fuera de sprint)

Mejoras pequeñas implementadas tras feedback del cliente:

- **2026-04-25**: catálogo de servicios formal (Mudanza Express, Mudanza
  Estándar, Vehículo+Personal) con descripción larga incrustada en PDFs y en
  detalle de cotización. Selects con `<optgroup>` y tagline dinámico.
- **2026-04-25**: PDFs detallados — origen/destino destacados, pisos
  por separado, ascensor sí/no, volumen, distancia, personal, fecha,
  unidad asignada, conductor. Bloque de servicio con descripción del
  catálogo. Condiciones generales en pie.
- **2026-04-25**: dashboard admin con sección "Movimientos del día"
  (timestamp completo).
- **2026-04-25**: logo de Expresos Ñan en headers de los layouts y en PDFs.
- **2026-04-25**: dinero en soles con separador de miles en toda la UI;
  formularios aceptan soles con decimales (no céntimos).
- **2026-04-25**: descarga de PDF de cotización desde detalle y listado.
