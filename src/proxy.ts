import { type NextRequest, NextResponse } from "next/server";

// Português na raiz, inglês em /en. Por dentro tudo vive em app/[locale]: "/" vira "/pt" sem mudar a URL.
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (/^\/en(\/|$)/.test(pathname)) return NextResponse.next();

	// /pt/... é só a versão interna; quem digitar vai pra URL sem prefixo.
	if (/^\/pt(\/|$)/.test(pathname)) {
		const url = request.nextUrl.clone();
		url.pathname = pathname.slice(3) || "/";
		return NextResponse.redirect(url, 308);
	}

	const url = request.nextUrl.clone();
	url.pathname = `/pt${pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	// Fora: arquivos internos, o proxy do BotID (rewrite do withBotId; reescrever pra /pt quebraria), a imagem de prévia e qualquer arquivo com extensão (ícones, sitemap, robots, /public).
	matcher: [
		"/((?!_next|api|opengraph-image|149e9513-01fa-4fb0-aad4-566afd725d1b|.*\\..*).*)",
	],
};
