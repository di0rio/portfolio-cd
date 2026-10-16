"use client";

import { useEffect, useRef } from "react";
import { unlock } from "@/lib/achievements";

/** Marca o fim de um texto: ao chegar nele rolando a página, desbloqueia "leitor". */
export function ReadEnd() {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => {
			// scrollY 0: o fim já estava na tela (texto curto), então ninguém leu rolando.
			if (entry?.isIntersecting && window.scrollY > 0) {
				unlock("leitor");
				io.disconnect();
			}
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return <div aria-hidden="true" ref={ref} />;
}
