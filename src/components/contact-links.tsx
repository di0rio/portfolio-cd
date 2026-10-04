import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import {
	GithubIcon,
	InstagramIcon,
	LinkedinIcon,
} from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { site } from "@/lib/site";

type Labels = { cv: string };
type ContactLink = {
	track: string;
	href: string;
	label: string;
	icon: React.ReactNode;
	internal?: boolean;
	rel?: string;
	target?: string;
};

/** Ações de contato (CV, LinkedIn, Instagram, GitHub). O contato por mensagem fica no formulário da /freela. */
export function ContactLinks({
	locale,
	labels,
	cv = true,
}: {
	locale: Locale;
	labels: Labels;
	cv?: boolean;
}) {
	const external = { rel: "noopener", target: "_blank" };
	const links: ContactLink[] = [];
	if (cv)
		links.push({
			track: "cv",
			href: localePath(locale, "/cv"),
			label: labels.cv,
			icon: <FileTextIcon aria-hidden="true" />,
			internal: true,
		});
	if (site.linkedin) {
		links.push({
			track: "linkedin",
			href: `https://linkedin.com/in/${site.linkedin}`,
			label: "LinkedIn",
			icon: <LinkedinIcon aria-hidden="true" />,
			...external,
		});
	}
	links.push({
		track: "instagram",
		href: `https://www.instagram.com/${site.instagram}/`,
		label: "Instagram",
		icon: <InstagramIcon aria-hidden="true" />,
		...external,
	});
	links.push({
		track: "github",
		href: `https://github.com/${site.github}`,
		label: "GitHub",
		icon: <GithubIcon aria-hidden="true" />,
		...external,
	});

	return (
		<ul className="flex flex-wrap gap-2">
			{links.map(({ track, href, label, icon, internal, ...rest }) => (
				<li key={track}>
					<Button
						nativeButton={false}
						render={
							internal ? (
								<Link data-track={track} href={href} />
							) : (
								<a data-track={track} href={href} {...rest} />
							)
						}
						size="sm"
						variant="outline"
					>
						{icon}
						{label}
					</Button>
				</li>
			))}
		</ul>
	);
}
