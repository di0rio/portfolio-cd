"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Digitar `cd ..` (ou `cd ~`) em qualquer lugar volta pro começo; `cd blog` abre o blog.
const routes: Record<string, string> = { "..": "/", "~": "/", blog: "/blog" };

export function EasterEgg() {
  const router = useRouter();

  useEffect(() => {
    let buffer = "";
    function onKey(e: KeyboardEvent) {
      if (e.key.length !== 1 || (e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-12);
      const match = buffer.match(/cd (\.\.|~|blog)$/);
      if (!match) return;
      buffer = "";
      router.push(routes[match[1]]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
