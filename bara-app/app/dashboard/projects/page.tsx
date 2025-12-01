"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useState } from "react";
// import { getUserSession } from "@/utils/tokenManager";
// import { usePageGuard } from "@/app/hooks/usepageguard";

export default function ProjectsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Pending");
  //const session = getUserSession();
  // usePageGuard();

  const pendingScripts = [
    {
      id: 1,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 13,
      icon: "/circle-i.svg",
      availability: "available",
    },
    {
      id: 2,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 7,
      icon: "/caution.svg",
      availability: "caution",
    },
    {
      id: 3,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 3,
      icon: "/warning.svg",
      availability: "warning",
    },
  ];

  const purchasedScripts = [
    {
      id: 1,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 13,
      icon: "/purchased-icon.svg",
      status: "Purchased",
    },
    {
      id: 2,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 7,
      icon: "/purchased-icon.svg",
      status: "Purchased",
    },
    {
      id: 3,
      title: "Broken Promise",
      description:
        "A desperate journalist uncovers a hidden AI network controlling world events and must race against time to expose the truth before becoming its next target.",
      genre: "Adventure",
      price: "₦300,000",
      daysLeft: 3,
      icon: "/purchased-icon.svg",
      status: "Purchased",
    },
  ];

  const statusClasses: { [key: string]: string } = {
    available: "bg-[#CCCEEF] border-[#000AAF] text-[#000AAF]",
    caution: "bg-[#FFD9BF] border-[#BF4E00] text-[#BF4E00]",
    warning: "bg-[#FFBFBF] border-[#BF0000] text-[#BF0000]",
    Purchased: "bg-[#C3E8BF] border-[#0DA500] text-[#0DA500]",
  };

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3">My Projects</h1>
          <div className="flex flex-row gap-20">
            <p
              onClick={() => setActiveTab("Pending")}
              className={`cursor-pointer pb-2 ${
                activeTab === "Pending"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-500"
              }`}
            >
              Pending
            </p>
            <p
              onClick={() => setActiveTab("Purchased")}
              className={`cursor-pointer pb-2 ${
                activeTab === "Purchased"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-500"
              }`}
            >
              Purchased
            </p>
          </div>
          <div className="mt-8">
            {activeTab === "Pending" && (
              <div>
                {pendingScripts.map((pendingScript) => (
                  <div
                    key={pendingScript.id}
                    className="border bg-[#F5F5F5] border-[#ABADB2] rounded-md py-2 px-1 md:p-3 flex flex-col md:flex-row md:gap-5 items-start mb-5"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-40 rounded-md overflow-hidden">
                      <Image
                        src="/projectimg.png"
                        alt="script image"
                        layout="fill"
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#FFEDEE] border-1 border-[#810306] text-[#810306] text-xs px-2 py-1 rounded">
                        {pendingScript.genre}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h2 className="text-xl font-semibold">
                        {pendingScript.title}
                      </h2>
                      <p className="text-[#333740] leading-relaxed max-w-xl">
                        {pendingScript.description}
                      </p>
                      <p className="text-gray-800 text-md">
                        {pendingScript.price}
                      </p>
                      <div
                        className={`flex flex-row items-center gap-1 px-1 py-1 rounded-sm text-xs md:w-max border ${
                          statusClasses[pendingScript.availability] ||
                          "bg-neutral-800"
                        }`}
                      >
                        <Image
                          src={pendingScript.icon}
                          alt="calendar icon"
                          width={16}
                          height={16}
                        />
                        <p>
                          You have {pendingScript.daysLeft} days left to confirm
                          or reject script
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <button className="bg-[#810306] text-white w-full md:w-auto px-6 py-1 rounded-sm hover:bg-red-800 mt-4 md:mt-0">
                      Confirm script
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Purchased" && (
              <div>
                {purchasedScripts.map((purchasedScript) => (
                  <div
                    key={purchasedScript.id}
                    className="border bg-[#F5F5F5] border-[#ABADB2] rounded-md py-2 px-1 md:p-3 flex flex-col md:flex-row md:gap-5 items-start mb-5"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-40 rounded-md overflow-hidden">
                      <Image
                        src="/projectimg.png"
                        alt="script image"
                        layout="fill"
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#FFEDEE] border-1 border-[#810306] text-[#810306] text-xs px-2 py-1 rounded">
                        {purchasedScript.genre}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h2 className="text-xl font-semibold">
                        {purchasedScript.title}
                      </h2>
                      <p className="text-[#333740] leading-relaxed max-w-xl">
                        {purchasedScript.description}
                      </p>
                      <p className="text-gray-800 text-md">
                        {purchasedScript.price}
                      </p>
                      <div
                        className={`flex flex-row items-center gap-1 px-1 py-1 rounded-sm text-xs md:w-max border ${
                          statusClasses[purchasedScript.status] ||
                          "bg-neutral-800"
                        }`}
                      >
                        <Image
                          src={purchasedScript.icon}
                          alt="calendar icon"
                          width={12}
                          height={12}
                        />
                        <p>
                          {purchasedScript.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Former Content Here */}
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
