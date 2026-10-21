export default {
	title: { pt: "lab", en: "lab" },
	intro: {
		pt: "minha bancada. cada peça aqui é um experimento que você pode mexer, e o código embaixo de cada uma é o painel: arraste os números pra mudar. copie os que gostar.",
		en: "my workbench. every piece here is an experiment you can play with, and the code under each one is the control panel: drag the numbers to change them. copy the ones you like.",
	},
	index: { pt: "peças", en: "pieces" },
	teaches: { pt: "aprende:", en: "teaches:" },
	avatar: {
		title: { pt: "o boneco", en: "the toy" },
		desc: {
			pt: "o desenho que me representa, como brinquedo. ele olha pro seu ponteiro, amassa quando você aperta e estica quando solta.",
			en: "the drawing that stands for me, as a toy. it looks at your pointer, squashes when you press and stretches when you let go.",
		},
		teaches: {
			pt: "uma mola só dá conta de inclinar, seguir e amassar, e como rigidez e amortecimento mudam o jeito do bicho.",
			en: "one spring can tilt, follow and squash, and how stiffness and damping change the creature's mood.",
		},
		label: {
			pt: "avatar do cauã: aperte pra amassar",
			en: "cauã's avatar: press to squash",
		},
	},
	cartoon: {
		title: { pt: "botão de desenho animado", en: "cartoon button" },
		desc: {
			pt: "do meu cd-ui: borda grossa e sombra dura, sem desfoque. ao apertar, o botão afunda na própria sombra e volta com uma curva de mola.",
			en: "from my cd-ui: thick border and a hard shadow, no blur. on press the button sinks into its own shadow and comes back on a spring curve.",
		},
		teaches: {
			pt: "três variáveis de css mudam o clima de tudo, e apertar tem que ser instantâneo enquanto soltar pode ter personalidade.",
			en: "three css variables change the whole mood, and pressing has to be instant while letting go can have personality.",
		},
		label: { pt: "me aperta", en: "press me" },
	},
	instant: {
		title: { pt: "paleta sem espera", en: "no-wait palette" },
		desc: {
			pt: "a paleta (ctrl+k) é um pedaço de código que baixa na primeira vez. aqui a rede é simulada: abra sem pré-carga e veja o esqueleto esperando, depois ligue a pré-carga que o site faz sozinho.",
			en: "the palette (ctrl+k) is a chunk of code that downloads the first time. the network here is simulated: open it with no preload and watch the skeleton wait, then turn on the preload the site does on its own.",
		},
		teaches: {
			pt: "baixar em ociosidade tira a espera do primeiro uso, e atalho de teclado não leva animação nenhuma.",
			en: "downloading while idle removes the wait on first use, and a keyboard shortcut gets no animation at all.",
		},
		preload: { pt: "pré-carga: ligada", en: "preload: on" },
		cold: { pt: "pré-carga: desligada", en: "preload: off" },
		open: { pt: "abrir", en: "open" },
		close: { pt: "fechar", en: "close" },
		search: { pt: "buscar", en: "search" },
		row1: { pt: "projetos", en: "projects" },
		row2: { pt: "blog", en: "blog" },
		row3: { pt: "lab", en: "lab" },
		took: { pt: "abriu em", en: "opened in" },
		idle: { pt: "aperte abrir", en: "press open" },
	},
	achievement: {
		title: { pt: "conquista", en: "achievement" },
		desc: {
			pt: "a que aparece no easter egg do site, fora do esconderijo. o círculo salta, a pílula abre dele, o texto entra, segura e tudo fecha de volta.",
			en: "the one from the site's easter egg, out of its hiding place. the circle pops, the pill opens from it, the text comes in, holds, and everything closes back.",
		},
		teaches: {
			pt: "uma linha do tempo só, com várias peças em offsets diferentes, em vez de vários timeouts brigando entre si.",
			en: "one timeline with several parts at different offsets, instead of several timeouts fighting each other.",
		},
		play: { pt: "tocar", en: "play" },
		replay: { pt: "de novo", en: "again" },
		unlocked: { pt: "conquista desbloqueada", en: "achievement unlocked" },
		name: { pt: "bancada aberta", en: "workbench open" },
	},
	combine: {
		title: { pt: "juntar", en: "snap together" },
		desc: {
			pt: "duas peças soltas: um botão sem graça e o meu avatar. arraste o avatar pra perto do botão e solte. se estiver dentro do raio, ele encaixa e vira um botão de desenho animado. clicar nele faz o avatar pular.",
			en: "two loose pieces: a plain button and my avatar. drag the avatar close to the button and let go. if it's inside the radius it snaps in and becomes a cartoon button. clicking it makes the avatar hop.",
		},
		teaches: {
			pt: "um raio de encaixe generoso e uma mola de volta fazem arrastar parecer imã, e o teclado ganha um botão pra fazer o mesmo.",
			en: "a generous snap radius and a spring make dragging feel magnetic, and keyboard users get a button that does the same.",
		},
		piece: { pt: "só um botão", en: "just a button" },
		merged: { pt: "oi, sou o cauã", en: "hi, i'm cauã" },
		join: { pt: "juntar", en: "join" },
		split: { pt: "separar", en: "split" },
	},
	hold: {
		title: { pt: "segurar pra confirmar", en: "hold to confirm" },
		desc: {
			pt: "ação destrutiva tem que ter intenção: enche em 1,6 s enquanto você segura e volta em 200 ms quando solta. funciona no espaço ou no enter também.",
			en: "destructive actions need intent: the fill takes 1.6 s while you hold and snaps back in 200 ms when you let go. space or enter work too.",
		},
		benchDesc: {
			pt: "segure o botão até encher. mexa no tempo pra sentir de quanto você precisa pra ter certeza. espaço e enter também funcionam.",
			en: "hold the button until it fills. change the time to feel how long you need to be sure. space and enter work too.",
		},
		teaches: {
			pt: "devagar onde a pessoa decide, rápido onde o sistema responde: encher é lento, soltar é 200 ms.",
			en: "slow where the person decides, fast where the system answers: filling is slow, letting go is 200 ms.",
		},
		label: { pt: "segure pra apagar", en: "hold to delete" },
		done: { pt: "apagado", en: "deleted" },
	},
	bench: {
		copy: { pt: "copiar código", en: "copy code" },
		copied: { pt: "copiado", en: "copied" },
		reset: { pt: "voltar pro padrão", en: "back to defaults" },
		hint: {
			pt: "arraste os números, ou foque e use as setas. duplo clique pra digitar.",
			en: "drag the numbers, or focus and use the arrows. double-click to type.",
		},
		play: { pt: "rodar", en: "run" },
	},
	confetti: {
		title: { pt: "confete", en: "confetti" },
		desc: {
			pt: "o confete do cd/ui, o mesmo que sai quando você manda o formulário do freela. o cone tracejado mostra pra onde ele vai. clique no botão ou em qualquer lugar do palco.",
			en: "the cd/ui confetti, the same one that fires when you send the freelance form. the dashed cone shows where it goes. click the button or anywhere on the stage.",
		},
		teaches: {
			pt: "física de verdade (velocidade, ângulo, gravidade) amostrada em 12 pontos e entregue pro WAAPI, sem canvas e sem biblioteca.",
			en: "real physics (speed, angle, gravity) sampled at 12 points and handed to WAAPI, no canvas and no library.",
		},
		label: { pt: "estourar", en: "pop it" },
		hint: { pt: "ou clique em qualquer lugar", en: "or click anywhere" },
	},
	easing: {
		title: { pt: "curva de easing", en: "easing curve" },
		desc: {
			pt: "arraste as bolinhas amarelas do gráfico. a bolinha de cima corre com a sua curva e a de baixo é linear, pra comparar. passar de 1 no eixo y é o que dá o efeito de mola.",
			en: "drag the yellow dots on the graph. the top ball runs on your curve and the bottom one is linear, for comparison. going past 1 on the y axis is what gives the springy overshoot.",
		},
		teaches: {
			pt: "quase tudo na interface pede ease-out: começa rápido e chega devagar, então parece responder na hora.",
			en: "almost everything in an interface wants ease-out: it starts fast and lands slow, so it feels instant.",
		},
	},
	stagger: {
		title: { pt: "cascata", en: "stagger" },
		desc: {
			pt: "uma lista que entra item por item. mexa no atraso e veja o total no comentário do código: ele fica vermelho quando passa do ponto.",
			en: "a list that comes in one item at a time. change the delay and watch the total in the code comment: it turns red when it goes too far.",
		},
		teaches: {
			pt: "cascata é charme até o último item demorar. o tempo total é o que a pessoa sente, não o atraso de cada um.",
			en: "a stagger is charming until the last item takes too long. the total time is what people feel, not the per-item delay.",
		},
	},
	rubber: {
		title: { pt: "elástico", en: "rubber band" },
		desc: {
			pt: "puxe o avatar pra longe. ele segue o dedo com resistência (o círculo tracejado é onde o dedo está) e volta com mola quando solta, levando a velocidade do gesto. no teclado, as setas dão um empurrão.",
			en: "pull the avatar away. it follows your finger with resistance (the dashed circle is where your finger is) and springs back when you let go, keeping the gesture's speed. on the keyboard, the arrows give it a push.",
		},
		teaches: {
			pt: "limite que cede um pouco é melhor que parede: mostra que acabou sem parecer que travou.",
			en: "a limit that gives a little beats a wall: it says you've hit the end without feeling stuck.",
		},
		label: {
			pt: "avatar elástico: arraste ou use as setas",
			en: "rubber avatar: drag it or use the arrows",
		},
	},
	copy: {
		title: { pt: "copiar com troca de ícone", en: "copy with icon swap" },
		desc: {
			pt: "o ícone troca com um leve desfoque, que junta os dois estados num movimento só em vez de dois ícones se sobrepondo.",
			en: "the icon swaps through a slight blur, blending both states into one motion instead of two icons overlapping.",
		},
		label: { pt: "copiar", en: "copy" },
		done: { pt: "copiado", en: "copied" },
	},
	palette: {
		title: { pt: "paleta de comandos", en: "command palette" },
		desc: {
			pt: "essa já tá no site inteiro: aperte o atalho em qualquer página pra buscar páginas, posts e ações.",
			en: "this one is already live site-wide: press the shortcut on any page to search pages, posts and actions.",
		},
		open: { pt: "abrir agora", en: "open now" },
	},
};
