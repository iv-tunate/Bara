"use client";

import { useState } from "react";
import Image from "next/image";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthDropdown({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Input box */}
      <div
        className={`border border-[#ABADB2] p-2 rounded-md cursor-pointer ${
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
          width={20}
          height={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      {/* Dropdown list */}
      {open && !disabled && (
        <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
          {months.map((m) => (
            <div
              key={m}
              onClick={() => {
                onChange(m);
                setOpen(false);
              }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
            >
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
