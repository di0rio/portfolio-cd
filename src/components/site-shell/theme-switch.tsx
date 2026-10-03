"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button-variants";

type Labels = { toLight: string; toDark: string };

export function ThemeSwitch({ labels }: { labels: Labels }) {
  const { resolvedTheme, setTheme } = useTheme();
  // O tema só é conhecido no cliente; antes disso o botão fica sem ícone pra não piscar o errado.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      aria-label={dark ? labels.toLight : labels.toDark}
      className={buttonVariants({ size: "icon-sm", variant: "outline" })}
      onClick={() => setTheme(dark ? "light" : "dark")}
      type="button"
    >
      {mounted && (dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />)}
    </button>
  );
}
