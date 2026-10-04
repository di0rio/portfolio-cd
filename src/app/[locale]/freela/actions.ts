"use server";

import { type ContactResult, contactSchema } from "@/lib/contact";

type Payload = {
	name: string;
	email: string;
	kind: string;
	message: string;
	/** Honeypot: humanos não preenchem. */
	company_site?: string;
};

/**
 * Envia a mensagem do formulário /freela pela API do Resend (fetch, sem SDK).
 * Revalida tudo no servidor. Sem domínio verificado, o remetente padrão
 * (onboarding@resend.dev) só entrega para o e-mail dono da conta Resend.
 */
export async function sendContactMessage(
	payload: Payload,
): Promise<ContactResult> {
	if (
		typeof payload?.company_site === "string" &&
		payload.company_site !== ""
	) {
		return { ok: true }; // bot: finge sucesso, não envia
	}

	const parsed = contactSchema().safeParse({
		name: payload?.name,
		email: payload?.email,
		kind: payload?.kind,
		message: payload?.message,
	});
	if (!parsed.success) return { ok: false, error: "invalid" };
	const { name, email, kind, message } = parsed.data;

	const apiKey = process.env.RESEND_API_KEY;
	const to = process.env.CONTACT_EMAIL;
	if (!apiKey || !to) return { ok: false, error: "unavailable" };

	const cleanName = name.replace(/[\r\n]+/g, " ");
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: process.env.CONTACT_FROM || "portfolio <onboarding@resend.dev>",
				to: [to],
				reply_to: email,
				subject: `[freela] ${kind} - ${cleanName}`,
				text: `Nome: ${cleanName}\nE-mail: ${email}\nTipo: ${kind}\n\n${message}`,
			}),
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) {
			console.error("contact: resend respondeu", res.status);
			return { ok: false, error: "failed" };
		}
		return { ok: true };
	} catch (err) {
		console.error("contact: falha de rede", (err as Error).name);
		return { ok: false, error: "failed" };
	}
}
