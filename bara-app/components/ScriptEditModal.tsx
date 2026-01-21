"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { Script } from "@/models/script";

interface ScriptEditModalProps {
  script: Script;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "Available", label: "Available", color: "text-green-600" },
  { value: "InNegotiation", label: "In Negotiation", color: "text-yellow-600" },
  { value: "Sold", label: "Sold", color: "text-blue-600" },
];

const currencyOptions = [
  { label: "₦ NGN", value: "NAIRA" },
  { label: "$ USD", value: "USD" },
  { label: "€ EUR", value: "EUR" },
  { label: "£ GBP", value: "GBP" },
];

const ownershipOptions = [
  { label: "Writer retains all rights", value: "WriterRetainsRights" },
  { label: "Producer retains all rights", value: "ProducerRetainsRights" },
  { label: "Rights are shared", value: "SharedRights" },
];

const registrationBodies = [
  "Writers Guild of America (WGA)",
  "U.S. Copyright Office",
  "UK Writers' Guild",
  "European Copyright Office",
  "Nigerian Copyright Commission (NCC)",
  "South African Copyright Office",
  "Other",
];

export default function ScriptEditModal({
  script,
  onClose,
  onSuccess,
}: ScriptEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<any[]>([]);
  const [genreOpen, setGenreOpen] = useState(false);

  const [formData, setFormData] = useState({
    Title: script.title || "",
    Logline: script.logline || "",
    Synopsis: script.synopsis || "",
    Price: script.price || 0,
    Currency: script.currency || "NAIRA",
    Status: script.status || "Available",
    GenreId: script.genre?.map((g) => g.id) || [],
    OwnershipRights: script.ownershipRights || null,
    IsScriptRegistered: script.isScriptRegistered || false,
    RegistrationBody: script.registrationBody || "",
    CopyrightNumber: script.copyrightNumber || "",
    ProofUrl: script.proofUrl || "",
  });

  const [selectedGenres, setSelectedGenres] = useState<any[]>(
    script.genre || []
  );

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await api.getGenres();
        const list = res?.data?.data ?? res?.data ?? [];
        setAvailableGenres(list);
      } catch {
        toast.error("Failed to load genres");
      }
    }
    fetchGenres();
  }, []);

  const toggleSelectGenre = (g: any) => {
    setSelectedGenres((prev) => {
      const exists = prev.some((x) => x.id === g.id);
      if (exists) {
        return prev.filter((x) => x.id !== g.id);
      } else if (prev.length < 5) {
        return [...prev, g];
      } else {
        toast.error("Maximum 5 genres allowed");
        return prev;
      }
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.Title ||
      !formData.Logline ||
      !formData.Synopsis ||
      selectedGenres.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.Price <= 0) {
      toast.error("Price must be greater than limit");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...formData,
        GenreId: selectedGenres.map((g) => g.id),
      };

      // debugger;
      const response = await api.updateScript(
        script.id,
        script.writerId || "",
        updateData
      );

      console.log(response);
      if (response.success) {
        toast.success("Script updated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to update script");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update script");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-linear-gradient-to-r from-[#800000] to-[#660000] px-6 py-5 flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <h2 className="text-xl font-bold text-white">
              Edit Script Details
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Warning Banner */}
        {/* <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <svg
            className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
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
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You cannot change the script PDF or cover
            image. To upload a different script, please delete and re-upload.
          </p>
        </div> */}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.Title}
              onChange={(e) =>
                setFormData({ ...formData, Title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
              placeholder="Enter script title"
            />
          </div>

          {/* Logline + Synopsis */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logline <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Logline}
                onChange={(e) =>
                  setFormData({ ...formData, Logline: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm h-24 resize-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                placeholder="Brief one-liner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Synopsis <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Synopsis}
                onChange={(e) =>
                  setFormData({ ...formData, Synopsis: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm h-24 resize-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                placeholder="Detailed summary"
              />
            </div>
          </div>

          {/* Genre Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Genres <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setGenreOpen(!genreOpen)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-left flex items-center justify-between hover:border-[#800000] transition-colors"
            >
              <span
                className={selectedGenres.length === 0 ? "text-gray-400" : ""}
              >
                {selectedGenres.length === 0
                  ? "Select up to 5 genres"
                  : selectedGenres.map((g) => g.name).join(", ")}
              </span>
              <span className="text-gray-400 text-xs">
                {selectedGenres.length}/5
              </span>
            </button>

            {genreOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto z-50">
                {availableGenres.map((g) => {
                  const active = selectedGenres.some((s) => s.id === g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleSelectGenre(g)}
                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                        active ? "bg-red-50 text-[#800000] font-medium" : ""
                      }`}
                    >
                      <span>{g.name}</span>
                      {active && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedGenres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedGenres.map((g) => (
                  <div
                    key={g.id}
                    className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-[#800000] px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span>{g.name}</span>
                    <button
                      onClick={() => toggleSelectGenre(g)}
                      className="hover:text-red-700 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price + Currency + Status */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.Currency}
                onChange={(e) =>
                  setFormData({ ...formData, Currency: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.Price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.Status}
                onChange={(e) =>
                  setFormData({ ...formData, Status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ownership Rights */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              IP Ownership Terms
            </label>
            <select
              value={formData.OwnershipRights || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  OwnershipRights: value ? (value as any) : null,
                });
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
            >
              <option value="">Select ownership</option>
              {ownershipOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Registration */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.IsScriptRegistered}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    IsScriptRegistered: e.target.checked,
                  })
                }
                className="w-4 h-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000]"
              />
              <span className="text-sm text-gray-700">
                Is this script registered?
              </span>
            </label>

            {formData.IsScriptRegistered && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registration Body
                  </label>
                  <select
                    value={formData.RegistrationBody}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        RegistrationBody: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  >
                    <option value="">Select body</option>
                    {registrationBodies.map((body) => (
                      <option key={body} value={body}>
                        {body}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Copyright Number
                  </label>
                  <input
                    type="text"
                    value={formData.CopyrightNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        CopyrightNumber: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                    placeholder="e.g. WGA-123456"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#800000] hover:bg-[#660000] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
