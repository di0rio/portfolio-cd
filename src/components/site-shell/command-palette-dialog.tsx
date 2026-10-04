"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Kbd } from "@/components/ui/kbd";
import type { Locale } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
// import { useIsMac } from "./command-palette"; // volta junto com o grupo de ações (terminal) comentado abaixo

export type Copy = {
	open: string;
	title: string;
	input: string;
	placeholder: string;
	empty: string;
	close: string;
	navigate: string;
	select: string;
	dismiss: string;
	pages: string;
	posts: string;
	home: string;
	projects: string;
	lab: string;
	blog: string;
	cv: string;
	freela: string;
	agora: string;
	log: string;
};

type Item = {
	id: string;
	label: string;
	hint?: string;
	words?: string;
	run: () => void;
};
type Group = { value: string; items: Item[] };

export type Props = {
	locale: Locale;
	copy: Copy;
	/** Estudos de caso (slug + nome), de `src/lib/projects.ts`. */
	projects: { slug: string; name: string }[];
	/** Posts do blog (repositórios e notas). */
	posts: { slug: string; title: string }[];
};

/** Diálogo da paleta (Ctrl+K): carrega sob demanda, só na primeira abertura (ver `command-palette.tsx`). */
export function CommandPaletteDialog({
	open,
	onOpenChange,
	locale,
	copy,
	projects,
	posts,
}: Props & { open: boolean; onOpenChange: (open: boolean) => void }) {
	const router = useRouter();
	const { contains } = Autocomplete.useFilter({ sensitivity: "base" });
	// const mac = useIsMac();

	const go = (path: string) => () => router.push(localePath(locale, path));

	const page = (id: string, label: string, path: string): Item => ({
		id,
		label,
		hint: path,
		run: go(path),
	});
	const groups: Group[] = [
		{
			value: copy.pages,
			items: [
				page("home", copy.home, "/"),
				page("projects", copy.projects, "/#projetos"),
				...projects.map((p) =>
					page(`projeto-${p.slug}`, p.name, `/projetos/${p.slug}`),
				),
				page("lab", copy.lab, "/lab"),
				page("blog", copy.blog, "/blog"),
				page("cv", copy.cv, "/cv"),
				page("freela", copy.freela, "/freela"),
				page("agora", copy.agora, "/agora"),
				page("log", copy.log, "/log"),
			],
		},
		...(posts.length
			? [
					{
						value: copy.posts,
						items: posts.map((p) =>
							page(`post-${p.slug}`, p.title, `/blog/${p.slug}`),
						),
					},
				]
			: []),
		// {
		//   value: copy.actions,
		//   items: [
		//     {
		//       id: "terminal",
		//       label: copy.terminal,
		//       words: copy.terminalWords,
		//       hint: mac ? "⌘J" : "Ctrl J",
		//       run: () => window.dispatchEvent(new Event("cd:terminal-toggle")),
		//     },
		//   ],
		// },
	];

	function pick(item: Item) {
		onOpenChange(false);
		item.run();
	}

	return (
		<Dialog.Root onOpenChange={onOpenChange} open={open}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Dialog.Viewport className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh] pb-3">
					<Dialog.Popup
						aria-label={copy.title}
						// O Autocomplete engole o 1º Esc (fecha a lista inline); aqui Esc sempre fecha a paleta.
						onKeyDownCapture={(e) => {
							if (e.key !== "Escape") return;
							e.stopPropagation();
							onOpenChange(false);
						}}
						className="flex max-h-[min(30rem,calc(100dvh-5rem))] w-full max-w-[520px] flex-col overflow-hidden rounded-xl border bg-card text-foreground outline-none transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.98] motion-safe:data-starting-style:-translate-y-1 motion-safe:data-starting-style:scale-[0.98]"
					>
						<Autocomplete.Root
							autoHighlight="always"
							filter={(item: Item, query) =>
								contains(
									`${item.label} ${item.words ?? ""} ${item.hint ?? ""}`,
									query,
								)
							}
							inline
							items={groups}
							itemToStringValue={(item: Item) => item.label}
							keepHighlight
							open
						>
							<Autocomplete.InputGroup className="flex items-center gap-2.5 border-b px-3.5">
								<SearchIcon
									aria-hidden="true"
									className="size-4 shrink-0 text-muted-foreground"
								/>
								<Autocomplete.Input
									aria-label={copy.input}
									className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground any-pointer-coarse:text-base"
									placeholder={copy.placeholder}
								/>
							</Autocomplete.InputGroup>
							<Dialog.Close className="sr-only">{copy.close}</Dialog.Close>

							<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
								<Autocomplete.Empty>
									<p className="px-4 py-8 text-center text-muted-foreground text-sm">
										{copy.empty}
									</p>
								</Autocomplete.Empty>
								<Autocomplete.List className="p-1.5">
									{(group: Group) => (
										<Autocomplete.Group
											className="not-last:mb-1"
											items={group.items}
											key={group.value}
										>
											<Autocomplete.GroupLabel className="px-2.5 pt-2 pb-1 text-muted-foreground text-xs">
												{group.value}
											</Autocomplete.GroupLabel>
											<Autocomplete.Collection>
												{(item: Item) => (
													<Autocomplete.Item
														className="group flex min-h-9 cursor-default select-none items-center justify-between gap-3 rounded-md px-2.5 text-sm outline-none transition-colors duration-100 data-highlighted:bg-accent"
														key={item.id}
														onClick={() => pick(item)}
														value={item}
													>
														<span className="min-w-0 truncate">
															{item.label}
														</span>
														{item.hint && (
															<span className="shrink-0 font-mono text-muted-foreground text-xs">
																{item.hint}
															</span>
														)}
													</Autocomplete.Item>
												)}
											</Autocomplete.Collection>
										</Autocomplete.Group>
									)}
								</Autocomplete.List>
							</div>

							<div
								className="flex items-center gap-4 border-t px-3.5 py-2 text-muted-foreground text-xs max-sm:hidden"
								aria-hidden="true"
							>
								<span className="flex items-center gap-1.5">
									<Kbd>↑</Kbd>
									<Kbd>↓</Kbd> {copy.navigate}
								</span>
								<span className="flex items-center gap-1.5">
									<Kbd>↵</Kbd> {copy.select}
								</span>
								<span className="flex items-center gap-1.5">
									<Kbd>esc</Kbd> {copy.dismiss}
								</span>
							</div>
						</Autocomplete.Root>
					</Dialog.Popup>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
