"use server";

// Server Action del formulario de contacto (SPEC 03).
// Es un punto de entrada público (cualquiera puede enviar el POST), así que todo se
// valida aquí aunque el cliente ya lo haya hecho. Los secretos solo se leen en este archivo.

import { Resend } from "resend";
import { validateContact, type ContactInput, type ContactResult } from "@/lib/contact";

// El tipo `ContactInput` describe lo que envía nuestro formulario, pero en tiempo de
// ejecución puede llegar cualquier cosa: por eso se lee con guardas y se valida.
export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  // Honeypot relleno → bot. Respondemos éxito para no darle pistas, sin enviar nada.
  const website: unknown = (input as Partial<ContactInput> | null)?.website;
  if (typeof website === "string" && website.trim() !== "") return { ok: true };

  const parsed = validateContact(input);
  if (!parsed.ok) return { ok: false, error: "invalid" };
  const { name, email, msg } = parsed.data;

  // Se leen en cada llamada (tiempo de ejecución), nunca al importar el módulo.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    const missing = [
      !apiKey && "RESEND_API_KEY",
      !from && "CONTACT_FROM_EMAIL",
      !to && "CONTACT_TO_EMAIL",
    ].filter(Boolean);
    console.error(`[contact] Faltan variables de entorno: ${missing.join(", ")}`);
    return { ok: false, error: "not_configured" };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\n${msg}`,
    });
    if (error) {
      console.error("[contact] Resend rechazó el envío:", error);
      return { ok: false, error: "send_failed" };
    }
  } catch (err) {
    console.error("[contact] Error al contactar con Resend:", err);
    return { ok: false, error: "send_failed" };
  }

  return { ok: true };
}
