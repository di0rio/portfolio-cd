import { afterEach, describe, expect, test } from "bun:test";
import { sendContactMessage } from "../app/[locale]/freela/actions";
import { contactSchema } from "./contact";

const ok = {
	name: " Ana ",
	email: "ana@example.com",
	kind: "ui",
	message: "Preciso de um painel novo para o meu produto.",
};

describe("contactSchema", () => {
	test("aceita entrada válida e aplica trim", () => {
		const r = contactSchema().safeParse(ok);
		expect(r.success && r.data.name).toBe("Ana");
	});
	test("rejeita mensagem curta, e-mail ruim e tipo desconhecido", () => {
		expect(contactSchema().safeParse({ ...ok, message: "curta" }).success).toBe(
			false,
		);
		expect(contactSchema().safeParse({ ...ok, email: "x" }).success).toBe(
			false,
		);
		expect(contactSchema().safeParse({ ...ok, kind: "foo" }).success).toBe(
			false,
		);
	});
});

describe("sendContactMessage", () => {
	const realFetch = globalThis.fetch;
	const env = { ...process.env };
	afterEach(() => {
		globalThis.fetch = realFetch;
		process.env = { ...env };
	});

	test("honeypot preenchido finge sucesso sem chamar a API", async () => {
		let called = false;
		globalThis.fetch = (() => {
			called = true;
			return Promise.resolve(new Response());
		}) as unknown as typeof fetch;
		expect(await sendContactMessage({ ...ok, company_site: "x" })).toEqual({
			ok: true,
		});
		expect(called).toBe(false);
	});
	test("sem chaves devolve unavailable", async () => {
		delete process.env.RESEND_API_KEY;
		delete process.env.CONTACT_EMAIL;
		expect(await sendContactMessage(ok)).toEqual({
			ok: false,
			error: "unavailable",
		});
	});
	test("entrada inválida devolve invalid", async () => {
		expect(await sendContactMessage({ ...ok, message: "x" })).toEqual({
			ok: false,
			error: "invalid",
		});
	});
	test("envia ao Resend com reply_to e assunto sem quebra de linha", async () => {
		process.env.RESEND_API_KEY = "k";
		process.env.CONTACT_EMAIL = "me@example.com";
		let body: Record<string, unknown> = {};
		globalThis.fetch = ((_: unknown, init: RequestInit) => {
			body = JSON.parse(init.body as string);
			return Promise.resolve(new Response("{}", { status: 200 }));
		}) as unknown as typeof fetch;
		expect(await sendContactMessage({ ...ok, name: "A\r\nBcc: x" })).toEqual({
			ok: true,
		});
		expect(body.reply_to).toBe("ana@example.com");
		expect(body.subject).toBe("[freela] ui - A Bcc: x");
	});
	test("não-2xx devolve failed", async () => {
		process.env.RESEND_API_KEY = "k";
		process.env.CONTACT_EMAIL = "me@example.com";
		globalThis.fetch = (() =>
			Promise.resolve(
				new Response("", { status: 500 }),
			)) as unknown as typeof fetch;
		expect(await sendContactMessage(ok)).toEqual({
			ok: false,
			error: "failed",
		});
	});
});
