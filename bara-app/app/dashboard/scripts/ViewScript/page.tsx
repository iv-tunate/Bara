"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { api } from "@/utils/api";
import { getUserSession, getAccessToken } from "@/utils/tokenManager";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import DashboardNavbar from "@/components/DashboardNavbar";
import BackButton from "@/components/BackButton";

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

      await loadPDF();
    } catch (error) {
      console.error("Failed to fetch script:", error);
      toast.error("Failed to load script");
    } finally {
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
    <div className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold text-[#22242A] mb-2">
            {script.title}
          </h1>
          <p className="text-gray-600">{script.logline || script.synopsis}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          {(isOwner || script?.status === "Sold") && (
            <button
              onClick={handleDownload}
              className="bg-[#810306] text-white px-6 py-2.5 rounded-md hover:bg-red-800 transition-colors"
            >
              Download PDF
            </button>
          )}

          {canEdit && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-white border-2 border-[#810306] text-[#810306] px-6 py-2.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {!canEdit && script?.status === "Sold" && (
            <div className="flex items-center text-gray-500 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md">
                Script Sold - Editing Disabled
              </span>
            </div>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          {pdfUrl ? (
            <div className="flex flex-col items-center">
              <ScriptPDFViewer
                url={pdfUrl}
                pageNumber={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
              />

              {/* Page Navigation */}
              {numPages > 1 && (
                <div className="flex items-center gap-4 p-4 bg-white border-t w-full justify-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(numPages, currentPage + 1))
                    }
                    disabled={currentPage === numPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
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

        {/* Instructions for editing */}
        {canEdit && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-[#22242A] mb-2">
              How to Edit Your Script
            </h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Click "Download PDF" to get the current version</li>
              <li>
                Edit the PDF using your preferred software (Adobe Acrobat,
                Preview, etc.)
              </li>
              <li>Click "Upload New Version" and select your edited PDF</li>
              <li>The new version will replace the current one</li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              Note: You can upload new versions during negotiation period
              (status: Available or In Negotiation). Once sold, editing is
              disabled.
            </p>
          </div>
        )}
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
