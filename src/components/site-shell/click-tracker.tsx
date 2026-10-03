"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

// Conta cliques em links marcados com `data-track` (e-mail, CV, LinkedIn, GitHub) no Vercel Analytics.
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("[data-track]");
      const name = link?.getAttribute("data-track");
      if (name) track("contact_click", { target: name, path: location.pathname });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
