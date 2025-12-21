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

// Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 4 pages if current page is in the first 4
      if (currentPage <= 4) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page, but limit to 4 total
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        // If we have less than 4 pages, adjust from the beginning
        if (pages.length < maxVisiblePages) {
          const neededPages = maxVisiblePages - pages.length;
          for (let i = pages[0] - 1; i >= 1 && neededPages > 0; i--) {
            pages.unshift(i);
          }
        }
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
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

      {getPageNumbers().map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-3 py-2 rounded border ${
            currentPage === pageNumber
              ? "bg-[#810306] text-white border-[#810306]"
              : "bg-white border-[#ABADB2] text-[#22242A] hover:bg-gray-100"
          }`}
        >
          {pageNumber}
        </button>
      ))}

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
