// Formulario de contacto (SPEC 03): tipos y validación compartidos por cliente y servidor.
// Sin dependencias y sin secretos: este módulo puede importarse desde componentes "use client".

export interface ContactInput {
  name: string; // 1–80 caracteres tras trim
  email: string; // formato email básico, ≤ 254 caracteres
  msg: string; // 1–2000 caracteres tras trim
  website: string; // honeypot: debe llegar vacío
}

export type ContactErrorCode = "invalid" | "not_configured" | "send_failed";

export type ContactResult = { ok: true } | { ok: false; error: ContactErrorCode };

export const CONTACT_LIMITS = { name: 80, email: 254, msg: 2000 } as const;

// Formato básico: algo@algo.tld, sin espacios ni saltos de línea.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asString = (v: unknown) => (typeof v === "string" ? v : "");

/**
 * Valida y normaliza los datos del formulario. Acepta `unknown` porque en el servidor
 * la Server Action puede recibir cualquier cosa, no solo lo que envía nuestro formulario.
 * Devuelve los campos ya recortados (trim).
 */
export function validateContact(input: unknown): { ok: true; data: ContactInput } | { ok: false } {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;

  const data: ContactInput = {
    name: asString(raw.name).trim(),
    email: asString(raw.email).trim(),
    msg: asString(raw.msg).trim(),
    website: asString(raw.website).trim(),
  };

  const valid =
    data.name.length >= 1 &&
    data.name.length <= CONTACT_LIMITS.name &&
    data.email.length <= CONTACT_LIMITS.email &&
    EMAIL_RE.test(data.email) &&
    data.msg.length >= 1 &&
    data.msg.length <= CONTACT_LIMITS.msg;

  return valid ? { ok: true, data } : { ok: false };
}

/** Validación de cliente de la plantilla: ¿hay algún campo vacío (tras trim)? */
export function hasEmptyField(input: Pick<ContactInput, "name" | "email" | "msg">): boolean {
  return !input.name.trim() || !input.email.trim() || !input.msg.trim();
}
