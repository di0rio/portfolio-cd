import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import Link from "next/link";
import { ViewTransition } from "react";
import "../globals.css";
import { InstagramIcon } from "@/components/brand-icons";
import { ClickTracker } from "@/components/site-shell/click-tracker";
import { CommandPalette } from "@/components/site-shell/command-palette";
import { ConsoleWarning } from "@/components/site-shell/console-warning";
import { EasterEgg } from "@/components/site-shell/easter-egg";
import { EntryOnce } from "@/components/site-shell/entry-once";
import { LocaleSwitch } from "@/components/site-shell/locale-switch";
import { SiteNav } from "@/components/site-shell/site-nav";
import { ThemeProvider } from "@/components/site-shell/theme-provider";
import { ThemeSwitch } from "@/components/site-shell/theme-switch";
import { Kbd } from "@/components/ui/kbd";
import { TooltipProvider } from "@/components/ui/tooltip";
import { localePath } from "@/i18n/path";
import { getT, locales } from "@/i18n/server";
import { getBlogPosts } from "@/lib/github";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-sans",
});
const ubuntuMono = Ubuntu_Mono({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-mono",
});

export const dynamicParams = false;

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
	const { t } = await getT();
	return {
		metadataBase: new URL(site.url),
		title: { default: t.app.meta.title, template: `%s · ${site.name}` },
		description: t.app.meta.description,
	};
}

export default async function RootLayout({
	children,
}: LayoutProps<"/[locale]">) {
	const { locale, t } = await getT();
	const shell = t.components["site-shell"];
	const posts = (await getBlogPosts(locale)).map(({ slug, title }) => ({
		slug,
		title,
	})); // cacheado por hora; alimenta a paleta (⌘K)

	return (
		<html
			className={cn(
				"h-full antialiased font-sans",
				ubuntu.variable,
				ubuntuMono.variable,
			)}
			lang={locale}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col bg-background text-[15px] text-foreground leading-[1.65]">
				<ThemeProvider>
					<TooltipProvider>
						{/* Primeiro foco da página: pula o header e vai direto pro conteúdo. */}
						<a
							className="sr-only rounded-md bg-background px-3 py-1.5 text-sm outline-none focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:ring-2 focus:ring-brand"
							href="#conteudo"
						>
							{shell.skip}
						</a>
						{/* Uma coluna só (640px): header, conteúdo e rodapé alinhados no mesmo eixo. */}
						{/* Grade de 3 colunas: o menu fica sempre no centro, não importa o tamanho do prompt (`~ $` vs `~/blog $`). */}
						<header className="mx-auto grid w-full max-w-[640px] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 pt-6 sm:grid-cols-[1fr_auto_1fr] print:hidden">
							<SiteNav copy={shell.nav} locale={locale} />
							<div className="flex items-center gap-2 justify-self-end">
								<LocaleSwitch label={shell.language.label} locale={locale} />
								<ThemeSwitch labels={shell.theme} />
								<CommandPalette
									copy={shell.palette}
									locale={locale}
									posts={posts}
									projects={projects.map(({ slug, name }) => ({ slug, name }))}
								/>
							</div>
						</header>

						{/* Trocar de página anima só o conteúdo; header e rodapé ficam parados. */}
						<ViewTransition default="page">
							<main
								className="mx-auto flex w-full min-w-0 max-w-[640px] flex-1 flex-col gap-16 px-4 pt-16 pb-24 print:max-w-none print:p-0 outline-none"
								id="conteudo"
								tabIndex={-1}
							>
								{children}
							</main>
						</ViewTransition>

						<footer className="mx-auto flex w-full max-w-[640px] flex-wrap items-center justify-between gap-4 border-t px-4 py-6 text-muted-foreground text-sm print:hidden">
							<span className="flex items-center gap-3">
								{shell.footer.made}
								<a
									aria-label="Instagram"
									className="rounded-sm hover:text-foreground"
									data-track="instagram"
									href={`https://www.instagram.com/${site.instagram}/`}
									rel="noopener"
									target="_blank"
								>
									<InstagramIcon aria-hidden="true" className="size-3.5" />
								</a>
							</span>
							<span className="flex items-center gap-4">
								{(
									[
										["/freela", t.app.freela.footerLink],
										["/agora", t.app.agora.footerLink],
										["/processo", t.app.processo.footerLink],
										["/log", t.app.log.footerLink],
									] as const
								).map(([path, label]) => (
									<Link
										className="underline decoration-muted-foreground/40 underline-offset-4 hover:text-foreground hover:decoration-brand"
										href={localePath(locale, path)}
										key={path}
									>
										{label}
									</Link>
								))}
							</span>
							<span>
								{shell.footer.hint} <Kbd>cd ..</Kbd> / <Kbd>help</Kbd>
							</span>
						</footer>
						<EasterEgg
							copy={shell.egg}
							locale={locale}
							slugs={projects.map((p) => p.slug)}
						/>
						<EntryOnce />
						<Analytics />
						<SpeedInsights />
						<ClickTracker />
						<ConsoleWarning />
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
