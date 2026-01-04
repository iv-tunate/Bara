"use client";

import ScriptPDFViewer from "./ScriptPDFViewer";

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
          onLoadSuccess={({ numPages }) => {
            console.log(`Loaded ${numPages} pages`);
          }}
        />
      </div>
    </div>
  );
}
