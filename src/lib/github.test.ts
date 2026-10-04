import { describe, expect, test } from "bun:test";
import { parseFrontmatter } from "./github";

describe("parseFrontmatter", () => {
	test("lê chave: valor e devolve o corpo", () => {
		const { data, body } = parseFrontmatter(
			"---\ntitle: Olá\ndate: 2026-01-02\n---\n# Corpo\n",
		);
		expect(data).toEqual({ title: "Olá", date: "2026-01-02" });
		expect(body).toBe("# Corpo\n");
	});

	test("sem frontmatter devolve o texto intacto", () => {
		const src = "# Só markdown\n";
		expect(parseFrontmatter(src)).toEqual({ data: {}, body: src });
	});

	test("tira aspas simples e duplas, só quando fecham", () => {
		const { data } = parseFrontmatter(
			'---\na: "x"\nb: \'y\'\nc: "z\n---\ncorpo',
		);
		expect(data).toEqual({ a: "x", b: "y", c: '"z' });
	});

	test("aceita CRLF e BOM", () => {
		const { data, body } = parseFrontmatter("﻿---\r\ntitle: A\r\n---\r\ncorpo");
		expect(data).toEqual({ title: "A" });
		expect(body).toBe("corpo");
	});

	test("ignora linhas que não são chave: valor", () => {
		const { data } = parseFrontmatter("---\nlinha solta\nk: v\n---\n");
		expect(data).toEqual({ k: "v" });
	});

	test("valor com dois-pontos fica inteiro", () => {
		const { data } = parseFrontmatter("---\nurl: https://a.dev/x\n---\n");
		expect(data.url).toBe("https://a.dev/x");
	});
});
