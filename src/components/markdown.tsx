import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import ReactMarkdown, { type Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { site } from "@/lib/site";

// Link externo abre em outra aba sem dar acesso à janela de origem.
const link: Components["a"] = ({ href, title, children }) => {
  const external = href && /^(https?:)?\/\//i.test(href);
  return (
    <a href={href} title={title} {...(external && { rel: "noopener noreferrer", target: "_blank" })}>
      {children}
    </a>
  );
};

// Só prints do próprio site (`/projects/x.webp`, 3840x2160); sem o arquivo no build, some em silêncio.
const localImage = /^\/projects\/[\w.-]+$/;

const article: Components = {
  a: link,
  // `![]()` sozinho no parágrafo vira <figure>, que não pode ficar dentro de <p>.
  p: ({ node, children }) => {
    const [only] = node?.children ?? [];
    return node?.children.length === 1 && only.type === "element" && only.tagName === "img" ? <>{children}</> : <p>{children}</p>;
  },
  img: ({ src, alt }) => {
    if (typeof src !== "string" || !localImage.test(src) || !existsSync(join(process.cwd(), "public", src))) return null;
    return (
      <figure className="wide">
        {/* O print é de uma tela inteira: clicar abre em tamanho real pra ler os detalhes. */}
        <a href={src} rel="noopener" target="_blank">
          <Image alt={alt ?? ""} className="block h-auto w-full" height={2160} quality={90} sizes="(min-width: 1056px) 1024px, 100vw" src={src} width={3840} />
        </a>
        {alt && <figcaption>{alt}</figcaption>}
      </figure>
    );
  },
};

/**
 * Renderiza markdown. Com `repo` e `branch` é o README de um repositório: caminhos relativos
 * (`./docs/x.png`) são resolvidos pro GitHub, imagens via raw e links via blob. Sem eles é conteúdo
 * do próprio site (estudos de caso em `content/projetos`), com prints locais via next/image.
 * `dir` é a pasta do documento no repositório (nota em `posts/<slug>`): `./x.png` parte dela e `/x.png`, da raiz.
 *
 * Segurança: o README é conteúdo de terceiros. HTML cru não é renderizado (sem rehype-raw; não adicione sem
 * sanitizar) e esquemas como `javascript:` e `data:` são barrados pelo `defaultUrlTransform`.
 */
export function Markdown({ children, repo, branch, dir }: { children: string; repo?: string; branch?: string; dir?: string }) {
  const base = repo && branch ? `${site.github}/${repo}/${branch}` : null;

  return (
    <div className="markdown">
      <ReactMarkdown
        components={base ? { a: link } : article}
        remarkPlugins={[remarkGfm]}
        urlTransform={(url, key) => {
          if (!base || /^([a-z]+:|#|\/\/)/i.test(url)) return defaultUrlTransform(url);
          const path = url.startsWith("/") ? url.slice(1) : `${dir ? `${dir}/` : ""}${url.replace(/^\.\//, "")}`;
          return key === "src"
            ? `https://raw.githubusercontent.com/${base}/${path}`
            : `https://github.com/${site.github}/${repo}/blob/${branch}/${path}`;
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
