"use client";

import dynamic from "next/dynamic";

const ScriptPDFViewer = dynamic(() => import("./ScriptPDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-10">
      <p className="text-gray-500">Loading PDF Viewer...</p>
    </div>
  ),
});

interface PDFCanvasProps {
  currentPage: number;
  url?: string;
}

export default function PDFCanvas({ currentPage, url }: PDFCanvasProps) {
  if (!url) {
    return (
      <div className="flex-1 overflow-auto bg-[#F7F7F7] flex justify-center items-center h-full">
        <p className="text-gray-500">
          No script loaded. Please return to the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#F7F7F7] flex justify-center items-start p-10">
      <div className="shadow-lg bg-white">
        <ScriptPDFViewer
          url={url}
          pageNumber={currentPage}
          onLoadSuccess={({ numPages }: { numPages: number }) => {
            console.log(`Loaded ${numPages} pages`);
          }}
        />
      </div>
    </div>
  );
}
