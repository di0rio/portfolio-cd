import { describe, expect, test } from "bun:test";
import { readingTime } from "./reading-time";

const words = (n: number) =>
	Array.from({ length: n }, () => "palavra").join(" ");

describe("readingTime", () => {
	test("texto curto ou vazio vale 1 minuto", () => {
		expect(readingTime("", "en")).toBe("1 min");
		expect(readingTime(words(10), "en")).toBe("1 min");
	});

	test("200 palavras por minuto, arredondando pra cima", () => {
		expect(readingTime(words(200), "en")).toBe("1 min");
		expect(readingTime(words(201), "en")).toBe("2 min");
		expect(readingTime(words(1000), "en")).toBe("5 min");
	});

	test("formata no idioma da página", () => {
		expect(readingTime(words(400), "pt-BR")).toBe("2 min");
	});
});
