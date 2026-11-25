"use client";

// Formulario de contacto de About — portado de `about.jsx` (SPEC 03).
// Vistas: formulario → terminal de éxito | terminal de error (nueva respecto a la plantilla).

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { hasEmptyField, type ContactErrorCode, type ContactInput } from "@/lib/contact";

type View = { kind: "form" } | { kind: "sent"; name: string } | { kind: "error"; code: ContactErrorCode };

const EMPTY: ContactInput = { name: "", email: "", msg: "", website: "" };

const ERROR_TEXT: Record<ContactErrorCode, string> = {
  invalid: "> DATOS NO VÁLIDOS. REVISA EL FORMULARIO.",
  not_configured: "> NO SE PUDO TRANSMITIR. INTÉNTALO DE NUEVO.",
  send_failed: "> NO SE PUDO TRANSMITIR. INTÉNTALO DE NUEVO.",
};

export function ContactForm() {
  const id = useId();
  const [form, setForm] = useState<ContactInput>(EMPTY);
  const [view, setView] = useState<View>({ kind: "form" });
  const [shake, setShake] = useState(false);
  const [isPending, startTransition] = useTransition();
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
  }, []);

  const update = (field: keyof ContactInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    if (hasEmptyField(form)) {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      setShake(true);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }
    const data = form;
    startTransition(async () => {
      let next: View;
      try {
        const result = await sendContactMessage(data);
        next = result.ok ? { kind: "sent", name: data.name.trim() } : { kind: "error", code: result.error };
      } catch {
        // Fallo de red o del servidor antes de llegar a la acción.
        next = { kind: "error", code: "send_failed" };
      }
      startTransition(() => setView(next));
    });
  };

  // "ENVIAR OTRO MENSAJE": formulario vacío.
  const reset = () => {
    setForm(EMPTY);
    setView({ kind: "form" });
  };

  // "REINTENTAR": vuelve al formulario conservando lo escrito.
  const retry = () => setView({ kind: "form" });

  return (
    <form className={"contact-form" + (shake ? " shake" : "")} onSubmit={onSubmit}>
      {view.kind === "form" ? (
        <>
          <div className="field">
            <label htmlFor={`${id}-name`}>NOMBRE</label>
            <input id={`${id}-name`} value={form.name} onChange={update("name")} readOnly={isPending} placeholder="px_kai" />
          </div>
          <div className="field">
            <label htmlFor={`${id}-email`}>CORREO ELECTRÓNICO</label>
            <input
              id={`${id}-email`}
              type="email"
              value={form.email}
              onChange={update("email")}
              readOnly={isPending}
              placeholder="jugador@vault.gg"
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-msg`}>MENSAJE</label>
            <textarea
              id={`${id}-msg`}
              rows={5}
              value={form.msg}
              onChange={update("msg")}
              readOnly={isPending}
              placeholder="Cuéntanos qué tienes en mente…"
            />
          </div>
          {/* Honeypot anti-spam: invisible y fuera del orden de tabulación; una persona nunca lo rellena. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor={`${id}-website`}>WEBSITE</label>
            <input
              id={`${id}-website`}
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={update("website")}
            />
          </div>
          <button className="btn xl press contact-submit" type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? "▶ TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      ) : view.kind === "sent" ? (
        <div className="terminal-success" role="status">
          <TermBar />
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {view.name.toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div className="term-actions">
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="terminal-success terminal-error" role="alert">
          <TermBar />
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            {view.code === "invalid" ? (
              <div className="line dim">[ERR] Validando contenido…</div>
            ) : (
              <>
                <div className="line dim">[OK] Validando contenido…</div>
                <div className="line dim">[ERR] Transmitiendo paquete…</div>
              </>
            )}
            <div className="line error">
              {ERROR_TEXT[view.code]}
              <span className="caret">_</span>
            </div>
            <div className="term-actions">
              <button className="btn ghost" type="button" onClick={retry}>
                REINTENTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function TermBar() {
  return (
    <div className="term-bar">
      <span className="dot r" />
      <span className="dot y" />
      <span className="dot g" />
      <span className="term-title">VAULT-OS // TERMINAL</span>
    </div>
  );
}
