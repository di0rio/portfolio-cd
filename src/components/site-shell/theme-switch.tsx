"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const options = [
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
  { value: "system", Icon: MonitorIcon },
] as const;

type Labels = { label: string; light: string; dark: string; system: string };

export function ThemeSwitch({ labels }: { labels: Labels }) {
  const { theme, setTheme } = useTheme();
  // O tema só é conhecido no cliente; antes disso nenhum item fica marcado.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <ToggleGroup
      aria-label={labels.label}
      className="rounded-lg border p-0.5"
      onValueChange={(value) => value[0] && setTheme(value[0])}
      size="sm"
      value={mounted && theme ? [theme] : []}
    >
      {options.map(({ value, Icon }) => (
        <ToggleGroupItem aria-label={labels[value]} key={value} value={value}>
          <Icon aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
