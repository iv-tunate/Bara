"use client";
import { useState } from "react";

interface AiImageGeneratorModalProps {
  title: string;
  logline: string;
  synopsis: string;
  onGenerate: (file: File, previewUrl: string) => void;
  onClose: () => void;
}

export default function AiImageGeneratorModal({
  title,
  logline,
  synopsis,
  onGenerate,
  onClose,
}: AiImageGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ url: string }>
  >([]);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Ideogram API Configuration - Replace with your actual API key
  const IDEOGRAM_API_URL = "https://api.ideogram.ai/generate";
  const IDEOGRAM_API_KEY = "YOUR_IDEOGRAM_API_KEY"; // TODO: Replace with your actual API key

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedImages([]);
    setSelectedImageIndex(null);

    try {
      // Create prompt from script details
      const prompt = `Movie poster style cover image for a ${
        title ? `film titled "${title}"` : "screenplay"
      }. ${logline || synopsis || "Cinematic and professional."}`;

      const response = await fetch(IDEOGRAM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": IDEOGRAM_API_KEY,
        },
        body: JSON.stringify({
          image_request: {
            prompt: prompt,
            aspect_ratio: "ASPECT_16_9", // Landscape format for cover images
            model: "V_2", // Use Ideogram V2 model
            magic_prompt_option: "AUTO", // Let Ideogram enhance the prompt
            num_images: 4, // Generate 4 options for user to choose from
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate images");
      }

      const data = await response.json();

      // Ideogram returns images in data array with url property
      if (data.data && data.data.length > 0) {
        setGeneratedImages(data.data);
      } else {
        throw new Error("No images generated");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = async () => {
    if (selectedImageIndex === null) return;

    const selectedImage = generatedImages[selectedImageIndex];

    try {
      // Fetch the image as blob
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], `ai-generated-cover-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Pass the file and URL to parent component
      onGenerate(file, selectedImage.url);
    } catch (err) {
      console.error("Error selecting image:", err);
      setError("Failed to select image. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#22242A]">
            Generate AI Cover Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Cost Notice */}
          <div className="bg-[#FFF5F5] border border-[#800000] rounded-lg p-4 mb-4">
            <p className="text-sm text-[#22242A] mb-2">
              <span className="font-semibold">Cost:</span> $0.50 per generation
              (4 images)
            </p>
            <p className="text-xs text-gray-600">
              We'll use AI to generate unique cover images based on your
              script's title, logline, and synopsis.
            </p>
          </div>

          {/* Script Details Preview */}
          <div className="space-y-2 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
            <p>
              <span className="font-medium">Title:</span>{" "}
              {title || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Logline:</span>{" "}
              {logline || "Not provided"}
            </p>
            {synopsis && (
              <p>
                <span className="font-medium">Synopsis:</span>{" "}
                {synopsis.substring(0, 150)}
                {synopsis.length > 150 ? "..." : ""}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-[#22242A]">
                Select an image:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative ${
                      selectedImageIndex === index
                        ? "border-[#800000] shadow-lg"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Generated option ${index + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute top-2 right-2 bg-[#800000] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mb-4"></div>
              <p className="text-sm text-gray-600">
                Generating your cover images...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This may take 10-30 seconds
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            {generatedImages.length === 0 ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !title || !logline}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  isGenerating || !title || !logline
                    ? "bg-[#DADBDD] text-[#858990] cursor-not-allowed"
                    : "bg-[#800000] text-white hover:bg-[#660000]"
                }`}
              >
                {isGenerating ? "Generating..." : "Generate Images ($0.50)"}
              </button>
            ) : (
              <button
                onClick={handleSelectImage}
                disabled={selectedImageIndex === null}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  selectedImageIndex === null
                    ? "bg-[#DADBDD] text-[#858990] cursor-not-allowed"
                    : "bg-[#800000] text-white hover:bg-[#660000]"
                }`}
              >
                Use Selected Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
