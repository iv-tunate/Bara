"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import EditWriterProfileModal from "@/components/EditWriterProfile";
import ChangePhotoModal from "@/components/ChangeProfileModal";
import { api } from "@/utils/api";
import { downloadImage } from "@/utils/upload";
import { Writer } from "@/models/user";
import { Script } from "@/models/script";
import { ScriptGrid } from "@/components/Script";

export default function WriterProfile() {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Writer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [writerId, setWriterId] = useState<string | null>(null);

  const pageSize = 12;

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setWriterId(id);
  }, []);

  useEffect(() => {
    if (!writerId) return;

    async function fetchProfile() {
      setIsLoading(true);
      try {
        const cacheKey = `User_${writerId}`;
        const cached = localStorage.getItem(cacheKey);
        const verificationStatus = localStorage.getItem("VerificationStatus");

        if (cached) {
          const cachedData = JSON.parse(cached);
          setProfileData(cachedData);
        }

        const res = await api.getWriterProfile(writerId!);
        if (res?.data?.data) {
          const userData = res.data.data;

          if (verificationStatus === "Verified") {
            localStorage.setItem(cacheKey, JSON.stringify(userData));
          }
          setProfileData(userData);
        }
      } catch (error) {
        console.error("Error fetching writer profile:", error);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [writerId]);

  const fetchScripts = useCallback(
    async (page = 1, append = false) => {
      if (!writerId) return;

      setScriptsLoading(true);
      setError("");

      try {
        const response = await api.getScriptsByWriterId(
          writerId,
          page,
          pageSize
        );

        if (response.success && response.data) {
          setScripts((prev) =>
            append
              ? [...prev, ...(response.data.data || [])]
              : response.data.data || []
          );
          setTotalPages(response.totalPages || 1);
        } else {
          setError(response.message || "Failed to load scripts");
          setScripts([]);
        }
      } catch (error) {
        console.error("Error fetching scripts:", error);
        setError("An unexpected error occurred");
        setScripts([]);
      } finally {
        setScriptsLoading(false);
      }
    },
    [writerId]
  );

  useEffect(() => {
    if (writerId) {
      fetchScripts(1, false);
    }
  }, [writerId, fetchScripts]);

  useEffect(() => {
    async function loadImage() {
      if (!profileData?.profileImageUrl && !profileData?.profileImagePublicId) {
        setImageLoading(false);
        return;
      }

      try {
        const imageUrl = await downloadImage(
          (profileData?.profileImageUrl || profileData?.profileImagePublicId)!,
          "cloudinary"
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
            <div className="relative -mt-16 md:-mt-20 w-24 h-24">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow flex items-center justify-center bg-gray-100">
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
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md cursor-pointer"
              >
                <Image src="/Camera.png" alt="Camera" width={18} height={18} />
              </button>
            </div>

            <div className="flex-1 flex justify-between items-start -ml-20 mt-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#22242A]">
                    {profileData?.name}
                  </h2>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-1 rounded-full cursor-pointer"
                  >
                    <Image src="/Edit.png" alt="Edit" width={16} height={16} />
                  </button>
                </div>

                <EditWriterProfileModal
                  isOpen={isEditOpen}
                  onClose={() => setIsEditOpen(false)}
                  onSave={(data) =>
                    setProfileData((prev) => ({ ...prev, ...data }))
                  }
                  initialData={profileData as any}
                />

                <div className="text-sm text-[#333740] mt-2 max-w-xl leading-relaxed whitespace-pre-line">
                  {profileData?.bio}
                </div>

                <p className="flex items-center gap-2 text-xs text-[#858990] mt-3">
                  <Image
                    src="/location.png"
                    alt="Location"
                    width={14}
                    height={14}
                  />
                  {profileData?.address?.city}, {profileData?.address?.country}
                </p>

                <div className="mt-3">
                  <p className="text-l text-[#333740] font-medium">Portfolio</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={profileData?.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1A0DAB] underline break-words"
                    >
                      {profileData?.portfolioUrl?.replace(/^https?:\/\//, "")}
                    </a>
                    <div className="relative">
                      <button
                        onClick={() =>
                          handleCopy(profileData?.portfolioUrl as string)
                        }
                        className="p-1 rounded cursor-pointer"
                      >
                        <Image
                          src="/copy.png"
                          alt="Copy"
                          width={14}
                          height={14}
                        />
                      </button>
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
                  {profileData?.services?.length || 0} services offered
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-[#ABADB2] rounded-lg p-6 mb-6 shadow-sm flex justify-between gap-4 flex-col">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#22242A]">
                Experience(s)
              </h2>
            </div>

            <div className="space-y-4">
              {profileData?.experiences?.length ? (
                profileData.experiences.map((exp: any) => (
                  <div key={exp.id}>
                    <h3 className="text-sm font-medium text-[#333740]">
                      {exp.organization} • {exp.project}
                    </h3>
                    <p className="text-xs text-[#333740]">{exp.description}</p>
                    <p className="flex items-center gap-1 text-xs text-[#858990] mt-1">
                      <Image
                        src="/calendar.png"
                        alt="Calendar"
                        width={12}
                        height={12}
                      />
                      {new Date(exp.startDate).toLocaleDateString()} –
                      {exp.isCurrent
                        ? " present"
                        : ` ${new Date(exp.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No experiences added yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="border border-[#ABADB2] rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#22242A] mb-4">
            My Scripts
          </h2>
          {scriptsLoading && scripts.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
            </div>
          ) : scripts.length < 1 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">You have not uploaded any scripts</p>
            </div>
          ) : (
            <ScriptGrid
              scripts={scripts}
              isLoading={scriptsLoading}
              hasMore={currentPage < totalPages}
              onLoadMore={async () => {
                await fetchScripts(currentPage + 1, true);
                setCurrentPage((p) => p + 1);
              }}
            />
          )}
        </section>

        <ChangePhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          currentAvatar={profileImage || "/writer.png"}
        />
      </main>
    </div>
  );
}
