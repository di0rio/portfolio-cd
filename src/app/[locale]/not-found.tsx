import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { localePath } from "@/i18n/path";
import { getT } from "@/i18n/server";

// Baseado no bloco not-found-01 do cd/ui: "404" gigante e apagado, com o título colado por cima como adesivo.
export default async function NotFound() {
	const { t, locale } = await getT();
	const copy = t.app.notFound;

	return (
		<section className="flex flex-col items-center text-center">
			<p className="font-mono text-muted-foreground text-sm">
				<span className="text-brand-foreground">~</span> $ cd {copy.path}
				<span className="block text-foreground">{copy.error}</span>
			</p>
			<div className="relative mt-6">
				<p
					aria-hidden="true"
					className="select-none font-bold font-heading text-[120px] text-foreground/10 leading-none tracking-[-0.06em] sm:text-[180px]"
				>
					404
				</p>
				<h1 className="-translate-x-1/2 -translate-y-1/2 -rotate-6 absolute top-1/2 left-1/2 whitespace-nowrap rounded-2xl border-[3px] border-black bg-brand px-4 py-2 font-heading font-semibold text-brand-contrast text-lg shadow-[5px_5px_0_#000] sm:text-2xl">
					{copy.title}
				</h1>
			</div>
			<p className="mt-6 max-w-[420px] text-pretty text-muted-foreground">
				{copy.body}
			</p>
			<Button
				className="mt-8"
				nativeButton={false}
				render={<Link href={localePath(locale, "/")} />}
				variant="brand"
			>
				<ArrowLeftIcon aria-hidden="true" />
				{copy.home}
			</Button>
		</section>
	);
}
