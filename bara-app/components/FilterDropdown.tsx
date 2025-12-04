"use client";

import { useState } from "react";
import Image from "next/image";

interface FilterDropdownProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function FilterDropdown({
  options,
  selectedValue,
  onValueChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const selectedLabel = options.find(option => option.value === selectedValue)?.label || options[0].label;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm"
      >
        <span>{selectedLabel}</span>
        <Image
          src="/chevron-down.svg"
          alt="dropdown icon"
          width={16}
          height={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-max">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${
                selectedValue === option.value ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}