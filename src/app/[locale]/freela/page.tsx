import { ArrowRightIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
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
						<li className="text-pretty" key={item}>
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
						</li>
					))}
				</ul>
			</Section>

			<Section id="como-funciona" title={copy.howTitle}>
				<ol className="flex list-decimal flex-col gap-3 pl-5 marker:text-muted-foreground">
					{how.map((step) => (
						<li className="text-pretty" key={step}>
							{step}
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
									className={link}
									href={localePath(locale, `/projetos/${p.slug}`)}
								>
									{p.name}
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
				<Accordion className="rounded-xl border bg-card px-4">
					{faq.map(([q, a]) => (
						<AccordionItem key={q} value={q}>
							<AccordionTrigger>{q}</AccordionTrigger>
							<AccordionPanel>
								<p className="text-pretty pb-3.5">{a}</p>
							</AccordionPanel>
						</AccordionItem>
					))}
				</Accordion>
			</Section>

			{/* Fechamento: faixa que acompanha o tema, adaptada do bloco cta-01 do cd/ui. */}
			<section
				aria-labelledby="vamos-conversar"
				className="relative overflow-hidden rounded-3xl border bg-card px-6 py-10"
			>
				<div
					aria-hidden="true"
					className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:22px_22px]"
				/>
				<span className="absolute top-5 right-5 hidden rotate-6 rounded-xl border-[3px] border-foreground bg-brand px-3 py-1 font-heading font-semibold text-brand-contrast text-xs shadow-[3px_3px_0_var(--foreground)] sm:block">
					{copy.ctaSticker}
				</span>
				<div className="relative max-w-md">
					<h2
						className="text-balance font-bold font-heading text-3xl leading-[1.05] tracking-[-0.03em]"
						id="vamos-conversar"
					>
						{copy.ctaTitle}
					</h2>
					<p className="mt-3 text-pretty text-muted-foreground">{copy.cta}</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Button
							nativeButton={false}
							render={<a href="#contato" />}
							variant="brand"
						>
							{copy.ctaButton}
							<ArrowRightIcon aria-hidden="true" />
						</Button>
					</div>
				</div>
			</section>

			<Section id="contato" title={copy.contactTitle}>
				<div className="rounded-2xl border bg-card p-5 sm:p-6">
					<FreelaContactForm
						labels={{
							name: f.name,
							email: f.email,
							topic: f.topic,
							message: f.message,
							placeholder: f.placeholder,
							send: f.send,
							hint: f.hint,
							errName: f.errName,
							errEmail: f.errEmail,
							errMessage: f.errMessage,
							sentTitle: f.sentTitle,
							sentText: f.sentText,
							errSend: f.errSend,
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
