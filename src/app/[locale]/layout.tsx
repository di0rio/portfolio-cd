import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import Link from "next/link";
import { ViewTransition } from "react";
import "../globals.css";
import { ClickTracker } from "@/components/site-shell/click-tracker";
import { CommandPalette } from "@/components/site-shell/command-palette";
import { EasterEgg } from "@/components/site-shell/easter-egg";
import { LocaleSwitch } from "@/components/site-shell/locale-switch";
import { SiteNav } from "@/components/site-shell/site-nav";
import { Kbd } from "@/components/ui/kbd";
import { ThemeProvider } from "@/components/site-shell/theme-provider";
import { ThemeSwitch } from "@/components/site-shell/theme-switch";
import { localePath } from "@/i18n/path";
import { getT, locales } from "@/i18n/server";
import { getBlogRepos } from "@/lib/github";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans" });
const ubuntuHeading = Ubuntu({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-heading" });
const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

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

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getT();
  const shell = t.components["site-shell"];
  const posts = (await getBlogRepos()).map((r) => r.name); // cacheado por hora; alimenta a paleta (⌘K)

  return (
    <html
      className={cn("h-full antialiased font-sans", ubuntu.variable, ubuntuHeading.variable, ubuntuMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-[15px] text-foreground leading-[1.65]">
        <ThemeProvider>
          {/* Uma coluna só (640px): header, conteúdo e rodapé alinhados no mesmo eixo. */}
          <header className="mx-auto flex w-full max-w-[640px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-6 print:hidden">
            <SiteNav copy={shell.nav} locale={locale} />
            <div className="flex items-center gap-2">
              <LocaleSwitch label={shell.language.label} locale={locale} />
              <ThemeSwitch labels={shell.theme} />
              <CommandPalette
                copy={shell.palette}
                github={site.github}
                locale={locale}
                posts={posts}
                projects={projects.map(({ slug, name }) => ({ slug, name }))}
              />
            </div>
          </header>

          {/* Trocar de página anima só o conteúdo; header e rodapé ficam parados. */}
          <ViewTransition default="page">
            <main className="mx-auto flex w-full min-w-0 max-w-[640px] flex-1 flex-col gap-20 px-4 pt-16 pb-28 sm:pt-24 print:max-w-none print:p-0">
              {children}
            </main>
          </ViewTransition>

          <footer className="mx-auto flex w-full max-w-[640px] flex-wrap items-center justify-between gap-4 border-t px-4 py-6 text-muted-foreground text-sm print:hidden">
            <span>{shell.footer.made}</span>
            <Link className="underline decoration-muted-foreground/40 underline-offset-4 hover:text-foreground hover:decoration-brand" href={localePath(locale, "/freela")}>
              {t.app.freela.footerLink}
            </Link>
            <span>
              {shell.footer.hint} <Kbd>cd ..</Kbd>
            </span>
          </footer>
          <EasterEgg locale={locale} />
          <Analytics />
          <ClickTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
