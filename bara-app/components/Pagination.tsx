import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <button
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        className={`px-4 py-2 rounded border ${
          canPrev
            ? "bg-white border-[#ABADB2] text-[#22242A] hover:bg-gray-100"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Prev
      </button>

      <span className="text-sm text-[#22242A] font-medium">
        {currentPage} / {totalPages}
      </span>

      <button
        disabled={!canNext}
        onClick={() => canNext && onPageChange(currentPage + 1)}
        className={`px-4 py-2 rounded border ${
          canNext
            ? "bg-white border-[#ABADB2] text-[#22242A] hover:bg-gray-100"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}
