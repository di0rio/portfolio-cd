// O corpo de cada estudo de caso mora em `content/projetos/<slug>.<pt|en>.md`; aqui ficam só as strings da página.
export default {
	title: { pt: "projetos", en: "projects" },
	intro: {
		pt: "Tudo que eu construí e o porquê de cada decisão. Os privados não têm código aberto, mas têm estudo de caso.",
		en: "Everything I've built and why I made each call. The private ones don't have public code, but they do have a case study.",
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
			pt: "Componentes React que você instala direto no seu projeto, e dá pra ver quanto cada um pesa.",
			en: "React components you install right into your project, and you can see how much each one weighs.",
		},
	},

	converter: {
		intro: {
			pt: "Converte planilha, imagem e outros arquivos direto no navegador.",
			en: "Converts spreadsheets, images and other files right in your browser.",
		},
	},

	cdai: {
		intro: {
			pt: "Um agente de código em que a IA sugere e o próprio programa confere antes de fazer qualquer coisa.",
			en: "A coding agent where the AI suggests and the program itself checks before doing anything.",
		},
	},

	sentinel: {
		intro: {
			pt: "Lê log de servidor e avisa quando parece ataque. É onde eu estudo segurança.",
			en: "Reads server logs and flags what looks like an attack. It's where I study security.",
		},
	},

	hub: {
		intro: {
			pt: "O que eu uso pra trazer os dados de uma clínica pra Loopvet. Antes de importar, ele mostra o que ia acontecer sem mexer em nada.",
			en: "What I use to bring a clinic's data into Loopvet. Before importing, it shows what would happen without touching anything.",
		},
	},

	fin: {
		intro: {
			pt: "As finanças lá de casa num painel, com aviso no Discord. Só lê os dados do banco, nunca mexe em dinheiro.",
			en: "Our household finances in one dashboard, with alerts on Discord. It only reads bank data and never moves money.",
		},
	},
};
