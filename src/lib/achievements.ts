import { sections } from "@/components/site-shell/shell-routes";

/** Definições: o texto (nome, descrição, dica) vive em `app/conquistas/t.ts`, com as mesmas chaves. */
export const achievements = [
	{ id: "curioso", secret: true },
	{ id: "atalhista" },
	{ id: "chave" },
	{ id: "poliglota" },
	{ id: "cobaia" },
	{ id: "bancada" },
	{ id: "firme" },
	{ id: "leitor" },
	{ id: "explorador" },
	{ id: "recado" },
] as const satisfies readonly { id: string; secret?: true }[];

export type AchievementId = (typeof achievements)[number]["id"];

/** id -> data (ISO) em que foi desbloqueada. */
export type Unlocked = Partial<Record<AchievementId, string>>;

const KEY = "cd:achievements";
const VISITED_KEY = "cd:visited";
const known = new Set<string>(achievements.map((a) => a.id));

// Sem conta: "por usuário" é "por navegador". Tudo em localStorage; se ele falhar (modo privado,
// dados bloqueados), o cache em memória segura a sessão e nada quebra.
function load(key: string): unknown {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
}

function save(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// sem armazenamento: vale só nesta sessão
	}
}

function readUnlocked(): Unlocked {
	const raw = load(KEY);
	const out: Unlocked = {};
	if (raw && typeof raw === "object")
		for (const [id, date] of Object.entries(raw))
			if (known.has(id) && typeof date === "string")
				out[id as AchievementId] = date;
	return out;
}

function readVisited(): string[] {
	const raw = load(VISITED_KEY);
	return Array.isArray(raw) ? raw.filter((s) => typeof s === "string") : [];
}

const EMPTY: Unlocked = {};
let cache: Unlocked | undefined;
const listeners = new Set<() => void>();
const popups = new Set<(id: AchievementId) => void>();

const emit = () => {
	for (const l of listeners) l();
};

/** Para `useSyncExternalStore`: também escuta outras abas pelo evento `storage`. */
export function subscribe(listener: () => void) {
	listeners.add(listener);
	const onStorage = (e: StorageEvent) => {
		if (e.key !== KEY && e.key !== null) return;
		cache = readUnlocked();
		listener();
	};
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

export function getSnapshot(): Unlocked {
	cache ??= readUnlocked();
	return cache;
}

export const getServerSnapshot = () => EMPTY;

/** Quem mostra o aviso (o host no layout) se registra aqui; devolve o cancelamento. */
export function onUnlock(fn: (id: AchievementId) => void) {
	popups.add(fn);
	return () => {
		popups.delete(fn);
	};
}

/**
 * Desbloqueia uma conquista. Idempotente: só a primeira vez (por navegador) grava e avisa;
 * depois não faz nada. Relê o armazenamento antes pra duas abas não avisarem a mesma conquista.
 */
export function unlock(id: AchievementId) {
	const current = readUnlocked();
	if (current[id]) {
		cache = current;
		return false;
	}
	cache = { ...current, [id]: new Date().toISOString() };
	save(KEY, cache);
	emit();
	for (const fn of popups) fn(id);
	return true;
}

/** Registra a visita a uma seção do site; ao passar por todas, desbloqueia "explorador". */
export function visit(section: string) {
	if (!Object.hasOwn(sections, section)) return;
	const seen = readVisited();
	if (seen.includes(section)) return;
	seen.push(section);
	save(VISITED_KEY, seen);
	if (Object.keys(sections).every((s) => seen.includes(s)))
		unlock("explorador");
}

export function reset() {
	cache = {};
	save(KEY, cache);
	save(VISITED_KEY, []);
	emit();
}
