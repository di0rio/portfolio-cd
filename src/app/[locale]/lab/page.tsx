import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AchievementBench } from "@/components/lab/achievement-bench";
import { AvatarToy } from "@/components/lab/avatar-toy";
import { CartoonBench } from "@/components/lab/cartoon-bench";
import { Combine } from "@/components/lab/combine";
import { HoldBench } from "@/components/lab/hold-bench";
import { PaletteBench } from "@/components/lab/palette-bench";
import { PaletteDemo } from "@/components/lab/palette-demo";
import { PageHeader } from "@/components/page-header";
import { alternates, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.lab.title,
		description: t.app.lab.intro,
		alternates: alternates(locale, "/lab"),
	};
}

export default async function Lab() {
	const { t } = await getT();
	const copy = t.app.lab;

	const steps = [
		{ id: "boneco", label: copy.avatar.title },
		{ id: "juntar", label: copy.combine.title },
		{ id: "segurar", label: copy.hold.title },
		{ id: "cartoon", label: copy.cartoon.title },
		{ id: "paleta-rapida", label: copy.instant.title },
		{ id: "conquista", label: copy.achievement.title },
	];

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />

			{/* Passos compactos no topo: âncoras, sem paginação embaixo. */}
			<nav aria-label={copy.index}>
				<ol className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
					{steps.map((step, i) => (
						<li key={step.id}>
							<a
								className="rounded-sm text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
								href={`#${step.id}`}
							>
								<span className="mr-1.5 font-mono text-[13px] tabular-nums">
									{String(i + 1).padStart(2, "0")}
								</span>
								{step.label}
							</a>
						</li>
					))}
				</ol>
			</nav>

			<Experiment
				desc={copy.avatar.desc}
				id="boneco"
				teaches={copy.avatar.teaches}
				teachesLabel={copy.teaches}
				title={copy.avatar.title}
			>
				<AvatarToy label={copy.avatar.label} />
			</Experiment>

			<Experiment
				desc={copy.combine.desc}
				id="juntar"
				teaches={copy.combine.teaches}
				teachesLabel={copy.teaches}
				title={copy.combine.title}
			>
				<Combine
					copy={{
						piece: copy.combine.piece,
						merged: copy.combine.merged,
						join: copy.combine.join,
						split: copy.combine.split,
					}}
				/>
			</Experiment>

			<Experiment
				desc={copy.hold.benchDesc}
				id="segurar"
				teaches={copy.hold.teaches}
				teachesLabel={copy.teaches}
				title={copy.hold.title}
			>
				<HoldBench done={copy.hold.done} label={copy.hold.label} />
			</Experiment>

			<Experiment
				desc={copy.cartoon.desc}
				id="cartoon"
				teaches={copy.cartoon.teaches}
				teachesLabel={copy.teaches}
				title={copy.cartoon.title}
			>
				<CartoonBench label={copy.cartoon.label} />
			</Experiment>

			<Experiment
				desc={copy.instant.desc}
				id="paleta-rapida"
				teaches={copy.instant.teaches}
				teachesLabel={copy.teaches}
				title={copy.instant.title}
			>
				<PaletteBench
					copy={{
						preload: copy.instant.preload,
						cold: copy.instant.cold,
						open: copy.instant.open,
						close: copy.instant.close,
						search: copy.instant.search,
						rows: [copy.instant.row1, copy.instant.row2, copy.instant.row3],
						took: copy.instant.took,
						idle: copy.instant.idle,
					}}
				/>
			</Experiment>

			<Experiment
				desc={copy.achievement.desc}
				id="conquista"
				teaches={copy.achievement.teaches}
				teachesLabel={copy.teaches}
				title={copy.achievement.title}
			>
				<AchievementBench
					label={copy.achievement.unlocked}
					name={copy.achievement.name}
					play={copy.achievement.play}
					replay={copy.achievement.replay}
				/>
			</Experiment>

			{/* A paleta já vive no site inteiro: aqui é só um atalho pra ela. */}
			<section aria-labelledby="paleta" className="flex flex-col gap-3">
				<h2 className="font-medium text-[17px]" id="paleta">
					{copy.palette.title}
				</h2>
				<p className="max-w-[520px] text-pretty text-muted-foreground text-[15px]">
					{copy.palette.desc}
				</p>
				<div>
					<PaletteDemo label={copy.palette.open} />
				</div>
			</section>
		</>
	);
}

function Experiment({
	id,
	title,
	desc,
	teaches,
	teachesLabel,
	children,
}: {
	id: string;
	title: string;
	desc: string;
	teaches: string;
	teachesLabel: string;
	children: ReactNode;
}) {
	return (
		<section aria-labelledby={id} className="scroll-mt-24">
			<h2 className="font-medium text-[17px]" id={id}>
				{title}
			</h2>
			<p className="mt-1 max-w-[520px] text-pretty text-muted-foreground text-[15px]">
				{desc}
			</p>
			<p className="mt-1 mb-4 max-w-[520px] text-pretty text-[15px] text-muted-foreground">
				<span className="font-mono text-[13px] text-muted-foreground">
					{teachesLabel}
				</span>{" "}
				{teaches}
			</p>
			<div className="overflow-hidden rounded-xl border bg-card">
				{children}
			</div>
		</section>
	);
}
