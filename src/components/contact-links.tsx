import { FileTextIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { CopyEmail } from "@/components/copy-email";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { site } from "@/lib/site";

type Labels = {
	cv: string;
	email: string;
	copyEmail: string;
	emailCopied: string;
	reply: string;
};
type ContactLink = {
	track: string;
	href: string;
	label: string;
	icon: React.ReactNode;
	internal?: boolean;
	rel?: string;
	target?: string;
};

/** Ações de contato (CV, e-mail, LinkedIn, GitHub). O Instagram fica no rodapé; na /freela também tem o formulário. */
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
	if (site.email)
		links.push({
			track: "email",
			href: `mailto:${site.email}`,
			label: labels.email,
			icon: <MailIcon aria-hidden="true" />,
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
		track: "github",
		href: `https://github.com/${site.github}`,
		label: "GitHub",
		icon: <GithubIcon aria-hidden="true" />,
		...external,
	});

	return (
		<div>
			<ul className="flex flex-wrap gap-2">
				{links.map(({ track, href, label, icon, internal, ...rest }) => (
					// E-mail e copiar formam um botão só (borda compartilhada), como um split button.
					<li className="flex" key={track}>
						<Button
							className={
								track === "email" && site.email
									? "rounded-r-none focus-visible:z-10"
									: undefined
							}
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
						{track === "email" && site.email && (
							<CopyEmail
								className="-ml-px rounded-l-none text-muted-foreground hover:text-foreground focus-visible:z-10"
								done={labels.emailCopied}
								email={site.email}
								label={labels.copyEmail}
							/>
						)}
					</li>
				))}
			</ul>
			<p className="mt-3 text-muted-foreground text-sm">{labels.reply}</p>
		</div>
	);
}
