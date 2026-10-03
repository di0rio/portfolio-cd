import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Markdown } from "@/components/markdown";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogRepo, getReadme } from "@/lib/github";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[repo]">): Promise<Metadata> {
  const repo = await getBlogRepo((await params).repo);
  const { locale } = await getT();
  return repo ? { title: repo.name, description: repo.description ?? undefined, alternates: alternates(locale, `/blog/${repo.name}`) } : {};
}

export default async function Post({ params }: PageProps<"/[locale]/blog/[repo]">) {
  const repo = await getBlogRepo((await params).repo);
  if (!repo) notFound();

  const { t, locale } = await getT();
  const copy = t.app.blog;
  const readme = await getReadme(repo.name, locale);

  return (
    <article>
      <Link className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground" href={localePath(locale, "/blog")}>
        <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
        {copy.back}
      </Link>

      <header className="mt-6 mb-8 border-b pb-6">
        {/* Mesmo nome do título na lista do blog: o título "voa" de um lugar pro outro. */}
        <ViewTransition default="none" name={`post-title-${repo.name}`} share="morph">
          <h1 className="font-bold font-heading text-[28px] leading-tight">{repo.name}</h1>
        </ViewTransition>
        {repo.description && <p className="mt-2 text-muted-foreground">{repo.description}</p>}
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a className="text-brand-foreground underline underline-offset-3" href={repo.html_url} rel="noopener" target="_blank">
            {copy.repo}
          </a>
          {repo.homepage && (
            <a className="text-brand-foreground underline underline-offset-3" href={repo.homepage} rel="noopener" target="_blank">
              {copy.live}
            </a>
          )}
          {repo.stargazers_count > 0 && <span className="text-muted-foreground">{copy.stars({ count: String(repo.stargazers_count) })}</span>}
        </p>
      </header>

      {readme && !readme.translated && (
        <p className="mb-6 rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm">
          {copy.onlyPt}
        </p>
      )}

      {readme ? (
        <Markdown branch={repo.default_branch} repo={repo.name}>
          {readme.markdown}
        </Markdown>
      ) : (
        <p className="text-muted-foreground">{copy.noReadme}</p>
      )}
    </article>
  );
}
