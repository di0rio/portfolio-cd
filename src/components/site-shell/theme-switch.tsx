"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

type Labels = { toLight: string; toDark: string };

export function ThemeSwitch({ labels }: { labels: Labels }) {
	const { resolvedTheme, setTheme } = useTheme();
	// O tema só é conhecido no cliente; antes disso o botão fica sem ícone pra não piscar o errado.
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
	const dark = mounted && resolvedTheme === "dark";
	const label = dark ? labels.toLight : labels.toDark;

	return (
		<Tooltip>
			<TooltipTrigger
				aria-label={label}
				onClick={() => setTheme(dark ? "light" : "dark")}
				render={<Button size="icon-sm" type="button" variant="outline" />}
			>
				{mounted &&
					(dark ? (
						<SunIcon aria-hidden="true" />
					) : (
						<MoonIcon aria-hidden="true" />
					))}
			</TooltipTrigger>
			<TooltipPopup>{label}</TooltipPopup>
		</Tooltip>
	);
}
