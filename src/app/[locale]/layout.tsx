import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import { ViewTransition } from "react";
import "../globals.css";
import { ClickTracker } from "@/components/site-shell/click-tracker";
import { EasterEgg } from "@/components/site-shell/easter-egg";
import { LocaleSwitch } from "@/components/site-shell/locale-switch";
import { Sidebar } from "@/components/site-shell/sidebar";
import { ThemeProvider } from "@/components/site-shell/theme-provider";
import { ThemeSwitch } from "@/components/site-shell/theme-switch";
import { getT, locales } from "@/i18n/server";
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

  return (
    <html
      className={cn("h-full antialiased font-sans", ubuntu.variable, ubuntuHeading.variable, ubuntuMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <header className="flex items-center justify-between gap-4 px-4 py-3 text-muted-foreground text-sm lg:px-6 print:hidden">
            <span>{shell.tagline}</span>
            <div className="flex items-center gap-2">
              <LocaleSwitch label={shell.language.label} locale={locale} />
              <ThemeSwitch labels={shell.theme} />
            </div>
          </header>

          <div className="grid flex-1 gap-8 px-4 pt-4 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)_minmax(0,1fr)] lg:gap-14 lg:px-6 lg:pt-10 print:block print:p-0">
            <Sidebar locale={locale} nav={shell.nav} />
            {/* Trocar de página anima só o conteúdo; header, sidebar e rodapé ficam parados. */}
            <ViewTransition default="page">
              <main className="flex min-w-0 flex-col gap-14">{children}</main>
            </ViewTransition>
          </div>

          <footer className="flex flex-wrap justify-between gap-4 px-4 pb-7 text-muted-foreground text-sm lg:px-6 print:hidden">
            <span>{shell.footer.made}</span>
            <span>
              {shell.footer.hint} <code className="rounded-md bg-accent px-1.5 font-mono text-foreground">cd ..</code>
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
