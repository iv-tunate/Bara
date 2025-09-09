/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/DashboardNavbar";
import GenreDropdown from "@/components/GenreDropdown";

export default function WriterDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Writer");

  useEffect(() => {
    setUserName("Writer");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Navbar */}
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl font-semibold text-[#22242a] mb-1 flex items-center gap-2">
              Hello {userName}!{" "}
              <Image src="/wave.png" alt="Wave" width={20} height={20} />
            </h1>
            <p className="text-sm md:text-base font-normal text-[#22242A] max-w-md md:max-w-lg">
              Showcase powerful stories, connect with producers, and get your
              scripts seen, valued, and sold.
            </p>
          </div>

          <GenreDropdown
            onChange={(selected) => console.log("Selected:", selected)}
          />
        </header>

        {/* Premium Banner */}
        <section className="relative bg-[#F2F0E4] rounded-lg p-6 md:p-8 my-8 overflow-hidden border border-[#ABADB2]">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-[#444955] hover:bg-white/50 z-10 cursor-pointer"
          >
            <Image src="/cancel-icon.png" alt="Close" width={16} height={16} />
          </Button>

          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10">
            <div className="flex-1 flex flex-col justify-center max-w-xl z-10">
              <h2 className="text-xl md:text-2xl font-semibold text-[#000000] mb-4">
                Want More Producers to Discover Your Work?
              </h2>
              <p className="text-[#000000] text-sm md:text-base leading-relaxed mb-6 ">
                With Bara Premium, your work gets priority placement in producer
                searches, increased visibility by genre, and access to valuable
                insights like script views and engagement.
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

        {/* Scripts Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                tabIndex={0}
                className="border border-[#ABADB2] rounded-md overflow-hidden bg-white shadow-sm transition-all duration-300 
                           hover:shadow-lg focus:shadow-lg 
                           hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] 
                           h-[360px] hover:h-[420px] focus:h-[420px]"
              >
                <div className="relative">
                  <Image
                    src="/flowery.png"
                    alt="Script"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#FFEDEE] text-[#810306] text-xs px-2 py-1 rounded border border-[#810306]">
                    Adventure
                  </span>
                  <button className="absolute top-3 right-3">
                    <Image src="/save.png" alt="Save" width={20} height={20} />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-base font-bold text-[#22242A]">
                    Broken Promise
                  </h3>
                  <p className="text-sm text-[#333740] leading-snug">
                    A desperate journalist uncovers a hidden AI network
                    controlling world events and must race against time to
                    expose the truth before becoming its next target.
                  </p>
                  <p className="text-base font-semibold text-[#333740]">
                    ₦300,000.00
                  </p>
                  <button className="mt-1 w-full bg-[#800000] text-white py-2 rounded hover:bg-[#1a0000] transition-colors duration-300">
                    See more
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Add Script Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={() => router.push("/writer/add-script")}
          className="bg-[#810306] text-white px-20 py-3 rounded-full text-base md:text-lg shadow-lg hover:bg-[#1a0000] transition-colors"
        >
          Add script <span className="ml-2 text-xl">+</span>
        </Button>
      </div>
    </div>
  );
}
