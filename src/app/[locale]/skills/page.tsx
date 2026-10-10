import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import {
	CodeBlock,
	Definitions,
	Rich,
	Stats,
	Steps,
} from "@/components/skills/blocks";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import {
	benchUrl,
	type Skill,
	skillRawUrl,
	skills,
	skillsInstall,
	skillsRepo,
	skillUrl,
} from "@/lib/skills";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.skills.title,
		description: t.app.skills.intro,
		alternates: alternates(locale, "/skills"),
	};
}

const link =
	"underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";

const diff = [
	["-", "interface PriceCalculator { calculate(items: Item[]): number }"],
	["-", "class DefaultPriceCalculator implements PriceCalculator {"],
	["-", "  calculate(items: Item[]) {"],
	["-", "    return items.reduce((sum, item) => sum + item.price, 0)"],
	["-", "  }"],
	["-", "}"],
	["+", "const total = items.reduce((sum, item) => sum + item.price, 0)"],
] as const;

export default async function Skills() {
	const { t, locale } = await getT();
	const copy = t.app.skills;
	const cc = copy.cleanCode;
	const demo = copy.demo;
	const hum = copy.humanize;
	const copyLabels = t.app.lab.copy;
	const [cleanCode, portfolioDemo, humanizar] = skills;
	const first = cleanCode.slug;

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title}>
				<div className="mt-6 flex flex-col items-start gap-3">
					<div className="w-full">
						<CodeBlock copy={copyLabels} lines={[skillsInstall]} />
					</div>
					<ExternalLink href={skillsRepo}>{copy.github}</ExternalLink>
				</div>
			</PageHeader>

			<Section id="instalar" title={copy.installTitle}>
				<Tabs defaultValue="cli">
					<TabsList aria-label={copy.installTabs}>
						<TabsTab value="cli">{copy.tabCli}</TabsTab>
						<TabsTab value="claude">{copy.tabClaude}</TabsTab>
						<TabsTab value="others">{copy.tabOthers}</TabsTab>
					</TabsList>
					<TabsPanel className="flex flex-col gap-3" value="cli">
						<CodeBlock copy={copyLabels} lines={[skillsInstall]} />
						<p className="text-muted-foreground text-sm">{copy.cliPick}</p>
						<CodeBlock
							copy={copyLabels}
							lines={[`${skillsInstall} --skill ${first}`]}
						/>
					</TabsPanel>
					<TabsPanel className="flex flex-col gap-3" value="claude">
						<CodeBlock
							copy={copyLabels}
							lines={[
								`mkdir -p ~/.claude/skills/${first}`,
								`curl -fsSL ${skillRawUrl(first)} -o ~/.claude/skills/${first}/SKILL.md`,
							]}
						/>
						<p className="text-pretty text-muted-foreground text-sm">
							<Rich text={copy.claudeNote} />
						</p>
					</TabsPanel>
					<TabsPanel value="others">
						<p className="text-pretty">
							<Rich text={copy.others} />
						</p>
					</TabsPanel>
				</Tabs>
			</Section>

			<SkillSection slug={cleanCode.slug} tagline={cc.tagline}>
				<Block title={copy.idea}>
					<figure>
						<div className="overflow-hidden rounded-xl border bg-card">
							<div className="flex items-center justify-between border-b px-4 py-1.5 font-mono text-muted-foreground text-xs">
								<span>total.ts</span>
								<span className="tabular-nums">-6 +1</span>
							</div>
							<pre className="overflow-x-auto py-3 font-mono text-sm leading-relaxed">
								<code className="block w-max min-w-full">
									{diff.map(([sign, line]) =>
										sign === "-" ? (
											<del
												className="block px-4 text-muted-foreground"
												key={line}
											>
												<span className="sr-only">{cc.removed}: </span>
												<span
													aria-hidden="true"
													className="inline-block w-4 select-none"
												>
													-
												</span>
												{line}
											</del>
										) : (
											<ins className="block px-4 no-underline" key={line}>
												<span className="sr-only">{cc.added}: </span>
												<span
													aria-hidden="true"
													className="inline-block w-4 select-none text-brand-foreground"
												>
													+
												</span>
												{line}
											</ins>
										),
									)}
								</code>
							</pre>
						</div>
						<figcaption className="mt-3 text-pretty text-muted-foreground text-sm">
							{cc.diffCaption}
						</figcaption>
					</figure>
				</Block>

				<Block title={cc.ladderTitle}>
					<p className="mb-3 text-muted-foreground text-sm">{cc.ladderIntro}</p>
					<Steps
						items={[
							cc.step1,
							cc.step2,
							cc.step3,
							cc.step4,
							cc.step5,
							cc.step6,
							cc.step7,
							cc.step8,
							cc.step9,
							cc.step10,
						]}
					/>
				</Block>

				<Block title={cc.benchTitle}>
					<Stats
						items={[
							{ value: "191/200", label: first, strong: true },
							{ value: "176/200", label: cc.benchNone },
							{ value: "166/200", label: "ponytail" },
						]}
					/>
					<p className="mt-3 text-pretty text-muted-foreground text-sm">
						{cc.benchCaption}{" "}
						<ExternalLink href={benchUrl}>{cc.benchLink}</ExternalLink>
					</p>
				</Block>

				<Block title={cc.levelsTitle}>
					<p className="mb-3 text-muted-foreground text-sm">
						<Rich text={cc.levelsIntro} />
					</p>
					<Definitions
						items={[
							{ term: "lite", description: cc.lite },
							{ term: "full", description: cc.full },
							{ term: "ultra", description: cc.ultra },
						]}
					/>
				</Block>

				<SkillLinks locale={locale} postLabel={copy.post} skill={cleanCode} />
			</SkillSection>

			<SkillSection slug={portfolioDemo.slug} tagline={demo.tagline}>
				<Block title={copy.idea}>
					<ul className="flex flex-col gap-3 tabular-nums">
						<li className="text-muted-foreground">{demo.before}</li>
						<li>{demo.after}</li>
					</ul>
					<p className="mt-3 text-pretty text-muted-foreground text-sm">
						{demo.ideaCaption}
					</p>
				</Block>

				<Block title={demo.flowTitle}>
					<Steps
						items={[
							demo.flow1,
							demo.flow2,
							demo.flow3,
							demo.flow4,
							demo.flow5,
							demo.flow6,
							demo.flow7,
						]}
					/>
				</Block>

				<Block title={demo.modesTitle}>
					<Definitions
						items={[
							{ term: "script", description: demo.script },
							{ term: "manual", description: demo.manual },
						]}
					/>
				</Block>

				<Block title={demo.numbersTitle}>
					<Stats
						items={[
							{ value: "3", label: demo.videos, strong: true },
							{ value: "28-45s", label: demo.length, strong: true },
							{ value: "2", label: demo.themes, strong: true },
						]}
					/>
				</Block>

				<SkillLinks locale={locale} postLabel={copy.post} skill={portfolioDemo}>
					<Link className={link} href={localePath(locale, "/projetos/cd-ui")}>
						{demo.watch}
					</Link>
				</SkillLinks>
			</SkillSection>

			<SkillSection slug={humanizar.slug} tagline={hum.tagline}>
				<Block title={copy.idea}>
					<ul className="flex flex-col gap-3">
						<li className="text-muted-foreground">{hum.before}</li>
						<li>{hum.after}</li>
					</ul>
					<p className="mt-3 text-pretty text-muted-foreground text-sm">
						{hum.ideaCaption}
					</p>
				</Block>

				<Block title={hum.catchTitle}>
					<Steps
						items={[
							hum.catch1,
							hum.catch2,
							hum.catch3,
							hum.catch4,
							hum.catch5,
							hum.catch6,
						]}
					/>
				</Block>

				<Block title={hum.modesTitle}>
					<Definitions
						items={[
							{ term: "reescrever", description: hum.rewrite },
							{ term: "escrever", description: hum.write },
							{ term: "inspirar", description: hum.inspire },
						]}
					/>
				</Block>

				<SkillLinks locale={locale} postLabel={copy.post} skill={humanizar} />
			</SkillSection>

			<p className="text-muted-foreground text-sm">
				<a
					className={link}
					href={skillsRepo}
					rel="noopener noreferrer"
					target="_blank"
				>
					MIT · di0rio/cd-skills
				</a>
			</p>
		</>
	);
}

function ExternalLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	return (
		<a
			className={`${link} whitespace-nowrap`}
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{children}
			<span aria-hidden="true"> ↗</span>
		</a>
	);
}

// Uma skill: nome em mono + frase, e os blocos (h3) empilhados com 32px entre si.
function SkillSection({
	slug,
	tagline,
	children,
}: {
	slug: Skill["slug"];
	tagline: string;
	children: ReactNode;
}) {
	return (
		<section aria-labelledby={slug} className="scroll-mt-8">
			<div className="mb-5">
				<h2 className="font-medium font-mono text-[17px]" id={slug}>
					{slug}
				</h2>
				<p className="text-muted-foreground">{tagline}</p>
			</div>
			<div className="flex flex-col gap-8">{children}</div>
		</section>
	);
}

function Block({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div>
			<h3 className="mb-3 text-muted-foreground">{title}</h3>
			{children}
		</div>
	);
}

function SkillLinks({
	skill,
	locale,
	postLabel,
	children,
}: {
	skill: Skill;
	locale: Locale;
	postLabel: string;
	children?: ReactNode;
}) {
	return (
		<p className="flex flex-wrap gap-x-5 gap-y-2">
			<ExternalLink href={skillUrl(skill.slug)}>SKILL.md</ExternalLink>
			<Link className={link} href={localePath(locale, `/blog/${skill.post}`)}>
				{postLabel}
			</Link>
			{children}
		</p>
	);
}
