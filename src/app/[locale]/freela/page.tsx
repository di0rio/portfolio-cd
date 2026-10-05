import { ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { FreelaContactForm } from "@/components/freela-contact-form";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projects } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.freela.title,
		description: t.app.freela.description,
		alternates: alternates(locale, "/freela"),
	};
}

const link =
	"underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";
// Os estudos de caso que mais falam com quem contrata freela.
const examples = ["cd-ui", "converter-hub", "sentinel-forge"];

export default async function Freela() {
	const { t, locale } = await getT();
	const copy = t.app.freela;
	const nav = t.components["site-shell"].nav;
	const what = [copy.what1, copy.what2, copy.what3, copy.what4];
	const how = [copy.how1, copy.how2, copy.how3, copy.how4];
	const faq = [
		[copy.faqQ1, copy.faqA1],
		[copy.faqQ2, copy.faqA2],
		[copy.faqQ3, copy.faqA3],
		[copy.faqQ4, copy.faqA4],
		[copy.faqQ5, copy.faqA5],
	];
	const f = copy.form;
	const topics = [
		{ value: "ui", label: f.topicUi },
		{ value: "landing", label: f.topicLanding },
		{ value: "ds", label: f.topicDs },
		{ value: "api", label: f.topicApi },
		{ value: "other", label: f.topicOther },
	];
	const cdui = projects.find((p) => p.slug === "cd-ui");

	return (
		<>
			<PageHeader intro={copy.pitch} title={copy.title} />

			<Section id="o-que-eu-faco" title={copy.whatTitle}>
				<ul className="flex flex-col gap-3">
					{what.map((item, i) => (
						<li className="flex gap-3" key={item}>
							<span
								aria-hidden="true"
								className="mt-[0.8em] h-0.5 w-3 shrink-0 rounded-full bg-brand"
							/>
							<span className="text-pretty">
								{item}
								{i === 2 && cdui && (
									<>
										{" "}
										<Link
											className={link}
											href={localePath(locale, `/projetos/${cdui.slug}`)}
										>
											{cdui.name}
										</Link>
										.
									</>
								)}
							</span>
						</li>
					))}
				</ul>
			</Section>

			<Section id="como-funciona" title={copy.howTitle}>
				<ol className="flex flex-col gap-4">
					{how.map((step, i) => (
						<li className="flex gap-4" key={step}>
							<span
								aria-hidden="true"
								className="w-5 shrink-0 pt-0.5 font-mono text-brand-foreground text-sm tabular-nums"
							>
								{String(i + 1).padStart(2, "0")}
							</span>
							<span className="text-pretty">{step}</span>
						</li>
					))}
				</ol>
			</Section>

			<Section id="exemplos" title={copy.examplesTitle}>
				<ul className="flex flex-col gap-6">
					{projects
						.filter((p) => examples.includes(p.slug))
						.map((p) => (
							<li key={p.slug}>
								<Link
									className={`${link} group inline-flex items-center gap-1`}
									href={localePath(locale, `/projetos/${p.slug}`)}
								>
									{p.name}
									<ArrowUpRightIcon
										aria-hidden="true"
										className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
									/>
								</Link>
								<p className="text-muted-foreground">{t.app.projects[p.key]}</p>
							</li>
						))}
				</ul>
				<p className="mt-6 text-muted-foreground text-sm">
					{copy.examplesHint}
				</p>
			</Section>

			<Section id="duvidas" title={copy.faqTitle}>
				<Accordion className="border-y">
					{faq.map(([q, a], i) => (
						<AccordionItem key={q} value={q}>
							<AccordionTrigger className="group items-baseline py-4 text-base">
								<span className="flex flex-1 items-baseline gap-4">
									<span
										aria-hidden="true"
										className="w-5 shrink-0 font-mono text-muted-foreground text-sm tabular-nums transition-colors duration-150 group-hover:text-brand-foreground group-data-[panel-open]:text-brand-foreground"
									>
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="text-pretty font-heading">{q}</span>
								</span>
							</AccordionTrigger>
							<AccordionPanel className="text-base">
								<p className="text-pretty pr-8 pl-9 leading-relaxed">{a}</p>
							</AccordionPanel>
						</AccordionItem>
					))}
				</Accordion>
			</Section>

			<Section id="contato" title={copy.contactTitle}>
				<div className="rounded-2xl border bg-card p-5 sm:p-6">
					<FreelaContactForm
						labels={{
							name: f.name,
							email: f.email,
							topic: f.topic,
							message: f.message,
							namePlaceholder: f.namePlaceholder,
							emailPlaceholder: f.emailPlaceholder,
							placeholder: f.placeholder,
							send: f.send,
							hint: f.hint,
							errName: f.errName,
							errEmail: f.errEmail,
							errMessage: f.errMessage,
							sentTitle: f.sentTitle,
							sentText: f.sentText,
							errSend: f.errSend,
							errRate: f.errRate,
							topics,
						}}
					/>
				</div>
				<p className="mt-6 mb-3 text-muted-foreground text-sm">{copy.direct}</p>
				<ContactLinks cv={false} labels={nav} locale={locale} />
			</Section>
		</>
	);
}
