"use client";

import { useEffect } from "react";

// Uma vez por carregamento de página: StrictMode e remontagens não repetem.
let printed = false;

// Aviso de self-XSS no console, só em produção. `compiler.removeConsole` (next.config.ts) apaga todo `console.*`
// do código do app, então a mensagem sai por um alias (`globalThis.console`), que o transform não reconhece.
export function ConsoleWarning() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || printed) return;
    printed = true;
    const c = globalThis.console;
    c.log("%cnananinão", "background:#1c1c1c;color:#ffd23f;font:700 48px/1.3 sans-serif;padding:8px 16px;border-radius:8px");
    c.log("%cesse console é pra devs. se alguém pediu pra você colar algo aqui, é golpe.", "font:500 14px/1.5 sans-serif");
  }, []);

  return null;
}
