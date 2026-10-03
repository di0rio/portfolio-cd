"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { Kbd } from "@/components/ui/kbd";
import { useIsMac } from "./command-palette";
import { sections } from "./shell-routes";

type Copy = { title: string; intro: string; dismiss: string; terminal: string };

const HINT_MS = 7000;

// Digitar `cd ..` (ou `cd ~`) em qualquer lugar volta pro começo; `cd blog`, `cd lab`... abrem a página;
// `cd <projeto>` abre o estudo de caso; `help` (ou `ls`) lista os comandos.
const pages: Record<string, string> = { "..": "/", "~": "/", ...sections };
// Os slugs chegam por prop: `lib/projects` usa `node:fs`, que não entra no bundle do cliente.
const hintNames = Object.keys(pages).filter((n) => n !== "~");

export function EasterEgg({ locale, copy, slugs }: { locale: Locale; copy: Copy; slugs: string[] }) {
  const router = useRouter();
  const mac = useIsMac();
  const [hint, setHint] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const routes: Record<string, string> = { ...pages, ...Object.fromEntries(slugs.map((s) => [s, `/projetos/${s}`])) };
    const names = Object.keys(routes);
    const pattern = new RegExp(`(?:cd (${names.map((n) => n.replaceAll(".", String.raw`\.`)).join("|")})|(?:^| )(help|ls))$`);
    const size = Math.max(...names.map((n) => n.length + 3)) + 1;
    let buffer = "";
    function show() {
      clearTimeout(timer.current);
      setHint(true);
      timer.current = setTimeout(() => setHint(false), HINT_MS);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearTimeout(timer.current);
        setHint(false);
        return;
      }
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      // Campos de texto (inclusive o prompt do terminal) e diálogos modais ficam fora do jogo.
      // O terminal global é um diálogo não modal (`data-terminal`): a página segue usável com ele aberto.
      if (e.target instanceof Element && e.target.closest("input, textarea, [contenteditable]")) return;
      if (document.querySelector('[role="dialog"]:not([data-terminal])')) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-size);
      const match = buffer.match(pattern);
      if (!match) return;
      buffer = "";
      if (match[2]) return show();
      // Ação de teclado: navega seco, sem rolagem animada (o push já volta pro topo).
      router.push(localePath(locale, routes[match[1]]));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
  }, [locale, router, slugs]);

  // A região `aria-live` fica sempre no DOM; só o conteúdo entra e sai, então o leitor de tela anuncia.
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-40 print:hidden" role="status">
      {hint && (
        <div className="pointer-events-auto relative w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-card p-3 pr-9 text-sm shadow-lg">
          <p className="font-mono text-muted-foreground">
            <span className="text-brand-foreground">~</span> $ help
          </p>
          <p className="mt-1.5 mb-2 font-medium">{copy.title}</p>
          <p className="mb-2 text-muted-foreground text-xs">{copy.intro}</p>
          <ul className="flex flex-wrap gap-1.5">
            {[...hintNames, ...slugs].map((n) => (
              <li className="rounded-sm border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground" key={n}>
                cd {n}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-muted-foreground text-xs">
            {copy.terminal} <Kbd>{mac ? "⌘J" : "Ctrl J"}</Kbd>
          </p>
          <button
            aria-label={copy.dismiss}
            className="absolute top-2 right-2 grid size-6 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => setHint(false)}
            type="button"
          >
            <XIcon aria-hidden className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
