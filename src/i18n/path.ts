import type { Locale } from "./generated";

/** Português fica sem prefixo; os outros idiomas ganham `/<locale>`. Ex.: ("en", "/#projetos") → "/en#projetos". */
export function localePath(locale: Locale, path: string) {
  if (locale === "pt") return path;
  const rest = path === "/" ? "" : path.startsWith("/#") ? path.slice(1) : path;
  return `/${locale}${rest}`;
}

/** Tira o prefixo de idioma de um pathname do navegador: "/en/blog" → "/blog". */
export function stripLocale(pathname: string) {
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}
