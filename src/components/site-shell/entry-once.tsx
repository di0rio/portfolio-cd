"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * A entrada escalonada (`stagger-in`, globals.css) é só do carregamento do documento. Na navegação
 * entre páginas quem anima é o `<ViewTransition>` do layout; as duas juntas faziam o conteúdo
 * entrar de novo (e o /#projetos aparecer em branco) depois da transição. Na primeira troca de rota
 * marca o <html> com `data-nav`, no mesmo commit da página nova e antes da pintura, pra animação nem começar.
 */
export function EntryOnce() {
	const pathname = usePathname();
	const first = useRef(pathname);
	useLayoutEffect(() => {
		if (pathname !== first.current) document.documentElement.dataset.nav = "";
	}, [pathname]);
	return null;
}
