import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

export type ProcessingStatus =
  | "loading"
  | "success"
  | "error"
  | "conflict"
  | "failed";

interface ProcessingModalProps {
  isOpen: boolean;
  status: ProcessingStatus;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onClose?: () => void;
}

export function ProcessingModal({
  isOpen,
  status,
  loadingMessage = "Processing",
  successMessage = "Success!",
  errorMessage = "Something went wrong",
  onClose,
}: ProcessingModalProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (status === "loading") {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#810306] bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 flex flex-col items-center space-y-6">
        {/* Loading State */}
        {status === "loading" && (
          <>
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#810306] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-[#22242A] text-lg font-medium">
              {loadingMessage}
              <span className="inline-block w-8 text-left">{dots}</span>
            </p>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
            </div>
            <p className="text-[#22242A] text-lg font-medium text-center">
              {successMessage}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#810306] text-white rounded-md font-semibold hover:bg-[#6b0205] transition-colors"
              >
                Continue
              </button>
            )}
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-12 h-12 text-red-600" strokeWidth={3} />
            </div>
            <p className="text-[#22242A] text-lg font-medium text-center">
              {errorMessage}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-[#810306] text-[#810306] rounded-md font-semibold hover:bg-[#810306] hover:text-white transition-colors"
              >
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
