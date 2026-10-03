"use client";

import { useRef, useState } from "react";

type Copy = { label: string; before: string; after: string; title: string; meta: string; action: string; secondary: string };

/**
 * O mesmo card nas duas versões, mesmas dimensões (w-64 h-36) pra revelar a diferença sem salto.
 * "antes": estilos padrão (fonte do sistema, borda dura, sem ritmo, desalinhado).
 * "depois": tokens do site, espaçamento em escala, sombra sutil e o acento da marca.
 */
function SampleCard({ polished, copy }: { polished: boolean; copy: Copy }) {
  return polished ? (
    <div className="flex h-36 w-64 flex-col rounded-xl border bg-card p-4 shadow-sm">
      <p className="font-heading font-medium leading-tight">{copy.title}</p>
      <p className="mt-1 text-muted-foreground text-sm">{copy.meta}</p>
      <div className="mt-auto flex gap-2">
        <span className="inline-flex h-8 items-center rounded-lg bg-brand px-3 font-medium text-brand-contrast text-sm">{copy.action}</span>
        <span className="inline-flex h-8 items-center rounded-lg border px-3 text-muted-foreground text-sm">{copy.secondary}</span>
      </div>
    </div>
  ) : (
    <div className="h-36 w-64 border-2 border-black bg-white p-1 font-[Arial,Helvetica,sans-serif] text-black">
      <p className="font-bold text-lg">{copy.title}</p>
      <p className="text-[#999] text-[11px]">{copy.meta}</p>
      <div className="mt-6">
        <span className="inline-block border border-black bg-[#ddd] px-1 text-[13px]">{copy.action}</span>
        <span className="mt-2 ml-1 inline-block border border-[#777] bg-[#eee] px-3 text-[#555] text-xs">{copy.secondary}</span>
      </div>
    </div>
  );
}

const chip = "absolute top-2 rounded-full border bg-background/85 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-opacity duration-150 motion-reduce:transition-none";

/**
 * Comparador: arraste a alça (ou use as setas) pra revelar o "depois".
 * Só o clip-path e o translateX da alça mudam; nenhum elemento troca de tamanho.
 */
export function BeforeAfter({ copy }: { copy: Copy }) {
  const [pos, setPos] = useState(30);
  const [grab, setGrab] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const end = () => {
    dragging.current = false;
    setGrab(false);
  };
  // Setas animam; arrastar acompanha o dedo sem atraso.
  const ease = grab ? "" : "transition-[clip-path,transform] duration-150 ease-out motion-reduce:transition-none";

  return (
    <div className="w-full max-w-md">
      <div
        className="relative h-56 w-full touch-none select-none overflow-hidden rounded-xl border bg-background"
        onLostPointerCapture={end}
        onPointerCancel={end}
        onPointerDown={(e) => {
          dragging.current = true;
          setGrab(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={end}
        ref={box}
      >
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-neutral-300 dark:bg-neutral-700">
          <SampleCard copy={copy} polished={false} />
        </div>
        <div
          aria-hidden="true"
          className={`absolute inset-0 grid place-items-center bg-background will-change-[clip-path] ${ease}`}
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <SampleCard copy={copy} polished />
        </div>

        <span aria-hidden="true" className={`${chip} left-2`} style={{ opacity: pos < 14 ? 0 : 1 }}>
          {copy.before}
        </span>
        <span aria-hidden="true" className={`${chip} right-2`} style={{ opacity: pos > 86 ? 0 : 1 }}>
          {copy.after}
        </span>

        <div className={`pointer-events-none absolute inset-0 will-change-transform ${ease}`} style={{ transform: `translateX(${pos}%)` }}>
          <div
            aria-label={copy.label}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}%`}
            className="group pointer-events-auto absolute inset-y-0 left-0 w-8 -translate-x-1/2 cursor-ew-resize outline-none"
            onKeyDown={(e) => {
              const step = e.shiftKey ? 10 : 2;
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) e.preventDefault(); // não rola a página
              if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
              if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
              if (e.key === "Home") setPos(0);
              if (e.key === "End") setPos(100);
            }}
            role="slider"
            tabIndex={0}
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-brand" />
            <span className="absolute top-1/2 left-1/2 h-8 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand shadow-sm transition-transform duration-100 ease-out group-focus-visible:ring-4 group-focus-visible:ring-brand/40 motion-safe:group-active:scale-110" />
          </div>
        </div>
      </div>
    </div>
  );
}
