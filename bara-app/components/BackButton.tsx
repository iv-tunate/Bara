"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
  color?: string; 
  hoverColor?: string; 
}

export default function BackButton({
  label = "Back",
  href,
  className = "",
  color = "text-[#800000]",
  hoverColor = "hover:text-[#800000]",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  const isTailwindColor =
    color.startsWith("text-") || color.startsWith("hover:");

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-2 font-medium transition-all duration-200 
                 text-sm md:text-base focus:outline-none ${className} 
                 ${isTailwindColor ? `${color} ${hoverColor}` : ""}`}
      style={!isTailwindColor ? { color } : undefined}
    >
      <ArrowLeft
        size={18}
        className="transition-transform group-hover:-translate-x-1"
      />
      <span>{label}</span>
    </button>
  );
}
