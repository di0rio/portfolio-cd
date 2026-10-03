"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Locale } from "@/i18n/generated";
import { localePath, stripLocale } from "@/i18n/path";

const locales: Locale[] = ["pt", "en"];

// Resposta ao clique: afunda 2%, quase imperceptível.
export const press = "transition-[box-shadow,transform] duration-100 ease-out motion-safe:active:scale-[0.98]";

export function LocaleSwitch({ label, locale }: { label: string; locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Sinaliza a troca pro CSS esmaecer o <main> até a página no outro idioma chegar.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-pending", pending);
  }, [pending]);

  return (
    <ToggleGroup
      aria-label={label}
      className="rounded-lg border p-0.5 font-mono"
      disabled={pending}
      onValueChange={(value) => {
        const next = value[0] as Locale | undefined;
        if (!next || next === locale) return;
        // Mesma página na outra URL de idioma (mantém a âncora, se tiver).
        const { pathname, hash } = window.location;
        startTransition(() => router.push(localePath(next, stripLocale(pathname)) + hash, { scroll: false }));
      }}
      size="sm"
      value={[locale]}
    >
      {locales.map((l) => (
        <ToggleGroupItem className={press} key={l} lang={l} value={l}>
          {l}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
