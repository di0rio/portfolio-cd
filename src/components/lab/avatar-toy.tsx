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

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * O avatar como brinquedo: a cabeça inclina e desliza na direção do ponteiro (uma mola) e amassa ao apertar
 * (a mesma mola, no eixo de escala). Ao soltar, a velocidade passa do ponto e estica: squash and stretch.
 */
export function AvatarToy({ label }: { label: string }) {
	const [stiffness, setStiffness] = useState(220);
	const [damping, setDamping] = useState(14);
	const [tilt, setTilt] = useState(12);
	const button = useRef<HTMLButtonElement>(null);
	const body = useRef<HTMLSpanElement>(null);
	const look = useRef({ x: 0, y: 0 });
	const pressed = useRef(false);

	const spring = useSpring(
		4,
		([rotate, x, y, squash]) => {
			if (body.current)
				body.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${1 + squash}, ${1 - squash})`;
		},
		{ stiffness, damping },
	);

	const aim = () => {
		if (prefersReducedMotion()) return;
		const { x, y } = look.current;
		spring.to([x * tilt, x * 4, y * 3, pressed.current ? 0.16 : 0]);
	};

	useEffect(() => {
		const move = (e: PointerEvent) => {
			const r = button.current?.getBoundingClientRect();
			if (!r) return;
			look.current = {
				x: clamp((e.clientX - (r.left + r.width / 2)) / 180),
				y: clamp((e.clientY - (r.top + r.height / 2)) / 180),
			};
			aim();
		};
		const rest = () => {
			look.current = { x: 0, y: 0 };
			aim();
		};
		window.addEventListener("pointermove", move);
		document.documentElement.addEventListener("pointerleave", rest);
		return () => {
			window.removeEventListener("pointermove", move);
			document.documentElement.removeEventListener("pointerleave", rest);
		};
	});

	const press = () => {
		pressed.current = true;
		aim();
	};
	const release = () => {
		if (!pressed.current) return;
		pressed.current = false;
		aim();
		// Empurrão extra pra fora: é ele que faz esticar depois de amassar.
		if (!prefersReducedMotion()) spring.kick(3, -1.6);
	};

	return (
		<>
			<Stage>
				<button
					aria-label={label}
					className="rounded-3xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-brand"
					onKeyDown={(e) => {
						if ((e.key === " " || e.key === "Enter") && !e.repeat) {
							e.preventDefault();
							press();
						}
					}}
					onKeyUp={(e) => (e.key === " " || e.key === "Enter") && release()}
					onPointerCancel={release}
					onPointerDown={press}
					onPointerLeave={release}
					onPointerUp={release}
					ref={button}
					type="button"
				>
					<span
						className="block origin-bottom"
						ref={body}
						style={{ willChange: "transform" }}
					>
						<AvatarSticker shadow={6} size={96} />
					</span>
				</button>
			</Stage>
			<Knobs
				code={`spring({ stiffness: ${stiffness}, damping: ${damping} })\nlook({ tilt: ${tilt}deg })`}
			>
				<Knob
					max={400}
					min={60}
					name="stiffness"
					onChange={setStiffness}
					step={10}
					value={stiffness}
				/>
				<Knob
					max={30}
					min={4}
					name="damping"
					onChange={setDamping}
					value={damping}
				/>
				<Knob
					max={25}
					min={0}
					name="tilt"
					onChange={setTilt}
					unit="deg"
					value={tilt}
				/>
			</Knobs>
		</>
	);
}
