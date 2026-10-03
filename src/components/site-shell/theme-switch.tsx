"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

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
    <Button
      aria-label={dark ? labels.toLight : labels.toDark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      size="icon-sm"
      variant="outline"
    >
      {mounted && (dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />)}
    </Button>
  );
}
