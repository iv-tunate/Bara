"use client";

import Image from "next/image";

interface SidebarProps {
  currentPage: number;
  onSelectPage: (page: number) => void;
}

export default function SidebarThumbnails({
  currentPage,
  onSelectPage,
}: SidebarProps) {
  const pages = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <aside className="w-[120px] border-r border-[#D1D1D6] overflow-y-auto bg-[#333740] p-3">
      {pages.map((page) => {
        const isActive = currentPage === page;

        return (
          <div
            key={page}
            onClick={() => onSelectPage(page)}
            className={`w-full mb-4 cursor-pointer rounded-md overflow-hidden border 
              ${isActive ? "border-[#810306] " : "border-[#C4C4C4]  opacity-60"}
              transition-all duration-200
            `}
          >
            <Image
              src="/A4-paper.png"
              width={100}
              height={140}
              className={`object-cover ${isActive ? "" : "opacity-50"}`}
              alt={`Page ${page}`}
            />

            <p
              className={`text-center text-[12px] mt-1 ${
                isActive
                  ? "bg-[#810306] text-white rounded px-1"
                  : "text-[#858990]"
              }`}
            >
              {page}
            </p>
          </div>
        );
      })}
    </aside>
  );
}
