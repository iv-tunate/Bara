"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import ScriptEditModal from "@/components/ScriptEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { getUserSession, getUserId } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import { Script, ownershipLabels } from "@/models/script";
import { usePageGuard } from "@/app/hooks/usepageguard";
import toast from "react-hot-toast";
import Image from "next/image";

export default function MyScriptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scriptIdParam = params?.scriptId as string;

  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  usePageGuard();

  useEffect(() => {
    async function loadScript() {
      if (!scriptIdParam) {
        setIsLoading(false);
        return;
      }

      try {
        const session = getUserSession();
        const userId = getUserId();

        const scriptResponse = await api.getScriptById(scriptIdParam);

        if (scriptResponse.success && scriptResponse.data) {
          const sData = scriptResponse.data.data || scriptResponse.data;

          // Verify ownership
          if (sData.writerId !== userId) {
            router.push(`/dashboard/scripts/${scriptIdParam}`);
            return;
          }

          const mappedScript: Script = {
            id: sData.id,
            title: sData.title,
            price: sData.price,
            imageUrl: sData.imageUrl || "/flowery.png",
            logline: sData.logline,
            synopsis: sData.synopsis,
            genre: sData.genre,
            writerId: sData.writerId,
            writerName: sData.writerName,
            status: sData.status,
            currency: sData.currency || "NAIRA",
            currencySymbol: sData.currencySymbol || "₦",
            ownershipRights: sData.ownershipRights,
            proofUrl: sData.proofUrl,
            copyrightNumber: sData.copyrightNumber,
            isScriptRegistered: sData.isScriptRegistered,
            registrationBody: sData.registrationBody,
            url: sData.url,
            path: sData.path || "",
            uploadedOn: sData.uploadedOn,
          };

          setScript(mappedScript);
        } else {
          setError("Script not found");
        }
      } catch (error) {
        console.error("Error loading script:", error);
        setError("Failed to load script");
      } finally {
        setIsLoading(false);
      }
    }
    loadScript();
  }, [scriptIdParam]);

  const handleViewContent = () => {
    if (!script) return;

    try {
      // Open the download endpoint directly in a new tab
      window.open(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/script/download/${script.id}`,
        "_blank"
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to access script content");
    }
  };

  const handleDeleteSuccess = () => {
    toast.success("Script deleted successfully");
    router.push("/writer/profile");
  };

  const handleEditSuccess = () => {
    // Reload script data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#800000]"></div>
          <p className="text-gray-600 mt-4">Loading script...</p>
        </div>
      </main>
    );
  }

  if (error || !script) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <p className="text-gray-700 text-lg">{error || "Script not found"}</p>
          <button
            onClick={() => router.push("/writer/profile")}
            className="text-[#800000] hover:underline font-medium"
          >
            Go to Profile
          </button>
        </div>
      </main>
    );
  }

  const statusColors = {
    Available: "bg-green-100 text-green-700 border-green-300",
    InNegotiation: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Sold: "bg-blue-100 text-blue-700 border-blue-300",
    Deleted: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <DashboardNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#800000] transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {script.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      statusColors[script.status as keyof typeof statusColors]
                    }`}
                  >
                    {script.status}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Uploaded {new Date(script.uploadedOn).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#800000]">
                  {script.currencySymbol}
                  {script.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {script.currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex gap-3 shadow-sm">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Note:</strong> Editing the script
            PDF itself is not allowed. If you need to upload a different
            version, please delete this script and re-upload through the add
            script page.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Cover Image & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={script.imageUrl || "/flowery.png"}
                alt={script.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewContent}
                className="w-full bg-gradient-to-r from-[#800000] to-[#660000] hover:from-[#660000] hover:to-[#4d0000] text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Content
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Details
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Script
              </button>
            </div>
          </div>

          {/* Right Column - Script Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#800000]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Logline
              </h2>
              <p className="text-gray-700 leading-relaxed">{script.logline}</p>
            </div>

            {/* Synopsis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#800000]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Synopsis
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {script.synopsis}
              </p>
            </div>

            {/* Genres */}
            {script.genre && script.genre.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#800000]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {script.genre.map((g) => (
                    <span
                      key={g.id}
                      className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 text-[#800000] rounded-full text-sm font-medium border border-red-200"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#800000]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Additional Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {script.ownershipRights && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xs text-gray-600 mb-1">
                      IP Ownership
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {ownershipLabels[script.ownershipRights]}
                    </div>
                  </div>
                )}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Registered</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {script.isScriptRegistered ? "Yes" : "No"}
                  </div>
                </div>
                {script.isScriptRegistered && script.registrationBody && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">
                      Registration Body
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {script.registrationBody}
                    </div>
                  </div>
                )}
                {script.copyrightNumber && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">
                      Copyright Number
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {script.copyrightNumber}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <ScriptEditModal
          script={script}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          scriptId={script.id}
          writerId={script.writerId || ""}
          scriptTitle={script.title}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </main>
  );
}
