"use client";

import { track } from "@vercel/analytics";
import { useRef, useState } from "react";
import { sendContactMessage } from "@/app/[locale]/freela/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact";

export type FreelaFormLabels = {
	name: string;
	email: string;
	topic: string;
	message: string;
	namePlaceholder: string;
	emailPlaceholder: string;
	placeholder: string;
	send: string;
	hint: string;
	errName: string;
	errEmail: string;
	errMessage: string;
	sentTitle: string;
	sentText: string;
	errSend: string;
	errRate: string;
	topics: { value: string; label: string }[];
};

/**
 * Formulário baseado no bloco contact-01 do cd/ui. Valida com Zod no cliente, envia pela
 * Server Action `sendContactMessage` (que valida de novo no servidor) e mostra o resultado.
 */
export function FreelaContactForm({ labels }: { labels: FreelaFormLabels }) {
	const schema = contactSchema({
		name: labels.errName,
		email: labels.errEmail,
		message: labels.errMessage,
	});
	const honeypot = useRef<HTMLInputElement>(null);
	const [pending, setPending] = useState(false);
	const [status, setStatus] = useState<"idle" | "sent" | "error" | "rate">(
		"idle",
	);

	if (status === "sent") {
		return (
			<div aria-live="polite" role="status">
				<p className="font-medium">{labels.sentTitle}</p>
				<p className="mt-1 text-muted-foreground text-sm">{labels.sentText}</p>
			</div>
		);
	}

	return (
		<Form
			onSubmit={async (values) => {
				setPending(true);
				setStatus("idle");
				try {
					const result = await sendContactMessage({
						...values,
						company_site: honeypot.current?.value ?? "",
					});
					if (result.ok) {
						track("freela_contact_sent", { kind: values.kind });
						setStatus("sent");
					} else {
						setStatus(result.error === "rate_limited" ? "rate" : "error");
					}
				} catch {
					// falha de rede ou da action: mostra o erro genérico
					setStatus("error");
				} finally {
					setPending(false);
				}
			}}
			schema={schema}
		>
			<input
				aria-hidden="true"
				autoComplete="off"
				className="sr-only"
				name="company_site"
				ref={honeypot}
				tabIndex={-1}
				type="text"
			/>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field name="name">
					<FieldLabel>{labels.name}</FieldLabel>
					<Input autoComplete="name" placeholder={labels.namePlaceholder} />
					<FieldError />
				</Field>
				<Field name="email">
					<FieldLabel>{labels.email}</FieldLabel>
					<Input
						autoComplete="email"
						inputMode="email"
						placeholder={labels.emailPlaceholder}
						type="email"
					/>
					<FieldError />
				</Field>
			</div>
			<Field name="kind">
				<FieldLabel>{labels.topic}</FieldLabel>
				<Select
					defaultValue={labels.topics[0].value}
					items={labels.topics}
					name="kind"
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectPopup>
						{labels.topics.map((topic) => (
							<SelectItem key={topic.value} value={topic.value}>
								{topic.label}
							</SelectItem>
						))}
					</SelectPopup>
				</Select>
			</Field>
			<Field name="message">
				<FieldLabel>{labels.message}</FieldLabel>
				<Textarea className="min-h-32" placeholder={labels.placeholder} />
				<FieldError />
			</Field>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<Button loading={pending} type="submit" variant="brand">
					{labels.send}
				</Button>
				<p className="text-muted-foreground text-xs">{labels.hint}</p>
			</div>
			{(status === "error" || status === "rate") && (
				<p className="text-destructive text-sm" role="alert">
					{status === "rate" ? labels.errRate : labels.errSend}
				</p>
			)}
		</Form>
	);
}
