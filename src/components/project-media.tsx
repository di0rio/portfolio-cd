"use client";

import { PlayIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Print do projeto. Com vídeo, o print vira o poster e o vídeo só carrega e toca depois do clique
 * no botão de play (nada de autoplay). Daí em diante valem os controles nativos.
 */
export function ProjectMedia({
	src,
	video,
	alt,
	play,
}: {
	src: string;
	video?: string;
	alt: string;
	play: string;
}) {
	const [started, setStarted] = useState(false);
	const player = useRef<HTMLVideoElement>(null);

	// O botão some ao clicar; o foco vai pro vídeo pra teclado e leitor de tela não se perderem.
	useEffect(() => {
		if (started) player.current?.focus();
	}, [started]);

	return (
		<div className="wide relative mt-8 aspect-video overflow-hidden rounded-xl border bg-card">
			{started ? (
				// biome-ignore lint/a11y/useMediaCaption: vídeo de demo sem fala
				<video
					aria-label={alt}
					autoPlay
					className="block size-full object-cover"
					controls
					playsInline
					poster={src}
					preload="none"
					ref={player}
					src={video}
				/>
			) : (
				<>
					<Image
						alt={alt}
						className="block size-full object-cover"
						height={2160}
						priority
						quality={90}
						sizes="(min-width: 1056px) 1024px, 100vw"
						src={src}
						width={3840}
					/>
					{video && (
						<button
							aria-label={play}
							className="group absolute inset-0 grid cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
							onClick={() => setStarted(true)}
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
