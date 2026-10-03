"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/generated";
import { localePath, stripLocale } from "@/i18n/path";

type NavCopy = { label: string; home: string; projects: string; lab: string; blog: string; cv: string };

/**
 * Topo do site como um prompt: `cd/ ~/blog $▍` mostra onde você está, e os links são os
 * lugares pra onde dá pra ir. A página atual ganha sublinhado amarelo.
 */
export function SiteNav({ locale, copy }: { locale: Locale; copy: NavCopy }) {
  const path = stripLocale(usePathname() ?? "/");
  const segment = path.split("/")[1] ?? "";
  const links = [
    { href: "/#projetos", label: copy.projects, match: null },
    { href: "/lab", label: copy.lab, match: "lab" },
    { href: "/blog", label: copy.blog, match: "blog" },
    { href: "/cv", label: copy.cv, match: "cv" },
  ];

  return (
    <>
      <Link
        aria-label={copy.home}
        className="group flex items-baseline gap-2 justify-self-start rounded-md font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
        href={localePath(locale, "/")}
      >
        <span className="font-bold text-base text-foreground">
          cd<span className="text-brand-foreground">/</span>
        </span>
        <span aria-hidden="true" className="text-muted-foreground">
          ~{segment ? `/${segment}` : ""} ${" "}
          <span className="inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-caret-blink bg-brand motion-reduce:animate-none" />
        </span>
      </Link>
      <nav aria-label={copy.label} className="max-sm:-mx-1 max-sm:order-last max-sm:col-span-2 max-sm:overflow-x-auto">
        <ul className="flex items-center gap-1 text-muted-foreground text-sm">
          {links.map((l) => {
            const current = l.match !== null && segment === l.match;
            return (
              <li key={l.href}>
                <Link
                  aria-current={current ? "page" : undefined}
                  className="block whitespace-nowrap rounded-md px-2 py-1 underline-offset-[6px] outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:decoration-brand"
                  href={localePath(locale, l.href)}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
