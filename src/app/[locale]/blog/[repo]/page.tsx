import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArticleToc } from "@/components/article-toc";
import { Markdown } from "@/components/markdown";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogPost, getBlogPosts, getReadme } from "@/lib/github";
import { readingTime } from "@/lib/reading-time";
import { site } from "@/lib/site";

// O segmento `[repo]` também resolve slug de nota (`posts/<slug>` no repo de notas).
export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[repo]">): Promise<Metadata> {
  const { locale } = await getT();
  const post = await getBlogPost((await params).repo, locale);
  return post ? { title: post.title, description: post.description ?? undefined, alternates: alternates(locale, `/blog/${post.slug}`) } : {};
}

export default async function Post({ params }: PageProps<"/[locale]/blog/[repo]">) {
  const { t, locale, dateLocale } = await getT();
  const slug = (await params).repo;
  const posts = await getBlogPosts(locale); // cacheado: o mesmo da lista
  const index = posts.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const post = posts[index];
  const [newer, older] = [posts[index - 1], posts[index + 1]];

  const copy = t.app.blog;
  const { repo, note } = post;
  const readme = note ? { markdown: note.markdown, translated: note.translated } : await getReadme(post.slug, locale);
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  const shortFmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className="relative">
      <div aria-hidden="true" className="read-progress" />
      <Link className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground" href={localePath(locale, "/blog")}>
        <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
        {copy.back}
      </Link>

      <header className="mt-6 mb-8 border-b pb-6">
        {/* Mesmo nome do título na lista do blog: o título "voa" de um lugar pro outro. */}
        <ViewTransition default="none" name={`post-title-${post.slug}`} share="morph">
          <h1 className="font-bold font-heading text-[28px] leading-tight">{post.title}</h1>
        </ViewTransition>
        {post.description && <p className="mt-2 text-muted-foreground">{post.description}</p>}
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {repo && (
            <a className="text-brand-foreground underline underline-offset-3" href={repo.html_url} rel="noopener" target="_blank">
              {copy.repo}
            </a>
          )}
          {repo?.homepage && (
            <a className="text-brand-foreground underline underline-offset-3" href={repo.homepage} rel="noopener" target="_blank">
              {copy.live}
            </a>
          )}
          {repo && repo.stargazers_count > 0 && <span className="text-muted-foreground">{copy.stars({ count: String(repo.stargazers_count) })}</span>}
          {note && (
            <>
              <time className="text-muted-foreground tabular-nums" dateTime={post.date}>
                {fmt.format(new Date(post.date))}
              </time>
              <span className="text-muted-foreground tabular-nums">{readingTime(note.markdown, dateLocale)}</span>
              <a
                className="text-brand-foreground underline underline-offset-3"
                href={`https://github.com/${site.github}/${site.notes}/tree/${note.branch}/posts/${post.slug}`}
                rel="noopener"
                target="_blank"
              >
                {copy.onGithub}
              </a>
            </>
          )}
        </p>
      </header>

      {readme && !readme.translated && (
        <p className="mb-6 rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm">
          {copy.onlyPt}
        </p>
      )}

      {readme ? (
        <Markdown branch={repo?.default_branch ?? note?.branch} copy={t.app.lab.copy} dir={note && `posts/${post.slug}`} repo={repo?.name ?? site.notes}>
          {readme.markdown}
        </Markdown>
      ) : (
        <p className="text-muted-foreground">{copy.noReadme}</p>
      )}

      {(newer || older) && (
        <nav className="mt-16 grid gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-2">
          {[newer, older].map((adjacent, i) =>
            adjacent ? (
              <Link
                className={`group -mx-2 flex flex-col gap-0.5 rounded-lg px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand ${i ? "sm:col-start-2 sm:items-end sm:text-right" : ""}`}
                href={localePath(locale, `/blog/${adjacent.slug}`)}
                key={adjacent.slug}
                rel={i ? "next" : "prev"}
              >
                <time className="text-muted-foreground text-sm tabular-nums" dateTime={adjacent.date}>
                  {shortFmt.format(new Date(adjacent.date))}
                </time>
                <span className={`flex items-baseline gap-1.5 font-medium ${i ? "flex-row-reverse" : ""}`}>
                  {i ? (
                    <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 translate-y-0.5 self-center text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                  ) : (
                    <ArrowLeftIcon aria-hidden="true" className="size-3.5 shrink-0 translate-y-0.5 self-center text-muted-foreground transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
                  )}
                  <span className="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 ease-[ease] group-hover:decoration-brand group-focus-visible:decoration-brand">
                    {adjacent.title}
                  </span>
                </span>
              </Link>
            ) : null,
          )}
        </nav>
      )}

      {/* Índice no gutter direito, só onde cabe (>= 1200px); a coluna de 640px não muda. */}
      <aside className="absolute top-0 left-full hidden h-full pl-10 min-[1200px]:block">
        <div className="sticky top-8 w-48">
          <ArticleToc />
        </div>
      </aside>
    </article>
  );
}
