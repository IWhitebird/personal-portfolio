"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiDownload, FiExternalLink, FiZoomIn, FiZoomOut } from "react-icons/fi";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type Props = {
  src: string;
  downloadName?: string;
  className?: string;
  /** Extra controls rendered at the right end of the toolbar (e.g. a close button). */
  toolbarEnd?: React.ReactNode;
};

const MAX_PAGE_WIDTH = 820;

export function ResumeViewer({ src, downloadName = "Shreyas_Patange_Resume.pdf", className = "", toolbarEnd }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageWidth = containerWidth ? Math.min(containerWidth - 32, MAX_PAGE_WIDTH) * zoom : undefined;

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-3 text-[13px] text-muted">
        <span className="font-mono text-[12px]">{numPages ? `${numPages} page${numPages > 1 ? "s" : ""}` : ""}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} aria-label="Zoom out">
            <FiZoomOut size={16} />
          </button>
          <span className="w-12 text-center font-mono text-[12px] tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" className="icon-btn" onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)))} aria-label="Zoom in">
            <FiZoomIn size={16} />
          </button>
          <span aria-hidden className="mx-1 h-4 w-px bg-line-strong" />
          <a href={src} download={downloadName} className="icon-btn" aria-label="Download PDF">
            <FiDownload size={16} />
          </a>
          <a href={src} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Open PDF in a new tab">
            <FiExternalLink size={16} />
          </a>
          {toolbarEnd}
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-auto bg-surface-2 px-4 py-4">
        <Document
          file={src}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<p className="py-12 text-center text-[13px] text-muted">Loading résumé…</p>}
          error={
            <p className="py-12 text-center text-[13px] text-muted">
              Couldn&apos;t render the PDF here.{" "}
              <a href={src} className="link" target="_blank" rel="noopener noreferrer">
                Open it directly
              </a>
              .
            </p>
          }
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={pageWidth}
              renderTextLayer
              renderAnnotationLayer
              className="mx-auto mb-4 w-fit shadow-panel"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
