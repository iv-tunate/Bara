"use client";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import type { Genre as GenreModel } from "@/models/script";
import AiImageGeneratorModal from "@/components/AiImageModal";
import ImageCatalogModal from "@/components/ImageCatalogModal";

const IPDealOptions = [
  { label: "Writer retains all rights", value: "WriterRetainsRights" },
  { label: "Producer retains all rights", value: "ProducerRetainsRights" },
  { label: "Rights are shared", value: "SharedRights" },
];

const currencyOptions = [
  { label: "₦ NGN", value: "NAIRA" },
  { label: "$ USD", value: "USD" },
  { label: "€ EUR", value: "EUR" },
  { label: "£ GBP", value: "GBP" },
];

const registrationBodies = [
  "Writers Guild of America (WGA)",
  "U.S. Copyright Office",
  "UK Writers’ Guild",
  "European Copyright Office",
  "Nigerian Copyright Commission (NCC)",
  "South African Copyright Office",
  "Canadian Intellectual Property Office",
  "Australian Copyright Agency",
  "Other",
];

export default function AddScriptPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);

  const [logline, setLogline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ownership, setOwnership] = useState("");
  const [currency, setCurrency] = useState("NAIRA");
  const [price, setPrice] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationBody, setRegistrationBody] = useState("");

  const [isOriginal, setIsOriginal] = useState(false);
  const [agreeCommission, setAgreeCommission] = useState(false);

  const [scriptFile, setScriptFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showAiImageModal, setShowAiImageModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
const [dragActive, setDragActive] = useState(false);
  const scriptInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setRole(session.userType || null);
      setUserId(session.userId || null);
    }

    (async () => {
      try {
        const res = await api.getGenres();
        const genreList = res?.data?.data ?? res?.data ?? [];
        console.log(genreList);
        setAvailableGenres(genreList);
      } catch (e) {
        console.error("Failed to load genres", e);
      }
    })();
  }, []);

  const handleBrowseScript = () => scriptInputRef.current?.click();
  const handleBrowseImage = () => imageInputRef.current?.click();

  const handleScriptDrop = (file: File | null) => {
    if (!file) return;
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(`.${ext}`)) {
      toast.error("Invalid script format. Allowed: .pdf, .doc, .docx");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Script exceeds 10MB limit");
      return;
    }
    setScriptFile(file);
  };

  const handleCatalogOpen = () => setShowCatalogModal(true);

  const handleScriptChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(`.${ext}`)) {
      alert("Invalid script format. Allowed: .pdf, .doc, .docx");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Script exceeds 10MB limit");
      return;
    }
    setScriptFile(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      alert("Invalid image format. Only PNG/JPEG/JPG/WEBP allowed");
      return;
    }
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleCatalogSelect = (imageSrc, imageName) => {
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], imageName || "catalog-image.jpg", {
          type: "image/jpeg",
        });
        setMediaFile(file);
        setMediaPreviewUrl(imageSrc);
        setShowCatalogModal(false);
      })
      .catch((err) => {
        console.error("Error loading catalog image:", err);
        alert("Failed to load image from catalog");
      });
  };

  const handleAiGenerate = (file, previewUrl) => {
    setMediaFile(file);
    setMediaPreviewUrl(previewUrl);
    setShowAiImageModal(false);
  };

  const handleRemoveImage = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
  };

  const removeGenre = (id) =>
    setSelectedGenres((prev) => prev.filter((g) => g.id !== id));

  const toggleSelectGenre = (g) => {
    if (
      selectedGenres.length >= 5 &&
      !selectedGenres.some((sg) => sg.id === g.id)
    ) {
      alert("You can select up to 5 genres");
      return;
    }
    setSelectedGenres((prev) =>
      prev.some((p) => p.id === g.id)
        ? prev.filter((p) => p.id !== g.id)
        : [...prev, g]
    );
  };

  const isFormComplete =
    title.trim() &&
    selectedGenres.length > 0 &&
    logline.trim() &&
    synopsis.trim() &&
    ownership &&
    price &&
    scriptFile &&
    mediaFile &&
    isOriginal &&
    agreeCommission;

  const handleSubmit = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all required fields");
      return;
    }
    if (!userId) {
      toast.error("Unable to identify writer. Please relogin.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append(
        "GenreId",
        JSON.stringify(selectedGenres.map((g) => g.id))
      );
      formData.append("Logline", logline.trim());
      formData.append("Synopsis", synopsis.trim());
      formData.append("Price", price);
      formData.append("Currency", currency);
      formData.append("IsScriptRegistered", isRegistered.toString());
      if (isRegistered && registrationBody)
        formData.append("RegistrationBody", registrationBody);
      if (ownership) formData.append("OwnershipRights", ownership);
      if (mediaFile) formData.append("Image", mediaFile);
      formData.append("File", scriptFile as File);

      const res = await api.addScript(formData, userId);

      if (res?.success && res?.data) {
        toast.success("Script added successfully");
        router.push(`/writer/profile/${userId}`);
      } else {
        const msg = res?.message || "Failed to upload script";
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred while uploading");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardNavbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#22242A] mb-6 text-center">
          Add Script
        </h1>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Logline & Synopsis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logline</label>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Synopsis</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none"
            />
          </div>
        </div>

        {/* Genre & Ownership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Genre multi-select */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Genre</label>
            <div
              className="cursor-pointer relative"
              onClick={() => setGenreOpen((p) => !p)}
            >
              <input
                type="text"
                readOnly
                value={selectedGenres.map((g) => g.name).join(", ")}
                placeholder="Select up to 5 genres"
                className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm bg-white cursor-pointer"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#858990]">
                {selectedGenres.length}/5
              </div>

              {/* Dropdown */}
              {genreOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg max-h-48 overflow-auto z-[9999]">
                  {availableGenres.map((g) => {
                    const isSelected = selectedGenres.some(
                      (sg) => sg.id === g.id
                    );
                    return (
                      <div
                        key={g.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectGenre(g);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${
                          isSelected ? "bg-[#F5F5F5] font-medium" : ""
                        }`}
                      >
                        {g.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected genres display */}
            {selectedGenres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGenres.map((g) => (
                  <div
                    key={g.id}
                    className="inline-flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1 rounded text-sm"
                  >
                    <span>{g.name}</span>
                    <button
                      type="button"
                      onClick={() => removeGenre(g.id)}
                      className="text-[#800000] hover:text-black font-bold text-base leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              IP Ownership terms
            </label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select ownership</option>
              {IPDealOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Registration Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-[#ABADB2] rounded-md px-2 py-2 text-sm"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {isRegistered && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration body
              </label>
              <select
                value={registrationBody}
                onChange={(e) => setRegistrationBody(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select registration body</option>
                {registrationBodies.map((body) => (
                  <option key={body} value={body}>
                    {body}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Registration Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isRegistered}
              onChange={(e) => setIsRegistered(e.target.checked)}
              className="accent-[#800000]"
            />
            Is this a registered script?
          </label>
        </div>

        {/* === Upload Cover Image Section (drag/drop + AI + gallery) === */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Upload Cover Image *
            </label>
            <span
              onClick={() => setShowAiImageModal(true)}
              className="flex items-center text-xs font-bold text-[#800000] cursor-pointer hover:underline"
            >
              Generate with AI
              <Image
                src="/star.png"
                alt="star"
                width={10}
                height={10}
                className="ml-1"
              />
            </span>
          </div>
          <p className="text-xs italic text-gray-500 my-2">
            A script cover image helps producers visualize the tone and feel of
            your story before reading. It’s your script’s first impression.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0] ?? null;
              if (file) handleImageChange({ target: { files: [file] } });
            }}
            className={`relative ${
              dragActive ? "ring-2 ring-[#810306]/30" : ""
            }`}
          >
            {mediaPreviewUrl ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-[#800000] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={handleBrowseImage}
                className="w-full h-48 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
              >
                <p className="text-sm text-[#333740]">
                  Drag and drop image (PNG, JPG) here
                </p>
                <p className="text-sm text-[#333740] mt-1">
                  or{" "}
                  <button
                    type="button"
                    onClick={handleBrowseImage}
                    className="text-[#810306] font-semibold hover:underline inline"
                  >
                    Browse
                  </button>{" "}
                  <span>or</span>{" "}
                  <button
                    type="button"
                    onClick={handleCatalogOpen}
                    className="text-[#810306] font-semibold hover:underline inline"
                  >
                    Choose from our gallery
                  </button>
                </p>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Upload Script Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-[#22242A]">
            Upload script *
          </label>

          {scriptFile ? (
            <div className="space-y-3">
              <div
                onClick={handleBrowseScript}
                className="w-full h-32 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
              >
                <p className="text-sm text-[#333740] font-medium">
                  {scriptFile.name}
                </p>
                <p className="text-xs text-[#666] mt-1">
                  {(scriptFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-[#800000] font-semibold mt-2">
                  Click to change file
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={handleBrowseScript}
              className="w-full h-32 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="text-sm text-[#333740]">
                Drag and drop file (PDF, DOC, DOCX) here
              </p>
              <p className="text-sm text-[#333740] mt-1">
                or <span className="text-[#810306] font-semibold">Browse</span>
              </p>
            </div>
          )}

          <input
            ref={scriptInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleScriptChange}
            className="hidden"
          />
        </div>

        {/* Agreements */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree this script is my original work
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agreeCommission}
              onChange={(e) => setAgreeCommission(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree to Bara's 15% commission on successful sales
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={!isFormComplete}
            className={`w-full sm:w-80 md:w-96 py-3 rounded-md text-sm font-medium ${
              !isFormComplete
                ? "bg-[#DADBDD] text-[#858990] cursor-not-allowed"
                : "bg-[#800000] text-white hover:bg-[#660000]"
            }`}
          >
            Add script
          </button>
        </div>

        {/* Modals */}
        {showCatalogModal && (
          <ImageCatalogModal
            onSelect={handleCatalogSelect}
            onClose={() => setShowCatalogModal(false)}
          />
        )}
        {showAiImageModal && (
          <AiImageGeneratorModal
            title={title}
            logline={logline}
            synopsis={synopsis}
            onGenerate={handleAiGenerate}
            onClose={() => setShowAiImageModal(false)}
          />
        )}
      </main>
    </div>
  );
}

