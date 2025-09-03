"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Plus, Copy, Calendar } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { api } from "@/utils/api";
import { getUserSession } from "@/utils/tokenManager";

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

export default function ProfilePage() {
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
          <img
            src="/colorful-pens-and-markers-in-a-cup.png"
            alt="Colorful pens"
            className="h-32 w-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage
                  src={profile.profilePicture || "/default-avatar.png"}
                  alt={`${profile.firstName} ${profile.lastName}`}
                />
                <AvatarFallback>
                  {profile.firstName.charAt(0)}
                  {profile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold text-[#22242a]">
                    {profile.firstName}{" "}
                    {profile.middleName && `${profile.middleName} `}
                    {profile.lastName}
                  </h2>
                  {isOwnProfile && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-[#858990]" />
                    </Button>
                  )}
                </div>
                <p className="text-[#444955] text-sm leading-relaxed mb-3 max-w-md">
                  {profile.bio || "No bio available"}
                </p>
                <div className="flex items-center gap-1 text-[#858990] text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {profile.addressDetail.city}, {profile.addressDetail.state},{" "}
                    {profile.addressDetail.country}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-[#ffedee] text-[#810306] border-[#c08183]"
            >
              ⭐ 3 scripts sold
            </Badge>
          </div>

          {/* Portfolio */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-[#22242a] mb-2">
              Portfolio
            </h3>
            <div className="flex items-center gap-2">
              <a href="#" className="text-[#000aaf] text-sm hover:underline">
                Timothy-edwards.com/works
              </a>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3 text-[#858990]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#22242a]">Experience</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4 text-[#858990]" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4 text-[#858990]" />
              </Button>
            </div>
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
                <Calendar className="h-3 w-3" />
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
                <Calendar className="h-3 w-3" />
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
              <Button
                size="sm"
                className="bg-[#800000] hover:bg-[#600000] text-white"
                onClick={() => router.push("/writer/add-script")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Script
              </Button>
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
                <Card key={script.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src="/colorful-tropical-plants-with-vibrant-leaves.png"
                      alt={script.title}
                      className="w-full h-40 object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-[#c08183] text-white text-xs">
                      {script.genre}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
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
                      <Badge variant="outline" className="text-xs">
                        {script.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
