"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [exploreBtnState, setExploreBtnState] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
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
    setExploreBtnState(true);
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
          className="relative w-full min-h-[70vh] md:min-h-[90vh] bg-cover bg-center bg-no-repeat flex items-end"
          style={{
            backgroundImage: "url('/landingbg.png')",
          }}
        >
          <div className="w-full mx-auto px-4 md:px-0">
            <div className="backdrop-blur-xl bg-white/20 py-6 md:py-8 px-4 md:px-0 text-center shadow-lg">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Where <span className="text-red-900">Writers</span> and{" "}
                <span className="text-red-900">Producers</span>
                <br className="hidden md:block" />
                Collaborate To Bring Stories To Life
              </h1>

              <p className="text-white/90 mt-4 text-base md:text-lg">
                Bara connects screenwriters and producers in one
                <br className="hidden md:block" />
                secure space.
              </p>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6">
                <a
                  href="/dashboard"
                  className="border border-[#810306] text-[#810306] font-medium px-10 py-3 rounded-sm text-center transition-all duration-300 hover:scale-105"
                >
                  {exploreBtnState ? "Explore" : "Explore for free"}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 => writers and producers */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-2 md:gap-4 w-full">
          {/* Writers */}
          <div
            className="
      w-full px-6 md:px-12 lg:px-20 py-10
      flex flex-col items-center md:items-start justify-center gap-4 
       relative overflow-hidden
    "
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/director.png')" }}
            ></div>

            {/* Tint */}
            <div className="absolute inset-0 "></div>

            <h2 className="text-2xl md:text-3xl font-semibold relative z-10 text-center md:text-left text-[white]">
              For Writers
            </h2>

            <p className="text-base md:text-lg leading-relaxed relative z-10 text-center md:text-left text-[white]">
              Showcase your loglines, synopses, and full scripts to a global
              network of producers. Get paid securely, retain your rights or
              negotiate terms, and grow your reputation in the industry, all
              from one platform.
            </p>

            {/* Button */}
            <div className="mt-4 relative z-10 flex justify-center md:justify-start w-full">
              <Link
                href="/auth/register?type=Writer"
                className={`bg-[#800000] text-white px-10 py-2 rounded-md text-base font-medium hover:bg-[#550000] transition
      ${role !== "Guest" ? "invisible pointer-events-none" : ""}`}
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Producers */}
          <div
            className="
      w-full px-6 md:px-12 lg:px-20 py-10
      flex flex-col items-center md:items-start justify-center gap-4 
       relative overflow-hidden
    "
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/lady-working.png')" }}
            ></div>

            {/* Tint */}
            <div className="absolute inset-0 "></div>

            <h2 className="text-2xl md:text-3xl font-semibold relative z-10 text-center md:text-left text-[white]">
              For Producers
            </h2>

            <p className="text-base md:text-lg leading-relaxed relative z-10 text-center md:text-left text-[white]">
              Discover ready-to-produce scripts or hire writers to bring your
              vision to life. Search by genre with secure payments and clear IP
              agreements for peace of mind.
            </p>

            {/* Button */}
            <div className="mt-4 relative z-10 flex justify-center md:justify-start w-full">
              <Link
                href="/auth/register?type=Producer"
                className={`bg-[#800000] text-white px-10 py-2 rounded-md text-base font-medium hover:bg-[#550000] transition
      ${role !== "Guest" ? "invisible pointer-events-none" : ""}`}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Section 3 Collaboration Paths */}
        <div>
          <div className="mx-auto max-w-6xl">
            <h3 className="text-4xl font-semibold mt-10 pl-3">
              Your Path To <span className="text-[#810306]">Collaboration</span>
            </h3>

            {/* Writer Path */}
            <div>
              <h4 className="text-3xl font-semibold mt-10 pl-6 text-[#810306]">
                Writers
              </h4>
              {/* Path Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-10">
                {/* Card 1 */}
                <div
                  className="w-full bg-[url('/01.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md  transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
                  <h3 className="text-3xl font-semibold">
                    Upload and set price
                  </h3>
                  <p className="text-lg">
                    Showcase your story with a logline and synopsis, then set
                    the value it deserves.
                  </p>
                </div>
                {/* Card 2 */}
                <div
                  className="w-full bg-[url('/02.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
                  <h3 className="text-3xl font-semibold">
                    NDA-protected previews
                  </h3>
                  <p className="text-lg">
                    Share your story with confidence. Every preview is secured
                    under NDA protection.
                  </p>
                </div>
                {/* Card 3 */}
                <div
                  className="w-full bg-[url('/03.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
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
              <h4 className="text-3xl font-semibold mt-10 pl-6 text-[#810306]">
                Producers
              </h4>
              {/* Path Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-10">
                {/* Card 1 */}
                <div
                  className="w-full bg-[url('/01.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
                  <h3 className="text-3xl font-semibold">
                    Explore and sign NDA
                  </h3>
                  <p className="text-lg">
                    Browse scripts in your preferred genres and sign an NDA to
                    unlock detailed synopsis and scripts.
                  </p>
                </div>
                {/* Card 2 */}
                <div
                  className="w-full bg-[url('/02.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
                  <h3 className="text-3xl font-semibold">
                    Make payment for script
                  </h3>
                  <p className="text-lg">
                    Complete your purchase with secure payment; funds are only
                    released after your approval.
                  </p>
                </div>
                {/* Card 3 */}
                <div
                  className="w-full bg-[url('/03.png')] bg-[#FFEDEE] bg-auto bg-no-repeat bg-top-left flex flex-col items-center justify-center gap-5 px-15 py-10 rounded-md transition-all duration-300 ease-in-out
              hover:scale-105 hover:bg-[#810306] hover:text-[#FFEDEE]"
                >
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
        <div className="mx-auto w-full max-w-7xl flex flex-col items-left bg-[url('/galleryquote.png')] bg-auto bg-no-repeat py-16 px-4 md:px-15">
          <div className="flex flex-wrap justify-center md:justify-around items-center gap-0 mb-8">
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(1)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src="/Testimonial-1.png"
                alt="Gallery Image"
                width={150}
                height={60}
                className="h-[330px] w-[180px] object-cover hover:w-[350px] flex-shrink-0 transition-all duration-300 z-10 relative border-1 rounded-md grayscale hover:grayscale-0"
              />
            </div>
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(2)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src="/Testimonial-2.png"
                alt="Gallery Image"
                width={150}
                height={60}
                className="h-[330px] w-[180px] object-cover hover:w-[350px] flex-shrink-0 transition-all duration-300 z-10 relative border-1 rounded-md grayscale hover:grayscale-0"
              />
            </div>
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(3)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src="/Testimonial-3.png"
                alt="Gallery Image"
                width={150}
                height={60}
                className="h-[330px] w-[180px] object-cover hover:w-[350px] flex-shrink-0 transition-all duration-300 z-10 relative border-1 rounded-md grayscale hover:grayscale-0"
              />
            </div>
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(4)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src="/Testimonial-4.png"
                alt="Gallery Image"
                width={150}
                height={60}
                className="h-[330px] w-[180px] object-cover hover:w-[350px] flex-shrink-0 transition-all duration-300 z-10 relative border-1 rounded-md grayscale hover:grayscale-0"
              />
            </div>
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(5)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src="/Testimonial-5.png"
                alt="Gallery Image"
                width={150}
                height={60}
                className="h-[330px] w-[180px] object-cover hover:w-[350px] flex-shrink-0 transition-all duration-300 z-10 relative border-1 rounded-md grayscale hover:grayscale-0"
              />
            </div>
          </div>

          {/* Testimony Display */}
          <div className="min-h-[60px] flex items-center justify-center">
            {hoveredImage === 1 && (
              <p className="text-center text-gray-700 italic max-w-2xl animate-fadeIn">
                "Bara has revolutionized how we discover new talent. The
                platform's security and NDA protection give us complete
                confidence."
              </p>
            )}
            {hoveredImage === 2 && (
              <p className="text-center text-gray-700 italic max-w-2xl animate-fadeIn">
                "As a writer, I've finally found a platform that values my work
                and protects my rights. The payment system is brilliant."
              </p>
            )}
            {hoveredImage === 3 && (
              <p className="text-center text-gray-700 italic max-w-2xl animate-fadeIn">
                "The collaboration features are outstanding. We can work
                seamlessly with writers from anywhere in the world."
              </p>
            )}
            {hoveredImage === 4 && (
              <p className="text-center text-gray-700 italic max-w-2xl animate-fadeIn">
                "Bara's genre-based search and secure transactions have made our
                production process incredibly efficient."
              </p>
            )}
            {hoveredImage === 5 && (
              <p className="text-center text-gray-700 italic max-w-2xl animate-fadeIn">
                "Finally, a platform that understands the needs of both writers
                and producers. It's a game-changer for the industry."
              </p>
            )}
          </div>
        </div>

        {/* Section 5 => Bara Bridge */}
        <div className="relative bg-[#FFEDEE] flex flex-col gap-5 py-10 px-7">
          {/* Desktop background image */}
          <div className="absolute inset-0 bg-[url('/Mask-group.png')] bg-auto bg-no-repeat bg-right hidden sm:block z-0"></div>

          {/*  mobile  */}
          <div className="absolute inset-0 sm:hidden bg-[#FFEDEE]/90 z-0"></div>

          {/* Text content */}
          <div className="relative z-10 w-full max-w-2xl py-7 px-0 sm:px-25 flex items-center justify-center text-center sm:text-left">
            <h5 className="text-3xl sm:text-4xl font-semibold">
              <span className="text-[#810306]">BARA</span> bridges the gap
              between visionary writers and forward-thinking producers
            </h5>
          </div>

          {/* Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-8 py-5 px-0 sm:px-25">
            <Link
              href="/auth/register?type=Producer"
              className={`bg-[#810306] hover:bg-red-800 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-md text-sm transition-all duration-300 ease-in-out hover:scale-105
      ${role !== "Guest" ? "invisible pointer-events-none" : ""}`}
            >
              I am a Producer
            </Link>

            <Link
              href="/auth/register?type=Writer"
              className={`bg-[#810306] hover:bg-red-800 text-white py-3 sm:py-4 px-9 rounded-md text-sm transition-all duration-300 ease-in-out hover:scale-105
      ${role !== "Guest" ? "invisible pointer-events-none" : ""}`}
            >
              I am a Writer
            </Link>
          </div>
        </div>
      </div>
      {/* Footer  */}
      <Footer />
    </main>
  );
}
