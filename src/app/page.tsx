import Image from "next/image";
import Link from "next/link";
import { Contributions } from "@/components/contributions";
import { getT } from "@/i18n/server";
import { getBlogRepos, getFeaturedRepos } from "@/lib/github";
import { site } from "@/lib/site";

const projects = [
  { name: "loopvet", key: "loopvet" },
  { name: "domus", key: "domus" },
] as const;

export default async function Home() {
  const { t, dateLocale } = await getT();
  const copy = t.app;
  const [posts, featured] = await Promise.all([getBlogRepos().then((r) => r.slice(0, 3)), getFeaturedRepos()]);
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short" });

  return (
    <>
      <section>
        <div className="flex items-center gap-4">
          <Image
            alt=""
            className="size-16 rounded-2xl border-2 border-black shadow-[3px_3px_0_var(--brand)] transition-transform duration-200 ease-out motion-safe:hover:-rotate-3"
            height={64}
            priority
            src={`https://github.com/${site.github}.png?size=128`}
            width={64}
          />
          <div>
            <h1 className="font-bold font-heading text-[22px] leading-tight">{site.shortName}</h1>
            <p className="text-muted-foreground text-[15px]">{copy.role} · @{site.github}</p>
          </div>
        </div>
        <p className="mt-4.5 max-w-[520px] text-pretty text-muted-foreground">{copy.bio}</p>
      </section>

      <Contributions />

      <section aria-labelledby="projetos" className="scroll-mt-8">
        <h2 className="mb-3.5 font-medium text-[17px]" id="projetos">
          {copy.projects.title}
        </h2>
        <ul className="divide-y border-y">
          {projects.map((p) => (
            <li className="grid gap-1 py-4 sm:grid-cols-[136px_minmax(0,1fr)] sm:gap-6" key={p.key}>
              <p className="font-medium">{p.name}</p>
              <p className="text-pretty text-muted-foreground text-[15px]">{copy.projects[p.key]}</p>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="github">
          <div className="mb-3.5 flex items-baseline justify-between gap-4">
            <h2 className="font-medium text-[17px]" id="github">
              {copy.repos.title}
            </h2>
            <a
              className="text-muted-foreground text-sm hover:text-foreground"
              href={`https://github.com/${site.github}?tab=repositories`}
              rel="noopener"
              target="_blank"
            >
              {copy.repos.all}
            </a>
          </div>
          <ul className="divide-y border-y">
            {featured.map((repo) => (
              <li key={repo.name}>
                <a
                  className="-mx-2 grid gap-1 rounded-md px-2 py-4 outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand sm:grid-cols-[136px_minmax(0,1fr)] sm:gap-6"
                  href={repo.homepage ?? repo.url}
                  rel="noopener"
                  target="_blank"
                >
                  <span className="truncate font-medium">{repo.name}</span>
                  <span className="flex flex-col gap-1">
                    {repo.description && (
                      <span className="line-clamp-2 text-pretty text-muted-foreground text-[15px]">{repo.description}</span>
                    )}
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {[repo.language, repo.stars > 0 && copy.repos.stars({ count: String(repo.stars) })].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="escrita">
          <div className="mb-3.5 flex items-baseline justify-between gap-4">
            <h2 className="font-medium text-[17px]" id="escrita">
              {copy.writing.title}
            </h2>
            <Link className="text-muted-foreground text-sm hover:text-foreground" href="/blog">
              {copy.writing.all}
            </Link>
          </div>
          <ul className="flex flex-col gap-1">
            {posts.map((post) => (
              <li className="flex items-baseline gap-3" key={post.name}>
                <span aria-hidden="true" className="size-1.5 shrink-0 -translate-y-0.5 bg-brand" />
                <Link className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand" href={`/blog/${post.name}`}>
                  {post.description ?? post.name}
                </Link>
                <time className="ml-auto whitespace-nowrap text-muted-foreground text-sm tabular-nums" dateTime={post.created_at}>
                  {fmt.format(new Date(post.created_at))}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="experiencia" className="scroll-mt-8">
        <h2 className="mb-3.5 font-medium text-[17px]" id="experiencia">
          {copy.experience.title}
        </h2>
        <p>
          Loopscape
          <span aria-hidden="true" className="mx-2 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{copy.experience.current}</span>
        </p>
        <p className="text-muted-foreground text-sm">{copy.experience.role}</p>
      </section>
    </>
  );
}
