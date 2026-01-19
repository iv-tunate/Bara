"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

const OPTIONS = [
  { label: "National identity number (NIN)", value: "NIN" },
  { label: "Bank verification number (BVN)", value: "BVN" },
  // { label: "International passport", value: "INTERNATIONAL_PASSPORT" },
  // { label: "Driver’s license", value: "DRIVERS_LICENSE" },
];

interface IdentityFormProps {
  form: {
    documentType: string;
    verificationNumber?: string;
    file: File | null;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      documentType: string;
      verificationNumber?: string;
      file: File | null;
    }>
  >;
}

export default function IdentityVerificationForm({
  form,
  setForm,
}: IdentityFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<string>("");

  const handleSelect = (optionValue: string) => {
    setVerificationType(optionValue);
    setForm((prev) => ({
      ...prev,
      documentType: optionValue,
      verificationNumber: "",
    }));
    setDropdownOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/png"
    ) {
      toast.error(
        "Only PDF, JPG, JPEG, and PNG files are accepted for verification documents",
      );
      return;
    }

    setForm((prev) => ({ ...prev, file }));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Type Dropdown */}
        <div className="relative">
          <label className="block mb-1 text-sm font-semibold text-[#22242A]">
            Proof of identity <span className="text-red-500">*</span>
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <input
              type="text"
              placeholder="Select document type"
              className="w-full border border-[#ABADB2] focus:border-[#800000] focus:outline-none p-3 pb-2 rounded-md pr-10 text-sm text-[#22242A] placeholder:text-[#9CA3AF] cursor-pointer"
              value={
                OPTIONS.find((o) => o.value === form.documentType)?.label ?? ""
              }
              readOnly
            />
            <Image
              src="/dropdown.png"
              alt="Dropdown icon"
              width={20}
              height={10}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10">
              {OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="w-4 h-4 mr-2 rounded-full border border-[#ABADB2] flex items-center justify-center">
                    {form.documentType === option.value && (
                      <div className="w-2 h-2 bg-[#800000] rounded-full" />
                    )}
                  </div>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-[#22242A]">
            Identity Verification number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="verificationNumber"
            value={form.verificationNumber ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                verificationNumber: e.target.value,
              }))
            }
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
            placeholder={
              form.documentType
                ? "Enter verification number"
                : "Select document type first"
            }
            disabled={!form.documentType}
          />
        </div>
      </div>

      {/* Upload Section */}
      <div>
        <label className="block mb-1 text-sm font-semibold text-[#22242A]">
          Upload selected proof of identity{" "}
          <span className="text-red-500">*</span>
        </label>

        {form.file ? (
          <div className="border-2 border-dashed border-[#ABADB2] rounded-md p-4 bg-[#F5F5F5]">
            <div className="flex flex-col items-center space-y-3">
              <Image
                src="/checkring.png"
                alt="Upload complete"
                width={32}
                height={32}
              />
              <span className="text-sm text-[#333740] font-medium">
                Upload complete
              </span>

              <div className="text-sm font-medium">{form.file.name}</div>

              <div className="w-full h-1 bg-green-600 rounded" />

              <button
                type="button"
                onClick={handleBrowseClick}
                className="mt-2 text-[#810306] text-sm font-semibold underline hover:text-[#a00909]"
              >
                Change file
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleBrowseClick}
            className="w-full h-40 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
          >
            <p className="text-sm text-[#333740]">
              Drag and drop your PDF document here
            </p>
            <p className="text-sm text-[#333740] mt-1">
              or{" "}
              <span className="text-[#810306] font-semibold underline">
                Browse
              </span>
            </p>
          </div>
        )}

        <input
          type="file"
          accept="application/pdf, image/jpeg, image/png"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    </div>
  );
}
