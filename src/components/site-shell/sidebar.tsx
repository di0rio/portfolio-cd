import { BriefcaseIcon, FileTextIcon, FolderIcon, MailIcon, RssIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { translations } from "@/i18n/generated";
import { site } from "@/lib/site";

// lucide não traz mais ícones de marca, então GitHub e LinkedIn ficam inline.
function GithubIcon(props: ComponentProps<"svg">) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .4 1 .4 2 .1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    </svg>
  );
}

function LinkedinIcon(props: ComponentProps<"svg">) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z" />
    </svg>
  );
}

function Item({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <Link
      className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-muted-foreground text-[15px] outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand max-lg:flex-row-reverse max-lg:border max-lg:justify-start [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-70"
      href={href}
      {...(external ? { rel: "noopener", target: "_blank" } : {})}
    >
      {children}
      {icon}
    </Link>
  );
}

type NavCopy = Record<keyof (typeof translations)["pt"]["components"]["site-shell"]["nav"], string>;

export function Sidebar({ nav }: { nav: NavCopy }) {
  return (
    <aside className="lg:sticky lg:top-8 lg:w-48 lg:self-start lg:justify-self-end">
      <nav aria-label={nav.label} className="flex flex-col gap-0.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-1">
        <Item href="/blog" icon={<RssIcon aria-hidden="true" />}>{nav.blog}</Item>
        <Item href="/#experiencia" icon={<BriefcaseIcon aria-hidden="true" />}>{nav.experience}</Item>
        <Item href="/#projetos" icon={<FolderIcon aria-hidden="true" />}>{nav.projects}</Item>
        <hr className="my-2.5 mr-2 w-10 self-end border-border max-lg:hidden" />
        <Item href={`https://github.com/${site.github}`} icon={<GithubIcon aria-hidden="true" />}>/{site.github}</Item>
        {site.linkedin && (
          <Item href={`https://linkedin.com/in/${site.linkedin}`} icon={<LinkedinIcon aria-hidden="true" />}>/in/{site.linkedin}</Item>
        )}
        {site.email && <Item href={`mailto:${site.email}`} icon={<MailIcon aria-hidden="true" />}>{nav.email}</Item>}
        {site.cv && <Item href={site.cv} icon={<FileTextIcon aria-hidden="true" />}>{nav.cv}</Item>}
      </nav>
    </aside>
  );
}
