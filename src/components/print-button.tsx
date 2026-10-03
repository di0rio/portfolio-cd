"use client";

import { PrinterIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "print:hidden")}
      data-track="cv_pdf"
      onClick={() => window.print()}
      type="button"
    >
      <PrinterIcon aria-hidden="true" />
      {label}
    </button>
  );
}
