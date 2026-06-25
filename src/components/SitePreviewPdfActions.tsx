"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

function cleanFileTitle(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Homepage Website Concept";
}

export default function SitePreviewPdfActions({
  autoPrint = false,
  pdfTitle = "Homepage Website Concept",
}: {
  autoPrint?: boolean;
  pdfTitle?: string;
}) {
  const [printing, setPrinting] = useState(false);

  const downloadPdf = useCallback(() => {
    setPrinting(true);
    const previousTitle = document.title;
    document.title = cleanFileTitle(pdfTitle);

    const restoreTitle = () => {
      document.title = previousTitle;
      setPrinting(false);
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(restoreTitle, 1200);
    }, 120);
  }, [pdfTitle]);

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(downloadPdf, 500);
    return () => window.clearTimeout(timer);
  }, [autoPrint, downloadPdf]);

  return (
    <div className="no-print fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:flex-row">
      <button
        type="button"
        onClick={downloadPdf}
        aria-label="Download the complete homepage concept as a PDF"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-black/30 ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        {printing ? <Printer className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {printing ? "Preparing..." : "Download full homepage PDF"}
      </button>
    </div>
  );
}
