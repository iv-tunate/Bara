"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { api } from "@/utils/api";
import { getUserSession, getAccessToken } from "@/utils/tokenManager";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import DashboardNavbar from "@/components/DashboardNavbar";
import BackButton from "@/components/BackButton";
import { Eye, Lock, Download } from "lucide-react";

const ScriptPDFViewer = dynamic(() => import("@/components/ScriptPDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <p className="text-gray-500">Loading PDF Viewer...</p>
    </div>
  ),
});

function ViewScriptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scriptId = searchParams.get("scriptId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setUserData(session);

    if (!scriptId) {
      toast.error("Script ID is required");
      router.push("/dashboard");
      return;
    }

    fetchScript();
  }, [scriptId]);

  const fetchScript = async () => {
    if (!scriptId) return;
    setLoading(true);
    try {
      const response = await api.getScriptById(scriptId);
      if (!response.data?.isSuccess) {
        toast.error(response.data?.message || "Failed to load script");
        router.push("/dashboard");
        return;
      }
      setScript(response.data.data);
      setLoading(false);

      loadPDF();
    } catch (error) {
      console.error("Failed to fetch script:", error);
      toast.error("Failed to load script");
      setLoading(false);
    }
  };

  const loadPDF = async () => {
    if (!scriptId) return;
    try {
      debugger;
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = getAccessToken();
      const response = await fetch(
        `${BASE_URL}/api/script/download/${scriptId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to load PDF:", error);
      toast.error("Failed to load PDF preview");
    }
  };

  const handleDownload = async () => {
    if (!scriptId || !script) return;
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = getAccessToken();
      const response = await fetch(
        `${BASE_URL}/api/script/download/${scriptId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${script.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded successfully");
    } catch (error) {
      toast.error("Failed to download script");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!scriptId || !userData) return;

    setUploading(true);
    const toastId = toast.loading("Uploading new version...");

    try {
      const response = await api.updateScriptContent(
        scriptId,
        userData.userId,
        file
      );

      if (!response.data?.isSuccess) {
        toast.error(response.data?.message || "Failed to upload", {
          id: toastId,
        });
        return;
      }

      toast.success("Script updated successfully!", { id: toastId });
      await loadPDF();
      await fetchScript();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload new version", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const isOwner = userData && script && script.writerId === userData.userId;
  const canEdit = isOwner && script?.status !== "Sold";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#810306]"></div>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Script not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-3xl font-bold text-[#22242A] mb-3">
            {script.title}
          </h1>

          {/* Synopsis Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#22242A] mb-4">Synopsis</h2>
            <p className="text-gray-700 text-base sm:text-md leading-relaxed">
              {script.synopsis}
            </p>
          </div>
        </div>

        {/* PDF Viewer Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12 p-6">
          <h2 className="text-xl font-bold text-[#22242A] mb-4 pl-8">Content</h2>
          {pdfUrl ? (
            <div className="flex flex-col items-center">
              <ScriptPDFViewer
                url={pdfUrl}
                pageNumber={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
              />

              {/* Page Navigation */}
              {numPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 bg-gray-50 border-t w-full">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#810306] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-800 transition-colors text-sm font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 font-medium">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(numPages, currentPage + 1))
                    }
                    disabled={currentPage === numPages}
                    className="px-4 py-2 bg-[#810306] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-800 transition-colors text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          )}
        </div>

        {/* Action Buttons and Messages Section */}
        <div className="space-y-4">
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {(isOwner || script?.status === "Sold") && (
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-[#810306] text-white px-6 py-3 rounded-md hover:bg-red-800 transition-colors font-medium text-sm sm:text-base"
              >
                <Download size={18} />
                Download PDF
              </button>
            )}

            {canEdit && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#810306] text-[#810306] px-6 py-3 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {uploading ? "Uploading..." : "Upload New Version"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Informational Messages */}
          {!isOwner && script?.status !== "Sold" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5 flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Eye className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-1">
                  Preview Mode
                </h3>
                <p className="text-blue-700 text-sm">
                  You can view this script until the transaction is complete.
                  Once the purchase is finalized, you'll be able to download it.
                </p>
              </div>
            </div>
          )}

          {!canEdit && script?.status === "Sold" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-5 flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Lock className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 text-sm sm:text-base mb-1">
                  Script Sold
                </h3>
                <p className="text-green-700 text-sm">
                  This script has been sold. Editing is now disabled.
                </p>
              </div>
            </div>
          )}

          {/* Edit Instructions */}
          {canEdit && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-5 sm:p-6">
              <h3 className="font-semibold text-[#22242A] mb-3 text-sm sm:text-base">
                How to Edit Your Script
              </h3>
              <ol className="space-y-2 text-sm sm:text-base text-gray-700">
                <li className="flex gap-3">
                  <span className="font-semibold text-[#810306] shrink-0">
                    1.
                  </span>
                  <span>Click "Download PDF" to get the current version</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-[#810306] shrink-0">
                    2.
                  </span>
                  <span>
                    Edit the PDF using your preferred software (Adobe Acrobat,
                    Preview, etc.)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-[#810306] shrink-0">
                    3.
                  </span>
                  <span>
                    Click "Upload New Version" and select your edited PDF
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-[#810306] shrink-0">
                    4.
                  </span>
                  <span>The new version will replace the current one</span>
                </li>
              </ol>
              <p className="text-xs sm:text-sm text-gray-600 mt-4 pt-4 border-t border-slate-200">
                You can upload new versions during the negotiation period
                (Available or In Negotiation status). Once sold, editing is
                disabled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ViewScript() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <DashboardNavbar />
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#810306]"></div>
          </div>
        </div>
      }
    >
      <ViewScriptContent />
    </Suspense>
  );
}
