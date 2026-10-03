import { BriefcaseIcon, FileTextIcon, FolderIcon, MailIcon, RssIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import type { Locale, translations } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { site } from "@/lib/site";

function Item({ href, icon, track, children }: { href: string; icon: ReactNode; track?: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <Link
      className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-muted-foreground text-[15px] outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand max-lg:flex-row-reverse max-lg:border max-lg:justify-start [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-70"
      data-track={track}
      href={href}
      {...(external ? { rel: "noopener", target: "_blank" } : {})}
    >
      {children}
      {icon}
    </Link>
  );
}

type NavCopy = Record<keyof (typeof translations)["pt"]["components"]["site-shell"]["nav"], string>;

export function Sidebar({ locale, nav }: { locale: Locale; nav: NavCopy }) {
  return (
    <aside className="lg:sticky lg:top-8 lg:w-48 lg:self-start lg:justify-self-end print:hidden">
      <nav aria-label={nav.label} className="flex flex-col gap-0.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-1">
        <Item href={localePath(locale, "/#projetos")} icon={<FolderIcon aria-hidden="true" />}>{nav.projects}</Item>
        <Item href={localePath(locale, "/#experiencia")} icon={<BriefcaseIcon aria-hidden="true" />}>{nav.experience}</Item>
        <Item href={localePath(locale, "/blog")} icon={<RssIcon aria-hidden="true" />}>{nav.blog}</Item>
        <Item href={localePath(locale, "/cv")} icon={<FileTextIcon aria-hidden="true" />} track="cv">{nav.cv}</Item>
        <hr className="my-2.5 mr-2 w-10 self-end border-border max-lg:hidden" />
        <Item href={`https://github.com/${site.github}`} track="github" icon={<GithubIcon aria-hidden="true" />}>/{site.github}</Item>
        {site.linkedin && (
          <Item href={`https://linkedin.com/in/${site.linkedin}`} track="linkedin" icon={<LinkedinIcon aria-hidden="true" />}>/in/{site.linkedin}</Item>
        )}
        {site.email && <Item href={`mailto:${site.email}`} track="email" icon={<MailIcon aria-hidden="true" />}>{nav.email}</Item>}
      </nav>
    </aside>
  );
}
