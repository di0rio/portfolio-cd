"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale, translations } from "@/i18n/generated";

type Copy = (typeof translations)[Locale]["app"]["error"];

// Falha inesperada ao renderizar (ex.: API do GitHub fora). Componente de cliente: lê o idioma da rota.
// As traduções de todas as páginas (~27 KB gzip) só baixam quando algo quebra: importar direto
// punha o dicionário inteiro no bundle de toda página, já que o error boundary vai no layout.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useParams<{ locale: Locale }>();
  const [copy, setCopy] = useState<Copy>();

  useEffect(() => {
    import("@/i18n/generated").then(({ translations }) => setCopy((translations[locale] ?? translations.pt).app.error));
  }, [locale]);

  if (!copy) return null;

  return (
    <section>
      <h1 className="font-bold font-heading text-[28px] leading-tight">{copy.title}</h1>
      <p className="mt-2 max-w-[460px] text-muted-foreground">{copy.body}</p>
      <button
        className="mt-6 underline decoration-brand underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-brand"
        onClick={reset}
        type="button"
      >
        {copy.retry}
      </button>
    </section>
  );
}
