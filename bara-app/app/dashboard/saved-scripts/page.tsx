"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";

export default function SavedScriptsPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#22242A] mb-2">
            Saved Scripts
          </h1>
          <p className="text-[#666] text-sm">
            Your collection of saved scripts for easy access
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#22242A] mb-2">
            No saved scripts yet
          </h3>
          <p className="text-[#666] text-center max-w-md mb-6">
            Start exploring scripts and save your favorites to access them
            quickly later.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-[#800000] text-white px-6 py-2 rounded-md hover:bg-[#1a0000] transition-colors"
          >
            Browse Scripts
          </button>
        </div>
      </div>
    </main>
  );
}
