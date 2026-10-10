export default {
	meta: {
		title: {
			pt: "Cauã Diório · desenvolvedor front-end",
			en: "Cauã Diório · front-end developer",
		},
		description: {
			pt: "Dev front-end na Loopscape. Faço produto de ponta a ponta, do banco à tela, e estudo segurança de hobby.",
			en: "Front-end dev at Loopscape. I build products end to end, database to screen, and study security as a hobby.",
		},
	},
	role: {
		pt: "desenvolvedor front-end júnior",
		en: "junior front-end developer",
	},
	bubble: { pt: "salve!", en: "hey!" },
	today: { pt: "hoje", en: "today" },
	bio: {
		pt: "Trabalho na Loopscape fazendo produto de ponta a ponta. Onde eu mais manjo é o front, mas se a tela precisa de uma rota nova na API ou de uma mudança no banco, eu faço também.",
		en: "I work at Loopscape building products end to end. Front-end is where I'm strongest, but if a screen needs a new API route or a database change, I build that too.",
	},
	security: {
		pt: "Fora do trabalho eu estudo segurança, mais de hobby mesmo. O Sentinel Forge é onde eu testo isso: leio log de sshd e nginx e vejo como pegar ataque.",
		en: "Outside work I study security, mostly as a hobby. Sentinel Forge is where I try it out: I read sshd and nginx logs and work out how to catch attacks.",
	},
	ai: {
		pt: "Uso IA todo dia pra aprender mais rápido. O código que ela escreve eu leio com calma, pergunto o que não entendi e só commito quando consigo explicar cada parte.",
		en: "I use AI every day to learn faster. When it writes code, I read it slowly, ask about whatever I don't get, and only commit once I can explain every part.",
	},
	projects: {
		title: { pt: "projetos", en: "projects" },
		cdui: {
			pt: "Meus componentes React: cada um tem o peso medido em bytes, e você instala direto no seu projeto.",
			en: "My React components: each one has its weight measured in bytes, and you install them right into your project.",
		},
		converter: {
			pt: "Converte arquivo sem subir nada pra servidor nenhum. Roda tudo no navegador.",
			en: "Converts files without uploading anything anywhere. It all runs in your browser.",
		},
		cdai: {
			pt: "Um agente de código que roda na sua máquina. O modelo dá a ideia, mas quem decide o que acontece é o código.",
			en: "A coding agent that runs on your machine. The model pitches ideas, but code decides what actually happens.",
		},
		sentinel: {
			pt: "Detecção de ataque em Go, com regra em YAML testada contra log de sshd e nginx.",
			en: "Attack detection in Go, with YAML rules tested against sshd and nginx logs.",
		},
		hub: {
			pt: "A ferramenta que eu fiz pra migrar clínica pro Loopvet: confere tudo antes, importa e traz os débitos.",
			en: "The tool I built to migrate clinics into Loopvet: it checks everything first, imports, and brings the debts over.",
		},
		fin: {
			pt: "As finanças lá de casa pelo Open Finance. Só lê: um dashboard e uns avisos no Discord.",
			en: "Our household finances through Open Finance. Read-only: a dashboard and a few Discord pings.",
		},
		// Um número por projeto, tirado do estudo de caso (home e /projetos).
		metric: {
			cdui: {
				pt: "32 componentes e 15 blocos, ~695 B em gzip em média",
				en: "32 components and 15 blocks, ~695 B gzipped on average",
			},
			converter: {
				pt: "nada sai da aba: a CSP do app bloqueia upload",
				en: "nothing leaves the tab: the app's CSP blocks uploads",
			},
			cdai: {
				pt: "0 chamadas a API externa: tudo roda no Ollama",
				en: "0 external API calls: everything runs on Ollama",
			},
			sentinel: {
				pt: "mil tentativas de login viram 1 detecção, não cem",
				en: "a thousand login attempts become 1 detection, not a hundred",
			},
			hub: {
				pt: "migração em teste: de 1 por dia pra até 10",
				en: "test migrations: from 1 a day to up to 10",
			},
			fin: {
				pt: "350+ testes e nenhum valor salvo em disco",
				en: "350+ tests, no amount ever written to disk",
			},
		},
		all: { pt: "todos os repositórios", en: "all repositories" },
		contributions: {
			pt: "{count} contribuições no último ano",
			en: "{count} contributions in the last year",
		},
	},
	// Prévia do lab na home. A página em si usa `lab/t.ts`.
	labTeaser: {
		title: { pt: "lab", en: "lab" },
		intro: {
			pt: "Interações que eu fico lapidando até ficar gostoso de usar. Segura o botão aí:",
			en: "Interactions I keep polishing until they feel right. Go ahead, hold the button:",
		},
		all: { pt: "ver o lab inteiro", en: "see the whole lab" },
	},
	stack: {
		title: { pt: "stack", en: "stack" },
		project: { pt: "tecnologias de {name}", en: "{name} tech stack" },
		learning: { pt: "estudando", en: "learning" },
	},
	error: {
		title: { pt: "algo deu errado.", en: "something went wrong." },
		body: {
			pt: "Não rolou carregar os dados do GitHub agora. Tenta de novo daqui a pouco.",
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
			pt: "Esse caminho não existe por aqui. Manda um cd .. ou usa o link aí embaixo pra voltar.",
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
				pt: "Fiz o CMS interno do zero, do banco à interface: vários portais de conteúdo, um único código servindo as instalações Loopvet e Domus, editor rico, API pública de conteúdo e um encurtador de links com métricas de clique na borda da Cloudflare.",
				en: "Built the internal CMS from scratch, database to UI: multiple content portals, one codebase serving the Loopvet and Domus installations, a rich text editor, a public content API and a link shortener with click analytics at the Cloudflare edge.",
			},
			security: {
				pt: "Cuidei da segurança no servidor: autorização por papel e por portal validada na regra de negócio, 2FA, upload de imagem protegido contra bomba de descompressão e cache invalidado por portal.",
				en: "Handled server-side security: role- and portal-based authorization enforced in the service layer, 2FA, decompression-bomb-safe image uploads and per-portal cache invalidation.",
			},
			importer: {
				pt: "Fiz o importador de planilhas da Loopvet (CSV, XLS, XLSX), com mapeamento automático e manual, modelos, várias abas, prévia, motor de transformação em etapas e validação.",
				en: "Developed Loopvet's spreadsheet importer (CSV, XLS, XLSX): smart and manual column mapping, templates, multi-sheet support, preview, a step-based transformation engine and validation.",
			},
		},
	},
};
