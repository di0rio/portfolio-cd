import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

const API = "https://api.github.com";
const HOUR = 60 * 60;

export type Repo = {
	name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	topics: string[];
	language: string | null;
	stargazers_count: number;
	created_at: string;
	pushed_at: string;
	default_branch: string;
	fork: boolean;
	archived: boolean;
};

export type ContributionDay = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
};
export type Contributions = { total: number; days: ContributionDay[] };

// Token é opcional, mas sem ele o limite é 60 requisições/h. Só roda no servidor.
function headers(accept = "application/vnd.github+json"): HeadersInit {
	const token = process.env.GITHUB_TOKEN;
	return {
		Accept: accept,
		"X-GitHub-Api-Version": "2022-11-28",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

// `homepage` é texto livre no GitHub: só http(s) vira link (nada de `javascript:`).
const httpUrl = (url: string | null | undefined) =>
	url && /^https?:\/\//i.test(url) ? url : null;

const TIMEOUT = 5000;

/** Repositórios públicos do dono (uma busca só, cacheada). Falha de rede ou da API vira `[]`. */
async function listOwnerRepos(): Promise<Repo[]> {
	try {
		const res = await fetch(
			`${API}/users/${site.github}/repos?type=owner&per_page=100&sort=pushed`,
			{
				headers: headers(),
				signal: AbortSignal.timeout(TIMEOUT),
				next: { revalidate: HOUR, tags: ["github"] },
			},
		);
		return res.ok ? await res.json() : [];
	} catch {
		return [];
	}
}

/** Repositórios públicos marcados com um dos `site.blogTopics`, do mais novo pro mais antigo. */
export async function getBlogRepos(): Promise<Repo[]> {
	const repos = await listOwnerRepos();
	return repos
		.filter(
			(r) =>
				!r.fork &&
				!r.archived &&
				r.topics.some((topic) =>
					(site.blogTopics as readonly string[]).includes(topic),
				),
		)
		.sort((a, b) => b.created_at.localeCompare(a.created_at))
		.map((r) => ({ ...r, homepage: httpUrl(r.homepage) }));
}

export async function getBlogRepo(name: string): Promise<Repo | undefined> {
	return (await getBlogRepos()).find((r) => r.name === name);
}

async function getRaw(repo: string, path: string): Promise<string | null> {
	try {
		const res = await fetch(
			`${API}/repos/${site.github}/${repo}/contents/${path}`,
			{
				headers: headers("application/vnd.github.raw+json"),
				signal: AbortSignal.timeout(TIMEOUT),
				next: { revalidate: HOUR, tags: ["github"] },
			},
		);
		return res.ok ? await res.text() : null;
	} catch {
		return null;
	}
}

/**
 * README do repositório no idioma pedido. Convenção: `README.md` em português e
 * `README.en.md` em inglês. Sem a versão no idioma, volta o `README.md` com `translated: false`.
 */
export async function getReadme(repo: string, locale: string) {
	if (locale !== "pt") {
		const localized = await getRaw(repo, `README.${locale}.md`);
		if (localized) return { markdown: localized, translated: true };
	}
	const markdown = await getRaw(repo, "README.md");
	return markdown ? { markdown, translated: locale === "pt" } : null;
}

/** Frontmatter simples (`chave: valor`, uma por linha): sem YAML de verdade, nada de dependência. */
export function parseFrontmatter(src: string): {
	data: Record<string, string>;
	body: string;
} {
	const m = src
		.replace(/^\uFEFF/, "")
		.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) return { data: {}, body: src };
	const data: Record<string, string> = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = line.match(/^([\w-]+):\s*(.*)$/);
		if (kv) data[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, "$2");
	}
	return { data, body: m[2] };
}

type NoteDoc = {
	title?: string;
	description?: string;
	date?: string;
	markdown: string;
};
type Note = { slug: string; branch: string; pt: NoteDoc; en: NoteDoc | null };

