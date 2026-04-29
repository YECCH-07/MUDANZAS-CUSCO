/*
 * Constructor del PDF de recibo con pdf-lib + QR anti-fraude.
 * Ver PANEL-INTERNO.md §5.2 y PANEL-02 §2.9.
 *
 * Nota: usamos Helvetica estándar (WinAnsi). Los caracteres Unicode no
 * representables se mapean a su equivalente ASCII via `ansi()`. Para soporte
 * Unicode completo (emojis, CJK), embebir una fuente TTF.
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { loadLogoBytes } from './pdf-brand';
import { getService } from './services';

export interface ReceiptPdfInput {
  number: string;
  uuid: string;
  issuedAtISO: string;
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
    scheduledDate: string | null;
    unitPlate?: string | null;
    driverName?: string | null;
    volumeM3?: number | null;
    distanceKm?: number | null;
    crewSize?: number | null;
    floorsOrigin?: number | null;
    floorsDest?: number | null;
    hasElevator?: boolean | null;
  };
  items: { label: string; amountCents: number }[];
  totalCents: number;
  paymentMethod: string;
  /** Si true, los precios incluyen IGV; si false, no. */
  includesIgv?: boolean;
  verifyUrl: string;
  emitter: {
    legalName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
  };
  note?: string;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;

const PRIMARY = rgb(0.894, 0.016, 0.078); // #E40414
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.42, 0.42, 0.42);
const LIGHT_GRAY = rgb(0.88, 0.88, 0.88);

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
];

/** Sanitiza un string para encoding WinAnsi de pdf-lib. */
function ansi(s: string): string {
  let out = s;
  for (const [re, rep] of UNICODE_REPLACEMENTS) out = out.replace(re, rep);
  // Filtro final: cualquier code point > 255 → '?'
  return out
    .split('')
    .map((ch) => (ch.charCodeAt(0) > 255 ? '?' : ch))
    .join('');
}

