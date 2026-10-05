export default {
	title: { pt: "currículo", en: "résumé" },
	description: {
		pt: "Currículo do Cauã Diório, desenvolvedor front-end.",
		en: "Résumé of Cauã Diório, front-end developer.",
	},
	print: { pt: "salvar em PDF", en: "save as PDF" },
	summary: { pt: "resumo", en: "summary" },
	openSource: { pt: "open source", en: "open source" },
	// O /cv vai impresso pro RH: aqui o tom é sóbrio. A home usa a versão do meu jeito (`app/t.ts`).
	about: {
		pt: "Desenvolvedor front-end na Loopscape, onde construo produto de ponta a ponta: do banco e da API até cada estado da tela. Estudo segurança no Sentinel Forge, meu projeto de detecção de ataques em logs de sshd e nginx. Uso IA pra aprender mais rápido e só levo pro projeto o código que eu entendo.",
		en: "Front-end developer at Loopscape, building products end to end: from the database and API down to every screen state. I study security through Sentinel Forge, my project for detecting attacks in sshd and nginx logs. I use AI to learn faster and only ship code I understand.",
	},
	projects: {
		cdui: {
			pt: "Componentes React enxutos, medidos em bytes e instalados no projeto via registry do shadcn.",
			en: "Lean React components, measured in bytes and installed through a shadcn registry.",
		},
		converter: {
			pt: "Conversor de planilhas, dados e imagens que roda inteiro no navegador, sem upload.",
			en: "Spreadsheet, data and image converter that runs entirely in the browser, with no upload.",
		},
		cdai: {
			pt: "Agente de código local em que o modelo sugere e o código decide o que pode acontecer.",
			en: "Local coding agent where the model suggests and code decides what can happen.",
		},
		sentinel: {
			pt: "Motor de detecção de ataques em Go, com regras YAML testadas contra logs de sshd e nginx.",
			en: "Attack detection engine in Go, with YAML rules tested against sshd and nginx logs.",
		},
		hub: {
			pt: "Projeto pessoal pra migrar clínicas pro Loopvet pela API: auditoria sem escrita, importação e débitos.",
			en: "Personal project for migrating clinics into Loopvet through its API: write-free auditing, importing and debts.",
		},
		fin: {
			pt: "Finanças da família via Open Finance, somente leitura: dashboard e avisos no Discord.",
			en: "Family finances via Open Finance, read-only: a dashboard and Discord alerts.",
		},
	},
};
