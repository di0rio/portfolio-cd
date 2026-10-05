// O corpo de cada estudo de caso mora em `content/projetos/<slug>.<pt|en>.md`; aqui ficam só as strings da página.
export default {
	title: { pt: "projetos", en: "projects" },
	intro: {
		pt: "Tudo que eu construí, com o problema, as decisões e os números de cada um. Os privados não têm código aberto, mas têm estudo de caso.",
		en: "Everything I've built, with the problem, the decisions and the numbers behind each one. The private ones don't have public code, but they do have a case study.",
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
			pt: "Componentes React que você instala direto no seu projeto. Cada byte é medido no build.",
			en: "React components you install into your project. Every byte is measured at build time.",
		},
	},

	converter: {
		intro: {
			pt: "Converte planilha, dado e imagem sem subir nada. Roda tudo na sua máquina.",
			en: "Converts spreadsheets, data and images without uploading a thing. It all runs on your device.",
		},
	},

	cdai: {
		intro: {
			pt: "Um agente de código que roda na sua máquina. O modelo sugere, mas cada ação passa pelo código.",
			en: "A coding agent that runs locally. The model suggests; code controls every action.",
		},
	},

	sentinel: {
		intro: {
			pt: "Regra em YAML e um motor em Go pra testar detecção de ataque contra log de sshd e nginx.",
			en: "YAML rules and a Go engine for testing security detections against sshd and nginx logs.",
		},
	},

	hub: {
		intro: {
			pt: "A bancada que eu uso pra migrar clínica pro Loopvet: um auditor que só lê, um importador e um hub que deixa cada um no seu canto.",
			en: "The workbench I use to migrate clinics into Loopvet: a read-only auditor, an importer and a hub that keeps each one in its own lane.",
		},
	},

	fin: {
		intro: {
			pt: "As finanças lá de casa pelo Open Finance. Só leitura: um dashboard e uns avisos no Discord.",
			en: "Our household finances through Open Finance. Read-only: a dashboard and a few Discord pings.",
		},
	},
};
