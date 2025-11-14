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

export default function DashboardPage() {
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
  const router = useRouter();
  const pageSize = 8;

  useEffect(() => {
    const session = getUserSession();
    console.log("Session Details", session);
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
    setRole(session.userType);
    setProfileState(true);
 
  }, []);

  const fetchScripts = async () => {
    setIsLoading(true);
    setError("");

    try {
      let response;

      if (searchTerm.trim()) {
        response = await api.searchScripts(searchTerm, currentPage, pageSize);
      } else if (selectedGenres.length > 0) {
        response = await api.getScriptsByGenre(
          selectedGenres[0].id,
          currentPage,
          pageSize
        );
      } else {
        response = await api.getAllScripts(currentPage, pageSize);
      }

      if (response.success && response.data) {
        setScripts(response.data.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || "Failed to load scripts");
        setScripts([]);
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      setError("An unexpected error occurred");
      setScripts([]);
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

      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-10 py-4">
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#22242A]">
              Hello {userName}
            </h2>
            <Image src="/wave.png" alt="Wave" width={20} height={20} />
          </div>

          <div className="flex items-center gap-3">
            {role === "writer" && profileState === true && (
              <Link href="/writer/add-script">
                <button
                  type="button"
                  className="bg-[#800000] text-white font-medium px-6 py-2 rounded-md hover:bg-[#1a0000] transition-colors"
                >
                  + Add Script
                </button>
              </Link>
            )}

            <GenreDropdown onChange={handleGenreChange} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-[#22242A]">
            {role === "writer"
              ? "Share your creativity, upload your scripts, and inspire the world."
              : "Explore powerful scripts, connect with talented writers."}
          </p>

          {/* {role === "Writer" && (
            <div className="flex items-center gap-2">
              <Image src="/menu.png" alt="Menu" width={20} height={20} />
              <span className="text-sm font-medium text-[#22242A]">
                Categories
              </span>
            </div>
          )} */}
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
                <Button className="bg-[#810306] text-white px-6 py-2 w-fit">
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
        {isLoading ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
            {scripts.map((script) => (
              <div
                key={script.id}
                className={`group relative border border-[#ABADB2] rounded-md bg-white shadow-sm transition-all duration-300 overflow-hidden h-[360px] hover:h-[430px] hover:shadow-md hover:bg-[#f9f9f9]`}
              >
                <div className="relative">
                  <Image
                    src={script.image || "/flowery.png"}
                    alt={script.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#FFEDEE] text-[#810306] text-xs px-2 py-1 rounded border border-[#810306]">
                    {script.genre}
                  </span>
                  <button
                    type="button"
                    className="absolute top-3 right-3"
                    title="Save script"
                  >
                    <Image src="/save.png" alt="Save" width={20} height={20} />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-base font-bold text-[#22242A]">
                    {script.title}
                  </h3>
                  <p className="text-sm text-[#333740] leading-snug">
                    {script.synopsis}
                  </p>
                  <p className="text-base font-semibold text-[#333740]">
                    {script.currencySymbol}
                    {script.price.toLocaleString()}
                  </p>

                  <Link href={`/dashboard/scripts/${script.id}`}>
                    <button
                      type="button"
                      className="mt-2 w-full bg-[#800000] text-white py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      See more
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
