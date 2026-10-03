"use client";

import { useEffect, useRef, useState } from "react";

const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)"; // curva de gaveta do iOS (Ionic)
const VELOCITY = 0.11; // px/ms: um "peteleco" fecha mesmo com pouca distância
const OPEN_MS = 500;
const CLOSE_MS = 300;
const RUBBER = 80; // até onde a gaveta estica pra cima

type Copy = { open: string; title: string; body: string; close: string; hint: string };

// Resistência tipo iOS: começa quase 1:1 e satura em RUBBER (sem parede, sem salto).
const rubber = (x: number) => (1 - 1 / ((x * 0.55) / RUBBER + 1)) * RUBBER;

/**
 * Gaveta que segue o dedo. Pra baixo ela anda 1:1; pra cima ela resiste (elástico),
 * e solta fecha por distância (40%) ou por velocidade recente.
 * Sempre montada (escondida em translateY(100%)): assim a entrada parte de um estilo já
 * renderizado e o fundo escurece junto, sem o frame "gaveta no lugar" antes de descer.
 * Interrompível: pegar no meio da animação congela na posição atual, sem salto.
 */
export function DragSheet({ copy }: { copy: Copy }) {
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y0: number; base: number; pos: number; id: number; pts: { y: number; t: number }[] } | null>(null);

  // Gaveta e fundo pintados no mesmo lugar: transform + opacidade com a mesma curva e duração.
  // ms = null: arrastando, sem transição. "closed": desce 100% e só então vira visibility:hidden.
  const paint = (y: number | "closed", ms: number | null) => {
    const el = sheet.current;
    const bg = backdrop.current;
    if (!el || !bg) return;
    const h = el.offsetHeight || 1;
    const closed = y === "closed";
    const px = closed ? h : y;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = ms === null ? null : reduced ? 0 : ms;
    const fade = ms === null ? null : reduced ? 150 : ms; // movimento reduzido: só o fundo faz fade
    const delay = closed ? Math.max(move ?? 0, fade ?? 0) : 0;
    const visibility = closed ? "hidden" : "visible";
    el.style.transition = move === null ? "none" : `transform ${move}ms ${EASE_DRAWER}, visibility 0s linear ${delay}ms`;
    bg.style.transition = fade === null ? "none" : `opacity ${fade}ms ${EASE_DRAWER}, visibility 0s linear ${delay}ms`;
    el.style.transform = closed ? "translateY(100%)" : `translateY(${px}px)`;
    bg.style.opacity = String(closed ? 0 : Math.min(1, Math.max(0, 1 - px / h)));
    el.style.visibility = bg.style.visibility = visibility;
  };

  const show = () => {
    setOpen(true);
    paint(0, OPEN_MS);
  };

  const close = () => {
    setOpen(false);
    paint("closed", CLOSE_MS);
    trigger.current?.focus();
  };

  // O foco vai pra gaveta quando o `inert` sai (depois do commit).
  useEffect(() => {
    if (open) sheet.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div className="relative h-72 w-full max-w-sm overflow-hidden rounded-xl border bg-background">
      <div className="grid h-full place-items-center">
        <button
          className="h-9 rounded-lg border bg-card px-4 font-medium text-sm outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
          onClick={show}
          ref={trigger}
          type="button"
        >
          {copy.open}
        </button>
      </div>

      <button
        aria-label={copy.close}
        className="absolute inset-0 bg-black/30 will-change-[opacity]"
        onClick={close}
        ref={backdrop}
        style={{ opacity: 0, visibility: "hidden" }}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label={copy.title}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 flex h-[78%] touch-none select-none flex-col rounded-t-2xl border-t bg-card px-5 pt-3 pb-5 shadow-lg/10 outline-none will-change-transform"
        inert={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Tab") e.preventDefault(); // único elemento focável: o foco fica preso na gaveta
        }}
        onPointerCancel={() => {
          drag.current = null;
          show();
        }}
        onPointerDown={(e) => {
          if (drag.current) return; // segundo dedo não rouba o arraste
          const el = e.currentTarget;
          el.setPointerCapture(e.pointerId);
          // Congela onde a gaveta está agora (mesmo no meio de uma animação): sem salto ao pegar.
          const base = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
          paint(base, null);
          drag.current = { y0: e.clientY, base, pos: base, id: e.pointerId, pts: [{ y: e.clientY, t: e.timeStamp }] };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || e.pointerId !== d.id) return;
          d.pos = d.base + e.clientY - d.y0;
          paint(d.pos < 0 ? -rubber(-d.pos) : d.pos, null);
          d.pts.push({ y: e.clientY, t: e.timeStamp });
          while (d.pts.length > 1 && e.timeStamp - d.pts[0].t > 100) d.pts.shift(); // velocidade da janela recente
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d || e.pointerId !== d.id) return;
          drag.current = null;
          const from = d.pts.find((p) => e.timeStamp - p.t <= 100); // parou antes de soltar: velocidade 0
          const velocity = from ? (e.clientY - from.y) / Math.max(1, e.timeStamp - from.t) : 0;
          if (d.pos > (sheet.current?.offsetHeight ?? 1) * 0.4 || velocity > VELOCITY) close();
          else show();
        }}
        ref={sheet}
        role="dialog"
        style={{ transform: "translateY(100%)", visibility: "hidden" }}
        tabIndex={-1}
      >
        <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
        <p className="font-heading font-medium">{copy.title}</p>
        <p className="mt-1 text-muted-foreground text-sm">{copy.body}</p>
        <p className="mt-auto text-muted-foreground text-xs">{copy.hint}</p>
      </div>
    </div>
  );
}
