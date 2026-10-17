// Skills de agente de IA: o site próprio (pt na raiz, en em /en) substituiu a antiga página /skills.
export const skillsSite = "https://cd-skills.vercel.app";

export const skillsSiteUrl = (locale: "pt" | "en") =>
	locale === "en" ? `${skillsSite}/en` : skillsSite;
