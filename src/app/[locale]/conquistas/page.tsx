import type { Metadata } from "next";
import { AchievementWall } from "@/components/achievement-wall";
import { PageHeader } from "@/components/page-header";
import { alternates, getT } from "@/i18n/server";
import { achievements } from "@/lib/achievements";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.conquistas.title,
		description: t.app.conquistas.description,
		alternates: alternates(locale, "/conquistas"),
	};
}

export default async function Conquistas() {
	const { t, dateLocale } = await getT();
	const { items, ...copy } = t.app.conquistas;

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />
			<AchievementWall
				copy={copy}
				items={achievements.map((a) => ({
					id: a.id,
					secret: "secret" in a,
					name: items[a.id].name,
					desc: items[a.id].desc,
					hint: items[a.id].hint,
				}))}
				locale={dateLocale}
			/>
		</>
	);
}
