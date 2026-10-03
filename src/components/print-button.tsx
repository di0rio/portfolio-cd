"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label }: { label: string }) {
  return (
    <Button
      className="transition-[box-shadow,transform] duration-100 ease-out motion-safe:active:scale-[0.98] print:hidden"
      data-track="cv_pdf"
      onClick={() => window.print()}
      size="sm"
      variant="outline"
    >
      <PrinterIcon aria-hidden="true" />
      {label}
    </Button>
  );
}
