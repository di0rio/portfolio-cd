import { describe, expect, test } from "bun:test";
import { allowHit } from "./rate-limit";

const MIN = 60_000;

describe("allowHit", () => {
	test("bloqueia depois do máximo dentro da janela", () => {
		const hits = new Map<string, number[]>();
		expect(allowHit(hits, "a", 0, 3, 10 * MIN)).toBe(true);
		expect(allowHit(hits, "a", 1, 3, 10 * MIN)).toBe(true);
		expect(allowHit(hits, "a", 2, 3, 10 * MIN)).toBe(true);
		expect(allowHit(hits, "a", 3, 3, 10 * MIN)).toBe(false);
	});
	test("chaves diferentes não se afetam", () => {
		const hits = new Map<string, number[]>();
		for (let i = 0; i < 3; i++) allowHit(hits, "a", i, 3, 10 * MIN);
		expect(allowHit(hits, "b", 4, 3, 10 * MIN)).toBe(true);
	});
	test("libera de novo quando a janela passa", () => {
		const hits = new Map<string, number[]>();
		for (let i = 0; i < 3; i++) allowHit(hits, "a", i, 3, 10 * MIN);
		expect(allowHit(hits, "a", 10 * MIN + 3, 3, 10 * MIN)).toBe(true);
	});
	test("poda chaves expiradas", () => {
		const hits = new Map<string, number[]>();
		allowHit(hits, "velho", 0, 3, 10 * MIN);
		allowHit(hits, "novo", 11 * MIN, 3, 10 * MIN);
		expect(hits.has("velho")).toBe(false);
	});
});
