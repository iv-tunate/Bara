"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface Props {
  onClose: () => void;
}

export default function CreateAccountDropdown({ onClose }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="
        w-72
        bg-white
        shadow-lg
        rounded-md
        border border-gray-200
        p-4
        z-50
      "
    >
      <Link
        href="/auth/register?type=Producer"
        onClick={() => setTimeout(onClose, 100)}
        className="block p-3 hover:bg-[#F5F5F5] rounded-md cursor-pointer [font-family:var(--font-lato)] transition-colors"
      >
        <h3 className="font-bold text-[#22242A]">I am a Producer</h3>
        <p className="text-sm text-[#333740]">
          I want to discover original scripts and hire talented writers to bring
          my ideas to life.
        </p>
      </Link>
      <hr className="my-2 mx-4 border border-[#ABADB2]" />
      <Link
        href="/auth/register?type=Writer"
        onClick={onClose}
        className="block p-3 hover:bg-[#F5F5F5] rounded-md cursor-pointer transition-colors"
      >
        <h3 className="font-bold text-[#22242A]">I am a Writer</h3>
        <p className="text-sm text-[#333740]">
          I want to sell my scripts and get hired for story development.
        </p>
      </Link>
    </div>
  );
}
