import { beforeEach, describe, expect, test } from "bun:test";
import { getSnapshot, onUnlock, reset, unlock, visit } from "./achievements";

const data = new Map<string, string>();
Object.assign(globalThis, {
	localStorage: {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
	},
});

beforeEach(() => {
	data.clear();
	reset();
});

describe("achievements", () => {
	test("desbloqueia uma vez só e avisa uma vez só", () => {
		const shown: string[] = [];
		const off = onUnlock((id) => shown.push(id));
		expect(unlock("leitor")).toBe(true);
		const date = getSnapshot().leitor;
		expect(unlock("leitor")).toBe(false);
		expect(getSnapshot().leitor).toBe(date);
		expect(shown).toEqual(["leitor"]);
		off();
	});

	test("persiste no armazenamento e ignora lixo", () => {
		unlock("chave");
		expect(JSON.parse(data.get("cd:achievements") ?? "{}")).toHaveProperty(
			"chave",
		);
		data.set("cd:achievements", '{"chave":"2026-01-01","fake":"x"}');
		expect(unlock("chave")).toBe(false);
		expect(Object.keys(getSnapshot())).toEqual(["chave"]);
	});

	test("explorador só depois de visitar todas as seções", () => {
		for (const s of ["blog", "lab", "cv", "freela", "agora", "log"]) visit(s);
		visit("fora-da-lista");
		expect(getSnapshot().explorador).toBeUndefined();
		visit("projetos");
		visit("conquistas");
		expect(getSnapshot().explorador).toBeDefined();
	});

	test("zerar apaga tudo e libera de novo", () => {
		unlock("chave");
		reset();
		expect(getSnapshot()).toEqual({});
		expect(unlock("chave")).toBe(true);
	});
});
