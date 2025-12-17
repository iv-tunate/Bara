"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { Script } from "@/models/script";
import Pagination from "@/components/Pagination";
import { ScriptGrid } from "@/components/Script";

export default function ScriptsListPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 16;

  const fetchScripts = async (page = currentPage, append = false) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.getAllScripts(page, pageSize);
      if (response.success && response.data) {
        setScripts((prev) =>
          append
            ? [...prev, ...(response.data.data || [])]
            : response.data.data || []
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
    fetchScripts(currentPage);
  }, [currentPage]);

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-10 py-4">
        <h1 className="text-2xl font-bold text-[#22242A] mb-6">All Scripts</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading && scripts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No available scripts at the moment</p>
          </div>
        ) : (
          <>
            <ScriptGrid
              scripts={scripts} // Passing all because pagination is handled by page change replacing list, or appending?
              // The original Dashboard page logic had "append" logic but mostly replaced on page change in useEffect.
              // I'll stick to replacing on page change for standard pagination feeling.
              isLoading={isLoading}
              hasMore={false} // forcing simple pagination for now
              onLoadMore={() => {}}
            />

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
