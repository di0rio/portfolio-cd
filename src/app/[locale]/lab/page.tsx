import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClipTabs } from "@/components/lab/clip-tabs";
import { CopyButton } from "@/components/lab/copy-button";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import { Terminal } from "@/components/lab/terminal";
import { alternates, getT } from "@/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getT();
  return { title: t.app.lab.title, description: t.app.lab.intro, alternates: alternates(locale, "/lab") };
}

export default async function Lab() {
  const { t, locale } = await getT();
  const copy = t.app.lab;

  return (
    <>
      <section>
        <h1 className="mb-1.5 font-bold font-heading text-[22px]">{copy.title}</h1>
        <p className="max-w-[520px] text-pretty text-muted-foreground">{copy.intro}</p>
      </section>

      <Experiment desc={copy.hold.desc} id="segurar" title={copy.hold.title}>
        <HoldToConfirm done={copy.hold.done} label={copy.hold.label} />
      </Experiment>

      <Experiment desc={copy.copy.desc} id="copiar" title={copy.copy.title}>
        <CopyButton done={copy.copy.done} label={copy.copy.label} text={`https://github.com/${site.github}`} />
      </Experiment>

      <Experiment desc={copy.tabs.desc} id="abas" title={copy.tabs.title}>
        <ClipTabs items={[copy.tabs.day, copy.tabs.week, copy.tabs.month, copy.tabs.year]} label={copy.tabs.label} />
      </Experiment>

      <Experiment desc={copy.terminal.desc} id="terminal" title={copy.terminal.title}>
        <Terminal locale={locale} />
      </Experiment>
    </>
  );
}

function Experiment({ id, title, desc, children }: { id: string; title: string; desc: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 className="font-medium text-[17px]" id={id}>
        {title}
      </h2>
      <p className="mt-1 mb-4 max-w-[520px] text-pretty text-muted-foreground text-[15px]">{desc}</p>
      <div className="flex min-h-40 items-center justify-center rounded-xl border bg-card px-6 py-10">{children}</div>
    </section>
  );
}
