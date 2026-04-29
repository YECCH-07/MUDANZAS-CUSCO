# PANEL-08 — Operaciones avanzadas

> **Objetivo:** profesionalizar la operación logística: planificación de
> rutas, calendario maestro, alertas predictivas y análisis financiero
> avanzado.
> **Cuándo:** cuando el volumen supere ~30 servicios/semana y la coordinación
> manual empiece a fallar.

## Tareas

### 8.1 — Calendario maestro

- [ ] Vista calendario `/panel/admin/calendario/` con:
  - Drag & drop de trabajos sin asignar
  - Color por unidad, badge por conductor
  - Filtros por rango de fechas, distrito, tipo de servicio
  - Detección de conflictos (mismo conductor, dos servicios solapados)

### 8.2 — Optimización de rutas

- [ ] Múltiples paradas en un mismo viaje (depto → almacén → cliente final).
- [ ] Sugerir orden óptimo con OSRM (Open Source Routing Machine, gratis).
- [ ] Estimación de combustible por ruta basada en distancia y unidad.

### 8.3 — Mantenimiento predictivo

- [ ] Alertas de cambio de aceite por kilometraje (next_service_km vs current).
- [ ] Alerta de SOAT/RTV ya implementada — extender a llantas, batería, frenos.
- [ ] Histórico de mantenimientos por unidad con costo total.

### 8.4 — Conductor: gamificación profesional

- [ ] Leaderboard mensual de conductores (servicios completados, % satisfacción).
- [ ] Bonos automáticos al alcanzar metas (visible en su panel).
- [ ] Insignias por hitos: "100 servicios", "5 estrellas 10 veces seguidas".

### 8.5 — Cotizador: comisiones

- [ ] Tabla de comisión por cotizador (% por servicio aceptado).
- [ ] Visible en su panel: "Llevas S/ 1,250 ganados este mes".
- [ ] Reporte mensual exportable para liquidación.

### 8.6 — Análisis financiero

- [ ] P&L mensual automático (ingresos - gastos por categoría).
- [ ] Margen por servicio (ya hay P&L por job, ahora agregado).
- [ ] Punto de equilibrio: "Para cubrir costos fijos necesitas 12 servicios/semana".
- [ ] Proyección de flujo de caja semanal.

### 8.7 — Integraciones contables

- [ ] Export Excel para contador (formato custom).
- [ ] Conciliación bancaria: cargar extracto BCP/Interbank y matchear
      movimientos con recibos.
- [ ] Pre-declaración SUNAT (si en algún momento se decide formalizar).

### 8.8 — Multi-sucursal

- [ ] Si Expresos Ñan abre operación en otra ciudad (Arequipa por ejemplo):
  - Tabla `branches`, scope de unidades y conductores por sucursal.
  - Filtro global por sucursal en panel admin.
  - Reporte consolidado.

## Definición de hecho

- 0 conflictos de calendario causados por error humano.
- Reducción 30% en tiempo de coordinación admin (medido por
  `audit_log` actions/día).
- Cotizadores y conductores ven sus métricas personales en tiempo real.
