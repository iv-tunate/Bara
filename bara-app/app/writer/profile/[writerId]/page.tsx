"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { downloadImage } from "@/utils/upload";
import { Writer } from "@/models/user";
import { Script } from "@/models/script";
import { ScriptGrid } from "@/components/Script";
import { useParams, useRouter } from "next/navigation";

export default function PublicWriterProfile() {
  const params = useParams();
  const router = useRouter();
  const writerId = params?.writerId as string;
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isOwner = currentUserId === writerId;

  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Writer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 12;

  useEffect(() => {
    if (!writerId) return;

    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await api.getWriterProfile(writerId);
        if (res?.data?.data) {
          setProfileData(res.data.data);
        } else if (res?.data) {
          setProfileData(res.data);
        } else {
          setError("Profile not found");
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
          writerId!,
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
          setScripts([]);
        }
      } catch (error) {
        console.error("Error fetching scripts:", error);
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

  if (isLoading && !profileData) {
    return (
      <div className="flex h-screen items-center justify-center text-[#22242A]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#810306]" />
        <span className="ml-3 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (error || (!isLoading && !profileData)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-[#22242A] gap-4">
        <p>{error || "Profile not found."}</p>
        <button
          onClick={() => router.back()}
          className="text-[#810306] hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-[#22242A]">
            {isOwner ? "My profile" : "Writer profile"}
          </h1>
          {!isOwner && (
            <button
              onClick={() => router.back()}
              className="text-sm text-[#810306] font-medium"
            >
              Back
            </button>
          )}
        </div>

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
            </div>

            <div className="flex-1 flex justify-between items-start -ml-20 mt-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#22242A]">
                    {profileData?.name ||
                      `${profileData?.firstName} ${profileData?.lastName}`}
                  </h2>
                </div>

                <div className="text-sm text-[#333740] mt-2 max-w-xl leading-relaxed whitespace-pre-line">
                  {profileData?.bio || "No bio available."}
                </div>

                {profileData?.address && (
                  <p className="flex items-center gap-2 text-xs text-[#858990] mt-3">
                    <Image
                      src="/location.png"
                      alt="Location"
                      width={14}
                      height={14}
                    />
                    {profileData.address.city}, {profileData.address.country}
                  </p>
                )}

                {profileData?.portfolioUrl && (
                  <div className="mt-3">
                    <p className="text-l text-[#333740] font-medium">
                      Portfolio
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={profileData.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#1A0DAB] underline break-words"
                      >
                        {profileData.portfolioUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 mr-6 text-right">
                <p className="flex items-center gap-2 text-sm text-[#333740] justify-end">
                  <Image
                    src="/rating.png"
                    alt="Rating Star"
                    width={16}
                    height={16}
                  />
                  {profileData?.services?.length || 0} services offered
                </p>
                {profileData?.authProfile?.isVerified && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Verified Writer
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border border-[#ABADB2] rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#22242A] mb-4">
            Experience(s)
          </h2>

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
              <p className="text-sm text-gray-500">No experiences listed.</p>
            )}
          </div>
        </section>

        <section className="border border-[#ABADB2] rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#22242A] mb-4">
            {isOwner ? "My Scripts" : "Scripts by this writer"}
          </h2>
          {scriptsLoading && scripts.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
            </div>
          ) : scripts.length < 1 ? (
            <p className="text-gray-500 text-sm">
              No scripts found for this writer.
            </p>
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
      </main>
    </div>
  );
}
