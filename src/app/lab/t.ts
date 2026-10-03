export default {
  title: { pt: "lab", en: "lab" },
  intro: {
    pt: "experimentos de interface: detalhes de interação pequenos, feitos pra sentir na mão. tudo aqui é código de verdade rodando no seu navegador.",
    en: "interface experiments: small interaction details, made to be felt. everything here is real code running in your browser.",
  },
  hold: {
    title: { pt: "segurar pra confirmar", en: "hold to confirm" },
    desc: {
      pt: "ação destrutiva pede intenção: o preenchimento leva 1,6 s enquanto você segura e volta em 200 ms quando solta. funciona com espaço ou enter também.",
      en: "destructive actions need intent: the fill takes 1.6 s while you hold and snaps back in 200 ms when you let go. space or enter work too.",
    },
    label: { pt: "segure pra apagar", en: "hold to delete" },
    done: { pt: "apagado", en: "deleted" },
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
  tabs: {
    title: { pt: "abas com recorte", en: "clip-path tabs" },
    desc: {
      pt: "uma cópia da lista em cor invertida fica por cima, recortada só na aba ativa. a cor troca sem nenhuma aba piscar no meio do caminho.",
      en: "an inverted copy of the list sits on top, clipped to the active tab. the color changes without any tab flickering mid-way.",
    },
    label: { pt: "período", en: "period" },
    day: { pt: "hoje", en: "today" },
    week: { pt: "semana", en: "week" },
    month: { pt: "mês", en: "month" },
    year: { pt: "ano", en: "year" },
  },
  terminal: {
    title: { pt: "terminal", en: "terminal" },
    desc: {
      pt: "navegue pelo site por comandos. sem animação de propósito: o que é feito no teclado precisa ser instantâneo.",
      en: "navigate the site with commands. no animation on purpose: keyboard actions should be instant.",
    },
    label: { pt: "comando", en: "command" },
    placeholder: { pt: "digite help", en: "type help" },
    help: {
      pt: "comandos: help, whoami, ls, cd <lugar>, date, echo <texto>, clear",
      en: "commands: help, whoami, ls, cd <place>, date, echo <text>, clear",
    },
    whoami: { pt: "cauã · desenvolvedor front-end · jaú, sp", en: "cauã · front-end developer · jaú, sp" },
    sudo: { pt: "boa tentativa.", en: "nice try." },
    notFound: { pt: "comando não encontrado: {cmd}", en: "command not found: {cmd}" },
    noDir: { pt: "cd: {dir}: diretório inexistente", en: "cd: {dir}: no such directory" },
  },
  sheet: {
    title: { pt: "gaveta com arraste", en: "draggable sheet" },
    desc: {
      pt: "arraste pra baixo pra fechar. um peteleco rápido fecha mesmo com pouca distância (velocidade > 0,11 px/ms); puxar pra cima resiste, em vez de bater numa parede.",
      en: "drag down to close. a quick flick closes it even over a short distance (velocity > 0.11 px/ms); pulling up resists instead of hitting a wall.",
    },
    open: { pt: "abrir gaveta", en: "open sheet" },
    sheetTitle: { pt: "filtros", en: "filters" },
    body: { pt: "a gaveta segue o dedo 1:1 e volta com a curva de gaveta do iOS.", en: "the sheet follows your finger 1:1 and settles with the iOS drawer curve." },
    close: { pt: "Fechar gaveta", en: "Close sheet" },
    hint: { pt: "arraste pela gaveta ou aperte Esc.", en: "drag the sheet or press Esc." },
  },
  reorder: {
    title: { pt: "lista com FLIP", en: "FLIP reordering" },
    desc: {
      pt: "o layout muda de uma vez; o transform anima a diferença de posição (First, Last, Invert, Play) em 250ms. nada de animar top ou altura.",
      en: "the layout changes at once; a transform animates the position difference (First, Last, Invert, Play) in 250ms. no animating top or height.",
    },
    label: { pt: "Tarefas", en: "Tasks" },
    item1: { pt: "revisar o PR", en: "review the PR" },
    item2: { pt: "escrever os testes", en: "write the tests" },
    item3: { pt: "ajustar o motion", en: "tune the motion" },
    item4: { pt: "fazer o deploy", en: "ship it" },
    up: { pt: "Subir", en: "Move up" },
    down: { pt: "Descer", en: "Move down" },
    shuffle: { pt: "embaralhar", en: "shuffle" },
  },
  compare: {
    title: { pt: "antes e depois", en: "before and after" },
    desc: {
      pt: "o mesmo card duas vezes, o de cima recortado por clip-path. arraste a alça ou use as setas (shift anda mais).",
      en: "the same card twice, the top one cut by clip-path. drag the handle or use the arrow keys (shift moves further).",
    },
    label: { pt: "Comparar antes e depois", en: "Compare before and after" },
    before: { pt: "antes", en: "before" },
    after: { pt: "depois", en: "after" },
    cardTitle: { pt: "relatório mensal", en: "monthly report" },
    cardMeta: { pt: "atualizado há 2 horas", en: "updated 2 hours ago" },
    cardAction: { pt: "abrir", en: "open" },
  },
};
