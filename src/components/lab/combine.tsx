"use client";

import { useEffect, useRef, useState } from "react";
import {
	AvatarSticker,
	Knob,
	Knobs,
	prefersReducedMotion,
	Stage,
	useSpring,
} from "@/components/lab/workbench";
import { cartoon, cartoonPress } from "@/components/ui/cartoon";

const SIZE = 40;

/**
 * Duas peças que viram uma: arraste o avatar pra perto do botão e solte. Dentro do raio, uma mola puxa
 * o avatar pro encaixe e o botão ganha cara e vira um botão de desenho animado. Depois de montado, clicar faz o avatar pular.
 */
export function Combine({
	copy,
}: {
	copy: {
		piece: string;
		merged: string;
		join: string;
		split: string;
	};
}) {
	const [snap, setSnap] = useState(56);
	const [pull, setPull] = useState(260);
	const [merged, setMerged] = useState(false);
	const [near, setNear] = useState(false);
	const stage = useRef<HTMLDivElement>(null);
	const avatar = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);
	const slot = useRef<HTMLSpanElement>(null);
	const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
		null,
	);

	const spring = useSpring(
		2,
		([x, y]) => {
			if (avatar.current)
				avatar.current.style.transform = `translate(${x}px, ${y}px)`;
		},
		{ stiffness: pull, damping: 1.4 * Math.sqrt(pull) },
	);

	// Quanto falta pro avatar ficar no encaixe do botão (um espaço próprio à esquerda do texto).
	const gap = () => {
		const a = avatar.current?.getBoundingClientRect();
		const b = slot.current?.getBoundingClientRect();
		if (!(a && b)) return { dx: 0, dy: 0, dist: Number.POSITIVE_INFINITY };
		const dx = b.left - a.left;
		const dy = b.top + b.height / 2 - (a.top + a.height / 2);
		return { dx, dy, dist: Math.hypot(dx, dy) };
	};

	// Juntado, o botão acompanha o palco (resize, rotação): o avatar tem que continuar no encaixe.
	useEffect(() => {
		const el = stage.current;
		if (!(merged && el)) return;
		const ro = new ResizeObserver(() => {
			const { dx, dy } = gap();
			if (dx || dy) spring.jump([spring.value[0] + dx, spring.value[1] + dy]);
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	const join = () => {
		const { dx, dy } = gap();
		const [x, y] = spring.value;
		const done = () => {
			setMerged(true);
			setNear(false);
			if (!prefersReducedMotion())
				button.current?.animate(
					[{ transform: "scale(0.95)" }, { transform: "scale(1)" }],
					{ duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
				);
		};
		if (prefersReducedMotion()) {
			spring.jump([x + dx, y + dy]);
			done();
		} else spring.to([x + dx, y + dy], done);
	};
	const split = () => {
		setMerged(false);
		if (prefersReducedMotion()) spring.jump([0, 0]);
		else spring.to([0, 0]);
	};

	const move = (e: React.PointerEvent) => {
		const d = drag.current;
		const s = stage.current?.getBoundingClientRect();
		const a = avatar.current?.getBoundingClientRect();
		if (!(d && s && a)) return;
		const [cx, cy] = spring.value;
		let x = d.ox + e.clientX - d.x;
		let y = d.oy + e.clientY - d.y;
		// Mantém dentro do palco: as peças nunca somem da vista.
		x = Math.max(s.left - (a.left - cx), Math.min(s.right - (a.right - cx), x));
		y = Math.max(s.top - (a.top - cy), Math.min(s.bottom - (a.bottom - cy), y));
		spring.jump([x, y]);
		setNear(gap().dist < snap);
	};

	return (
		<>
			<Stage className="min-h-48" ref={stage}>
				{/* Só ponteiro: o jeito de teclado é o botão "juntar" no canto. */}
				<div
					aria-hidden="true"
					className={`absolute top-3 left-3 z-10 touch-none select-none ${merged ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
					onPointerCancel={() => {
						drag.current = null;
					}}
					onPointerDown={(e) => {
						if (merged) return;
						e.currentTarget.setPointerCapture(e.pointerId);
						const [ox, oy] = spring.value;
						spring.jump([ox, oy]);
						drag.current = { x: e.clientX, y: e.clientY, ox, oy };
					}}
					onPointerMove={move}
					onPointerUp={() => {
						if (!drag.current) return;
						drag.current = null;
						if (near) join();
					}}
					ref={avatar}
					style={{ willChange: "transform" }}
				>
					<AvatarSticker shadow={2} size={SIZE} />
				</div>
				<button
					aria-disabled={!merged}
					className={`flex h-12 w-52 items-center gap-2.5 rounded-lg pr-4 pl-0.5 text-left text-sm outline-none transition-[background-color,border-color,color,box-shadow,translate,scale] focus-visible:ring-2 focus-visible:ring-brand ${
						merged
							? `${cartoon} ${cartoonPress} bg-brand font-medium text-[#1c1c1c]`
							: "border border-dashed text-muted-foreground duration-150 ease-out"
					} ${near ? "border-brand ring-2 ring-brand" : ""}`}
					onClick={() =>
						merged && !prefersReducedMotion() && spring.kick(1, -420)
					}
					ref={button}
					type="button"
				>
					<span aria-hidden="true" className="size-10 shrink-0" ref={slot} />
					<span className="min-w-0 truncate">
						{merged ? copy.merged : copy.piece}
					</span>
				</button>
				<button
					className="absolute right-4 bottom-3 rounded-md px-2 py-1 text-muted-foreground text-sm outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
					onClick={merged ? split : join}
					type="button"
				>
					{merged ? copy.split : copy.join}
				</button>
			</Stage>
			<Knobs code={`merge({ snap: ${snap}px, stiffness: ${pull} })`}>
				<Knob
					max={140}
					min={20}
					name="snap"
					onChange={setSnap}
					unit="px"
					value={snap}
				/>
				<Knob
					max={500}
					min={80}
					name="stiffness"
					onChange={setPull}
					step={10}
					value={pull}
				/>
			</Knobs>
		</>
	);
}
