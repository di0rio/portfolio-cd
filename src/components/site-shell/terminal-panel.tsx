"use client";

import { XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { type Locale, translations } from "@/i18n/generated";
import { localePath, stripLocale } from "@/i18n/path";
import { children, completePath, hrefOf, resolvePath, sections, type Tree } from "./shell-routes";

export type TerminalProject = { slug: string; name: string; live?: string; repo?: string };

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  projects: TerminalProject[];
  /** Posts do blog (só o slug entra no `cd blog/<slug>`). */
  posts: { slug: string }[];
};

type Entry = { id: number; path?: string; cmd?: string; out: string[] };

const COMMANDS = ["help", "ls", "cd", "pwd", "open", "theme", "lang", "whoami", "clear"];

/**
 * Trocar de idioma remonta o layout (o segmento `[locale]` muda), então o estado do componente se perde.
 * Este objeto vive no módulo, que sobrevive à navegação no cliente: histórico e saída seguem no lugar.
 */
const memory: { entries: Entry[] | null; history: string[] } = { entries: null, history: [] };

/** Prefixo comum de várias strings. */
function commonPrefix(list: string[]) {
  let p = list[0] ?? "";
  for (const s of list) while (!s.toLowerCase().startsWith(p.toLowerCase())) p = p.slice(0, -1);
  return p;
}

/**
 * Painel do terminal global (Ctrl+` / Ctrl+J), no estilo do terminal integrado do VS Code. Carregado sob
 * demanda pelo `TerminalHost`.
 *
 * Acessibilidade: `role="dialog"` com `aria-modal="false"`. É um diálogo NÃO modal: a página continua
 * usável atrás dele (sem backdrop, sem trava de foco), mas o foco entra no prompt ao abrir, Esc fecha e o
 * foco volta pro elemento anterior ao fechar. Fechado, o painel fica no DOM (guarda histórico e saída)
 * com `inert`, então não entra na ordem de tabulação nem na árvore de acessibilidade.
 * Movimento: gaveta (`translate` em Y, 240ms entra / 180ms sai, `--ease-out`); instantâneo com reduced motion.
 */
