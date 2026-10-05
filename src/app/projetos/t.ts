// O corpo de cada estudo de caso mora em `content/projetos/<slug>.<pt|en>.md`; aqui ficam só as strings da página.
export default {
	title: { pt: "projetos", en: "projects" },
	intro: {
		pt: "O que eu construí, com o problema, as decisões e os números de cada um. Os privados não têm link, mas têm estudo de caso.",
		en: "What I've built, with the problem, the decisions and the numbers behind each one. Private ones have no link, but they have a case study.",
	},
	private: { pt: "privado", en: "private" },
	caseStudy: { pt: "estudo de caso", en: "case study" },
	back: { pt: "projetos", en: "projects" },
	live: { pt: "ver no ar", en: "see it live" },
	repo: { pt: "ver repositório", en: "view repository" },
	imageAlt: { pt: "captura de tela de {name}", en: "screenshot of {name}" },
	play: { pt: "reproduzir vídeo", en: "play video" },
	pause: { pt: "pausar vídeo", en: "pause video" },
	nav: { pt: "outros projetos", en: "other projects" },

	cdui: {
		intro: {
			pt: "Componentes React que você instala no seu projeto. Cada byte é medido no build.",
			en: "React components you install into your project. Every byte is measured at build time.",
		},
	},

	converter: {
		intro: {
			pt: "Converta planilhas, dados e imagens sem upload. Tudo roda na sua máquina.",
			en: "Convert spreadsheets, data, and images without an upload. It all runs on your device.",
		},
	},

	cdai: {
		intro: {
			pt: "Um agente de código que roda localmente. O modelo sugere; o código controla cada ação.",
			en: "A coding agent that runs locally. The model suggests; code controls every action.",
		},
	},

	sentinel: {
		intro: {
			pt: "Regras YAML e um motor em Go pra testar detecções de segurança contra logs reais.",
			en: "YAML rules and a Go engine for testing security detections against real logs.",
		},
	},

	hub: {
		intro: {
			pt: "A bancada de migração de clínicas do Loopvet: um auditor que só lê, um importador e um lançador que isola cada um.",
			en: "Loopvet's clinic-migration workbench: a read-only auditor, an importer and a launcher that keeps each one isolated.",
		},
	},

	fin: {
		intro: {
			pt: "Finanças da família pelo Open Finance. Só leitura: um dashboard e avisos no Discord.",
			en: "Family finances through Open Finance. Read-only: a dashboard and Discord alerts.",
		},
	},
};
