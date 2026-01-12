import React from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  footerMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  footerMessage,
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#22242A]">{title}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-base leading-relaxed">{message}</p>
          </div>

          {/* Footer Message (Optional) */}
          {footerMessage && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">{footerMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-md border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#810306] hover:bg-red-800"
              }`}
            >
              {isLoading ? "Loading..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
