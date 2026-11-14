import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../shared/config/env";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    // Sin estos límites nodemailer espera hasta 2 min si el SMTP se cuelga
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw Object.assign(new Error(`Email send failed: ${message}`), {
      cause: error,
    });
  }
}

/** Comprueba al arrancar que el SMTP acepta conexión y credenciales. */
export async function verifyEmailTransport(): Promise<void> {
  try {
    await getTransporter().verify();
    console.log(`[email] SMTP listo (${env.SMTP_HOST}:${env.SMTP_PORT})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[email] ⚠️ SMTP NO disponible (${env.SMTP_HOST}:${env.SMTP_PORT}): ${message}. ` +
        "Los correos de verificación y recuperación no van a salir.",
    );
  }
}

// Esperas entre intentos: 5 s, 30 s y 2 min (≈2,5 min en total)
const RETRY_DELAYS_MS = [5_000, 30_000, 120_000];

/**
 * Errores que no se arreglan reintentando: buzón inexistente o rechazado
 * (5xx del servidor de destino) y credenciales SMTP inválidas (535).
 * Los 4xx (421/450/451/452: límite de envío, buzón ocupado) y los fallos de
 * red sí son temporales.
 */
function isPermanentEmailError(error: unknown): boolean {
  const cause = (error as { cause?: { responseCode?: number } })?.cause;
  const code = cause?.responseCode;
  return typeof code === "number" && code >= 500;
}

function maskEmail(to: string | string[]): string {
  const list = Array.isArray(to) ? to : [to];
  return list
    .map((addr) => addr.replace(/^(.{2}).*(@.*)$/, "$1***$2"))
    .join(", ");
}

/**
 * Envía el correo sin bloquear la respuesta HTTP y reintenta hasta 4 veces
 * con espera creciente, recreando la conexión SMTP entre intentos. Nunca lanza:
 * el usuario no recibe un 500 por culpa del SMTP, y cada fallo queda en el log.
 * Úsalo cuando el usuario tiene otra vía para volver a pedir el correo
 * (re-registro, "olvidé mi contraseña").
 */
export function sendEmailInBackground(options: SendEmailOptions, context: string): void {
  const maxAttempts = RETRY_DELAYS_MS.length + 1;
  const who = maskEmail(options.to);

  void (async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await sendEmail(options);
        if (attempt > 1) {
          console.log(`[email:${context}] enviado a ${who} en el intento ${attempt}`);
        }
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const permanent = isPermanentEmailError(error);
        console.error(
          `[email:${context}] intento ${attempt}/${maxAttempts} a ${who} falló` +
            `${permanent ? " (permanente, no se reintenta)" : ""}: ${message}`,
        );
        if (permanent || attempt === maxAttempts) return;

        // Conexión nueva para el siguiente intento por si la anterior quedó rota
        transporter?.close();
        transporter = null;
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
      }
    }
  })().catch((error) => {
    console.error(`[email:${context}] error inesperado:`, error);
  });
}
