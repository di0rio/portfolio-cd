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
  /** Teclado (atalho, Esc) abre/fecha sem animação; ponteiro usa a gaveta. */
  instant: boolean;
  /** `instant` = fechar na hora (Esc); sem argumento, fecha animado. */
  onClose: (instant?: boolean) => void;
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

const STORAGE_KEY = "cd:terminal-h";
const MIN_HEIGHT = 160;
const SITE_HEADER = 56; // altura do header do site: o painel nunca cobre isso
const RUBBER_DIM = 200;
const SNAP = "height 200ms var(--ease-out)";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Resistência elástica além dos limites: cresce rápido no começo e satura em `RUBBER_DIM`. */
const rubber = (over: number) => (over * RUBBER_DIM * 0.55) / (RUBBER_DIM + 0.55 * Math.abs(over));

/** Equivalente em px de `clamp(200px, 40dvh, 420px)`; em tela estreita ocupa mais (55%). */
function defaultHeight(vh: number, width: number) {
  return width < 640 ? Math.round(vh * 0.55) : Math.min(420, Math.max(200, vh * 0.4));
}

function readStored() {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeStored(n: number | null) {
  try {
    if (n === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(n));
  } catch {}
}

/** Altura visível e quanto o teclado virtual ocupa embaixo (`visualViewport` encolhe com ele). */
function readViewport() {
  const v = window.visualViewport;
  const h = v?.height ?? window.innerHeight;
  return { h, w: window.innerWidth, kb: v ? Math.max(0, window.innerHeight - v.height - v.offsetTop) : 0 };
}

type Drag = { id: number; y: number; h: number; raw: number; moves: { y: number; t: number }[] };

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
 * Movimento: abrir/fechar por teclado (atalho, Esc) é instantâneo, porque se repete o dia todo. Por ponteiro
 * (paleta, botão de fechar) é uma gaveta (`translate` em Y, 260ms entra / 200ms sai, `--ease-drawer`).
 * Na primeira abertura a entrada usa `starting:` (sem rAF). Com reduced motion vira um fade de 150ms.
 * Redimensiona arrastando a borda de cima (ou com setas/Home/End): estica com resistência elástica além dos
 * limites, volta com 200ms e fecha se soltar com velocidade pra baixo. A altura fica em `localStorage`.
 */
export function TerminalPanel({ locale, open, instant, onClose, projects, posts }: Props) {
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

  // Entrada via `starting:` só na primeira montagem; remontado por troca de idioma (`memory` já preenchida)
  // volta direto ao estado anterior, sem entrar de novo.
  const [fresh] = useState(() => memory.entries === null);
  const shown = open;

  // Altura: preferência do usuário (null = padrão) limitada pela área visível. Re-clampa quando a viewport muda.
  const [pref, setPref] = useState<number | null>(readStored);
  const [vp, setVp] = useState(readViewport);
  const max = Math.max(MIN_HEIGHT, vp.h - SITE_HEADER);
  const height = Math.round(clamp(pref ?? defaultHeight(vp.h, vp.w), MIN_HEIGHT, max));
  const drag = useRef<Drag | null>(null);

  // Teclado virtual: `visualViewport` encolhe e o painel sobe junto, sem esconder o prompt.
  useEffect(() => {
    if (!shown) return;
    const v = window.visualViewport;
    const update = () =>
      setVp((prev) => {
        const next = readViewport();
        return prev.h === next.h && prev.w === next.w && prev.kb === next.kb ? prev : next;
      });
    update();
    v?.addEventListener("resize", update);
    v?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      v?.removeEventListener("resize", update);
      v?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [shown]);

  // Aberto, o painel empurra a página pra cima dele (nada fica escondido). Durante o arrasto `height` não
  // muda, então só atualiza ao soltar. O `style.height` direto também desfaz um arrasto que terminou fechando.
  useEffect(() => {
    if (!shown) return;
    if (panel.current) panel.current.style.height = `${height}px`;
    document.body.style.paddingBottom = `${height}px`;
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [shown, height]);

  // Se desmontar no meio do arrasto (troca de idioma), devolve cursor e seleção.
  useEffect(
    () => () => {
      document.documentElement.style.cursor = "";
      document.documentElement.style.userSelect = "";
    },
    [],
  );

  function commit(next: number | null) {
    setPref(next);
    writeStored(next);
  }

  function setDragging(on: boolean) {
    document.documentElement.style.cursor = on ? "row-resize" : "";
    document.documentElement.style.userSelect = on ? "none" : "";
  }

  function resizeStart(e: React.PointerEvent<HTMLDivElement>) {
    // Já arrastando (segundo dedo) ou botão que não é o principal: ignora.
    if (drag.current || !panel.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const h = panel.current.getBoundingClientRect().height;
    drag.current = { id: e.pointerId, y: e.clientY, h, raw: h, moves: [{ y: e.clientY, t: e.timeStamp }] };
    panel.current.style.transition = "none";
    setDragging(true);
  }

  function resizeMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !panel.current) return;
    d.raw = d.h + (d.y - e.clientY); // respeita onde se agarrou a borda
    d.moves.push({ y: e.clientY, t: e.timeStamp });
    if (d.moves.length > 5) d.moves.shift();
    const shownH = d.raw > max ? max + rubber(d.raw - max) : d.raw < MIN_HEIGHT ? Math.max(0, MIN_HEIGHT - rubber(MIN_HEIGHT - d.raw)) : d.raw;
    panel.current.style.height = `${shownH}px`; // direto no DOM: sem re-render a cada movimento
  }

  function resizeEnd(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const el = panel.current;
    if (!d || d.id !== e.pointerId || !el) return;
    drag.current = null;
    setDragging(false);
    el.style.transition = "";
    const first = d.moves[0];
    const last = d.moves[d.moves.length - 1];
    const dt = first && last ? last.t - first.t : 0;
    const velocity = first && last && dt > 0 ? (last.y - first.y) / dt : 0; // px/ms, positivo = pra baixo
    // Soltou com tranco pra baixo ou bem abaixo do mínimo: fecha (animado; a altura anterior volta ao reabrir).
    if (e.type === "pointerup" && (velocity > 0.6 || d.raw < MIN_HEIGHT - 64)) return onClose();
    const next = Math.round(clamp(d.raw, MIN_HEIGHT, max));
    if (d.raw < MIN_HEIGHT || d.raw > max) {
      // Volta do elástico só nessa soltura; reduced motion pula direto.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.style.transition = SNAP;
        setTimeout(() => {
          el.style.transition = "";
        }, 220);
      }
    }
    el.style.height = `${next}px`;
    commit(next);
  }

  function resizeKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 96 : 24;
    let next: number;
    if (e.key === "ArrowUp") next = height + step;
    else if (e.key === "ArrowDown") next = height - step;
    else if (e.key === "Home") next = max;
    else if (e.key === "End") next = MIN_HEIGHT;
    else return;
    e.preventDefault();
    commit(Math.round(clamp(next, MIN_HEIGHT, max)));
  }

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
        "fixed inset-x-0 z-30 flex flex-col border-white/[0.06] border-t bg-[#1c1c1c] font-mono text-[#f5f5f5] text-sm print:hidden " +
        // `visibility` troca na hora ao abrir (precisa ser focável já) e só depois da saída ao fechar.
        // Teclado: sem transição. Reduced motion: fade em vez de deslizar.
        (shown
          ? `visible translate-y-0 ${
              instant
                ? "[transition:none]"
                : `[transition:translate_260ms_var(--ease-drawer),visibility_0s] motion-reduce:[transition:opacity_150ms_ease,visibility_0s] ${
                    fresh ? "starting:translate-y-full motion-reduce:starting:translate-y-0 motion-reduce:starting:opacity-0" : ""
                  }`
            }`
          : `invisible translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0 ${
              instant
                ? "[transition:none]"
                : "[transition:translate_200ms_var(--ease-drawer),visibility_0s_linear_200ms] motion-reduce:[transition:opacity_150ms_ease,visibility_0s_linear_150ms]"
            }`)
      }
      data-terminal=""
      inert={!shown}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose(true);
        }
      }}
      ref={panel}
      role="dialog"
      style={{ height, bottom: vp.kb }}
    >
      {/* Borda de cima: alça de redimensionar (faixa fina com mouse; pílula visível e área maior no toque). */}
      <div
        aria-label={locale === "pt" ? "redimensionar terminal" : "resize terminal"}
        aria-orientation="horizontal"
        aria-valuemax={max}
        aria-valuemin={MIN_HEIGHT}
        aria-valuenow={height}
        className="group absolute inset-x-0 -top-1 z-10 h-2 cursor-row-resize touch-none outline-none pointer-coarse:inset-x-auto pointer-coarse:-top-2 pointer-coarse:left-1/2 pointer-coarse:h-6 pointer-coarse:w-24 pointer-coarse:-translate-x-1/2"
        onDoubleClick={() => commit(null)}
        onKeyDown={resizeKey}
        onLostPointerCapture={resizeEnd}
        onPointerCancel={resizeEnd}
        onPointerDown={resizeStart}
        onPointerMove={resizeMove}
        onPointerUp={resizeEnd}
        role="separator"
        tabIndex={0}
      >
        <span className="absolute inset-x-0 top-[3px] h-0.5 transition-colors group-hover:bg-brand/50 group-focus-visible:bg-brand group-active:bg-brand pointer-coarse:top-[7px]" />
        <span
          aria-hidden
          className="absolute top-[18px] left-1/2 hidden h-1 w-9 -translate-x-1/2 rounded-full bg-white/20 pointer-coarse:block"
        />
      </div>
      <div className="flex h-9 shrink-0 items-center border-white/[0.06] border-b bg-[#222220] any-pointer-coarse:h-11">
        <div className="mx-auto flex w-full max-w-[640px] items-center justify-between pr-2.5 pl-4">
          <span className="text-[#818181] text-xs">{copy.title}</span>
          <button
            aria-label={copy.close}
            className="grid size-6 place-items-center rounded-md text-[#818181] outline-none [transition:color_150ms_ease,scale_100ms_var(--ease-out)] hover:text-[#f5f5f5] focus-visible:ring-2 active:scale-[0.98] focus-visible:ring-brand any-pointer-coarse:size-8"
            onClick={() => onClose()}
            type="button"
          >
            <XIcon aria-hidden className="size-3.5" />
          </button>
        </div>
      </div>

      {/* O clique só devolve o foco ao campo (e deixa selecionar a saída); o teclado já vive no input. */}
      <div
        aria-label={copy.title}
        className={`min-h-0 flex-1 cursor-text overflow-y-auto overscroll-contain pt-3 scrollbar-thin [scrollbar-color:#2a2a27_transparent] ${
          vp.kb > 0 ? "pb-3" : "pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        }`}
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
              <span className="max-sm:hidden">
                <span className="font-bold">
                  cd<span className="text-brand">/</span>
                </span>{" "}
              </span>
              <span className="text-[#818181]">
                <span className="max-sm:inline-block max-sm:max-w-[45vw] max-sm:truncate max-sm:align-bottom">{prompt}</span> $
              </span>
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
