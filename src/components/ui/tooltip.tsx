"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";
import { cn } from "@/lib/utils";

const DEFAULT_DELAY = 250;
const DelayContext = React.createContext(DEFAULT_DELAY);

/**
 * Opcional. Envolva a área (ou o app) com `TooltipProvider`: depois que o primeiro tooltip abre,
 * os vizinhos abrem na hora e sem animação, como numa barra de ferramentas.
 */
export function TooltipProvider({
	delay = DEFAULT_DELAY,
	closeDelay = 0,
	...props
}: TooltipPrimitive.Provider.Props): React.ReactElement {
	return (
		<DelayContext value={delay}>
			<TooltipPrimitive.Provider
				closeDelay={closeDelay}
				delay={delay}
				{...props}
			/>
		</DelayContext>
	);
}

export const Tooltip = TooltipPrimitive.Root;

/**
 * Gatilho do tooltip. Abre depois de 250ms (ou do delay do `TooltipProvider`). Com `render` (ex.: `render={<Button />}`),
 * coloque `onClick`, `aria-label` e outros handlers aqui no `TooltipTrigger`, não no elemento passado em `render`: no
 * build de produção o `onClick` do elemento passado em `render` pode não disparar.
 */
export function TooltipTrigger({
	delay,
	...props
}: TooltipPrimitive.Trigger.Props): React.ReactElement {
	const providerDelay = React.useContext(DelayContext);
	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			delay={delay ?? providerDelay}
			{...props}
		/>
	);
}

/**
 * Balão do tooltip, no estilo do Material: texto pequeno e denso que nasce do gatilho.
 * Os seguintes (`data-instant`) aparecem sem animação.
 */
export function TooltipPopup({
	className,
	side = "top",
	sideOffset = 8,
	arrow = false,
	children,
	...props
}: TooltipPrimitive.Popup.Props &
	Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset"> & {
		/** Triângulo pequeno apontando pro gatilho. */
		arrow?: boolean;
	}): React.ReactElement {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Positioner
				className="z-50"
				side={side}
				sideOffset={sideOffset}
			>
				<TooltipPrimitive.Popup
					className={cn(
						// Salto de escala maior que nos outros popups: o balão é pequeno, precisa do percurso pra se notar.
						"cd-popup max-w-[300px] break-words rounded-xs bg-foreground/92 px-2 py-1 font-medium text-[0.6875rem] text-background leading-[1.4] [--cd-scale-enter:0.75] motion-reduce:[--cd-scale-enter:1]",
						className,
					)}
					data-slot="tooltip-popup"
					{...props}
				>
					{children}
					{arrow && (
						<TooltipPrimitive.Arrow
							className="flex data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180"
							data-slot="tooltip-arrow"
						>
							<svg aria-hidden="true" height="6" viewBox="0 0 12 6" width="12">
								<path className="fill-foreground/92" d="M0 6 6 0l6 6Z" />
							</svg>
						</TooltipPrimitive.Arrow>
					)}
				</TooltipPrimitive.Popup>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

/**
 * Atalho pro caso comum: `<Tip content="Negrito"><Button aria-label="Negrito" size="icon-sm" /></Tip>`.
 * `children` é o elemento gatilho (recebe as props do tooltip).
 */
export function Tip({
	content,
	children,
	side,
	sideOffset,
	arrow,
}: {
	content: React.ReactNode;
	children: React.ReactElement;
} & Pick<
	React.ComponentProps<typeof TooltipPopup>,
	"side" | "sideOffset" | "arrow"
>): React.ReactElement {
	return (
		<Tooltip>
			<TooltipTrigger render={children} />
			<TooltipPopup arrow={arrow} side={side} sideOffset={sideOffset}>
				{content}
			</TooltipPopup>
		</Tooltip>
	);
}
