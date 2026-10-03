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
};
