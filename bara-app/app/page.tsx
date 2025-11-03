"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import HeroImage from "../public/hero.png"
import {useState, useEffect} from "react"
import CompleteProfileNav from "@/components/CompleteProfileNav";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getUserSession } from "@/utils/tokenManager";
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
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-9 md:py-12 flex-1 max-w-7xl mx-auto w-full">
        <div className="md:w-1/2 max-w-xl mt-10 md:mt-0 relative">
          <h1 className="[font-family:var(--font-lato)] text-3xl md:text-5xl font-semibold leading-tight text-barRedMain">
            Where <span className="italic text-[#810306]">Writers </span>
            and <span className="italic text-[#810306]">Producers</span>{" "}
            Collaborate To Bring Stories To Life
          </h1>
          <p className="mt-4 md:text-medium text-[#333740]">
            Bara connects screenwriters and producers in one <br />
            secure space.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            {/* <div className="relative"> */}
            {/* Create Account button*/}
            {/* <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDropdown((prev) => !prev);
                }}
                className="bg-[#800000] text-white font-medium px-12 py-3 rounded-md hover:bg-[#1a0000] text-center relative transition-all duration-300 ease-in-out hover:scale-105"
              >
                Create account
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2">
                  <CreateAccountDropdown
                    onClose={() => setShowDropdown(false)}
                  />
                </div>
              )} */}
            {/* </div> */}

            {/* Explore for free link*/}
            <a
              href="/dashboard"
              className="border border-[#800000] text-[#800000] font-medium px-12 py-3 rounded-sm text-center 
             transition-all duration-300 ease-in-out 
              hover:scale-105"
            >
              Explore for free
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
          <Image
            src={HeroImage}
            alt="Bara App Hero"
            width={500}
            height={400}
            className="w-full max-w-md h-auto object-contain"
          />
        </div>
      </section>
    </main>
  );
}
