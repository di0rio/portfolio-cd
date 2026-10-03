import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BeforeAfter } from "@/components/lab/before-after";
import { ClipTabs } from "@/components/lab/clip-tabs";
import { CopyButton } from "@/components/lab/copy-button";
import { DragSheet } from "@/components/lab/drag-sheet";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import { PaletteDemo } from "@/components/lab/palette-demo";
import { ReorderList } from "@/components/lab/reorder-list";
import { Terminal } from "@/components/lab/terminal";
import { ToastStack } from "@/components/lab/toast-stack";
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

      {/* Os mais novos primeiro. */}
      <Experiment desc={copy.toasts.desc} id="toasts" title={copy.toasts.title}>
        <ToastStack
          copy={{
            add: copy.toasts.add,
            clear: copy.toasts.clear,
            region: copy.toasts.region,
            dismiss: copy.toasts.dismiss,
            messages: [
              { title: copy.toasts.m1, desc: copy.toasts.d1 },
              { title: copy.toasts.m2, desc: copy.toasts.d2 },
              { title: copy.toasts.m3, desc: copy.toasts.d3 },
              { title: copy.toasts.m4, desc: copy.toasts.d4 },
            ],
          }}
        />
      </Experiment>

      <Experiment desc={copy.palette.desc} id="paleta" title={copy.palette.title}>
        <PaletteDemo label={copy.palette.open} />
      </Experiment>

      <Experiment desc={copy.sheet.desc} id="gaveta" title={copy.sheet.title}>
        <DragSheet
          copy={{ open: copy.sheet.open, title: copy.sheet.sheetTitle, body: copy.sheet.body, close: copy.sheet.close, hint: copy.sheet.hint }}
        />
      </Experiment>

      <Experiment desc={copy.reorder.desc} id="flip" title={copy.reorder.title}>
        <ReorderList
          copy={{
            items: [copy.reorder.item1, copy.reorder.item2, copy.reorder.item3, copy.reorder.item4],
            up: copy.reorder.up,
            down: copy.reorder.down,
            shuffle: copy.reorder.shuffle,
            label: copy.reorder.label,
          }}
        />
      </Experiment>

      <Experiment desc={copy.compare.desc} id="antes-depois" title={copy.compare.title}>
        <BeforeAfter
          copy={{
            label: copy.compare.label,
            before: copy.compare.before,
            after: copy.compare.after,
            title: copy.compare.cardTitle,
            meta: copy.compare.cardMeta,
            action: copy.compare.cardAction,
          }}
        />
      </Experiment>

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
