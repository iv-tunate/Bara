"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Image from "next/image";

export default function AddScriptPage() {
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

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setMediaFile(file);
    }
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

        {/* Page Title */}
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
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Genre
            </label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                // conditional class: placeholder color when value is empty
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  genre === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              >
                {/* Placeholder option — do NOT use `hidden` */}
                <option value="" disabled>
                  Select genre
                </option>
                <option value="Drama">Drama</option>
                <option value="Comedy">Comedy</option>
                <option value="Thriller">Thriller</option>
                <option value="Romance">Romance</option>
                <option value="Horror">Horror</option>
              </select>

              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Ownership terms
            </label>
            <div className="relative">
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value)}
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  ownership === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              >
                <option value="" disabled>
                  Select ownership
                </option>
                <option value="Full">Full ownership</option>
                <option value="Shared">Shared ownership</option>
              </select>
              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Price Dropdown */}
          <div>
            <label className="block text-sm font-medium text-[#22242A] mb-1">
              Set price
            </label>
            <div className="relative">
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                  price === "" ? "text-[#858990]" : "text-[#22242A]"
                }`}
              >
                <option value="" disabled>
                  Select price
                </option>
                <option value="10000">₦10,000</option>
                <option value="20000">₦20,000</option>
                <option value="50000">₦50,000</option>
              </select>
              <Image
                src="/dropdown.png"
                alt="Dropdown Icon"
                width={20}
                height={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Upload Media */}
        <div className="mb-6">
          {/* Label row */}
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-[#22242A]">
              Upload media
            </label>
            <span className="flex items-center text-xs font-bold text-[#800000]">
              Use the prescribed image
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
                {/* Preview */}
                <Image
                  src={URL.createObjectURL(mediaFile)}
                  alt="Uploaded preview"
                  width={60}
                  height={100}
                  className="rounded-sm border"
                />
                <div className="w-full h-1 bg-green-600 rounded" />
              </div>
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
                or{" "}
                <span className="text-[#810306] font-semibold underline">
                  Browse
                </span>
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

        {/* Submit */}
        <button
          disabled={!isOriginal || !agreeCommission}
          className="w-full bg-[#DADBDD] text-[#858990] py-3 rounded-md text-sm font-medium disabled:cursor-not-allowed hover:bg-[#800000] hover:text-white transition-colors"
        >
          Add script
        </button>
      </main>
    </div>
  );
}
