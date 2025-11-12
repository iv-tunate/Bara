"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; 
import Logo from "./Logo";
import CreateAccountDropdown from "./CreateAccountDropdown";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="w-full flex justify-between items-center py-2 px-6 sm:px-8 bg-white relative shadow-sm">
      <Logo />

      <div className="hidden md:flex items-center space-x-10">
        <Link
          href="/auth/login"
          className="text-barRedMain font-medium hover:text-[#1a0000]"
        >
          Log in
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="bg-[#800000] text-white font-medium px-10 py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center cursor-pointer"
          >
            Create account
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 z-50">
              <CreateAccountDropdown onClose={() => setShowDropdown(false)} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowMobileMenu((prev) => !prev)}
        className="md:hidden p-2 text-[#800000] hover:text-[#1a0000] transition-colors"
        aria-label="Toggle menu"
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {showMobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 z-40">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            <Link
              href="/auth/login"
              className="text-barRedMain font-medium hover:text-[#1a0000]"
              onClick={() => setShowMobileMenu(false)}
            >
              Log in
            </Link>

            <div className="relative w-full">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="bg-[#800000] text-white font-medium w-full py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center"
              >
                Create account
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 z-50">
                  <CreateAccountDropdown
                    onClose={() => setShowDropdown(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