function parseNote(raw: string | null): NoteDoc | null {
	if (!raw) return null;
	const { data, body } = parseFrontmatter(raw);
	return {
		title: data.title || undefined,
		description: data.description || undefined,
		// Data sem hora vira meio-dia UTC: meia-noite UTC cairia no dia anterior no fuso do Brasil.
		date: /^\d{4}-\d{2}-\d{2}$/.test(data.date ?? "")
			? `${data.date}T12:00:00Z`
			: /^\d{4}-\d{2}-\d{2}T/.test(data.date ?? "")
				? data.date
				: undefined,
		// O `# título` do README já aparece no cabeçalho da página; sem ele aqui o título não repete.
		markdown: body.trim().replace(/^# .*\n+/, ""),
	};
}

/**
 * Só em dev: `NOTES_LOCAL_DIR=C:\caminho\notes` lê os posts do disco em vez do GitHub, pra escrever sem
 * dar push. (Imagens relativas ainda apontam pro raw do GitHub, então só aparecem depois do push.)
 */
const notesLocalDir = () =>
	process.env.NODE_ENV === "production"
		? undefined
		: process.env.NOTES_LOCAL_DIR;

/**
 * Posts do repositório de notas: `posts/<slug>/README.md` (pt, obrigatório) e `README.en.md` (en),
 * ambos com frontmatter (`title`, `description`, `date`). Sem o repo, sem pasta ou com erro: sem notas.
 * Pasta sem README ou sem `date` válida não entra (rascunho).
 */
async function getNotes(): Promise<Note[]> {
	try {
		const local = notesLocalDir();
		let branch = "main";
		let slugs: string[];
		if (local) {
			slugs = (await readdir(join(local, "posts"), { withFileTypes: true }))
				.filter((d) => d.isDirectory())
				.map((d) => d.name);
		} else {
			const opts = {
				headers: headers(),
				next: { revalidate: HOUR, tags: ["github"] },
			};
			const [repoRes, listRes] = await Promise.all([
				fetch(`${API}/repos/${site.github}/${site.notes}`, opts),
				fetch(`${API}/repos/${site.github}/${site.notes}/contents/posts`, opts),
			]);
			if (!repoRes.ok || !listRes.ok) return [];
			branch = ((await repoRes.json()) as { default_branch: string })
				.default_branch;
			const items: { name: string; type: string }[] = await listRes.json();
			slugs = items.filter((i) => i.type === "dir").map((i) => i.name);
		}

		const read = async (slug: string, file: string): Promise<string | null> => {
			try {
				if (local)
					return await readFile(join(local, "posts", slug, file), "utf8");
				const res = await fetch(
					`https://raw.githubusercontent.com/${site.github}/${site.notes}/${branch}/posts/${slug}/${file}`,
					{
						next: { revalidate: HOUR, tags: ["github"] },
					},
				);
				return res.ok ? await res.text() : null;
			} catch {
				return null;
			}
		};

		const notes = await Promise.all(
			slugs
				.filter((slug) => /^[a-z0-9-]+$/.test(slug))
				.map(async (slug): Promise<Note | null> => {
					const [pt, en] = await Promise.all([
						read(slug, "README.md"),
						read(slug, "README.en.md"),
					]);
					const doc = parseNote(pt);
					return doc?.date
						? { slug, branch, pt: doc, en: parseNote(en) }
						: null;
				}),
		);
		return notes.filter((n) => n !== null);
	} catch {
		return [];
	}
}

export type BlogPost = {
	slug: string;
	title: string;
	description: string | null;
	/** ISO: `created_at` do repositório ou `date` do frontmatter da nota. */
	date: string;
	source: "repo" | "note";
	topics: string[];
	/** Só em `source: "repo"`. */
	repo?: Repo;
	/** Só em `source: "note"`; `translated: false` = caiu no texto em português. */
	note?: { markdown: string; translated: boolean; branch: string };
};

/** Repositórios do blog + notas no idioma pedido, do mais novo pro mais antigo. Repo com o mesmo nome vence a nota. */
export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
	const [repos, notes] = await Promise.all([getBlogRepos(), getNotes()]);
	const names = new Set(repos.map((r) => r.name));
	const posts: BlogPost[] = [
		...repos.map(
			(repo): BlogPost => ({
				slug: repo.name,
				title: repo.name,
				description: repo.description,
				date: repo.created_at,
				source: "repo",
				topics: repo.topics,
				repo,
			}),
		),
		...notes
			.filter((n) => !names.has(n.slug))
			.map((n): BlogPost => {
				const doc = locale === "en" ? n.en : null;
				const shown = doc ?? n.pt;
				return {
					slug: n.slug,
					title: shown.title ?? n.pt.title ?? n.slug,
					description: shown.description ?? n.pt.description ?? null,
					date: n.pt.date as string,
					source: "note",
					topics: [],
					note: {
						markdown: shown.markdown,
						translated: locale === "pt" || !!doc,
						branch: n.branch,
					},
				};
			}),
	];
	return posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Busca na lista (cacheada), nunca no GitHub direto: um slug qualquer na URL não gera requisição. */
export async function getBlogPost(
	slug: string,
	locale: string,
): Promise<BlogPost | undefined> {
	return (await getBlogPosts(locale)).find((p) => p.slug === slug);
}

/** Contribuições do último ano (API pública que lê o gráfico do perfil do GitHub). */
export async function getContributions(): Promise<Contributions | null> {
	try {
		const res = await fetch(
			`https://github-contributions-api.jogruber.de/v4/${site.github}?y=last`,
			{
				signal: AbortSignal.timeout(TIMEOUT),
				next: { revalidate: HOUR * 6, tags: ["github"] },
			},
		);
		if (!res.ok) return null;
		const data: {
			total: { lastYear: number };
			contributions: ContributionDay[];
		} = await res.json();
		return { total: data.total.lastYear, days: data.contributions };
	} catch {
		return null;
	}
}

export type FeaturedRepo = {
	name: string;
	description: string | null;
	url: string;
	homepage: string | null;
	language: string | null;
	stars: number;
};

/**
 * Repositórios fixados no perfil do GitHub. Fixados só existem na API GraphQL, que exige token;
 * sem `GITHUB_TOKEN`, cai nos públicos com mais estrelas (e mais recentes no empate).
 */
export async function getFeaturedRepos(limit = 4): Promise<FeaturedRepo[]> {
	if (process.env.GITHUB_TOKEN) {
		try {
			const res = await fetch(`${API}/graphql`, {
				method: "POST",
				headers: headers(),
				body: JSON.stringify({
					query: `query($login: String!) { user(login: $login) { pinnedItems(first: ${limit}, types: REPOSITORY) { nodes {
          ... on Repository { name description url homepageUrl stargazerCount primaryLanguage { name } } } } } }`,
					variables: { login: site.github },
				}),
				signal: AbortSignal.timeout(TIMEOUT),
				next: { revalidate: HOUR, tags: ["github"] },
			});
			if (res.ok) {
				type Node = {
					name: string;
					description: string | null;
					url: string;
					homepageUrl: string | null;
					stargazerCount: number;
					primaryLanguage: { name: string } | null;
				};
				const json: { data?: { user?: { pinnedItems: { nodes: Node[] } } } } =
					await res.json();
				const nodes = json.data?.user?.pinnedItems.nodes;
				if (nodes?.length) {
					return nodes.map((n) => ({
						name: n.name,
						description: n.description,
						url: n.url,
						homepage: httpUrl(n.homepageUrl),
						language: n.primaryLanguage?.name ?? null,
						stars: n.stargazerCount,
					}));
				}
			}
		} catch {
			// cai nos públicos
		}
	}

	const repos = await listOwnerRepos();
	return repos
		.filter((r) => !r.fork && !r.archived && r.name !== site.github)
		.sort(
			(a, b) =>
				b.stargazers_count - a.stargazers_count ||
				b.pushed_at.localeCompare(a.pushed_at),
		)
		.slice(0, limit)
		.map((r) => ({
			name: r.name,
			description: r.description,
			url: r.html_url,
			homepage: httpUrl(r.homepage),
			language: r.language,
			stars: r.stargazers_count,
		}));
}

export type RecentRepo = {
	name: string;
	description: string | null;
	url: string;
	language: string | null;
	pushedAt: string;
};

/** Repositórios públicos mexidos mais recentemente (sem forks, arquivados e o repo do perfil). */
export async function getRecentRepos(limit = 5): Promise<RecentRepo[]> {
	const repos = await listOwnerRepos();
	return repos
		.filter((r) => !r.fork && !r.archived && r.name !== site.github)
		.sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
		.slice(0, limit)
		.map((r) => ({
			name: r.name,
			description: r.description,
			url: r.html_url,
			language: r.language,
			pushedAt: r.pushed_at,
		}));
}

export type Commit = {
	sha: string;
	url: string;
	subject: string;
	date: string;
};

const MAX_PAGES = 10;

/**
 * Histórico completo deste site, do mais novo pro mais antigo: só a primeira linha da mensagem (sem corpo
 * nem trailers `Co-Authored-By`). Pagina de 100 em 100 até `MAX_PAGES`; se uma página falha, devolve o que já veio.
 */
export async function getSiteCommits(): Promise<Commit[]> {
	type Item = {
		sha: string;
		html_url: string;
		commit: {
			message: string;
			author: { date: string } | null;
			committer: { date: string } | null;
		};
	};
	const commits: Commit[] = [];
	try {
		for (let page = 1; page <= MAX_PAGES; page++) {
			const res = await fetch(
				`${API}/repos/${site.github}/portfolio-cd/commits?per_page=100&page=${page}`,
				{
					headers: headers(),
					next: { revalidate: HOUR, tags: ["github"] },
				},
			);
			if (!res.ok) break;
			const items: Item[] = await res.json();
			for (const c of items) {
				commits.push({
					sha: c.sha,
					url: c.html_url,
					subject: c.commit.message.split("\n")[0].trim(),
					date: (c.commit.author ?? c.commit.committer)?.date ?? "",
				});
			}
			if (items.length < 100) break;
		}
	} catch {
		// devolve o que já foi lido
	}
	return commits;
}
