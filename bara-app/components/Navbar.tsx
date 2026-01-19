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
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-gray-500 text-sm font-medium hover:text-barRedMain transition-colors"
          >
            Terms & Conditions
          </Link>

          <span className="w-px h-4 bg-gray-200" aria-hidden="true" />

          <Link
            href="/auth/login"
            className="text-barRedMain font-semibold hover:text-[#5a0000] transition-colors"
          >
            Log in
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="bg-[#800000] text-white font-medium px-10 py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center cursor-pointer shadow-sm"
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
              className="text-barRedMain font-semibold hover:text-[#5a0000] py-2 text-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Log in
            </Link>

            <Link
              href="/terms"
              className="text-gray-500 font-medium hover:text-barRedMain py-2 text-sm transition-colors border-t border-gray-100 w-full"
              onClick={() => setShowMobileMenu(false)}
            >
              Terms & Conditions
            </Link>

            <div className="relative w-full pt-2">
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
