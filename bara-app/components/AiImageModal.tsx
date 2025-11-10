"use client";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { generateImages } from "@/utils/replicateClient"; // adjust path

export function AiImageGeneratorModal({
  title,
  logline,
  synopsis,
  onSelectImage,
  onClose,
}: {
  title: string;
  logline: string;
  synopsis: string;
  onSelectImage: (file: File) => void;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!title && !logline && !synopsis) {
      toast.error(
        "Please provide title, logline or synopsis to generate images."
      );
      return;
    }
    setIsLoading(true);
    try {
      const prompt = `Generate 3-5 poster-style images for a film titled "${title}". The story: ${logline}. Synopsis: ${synopsis}.`;
      const urls = await generateImages(prompt, 3);
      setImages(urls);
    } catch (err) {
      console.error("AI generation error:", err);
      toast.error("Image generation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (imgUrl: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated.png", { type: blob.type });
      onSelectImage(file);
    } catch (e) {
      console.error("Select image error:", e);
      toast.error("Couldn’t select image.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4 text-[#22242A]">
          Generate AI Images
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#800000] border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-gray-500">Generating...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer group"
                onClick={() => handleSelect(img)}
              >
                <Image
                  src={img}
                  alt={`Generated ${idx}`}
                  width={300}
                  height={300}
                  className="rounded-md group-hover:opacity-80 transition-all"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium">
                  Select
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Generate AI-based concept images for your script.
            </p>
            <button
              onClick={handleGenerate}
              className="bg-[#800000] text-white px-4 py-2 rounded-md text-sm hover:bg-[#9c0000] transition-all"
            >
              Generate Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
