"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import GenreDropdown from "@/components/GenreDropdown";
import { api } from "@/utils/api";
import { getUserSession, getUserId } from "@/utils/tokenManager";
import { useRouter } from "next/navigation";

interface Script {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  price: number;
  currencySymbol: string;
  image?: string;
  writerId: string;
}

export default function DashboardPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const pageSize = 8;

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setUserName(session.name || "User");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchScripts = async () => {
    setIsLoading(true);
    setError("");

    try {
      let response;

      if (searchTerm.trim()) {
        response = await api.searchScripts(searchTerm, currentPage, pageSize);
      } else if (selectedGenres.length > 0) {
        response = await api.getScriptsByGenre(
          selectedGenres[0],
          currentPage,
          pageSize
        );
      } else {
        response = await api.getAllScripts(currentPage, pageSize);
      }
      console.log("API Response:", response);
      if (response.success && response.data) {
        setScripts(response.data || []);
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

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Greeting */}
        <div className="flex items-center gap-2 mt-4">
          <h2 className="text-lg font-bold text-[#22242A]">
            Hello {userName}!
          </h2>
          <Image src="/wave.png" alt="Wave" width={20} height={20} />
        </div>

        {/* Top row with dropdown */}
        <div className="flex items-center justify-between relative">
          <p className="text-sm text-[#22242A]">
            Explore powerful scripts, connect with talented writers.
          </p>

          {/* Genre Dropdown Component */}
          <GenreDropdown onChange={handleGenreChange} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Grid section */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-25">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No scripts found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No scripts match "${searchTerm}"`
                : selectedGenres.length > 0
                ? `No scripts found in ${selectedGenres[0]} genre`
                : "No scripts are currently available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
            {scripts.map((script) => (
              <div
                key={script.id}
                className={`
                group
                relative
                border border-[#ABADB2]
                rounded-md
                bg-white
                shadow-sm
                transition-all duration-300
                overflow-hidden
                h-[360px]
                hover:h-[430px]
                hover:shadow-md hover:bg-[#f9f9f9]
              `}
              >
                {/* Image */}
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

                {/* Content */}
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

                  {/* See More Button */}
                  <Link href={`/dashboard/scripts/${script.id}`}>
                    <button
                      type="button"
                      className={`
                      mt-2 w-full bg-[#800000] text-white py-2 rounded
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity duration-300
                    `}
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
