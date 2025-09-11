"use client";
import { useState } from "react";
import Image from "next/image";

interface AiImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (img: string) => void;
}

export default function AiImageModal({
  isOpen,
  onClose,
  onSelect,
}: AiImageModalProps) {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false); // track if generate was clicked
  const [showImages, setShowImages] = useState(false);

  if (!isOpen) return null;

  // Temporary sample images (replace later with API results)
  const aiImages = ["/ai-sample1.png", "/ai-sample2.png"];

  const handleGenerate = () => {
    setGenerated(true);
    setShowImages(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image src="/gray star.png" alt="AI Icon" width={16} height={16} />
            <h2 className="text-sm font-medium">AI generated image</h2>
          </div>
          <button onClick={onClose} className="cursor-pointer">
            <Image src="/cancel-icon.png" alt="Close" width={16} height={16} />
          </button>
        </div>

        {/* Prompt textarea */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want..."
          className="w-full border border-gray-300 rounded-md p-3 text-sm mb-4 focus:ring-1 focus:ring-[#800000]"
          rows={3}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={onClose}
            className="px-10 py-2 text-sm rounded-md border border-[#810306] flex items-center gap-2 text-[#810306] font-semibold"
          >
            Cancel
          </button>

          {/* Generate / Regenerate button */}
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm rounded-md bg-[#800000] text-white hover:bg-[#660000] flex items-center gap-2"
          >
            {generated ? (
              <>
                Regenerate Image
                <Image
                  src="/regenerate.png"
                  alt="Regenerate"
                  width={14}
                  height={14}
                />
              </>
            ) : (
              <>Generate Image</>
            )}
          </button>
        </div>

        {/* Generated images */}
        {showImages && (
          <div className="grid grid-cols-2 gap-4">
            {aiImages.map((src, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelect(src);
                  onClose();
                }}
                className="cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition"
              >
                <Image
                  src={src}
                  alt={`AI ${idx + 1}`}
                  width={200}
                  height={120}
                  className="w-full h-28 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
