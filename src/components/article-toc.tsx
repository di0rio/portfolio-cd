"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Item = { id: string; label: string };

// A cor e a borda mudam sem movimento; o pai só mostra o índice onde há gutter (>= 1200px).
const link =
  "-ml-px block border-l py-1 pl-3 text-sm transition-colors duration-150 ease-[ease] outline-none focus-visible:ring-2 focus-visible:ring-brand";

const headings = () => [...document.querySelectorAll<HTMLElement>(".markdown h2[id]")];

// Os h2 já estão no DOM (o markdown é renderizado no servidor). Como string, o snapshot é estável entre leituras.
const snapshot = () =>
  JSON.stringify(
    headings().map((h) => ({
      id: h.id,
      label: [...h.childNodes]
        .filter((n) => !(n instanceof Element && n.classList.contains("anchor")))
        .map((n) => n.textContent)
        .join(""),
    })),
  );
const subscribe = () => () => {};

/** Índice dos h2 do artigo; destaca a última seção que passou do quarto de cima da tela. */
export function ArticleToc() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = useMemo<Item[]>(() => JSON.parse(raw), [raw]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const hs = headings();
    let frame = 0;
    const update = () => {
      frame = 0;
      const band = window.innerHeight * 0.25;
      setActive([...hs].reverse().find((h) => h.getBoundingClientRect().top <= band)?.id ?? "");
    };
    // Um IntersectionObserver não avisa quando a rolagem pula uma seção inteira (#hash, End, arrastar a barra);
    // por isso, rolagem passiva com no máximo uma leitura por frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (items.length < 2) return null;

  return (
    <nav>
      <ul className="border-l">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              aria-current={active === id ? "location" : undefined}
              className={`${link} ${active === id ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              href={`#${id}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
