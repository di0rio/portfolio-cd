export default {
	meta: {
		title: {
			pt: "Cauã Diório · desenvolvedor front-end",
			en: "Cauã Diório · front-end developer",
		},
		description: {
			pt: "Dev front-end júnior na Loopscape. Curto motion e design e estudo segurança no tempo livre.",
			en: "Junior front-end dev at Loopscape. I'm into motion and design, and I study security in my free time.",
		},
	},
	role: {
		pt: "desenvolvedor front-end júnior",
		en: "junior front-end developer",
	},
	bubble: { pt: "salve!", en: "hey!" },
	today: { pt: "hoje", en: "today" },
	bio: {
		pt: "Sou dev front-end júnior na Loopscape e trabalho na Loopvet, um sistema pra clínica veterinária. O que eu mais curto é motion e design, e o lab aqui do site é onde eu demonstro isso.",
		en: "I'm a junior front-end dev at Loopscape, working on Loopvet, a system for veterinary clinics. What I enjoy most is motion and design, and the lab on this site is where I show that.",
	},
	side: {
		pt: "No tempo livre eu toco o cd/ui e o converter-hub e estudo segurança no Sentinel Forge. Uso IA todo dia pra aprender mais rápido, mas tento entender ao máximo o que acontece no código e reviso bastante. Ainda tô aprendendo o que é o ideal.",
		en: "In my free time I work on cd/ui and converter-hub and study security with Sentinel Forge. I use AI every day to learn faster, but I try hard to understand what's going on in the code and I review a lot. I'm still learning what works best.",
	},
	projects: {
		title: { pt: "projetos", en: "projects" },
		cdui: {
			pt: "Meus componentes React. Dá pra ver quanto cada um pesa e instalar direto no seu projeto.",
			en: "My React components. You can see how much each one weighs and install it right into your project.",
		},
		converter: {
			pt: "Converte planilha, imagem e outros arquivos direto no navegador.",
			en: "Converts spreadsheets, images and other files right in your browser.",
		},
		cdai: {
			pt: "Um agente de código em que a IA sugere e o próprio programa confere antes de fazer qualquer coisa.",
			en: "A coding agent where the AI suggests and the program itself checks before doing anything.",
		},
		sentinel: {
			pt: "Lê log de servidor e avisa quando parece ataque. É onde eu estudo segurança.",
			en: "Reads server logs and flags what looks like an attack. It's where I study security.",
		},
		hub: {
			pt: "A ferramenta que eu uso pra trazer os dados de uma clínica de outro sistema pra Loopvet, conferindo tudo antes de importar.",
			en: "The tool I use to bring a clinic's data from another system into Loopvet, checking everything before it imports.",
		},
		fin: {
			pt: "As finanças lá de casa num painel, com aviso no Discord. Só lê os dados do banco, nunca mexe em dinheiro.",
			en: "Our household finances in one dashboard, with alerts on Discord. It only reads bank data and never moves money.",
		},
		// Um número por projeto, tirado do estudo de caso (home e /projetos).
		metric: {
			cdui: {
				pt: "32 componentes e 15 blocos, ~695 B em gzip em média",
				en: "32 components and 15 blocks, ~695 B gzipped on average",
			},
			converter: {
				pt: "nenhum arquivo sai do navegador",
				en: "no file ever leaves the browser",
			},
			cdai: {
				pt: "roda 100% no seu computador, com Ollama",
				en: "runs 100% on your computer, with Ollama",
			},
			sentinel: {
				pt: "mil tentativas de login viram um alerta só",
				en: "a thousand login attempts become a single alert",
			},
			hub: {
				pt: "de 1 pra até 10 clínicas migradas por dia, em teste",
				en: "from 1 to up to 10 clinics migrated a day, in testing",
			},
			fin: {
				pt: "350+ testes, e nenhum valor fica salvo",
				en: "350+ tests, and no amount is ever stored",
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
				pt: "Fiz o CMS interno do zero. Um código só atende vários portais de conteúdo da Loopvet e da Domus, com editor de texto, API pública e um encurtador de links que conta os cliques.",
				en: "Built the internal CMS from scratch. One codebase runs several content portals for Loopvet and Domus, with a text editor, a public API and a link shortener that counts clicks.",
			},
			security: {
				pt: "Cuidei da segurança do CMS. Cada pessoa só mexe no que o cargo e o portal dela permitem, e o login tem verificação em duas etapas. O upload de imagem também barra arquivo feito pra derrubar o servidor.",
				en: "Handled the CMS security. Each person can only touch what their role and portal allow, and login uses two-factor authentication. Image uploads also block files made to take the server down.",
			},
			importer: {
				pt: "Fiz o importador de planilhas da Loopvet. Ele lê CSV e Excel, liga as colunas sozinho ou na mão e mostra uma prévia já validada antes de importar.",
				en: "Built Loopvet's spreadsheet importer. It reads CSV and Excel, matches columns automatically or by hand, and shows a validated preview before importing.",
			},
		},
	},
};
