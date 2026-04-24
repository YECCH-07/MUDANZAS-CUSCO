# SPRINT 04 — Almacenaje, Custodia y Flota

**Duración:** 5 días (Semana 6)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-03 completado.

## Objetivo

Construir las dos páginas que diferencian a Expresos Ñan en el mercado: el servicio de Almacenaje y Custodia (sin competencia directa fuerte en Cusco), y la página de Flota (1, 2 y 4 toneladas) como elemento de credibilidad.

## URLs a crear

- `/almacenaje-y-custodia-cusco/` (NUEVA — diferenciador clave)
- `/flota-de-camiones-cusco/` (NUEVA — credibilidad)

## Tareas

### Tarea 4.1 — Página `/almacenaje-y-custodia-cusco/`

**Estructura:**

1. **Hero**
   - H1: "Almacenaje y Custodia de Pertenencias en Cusco"
   - Subtítulo: "Guarda tus muebles, cajas y pertenencias en depósito vigilado, por días, meses o años."

2. **¿Qué es el servicio?** (sección descriptiva, 300 palabras)

3. **Modalidades** (3 tarjetas grandes):
   - **Por días** (corto plazo, hasta 30 días) — ideal para mudanzas en transición
   - **Por meses** (1-12 meses) — ideal para viajes prolongados, remodelaciones
   - **Por años** (12+ meses) — ideal para custodia de largo plazo

4. **Calculadora de espacio** (componente interactivo)
   - Selector: ¿Qué quieres almacenar?
     - Cuarto pequeño (5-10 m³)
     - Cuarto completo (10-20 m³)
     - Departamento 1 ambiente (15-25 m³)
     - Departamento 2-3 ambientes (25-40 m³)
     - Casa completa (40-80 m³)
     - Solo cajas (1-5 m³)
   - Selector de tiempo: días / meses / años
   - Output: estimación de m³ y tarifa mensual referencial

5. **Por qué confiar en nuestro almacenaje:**
   - Vigilancia 24/7
   - Cámaras de seguridad
   - Control de acceso
   - Inventario fotográfico al ingresar
   - Acta firmada de cada ítem
   - Condiciones ambientales controladas
   - Seguro contra incendio (si aplica)

6. **Bundles combinados** (ofertas):
   - "Mudanza + 30 días gratis de almacenaje"
   - "Mudanza + custodia + entrega final" (servicio puerta a puerta diferida)

7. **Casos de uso típicos:**
   - Estudiante UNSAAC que vuelve a Sicuani por vacaciones
   - Familia en remodelación
   - Empresa cerrando temporalmente oficina
   - Persona viajando al extranjero por trabajo

8. **FAQs específicas** (con Schema FAQPage):
   - ¿Puedo retirar parcialmente?
   - ¿Cómo aviso para retirar?
   - ¿Qué pasa si no pago?
   - ¿Garantizan que no se pierda nada?
   - ¿Es seguro contra polillas/humedad?
   - ¿Hacen el traslado al ingresar y al retirar?

9. **CTA WhatsApp:**
   - Mensaje: "Hola, necesito cotización de almacenaje. Quiero guardar [tipo de carga] por [tiempo aprox.]"

**Schema.org:**
```json
{
  "@type": "Service",
  "name": "Almacenaje y Custodia de Pertenencias",
  "serviceType": "Storage and Warehousing",
  "provider": { "@id": "#localbusiness" },
  "areaServed": "Cusco, Perú",
  "offers": [
    { "@type": "Offer", "name": "Almacenaje por días" },
    { "@type": "Offer", "name": "Almacenaje por meses" },
    { "@type": "Offer", "name": "Almacenaje por años" }
  ]
}
```

**Meta:**
```
Title: Almacenaje y Custodia de Pertenencias en Cusco | Expresos Ñan
Description: Guarda tus muebles y pertenencias en depósito vigilado en Cusco. Por días, meses o años. Vigilancia 24/7, inventario fotográfico, seguridad garantizada.
```

### Tarea 4.2 — Componente `<StorageCalculator>`

Calculadora interactiva. Lo más simple posible (sin backend). Lógica en TypeScript del lado cliente.

