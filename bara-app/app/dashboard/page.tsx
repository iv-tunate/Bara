"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import GenreDropdown from "@/components/GenreDropdown";
import CreateAccountDropdown from "@/components/CreateAccountDropdown";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { Script, Genre } from "@/models/script";
import Navbar from "@/components/Navbar";
import CompleteProfileNav from "@/components/CompleteProfileNav";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { ScriptGrid } from "@/components/Script";
import { useVerificationRecovery } from "@/app/hooks/useVerificationRecovery";
import toast from "react-hot-toast";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardPage() {
  useVerificationRecovery();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [role, setRole] = useState<string>("Guest");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [profileState, setProfileState] = useState(false);

  const pageSize = 16;

  useEffect(() => {
    const session = getUserSession();
    debugger;
    //  console.log("Session Details", session);
    if (session && !session.profileComplete) {
      setUserName(session.name);
      setRole(session.userType);
      setProfileState(false);
      return;
    } else if (!session) {
      setUserName("Guest");
      setRole("Guest");
      return;
    }
    setUserName(session.name);
    setRole(session.userType.toLowerCase());
    setProfileState(true);
  }, []);

  const fetchScripts = async (page = currentPage, append = false) => {
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (searchTerm.trim()) {
        response = await api.searchScripts(searchTerm, page, pageSize);
      } else if (selectedGenres.length > 0) {
        response = await api.getScriptsByGenre(
          selectedGenres[0].id,
          page,
          pageSize,
        );
      } else {
        response = await api.getAllScripts(page, pageSize);
      }

      if (response.success && response.data) {
        setScripts((prev) =>
          append
            ? [...prev, ...(response.data.data || [])]
            : response.data.data || [],
        );
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || "Failed to load scripts");
        if (!append) setScripts([]);
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred");
      if (!append) setScripts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, [currentPage, selectedGenres, searchTerm]);

  const handleGenreChange = (genres: Genre[]) => {
    setSelectedGenres(genres);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-white ">
      {role === "Guest" ? (
        <Navbar />
      ) : profileState === false ? (
        <CompleteProfileNav />
      ) : (
        <DashboardNavbar />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Greeting Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-1xl md:text-2xl font-extrabold text-[#22242A] tracking-tight">
                Hello, {userName}
              </h1>
              <div className="animate-bounce-subtle">
                <Image
                  src="/wave.png"
                  alt="Wave"
                  width={28}
                  height={28}
                  priority
                />
              </div>
            </div>
            <p className="text-sm text-[#666B75] max-w-md">
              {role === "writer"
                ? "Your creative space to upload scripts and inspire the world."
                : "Discover powerful stories and connect with talented writers."}
            </p>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {role === "writer" && profileState === true && (
              <Link href="/writer/add-script">
                <button
                  type="button"
                  className="bg-[#800000] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[#1a0000] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm md:text-base"
                >
                  <span className="text-lg">+</span> Add Script
                </button>
              </Link>
            )}

            <div className="bg-white border border-[#E5E7EB] rounded-full px-1 shadow-sm hover:shadow-md transition-shadow">
              <GenreDropdown />
            </div>
          </div>
        </div>
        {role === "writer" && (
          <section className="relative bg-[#F2F0E4] rounded-lg p-6 md:p-8 my-8 overflow-hidden border border-[#ABADB2]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-[#444955] hover:bg-white/50 z-10 cursor-pointer"
            >
              <Image
                src="/cancel-icon.png"
                alt="Close"
                width={16}
                height={16}
              />
            </Button>

            <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10">
              <div className="flex-1 flex flex-col justify-center max-w-xl z-10">
                <h2 className="text-xl md:text-2xl font-semibold text-[#000000] mb-4">
                  Want More Producers to Discover Your Work?
                </h2>
                <p className="text-[#000000] text-sm md:text-base leading-relaxed mb-6 ">
                  With Bara Premium, your work gets priority placement in
                  producer searches, increased visibility by genre, and access
                  to valuable insights like script views and engagement.
                </p>
                <Button
                  className="bg-[#810306] text-white px-6 py-2 w-fit"
                  onClick={() =>
                    toastify.info("Coming Soon", { position: "top-right" })
                  }
                >
                  Get Bara Premium
                </Button>
              </div>

              <div className="flex-1 relative">
                <img
                  src="/writerdashboard.png"
                  alt="Writers and producers collaborating"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
      <section className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {isLoading && scripts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              {searchTerm
                ? `No scripts match "${searchTerm}"`
                : selectedGenres.length > 0
                  ? `No scripts found in ${selectedGenres
                      .map((g) => g.name)
                      .join(", ")
                      .replace(/, ([^,]*)$/, " and $1")} genre${
                      selectedGenres.length > 1 ? "s" : ""
                    }`
                  : "No available scripts at the moment"}
            </p>
          </div>
        ) : (
          <>
            <ScriptGrid
              scripts={scripts.slice(0, 36)}
              isLoading={isLoading}
              hasMore={currentPage < totalPages && scripts.length < 36}
              onLoadMore={async () => {
                setIsLoading(true);
                await fetchScripts(currentPage + 1, true);
                setCurrentPage((p) => p + 1);
                setIsLoading(false);
              }}
            />

            {scripts.length > 36 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
