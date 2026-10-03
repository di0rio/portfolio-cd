import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { site } from "@/lib/site";

/**
 * Renderiza o README de um repositório. Caminhos relativos (`./docs/x.png`) são
 * resolvidos pro GitHub: imagens via raw, links via blob.
 *
 * Segurança: o README é conteúdo de terceiros. HTML cru não é renderizado (sem rehype-raw; não adicione sem
 * sanitizar) e esquemas como `javascript:` e `data:` são barrados pelo `defaultUrlTransform`.
 */
export function Markdown({ children, repo, branch }: { children: string; repo: string; branch: string }) {
  const base = `${site.github}/${repo}/${branch}`;

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url, key) => {
          if (/^([a-z]+:|#|\/\/)/i.test(url)) return defaultUrlTransform(url);
          const path = url.replace(/^\.?\//, "");
          return key === "src"
            ? `https://raw.githubusercontent.com/${base}/${path}`
            : `https://github.com/${site.github}/${repo}/blob/${branch}/${path}`;
        }}
        components={{
          // Link externo abre em outra aba sem dar acesso à janela de origem.
          a: ({ href, title, children }) => {
            const external = href && /^(https?:)?\/\//i.test(href);
            return (
              <a href={href} title={title} {...(external && { rel: "noopener noreferrer", target: "_blank" })}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
