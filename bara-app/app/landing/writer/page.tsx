"use client";

import { useState } from "react";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import CreateAccountDropdown from "@/components/CreateAccountDropdown";

export default function LandingPage() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <DashboardNavbar />

      <div>
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Hello Jane with wave */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#22242A]">Hello Jane!</h2>
              <Image src="/wave.png" alt="Wave" width={20} height={20} />
            </div>

            {/* Create Account Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="bg-[#800000] text-white font-medium px-6 py-2 rounded-md hover:bg-[#1a0000] transition-colors"
              >
                Create account
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2">
                  <CreateAccountDropdown
                    onClose={() => setShowDropdown(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Paragraph and Categories */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-[#22242A]">
              Explore powerful scripts, connect with talented writers.
            </p>
            <div className="flex items-center gap-2">
              <Image src="/menu.png" alt="Menu" width={20} height={20} />
              <span className="text-sm font-medium text-[#22242A]">
                Categories
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#ABADB2] rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative">
                <Image
                  src="/flowery.png"
                  alt="Script"
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#FFEDEE] text-[#810306] text-xs px-2 py-1 rounded border border-[#810306]">
                  Adventure
                </span>
                <button className="absolute top-3 right-3">
                  <Image src="/save.png" alt="Save" width={20} height={20} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-base font-bold text-[#22242A]">
                  Broken Promise
                </h3>
                <p className="text-sm text-[#333740] leading-snug">
                  A desperate journalist uncovers a hidden AI network
                  controlling world events and must race against time to expose
                  the truth before becoming its next target.
                </p>
                <p className="text-base font-semibold text-[#333740]">
                  ₦300,000.00
                </p>
                <button className="mt-1 w-full bg-[#800000] text-white py-2 rounded hover:bg-[#1a0000] transition-colors duration-300">
                  See more
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
