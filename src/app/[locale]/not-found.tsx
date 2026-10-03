import Link from "next/link";
import { localePath } from "@/i18n/path";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const { t, locale } = await getT();
  const copy = t.app.notFound;

  return (
    <section>
      <p className="font-mono text-muted-foreground text-sm">
        <span className="text-brand-foreground">~</span> $ cd {copy.path}
      </p>
      <p className="mt-1 font-mono text-sm">{copy.error}</p>
      <p aria-hidden="true" className="mt-1 font-mono text-muted-foreground text-sm">
        <span className="text-brand-foreground">~</span> ${" "}
        <span className="inline-block h-[1.1em] w-[0.55em] animate-caret-blink bg-brand align-[-0.2em] motion-reduce:animate-none" />
      </p>
      <h1 className="mt-8 font-bold font-heading text-[28px] leading-tight">{copy.title}</h1>
      <p className="mt-2 max-w-[460px] text-muted-foreground">{copy.body}</p>
      <Link
        className="mt-6 inline-block underline decoration-brand underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-brand"
        href={localePath(locale, "/")}
      >
        {copy.home}
      </Link>
    </section>
  );
}
