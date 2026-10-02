import Image from "next/image";
import Link from "next/link";
import { Contributions } from "@/components/contributions";
import { getT } from "@/i18n/server";
import { getBlogRepos } from "@/lib/github";
import { site } from "@/lib/site";

const projects = [
  { name: "loopvet", key: "loopvet" },
  { name: "domus", key: "domus" },
  { name: "converter hub", key: "converter" },
] as const;

export default async function Home() {
  const { t, dateLocale } = await getT();
  const copy = t.app;
  const posts = (await getBlogRepos()).slice(0, 3);
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short" });

  return (
    <>
      <section>
        <div className="flex items-center gap-4">
          <Image
            alt=""
            className="size-16 rounded-2xl border-2 border-black shadow-[3px_3px_0_var(--brand)] transition-transform hover:-rotate-4 hover:scale-105"
            height={64}
            priority
            src="/avatar.svg"
            unoptimized
            width={64}
          />
          <div>
            <h1 className="font-bold font-heading text-[22px] leading-tight">{site.shortName}</h1>
            <p className="text-muted-foreground text-[15px]">{copy.role} · @{site.github}</p>
          </div>
        </div>
        <p className="mt-4.5 max-w-[520px] text-muted-foreground">{copy.bio}</p>
      </section>

      <Contributions />

      <section aria-labelledby="projetos" className="scroll-mt-8">
        <h2 className="mb-3.5 font-medium text-[17px]" id="projetos">
          {copy.projects.title}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {projects.map((p) => (
            <li className="rounded-xl border px-4.5 py-4 transition-colors hover:border-brand hover:bg-accent" key={p.key}>
              <p className="mb-1 font-medium text-[17px]">{p.name}</p>
              <p className="text-muted-foreground text-[14.5px]">{copy.projects[p.key]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="escrita">
        <div className="mb-3.5 flex items-baseline justify-between gap-4">
          <h2 className="font-medium text-[17px]" id="escrita">
            {copy.writing.title}
          </h2>
          {posts.length > 0 && (
            <Link className="text-muted-foreground text-sm hover:text-foreground" href="/blog">
              {copy.writing.all}
            </Link>
          )}
        </div>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-[15px]">{copy.writing.empty}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {posts.map((post) => (
              <li className="flex items-baseline gap-3" key={post.name}>
                <span aria-hidden="true" className="size-1.5 shrink-0 -translate-y-0.5 bg-brand" />
                <Link className="underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-brand" href={`/blog/${post.name}`}>
                  {post.description ?? post.name}
                </Link>
                <time className="ml-auto whitespace-nowrap text-muted-foreground text-sm" dateTime={post.created_at}>
                  {fmt.format(new Date(post.created_at))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="experiencia" className="scroll-mt-8">
        <h2 className="mb-3.5 font-medium text-[17px]" id="experiencia">
          {copy.experience.title}
        </h2>
        <p>
          <span className="text-muted-foreground">{copy.experience.loopvetWhen}</span>
          <span aria-hidden="true" className="mx-2 text-muted-foreground">•</span>
          Loopvet
        </p>
        <p className="text-muted-foreground text-sm">
          {copy.experience.loopvetPath({ from: copy.experience.loopvetFrom, to: copy.experience.loopvetTo })}
        </p>
      </section>
    </>
  );
}
