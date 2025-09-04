"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";
import { Suspense } from "react";

interface WriterProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  bio?: string;
  phoneNumber: string;
  profilePicture?: string;
  isPremiumMember: boolean;
  verificationStatus: string;
  addressDetail: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  scripts: Array<{
    id: string;
    title: string;
    genre: string;
    synopsis: string;
    price: number;
    currencySymbol: string;
    status: string;
  }>;
  experiences: Array<{
    title: string;
    description: string;
    organization?: string;
  }>;
  services: Array<{
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    currency: string;
  }>;
}

function ProfilePageContent() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const writerId = params.id as string;

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setIsOwnProfile(session.userId === writerId);
    }
  }, [writerId]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.getWriterProfile(writerId);
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError(response.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching writer profile:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (writerId) {
      fetchProfile();
    }
  }, [writerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profile not found
          </h3>
          <p className="text-gray-500">
            {error || "The requested profile could not be found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardNavbar />
      <div className="relative h-48 bg-gradient-to-r from-[#6b5b4d] to-[#8b7355] overflow-hidden">
        <div className="absolute top-4 left-6">
          <h1 className="text-white text-xl font-medium">My profile</h1>
        </div>
        <div className="absolute top-12 right-8">
          <Image
            src="/colorful-pens-and-markers-in-a-cup.png"
            alt="Colorful pens"
            width={128}
            height={128}
            className="h-32 w-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 border-4 border-white shadow-md rounded-full overflow-hidden bg-gray-200">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-medium text-lg">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold text-[#22242a]">
                    {profile.firstName}{" "}
                    {profile.middleName && `${profile.middleName} `}
                    {profile.lastName}
                  </h2>
                  {isOwnProfile && (
                    <button
                      type="button"
                      title="Edit profile"
                      className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                    >
                      <svg
                        className="h-4 w-4 text-[#858990]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-[#444955] text-sm leading-relaxed mb-3 max-w-md">
                  {profile.bio || "No bio available"}
                </p>
                <div className="flex items-center gap-1 text-[#858990] text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {profile.addressDetail.city}, {profile.addressDetail.state},{" "}
                    {profile.addressDetail.country}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.isPremiumMember && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border-[#0369a1]">
                  Premium
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  profile.verificationStatus === "Verified"
                    ? "bg-[#f0fdf4] text-[#166534] border-[#166534]"
                    : profile.verificationStatus === "InProgress"
                    ? "bg-[#fef3c7] text-[#92400e] border-[#92400e]"
                    : "bg-[#fef2f2] text-[#991b1b] border-[#991b1b]"
                }`}
              >
                {profile.verificationStatus}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[#ffedee] text-[#810306] border-[#c08183]">
                ⭐ {profile.scripts.length} scripts
              </span>
            </div>
          </div>

          {/* Portfolio */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-[#22242a] mb-2">
              Portfolio
            </h3>
            <div className="flex items-center gap-2">
              <a href="#" className="text-[#000aaf] text-sm hover:underline">
                View Portfolio
              </a>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#22242a]">Experience</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-[#22242a]">
                    Open house studio • Finished man
                  </h4>
                  <p className="text-[#444955] text-sm">
                    Screenwriter/Dialogue coach
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#858990] text-sm mt-1">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>July 2023 – present • 2 years 1 month</span>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-[#22242a]">
                    Telegate Vision • Man Down
                  </h4>
                  <p className="text-[#444955] text-sm">
                    Screenwriter/Assistant director
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#858990] text-sm mt-1">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>July 2022 – January 2023 • 7 months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scripts Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#22242a]">Scripts</h3>
            {isOwnProfile && (
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-[#800000] hover:bg-[#600000] rounded-md transition-colors"
                onClick={() => router.push("/writer/add-script")}
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Script
              </button>
            )}
          </div>

          {profile.scripts.length === 0 ? (
            <div className="text-center py-8">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No scripts yet
              </h3>
              <p className="text-gray-500">
                {isOwnProfile
                  ? "Start by adding your first script"
                  : "This writer hasn't published any scripts yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.scripts.map((script) => (
                <div
                  key={script.id}
                  className="overflow-hidden rounded-lg border bg-white shadow-sm"
                >
                  <div className="relative">
                    <Image
                      src="/colorful-tropical-plants-with-vibrant-leaves.png"
                      alt={script.title}
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[#c08183] text-white">
                      {script.genre}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-[#22242a] mb-2">
                      {script.title}
                    </h4>
                    <p className="text-[#444955] text-sm leading-relaxed mb-3">
                      {script.synopsis}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#800000]">
                        {script.currencySymbol}
                        {script.price.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-600 border-gray-300">
                        {script.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