export function TerminalPanel({ locale, open, onClose, projects, posts }: Props) {
  const copy = translations[locale].components["site-shell"].terminal;
  const router = useRouter();
  const pathname = stripLocale(usePathname() ?? "/");
  const { resolvedTheme, setTheme } = useTheme();
  const tree: Tree = { slugs: projects.map((p) => p.slug), posts: posts.map((p) => p.slug) };

  const nextId = useRef(Math.max(0, ...(memory.entries ?? []).map((e) => e.id)) + 1);
  const [entries, setEntries] = useState<Entry[]>(() => memory.entries ?? [{ id: 0, out: [copy.intro] }]);
  const [value, setValue] = useState("");
  const history = useRef(memory.history);
  const cursor = useRef(memory.history.length); // posição na história; `history.length` = linha em edição
  const draft = useRef("");

  const panel = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const skipRestore = useRef(false);

  useEffect(() => {
    memory.entries = entries;
  }, [entries]);

  // Na primeira montagem o painel nasce fechado e abre no quadro seguinte, senão não haveria transição.
  // Remontado por troca de idioma (`memory` já preenchida), volta direto ao estado anterior.
  const [ready, setReady] = useState(memory.entries !== null);
  useEffect(() => {
    // rAF pausa em aba/painel em segundo plano; o timeout garante que o painel abre mesmo assim.
    const id = requestAnimationFrame(() => setReady(true));
    const fallback = setTimeout(() => setReady(true), 50);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(fallback);
    };
  }, []);
  const shown = open && ready;

  // Foco: entra no prompt ao abrir e volta pra quem tinha o foco ao fechar.
  useEffect(() => {
    if (shown) {
      skipRestore.current = false;
      previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      input.current?.focus({ preventScroll: true });
      return;
    }
    const inside = panel.current?.contains(document.activeElement);
    // Se a paleta abriu por cima, o foco já é dela: não roubar de volta.
    if (inside && !skipRestore.current) {
      const el = previous.current;
      if (el?.isConnected) el.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
    }
  }, [shown]);

  useEffect(() => {
    const onPalette = () => {
      skipRestore.current = true;
    };
    window.addEventListener("cd:palette-open", onPalette);
    return () => window.removeEventListener("cd:palette-open", onPalette);
  }, []);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [entries]);

  const prompt = `~${pathname === "/" ? "" : pathname}`;

  function run(raw: string): string[] {
    const [name = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (name.toLowerCase()) {
      case "":
        return [];
      case "help":
        return copy.help.split("\n");
      case "pwd":
        return [prompt];
      case "whoami":
        return [`cauã · ${translations[locale].app.role}`];
      case "ls": {
        const here = children(pathname, tree);
        if (here.length && pathname !== "/") return [here.join("  ")];
        return [Object.keys(sections).join("  "), tree.slugs.join("  ")];
      }
      case "cd": {
        const target = resolvePath(pathname, arg || "~", tree);
        if (!target) return [copy.noDir({ dir: arg })];
        // Ação de teclado: navega seco.
        router.push(localePath(locale, hrefOf(target)));
        return [];
      }
      case "open": {
        if (!arg) return [copy.usage({ use: "open <projeto>" })];
        const project = projects.find((p) => p.slug.toLowerCase() === arg.toLowerCase());
        const url = project?.live ?? project?.repo;
        if (!url) return [copy.noProject({ name: arg })];
        window.open(url, "_blank", "noopener,noreferrer");
        return [copy.opening({ url })];
      }
      case "theme": {
        const next = arg ? arg.toLowerCase() : resolvedTheme === "dark" ? "light" : "dark";
        if (next !== "light" && next !== "dark") return [copy.usage({ use: "theme [light|dark]" })];
        setTheme(next);
        return [`theme: ${next}`];
      }
      case "lang": {
        const next = arg ? arg.toLowerCase() : locale === "pt" ? "en" : "pt";
        if (next !== "pt" && next !== "en") return [copy.usage({ use: "lang [pt|en]" })];
        // Mesma página no outro idioma, mantendo a âncora (igual ao seletor do header).
        const { pathname: current, hash } = window.location;
        router.push(localePath(next, stripLocale(current)) + hash, { scroll: false });
        return [`lang: ${next}`];
      }
      default:
        return [copy.notFound({ cmd: name })];
    }
  }

  function submit() {
    const raw = value;
    setValue("");
    draft.current = "";
    const cmd = raw.trim();
    if (cmd && history.current.at(-1) !== cmd) history.current.push(cmd);
    cursor.current = history.current.length;
    if (cmd.toLowerCase() === "clear") return setEntries([]);
    const out = run(raw);
    setEntries((prev) => [...prev, { id: nextId.current++, path: prompt, cmd: raw, out }]);
  }

  function complete() {
    const m = value.match(/^(\s*)(\S*)(\s+(.*))?$/);
    if (!m) return;
    const [, lead = "", head = "", tail, argRaw = ""] = m;
    let options: string[];
    let before: string; // texto antes do trecho completado
    let partial: string;
    if (tail === undefined) {
      options = COMMANDS.filter((c) => c.startsWith(head.toLowerCase()));
      before = lead;
      partial = head;
    } else {
      const cmd = head.toLowerCase();
      before = `${lead}${head} `;
      partial = argRaw;
      if (cmd === "cd") options = completePath(pathname, argRaw, tree);
      else if (cmd === "open") options = tree.slugs.filter((s) => s.startsWith(argRaw.toLowerCase()));
      else if (cmd === "theme") options = ["light", "dark"].filter((s) => s.startsWith(argRaw.toLowerCase()));
      else if (cmd === "lang") options = ["pt", "en"].filter((s) => s.startsWith(argRaw.toLowerCase()));
      else options = [];
    }
    if (!options.length) return;
    if (options.length === 1) {
      // Pasta termina em "/" e segue digitando; comando sem argumento ainda ganha um espaço.
      setValue(before + options[0] + (tail === undefined ? " " : ""));
      return;
    }
    const common = commonPrefix(options);
    if (common.length > partial.length) return setValue(before + common);
    // Sem o que estender: lista as opções, como o shell faz no segundo Tab.
    setEntries((prev) => [...prev, { id: nextId.current++, path: prompt, cmd: value, out: [options.join("  ")] }]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.current.length || cursor.current === 0) return;
      if (cursor.current === history.current.length) draft.current = value;
      cursor.current -= 1;
      setValue(history.current[cursor.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor.current >= history.current.length) return;
      cursor.current += 1;
      setValue(cursor.current === history.current.length ? draft.current : (history.current[cursor.current] ?? ""));
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <section
      aria-label={copy.title}
      aria-modal="false"
      className={
        "fixed inset-x-0 bottom-0 z-30 flex h-[clamp(200px,40dvh,420px)] flex-col border-white/10 border-t bg-[#1c1c1c] font-mono text-[#f5f5f5] text-sm shadow-[0_-12px_32px_-16px_rgb(0_0_0/0.5)] motion-reduce:[transition:none] print:hidden " +
        // `visibility` troca na hora ao abrir (precisa ser focável já) e só depois da saída ao fechar.
        (shown
          ? "visible translate-y-0 [transition:translate_240ms_var(--ease-out),visibility_0s]"
          : "invisible translate-y-full [transition:translate_180ms_var(--ease-out),visibility_0s_linear_180ms]")
      }
      data-terminal=""
      inert={!shown}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      ref={panel}
      role="dialog"
    >
      <div className="flex h-9 shrink-0 items-center border-white/10 border-b bg-[#222220]">
        <div className="mx-auto flex w-full max-w-[640px] items-center justify-between pr-2.5 pl-4">
          <span className="text-[#818181] text-xs">{copy.title}</span>
          <button
            aria-label={copy.close}
            className="grid size-6 place-items-center rounded-md text-[#818181] outline-none transition-colors hover:text-[#f5f5f5] focus-visible:ring-2 focus-visible:ring-brand"
            onClick={onClose}
            type="button"
          >
            <XIcon aria-hidden className="size-3.5" />
          </button>
        </div>
      </div>

      {/* O clique só devolve o foco ao campo (e deixa selecionar a saída); o teclado já vive no input. */}
      <div
        aria-label={copy.title}
        className="min-h-0 flex-1 cursor-text overflow-y-auto overscroll-contain py-3 scrollbar-thin"
        onClick={() => {
          if (!window.getSelection()?.toString()) input.current?.focus();
        }}
        ref={screen}
        role="log"
      >
        <div className="mx-auto w-full max-w-[640px] px-4">
          {entries.map((entry) => (
            <div key={entry.id}>
              {entry.cmd !== undefined && (
                <p className="break-all">
                  <span className="text-[#818181]">{entry.path} $</span> {entry.cmd}
                </p>
              )}
              {entry.out.map((line, i) => (
                <p className="min-h-[1.43em] whitespace-pre-wrap break-words text-[#a3a3a3]" key={i}>
                  {line}
                </p>
              ))}
            </div>
          ))}
          <form
            className="flex items-baseline gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <span aria-hidden="true" className="shrink-0 whitespace-pre">
              <span className="font-bold">
                cd<span className="text-brand">/</span>
              </span>{" "}
              <span className="text-[#818181]">{prompt} $</span>
            </span>
            <input
              aria-label={copy.label}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="min-w-0 flex-1 bg-transparent caret-brand outline-none [caret-shape:block] any-pointer-coarse:text-base"
              enterKeyHint="go"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              ref={input}
              spellCheck={false}
              value={value}
            />
          </form>
        </div>
      </div>
    </section>
  );
}
