import { networkInterfaces } from "node:os";
import { withInternationalization } from "better-intl/next";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const devOrigins = isDev
	? Object.values(networkInterfaces())
			.flat()
			.filter((rede) => rede?.family === "IPv4" && !rede.internal)
			.map((rede) => rede?.address)
			.filter((address) => typeof address === "string")
	: undefined;

// CSP sem nonce de propósito: nonce obriga renderização dinâmica e as páginas aqui são estáticas (ISR).
// O custo é o `'unsafe-inline'` em script-src: o Next injeta scripts inline (payload RSC) e o next-themes
// injeta o script do tema, e sem nonce/hash não dá pra liberar só eles. O restante continua travado:
// nada de scripts de outro domínio, sem <object>/<base>/formulário externo e sem ser embutido em iframe.
// `img-src https:` existe porque o README renderizado em /blog traz imagens de qualquer domínio (badges etc.).
// O JSON-LD (type="application/ld+json") não é executado, então a CSP não se aplica a ele.
const csp = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self'",
	`connect-src 'self'${isDev ? " ws: wss:" : ""}`, // /_vercel/insights (Analytics) é do mesmo domínio
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
	{ key: "Content-Security-Policy", value: csp },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains",
	},
];

const nextConfig: NextConfig = {
	allowedDevOrigins: devOrigins,

	poweredByHeader: false,
	async headers() {
		return [{ source: "/(.*)", headers: securityHeaders }];
	},
	images: {
		qualities: [75, 90], // 90 só nos prints dos estudos de caso
		// Só o que o site usa: sem pathname, o /_next/image serviria qualquer imagem do GitHub.
		remotePatterns: [
			{
				protocol: "https",
				hostname: "raw.githubusercontent.com",
				pathname: "/di0rio/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "github.com",
				pathname: "/di0rio.png",
				search: "",
			},
			// github.com/<user>.png redireciona pra cá (avatar do perfil).
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/u/**",
				search: "",
			},
		],
	},
	// Produção sem console.* do app (exceto error, usado no envio do contato); o aviso do console sai por alias (ver console-warning.tsx).
	compiler: { removeConsole: isDev ? false : { exclude: ["error"] } },
};

export default withInternationalization(withBotId(nextConfig));
