"use client";

import { useState } from "react";
import Image from "next/image";

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
}

export default function ChangePhotoModal({
  isOpen,
  onClose,
  currentAvatar,
}: ChangePhotoModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsEditing(true);
    }
  };

  const handleDiscard = () => {
    setSelectedImage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
   // console.log("Saved image:", selectedImage);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-[#22242A]">
              Change photo
            </h2>
            <p className="text-sm text-[#22242A] mt-1 max-w-sm">
              Use a clear image of yourself that captures your personality
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <Image src="/cancel-icon.png" alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center my-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border">
            <Image
              src={selectedImage || currentAvatar || "/default-avatar.png"}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-10">
          {!isEditing ? (
            <>
              {/* Upload Image (hidden input) */}
              <label className="bg-[#810306] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#6a0505] cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button className="border border-[#810306] text-[#810306] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer">
                Use Camera
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-[#810306] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#6a0505] cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={handleDiscard}
                className="border border-[#810306] text-[#810306] px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 cursor-pointer"
              >
                Discard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
