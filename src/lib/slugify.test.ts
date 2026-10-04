import { describe, expect, test } from "bun:test";
import { slugify } from "./slugify";

describe("slugify", () => {
	test("minúsculas, espaço vira hífen", () => {
		expect(slugify("Meu Título Aqui")).toBe("meu-título-aqui");
	});

	test("tira pontuação e mantém acentos e hífens", () => {
		expect(slugify("O que é isso? (sério!)")).toBe("o-que-é-isso-sério");
		expect(slugify("pré-requisitos")).toBe("pré-requisitos");
	});

	test("apara bordas e junta espaços repetidos", () => {
		expect(slugify("  a   b  ")).toBe("a-b");
	});

	test("só pontuação vira vazio", () => {
		expect(slugify("?!")).toBe("");
	});
});
