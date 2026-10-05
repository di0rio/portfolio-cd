import { z } from "zod";

export const CONTACT_KINDS = ["ui", "landing", "ds", "api", "other"] as const;

export type ContactMessages = {
	name: string;
	email: string;
	message: string;
};

/**
 * Schema único do formulário de contato, usado no cliente (com textos traduzidos) e
 * no servidor (textos padrão; o servidor nunca confia no que veio do navegador).
 */
export function contactSchema(
	m: ContactMessages = {
		name: "invalid name",
		email: "invalid email",
		message: "invalid message",
	},
) {
	return z.object({
		name: z.string().trim().min(1, m.name).max(100, m.name),
		email: z.string().trim().max(254, m.email).pipe(z.email(m.email)),
		kind: z.enum(CONTACT_KINDS),
		message: z.string().trim().min(20, m.message).max(5000, m.message),
	});
}

export type ContactInput = z.infer<ReturnType<typeof contactSchema>>;

export type ContactResult =
	| { ok: true }
	| { ok: false; error: "invalid" | "unavailable" | "failed" | "rate_limited" };
