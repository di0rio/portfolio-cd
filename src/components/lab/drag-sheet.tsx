"use client";

import { useEffect, useRef, useState } from "react";

const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)"; // curva de gaveta do iOS (Ionic)
const VELOCITY = 0.11; // px/ms: um "peteleco" fecha mesmo com pouca distância

type Copy = { open: string; title: string; body: string; close: string; hint: string };

/**
 * Gaveta que segue o dedo. Pra baixo ela anda 1:1; pra cima ela resiste (amortecimento),
 * e solta fecha por distância (40%) ou por velocidade. Tudo com transform direto no elemento.
 */
export function DragSheet({ copy }: { copy: Copy }) {
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; t: number; pointerId: number; dy: number } | null>(null);

  const setY = (y: number, animate: boolean) => {
    const el = sheet.current;
    if (!el) return;
    el.style.transition = animate ? `transform 500ms ${EASE_DRAWER}` : "none";
    el.style.transform = `translateY(${y}px)`;
  };

  // Abre: parte de fora (100%) e entra com a curva de gaveta. Foco vai pra gaveta.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    if (open) {
      el.style.transition = "none";
      el.style.transform = "translateY(100%)";
      requestAnimationFrame(() => {
        el.style.transition = `transform 500ms ${EASE_DRAWER}`;
        el.style.transform = "translateY(0)";
      });
      el.focus();
    }
  }, [open]);

  const close = () => {
    const el = sheet.current;
    if (!el) return setOpen(false);
    el.style.transition = `transform 300ms ${EASE_DRAWER}`;
    el.style.transform = "translateY(100%)";
    setTimeout(() => {
      setOpen(false);
      trigger.current?.focus();
    }, 300);
  };

  return (
    <div className="relative h-72 w-full max-w-sm overflow-hidden rounded-xl border bg-background">
      <div className="grid h-full place-items-center">
        <button
          className="h-9 rounded-lg border bg-card px-4 font-medium text-sm outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
          onClick={() => setOpen(true)}
          ref={trigger}
          type="button"
        >
          {copy.open}
        </button>
      </div>

      {open && (
        <>
          <button aria-label={copy.close} className="absolute inset-0 bg-black/30" onClick={close} tabIndex={-1} type="button" />
          <div
            aria-label={copy.title}
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 flex h-[78%] touch-none select-none flex-col rounded-t-2xl border-t bg-card px-5 pt-3 pb-5 shadow-lg/10 outline-none"
            onKeyDown={(e) => e.key === "Escape" && close()}
            onPointerCancel={() => setY(0, true)}
            onPointerDown={(e) => {
              if (drag.current) return; // segundo dedo não rouba o arraste
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { y: e.clientY, t: Date.now(), pointerId: e.pointerId, dy: 0 };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || e.pointerId !== d.pointerId) return;
              const raw = e.clientY - d.y;
              // Pra cima: quanto mais puxa, menos anda (fricção em vez de parede).
              const dy = raw >= 0 ? raw : -Math.sqrt(-raw) * 4;
              d.dy = raw;
              setY(dy, false);
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d || e.pointerId !== d.pointerId) return;
              const height = sheet.current?.offsetHeight ?? 1;
              const velocity = d.dy / Math.max(1, Date.now() - d.t);
              if (d.dy > height * 0.4 || velocity > VELOCITY) close();
              else setY(0, true);
            }}
            ref={sheet}
            role="dialog"
            tabIndex={-1}
          >
            <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
            <p className="font-heading font-medium">{copy.title}</p>
            <p className="mt-1 text-muted-foreground text-sm">{copy.body}</p>
            <p className="mt-auto text-muted-foreground text-xs">{copy.hint}</p>
          </div>
        </>
      )}
    </div>
  );
}
