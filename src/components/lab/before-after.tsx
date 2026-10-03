"use client";

import { ChevronsLeftRightIcon } from "lucide-react";
import { useRef, useState } from "react";

type Copy = { label: string; before: string; after: string; title: string; meta: string; action: string };

/** O mesmo card duas vezes: o "antes" por baixo, o "depois" por cima recortado com clip-path. */
function SampleCard({ polished, copy }: { polished: boolean; copy: Copy }) {
  return polished ? (
    <div className="flex w-64 flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="font-heading font-medium">{copy.title}</p>
      <p className="text-muted-foreground text-sm">{copy.meta}</p>
      <span className="mt-3 inline-flex h-8 items-center self-start rounded-lg bg-foreground px-3 font-medium text-background text-sm">{copy.action}</span>
    </div>
  ) : (
    <div className="flex w-64 flex-col rounded-none border-2 border-neutral-400 bg-white p-2 text-black shadow-[6px_6px_10px_rgba(0,0,0,0.5)]">
      <p className="font-bold font-serif text-lg uppercase">{copy.title}</p>
      <p className="font-serif text-neutral-500 text-xs">{copy.meta}</p>
      <span className="mt-1 inline-block self-end rounded-full bg-blue-600 px-6 py-0.5 text-white text-xs uppercase">{copy.action}</span>
    </div>
  );
}

/**
 * Comparador: arraste a alça (ou use as setas) pra revelar o "depois".
 * Só o clip-path muda; nenhum elemento troca de tamanho.
 */
export function BeforeAfter({ copy }: { copy: Copy }) {
  const [pos, setPos] = useState(30);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <div
        className="relative h-48 w-full touch-none select-none overflow-hidden rounded-xl border bg-background"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        ref={box}
      >
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-neutral-200">
          <SampleCard copy={copy} polished={false} />
        </div>
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-background" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <SampleCard copy={copy} polished />
        </div>
        <div
          aria-label={copy.label}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}%`}
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 cursor-ew-resize bg-brand outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 2;
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
            if (e.key === "Home") setPos(0);
            if (e.key === "End") setPos(100);
          }}
          role="slider"
          style={{ left: `${pos}%` }}
          tabIndex={0}
        >
          <span className="absolute top-1/2 left-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-black bg-brand text-brand-contrast shadow-sm/20">
            <ChevronsLeftRightIcon aria-hidden="true" className="size-3.5" />
          </span>
        </div>
      </div>
      <p className="flex w-full justify-between text-muted-foreground text-xs">
        <span>← {copy.before}</span>
        <span>{copy.after} →</span>
      </p>
    </div>
  );
}
