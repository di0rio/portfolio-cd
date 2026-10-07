"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

/**
 * Print do projeto. Com vídeo, ele toca sozinho, mudo e em loop, mas só baixa e roda enquanto está na
 * tela (`preload="none"` + IntersectionObserver). Com movimento reduzido ou economia de dados, nada
 * toca sozinho: o print fica com um botão de play e o vídeo só carrega depois do clique.
 */
export function ProjectMedia({
	src,
	video,
	light,
	alt,
	play,
	pause,
}: {
	src: string;
	video?: string;
	/** Versão gravada no tema claro, quando existe. */
	light?: { src: string; video?: string };
	alt: string;
	play: string;
	pause: string;
}) {
	const [mode, setMode] = useState<"poster" | "auto" | "manual">("poster");
	const [paused, setPaused] = useState(false);
	const player = useRef<HTMLVideoElement>(null);
	// No servidor o tema ainda não é conhecido: o vídeo começa pelo escuro e troca depois de montar.
	const { resolvedTheme } = useTheme();
	const current = light && resolvedTheme === "light" ? light : { src, video };

	// Só no cliente dá pra saber a preferência de movimento e a economia de dados.
	useEffect(() => {
		if (!video) return;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const saveData = (
			navigator as Navigator & { connection?: { saveData?: boolean } }
		).connection?.saveData;
		if (!reduced && !saveData) setMode("auto");
	}, [video]);

	// Toca só enquanto pelo menos um quarto do vídeo está visível; fora da tela pausa e não baixa nada.
	useEffect(() => {
		const el = player.current;
		// Trocar o tema remonta o <video> com outra gravação: o efeito roda de novo e observa o elemento novo.
		if (mode !== "auto" || !el || !current.video) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !el.dataset.userPaused)
					el.play().catch(() => {});
				else el.pause();
			},
			{ threshold: 0.25 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [mode, current.video]);

	// No modo manual o foco vai pro vídeo, pra teclado e leitor de tela não se perderem.
	useEffect(() => {
		if (mode === "manual") player.current?.focus();
	}, [mode]);

	function togglePause() {
		const el = player.current;
		if (!el) return;
		if (el.paused) {
			delete el.dataset.userPaused;
			el.play().catch(() => {});
			setPaused(false);
		} else {
			el.dataset.userPaused = "1";
			el.pause();
			setPaused(true);
		}
	}

	return (
		<div className="wide relative mt-8 aspect-video overflow-hidden rounded-xl border bg-card">
			{mode === "auto" ? (
				<>
					<video
						aria-label={alt}
						className="block size-full object-cover"
						loop
						muted
						playsInline
						key={current.video}
						poster={current.src}
						preload="none"
						ref={player}
						src={current.video}
					/>
					{/* Movimento automático de mais de 5s precisa de um jeito de parar (WCAG 2.2.2). */}
					<button
						aria-label={paused ? play : pause}
						className="absolute right-3 bottom-3 grid size-9 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground shadow-sm ring-1 ring-border outline-none backdrop-blur-sm transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring motion-safe:active:scale-95"
						onClick={togglePause}
						type="button"
					>
						{paused ? (
							<PlayIcon
								aria-hidden="true"
								className="size-4 translate-x-px fill-current"
							/>
						) : (
							<PauseIcon aria-hidden="true" className="size-4 fill-current" />
						)}
					</button>
				</>
			) : mode === "manual" ? (
				// biome-ignore lint/a11y/useMediaCaption: vídeo de demo sem fala
				<video
					aria-label={alt}
					autoPlay
					className="block size-full object-cover"
					controls
					playsInline
					key={current.video}
					poster={current.src}
					preload="none"
					ref={player}
					src={current.video}
				/>
			) : (
				<>
					{/* Print por CSS, sem esperar o JS: o claro some no tema escuro e vice-versa. Com os dois temas não usa `priority`:
					    o preload baixaria os dois; <img> lazy escondido (display:none) não baixa, e o visível sobe com fetchpriority alto. */}
					<Image
						alt={alt}
						className={`block size-full object-cover ${light ? "hidden dark:block" : ""}`}
						fetchPriority="high"
						height={2160}
						priority={!light}
						quality={90}
						sizes="(min-width: 1056px) 1024px, 100vw"
						src={src}
						width={3840}
					/>
					{light && (
						<Image
							alt={alt}
							className="block size-full object-cover dark:hidden"
							fetchPriority="high"
							height={2160}
							quality={90}
							sizes="(min-width: 1056px) 1024px, 100vw"
							src={light.src}
							width={3840}
						/>
					)}
					{video && (
						<button
							aria-label={play}
							className="group absolute inset-0 grid cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
							onClick={() => setMode("manual")}
							type="button"
						>
							<span className="grid size-14 place-items-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border transition-transform duration-150 ease-out motion-safe:group-hover:scale-105 motion-safe:group-active:scale-95">
								<PlayIcon
									aria-hidden="true"
									className="size-5 translate-x-px fill-current"
								/>
							</span>
						</button>
					)}
				</>
			)}
		</div>
	);
}
