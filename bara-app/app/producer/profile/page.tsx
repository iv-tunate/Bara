"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import EditProducerProfileModal from "@/components/EditProducerProfile";
import ChangePhotoModal from "@/components/ChangeProfileModal";
import { api } from "@/utils/api";
import { downloadImage } from "@/utils/upload";
import { Producer } from "@/models/user";

export default function ProducerProfile() {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Producer | null>(null);
  const [producerId, setProducerId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setProducerId(id);
  }, []);

  useEffect(() => {
    if (!producerId) return;

    async function fetchProfile() {
      setIsLoading(true);
      try {
        const cacheKey = `User_${producerId}`;
        const cached = localStorage.getItem(cacheKey);
        const verificationStatus = localStorage.getItem("VerificationStatus");

        if (cached) {
          const cachedData = JSON.parse(cached);
          setProfileData(cachedData);
        }

        const res = await api.getProducerProfile(producerId!);
        if (res?.data?.data) {
          const userData = res.data.data;

          if (verificationStatus === "Verified") {
            localStorage.setItem(cacheKey, JSON.stringify(userData));
          }
          setProfileData(userData);
        }
      } catch (error) {
        console.error("Error fetching producer profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [producerId]);

  useEffect(() => {
    async function loadImage() {
      if (!profileData?.profileImageUrl && !profileData?.profileImagePublicId) {
        setImageLoading(false);
        return;
      }

      try {
        const imageUrl = await downloadImage(
          (profileData?.profileImageUrl || profileData?.profileImagePublicId)!,
          "cloudinary",
        );
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        setImageLoading(false);
      }
    }

    if (profileData) loadImage();
  }, [profileData]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex h-screen items-center justify-center text-[#22242A]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#810306]" />
        <span className="ml-3 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (!isLoading && !profileData) {
    return (
      <div className="flex h-screen items-center justify-center text-[#22242A]">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <h1 className="text-lg font-semibold text-[#22242A] mb-4">
          My profile
        </h1>

        <section className="border border-[#ABADB2] rounded-lg overflow-hidden mb-6 shadow-sm">
          <div className="relative w-full h-32 md:h-40">
            <Image src="/cover.png" alt="Cover" fill className="object-cover" />
          </div>

          <div className="p-6 flex relative">
            <div className="relative -mt-16 md:-mt-20 w-24 h-24 shrink-0 z-10">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md flex items-center justify-center bg-gray-100 border-4 border-white">
                {imageLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#810306]" />
                ) : (
                  <Image
                    src={profileImage || "/writer.png"}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                title="Change Photo"
              >
                <Image src="/Camera.png" alt="Camera" width={16} height={16} />
              </button>
            </div>

            <div className="flex-1 flex justify-between items-start -ml-20 mt-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#22242A]">
                    {profileData?.firstName} {profileData?.lastName}
                  </h2>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
                    title="Edit Profile"
                  >
                    <Image
                      src="/Edit.png"
                      alt="Edit"
                      width={18}
                      height={18}
                      className="group-hover:opacity-80"
                    />
                  </button>
                </div>

                {profileData?.companyName && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-[#810306] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {profileData.companyName}
                    </span>
                  </div>
                )}

                <p className="flex items-center gap-2 text-sm text-[#858990] mt-2 mb-4">
                  <Image
                    src="/location.png"
                    alt="Location"
                    width={14}
                    height={14}
                    className="opacity-70"
                  />
                  {profileData?.address?.city || "Unknown City"},{" "}
                  {profileData?.address?.country || "Unknown Country"}
                </p>

                <EditProducerProfileModal
                  isOpen={isEditOpen}
                  onClose={() => setIsEditOpen(false)}
                  onSave={(data) =>
                    setProfileData((prev) => ({ ...prev, ...data }))
                  }
                  initialData={profileData as any}
                />

                <div className="mt-4 space-y-5 max-w-3xl">
                  <div>
                    <h3 className="text-xs font-bold text-[#810306] uppercase tracking-wider mb-2">
                      About
                    </h3>
                    <div className="text-sm text-[#333740] leading-relaxed whitespace-pre-line">
                      {profileData?.bio || (
                        <span className="text-gray-400 italic">
                          No bio added yet.
                        </span>
                      )}
                    </div>
                  </div>

                  {profileData?.portfolioUrl && (
                    <div>
                      <h3 className="text-xs font-bold text-[#810306] uppercase tracking-wider mb-2">
                        Portfolio
                      </h3>
                      <div className="flex items-center gap-3">
                        <a
                          href={profileData.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0066CC] font-medium hover:underline flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          {profileData.portfolioUrl.replace(/^https?:\/\//, "")}
                        </a>
                        <div className="relative">
                          <button
                            onClick={() =>
                              handleCopy(profileData.portfolioUrl!)
                            }
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="Copy Link"
                          >
                            <Image
                              src="/Copy.png"
                              alt="Copy"
                              width={14}
                              height={14}
                            />
                          </button>
                          {copied && (
                            <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap animate-fade-in-up">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ChangePhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          currentAvatar={profileImage || "/producer.png"}
          userData={profileData}
          userType="Producer"
          onSave={(data) => setProfileData(data)}
        />
      </main>
    </div>
  );
}
