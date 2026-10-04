import { describe, expect, test } from "bun:test";
import { localePath, stripLocale } from "./path";

describe("localePath", () => {
	test("português fica sem prefixo", () => {
		expect(localePath("pt", "/")).toBe("/");
		expect(localePath("pt", "/blog")).toBe("/blog");
		expect(localePath("pt", "/#projetos")).toBe("/#projetos");
	});

	test("inglês ganha /en", () => {
		expect(localePath("en", "/")).toBe("/en");
		expect(localePath("en", "/blog")).toBe("/en/blog");
	});

	test("âncora na home vira /en#âncora, sem barra", () => {
		expect(localePath("en", "/#projetos")).toBe("/en#projetos");
	});
});

describe("stripLocale", () => {
	test("tira /en e /pt", () => {
		expect(stripLocale("/en/blog")).toBe("/blog");
		expect(stripLocale("/pt/cv")).toBe("/cv");
	});

	test("raiz do idioma vira /", () => {
		expect(stripLocale("/en")).toBe("/");
		expect(stripLocale("/pt")).toBe("/");
	});

	test("não mexe em caminhos que só começam parecido", () => {
		expect(stripLocale("/english")).toBe("/english");
		expect(stripLocale("/blog")).toBe("/blog");
	});
});
