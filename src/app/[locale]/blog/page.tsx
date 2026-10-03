import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type CSSProperties, ViewTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogPosts } from "@/lib/github";
import { readingTime } from "@/lib/reading-time";

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
    <>
      <PageHeader intro={copy.intro} title={copy.title} />

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {posts.map((post, i) => (
            <li className="rise" key={post.slug} style={{ "--i": Math.min(i, 8) } as CSSProperties}>
              <Link
                className="group -mx-2 grid gap-x-6 gap-y-0.5 rounded-lg px-2 py-3 outline-none focus-visible:ring-2 focus-visible:ring-brand sm:grid-cols-[7.5rem_1fr_auto]"
                href={localePath(locale, `/blog/${post.slug}`)}
              >
                <span className="flex flex-wrap gap-x-2 whitespace-nowrap pt-0.5 text-muted-foreground text-sm tabular-nums sm:block">
                  <time dateTime={post.date}>{fmt.format(new Date(post.date))}</time>
                  {post.note && <span className="sm:block">{readingTime(post.note.markdown, dateLocale)}</span>}
                </span>
                <span className="min-w-0">
                  <span className="block">
                    <ViewTransition default="none" name={`post-title-${post.slug}`} share="morph">
                      <span className="font-medium text-base underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 ease-[ease] group-hover:decoration-brand group-focus-visible:decoration-brand">
                        {post.title}
                      </span>
                    </ViewTransition>
                  </span>
                  {post.description && <span className="mt-0.5 block text-muted-foreground text-[14.5px]">{post.description}</span>}
                  {post.topics.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {post.topics.map((topic) => (
                        <span className="rounded-full border px-2 font-mono text-muted-foreground text-xs" key={topic}>
                          {topic}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                {/* Seta em coluna própria: no texto ela caía sozinha pra linha de baixo quando o título enchia a linha. */}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="mt-1.5 size-3.5 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 max-sm:hidden"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
