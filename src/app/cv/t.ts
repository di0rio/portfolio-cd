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
		pt: "Desenvolvedor front-end júnior na Loopscape, trabalhando na Loopvet, um sistema pra clínicas veterinárias. Meu foco é motion e design de interface. Estudo segurança no Sentinel Forge, meu projeto que lê logs de servidor e avisa quando parece ataque. Uso IA todo dia pra aprender mais rápido e reviso bastante o código antes de levar pro projeto.",
		en: "Junior front-end developer at Loopscape, working on Loopvet, a system for veterinary clinics. My focus is motion and interface design. I study security through Sentinel Forge, my project that reads server logs and flags what looks like an attack. I use AI every day to learn faster and review the code carefully before it goes into a project.",
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
			pt: "Projeto pessoal pra trazer os dados de clínicas pra Loopvet, conferindo tudo antes de importar.",
			en: "Personal project for bringing clinic data into Loopvet, checking everything before it imports.",
		},
		fin: {
			pt: "Finanças da família via Open Finance, somente leitura: dashboard e avisos no Discord.",
			en: "Family finances via Open Finance, read-only: a dashboard and Discord alerts.",
		},
	},
};
