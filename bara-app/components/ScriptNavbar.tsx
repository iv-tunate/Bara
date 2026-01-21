"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type DividerProps = { className?: string };
const Divider = ({ className = "" }: DividerProps) => (
  <span
    aria-hidden="true"
    className={`h-6 w-px bg-[#ABADB2] mx-4 ${className}`}
  />
);

export default function ScriptNavbar({ title }: { title?: string }) {
  const [tool, setTool] = useState<
    "highlight" | "underline" | "comment" | null
  >(null);

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const totalPages = 50;
  const [zoom, setZoom] = useState(60);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageBlur = () => {
    let v = parseInt(pageInput, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > totalPages) v = totalPages;
    setPage(v);
    setPageInput(String(v));
  };

  const toolButtonClasses = (active: boolean) =>
    `flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors
     ${
       active
         ? "bg-[#FFEDEE] text-[#810306]"
         : "bg-transparent text-[#333740] border-transparent font-semibold"
     }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white px-4 md:px-8 py-2 shadow-md">
      <div className="h-15 px-4 flex items-center">
        {/* Filename */}
        <div className="text-xl font-medium text-[#22242A] ml-10">
          {title || "Untitled.pdf"}
        </div>

        <Divider className="ml-30" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <button className="p-1 rounded">
            <Image
              src="/redo.png"
              alt="Redo"
              width={16}
              height={16}
              className="object-contain"
            />
          </button>
          <button className="p-1 rounded">
            <Image
              src="/undo.png"
              alt="Undo"
              width={16}
              height={16}
              className="object-contain"
            />
          </button>
        </div>

        <Divider />

        {/* Page + Zoom */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#333740] font-semibold">Page</span>
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageBlur}
            onFocus={(e) => e.target.select()}
            min={1}
            max={totalPages}
            className="h-6 w-6 text-center border border-[#ABADB2] rounded outline-none focus:ring-2 focus:ring-gray-200 text-[#22242A] font-medium
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[#22242A]">of</span>
          <span className="text-[#22242A]">{totalPages}</span>

          <Divider />

          <button
            onClick={() => setZoom((z) => Math.max(10, z - 10))}
            className="p-1 rounded text-gray-700"
          >
            <Image
              src="/minus.png"
              alt="Zoom out"
              width={16}
              height={16}
              className="object-contain"
            />
          </button>
          <div className="h-7 flex items-center rounded border border-[#ABADB2] px-2 text-sm text-[#22242A] font-medium">
            {zoom}%
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(500, z + 10))}
            className="p-1 rounded"
          >
            <Image
              src="/plus.png"
              alt="Zoom in"
              width={16}
              height={16}
              className="object-contain"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
