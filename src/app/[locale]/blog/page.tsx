import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogPosts } from "@/lib/github";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getT();
  return { title: t.app.blog.title, description: t.app.blog.intro, alternates: alternates(locale, "/blog") };
}

export default async function Blog() {
  const { t, locale, dateLocale } = await getT();
  const copy = t.app.blog;
  const posts = await getBlogPosts(locale);
  const fmt = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section>
      <h1 className="mb-1.5 font-bold font-heading text-[22px]">{copy.title}</h1>
      <p className="mb-8 text-muted-foreground">{copy.intro}</p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                className="block rounded-xl border px-4.5 py-4 outline-none transition-colors duration-150 hover:border-brand hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand"
                href={localePath(locale, `/blog/${post.slug}`)}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <ViewTransition default="none" name={`post-title-${post.slug}`} share="morph">
                    <span className="font-medium text-[17px]">{post.title}</span>
                  </ViewTransition>
                  <time className="whitespace-nowrap text-muted-foreground text-sm tabular-nums" dateTime={post.date}>
                    {fmt.format(new Date(post.date))}
                  </time>
                </span>
                {post.description && <span className="mt-1 block text-muted-foreground text-[14.5px]">{post.description}</span>}
                {post.topics.length > 0 && (
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    {post.topics.map((topic) => (
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
