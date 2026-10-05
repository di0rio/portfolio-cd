"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale, translations } from "@/i18n/generated";

type Copy = (typeof translations)[Locale]["app"]["error"];

// Falha no próprio layout de [locale]: substitui a página inteira, então traz <html> e <body>.
// Sem root params aqui, o idioma sai da URL (inglês em /en). Traduções carregadas só quando algo quebra, como no error.tsx.
export default function GlobalError({
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	const locale: Locale = /^\/en(\/|$)/.test(usePathname() ?? "") ? "en" : "pt";
	const [copy, setCopy] = useState<Copy>();

	useEffect(() => {
		import("@/i18n/generated").then(({ translations }) =>
			setCopy(translations[locale].app.error),
		);
	}, [locale]);

	return (
		<html lang={locale}>
			<body className="mx-auto flex min-h-screen max-w-[640px] flex-col justify-center bg-background px-4 text-[15px] text-foreground leading-[1.65]">
				{copy && (
					<section>
						<h1 className="font-bold text-[28px] leading-tight">
							{copy.title}
						</h1>
						<p className="mt-2 max-w-[460px] text-muted-foreground">
							{copy.body}
						</p>
						<button
							className="mt-6 underline decoration-brand underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-brand"
							onClick={retry}
							type="button"
						>
							{copy.retry}
						</button>
					</section>
				)}
			</body>
		</html>
	);
}
