"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation"; // <-- import useRouter
import DashboardNavbar from "@/components/DashboardNavbar";
import Image from "next/image";
import AiImageModal from "@/components/AiImageModal";

const genreOptions = ["Drama", "Comedy", "Thriller", "Romance", "Horror"];
const ownershipOptions = ["I retain full rights", "I retain Shared rights"];
const priceOptions = ["₦200,000", "₦300,000", "₦280,000"];

export default function AddScriptPage() {
  const router = useRouter(); // <-- initialize router
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [logline, setLogline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ownership, setOwnership] = useState("");
  const [price, setPrice] = useState("");
  const [isOriginal, setIsOriginal] = useState(false);
  const [agreeCommission, setAgreeCommission] = useState(false);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [genreOpen, setGenreOpen] = useState(false);
  const [ownershipOpen, setOwnershipOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setMediaFile(file);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const isFormComplete =
    link.trim() &&
    title.trim() &&
    genre &&
    logline.trim() &&
    synopsis.trim() &&
    ownership &&
    price &&
    mediaFile &&
    isOriginal &&
    agreeCommission;

  const handleSubmit = () => {
    if (!isFormComplete) return;

    // Assuming you have the writer's ID (replace '123' with actual id)
    const writerId = "123";

    // Navigate to writer profile page
    router.push(`/writer/profile/${writerId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardNavbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/writer/dashboard"
            className="flex items-center text-sm text-[#22242A] font-bold cursor-pointer"
          >
            ← Continue exploring scripts
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#22242A] mb-6">
          Add script
        </h1>

        {/* Add link to script */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#22242A] mb-1">
            Add link to script{" "}
            <span className="text-[#858990] text-xs">
              (Please include a Google Drive link of your script)
            </span>
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000]"
          />
        </div>

        {/* Script Title & Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Script title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000]"
            />
          </div>

          {/* Genre Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Genre
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() => setGenreOpen((prev) => !prev)}
            >
              <input
                type="text"
                value={genre}
                readOnly
                placeholder="Select genre"
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  genre === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              />
              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
            {genreOpen && (
              <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10">
                {genreOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setGenre(opt);
                      setGenreOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
                  >
                    <div className="w-4 h-4 mr-2 rounded-full border border-[#ABADB2] flex items-center justify-center">
                      {genre === opt && (
                        <div className="w-2 h-2 bg-[#800000] rounded-full" />
                      )}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logline & Synopsis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Logline
            </label>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#800000]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Synopsis
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#800000]"
            />
          </div>
        </div>

        {/* Ownership & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ownership Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              IP Ownership terms
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() => setOwnershipOpen((prev) => !prev)}
            >
              <input
                type="text"
                value={ownership}
                readOnly
                placeholder="Select ownership"
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  ownership === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              />
              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
            {ownershipOpen && (
              <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10">
                {ownershipOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setOwnership(opt);
                      setOwnershipOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
                  >
                    <div className="w-4 h-4 mr-2 rounded-full border border-[#ABADB2] flex items-center justify-center">
                      {ownership === opt && (
                        <div className="w-2 h-2 bg-[#800000] rounded-full" />
                      )}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Set price
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() => setPriceOpen((prev) => !prev)}
            >
              <input
                type="text"
                value={price}
                readOnly
                placeholder="Select price"
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  price === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              />
              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
            {priceOpen && (
              <div className="absolute mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg z-10">
                {priceOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setPrice(opt);
                      setPriceOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
                  >
                    <div className="w-4 h-4 mr-2 rounded-full border border-[#ABADB2] flex items-center justify-center">
                      {price === opt && (
                        <div className="w-2 h-2 bg-[#800000] rounded-full" />
                      )}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Media */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-[#22242A]">
              Upload media
            </label>
            <span
              className="flex items-center text-xs font-bold text-[#800000] cursor-pointer"
              onClick={() => setShowAiImageModal(true)}
            >
              Use AI to generate image
              <Image
                src="/star.png"
                alt="star"
                width={10}
                height={10}
                className="ml-1"
              />
            </span>
          </div>

          {mediaFile ? (
            <div
              onClick={handleBrowseClick}
              className="w-full h-40 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
            >
              <Image
                src={URL.createObjectURL(mediaFile)}
                alt="Uploaded preview"
                width={120}
                height={80}
                className="rounded-sm border"
              />
            </div>
          ) : (
            <div
              onClick={handleBrowseClick}
              className="w-full h-40 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="text-sm text-[#333740]">
                Drag and drop file (png, jpeg) here
              </p>
              <p className="text-sm text-[#333740] mt-1">
                or <span className="text-[#810306] font-semibold">Browse</span>
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>

        {/* Agreements */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-sm text-[#22242A] cursor-pointer">
            <input
              type="checkbox"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree this script is my original work
          </label>
          <label className="flex items-center gap-2 text-sm text-[#22242A] cursor-pointer">
            <input
              type="checkbox"
              checked={agreeCommission}
              onChange={(e) => setAgreeCommission(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree to Bara’s 15% commission on successful sales
          </label>
        </div>

        {/* Submit + Success */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleSubmit}
            disabled={!isFormComplete}
            className={`w-full py-3 rounded-md text-sm font-medium ${
              !isFormComplete
                ? "bg-[#DADBDD] text-[#858990] cursor-not-allowed"
                : "bg-[#800000] text-white hover:bg-[#660000]"
            }`}
          >
            Add script
          </button>

          {showSuccess && (
            <div className="mt-8 flex items-center gap-2 border border-[#0DA500] text-[#0DA500] rounded px-3 py-1 text-sm font-medium">
              <Image
                src="/checkring.png"
                alt="success"
                width={16}
                height={16}
              />
              script uploaded successfully!
            </div>
          )}
        </div>

        {/* AI Image Modal */}
        {showAiImageModal && (
          <AiImageModal
            isOpen={showAiImageModal}
            onClose={() => setShowAiImageModal(false)}
            onSelect={(selectedImg: string) => {
              fetch(selectedImg)
                .then((res) => res.blob())
                .then((blob) => {
                  const file = new File([blob], "ai-generated.png", {
                    type: blob.type,
                  });
                  setMediaFile(file);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                });
            }}
          />
        )}
      </main>
    </div>
  );
}
