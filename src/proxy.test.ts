import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const run = (path: string) =>
	proxy(new NextRequest(`http://localhost:3000${path}`));
const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("proxy", () => {
	test("português na raiz é reescrito pra /pt sem mudar a URL", () => {
		expect(rewrite(run("/"))).toBe("http://localhost:3000/pt");
		expect(rewrite(run("/blog"))).toBe("http://localhost:3000/pt/blog");
	});

	test("mantém a query na reescrita", () => {
		expect(rewrite(run("/blog?x=1"))).toBe("http://localhost:3000/pt/blog?x=1");
	});

	test("/en passa direto", () => {
		for (const path of ["/en", "/en/blog"]) {
			const res = run(path);
			expect(rewrite(res)).toBeNull();
			expect(res.status).toBe(200);
		}
	});

	test("/pt redireciona (308) pra URL sem prefixo", () => {
		const res = run("/pt/blog");
		expect(res.status).toBe(308);
		expect(res.headers.get("location")).toBe("http://localhost:3000/blog");
		expect(run("/pt").headers.get("location")).toBe("http://localhost:3000/");
	});

	test("/english não conta como /en", () => {
		expect(rewrite(run("/english"))).toBe("http://localhost:3000/pt/english");
	});
});
