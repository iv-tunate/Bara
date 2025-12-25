"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";

export default function ProfileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (!session) return;

    setRole(session.userType);

    const validateSession = async () => {
      let response: any = null;

      if (session.userType === "Writer") {
        response = await api.getWriterProfile(session.userId);
      } else if (session.userType === "Producer") {
        response = await api.getProducerProfile(session.userId);
      }

      if (
        response &&
        !response.success &&
        (response.statusCode === 404 || response.statusCode === 401)
      ) {
        clearUserSession();
        window.location.href = "/auth/login";
      }
    };

    validateSession();
  }, []);

  const handleProfileSetup = () => {
    if (role) {
      router.push(`/profile/setup/${role.toLowerCase()}`);
    }
  };

  return (
    <nav className="w-full flex justify-between items-center py-4 px-6 sm:px-8 bg-white relative shadow-sm">
      <Logo />

      {/* Desktop View */}
      <div className="hidden md:flex items-center space-x-10">
        <button
          onClick={handleProfileSetup}
          className="bg-[#800000] text-white font-medium px-10 py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center"
        >
          Complete Profile
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu((prev) => !prev)}
        className="md:hidden p-2 text-[#800000] hover:text-[#1a0000] transition-colors"
        aria-label="Toggle menu"
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 z-40">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                handleProfileSetup();
              }}
              className="bg-[#800000] text-white font-medium w-full py-3 rounded-md hover:bg-[#1a0000] transition-colors text-center"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
