"use client";

interface PDFCanvasProps {
  currentPage: number;
}

export default function PDFCanvas({ currentPage }: PDFCanvasProps) {
  return (
    <div className="flex-1 overflow-auto bg-[#F7F7F7] flex justify-center items-start p-10">
      <div
        className="w-[750px] h-[1000px] flex items-center justify-center
          border border-[#810306] shadow-lg bg-white text-gray-500 text-xl transition-all duration-200"
      >
        Page {currentPage} {/* reflects focused page */}
      </div>
    </div>
  );
}
