"use client";

import { useIsMac } from "@/components/site-shell/command-palette";
import { Kbd } from "@/components/ui/kbd";

/** A paleta é global; aqui só aparece o atalho e um botão que o dispara (o mesmo Ctrl+K, sem acoplar os componentes). */
export function PaletteDemo({ label }: { label: string }) {
  const mac = useIsMac();
  return (
    <div className="flex items-center gap-3">
      <button
        className="h-9 rounded-lg border bg-card px-4 font-medium text-sm outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
        onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
        type="button"
      >
        {label}
      </button>
      <Kbd>{mac ? "⌘K" : "Ctrl K"}</Kbd>
    </div>
  );
}
