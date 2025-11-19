"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
import { PageGaurd } from "@/app/hooks/pageguard";

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
        PageGaurd(session);
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#22242A] mb-2">
            My Projects
          </h1>
          <p className="text-[#666] text-sm">
            Manage your ongoing projects and collaborations
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#22242A] mb-2">
            No projects yet
          </h3>
          <p className="text-[#666] text-center max-w-md mb-6">
            Start collaborating on scripts and managing your projects here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-[#800000] text-white px-6 py-2 rounded-md hover:bg-[#1a0000] transition-colors"
          >
            Explore Scripts
          </button>
        </div>
      </div>
    </main>
  );
}
