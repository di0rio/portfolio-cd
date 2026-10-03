"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";

// Digitar `cd ..` (ou `cd ~`) em qualquer lugar volta pro começo; `cd blog` abre o blog.
const routes: Record<string, string> = { "..": "/", "~": "/", blog: "/blog" };

export function EasterEgg({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    let buffer = "";
    function onKey(e: KeyboardEvent) {
      if (e.key.length !== 1 || (e.target instanceof Element && e.target.closest("input, textarea, [contenteditable]"))) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-12);
      const match = buffer.match(/cd (\.\.|~|blog)$/);
      if (!match) return;
      buffer = "";
      // Ação de teclado: navega seco, sem rolagem animada (o push já volta pro topo).
      router.push(localePath(locale, routes[match[1]]));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locale, router]);

  return null;
}
