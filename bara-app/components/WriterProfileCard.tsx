"use client";

import Image from "next/image";
import { useState } from "react";

interface WriterProfileCardProps {
  name: string;
  bio: string;
  profileImage: string;
  portfolioLink: string;
  onViewProfile?: () => void;
}

export default function WriterProfileCard({
  name,
  bio,
  profileImage,
  portfolioLink,
  onViewProfile,
}: WriterProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="bg-white border border-[#ABADB2] rounded-lg p-4 w-[300px] mx-auto space-y-3">
      {/* Title */}
      <h3 className="font-semibold text-lg text-[#22242A] text-center">
        Writer's profile
      </h3>

      {/* Profile Image */}
      <div className="flex justify-center">
        <img
          src={profileImage}
          alt={name}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
      </div>

      {/* Name and Bio */}
      <div className="p-1 space-y-2">
        <h4 className="font-bold text-[20px] text-[#22242A]">{name}</h4>
        <p className="text-sm text-[#333740] max-w-[250px] leading-snug">
          {bio}
        </p>
      </div>

      {/* Portfolio */}
      <div className="p-1 space-y-2">
        <h2 className="font-semibold text-[15px] text-[#22242A]">Portfolio</h2>

        <div className="flex items-center justify-start space-x-2">
          <a
            href={portfolioLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#000AAF] underline border border-[#ABADB2] px-4 py-3 rounded-md whitespace-nowrap"
          >
            {portfolioLink.replace(/^https?:\/\//, "")}
          </a>

          {/* Copy Button */}
          <div className="relative shrink-0">
            <button
              onClick={handleCopy}
              className="border border-[#ABADB2] p-3 rounded-md flex items-center justify-center hover:bg-gray-50"
              aria-label="Copy portfolio link"
            >
              <Image src="/Copy.png" alt="Copy" width={16} height={16} />
            </button>
            {copied && (
              <span className="absolute left-1/2 -translate-x-1/2 mt-1 text-xs whitespace-nowrap text-[#0DA500]">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        onClick={onViewProfile}
        className="w-full border border-[#810306] text-[#810306] text-sm font-medium mt-2 py-2 rounded-md hover:bg-[#fff5f5] transition"
      >
        View profile
      </button>
    </div>
  );
}
