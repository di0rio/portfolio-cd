import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { getBlogRepos } from "@/lib/github";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.app.blog.title, description: t.app.blog.intro };
}

export default async function Blog() {
  const { t, dateLocale } = await getT();
  const copy = t.app.blog;
  const repos = await getBlogRepos();
  const fmt = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section>
      <h1 className="mb-1.5 font-bold font-heading text-[22px]">{copy.title}</h1>
      <p className="mb-8 text-muted-foreground">{copy.intro}</p>

      {repos.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {repos.map((repo) => (
            <li key={repo.name}>
              <Link
                className="block rounded-xl border px-4.5 py-4 outline-none transition-[border-color,background-color,transform] duration-150 ease-out hover:border-brand motion-safe:active:scale-[0.99] hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand"
                href={`/blog/${repo.name}`}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-[17px]">{repo.name}</span>
                  <time className="whitespace-nowrap text-muted-foreground text-sm tabular-nums" dateTime={repo.created_at}>
                    {fmt.format(new Date(repo.created_at))}
                  </time>
                </span>
                {repo.description && <span className="mt-1 block text-muted-foreground text-[14.5px]">{repo.description}</span>}
                {repo.topics.length > 0 && (
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    {repo.topics.map((topic) => (
                      <span className="rounded-full border px-2 font-mono text-muted-foreground text-xs" key={topic}>
                        {topic}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
