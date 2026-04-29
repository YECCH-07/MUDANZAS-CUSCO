/*
 * Constructor del PDF de cotización con pdf-lib.
 * Comparte estilos/colores con el recibo (BRAND) y embebe el logo de Expresos Ñan.
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { BRAND, loadLogoBytes } from './pdf-brand';
import { getService } from './services';

export interface QuotePdfInput {
  number: string;
  status: string;
  issuedAtISO: string;
  expiresAtISO: string | null;
  customer: {
    name: string;
    phone: string | null;
    docType: string | null;
    docNumber: string | null;
  };
  service: {
    serviceType: string;
    origin: string | null;
    destination: string | null;
    tentativeDate: string | null;
    volumeM3: number | null;
    distanceKm: number | null;
    crewSize: number | null;
    floorsOrigin: number | null;
    floorsDest: number | null;
    hasElevator: boolean;
  };
  items: { label: string; amountCents: number }[];
  totalCents: number;
  /** Si true, los precios incluyen IGV; si false, no. */
  includesIgv: boolean;
  notes: string | null;
  emitter: {
    legalName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - 2 * MARGIN;

function fmt(cents: number): string {
  return `S/ ${(cents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const UNICODE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/→/g, '->'],
  [/←/g, '<-'],
  [/–/g, '-'],
  [/—/g, '-'],
  [/“|”/g, '"'],
  [/‘|’/g, "'"],
  [/·/g, '-'],
  [/•/g, '*'],
  [/ñ/g, 'n'],
  [/Ñ/g, 'N'],
  [/á/g, 'a'],
  [/é/g, 'e'],
  [/í/g, 'i'],
  [/ó/g, 'o'],
  [/ú/g, 'u'],
  [/Á/g, 'A'],
  [/É/g, 'E'],
  [/Í/g, 'I'],
  [/Ó/g, 'O'],
  [/Ú/g, 'U'],
];

function ansi(s: string): string {
  let out = s;
  for (const [re, rep] of UNICODE_REPLACEMENTS) out = out.replace(re, rep);
  return out
    .split('')
    .map((ch) => (ch.charCodeAt(0) > 255 ? '?' : ch))
    .join('');
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada al cliente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada',
    canceled: 'Cancelada',
  };
  return labels[status] ?? status;
}

function fmtDateLong(iso: string | null): string {
  if (!iso) return '-';
  // YYYY-MM-DD → DD de mes de YYYY
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const monthIndex = Number(m[2]) - 1;
  return `${m[3]} de ${months[monthIndex] ?? '-'} de ${m[1]}`;
}

/**
 * Word-wrap simple a un ancho dado (en pts) usando una fuente y tamaño.
 */
function wrap(
  text: string,
  font: { widthOfTextAtSize(t: string, s: number): number },
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(ansi(candidate), size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildQuotePdf(input: QuotePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const draw = (text: string, opts: Parameters<typeof page.drawText>[1]): void =>
    page.drawText(ansi(text), opts);

  // Banda superior roja
  page.drawRectangle({ x: 0, y: PAGE_H - 14, width: PAGE_W, height: 14, color: BRAND.primary });

  let y = PAGE_H - MARGIN;

  // Logo (si está disponible)
  const logoBytes = await loadLogoBytes();
  let textOffsetX = MARGIN;
  if (logoBytes) {
    try {
      const logoImg = await pdf.embedPng(logoBytes);
      const logoH = 56;
      const logoScale = logoH / logoImg.height;
      const logoW = logoImg.width * logoScale;
      page.drawImage(logoImg, { x: MARGIN, y: y - logoH + 8, width: logoW, height: logoH });
      textOffsetX = MARGIN + logoW + 14;
    } catch {
      // sigue sin logo
    }
  }

  draw(input.emitter.legalName, {
    x: textOffsetX,
    y: y - 4,
    font: fontBold,
    size: 14,
    color: BRAND.dark,
  });
  draw(`RUC ${input.emitter.ruc}`, { x: textOffsetX, y: y - 22, font, size: 9, color: BRAND.gray });
  draw(input.emitter.address, { x: textOffsetX, y: y - 34, font, size: 9, color: BRAND.gray });
  draw(`${input.emitter.phone} - ${input.emitter.email}`, {
    x: textOffsetX,
    y: y - 46,
    font,
    size: 9,
    color: BRAND.gray,
  });
  draw(input.emitter.website, {
    x: textOffsetX,
    y: y - 58,
    font,
    size: 9,
    color: BRAND.primary,
  });

  // Bloque de número y estado a la derecha
  const rightX = PAGE_W - MARGIN - 170;
  draw('COTIZACION', { x: rightX, y: y - 4, font: fontBold, size: 12, color: BRAND.primary });
  draw(input.number, { x: rightX, y: y - 30, font: fontBold, size: 22, color: BRAND.dark });
  draw(`Emitida: ${input.issuedAtISO.slice(0, 10)}`, {
    x: rightX,
    y: y - 50,
    font,
    size: 9,
    color: BRAND.gray,
  });
  if (input.expiresAtISO) {
    draw(`Valida hasta: ${input.expiresAtISO.slice(0, 10)}`, {
      x: rightX,
      y: y - 62,
      font,
      size: 9,
      color: BRAND.gray,
    });
  }
  draw(`Estado: ${statusLabel(input.status)}`, {
    x: rightX,
    y: y - 76,
    font: fontBold,
    size: 9,
    color: BRAND.primary,
  });

  y -= 100;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: BRAND.lightGray,
  });

  // CLIENTE (caja con fondo gris muy claro)
  y -= 18;
  draw('CLIENTE', { x: MARGIN, y, font: fontBold, size: 9, color: BRAND.gray });
  y -= 16;
  draw(input.customer.name, { x: MARGIN, y, font: fontBold, size: 13, color: BRAND.dark });
  let custLineY = y - 14;
  const custBits: string[] = [];
  if (input.customer.docType && input.customer.docNumber) {
    custBits.push(`${input.customer.docType}: ${input.customer.docNumber}`);
  }
  if (input.customer.phone) custBits.push(`Tel. ${input.customer.phone}`);
  if (custBits.length > 0) {
    draw(custBits.join('   -   '), { x: MARGIN, y: custLineY, font, size: 10, color: BRAND.gray });
    custLineY -= 14;
  }

  y = custLineY - 8;

  // SERVICIO (con descripción del catálogo)
  const svc = getService(input.service.serviceType);
  page.drawRectangle({
    x: MARGIN,
    y: y - 90,
    width: CONTENT_W,
    height: 92,
    color: BRAND.primary,
    opacity: 0.06,
  });
  page.drawRectangle({
    x: MARGIN,
    y: y - 90,
    width: 4,
    height: 92,
    color: BRAND.primary,
  });
  draw('SERVICIO CONTRATADO', {
    x: MARGIN + 12,
    y: y - 12,
    font: fontBold,
    size: 9,
    color: BRAND.primary,
  });
  draw(svc.name, { x: MARGIN + 12, y: y - 28, font: fontBold, size: 14, color: BRAND.dark });
  if (svc.tagline) {
    draw(svc.tagline, { x: MARGIN + 12, y: y - 42, font, size: 9, color: BRAND.gray });
  }
  if (svc.description) {
    const descLines = wrap(svc.description, font, 9, CONTENT_W - 24);
    let dy = y - 56;
    for (const ln of descLines.slice(0, 4)) {
      draw(ln, { x: MARGIN + 12, y: dy, font, size: 9, color: BRAND.dark });
      dy -= 11;
    }
  }

  y -= 102;

  // DETALLES OPERATIVOS — grid con 2 columnas
  draw('DETALLES DEL SERVICIO', { x: MARGIN, y, font: fontBold, size: 9, color: BRAND.gray });
  y -= 16;

  const colW = CONTENT_W / 2;
  const rows: Array<[string, string]> = [];

  rows.push(['Origen', input.service.origin ?? 'Por confirmar']);
  rows.push(['Destino', input.service.destination ?? 'Por confirmar']);

  if (input.service.tentativeDate) {
    rows.push(['Fecha tentativa', fmtDateLong(input.service.tentativeDate)]);
  }
  if (typeof input.service.volumeM3 === 'number' && input.service.volumeM3 > 0) {
    rows.push(['Volumen estimado', `${input.service.volumeM3} m3`]);
  }
  if (typeof input.service.distanceKm === 'number' && input.service.distanceKm > 0) {
    rows.push(['Distancia aproximada', `${input.service.distanceKm} km`]);
  }
  if (typeof input.service.crewSize === 'number' && input.service.crewSize > 0) {
    rows.push([
      'Personal asignado',
      `${input.service.crewSize} ${input.service.crewSize === 1 ? 'persona' : 'personas'}`,
    ]);
  }

  const fOrig = input.service.floorsOrigin ?? 0;
  const fDest = input.service.floorsDest ?? 0;
  if (fOrig > 0 || fDest > 0) {
    rows.push(['Pisos en origen', String(fOrig)]);
    rows.push(['Pisos en destino', String(fDest)]);
    rows.push(['Ascensor disponible', input.service.hasElevator ? 'Si' : 'No']);
  }

  // Render rows en 2 columnas
  for (let i = 0; i < rows.length; i += 2) {
    const left = rows[i];
    const right = rows[i + 1];
    if (left) {
      draw(left[0].toUpperCase(), { x: MARGIN, y, font: fontBold, size: 8, color: BRAND.gray });
      draw(left[1], { x: MARGIN, y: y - 11, font, size: 10, color: BRAND.dark });
    }
    if (right) {
      draw(right[0].toUpperCase(), {
        x: MARGIN + colW,
        y,
        font: fontBold,
        size: 8,
        color: BRAND.gray,
      });
      draw(right[1], { x: MARGIN + colW, y: y - 11, font, size: 10, color: BRAND.dark });
    }
    y -= 28;
  }

  y -= 6;

  // DESGLOSE
  page.drawRectangle({
    x: MARGIN - 4,
    y: y - 4,
    width: CONTENT_W + 8,
    height: 18,
    color: BRAND.primary,
  });
  draw('DESGLOSE DEL SERVICIO', { x: MARGIN, y, font: fontBold, size: 9, color: BRAND.lightGray });
  draw('MONTO', { x: PAGE_W - MARGIN - 80, y, font: fontBold, size: 9, color: BRAND.lightGray });
  y -= 22;

  for (const item of input.items) {
    if (y < 200) break;
    const labelLines = wrap(item.label, font, 10, CONTENT_W - 100);
    draw(labelLines[0] ?? '', { x: MARGIN, y, font, size: 10, color: BRAND.dark });
    draw(fmt(item.amountCents), { x: PAGE_W - MARGIN - 80, y, font, size: 10, color: BRAND.dark });
    y -= 13;
    for (const extra of labelLines.slice(1, 3)) {
      draw(extra, { x: MARGIN, y, font, size: 9, color: BRAND.gray });
      y -= 11;
    }
    y -= 2;
  }

  y -= 4;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: BRAND.lightGray,
  });
  y -= 24;
  draw('TOTAL', { x: MARGIN, y, font: fontBold, size: 14, color: BRAND.dark });
  draw(fmt(input.totalCents), {
    x: PAGE_W - MARGIN - 100,
    y,
    font: fontBold,
    size: 18,
    color: BRAND.primary,
  });
  // Etiqueta IGV bajo el total
  y -= 14;
  draw(
    input.includesIgv
      ? 'Precios incluyen IGV (18%)'
      : 'Precios NO incluyen IGV. Agregar 18% segun corresponda.',
    {
      x: PAGE_W - MARGIN - 240,
      y,
      font,
      size: 8,
      color: input.includesIgv ? BRAND.gray : BRAND.primary,
    },
  );

  if (input.notes && y > 160) {
    y -= 30;
    draw('NOTAS Y CONDICIONES', { x: MARGIN, y, font: fontBold, size: 9, color: BRAND.gray });
    y -= 14;
    const lines = wrap(input.notes, font, 9, CONTENT_W);
    for (const ln of lines.slice(0, 6)) {
      if (y < 110) break;
      draw(ln, { x: MARGIN, y, font, size: 9, color: BRAND.dark });
      y -= 11;
    }
  }

  // Pie con condiciones generales
  const footerY = MARGIN;
  page.drawLine({
    start: { x: MARGIN, y: footerY + 50 },
    end: { x: PAGE_W - MARGIN, y: footerY + 50 },
    thickness: 0.5,
    color: BRAND.lightGray,
  });
  draw('CONDICIONES GENERALES', {
    x: MARGIN,
    y: footerY + 38,
    font: fontBold,
    size: 8,
    color: BRAND.primary,
  });
  const igvText = input.includesIgv
    ? 'Precios en soles peruanos (PEN); incluyen IGV (18%).'
    : 'Precios en soles peruanos (PEN); NO incluyen IGV. Agregar 18% al total segun corresponda.';
  const condLines = wrap(
    'Cotizacion valida segun fecha de vencimiento. ' +
      igvText +
      ' ' +
      'Confirmacion sujeta a verificacion de volumen y accesibilidad real en sitio. Cambios de fecha con minimo 24 horas. ' +
      'Para reservar el servicio se requiere adelanto del 30%.',
    font,
    7.5,
    CONTENT_W,
  );
  let cy = footerY + 28;
  for (const ln of condLines.slice(0, 3)) {
    draw(ln, { x: MARGIN, y: cy, font, size: 7.5, color: BRAND.gray });
    cy -= 9;
  }
  draw(`${input.emitter.legalName} - ${input.emitter.phone} - ${input.emitter.website}`, {
    x: MARGIN,
    y: footerY + 2,
    font: fontBold,
    size: 7,
    color: BRAND.gray,
  });

  return pdf.save();
}
