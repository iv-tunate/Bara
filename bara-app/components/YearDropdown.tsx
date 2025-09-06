"use client";

import { useState } from "react";
import Image from "next/image";

// Generate years dynamically: from 1975 up to current year
const years = Array.from(
  { length: new Date().getFullYear() - 1975 + 1 },
  (_, i) => `${1975 + i}`
);

interface YearDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function YearDropdown({
  value,
  onChange,
  placeholder,
  disabled = false,
}: YearDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (year: string) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Display box */}
      <div
        className={`border border-[#ABADB2] p-2 rounded-md cursor-pointer flex justify-between items-center ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span
          className={`text-sm ${value ? "text-[#22242A]" : "text-[#9CA3AF]"}`}
        >
          {value || placeholder}
        </span>
        <Image
          src="/dropdown.png"
          alt="dropdown"
          width={16}
          height={16}
          className="pointer-events-none"
        />
      </div>

      {/* Dropdown list */}
      {open && !disabled && (
        <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {years.map((y) => (
            <div
              key={y}
              onClick={() => handleSelect(y)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
            >
              {y}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
