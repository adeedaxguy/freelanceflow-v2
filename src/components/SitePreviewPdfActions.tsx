"use client";

import { useCallback, useEffect, useState } from "react";

function cleanFileTitle(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Homepage Preview";
}

async function waitForPageAssets() {
  const pendingImages = Array.from(document.images).filter(image => !image.complete);
  await Promise.all([
    document.fonts?.ready,
    pendingImages.length === 0
      ? Promise.resolve()
      : Promise.race([
        Promise.all(
          pendingImages.map(image => new Promise<void>(resolve => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          })),
        ),
        new Promise<void>(resolve => window.setTimeout(resolve, 2500)),
      ]),
  ]);
}

async function captureHomepage() {
  const root = document.querySelector<HTMLElement>(".site-preview-root");
  if (!root) throw new Error("Homepage preview was not found");

  await waitForPageAssets();
  const { toJpeg } = await import("html-to-image");
  const width = Math.max(root.scrollWidth, root.getBoundingClientRect().width);
  const height = root.scrollHeight;
  const dataUrl = await toJpeg(root, {
    backgroundColor: getComputedStyle(root).backgroundColor || "#ffffff",
    cacheBust: true,
    pixelRatio: Math.min(1.5, Math.max(1, 1440 / width)),
    quality: 0.94,
    width,
    height,
    style: {
      margin: "0",
      maxHeight: "none",
      overflow: "visible",
    },
  });

  return { dataUrl, width, height };
}

function saveDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export default function SitePreviewPdfActions({
  autoPrint = false,
  pdfTitle = "Homepage Preview",
  showActions = false,
}: {
  autoPrint?: boolean;
  pdfTitle?: string;
  showActions?: boolean;
}) {
  const [working, setWorking] = useState<"pdf" | "image" | null>(null);
  const [error, setError] = useState("");
  const filename = cleanFileTitle(pdfTitle);

  const downloadPdf = useCallback(async () => {
    setWorking("pdf");
    setError("");
    try {
      const [{ jsPDF }, capture] = await Promise.all([
        import("jspdf"),
        captureHomepage(),
      ]);
      const pdf = new jsPDF({
        orientation: capture.width > capture.height ? "landscape" : "portrait",
        unit: "px",
        format: [capture.width, capture.height],
        compress: true,
        hotfixes: ["px_scaling"],
      });
      pdf.addImage(capture.dataUrl, "JPEG", 0, 0, capture.width, capture.height, undefined, "FAST");
      pdf.save(`${filename}.pdf`);
    } catch {
      setError("The full-page export could not be created. Please refresh and try again.");
    } finally {
      setWorking(null);
    }
  }, [filename]);

  const downloadImage = useCallback(async () => {
    setWorking("image");
    setError("");
    try {
      const capture = await captureHomepage();
      saveDataUrl(capture.dataUrl, `${filename}.jpg`);
    } catch {
      setError("The homepage image could not be created. Please refresh and try again.");
    } finally {
      setWorking(null);
    }
  }, [filename]);

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(downloadPdf, 600);
    return () => window.clearTimeout(timer);
  }, [autoPrint, downloadPdf]);

  if (!showActions) return null;

  return (
    <div className="site-preview-export-actions fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 print:hidden">
      {error && (
        <p className="max-w-xs rounded-xl bg-red-950 px-3 py-2 text-sm font-semibold text-white shadow-2xl">
          {error}
        </p>
      )}
      <div className="flex gap-2 rounded-2xl border border-white/15 bg-slate-950/90 p-2 shadow-2xl backdrop-blur">
        <button
          type="button"
          onClick={downloadImage}
          disabled={working !== null}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {working === "image" ? "Creating..." : "Full-page JPG"}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={working !== null}
          className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
        >
          {working === "pdf" ? "Creating..." : "One-page PDF"}
        </button>
      </div>
    </div>
  );
}
