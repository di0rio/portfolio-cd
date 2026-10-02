"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type Locale, updateLocale } from "@/i18n/generated";

const locales: Locale[] = ["pt", "en"];

export function LocaleSwitch({ label, locale }: { label: string; locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ToggleGroup
      aria-label={label}
      className="rounded-lg border p-0.5 font-mono"
      disabled={pending}
      onValueChange={(value) => {
        const next = value[0] as Locale | undefined;
        if (!next || next === locale) return;
        // Grava o cookie e re-renderiza o servidor no idioma novo.
        updateLocale(next);
        startTransition(() => router.refresh());
      }}
      size="sm"
      value={[locale]}
    >
      {locales.map((l) => (
        <ToggleGroupItem key={l} lang={l} value={l}>
          {l}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
