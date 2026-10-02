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

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
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

/** Repositórios públicos marcados com um dos `site.blogTopics`, do mais novo pro mais antigo. */
export async function getBlogRepos(): Promise<Repo[]> {
  const res = await fetch(`${API}/users/${site.github}/repos?type=owner&per_page=100&sort=created`, {
    headers: headers(),
    next: { revalidate: HOUR, tags: ["github"] },
  });
  if (!res.ok) return [];
  const repos: Repo[] = await res.json();
  return repos.filter(
    (r) => !r.fork && !r.archived && r.topics.some((topic) => (site.blogTopics as readonly string[]).includes(topic)),
  );
}

export async function getBlogRepo(name: string): Promise<Repo | undefined> {
  return (await getBlogRepos()).find((r) => r.name === name);
}

async function getRaw(repo: string, path: string): Promise<string | null> {
  const res = await fetch(`${API}/repos/${site.github}/${repo}/contents/${path}`, {
    headers: headers("application/vnd.github.raw+json"),
    next: { revalidate: HOUR, tags: ["github"] },
  });
  return res.ok ? res.text() : null;
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

/** Contribuições do último ano (API pública que lê o gráfico do perfil do GitHub). */
export async function getContributions(): Promise<Contributions | null> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${site.github}?y=last`, {
    next: { revalidate: HOUR * 6, tags: ["github"] },
  });
  if (!res.ok) return null;
  const data: { total: { lastYear: number }; contributions: ContributionDay[] } = await res.json();
  return { total: data.total.lastYear, days: data.contributions };
}