/**
 * Word-wrap simple a un ancho dado en pts.
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

export async function buildReceiptPdf(input: ReceiptPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Helper para no repetir ansi() en cada drawText.
  const draw = (text: string, opts: Parameters<typeof page.drawText>[1]): void =>
    page.drawText(ansi(text), opts);

  let y = PAGE_H - MARGIN;

  page.drawRectangle({ x: 0, y: PAGE_H - 14, width: PAGE_W, height: 14, color: PRIMARY });

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
    color: DARK,
  });
  draw(`RUC ${input.emitter.ruc}`, { x: textOffsetX, y: y - 22, font, size: 9, color: GRAY });
  draw(input.emitter.address, { x: textOffsetX, y: y - 34, font, size: 9, color: GRAY });
  draw(`${input.emitter.phone} - ${input.emitter.email}`, {
    x: textOffsetX,
    y: y - 46,
    font,
    size: 9,
    color: GRAY,
  });

  draw('RECIBO', {
    x: PAGE_W - MARGIN - 160,
    y: y - 4,
    font: fontBold,
    size: 12,
    color: PRIMARY,
  });
  draw(input.number, {
    x: PAGE_W - MARGIN - 160,
    y: y - 28,
    font: fontBold,
    size: 22,
    color: DARK,
  });
  draw(`Emitido: ${input.issuedAtISO.slice(0, 10)}`, {
    x: PAGE_W - MARGIN - 160,
    y: y - 50,
    font,
    size: 9,
    color: GRAY,
  });

  y -= 80;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: LIGHT_GRAY,
  });

  y -= 24;
  draw('CLIENTE', { x: MARGIN, y, font: fontBold, size: 9, color: GRAY });
  y -= 14;
  draw(input.customer.name, { x: MARGIN, y, font: fontBold, size: 12, color: DARK });
  if (input.customer.docType && input.customer.docNumber) {
    y -= 14;
    draw(`${input.customer.docType}: ${input.customer.docNumber}`, {
      x: MARGIN,
      y,
      font,
      size: 10,
      color: GRAY,
    });
  }
  if (input.customer.phone) {
    y -= 12;
    draw(`Tel. ${input.customer.phone}`, { x: MARGIN, y, font, size: 10, color: GRAY });
  }

  y -= 26;
  // Bloque de servicio con descripción del catálogo (mismo formato que la cotización).
  const svc = getService(input.service.serviceType);
  const CONTENT_W = PAGE_W - 2 * MARGIN;
  page.drawRectangle({
    x: MARGIN,
    y: y - 84,
    width: CONTENT_W,
    height: 86,
    color: PRIMARY,
    opacity: 0.06,
  });
  page.drawRectangle({
    x: MARGIN,
    y: y - 84,
    width: 4,
    height: 86,
    color: PRIMARY,
  });
  draw('SERVICIO PRESTADO', { x: MARGIN + 12, y: y - 12, font: fontBold, size: 9, color: PRIMARY });
  draw(svc.name, { x: MARGIN + 12, y: y - 28, font: fontBold, size: 13, color: DARK });
  if (svc.tagline) {
    draw(svc.tagline, { x: MARGIN + 12, y: y - 42, font, size: 9, color: GRAY });
  }
  if (svc.description) {
    const descLines = wrap(svc.description, font, 9, CONTENT_W - 24);
    let dy = y - 56;
    for (const ln of descLines.slice(0, 3)) {
      draw(ln, { x: MARGIN + 12, y: dy, font, size: 9, color: DARK });
      dy -= 11;
    }
  }
  y -= 96;

  // Detalles operativos en grid de 2 columnas.
  draw('DETALLES DEL SERVICIO', { x: MARGIN, y, font: fontBold, size: 9, color: GRAY });
  y -= 16;

  const colW = CONTENT_W / 2;
  const detailRows: Array<[string, string]> = [];
  detailRows.push(['Origen', input.service.origin ?? '-']);
  detailRows.push(['Destino', input.service.destination ?? '-']);
  if (input.service.scheduledDate) {
    detailRows.push(['Fecha del servicio', input.service.scheduledDate]);
  }
  if (typeof input.service.volumeM3 === 'number' && input.service.volumeM3 > 0) {
    detailRows.push(['Volumen', `${input.service.volumeM3} m3`]);
  }
  if (typeof input.service.distanceKm === 'number' && input.service.distanceKm > 0) {
    detailRows.push(['Distancia', `${input.service.distanceKm} km`]);
  }
  if (typeof input.service.crewSize === 'number' && input.service.crewSize > 0) {
    detailRows.push([
      'Personal',
      `${input.service.crewSize} ${input.service.crewSize === 1 ? 'persona' : 'personas'}`,
    ]);
  }
  const fOrig = input.service.floorsOrigin ?? 0;
  const fDest = input.service.floorsDest ?? 0;
  if (fOrig > 0 || fDest > 0) {
    detailRows.push(['Pisos en origen', String(fOrig)]);
    detailRows.push(['Pisos en destino', String(fDest)]);
    detailRows.push(['Ascensor disponible', input.service.hasElevator ? 'Si' : 'No']);
  }
  if (input.service.unitPlate) {
    detailRows.push(['Unidad asignada', input.service.unitPlate]);
  }
  if (input.service.driverName) {
    detailRows.push(['Conductor', input.service.driverName]);
  }

  for (let i = 0; i < detailRows.length; i += 2) {
    const left = detailRows[i];
    const right = detailRows[i + 1];
    if (left) {
      draw(left[0].toUpperCase(), { x: MARGIN, y, font: fontBold, size: 8, color: GRAY });
      draw(left[1], { x: MARGIN, y: y - 11, font, size: 10, color: DARK });
    }
    if (right) {
      draw(right[0].toUpperCase(), { x: MARGIN + colW, y, font: fontBold, size: 8, color: GRAY });
      draw(right[1], { x: MARGIN + colW, y: y - 11, font, size: 10, color: DARK });
    }
    y -= 28;
  }

  y -= 8;
  page.drawRectangle({
    x: MARGIN - 4,
    y: y - 4,
    width: CONTENT_W + 8,
    height: 18,
    color: PRIMARY,
  });
  draw('DESGLOSE COBRADO', { x: MARGIN, y, font: fontBold, size: 9, color: LIGHT_GRAY });
  draw('MONTO', { x: PAGE_W - MARGIN - 80, y, font: fontBold, size: 9, color: LIGHT_GRAY });
  y -= 22;

  for (const item of input.items) {
    if (y < 160) break;
    draw(item.label.slice(0, 64), { x: MARGIN, y, font, size: 10, color: DARK });
    draw(fmt(item.amountCents), { x: PAGE_W - MARGIN - 80, y, font, size: 10, color: DARK });
    y -= 14;
  }

  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: LIGHT_GRAY,
  });
  y -= 18;
  draw('TOTAL', { x: MARGIN, y, font: fontBold, size: 12, color: DARK });
  draw(fmt(input.totalCents), {
    x: PAGE_W - MARGIN - 80,
    y,
    font: fontBold,
    size: 14,
    color: PRIMARY,
  });

  y -= 14;
  draw(
    input.includesIgv === false
      ? 'Precios NO incluyen IGV. Agregar 18% segun corresponda.'
      : 'Precios incluyen IGV (18%)',
    {
      x: PAGE_W - MARGIN - 240,
      y,
      font,
      size: 8,
      color: input.includesIgv === false ? PRIMARY : GRAY,
    },
  );

  y -= 16;
  draw(`Metodo de pago: ${input.paymentMethod}`, { x: MARGIN, y, font, size: 9, color: GRAY });

  if (input.note) {
    y -= 18;
    draw(input.note.slice(0, 120), { x: MARGIN, y, font, size: 9, color: GRAY });
  }

  // QR
  const qrPng = await QRCode.toBuffer(input.verifyUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
  });
  const qrImg = await pdf.embedPng(qrPng);
  const qrSize = 96;
  const qrX = PAGE_W - MARGIN - qrSize;
  const qrY = MARGIN;
  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  draw('Verificacion publica', {
    x: MARGIN,
    y: MARGIN + 70,
    font: fontBold,
    size: 10,
    color: DARK,
  });
  draw('Escanea el QR o visita:', {
    x: MARGIN,
    y: MARGIN + 56,
    font,
    size: 9,
    color: GRAY,
  });
  draw(input.verifyUrl, { x: MARGIN, y: MARGIN + 42, font, size: 8, color: PRIMARY });
  draw('Documento emitido electronicamente.', {
    x: MARGIN,
    y: MARGIN + 20,
    font,
    size: 8,
    color: GRAY,
  });
  draw(`UUID: ${input.uuid}`, { x: MARGIN, y: MARGIN + 8, font, size: 7, color: GRAY });

  return pdf.save();
}
