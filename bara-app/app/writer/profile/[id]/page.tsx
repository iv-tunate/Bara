"use client";

import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useState } from "react";
import EditWriterProfileModal, {
  FormData,
} from "@/components/EditWriterProfile";

export default function WriterProfile() {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // store profile data so edits reflect in UI
  const [profileData, setProfileData] = useState<FormData>({
    name: "Timothy Edwards",
    portfolio: "https://Timothy-eduwards.com/works",
    bio: "Award-winning writer and motivational speaker. Award-nominated screenwriter focused on supernatural thrillers rooted in Yoruba folklore.",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    houseNumber: "12g",
    street: "Thomas Rollar",
    zip: "300243",
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <h1 className="text-lg font-semibold text-[#22242A] mb-4">
          My profile
        </h1>
        {/* Profile Card */}
        <section className="border-1 border-[#ABADB2] rounded-lg overflow-hidden mb-6 shadow-sm">
          {/* Cover */}
          <div className="relative w-full h-32 md:h-40">
            <Image src="/cover.png" alt="Cover" fill className="object-cover" />
          </div>

          {/* Content */}
          <div className="p-6 flex relative">
            {/* Profile Avatar */}
            <div className="relative -mt-16 md:-mt-20 w-24 h-24 rounded-full overflow-hidden shadow">
              <Image
                src="/writer.png"
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex justify-between items-start -ml-20 mt-8">
              <div className="flex flex-col">
                {/* Name and Edit icon */}
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#22242A]">
                    {profileData.name}
                  </h2>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-1 rounded-full cursor-pointer"
                  >
                    <Image src="/Edit.png" alt="Edit" width={16} height={16} />
                  </button>
                </div>

                {/* Edit Modal */}
                <EditWriterProfileModal
                  isOpen={isEditOpen}
                  onClose={() => setIsEditOpen(false)}
                  onSave={(data) => {
                    setProfileData(data); // update UI with saved data
                    console.log("Saved data:", data);
                  }}
                  initialData={profileData}
                />

                {/* Bio */}
                <div className="text-sm text-[#333740] mt-2 max-w-xl leading-relaxed whitespace-pre-line">
                  {profileData.bio}
                </div>

                {/* Location */}
                <p className="flex items-center gap-2 text-xs text-[#858990] mt-3">
                  <Image
                    src="/location.png"
                    alt="Location"
                    width={14}
                    height={14}
                  />
                  {profileData.city}, {profileData.country}
                </p>

                {/* Portfolio */}
                <div className="mt-3">
                  <p className="text-l text-[#333740] font-medium">Portfolio</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={profileData.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1A0DAB] underline break-words"
                    >
                      {profileData.portfolio.replace(/^https?:\/\//, "")}
                    </a>
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(profileData.portfolio)}
                        className="p-1 rounded cursor-pointer"
                      >
                        <Image
                          src="/copy.png"
                          alt="Copy"
                          width={14}
                          height={14}
                        />
                      </button>

                      {/* Copied */}
                      {copied && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-[#0DA500] whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 mr-6">
                <p className="flex items-center gap-2 text-sm text-[#333740]">
                  <Image
                    src="/rating.png"
                    alt="Rating Star"
                    width={16}
                    height={16}
                  />
                  3 scripts sold
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="border-1 border-[#ABADB2] rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#22242A]">Experience</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full cursor-pointer">
                <Image src="/plus.png" alt="Add" width={16} height={16} />
              </button>
              <button className="p-2 rounded-full cursor-pointer">
                <Image src="/Edit.png" alt="Edit" width={16} height={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#333740]">
                Open house studio • Finished man
              </h3>
              <p className="text-xs text-[#333740]">
                Screenwriter/Dialogue coach
              </p>
              <p className="flex items-center gap-1 text-xs text-[#858990] mt-1">
                <Image
                  src="/calendar.png"
                  alt="Calendar"
                  width={12}
                  height={12}
                />
                July 2023 – present • 2 years 1 month
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#333740]">
                Telegate Vision • Man Down
              </h3>
              <p className="text-xs text-[#333740]">
                Screenwriter/Assistant director
              </p>
              <p className="flex items-center gap-1 text-xs text-[#858990] mt-1">
                <Image
                  src="/calendar.png"
                  alt="Calendar"
                  width={12}
                  height={12}
                />
                Aug 2022 – January 2023 • 7 months
              </p>
            </div>
          </div>
        </section>

        {/* Works */}
        <section>
          <h2 className="text-lg font-semibold text-[#333740] mb-6">Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                tabIndex={0}
                className="border border-[#ABADB2] rounded-md overflow-hidden bg-white shadow-sm transition-all duration-300"
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
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
