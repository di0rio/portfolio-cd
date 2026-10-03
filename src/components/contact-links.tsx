import { FileTextIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { buttonVariants } from "@/components/ui/button-variants";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { site } from "@/lib/site";

type Labels = { email: string; cv: string };
type ContactLink = { track: string; href: string; label: string; icon: React.ReactNode; internal?: boolean; rel?: string; target?: string };

/** Ações de contato (e-mail, CV, LinkedIn, GitHub). E-mail e LinkedIn só aparecem quando configurados em `site`. */
export function ContactLinks({ locale, labels, cv = true }: { locale: Locale; labels: Labels; cv?: boolean }) {
  const external = { rel: "noopener", target: "_blank" };
  const links: ContactLink[] = [];
  if (site.email) links.push({ track: "email", href: `mailto:${site.email}`, label: labels.email, icon: <MailIcon aria-hidden="true" /> });
  if (cv) links.push({ track: "cv", href: localePath(locale, "/cv"), label: labels.cv, icon: <FileTextIcon aria-hidden="true" />, internal: true });
  if (site.linkedin) {
    links.push({ track: "linkedin", href: `https://linkedin.com/in/${site.linkedin}`, label: "LinkedIn", icon: <LinkedinIcon aria-hidden="true" />, ...external });
  }
  links.push({ track: "github", href: `https://github.com/${site.github}`, label: "GitHub", icon: <GithubIcon aria-hidden="true" />, ...external });

  return (
    <ul className="flex flex-wrap gap-2">
      {links.map(({ track, href, label, icon, internal, ...rest }) => {
        const className = buttonVariants({ size: "sm", variant: "outline" });
        return (
          <li key={track}>
            {internal ? (
              <Link className={className} data-track={track} href={href}>
                {icon}
                {label}
              </Link>
            ) : (
              <a className={className} data-track={track} href={href} {...rest}>
                {icon}
                {label}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
