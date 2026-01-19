"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/utils/api";
import { Genre } from "@/models/script";

interface GenreDropdownProps {
  onChange?: (selected: Genre[]) => void;
}

export default function GenreDropdown({ onChange }: GenreDropdownProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await api.getGenres();
        //console.log(response);
        setGenres(response.data.data || []);
      } catch (error) {
        console.error("Failed to load genres:", error);
      }
    }
    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    setAllSelected(false);
    setSelectedGenres((prev) => {
      const exists = prev.some((g) => g.id === genre.id);
      const newSelection = exists
        ? prev.filter((g) => g.id !== genre.id)
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
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#22242A] font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <Image src="/menu.png" alt="Menu" width={18} height={18} />
        Genres
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-md p-2 z-50 space-y-1 max-h-96 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
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

          {genres.map((g) => {
            const isSelected = selectedGenres.some((sg) => sg.id === g.id);
            return (
              <label
                key={g.id}
                className={`flex items-center gap-2 text-sm px-2 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
                  isSelected ? "bg-[#F5F5F5] text-[#858990]" : "text-[#333740]"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-[#800000]"
                  checked={isSelected}
                  onChange={() => toggleGenre(g)}
                />
                {g.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
