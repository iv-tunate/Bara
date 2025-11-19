"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState, useEffect } from "react";
import CompleteProfileNav from "@/components/CompleteProfileNav";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
import Footer from "@/components/Footer";
// import CreateAccountDropdown from "@/components/CreateAccountDropdown";
// import { useState } from "react";

export default function HomePage() {
  // const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState<string>("Guest");
  const [profileState, setProfileState] = useState(false);
  useEffect(() => {
    const session = getUserSession();

    if (session && !session.profileComplete) {
      setRole(session.userType);
      setProfileState(false);
      return;
    } else if (!session) {
      setRole("Guest");
      return;
    }
    setRole(session.userType);
    setProfileState(true);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col relative">
      {role === "Guest" ? (
        <Navbar />
      ) : profileState === false ? (
        <CompleteProfileNav />
      ) : (
        <DashboardNavbar />
      )}
      <div className="flex flex-col w-full max-w-8xl">
        {/* Hero Section */}
        <section
          className="relative w-full h-[95vh] bg-cover bg-no-repeat flex items-end"
          style={{
            backgroundImage: "url('/landingbg.png')",
          }}
        >
          {/* Blurry Overlay */}
          <div className="w-full mx-auto">
            <div className="backdrop-blur-xl bg-white/20 py-5 text-center shadow-lg">
              {/* Heading */}
              <h1 className="text-2xl md:text-5xl font-bold text-white leading-tight">
                Where <span className="text-red-900">Writers</span> and{" "}
                <span className="text-red-900">Producers</span>
                <br />
                Collaborate To Bring Stories To Life
              </h1>

              <p className="text-white/90 mt-4 text-lg">
                Bara connects screenwriters and producers in one
                <br />
                secure space.
              </p>

              {/* Buttons */}
              <div className="mt-5 flex flex-col md:flex-row items-center justify-center gap-6">
                <button className="bg-red-900 hover:bg-red-800 text-white px-10 py-2 rounded-md text-md transition">
                  Create account
                </button>
                <button className="border border-red-900 text-red-900 px-10 py-2 rounded-md text-md hover:bg-red-50/30 transition">
                  Explore Bara
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-2 ">
          <div className="bg-[#FFEDEE] px-10 md:px-40 py-10 md:py-15 flex flex-col items-start justify-center gap-5">
            <h2 className="text-3xl font-semibold">For Writers</h2>
            <p className="text-lg">
              Showcase your loglines, synopses, and full scripts to a global
              network of producers. Get paid securely, retain your rights or
              negotiate terms, and grow your reputation in the industry, all
              from one platform.
            </p>
          </div>
          <div className="bg-[#FFEDEE] px-10 md:px-40 py-10 md:py-15 flex flex-col items-start justify-center gap-5">
            <h2 className="text-3xl font-semibold">For Producers</h2>
            <p className="text-lg">
              Discover ready-to-produce scripts or hire writers to bring your
              vision to life. Search by genre with secure payments and clear IP
              agreements for peace of mind.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <div className="mx-auto max-w-6xl">
            <h3 className="text-4xl font-semibold mt-10 pl-3">
              Your Path To <span className="text-red-900">Collaboration</span>
            </h3>

            {/* Writer Path */}
            <div>
              <h4 className="text-3xl font-semibold mt-10 pl-6">Writers</h4>
              {/* Path Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-10">
                {/* Card 1 */}
                <div className="w-full bg-[url('/01.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    Upload and set price
                  </h3>
                  <p className="text-lg">
                    Showcase your story with a logline and synopsis, then set
                    the value it deserves.
                  </p>
                </div>
                {/* Card 2 */}
                <div className="w-full bg-[url('/02.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    NDA-protected previews
                  </h3>
                  <p className="text-lg">
                    Share your story with confidence. Every preview is secured
                    under NDA protection.
                  </p>
                </div>
                {/* Card 3 */}
                <div className="w-full bg-[url('/03.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    Get paid after confirmation
                  </h3>
                  <p className="text-lg">
                    Receive your payment securely after the producer confirms
                    they’re happy with your script.
                  </p>
                </div>
              </div>
            </div>

            {/* Producer Path */}
            <div>
              <h4 className="text-3xl font-semibold mt-10 pl-6">Producers</h4>
              {/* Path Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-10">
                {/* Card 1 */}
                <div className="w-full bg-[url('/01.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    Explore and sign NDA
                  </h3>
                  <p className="text-lg">
                    Browse scripts in your preferred genres and sign an NDA to
                    unlock detailed synopsis and scripts.
                  </p>
                </div>
                {/* Card 2 */}
                <div className="w-full bg-[url('/02.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    Make payment for script
                  </h3>
                  <p className="text-lg">
                    Complete your purchase with secure payment; funds are only
                    released after your approval.
                  </p>
                </div>
                {/* Card 3 */}
                <div className="w-full bg-[url('/03.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md">
                  <h3 className="text-3xl font-semibold">
                    Review script and confirmm
                  </h3>
                  <p className="text-lg">
                    Read the full script, collaborate with the writer, and
                    confirm once you’re satisfied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mx-auto w-full max-w-7xl flex flex-row gap-5 items-center justify-between bg-[url('/galleryquote.png')] bg-auto bg-no-repeat py-20 pb-35 px-10 md:px-18">
          <Image
            src="/Testimonial-1.png"
            alt="Gallery Image"
            width={200}
            height={80}
          />

          <Image
            src="/Testimonial-2.png"
            alt="Gallery Image"
            width={200}
            height={80}
          />

          <Image
            src="/Testimonial-3.png"
            alt="Gallery Image"
            width={200}
            height={80}
          />

          <Image
            src="/Testimonial-4.png"
            alt="Gallery Image"
            width={200}
            height={80}
          />

          <Image
            src="/Testimonial-5.png"
            alt="Gallery Image"
            width={200}
            height={80}
          />
        </div>

        {/* Section 5 */}
        <div className="bg-[url('/Mask-group.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-right flex flex-col gap-5 py-10 px-7">
          <div className="w-full max-w-3xl py-7 px-25 items-center justify-center">
            <h5 className="text-5xl font-semibold">
              <span className="text-red-900">BARA</span> bridges the gap between
              visionary writers and forward-thinking producers
            </h5>
          </div>
          <div className="flex flex-row gap-8 py-5 px-25">
            <button className="bg-red-900 hover:bg-red-800 text-white px-10 py-4 rounded-md text-sm transition">
              I am a Producer
            </button>
            <button className="bg-red-900 hover:bg-red-800 text-white px-10 py-4 rounded-md text-sm transition">
              I am a Writer
            </button>
          </div>
        </div>

        {/* Section 6 => Footer */}

        {/* DO NOT TOUCH THIS */}
      </div>
      <Footer />
    </main>
  );
}
