"use client";

import { useCallback, useEffect } from "react";

function cleanFileTitle(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Homepage Preview";
}

export default function SitePreviewPdfActions({
  autoPrint = false,
  pdfTitle = "Homepage Preview",
}: {
  autoPrint?: boolean;
  pdfTitle?: string;
}) {
  const downloadPdf = useCallback(() => {
    const previousTitle = document.title;
    document.title = cleanFileTitle(pdfTitle);

    const restoreTitle = () => {
      document.title = previousTitle;
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

  return null;
}
