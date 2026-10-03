import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho de página: título (22px) + intro. Único lugar com esse ritmo: 6px entre título e intro,
 * 24px depois do link de voltar. O `-mb-4` encurta o vão até o primeiro bloco (64px do `main` → 48px).
 */
export function PageHeader({ title, intro, back, children }: { title: string; intro?: ReactNode; back?: ReactNode; children?: ReactNode }) {
  return (
    <header className="-mb-4">
      {back}
      <h1 className={cn("font-bold font-heading text-[22px] leading-tight", back && "mt-6")}>{title}</h1>
      {intro && <p className="mt-1.5 max-w-[520px] text-pretty text-muted-foreground">{intro}</p>}
      {children}
    </header>
  );
}
