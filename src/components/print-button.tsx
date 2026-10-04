"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label }: { label: string }) {
	return (
		<Button
			className="print:hidden"
			data-track="cv_pdf"
			onClick={() => window.print()}
			size="sm"
			type="button"
			variant="outline"
		>
			<PrinterIcon aria-hidden="true" />
			{label}
		</Button>
	);
}
