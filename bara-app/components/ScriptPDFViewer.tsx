"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useState, useRef } from "react";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface ScriptPDFViewerProps {
  url: string;
  pageNumber: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export default function ScriptPDFViewer({
  url,
  pageNumber,
  onLoadSuccess,
}: ScriptPDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        // Add a slight padding/margin reduction if necessary, but 100% width is fine
        setWidth(entries[0].contentRect.width);
      }
    });

    resizeObserver.observe(container);
    setWidth(container.clientWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <Document file={url} onLoadSuccess={onLoadSuccess} className="max-w-full">
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
    </div>
  );
}