```astro
---
// src/components/StorageCalculator.astro
---

<div class="storage-calculator p-6 bg-gray-50 rounded-lg">
  <h3 class="text-2xl font-heading font-bold mb-4">Calcula tu espacio</h3>
  <div class="space-y-4">
    <select id="storage-type">
      <option value="5">Solo cajas (5 m³)</option>
      <option value="10">Cuarto pequeño (10 m³)</option>
      <option value="20">Cuarto completo (20 m³)</option>
      <option value="25">Departamento 1 ambiente (25 m³)</option>
      <option value="40">Departamento 2-3 ambientes (40 m³)</option>
      <option value="80">Casa completa (80 m³)</option>
    </select>
    <select id="storage-time">
      <option value="days">Por días</option>
      <option value="months">Por meses</option>
      <option value="years">Por años</option>
    </select>
    <div id="storage-result" class="text-xl font-bold text-primary"></div>
    <a id="storage-cta" class="btn-primary">Cotizar este espacio por WhatsApp</a>
  </div>
</div>

<script>
  const RATE_PER_M3_DAY = 5; // referencial: S/ 5 por m³ por día
  const typeSelect = document.getElementById('storage-type') as HTMLSelectElement;
  const timeSelect = document.getElementById('storage-time') as HTMLSelectElement;
  const result = document.getElementById('storage-result')!;
  const cta = document.getElementById('storage-cta') as HTMLAnchorElement;

  function update() {
    const m3 = parseInt(typeSelect.value);
    const time = timeSelect.value;
    let label = '';
    let price = 0;
    if (time === 'days') {
      price = m3 * RATE_PER_M3_DAY;
      label = `${m3} m³ × S/ ${RATE_PER_M3_DAY}/día = S/ ${price}/día (referencial)`;
    } else if (time === 'months') {
      price = m3 * 30; // referencial
      label = `${m3} m³ ≈ S/ ${price}/mes (referencial)`;
    } else {
      price = m3 * 300; // referencial
      label = `${m3} m³ ≈ S/ ${price}/año (referencial, con descuento)`;
    }
    result.textContent = label;
    const message = encodeURIComponent(
      `Hola, necesito almacenaje de ${m3} m³ por ${time === 'days' ? 'días' : time === 'months' ? 'meses' : 'años'}. Tarifa referencial vista: ${label}`
    );
    cta.href = `https://wa.me/51925671052?text=${message}`;
  }

  typeSelect.addEventListener('change', update);
  timeSelect.addEventListener('change', update);
  update();
</script>
```

**Nota:** Las tarifas deben confirmarse con el cliente antes de publicar.

### Tarea 4.3 — Página `/flota-de-camiones-cusco/`

**Estructura:**

1. **Hero**
   - H1: "Nuestra Flota: Camiones de 1, 2 y 4 Toneladas en Cusco"
   - Subtítulo: "Unidades propias y choferes profesionales para mudanzas locales y provinciales."

2. **Tres tarjetas grandes (una por unidad):**

   **Unidad 1 tonelada:**
   - Foto real
   - Capacidad de carga: 1,000 kg
   - Dimensiones aproximadas
   - Casos típicos: mudanzas pequeñas, estudiantes, fletes ligeros dentro de Cusco
   - "Recomendado para: cuartos, oficinas pequeñas"

   **Unidad 2 toneladas:**
   - Foto real
   - Capacidad: 2,000 kg
   - Dimensiones
   - Casos típicos: departamentos 1-2 ambientes, oficinas pequeñas, fletes medianos
   - "Recomendado para: departamentos, fletes a Sicuani/Abancay"

   **Unidad 4 toneladas:**
   - Foto real
   - Capacidad: 4,000 kg
   - Dimensiones
   - Casos típicos: casas completas, oficinas medianas, fletes a provincias
   - "Recomendado para: casas familiares, mudanzas a Apurímac (Las Bambas)"

3. **Calculadora de unidad recomendada**
   - Quiz simple: "¿Cuántos ambientes tiene tu vivienda?" → recomienda unidad

4. **Sobre nuestros choferes:**
   - Profesionales con licencia A-IIIb / A-IIIc
   - Conocimiento de rutas locales y provinciales
   - Capacitados en manejo de carga frágil

5. **Mantenimiento de la flota:**
   - Mantenimiento preventivo regular
   - Revisiones técnicas al día
   - Seguros vigentes

6. **Banner expansión:**
   - "Próximamente sumamos unidades para rutas Cusco-Arequipa, Cusco-Juliaca, Cusco-Puno"

7. **CTA WhatsApp:**
   - "Hola, necesito cotización para una mudanza de [tamaño]. ¿Qué unidad me recomiendan?"

### Tarea 4.4 — Componente `<FleetRecommender>`

Quiz simple que recomienda unidad según la carga.

### Tarea 4.5 — Actualizar Hub de Servicios

Agregar las dos páginas nuevas (Almacenaje, Flota) al hub `/servicio-de-caraga-flete-y-mudanza-cusco/`.

### Tarea 4.6 — Actualizar dropdown del Header

Agregar "Almacenaje y Custodia" y "Nuestra Flota" al dropdown de Servicios.

## Criterios de Aceptación

- [ ] Páginas Almacenaje y Flota publicadas en staging
- [ ] Calculadora de espacio funcional
- [ ] Calculadora de unidad recomendada funcional
- [ ] Schema.org Service válido en ambas
- [ ] Internal linking con otras páginas de servicios
- [ ] CTAs WhatsApp con mensajes contextuales
- [ ] Lighthouse 95+ en ambas

## Siguiente Sprint

**[SPRINT-05 — Landings de Distritos](SPRINT-05-districts.md)**
