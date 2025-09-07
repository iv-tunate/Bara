/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function WriterDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Writer");

  useEffect(() => {
    // const session = getUserSession();
    // if (!session) {
    //   router.push("/auth/login");
    //   return;
    // }
    // setUserName(session.name || "Writer");
    setUserName("Writer");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-[#22242a] mb-1 flex items-center gap-2">
              Hello {userName}!{" "}
              <Image src="/wave.png" alt="Wave" width={20} height={20} />
            </h1>
            <p className="text-sm md:text-base text-[#444955] max-w-md md:max-w-lg">
              Showcase powerful stories, connect with producers, and get your
              scripts seen, valued, and sold.
            </p>
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-[#22242a]"
          >
            <Image src="/menu-icon.png" alt="Menu" width={20} height={20} />
            <span className="hidden sm:inline">Categories</span>
          </Button>
        </header>

        {/* Premium Banner */}
        <section className="relative bg-[#f5f1eb] rounded-lg p-6 md:p-8 my-8 overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-[#444955] hover:bg-white/50"
          >
            <Image src="/cancel-icon.png" alt="Close" width={16} height={16} />
          </Button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
            {/* Left: Text */}
            <div className="flex-1 max-w-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-[#22242a] mb-4">
                Want More Producers to Discover Your Work?
              </h2>
              <p className="text-[#444955] text-sm md:text-base leading-relaxed mb-6">
                With Bara Premium, your work gets priority placement in producer
                searches, increased visibility by genre, and access to valuable
                insights like script views and engagement.
              </p>
              <Button className="bg-[#810306]  text-white px-6 py-2">
                Get Bara Premium
              </Button>
            </div>

            {/* Right: Image */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <img
                src="/writerdashboard.png"
                alt="Writers and producers collaborating"
                className="w-full lg:w-80 xl:w-96 h-auto rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Scripts Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src="/flowery.png"
                    alt="Broken Promise"
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-[#344054] text-white text-xs px-2 py-1">
                    Adventure
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-600"
                  >
                    <Image
                      src="/heart-icon.png"
                      alt="Save"
                      width={16}
                      height={16}
                    />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-[#22242a] mb-2 text-lg">
                    Broken Promise
                  </h3>
                  <p className="text-[#444955] text-sm leading-relaxed mb-4 line-clamp-3">
                    A desperate journalist uncovers a hidden AI network
                    controlling world events and must race against time to
                    expose the truth before becoming its next target.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#22242a]">
                      ₦300,000.00
                    </span>
                  </div>
                  <Button className="w-full mt-3 bg-[#810306]  text-white">
                    See more
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Add Script Button */}
        <div className="flex justify-center mt-10">
          <Button className="bg-[#810306] text-white px-8 py-3 rounded-full text-base md:text-lg">
            Add script <span className="ml-2 text-xl">+</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
