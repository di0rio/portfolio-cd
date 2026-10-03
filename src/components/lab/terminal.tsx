"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type Locale, translations } from "@/i18n/generated";
import { localePath } from "@/i18n/path";

const places: Record<string, string> = {
  "..": "/",
  "~": "/",
  "/": "/",
  projetos: "/#projetos",
  projects: "/#projetos",
  experiencia: "/#experiencia",
  experience: "/#experiencia",
  blog: "/blog",
  lab: "/lab",
  cv: "/cv",
};

type Line = { cmd: string; out: string[] };

/** Terminal de mentirinha que navega pelo site. Ação de teclado: tudo instantâneo, sem animação. */
export function Terminal({ locale }: { locale: Locale }) {
  const copy = translations[locale].app.lab.terminal;
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  function run(raw: string) {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "":
        return [];
      case "help":
        return [copy.help];
      case "whoami":
        return [copy.whoami];
      case "ls":
        return ["projetos  experiencia  blog  lab  cv"];
      case "date":
        return [new Date().toLocaleString(locale === "pt" ? "pt-BR" : "en-US")];
      case "echo":
        return [arg];
      case "sudo":
        return [copy.sudo];
      case "cd": {
        const dir = (arg || "~").toLowerCase();
        const target = Object.hasOwn(places, dir) ? places[dir] : undefined; // `cd constructor` não pode achar chave do protótipo
        if (!target) return [copy.noDir({ dir: arg })];
        router.push(localePath(locale, target));
        return [];
      }
      default:
        return [copy.notFound({ cmd })];
    }
  }

  return (
    <div
      className="w-full max-w-md cursor-text rounded-lg border bg-[#1c1c1c] font-mono text-[#f5f5f5] text-sm"
      onClick={() => input.current?.focus()}
      role="presentation"
    >
      <div className="max-h-48 overflow-y-auto p-3 scrollbar-thin" ref={screen}>
        {lines.map((line, i) => (
          <div key={i}>
            <p>
              <span className="text-brand">~</span> <span className="text-[#a3a3a3]">$</span> {line.cmd}
            </p>
            {line.out.map((out, j) => (
              <p className="whitespace-pre-wrap text-[#a3a3a3]" key={j}>
                {out}
              </p>
            ))}
          </div>
        ))}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim().toLowerCase() === "clear") setLines([]);
            else setLines((prev) => [...prev, { cmd: value, out: run(value) }]);
            setValue("");
          }}
        >
          <span aria-hidden="true">
            <span className="text-brand">~</span> <span className="text-[#a3a3a3]">$</span>
          </span>
          <input
            aria-label={copy.label}
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent caret-brand outline-none placeholder:text-[#737373]"
            onChange={(e) => setValue(e.target.value)}
            placeholder={copy.placeholder}
            ref={input}
            spellCheck={false}
            value={value}
          />
        </form>
      </div>
    </div>
  );
}
