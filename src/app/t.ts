export default {
	meta: {
		title: {
			pt: "Cauã Diório · desenvolvedor front-end",
			en: "Cauã Diório · front-end developer",
		},
		description: {
			pt: "Desenvolvedor front-end na Loopscape. Construo produto de ponta a ponta, do banco à interface, e estudo segurança.",
			en: "Front-end developer at Loopscape. I build products end to end, from the database to the interface, and study security.",
		},
	},
	role: {
		pt: "desenvolvedor front-end júnior",
		en: "junior front-end developer",
	},
	bubble: { pt: "salve!", en: "hey!" },
	today: { pt: "hoje", en: "today" },
	bio: {
		pt: "Na Loopscape, construo produto de ponta a ponta com foco no front-end: do banco e da API até cada estado da tela.",
		en: "At Loopscape, I build products end to end with a front-end focus: from the database and API down to every screen state.",
	},
	security: {
		pt: "Também estudo segurança. No Sentinel Forge, meu projeto em Go, investigo logs e testo formas de detectar ataques com sinais reais.",
		en: "I also study security. With Sentinel Forge, my Go project, I dig into logs and test ways to spot attacks from real signals.",
	},
	ai: {
		pt: "Uso IA pra explorar ideias e aprender mais rápido. Antes de levar algo pro projeto, faço questão de entender o que o código está fazendo.",
		en: "I use AI to explore ideas and learn faster. Before anything goes into a project, I make sure I understand what the code is doing.",
	},
	projects: {
		title: { pt: "projetos", en: "projects" },
		cdui: {
			pt: "Componentes React enxutos, medidos em bytes e instalados no seu projeto.",
			en: "Lean React components, measured in bytes and installed into your project.",
		},
		converter: {
			pt: "Converta arquivos sem upload. Tudo roda no navegador.",
			en: "Convert files without an upload. Everything runs in your browser.",
		},
		cdai: {
			pt: "Um agente de código local em que o modelo sugere e o código decide o que pode acontecer.",
			en: "A local coding agent where the model suggests and code decides what can happen.",
		},
		sentinel: {
			pt: "Detecções de segurança em Go, com regras YAML testadas contra logs reais.",
			en: "Security detections in Go, with YAML rules tested against real logs.",
		},
		hub: {
			pt: "Ferramenta interna pra migrar clínicas pro Loopvet: auditoria sem escrita, importação e débitos.",
			en: "Internal tool for migrating clinics into Loopvet: write-free auditing, importing and debts.",
		},
		fin: {
			pt: "Finanças da família via Open Finance, só leitura: dashboard e avisos no Discord.",
			en: "Family finances via Open Finance, read-only: a dashboard and Discord alerts.",
		},
		all: { pt: "todos os repositórios", en: "all repositories" },
		contributions: {
			pt: "{count} contribuições no último ano",
			en: "{count} contributions in the last year",
		},
	},
	stack: {
		title: { pt: "stack", en: "stack" },
		project: { pt: "tecnologias de {name}", en: "{name} tech stack" },
		learning: { pt: "estudando", en: "learning" },
	},
	error: {
		title: { pt: "algo deu errado.", en: "something went wrong." },
		body: {
			pt: "Não consegui carregar os dados do GitHub agora. Tenta de novo daqui a pouco.",
			en: "I couldn’t load GitHub data just now. Give it another try in a bit.",
		},
		retry: { pt: "tentar de novo", en: "try again" },
	},
	repos: {
		title: { pt: "em destaque no github", en: "featured on github" },
		all: { pt: "ver todos", en: "see all" },
		stars: { pt: "{count} estrelas", en: "{count} stars" },
		open: { pt: "ver", en: "view" },
		openLabel: { pt: "ver {name}", en: "view {name}" },
	},
	writing: {
		title: { pt: "escrita", en: "writing" },
		all: { pt: "ver todos", en: "see all" },
	},
	notFound: {
		path: { pt: "pagina-que-nao-existe", en: "page-that-doesnt-exist" },
		error: {
			pt: "cd: arquivo ou diretório inexistente",
			en: "cd: no such file or directory",
		},
		title: { pt: "essa página não existe.", en: "this page doesn't exist." },
		body: {
			pt: "Esse caminho não existe por aqui. Digita cd .. ou usa o link abaixo pra voltar.",
			en: "That path doesn’t exist here. Type cd .. or use the link below to head back.",
		},
		home: { pt: "voltar pro começo", en: "back to the start" },
	},
	experience: {
		title: { pt: "experiência", en: "experience" },
		current: { pt: "mar 2026 - atual", en: "mar 2026 - present" },
		role: {
			pt: "desenvolvedor front-end júnior",
			en: "junior front-end developer",
		},
		professional: { pt: "profissional", en: "professional" },
		path: {
			pt: "de estagiário front-end a desenvolvedor front-end júnior",
			en: "from front-end intern to junior front-end developer",
		},
		highlights: {
			label: { pt: "principais entregas", en: "key work" },
			stack: {
				pt: "tecnologias usadas na empresa",
				en: "technologies used at work",
			},
			cms: {
				pt: "Construí do zero o CMS interno, do banco à interface: vários portais de conteúdo, um único código servindo as instalações Loopvet e Domus, editor rico, API pública de conteúdo e um encurtador de links com métricas de clique na borda da Cloudflare.",
				en: "Built the internal CMS from scratch, database to UI: multiple content portals, one codebase serving the Loopvet and Domus installations, a rich text editor, a public content API and a link shortener with click analytics at the Cloudflare edge.",
			},
			security: {
				pt: "Cuidei da segurança no servidor: autorização por papel e por portal validada na regra de negócio, 2FA, upload de imagem protegido contra bomba de descompressão e cache invalidado por portal.",
				en: "Handled server-side security: role- and portal-based authorization enforced in the service layer, 2FA, decompression-bomb-safe image uploads and per-portal cache invalidation.",
			},
			importer: {
				pt: "Desenvolvi o importador de planilhas da Loopvet (CSV, XLS, XLSX), com mapeamento automático e manual, modelos, várias abas, prévia, motor de transformação em etapas e validação.",
				en: "Developed Loopvet's spreadsheet importer (CSV, XLS, XLSX): smart and manual column mapping, templates, multi-sheet support, preview, a step-based transformation engine and validation.",
			},
		},
	},
};
