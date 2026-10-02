import { cookies } from "next/headers";
import { type Locale, setLocale, translations } from "./generated";

/**
 * Traduções do idioma da requisição, pra usar em Server Components async e `generateMetadata`.
 *
 * O `t` do better-intl lê o idioma com `use()`, que não pode ser chamado depois de um `await`.
 * E o runtime engole o erro do `cookies()` no build, o que deixaria a página estática no idioma
 * padrão. Por isso o `cookies()` vem antes, pra marcar a rota como dinâmica.
 */
export async function getT() {
  await cookies();
  const locale = (await setLocale()) as Locale;
  return { locale, t: translations[locale], dateLocale: locale === "pt" ? "pt-BR" : "en-US" };
}
