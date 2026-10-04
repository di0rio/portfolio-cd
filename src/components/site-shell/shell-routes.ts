// Mapa de lugares e resolução de caminhos compartilhados pelo easter egg, pelo terminal do lab
// e pelo terminal global. Puro (sem node:fs, sem React): entra no bundle do cliente.

/** Seções com página própria. O valor é a rota (sem idioma) que o `cd` abre. */
export const sections = {
	blog: "/blog",
	lab: "/lab",
	cv: "/cv",
	freela: "/freela",
	agora: "/agora",
	log: "/log",
	projetos: "/#projetos",
} as const;

/** Slugs dos estudos de caso (`/projetos/<slug>`) e dos posts (`/blog/<slug>`). */
export type Tree = { slugs: string[]; posts: string[] };

const ci = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Valida os segmentos contra a árvore e devolve a forma canônica (ou `undefined`). */
function canon(parts: string[], tree: Tree): string[] | undefined {
	const [a, b, ...rest] = parts;
	if (rest.length) return undefined;
	if (a === undefined) return [];
	const section = ci(a, "projects") ? "projetos" : a.toLowerCase();
	if (!Object.hasOwn(sections, section)) return undefined;
	if (b === undefined) return [section];
	const list =
		section === "projetos" ? tree.slugs : section === "blog" ? tree.posts : [];
	const hit = list.find((s) => ci(s, b));
	return hit ? [section, hit] : undefined;
}

function walk(start: string[], arg: string) {
	const parts = [...start];
	for (const seg of arg.split("/")) {
		if (!seg || seg === ".") continue;
		if (seg === "..") parts.pop();
		else parts.push(seg);
	}
	return parts;
}

/**
 * Resolve `arg` a partir de `cwd` (rota sem idioma, ex.: "/projetos/cd-ui"). Tenta relativo ao diretório
 * atual, depois a partir da raiz (`cd lab` vale de qualquer lugar) e por fim dentro de /projetos
 * (`cd cd-ui` abre o estudo de caso). Devolve o caminho virtual ("/", "/blog", "/projetos/cd-ui").
 */
export function resolvePath(
	cwd: string,
	arg: string,
	tree: Tree,
): string | undefined {
	const absolute = arg.startsWith("/") || arg.startsWith("~");
	const rel = arg.startsWith("~") ? arg.slice(1) : arg;
	const here = cwd.split("/").filter(Boolean);
	const starts = absolute ? [[]] : [here, [], ["projetos"]];
	for (const start of starts) {
		const hit = canon(walk(start, rel), tree);
		if (hit) return `/${hit.join("/")}`;
	}
	return undefined;
}

/** Rota real (sem idioma) pra um caminho virtual: a seção "projetos" é a âncora da home. */
export const hrefOf = (path: string) =>
	path === "/projetos" ? sections.projetos : path;

/** Nomes dentro de um diretório virtual. */
export function children(dir: string, tree: Tree): string[] {
	if (dir === "/") return Object.keys(sections);
	if (dir === "/projetos") return tree.slugs;
	if (dir === "/blog") return tree.posts;
	return [];
}

/** Candidatos de Tab pro argumento do `cd` (já com o prefixo digitado, ex.: "projetos/cd-"). */
export function completePath(cwd: string, arg: string, tree: Tree): string[] {
	const slash = arg.lastIndexOf("/");
	const base = arg.slice(0, slash + 1);
	const partial = arg.slice(slash + 1).toLowerCase();
	let names: string[];
	let parent: string | undefined;
	if (base) {
		parent = resolvePath(cwd, base, tree);
		if (!parent) return [];
		names = children(parent, tree);
	} else {
		names = [
			...new Set([
				...children(cwd, tree),
				...children("/", tree),
				...tree.slugs,
				"~",
				"..",
			]),
		];
	}
	return names
		.filter((n) => n.toLowerCase().startsWith(partial))
		.map((n) => {
			const kids = !base || parent === "/" ? children(`/${n}`, tree) : [];
			return base + n + (kids.length ? "/" : "");
		});
}
