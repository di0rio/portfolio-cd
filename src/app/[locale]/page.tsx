import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import { ProjectMetric } from "@/components/project-metric";
import { Section } from "@/components/section";
import { StackList } from "@/components/stack-list";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogPosts, getContributions } from "@/lib/github";
import { projects } from "@/lib/projects";
import { highlights, site } from "@/lib/site";

// Lista curada: o trabalho que eu quero mostrar, com descrição escrita por mim (não a do GitHub).
// Quem tem estudo de caso (lib/projects) ganha link interno; o "ver ↗" aponta pro site ou repositório.
const projectItems = projects.map((p) => ({
	name: p.name,
	key: p.key,
	slug: p.slug,
	stack: p.stack,
	href: p.live ?? p.repo,
}));

export async function generateMetadata(): Promise<Metadata> {
	const { locale } = await getT();
	return { alternates: alternates(locale, "/") };
}

export default async function Home() {
	const { t, locale, dateLocale } = await getT();
	const copy = t.app;
	const nav = t.components["site-shell"].nav;
	const [posts, contributions] = await Promise.all([
		getBlogPosts(locale).then((p) => p.slice(0, 3)),
		getContributions(),
	]);
	const fmt = new Intl.DateTimeFormat(dateLocale, {
		day: "numeric",
		month: "short",
	});
	const place = `${site.location.city}, ${site.location.region}`.toLowerCase();

	return (
		<>
			{/* Quem é: o cartoon como adesivo + nome e cargo, pequeno e direto.
          O fundo escuro no <img> tapa a fresta clara que o antialias da rotação deixa entre borda e imagem. */}
			<section className="flex items-center gap-4">
				<div className="relative shrink-0">
					<Image
						alt=""
						className="size-16 -rotate-3 rounded-2xl border-2 border-black bg-[#1c1c1c] shadow-[4px_4px_0_var(--brand)] transition-transform duration-200 ease-out motion-safe:hover:rotate-0"
						height={64}
						priority
						src="/avatar.svg"
						unoptimized
						width={64}
					/>
					<span
						aria-hidden="true"
						className="absolute bottom-[calc(100%-4px)] left-[62%] origin-bottom-left animate-bubble whitespace-nowrap rounded-lg border-2 border-black bg-white px-1.5 font-heading font-medium text-brand-contrast text-xs leading-5 after:absolute after:top-full after:left-2 after:-mt-1 after:size-2 after:rotate-45 after:border-black after:border-r-2 after:border-b-2 after:bg-white"
					>
						{copy.bubble}
					</span>
				</div>
				<div>
					<h1 className="font-heading font-medium">{site.name}</h1>
					<p className="text-muted-foreground">
						{copy.role} · <span className="whitespace-nowrap">{place}</span>
					</p>
				</div>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD gerado por nós, `<` escapado
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							personJsonLd(locale, copy.role, `${copy.bio} ${copy.ai}`),
						).replace(/</g, "\\u003c"),
					}}
					type="application/ld+json"
				/>
			</section>

			<Section id="hoje" title={copy.today}>
				<div className="flex flex-col gap-3">
					<p className="text-pretty">{copy.bio}</p>
					<p className="text-pretty">{copy.security}</p>
					<p className="text-pretty">{copy.ai}</p>
				</div>
				<div className="mt-6">
					<ContactLinks labels={nav} locale={locale} />
					<Link
						className="group/freela mt-4 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground"
						href={localePath(locale, "/freela")}
					>
						{copy.freela.homeLink}
						<ArrowRightIcon
							aria-hidden="true"
							className="size-3.5 transition-transform duration-200 ease-out group-hover/freela:text-brand-foreground motion-safe:group-hover/freela:translate-x-0.5"
						/>
					</Link>
				</div>
			</Section>

			<Section id="experiencia" title={copy.experience.professional}>
				<p className="flex flex-wrap items-baseline gap-x-2">
					<span className="text-muted-foreground text-sm tabular-nums">
						{copy.experience.current}
					</span>
					<span aria-hidden="true" className="text-muted-foreground">
						·
					</span>
					<a
						className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand"
						href={site.company.url}
						rel="noopener noreferrer"
						target="_blank"
					>
						{site.company.product} / {site.company.name}
					</a>
				</p>
				<p className="text-muted-foreground">{copy.experience.path}</p>
				<ul
					aria-label={copy.experience.highlights.label}
					className="mt-4 flex flex-col gap-2.5"
				>
					{highlights.map((key) => (
						<li className="flex gap-3" key={key}>
							<span
								aria-hidden="true"
								className="mt-2.5 size-1.5 shrink-0 bg-brand"
							/>
							<span className="text-pretty">
								{copy.experience.highlights[key]}
							</span>
						</li>
					))}
				</ul>
				<StackList
					className="mt-4"
					items={site.company.stack}
					label={copy.experience.highlights.stack}
				/>
			</Section>

			<Section
				action={
					<a
						className="group/all inline-flex items-center gap-0.5 text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground"
						href={`https://github.com/${site.github}?tab=repositories`}
						rel="noopener"
						target="_blank"
					>
						{copy.projects.all}
						<ArrowUpRightIcon
							aria-hidden="true"
							className="size-3.5 transition-transform duration-200 ease-out motion-safe:group-hover/all:translate-x-0.5 motion-safe:group-hover/all:-translate-y-0.5"
						/>
					</a>
				}
				id="projetos"
				title={copy.projects.title}
			>
				<ul className="flex flex-col gap-6">
					{projectItems.map((p) => (
						// Nome leva pro estudo de caso; "ver ↗" abre o site/repo. Hover no item acende o link e a seta sobe.
						<li className="group/item" key={p.key}>
							<p className="flex items-baseline justify-between gap-4">
								<Link
									className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand"
									href={localePath(locale, `/projetos/${p.slug}`)}
								>
									{p.name}
								</Link>
								{p.href && (
									<a
										aria-label={copy.repos.openLabel({ name: p.name })}
										className="inline-flex shrink-0 items-center gap-0.5 rounded-md text-muted-foreground text-sm outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand group-hover/item:text-foreground"
										href={p.href}
										rel="noopener"
										target="_blank"
									>
										{copy.repos.open}
										<ArrowUpRightIcon
											aria-hidden="true"
											className="size-3.5 transition-[translate,color] duration-200 ease-out group-hover/item:text-brand-foreground motion-safe:group-hover/item:translate-x-0.5 motion-safe:group-hover/item:-translate-y-0.5"
										/>
									</a>
								)}
							</p>
							<p className="text-muted-foreground">{copy.projects[p.key]}</p>
							<ProjectMetric>{copy.projects.metric[p.key]}</ProjectMetric>
							<StackList
								className="mt-2"
								items={p.stack}
								label={copy.stack.project({ name: p.name })}
							/>
						</li>
					))}
				</ul>
				{contributions && (
					<p className="mt-6 text-muted-foreground text-sm tabular-nums">
						{copy.projects.contributions({
							count: contributions.total.toLocaleString(dateLocale),
						})}{" "}
						·{" "}
						<a
							className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand"
							href={`https://github.com/${site.github}`}
							rel="noopener"
							target="_blank"
						>
							github.com/{site.github}
						</a>
					</p>
				)}
			</Section>

			<Section
				action={
					<Link
						className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground"
						href={localePath(locale, "/lab")}
					>
						{copy.labTeaser.all}
						<ArrowRightIcon aria-hidden="true" className="size-3.5" />
					</Link>
				}
				id="lab"
				title={copy.labTeaser.title}
			>
				<p className="text-pretty">{copy.labTeaser.intro}</p>
				<div className="mt-4 flex min-h-32 items-center justify-center rounded-xl border bg-card px-6 py-8">
					<HoldToConfirm
						done={copy.lab.hold.done}
						label={copy.lab.hold.label}
					/>
				</div>
				<p className="mt-2 text-muted-foreground text-sm">
					{copy.lab.hold.desc}
				</p>
			</Section>

			{site.stack.length > 0 && (
				<Section id="stack" title={copy.stack.title}>
					<p className="text-muted-foreground">{site.stack.join(" · ")}</p>
					{site.learning.length > 0 && (
						<p className="mt-1.5 text-muted-foreground text-sm">
							{copy.stack.learning}: {site.learning.join(" · ")}
						</p>
					)}
				</Section>
			)}

			{posts.length > 0 && (
				<Section
					action={
						<Link
							className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground"
							href={localePath(locale, "/blog")}
						>
							{copy.writing.all}
							<ArrowRightIcon aria-hidden="true" className="size-3.5" />
						</Link>
					}
					id="escrita"
					title={copy.writing.title}
				>
					<ul className="flex flex-col gap-6">
						{posts.map((post) => (
							<li key={post.slug}>
								<Link
									className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand"
									href={localePath(locale, `/blog/${post.slug}`)}
								>
									{post.title}
								</Link>
								<p className="text-muted-foreground">
									{post.description}{" "}
									<time className="text-sm tabular-nums" dateTime={post.date}>
										· {fmt.format(new Date(post.date))}
									</time>
								</p>
							</li>
						))}
					</ul>
				</Section>
			)}
		</>
	);
}

// Dados estruturados (schema.org) pro Google entender quem é a pessoa do site.
function personJsonLd(locale: string, role: string, bio: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: site.name,
		jobTitle: role,
		description: bio,
		url: site.url + localePath(locale === "en" ? "en" : "pt", "/"),
		image: `https://github.com/${site.github}.png`,
		worksFor: {
			"@type": "Organization",
			name: site.company.name,
			url: site.company.url,
		},
		address: {
			"@type": "PostalAddress",
			addressLocality: site.location.city,
			addressRegion: site.location.region,
			addressCountry: site.location.country,
		},
		sameAs: [
			`https://github.com/${site.github}`,
			site.linkedin && `https://www.linkedin.com/in/${site.linkedin}`,
			`https://www.instagram.com/${site.instagram}/`,
		].filter(Boolean),
	};
}
