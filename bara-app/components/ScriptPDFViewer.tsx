"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useState } from "react";

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
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth - 100, 800));
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center">
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
