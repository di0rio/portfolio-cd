import { initBotId } from "botid/client/core";

// Server Action faz POST na própria URL da página: /freela (pt, reescrito por dentro) e /en/freela.
initBotId({
	protect: [
		{ path: "/freela", method: "POST" },
		{ path: "/en/freela", method: "POST" },
	],
});
