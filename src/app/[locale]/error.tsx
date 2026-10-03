"use client";

import { useParams } from "next/navigation";
import { translations, type Locale } from "@/i18n/generated";

// Falha inesperada ao renderizar (ex.: API do GitHub fora). Componente de cliente: lê o idioma da rota.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useParams<{ locale: Locale }>();
  const copy = (translations[locale] ?? translations.pt).app.error;

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
