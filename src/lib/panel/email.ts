/*
 * Envío de emails transaccionales con Nodemailer + SMTP.
 *
 * Decisión Q2=D: usamos el SMTP de Gmail de la cuenta operativa
 * (mudanzasexpresoqhapaq@gmail.com) con App Password.
 * Variables de entorno: SMTP_HOST/PORT/SECURE/USER/PASSWORD/FROM_*.
 *
 * Si las variables no están configuradas, sendMail() retorna sin error pero
 * imprime warn en consola — útil en dev sin SMTP.
 *
 * Plantillas: src/lib/panel/email-templates/<key>.html con marcadores {{name}}.
 */
import nodemailer, { type Transporter } from 'nodemailer';

let cached: { transport: Transporter; from: string } | null = null;

function getTransport(): { transport: Transporter; from: string } | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !pass) return null;
  const transport = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true' || Number(port) === 465,
    auth: { user, pass },
  });
  const fromName = process.env.SMTP_FROM_NAME ?? 'Expresos Ñan';
  const fromAddr = process.env.SMTP_FROM_ADDRESS ?? user;
  const from = `${fromName} <${fromAddr}>`;
  cached = { transport, from };
  return cached;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(
  input: SendMailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const cfg = getTransport();
  if (!cfg) {
    console.warn('[email] SMTP no configurado — email a', input.to, 'NO enviado:', input.subject);
    return { ok: false, error: 'smtp-not-configured' };
  }
  try {
    const info = await cfg.transport.sendMail({
      from: cfg.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? input.html.replace(/<[^>]+>/g, ''),
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error('[email] error enviando a', input.to, err);
    return { ok: false, error: (err as Error).message };
  }
}

export function isEmailConfigured(): boolean {
  return getTransport() !== null;
}

/**
 * Render minimal de plantilla con sustituciones {{key}}.
 * Para algo más sofisticado, usar `mustache` o `handlebars`.
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

// ---- plantillas predefinidas ----
export const TEMPLATES = {
  welcome: (vars: { name: string; email: string; tempPassword: string; loginUrl: string }) => ({
    subject: 'Acceso al Panel de Expresos Ñan',
    html: renderTemplate(
      `<div style="font-family:Arial,sans-serif;color:#0F0F0F;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#D72638;">Bienvenido, {{name}}</h2>
  <p>Se creó tu cuenta en el Panel interno de Expresos Ñan.</p>
  <p><strong>Email:</strong> {{email}}<br>
  <strong>Contraseña temporal:</strong> <code style="background:#f4f4f4;padding:2px 6px;border-radius:4px;">{{tempPassword}}</code></p>
  <p>La contraseña expira en 24 horas. Inicia sesión y cámbiala en cuanto puedas.</p>
  <p><a href="{{loginUrl}}" style="display:inline-block;background:#D72638;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">Abrir el panel</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="font-size:12px;color:#777;">Si no esperabas este correo, ignóralo.</p>
</div>`,
      vars,
    ),
  }),
  passwordReset: (vars: { name: string; tempPassword: string; loginUrl: string }) => ({
    subject: 'Reseteo de contraseña — Panel Expresos Ñan',
    html: renderTemplate(
      `<div style="font-family:Arial,sans-serif;color:#0F0F0F;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#D72638;">Hola {{name}}</h2>
  <p>El administrador reseteó tu contraseña en el panel.</p>
  <p><strong>Nueva contraseña temporal:</strong> <code style="background:#f4f4f4;padding:2px 6px;border-radius:4px;">{{tempPassword}}</code></p>
  <p>Expira en 24h. Cámbiala en el primer login.</p>
  <p><a href="{{loginUrl}}" style="display:inline-block;background:#D72638;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">Iniciar sesión</a></p>
</div>`,
      vars,
    ),
  }),
  receiptIssued: (vars: {
    adminName: string;
    receiptNumber: string;
    total: string;
    customerName: string;
    verifyUrl: string;
  }) => ({
    subject: `Recibo emitido ${vars.receiptNumber} (${vars.total})`,
    html: renderTemplate(
      `<div style="font-family:Arial,sans-serif;color:#0F0F0F;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#D72638;">Recibo emitido</h2>
  <p>Hola {{adminName}},</p>
  <p>Se emitió el recibo <strong>{{receiptNumber}}</strong> para <strong>{{customerName}}</strong> por <strong>{{total}}</strong>.</p>
  <p><a href="{{verifyUrl}}">Ver verificador público →</a></p>
</div>`,
      vars,
    ),
  }),
};
