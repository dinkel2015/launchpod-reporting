"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";

/**
 * Content here is always DB-persisted before render (the editor saves to
 * Supabase, this page reads it back), so there's no in-DOM draft state to
 * commit the way a contentEditable-based editor would need — but we still
 * follow the print lifecycle the spec calls for, in case a future inline-edit
 * mode adds DOM state that does need flushing before print/export.
 */
function commitEditsToDom() {
  document.querySelectorAll<HTMLElement>("[data-dirty]").forEach((el) => {
    el.removeAttribute("data-dirty");
  });
}

function restoreEditingState() {
  // No-op for the read-only client view; kept for parity with the editor's future inline-edit mode.
}

async function inlineStylesheets(): Promise<string> {
  const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  const chunks: string[] = [];

  for (const tag of styleTags) {
    if (tag.tagName === "STYLE") {
      chunks.push(tag.outerHTML);
      continue;
    }
    const href = tag.getAttribute("href");
    if (!href) continue;
    try {
      const res = await fetch(href);
      const css = await res.text();
      chunks.push(`<style>${css}</style>`);
    } catch {
      // If a stylesheet can't be fetched (e.g. cross-origin font CDN), skip it
      // rather than failing the whole export — the HTML content still matters most.
    }
  }

  return chunks.join("\n");
}

async function downloadStandaloneHtml(fileBaseName: string) {
  commitEditsToDom();
  await new Promise((resolve) => setTimeout(resolve, 150));

  const root = document.getElementById("report-root");
  if (!root) return;

  const styles = await inlineStylesheets();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>${document.title}</title>
${styles}
</head>
<body>
${root.outerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(fileBaseName)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

async function saveAsPdf() {
  commitEditsToDom();
  await new Promise((resolve) => setTimeout(resolve, 150));
  window.print();
}

export function ExportBar({ fileBaseName }: { fileBaseName: string }) {
  useEffect(() => {
    window.addEventListener("beforeprint", commitEditsToDom);
    window.addEventListener("afterprint", restoreEditingState);
    return () => {
      window.removeEventListener("beforeprint", commitEditsToDom);
      window.removeEventListener("afterprint", restoreEditingState);
    };
  }, []);

  return (
    <div className="no-print mb-4 flex justify-end gap-2">
      <Button size="sm" variant="secondary" onClick={() => downloadStandaloneHtml(fileBaseName)}>
        Download HTML
      </Button>
      <Button size="sm" onClick={saveAsPdf}>
        Save as PDF
      </Button>
    </div>
  );
}
