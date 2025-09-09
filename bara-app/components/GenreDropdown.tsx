"use client";

import { useState } from "react";
import Image from "next/image";

interface GenreDropdownProps {
  onChange?: (selected: string[]) => void;
}

export default function GenreDropdown({ onChange }: GenreDropdownProps) {
  const genres = [
    "Drama",
    "Comedy",
    "Thriller",
    "Romance",
    "Horror",
    "Supernatural/folklore",
  ];

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleGenre = (genre: string) => {
    // Turn off "All genres" if you start selecting individually
    setAllSelected(false);

    setSelectedGenres((prev) => {
      const newSelection = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      onChange?.(newSelection);
      return newSelection;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setAllSelected(false);
      setSelectedGenres([]);
      onChange?.([]);
    } else {
      setAllSelected(true);
      setSelectedGenres([]);
      onChange?.([]); 
    }
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-3 rounded-md text-sm text-[#22242A] font-medium cursor-pointer"
      >
        <Image src="/menu.png" alt="Menu" width={20} height={20} />
        Genres
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-md p-2 z-50 space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ALL GENRES */}
          <label
            className={`flex items-center gap-2 text-sm px-2 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
              allSelected ? "bg-[#F5F5F5] text-[#858990]" : "text-[#333740]"
            }`}
          >
            <input
              type="checkbox"
              className="accent-[#800000]"
              checked={allSelected}
              onChange={toggleAll}
            />
            All genres
          </label>

          {/* INDIVIDUAL GENRES */}
          {genres.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <label
                key={g}
                className={`flex items-center gap-2 text-sm px-2 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
                  isSelected ? "bg-[#F5F5F5] text-[#858990]" : "text-[#333740] "
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-[#800000]"
                  checked={isSelected}
                  onChange={() => toggleGenre(g)}
                />
                {g}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
