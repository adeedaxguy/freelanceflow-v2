"use client";

import { useCallback, useEffect } from "react";

function cleanFileTitle(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Homepage Preview";
}

async function waitForImages() {
  const pendingImages = Array.from(document.images).filter(image => !image.complete);
  if (pendingImages.length === 0) return;

  await Promise.race([
    Promise.all(
      pendingImages.map(image => new Promise<void>(resolve => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })),
    ),
    new Promise<void>(resolve => window.setTimeout(resolve, 1800)),
  ]);
}

export default function SitePreviewPdfActions({
  autoPrint = false,
  pdfTitle = "Homepage Preview",
}: {
  autoPrint?: boolean;
  pdfTitle?: string;
}) {
  const downloadPdf = useCallback(async () => {
    const previousTitle = document.title;
    document.title = cleanFileTitle(pdfTitle);

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    await waitForImages();
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
