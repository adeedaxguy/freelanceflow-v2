"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

export default function SitePreviewPdfActions({ autoPrint = false }: { autoPrint?: boolean }) {
  const [printing, setPrinting] = useState(false);

  const downloadPdf = useCallback(() => {
    setPrinting(true);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrinting(false), 500);
    }, 50);
  }, []);

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(downloadPdf, 500);
    return () => window.clearTimeout(timer);
  }, [autoPrint, downloadPdf]);

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6 sm:flex-row">
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-black/30 ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        {printing ? <Printer className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {printing ? "Preparing..." : "Download PDF"}
      </button>
    </div>
  );
}
