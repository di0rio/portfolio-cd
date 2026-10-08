// Texto entre crases vira código mono na página (ver `Rich`).
export default {
	title: { pt: "skills", en: "skills" },
	intro: {
		pt: "Regras que eu escrevi pra agentes de IA (Claude Code, Codex, Cursor) trabalharem do jeito que eu trabalho. Cada uma é um arquivo SKILL.md, em português e inglês, e são de graça.",
		en: "Rules I wrote so AI agents (Claude Code, Codex, Cursor) work the way I do. Each one is a SKILL.md file, in Portuguese and English, and they're free.",
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
			pt: "Mesmo comportamento, sem abstração pra um uso só. Menor não quer dizer menos seguro: validação, erro e acessibilidade nunca saem.",
			en: "Same behavior, no abstraction for a single use. Smaller doesn't mean less safe: validation, errors and accessibility never go.",
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
		step7: { pt: "umas poucas linhas", en: "a few lines" },
		step8: {
			pt: "abstração, só com 2+ usos reais ou fronteira externa",
			en: "abstraction, only with 2+ real uses or an external boundary",
		},
		step9: { pt: "dependência nova", en: "a new dependency" },
		step10: { pt: "infraestrutura nova", en: "new infrastructure" },
		benchTitle: { pt: "teste", en: "benchmark" },
		benchNone: { pt: "sem regras", en: "no rules" },
		benchCaption: {
			pt: "5 tarefas pequenas, avaliadas às cegas por outro modelo. É um teste rápido, não prova.",
			en: "5 small tasks, graded blind by another model. A quick test, not proof.",
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
			pt: "padrão: aplica a escada e o critério de parada.",
			en: "default: applies the ladder and the stopping rule.",
		},
		ultra: {
			pt: "YAGNI extremo: remove antes de adicionar e questiona o resto do pedido.",
			en: "extreme YAGNI: removes before adding and questions the rest of the request.",
		},
	},
	demo: {
		tagline: {
			pt: "vídeo de demo que mostra o produto, não um tour pela tela.",
			en: "demo videos that show the product, not a screen tour.",
		},
		before: {
			pt: "antes: 72s, tour por 4 componentes sem fio",
			en: "before: 72s, a tour of 4 unrelated components",
		},
		after: {
			pt: "depois: 45s, um fluxo: busca → componente → bloco",
			en: "after: 45s, one flow: search → component → block",
		},
		ideaCaption: {
			pt: "Exemplo do vídeo do cd/ui. A IA escolhe um fluxo, ensaia no navegador, captura por script (ou te passa o roteiro pra gravar no Recordly) e revisa o vídeo quadro a quadro.",
			en: "Example from the cd/ui video. The AI picks a flow, rehearses in the browser, captures by script (or hands you the shot list to record in Recordly) and reviews the video frame by frame.",
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
			pt: "padrão quando o fluxo roda no navegador.",
			en: "default when the flow runs in the browser.",
		},
		manual: {
			pt: "Recordly, pra UI nativa do sistema ou ritmo feito à mão.",
			en: "Recordly, for native system UI or a hand-made pace.",
		},
		numbersTitle: { pt: "em números", en: "in numbers" },
		videos: { pt: "vídeos no portfólio", en: "videos in the portfolio" },
		length: { pt: "de duração", en: "per video" },
		themes: { pt: "temas (escuro e claro)", en: "themes (dark and light)" },
		watch: { pt: "ver os vídeos", en: "watch the videos" },
	},
};
