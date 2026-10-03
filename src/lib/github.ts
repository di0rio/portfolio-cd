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
    const res = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        query: `query($login: String!) { user(login: $login) { pinnedItems(first: ${limit}, types: REPOSITORY) { nodes {
          ... on Repository { name description url homepageUrl stargazerCount primaryLanguage { name } } } } } }`,
        variables: { login: site.github },
      }),
      next: { revalidate: HOUR, tags: ["github"] },
    });
    if (res.ok) {
      type Node = { name: string; description: string | null; url: string; homepageUrl: string | null; stargazerCount: number; primaryLanguage: { name: string } | null };
      const json: { data?: { user?: { pinnedItems: { nodes: Node[] } } } } = await res.json();
      const nodes = json.data?.user?.pinnedItems.nodes;
      if (nodes?.length) {
        return nodes.map((n) => ({
          name: n.name,
          description: n.description,
          url: n.url,
          homepage: n.homepageUrl || null,
          language: n.primaryLanguage?.name ?? null,
          stars: n.stargazerCount,
        }));
      }
    }
  }

  const res = await fetch(`${API}/users/${site.github}/repos?type=owner&per_page=100&sort=pushed`, {
    headers: headers(),
    next: { revalidate: HOUR, tags: ["github"] },
  });
  if (!res.ok) return [];
  const repos: Repo[] = await res.json();
  return repos
    .filter((r) => !r.fork && !r.archived && r.name !== site.github)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, limit)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
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
  try {
    const res = await fetch(`${API}/users/${site.github}/repos?type=owner&per_page=100&sort=pushed`, {
      headers: headers(),
      next: { revalidate: HOUR, tags: ["github"] },
    });
    if (!res.ok) return [];
    const repos: Repo[] = await res.json();
    return repos
      .filter((r) => !r.fork && !r.archived && r.name !== site.github)
      .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
      .slice(0, limit)
      .map((r) => ({ name: r.name, description: r.description, url: r.html_url, language: r.language, pushedAt: r.pushed_at }));
  } catch {
    return [];
  }
}

export type Commit = { sha: string; url: string; subject: string; date: string };

/** Últimos commits deste site: só a primeira linha da mensagem (sem corpo nem trailers `Co-Authored-By`). */
export async function getSiteCommits(limit = 30): Promise<Commit[]> {
  try {
    const res = await fetch(`${API}/repos/${site.github}/portfolio-cd/commits?per_page=${limit}`, {
      headers: headers(),
      next: { revalidate: HOUR, tags: ["github"] },
    });
    if (!res.ok) return [];
    type Item = { sha: string; html_url: string; commit: { message: string; author: { date: string } | null; committer: { date: string } | null } };
    const items: Item[] = await res.json();
    return items.map((c) => ({
      sha: c.sha,
      url: c.html_url,
      subject: c.commit.message.split("\n")[0].trim(),
      date: (c.commit.author ?? c.commit.committer)?.date ?? "",
    }));
  } catch {
    return [];
  }
}
