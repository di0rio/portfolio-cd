// Texto entre crases vira código mono na página (ver `Rich`).
export default {
	title: { pt: "skills", en: "skills" },
	intro: {
		pt: "Regras que eu escrevi pra agentes de IA (Claude Code, Codex, Cursor) trabalharem do jeito que eu trabalho. Cada skill é um arquivo SKILL.md, em português e em inglês. São de graça, com licença MIT.",
		en: "Rules I wrote so AI agents (Claude Code, Codex, Cursor) work the way I do. Each skill is a single SKILL.md file, in Portuguese and English. Free, under the MIT license.",
	},
	github: { pt: "ver no github", en: "view on github" },
	installTitle: { pt: "instalar", en: "install" },
	installTabs: { pt: "formas de instalar", en: "ways to install" },
	tabCli: { pt: "skills CLI", en: "skills CLI" },
	tabClaude: { pt: "Claude Code", en: "Claude Code" },
	tabOthers: { pt: "outros agentes", en: "other agents" },
	cliPick: { pt: "pra escolher só uma:", en: "to pick just one:" },
	claudeNote: {
		pt: "Pra versão em português, baixe `SKILL.pt.md` e salve como `SKILL.md`. Pra outra skill, troque o nome dela na pasta e na URL.",
		en: "For the Portuguese version, download `SKILL.pt.md` and save it as `SKILL.md`. For the other skill, swap its name in the folder and the URL.",
	},
	others: {
		pt: "Cola o corpo do `SKILL.md` no `AGENTS.md`, no `CLAUDE.md` ou em `.cursor/rules`.",
		en: "Paste the body of `SKILL.md` into `AGENTS.md`, `CLAUDE.md` or `.cursor/rules`.",
	},
	idea: { pt: "a ideia", en: "the idea" },
	post: { pt: "post", en: "post" },
	cleanCode: {
		tagline: {
			pt: "a menor mudança correta, segura e legível que cabe no projeto.",
			en: "the smallest correct, safe and readable change that fits the project.",
		},
		diffCaption: {
			pt: "Faz a mesma coisa sem uma interface e uma classe pra um cálculo que só aparece aqui. Encurtar nunca vale tirar validação, tratamento de erro ou acessibilidade.",
			en: "Same result, without an interface and a class for a sum that only happens here. Shorter is never worth dropping validation, error handling or accessibility.",
		},
		removed: { pt: "removido", en: "removed" },
		added: { pt: "adicionado", en: "added" },
		ladderTitle: { pt: "a escada", en: "the ladder" },
		ladderIntro: {
			pt: "Para no primeiro degrau que resolve certo.",
			en: "Stop at the first rung that solves it correctly.",
		},
		step1: { pt: "precisa existir?", en: "does it need to exist?" },
		step2: { pt: "remover código", en: "remove code" },
		step3: {
			pt: "reusar o que já tem no projeto",
			en: "reuse what the project already has",
		},
		step4: { pt: "biblioteca padrão", en: "standard library" },
		step5: {
			pt: "recurso nativo da plataforma (HTML/CSS antes de JS)",
			en: "native platform feature (HTML/CSS before JS)",
		},
		step6: {
			pt: "dependência já instalada",
			en: "an already-installed dependency",
		},
		step7: { pt: "poucas linhas de código", en: "a few lines of code" },
		step8: {
			pt: "abstração, só com 2+ usos reais ou fronteira externa",
			en: "abstraction, only with 2+ real uses or an external boundary",
		},
		step9: { pt: "dependência nova", en: "a new dependency" },
		step10: { pt: "infraestrutura nova", en: "new infrastructure" },
		benchTitle: { pt: "teste", en: "benchmark" },
		benchNone: { pt: "sem regras", en: "no rules" },
		benchCaption: {
			pt: "5 tarefas pequenas que eu escrevi, avaliadas às cegas por outro modelo. Rodei cada versão uma vez só, então serve de termômetro, não de prova.",
			en: "5 small tasks I wrote, graded blind by another model. Each version ran once, so read it as a rough check, not proof.",
		},
		benchLink: { pt: "ver resultados", en: "see results" },
		levelsTitle: { pt: "níveis", en: "levels" },
		levelsIntro: {
			pt: "Troque o nível com `/clean-code-ai lite|full|ultra|off`.",
			en: "Switch the level with `/clean-code-ai lite|full|ultra|off`.",
		},
		lite: {
			pt: "faz o que foi pedido e cita a alternativa mais simples em uma linha.",
			en: "does what was asked and mentions the simplest alternative in one line.",
		},
		full: {
			pt: "o padrão. Segue a escada e, se a mudança passa de ~50 linhas ou cria arquivo, abstração ou dependência, explica por quê.",
			en: "the default. Follows the ladder and, when a change goes past ~50 lines or adds a file, abstraction or dependency, says why.",
		},
		ultra: {
			pt: "YAGNI extremo. Remove antes de adicionar e questiona o resto do pedido.",
			en: "extreme YAGNI. Removes before adding and questions the rest of the request.",
		},
	},
	demo: {
		tagline: {
			pt: "vídeo de demo curto, com um fluxo só, que termina no resultado.",
			en: "short demo videos that follow one flow and end on the result.",
		},
		before: {
			pt: "antes: 72s, Button, Zod, Dialog e Table sem nada ligando um no outro",
			en: "before: 72s, Button, Zod, Dialog and Table with nothing tying them together",
		},
		after: {
			pt: "depois: 45s, um fluxo: busca → componente → bloco",
			en: "after: 45s, one flow: search → component → block",
		},
		ideaCaption: {
			pt: "O vídeo do cd/ui antes e depois da skill. O antigo pulava de componente em componente sem explicar nenhum. O novo vai do Ctrl K até o bloco pronto e para ali.",
			en: "The cd/ui video before and after the skill. The old one jumped from component to component without explaining any of them. The new one goes from Ctrl K to a finished block and stops there.",
		},
		flowTitle: { pt: "o fluxo", en: "the workflow" },
		flow1: { pt: "descobrir", en: "discover" },
		flow2: { pt: "escolher um fluxo", en: "pick a flow" },
		flow3: { pt: "preparar", en: "prepare" },
		flow4: { pt: "ensaiar no Playwright", en: "rehearse in Playwright" },
		flow5: { pt: "roteiro de takes", en: "shot list" },
		flow6: { pt: "capturar", en: "capture" },
		flow7: { pt: "revisar e integrar", en: "review and integrate" },
		modesTitle: { pt: "modos", en: "modes" },
		script: {
			pt: "o padrão quando o fluxo roda no navegador. A IA captura, edita e revisa.",
			en: "the default when the flow runs in the browser. The AI captures, edits and reviews it.",
		},
		manual: {
			pt: "você grava no Recordly seguindo o roteiro. Serve quando o fluxo usa janela do sistema, como o seletor de arquivo.",
			en: "you record in Recordly from the shot list. For flows that use system windows, like the file picker.",
		},
		numbersTitle: { pt: "em números", en: "in numbers" },
		videos: { pt: "vídeos no portfólio", en: "videos in the portfolio" },
		length: { pt: "de duração", en: "per video" },
		themes: { pt: "temas (escuro e claro)", en: "themes (dark and light)" },
		watch: { pt: "ver os vídeos", en: "watch the videos" },
	},
};
