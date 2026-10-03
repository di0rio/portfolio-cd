"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { Locale } from "@/i18n/generated";
import { localePath, stripLocale } from "@/i18n/path";
import { cn } from "@/lib/utils";

type Copy = {
  open: string;
  title: string;
  input: string;
  placeholder: string;
  empty: string;
  close: string;
  navigate: string;
  select: string;
  dismiss: string;
  pages: string;
  posts: string;
  actions: string;
  home: string;
  projects: string;
  lab: string;
  blog: string;
  cv: string;
  freela: string;
  agora: string;
  log: string;
  theme: string;
  themeWords: string;
  language: string;
  languageWords: string;
  copyLink: string;
  copied: string;
  github: string;
};

type Item = { id: string; label: string; hint?: string; words?: string; run: () => void };
type Group = { value: string; items: Item[] };

type Props = {
  locale: Locale;
  copy: Copy;
  /** Estudos de caso (slug + nome), de `src/lib/projects.ts`. */
  projects: { slug: string; name: string }[];
  /** Nomes dos repositórios que viram post no blog. */
  posts: string[];
  github: string;
};

const noop = () => () => {};

/** Só no cliente dá pra saber a plataforma; no servidor e na hidratação vale Ctrl. */
export function useIsMac() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

/**
 * Paleta de comandos global (⌘K / Ctrl+K): páginas, posts e ações num campo só. O gatilho fica no
 * header; o atalho vale na página inteira. O campo é um `input`, então o easter egg do `cd ..` ignora o que se digita aqui.
 */
export function CommandPalette({ locale, copy, projects, posts, github }: Props) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { contains } = Autocomplete.useFilter({ sensitivity: "base" });
  const mac = useIsMac();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      e.preventDefault(); // o Ctrl+K do navegador foca a barra de busca
      if (!e.repeat) setOpen((o) => !o);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (path: string) => () => router.push(localePath(locale, path));
  const other: Locale = locale === "pt" ? "en" : "pt";

  const page = (id: string, label: string, path: string): Item => ({ id, label, hint: path, run: go(path) });
  const groups: Group[] = [
    {
      value: copy.pages,
      items: [
        page("home", copy.home, "/"),
        page("projects", copy.projects, "/#projetos"),
        ...projects.map((p) => page(`projeto-${p.slug}`, p.name, `/projetos/${p.slug}`)),
        page("lab", copy.lab, "/lab"),
        page("blog", copy.blog, "/blog"),
        page("cv", copy.cv, "/cv"),
        page("freela", copy.freela, "/freela"),
        page("agora", copy.agora, "/agora"),
        page("log", copy.log, "/log"),
      ],
    },
    ...(posts.length ? [{ value: copy.posts, items: posts.map((name) => page(`post-${name}`, name, `/blog/${name}`)) }] : []),
    {
      value: copy.actions,
      items: [
        { id: "theme", label: copy.theme, words: copy.themeWords, run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
        {
          id: "language",
          label: copy.language,
          words: copy.languageWords,
          run: () => {
            // Mesma página no outro idioma, mantendo a âncora.
            const { pathname, hash } = window.location;
            router.push(localePath(other, stripLocale(pathname)) + hash, { scroll: false });
          },
        },
        { id: "copy", label: copy.copyLink, run: () => {} }, // tratado em `pick`: fica aberta um instante pra mostrar o feedback
        { id: "github", label: copy.github, run: () => window.open(`https://github.com/${github}`, "_blank", "noopener,noreferrer") },
      ],
    },
  ];

  async function pick(item: Item) {
    if (item.id === "copy") {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        return setOpen(false); // sem permissão de área de transferência: não finge que copiou
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setOpen(false);
        setCopied(false);
      }, 700);
      return;
    }
    setOpen(false);
    item.run();
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger
        aria-keyshortcuts="Control+K Meta+K"
        aria-label={copy.open}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "max-sm:size-8 max-sm:p-0 sm:gap-2 sm:pr-2 sm:pl-2.5")}
      >
        <SearchIcon aria-hidden="true" />
        <Kbd aria-hidden="true" className="max-sm:hidden">
          {mac ? "⌘K" : "Ctrl K"}
        </Kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh] pb-3">
          <Dialog.Popup
            aria-label={copy.title}
            // O Autocomplete engole o 1º Esc (fecha a lista inline); aqui Esc sempre fecha a paleta.
            onKeyDownCapture={(e) => {
              if (e.key !== "Escape") return;
              e.stopPropagation();
              setOpen(false);
            }}
            className="flex max-h-[min(30rem,calc(100dvh-5rem))] w-full max-w-[520px] flex-col overflow-hidden rounded-xl border bg-card text-foreground outline-none transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.98] motion-safe:data-starting-style:-translate-y-1 motion-safe:data-starting-style:scale-[0.98]"
          >
            <Autocomplete.Root
              autoHighlight="always"
              filter={(item: Item, query) => contains(`${item.label} ${item.words ?? ""} ${item.hint ?? ""}`, query)}
              inline
              items={groups}
              itemToStringValue={(item: Item) => item.label}
              keepHighlight
              open
            >
              <Autocomplete.InputGroup className="flex items-center gap-2.5 border-b px-3.5">
                <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <Autocomplete.Input
                  aria-label={copy.input}
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground any-pointer-coarse:text-base"
                  placeholder={copy.placeholder}
                />
              </Autocomplete.InputGroup>
              <Dialog.Close className="sr-only">{copy.close}</Dialog.Close>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <Autocomplete.Empty>
                  <p className="px-4 py-8 text-center text-muted-foreground text-sm">{copy.empty}</p>
                </Autocomplete.Empty>
                <Autocomplete.List className="p-1.5">
                  {(group: Group) => (
                    <Autocomplete.Group className="not-last:mb-1" items={group.items} key={group.value}>
                      <Autocomplete.GroupLabel className="px-2.5 pt-2 pb-1 text-muted-foreground text-xs">{group.value}</Autocomplete.GroupLabel>
                      <Autocomplete.Collection>
                        {(item: Item) => (
                          <Autocomplete.Item
                            className="group flex min-h-9 cursor-default select-none items-center justify-between gap-3 rounded-md px-2.5 text-sm outline-none transition-colors duration-100 data-highlighted:bg-accent"
                            key={item.id}
                            onClick={() => pick(item)}
                            value={item}
                          >
                            <span className="min-w-0 truncate">{item.id === "copy" && copied ? copy.copied : item.label}</span>
                            {item.hint && <span className="shrink-0 font-mono text-muted-foreground text-xs">{item.hint}</span>}
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>

              <div className="flex items-center gap-4 border-t px-3.5 py-2 text-muted-foreground text-xs max-sm:hidden" aria-hidden="true">
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd> {copy.navigate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd> {copy.select}
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>esc</Kbd> {copy.dismiss}
                </span>
              </div>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
